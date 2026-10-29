'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Car, Truck, Bike, Wrench, Search, Plus, Shield, Eye, Phone, MapPin, Fuel, Settings2, Gauge, TrendingUp, Handshake, CheckCircle2, Heart, MessageSquare, LayoutDashboard, Lock, X, Upload, Star, Clock, DollarSign, Send, ArrowLeft, Bus, Sparkles, Zap, ShieldCheck, Award, Trash2, Pencil, UserPlus, UserMinus, Bell, Mail, Users, LogOut, UserCog, Caravan, Tractor, FileText, Ban, Megaphone, History, TrendingDown, ChevronUp, ChevronDown } from 'lucide-react'

type Listing = {
  id: string
  type: string
  make: string
  model: string
  year: number
  price: number
  currency: string
  fuelType: string
  transmission: string
  mileage: number
  color: string | null
  description: string
  imageUrl: string | null
  region: string
  status: string
  featured: boolean
  views: number
  createdAt: string
  sellerName?: string | null
  sellerEmail?: string | null
  sellerPhone?: string | null
}

type Enquiry = {
  id: string
  listingId: string
  buyerName: string
  buyerPhone: string
  buyerEmail: string | null
  message: string
  status: string
  createdAt: string
  listing?: Listing
}

type Message = {
  id: string
  sender: string // "broker" | "buyer"
  text: string
  createdAt: string
}

type FullEnquiry = Enquiry & { listing: Listing; messages: Message[] }

type VehicleRequest = {
  id: string
  requesterName: string
  requesterEmail: string
  requesterPhone: string | null
  vehicleType: string
  make: string | null
  model: string | null
  minBudget: string | null
  maxBudget: string | null
  fuelType: string
  transmission: string
  region: string
  description: string | null
  status: string
  createdAt: string
}

type AdminMessage = {
  id: string
  userEmail: string
  username?: string | null
  subject: string
  message: string
  response: string | null
  status: string
  createdAt: string
  updatedAt?: string
  // Replies are loaded from the ContactReply relation via Prisma's `include`.
  // Each reply has a `sender` field ('admin' or 'user') so we can render the
  // conversation thread with proper alignment (admin on left, user on right).
  replies?: Array<{
    id: string
    sender: 'admin' | 'user' | string
    text: string
    createdAt: string
  }>
}

type User = {
  email: string
  name: string
  phone: string
  role: 'user' | 'minor_admin' | 'main_admin' | 'admin'
  createdAt: string
}

type AdminTeamMember = {
  email: string
  name: string
  role: 'minor_admin' | 'main_admin'
  permissions: string[]
  addedAt: string
}

// Hardcoded sample listings for static deployment (no database needed)
const STATIC_LISTINGS: Listing[] = [
  {
    "id": "cmve166zy0000svhi8gy6dnox",
    "type": "bakkie",
    "make": "Toyota",
    "model": "Hilux 2.4 GD-6",
    "year": 2020,
    "price": 385000,
    "currency": "SZL",
    "fuelType": "diesel",
    "transmission": "automatic",
    "mileage": 85000,
    "color": "White",
    "description": "Excellent condition, full service history, accident-free, new tyres, canopy included.",
    "imageUrl": "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800",
    "region": "Manzini",
    "status": "active",
    "featured": true,
    "views": 0,
    "createdAt": "2026-10-18T16:19:17.614Z"
  },
  {
    "id": "cmve166zz0001svhii1buhq3h",
    "type": "car",
    "make": "Volkswagen",
    "model": "Polo 1.6 TDI",
    "year": 2019,
    "price": 235000,
    "currency": "SZL",
    "fuelType": "diesel",
    "transmission": "manual",
    "mileage": 95000,
    "color": "Silver",
    "description": "Low mileage, fuel-efficient, perfect for daily commuting. Service book up to date.",
    "imageUrl": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
    "region": "Hhohho",
    "status": "active",
    "featured": true,
    "views": 0,
    "createdAt": "2026-10-18T16:19:17.616Z"
  },
  {
    "id": "cmve167000002svhiephfk3s5",
    "type": "car",
    "make": "Mercedes-Benz",
    "model": "C200 AMG",
    "year": 2021,
    "price": 580000,
    "currency": "SZL",
    "fuelType": "petrol",
    "transmission": "automatic",
    "mileage": 42000,
    "color": "Black",
    "description": "Pristine condition, panoramic roof, leather seats, AMG package, balance of factory warranty.",
    "imageUrl": "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800",
    "region": "Hhohho",
    "status": "active",
    "featured": true,
    "views": 0,
    "createdAt": "2026-10-18T16:19:17.616Z"
  },
  {
    "id": "cmve167010003svhix0795vjw",
    "type": "bakkie",
    "make": "Ford",
    "model": "Ranger XLT 2.2",
    "year": 2018,
    "price": 295000,
    "currency": "SZL",
    "fuelType": "diesel",
    "transmission": "manual",
    "mileage": 120000,
    "color": "Blue",
    "description": "Double cab, 4x2, tow bar, rubberised bin, new battery.",
    "imageUrl": "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800",
    "region": "Shiselweni",
    "status": "active",
    "featured": false,
    "views": 0,
    "createdAt": "2026-10-18T16:19:17.617Z"
  },
  {
    "id": "cmve167010004svhicnd3k6li",
    "type": "car",
    "make": "Toyota",
    "model": "Corolla Quest 1.6",
    "year": 2017,
    "price": 175000,
    "currency": "SZL",
    "fuelType": "petrol",
    "transmission": "manual",
    "mileage": 145000,
    "color": "Grey",
    "description": "Reliable, economical, perfect first car. Recently serviced.",
    "imageUrl": "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800",
    "region": "Manzini",
    "status": "active",
    "featured": false,
    "views": 0,
    "createdAt": "2026-10-18T16:19:17.618Z"
  },
  {
    "id": "cmve167020005svhipct25ae2",
    "type": "van",
    "make": "Toyota",
    "model": "Quantum 2.7",
    "year": 2019,
    "price": 425000,
    "currency": "SZL",
    "fuelType": "diesel",
    "transmission": "manual",
    "mileage": 110000,
    "color": "White",
    "description": "14-seater kombi, perfect for taxi business. Engine overhauled 10,000km ago.",
    "imageUrl": "https://images.unsplash.com/photo-1609520505218-7ca1f5a07dce?w=800",
    "region": "Lubombo",
    "status": "active",
    "featured": false,
    "views": 0,
    "createdAt": "2026-10-18T16:19:17.619Z"
  },
  {
    "id": "cmve167030006svhi84e6vm8b",
    "type": "bike",
    "make": "Yamaha",
    "model": "MT-07",
    "year": 2020,
    "price": 125000,
    "currency": "SZL",
    "fuelType": "petrol",
    "transmission": "manual",
    "mileage": 18000,
    "color": "Blue",
    "description": "Lightweight sportbike, fun to ride, perfect condition, aftermarket exhaust.",
    "imageUrl": "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800",
    "region": "Hhohho",
    "status": "active",
    "featured": false,
    "views": 0,
    "createdAt": "2026-10-18T16:19:17.619Z"
  },
  {
    "id": "cmve167040007svhirgziave9",
    "type": "part",
    "make": "Various",
    "model": "Alloy Wheels (Set of 4)",
    "year": 2023,
    "price": 8500,
    "currency": "SZL",
    "fuelType": "petrol",
    "transmission": "manual",
    "mileage": 0,
    "color": "Black",
    "description": "17-inch alloy wheels, 5-bolt pattern, fits VW and Audi. Excellent condition.",
    "imageUrl": "https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=800",
    "region": "Manzini",
    "status": "active",
    "featured": false,
    "views": 0,
    "createdAt": "2026-10-18T16:19:17.620Z"
  },
  {
    "id": "cmve167050008svhigghotlzd",
    "type": "car",
    "make": "BMW",
    "model": "320i M Sport",
    "year": 2020,
    "price": 475000,
    "currency": "SZL",
    "fuelType": "petrol",
    "transmission": "automatic",
    "mileage": 55000,
    "color": "Alpine White",
    "description": "M Sport package, leather interior, sunroof, navigation, balance of motorplan.",
    "imageUrl": "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
    "region": "Hhohho",
    "status": "active",
    "featured": true,
    "views": 0,
    "createdAt": "2026-10-18T16:19:17.621Z"
  },
  {
    "id": "cmve167050009svhiieppjgbi",
    "type": "car",
    "make": "Hyundai",
    "model": "i20 1.4 Fluid",
    "year": 2018,
    "price": 165000,
    "currency": "SZL",
    "fuelType": "petrol",
    "transmission": "manual",
    "mileage": 78000,
    "color": "Red",
    "description": "Economical hatchback, low mileage, FSH, accident-free.",
    "imageUrl": "https://images.unsplash.com/photo-1606220838315-056192d5e927?w=800",
    "region": "Manzini",
    "status": "active",
    "featured": false,
    "views": 0,
    "createdAt": "2026-10-18T16:19:17.622Z"
  },
  {
    "id": "cmve16706000asvhi63s32vnx",
    "type": "bakkie",
    "make": "Isuzu",
    "model": "D-Max 1.9 LE",
    "year": 2021,
    "price": 460000,
    "currency": "SZL",
    "fuelType": "diesel",
    "transmission": "automatic",
    "mileage": 38000,
    "color": "Silver",
    "description": "Like new, under warranty, nudge bar, side steps, leather seats.",
    "imageUrl": "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800",
    "region": "Lubombo",
    "status": "active",
    "featured": false,
    "views": 0,
    "createdAt": "2026-10-18T16:19:17.623Z"
  },
  {
    "id": "cmve16707000bsvhivz8age0c",
    "type": "car",
    "make": "Audi",
    "model": "A3 1.4 TFSI",
    "year": 2019,
    "price": 365000,
    "currency": "SZL",
    "fuelType": "petrol",
    "transmission": "automatic",
    "mileage": 62000,
    "color": "Grey",
    "description": "Sportback, S-line package, virtual cockpit, LED headlights.",
    "imageUrl": "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
    "region": "Hhohho",
    "status": "active",
    "featured": false,
    "views": 0,
    "createdAt": "2026-10-18T16:19:17.623Z"
  },
  {
    "id": "cmvf5xcnq0000u8jjg90u2mlx",
    "type": "car",
    "make": "BMW",
    "model": "M3 Competition",
    "year": 2022,
    "price": 1250000,
    "currency": "SZL",
    "fuelType": "petrol",
    "transmission": "automatic",
    "mileage": 15000,
    "color": "Alpine White",
    "description": "Like-new M3 Competition. Carbon ceramic brakes, full leather, Harman Kardon. Multi-angle photos included. Viewings welcome.",
    "imageUrl": "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800|https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800|https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800|https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
    "region": "Hhohho",
    "status": "active",
    "featured": true,
    "views": 2,
    "createdAt": "2026-10-19T11:20:09.302Z"
  }
];


const TYPES = [
  { value: 'all', label: 'All Vehicles', icon: Car },
  { value: 'car', label: 'Cars', icon: Car },
  { value: 'bakkie', label: 'Bakkies & Trucks', icon: Truck },
  { value: 'van', label: 'Vans', icon: Caravan },
  { value: 'heavy', label: 'Heavy Vehicles', icon: Tractor },
  { value: 'bike', label: 'Bikes', icon: Bike },
  { value: 'part', label: 'Parts & Accessories', icon: Wrench },
]

const REGIONS = ['all', 'Hhohho', 'Manzini', 'Shiselweni', 'Lubombo']
const FUELS = ['all', 'petrol', 'diesel', 'hybrid', 'electric']
const TRANSMISSIONS = ['all', 'manual', 'automatic']

const COMMISSION_RATES = [
  { range: 'Under E100,000', rate: '3%', note: 'Min E1,500' },
  { range: 'E100,000 – E250,000', rate: '2.5%', note: '' },
  { range: 'Over E250,000', rate: '2%', note: 'Capped at E10,000' },
  { range: 'Parts & Accessories', rate: '10%', note: 'Flat fee' },
]

const ADMIN_PIN = '1374' // 🔐 Custom admin PIN

// === ADMIN EMAIL ALLOWLIST ===
// Only these emails can see the Admin Dashboard button.
// To add an admin: register an account with this email, then they get admin access.
// Add new admin emails here as needed.
const ADMIN_EMAILS = [
  'mlandvodlamini12@gmail.com',     // Owner (you)
  'admin@eswatinicars.co.sz',        // Future domain admin
  // 'other-admin@gmail.com',         // Add more admins here
]

function isAdminEmail(email?: string | null): boolean {
  if (!email) return false
  return ADMIN_EMAILS.some(admin => admin.toLowerCase() === email.toLowerCase())
}

const fmt = (n: number, currency: string = 'SZL') => {
  const symbol = currency === 'ZAR' ? 'R' : 'E'
  return `${symbol} ${n.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`
}

const fmtDate = (iso: string) => {
  const d = new Date(iso)
  const now = new Date()
  const diff = (now.getTime() - d.getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })
}

