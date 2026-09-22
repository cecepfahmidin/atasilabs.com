import { NextRequest, NextResponse } from 'next/server';
import { getObjectFromR2 } from '@/lib/r2Storage';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const keyArray = resolvedParams?.key;

    if (!keyArray || keyArray.length === 0) {
      return NextResponse.json({ error: 'Media key is required' }, { status: 400 });
    }

    const objectKey = keyArray.join('/');
    const object = await getObjectFromR2(objectKey);

    if (!object || !object.Body) {
      return NextResponse.json({ error: 'File not found in R2 storage' }, { status: 404 });
    }

    // Convert AWS SDK stream/ReadableStream to Web Response stream
    const byteArray = await object.Body.transformToByteArray();
    const contentType = object.ContentType || 'application/octet-stream';

    return new NextResponse(Buffer.from(byteArray), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': byteArray.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('Media proxy route error:', error);
    return NextResponse.json({ error: 'Error fetching media object' }, { status: 500 });
  }
}
