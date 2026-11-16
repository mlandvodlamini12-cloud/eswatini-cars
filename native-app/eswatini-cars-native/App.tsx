import React, { useState, useEffect } from 'react'
import { NavigationContainer, DarkTheme } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { StatusBar } from 'expo-status-bar'
import { ActivityIndicator, View, StyleSheet } from 'react-native'

import BrowseScreen from './src/screens/BrowseScreen'
import SearchScreen from './src/screens/SearchScreen'
import CarDetailScreen from './src/screens/CarDetailScreen'
import LoginScreen from './src/screens/LoginScreen'
import RegisterScreen from './src/screens/RegisterScreen'
import ProfileScreen from './src/screens/ProfileScreen'
import SellScreen from './src/screens/SellScreen'
import MessagesScreen from './src/screens/MessagesScreen'

import { User, checkSession, logout as authLogout, getStoredUser } from './src/auth'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

const NAVY = '#0a1834'
const NAVY_LIGHT = '#14254a'
const SKY_BLUE = '#38bdf8'
const TEXT_LIGHT = '#e2e8f0'

// Stack for Browse tab
function BrowseStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BrowseMain" component={BrowseScreen} />
      <Stack.Screen name="CarDetail" component={CarDetailScreen} />
    </Stack.Navigator>
  )
}

// Stack for Search tab
function SearchStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SearchMain" component={SearchScreen} />
      <Stack.Screen name="CarDetail" component={CarDetailScreen} />
    </Stack.Navigator>
  )
}

// Stack for Profile tab (includes Login + Register)
function ProfileStack({ user, onLogin, onLogout }: { user: User | null; onLogin: (u: User) => void; onLogout: () => void }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain">
        {(props: any) => (
          <ProfileScreen
            {...props}
            user={user}
            onLogout={onLogout}
            onLoginPress={() => props.navigation.navigate('Login')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Login">
        {(props: any) => <LoginScreen {...props} onLogin={onLogin} />}
      </Stack.Screen>
      <Stack.Screen name="Register">
        {(props: any) => <RegisterScreen {...props} onRegister={onLogin} />}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // On app start: show the app IMMEDIATELY using stored data.
    // Check the session silently in the background — no loading spinner.
    (async () => {
      const stored = await getStoredUser()
      if (stored) {
        // User found in storage → show the app INSTANTLY
        setUser(stored)
        setReady(true)
        // Verify session in the background (silent, no UI blocking)
        checkSession().then(validUser => {
          if (!validUser) {
            // Session expired — log out silently
            setUser(null)
          } else {
            setUser(validUser)
          }
        })
      } else {
        // No stored user → show app immediately (logged-out state)
        setReady(true)
      }
    })()
  }, [])

  const handleLogin = (u: User) => setUser(u)
  const handleLogout = async () => {
    await authLogout()
    setUser(null)
  }

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={SKY_BLUE} />
      </View>
    )
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer
        theme={{
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            background: NAVY,
            card: NAVY_LIGHT,
            text: TEXT_LIGHT,
            primary: SKY_BLUE,
            border: 'rgba(255,255,255,0.08)',
            notification: SKY_BLUE,
          },
        }}
      >
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: SKY_BLUE,
            tabBarInactiveTintColor: '#64748b',
            tabBarStyle: {
              backgroundColor: NAVY_LIGHT,
              borderTopColor: 'rgba(255,255,255,0.08)',
              paddingBottom: 4,
              paddingTop: 4,
            },
            headerShown: false,
          }}
        >
          <Tab.Screen name="BrowseTab" component={BrowseStack}
            options={{ tabBarIcon: ({ color, size }) => <Ionicons name="grid" color={color} size={size} />, tabBarLabel: 'Browse' }} />
          <Tab.Screen name="SearchTab" component={SearchStack}
            options={{ tabBarIcon: ({ color, size }) => <Ionicons name="search" color={color} size={size} />, tabBarLabel: 'Search' }} />
          <Tab.Screen name="SellTab"
            options={{ tabBarIcon: ({ color, size }) => <Ionicons name="add-circle" color={color} size={size} />, tabBarLabel: 'Sell' }}>
            {(props: any) => <SellScreen {...props} user={user} onListingCreated={() => props.navigation.navigate('BrowseTab')} />}
          </Tab.Screen>
          <Tab.Screen name="MessagesTab"
            options={{ tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble" color={color} size={size} />, tabBarLabel: 'Messages' }}>
            {(props: any) => (
              <MessagesScreen
                {...props}
                user={user}
                onLoginPress={() => {
                  // Navigate to Profile tab which has the Login screen
                  props.navigation.navigate('ProfileTab', { screen: 'Login' })
                }}
              />
            )}
          </Tab.Screen>
          <Tab.Screen name="ProfileTab"
            options={{ tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} />, tabBarLabel: 'Profile' }}>
            {(props: any) => <ProfileStack {...props} user={user} onLogin={handleLogin} onLogout={handleLogout} />}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}

function PlaceholderView() {
  return <View style={styles.placeholder} />
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: NAVY, alignItems: 'center', justifyContent: 'center' },
  placeholder: { flex: 1, backgroundColor: NAVY },
})
