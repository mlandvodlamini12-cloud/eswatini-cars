import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Listing, fetchListings } from '../api'
import { ListingCard, formatPrice } from '../components/ListingCard'

const NAVY = '#0a1834'
const NAVY_LIGHT = '#14254a'
const GOLD = '#ffc832'
const SKY_BLUE = '#38bdf8'
const TEXT_LIGHT = '#e2e8f0'
const TEXT_DIM = '#94a3b8'

const CATEGORIES = [
  { key: 'all', label: 'All', icon: 'car' },
  { key: 'sedan', label: 'Sedans', icon: 'car-sport' },
  { key: 'bakkie', label: 'Bakkies', icon: 'speedometer' },
  { key: 'van', label: 'Vans', icon: 'bus' },
  { key: 'motorcycle', label: 'Bikes', icon: 'bicycle' },
  { key: 'parts', label: 'Parts', icon: 'build' },
]

export default function BrowseScreen({ navigation }: any) {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [error, setError] = useState<string | null>(null)

  const loadListings = useCallback(async (category?: string) => {
    try {
      setError(null)
      const data = await fetchListings(category || selectedCategory)
      setListings(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load listings')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [selectedCategory])

  useEffect(() => {
    setLoading(true)
    loadListings('all')
  }, [])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    loadListings()
  }, [loadListings])

  const onCategoryPress = useCallback((category: string) => {
    setSelectedCategory(category)
    setLoading(true)
    loadListings(category)
  }, [loadListings])

  const featuredListings = listings.filter(l => l.featured)
  const regularListings = listings.filter(l => !l.featured)

  const openDetail = (item: Listing) => {
    navigation.navigate('CarDetail', { listingId: item.id, listing: item })
  }

  if (loading && listings.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Eswatini Cars</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={SKY_BLUE} />
          <Text style={styles.loadingText}>Loading listings...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error && listings.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Eswatini Cars</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline" size={48} color={TEXT_DIM} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadListings('all')}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Eswatini Cars</Text>
          <Text style={styles.headerSubtitle}>Find your next vehicle</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{listings.length} cars</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesBar} contentContainerStyle={styles.categoriesContent}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.categoryChip, selectedCategory === cat.key && styles.categoryChipActive]}
            onPress={() => onCategoryPress(cat.key)}
          >
            <Ionicons name={cat.icon as any} size={14} color={selectedCategory === cat.key ? NAVY : TEXT_DIM} />
            <Text style={[styles.categoryText, selectedCategory === cat.key && styles.categoryTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={regularListings}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={SKY_BLUE} />}
        ListHeaderComponent={
          featuredListings.length > 0 ? (
            <View style={styles.featuredSection}>
              <Text style={styles.sectionTitle}>Featured</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {featuredListings.map(listing => (
                  <TouchableOpacity
                    key={listing.id}
                    style={styles.featuredCard}
                    activeOpacity={0.8}
                    onPress={() => openDetail(listing)}
                  >
                    {listing.imageUrl ? (
                      <Image source={{ uri: listing.imageUrl.split('|')[0] }} style={styles.featuredImage} />
                    ) : (
                      <View style={[styles.featuredImage, styles.noImage]}>
                        <Ionicons name="car" size={32} color={TEXT_DIM} />
                      </View>
                    )}
                    <Text style={styles.featuredTitle} numberOfLines={1}>
                      {listing.year} {listing.make} {listing.model}
                    </Text>
                    <Text style={styles.featuredPrice}>{formatPrice(listing.price)}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={styles.sectionTitle}>Just Listed</Text>
            </View>
          ) : (
            <Text style={styles.sectionTitle}>All Listings</Text>
          )
        }
        renderItem={({ item }) => (
          <ListingCard listing={item} onPress={() => openDetail(item)} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="car" size={48} color={TEXT_DIM} />
            <Text style={styles.emptyText}>No listings found</Text>
            <Text style={styles.emptySubtext}>Try a different category</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NAVY },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: NAVY_LIGHT,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: TEXT_LIGHT },
  headerSubtitle: { fontSize: 13, color: TEXT_DIM, marginTop: 2 },
  headerBadge: { backgroundColor: 'rgba(56,189,248,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  headerBadgeText: { color: SKY_BLUE, fontSize: 13, fontWeight: '600' },
  categoriesBar: { maxHeight: 50, backgroundColor: NAVY },
  categoriesContent: { paddingHorizontal: 16, gap: 8 },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: NAVY_LIGHT, marginRight: 8,
  },
  categoryChipActive: { backgroundColor: GOLD },
  categoryText: { color: TEXT_DIM, fontSize: 13, fontWeight: '500' },
  categoryTextActive: { color: NAVY, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: TEXT_LIGHT, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  featuredSection: { paddingBottom: 8 },
  featuredCard: { width: 200, marginLeft: 20, marginBottom: 8 },
  featuredImage: { width: 200, height: 120, borderRadius: 12, marginBottom: 6, backgroundColor: NAVY_LIGHT },
  noImage: { alignItems: 'center', justifyContent: 'center' },
  featuredTitle: { color: TEXT_LIGHT, fontSize: 13, fontWeight: '600' },
  featuredPrice: { color: GOLD, fontSize: 15, fontWeight: 'bold', marginTop: 2 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: TEXT_DIM, fontSize: 14 },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 40 },
  errorText: { color: TEXT_DIM, fontSize: 14, textAlign: 'center' },
  retryButton: { backgroundColor: SKY_BLUE, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  retryText: { color: NAVY, fontWeight: '700', fontSize: 14 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 8 },
  emptyText: { color: TEXT_LIGHT, fontSize: 16, fontWeight: '600' },
  emptySubtext: { color: TEXT_DIM, fontSize: 14 },
  listContent: { paddingBottom: 40 },
})
