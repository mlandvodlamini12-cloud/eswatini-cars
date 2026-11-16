import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Listing, fetchListingDetail } from '../api'
import { formatPrice } from '../components/ListingCard'

const NAVY = '#0a1834'
const NAVY_LIGHT = '#14254a'
const GOLD = '#ffc832'
const SKY_BLUE = '#38bdf8'
const TEXT_LIGHT = '#e2e8f0'
const TEXT_DIM = '#94a3b8'
const SCREEN_WIDTH = Dimensions.get('window').width

export default function CarDetailScreen({ route, navigation }: any) {
  const { listingId, listing: passedListing } = route.params
  const [listing, setListing] = useState<Listing | null>(passedListing || null)
  const [loading, setLoading] = useState(!passedListing)

  useEffect(() => {
    if (!passedListing && listingId) {
      fetchListingDetail(listingId).then(data => {
        setListing(data)
        setLoading(false)
      })
    }
  }, [listingId, passedListing])

  if (loading || !listing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={TEXT_LIGHT} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={SKY_BLUE} />
        </View>
      </SafeAreaView>
    )
  }

  const images = listing.imageUrl ? listing.imageUrl.split('|') : []
  const phone = listing.sellerPhone

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={TEXT_LIGHT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Car Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        {images.length > 0 ? (
          <Image source={{ uri: images[0] }} style={styles.heroImage} />
        ) : (
          <View style={[styles.heroImage, styles.noImage]}>
            <Ionicons name="car" size={60} color={TEXT_DIM} />
          </View>
        )}

        {/* Title + Price */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{listing.year} {listing.make} {listing.model}</Text>
          <Text style={styles.price}>{formatPrice(listing.price)}</Text>
          {listing.featured && (
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={11} color={NAVY} />
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
        </View>

        {/* Specs grid */}
        <View style={styles.specsContainer}>
          {listing.fuelType && (
            <View style={styles.specCard}>
              <Ionicons name="flame" size={18} color={SKY_BLUE} />
              <Text style={styles.specLabel}>Fuel</Text>
              <Text style={styles.specValue}>{listing.fuelType}</Text>
            </View>
          )}
          {listing.transmission && (
            <View style={styles.specCard}>
              <Ionicons name="settings" size={18} color={SKY_BLUE} />
              <Text style={styles.specLabel}>Transmission</Text>
              <Text style={styles.specValue}>{listing.transmission}</Text>
            </View>
          )}
          {listing.mileage != null && (
            <View style={styles.specCard}>
              <Ionicons name="speedometer" size={18} color={SKY_BLUE} />
              <Text style={styles.specLabel}>Mileage</Text>
              <Text style={styles.specValue}>{listing.mileage.toLocaleString()} km</Text>
            </View>
          )}
          {listing.color && (
            <View style={styles.specCard}>
              <Ionicons name="color-palette" size={18} color={SKY_BLUE} />
              <Text style={styles.specLabel}>Color</Text>
              <Text style={styles.specValue}>{listing.color}</Text>
            </View>
          )}
        </View>

        {/* Region */}
        <View style={styles.infoRow}>
          <Ionicons name="location" size={16} color={TEXT_DIM} />
          <Text style={styles.infoText}>{listing.region}, Eswatini</Text>
        </View>

        {/* Description */}
        {listing.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{listing.description}</Text>
          </View>
        )}

        {/* Photo gallery (if multiple images) */}
        {images.length > 1 && (
          <View style={styles.gallerySection}>
            <Text style={styles.sectionTitle}>Photos ({images.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {images.map((img, i) => (
                <Image key={i} source={{ uri: img }} style={styles.galleryImage} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Contact buttons */}
        <View style={styles.contactSection}>
          {phone && (
            <>
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => Linking.openURL(`tel:${phone}`)}
                activeOpacity={0.8}
              >
                <Ionicons name="call" size={20} color={NAVY} />
                <Text style={styles.callButtonText}>Call Seller</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.whatsappButton}
                onPress={() => Linking.openURL(`https://wa.me/${phone.replace(/[^0-9]/g, '')}`)}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-whatsapp" size={20} color={TEXT_LIGHT} />
                <Text style={styles.whatsappButtonText}>WhatsApp</Text>
              </TouchableOpacity>
            </>
          )}
          {!phone && (
            <Text style={styles.noContactText}>
              Contact details available after login (Phase 3)
            </Text>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NAVY },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: NAVY_LIGHT,
  },
  backButton: { padding: 4 },
  headerTitle: { color: TEXT_LIGHT, fontSize: 17, fontWeight: '600' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroImage: {
    width: SCREEN_WIDTH,
    height: 250,
    backgroundColor: NAVY_LIGHT,
  },
  noImage: { alignItems: 'center', justifyContent: 'center' },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    color: TEXT_LIGHT,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  price: {
    color: GOLD,
    fontSize: 26,
    fontWeight: 'bold',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: GOLD,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  featuredText: { color: NAVY, fontSize: 11, fontWeight: '700' },
  specsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  specCard: {
    backgroundColor: NAVY_LIGHT,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: (SCREEN_WIDTH - 48) / 4,
  },
  specLabel: { color: TEXT_DIM, fontSize: 10, marginTop: 4, textTransform: 'uppercase' },
  specValue: { color: TEXT_LIGHT, fontSize: 12, fontWeight: '600', marginTop: 2, textAlign: 'center' },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  infoText: { color: TEXT_DIM, fontSize: 14 },
  sectionTitle: {
    color: TEXT_LIGHT,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  descriptionSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  descriptionText: {
    color: TEXT_DIM,
    fontSize: 14,
    lineHeight: 22,
  },
  gallerySection: {
    paddingTop: 20,
    paddingLeft: 20,
  },
  galleryImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: NAVY_LIGHT,
  },
  contactSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 10,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: GOLD,
    paddingVertical: 14,
    borderRadius: 14,
  },
  callButtonText: { color: NAVY, fontSize: 16, fontWeight: 'bold' },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#25D366',
    paddingVertical: 14,
    borderRadius: 14,
  },
  whatsappButtonText: { color: TEXT_LIGHT, fontSize: 16, fontWeight: 'bold' },
  noContactText: {
    color: TEXT_DIM,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
})
