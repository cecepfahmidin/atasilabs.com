import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth, MessageMedia } = pkg;
import QRCode from 'qrcode';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

dotenv.config({ path: path.resolve(ROOT_DIR, '.env') });

const PORT = process.env.PORT || process.env.WA_SERVICE_PORT || 5001;

// Database Client (lazy & fail-safe)
let prisma = null;
function getPrisma() {
  if (prisma) return prisma;
  try {
    prisma = new PrismaClient();
  } catch (e) {
    console.warn('[WA-SVC] PrismaClient not initialized yet:', e?.message || e);
  }
  return prisma;
}
getPrisma();

// In-memory cache for downloaded WhatsApp media (msgId -> { data, mimetype, filename })
const mediaCache = new Map();

async function getWhatsAppMedia(msgId) {
  if (!msgId) return null;
  if (mediaCache.has(msgId)) {
    return mediaCache.get(msgId);
  }

  if (!client || state.status !== 'READY') return null;

  try {
    const dlResult = await client.pupPage.evaluate(async (id) => {
      const Msg = window.require('WAWebCollections').Msg;
      let m = Msg.get(id);
      if (!m) {
        try {
          const res = await Msg.getMessagesById([id]);
          m = res?.messages?.[0];
        } catch (_) {}
      }
      if (!m) {
        const allMsgs = Msg.getModelsArray();
        m = allMsgs.find(
          (x) =>
            x.id?._serialized === id ||
            x.id?.id === id ||
            (id.length > 10 && (x.id?._serialized?.includes(id) || x.id?.id?.includes(id)))
        );
      }
      if (!m) {
        try {
          const ChatCol = window.require('WAWebCollections').Chat;
          const chats = ChatCol ? ChatCol.getModelsArray() : [];
          for (const c of chats) {
            if (c.msgs) {
              const found =
                c.msgs.get(id) ||
                c.msgs.getModelsArray().find(
                  (x) =>
                    x.id?._serialized === id ||
                    x.id?.id === id ||
                    (id.length > 10 && (x.id?._serialized?.includes(id) || x.id?.id?.includes(id)))
                );
              if (found) {
                m = found;
                break;
              }
            }
          }
        } catch (_) {}
      }
      if (!m) return null;

      try {
        if (m.downloadMedia) {
          await m.downloadMedia({ downloadEvenIfExpensive: true, rmrReason: 1 });
        }
        const makeMockQpl = () => {
          const p = new Proxy(() => p, {
            get: () => (...args) => p,
            apply: () => p,
          });
          return p;
        };
        const mockQpl = makeMockQpl();
        const dlManager = window.require('WAWebDownloadManager').downloadManager;
        const dec = await dlManager.downloadAndMaybeDecrypt({
          directPath: m.directPath,
          encFilehash: m.encFilehash,
          filehash: m.filehash,
          mediaKey: m.mediaKey,
          mediaKeyTimestamp: m.mediaKeyTimestamp,
          type: m.type,
          mimetype: m.mimetype,
          signal: new AbortController().signal,
          downloadQpl: mockQpl,
        });
        const b64 = await window.WWebJS.arrayBufferToBase64Async(dec);
        return {
          data: b64,
          mimetype: m.mimetype || (m.type === 'image' ? 'image/jpeg' : 'application/octet-stream'),
          filename: m.filename || (m.type === 'image' ? `${id}.jpg` : 'file.bin'),
        };
      } catch (e) {
        return { error: e.message };
      }
    }, msgId);

    if (dlResult && dlResult.data) {
      mediaCache.set(msgId, dlResult);
      if (mediaCache.size > 250) {
        const first = mediaCache.keys().next().value;
        mediaCache.delete(first);
      }
      return dlResult;
    }
  } catch (err) {
    console.warn('[WA-SVC] getWhatsAppMedia puppeteer warning:', err?.message);
  }

  // Fallback: standard client.getMessageById
  try {
    const msg = await client.getMessageById(msgId);
    if (msg && typeof msg.downloadMedia === 'function') {
      const dl = await msg.downloadMedia();
      if (dl && dl.data) {
        mediaCache.set(msgId, dl);
        return dl;
      }
    }
  } catch (_) {}

  return null;
}

const avatarUrlCache = new Map(); // chatId -> { url: string | null, expiresAt: number }

// Extract all chats, genuine group subjects, contact names, and avatars directly via Puppeteer
async function getWhatsAppChatsDirectly() {
  if (!client || state.status !== 'READY') return [];
  try {
    const rawChats = await client.pupPage.evaluate(() => {
      try {
        const ChatCol = window.require('WAWebCollections')?.Chat || window.Store?.Chat;
        if (!ChatCol) return [];
        const models = ChatCol.getModelsArray ? ChatCol.getModelsArray() : (ChatCol.models || []);
        const WidFactory = window.require('WAWebWidFactory');
        const PPTCol = window.require('WAWebCollections')?.ProfilePicThumb;

        return models.map((c) => {
          try {
            const id = c.id?._serialized || c.__x_id?._serialized || '';
            if (!id || id.includes('@broadcast') || id === 'status@broadcast') {
              return null;
            }

            let resolvedId = id;
            if (id === '150336740303055@lid') {
              resolvedId = '6282211331456@c.us';
            } else if (id.endsWith('@lid')) {
              return null;
            }

            const isGroup = Boolean(c.isGroup || (typeof resolvedId === 'string' && resolvedId.endsWith('@g.us')));
            const wid = WidFactory ? WidFactory.createWid(id) : null;
            const resolvedWid = WidFactory && resolvedId !== id ? WidFactory.createWid(resolvedId) : null;

            // Group subject or contact name
            let name = '';
            if (isGroup) {
              try {
                const metaCol = window.require('WAWebCollections')?.GroupMetadata || window.Store?.GroupMetadata;
                const meta = metaCol?.get(id) || (wid ? metaCol?.get(wid) : null);
                name = c.formattedTitle || meta?.subject || c.groupMetadata?.subject || c.__x_formattedTitle || c.name || '';
              } catch (_) {
                name = c.formattedTitle || c.groupMetadata?.subject || c.name || '';
              }
              if (!name || name === id) name = 'Grup WhatsApp';
            } else {
              if (resolvedId === '6282211331456@c.us') {
                name = 'Cecep Fahmidin (+6282211331456)';
              } else {
                name =
                  c.formattedTitle ||
                  c.contact?.name ||
                  c.contact?.pushname ||
                  c.contact?.formattedName ||
                  c.name ||
                  (resolvedId ? resolvedId.replace(/@.*$/, '') : 'Kontak');
              }
            }

            // Extract profile picture / avatar URL
            let avatarUrl =
              c.contact?.profilePicThumb?.eurl ||
              c.profilePicThumb?.eurl ||
              null;

            if (!avatarUrl && PPTCol) {
              try {
                let ppt = PPTCol.get(id) || (wid ? PPTCol.get(wid) : null);
                if (!ppt && resolvedWid) {
                  ppt = PPTCol.get(resolvedId) || PPTCol.get(resolvedWid);
                }
                if (ppt?.eurl) avatarUrl = ppt.eurl;
              } catch (_) {}
            }

            const unreadCount = Number(c.unreadCount) || 0;
            const t = c.t ? Number(c.t) * 1000 : (c.timestamp ? Number(c.timestamp) * 1000 : Date.now());

            // Extract last message if present
            let lastMessage = null;
            try {
              let lastMsg = null;
              if (c.msgs && typeof c.msgs.last === 'function') {
                lastMsg = c.msgs.last();
              } else if (c.lastReceivedKey) {
                lastMsg = window.require('WAWebCollections')?.Msg?.get(c.lastReceivedKey);
              }
              if (lastMsg) {
                lastMessage = {
                  id: lastMsg.id?._serialized || lastMsg.id?.id,
                  body: lastMsg.body || (lastMsg.type === 'image' ? '[Foto]' : lastMsg.type === 'document' ? '[Dokumen]' : ''),
                  timestamp: lastMsg.t ? Number(lastMsg.t) * 1000 : t,
                  fromMe: Boolean(lastMsg.id?.fromMe),
                  type: lastMsg.type || 'chat',
                };
              }
            } catch (_) {}

            return {
              id: resolvedId || id,
              name: String(name).trim() || (isGroup ? 'Grup WhatsApp' : id.replace(/@.*$/, '')),
              unreadCount,
              timestamp: t,
              isGroup,
              avatarUrl: avatarUrl || null,
              lastMessage,
            };
          } catch (_) {
            return null;
          }
        }).filter(Boolean);
      } catch (err) {
        return { error: err.message };
      }
    });

    if (Array.isArray(rawChats)) {
      for (const chat of rawChats) {
        if (chat?.avatarUrl && chat?.id) {
          avatarUrlCache.set(chat.id, { url: chat.avatarUrl, expiresAt: Date.now() + 30 * 60 * 1000 });
        }
      }
      return rawChats;
    }
    if (rawChats?.error) {
      console.warn('[WA-SVC] getWhatsAppChatsDirectly evaluate error:', rawChats.error);
    }
  } catch (err) {
    console.warn('[WA-SVC] getWhatsAppChatsDirectly error:', err?.message);
  }
  return [];
}

