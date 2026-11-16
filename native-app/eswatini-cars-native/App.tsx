import React from 'react'
import { NavigationContainer, DarkTheme } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { StatusBar } from 'expo-status-bar'

import BrowseScreen from './src/screens/BrowseScreen'
import SearchScreen from './src/screens/SearchScreen'
import CarDetailScreen from './src/screens/CarDetailScreen'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

const NAVY = '#0a1834'
const NAVY_LIGHT = '#14254a'
const SKY_BLUE = '#38bdf8'
const TEXT_LIGHT = '#e2e8f0'

// Stack navigator for Browse tab (Browse → CarDetail)
function BrowseStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BrowseMain" component={BrowseScreen} />
      <Stack.Screen name="CarDetail" component={CarDetailScreen} options={{ presentation: 'card' }} />
    </Stack.Navigator>
  )
}

// Stack navigator for Search tab (Search → CarDetail)
function SearchStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SearchMain" component={SearchScreen} />
      <Stack.Screen name="CarDetail" component={CarDetailScreen} options={{ presentation: 'card' }} />
    </Stack.Navigator>
  )
}

// Placeholder screens for Phase 3+
function PlaceholderScreen({ title }: { title: string }) {
  return null
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
          <Tab.Screen
            name="BrowseTab"
            component={BrowseStack}
            options={{
              tabBarIcon: ({ color, size }) => <Ionicons name="grid" color={color} size={size} />,
              tabBarLabel: 'Browse',
            }}
          />
          <Tab.Screen
            name="SearchTab"
            component={SearchStack}
            options={{
              tabBarIcon: ({ color, size }) => <Ionicons name="search" color={color} size={size} />,
              tabBarLabel: 'Search',
            }}
          />
          <Tab.Screen
            name="SellTab"
            component={() => <PlaceholderScreen title="Sell" />}
            options={{
              tabBarIcon: ({ color, size }) => <Ionicons name="add-circle" color={color} size={size} />,
              tabBarLabel: 'Sell',
            }}
          />
          <Tab.Screen
            name="MessagesTab"
            component={() => <PlaceholderScreen title="Messages" />}
            options={{
              tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble" color={color} size={size} />,
              tabBarLabel: 'Messages',
            }}
          />
          <Tab.Screen
            name="ProfileTab"
            component={() => <PlaceholderScreen title="Profile" />}
            options={{
              tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} />,
              tabBarLabel: 'Profile',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}
