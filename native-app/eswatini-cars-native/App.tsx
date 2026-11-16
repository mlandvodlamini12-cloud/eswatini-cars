import React from 'react'
import { NavigationContainer, DarkTheme } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { StatusBar } from 'expo-status-bar'

import BrowseScreen from './src/screens/BrowseScreen'

const Tab = createBottomTabNavigator()

const NAVY = '#0a1834'
const NAVY_LIGHT = '#14254a'
const SKY_BLUE = '#38bdf8'

// Placeholder screens — will be built in Phase 2+
function PlaceholderScreen({ title }: { title: string }) {
  return null // Will be replaced with real screens
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer
        theme={{
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            background: NAVY,
            card: NAVY_LIGHT,
            text: '#e2e8f0',
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
          <Tab.Screen
            name="Browse"
            component={BrowseScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="grid" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Search"
            component={() => <PlaceholderScreen title="Search" />}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="search" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Sell"
            component={() => <PlaceholderScreen title="Sell" />}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="add-circle" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Messages"
            component={() => <PlaceholderScreen title="Messages" />}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="chatbubble" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Profile"
            component={() => <PlaceholderScreen title="Profile" />}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person" color={color} size={size} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}
