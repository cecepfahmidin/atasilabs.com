import { NextRequest, NextResponse } from 'next/server';
import { saveMessageToDb, deleteChatFromDb, deleteMessageFromDb } from '@/lib/whatsappDb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { event, payload } = body;

    if (!event) {
      return NextResponse.json({ success: false, error: 'Event name is required' }, { status: 400 });
    }

    // Process event
    if (event === 'NEW_MESSAGE' && payload?.message) {
      const msg = payload.message;
      const chatId = payload.chatId || (msg.fromMe ? msg.to : msg.from);
      await saveMessageToDb({
        id: msg.id,
        chatId: chatId,
        body: msg.body || '',
        from: msg.from,
        to: msg.to,
        fromMe: Boolean(msg.fromMe),
        timestamp: Number(msg.timestamp) || Date.now(),
        type: msg.type || 'chat',
        hasMedia: Boolean(msg.hasMedia),
        mediaUrl: msg.mediaUrl || null,
        mediaKey: msg.mediaKey || null,
        mediaName: msg.mediaName || null,
        mediaMime: msg.mediaMime || null,
        mediaSize: msg.mediaSize || null,
        ack: msg.ack || 1,
      });
    } else if (event === 'CHAT_DELETED' && payload?.chatId) {
      await deleteChatFromDb(payload.chatId);
    } else if (event === 'MESSAGE_DELETED' && payload?.messageId) {
      await deleteMessageFromDb(payload.messageId, payload.chatId);
    }

    return NextResponse.json({ success: true, receivedEvent: event });
  } catch (error: any) {
    console.warn('[WA-WEBHOOK] Webhook processing error:', error?.message);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    status: 'Webhook endpoint active',
    timestamp: new Date().toISOString(),
  });
}
