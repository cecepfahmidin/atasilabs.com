import { prisma } from './prisma';

function getDb(): any {
  return prisma;
}

export interface WhatsAppMessageData {
  id: string;
  chatId: string;
  body: string;
  from?: string;
  to?: string;
  fromMe: boolean;
  timestamp: number;
  type?: string;
  hasMedia?: boolean;
  mediaUrl?: string | null;
  mediaKey?: string | null;
  mediaName?: string | null;
  mediaMime?: string | null;
  mediaSize?: number | null;
  ack?: number;
  chatName?: string;
  chatPhone?: string;
}

export async function saveMessageToDb(msg: WhatsAppMessageData) {
  try {
    let chatId = msg.chatId;
    if (!chatId || !msg.id) return null;
    if (chatId === 'status@broadcast' || chatId.endsWith('@broadcast')) return null;
    if (chatId === '150336740303055@lid') {
      chatId = '6282211331456@c.us';
    }

    const db = getDb();
    const timeNum = Number(msg.timestamp) || Date.now();
    const isGroup = chatId.endsWith('@g.us');
    let cleanName = msg.chatName;
    if (!cleanName || cleanName.toLowerCase() === 'admin') {
      cleanName = isGroup ? 'Grup WhatsApp' : (chatId === '6282211331456@c.us' ? 'Cecep Fahmidin (+6282211331456)' : chatId.replace(/@.*$/, ''));
    }
    const cleanPhone = msg.chatPhone || chatId.replace(/@.*$/, '');

    const resolvedMediaUrl =
      msg.mediaUrl &&
      !msg.mediaUrl.includes('pub-') &&
      !msg.mediaUrl.includes('r2.cloudflarestorage.com') &&
      !msg.mediaUrl.includes('/uploads/')
        ? msg.mediaUrl
        : msg.hasMedia
        ? `/api/whatsapp?endpoint=media&messageId=${encodeURIComponent(msg.id)}`
        : null;

    const lastMessageData = {
      id: msg.id,
      body: msg.body || (msg.hasMedia ? `[${msg.type === 'image' ? 'Foto' : 'Dokumen'}]` : ''),
      timestamp: timeNum,
      fromMe: Boolean(msg.fromMe),
      type: msg.type || 'chat',
      mediaUrl: resolvedMediaUrl,
      mediaName: msg.mediaName ?? null,
    };

    if (db.whatsAppChat && db.whatsAppMessage) {
      const shouldUpdateName = isGroup
        ? (cleanName && cleanName !== 'Grup WhatsApp' && cleanName.toLowerCase() !== 'admin' && !cleanName.includes('@'))
        : (cleanName && cleanName.toLowerCase() !== 'admin');

      await db.whatsAppChat.upsert({
        where: { id: chatId },
        create: {
          id: chatId,
          name: cleanName,
          phone: cleanPhone,
          isGroup: isGroup,
          timestamp: timeNum,
          unreadCount: msg.fromMe ? 0 : 1,
          lastMessage: lastMessageData,
        },
        update: {
          timestamp: timeNum,
          ...(shouldUpdateName ? { name: cleanName } : {}),
          lastMessage: lastMessageData,
          isGroup: isGroup,
        },
      });

      const saved = await db.whatsAppMessage.upsert({
        where: { id: msg.id },
        create: {
          id: msg.id,
          chatId: chatId,
          body: msg.body || '',
          from: msg.from || null,
          to: msg.to || null,
          fromMe: Boolean(msg.fromMe),
          timestamp: timeNum,
          type: msg.type || 'chat',
          hasMedia: Boolean(msg.hasMedia),
          mediaUrl: resolvedMediaUrl,
          mediaKey: msg.mediaKey || null,
          mediaName: msg.mediaName || null,
          mediaMime: msg.mediaMime || null,
          mediaSize: msg.mediaSize ? Math.round(Number(msg.mediaSize)) : null,
          ack: msg.ack || 1,
        },
        update: {
          body: msg.body || '',
          ack: msg.ack || 1,
          ...(resolvedMediaUrl ? { mediaUrl: resolvedMediaUrl } : {}),
          ...(msg.mediaKey ? { mediaKey: msg.mediaKey } : {}),
          ...(msg.mediaName ? { mediaName: msg.mediaName } : {}),
        },
      });

      return saved;
    }

    // Direct PostgreSQL Raw SQL fallback
    const lastMsgJson = JSON.stringify(lastMessageData);
    await db['$executeRawUnsafe'](
      `INSERT INTO "WhatsAppChat" ("id", "name", "phone", "isGroup", "unreadCount", "lastMessage", "timestamp", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, false, $4, $5::jsonb, $6, NOW(), NOW())
       ON CONFLICT ("id") DO UPDATE SET
         "name" = COALESCE(EXCLUDED."name", "WhatsAppChat"."name"),
         "timestamp" = EXCLUDED."timestamp",
         "lastMessage" = EXCLUDED."lastMessage",
         "updatedAt" = NOW()`,
      chatId,
      cleanName,
      cleanPhone,
      msg.fromMe ? 0 : 1,
      lastMsgJson,
      timeNum
    );

    await db['$executeRawUnsafe'](
      `INSERT INTO "WhatsAppMessage" ("id", "chatId", "body", "from", "to", "fromMe", "timestamp", "type", "hasMedia", "mediaUrl", "mediaKey", "mediaName", "mediaMime", "mediaSize", "ack", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
       ON CONFLICT ("id") DO UPDATE SET
         "body" = EXCLUDED."body",
         "ack" = EXCLUDED."ack",
         "mediaUrl" = COALESCE(EXCLUDED."mediaUrl", "WhatsAppMessage"."mediaUrl"),
         "mediaName" = COALESCE(EXCLUDED."mediaName", "WhatsAppMessage"."mediaName")`,
      msg.id,
      chatId,
      msg.body || '',
      msg.from || null,
      msg.to || null,
      Boolean(msg.fromMe),
      timeNum,
      msg.type || 'chat',
      Boolean(msg.hasMedia),
      msg.mediaUrl || null,
      msg.mediaKey || null,
      msg.mediaName || null,
      msg.mediaMime || null,
      msg.mediaSize ? Math.round(Number(msg.mediaSize)) : null,
      msg.ack || 1
    );

    return { id: msg.id, chatId, body: msg.body };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[WA-DB] saveMessageToDb warning:', message);
    return null;
  }
}

