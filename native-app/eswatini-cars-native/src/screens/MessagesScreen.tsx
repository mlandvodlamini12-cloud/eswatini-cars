import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { User } from '../auth'
import { Enquiry, fetchEnquiries } from '../messagesApi'
import { formatPrice } from '../components/ListingCard'

const NAVY = '#0a1834'
const NAVY_LIGHT = '#14254a'
const GOLD = '#ffc832'
const SKY_BLUE = '#38bdf8'
const TEXT_LIGHT = '#e2e8f0'
const TEXT_DIM = '#94a3b8'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function MessagesScreen({ user, onLoginPress }: { user: User | null; onLoginPress: () => void }) {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return }
    const data = await fetchEnquiries()
    setEnquiries(data)
    setLoading(false)
    setRefreshing(false)
  }, [user])

  useEffect(() => { load() }, [load])

  const onRefresh = () => { setRefreshing(true); load() }

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}><Text style={styles.headerTitle}>Messages</Text></View>
        <View style={styles.loggedOut}>
          <Ionicons name="chatbubble-ellipses" size={48} color={TEXT_DIM} />
          <Text style={styles.loggedOutTitle}>Login Required</Text>
          <Text style={styles.loggedOutText}>Log in to see your messages</Text>
          <TouchableOpacity style={styles.loginButton} onPress={onLoginPress} activeOpacity={0.8}>
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        {enquiries.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{enquiries.length}</Text>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={SKY_BLUE} />
        </View>
      ) : (
        <FlatList
          data={enquiries}
          keyExtractor={item => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={SKY_BLUE} />}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.enquiryCard} activeOpacity={0.8}>
              {/* Car thumbnail */}
              {item.listing?.imageUrl ? (
                <Image source={{ uri: item.listing.imageUrl.split('|')[0] }} style={styles.thumbnail} />
              ) : (
                <View style={[styles.thumbnail, styles.noImage]}>
                  <Ionicons name="car" size={20} color={TEXT_DIM} />
                </View>
              )}
              {/* Content */}
              <View style={styles.enquiryContent}>
                <Text style={styles.enquiryTitle} numberOfLines={1}>
                  {item.listing ? `${item.listing.year} ${item.listing.make} ${item.listing.model}` : 'Enquiry'}
                </Text>
                <Text style={styles.enquiryMessage} numberOfLines={2}>{item.message}</Text>
                <View style={styles.enquiryMeta}>
                  <Ionicons name="time" size={11} color={TEXT_DIM} />
                  <Text style={styles.metaText}>{timeAgo(item.createdAt)}</Text>
                  <Text style={styles.dot}>·</Text>
                  <View style={[styles.statusBadge, item.status === 'new' && styles.statusNew]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={TEXT_DIM} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color={TEXT_DIM} />
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>Enquiries about your listings will appear here</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NAVY },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 16, backgroundColor: NAVY_LIGHT, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  headerTitle: { color: TEXT_LIGHT, fontSize: 22, fontWeight: 'bold' },
  countBadge: { backgroundColor: SKY_BLUE, minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center' },
  countText: { color: NAVY, fontSize: 12, fontWeight: 'bold' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loggedOut: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 40 },
  loggedOutTitle: { color: TEXT_LIGHT, fontSize: 18, fontWeight: '600' },
  loggedOutText: { color: TEXT_DIM, fontSize: 14, textAlign: 'center' },
  loginButton: { backgroundColor: GOLD, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 14, marginTop: 8 },
  loginButtonText: { color: NAVY, fontWeight: 'bold', fontSize: 15 },
  enquiryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: NAVY_LIGHT, marginHorizontal: 16, marginBottom: 8, borderRadius: 14, padding: 12, gap: 12 },
  thumbnail: { width: 56, height: 56, borderRadius: 10, backgroundColor: NAVY },
  noImage: { alignItems: 'center', justifyContent: 'center' },
  enquiryContent: { flex: 1 },
  enquiryTitle: { color: TEXT_LIGHT, fontSize: 14, fontWeight: '600', marginBottom: 3 },
  enquiryMessage: { color: TEXT_DIM, fontSize: 12, marginBottom: 4, lineHeight: 16 },
  enquiryMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: TEXT_DIM, fontSize: 11 },
  dot: { color: TEXT_DIM, fontSize: 11 },
  statusBadge: { backgroundColor: 'rgba(148,163,184,0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  statusNew: { backgroundColor: 'rgba(239,68,68,0.2)' },
  statusText: { color: TEXT_DIM, fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  emptyContainer: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { color: TEXT_LIGHT, fontSize: 16, fontWeight: '600' },
  emptySubtext: { color: TEXT_DIM, fontSize: 14, textAlign: 'center' },
})
