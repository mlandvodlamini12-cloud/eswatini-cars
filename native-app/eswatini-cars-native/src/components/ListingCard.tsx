import React from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Listing } from '../api'

const NAVY = '#0a1834'
const NAVY_LIGHT = '#14254a'
const GOLD = '#ffc832'
const TEXT_LIGHT = '#e2e8f0'
const TEXT_DIM = '#94a3b8'

export function formatPrice(price: number): string {
  return `E${price.toLocaleString()}`
}

export function ListingCard({ listing, onPress }: { listing: Listing; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {listing.imageUrl ? (
        <Image source={{ uri: listing.imageUrl.split('|')[0] }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, styles.noImage]}>
          <Ionicons name="car" size={32} color={TEXT_DIM} />
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {listing.year} {listing.make} {listing.model}
        </Text>
        <Text style={styles.cardPrice}>{formatPrice(listing.price)}</Text>
        <View style={styles.cardMeta}>
          <Ionicons name="location" size={11} color={TEXT_DIM} />
          <Text style={styles.cardRegion}>{listing.region}</Text>
          {listing.fuelType && (
            <>
              <Text style={styles.dot}>·</Text>
              <Text style={styles.cardFuel}>{listing.fuelType}</Text>
            </>
          )}
        </View>
      </View>
      {listing.featured && (
        <View style={styles.featuredBadge}>
          <Ionicons name="star" size={9} color={NAVY} />
          <Text style={styles.featuredText}>Featured</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: NAVY_LIGHT,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    overflow: 'hidden',
    padding: 12,
    gap: 12,
  },
  cardImage: {
    width: 90,
    height: 68,
    borderRadius: 10,
    backgroundColor: NAVY,
  },
  noImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    color: TEXT_LIGHT,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 3,
  },
  cardPrice: {
    color: GOLD,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  cardRegion: { color: TEXT_DIM, fontSize: 11 },
  cardFuel: { color: TEXT_DIM, fontSize: 11 },
  dot: { color: TEXT_DIM, fontSize: 11 },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: GOLD,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  featuredText: { color: NAVY, fontSize: 9, fontWeight: '700' },
})
