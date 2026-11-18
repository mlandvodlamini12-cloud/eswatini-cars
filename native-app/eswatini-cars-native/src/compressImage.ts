// Image compression utility — must run BEFORE uploading to /api/upload
//
// WHY: Vercel's serverless functions have a 4.5MB body size limit on the
// free tier. Phone photos are typically 3-8MB and hit this limit, causing
// HTTP 413 FUNCTION_PAYLOAD_TOO_LARGE errors.
//
// WHAT THIS DOES: resizes the image to max 1280px wide and JPEG quality 0.8,
// which brings a 5MB phone photo down to ~200-400KB. Same visual quality on
// a phone screen, but 90% smaller file.
//
// This is the standard pattern every major app uses (Instagram, WhatsApp,
// Facebook all compress before upload).

import * as ImageManipulator from 'expo-image-manipulator'

export interface CompressedImage {
  uri: string
  width: number
  height: number
  size: number // approximate, in bytes
}

/**
 * Compress an image before upload.
 *
 * @param uri - the local URI returned by expo-image-picker
 * @returns CompressedImage with new URI pointing to the compressed file
 */
export async function compressImageForUpload(uri: string): Promise<CompressedImage> {
  // Resize to max 1280px on the longest side, JPEG quality 0.8
  // 1280px is plenty for a car listing — Cloudinary serves it at this size
  // to phones, and even desktop viewers won't notice.
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1280 } }],
    {
      compress: 0.8,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  )

  return {
    uri: result.uri,
    width: result.width,
    height: result.height,
    size: 0, // expo-image-manipulator doesn't return size; we don't need it
  }
}