function syncChatsWithDatabase(chatsList) {
  if (!Array.isArray(chatsList) || chatsList.length === 0) return;
  const db = getPrisma();
  if (!db) return;
  prismaQueue = prismaQueue.then(async () => {
    try {
      for (const c of chatsList) {
        if (!c.id || c.id.includes('@broadcast') || c.id === '150336740303055@lid') continue;
        const cleanName = c.id === '6282211331456@c.us' ? 'Cecep Fahmidin (+6282211331456)' : c.name;
        if (!cleanName || cleanName === 'Admin') continue;

        await db.whatsAppChat.upsert({
          where: { id: c.id },
          create: {
            id: c.id,
            name: cleanName,
            phone: c.id.replace(/@.*$/, ''),
            isGroup: Boolean(c.isGroup),
            timestamp: Number(c.timestamp) || Date.now(),
            unreadCount: Number(c.unreadCount) || 0,
            lastMessage: c.lastMessage || null,
          },
          update: {
            name: cleanName,
            isGroup: Boolean(c.isGroup),
            timestamp: Number(c.timestamp) || Date.now(),
            ...(c.lastMessage ? { lastMessage: c.lastMessage } : {}),
          },
        });
      }
    } catch (e) {
      console.warn('[WA-SVC] syncChatsWithDatabase warning:', e?.message);
    }
  }).catch(() => {});
}

// Service State
let state = {
  status: 'DISCONNECTED', // 'INITIALIZING' | 'QR_READY' | 'AUTHENTICATING' | 'READY' | 'DISCONNECTED' | 'ERROR'
  qrString: null,
  qrDataUrl: null,
  info: null,
  error: null,
  startedAt: new Date().toISOString(),
  logs: [],
};

// Supabase Realtime WebSocket Connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let supabase = null;
let realtimeChannel = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      realtime: {
        transport: WebSocket,
      },
    });
    realtimeChannel = supabase.channel('whatsapp_gateway', {
      config: {
        broadcast: { ack: false, self: false },
      },
    });
    realtimeChannel.subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log('[WA-SVC] ✅ Supabase Realtime WebSocket "whatsapp_gateway" SUBSCRIBED');
        addLog('SYSTEM', 'Realtime', 'Terhubung ke Supabase Realtime WebSocket (whatsapp_gateway)');
      } else if (err) {
        console.warn('[WA-SVC] Supabase Realtime channel status:', status, err?.message || err);
      }
    });
  } catch (err) {
    console.warn('[WA-SVC] Supabase client init warning:', err?.message);
  }
}

async function broadcastRealtime(event, payload) {
  // 1. Supabase Realtime WebSocket broadcast
  if (realtimeChannel) {
    try {
      await realtimeChannel.send({
        type: 'broadcast',
        event,
        payload,
      });
    } catch (err) {
      console.warn(`[WA-SVC] Error broadcasting ${event}:`, err?.message);
    }
  }

  // 2. Webhook HTTP POST to Next.js webhook endpoint (event-driven, no polling)
  const webhookUrl = process.env.NEXT_WEBHOOK_URL || 'http://127.0.0.1:3000/api/whatsapp/webhook';
  try {
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, payload }),
    }).catch(() => {});
  } catch (_) {}
}

function broadcastStatus() {
  broadcastRealtime('STATUS_UPDATE', {
    status: state.status,
    info: state.info,
    qrDataUrl: state.qrDataUrl,
    error: state.error,
  });
}

function addLog(direction, toOrFrom, body, status = 'INFO', extra = {}) {
  const logItem = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    direction, // 'SYSTEM' | 'INCOMING' | 'OUTGOING'
    target: toOrFrom || 'SYSTEM',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    status,
    timestamp: new Date().toISOString(),
    ...extra,
  };
  state.logs.unshift(logItem);
  if (state.logs.length > 100) {
    state.logs = state.logs.slice(0, 100);
  }
  console.log(`[WA-SVC] [${direction}] ${toOrFrom || ''}: ${typeof body === 'string' ? body.substring(0, 100) : ''}`);
  return logItem;
}

let client = null;
let isInitializing = false;
let conversations = new Map();

function extractMessageId(msg) {
  if (!msg) return null;
  if (typeof msg === 'string') return msg;
  if (msg.id?._serialized) return msg.id._serialized;
  if (typeof msg.id === 'string') return msg.id;
  if (msg._serialized) return msg._serialized;
  if (msg.id?.id) return msg.id.id;
  return null;
}

function deduplicateMessagesList(messages) {
  if (!Array.isArray(messages)) return [];
  const result = [];
  const seenIds = new Set();

  for (const m of messages) {
    if (!m) continue;
    const mId = extractMessageId(m) || m.id;
    if (mId && seenIds.has(mId)) continue;

    const normBody = (m.body || '').trim();
    const isFromMe = !!m.fromMe;
    const timeMs = Number(m.timestamp) || 0;
    const isMedia = Boolean(m.hasMedia || m.type === 'image' || m.type === 'document' || m.mediaUrl);

    // Check if duplicate of an existing message in result within 15 seconds
    const dupIndex = result.findIndex((existing) => {
      if (existing.fromMe !== isFromMe) return false;
      const existingTime = Number(existing.timestamp) || 0;
      const timeDiff = Math.abs(existingTime - timeMs);
      if (timeDiff < 15000) {
        const existingIsMedia = Boolean(existing.hasMedia || existing.type === 'image' || existing.type === 'document' || existing.mediaUrl);
        if (isMedia && existingIsMedia) return true;
        if (normBody && (existing.body || '').trim() === normBody) return true;
      }
      return false;
    });

    if (dupIndex === -1) {
      const cleanMsg = {
        ...m,
        id: mId || `msg-${timeMs}-${Math.random().toString(36).substring(2, 6)}`,
        fromMe: isFromMe,
        body: m.body || '',
        timestamp: timeMs,
      };
      if (cleanMsg.id) seenIds.add(cleanMsg.id);
      result.push(cleanMsg);
    } else {
      // Upgrade ID if new message has genuine WhatsApp ID
      const existing = result[dupIndex];
      const isExistingTemp = !existing.id || existing.id.startsWith('msg-') || existing.id.startsWith('temp-');
      const isNewReal = mId && !mId.startsWith('msg-') && !mId.startsWith('temp-');
      if (isExistingTemp && isNewReal) {
        if (existing.id) seenIds.delete(existing.id);
        existing.id = mId;
        seenIds.add(mId);
      }
      if (m.mediaUrl && !existing.mediaUrl) {
        existing.mediaUrl = m.mediaUrl;
      }
      if (m.mediaName && !existing.mediaName) {
        existing.mediaName = m.mediaName;
      }
      if (m.ack && (!existing.ack || m.ack > existing.ack)) {
        existing.ack = m.ack;
      }
    }
  }

  return result.sort((a, b) => (Number(a.timestamp) || 0) - (Number(b.timestamp) || 0));
}

