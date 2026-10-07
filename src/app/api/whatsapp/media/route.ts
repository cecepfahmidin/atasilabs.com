import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const WA_SERVICE_URL = process.env.WA_SERVICE_URL || 'http://127.0.0.1:5001';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const msgId = searchParams.get('msgId') || searchParams.get('messageId');

    if (!msgId) {
      return NextResponse.json({ error: 'msgId is required' }, { status: 400 });
    }

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
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Gagal mengunduh media dari WhatsApp: ' + (error?.message || error) },
      { status: 502 }
    );
  }
}
