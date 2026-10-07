import { NextResponse } from 'next/server';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { getChatsFromDb, getMessagesFromDb, saveMessageToDb, deleteChatFromDb, deleteMessageFromDb, markChatReadInDb } from '@/lib/whatsappDb';

export const dynamic = 'force-dynamic';

const WA_SERVICE_URL = process.env.WA_SERVICE_URL || 'http://127.0.0.1:5001';

async function checkServiceStatus() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${WA_SERVICE_URL}/api/status`, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      return { serviceOnline: true, ...data };
    }
    return { serviceOnline: false, status: 'SERVICE_STOPPED', message: 'Respon service tidak normal.' };
  } catch {
    return { serviceOnline: false, status: 'SERVICE_STOPPED', message: 'WhatsApp Gateway service belum aktif.' };
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const endpoint = searchParams.get('endpoint');

    if (endpoint === 'media') {
      const msgId = searchParams.get('messageId') || searchParams.get('msgId');
      if (!msgId) {
        return NextResponse.json({ error: 'messageId is required' }, { status: 400 });
      }

      try {
        const mediaRes = await fetch(`${WA_SERVICE_URL}/api/media?msgId=${encodeURIComponent(msgId)}`, {
          cache: 'no-store',
        });

        if (!mediaRes.ok) {
          const errData = await mediaRes.json().catch(() => ({}));
          return NextResponse.json(
            { error: errData.error || 'Media tidak ditemukan di WhatsApp' },
            { status: mediaRes.status }
          );
        }

        const contentType = mediaRes.headers.get('content-type') || 'application/octet-stream';
        const contentDisposition = mediaRes.headers.get('content-disposition') || 'inline';
        const arrayBuf = await mediaRes.arrayBuffer();

        return new NextResponse(Buffer.from(arrayBuf), {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': contentDisposition,
            'Cache-Control': 'public, max-age=86400, immutable',
          },
        });
      } catch (err: any) {
        return NextResponse.json(
          { error: 'Gagal mengunduh media dari WhatsApp: ' + (err?.message || err) },
          { status: 502 }
        );
      }
    }

    if (endpoint === 'avatar') {
      const chatId = searchParams.get('chatId');
      if (!chatId || chatId === '0@c.us' || chatId.startsWith('0@') || chatId === 'admin') {
        return NextResponse.json({ error: 'Avatar tidak tersedia' }, { status: 404 });
      }

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);
        const avatarRes = await fetch(`${WA_SERVICE_URL}/api/avatar?chatId=${encodeURIComponent(chatId)}`, {
          redirect: 'follow',
          cache: 'no-store',
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!avatarRes.ok) {
          return NextResponse.json({ error: 'Avatar tidak ditemukan' }, { status: 404 });
        }

        const contentType = avatarRes.headers.get('content-type') || 'image/jpeg';
        const arrayBuf = await avatarRes.arrayBuffer();

        return new NextResponse(Buffer.from(arrayBuf), {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400, immutable',
          },
        });
      } catch (err: any) {
        return NextResponse.json({ error: 'Gagal mengambil avatar: ' + (err?.message || err) }, { status: 502 });
      }
    }

    if (endpoint === 'chats') {
      let gwChats: any[] = [];
      try {
        const res = await fetch(`${WA_SERVICE_URL}/api/chats`, {
          cache: 'no-store',
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.chats)) {
          gwChats = data.chats
            .map((c: any) => {
              if (c.id === '150336740303055@lid') {
                return { ...c, id: '6282211331456@c.us', name: c.name || 'Cecep Fahmidin (+6282211331456)' };
              }
              return c;
            })
            .filter(
              (c: any) => c.id && !c.id.endsWith('@lid') && !c.id.includes('@broadcast')
            );
        }
      } catch {}

      let dbDiag = null;
      let dbChats: any[] = [];
      try {
        dbChats = await getChatsFromDb();
      } catch (e: any) {
        dbDiag = e.message;
      }

      // Merge GW chats and DB chats uniquely
      const chatMap = new Map();
      gwChats.forEach((c) =>
        chatMap.set(c.id, {
          ...c,
          avatarUrl: c.avatarUrl || `/api/whatsapp?endpoint=avatar&chatId=${encodeURIComponent(c.id)}`,
        })
      );
      dbChats.forEach((dbc) => {
        if (!chatMap.has(dbc.id) && !dbc.id.includes('@broadcast') && !dbc.id.endsWith('@lid')) {
          chatMap.set(dbc.id, {
            id: dbc.id,
            name: dbc.name,
            phone: dbc.phone,
            isGroup: dbc.isGroup,
            unreadCount: dbc.unreadCount,
            timestamp: dbc.timestamp,
            lastMessage: dbc.lastMessage,
            avatarUrl: `/api/whatsapp?endpoint=avatar&chatId=${encodeURIComponent(dbc.id)}`,
          });
        }
      });

      const merged = Array.from(chatMap.values()).sort((a, b) => (Number(b.timestamp) || 0) - (Number(a.timestamp) || 0));
      return NextResponse.json({ success: true, chats: merged });
    }

    if (endpoint === 'messages') {
      const chatId = searchParams.get('chatId') || '';
      const limit = parseInt(searchParams.get('limit') || '60', 10);
      let gwMessages: any[] = [];

      // Auto mark read in database when messages are requested
      if (chatId) {
        markChatReadInDb(chatId).catch(() => {});
      }

      try {
        const res = await fetch(`${WA_SERVICE_URL}/api/messages?chatId=${encodeURIComponent(chatId)}&limit=${limit}`, {
          cache: 'no-store',
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.messages)) {
          gwMessages = data.messages;
          // Async background sync of newly fetched messages into database
          Promise.all(
            gwMessages.map((m) =>
              saveMessageToDb({
                id: m.id,
                chatId,
                body: m.body,
                from: m.from,
                to: m.to,
                fromMe: m.fromMe,
                timestamp: m.timestamp,
                type: m.type,
                hasMedia: m.hasMedia,
                mediaUrl: m.mediaUrl,
                mediaKey: m.mediaKey,
                mediaName: m.mediaName,
                mediaMime: m.mediaMime,
                mediaSize: m.mediaSize,
                ack: m.ack,
              })
            )
          ).catch(() => {});
        }
      } catch {}

      const dbMessages = await getMessagesFromDb(chatId, limit);

      // Merge and deduplicate
      const msgMap = new Map();
      gwMessages.forEach((m) => msgMap.set(m.id, { ...m }));
      dbMessages.forEach((dbm) => {
        if (!msgMap.has(dbm.id)) {
          msgMap.set(dbm.id, {
            id: dbm.id,
            chatId: dbm.chatId,
            body: dbm.body,
            from: dbm.from,
            to: dbm.to,
            fromMe: dbm.fromMe,
            timestamp: dbm.timestamp,
            type: dbm.type,
            hasMedia: dbm.hasMedia,
            mediaUrl: dbm.mediaUrl,
            mediaKey: dbm.mediaKey,
            mediaName: dbm.mediaName,
            mediaMime: dbm.mediaMime,
            mediaSize: dbm.mediaSize,
            ack: dbm.ack,
          });
        } else {
          // If gw message lacks mediaUrl but dbm has it, copy over
          const existing = msgMap.get(dbm.id);
          if (!existing.mediaUrl && dbm.mediaUrl) {
            existing.mediaUrl = dbm.mediaUrl;
            existing.mediaKey = dbm.mediaKey || existing.mediaKey;
            existing.mediaName = dbm.mediaName || existing.mediaName;
            existing.mediaMime = dbm.mediaMime || existing.mediaMime;
            existing.mediaSize = dbm.mediaSize || existing.mediaSize;
          }
        }
      });

      const finalMessages = Array.from(msgMap.values()).sort((a, b) => (Number(a.timestamp) || 0) - (Number(b.timestamp) || 0));
      return NextResponse.json({ success: true, chatId, messages: finalMessages });
    }

    const status = await checkServiceStatus();
    return NextResponse.json(status);
  } catch {
    return NextResponse.json({ success: false, error: 'Gagal terhubung ke WhatsApp Gateway.' }, { status: 503 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      action = 'send',
      to,
      chatId,
      message,
      mediaUrl,
      mediaBase64,
      mediaMime,
      mediaName,
      mediaKey,
      mediaSize,
      caption,
      type,
      phone,
      name,
    } = body;

    if (action === 'start_service') {
      const current = await checkServiceStatus();
      if (current.serviceOnline) {
        return NextResponse.json({ success: true, message: 'Service WhatsApp sudah aktif.', status: current.status });
      }

      const scriptPath = path.resolve(process.cwd(), 'server', 'whatsapp-service.mjs');
      const child = spawn(process.execPath, [scriptPath], {
        detached: true,
        stdio: 'ignore',
        cwd: process.cwd(),
      });
      child.unref();

      await new Promise((resolve) => setTimeout(resolve, 1500));
      const verify = await checkServiceStatus();

      return NextResponse.json({
        success: true,
        message: verify.serviceOnline
          ? 'Service WhatsApp Gateway berhasil dijalankan!'
          : 'Service sedang memulai di background...',
        serviceOnline: verify.serviceOnline,
        status: verify.status,
      });
    }

    if (action === 'create_chat') {
      let rawPhone = String(phone || '').replace(/[^\d]/g, '');
      if (rawPhone.startsWith('0')) rawPhone = '62' + rawPhone.slice(1);
      else if (rawPhone.startsWith('8')) rawPhone = '62' + rawPhone;
      if (!rawPhone) {
        return NextResponse.json({ success: false, error: 'Nomor telepon tidak valid' }, { status: 400 });
      }

      const targetJid = `${rawPhone}@c.us`;
      const chatName = name || `+${rawPhone}`;
      const now = Date.now();

      await saveMessageToDb({
        id: `init-${now}`,
        chatId: targetJid,
        body: message || 'Memulai percakapan',
        fromMe: true,
        timestamp: now,
        type: 'chat',
        chatName,
        chatPhone: rawPhone,
      });

      return NextResponse.json({
        success: true,
        chat: {
          id: targetJid,
          name: chatName,
          phone: rawPhone,
          timestamp: now,
          unreadCount: 0,
        },
      });
    }

    if (action === 'mark_read') {
      const targetChatId = chatId || to;
      if (!targetChatId) {
        return NextResponse.json({ success: false, error: 'chatId wajib diisi.' }, { status: 400 });
      }

      await markChatReadInDb(targetChatId);

      try {
        await fetch(`${WA_SERVICE_URL}/api/mark-read`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatId: targetChatId }),
          cache: 'no-store',
        });
      } catch {}

      return NextResponse.json({ success: true, message: 'Chat ditandai telah dibaca.' });
    }

    if (action === 'delete_chat') {
      const targetChatId = chatId || to;
      if (!targetChatId) {
        return NextResponse.json({ success: false, error: 'chatId wajib diisi.' }, { status: 400 });
      }

      await deleteChatFromDb(targetChatId);

      try {
        await fetch(`${WA_SERVICE_URL}/api/delete-chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatId: targetChatId }),
          cache: 'no-store',
        });
      } catch {}

      return NextResponse.json({ success: true, message: 'Percakapan berhasil dihapus.' });
    }

    if (action === 'delete_message') {
      const { messageId, everyone } = body;
      if (!messageId) {
        return NextResponse.json({ success: false, error: 'messageId wajib diisi.' }, { status: 400 });
      }

      await deleteMessageFromDb(messageId, chatId);

      try {
        await fetch(`${WA_SERVICE_URL}/api/delete-message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageId, chatId, everyone }),
          cache: 'no-store',
        });
      } catch {}

      return NextResponse.json({ success: true, message: 'Pesan berhasil dihapus.' });
    }

    // Forward other actions to WA Service
    const endpointMap: Record<string, { path: string; method: string; bodyData?: unknown }> = {
      send: {
        path: '/api/send',
        method: 'POST',
        bodyData: { to, chatId, message, mediaUrl, mediaBase64, mediaMime, mediaName, mediaKey, mediaSize, caption, type },
      },
      init: { path: '/api/init', method: 'POST' },
      restart: { path: '/api/restart', method: 'POST' },
      logout: { path: '/api/logout', method: 'POST' },
      clear_logs: { path: '/api/clear-logs', method: 'POST' },
      stop_service: { path: '/api/stop', method: 'POST' },
    };

    const target = endpointMap[action];
    if (!target) {
      return NextResponse.json({ success: false, error: `Aksi tidak dikenali: ${action}` }, { status: 400 });
    }

    try {
      const forwardRes = await fetch(`${WA_SERVICE_URL}${target.path}`, {
        method: target.method,
        headers: { 'Content-Type': 'application/json' },
        body: target.bodyData ? JSON.stringify(target.bodyData) : undefined,
        cache: 'no-store',
      });

      const responseData = await forwardRes.json().catch(() => ({}));

      // If send was successful, persist to PostgreSQL DB as well!
      if (action === 'send' && responseData.success && responseData.sentMessage) {
        const sm = responseData.sentMessage;
        saveMessageToDb({
          id: sm.id,
          chatId: sm.to || chatId,
          body: sm.body,
          from: sm.from,
          to: sm.to,
          fromMe: true,
          timestamp: sm.timestamp || Date.now(),
          type: sm.type || 'chat',
          hasMedia: sm.hasMedia,
          mediaUrl: sm.mediaUrl,
          mediaKey: sm.mediaKey,
          mediaName: sm.mediaName,
          mediaMime: sm.mediaMime,
          mediaSize: sm.mediaSize,
          ack: sm.ack || 1,
        }).catch(() => {});
      }

      return NextResponse.json(responseData, { status: forwardRes.status });
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Tidak dapat terhubung ke WhatsApp Gateway service (Port 5001). Pastikan service sudah dinyalakan.',
        },
        { status: 503 }
      );
    }
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Terjadi kesalahan internal';
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}