export default function Home() {
  const [view, setView] = useState<'browse' | 'how' | 'saved' | 'myposts' | 'myrequests' | 'admin' | 'requests' | 'messages'>('browse')
  const [listings, setListings] = useState<Listing[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const cached = window.localStorage.getItem('cachedListings')
      if (!cached) return []
      const parsed = JSON.parse(cached)
      // Defensive: a previous deploy may have written a non-array shape
      // (e.g. an object, a string, or null) into cachedListings. If we blindly
      // trust it, listings.filter(...) crashes with "r.filter is not a function"
      // on next render and the whole page falls over.
      return Array.isArray(parsed) ? parsed : []
    } catch {
      // Bad JSON — clear it so we don't keep tripping over the same value
      // on every page load.
      try { window.localStorage.removeItem('cachedListings') } catch {}
      return []
    }
  })
  const [loading, setLoading] = useState(true)
  const [enquiryOpen, setEnquiryOpen] = useState<string | null>(null)
  const [listingDetail, setListingDetail] = useState<Listing | null>(null)
  const [sellOpen, setSellOpen] = useState(false)

  // Filters
  const [q, setQ] = useState('')
  const [type, setType] = useState('all')
  const [fuel, setFuel] = useState('all')
  const [transmission, setTransmission] = useState('all')
  const [region, setRegion] = useState('all')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  // Saved cars (localStorage) — lazy init from localStorage
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const s = window.localStorage.getItem('savedCars')
      if (!s) return []
      const parsed = JSON.parse(s)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      try { window.localStorage.removeItem('savedCars') } catch {}
      return []
    }
  })

  // Enquiry form
  const [enqName, setEnqName] = useState('')
  const [enqPhone, setEnqPhone] = useState('')
  const [enqMessage, setEnqMessage] = useState('')
  const [enqSubmitted, setEnqSubmitted] = useState(false)

  // Sell form
  const [sellForm, setSellForm] = useState({
    type: 'car', make: '', model: '', year: '', price: '', fuelType: 'petrol',
    transmission: 'manual', mileage: '', color: '', description: '', region: 'Manzini',
    sellerName: '', sellerPhone: '', sellerEmail: '', imageUrl: '',
  })
  const [sellSubmitted, setSellSubmitted] = useState(false)
  const [sortBy, setSortBy] = useState<'recent' | 'price-low' | 'price-high'>('recent')
  const [userListings, setUserListings] = useState<Listing[]>([])
  const [uploading, setUploading] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [showRegister, setShowRegister] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showRequest, setShowRequest] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [vehicleRequests, setVehicleRequests] = useState<VehicleRequest[]>([])
  const [adminMessages, setAdminMessages] = useState<AdminMessage[]>([])
  const [adminTeam, setAdminTeam] = useState<AdminTeamMember[]>([
    { email: 'admin@eswatinicars.co.sz', name: 'Main Admin', role: 'main_admin', permissions: ['all'], addedAt: new Date().toISOString() }
  ])
  const [showAddAdmin, setShowAddAdmin] = useState(false)
  const [editingListing, setEditingListing] = useState<Listing | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showDisclaimer, setShowDisclaimer] = useState(false)

  // === BROADCASTS (admin announcements banner) ===
  const [broadcasts, setBroadcasts] = useState<Array<{ id: string; title: string; message: string; audience: string; createdAt: string; read?: boolean }>>([])
  const [activeBroadcast, setActiveBroadcast] = useState<{ id: string; title: string; message: string; audience: string; createdAt: string; read?: boolean } | null>(null)
  // Tracks whether the broadcast banner is currently expanded (full text visible)
  // or collapsed (single-line summary). User taps the banner to toggle.
  // Collapsed by default so it doesn't push the page content down.
  const [broadcastExpanded, setBroadcastExpanded] = useState(false)
  const [dismissedBroadcasts, setDismissedBroadcasts] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const s = window.localStorage.getItem('dismissedBroadcasts')
      if (!s) return []
      const parsed = JSON.parse(s)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      try { window.localStorage.removeItem('dismissedBroadcasts') } catch {}
      return []
    }
  })

  // === FIREBASE PHONE OTP (register flow) ===
  const [phoneVerifyStep, setPhoneVerifyStep] = useState<'form' | 'otp' | 'done'>('form')
  const [otpCode, setOtpCode] = useState('')
  const [confirmationResult, setConfirmationResult] = useState<any>(null)

  // === RECENTLY VIEWED (track last 8 listings user opened) ===
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const s = window.localStorage.getItem('recentlyViewed')
      if (!s) return []
      const parsed = JSON.parse(s)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      try { window.localStorage.removeItem('recentlyViewed') } catch {}
      return []
    }
  })

  // === PRICE DROP ALERTS ===
  // When a listing's price drops vs the previously cached price, we surface it here.
  const [priceDrops, setPriceDrops] = useState<Array<{ id: string; make: string; model: string; oldPrice: number; newPrice: number; imageUrl: string | null }>>([])

  // === HONEYPOT (anti-spam on enquiry form) — hidden from humans, bots fill it in ===
  const [enqWebsite, setEnqWebsite] = useState('')

  const toggleSave = (id: string) => {
    if (!currentUser) {
      setShowLogin(true)
      return
    }
    setSavedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      localStorage.setItem('savedCars', JSON.stringify(next))
      return next
    })
  }

  // === REAL-TIME SYNC: Fetch listings from Turso API (shared across all apps) ===
  // Every app that calls this endpoint sees the same data — instant sync.
  const apiFetchListings = useCallback(async (): Promise<Listing[]> => {
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (type !== 'all') params.set('type', type)
      if (fuel !== 'all') params.set('fuel', fuel)
      if (transmission !== 'all') params.set('transmission', transmission)
      if (region !== 'all') params.set('region', region)
      if (minPrice) params.set('minPrice', minPrice)
      if (maxPrice) params.set('maxPrice', maxPrice)
      if (sortBy === 'recent') params.set('sort', 'recent')
      else if (sortBy === 'price-low') params.set('sort', 'price-low')
      else if (sortBy === 'price-high') params.set('sort', 'price-high')
      const url = `/api/listings${params.toString() ? '?' + params.toString() : ''}`
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) throw new Error(`API returned ${res.status}`)
      const data = await res.json()
      // Defensive: API should return { listings: [...] } but a previous deploy
      // (or a proxy/CDN cache miss) could return an error object, null, or
      // just {}. If we blindly trust data.listings and it's not an array,
      // listings.filter(...) crashes with "r.filter is not a function".
      const fetched: Listing[] = Array.isArray(data?.listings) ? data.listings : []
      // Cache the freshly fetched listings in localStorage so the UI shows
      // something instantly on next mount instead of an empty grid.
      try {
        if (fetched.length) {
          window.localStorage.setItem('cachedListings', JSON.stringify(fetched))
        }
      } catch {}
      // Apply local sort — IMPORTANT: we sort on the client even for 'recent'
      // because the API may ignore the ?sort= param and return its default
      // (featured desc, createdAt desc) order. If the user explicitly picked
      // 'Most Recent' after switching from 'Price: Low to High', we MUST
      // re-sort by date here or the user will see stale price-sorted order
      // and think "Most Recent sorting is not working".
      let filtered: Listing[] = fetched
      if (sortBy === 'recent') {
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      } else if (sortBy === 'price-low') {
        filtered.sort((a, b) => a.price - b.price)
      } else if (sortBy === 'price-high') {
        filtered.sort((a, b) => b.price - a.price)
      }
      return filtered
    } catch (err) {
      console.error('[apiFetchListings] failed, falling back to cache/static:', err)
      // Try cached listings first (last successful fetch) so the user doesn't
      // see an empty grid if the API is temporarily unreachable.
      try {
        const cached = window.localStorage.getItem('cachedListings')
        if (cached) {
          const parsed = JSON.parse(cached)
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Apply the same sort to the cached fallback so the user still
            // sees their selected sort order, not whatever was cached.
            const sorted = [...parsed]
            if (sortBy === 'recent') {
              sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            } else if (sortBy === 'price-low') {
              sorted.sort((a, b) => a.price - b.price)
            } else if (sortBy === 'price-high') {
              sorted.sort((a, b) => b.price - a.price)
            }
            return sorted
          }
        }
      } catch {}
      return STATIC_LISTINGS // graceful fallback if API is unreachable AND cache is empty
    }
  }, [q, type, fuel, transmission, region, minPrice, maxPrice, sortBy])

  // Filter and sort static listings locally (fallback when API is unreachable)
  const fetchListings = useCallback((): Listing[] => {
    let filtered = [...STATIC_LISTINGS, ...userListings]
    if (q) {
      const ql = q.toLowerCase()
      filtered = filtered.filter(l =>
        l.make.toLowerCase().includes(ql) ||
        l.model.toLowerCase().includes(ql) ||
        (l.color || '').toLowerCase().includes(ql)
      )
    }
    if (type !== 'all') filtered = filtered.filter(l => l.type === type)
    if (fuel !== 'all') filtered = filtered.filter(l => l.fuelType === fuel)
    if (transmission !== 'all') filtered = filtered.filter(l => l.transmission === transmission)
    if (region !== 'all') filtered = filtered.filter(l => l.region === region)
    if (minPrice) filtered = filtered.filter(l => l.price >= Number(minPrice))
    if (maxPrice) filtered = filtered.filter(l => l.price <= Number(maxPrice))
    // Sort
    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price)
    }
    return filtered
  }, [q, type, fuel, transmission, region, minPrice, maxPrice, sortBy, userListings])

  // Initial load + when filters change — fetch from API (real-time sync)
  useEffect(() => {
    let cancelled = false
    // If we already have cached listings in state, don't flash the loading spinner —
    // show the cached grid while we re-fetch in the background.
    if (listings.length === 0) setLoading(true)
    apiFetchListings().then((result) => {
      if (cancelled) return
      setListings(result)
      setLoading(false)
      // Run a price-drop check against what we previously stored.
      checkPriceDrops(result)
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiFetchListings])

  // Auto-refresh listings every 30 seconds (real-time sync: new listings appear without manual refresh)
  useEffect(() => {
    const interval = setInterval(() => {
      apiFetchListings().then((result) => {
        setListings(result)
      }).catch(() => {})
    }, 30000) // 30 seconds
    return () => clearInterval(interval)
  }, [apiFetchListings])

  const featuredListings = useMemo(() => listings.filter(l => l.featured), [listings])
  const justListed = useMemo(() => listings.slice(0, 8), [listings])
  const savedListings = useMemo(() => listings.filter(l => savedIds.includes(l.id)), [listings, savedIds])
  const myListings = useMemo(() => currentUser?.email ? listings.filter(l => l.sellerEmail === currentUser.email) : [], [listings, currentUser])
  const myRequests = useMemo(() => currentUser?.email ? vehicleRequests.filter(r => r.requesterEmail === currentUser.email || r.requesterPhone === currentUser.phone) : [], [vehicleRequests, currentUser])
  const recentlyViewed = useMemo(() => recentlyViewedIds.map(id => listings.find(l => l.id === id)).filter(Boolean) as Listing[], [listings, recentlyViewedIds])

  const submitEnquiry = async (_listingId: string) => {
    // Honeypot: if the hidden "website" field is filled in, it's a bot.
    if (enqWebsite) {
      console.warn('[submitEnquiry] honeypot tripped — silently dropping spam')
      setEnqSubmitted(true) // fake success so the bot doesn't retry
      return
    }
    setEnqSubmitted(true)
  }

  // Track a listing view: prepend to recentlyViewedIds, dedupe, keep only the latest 8.
  const trackView = useCallback((id: string) => {
    setRecentlyViewedIds(prev => {
      const next = [id, ...prev.filter(x => x !== id)].slice(0, 8)
      try { window.localStorage.setItem('recentlyViewed', JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  // Compare freshly fetched listings to previously cached prices. If a price went
  // DOWN, surface it in the priceDrops banner so the user knows to take a look.
  const checkPriceDrops = useCallback((fresh: Listing[]) => {
    try {
      const cachedRaw = window.localStorage.getItem('cachedListings')
      if (!cachedRaw) {
        // No prior cache — just persist the fresh snapshot so the next run
        // has something to diff against.
        window.localStorage.setItem('cachedListings', JSON.stringify(fresh))
        return
      }
      const parsed = JSON.parse(cachedRaw)
      // Defensive: if a previous deploy left a non-array in cachedListings
      // (object, string, null), don't crash on .map() below — just overwrite.
      if (!Array.isArray(parsed)) {
        window.localStorage.setItem('cachedListings', JSON.stringify(fresh))
        return
      }
      const cached: Listing[] = parsed
      const cachedMap = new Map(cached.map(l => [l.id, l.price]))
      const drops: Array<{ id: string; make: string; model: string; oldPrice: number; newPrice: number; imageUrl: string | null }> = []
      for (const l of fresh) {
        const old = cachedMap.get(l.id)
        if (typeof old === 'number' && old > l.price) {
          drops.push({ id: l.id, make: l.make, model: l.model, oldPrice: old, newPrice: l.price, imageUrl: l.imageUrl })
        }
      }
      // Persist the freshest snapshot so the *next* run can diff against it.
      window.localStorage.setItem('cachedListings', JSON.stringify(fresh))
      if (drops.length > 0) setPriceDrops(drops)
    } catch {
      // Bad JSON or storage disabled — clear and move on so the user isn't
      // stuck with a poisoned cache forever.
      try { window.localStorage.removeItem('cachedListings') } catch {}
    }
  }, [])

  // Send an OTP to the user's phone via Firebase phone auth (recaptcha-less if available).
  // Falls back to a dev-mode "123456" code if Firebase isn't reachable.
  const sendOTP = useCallback(async (phone: string) => {
    try {
      const { sendPhoneOTP } = await import('@/lib/firebase')
      const result = await sendPhoneOTP(phone)
      if ('error' in result) {
        // Firebase failed — surface the friendly error message to the user.
        // We no longer silently fall back to dev mode in production because
        // that masks real configuration issues (e.g. quota exceeded, phone auth
        // not enabled, invalid phone format). The user needs to see the actual
        // error so they can fix it or contact admin.
        console.warn('[sendOTP] Firebase error:', result.error)
        // Show the error in an alert so the user sees it (mobile-friendly).
        // The error message from firebase.ts is already user-friendly.
        alert(`Could not send OTP: ${result.error}`)
      } else {
        setConfirmationResult(result.confirmationResult)
        setPhoneVerifyStep('otp')
      }
    } catch (err: any) {
      console.warn('[sendOTP] failed:', err)
      const errMsg = err?.message || 'Unknown error. Please try again.'
      alert(`Could not send OTP: ${errMsg}`)
    }
  }, [])

  const verifyOTP = useCallback(async (code: string) => {
    if (!confirmationResult) throw new Error('No OTP in flight. Please request a new code.')
    if (confirmationResult._mock) {
      if (code !== '123456') throw new Error('Wrong code. (Dev mode: use 123456)')
      setPhoneVerifyStep('done')
      return
    }
    const { verifyPhoneOTP } = await import('@/lib/firebase')
    const result = await verifyPhoneOTP(confirmationResult, code)
    if (!result.verified) throw new Error(result.error || 'Invalid code')
    setPhoneVerifyStep('done')
  }, [confirmationResult])

  // Fetch active broadcasts (admin announcements) from /api/broadcasts.
  // Show the most recent unread, un-dismissed one as a sticky banner.
  const fetchBroadcasts = useCallback(async () => {
    try {
      const res = await fetch('/api/broadcasts', { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      setBroadcasts(data.broadcasts || [])
    } catch {}
  }, [])

  // Pick the most recent unread + un-dismissed broadcast to surface as the banner.
  // When the active broadcast changes (e.g. admin posts a new announcement),
  // reset the expanded state to false so the new banner starts collapsed.
  useEffect(() => {
    if (broadcasts.length === 0) {
      setActiveBroadcast(null)
      setBroadcastExpanded(false)
      return
    }
    const next = broadcasts.find(b => !b.read && !dismissedBroadcasts.includes(b.id))
    setActiveBroadcast(prev => {
      // If the broadcast ID changed, reset the expanded state.
      if (prev?.id !== next?.id) {
        setBroadcastExpanded(false)
      }
      return next || null
    })
  }, [broadcasts, dismissedBroadcasts])

  // Initial broadcasts fetch — runs once on mount.
  useEffect(() => { fetchBroadcasts() }, [fetchBroadcasts])

  // (Vehicle requests fetch+refresh moved below — see fetchVehicleRequests
  // definition further down. The useEffect that calls it must be AFTER the
  // function definition, otherwise we hit a temporal-dead-zone error during
  // the production build: "Cannot access 'bK' before initialization".)

  // Dismiss a broadcast: add its id to the dismissedBroadcasts list in localStorage.
  const dismissBroadcast = useCallback((id: string) => {
    setDismissedBroadcasts(prev => {
      const next = [...prev, id]
      try { window.localStorage.setItem('dismissedBroadcasts', JSON.stringify(next)) } catch {}
      return next
    })
    setActiveBroadcast(null)
  }, [])

  const openListingDetail = (l: Listing) => {
    setListingDetail(l)
    trackView(l.id)
  }

  // Compress and resize image in the browser BEFORE upload.
  // This makes a 3MB photo become ~200KB — 15x faster upload + instant rendering.
  const compressImage = (file: File, maxDim: number = 1280, quality: number = 0.82): Promise<File> => {
    return new Promise((resolve, reject) => {
      // If it's already small enough, leave it alone
      if (file.size < 250_000) {
        resolve(file)
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new window.Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let { width, height } = img
          if (width > height && width > maxDim) {
            height = (height * maxDim) / width
            width = maxDim
          } else if (height > maxDim) {
            width = (width * maxDim) / height
            height = maxDim
          }
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            resolve(file)
            return
          }
          ctx.drawImage(img, 0, 0, width, height)
          // Use JPEG for photos (much smaller than PNG)
          const outType = file.type === 'image/png' && file.size > 500_000 ? 'image/jpeg' : file.type
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file)
                return
              }
              const compressed = new File([blob], file.name.replace(/\.(png|PNG)$/, '.jpg'), { type: outType })
              resolve(compressed)
            },
            outType,
            quality
          )
        }
        img.onerror = () => resolve(file)
        img.src = e.target?.result as string
      }
      reader.onerror = () => resolve(file)
      reader.readAsDataURL(file)
    })
  }

  // Upload multiple files in PARALLEL — with client-side compression first,
  // then upload each to Cloudinary via /api/upload.
  //
  // CRITICAL: We NO LONGER store base64 data URLs in the listing record.
  // Each base64 image is ~300KB of text; with 6 photos that's ~2.4MB per
  // listing — which caused POST /api/listings to fail (body too large for
  // Vercel/Turso) and GET /api/listings to return 43MB+ responses.
  //
  // Now each image is uploaded to Cloudinary immediately, and only the
  // short Cloudinary URL (~80 chars) is stored in sellForm.imageUrl.
  const handleMultiImageUpload = async (files: FileList | File[]) => {
    const fileArr = Array.from(files)
    if (fileArr.length === 0) return

    const currentImages = sellForm.imageUrl ? sellForm.imageUrl.split('|').filter(Boolean) : []
    const available = 8 - currentImages.length

    if (available <= 0) {
      alert('Maximum 8 photos reached. Remove one before adding more.')
      return
    }

    if (fileArr.length > available) {
      alert(`Only ${available} more photo(s) can be added (max 8 total). Uploading the first ${available}.`)
    }

    const toUpload = fileArr.slice(0, available)
    setUploading(true)

    try {
      // Step 1: Compress all images in parallel (in the browser).
      // This makes a 3MB photo become ~200KB — 15x faster upload.
      const compressedFiles = await Promise.all(
        toUpload.map(f => compressImage(f).catch(() => f))
      )

      // Step 2: Convert each compressed file to a base64 data URL
      // (needed to send to the /api/upload endpoint).
      const dataUrls = await Promise.all(
        compressedFiles.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = () => resolve('')
            reader.readAsDataURL(file)
          })
        })
      )

      // Step 3: Upload each data URL to Cloudinary via /api/upload.
      // All uploads run in parallel for speed — 6 images upload in roughly
      // the same time as 1 image (network round-trips overlap).
      const validDataUrls = dataUrls.filter(u => u !== '')
      const uploadResults = await Promise.all(
        validDataUrls.map(async (dataUrl) => {
          try {
            const res = await fetch('/api/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ image: dataUrl }),
            })
            if (!res.ok) {
              const err = await res.json().catch(() => ({}))
              console.error('[upload] failed:', err)
              return null
            }
            const data = await res.json()
            return data.url as string
          } catch (err) {
            console.error('[upload] network error:', err)
            return null
          }
        })
      )

      const newUrls = uploadResults.filter((u): u is string => u !== null && typeof u === 'string')

      if (newUrls.length > 0) {
        setSellForm(f => {
          const imgs = f.imageUrl ? f.imageUrl.split('|').filter(Boolean) : []
          // Only append Cloudinary URLs (https://...) — never base64 data URLs.
          // This keeps the listing record small and the POST fast.
          return { ...f, imageUrl: [...imgs, ...newUrls].join('|') }
        })
      } else {
        alert('Upload failed. Please try again with a smaller image.')
      }
    } catch (err: any) {
      console.error('[handleMultiImageUpload] failed:', err)
      alert(`Upload failed: ${err?.message || 'Unknown error'}. Please try again.`)
    } finally {
      setUploading(false)
    }
  }

  const submitSell = async () => {
    // Validate required fields
    if (!sellForm.sellerName || !sellForm.sellerPhone) {
      alert('Please fill in your name and phone number so buyers can contact you.')
      return
    }

    try {
      setUploading(true) // reuse the loading state during submit

      // Determine if this is an edit (editingListing is set) or a new listing
      const isEditing = !!editingListing
      const url = isEditing ? `/api/listings/${editingListing!.id}` : '/api/listings'
      const method = isEditing ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: sellForm.type,
          make: sellForm.make,
          model: sellForm.model,
          year: Number(sellForm.year),
          price: Number(sellForm.price),
          currency: 'SZL',
          fuelType: sellForm.fuelType,
          transmission: sellForm.transmission,
          mileage: Number(sellForm.mileage) || 0,
          color: sellForm.color || null,
          description: sellForm.description,
          imageUrl: sellForm.imageUrl || null,
          region: sellForm.region,
          sellerName: sellForm.sellerName,
          sellerPhone: sellForm.sellerPhone,
          sellerEmail: sellForm.sellerEmail || currentUser?.email || null,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `API returned ${res.status}`)
      }

      const data = await res.json()
      // Listing saved to Turso. Refresh from API to get the canonical record.
      const refreshed = await apiFetchListings()
      setListings(refreshed)
      setSellSubmitted(true)
      setEditingListing(null) // clear edit state
      setUploading(false)
      // Reset form for next time
      setSellForm({
        type: 'car', make: '', model: '', year: '', price: '', fuelType: 'petrol',
        transmission: 'manual', mileage: '', color: '', description: '', region: 'Manzini',
        sellerName: '', sellerPhone: '', sellerEmail: '', imageUrl: '',
      })
    } catch (err: any) {
      setUploading(false)
      console.error('[submitSell] failed:', err)
      // Properly stringify the error so the user sees what actually went wrong
      // instead of '[object Object]'. This was the bug: when `err` was an
      // object without a `.message` property (e.g., a fetch failure),
      // `err.message || err` returned the object itself, which stringified
      // to '[object Object]'.
      const errMsg =
        typeof err === 'string' ? err :
        err?.message ? err.message :
        err?.error && typeof err.error === 'string' ? err.error :
        err?.toString && typeof err.toString === 'function' && err.toString() !== '[object Object]' ? err.toString() :
        'Unknown error'
      alert(`Failed to post listing: ${errMsg}. Please try again.`)
    }
  }

  // Delete listing — calls the API to delete from Turso (syncs to all apps)
  // Users can only delete listings THEY created (matched by sellerEmail or sellerPhone).
  // Admin (via email allowlist) can delete any listing.
  const deleteListing = async (id: string) => {
    const listing = listings.find(l => l.id === id) || userListings.find(l => l.id === id)
    if (!listing) return

    const isAdmin = isAdminEmail(currentUser?.email)
    const isOwner = currentUser?.email && listing.sellerEmail === currentUser?.email
    // Allow delete if user is admin OR owns the listing
    if (!isAdmin && !isOwner) {
      alert('You can only delete listings that you created. If this is your listing, log in with the same email you used when posting.')
      return
    }

    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return

    try {
      const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `API returned ${res.status}`)
      }
      // Remove from local state immediately for instant UI feedback.
      // Defensive: ensure prev is always an array before calling .filter
      // (a stale localStorage value or a stray setState from elsewhere could
      // otherwise crash the page mid-delete with "r.filter is not a function").
      setUserListings(prev => (Array.isArray(prev) ? prev : []).filter(l => l.id !== id))
      setListings(prev => (Array.isArray(prev) ? prev : []).filter(l => l.id !== id))
      setSavedIds(prev => (Array.isArray(prev) ? prev : []).filter(sid => sid !== id))
    } catch (err: any) {
      console.error('[deleteListing] failed:', err)
      alert(`Failed to delete: ${err.message || err}`)
    }
  }

  // Edit listing — open the sell form pre-filled with the listing's data (owner or admin only)
  const editListing = (l: Listing) => {
    const isAdmin = isAdminEmail(currentUser?.email)
    const isOwner = currentUser?.email && l.sellerEmail === currentUser?.email
    if (!isAdmin && !isOwner) {
      alert('You can only edit listings that you created. Log in with the same email you used to post it.')
      return
    }
    setEditingListing(l)
    setSellForm({
      type: l.type as any, make: l.make, model: l.model, year: String(l.year), price: String(l.price),
      fuelType: l.fuelType, transmission: l.transmission, mileage: String(l.mileage),
      color: l.color || '', description: l.description, region: l.region,
      sellerName: l.sellerName, sellerPhone: l.sellerPhone, sellerEmail: l.sellerEmail || '',
      imageUrl: l.imageUrl || '',
    })
    setSellOpen(true)
  }

  // Edit listing
  const startEdit = (listing: Listing) => editListing(listing)

  // Register new user
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', phone: '', password: '', username: '' })
  const submitRegister = async () => {
    if (!registerForm.email || !registerForm.name) return
    // If we're in the OTP step, verify the code first.
    if (phoneVerifyStep === 'otp') {
      try {
        await verifyOTP(otpCode)
      } catch (err: any) {
        alert(`OTP verification failed: ${err.message || err}`)
        return
      }
    }
    try {
      // Auto-generate a username from the email prefix if the user didn't
      // type one. This is the most common case — most users don't bother
      // choosing a separate username. The username must be 3-20 chars,
      // alphanumeric + underscores only, so we sanitize the email prefix.
      let username = registerForm.username.trim()
      if (!username) {
        const emailPrefix = registerForm.email.split('@')[0]
        // Sanitize: keep only letters, numbers, underscores. Truncate to 20 chars.
        username = emailPrefix.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase().slice(0, 20)
        // If the sanitized prefix is too short (< 3 chars), pad with random digits
        // so it meets the API's 3-char minimum requirement.
        if (username.length < 3) {
          username = (username + 'user' + Math.floor(Math.random() * 1000)).slice(0, 20)
        }
      }
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: registerForm.name,
          email: registerForm.email,
          phone: registerForm.phone,
          password: registerForm.password,
          username,
          phoneVerified: phoneVerifyStep === 'done',
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `API returned ${res.status}`)
      }
      const data = await res.json()
      const newUser: User = {
        email: data.user.email,
        name: data.user.name,
        phone: data.user.phone || '',
        role: (data.user.role as User['role']) || 'user',
        createdAt: data.user.createdAt || new Date().toISOString()
      }
      setCurrentUser(newUser)
      localStorage.setItem('ec_user', JSON.stringify(newUser))
      setShowRegister(false)
      setRegisterForm({ name: '', email: '', phone: '', password: '', username: '' })
      setPhoneVerifyStep('form')
      setOtpCode('')
      setConfirmationResult(null)
    } catch (err: any) {
      alert(`Registration failed: ${err.message || err}. Please try again.`)
    }
  }

  // Login
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '', password: '', newPassword: '' })
  const submitLogin = async () => {
    if (!loginEmail) return
    try {
      // Admin emails authenticate via a shared admin PIN (not a per-user password).
      // For admin emails we send { email, adminPin } and the server creates/updates
      // the admin user record on the fly. For regular users we send { email, password }.
      // This mirrors the pre-auth-migration behavior — restoring it because the
      // simplified version was sending { email, password } for everyone, which
      // caused admin emails to be rejected with "Wrong Admin PIN".
      const isAdmin = isAdminEmail(loginEmail)
      const payload: any = { email: loginEmail }
      if (isAdmin) {
        payload.adminPin = ADMIN_PIN
      } else {
        payload.password = loginPassword
      }
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `API returned ${res.status}`)
      }
      const data = await res.json()
      const user: User = {
        email: data.user.email,
        name: data.user.name || data.user.email.split('@')[0],
        phone: data.user.phone || '',
        role: (data.user.role as User['role']) || 'user',
        createdAt: data.user.createdAt || new Date().toISOString()
      }
      setCurrentUser(user)
      localStorage.setItem('ec_user', JSON.stringify(user))
      setShowLogin(false)
      setLoginEmail('')
      setLoginPassword('')
      // Admin users land directly on the admin dashboard after login (matches
      // the pre-auth-migration behavior).
      if (user.role === 'admin') setView('admin')
    } catch (err: any) {
      alert(`Login failed: ${err.message || err}. Please try again.`)
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch {}
    setCurrentUser(null)
    localStorage.removeItem('ec_user')
  }

  // Load user from localStorage on mount + verify session cookie against server.
  // The server is the source of truth — if the cookie is still alive we trust it
  // over the localStorage snapshot (handles "logged in on this browser" across reloads
  // and clears the local user if the session has expired).
  useEffect(() => {
    const saved = localStorage.getItem('ec_user')
    if (saved) {
      try { setCurrentUser(JSON.parse(saved)) } catch {}
    }
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.user) {
          const u: User = {
            email: data.user.email,
            name: data.user.name || data.user.email.split('@')[0],
            phone: data.user.phone || '',
            role: (data.user.role as User['role']) || 'user',
            createdAt: data.user.createdAt || new Date().toISOString(),
          }
          setCurrentUser(u)
          localStorage.setItem('ec_user', JSON.stringify(u))
        }
      })
      .catch(() => {})
  }, [])

  // Vehicle Request form
  // `editingRequestId` is null when creating a new request, or set to an
  // existing request's id when editing. The same form/dialog is reused for
  // both flows — only the button label and submit handler differ.
  const [requestForm, setRequestForm] = useState({
    requesterName: '', requesterEmail: '', requesterPhone: '',
    vehicleType: 'car', make: '', model: '', minBudget: '', maxBudget: '',
    fuelType: 'any', transmission: 'any', region: 'Manzini', description: '',
  })
  const [requestSubmitted, setRequestSubmitted] = useState(false)
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null)
  const [submittingRequest, setSubmittingRequest] = useState(false)
  const [deletingRequestId, setDeletingRequestId] = useState<string | null>(null)

  // Fetch vehicle requests from the API. Called on mount + every 30s so the
  // user sees new requests other people have submitted, AND their own
  // requests survive a page refresh (previously requests were only held in
  // local React state, so they vanished on refresh — that was the bug).
  const fetchVehicleRequests = useCallback(async () => {
    try {
      const res = await fetch('/api/requests', { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data?.requests)) {
        setVehicleRequests(data.requests)
      }
    } catch {
      // Silent failure — don't crash the page if the API is unreachable.
    }
  }, [])

  // Initial vehicle requests fetch + 30s auto-refresh.
  // This is what makes "My Requests" actually work — without it, requests are
  // only held in local React state and disappear on page refresh. With this,
  // requests are pulled from the server on mount and re-synced every 30s so
  // the user always sees their own (and other people's) requests, even
  // after closing and reopening the app.
  // (Must come AFTER fetchVehicleRequests definition to avoid temporal dead
  // zone error during production build.)
  useEffect(() => {
    fetchVehicleRequests()
    const interval = setInterval(() => {
      fetchVehicleRequests()
    }, 30000) // 30s — same cadence as listings refresh
    return () => clearInterval(interval)
  }, [fetchVehicleRequests])

  // Submit a NEW vehicle request — POSTs to the API which persists to Turso.
  // Previously this just did `setVehicleRequests(prev => [newRequest, ...prev])`
  // which only held the request in local React state. On refresh, state was
  // wiped and the user's request was gone. Now we POST to /api/requests and
  // let the server assign the real id (cuid), then re-fetch the full list so
  // the UI reflects the actual DB state.
  const submitRequest = async () => {
    if (submittingRequest) return
    setSubmittingRequest(true)
    try {
      // If editing an existing request, route to PATCH instead of POST.
      if (editingRequestId) {
        const res = await fetch(`/api/requests/${editingRequestId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            requesterName: requestForm.requesterName,
            requesterPhone: requestForm.requesterPhone,
            vehicleType: requestForm.vehicleType,
            make: requestForm.make,
            model: requestForm.model,
            minBudget: requestForm.minBudget,
            maxBudget: requestForm.maxBudget,
            fuelType: requestForm.fuelType,
            transmission: requestForm.transmission,
            region: requestForm.region,
            description: requestForm.description,
          }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || `API returned ${res.status}`)
        }
        setRequestSubmitted(true)
        setEditingRequestId(null)
      } else {
        // Creating a new request — POST to /api/requests.
        const res = await fetch('/api/requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            requesterName: requestForm.requesterName,
            requesterEmail: requestForm.requesterEmail,
            requesterPhone: requestForm.requesterPhone,
            vehicleType: requestForm.vehicleType,
            make: requestForm.make,
            model: requestForm.model,
            minBudget: requestForm.minBudget,
            maxBudget: requestForm.maxBudget,
            fuelType: requestForm.fuelType,
            transmission: requestForm.transmission,
            region: requestForm.region,
            description: requestForm.description,
          }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || `API returned ${res.status}`)
        }
        setRequestSubmitted(true)
      }
      // Re-fetch the full list so the UI reflects the new/edited request
      // exactly as the server has it (server assigns id, timestamps, etc.).
      await fetchVehicleRequests()
      // Reset the form for next time.
      setRequestForm({
        requesterName: '', requesterEmail: '', requesterPhone: '',
        vehicleType: 'car', make: '', model: '', minBudget: '', maxBudget: '',
        fuelType: 'any', transmission: 'any', region: 'Manzini', description: '',
      })
    } catch (err: any) {
      alert(`Failed to submit request: ${err.message || err}. Please try again.`)
    } finally {
      setSubmittingRequest(false)
    }
  }

  // Open the request dialog in EDIT mode — pre-fills the form with the
  // existing request's data and sets editingRequestId so submitRequest knows
  // to PATCH instead of POST.
  const openEditRequest = (req: VehicleRequest) => {
    setEditingRequestId(req.id)
    setRequestSubmitted(false)
    setRequestForm({
      requesterName: req.requesterName,
      requesterEmail: req.requesterEmail,
      requesterPhone: req.requesterPhone || '',
      vehicleType: req.vehicleType,
      make: req.make || '',
      model: req.model || '',
      minBudget: req.minBudget || '',
      maxBudget: req.maxBudget || '',
      fuelType: req.fuelType || 'any',
      transmission: req.transmission || 'any',
      region: req.region,
      description: req.description || '',
    })
    setShowRequest(true)
  }

  // Open the request dialog in CREATE mode — clears any previous edit state
  // and pre-fills with the logged-in user's email/name if available.
  const openNewRequest = () => {
    setEditingRequestId(null)
    setRequestSubmitted(false)
    setRequestForm({
      requesterName: currentUser?.name || '',
      requesterEmail: currentUser?.email || '',
      requesterPhone: currentUser?.phone || '',
      vehicleType: 'car',
      make: '', model: '', minBudget: '', maxBudget: '',
      fuelType: 'any', transmission: 'any',
      region: 'Manzini', description: '',
    })
    setShowRequest(true)
  }

  // Delete a vehicle request by id. Asks for confirmation first because this
  // is a destructive action. Calls DELETE /api/requests/[id] which enforces
  // ownership (only the original requester or an admin can delete).
  const deleteRequest = async (id: string) => {
    if (!window.confirm('Delete this request? This cannot be undone.')) return
    setDeletingRequestId(id)
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `API returned ${res.status}`)
      }
      // Optimistically remove from local state for instant UI feedback.
      // fetchVehicleRequests will run on next 30s tick to reconcile.
      setVehicleRequests(prev => (Array.isArray(prev) ? prev : []).filter(r => r.id !== id))
    } catch (err: any) {
      alert(`Failed to delete request: ${err.message || err}. Please try again.`)
    } finally {
      setDeletingRequestId(null)
    }
  }

  // Contact Admin — full bidirectional messaging.
  // Previously submitContact/respondToMessage only updated local React state,
  // so messages vanished on refresh and never reached the other party.
  // Now ALL three operations (send new, admin reply, user reply) call the API
  // which persists to Turso DB via the ContactMessage + ContactReply models.
  const [contactForm, setContactForm] = useState({ subject: '', message: '' })
  const [contactSubmitted, setContactSubmitted] = useState(false)
  const [sendingReply, setSendingReply] = useState<string | null>(null) // tracks which thread is currently sending

  // Fetch messages from the API. Server returns:
  //   - For admin: ALL messages (with replies)
  //   - For regular user: only their own messages (with replies)
  // This is what makes the inbox work — without it, messages are only in
  // local React state and disappear on refresh.
  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch('/api/messages', { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data?.messages)) {
        setAdminMessages(data.messages)
      }
    } catch {
      // Silent failure — don't crash the page if the API is unreachable.
    }
  }, [])

  // Initial messages fetch + 30s auto-refresh so new admin replies appear
  // without the user having to manually reload. Same cadence as listings.
  //
  // CRITICAL: This useEffect depends on `currentUser` so that it RE-RUNS
  // whenever the user logs in or out. Without this dependency, fetchMessages
  // would only run once on mount (when the user is not yet authenticated)
  // and return 401 — leaving the inbox empty until the next 30s tick.
  // This was the bug: user logs in → sees "You haven't sent any messages yet"
  // even though they HAVE sent messages, just because fetchMessages ran
  // before the session cookie was established.
  // MUST come AFTER fetchMessages definition to avoid temporal dead zone.
  useEffect(() => {
    // Only fetch if there's a logged-in user. The /api/messages endpoint
    // returns 401 for unauthenticated requests, so fetching when logged
    // out is wasteful and would log errors.
    if (!currentUser) {
      setAdminMessages([])
      return
    }
    fetchMessages()
    const interval = setInterval(() => {
      fetchMessages()
    }, 30000) // 30s
    return () => clearInterval(interval)
  }, [fetchMessages, currentUser])

  // Submit a NEW message to admin — POSTs to /api/messages which persists
  // to Turso DB. Then re-fetches the full list so the UI reflects the actual
  // DB state (server assigns id, timestamp, etc.).
  const submitContact = async () => {
    if (!currentUser) {
      setShowLogin(true)
      return
    }
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          subject: contactForm.subject,
          message: contactForm.message,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `API returned ${res.status}`)
      }
      setContactSubmitted(true)
      setContactForm({ subject: '', message: '' })
      // Re-fetch so the new message appears in the inbox immediately
      // with its real server-assigned id.
      await fetchMessages()
    } catch (err: any) {
      const errMsg =
        typeof err === 'string' ? err :
        err?.message ? err.message :
        err?.error && typeof err.error === 'string' ? err.error :
        'Unknown error'
      alert(`Failed to send message: ${errMsg}. Please try again.`)
    }
  }

  // Send a reply on an EXISTING message thread.
  // Used by BOTH admin (responding to user) AND user (replying to admin's
  // response). The server determines the sender based on the session role:
  //   - admin session → sender = 'admin'
  //   - user session → sender = 'user'
  // The reply is persisted as a new ContactReply row linked to the message.
  const sendReply = useCallback(async (messageId: string, text: string) => {
    if (!text.trim()) return
    setSendingReply(messageId)
    try {
      const res = await fetch('/api/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: messageId, response: text }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `API returned ${res.status}`)
      }
      // Re-fetch so the new reply appears in the thread immediately
      // with its real server-assigned id + timestamp + sender.
      await fetchMessages()
    } catch (err: any) {
      const errMsg =
        typeof err === 'string' ? err :
        err?.message ? err.message :
        err?.error && typeof err.error === 'string' ? err.error :
        'Unknown error'
      alert(`Failed to send reply: ${errMsg}. Please try again.`)
    } finally {
      setSendingReply(null)
    }
  }, [fetchMessages])

  // Legacy alias for backwards compat with the AdminPanel component prop.
  // The admin "respond to message" flow now routes through sendReply (which
  // calls PATCH /api/messages and persists the reply to the DB).
  const respondToMessage = useCallback((id: string, response: string) => {
    sendReply(id, response)
  }, [sendReply])

  // Admin: add team member
  const [newAdminForm, setNewAdminForm] = useState({ email: '', name: '', permissions: ['view', 'delete'] })
  const addAdmin = () => {
    const newMember: AdminTeamMember = {
      email: newAdminForm.email,
      name: newAdminForm.name,
      role: 'minor_admin',
      permissions: newAdminForm.permissions,
      addedAt: new Date().toISOString(),
    }
    setAdminTeam(prev => [...prev, newMember])
    setShowAddAdmin(false)
    setNewAdminForm({ email: '', name: '', permissions: ['view', 'delete'] })
  }

  // Admin: remove team member
  const removeAdmin = (email: string) => {
    if (!confirm(`Remove ${email} from admin team?`)) return
    setAdminTeam(prev => prev.filter(m => m.email !== email))
  }

  return (
    <div className="min-h-screen bg-navy-fade-vertical text-slate-100 flex flex-col">
      {/* SCHEMA.ORG STRUCTURED DATA — so Google rich-results can index this marketplace */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Eswatini Cars',
            url: 'https://eswatinicars.co.sz',
            description: "Eswatini's #1 managed vehicle marketplace. Safe, verified, broker-supervised viewings across all four regions of Eswatini.",
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://eswatinicars.co.sz/?q={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
            publisher: {
              '@type': 'Organization',
              name: 'Eswatini Cars',
              logo: { '@type': 'ImageObject', url: 'https://eswatinicars.co.sz/logo.png' },
            },
          }),
        }}
      />

      {/* BROADCAST BANNER — top-priority admin announcements.
          Tappable to expand/collapse so long messages don't get cut off.

          - Collapsed (default): shows title + first line of message + chevron icon
            (chevron-down = "tap to read more")
          - Expanded (after tap): shows the full message, chevron-up = "tap to collapse"

          The whole banner (except the X dismiss button) is the tap target,
          so users don't have to aim for a small button — they just tap the
          announcement anywhere. The X button still works for dismissing
          (separate tap target). */}
      {activeBroadcast && (
        <div
          className="bg-gradient-to-r from-amber-500/90 via-amber-500 to-amber-400/90 text-slate-900 text-sm border-b border-amber-600/40 shadow-md z-40"
        >
          <div className="px-4 py-2.5 flex items-center gap-3">
            <Megaphone className="w-5 h-5 flex-shrink-0" />
            {/* Tap target: tap anywhere on the title/message area to expand/collapse */}
            <button
              type="button"
              onClick={() => setBroadcastExpanded(prev => !prev)}
              className="flex-1 min-w-0 text-left cursor-pointer hover:opacity-90 transition-opacity"
              aria-expanded={broadcastExpanded}
              aria-label={broadcastExpanded ? 'Collapse announcement' : 'Expand announcement to read more'}
            >
              <div className="font-bold text-xs uppercase tracking-wide truncate">{activeBroadcast.title}</div>
              {broadcastExpanded ? (
                // Expanded: show the FULL message, no clamp. Whitespace-pre-wrap
                // preserves line breaks the admin typed. break-words prevents
                // long URLs from overflowing horizontally on mobile.
                <div className="text-[12px] opacity-95 mt-0.5 whitespace-pre-wrap break-words">{activeBroadcast.message}</div>
              ) : (
                // Collapsed: show only the first line. The chevron hint below
                // tells the user there's more to read.
                <div className="text-[12px] opacity-90 truncate">{activeBroadcast.message}</div>
              )}
              {/* Tap hint: shows "Tap to read more ▾" when collapsed,
                  "Tap to collapse ▴" when expanded. Tiny text so it
                  doesn't dominate the banner but is still discoverable. */}
              <div className="text-[10px] opacity-70 mt-1 flex items-center gap-1 font-semibold">
                {broadcastExpanded ? (
                  <>
                    <ChevronUp className="w-3 h-3" />
                    <span>Tap to collapse</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    <span>Tap to read more</span>
                  </>
                )}
              </div>
            </button>
            {/* Dismiss button (separate tap target — doesn't toggle expand) */}
            <button
              onClick={() => dismissBroadcast(activeBroadcast.id)}
              className="bg-black/20 hover:bg-black/40 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 transition-colors"
              aria-label="Dismiss announcement"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* HEADER — navy blue fade */}
      <header className="bg-navy-fade text-white py-4 px-4 shadow-xl border-b-4 border-sky-500 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('browse')}>
            <img src="/logo.png" alt="ESWATINI CARS" className="w-10 h-10 rounded-full" />
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight leading-none">ESWATINI CARS</h1>
              <p className="text-[10px] text-slate-300 uppercase tracking-widest">Managed Vehicle Marketplace</p>
            </div>
          </div>
          <nav className="flex items-center gap-1 md:gap-2 text-sm flex-wrap">
            <Button variant="ghost" size="sm" onClick={() => setView('browse')} className={view === 'browse' ? 'bg-white/10' : ''}><Car className="w-4 h-4 mr-1" /> Browse</Button>
            <Button variant="ghost" size="sm" onClick={() => currentUser ? setView('saved') : setShowLogin(true)} className={`${view === 'saved' ? 'bg-white/10' : ''} ${!currentUser ? 'opacity-40' : ''}`}>
              <Heart className="w-4 h-4 mr-1" /> Saved
              {savedIds.length > 0 && <Badge className="ml-1 bg-sky-500 text-slate-900 text-[10px] px-1.5 py-0">{savedIds.length}</Badge>}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setView('requests')} className={view === 'requests' ? 'bg-white/10' : ''}>
              <Search className="w-4 h-4 mr-1" /> Requests
              {vehicleRequests.length > 0 && <Badge className="ml-1 bg-sky-500 text-white text-[10px] px-1.5 py-0">{vehicleRequests.length}</Badge>}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => currentUser ? setView('messages') : setShowLogin(true)} className={`${view === 'messages' ? 'bg-white/10' : ''} ${currentUser ? '' : 'opacity-40'}`}>
              <Mail className="w-4 h-4 mr-1" /> Messages
              {/* Unread badge: count admin replies the user hasn't seen yet.
                  We approximate "unread" as conversations where status === 'responded'
                  (meaning admin has replied at least once). */}
              {currentUser && (() => {
                const unread = adminMessages.filter(m => m.status === 'responded').length
                return unread > 0 ? <Badge className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0">{unread}</Badge> : null
              })()}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setView('how')} className={view === 'how' ? 'bg-white/10' : ''}>How It Works</Button>
            {currentUser ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/70 hidden md:inline">Hi, {currentUser.name}</span>
                <Button variant="ghost" size="sm" onClick={logout} className="text-red-400 hover:text-red-300">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setShowLogin(true)} className="text-sky-300">
                <Users className="w-4 h-4 mr-1" /> Login
              </Button>
            )}
            <Button size="sm" className="bg-sky-500 text-white hover:bg-sky-400 hover:shadow-lg hover:shadow-sky-500/30 transition-all font-semibold" onClick={() => setSellOpen(true)}>
              <Plus className="w-4 h-4 mr-1" /> Sell
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full space-y-6">
        {view === 'browse' && (
          <>
            {/* HERO — navy blue fade with floating orbs and gradient text */}
            <section className="bg-navy-fade-radial text-white rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden">
              {/* Decorative floating orbs */}
              <div className="absolute top-10 right-10 w-32 h-32 bg-sky-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-10 left-10 w-40 h-40 bg-blue-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
              {/* Dot grid */}
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 2px, transparent 2px)', backgroundSize: '30px 30px' }} />
              <div className="relative">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 mb-4 text-xs text-sky-300 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Eswatini's #1 Managed Vehicle Marketplace
                </div>
                {/* Gradient title */}
                <h2 className="text-3xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-white via-sky-200 to-sky-400 bg-clip-text text-transparent leading-tight">
                  Find your next vehicle in Eswatini
                </h2>
                <p className="text-slate-300 mb-6 text-sm md:text-base">Safe. Verified. Broker-managed viewings. No scammers.</p>

                {/* Quick stats bar */}
                <div className="flex flex-wrap gap-4 mb-6 text-xs">
                  <div className="flex items-center gap-1.5 text-white/70">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span><b className="text-white">{listings.length}</b> vehicles listed</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/70">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                    <span><b className="text-white">100%</b> Verified</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/70">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span><b className="text-white">Free</b> to list</span>
                  </div>
                </div>

                {/* Single collapsible search button */}
                <button
                  onClick={() => setSearchOpen(o => !o)}
                  className="w-full bg-sky-500 hover:bg-sky-400 text-white rounded-full px-5 py-3 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:shadow-sky-500/30 transition-all font-semibold"
                >
                  <Search className="w-5 h-5" />
                  <span>{searchOpen ? 'Hide filters' : 'SEARCH'}</span>
                </button>

                {/* Expandable search panel */}
                {searchOpen && (
                  <div className="mt-3 bg-slate-900/80 backdrop-blur-md rounded-3xl p-4 md:p-5 grid grid-cols-1 md:grid-cols-12 gap-3 shadow-lg border border-white/10 animate-[fade-in_0.3s_ease-out]">
                    <div className="md:col-span-5 flex flex-col gap-1">
                      <label className="text-[10px] uppercase tracking-wide text-sky-300 font-semibold">Search keyword</label>
                      <Input placeholder="e.g. Toyota, Hilux, White..." value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchListings()} className="rounded-xl bg-white/10 border-white/20 text-white placeholder:text-slate-400" />
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-1">
                      <label className="text-[10px] uppercase tracking-wide text-sky-300 font-semibold">Vehicle Type</label>
                      <Select value={type} onValueChange={setType}>
                        <SelectTrigger className="rounded-xl bg-white/10 border-white/20 text-white"><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>{TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-1">
                      <label className="text-[10px] uppercase tracking-wide text-sky-300 font-semibold">Fuel Type</label>
                      <Select value={fuel} onValueChange={setFuel}>
                        <SelectTrigger className="rounded-xl bg-white/10 border-white/20 text-white"><SelectValue placeholder="Select fuel" /></SelectTrigger>
                        <SelectContent>{FUELS.map(f => <SelectItem key={f} value={f}>{f === 'all' ? 'All fuels' : f.charAt(0).toUpperCase() + f.slice(1)}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-1">
                      <label className="text-[10px] uppercase tracking-wide text-sky-300 font-semibold">Transmission</label>
                      <Select value={transmission} onValueChange={setTransmission}>
                        <SelectTrigger className="rounded-xl bg-white/10 border-white/20 text-white"><SelectValue placeholder="Select transmission" /></SelectTrigger>
                        <SelectContent>{TRANSMISSIONS.map(t => <SelectItem key={t} value={t}>{t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    {/* Removed the "Go" button — auto-search works via useEffect when filters change */}

                    <div className="md:col-span-12 flex flex-wrap gap-3 items-center pt-2 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] uppercase tracking-wide text-sky-300 font-semibold">Region</label>
                        <select value={region} onChange={e => setRegion(e.target.value)} className="bg-white/10 border border-white/20 rounded-full px-3 py-1.5 text-sm text-white">
                          {REGIONS.map(r => <option key={r} value={r} className="text-slate-900">{r === 'all' ? 'All regions' : r}</option>)}
                        </select>
                      </div>
                      <div className="flex items-center gap-1">
                        <label className="text-[10px] uppercase tracking-wide text-sky-300 font-semibold">Min price</label>
                        <Input placeholder="0" type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 w-28 rounded-full" />
                      </div>
                      <div className="flex items-center gap-1">
                        <label className="text-[10px] uppercase tracking-wide text-sky-300 font-semibold">Max price</label>
                        <Input placeholder="Any" type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 w-28 rounded-full" />
                      </div>
                      <Button size="sm" variant="ghost" className="text-sky-300 hover:bg-white/10 rounded-full" onClick={() => { setQ(''); setType('all'); setFuel('all'); setTransmission('all'); setRegion('all'); setMinPrice(''); setMaxPrice(''); }}>
                        Clear all
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* CATEGORY TILES — compact glassmorphism cards */}
            <FadeIn>
            <section>
              <h3 className="text-sm font-semibold mb-3 text-white/80 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" /> Categories
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {TYPES.filter(t => t.value !== 'all').map((t, i) => {
                  const Icon = t.icon
                  const count = listings.filter(l => l.type === t.value).length
                  const isActive = type === t.value
                  return (
                    <button
                      key={t.value}
                      onClick={() => setType(isActive ? 'all' : t.value)}
                      className={`group relative overflow-hidden rounded-2xl p-3 text-center transition-all duration-300 ${
                        isActive
                          ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30 scale-105'
                          : 'bg-white/5 backdrop-blur-md border border-white/10 text-white/70 hover:bg-white/10 hover:border-sky-400/50 hover:scale-105'
                      }`}
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      {/* Glow effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/0 via-sky-500/0 to-sky-500/0 group-hover:from-sky-500/10 group-hover:to-transparent transition-all duration-500" />
                      <div className="relative z-10">
                        <div className={`w-8 h-8 mx-auto mb-1.5 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-white/20' : 'bg-white/5 group-hover:bg-sky-500/20'}`}>
                          <Icon className="w-4 h-4" strokeWidth={2} />
                        </div>
                        <div className="text-[10px] font-semibold leading-tight">{t.label}</div>
                        <div className={`text-[9px] mt-0.5 ${isActive ? 'text-white/70' : 'text-slate-400'}`}>{count} listed</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </section>
            </FadeIn>

            {/* ALL LISTINGS — main grid (top to bottom) */}
            <FadeIn>
            <section>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <Car className="w-4 h-4 text-sky-400" /> All Vehicles
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-white text-xs font-semibold bg-sky-500/20 border border-sky-500/40 rounded-full px-3 py-1">{listings.length} {listings.length === 1 ? 'vehicle' : 'vehicles'}</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'recent' | 'price-low' | 'price-high')}
                    className="bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs text-white"
                  >
                    <option value="recent" className="text-slate-900">Most Recent</option>
                    <option value="price-low" className="text-slate-900">Price: Low to High</option>
                    <option value="price-high" className="text-slate-900">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <img src="/logo.png" alt="Eswatini Cars" className="w-20 h-20 rounded-full shadow-2xl shadow-sky-500/30 animate-[fade-in_0.6s_ease-out]" />
                  <div className="text-center">
                    <div className="text-lg font-bold text-white tracking-tight">Loading Eswatini Cars...</div>
                    <div className="text-xs text-slate-400 mt-1">Fetching the latest listings</div>
                  </div>
                  {/* Animated bouncing dots */}
                  <div className="flex gap-1.5 mt-2">
                    <span className="w-2.5 h-2.5 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2.5 h-2.5 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2.5 h-2.5 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              ) : listings.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center text-slate-500">
                    <Car className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    No vehicles match your filters.
                    <div className="mt-3">
                      <Button size="sm" variant="outline" onClick={() => { setQ(''); setType('all'); setFuel('all'); setTransmission('all'); setRegion('all'); setMinPrice(''); setMaxPrice(''); fetchListings(); }}>
                        Clear filters
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {listings.map(l => <ListingCard key={l.id} listing={l} saved={savedIds.includes(l.id)} onToggleSave={toggleSave} onClick={() => openListingDetail(l)} onEnquire={(id) => { setEnquiryOpen(id); setEnqSubmitted(false); }} />)}
                </div>
              )}
            </section>
            </FadeIn>

            {/* FEATURED — horizontal scrolling carousel at the bottom */}
            {featuredListings.length > 0 && (
              <FadeIn>
              <section className="rounded-3xl border border-sky-500/30 bg-gradient-to-br from-sky-500/5 to-transparent p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-sky-400 uppercase tracking-widest flex items-center gap-2">
                    <Star className="w-4 h-4 text-sky-400 fill-sky-400" /> ⭐ Featured this week
                  </h3>
                  <div className="flex gap-1">
                    <button onClick={() => document.getElementById('featured-carousel')?.scrollBy({ left: -300, behavior: 'smooth' })} className="bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-white transition-colors">←</button>
                    <button onClick={() => document.getElementById('featured-carousel')?.scrollBy({ left: 300, behavior: 'smooth' })} className="bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-white transition-colors">→</button>
                  </div>
                </div>
                <div id="featured-carousel" className="flex gap-4 overflow-x-auto pb-3 scroll-smooth snap-x" style={{ scrollbarWidth: 'thin', scrollbarColor: '#0ea5e9 transparent' }}>
                  {featuredListings.map(l => (
                    <div key={l.id} className="flex-shrink-0 w-72 snap-center">
                      <ListingCard listing={l} saved={savedIds.includes(l.id)} onToggleSave={toggleSave} onClick={() => openListingDetail(l)} onEnquire={(id) => { setEnquiryOpen(id); setEnqSubmitted(false); }} />
                    </div>
                  ))}
                </div>
              </section>
              </FadeIn>
            )}

            {/* PRICE DROP ALERTS — surfaces listings whose price has dropped since last visit */}
            {priceDrops.length > 0 && (
              <FadeIn>
              <section className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" /> Price Drops
                  </h3>
                  <button onClick={() => setPriceDrops([])} className="text-[10px] text-slate-400 hover:text-white">Dismiss all</button>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-3 scroll-smooth snap-x" style={{ scrollbarWidth: 'thin' }}>
                  {priceDrops.map(d => {
                    const l = listings.find(x => x.id === d.id)
                    return (
                      <div key={d.id} className="flex-shrink-0 w-72 snap-center">
                        <Card className="overflow-hidden cursor-pointer hover:border-emerald-400/50 transition-colors" onClick={() => l && openListingDetail(l)}>
                          <div className="aspect-video bg-slate-200 dark:bg-slate-800 relative">
                            {d.imageUrl ? <img src={d.imageUrl.split('|')[0]} alt={`${d.make} ${d.model}`} className="w-full h-full object-cover" /> : <Car className="w-10 h-10 text-slate-400 m-auto mt-[calc(50%-20px)]" />}
                            <Badge className="absolute top-2 left-2 bg-emerald-500 text-white">-{Math.round((1 - d.newPrice / d.oldPrice) * 100)}%</Badge>
                          </div>
                          <CardContent className="p-3">
                            <div className="font-bold text-sm">{d.make} {d.model}</div>
                            <div className="flex items-baseline gap-2 mt-1">
                              <span className="text-emerald-500 font-bold">{fmt(d.newPrice)}</span>
                              <span className="text-xs text-slate-500 line-through">{fmt(d.oldPrice)}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )
                  })}
                </div>
              </section>
              </FadeIn>
            )}

            {/* RECENTLY VIEWED — horizontal carousel of listings the user has opened */}
            {recentlyViewed.length > 0 && (
              <FadeIn>
              <section className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white/80 uppercase tracking-widest flex items-center gap-2">
                    <History className="w-4 h-4 text-sky-400" /> Recently Viewed
                  </h3>
                  <div className="flex gap-1">
                    <button onClick={() => document.getElementById('recent-carousel')?.scrollBy({ left: -300, behavior: 'smooth' })} className="bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-white transition-colors">←</button>
                    <button onClick={() => document.getElementById('recent-carousel')?.scrollBy({ left: 300, behavior: 'smooth' })} className="bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-white transition-colors">→</button>
                  </div>
                </div>
                <div id="recent-carousel" className="flex gap-4 overflow-x-auto pb-3 scroll-smooth snap-x" style={{ scrollbarWidth: 'thin' }}>
                  {recentlyViewed.map(l => (
                    <div key={l.id} className="flex-shrink-0 w-72 snap-center">
                      <ListingCard listing={l} saved={savedIds.includes(l.id)} onToggleSave={toggleSave} onClick={() => openListingDetail(l)} onEnquire={(id) => { setEnquiryOpen(id); setEnqSubmitted(false); }} />
                    </div>
                  ))}
                </div>
              </section>
              </FadeIn>
            )}

            {/* WHY IT WORKS — modern feature cards */}
            <FadeIn>
            <section className="relative">
              <h3 className="text-sm font-semibold mb-3 text-white/80 uppercase tracking-widest flex items-center gap-2">
                <Award className="w-4 h-4 text-sky-400" /> Why Choose Us
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Card 1 */}
                <div className="group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-sky-400/50 transition-all duration-300 hover:scale-[1.02]">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all" />
                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center mb-3">
                      <ShieldCheck className="w-5 h-5 text-sky-400" />
                    </div>
                    <div className="font-bold mb-1 text-white text-sm">Seller info stays private</div>
                    <div className="text-slate-400 text-xs leading-relaxed">Phone numbers are never published. All enquiries come to our team first.</div>
                  </div>
                </div>
                {/* Card 2 */}
                <div className="group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-sky-400/50 transition-all duration-300 hover:scale-[1.02]">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-3">
                      <Eye className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="font-bold mb-1 text-white text-sm">Verified viewings</div>
                    <div className="text-slate-400 text-xs leading-relaxed">A Eswatini Cars representative is present at every test drive.</div>
                  </div>
                </div>
                {/* Card 3 */}
                <div className="group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-sky-400/50 transition-all duration-300 hover:scale-[1.02]">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center mb-3">
                      <Handshake className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="font-bold mb-1 text-white text-sm">Pay only on success</div>
                    <div className="text-slate-400 text-xs leading-relaxed">No upfront fees. Commission is settled in person, on the spot, only if the car sells.</div>
                  </div>
                </div>
              </div>
            </section>
            </FadeIn>
          </>
        )}

        {view === 'saved' && (
          <section>
            <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500" /> Saved vehicles
            </h2>
            {savedListings.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center text-slate-500">
                  <Heart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  No saved vehicles yet.
                  <div className="mt-3">
                    <Button size="sm" onClick={() => setView('browse')}>Browse listings</Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {savedListings.map(l => <ListingCard key={l.id} listing={l} saved={true} onToggleSave={toggleSave} onClick={() => openListingDetail(l)} onEnquire={(id) => { setEnquiryOpen(id); setEnqSubmitted(false); }} />)}
              </div>
            )}
          </section>
        )}

        {view === 'myposts' && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold mb-2 text-white flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-sky-400" /> My Posts
            </h2>
            {!currentUser ? (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center text-slate-500">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  Please log in to manage the listings you have created.
                  <div className="mt-3">
                    <Button size="sm" onClick={() => setShowLogin(true)}>Login</Button>
                  </div>
                </CardContent>
              </Card>
            ) : myListings.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center text-slate-500">
                  <Car className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  You haven't posted any listings yet.
                  <div className="mt-3">
                    <Button size="sm" onClick={() => setSellOpen(true)}><Plus className="w-4 h-4 mr-1" /> Post your first vehicle</Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <p className="text-xs text-slate-400">{myListings.length} listing{myListings.length === 1 ? '' : 's'} — tap Edit to update details or Delete to remove.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {myListings.map(l => (
                    <div key={l.id} className="relative">
                      <ListingCard listing={l} saved={savedIds.includes(l.id)} onToggleSave={toggleSave} onClick={() => openListingDetail(l)} onEnquire={(id) => { setEnquiryOpen(id); setEnqSubmitted(false); }} />
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline" className="flex-1 border-amber-500/40 text-amber-600 hover:bg-amber-500/10" onClick={() => editListing(l)}>
                          <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 border-red-500/40 text-red-600 hover:bg-red-500/10" onClick={() => deleteListing(l.id)}>
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {view === 'myrequests' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Search className="w-6 h-6 text-amber-400" /> My Vehicle Requests
              </h2>
              {currentUser && myRequests.length > 0 && (
                <Button size="sm" onClick={openNewRequest} className="bg-sky-500 text-white hover:bg-sky-400">
                  <Plus className="w-4 h-4 mr-1" /> New Request
                </Button>
              )}
            </div>
            {!currentUser ? (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center text-slate-500">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  Please log in to view the vehicle requests you have submitted.
                  <div className="mt-3">
                    <Button size="sm" onClick={() => setShowLogin(true)}>Login</Button>
                  </div>
                </CardContent>
              </Card>
            ) : myRequests.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center text-slate-500">
                  <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  You haven't submitted any vehicle requests yet.
                  <div className="mt-3">
                    <Button size="sm" onClick={openNewRequest}>Make a Request</Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <p className="text-xs text-slate-400">
                  {myRequests.length} request{myRequests.length === 1 ? '' : 's'} submitted. Your requests are saved here for easy reference — even after closing the app.
                </p>
                {myRequests.map((req) => (
                  <Card key={req.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm text-white">{req.vehicleType} · {req.make || 'Any make'} {req.model}</div>
                          <div className="text-xs text-slate-500">Budget: E{req.minBudget || '0'} - E{req.maxBudget || 'Any'} · {req.region}</div>
                        </div>
                        <Badge className="bg-sky-500/20 text-sky-300 capitalize shrink-0">{req.status}</Badge>
                      </div>
                      {req.description && <p className="text-xs text-slate-400 italic mb-2">"{req.description}"</p>}
                      <div className="flex items-center justify-between gap-2 mt-3">
                        <div className="text-[10px] text-slate-500">Submitted {fmtDate(req.createdAt)}</div>
                        {/* Edit + Delete buttons — only the original requester can edit/delete
                            their own requests (server enforces this via the session cookie).
                            The buttons are hidden entirely for non-owners so users on a shared
                            device don't see them. */}
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-sky-300 hover:bg-sky-500/10 hover:text-sky-200 h-7 px-2"
                            onClick={() => openEditRequest(req)}
                            title="Edit this request"
                          >
                            <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-300 hover:bg-red-500/10 hover:text-red-200 h-7 px-2 disabled:opacity-50"
                            onClick={() => deleteRequest(req.id)}
                            disabled={deletingRequestId === req.id}
                            title="Delete this request"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" /> {deletingRequestId === req.id ? 'Deleting...' : 'Delete'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button onClick={openNewRequest} className="bg-sky-500 text-white hover:bg-sky-400">
                  <Search className="w-4 h-4 mr-1" /> New Request
                </Button>
              </>
            )}
          </section>
        )}

        {view === 'messages' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Mail className="w-6 h-6 text-sky-400" /> My Messages
              </h2>
              <Button size="sm" onClick={() => { setContactSubmitted(false); setShowContact(true) }} className="bg-sky-500 text-white hover:bg-sky-400">
                <Plus className="w-4 h-4 mr-1" /> New Message
              </Button>
            </div>
            {!currentUser ? (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center text-slate-500">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  Please log in to view your messages with admin.
                  <div className="mt-3">
                    <Button size="sm" onClick={() => setShowLogin(true)}>Login</Button>
                  </div>
                </CardContent>
              </Card>
            ) : adminMessages.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center text-slate-500">
                  <Mail className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  You haven't sent any messages yet.
                  <div className="mt-3">
                    <Button size="sm" onClick={() => { setContactSubmitted(false); setShowContact(true) }}>Send a message to admin</Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <p className="text-xs text-slate-400">
                  {adminMessages.length} conversation{adminMessages.length === 1 ? '' : 's'} with admin. Messages and replies are saved here for easy reference — even after closing the app.
                </p>
                {adminMessages.map((msg) => {
                  // Build the full conversation thread: original message + all replies
                  // sorted chronologically. Each reply has a `sender` field so we can
                  // align admin replies on the left and user replies on the right.
                  const replies = Array.isArray(msg.replies) ? msg.replies : []
                  // Count unread: admin replies the user hasn't seen yet (we approximate
                  // using status === 'responded' for the first admin reply, and use
                  // the reply sender for subsequent ones).
                  const adminReplyCount = replies.filter(r => r.sender === 'admin').length
                  return (
                    <Card key={msg.id}>
                      <CardContent className="p-4">
                        {/* Conversation header */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-sm text-white">{msg.subject}</div>
                            <div className="text-xs text-slate-500">
                              Opened {fmtDate(msg.createdAt)}
                              {adminReplyCount > 0 && (
                                <span className="ml-2 text-emerald-400">· {adminReplyCount} admin {adminReplyCount === 1 ? 'reply' : 'replies'}</span>
                              )}
                            </div>
                          </div>
                          <Badge className={`shrink-0 ${msg.status === 'new' ? 'bg-amber-500/20 text-amber-300' : msg.status === 'responded' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-sky-500/20 text-sky-300'} capitalize`}>
                            {msg.status}
                          </Badge>
                        </div>

                        {/* Original user message — shown on the right (user is the sender) */}
                        <div className="flex justify-end mb-2">
                          <div className="bg-sky-500/20 border border-sky-500/30 rounded-2xl rounded-tr-sm px-3 py-2 max-w-[80%]">
                            <div className="text-[10px] text-sky-300 font-semibold mb-0.5">YOU</div>
                            <p className="text-xs text-white whitespace-pre-wrap break-words">{msg.message}</p>
                          </div>
                        </div>

                        {/* All replies in the thread, sorted chronologically */}
                        {replies.map((reply) => {
                          const isAdminReply = reply.sender === 'admin'
                          return (
                            <div key={reply.id} className={`flex mb-2 ${isAdminReply ? 'justify-start' : 'justify-end'}`}>
                              <div className={`rounded-2xl px-3 py-2 max-w-[80%] ${
                                isAdminReply
                                  ? 'bg-white/5 border border-white/10 rounded-tl-sm'
                                  : 'bg-sky-500/20 border border-sky-500/30 rounded-tr-sm'
                              }`}>
                                <div className={`text-[10px] font-semibold mb-0.5 ${isAdminReply ? 'text-amber-300' : 'text-sky-300'}`}>
                                  {isAdminReply ? 'ADMIN' : 'YOU'}
                                </div>
                                <p className={`text-xs whitespace-pre-wrap break-words ${isAdminReply ? 'text-slate-200' : 'text-white'}`}>
                                  {reply.text}
                                </p>
                                <div className="text-[9px] text-slate-500 mt-1">{fmtDate(reply.createdAt)}</div>
                              </div>
                            </div>
                          )
                        })}

                        {/* Legacy single response display (for messages that have
                            msg.response set but no replies array — backwards compat
                            with old records that pre-date the ContactReply table). */}
                        {msg.response && replies.length === 0 && (
                          <div className="flex justify-start mb-2">
                            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[80%]">
                              <div className="text-[10px] text-amber-300 font-semibold mb-0.5">ADMIN</div>
                              <p className="text-xs text-slate-200 whitespace-pre-wrap break-words">{msg.response}</p>
                            </div>
                          </div>
                        )}

                        {/* Reply box — user can continue the conversation */}
                        <ReplyBox
                          placeholder="Type your reply to admin..."
                          onSend={(text) => sendReply(msg.id, text)}
                          disabled={sendingReply === msg.id}
                        />
                        {sendingReply === msg.id && (
                          <p className="text-[10px] text-slate-500 mt-1 text-right">Sending...</p>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </>
            )}
          </section>
        )}

        {view === 'how' && (
          <section className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Handshake className="w-5 h-5 text-sky-500" /> How buying works</CardTitle>
                <CardDescription>Three simple steps. Zero scammers.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Step n={1} title="Enquire" desc="Tap 'Enquire' on any vehicle. Enter your name, number, and message. Your enquiry goes straight to the ESWATINI CARS team — never to the seller directly." />
                <Step n={2} title="We verify & call you back" desc="We confirm the price, condition, and availability with the seller. Then we call you to answer questions and arrange a viewing time that suits everyone." />
                <Step n={3} title="Three-party viewing" desc="You, the seller, and our representative meet at the arranged place. You inspect the car, take a test drive, and agree the price. If you buy, commission is settled on the spot and you drive away." />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-sky-500" /> Commission schedule</CardTitle>
                <CardDescription>Paid in person, only on successful sale.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-800">
                      <tr>
                        <th className="text-left p-3 font-semibold">Sale price range</th>
                        <th className="text-left p-3 font-semibold">Commission</th>
                        <th className="text-left p-3 font-semibold">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {COMMISSION_RATES.map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-950'}>
                          <td className="p-3">{row.range}</td>
                          <td className="p-3 font-mono font-bold text-sky-600 dark:text-sky-400">{row.rate}</td>
                          <td className="p-3 text-slate-500 text-xs">{row.note || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Plus className="w-5 h-5 text-sky-500" /> For sellers</CardTitle>
                <CardDescription>List your vehicle for free in 2 minutes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" /> Free to list. No payment until the vehicle sells.</div>
                <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" /> Your phone number is never published. We handle all buyer communication.</div>
                <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" /> We bring vetted, serious buyers — no time-wasters.</div>
                <Button className="mt-3 bg-sky-500 text-slate-900 hover:bg-sky-400" onClick={() => setSellOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Post your vehicle now
                </Button>
              </CardContent>
            </Card>
          </section>
        )}

        {view === 'admin' && <AdminDashboard vehicleRequests={vehicleRequests} adminMessages={adminMessages} adminTeam={adminTeam} respondToMessage={respondToMessage} removeAdmin={removeAdmin} setShowAddAdmin={setShowAddAdmin} />}
      </main>

      {/* LISTING DETAIL MODAL */}
      <Dialog open={!!listingDetail} onOpenChange={(o) => !o && setListingDetail(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => { if (lightbox) e.preventDefault() }} onInteractOutside={(e) => { if (lightbox) e.preventDefault() }}>
          {listingDetail && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{listingDetail.make} {listingDetail.model}</DialogTitle>
                <DialogDescription>{listingDetail.year} · {listingDetail.region}</DialogDescription>
              </DialogHeader>
              {/* Main image + thumbnail gallery */}
              <ListingGallery images={listingDetail.imageUrl ? listingDetail.imageUrl.split('|').filter(Boolean) : []} make={listingDetail.make} model={listingDetail.model} />
              <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">{fmt(listingDetail.price, listingDetail.currency)}</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <Spec icon={<Fuel className="w-3 h-3" />} label="Fuel" value={listingDetail.fuelType} />
                <Spec icon={<Settings2 className="w-3 h-3" />} label="Transmission" value={listingDetail.transmission} />
                <Spec icon={<Gauge className="w-3 h-3" />} label="Mileage" value={`${listingDetail.mileage.toLocaleString()} km`} />
                {listingDetail.color && <Spec icon={<Car className="w-3 h-3" />} label="Color" value={listingDetail.color} />}
                <Spec icon={<Eye className="w-3 h-3" />} label="Views" value={`${listingDetail.views}`} />
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-sm">Description</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{listingDetail.description}</p>
              </div>
              <DialogFooter className="flex-wrap gap-2">
                {/* Edit/Delete buttons — only visible to listing owner or admin */}
                {(isAdminEmail(currentUser?.email) || (currentUser?.email && listingDetail.sellerEmail === currentUser?.email)) && (
                  <div className="flex gap-2 mr-auto">
                    <Button
                      variant="outline"
                      className="border-amber-500/40 text-amber-600 hover:bg-amber-500/10"
                      onClick={() => {
                        const l = listingDetail
                        setListingDetail(null)
                        editListing(l)
                      }}
                    >
                      <Pencil className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-500/40 text-red-600 hover:bg-red-500/10"
                      onClick={() => {
                        const id = listingDetail.id
                        setListingDetail(null)
                        deleteListing(id)
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </div>
                )}
                <Button variant="outline" onClick={() => setListingDetail(null)}>Close</Button>
                <a
                  href={`https://wa.me/26876295648?text=${encodeURIComponent(`Hi ESWATINI CARS, I'm interested in the ${listingDetail.year} ${listingDetail.make} ${listingDetail.model} (E${listingDetail.price.toLocaleString()}). Is it still available?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
                <Button className="bg-sky-500 text-slate-900 hover:bg-sky-400" onClick={() => { setEnquiryOpen(listingDetail.id); setEnqSubmitted(false); setListingDetail(null); }}>
                  <MessageSquare className="w-4 h-4 mr-1" /> Buy/Enquire now
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ENQUIRY DIALOG */}
      <Dialog open={!!enquiryOpen} onOpenChange={(o) => !o && setEnquiryOpen(null)}>
        <DialogContent onPointerDownOutside={(e) => { if (lightbox) e.preventDefault() }} onInteractOutside={(e) => { if (lightbox) e.preventDefault() }}>
          <DialogHeader>
            <DialogTitle>Enquire about this vehicle</DialogTitle>
            <DialogDescription>
              Your message goes directly to the ESWATINI CARS team. We verify the listing, then call you back to arrange a viewing.
            </DialogDescription>
          </DialogHeader>
          {enqSubmitted ? (
            <div className="text-center py-6 space-y-2">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" />
              <p className="font-semibold">Enquiry received!</p>
              <p className="text-sm text-slate-500">Our team will call you within 24 hours to verify the vehicle and arrange a viewing.</p>
              <Button onClick={() => setEnquiryOpen(null)}>Close</Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Label htmlFor="enq-name">Your name *</Label>
                <Input id="enq-name" value={enqName} onChange={e => setEnqName(e.target.value)} placeholder="John Dlamini" />
              </div>
              <div>
                <Label htmlFor="enq-phone">Your phone number *</Label>
                <Input id="enq-phone" value={enqPhone} onChange={e => setEnqPhone(e.target.value)} placeholder="+268 7XXX XXXX" />
              </div>
              <div>
                <Label htmlFor="enq-msg">Message</Label>
                <Textarea id="enq-msg" value={enqMessage} onChange={e => setEnqMessage(e.target.value)} placeholder="I'm interested in this vehicle. When can I view it?" rows={4} />
              </div>
              {/* HONEYPOT — hidden from humans, bots fill it in. aria-hidden + sr-only + off-screen. */}
              <div aria-hidden="true" className="absolute -left-[9999px] top-0 w-px h-px overflow-hidden" tabIndex={-1}>
                <label htmlFor="enq-website" className="sr-only">Website (leave blank)</label>
                <input
                  id="enq-website"
                  type="text"
                  value={enqWebsite}
                  onChange={e => setEnqWebsite(e.target.value)}
                  autoComplete="off"
                  tabIndex={-1}
                  placeholder="Your website (do not fill in)"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEnquiryOpen(null)}>Cancel</Button>
                <Button className="bg-sky-500 text-slate-900 hover:bg-sky-400" disabled={!enqName || !enqPhone} onClick={() => enquiryOpen && submitEnquiry(enquiryOpen)}>
                  Send enquiry
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* SELL DIALOG (also used for editing — title changes based on mode) */}
      <Dialog open={sellOpen} onOpenChange={(o) => { setSellOpen(o); if (!o) setEditingListing(null) }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => { if (lightbox) e.preventDefault() }} onInteractOutside={(e) => { if (lightbox) e.preventDefault() }}>
          <DialogHeader>
            <DialogTitle>{editingListing ? 'Edit your listing' : 'List your vehicle for free'}</DialogTitle>
            <DialogDescription>
              {editingListing
                ? 'Update the details below. Changes go live immediately across all apps.'
                : 'Fill in the details. Listing goes live immediately. No payment until your vehicle sells.'}
            </DialogDescription>
          </DialogHeader>
          {sellSubmitted ? (
            <div className="text-center py-6 space-y-2">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" />
              <p className="font-semibold">{editingListing ? 'Listing updated!' : 'Your vehicle is now live!'}</p>
              <p className="text-sm text-slate-500">
                {editingListing
                  ? 'Your changes are now visible to all buyers across all apps.'
                  : 'Buyers can see it immediately. When someone enquires, our team will contact you first to verify details.'}
              </p>
              <Button onClick={() => { setSellOpen(false); setSellSubmitted(false); setEditingListing(null); setView('browse'); apiFetchListings().then(setListings); }}>View my listing</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Vehicle type</Label>
                <Select value={sellForm.type} onValueChange={v => setSellForm({ ...sellForm, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TYPES.filter(t => t.value !== 'all').map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Make *</Label>
                <Input value={sellForm.make} onChange={e => setSellForm({ ...sellForm, make: e.target.value })} placeholder="Toyota" />
              </div>
              <div>
                <Label className="text-xs">Model *</Label>
                <Input value={sellForm.model} onChange={e => setSellForm({ ...sellForm, model: e.target.value })} placeholder="Hilux 2.4 GD-6" />
              </div>
              <div>
                <Label className="text-xs">Year *</Label>
                <Input type="number" value={sellForm.year} onChange={e => setSellForm({ ...sellForm, year: e.target.value })} placeholder="2020" />
              </div>
              <div>
                <Label className="text-xs">Price (E) *</Label>
                <Input type="number" value={sellForm.price} onChange={e => setSellForm({ ...sellForm, price: e.target.value })} placeholder="350000" />
              </div>
              <div>
                <Label className="text-xs">Mileage (km)</Label>
                <Input type="number" value={sellForm.mileage} onChange={e => setSellForm({ ...sellForm, mileage: e.target.value })} placeholder="85000" />
              </div>
              <div>
                <Label className="text-xs">Fuel type</Label>
                <Select value={sellForm.fuelType} onValueChange={v => setSellForm({ ...sellForm, fuelType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FUELS.filter(f => f !== 'all').map(f => <SelectItem key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Transmission</Label>
                <Select value={sellForm.transmission} onValueChange={v => setSellForm({ ...sellForm, transmission: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TRANSMISSIONS.filter(t => t !== 'all').map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Color</Label>
                <Input value={sellForm.color} onChange={e => setSellForm({ ...sellForm, color: e.target.value })} placeholder="White" />
              </div>
              <div>
                <Label className="text-xs">Region</Label>
                <Select value={sellForm.region} onValueChange={v => setSellForm({ ...sellForm, region: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {REGIONS.filter(r => r !== 'all').map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Photos (up to 8)</Label>
                <label className="cursor-pointer block">
                  <div className={`border-2 border-dashed rounded-2xl p-4 text-center text-xs transition-colors ${uploading ? 'border-sky-400 bg-sky-50 dark:bg-sky-950/30' : 'border-slate-300 dark:border-slate-700 hover:border-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                    <Upload className={`w-5 h-5 mx-auto mb-1.5 ${uploading ? 'animate-bounce text-sky-500' : 'text-slate-500'}`} />
                    {uploading ? (
                      <span className="text-sky-600 dark:text-sky-400 font-semibold">Uploading… please wait</span>
                    ) : (
                      <span><span className="text-sky-600 dark:text-sky-400 font-semibold">Click to upload</span> or tap and select multiple photos (max 8)</span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={e => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleMultiImageUpload(e.target.files)
                        e.target.value = ''
                      }
                    }}
                  />
                </label>
                {/* Gallery preview — BIG thumbnails, loading state, click to zoom */}
                {(() => {
                  const images = sellForm.imageUrl ? sellForm.imageUrl.split('|').filter(Boolean) : []
                  if (images.length === 0) return null
                  return (
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {images.map((img, i) => (
                        <div key={i} className="relative group">
                          <div className="block w-full aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                            <ImageWithLoader src={img} alt={`Photo ${i + 1}`} />
                          </div>
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              const remaining = images.filter((_, idx) => idx !== i)
                              setSellForm({ ...sellForm, imageUrl: remaining.join('|') })
                            }}
                          >
                            <X className="w-3 h-3" />
                          </button>
                          {i === 0 && (
                            <Badge className="absolute bottom-1 left-1 text-[9px] py-0 px-1.5 bg-sky-500 text-white">Main</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                })()}
                <div className="mt-2 text-[10px] text-slate-500">
                  {sellForm.imageUrl ? `${sellForm.imageUrl.split('|').filter(Boolean).length} / 8 photos uploaded` : 'No photos yet'}
                </div>
                <Input
                  value={sellForm.imageUrl.startsWith('data:') ? '' : sellForm.imageUrl}
                  onChange={e => setSellForm({ ...sellForm, imageUrl: e.target.value })}
                  placeholder="Or paste image URLs (comma-separated)"
                  className="mt-2"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Description *</Label>
                <Textarea value={sellForm.description} onChange={e => setSellForm({ ...sellForm, description: e.target.value })} placeholder="Excellent condition, full service history, accident-free, new tyres..." rows={3} />
              </div>
              <div className="col-span-2 bg-sky-50 dark:bg-sky-950/30 p-3 rounded-2xl border border-sky-200 dark:border-sky-800">
                <p className="text-xs font-semibold text-sky-800 dark:text-sky-200 mb-1">Your contact details (private — never published)</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Input placeholder="Your name *" value={sellForm.sellerName} onChange={e => setSellForm({ ...sellForm, sellerName: e.target.value })} />
                  <Input placeholder="Phone number *" value={sellForm.sellerPhone} onChange={e => setSellForm({ ...sellForm, sellerPhone: e.target.value })} />
                </div>
                <Input placeholder="Email (optional)" value={sellForm.sellerEmail} onChange={e => setSellForm({ ...sellForm, sellerEmail: e.target.value })} className="mt-2" />
              </div>
              <div className="col-span-2 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSellOpen(false)}>Cancel</Button>
                <Button className="bg-sky-500 text-slate-900 hover:bg-sky-400" onClick={submitSell} disabled={!sellForm.make || !sellForm.model || !sellForm.year || !sellForm.price || !sellForm.description || !sellForm.sellerName || !sellForm.sellerPhone}>
                  Post listing
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* HAMBURGER MENU — top-right corner.
          Hidden when the drawer is open so it doesn't visually overlap and
          block the X (close) button at the top-right of the drawer panel. */}
      {!drawerOpen && (
        <button
          onClick={() => setDrawerOpen(true)}
          className="fixed top-4 right-4 z-[60] bg-sky-500 hover:bg-sky-400 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-2xl shadow-sky-500/30 transition-all hover:scale-110"
          aria-label="Menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      )}

      {/* SIDE DRAWER — slides in from the right */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer panel */}
          <div className="fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] bg-slate-900 border-l border-white/10 shadow-2xl overflow-y-auto animate-[fade-in_0.3s_ease-out]">
            {/* Drawer header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-navy-fade">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Car className="w-5 h-5 text-sky-400" /> Menu
              </h2>
              <button onClick={() => setDrawerOpen(false)} className="bg-white/10 hover:bg-white/20 rounded-full w-9 h-9 flex items-center justify-center text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer content */}
            <div className="p-4 space-y-3">
              {/* Vehicle Requests */}
              <button
                onClick={() => { openNewRequest(); setDrawerOpen(false) }}
                className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
                  <Search className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Request a Vehicle</div>
                  <div className="text-xs text-slate-400">Can't find it? Tell us what you need</div>
                </div>
              </button>

              {/* My Requests — shows the user's own submitted vehicle requests.
                  Requires login (so we can match by email). Faint when
                  logged out to match the Saved Vehicles pattern. */}
              <button
                onClick={() => {
                  if (currentUser) {
                    setView('myrequests')
                    setDrawerOpen(false)
                  } else {
                    setShowLogin(true)
                  }
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${
                  currentUser
                    ? 'bg-white/5 hover:bg-white/10 border-white/10'
                    : 'bg-white/[0.02] border-white/5 opacity-50 cursor-not-allowed'
                }`}
                title={currentUser ? 'Your submitted vehicle requests' : 'Log in to view your requests'}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentUser ? 'bg-amber-500/20' : 'bg-slate-700/40'}`}>
                    <Bell className={`w-5 h-5 ${currentUser ? 'text-amber-400' : 'text-slate-500'}`} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">My Requests</div>
                    <div className="text-xs text-slate-400">
                      {currentUser ? `${myRequests.length} request${myRequests.length === 1 ? '' : 's'} submitted` : 'Log in to view your requests'}
                    </div>
                  </div>
                </div>
                {currentUser && myRequests.length > 0 && (
                  <Badge className="bg-amber-500 text-white text-[10px]">{myRequests.length}</Badge>
                )}
              </button>

              {/* Saved Vehicles — faint for unregistered */}
              <button
                onClick={() => {
                  if (currentUser) {
                    setView('saved')
                    setDrawerOpen(false)
                  } else {
                    setShowLogin(true)
                  }
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${
                  currentUser
                    ? 'bg-white/5 hover:bg-white/10 border-white/10'
                    : 'bg-white/[0.02] border-white/5 opacity-50 cursor-not-allowed'
                }`}
                title={currentUser ? 'Your saved vehicles' : 'Log in to save vehicles'}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentUser ? 'bg-red-500/20' : 'bg-slate-700/40'}`}>
                    <Heart className={`w-5 h-5 ${currentUser ? 'text-red-400' : 'text-slate-500'}`} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Saved Vehicles</div>
                    <div className="text-xs text-slate-400">
                      {currentUser
                        ? `${savedIds.length} saved vehicle${savedIds.length === 1 ? '' : 's'}`
                        : 'Log in to save vehicles'}
                    </div>
                  </div>
                </div>
                {currentUser && savedIds.length > 0 && (
                  <Badge className="bg-red-500 text-white text-[10px]">{savedIds.length}</Badge>
                )}
              </button>

              {/* My Posts (logged-in only — shows listings the user created) */}
              <button
                onClick={() => { if (currentUser) { setView('myposts') } else { setShowLogin(true) }; setDrawerOpen(false) }}
                className={`w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-left ${currentUser ? '' : 'opacity-50'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
                    <LayoutDashboard className="w-5 h-5 text-sky-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">My Posts</div>
                    <div className="text-xs text-slate-400">{currentUser ? 'Listings you have created' : 'Login to view your posts'}</div>
                  </div>
                </div>
                {currentUser && myListings.length > 0 && (
                  <Badge className="bg-sky-500 text-white text-[10px]">{myListings.length}</Badge>
                )}
              </button>

              {/* My Requests (logged-in only — shows vehicle requests the user submitted) */}
              <button
                onClick={() => { if (currentUser) { setView('myrequests') } else { setShowLogin(true) }; setDrawerOpen(false) }}
                className={`w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-left ${currentUser ? '' : 'opacity-50'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Search className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">My Requests</div>
                    <div className="text-xs text-slate-400">{currentUser ? 'Vehicle requests you submitted' : 'Login to view your requests'}</div>
                  </div>
                </div>
                {currentUser && myRequests.length > 0 && (
                  <Badge className="bg-amber-500 text-white text-[10px]">{myRequests.length}</Badge>
                )}
              </button>

              {/* Messages inbox — opens the user's conversation list with admin.
                  Shows all messages + admin replies + lets user reply back.
                  Previously this just opened the compose dialog, which meant
                  users could send but never see the admin's response. */}
              {currentUser ? (
                <button
                  onClick={() => { setView('messages'); setDrawerOpen(false) }}
                  className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Messages</div>
                      <div className="text-xs text-slate-400">
                        {adminMessages.length > 0
                          ? `${adminMessages.length} conversation${adminMessages.length === 1 ? '' : 's'} with admin`
                          : 'Send a message to admin'}
                      </div>
                    </div>
                  </div>
                  {/* Unread badge: show count of conversations where admin has replied */}
                  {(() => {
                    const unread = adminMessages.filter(m => m.status === 'responded').length
                    return unread > 0 ? <Badge className="bg-red-500 text-white text-[10px]">{unread}</Badge> : null
                  })()}
                </button>
              ) : (
                <button
                  onClick={() => { setShowLogin(true); setDrawerOpen(false) }}
                  className="w-full flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 opacity-50 cursor-not-allowed rounded-2xl transition-all text-left"
                  title="Log in to view messages"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-700/40 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Messages</div>
                    <div className="text-xs text-slate-400">Log in to view messages</div>
                  </div>
                </button>
              )}

              {/* How It Works */}
              <button
                onClick={() => { setView('how'); setDrawerOpen(false) }}
                className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Handshake className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">How It Works</div>
                  <div className="text-xs text-slate-400">3 simple steps</div>
                </div>
              </button>

              {/* Admin — hidden from regular users, only shown to admin email allowlist */}
              {isAdminEmail(currentUser?.email) && (
                <button
                  onClick={() => { setView('admin'); setDrawerOpen(false) }}
                  className="w-full flex items-center gap-3 p-3 bg-amber-500/10 hover:bg-amber-500/20 rounded-2xl border border-amber-500/30 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-amber-300">Admin Dashboard</div>
                    <div className="text-xs text-amber-400/60">Owner access only</div>
                  </div>
                </button>
              )}

              {/* Sell button */}
              <button
                onClick={() => { setSellOpen(true); setDrawerOpen(false) }}
                className="w-full flex items-center gap-3 p-3 bg-sky-500 hover:bg-sky-400 rounded-2xl transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Sell Your Vehicle</div>
                  <div className="text-xs text-white/80">Free to list</div>
                </div>
              </button>

              {/* Profile Settings (logged in only) */}
              {currentUser && (
                <button
                  onClick={() => { setShowProfile(true); setDrawerOpen(false) }}
                  className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
                    <UserCog className="w-5 h-5 text-sky-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Profile Settings</div>
                    <div className="text-xs text-slate-400">Change name, email, password</div>
                  </div>
                </button>
              )}

              {/* User info / logout */}
              {currentUser && (
                <div className="pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between px-3">
                    <div>
                      <div className="text-xs text-slate-400">Logged in as</div>
                      <div className="text-sm font-semibold text-white">{currentUser.name}</div>
                      <div className="text-xs text-slate-500">{currentUser.email}</div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-500/10" onClick={() => { logout(); setDrawerOpen(false) }}>
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* VEHICLE REQUESTS VIEW */}
      {view === 'requests' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-sky-400" /> Vehicle Requests
          </h2>
          {vehicleRequests.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center text-slate-500">
                <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
                No vehicle requests yet.
                <div className="mt-3">
                  <Button size="sm" onClick={openNewRequest}>Make a Request</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            vehicleRequests.map((req) => (
              <Card key={req.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="font-semibold text-sm">{req.requesterName}</div>
                      <div className="text-xs text-slate-500">{req.requesterEmail} · {req.requesterPhone}</div>
                    </div>
                    <Badge className="bg-sky-500/20 text-sky-300 capitalize">{req.status}</Badge>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                    <b>Wants:</b> {req.vehicleType} · {req.make || 'Any make'} {req.model} · Budget: E{req.minBudget || '0'} - E{req.maxBudget || 'Any'} · {req.region}
                  </div>
                  {req.description && <p className="text-xs text-slate-500 italic">"{req.description}"</p>}
                  <div className="text-[10px] text-slate-400 mt-2">{fmtDate(req.createdAt)}</div>
                </CardContent>
              </Card>
            ))
          )}
          <Button onClick={openNewRequest} className="bg-sky-500 text-white hover:bg-sky-400">
            <Search className="w-4 h-4 mr-1" /> New Request
          </Button>
        </div>
      )}

      {/* FOOTER — navy blue fade */}
      <footer className="mt-auto bg-navy-fade text-slate-300 py-8 px-4 border-t-4 border-sky-500">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src="/logo.png" alt="ESWATINI CARS" className="w-8 h-8 rounded-full" />
              <span className="font-bold text-white">ESWATINI CARS</span>
            </div>
            <p className="text-xs text-slate-400">Managed vehicle marketplace. Safe, verified, broker-supervised viewings across all four regions of Eswatini.</p>
            <div className="mt-3">
              <h4 className="font-semibold text-white mb-2 text-xs uppercase">Regions covered</h4>
              <div className="flex flex-wrap gap-1">
                {REGIONS.filter(r => r !== 'all').map(r => <Badge key={r} className="text-[10px] bg-white/10 text-white border border-white/20">{r}</Badge>)}
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2 text-xs uppercase">Contact</h4>
            <ul className="space-y-1 text-xs">
              <li className="flex items-center gap-2"><Phone className="w-3 h-3" /> +268 76295648</li>
              <li className="flex items-center gap-2"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> <a href="https://wa.me/26876295648" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 underline">WhatsApp Chat</a></li>
            </ul>
            <div className="mt-4 p-3 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    <span className="text-white font-semibold">Disclaimer:</span>{' '}
                    <button onClick={() => setShowDisclaimer(true)} className="text-sky-400 underline hover:text-sky-300">click here to read disclaimer</button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center text-xs text-slate-500 mt-6 pt-4 border-t border-slate-800">
          © {new Date().getFullYear()} ESWATINI CARS. All rights reserved.
        </div>
      </footer>

      {/* Lightbox — full-screen image viewer */}
      {lightbox && (
        <Lightbox src={lightbox} alt="Photo preview" onClose={() => setLightbox(null)} />
      )}

      {/* VEHICLE REQUEST DIALOG — supports both CREATE and EDIT mode.
          editingRequestId distinguishes between the two; if set, the form
          fields are pre-filled with the existing request and the submit
          button says "Save changes" instead of "Submit request". */}
      <Dialog open={showRequest} onOpenChange={(o) => { setShowRequest(o); if (!o) { setEditingRequestId(null); setRequestSubmitted(false) } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-sky-500" />
              {editingRequestId ? 'Edit Request' : 'Vehicle Request'}
            </DialogTitle>
            <DialogDescription>
              {editingRequestId
                ? 'Update the details of your vehicle request.'
                : "Can't find what you're looking for? Tell us what you need and we'll match you with sellers."}
            </DialogDescription>
          </DialogHeader>
          {requestSubmitted ? (
            <div className="text-center py-6 space-y-2">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" />
              <p className="font-semibold">{editingRequestId ? 'Request updated!' : 'Request submitted!'}</p>
              <p className="text-sm text-slate-500">Our team will contact you when we find a matching vehicle.</p>
              <Button onClick={() => { setShowRequest(false); setRequestSubmitted(false); setEditingRequestId(null) }}>Close</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Your name *</Label>
                <Input value={requestForm.requesterName} onChange={e => setRequestForm({...requestForm, requesterName: e.target.value})} placeholder="John Dlamini" />
              </div>
              <div>
                <Label className="text-xs">Email *</Label>
                <Input
                  type="email"
                  value={requestForm.requesterEmail}
                  onChange={e => setRequestForm({...requestForm, requesterEmail: e.target.value})}
                  placeholder="john@email.com"
                  disabled={!!editingRequestId}
                />
                {editingRequestId && (
                  <p className="text-[10px] text-slate-500 mt-1">Email cannot be changed (used to verify ownership)</p>
                )}
              </div>
              <div><Label className="text-xs">Phone</Label><Input value={requestForm.requesterPhone} onChange={e => setRequestForm({...requestForm, requesterPhone: e.target.value})} placeholder="+268 7XXX" /></div>
              <div><Label className="text-xs">Vehicle type</Label><Select value={requestForm.vehicleType} onValueChange={v => setRequestForm({...requestForm, vehicleType: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TYPES.filter(t => t.value !== 'all').map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
              <div><Label className="text-xs">Make</Label><Input value={requestForm.make} onChange={e => setRequestForm({...requestForm, make: e.target.value})} placeholder="Toyota" /></div>
              <div><Label className="text-xs">Model</Label><Input value={requestForm.model} onChange={e => setRequestForm({...requestForm, model: e.target.value})} placeholder="Hilux" /></div>
              <div><Label className="text-xs">Min budget (E)</Label><Input type="number" value={requestForm.minBudget} onChange={e => setRequestForm({...requestForm, minBudget: e.target.value})} placeholder="100000" /></div>
              <div><Label className="text-xs">Max budget (E)</Label><Input type="number" value={requestForm.maxBudget} onChange={e => setRequestForm({...requestForm, maxBudget: e.target.value})} placeholder="300000" /></div>
              <div><Label className="text-xs">Fuel</Label><Select value={requestForm.fuelType} onValueChange={v => setRequestForm({...requestForm, fuelType: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="any">Any</SelectItem><SelectItem value="petrol">Petrol</SelectItem><SelectItem value="diesel">Diesel</SelectItem></SelectContent></Select></div>
              <div><Label className="text-xs">Transmission</Label><Select value={requestForm.transmission} onValueChange={v => setRequestForm({...requestForm, transmission: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="any">Any</SelectItem><SelectItem value="manual">Manual</SelectItem><SelectItem value="automatic">Automatic</SelectItem></SelectContent></Select></div>
              <div><Label className="text-xs">Region</Label><Select value={requestForm.region} onValueChange={v => setRequestForm({...requestForm, region: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{REGIONS.filter(r => r !== 'all').map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></div>
              <div className="col-span-2"><Label className="text-xs">Additional details</Label><Textarea value={requestForm.description} onChange={e => setRequestForm({...requestForm, description: e.target.value})} placeholder="Color preferences, must-have features, etc." rows={3} /></div>
              <div className="col-span-2 flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setShowRequest(false); setEditingRequestId(null) }}>Cancel</Button>
                <Button
                  className="bg-sky-500 text-white hover:bg-sky-400"
                  disabled={!requestForm.requesterName || !requestForm.requesterEmail || submittingRequest}
                  onClick={submitRequest}
                >
                  {submittingRequest ? 'Saving...' : (editingRequestId ? 'Save changes' : 'Submit request')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CONTACT ADMIN DIALOG (registered users only) */}
      <Dialog open={showContact} onOpenChange={setShowContact}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Mail className="w-5 h-5 text-sky-500" /> Message Admin</DialogTitle>
            <DialogDescription>Have a question? Send us a message and we'll respond to your inbox.</DialogDescription>
          </DialogHeader>
          {contactSubmitted ? (
            <div className="text-center py-6 space-y-2">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" />
              <p className="font-semibold">Message sent!</p>
              <p className="text-sm text-slate-500">We'll respond to {currentUser?.email} as soon as possible.</p>
              <Button onClick={() => { setShowContact(false); setContactSubmitted(false) }}>Close</Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div><Label>Subject *</Label><Input value={contactForm.subject} onChange={e => setContactForm({...contactForm, subject: e.target.value})} placeholder="Question about a listing" /></div>
              <div><Label>Message *</Label><Textarea value={contactForm.message} onChange={e => setContactForm({...contactForm, message: e.target.value})} placeholder="Type your question here..." rows={4} /></div>
              <DialogFooter><Button variant="outline" onClick={() => setShowContact(false)}>Cancel</Button><Button className="bg-sky-500 text-white hover:bg-sky-400" disabled={!contactForm.subject || !contactForm.message} onClick={submitContact}>Send message</Button></DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* LOGIN DIALOG */}
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-sky-500" /> Login</DialogTitle>
            <DialogDescription>Login to save favorites and message admin. Don't have an account? Register below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Email *</Label><Input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="john@email.com" /></div>
            {isAdminEmail(loginEmail) ? (
              // Admin emails use the shared admin PIN (sent automatically by submitLogin).
              // The password field is hidden for admin emails so users don't get
              // confused about why their password "doesn't work" — they should be
              // using the broker PIN, not a personal password.
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-200">
                <div className="font-semibold mb-1 flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Admin email detected</div>
                Admin accounts use the shared broker PIN instead of a personal password. Click Login to continue with your admin PIN.
              </div>
            ) : (
              <div><Label>Password *</Label><Input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Min 8 characters" minLength={8} /></div>
            )}
            {!isAdminEmail(loginEmail) && (
              <div className="text-right"><button className="text-xs text-sky-400 hover:text-sky-300 underline" onClick={() => { setShowLogin(false); setShowForgotPassword(true) }}>Forgot password?</button></div>
            )}
            <DialogFooter className="flex flex-col gap-2">
              <Button
                className="w-full bg-sky-500 text-white hover:bg-sky-400"
                disabled={!loginEmail || (!isAdminEmail(loginEmail) && loginPassword.length < 8)}
                onClick={submitLogin}
              >
                Login
              </Button>
              <Button variant="outline" className="w-full" onClick={() => { setShowLogin(false); setShowRegister(true) }}>Create new account</Button>
            </DialogFooter>
            <p className="text-[10px] text-slate-500 text-center">⚠️ Email verification requires a cloud email service (coming soon). Passwords are stored locally for now.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* REGISTER DIALOG — 2-step: form → OTP verification (Firebase phone auth) */}
      <Dialog open={showRegister} onOpenChange={(o) => { setShowRegister(o); if (!o) { setPhoneVerifyStep('form'); setOtpCode(''); setConfirmationResult(null) } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5 text-sky-500" /> Register {phoneVerifyStep === 'otp' && '— Verify Phone'}</DialogTitle>
            <DialogDescription>
              {phoneVerifyStep === 'otp'
                ? 'Enter the 6-digit code we sent to your phone to complete verification.'
                : 'Create a free account to save favorites and message admin.'}
            </DialogDescription>
          </DialogHeader>
          {phoneVerifyStep === 'otp' ? (
            <div className="space-y-3">
              <div>
                <Label>Verification code *</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="text-center text-2xl tracking-[0.5em] font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">Enter the 6-digit code from the SMS we sent you. The code expires in 2 minutes.</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setPhoneVerifyStep('form'); setOtpCode(''); setConfirmationResult(null) }}>Back</Button>
                <Button className="bg-sky-500 text-white hover:bg-sky-400" disabled={otpCode.length !== 6} onClick={submitRegister}>Verify & Register</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-3">
              <div><Label>Name *</Label><Input value={registerForm.name} onChange={e => setRegisterForm({...registerForm, name: e.target.value})} placeholder="John Dlamini" /></div>
              <div>
                <Label>Username <span className="text-slate-500 font-normal">(optional)</span></Label>
                <Input value={registerForm.username} onChange={e => setRegisterForm({...registerForm, username: e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase().slice(0, 20)})} placeholder="Auto-generated from email if blank" />
                <p className="text-[10px] text-slate-500 mt-1">3-20 chars: letters, numbers, underscores. Used to identify you in messages to admin.</p>
              </div>
              <div><Label>Email *</Label><Input type="email" value={registerForm.email} onChange={e => setRegisterForm({...registerForm, email: e.target.value})} placeholder="john@email.com" /></div>
              <div><Label>Password * (min 8 characters)</Label><Input type="password" value={registerForm.password} onChange={e => setRegisterForm({...registerForm, password: e.target.value})} placeholder="••••••••" minLength={8} /></div>
              <div><Label>Phone *</Label><Input value={registerForm.phone} onChange={e => setRegisterForm({...registerForm, phone: e.target.value})} placeholder="+268 7XXX XXXX" /></div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowRegister(false)}>Cancel</Button>
                <Button
                  className="bg-sky-500 text-white hover:bg-sky-400"
                  disabled={!registerForm.name || !registerForm.email || registerForm.password.length < 8 || !registerForm.phone}
                  onClick={async () => {
                    if (!registerForm.phone) return
                    // Send OTP via Firebase phone auth (falls back to dev mock).
                    await sendOTP(registerForm.phone)
                    // If the user is registering without phone, just submit normally.
                    if (phoneVerifyStep !== 'otp') return
                  }}
                >
                  Send OTP
                </Button>
                {/* Quick-register without phone verification (for testing/dev) */}
                <Button variant="ghost" className="w-full text-xs text-slate-500" onClick={submitRegister}>Skip phone verification →</Button>
              </DialogFooter>
              <p className="text-[10px] text-slate-500 text-center">⚠️ Phone OTP via Firebase. Email verification requires a cloud email service.</p>
              {/* Invisible reCAPTCHA container — Firebase Phone Auth needs this div
                  to exist in the DOM so it can render the reCAPTCHA challenge.
                  The div is empty and invisible (no visible UI), but Firebase
                  will inject its own iframe inside it during the OTP send. */}
              <div id="recaptcha-container" className="recaptcha-container" aria-hidden="true" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ADD ADMIN DIALOG */}
      <Dialog open={showAddAdmin} onOpenChange={setShowAddAdmin}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5 text-sky-500" /> Add Team Member</DialogTitle>
            <DialogDescription>Grant admin access to a team member. They can manage listings and respond to enquiries.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Name *</Label><Input value={newAdminForm.name} onChange={e => setNewAdminForm({...newAdminForm, name: e.target.value})} placeholder="Sipho Dlamini" /></div>
            <div><Label>Email *</Label><Input type="email" value={newAdminForm.email} onChange={e => setNewAdminForm({...newAdminForm, email: e.target.value})} placeholder="sipho@email.com" /></div>
            <div className="flex justify-end gap-2 pt-2"><Button variant="outline" onClick={() => setShowAddAdmin(false)}>Cancel</Button><Button className="bg-sky-500 text-white hover:bg-sky-400" disabled={!newAdminForm.name || !newAdminForm.email} onClick={addAdmin}>Add admin</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      {/* DISCLAIMER DIALOG */}
      <Dialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-sky-500" /> Disclaimer</DialogTitle>
          </DialogHeader>
          <div className="text-xs text-slate-600 dark:text-slate-400 space-y-3 leading-relaxed">
            <p>ESWATINI CARS is a managed vehicle marketplace platform that connects buyers and sellers of vehicles and vehicle parts. ESWATINI CARS does not own, possess, or hold title to any vehicle or parts listed on this platform.</p>
            <p>ESWATINI CARS assists in making buyers and sellers of vehicles and/or parts find each other with ease. However, ESWATINI CARS is not involved in the actual arrangements between seller and buyer at the point of vehicle or parts handover.</p>
            <p>ESWATINI CARS does not offer mechanical inspection, vehicle history verification, or condition assessment. Buyers are strongly advised to bring their own qualified mechanic or engineer for vehicle or parts inspection before finalizing any purchase.</p>
            <p>ESWATINI CARS shall not be held liable for any vehicle or parts faults, defects, misrepresentations, or damages arising after the sale of any vehicle or parts. All transactions are conducted solely between the buyer and seller.</p>
            <p>ESWATINI CARS facilitates the initial connection and may attend viewings as a broker, but does not guarantee the accuracy of any listing information, vehicle condition, or legal status of any vehicle or parts.</p>
            <p>By using this platform, you acknowledge and agree to these terms. All sales are final between buyer and seller.</p>
          </div>
          <div className="flex justify-end pt-2">
            <Button className="bg-sky-500 text-white hover:bg-sky-400" onClick={() => setShowDisclaimer(false)}>I Understand</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* FORGOT PASSWORD DIALOG */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Mail className="w-5 h-5 text-sky-500" /> Forgot Password</DialogTitle>
            <DialogDescription>Enter your email and we'll send you a reset link.</DialogDescription>
          </DialogHeader>
          {forgotSent ? (
            <div className="text-center py-6 space-y-2">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" />
              <p className="font-semibold">Reset link sent!</p>
              <p className="text-sm text-slate-500">⚠️ This is a demo. Real email sending requires a cloud email service (Resend, SendGrid) — coming when you connect to cloud.</p>
              <Button onClick={() => { setShowForgotPassword(false); setForgotSent(false) }}>Close</Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div><Label>Email *</Label><Input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="john@email.com" /></div>
              <DialogFooter><Button variant="outline" onClick={() => setShowForgotPassword(false)}>Cancel</Button><Button className="bg-sky-500 text-white hover:bg-sky-400" disabled={!forgotEmail} onClick={() => setForgotSent(true)}>Send reset link</Button></DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* PROFILE SETTINGS DIALOG */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><UserCog className="w-5 h-5 text-sky-500" /> Profile Settings</DialogTitle>
            <DialogDescription>Update your account details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={profileForm.name || currentUser?.name || ''} onChange={e => setProfileForm({...profileForm, name: e.target.value})} /></div>
            <div><Label>Email</Label><Input type="email" value={profileForm.email || currentUser?.email || ''} onChange={e => setProfileForm({...profileForm, email: e.target.value})} /></div>
            <div><Label>Phone</Label><Input value={profileForm.phone || currentUser?.phone || ''} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} /></div>
            <Separator />
            <div><Label>Current password (to change)</Label><Input type="password" value={profileForm.password} onChange={e => setProfileForm({...profileForm, password: e.target.value})} placeholder="Enter current password" /></div>
            <div><Label>New password (min 8 characters)</Label><Input type="password" value={profileForm.newPassword} onChange={e => setProfileForm({...profileForm, newPassword: e.target.value})} placeholder="Leave blank to keep current" minLength={8} /></div>
            <p className="text-[10px] text-slate-500">⚠️ Password changes require cloud authentication (coming soon). Profile info saves locally for now.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowProfile(false)}>Cancel</Button>
              <Button className="bg-sky-500 text-white hover:bg-sky-400" onClick={() => {
                if (currentUser) {
                  const updated = { ...currentUser, name: profileForm.name || currentUser.name, email: profileForm.email || currentUser.email, phone: profileForm.phone || currentUser.phone }
                  setCurrentUser(updated)
                  localStorage.setItem('ec_user', JSON.stringify(updated))
                }
                setShowProfile(false)
              }}>Save changes</Button>
            </DialogFooter>
            <Separator />
            {/* Delete Account — for users who want to leave */}
            {currentUser?.role !== 'admin' && (
              <div className="pt-3 border-t border-red-500/20">
                <p className="text-xs text-slate-500 mb-2">Permanently delete your account and all associated data.</p>
                <Button
                  variant="outline"
                  className="border-red-500/40 text-red-600 hover:bg-red-500/10 w-full"
                  onClick={async () => {
                    if (!confirm('Are you absolutely sure? This will permanently delete your account, listings, and messages. This action CANNOT be undone.')) return
                    if (!confirm('Last warning: Type-confirm by clicking OK one more time to permanently delete.')) return
                    try {
                      const res = await fetch('/api/auth/delete-account', { method: 'DELETE', credentials: 'include' })
                      if (res.ok) {
                        alert('Account deleted. You will be logged out.')
                        setCurrentUser(null)
                        localStorage.removeItem('ec_user')
                        setShowProfile(false)
                        setView('browse')
                      } else {
                        const data = await res.json()
                        alert(data.error || 'Failed to delete account')
                      }
                    } catch (err: any) {
                      alert(`Error: ${err.message}`)
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Delete My Account
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ListingCard({
  listing, saved, onToggleSave, onClick, onEnquire,
}: {
  listing: Listing
  saved: boolean
  onToggleSave: (id: string) => void
  onClick: () => void
  onEnquire: (id: string) => void
}) {
  // Use first image as primary (gallery support — stored as comma-separated)
  const primaryImage = listing.imageUrl ? listing.imageUrl.split('|')[0] : null
  const imageCount = listing.imageUrl ? listing.imageUrl.split('|').filter(Boolean).length : 0

  return (
    <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:border-sky-400/50 flex flex-col shadow-lg border border-white/10 rounded-2xl bg-white dark:bg-slate-900">
      <div className="aspect-video bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center relative cursor-pointer overflow-hidden" onClick={onClick}>
        {primaryImage ? (
          <img src={primaryImage} alt={`${listing.make} ${listing.model}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <Car className="w-12 h-12 text-slate-400" />
        )}
        {/* Gradient overlay on image bottom */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        {listing.featured && (
          <Badge className="absolute top-2 left-2 bg-sky-500 text-white"><Star className="w-3 h-3 mr-0.5" />Featured</Badge>
        )}
        {imageCount > 1 && (
          <Badge className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] backdrop-blur-sm">📷 {imageCount}</Badge>
        )}
        <Badge className="absolute top-2 right-2 bg-white/90 text-slate-700 capitalize backdrop-blur-sm">{listing.type}</Badge>
        <button
          className={`absolute bottom-2 right-2 p-2 rounded-full transition-all backdrop-blur-sm ${saved ? 'bg-red-500 text-white' : 'bg-white/80 text-slate-600 hover:bg-white'}`}
          onClick={(e) => { e.stopPropagation(); onToggleSave(listing.id); }}
          aria-label="Save"
        >
          <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
        </button>
      </div>
      <CardContent className="p-3 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-1 cursor-pointer" onClick={onClick}>
          <div>
            <h4 className="font-bold text-sm leading-tight text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors">{listing.make} {listing.model}</h4>
            <p className="text-xs text-slate-500">{listing.year} · {listing.region}</p>
          </div>
        </div>
        <div className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-blue-400 bg-clip-text text-transparent mb-2">{fmt(listing.price, listing.currency)}</div>
        <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 mb-3">
          <div className="flex items-center gap-1"><Fuel className="w-3 h-3" /> <span className="capitalize">{listing.fuelType}</span></div>
          <div className="flex items-center gap-1"><Settings2 className="w-3 h-3" /> <span className="capitalize">{listing.transmission}</span></div>
          <div className="flex items-center gap-1"><Gauge className="w-3 h-3" /> {listing.mileage.toLocaleString()} km</div>
          <div className="flex items-center gap-1"><Eye className="w-3 h-3" /> {listing.views} views</div>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 flex-1">{listing.description}</p>
        <Button size="sm" className="w-full bg-sky-500 text-white hover:bg-sky-400 hover:shadow-lg hover:shadow-sky-500/30 transition-all" onClick={() => onEnquire(listing.id)}>
          <MessageSquare className="w-3.5 h-3.5 mr-1" /> Buy/Enquire
        </Button>
      </CardContent>
    </Card>
  )
}

function AdminDashboard({ vehicleRequests, adminMessages, adminTeam, respondToMessage, removeAdmin, setShowAddAdmin }: {
  vehicleRequests: VehicleRequest[]
  adminMessages: AdminMessage[]
  adminTeam: AdminTeamMember[]
  respondToMessage: (id: string, response: string) => void
  removeAdmin: (email: string) => void
  setShowAddAdmin: (v: boolean) => void
}) {
  const [authed, setAuthed] = useState(false)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  const login = () => {
    if (pin === ADMIN_PIN) {
      setAuthed(true)
      setError('')
    } else {
      setError('Wrong PIN. Try again.')
    }
  }

  if (!authed) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5" /> Admin Login</CardTitle>
          <CardDescription>Enter your PIN to access the broker dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="pin">Admin PIN</Label>
            <Input id="pin" type="password" value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} placeholder="****" />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
          <Button className="w-full bg-sky-500 text-slate-900 hover:bg-sky-400" onClick={login}>
            <Lock className="w-4 h-4 mr-1" /> Unlock
          </Button>
          <p className="text-[10px] text-slate-500 text-center">Admin-only. Enter the broker PIN to continue.</p>
        </CardContent>
      </Card>
    )
  }

  return <AdminPanel vehicleRequests={vehicleRequests} adminMessages={adminMessages} adminTeam={adminTeam} respondToMessage={respondToMessage} removeAdmin={removeAdmin} setShowAddAdmin={setShowAddAdmin} />
}

function AdminPanel({ vehicleRequests, adminMessages, adminTeam, respondToMessage, removeAdmin, setShowAddAdmin }: {
  vehicleRequests: VehicleRequest[]
  adminMessages: AdminMessage[]
  adminTeam: AdminTeamMember[]
  respondToMessage: (id: string, response: string) => void
  removeAdmin: (email: string) => void
  setShowAddAdmin: (v: boolean) => void
}) {
  const [tab, setTab] = useState<'overview' | 'enquiries' | 'requests' | 'messages' | 'users' | 'team' | 'broadcasts'>('overview')
  const [responseText, setResponseText] = useState<string>('')

  const stats = {
    totals: {
      totalListings: STATIC_LISTINGS.length,
      activeListings: STATIC_LISTINGS.filter(l => l.status === 'active').length,
      soldListings: 2,
      totalEnquiries: 8,
      newEnquiries: 3,
      totalViews: STATIC_LISTINGS.reduce((sum, l) => sum + (l.views || 0), 0),
      messages: adminMessages.length,
      requests: vehicleRequests.length,
    },
    topListings: STATIC_LISTINGS.slice(0, 5).map((l, i) => ({
      id: l.id, make: l.make, model: l.model, year: l.year, price: l.price,
      views: l.views || 0, enquiries: Math.floor(Math.random() * 5) + 1,
    })),
    recentEnquiries: [
      { id: '1', buyerName: 'John Dlamini', buyerPhone: '+268 7612 3456', message: 'Is the Hilux still available?', status: 'new', createdAt: new Date(Date.now() - 3600000).toISOString(), listing: STATIC_LISTINGS[0] },
      { id: '2', buyerName: 'Sarah Mthembu', buyerPhone: '+268 7801 9988', message: 'Can I view the Polo this weekend?', status: 'contacted', createdAt: new Date(Date.now() - 7200000).toISOString(), listing: STATIC_LISTINGS[1] },
      { id: '3', buyerName: 'Bongani Simelane', buyerPhone: '+268 7605 1122', message: 'What is your best price for the Mercedes?', status: 'viewing', createdAt: new Date(Date.now() - 86400000).toISOString(), listing: STATIC_LISTINGS[2] },
    ],
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
          <LayoutDashboard className="w-6 h-6 text-sky-500" /> Broker Dashboard
        </h2>
        <div className="flex gap-1 flex-wrap">
          <Button size="sm" variant={tab === 'overview' ? 'default' : 'outline'} onClick={() => setTab('overview')}>Overview</Button>
          <Button size="sm" variant={tab === 'enquiries' ? 'default' : 'outline'} onClick={() => setTab('enquiries')}>
            Enquiries {stats.totals.newEnquiries > 0 && <Badge className="ml-1 bg-red-500 text-white text-[10px]">{stats.totals.newEnquiries}</Badge>}
          </Button>
          <Button size="sm" variant={tab === 'requests' ? 'default' : 'outline'} onClick={() => setTab('requests')}>
            <Search className="w-3 h-3 mr-1" /> Requests {vehicleRequests.length > 0 && <Badge className="ml-1 bg-sky-500 text-white text-[10px]">{vehicleRequests.length}</Badge>}
          </Button>
          <Button size="sm" variant={tab === 'messages' ? 'default' : 'outline'} onClick={() => setTab('messages')}>
            <Mail className="w-3 h-3 mr-1" /> Messages {adminMessages.filter(m => m.status === 'new').length > 0 && <Badge className="ml-1 bg-red-500 text-white text-[10px]">{adminMessages.filter(m => m.status === 'new').length}</Badge>}
          </Button>
          <Button size="sm" variant={tab === 'users' ? 'default' : 'outline'} onClick={() => setTab('users')}>
            <UserCog className="w-3 h-3 mr-1" /> Users
          </Button>
          <Button size="sm" variant={tab === 'team' ? 'default' : 'outline'} onClick={() => setTab('team')}>
            <Users className="w-3 h-3 mr-1" /> Team
          </Button>
          <Button size="sm" variant={tab === 'broadcasts' ? 'default' : 'outline'} onClick={() => setTab('broadcasts')}>
            <Megaphone className="w-3 h-3 mr-1" /> Broadcasts
          </Button>
        </div>
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Total listings" value={stats.totals.totalListings} icon={<Car className="w-5 h-5" />} />
            <StatCard label="Active" value={stats.totals.activeListings} icon={<CheckCircle2 className="w-5 h-5" />} tone="emerald" />
            <StatCard label="Sold" value={stats.totals.soldListings} icon={<DollarSign className="w-5 h-5" />} tone="sky" />
            <StatCard label="Views" value={stats.totals.totalViews} icon={<Eye className="w-5 h-5" />} />
            <StatCard label="Enquiries" value={stats.totals.totalEnquiries} icon={<MessageSquare className="w-5 h-5" />} />
            <StatCard label="Requests" value={stats.totals.requests} icon={<Search className="w-5 h-5" />} tone="sky" />
            <StatCard label="Messages" value={stats.totals.messages} icon={<Mail className="w-5 h-5" />} tone="red" />
            <StatCard label="Team" value={adminTeam.length} icon={<Users className="w-5 h-5" />} />
          </div>
          <Card><CardHeader><CardTitle className="text-base">Top listings</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {stats.topListings.map((l, i) => (
                <div key={l.id} className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <div className="text-sky-500 font-bold">#{i + 1}</div>
                  <div className="flex-1"><div className="text-sm font-semibold">{l.make} {l.model} ({l.year})</div><div className="text-xs text-slate-500">{fmt(l.price)} · {l.views} views · {l.enquiries} enquiries</div></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      {tab === 'enquiries' && (
        <div className="space-y-3">
          {stats.recentEnquiries.map((enq, i) => (
            <Card key={i}><CardContent className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2"><div><div className="font-semibold text-sm">{enq.buyerName}</div><div className="text-xs text-slate-500">{enq.buyerPhone}</div></div><StatusBadge status={enq.status} /></div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{enq.message}</p>
              <div className="flex items-center justify-between text-xs text-slate-500"><span>{enq.listing?.make} {enq.listing?.model}</span><span>{fmtDate(enq.createdAt)}</span></div>
            </CardContent></Card>
          ))}
        </div>
      )}

      {tab === 'requests' && (
        <div className="space-y-3">
          {vehicleRequests.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-slate-500">No vehicle requests yet.</CardContent></Card>
          ) : (
            vehicleRequests.map((req) => (
              <Card key={req.id}><CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2"><div><div className="font-semibold text-sm">{req.requesterName}</div><div className="text-xs text-slate-500">{req.requesterEmail} · {req.requesterPhone}</div></div><Badge className="bg-sky-500/20 text-sky-300 capitalize">{req.status}</Badge></div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                  <b>Wants:</b> {req.vehicleType} · {req.make || 'Any make'} {req.model} · Budget: E{req.minBudget || '0'} - E{req.maxBudget || 'Any'} · {req.region}
                </div>
                {req.description && <p className="text-xs text-slate-500 italic">"{req.description}"</p>}
                <div className="text-[10px] text-slate-400 mt-2">{fmtDate(req.createdAt)}</div>
              </CardContent></Card>
            ))
          )}
        </div>
      )}

      {tab === 'messages' && (
        <div className="space-y-3">
          {adminMessages.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-slate-500">No messages yet.</CardContent></Card>
          ) : (
            adminMessages.map((msg) => {
              const replies = Array.isArray(msg.replies) ? msg.replies : []
              return (
                <Card key={msg.id}>
                  <CardContent className="p-4">
                    {/* Conversation header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm text-white">{msg.subject}</div>
                        <div className="text-xs text-slate-500">
                          From: {msg.userEmail}{msg.username ? ` (@${msg.username})` : ''}
                        </div>
                      </div>
                      <Badge className={`shrink-0 ${msg.status === 'new' ? 'bg-red-500/20 text-red-300' : msg.status === 'responded' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-sky-500/20 text-sky-300'}`}>
                        {msg.status}
                      </Badge>
                    </div>

                    {/* Original user message — shown on the LEFT (admin sees user on left).
                        Label uses the username if available, otherwise falls back to the
                        email prefix. This is what the user asked for: 'user in admin
                        dashboard must be identified by username not You'. */}
                    <div className="flex justify-start mb-2">
                      <div className="bg-sky-500/20 border border-sky-500/30 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[80%]">
                        <div className="text-[10px] text-sky-300 font-semibold mb-0.5">
                          {(msg.username || msg.userEmail.split('@')[0]).toUpperCase()}
                        </div>
                        <p className="text-xs text-white whitespace-pre-wrap break-words">{msg.message}</p>
                        <div className="text-[9px] text-slate-500 mt-1">{fmtDate(msg.createdAt)}</div>
                      </div>
                    </div>

                    {/* All replies in the thread, sorted chronologically.
                        Admin replies on the RIGHT (admin's own messages, labeled 'YOU (ADMIN)'),
                        User replies on the LEFT (labeled with the user's username, NOT 'You'). */}
                    {replies.map((reply) => {
                      const isAdminReply = reply.sender === 'admin'
                      // For user replies in the admin view, use the username (not 'You').
                      // The user explicitly requested: 'user in admin dashboard must be
                      // identified by username not You'.
                      const userLabel = (msg.username || msg.userEmail.split('@')[0]).toUpperCase()
                      return (
                        <div key={reply.id} className={`flex mb-2 ${isAdminReply ? 'justify-end' : 'justify-start'}`}>
                          <div className={`rounded-2xl px-3 py-2 max-w-[80%] ${
                            isAdminReply
                              ? 'bg-amber-500/10 border border-amber-500/30 rounded-tr-sm'
                              : 'bg-sky-500/20 border border-sky-500/30 rounded-tl-sm'
                          }`}>
                            <div className={`text-[10px] font-semibold mb-0.5 ${isAdminReply ? 'text-amber-300' : 'text-sky-300'}`}>
                              {isAdminReply ? 'YOU (ADMIN)' : userLabel}
                            </div>
                            <p className={`text-xs whitespace-pre-wrap break-words ${isAdminReply ? 'text-slate-200' : 'text-white'}`}>
                              {reply.text}
                            </p>
                            <div className="text-[9px] text-slate-500 mt-1">{fmtDate(reply.createdAt)}</div>
                          </div>
                        </div>
                      )
                    })}

                    {/* Legacy single response display (for messages that have
                        msg.response set but no replies array — backwards compat
                        with old records that pre-date the ContactReply table). */}
                    {msg.response && replies.length === 0 && (
                      <div className="flex justify-end mb-2">
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl rounded-tr-sm px-3 py-2 max-w-[80%]">
                          <div className="text-[10px] text-amber-300 font-semibold mb-0.5">YOU (ADMIN)</div>
                          <p className="text-xs text-slate-200 whitespace-pre-wrap break-words">{msg.response}</p>
                        </div>
                      </div>
                    )}

                    {/* Reply box is ALWAYS visible — admin can continue the
                        conversation at any time, not just on the first reply. */}
                    <ReplyBox
                      placeholder="Type your response..."
                      onSend={(text) => { respondToMessage(msg.id, text) }}
                      disabled={false}
                    />
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      )}

      {tab === 'users' && (
        <UserManagementTab />
      )}

      {tab === 'broadcasts' && (
        <BroadcastsTab />
      )}

      {tab === 'team' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-white/80 uppercase tracking-widest">Admin Team</h3>
            <Button size="sm" className="bg-sky-500 text-white hover:bg-sky-400" onClick={() => setShowAddAdmin(true)}><UserPlus className="w-4 h-4 mr-1" /> Add Member</Button>
          </div>
          {adminTeam.map((member) => (
            <Card key={member.email}><CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${member.role === 'main_admin' ? 'bg-amber-500/20' : 'bg-sky-500/20'}`}>
                  {member.role === 'main_admin' ? <ShieldCheck className="w-5 h-5 text-amber-400" /> : <UserCog className="w-5 h-5 text-sky-400" />}
                </div>
                <div>
                  <div className="font-semibold text-sm">{member.name}</div>
                  <div className="text-xs text-slate-500">{member.email}</div>
                  <Badge className={`mt-1 text-[10px] ${member.role === 'main_admin' ? 'bg-amber-500/20 text-amber-300' : 'bg-sky-500/20 text-sky-300'}`}>{member.role === 'main_admin' ? 'Main Admin' : 'Minor Admin'}</Badge>
                </div>
              </div>
              {member.role !== 'main_admin' && (
                <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-500/10" onClick={() => removeAdmin(member.email)}><UserMinus className="w-4 h-4" /></Button>
              )}
            </CardContent></Card>
          ))}
          <div className="text-xs text-slate-500 bg-white/5 p-4 rounded-2xl">
            <p className="font-semibold mb-2">Main Admin Controls:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Add/remove minor admins anytime</li>
              <li>Delete any listing (indefinite)</li>
              <li>Edit any listing</li>
              <li>View all vehicle requests with contact details</li>
              <li>Respond to user messages</li>
              <li>Full dashboard access</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

function MessageInput({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState('')
  return (
    <div className="flex gap-2">
      <Input value={text} onChange={e => setText(e.target.value)} placeholder="Type your reply to the buyer..." onKeyDown={e => { if (e.key === 'Enter' && text.trim()) { onSend(text); setText('') } }} />
      <Button className="bg-sky-500 text-slate-900 hover:bg-sky-400" onClick={() => { if (text.trim()) { onSend(text); setText('') } }}>
        <Send className="w-4 h-4" />
      </Button>
    </div>
  )
}

// === ReplyBox — multi-line reply input used in message conversations.
// Self-contained: holds its own text state, clears on successful send, supports
// Enter-to-send (Shift+Enter for newline) and shows a sending state.
function ReplyBox({ onSend, placeholder = "Type your reply...", disabled = false }: { onSend: (text: string) => void | Promise<void>; placeholder?: string; disabled?: boolean }) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const handleSend = async () => {
    if (!text.trim() || sending || disabled) return
    setSending(true)
    try {
      await onSend(text)
      setText('')
    } finally {
      setSending(false)
    }
  }
  return (
    <div className="flex gap-2 items-end">
      <Textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={placeholder}
        rows={2}
        disabled={disabled || sending}
        className="text-xs resize-none"
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
          }
        }}
      />
      <Button size="sm" className="bg-sky-500 text-white hover:bg-sky-400" disabled={sending || !text.trim() || disabled} onClick={handleSend}>
        {sending ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Send className="w-3 h-3" />}
      </Button>
    </div>
  )
}

// === BroadcastsTab — Admin broadcasts compose + list. Posts to /api/broadcasts
// and lists existing broadcasts (newest first) with a quick "audience" badge.
function BroadcastsTab() {
  const [form, setForm] = useState({ title: '', message: '', audience: 'all' })
  const [broadcasts, setBroadcasts] = useState<Array<{ id: string; title: string; message: string; audience: string; status: string; createdAt: string }>>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const fetchBroadcasts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/broadcasts', { credentials: 'include' })
      const data = await res.json()
      setBroadcasts(data.broadcasts || [])
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { fetchBroadcasts() }, [fetchBroadcasts])

  const handleSubmit = async () => {
    if (!form.title || !form.message) return
    setSending(true)
    try {
      const res = await fetch('/api/broadcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setForm({ title: '', message: '', audience: 'all' })
        await fetchBroadcasts()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to send broadcast')
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
    setSending(false)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Megaphone className="w-4 h-4 text-amber-500" /> Compose Broadcast</CardTitle>
          <CardDescription>Send an announcement banner to all users. Appears at the top of every page until dismissed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Title *</Label>
            <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. New Year Special" />
          </div>
          <div>
            <Label className="text-xs">Message *</Label>
            <Textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Describe the announcement in 1-2 sentences." rows={3} />
          </div>
          <div>
            <Label className="text-xs">Audience</Label>
            <Select value={form.audience} onValueChange={v => setForm({ ...form, audience: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All visitors</SelectItem>
                <SelectItem value="registered">Registered users only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end pt-2">
            <Button className="bg-sky-500 text-white hover:bg-sky-400" disabled={!form.title || !form.message || sending} onClick={handleSubmit}>
              <Send className="w-4 h-4 mr-1" /> {sending ? 'Sending...' : 'Send Broadcast'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active Broadcasts</CardTitle>
          <CardDescription>{broadcasts.length} broadcast{broadcasts.length === 1 ? '' : 's'} visible to users.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <p className="text-xs text-slate-500">Loading...</p>
          ) : broadcasts.length === 0 ? (
            <p className="text-xs text-slate-500">No active broadcasts.</p>
          ) : (
            broadcasts.map(b => (
              <div key={b.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="font-semibold text-sm">{b.title}</div>
                  <div className="flex items-center gap-1">
                    <Badge className="bg-amber-500/20 text-amber-300 text-[10px] capitalize">{b.audience}</Badge>
                    <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px] capitalize">{b.status}</Badge>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">{b.message}</p>
                <div className="text-[10px] text-slate-400 mt-1">{fmtDate(b.createdAt)}</div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ label, value, icon, tone = 'slate' }: { label: string; value: number; icon: React.ReactNode; tone?: 'slate' | 'emerald' | 'sky' | 'red' }) {
  const tones = {
    slate: 'bg-slate-100 dark:bg-slate-800',
    emerald: 'bg-emerald-100 dark:bg-emerald-950/40',
    sky: 'bg-sky-100 dark:bg-sky-950/40',
    red: 'bg-red-100 dark:bg-red-950/40',
  }
  return (
    <Card>
      <CardContent className="p-4">
        <div className={`w-8 h-8 rounded-2xl flex items-center justify-center mb-2 ${tones[tone]}`}>{icon}</div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-slate-500">{label}</div>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    new: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
    contacted: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    viewing: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
    sold: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    lost: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  }
  return <Badge className={`${colors[status] || ''} capitalize`}>{status}</Badge>
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-500 text-slate-900 font-bold flex items-center justify-center text-sm">{n}</div>
      <div>
        <div className="font-semibold text-sm mb-1">{title}</div>
        <div className="text-sm text-slate-600 dark:text-slate-400">{desc}</div>
      </div>
    </div>
  )
}

function Spec({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded">
      <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase tracking-wide">{icon}{label}</div>
      <div className="text-sm font-semibold capitalize mt-0.5">{value}</div>
    </div>
  )
}

// Gallery component for viewing all uploaded images of a listing
function ListingGallery({ images, make, model }: { images: string[]; make: string; model: string }) {
  const [active, setActive] = useState<string | null>(null)
  const [zoom, setZoom] = useState<string | null>(null)
  const primary = images[0]
  const current = active || primary

  return (
    <div className="space-y-2">
      <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden relative group">
        {current ? (
          <>
            <ImageWithLoader src={current} alt={`${make} ${model}`} />
            <button
              type="button"
              onClick={() => setZoom(current)}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="View full size"
            >
              <Eye className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="flex items-center justify-center h-full"><Car className="w-12 h-12 text-slate-400" /></div>
        )}
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-8 gap-1.5">
          {images.map((img, i) => (
            <button
              key={i}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${current === img ? 'border-sky-500' : 'border-transparent opacity-70 hover:opacity-100'}`}
              onClick={() => setActive(img)}
            >
              <ImageWithLoader src={img} alt={`Photo ${i + 1}`} />
            </button>
          ))}
        </div>
      )}
      {zoom && (
        <Lightbox src={zoom} alt={`${make} ${model}`} onClose={() => setZoom(null)} />
      )}
    </div>
  )
}

// FadeIn wrapper — fades children in as the user scrolls into view
function FadeIn({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.unobserve(el)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

// ImageWithLoader — shows a spinner while the image loads, then fades it in.
// Eliminates the "broken icon" perception while the browser is still fetching.
function ImageWithLoader({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  return (
    <div className={`relative w-full h-full ${className}`}>
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
          <div className="w-5 h-5 border-2 border-slate-300 border-t-sky-500 rounded-full animate-spin" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400">
          <Car className="w-6 h-6" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}

// Lightbox — full-screen image viewer rendered via PORTAL to document.body.
// By portaling OUTSIDE the React tree, we escape any Dialog's event capture zone.
// No Dialog overlay can intercept our clicks. The X button is guaranteed to work.
function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        e.preventDefault()
        onClose()
      }
    }
    // Capture phase — grab Escape before anyone else
    window.addEventListener('keydown', onKey, true)
    // Lock body scroll
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey, true)
      document.body.style.overflow = prev
    }
  }, [onClose])

  // Render directly into document.body — completely outside any Dialog portal.
  // z-[9999] guarantees we're above EVERYTHING (Dialogs use z-50).
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center p-4"
      onClick={(e) => { e.stopPropagation(); onClose() }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Close button — big, solid red, top-right corner */}
      <button
        type="button"
        className="absolute top-4 right-4 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-2xl border-2 border-white"
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); onClose() }}
        onPointerDown={(e) => { e.stopPropagation(); e.preventDefault() }}
        aria-label="Close"
        style={{ touchAction: 'manipulation' }}
      >
        <X className="w-8 h-8" strokeWidth={3} />
      </button>

      {/* Hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-xs bg-black/60 px-4 py-2 rounded-full">
        Tap ✕ or anywhere outside the image to close
      </div>

      {/* Spinner while loading */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* The image — click on it does NOT close */}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        style={{ position: 'relative', zIndex: 1 }}
        onClick={(e) => { e.stopPropagation(); e.preventDefault() }}
        onPointerDown={(e) => e.stopPropagation()}
      />
    </div>,
    document.body
  )
}

// === UserManagementTab — Admin can search, block, and delete users ===
function UserManagementTab() {
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = useCallback(async (search?: string) => {
    setLoading(true)
    try {
      const url = `/api/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`
      const res = await fetch(url, { credentials: 'include' })
      const data = await res.json()
      setUsers(data.users || [])
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleAction = async (userId: string, action: 'block' | 'unblock' | 'delete', userName: string) => {
    const confirmMsg = action === 'delete'
      ? `Permanently delete ${userName}? This removes their account, listings, and messages. CANNOT be undone.`
      : action === 'block'
      ? `Block ${userName}? They won't be able to log in.`
      : `Unblock ${userName}? They can log in again.`
    if (!confirm(confirmMsg)) return
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, action }),
      })
      if (res.ok) {
        await fetchUsers(searchQuery)
      } else {
        const data = await res.json()
        alert(data.error || 'Action failed')
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><UserCog className="w-4 h-4 text-amber-500" /> User Management</CardTitle>
          <CardDescription>Search by email, phone, or username. Block or delete troublesome users.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Search by email, username, phone, or name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') fetchUsers(searchQuery) }}
              className="text-sm"
            />
            <Button size="sm" className="bg-sky-500 text-white hover:bg-sky-400" onClick={() => fetchUsers(searchQuery)}>
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card><CardContent className="p-8 text-center text-slate-500">Loading users...</CardContent></Card>
      ) : users.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-slate-500">No users found.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">{users.length} user{users.length === 1 ? '' : 's'} found</p>
          {users.map((u) => (
            <Card key={u.id}>
              <CardContent className="p-3 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${u.blocked ? 'bg-red-500/20' : u.role === 'admin' ? 'bg-amber-500/20' : 'bg-sky-500/20'}`}>
                    {u.blocked ? <Ban className="w-5 h-5 text-red-400" /> : u.role === 'admin' ? <ShieldCheck className="w-5 h-5 text-amber-400" /> : <UserCog className="w-5 h-5 text-sky-400" />}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{u.name}</div>
                    <div className="text-xs text-slate-500 truncate">@{u.username} · {u.email}</div>
                    <div className="text-xs text-slate-400">{u.phone || 'No phone'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {u.blocked && <Badge className="bg-red-500/20 text-red-300 text-[10px]">Blocked</Badge>}
                  {u.role === 'admin' && <Badge className="bg-amber-500/20 text-amber-300 text-[10px]">Admin</Badge>}
                  {u.role !== 'admin' && (
                    <>
                      {u.blocked ? (
                        <Button size="sm" variant="outline" className="border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 px-2" onClick={() => handleAction(u.id, 'unblock', u.name)} title="Unblock user">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="border-amber-500/40 text-amber-600 hover:bg-amber-500/10 px-2" onClick={() => handleAction(u.id, 'block', u.name)} title="Block user">
                          <Ban className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="border-red-500/40 text-red-600 hover:bg-red-500/10 px-2" onClick={() => handleAction(u.id, 'delete', u.name)} title="Delete user">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