let prismaQueue = Promise.resolve();

function persistMessageToPrisma(msgObj, chatId, senderName, isGroup = false) {
  if (!chatId || chatId === 'status@broadcast' || chatId.endsWith('@broadcast')) return;
  const db = getPrisma();
  if (!db) return;

  prismaQueue = prismaQueue.then(async () => {
    try {
      const timeNum = Number(msgObj.timestamp) || Date.now();
      const cleanBody = msgObj.body || (msgObj.hasMedia ? (msgObj.type === 'image' ? '[Foto]' : '[Dokumen]') : '');
      const lastMessageData = {
        id: msgObj.id,
        body: cleanBody,
        timestamp: timeNum,
        fromMe: Boolean(msgObj.fromMe),
        type: msgObj.type || 'chat',
        mediaUrl: msgObj.mediaUrl ?? null,
        mediaName: msgObj.mediaName ?? null,
        authorName: msgObj.authorName ?? null,
      };

      // NEVER name a chat 'Admin'!
      const isInvalidName = !senderName || senderName.toLowerCase() === 'admin';
      const defaultName = isGroup
        ? 'Grup WhatsApp'
        : chatId === '6282211331456@c.us'
        ? 'Cecep Fahmidin (+6282211331456)'
        : chatId.replace(/@.*$/, '');
      const finalChatName = isInvalidName ? defaultName : senderName;

      await db.whatsAppChat.upsert({
        where: { id: chatId },
        create: {
          id: chatId,
          name: finalChatName,
          phone: chatId.replace(/@.*$/, ''),
          isGroup: Boolean(isGroup),
          timestamp: timeNum,
          unreadCount: msgObj.fromMe ? 0 : 1,
          lastMessage: lastMessageData,
        },
        update: {
          timestamp: timeNum,
          ...(!isInvalidName ? { name: finalChatName } : {}),
          lastMessage: lastMessageData,
          isGroup: Boolean(isGroup),
        },
      });

      await db.whatsAppMessage.upsert({
        where: { id: msgObj.id },
        create: {
          id: msgObj.id,
          chatId: chatId,
          body: msgObj.body || '',
          from: msgObj.from || null,
          to: msgObj.to || null,
          fromMe: Boolean(msgObj.fromMe),
          timestamp: timeNum,
          type: msgObj.type || 'chat',
          hasMedia: Boolean(msgObj.hasMedia),
          mediaUrl: msgObj.mediaUrl || null,
          mediaKey: msgObj.mediaKey || null,
          mediaName: msgObj.mediaName || null,
          mediaMime: msgObj.mediaMime || null,
          mediaSize: msgObj.mediaSize ? Math.round(Number(msgObj.mediaSize)) : null,
          ack: msgObj.ack || 1,
        },
        update: {
          body: msgObj.body || '',
          ack: msgObj.ack || 1,
          ...(msgObj.mediaUrl ? { mediaUrl: msgObj.mediaUrl } : {}),
          ...(msgObj.mediaKey ? { mediaKey: msgObj.mediaKey } : {}),
          ...(msgObj.mediaName ? { mediaName: msgObj.mediaName } : {}),
        },
      });
    } catch (err) {
      console.warn('[WA-SVC] Prisma persist warning:', err?.message || err);
    }
  }).catch(() => {});
  return prismaQueue;
}

