import { NextRequest, NextResponse } from 'next/server'
import { uploadImage } from '@/lib/cloudinary'

// POST /api/upload
// Accepts: { image: "data:image/jpeg;base64,..." }
// Returns: { url: "https://res.cloudinary.com/..." } on success
//          { error: "..." } on failure
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { image } = body

    if (!image || typeof image !== 'string') {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Validate it's a data URL
    if (!image.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Invalid image format — expected data URL' }, { status: 400 })
    }

    // Upload to Cloudinary
    const result = await uploadImage(image, 'listings')

    if (!result) {
      return NextResponse.json({ error: 'Upload failed — Cloudinary not configured or upload error' }, { status: 500 })
    }

    return NextResponse.json({ url: result.secure_url })
  } catch (err: any) {
    console.error('[upload] error:', err)
    return NextResponse.json({ error: `Upload failed: ${err?.message || String(err)}` }, { status: 500 })
  }
}
