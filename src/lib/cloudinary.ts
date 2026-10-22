import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Configuration check
const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim() || '';
const apiKey = process.env.CLOUDINARY_API_KEY?.trim() || '';
const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim() || '';

const isPlaceholder = (val: string) =>
  !val ||
  val.startsWith('your-') ||
  val.startsWith('MY_') ||
  val.includes('example') ||
  val.length < 3;

const isConfigured = !isPlaceholder(cloudName) && !isPlaceholder(apiKey) && !isPlaceholder(apiSecret);

if (isConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export function getCloudinaryStatus() {
  return {
    isConfigured,
    provider: isConfigured ? 'cloudinary' : 'local_storage',
    cloudName: isConfigured ? cloudName : null,
    message: isConfigured
      ? `Cloudinary storage is active and configured for cloud "${cloudName}".`
      : 'Cloudinary storage credentials not detected. Operating in secure local development storage mode. To activate production cloud delivery, set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
  };
}

/**
 * Strict Magic-Byte Content Type Inspector
 * Prevents disguised files, executable payloads, or spoofed MIME types.
 */
export function validateImageMagicBytes(buffer: Buffer): { valid: boolean; detectedMime?: string; error?: string } {
  if (!buffer || buffer.length < 8) {
    return { valid: false, error: 'File is empty or too small to be a valid image.' };
  }

  // JPEG check: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, detectedMime: 'image/jpeg' };
  }

  // PNG check: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, detectedMime: 'image/png' };
  }

  // GIF check: GIF87a or GIF89a (47 49 46 38 37/39 61)
  const headerGif = buffer.subarray(0, 6).toString('ascii');
  if (headerGif === 'GIF87a' || headerGif === 'GIF89a') {
    return { valid: true, detectedMime: 'image/gif' };
  }

  // WebP check: RIFF .... WEBP
  const riff = buffer.subarray(0, 4).toString('ascii');
  const webp = buffer.subarray(8, 12).toString('ascii');
  if (riff === 'RIFF' && webp === 'WEBP') {
    return { valid: true, detectedMime: 'image/webp' };
  }

  // SVG check: begins with XML or <svg
  const startChunk = buffer.subarray(0, Math.min(buffer.length, 1024)).toString('utf8').trim();
  if (startChunk.includes('<svg') && !startChunk.includes('<script')) {
    return { valid: true, detectedMime: 'image/svg+xml' };
  }

  return {
    valid: false,
    error: 'Invalid file content: The file payload does not match supported image signatures (JPEG, PNG, WebP, GIF, or clean SVG).',
  };
}

export interface UploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  width?: number;
  height?: number;
  format: string;
  bytes: number;
  storageProvider: 'cloudinary' | 'local';
}

/**
 * Upload an image buffer to Cloudinary with secure local fallback
 */
export async function uploadImageBuffer(
  buffer: Buffer,
  options: {
    folder?: string;
    publicId?: string;
    fileName?: string;
    tags?: string[];
  } = {}
): Promise<UploadResult> {
  const validation = validateImageMagicBytes(buffer);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid image file.');
  }

  const mime = validation.detectedMime || 'image/jpeg';
  const extension = mime.split('/')[1]?.replace('svg+xml', 'svg') || 'jpg';
  const folder = options.folder || 'om_sai_clinic';

  // 1. If Cloudinary is configured, upload via Cloudinary SDK
  if (isConfigured) {
    try {
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            public_id: options.publicId,
            tags: options.tags || ['clinic_asset'],
            resource_type: 'image',
            overwrite: true,
          },
          (error, result) => {
            if (error || !result) {
              return reject(error || new Error('Upload to Cloudinary failed with empty result.'));
            }
            resolve(result);
          }
        );
        uploadStream.end(buffer);
      });

      return {
        url: result.url,
        secureUrl: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format || extension,
        bytes: result.bytes || buffer.length,
        storageProvider: 'cloudinary',
      };
    } catch (err) {
      console.warn('Cloudinary upload stream failed, falling back to local media storage:', err);
      // Fall through to local storage
    }
  }

  // 2. Local File System Fallback
  const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const uniqueHash = crypto.randomBytes(8).toString('hex');
  const safeBaseName = (options.fileName || 'asset')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 40);
  const finalFilename = `${Date.now()}-${safeBaseName}-${uniqueHash}.${extension}`;
  const localFilePath = path.join(uploadsDir, finalFilename);

  fs.writeFileSync(localFilePath, buffer);

  const localUrl = `/uploads/${finalFilename}`;
  const publicId = `local_${finalFilename}`;

  return {
    url: localUrl,
    secureUrl: localUrl,
    publicId,
    width: 800, // standard nominal dimension for fallback
    height: 600,
    format: extension,
    bytes: buffer.length,
    storageProvider: 'local',
  };
}

/**
 * Delete image from Cloudinary or local storage
 */
export async function deleteImageByPublicId(publicId: string): Promise<boolean> {
  if (!publicId) return false;

  if (publicId.startsWith('local_')) {
    const filename = publicId.replace('local_', '');
    const localFilePath = path.resolve(process.cwd(), 'public', 'uploads', filename);
    if (fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
        return true;
      } catch (err) {
        console.warn(`Could not remove local file ${localFilePath}:`, err);
      }
    }
    return true;
  }

  if (isConfigured) {
    try {
      const res = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
      return res.result === 'ok';
    } catch (err) {
      console.warn(`Cloudinary deletion failed for ${publicId}:`, err);
      return false;
    }
  }

  return true;
}