async function recordMessage(msg) {
  try {
    if (!msg) return;
    const fromMe = !!msg.fromMe;
    let chatId = fromMe ? (msg.to || msg.chatId) : (msg.from || msg.chatId);
    if (!chatId) return;

    // 🚫 Exclude status@broadcast and broadcast messages completely
    if (chatId === 'status@broadcast' || chatId.endsWith('@broadcast') || msg.broadcast) {
      return;
    }

    if (chatId === '150336740303055@lid') {
      chatId = '6282211331456@c.us';
    }

    const isGroup = chatId.endsWith('@g.us');
    let chatName = null;
    const existingConv = conversations.get(chatId);

    if (isGroup) {
      // 👥 For groups: Always query the genuine group subject from WhatsApp Web first
      if (client && state.status === 'READY') {
        try {
          const directTitle = await client.pupPage.evaluate((gid) => {
            try {
              const c = window.require('WAWebCollections')?.Chat?.get(gid);
              const meta = window.require('WAWebCollections')?.GroupMetadata?.get(gid);
              return c?.formattedTitle || meta?.subject || c?.groupMetadata?.subject || c?.name || null;
            } catch (_) {
              return null;
            }
          }, chatId);
          if (directTitle && String(directTitle).trim()) {
            chatName = String(directTitle).trim();
          }
        } catch (_) {}
      }
      if (!chatName && existingConv?.name && !existingConv.name.endsWith('@g.us') && existingConv.name !== 'Admin') {
        chatName = existingConv.name;
      }
      if (!chatName) {
        chatName = 'Grup WhatsApp';
      }
    } else {
      // 👤 1-on-1 chat
      if (chatId === '6282211331456@c.us') {
        chatName = 'Cecep Fahmidin (+6282211331456)';
      } else if (fromMe) {
        // Sent by Admin: NEVER set chatName to 'Admin'!
        chatName = existingConv?.name && existingConv.name !== 'Admin' ? existingConv.name : chatId.replace(/@.*$/, '');
      } else {
        // Received from contact: query WhatsApp Web contact name first
        let contactTitle = null;
        if (client && state.status === 'READY') {
          try {
            contactTitle = await client.pupPage.evaluate((cid) => {
              try {
                const c = window.require('WAWebCollections')?.Chat?.get(cid);
                return c?.formattedTitle || c?.contact?.name || c?.contact?.pushname || c?.contact?.formattedName || null;
              } catch (_) {
                return null;
              }
            }, chatId);
          } catch (_) {}
        }
        chatName =
          contactTitle ||
          msg._data?.notifyName ||
          msg._data?.name ||
          (existingConv?.name && existingConv.name !== 'Admin' ? existingConv.name : chatId.replace(/@.*$/, ''));
      }
    }

    const author = msg.author || (isGroup && !fromMe ? msg.from : null);
    const authorName = msg._data?.notifyName || (author ? author.replace(/@.*$/, '') : null);

    const rawTime = msg.timestamp;
    const timestamp = rawTime ? (rawTime < 10000000000 ? rawTime * 1000 : rawTime) : Date.now();
    const resolvedId = extractMessageId(msg) || `msg-${timestamp}-${Math.random().toString(36).substring(2, 6)}`;

    let mediaUrl = msg.mediaUrl || null;
    let mediaKey = msg.mediaKey || null;
    let mediaName = msg.mediaName || null;
    let mediaMime = msg.mediaMime || null;
    let mediaSize = msg.mediaSize || null;
    const hasMedia = !!msg.hasMedia;

    // Direct WhatsApp Media download (no R2 / no local storage)
    if (hasMedia) {
      if (!mediaUrl || mediaUrl.includes('pub-') || mediaUrl.includes('r2.cloudflarestorage.com') || mediaUrl.includes('/uploads/')) {
        mediaUrl = `/api/whatsapp?endpoint=media&messageId=${encodeURIComponent(resolvedId)}`;
      }
      mediaName = msg.mediaName || (msg.type === 'image' ? `photo_${resolvedId}.jpg` : 'document');
      mediaMime = msg.mediaMime || (msg.type === 'image' ? 'image/jpeg' : 'application/octet-stream');

      // Pre-warm in-memory media cache asynchronously via direct decryption
      if (!mediaCache.has(resolvedId)) {
        getWhatsAppMedia(resolvedId).catch(() => {});
      }
    }

    const messageObj = {
      id: resolvedId,
      body: msg.body || (hasMedia ? (mediaMime?.startsWith('image/') || msg.type === 'image' ? '[Foto]' : '[Dokumen]') : ''),
      from: msg.from || (fromMe ? client?.info?.wid?._serialized : chatId),
      to: msg.to || (fromMe ? chatId : client?.info?.wid?._serialized),
      fromMe,
      timestamp,
      type: msg.type || (hasMedia ? (mediaMime?.startsWith('image/') ? 'image' : 'document') : 'chat'),
      hasMedia,
      mediaUrl,
      mediaKey,
      mediaName,
      mediaMime,
      mediaSize,
      ack: msg.ack || 1,
      author,
      authorName,
    };

    const existing = existingConv || {
      id: chatId,
      name: chatName,
      unreadCount: 0,
      timestamp: messageObj.timestamp,
      isGroup,
      avatarUrl: null,
      messages: [],
    };

    if (chatName) {
      if (isGroup || !existing.name || existing.name === 'Admin' || existing.name === chatId.replace(/@.*$/, '')) {
        existing.name = chatName;
      }
    }

    // Deduplication check
    const normBody = (messageObj.body || '').trim();
    const isMediaMsg = Boolean(messageObj.hasMedia || messageObj.type === 'image' || messageObj.type === 'document' || messageObj.mediaUrl);

    const existingIndex = existing.messages.findIndex((m) => {
      if (m.id === messageObj.id) return true;
      if (m.fromMe === messageObj.fromMe) {
        const timeDiff = Math.abs((m.timestamp || 0) - messageObj.timestamp);
        if (timeDiff < 15000) {
          const existingIsMedia = Boolean(m.hasMedia || m.type === 'image' || m.type === 'document' || m.mediaUrl);
          if (isMediaMsg && existingIsMedia) return true;
          if (normBody && (m.body || '').trim() === normBody) return true;
        }
      }
      return false;
    });

    if (existingIndex === -1) {
      existing.messages.push(messageObj);
      if (!fromMe) {
        existing.unreadCount += 1;
      }
      broadcastRealtime('NEW_MESSAGE', {
        chatId,
        message: messageObj,
      });
    } else {
      const old = existing.messages[existingIndex];
      const isOldTemp = !old.id || old.id.startsWith('msg-') || old.id.startsWith('temp-');
      const isNewReal = messageObj.id && !messageObj.id.startsWith('msg-') && !messageObj.id.startsWith('temp-');
      if (isOldTemp && isNewReal) {
        const oldTempId = old.id;
        old.id = messageObj.id;
        // Delete the temporary placeholder row from database
        prismaQueue = prismaQueue.then(async () => {
          try {
            await prisma.whatsAppMessage.deleteMany({ where: { id: oldTempId } });
          } catch (_) {}
        });
      }
      if (messageObj.ack && (!old.ack || messageObj.ack > old.ack)) {
        old.ack = messageObj.ack;
      }
      if (messageObj.mediaUrl && !old.mediaUrl) {
        old.mediaUrl = messageObj.mediaUrl;
        old.mediaName = messageObj.mediaName;
        old.type = messageObj.type;
        old.hasMedia = true;
      }
      broadcastRealtime('MESSAGE_UPDATE', {
        chatId,
        message: existing.messages[existingIndex],
      });
    }

    if (existing.messages.length > 100) {
      existing.messages = existing.messages.slice(-100);
    }

    existing.lastMessage = {
      id: messageObj.id,
      body: messageObj.body || (messageObj.hasMedia ? `[${messageObj.type === 'image' ? 'Foto' : 'Dokumen'}]` : ''),
      timestamp: messageObj.timestamp,
      fromMe: messageObj.fromMe,
      type: messageObj.type,
      mediaUrl: messageObj.mediaUrl,
      authorName: messageObj.authorName,
    };
    existing.timestamp = messageObj.timestamp;
    conversations.set(chatId, existing);

    // Persist to PostgreSQL database asynchronously
    persistMessageToPrisma(messageObj, chatId, chatName, isGroup);

    broadcastRealtime('CHAT_UPDATE', {
      chat: {
        id: existing.id,
        name: existing.name,
        unreadCount: existing.unreadCount,
        timestamp: existing.timestamp,
        isGroup: existing.isGroup,
        avatarUrl: existing.avatarUrl || `/api/whatsapp?endpoint=avatar&chatId=${encodeURIComponent(existing.id)}`,
        lastMessage: existing.lastMessage,
      },
    });

    // Pre-warm in-memory media cache asynchronously if not cached yet
    if (msg.hasMedia && typeof msg.downloadMedia === 'function' && !mediaCache.has(messageObj.id)) {
      msg.downloadMedia().then((media) => {
        if (media && media.data) {
          mediaCache.set(messageObj.id, media);
        }
      }).catch((e) => console.warn('[WA-SVC] Async downloadMedia warning:', e?.message));
    }
  } catch (e) {
    console.error('[WA-SVC] recordMessage error:', e);
  }
}

function formatWhatsAppNumber(phone) {
  if (!phone) return null;
  let cleaned = String(phone).replace(/[^\d]/g, '');
  if (!cleaned) return null;

  // 08xx -> 628xx
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }

  // standard indonesian phone length check or international
  if (cleaned.endsWith('@c.us') || cleaned.endsWith('@g.us')) {
    return cleaned;
  }
  return `${cleaned}@c.us`;
}

let keepAliveTimer = null;
function startKeepAlive() {
  if (keepAliveTimer) clearInterval(keepAliveTimer);
  keepAliveTimer = setInterval(async () => {
    if (state.status === 'READY' && client) {
      try {
        await client.getState();
      } catch (err) {
        if (err?.message?.includes('detached Frame') || err?.message?.includes('Execution context was destroyed')) {
          console.warn('[WA-SVC] Detached frame detected in keepalive heartbeat, restarting client to recover...');
          initClient().catch(console.error);
        }
      }
    }
  }, 25000);
}

function stopKeepAlive() {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
}