export async function getMessagesFromDb(chatId: string, limit = 100) {
  try {
    const db = getDb();
    const chatIds =
      chatId === '6282211331456@c.us' || chatId === '150336740303055@lid'
        ? ['6282211331456@c.us', '150336740303055@lid']
        : [chatId];

    if (db.whatsAppMessage) {
      return await db.whatsAppMessage.findMany({
        where: { chatId: { in: chatIds } },
        orderBy: { timestamp: 'asc' },
        take: limit,
      });
    }
    const rows = await db['$queryRawUnsafe'](
      `SELECT "id", "chatId", "body", "from", "to", "fromMe", "timestamp", "type", "hasMedia", "mediaUrl", "mediaKey", "mediaName", "mediaMime", "mediaSize", "ack", "createdAt"
       FROM "WhatsAppMessage"
       WHERE "chatId" = ANY($1)
       ORDER BY "timestamp" ASC
       LIMIT $2`,
      chatIds,
      limit
    );
    return rows || [];
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[WA-DB] getMessagesFromDb warning:', message);
    return [];
  }
}

export async function getChatsFromDb() {
  try {
    const db = getDb();
    if (db.whatsAppChat) {
      return await db.whatsAppChat.findMany({
        where: {
          id: {
            not: '150336740303055@lid',
            notIn: ['status@broadcast'],
          },
          NOT: {
            id: { contains: '@broadcast' },
          },
        },
        orderBy: { timestamp: 'desc' },
        take: 60,
      });
    }
    const rows = await db['$queryRawUnsafe'](
      `SELECT "id", "name", "phone", "isGroup", "unreadCount", "lastMessage", "timestamp", "createdAt", "updatedAt"
       FROM "WhatsAppChat"
       WHERE "id" != '150336740303055@lid' AND "id" NOT LIKE '%@broadcast%'
       ORDER BY "timestamp" DESC
       LIMIT 60`
    );
    return rows || [];
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[WA-DB] getChatsFromDb warning:', message);
    return [];
  }
}

export async function markChatReadInDb(chatId: string) {
  try {
    if (!chatId) return false;
    const db = getDb();
    if (db.whatsAppChat) {
      await db.whatsAppChat.updateMany({
        where: { id: chatId },
        data: { unreadCount: 0 },
      });
      return true;
    }
    await db['$executeRawUnsafe'](
      `UPDATE "WhatsAppChat" SET "unreadCount" = 0, "updatedAt" = NOW() WHERE "id" = $1`,
      chatId
    );
    return true;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[WA-DB] markChatReadInDb warning:', message);
    return false;
  }
}

export async function deleteChatFromDb(chatId: string) {
  try {
    const db = getDb();
    if (db.whatsAppChat && db.whatsAppMessage) {
      await db.whatsAppMessage.deleteMany({ where: { chatId } });
      await db.whatsAppChat.deleteMany({ where: { id: chatId } });
      return true;
    }
    await db['$executeRawUnsafe'](`DELETE FROM "WhatsAppMessage" WHERE "chatId" = $1`, chatId);
    await db['$executeRawUnsafe'](`DELETE FROM "WhatsAppChat" WHERE "id" = $1`, chatId);
    return true;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[WA-DB] deleteChatFromDb warning:', message);
    return false;
  }
}

export async function deleteMessageFromDb(messageId: string, chatId?: string) {
  try {
    const db = getDb();
    if (db.whatsAppMessage) {
      await db.whatsAppMessage.deleteMany({ where: { id: messageId } });
    } else {
      await db['$executeRawUnsafe'](`DELETE FROM "WhatsAppMessage" WHERE "id" = $1`, messageId);
    }

    if (chatId) {
      const remaining = await getMessagesFromDb(chatId, 50);
      const lastMsg = remaining.length > 0 ? remaining[remaining.length - 1] : null;
      const lastMsgData = lastMsg
        ? {
            id: lastMsg.id,
            body: lastMsg.body,
            timestamp: lastMsg.timestamp,
            fromMe: lastMsg.fromMe,
            type: lastMsg.type,
            mediaUrl: lastMsg.mediaUrl ?? null,
            mediaName: lastMsg.mediaName ?? null,
          }
        : null;

      if (db.whatsAppChat) {
        await db.whatsAppChat.updateMany({
          where: { id: chatId },
          data: { lastMessage: lastMsgData as any },
        });
      } else {
        await db['$executeRawUnsafe'](
          `UPDATE "WhatsAppChat" SET "lastMessage" = $1::jsonb WHERE "id" = $2`,
          lastMsgData ? JSON.stringify(lastMsgData) : null,
          chatId
        );
      }
    }
    return true;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[WA-DB] deleteMessageFromDb warning:', message);
    return false;
  }
}


