import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2, getPresignedUploadUrlR2 } from '@/lib/r2Storage';

export async function POST(req: NextRequest) {
  try {
    const contentTypeHeader = req.headers.get('content-type') || '';

    // Action 1: Multipart FormData Upload
    if (contentTypeHeader.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const folder = (formData.get('folder') as string) || 'uploads';

      if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const timestamp = Date.now();
      const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const objectKey = `${folder}/${timestamp}_${sanitizedFilename}`;

      const result = await uploadToR2(buffer, objectKey, file.type);

      if (!result.success) {
        return NextResponse.json({ error: result.error || 'Upload to R2 failed' }, { status: 500 });
      }

      // Return both proxyUrl (for 100% guaranteed display in app) and directUrl
      return NextResponse.json({
        success: true,
        message: 'File successfully uploaded to Cloudflare R2',
        url: result.proxyUrl || result.url,
        directUrl: result.url,
        key: result.key,
        size: result.size,
        contentType: result.contentType,
      });
    }

    // Action 2: JSON Request for Presigned Upload URL
    const body = await req.json();

    if (body.action === 'get-presigned-url') {
      const { filename, contentType, folder = 'uploads' } = body;

      if (!filename) {
        return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
      }

      const timestamp = Date.now();
      const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const objectKey = `${folder}/${timestamp}_${sanitizedFilename}`;

      const presigned = await getPresignedUploadUrlR2(objectKey, contentType || 'application/octet-stream');

      return NextResponse.json({
        success: true,
        uploadUrl: presigned.uploadUrl,
        publicUrl: presigned.publicUrl,
        proxyUrl: `/api/media/${objectKey}`,
        key: presigned.key,
      });
    }

    return NextResponse.json({ error: 'Unsupported upload action' }, { status: 400 });
  } catch (error: any) {
    console.error('API /api/upload Error:', error);
    return NextResponse.json({ error: error.message || 'Server error processing file upload' }, { status: 500 });
  }
}
