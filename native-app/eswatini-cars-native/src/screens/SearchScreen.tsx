import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Listing, fetchListings } from '../api'
import { ListingCard } from '../components/ListingCard'

const NAVY = '#0a1834'
const NAVY_LIGHT = '#14254a'
const GOLD = '#ffc832'
const SKY_BLUE = '#38bdf8'
const TEXT_LIGHT = '#e2e8f0'
const TEXT_DIM = '#94a3b8'

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'sedan', label: 'Sedan' },
  { key: 'bakkie', label: 'Bakkie' },
  { key: 'van', label: 'Van' },
  { key: 'motorcycle', label: 'Bike' },
  { key: 'parts', label: 'Parts' },
]

const REGIONS = ['all', 'Hhohho', 'Manzini', 'Shiselweni', 'Lubombo']

export default function SearchScreen({ navigation }: any) {
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [results, setResults] = useState<Listing[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const doSearch = useCallback(async () => {
    setLoading(true)
    setHasSearched(true)
    try {
      let data = await fetchListings(selectedCategory)
      // Filter by search text
      if (searchText.trim()) {
        const q = searchText.toLowerCase()
        data = data.filter(l =>
          l.make.toLowerCase().includes(q) ||
          l.model.toLowerCase().includes(q) ||
          String(l.year).includes(q)
        )
      }
      // Filter by region
      if (selectedRegion !== 'all') {
        data = data.filter(l => l.region === selectedRegion)
      }
      setResults(data)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [searchText, selectedCategory, selectedRegion])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    doSearch().finally(() => setRefreshing(false))
  }, [doSearch])

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      {/* Search input */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={TEXT_DIM} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search make, model, year..."
          placeholderTextColor={TEXT_DIM}
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={doSearch}
          returnKeyType="search"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={18} color={TEXT_DIM} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.chip, selectedCategory === cat.key && styles.chipActive]}
            onPress={() => setSelectedCategory(cat.key)}
          >
            <Text style={[styles.chipText, selectedCategory === cat.key && styles.chipTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Region filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {REGIONS.map(region => (
          <TouchableOpacity
            key={region}
            style={[styles.chip, selectedRegion === region && styles.chipActive]}
            onPress={() => setSelectedRegion(region)}
          >
            <Ionicons name="location" size={12} color={selectedRegion === region ? NAVY : TEXT_DIM} />
            <Text style={[styles.chipText, selectedRegion === region && styles.chipTextActive]}>
              {region === 'all' ? 'All Regions' : region}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Search button */}
      <TouchableOpacity style={styles.searchButton} onPress={doSearch} activeOpacity={0.8}>
        <Text style={styles.searchButtonText}>Search ({results.length || '?'})</Text>
      </TouchableOpacity>

      {/* Results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={SKY_BLUE} />
        </View>
      ) : hasSearched ? (
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={SKY_BLUE} />}
          renderItem={({ item }) => (
            <ListingCard
              listing={item}
              onPress={() => navigation.navigate('CarDetail', { listingId: item.id, listing: item })}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search" size={48} color={TEXT_DIM} />
              <Text style={styles.emptyText}>No results found</Text>
              <Text style={styles.emptySubtext}>Try different filters</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      ) : (
        <View style={styles.initialContainer}>
          <Ionicons name="search" size={60} color={TEXT_DIM} />
          <Text style={styles.initialText}>Search for vehicles</Text>
          <Text style={styles.initialSubtext}>Enter a keyword or use filters above</Text>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NAVY },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: NAVY_LIGHT,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: { color: TEXT_LIGHT, fontSize: 22, fontWeight: 'bold' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: NAVY_LIGHT,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    color: TEXT_LIGHT,
    fontSize: 15,
  },
  filterRow: {
    maxHeight: 44,
    marginTop: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: NAVY_LIGHT,
    marginLeft: 16,
  },
  chipActive: { backgroundColor: GOLD },
  chipText: { color: TEXT_DIM, fontSize: 12, fontWeight: '500' },
  chipTextActive: { color: NAVY, fontWeight: '700' },
  searchButton: {
    backgroundColor: SKY_BLUE,
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  searchButtonText: { color: NAVY, fontSize: 15, fontWeight: 'bold' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { color: TEXT_LIGHT, fontSize: 16, fontWeight: '600' },
  emptySubtext: { color: TEXT_DIM, fontSize: 14 },
  initialContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  initialText: { color: TEXT_LIGHT, fontSize: 18, fontWeight: '600' },
  initialSubtext: { color: TEXT_DIM, fontSize: 14 },
})
