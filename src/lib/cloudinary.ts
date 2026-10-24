// Cloudinary image upload helper
// Usage:
//   import { uploadImage } from '@/lib/cloudinary'
//   const { secure_url } = await uploadImage(base64String, folder = 'listings')

import { v2 as cloudinary } from 'cloudinary'

if (!process.env.CLOUDINARY_CLOUD_NAME) {
  // Will silently no-op until credentials are configured
  console.warn('[cloudinary] CLOUDINARY_CLOUD_NAME not set — uploads will be disabled')
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true,
})

export interface UploadResult {
  secure_url: string
  public_id: string
  width: number
  height: number
  bytes: number
}

/**
 * Upload a base64-encoded image to Cloudinary.
 * @param base64Data - base64 string WITH data URL prefix (e.g., "data:image/jpeg;base64,...")
 * @param folder - subfolder under ESWATINI_CARS root, default "listings"
 */
export async function uploadImage(
  base64Data: string,
  folder: string = 'listings'
): Promise<UploadResult | null> {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    console.warn('[cloudinary] Not configured — skipping upload')
    return null
  }

  const result = await cloudinary.uploader.upload(base64Data, {
    folder: `eswatini-cars/${folder}`,
    transformation: [
      { width: 1280, height: 960, crop: 'limit', quality: 'auto' },
      { fetch_format: 'auto' },
    ],
    resource_type: 'image',
  })

  return {
    secure_url: result.secure_url,
    public_id: result.public_id,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
  }
}

/**
 * Delete an image from Cloudinary by its public_id
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  if (!process.env.CLOUDINARY_CLOUD_NAME) return false
  try {
    await cloudinary.uploader.destroy(publicId)
    return true
  } catch (err) {
    console.error('[cloudinary] delete failed:', err)
    return false
  }
}

export default cloudinary
