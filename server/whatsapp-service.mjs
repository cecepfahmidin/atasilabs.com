import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const require = createRequire(import.meta.url);

// Multi-path safe resolver for CloudLinux / Passenger symlinked node_modules
function safeRequire(packageName) {
  try {
    return require(packageName);
  } catch (e1) {
    try {
      return require(path.resolve(ROOT_DIR, 'node_modules', packageName));
    } catch (e2) {
      try {
        return require(path.resolve(ROOT_DIR, '..', 'nodevenv', 'wa.stieyasaanggana.ac.id', '20', 'lib', 'node_modules', packageName));
      } catch (e3) {
        throw new Error(
          `Package '${packageName}' tidak ditemukan. Pastikan sudah klik 'Run NPM Install' di cPanel Setup Node.js App. (Detail: ${e1.message})`
        );
      }
    }
  }
}

const dotenv = safeRequire('dotenv');
dotenv.config({ path: path.resolve(ROOT_DIR, '.env') });

const baileys = safeRequire('@whiskeysockets/baileys');
const makeWASocket = baileys.default || baileys.makeWASocket;
const {
  DisconnectReason,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  downloadMediaMessage,
  jidNormalizedUser,
  Browsers,
} = baileys;

const pino = safeRequire('pino');
const QRCode = safeRequire('qrcode');
const { createClient } = safeRequire('@supabase/supabase-js');
const WebSocket = safeRequire('ws');

let PrismaClient = null;
try {
  PrismaClient = safeRequire('@prisma/client').PrismaClient;
} catch (_) {}

const PORT = process.env.PORT || process.env.WA_SERVICE_PORT || 5001;

// Database Client (lazy & fail-safe)
let prisma = null;
function getPrisma() {
  if (prisma) return prisma;
  try {
    if (PrismaClient) {
      prisma = new PrismaClient();
    }
  } catch (e) {
    console.warn('[WA-SVC] PrismaClient not initialized yet:', e?.message || e);
  }
  return prisma;
}
getPrisma();

// JID Helpers (Bridge between Baileys protocol and DB/Frontend formats)
function toChatId(jid) {
  if (!jid) return '';
  let clean = jid.trim();
  // Strip device suffixes like 62822xxx:1@s.whatsapp.net -> 62822xxx@s.whatsapp.net
  if (clean.includes(':') && clean.includes('@')) {
    clean = clean.replace(/:.*@/, '@');
  }
  if (clean === '150336740303055@lid') {
    return '6282211331456@c.us';
  }
  if (clean.endsWith('@s.whatsapp.net')) {
    return clean.replace('@s.whatsapp.net', '@c.us');
  }
  return clean;
}

function toBaileysJid(chatId) {
  if (!chatId) return '';
  let clean = chatId.trim();
  if (clean === '150336740303055@lid' || clean.includes('6282211331456') || clean.includes('082211331456')) {
    return '6282211331456@s.whatsapp.net';
  }
  if (clean.endsWith('@c.us')) {
    return clean.replace('@c.us', '@s.whatsapp.net');
  }
  if (clean.endsWith('@g.us') || clean.endsWith('@s.whatsapp.net')) {
    return clean;
  }
  // Pure phone number
  let digits = clean.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = '62' + digits.slice(1);
  else if (digits.startsWith('8')) digits = '62' + digits;
  return `${digits}@s.whatsapp.net`;
}

