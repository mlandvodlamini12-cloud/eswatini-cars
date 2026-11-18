import { NextRequest, NextResponse } from 'next/server'
import { uploadImage } from '@/lib/cloudinary'

// POST /api/upload
// Accepts BOTH formats so it works for web AND mobile clients:
//   - JSON body:        { image: "data:image/jpeg;base64,..." }
//   - FormData body:    field "file" containing a binary image file
//
// Returns:
//   200 OK:              { url: "https://res.cloudinary.com/..." }
//   400 Bad Request:     { error: "..." }  (no image or wrong format)
//   503 Service Unavail: { error: "..." }  (Cloudinary not configured)
//   500 Internal Error:  { error: "..." }  (Cloudinary rejected upload)

export async function POST(req: NextRequest) {
  try {
    // Quick early-fail: if Cloudinary isn't configured on the server,
    // tell the client clearly instead of failing mysteriously downstream.
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      return NextResponse.json(
        {
          error:
            'Image upload is not configured on the server. ' +
            'Ask the administrator to set CLOUDINARY_CLOUD_NAME, ' +
            'CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.',
        },
        { status: 503 }
      )
    }

    const contentType = req.headers.get('content-type') || ''
    let base64Data: string | null = null

    if (contentType.includes('application/json')) {
      // ─── JSON client (web app) ─────────────────────────────────────
      // Body: { "image": "data:image/jpeg;base64,/9j/4AAQ..." }
      const body = await req.json().catch(() => ({}))
      const { image } = body
      if (typeof image === 'string' && image.startsWith('data:image/')) {
        base64Data = image
      }
    } else if (contentType.includes('multipart/form-data')) {
      // ─── FormData client (mobile app) ─────────────────────────────
      // Body: multipart form with a "file" field containing the binary image
      const formData = await req.formData().catch(() => null)
      const file = formData?.get('file') as File | null
      if (file && file.size > 0) {
        // Convert binary File to base64 data URL so we can reuse uploadImage()
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const base64 = buffer.toString('base64')
        const mimeType = file.type || 'image/jpeg'
        base64Data = `data:${mimeType};base64,${base64}`

        // Sanity check: reject files larger than 10MB (Cloudinary's free-tier limit)
        if (buffer.length > 10 * 1024 * 1024) {
          return NextResponse.json(
            { error: 'Image is too large. Maximum 10MB.' },
            { status: 413 }
          )
        }
      }
    }

    if (!base64Data) {
      return NextResponse.json(
        {
          error:
            'No valid image provided. Send either JSON { image: "data:image/..." } ' +
            'or FormData with a "file" field.',
        },
        { status: 400 }
      )
    }

    // Upload to Cloudinary
    const result = await uploadImage(base64Data, 'listings')

    if (!result) {
      return NextResponse.json(
        { error: 'Cloudinary rejected the upload. Check server logs.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: result.secure_url })
  } catch (err: any) {
    console.error('[upload] error:', err)
    return NextResponse.json(
      { error: `Upload failed: ${err?.message || String(err)}` },
      { status: 500 }
    )
  }
}
