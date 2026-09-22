import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const accountId = process.env.R2_ACCOUNT_ID || '30ad73dd1de7405625dcb181e21690bd';
const endpoint = process.env.R2_ENDPOINT || `https://${accountId}.r2.cloudflarestorage.com`;
const accessKeyId = process.env.R2_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';
const bucketName = process.env.R2_BUCKET_NAME || 'atasilabs-storage';
const publicUrl = process.env.R2_PUBLIC_URL || `https://pub-${accountId}.r2.dev`;

// Singleton S3 client instance for Cloudflare R2
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: endpoint,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
});

export interface R2UploadResult {
  success: boolean;
  key: string;
  url: string;
  proxyUrl: string;
  bucket: string;
  size?: number;
  contentType?: string;
  error?: string;
}

/**
 * Upload buffer or Uint8Array directly to Cloudflare R2
 */
export async function uploadToR2(
  fileBuffer: Buffer | Uint8Array,
  key: string,
  contentType: string = 'application/octet-stream'
): Promise<R2UploadResult> {
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await r2Client.send(command);

    const directUrl = `${publicUrl.replace(/\/$/, '')}/${key}`;
    const proxyUrl = `/api/media/${key}`;

    return {
      success: true,
      key,
      url: directUrl,
      proxyUrl,
      bucket: bucketName,
      size: fileBuffer.length,
      contentType,
    };
  } catch (error: any) {
    console.error('Cloudflare R2 Upload Error:', error);
    return {
      success: false,
      key,
      url: '',
      proxyUrl: '',
      bucket: bucketName,
      error: error.message || 'Failed to upload file to Cloudflare R2',
    };
  }
}

/**
 * Retrieve an object stream from Cloudflare R2
 */
export async function getObjectFromR2(key: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    const response = await r2Client.send(command);
    return response;
  } catch (error) {
    console.error('GetObjectFromR2 Error:', error);
    return null;
  }
}

/**
 * Generate a pre-signed URL for direct client-side uploads to Cloudflare R2
 */
export async function getPresignedUploadUrlR2(
  key: string,
  contentType: string = 'application/octet-stream',
  expiresInSeconds: number = 3600
): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: expiresInSeconds });
  const filePublicUrl = `${publicUrl.replace(/\/$/, '')}/${key}`;

  return {
    uploadUrl,
    publicUrl: filePublicUrl,
    key,
  };
}

/**
 * Delete an object from Cloudflare R2
 */
export async function deleteFromR2(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await r2Client.send(command);
    return true;
  } catch (error) {
    console.error('Cloudflare R2 Delete Error:', error);
    return false;
  }
}
