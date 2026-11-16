import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { login } from '../auth'

const NAVY = '#0a1834'
const NAVY_LIGHT = '#14254a'
const GOLD = '#ffc832'
const SKY_BLUE = '#38bdf8'
const TEXT_LIGHT = '#e2e8f0'
const TEXT_DIM = '#94a3b8'
const RED = '#ef4444'

export default function LoginScreen({ navigation, onLogin }: any) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) return
    setLoading(true)
    setError(null)
    const result = await login(email.trim(), password)
    setLoading(false)
    if ('error' in result) {
      setError(result.error)
    } else {
      onLogin(result.user)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack?.()}>
            <Ionicons name="arrow-back" size={24} color={TEXT_LIGHT} />
          </TouchableOpacity>
        </View>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="car" size={36} color={SKY_BLUE} />
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Log in to your Eswatini Cars account</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={RED} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Ionicons name="mail" size={18} color={TEXT_DIM} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={TEXT_DIM}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={18} color={TEXT_DIM} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={TEXT_DIM}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={18} color={TEXT_DIM} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, (!email || !password || loading) && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={!email || !password || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={NAVY} />
            ) : (
              <Text style={styles.loginButtonText}>Log In</Text>
            )}
          </TouchableOpacity>

          {/* Register link */}
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>
              Don't have an account? <Text style={styles.registerLinkBold}>Register</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NAVY },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  logoContainer: { alignItems: 'center', paddingTop: 20, paddingBottom: 32 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: NAVY_LIGHT, borderWidth: 2, borderColor: SKY_BLUE,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    shadowColor: SKY_BLUE, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 20,
  },
  title: { color: TEXT_LIGHT, fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { color: TEXT_DIM, fontSize: 14 },
  form: { paddingHorizontal: 24, gap: 14 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
  },
  errorText: { color: RED, fontSize: 13, flex: 1 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: NAVY_LIGHT, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14,
  },
  input: { flex: 1, color: TEXT_LIGHT, fontSize: 15 },
  loginButton: {
    backgroundColor: GOLD, borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', marginTop: 4,
  },
  buttonDisabled: { opacity: 0.5 },
  loginButtonText: { color: NAVY, fontSize: 16, fontWeight: 'bold' },
  registerLink: { color: TEXT_DIM, fontSize: 14, textAlign: 'center', marginTop: 8 },
  registerLinkBold: { color: SKY_BLUE, fontWeight: '600' },
})
