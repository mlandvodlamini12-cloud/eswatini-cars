import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { User, logout } from '../auth'

const NAVY = '#0a1834'
const NAVY_LIGHT = '#14254a'
const GOLD = '#ffc832'
const SKY_BLUE = '#38bdf8'
const TEXT_LIGHT = '#e2e8f0'
const TEXT_DIM = '#94a3b8'
const RED = '#ef4444'

export default function ProfileScreen({ user, onLogout, onLoginPress }: {
  user: User | null
  onLogout: () => void
  onLoginPress: () => void
}) {
  if (!user) {
    // Not logged in — show login/register prompt
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.loggedOutContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="person" size={36} color={TEXT_DIM} />
          </View>
          <Text style={styles.loggedOutTitle}>You're not logged in</Text>
          <Text style={styles.loggedOutSubtitle}>Log in to post listings, message sellers, and save cars</Text>
          <TouchableOpacity style={styles.loginButton} onPress={onLoginPress} activeOpacity={0.8}>
            <Ionicons name="log-in" size={20} color={NAVY} />
            <Text style={styles.loginButtonText}>Log In / Register</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  // Logged in — show profile
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* User card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            {user.username && <Text style={styles.userUsername}>@{user.username}</Text>}
          </View>
          {user.role === 'admin' && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>ADMIN</Text>
            </View>
          )}
        </View>

        {/* Info rows */}
        <View style={styles.infoSection}>
          {user.phone && (
            <View style={styles.infoRow}>
              <Ionicons name="call" size={18} color={SKY_BLUE} />
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{user.phone}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Ionicons name="mail" size={18} color={SKY_BLUE} />
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="person-circle" size={18} color={SKY_BLUE} />
            <Text style={styles.infoLabel}>Role</Text>
            <Text style={styles.infoValue}>{user.role === 'admin' ? 'Administrator' : 'User'}</Text>
          </View>
        </View>

        {/* Menu items */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="car" size={20} color={TEXT_DIM} />
            <Text style={styles.menuText}>My Listings</Text>
            <Ionicons name="chevron-forward" size={18} color={TEXT_DIM} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="heart" size={20} color={TEXT_DIM} />
            <Text style={styles.menuText}>Saved Cars</Text>
            <Ionicons name="chevron-forward" size={18} color={TEXT_DIM} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="chatbubble" size={20} color={TEXT_DIM} />
            <Text style={styles.menuText}>Messages</Text>
            <Ionicons name="chevron-forward" size={18} color={TEXT_DIM} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout} activeOpacity={0.8}>
          <Ionicons name="log-out" size={20} color={RED} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NAVY },
  header: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: NAVY_LIGHT, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  headerTitle: { color: TEXT_LIGHT, fontSize: 22, fontWeight: 'bold' },
  // Logged out
  loggedOutContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 12 },
  logoCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: NAVY_LIGHT, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  loggedOutTitle: { color: TEXT_LIGHT, fontSize: 20, fontWeight: 'bold' },
  loggedOutSubtitle: { color: TEXT_DIM, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  loginButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: GOLD, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14, marginTop: 12 },
  loginButtonText: { color: NAVY, fontSize: 16, fontWeight: 'bold' },
  // Logged in
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: NAVY_LIGHT, marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 16, gap: 14 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: SKY_BLUE, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: NAVY, fontSize: 22, fontWeight: 'bold' },
  userInfo: { flex: 1 },
  userName: { color: TEXT_LIGHT, fontSize: 17, fontWeight: 'bold' },
  userEmail: { color: TEXT_DIM, fontSize: 13, marginTop: 2 },
  userUsername: { color: SKY_BLUE, fontSize: 12, marginTop: 2 },
  adminBadge: { backgroundColor: 'rgba(255,200,50,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  adminBadgeText: { color: GOLD, fontSize: 10, fontWeight: '700' },
  infoSection: { backgroundColor: NAVY_LIGHT, marginHorizontal: 16, marginTop: 12, borderRadius: 16, padding: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 12 },
  infoLabel: { color: TEXT_DIM, fontSize: 14, width: 60 },
  infoValue: { color: TEXT_LIGHT, fontSize: 14, flex: 1 },
  menuSection: { backgroundColor: NAVY_LIGHT, marginHorizontal: 16, marginTop: 12, borderRadius: 16, padding: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 14 },
  menuText: { color: TEXT_LIGHT, fontSize: 15, flex: 1 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', marginHorizontal: 16, marginTop: 20, paddingVertical: 14, borderRadius: 14, backgroundColor: 'rgba(239,68,68,0.1)' },
  logoutText: { color: RED, fontSize: 15, fontWeight: '600' },
})