async function initClient() {
  if (isInitializing) {
    console.log('[WA-SVC] Initialization already in progress.');
    return;
  }
  isInitializing = true;
  state.status = 'INITIALIZING';
  state.error = null;
  addLog('SYSTEM', 'Gateway', 'Memulai inisialisasi WhatsApp Web client...');

  if (client) {
    try {
      await client.destroy();
    } catch (e) {
      console.warn('[WA-SVC] Warning destroying previous client:', e?.message);
    }
    client = null;
  }

  try {
    const authPath = path.resolve(ROOT_DIR, '.wwebjs_auth');
    const sessionDir = path.resolve(authPath, 'session');
    if (fs.existsSync(sessionDir)) {
      const lockFiles = ['lockfile', 'SingletonLock', 'SingletonCookie', 'SingletonSocket', 'DevToolsActivePort'];
      for (const lf of lockFiles) {
        const p = path.join(sessionDir, lf);
        if (fs.existsSync(p)) {
          try {
            fs.unlinkSync(p);
            console.log(`[WA-SVC] Cleaned stale lockfile: ${lf}`);
          } catch (_) {}
        }
      }
    }

    client = new Client({
      authStrategy: new LocalAuth({
        dataPath: authPath,
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-features=IsolateOrigins,site-per-process',
          '--disable-site-isolation-trials',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-ipc-flooding-protection',
        ],
      },
    });

    client.on('qr', async (qr) => {
      state.status = 'QR_READY';
      state.qrString = qr;
      try {
        state.qrDataUrl = await QRCode.toDataURL(qr, {
          width: 320,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        });
        addLog('SYSTEM', 'QR_SCAN', 'QR Code baru berhasil digenerate. Menunggu scan dari admin.');
        broadcastStatus();
      } catch (err) {
        console.error('[WA-SVC] Error generating QR data URL:', err);
      }
    });

    client.on('authenticated', () => {
      state.status = 'AUTHENTICATING';
      state.qrString = null;
      state.qrDataUrl = null;
      addLog('SYSTEM', 'Auth', 'Sesi WhatsApp berhasil diautentikasi.');
      broadcastStatus();
    });

    client.on('auth_failure', (msg) => {
      stopKeepAlive();
      state.status = 'ERROR';
      state.error = `Autentikasi gagal: ${msg}`;
      addLog('SYSTEM', 'Auth Failure', `Autentikasi gagal: ${msg}`, 'FAILED');
      broadcastStatus();
    });

    client.on('ready', () => {
      state.status = 'READY';
      state.qrString = null;
      state.qrDataUrl = null;
      state.error = null;

      const wid = client.info?.wid?._serialized || '';
      const phone = client.info?.wid?.user || '';
      const pushname = client.info?.pushname || 'Admin';
      const platform = client.info?.platform || 'Web';

      state.info = {
        wid,
        phone,
        pushname,
        platform,
        connectedAt: new Date().toISOString(),
      };

      addLog('SYSTEM', 'Ready', `WhatsApp Gateway siap digunakan! Terhubung sebagai ${pushname} (${phone})`, 'SUCCESS');
      startKeepAlive();
      broadcastStatus();

      // Asynchronously trigger chats extraction & database sync
      setTimeout(async () => {
        try {
          const directChats = await getWhatsAppChatsDirectly();
          if (directChats.length > 0) {
            console.log(`[WA-SVC] Initial sync: fetched ${directChats.length} chats from WhatsApp Web.`);
            syncChatsWithDatabase(directChats);
            for (const c of directChats) {
              const existing = conversations.get(c.id) || {
                id: c.id,
                unreadCount: c.unreadCount || 0,
                timestamp: c.timestamp,
                messages: [],
              };
              existing.name = c.name;
              existing.isGroup = c.isGroup;
              existing.avatarUrl = c.avatarUrl;
              if (c.lastMessage && !existing.lastMessage) {
                existing.lastMessage = c.lastMessage;
              }
              conversations.set(c.id, existing);
            }
          }
        } catch (e) {
          console.warn('[WA-SVC] Initial chats sync warning:', e?.message);
        }
      }, 2000);
    });

    client.on('message', (msg) => {
      try {
        if (!msg || msg.from === 'status@broadcast' || msg.from?.endsWith('@broadcast') || msg.broadcast) return;
        const fromNumber = msg.from;
        const senderName = msg._data?.notifyName || fromNumber;
        addLog('INCOMING', senderName, msg.body, 'RECEIVED', {
          fromNumber,
          msgId: msg.id?._serialized,
        });
      } catch (err) {
        console.error('[WA-SVC] Error handling incoming message:', err);
      }
    });

    client.on('message_create', async (msg) => {
      try {
        if (!msg || msg.from === 'status@broadcast' || msg.to === 'status@broadcast' || msg.broadcast) return;
        await recordMessage(msg);
      } catch (e) {
        console.warn('[WA-SVC] Error in message_create handler:', e?.message);
      }
    });

    client.on('disconnected', (reason) => {
      stopKeepAlive();
      state.status = 'DISCONNECTED';
      state.info = null;
      state.qrString = null;
      state.qrDataUrl = null;
      addLog('SYSTEM', 'Disconnect', `Sesi WhatsApp terputus: ${reason}`, 'WARNING');
      broadcastStatus();

      // Auto-reconnect on unexpected disconnects like NAVIGATION
      if (reason === 'NAVIGATION' || reason === 'CONFLICT' || reason === 'UNPAIRED') {
        setTimeout(() => {
          console.log('[WA-SVC] Attempting auto-reconnect after disconnect:', reason);
          initClient().catch(console.error);
        }, 3000);
      }
    });

    await client.initialize();
  } catch (err) {
    state.status = 'ERROR';
    state.error = err?.message || 'Gagal menginisialisasi WhatsApp Client';
    addLog('SYSTEM', 'Error', `Inisialisasi error: ${state.error}`, 'FAILED');
    broadcastStatus();

    // Auto cleanup stale puppeteer chrome process on Windows if locked
    if (err?.message?.includes('already running') || err?.message?.includes('userDataDir')) {
      console.warn('[WA-SVC] Stale browser process detected, attempting auto-cleanup...');
      if (process.platform === 'win32') {
        try {
          const { execSync } = await import('node:child_process');
          execSync('powershell "Get-Process chrome -ErrorAction SilentlyContinue | Where-Object { $_.Path -like \\"*puppeteer*\\" } | Stop-Process -Force -ErrorAction SilentlyContinue"', { stdio: 'ignore' });
        } catch (_) {}
      }
    }
  } finally {
    isInitializing = false;
  }
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const host = req.headers.host || '127.0.0.1';
  const url = new URL(req.url, `http://${host}`);
  const pathname = url.pathname;

  // Helper to read JSON body
  const readJsonBody = () =>
    new Promise((resolve, reject) => {
      let data = '';
      req.on('data', (chunk) => {
        data += chunk;
      });
      req.on('end', () => {
        try {
          resolve(data ? JSON.parse(data) : {});
        } catch (e) {
          reject(e);
        }
      });
      req.on('error', reject);
    });

  // Endpoints
  try {
    if (req.method === 'GET' && (pathname === '/' || pathname === '/health' || pathname === '/api/status')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          success: true,
          serviceOnline: true,
          status: state.status,
          qrDataUrl: state.qrDataUrl,
          info: state.info,
          error: state.error,
          logs: state.logs.slice(0, 50),
          uptime: process.uptime(),
          startedAt: state.startedAt,
        })
      );
      return;
    }

    if (req.method === 'POST' && pathname === '/api/init') {
      if (state.status === 'READY') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'WhatsApp client sudah aktif dan terhubung.' }));
        return;
      }
      initClient().catch(console.error);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Inisialisasi WhatsApp client dimulai.' }));
      return;
    }

    if (req.method === 'GET' && pathname === '/api/chats') {
      if (state.status !== 'READY' || !client) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'WhatsApp client belum siap.', chats: [] }));
        return;
      }

      let chatsList = await getWhatsAppChatsDirectly();

      // Fallback if puppeteer returned empty
      if (chatsList.length === 0) {
        try {
          const rawChats = await client.getChats();
          if (Array.isArray(rawChats)) {
            chatsList = rawChats
              .filter((c) => {
                const cid = c.id?._serialized || '';
                return cid && !cid.includes('@broadcast') && cid !== 'status@broadcast';
              })
              .map((c) => ({
                id: c.id?._serialized,
                name: c.name || (c.isGroup ? 'Grup WhatsApp' : c.id?.user || 'Kontak'),
                unreadCount: c.unreadCount || 0,
                timestamp: c.timestamp ? c.timestamp * 1000 : Date.now(),
                isGroup: !!c.isGroup,
                avatarUrl: null,
                lastMessage: c.lastMessage
                  ? {
                      id: c.lastMessage.id?._serialized,
                      body: c.lastMessage.body || '',
                      timestamp: c.lastMessage.timestamp ? c.lastMessage.timestamp * 1000 : Date.now(),
                      fromMe: !!c.lastMessage.fromMe,
                      type: c.lastMessage.type || 'chat',
                    }
                  : null,
              }));
          }
        } catch (_) {}
      }

      // Merge with tracked conversations
      const mergedMap = new Map();
      chatsList.forEach((c) => mergedMap.set(c.id, c));
      conversations.forEach((conv, id) => {
        if (id !== '150336740303055@lid' && !id.includes('@broadcast')) {
          const existing = mergedMap.get(id);
          if (existing) {
            if (conv.messages && conv.messages.length > 0 && (!existing.lastMessage || conv.timestamp > existing.timestamp)) {
              existing.lastMessage = conv.lastMessage;
              existing.timestamp = conv.timestamp;
            }
            if (conv.avatarUrl && !existing.avatarUrl) {
              existing.avatarUrl = conv.avatarUrl;
            }
          } else {
            mergedMap.set(id, {
              id: conv.id,
              name: conv.name,
              unreadCount: conv.unreadCount,
              timestamp: conv.timestamp,
              isGroup: conv.isGroup,
              avatarUrl: conv.avatarUrl || null,
              lastMessage: conv.lastMessage,
            });
          }
        }
      });

      const finalChats = Array.from(mergedMap.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      // Asynchronously update PostgreSQL with genuine names
      syncChatsWithDatabase(finalChats);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, chats: finalChats }));
      return;
    }

    if (req.method === 'GET' && pathname === '/api/messages') {
      const chatId = url.searchParams.get('chatId');
      const limit = parseInt(url.searchParams.get('limit') || '50', 10);
      if (!chatId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Parameter chatId wajib diisi.' }));
        return;
      }
      if (state.status !== 'READY' || !client) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'WhatsApp belum siap.', messages: [] }));
        return;
      }

      let messagesList = [];
      const conv = conversations.get(chatId);

      try {
        const chatsToFetch = [];
        try {
          const allChats = await client.getChats();
          allChats.forEach((c) => {
            const cid = c.id?._serialized;
            if (
              cid === chatId ||
              ((chatId === '6282211331456@c.us' || chatId === '150336740303055@lid') &&
                (cid === '6282211331456@c.us' || cid === '150336740303055@lid'))
            ) {
              if (!chatsToFetch.some((existing) => existing.id?._serialized === cid)) {
                chatsToFetch.push(c);
              }
            }
          });
        } catch (_) {}

        if (chatsToFetch.length === 0) {
          try {
            const c1 = await client.getChatById(chatId);
            if (c1) chatsToFetch.push(c1);
          } catch (_) {}
        }

        for (const chat of chatsToFetch) {
          const rawMessages = await chat.fetchMessages({ limit });
          if (Array.isArray(rawMessages)) {
            for (const m of rawMessages) {
              const mId = extractMessageId(m) || `msg-${m.timestamp}`;
              let mMediaUrl = m.mediaUrl || null;
              let mMediaKey = m.mediaKey || null;
              let mMediaName = m.mediaName || null;
              let mMediaMime = m.mediaMime || null;
              let mMediaSize = m.mediaSize || null;

              // Check if already in conversation cache
              const cached = conv?.messages?.find((cm) => cm.id === mId);
              if (cached?.mediaUrl) {
                mMediaUrl = cached.mediaUrl;
                mMediaKey = cached.mediaKey || mMediaKey;
                mMediaName = cached.mediaName || mMediaName;
                mMediaMime = cached.mediaMime || mMediaMime;
                mMediaSize = cached.mediaSize || mMediaSize;
              }

              if (m.hasMedia) {
                mMediaUrl = `/api/whatsapp?endpoint=media&messageId=${encodeURIComponent(mId)}`;
              }

              const msgObj = {
                id: mId,
                body: m.body || (m.hasMedia ? (mMediaMime?.startsWith('image/') || m.type === 'image' ? '[Foto]' : '[Dokumen]') : ''),
                from: m.from,
                to: m.to,
                fromMe: !!m.fromMe,
                timestamp: m.timestamp ? (m.timestamp < 10000000000 ? m.timestamp * 1000 : m.timestamp) : Date.now(),
                type: m.type || (m.hasMedia ? (mMediaMime?.startsWith('image/') ? 'image' : 'document') : 'chat'),
                hasMedia: !!m.hasMedia,
                mediaUrl: mMediaUrl,
                mediaKey: mMediaKey,
                mediaName: mMediaName,
                mediaMime: mMediaMime,
                mediaSize: mMediaSize,
                ack: m.ack,
              };

              messagesList.push(msgObj);

              if (m.hasMedia && mMediaUrl) {
                persistMessageToPrisma(msgObj, chatId);
              }
            }
          }
        }
      } catch (err) {
        console.warn('[WA-SVC] fetchMessages warning:', err?.message || err);
      }

      // Merge with tracked conversation messages if any
      if (conv && conv.messages && conv.messages.length > 0) {
        messagesList = [...messagesList, ...conv.messages];
      }

      if (conv) {
        conv.unreadCount = 0;
      }
      if (client && state.status === 'READY') {
        client.sendSeen(chatId).catch(() => {});
      }
      const db = getPrisma();
      if (db) {
        prismaQueue = prismaQueue.then(async () => {
          try {
            await db.whatsAppChat.updateMany({
              where: { id: chatId },
              data: { unreadCount: 0 },
            });
          } catch (_) {}
        });
      }
      broadcastRealtime('CHAT_UPDATE', {
        chat: {
          id: chatId,
          unreadCount: 0,
        },
      });

      const finalMessages = deduplicateMessagesList(messagesList);

      if (conv) {
        conv.messages = finalMessages.slice(-100);
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, chatId, messages: finalMessages }));
      return;
    }

    if ((req.method === 'GET' || req.method === 'HEAD') && (pathname === '/api/media' || pathname === '/api/whatsapp/media')) {
      const msgId = url.searchParams.get('msgId') || url.searchParams.get('messageId');
      if (!msgId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Parameter msgId / messageId wajib diisi.' }));
        return;
      }

      if (state.status !== 'READY' || !client) {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'WhatsApp Gateway belum siap.' }));
        return;
      }

      try {
        const media = await getWhatsAppMedia(msgId);
        if (!media || !media.data) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Media WhatsApp tidak ditemukan atau gagal diunduh.' }));
          return;
        }

        const buffer = Buffer.from(media.data, 'base64');
        const mime = media.mimetype || 'application/octet-stream';
        const filename = media.filename || 'media';

        res.writeHead(200, {
          'Content-Type': mime,
          'Content-Length': buffer.length,
          'Cache-Control': 'public, max-age=86400, immutable',
          'Content-Disposition': `inline; filename="${encodeURIComponent(filename)}"`,
        });

        if (req.method === 'HEAD') {
          res.end();
        } else {
          res.end(buffer);
        }
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err?.message }));
      }
      return;
    }

    if (req.method === 'GET' && pathname === '/api/avatar') {
      const chatId = url.searchParams.get('chatId');
      const isDiag = url.searchParams.get('diag') === '1';

      if (!chatId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Parameter chatId wajib diisi' }));
        return;
      }

      if (
        chatId === '0@c.us' ||
        chatId.startsWith('0@') ||
        chatId === 'admin' ||
        chatId.includes('@broadcast') ||
        chatId === 'status@broadcast'
      ) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Avatar tidak tersedia' }));
        return;
      }

      if (state.status !== 'READY' || !client) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'WhatsApp client belum siap' }));
        return;
      }

      // Fast-path: Check in-memory avatar cache
      if (!isDiag) {
        const cached = avatarUrlCache.get(chatId);
        if (cached && cached.expiresAt > Date.now()) {
          if (cached.url) {
            res.writeHead(302, {
              Location: cached.url,
              'Cache-Control': 'public, max-age=86400',
            });
            res.end();
            return;
          } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Avatar tidak ditemukan (cached)' }));
            return;
          }
        }
      }

      try {
        let picUrl = null;

        const evalPromise = client.pupPage.evaluate(async (primaryId) => {
          const idsToTry = [primaryId];
          if (primaryId === '6282211331456@c.us') idsToTry.push('150336740303055@lid');
          if (primaryId === '150336740303055@lid') idsToTry.push('6282211331456@c.us');

          let lastDiag = {};

          for (const id of idsToTry) {
            const d = { id };
            try {
              const WidFactory = window.require('WAWebWidFactory');
              const wid = WidFactory ? WidFactory.createWid(id) : null;
              d.hasWid = !!wid;

              const ChatCol = window.require('WAWebCollections')?.Chat || window.Store?.Chat;
              let rawChat = ChatCol?.get(id) || (wid && ChatCol?.get ? ChatCol.get(wid) : null);
              if (!rawChat && ChatCol?.getModelsArray) {
                rawChat = ChatCol.getModelsArray().find((x) => x.id?._serialized === id || x.id?._serialized === wid?._serialized);
              }
              d.hasChat = !!rawChat;

              const ContactCol = window.require('WAWebCollections')?.Contact || window.Store?.Contact;
              let rawContact = ContactCol?.get(id) || (wid && ContactCol?.get ? ContactCol.get(wid) : null);
              if (!rawContact && ContactCol?.getModelsArray) {
                rawContact = ContactCol.getModelsArray().find((x) => x.id?._serialized === id || x.id?._serialized === wid?._serialized);
              }
              d.hasContact = !!rawContact;

              // 1. Direct memory check
              let eurl =
                rawChat?.contact?.profilePicThumb?.eurl ||
                rawChat?.profilePicThumb?.eurl ||
                rawContact?.profilePicThumb?.eurl ||
                null;

              let img =
                rawChat?.contact?.profilePicThumb?.img ||
                rawChat?.profilePicThumb?.img ||
                rawContact?.profilePicThumb?.img ||
                null;

              d.directMemory = { eurl: !!eurl, img: !!img };

              // 2. ProfilePicThumb Collection check
              try {
                const PPTCol = window.require('WAWebCollections')?.ProfilePicThumb;
                d.hasPPTCol = !!PPTCol;
                if (PPTCol) {
                  let ppt = PPTCol.get(id) || (wid ? PPTCol.get(wid) : null);
                  if (!ppt && wid && typeof PPTCol.find === 'function') {
                    ppt = await PPTCol.find(wid);
                  }
                  d.hasPPT = !!ppt;
                  if (ppt) {
                    if (ppt.eurl) eurl = eurl || ppt.eurl;
                    if (ppt.img) img = img || ppt.img;
                    d.pptUrls = { eurl: !!ppt.eurl, img: !!ppt.img };
                  }
                }
              } catch (ppte) {
                d.pptErr = ppte.message;
              }

              // 3. Try WAWebContactProfilePicThumbBridge with a 1200ms timeout
              if (!eurl && !img) {
                try {
                  const bridge = window.require('WAWebContactProfilePicThumbBridge');
                  d.hasBridge = !!bridge;
                  const target = rawChat || rawContact;
                  if (bridge && target) {
                    const bRes = await Promise.race([
                      bridge.requestProfilePicFromServer(target),
                      new Promise((resolve) => setTimeout(() => resolve(null), 1200)),
                    ]);
                    d.bridgeRes = bRes ? { status: bRes.status, eurl: !!bRes.eurl } : null;
                    if (bRes?.eurl) eurl = bRes.eurl;
                    if (bRes?.img) img = bRes.img;
                  }
                } catch (be) {
                  d.bridgeErr = be.message;
                }
              }

              if (eurl || img) {
                return { url: eurl || img, diag: d };
              }
              lastDiag = d;
            } catch (err) {
              lastDiag = { id, err: err?.message };
            }
          }

          return {
            url: null,
            diag: lastDiag,
          };
        }, chatId);

        const evalResult = await Promise.race([
          evalPromise,
          new Promise((resolve) => setTimeout(() => resolve({ url: null, diag: { timeout: true } }), 2500)),
        ]);

        if (isDiag) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(evalResult, null, 2));
          return;
        }

        picUrl = evalResult?.url || null;

        // Cache the lookup result in memory (30m for valid URLs, 2m for missing avatars)
        avatarUrlCache.set(chatId, {
          url: picUrl,
          expiresAt: Date.now() + (picUrl ? 30 * 60 * 1000 : 2 * 60 * 1000),
        });

        if (picUrl && typeof picUrl === 'string') {
          if (picUrl.startsWith('data:image/')) {
            const matches = picUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
            if (matches) {
              const mime = matches[1];
              const buf = Buffer.from(matches[2], 'base64');
              res.writeHead(200, {
                'Content-Type': mime,
                'Content-Length': buf.length,
                'Cache-Control': 'public, max-age=86400, immutable',
              });
              res.end(buf);
              return;
            }
          }

          res.writeHead(302, {
            Location: picUrl,
            'Cache-Control': 'public, max-age=86400',
          });
          res.end();
          return;
        }

        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Avatar tidak ditemukan', diag: evalResult?.diag }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err?.message }));
      }
      return;
    }

    if (req.method === 'POST' && pathname === '/api/send') {
      const body = await readJsonBody();
      const { to, chatId, message, mediaUrl, mediaBase64, mediaMime, mediaName, mediaKey, mediaSize, caption, type } = body;
      const target = chatId || to;

      if (!target || (!message && !mediaUrl && !mediaBase64)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Penerima (to/chatId) dan pesan atau media wajib diisi.' }));
        return;
      }

      if (state.status !== 'READY' || !client) {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            success: false,
            error: `WhatsApp belum siap (Status: ${state.status}). Pastikan QR Code sudah di-scan dan status READY.`,
          })
        );
        return;
      }

      let targetJid = target;
      if (target.endsWith('@g.us')) {
        targetJid = target;
      } else {
        const cleanDigits = target.replace(/@.*$/, '').replace(/\D/g, '');
        if (cleanDigits) {
          let formatted = cleanDigits;
          if (formatted.startsWith('0')) formatted = '62' + formatted.slice(1);
          else if (formatted.startsWith('8')) formatted = '62' + formatted;

          try {
            const numberId = await client.getNumberId(formatted);
            if (numberId?._serialized) {
              targetJid = numberId._serialized;
            } else {
              targetJid = `${formatted}@c.us`;
            }
          } catch (err) {
            console.warn('[WA-SVC] getNumberId warning:', err?.message);
            targetJid = `${formatted}@c.us`;
          }
        }

        // Handle Linked ID (LID) contacts where WhatsApp requires the LID JID
        if (target === '150336740303055@lid' || target.includes('6282211331456') || target.includes('082211331456')) {
          targetJid = '150336740303055@lid';
        }
      }

      try {
        let mediaToSend = null;
        let isDoc = type === 'document';

        if (mediaBase64 && mediaMime) {
          mediaToSend = new MessageMedia(mediaMime, mediaBase64, mediaName || (isDoc ? 'document.pdf' : 'image.jpg'));
        } else if (mediaUrl) {
          try {
            const fetchUrl = mediaUrl.startsWith('http') ? mediaUrl : `http://127.0.0.1:3000${mediaUrl}`;
            const mRes = await fetch(fetchUrl);
            const buf = await mRes.arrayBuffer();
            const b64 = Buffer.from(buf).toString('base64');
            const mime = mediaMime || mRes.headers.get('content-type') || 'application/octet-stream';
            if (!mediaMime?.startsWith('image/') && mime !== 'image/jpeg' && mime !== 'image/png' && mime !== 'image/webp') {
              isDoc = true;
            }
            mediaToSend = new MessageMedia(mime, b64, mediaName || (isDoc ? 'document.pdf' : 'image.jpg'));
          } catch (fetchErr) {
            console.warn('[WA-SVC] Buffer fetch error, fallback MessageMedia.fromUrl:', fetchErr?.message);
            const fallbackUrl = mediaUrl.startsWith('http') ? mediaUrl : `http://127.0.0.1:3000${mediaUrl}`;
            mediaToSend = await MessageMedia.fromUrl(fallbackUrl, { unsafeMime: true, filename: mediaName || 'file' });
          }
        }

        const textCaption = message || caption || '';
        let sent;
        if (mediaToSend) {
          sent = await client.sendMessage(targetJid, mediaToSend, {
            caption: textCaption || undefined,
            sendMediaAsDocument: isDoc,
          });
        } else {
          sent = await client.sendMessage(targetJid, message);
        }

        let finalMediaUrl = mediaUrl || null;
        let finalMediaKey = mediaKey || null;
        let finalMediaName = mediaName || null;
        let finalMediaMime = mediaToSend?.mimetype || mediaMime || null;
        let finalMediaSize = mediaSize || null;

        const sentId = extractMessageId(sent) || `msg-${Date.now()}`;

        if (mediaBase64) {
          mediaCache.set(sentId, {
            data: mediaBase64,
            mimetype: finalMediaMime,
            filename: finalMediaName || (isDoc ? 'document.bin' : 'image.jpg'),
          });
          finalMediaUrl = `/api/whatsapp?endpoint=media&messageId=${encodeURIComponent(sentId)}`;
        } else if (mediaToSend && !finalMediaUrl) {
          finalMediaUrl = `/api/whatsapp?endpoint=media&messageId=${encodeURIComponent(sentId)}`;
        }
        const sentMsg = {
          id: sentId,
          body: textCaption || '',
          from: client.info?.wid?._serialized,
          to: targetJid,
          fromMe: true,
          timestamp: Date.now(),
          type: mediaToSend ? (isDoc ? 'document' : 'image') : 'chat',
          hasMedia: !!mediaToSend,
          mediaUrl: finalMediaUrl,
          mediaKey: finalMediaKey,
          mediaName: finalMediaName,
          mediaMime: finalMediaMime,
          mediaSize: finalMediaSize,
          ack: 1,
        };

        await recordMessage(sentMsg);

        const log = addLog('OUTGOING', target, sentMsg.body, 'SENT', {
          msgId: sentId,
          formattedNumber: targetJid,
          hasMedia: sentMsg.hasMedia,
          mediaUrl: sentMsg.mediaUrl,
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            success: true,
            message: 'Pesan berhasil dikirim via WhatsApp Web!',
            sentMessage: sentMsg,
            log,
          })
        );
      } catch (sendErr) {
        const errMsg = sendErr?.message || 'Gagal mengirim pesan.';
        addLog('OUTGOING', target, `Gagal kirim: ${errMsg}`, 'FAILED');

        const isFrameDetached =
          errMsg.includes('detached Frame') ||
          errMsg.includes('Execution context was destroyed') ||
          errMsg.includes('Target closed') ||
          errMsg.includes('Session closed');

        if (isFrameDetached) {
          console.warn('[WA-SVC] Detached frame encountered, triggering client auto-recovery...');
          state.status = 'INITIALIZING';
          state.message = 'Sesi browser terputus sebentar, memulihkan koneksi secara otomatis...';
          broadcastStatus();
          setTimeout(() => {
            initClient().catch(console.error);
          }, 300);
        }

        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            success: false,
            error: isFrameDetached
              ? 'Sesi browser WhatsApp terputus sebentar (detached frame). Gateway sedang memulihkan koneksi otomatis. Silakan coba kirim ulang sesaat lagi.'
              : errMsg,
          })
        );
      }
      return;
    }

    if (req.method === 'POST' && pathname === '/api/restart') {
      initClient().catch(console.error);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'WhatsApp client sedang di-restart.' }));
      return;
    }

    if (req.method === 'POST' && pathname === '/api/logout') {
      if (client) {
        try {
          await client.logout();
        } catch (e) {
          console.warn('[WA-SVC] Logout error:', e?.message);
        }
        try {
          await client.destroy();
        } catch (e) {}
        client = null;
      }
      state.status = 'DISCONNECTED';
      state.info = null;
      state.qrDataUrl = null;
      addLog('SYSTEM', 'Logout', 'Sesi WhatsApp berhasil di-logout dan diputuskan.', 'SUCCESS');

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Sesi WhatsApp berhasil di-logout.' }));
      return;
    }

    if (req.method === 'POST' && pathname === '/api/clear-logs') {
      state.logs = [];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Log aktivitas berhasil dibersihkan.' }));
      return;
    }

    if (req.method === 'POST' && pathname === '/api/stop') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Service WhatsApp dihentikan.' }));
      setTimeout(async () => {
        if (client) {
          try {
            await client.destroy();
          } catch (e) {}
        }
        process.exit(0);
      }, 500);
      return;
    }

    if (req.method === 'POST' && pathname === '/api/mark-read') {
      const { chatId } = await readJsonBody();
      if (!chatId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'chatId wajib diisi.' }));
        return;
      }
      try {
        const conv = conversations.get(chatId);
        if (conv) conv.unreadCount = 0;
        if (client && state.status === 'READY') {
          client.sendSeen(chatId).catch(() => {});
        }
        const db = getPrisma();
        if (db) {
          prismaQueue = prismaQueue.then(async () => {
            try {
              await db.whatsAppChat.updateMany({
                where: { id: chatId },
                data: { unreadCount: 0 },
              });
            } catch (_) {}
          });
        }
        broadcastRealtime('CHAT_READ', { chatId });
        broadcastRealtime('CHAT_UPDATE', { chat: { id: chatId, unreadCount: 0 } });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Chat ditandai telah dibaca.' }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err?.message }));
      }
      return;
    }

    if (req.method === 'POST' && pathname === '/api/delete-chat') {
      const { chatId } = await readJsonBody();
      if (!chatId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'chatId wajib diisi.' }));
        return;
      }
      try {
        conversations.delete(chatId);
        if (client) {
          try {
            const chat = await client.getChatById(chatId);
            if (chat) await chat.delete();
          } catch (e) {
            console.warn('[WA-SVC] chat.delete warning:', e?.message);
          }
        }
        broadcastRealtime('CHAT_DELETED', { chatId });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Chat berhasil dihapus.' }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err?.message }));
      }
      return;
    }

    if (req.method === 'POST' && pathname === '/api/delete-message') {
      const { messageId, chatId, everyone } = await readJsonBody();
      if (!messageId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'messageId wajib diisi.' }));
        return;
      }
      try {
        if (chatId) {
          const conv = conversations.get(chatId);
          if (conv && conv.messages) {
            conv.messages = conv.messages.filter((m) => m.id !== messageId);
          }
        }
        if (client) {
          try {
            const chat = chatId ? await client.getChatById(chatId) : null;
            if (chat) {
              const msgs = await chat.fetchMessages({ limit: 40 });
              const targetMsg = msgs.find((m) => extractMessageId(m) === messageId || m.id?._serialized === messageId);
              if (targetMsg) {
                await targetMsg.delete(everyone !== false);
              }
            }
          } catch (e) {
            console.warn('[WA-SVC] message.delete warning:', e?.message);
          }
        }
        broadcastRealtime('MESSAGE_DELETED', { messageId, chatId });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Pesan berhasil dihapus.' }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err?.message }));
      }
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint tidak ditemukan' }));
  } catch (err) {
    console.error('[WA-SVC] Server Request Error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err?.message || 'Internal server error' }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`[WA-SVC] ATASILABS WhatsApp Gateway Service Aktif!`);
  console.log(`[WA-SVC] Port: ${PORT}`);
  console.log(`[WA-SVC] Health check: /health`);
  console.log(`=======================================================`);

  // Start client automatically upon service boot
  initClient().catch((err) => {
    console.error('[WA-SVC] Automatic init error:', err);
  });
});

// Graceful exit
process.on('SIGINT', async () => {
  console.log('\n[WA-SVC] Menerima sinyal SIGINT. Menutup WhatsApp Client...');
  if (client) {
    try {
      await client.destroy();
    } catch (e) {}
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n[WA-SVC] Menerima sinyal SIGTERM. Menutup WhatsApp Client...');
  if (client) {
    try {
      await client.destroy();
    } catch (e) {}
  }
  process.exit(0);
});
