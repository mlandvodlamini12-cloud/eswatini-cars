// WhatsApp share helper — generates pre-filled messages for WhatsApp Channels.
//
// Unlike Facebook (which has an official Graph API for auto-posting),
// WhatsApp Channels do NOT have a public API for programmatic posting.
// The closest official approach is the wa.me share link, which opens
// WhatsApp with a pre-filled message. The user then selects the Channel
// and taps send.
//
// Flow:
// 1. Listing is created on the website/app
// 2. App generates a wa.me link with the listing details pre-filled
// 3. Admin taps "Share to WhatsApp" → WhatsApp opens
// 4. Admin selects the Channel → taps send
// 5. The listing is now in the WhatsApp Channel
//
// This is semi-automatic — the message is fully pre-filled, the admin
// just needs to select the Channel and tap send (2 taps).

interface ListingData {
  make: string
  model: string
  year: number
  price: number
  currency?: string
  region: string
  imageUrl?: string | null
  description?: string
  fuelType?: string
  transmission?: string
  mileage?: number
  color?: string
}

/**
 * Generate a WhatsApp share URL with listing details pre-filled.
 * The URL opens WhatsApp with the message ready to send.
 */
export function generateWhatsAppShareUrl(listing: ListingData): string {
  const symbol = listing.currency === 'ZAR' ? 'R' : 'E'
  const price = `${symbol} ${listing.price.toLocaleString('en-ZA')}`

  const lines = [
    `🚗 *${listing.make} ${listing.model}* (${listing.year})`,
    ``,
    `💰 Price: ${price}`,
    `📍 Location: ${listing.region}`,
    `⛽ Fuel: ${listing.fuelType || 'N/A'}`,
    `⚙️ Transmission: ${listing.transmission || 'N/A'}`,
    `🛣️ Mileage: ${listing.mileage ? listing.mileage.toLocaleString() + ' km' : 'N/A'}`,
    listing.color ? `🎨 Color: ${listing.color}` : '',
    ``,
    listing.description || '',
    ``,
    `📸 ${listing.imageUrl ? 'See photo above' : 'Photos available on the app'}`,
    ``,
    `🔗 View on Eswatini Cars: https://eswatini-cars.vercel.app`,
    ``,
    `_Posted via Eswatini Cars app_`,
  ].filter(Boolean)

  const message = lines.join('\n')
  const encoded = encodeURIComponent(message)
  return `https://wa.me/?text=${encoded}`
}

/**
 * Generate a simple WhatsApp share message (shorter version for status/channels)
 */
export function generateWhatsAppShortMessage(listing: ListingData): string {
  const symbol = listing.currency === 'ZAR' ? 'R' : 'E'
  const price = `${symbol} ${listing.price.toLocaleString('en-ZA')}`
  const msg = `🚗 ${listing.make} ${listing.model} (${listing.year}) — ${price} | ${listing.region} | Eswatini Cars`
  return `https://wa.me/?text=${encodeURIComponent(msg)}`
}