// In-memory caches
const mediaCache = new Map(); // msgId -> { data, mimetype, filename, buffer }
const rawMessagesMap = new Map(); // msgId -> raw WAMessage
const avatarUrlCache = new Map(); // chatId -> { url, expiresAt }
const contactsMap = new Map(); // jid -> { id, name, notify }
const groupMetadataCache = new Map(); // jid -> { subject, ... }
const conversations = new Map(); // chatId -> conversation object

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
      realtime: { transport: WebSocket },
    });
    realtimeChannel = supabase.channel('whatsapp_gateway', {
      config: { broadcast: { ack: false, self: false } },
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

  // 2. Webhook HTTP POST to Next.js webhook endpoint (event-driven)
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

// Media extraction from Baileys message content
function extractMediaInfo(message) {
  if (!message) return { type: 'chat', hasMedia: false };

  const docWithCap = message.documentWithCaptionMessage?.message?.documentMessage;
  if (docWithCap) {
    return {
      type: 'document',
      hasMedia: true,
      mime: docWithCap.mimetype || 'application/pdf',
      filename: docWithCap.fileName || 'document.pdf',
      size: docWithCap.fileLength ? Number(docWithCap.fileLength) : null,
      caption: docWithCap.caption || '',
    };
  }

  if (message.imageMessage) {
    return {
      type: 'image',
      hasMedia: true,
      mime: message.imageMessage.mimetype || 'image/jpeg',
      filename: 'image.jpg',
      size: message.imageMessage.fileLength ? Number(message.imageMessage.fileLength) : null,
      caption: message.imageMessage.caption || '',
    };
  }

  if (message.documentMessage) {
    return {
      type: 'document',
      hasMedia: true,
      mime: message.documentMessage.mimetype || 'application/pdf',
      filename: message.documentMessage.fileName || 'document.pdf',
      size: message.documentMessage.fileLength ? Number(message.documentMessage.fileLength) : null,
      caption: message.documentMessage.caption || '',
    };
  }

  if (message.videoMessage) {
    return {
      type: 'video',
      hasMedia: true,
      mime: message.videoMessage.mimetype || 'video/mp4',
      filename: 'video.mp4',
      size: message.videoMessage.fileLength ? Number(message.videoMessage.fileLength) : null,
      caption: message.videoMessage.caption || '',
    };
  }

  if (message.audioMessage) {
    return {
      type: 'audio',
      hasMedia: true,
      mime: message.audioMessage.mimetype || 'audio/mp4',
      filename: 'audio.mp3',
      size: message.audioMessage.fileLength ? Number(message.audioMessage.fileLength) : null,
      caption: '',
    };
  }

  return { type: 'chat', hasMedia: false, caption: '' };
}

function extractMessageBody(m) {
  if (!m) return '';
  if (typeof m === 'string') return m;
  const message = m.message || m;
  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    message.videoMessage?.caption ||
    message.documentMessage?.caption ||
    message.documentWithCaptionMessage?.message?.documentMessage?.caption ||
    message.buttonsResponseMessage?.selectedDisplayText ||
    message.listResponseMessage?.title ||
    message.templateButtonReplyMessage?.selectedId ||
    ''
  );
}

// Download media buffer and cache in memory
async function getWhatsAppMedia(msgId) {
  if (!msgId) return null;
  if (mediaCache.has(msgId)) {
    return mediaCache.get(msgId);
  }

  const rawMsg = rawMessagesMap.get(msgId);
  if (!rawMsg || !rawMsg.message) return null;

  try {
    const buffer = await downloadMediaMessage(
      rawMsg,
      'buffer',
      {},
      {
        logger: pino({ level: 'silent' }),
        reuploadRequest: sock?.updateMediaMessage,
      }
    );

    if (!buffer) return null;

    const mediaInfo = extractMediaInfo(rawMsg.message);
    const mediaObj = {
      data: buffer.toString('base64'),
      mimetype: mediaInfo.mime || 'application/octet-stream',
      filename: mediaInfo.filename || 'media',
      buffer,
    };
    mediaCache.set(msgId, mediaObj);
    return mediaObj;
  } catch (err) {
    console.warn(`[WA-SVC] Error downloading media for ${msgId}:`, err?.message);
    return null;
  }
}

function deduplicateMessagesList(messages) {
  if (!Array.isArray(messages)) return [];
  const result = [];
  const seenIds = new Set();

  for (const m of messages) {
    if (!m) continue;
    const mId = m.id;
    if (mId && seenIds.has(mId)) continue;

    const normBody = (m.body || '').trim();
    const isFromMe = !!m.fromMe;
    const timeMs = Number(m.timestamp) || 0;
    const isMedia = Boolean(m.hasMedia || m.type === 'image' || m.type === 'document' || m.mediaUrl);

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

// ── DB PERSISTENCE DISABLED ──────────────────────────────────────────────────
// Chat/message data hanya disimpan di memori (conversations Map).
// Tidak ada penulisan ke tabel WhatsAppChat / WhatsAppMessage di Supabase.
// DB hanya digunakan untuk backup/restore session Baileys (Heroku ephemeral FS).
// ─────────────────────────────────────────────────────────────────────────────

function persistMessageToPrisma(_msgObj, _chatId, _senderName, _isGroup = false) {
  // NO-OP: Penyimpanan chat ke DB dinonaktifkan. Data hanya di memori.
}

function syncChatsWithDatabase(_chatsList) {
  // NO-OP: Sinkronisasi chat ke DB dinonaktifkan.
}

async function loadChatsFromDatabase() {
  // NO-OP: Load awal dari DB dinonaktifkan; mulai dengan memori kosong.
  console.log('[WA-SVC] DB persistence disabled — starting with empty in-memory store.');
}

// Cloud / Heroku ephemeral filesystem persistence: Backup & Restore session from DB
async function restoreSessionFromDb(authPath) {
  const db = getPrisma();
  if (!db) return;
  try {
    const sessionDoc = await db.customDocument.findUnique({
      where: { projectId: 'baileys_session_backup' },
    });
    if (sessionDoc?.data && typeof sessionDoc.data === 'object') {
      if (!fs.existsSync(authPath)) {
        fs.mkdirSync(authPath, { recursive: true });
      }
      for (const [filename, content] of Object.entries(sessionDoc.data)) {
        const filePath = path.join(authPath, filename);
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, String(content), 'utf8');
        }
      }
      console.log('[WA-SVC] 🔄 Restored Baileys session files from database backup.');
    }
  } catch (err) {
    console.warn('[WA-SVC] restoreSessionFromDb warning:', err?.message);
  }
}

let backupDebounceTimer = null;
function backupSessionToDb(authPath) {
  if (backupDebounceTimer) clearTimeout(backupDebounceTimer);
  backupDebounceTimer = setTimeout(async () => {
    const db = getPrisma();
    if (!db) return;
    try {
      if (!fs.existsSync(authPath)) return;
      const files = fs.readdirSync(authPath);
      const sessionData = {};
      for (const f of files) {
        if (f.endsWith('.json')) {
          const content = fs.readFileSync(path.join(authPath, f), 'utf8');
          sessionData[f] = content;
        }
      }
      if (Object.keys(sessionData).length > 0) {
        await db.customDocument.upsert({
          where: { projectId: 'baileys_session_backup' },
          create: {
            projectId: 'baileys_session_backup',
            data: sessionData,
          },
          update: {
            data: sessionData,
          },
        });
        console.log(`[WA-SVC] 💾 Backed up ${Object.keys(sessionData).length} session files to database.`);
      }
    } catch (err) {
      console.warn('[WA-SVC] backupSessionToDb warning:', err?.message);
    }
  }, 4000);
}

async function recordMessage(msg) {
  try {
    if (!msg) return;
    const fromMe = Boolean(msg.fromMe);
    let chatId = fromMe ? (msg.to || msg.chatId) : (msg.from || msg.chatId);
    if (!chatId) return;

    chatId = toChatId(chatId);
    if (chatId === 'status@broadcast' || chatId.endsWith('@broadcast') || msg.broadcast) {
      return;
    }

    const isGroup = chatId.endsWith('@g.us');
    let chatName = null;
    const existingConv = conversations.get(chatId);

    if (isGroup) {
      // 1. Group Subject from group metadata cache or Baileys query
      const cachedMeta = groupMetadataCache.get(toBaileysJid(chatId));
      if (cachedMeta?.subject) {
        chatName = cachedMeta.subject;
      } else if (sock && state.status === 'READY') {
        try {
          const meta = await sock.groupMetadata(toBaileysJid(chatId));
          if (meta?.subject) {
            groupMetadataCache.set(toBaileysJid(chatId), meta);
            chatName = meta.subject;
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
      // 1-on-1 chat
      if (chatId === '6282211331456@c.us') {
        chatName = 'Cecep Fahmidin (+6282211331456)';
      } else if (fromMe) {
        chatName = existingConv?.name && existingConv.name !== 'Admin' ? existingConv.name : chatId.replace(/@.*$/, '');
      } else {
        const contactJid = toBaileysJid(chatId);
        const contact = contactsMap.get(contactJid);
        chatName =
          msg.pushName ||
          contact?.name ||
          contact?.notify ||
          (existingConv?.name && existingConv.name !== 'Admin' ? existingConv.name : chatId.replace(/@.*$/, ''));
      }
    }

    const author = msg.author || (isGroup && !fromMe ? toChatId(msg.participant || msg.from) : null);
    const authorName = msg.pushName || (author ? author.replace(/@.*$/, '') : null);

    const rawTime = msg.timestamp;
    const timestamp = rawTime ? (rawTime < 10000000000 ? rawTime * 1000 : rawTime) : Date.now();
    const resolvedId = msg.id || `msg-${timestamp}-${Math.random().toString(36).substring(2, 6)}`;

    let mediaUrl = msg.mediaUrl || null;
    let mediaKey = msg.mediaKey || null;
    let mediaName = msg.mediaName || null;
    let mediaMime = msg.mediaMime || null;
    let mediaSize = msg.mediaSize || null;
    const hasMedia = Boolean(msg.hasMedia);

    if (hasMedia) {
      if (!mediaUrl || mediaUrl.includes('pub-') || mediaUrl.includes('r2.cloudflarestorage.com') || mediaUrl.includes('/uploads/')) {
        mediaUrl = `/api/whatsapp?endpoint=media&messageId=${encodeURIComponent(resolvedId)}`;
      }
      mediaName = msg.mediaName || (msg.type === 'image' ? `photo_${resolvedId}.jpg` : 'document');
      mediaMime = msg.mediaMime || (msg.type === 'image' ? 'image/jpeg' : 'application/octet-stream');

      // Pre-warm in-memory media cache asynchronously
      if (!mediaCache.has(resolvedId)) {
        getWhatsAppMedia(resolvedId).catch(() => {});
      }
    }

    const myWid = state.info?.wid || (sock?.user?.id ? toChatId(sock.user.id) : 'admin');

    const messageObj = {
      id: resolvedId,
      body: msg.body || (hasMedia ? (mediaMime?.startsWith('image/') || msg.type === 'image' ? '[Foto]' : '[Dokumen]') : ''),
      from: msg.from ? toChatId(msg.from) : (fromMe ? myWid : chatId),
      to: msg.to ? toChatId(msg.to) : (fromMe ? chatId : myWid),
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
        old.id = messageObj.id;
        // DB persistence disabled — no DB cleanup needed for temp IDs
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
  } catch (e) {
    console.error('[WA-SVC] recordMessage error:', e);
  }
}

// Client State
let sock = null;
let isInitializing = false;
let keepAliveTimer = null;

function startKeepAlive() {
  if (keepAliveTimer) clearInterval(keepAliveTimer);
  keepAliveTimer = setInterval(async () => {
    if (state.status === 'READY' && sock) {
      try {
        if (sock.ws && typeof sock.ws.ping === 'function') {
          sock.ws.ping();
        }
      } catch (_) {}
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
  addLog('SYSTEM', 'Gateway', 'Memulai inisialisasi Baileys WhatsApp client...');

  if (sock) {
    try {
      sock.ev.removeAllListeners();
      sock.end();
    } catch (e) {
      console.warn('[WA-SVC] Warning closing previous socket:', e?.message);
    }
    sock = null;
  }

  try {
    const authPath = path.resolve(ROOT_DIR, '.baileys_auth');
    if (!fs.existsSync(authPath)) {
      fs.mkdirSync(authPath, { recursive: true });
    }

    // Auto-restore session from database backup if dyno was restarted
    await restoreSessionFromDb(authPath);

    const { state: authState, saveCreds } = await useMultiFileAuthState(authPath);
    const logger = pino({ level: 'silent' });

    sock = makeWASocket({
      auth: {
        creds: authState.creds,
        keys: makeCacheableSignalKeyStore(authState.keys, logger),
      },
      logger,
      printQRInTerminal: false,
      browser: Browsers.ubuntu('Chrome'),
      markOnlineOnConnect: true,
      syncFullHistory: false,
      generateHighQualityLinkPreview: true,
      getMessage: async (key) => {
        const raw = rawMessagesMap.get(key.id);
        if (raw?.message) return raw.message;
        return undefined;
      },
    });

    sock.ev.on('creds.update', async () => {
      await saveCreds();
      backupSessionToDb(authPath);
    });

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        state.status = 'QR_READY';
        state.qrString = qr;
        try {
          state.qrDataUrl = await QRCode.toDataURL(qr, {
            width: 320,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' },
          });
          addLog('SYSTEM', 'QR_SCAN', 'QR Code baru berhasil digenerate. Menunggu scan dari admin.');
          broadcastStatus();
        } catch (err) {
          console.error('[WA-SVC] Error generating QR data URL:', err);
        }
      }

      if (connection === 'connecting') {
        if (state.status !== 'QR_READY') {
          state.status = 'AUTHENTICATING';
          broadcastStatus();
        }
      } else if (connection === 'open') {
        state.status = 'READY';
        state.qrString = null;
        state.qrDataUrl = null;
        state.error = null;

        const rawUser = sock.user?.id || '';
        const phone = rawUser ? jidNormalizedUser(rawUser).replace(/@.*$/, '') : '';
        const pushname = sock.user?.name || 'Admin';
        const wid = phone ? `${phone}@c.us` : rawUser;

        state.info = {
          wid,
          phone,
          pushname,
          platform: 'Baileys Socket',
          connectedAt: new Date().toISOString(),
        };

        addLog('SYSTEM', 'Ready', `WhatsApp Gateway siap digunakan! Terhubung sebagai ${pushname} (${phone})`, 'SUCCESS');
        startKeepAlive();
        broadcastStatus();
      } else if (connection === 'close') {
        stopKeepAlive();
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const isLoggedOut = statusCode === DisconnectReason.loggedOut;

        state.status = 'DISCONNECTED';
        state.info = null;
        state.qrString = null;
        state.qrDataUrl = null;
        addLog(
          'SYSTEM',
          'Disconnect',
          `Sesi WhatsApp terputus: ${lastDisconnect?.error?.message || statusCode || 'Closed'}`,
          isLoggedOut ? 'FAILED' : 'WARNING'
        );
        broadcastStatus();

        if (isLoggedOut) {
          console.log('[WA-SVC] Device logged out. Clearing Baileys session...');
          try {
            fs.rmSync(authPath, { recursive: true, force: true });
          } catch (_) {}
        } else {
          console.log('[WA-SVC] Reconnecting in 3 seconds...');
          setTimeout(() => {
            initClient().catch(console.error);
          }, 3000);
        }
      }
    });

    sock.ev.on('contacts.upsert', (contacts) => {
      if (Array.isArray(contacts)) {
        for (const c of contacts) {
          if (c.id) {
            contactsMap.set(c.id, {
              id: c.id,
              name: c.name || c.verifiedName || null,
              notify: c.notify || null,
            });
          }
        }
      }
    });

    sock.ev.on('contacts.update', (updates) => {
      if (Array.isArray(updates)) {
        for (const u of updates) {
          if (u.id) {
            const existing = contactsMap.get(u.id) || { id: u.id };
            contactsMap.set(u.id, {
              ...existing,
              name: u.name || u.verifiedName || existing.name,
              notify: u.notify || existing.notify,
            });
          }
        }
      }
    });

    sock.ev.on('groups.update', (updates) => {
      if (Array.isArray(updates)) {
        for (const u of updates) {
          if (u.id) {
            const existing = groupMetadataCache.get(u.id) || {};
            groupMetadataCache.set(u.id, { ...existing, ...u });
          }
        }
      }
    });

    sock.ev.on('messaging-history.set', async ({ chats, contacts, messages }) => {
      if (Array.isArray(contacts)) {
        for (const c of contacts) {
          if (c.id) {
            contactsMap.set(c.id, {
              id: c.id,
              name: c.name || c.verifiedName || null,
              notify: c.notify || null,
            });
          }
        }
      }
      if (Array.isArray(messages)) {
        for (const m of messages) {
          if (m?.key?.id) {
            rawMessagesMap.set(m.key.id, m);
          }
        }
      }
      console.log(`[WA-SVC] History sync: received ${chats?.length || 0} chats, ${messages?.length || 0} messages.`);
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      try {
        if (!Array.isArray(messages)) return;
        for (const m of messages) {
          if (!m || !m.key) continue;
          const remoteJid = m.key.remoteJid;
          if (!remoteJid || remoteJid === 'status@broadcast' || remoteJid.endsWith('@broadcast')) continue;

          const msgId = m.key.id;
          if (msgId) {
            rawMessagesMap.set(msgId, m);
            if (rawMessagesMap.size > 1000) {
              const firstKey = rawMessagesMap.keys().next().value;
              rawMessagesMap.delete(firstKey);
            }
          }

          const fromMe = Boolean(m.key.fromMe);
          const bodyText = extractMessageBody(m);
          const mediaInfo = extractMediaInfo(m.message);

          const myWid = state.info?.wid || (sock?.user?.id ? toChatId(sock.user.id) : 'admin');
          const chatId = toChatId(remoteJid);

          const formattedMsg = {
            id: msgId,
            body: bodyText,
            from: fromMe ? myWid : chatId,
            to: fromMe ? chatId : myWid,
            chatId,
            fromMe,
            timestamp: m.messageTimestamp ? Number(m.messageTimestamp) * 1000 : Date.now(),
            type: mediaInfo.type,
            hasMedia: mediaInfo.hasMedia,
            mediaMime: mediaInfo.mime,
            mediaName: mediaInfo.filename,
            mediaSize: mediaInfo.size,
            caption: mediaInfo.caption,
            pushName: m.pushName,
            participant: m.key.participant,
            ack: fromMe ? 1 : undefined,
          };

          if (!fromMe) {
            addLog('INCOMING', m.pushName || chatId, bodyText || `[${mediaInfo.type}]`, 'RECEIVED', {
              fromNumber: chatId,
              msgId,
            });
          }

          await recordMessage(formattedMsg);
        }
      } catch (err) {
        console.error('[WA-SVC] Error in messages.upsert handler:', err);
      }
    });

    sock.ev.on('messages.update', async (updates) => {
      try {
        if (!Array.isArray(updates)) return;
        for (const { key, update } of updates) {
          if (!key || !key.id) continue;
          const msgId = key.id;
          const chatId = toChatId(key.remoteJid);
          const conv = conversations.get(chatId);
          if (conv && conv.messages) {
            const target = conv.messages.find((m) => m.id === msgId);
            if (target && update.status) {
              target.ack = update.status;
              broadcastRealtime('MESSAGE_UPDATE', { chatId, message: target });
            }
          }
        }
      } catch (err) {
        console.warn('[WA-SVC] Error in messages.update handler:', err?.message);
      }
    });
  } catch (err) {
    state.status = 'ERROR';
    state.error = err?.message || 'Gagal menginisialisasi Baileys WhatsApp Client';
    addLog('SYSTEM', 'Error', `Inisialisasi error: ${state.error}`, 'FAILED');
    broadcastStatus();
  } finally {
    isInitializing = false;
  }
}

// HTTP Request Handler
export async function handleRequest(req, res) {
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
          engine: 'Baileys',
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
      // Return chats tracked in memory (and load database chats)
      const chatsList = Array.from(conversations.values())
        .filter((c) => c.id && !c.id.includes('@broadcast') && c.id !== '150336740303055@lid')
        .map((c) => ({
          id: c.id,
          name: c.name,
          unreadCount: c.unreadCount || 0,
          timestamp: c.timestamp || Date.now(),
          isGroup: Boolean(c.isGroup),
          avatarUrl: c.avatarUrl || `/api/whatsapp?endpoint=avatar&chatId=${encodeURIComponent(c.id)}`,
          lastMessage: c.lastMessage || null,
        }))
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      syncChatsWithDatabase(chatsList);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, chats: chatsList }));
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

      const cleanChatId = toChatId(chatId);
      const conv = conversations.get(cleanChatId);
      let messagesList = conv?.messages ? [...conv.messages] : [];

      // DB persistence disabled — only use in-memory messages

      if (conv) {
        conv.unreadCount = 0;
      }
      broadcastRealtime('CHAT_UPDATE', { chat: { id: cleanChatId, unreadCount: 0 } });

      const finalMessages = deduplicateMessagesList(messagesList);
      if (conv) {
        conv.messages = finalMessages.slice(-100);
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, chatId: cleanChatId, messages: finalMessages }));
      return;
    }

    if ((req.method === 'GET' || req.method === 'HEAD') && (pathname === '/api/media' || pathname === '/api/whatsapp/media')) {
      const msgId = url.searchParams.get('msgId') || url.searchParams.get('messageId');
      if (!msgId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Parameter msgId / messageId wajib diisi.' }));
        return;
      }

      try {
        const media = await getWhatsAppMedia(msgId);
        if (!media || !media.buffer) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Media WhatsApp tidak ditemukan atau gagal diunduh.' }));
          return;
        }

        const buffer = media.buffer;
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
      if (
        !chatId ||
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

      if (state.status !== 'READY' || !sock) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'WhatsApp client belum siap' }));
        return;
      }

      const cached = avatarUrlCache.get(chatId);
      if (cached && cached.expiresAt > Date.now()) {
        if (cached.url) {
          res.writeHead(302, { Location: cached.url, 'Cache-Control': 'public, max-age=86400' });
          res.end();
          return;
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Avatar tidak ditemukan (cached)' }));
          return;
        }
      }

      try {
        const targetJid = toBaileysJid(chatId);
        const picUrl = await sock.profilePictureUrl(targetJid, 'image').catch(() => null);

        avatarUrlCache.set(chatId, {
          url: picUrl,
          expiresAt: Date.now() + (picUrl ? 30 * 60 * 1000 : 2 * 60 * 1000),
        });

        if (picUrl) {
          res.writeHead(302, { Location: picUrl, 'Cache-Control': 'public, max-age=86400' });
          res.end();
          return;
        }

        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Avatar tidak ditemukan' }));
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

      if (state.status !== 'READY' || !sock) {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            success: false,
            error: `WhatsApp belum siap (Status: ${state.status}). Pastikan QR Code sudah di-scan dan status READY.`,
          })
        );
        return;
      }

      const targetBaileysJid = toBaileysJid(target);
      const targetStandardChatId = toChatId(target);

      try {
        let mediaBuffer = null;
        let isDoc = type === 'document';

        if (mediaBase64) {
          mediaBuffer = Buffer.from(mediaBase64, 'base64');
        } else if (mediaUrl) {
          try {
            const fetchUrl = mediaUrl.startsWith('http') ? mediaUrl : `http://127.0.0.1:3000${mediaUrl}`;
            const mRes = await fetch(fetchUrl);
            const arrayBuf = await mRes.arrayBuffer();
            mediaBuffer = Buffer.from(arrayBuf);
            const mime = mediaMime || mRes.headers.get('content-type') || 'application/octet-stream';
            if (!mediaMime?.startsWith('image/') && mime !== 'image/jpeg' && mime !== 'image/png' && mime !== 'image/webp') {
              isDoc = true;
            }
          } catch (e) {
            console.warn('[WA-SVC] Buffer fetch error:', e?.message);
          }
        }

        const textCaption = message || caption || '';
        let sent = null;

        if (mediaBuffer) {
          if (isDoc) {
            sent = await sock.sendMessage(targetBaileysJid, {
              document: mediaBuffer,
              mimetype: mediaMime || 'application/pdf',
              fileName: mediaName || 'document.pdf',
              caption: textCaption || undefined,
            });
          } else if (mediaMime?.startsWith('video/')) {
            sent = await sock.sendMessage(targetBaileysJid, {
              video: mediaBuffer,
              mimetype: mediaMime || 'video/mp4',
              caption: textCaption || undefined,
            });
          } else if (mediaMime?.startsWith('audio/')) {
            sent = await sock.sendMessage(targetBaileysJid, {
              audio: mediaBuffer,
              mimetype: mediaMime || 'audio/mp4',
              ptt: false,
            });
          } else {
            sent = await sock.sendMessage(targetBaileysJid, {
              image: mediaBuffer,
              mimetype: mediaMime || 'image/jpeg',
              caption: textCaption || undefined,
            });
          }
        } else {
          sent = await sock.sendMessage(targetBaileysJid, { text: textCaption });
        }

        const sentId = sent?.key?.id || `msg-${Date.now()}`;
        if (sent) {
          rawMessagesMap.set(sentId, sent);
        }

        let finalMediaUrl = mediaUrl || null;
        let finalMediaKey = mediaKey || null;
        let finalMediaName = mediaName || null;
        let finalMediaMime = mediaMime || null;
        let finalMediaSize = mediaSize || (mediaBuffer ? mediaBuffer.length : null);

        if (mediaBuffer) {
          mediaCache.set(sentId, {
            data: mediaBuffer.toString('base64'),
            mimetype: finalMediaMime || 'application/octet-stream',
            filename: finalMediaName || (isDoc ? 'document.bin' : 'image.jpg'),
            buffer: mediaBuffer,
          });
          finalMediaUrl = `/api/whatsapp?endpoint=media&messageId=${encodeURIComponent(sentId)}`;
        }

        const myWid = state.info?.wid || (sock.user?.id ? toChatId(sock.user.id) : 'admin');

        const sentMsg = {
          id: sentId,
          body: textCaption || '',
          from: myWid,
          to: targetStandardChatId,
          chatId: targetStandardChatId,
          fromMe: true,
          timestamp: Date.now(),
          type: mediaBuffer ? (isDoc ? 'document' : 'image') : 'chat',
          hasMedia: Boolean(mediaBuffer),
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
          formattedNumber: targetStandardChatId,
          hasMedia: sentMsg.hasMedia,
          mediaUrl: sentMsg.mediaUrl,
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            success: true,
            message: 'Pesan berhasil dikirim via WhatsApp!',
            sentMessage: sentMsg,
            log,
          })
        );
      } catch (sendErr) {
        const errMsg = sendErr?.message || 'Gagal mengirim pesan.';
        addLog('OUTGOING', target, `Gagal kirim: ${errMsg}`, 'FAILED');
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: errMsg }));
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
      if (sock) {
        try {
          await sock.logout();
        } catch (e) {
          console.warn('[WA-SVC] Logout error:', e?.message);
        }
        try {
          sock.end();
        } catch (_) {}
        sock = null;
      }
      const authPath = path.resolve(ROOT_DIR, '.baileys_auth');
      try {
        fs.rmSync(authPath, { recursive: true, force: true });
      } catch (_) {}

      // Delete database backup on explicit logout
      const db = getPrisma();
      if (db) {
        db.customDocument.deleteMany({ where: { projectId: 'baileys_session_backup' } }).catch(() => {});
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
        if (sock) {
          try {
            sock.end();
          } catch (_) {}
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
      const cleanChatId = toChatId(chatId);
      try {
        const conv = conversations.get(cleanChatId);
        if (conv) conv.unreadCount = 0;
        if (sock && state.status === 'READY') {
          sock.readMessages([{ remoteJid: toBaileysJid(cleanChatId), fromMe: false }]).catch(() => {});
        }
        // DB persistence disabled — only update in-memory unreadCount
        broadcastRealtime('CHAT_READ', { chatId: cleanChatId });
        broadcastRealtime('CHAT_UPDATE', { chat: { id: cleanChatId, unreadCount: 0 } });
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
      const cleanChatId = toChatId(chatId);
      try {
        conversations.delete(cleanChatId);
        // DB persistence disabled — only delete from in-memory store
        broadcastRealtime('CHAT_DELETED', { chatId: cleanChatId });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Chat berhasil dihapus.' }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err?.message }));
      }
      return;
    }

    if (req.method === 'POST' && pathname === '/api/delete-message') {
      const { messageId, chatId } = await readJsonBody();
      if (!messageId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'messageId wajib diisi.' }));
        return;
      }
      const cleanChatId = chatId ? toChatId(chatId) : null;
      try {
        if (cleanChatId) {
          const conv = conversations.get(cleanChatId);
          if (conv && conv.messages) {
            conv.messages = conv.messages.filter((m) => m.id !== messageId);
          }
        }
        if (sock && cleanChatId) {
          try {
            await sock.sendMessage(toBaileysJid(cleanChatId), {
              delete: {
                remoteJid: toBaileysJid(cleanChatId),
                fromMe: true,
                id: messageId,
              },
            });
          } catch (_) {}
        }
        // DB persistence disabled — only delete from in-memory store
        broadcastRealtime('MESSAGE_DELETED', { messageId, chatId: cleanChatId });
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
}

const server = http.createServer(handleRequest);

if (process.env.PASSENGER_WRAPPER !== '1') {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`[WA-SVC] ATASILABS WhatsApp Gateway (Baileys Engine)`);
    console.log(`[WA-SVC] Port: ${PORT}`);
    console.log(`[WA-SVC] Health check: /health`);
    console.log(`=======================================================`);

    initClient().catch((err) => {
      console.error('[WA-SVC] Automatic init error:', err);
    });
  });
} else {
  initClient().catch((err) => {
    console.error('[WA-SVC] Automatic init error:', err);
  });
}

export { server };

// Graceful exit
process.on('SIGINT', async () => {
  console.log('\n[WA-SVC] Menerima sinyal SIGINT. Menutup WhatsApp Client...');
  if (sock) {
    try {
      sock.end();
    } catch (e) {}
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n[WA-SVC] Menerima sinyal SIGTERM. Menutup WhatsApp Client...');
  if (sock) {
    try {
      sock.end();
    } catch (e) {}
  }
  process.exit(0);
});
