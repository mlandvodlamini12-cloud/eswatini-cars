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
  ScrollView,
  Linking,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { register } from '../auth'

const NAVY = '#0a1834'
const NAVY_LIGHT = '#14254a'
const GOLD = '#ffc832'
const SKY_BLUE = '#38bdf8'
const TEXT_LIGHT = '#e2e8f0'
const TEXT_DIM = '#94a3b8'
const RED = '#ef4444'

export default function RegisterScreen({ navigation, onRegister }: any) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = name && email && phone && password.length >= 8 && agreedToTerms && !loading

  const handleRegister = async () => {
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    const result = await register({ name: name.trim(), email: email.trim(), phone: phone.trim(), password })
    setLoading(false)
    if ('error' in result) {
      setError(result.error)
    } else {
      onRegister(result.user)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack?.()}>
            <Ionicons name="arrow-back" size={24} color={TEXT_LIGHT} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="car" size={32} color={SKY_BLUE} />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Eswatini Cars — it's free</Text>
          </View>

          <View style={styles.form}>
            {error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={RED} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Ionicons name="person" size={18} color={TEXT_DIM} />
              <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor={TEXT_DIM}
                value={name} onChangeText={setName} autoComplete="name" />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="mail" size={18} color={TEXT_DIM} />
              <TextInput style={styles.input} placeholder="Email" placeholderTextColor={TEXT_DIM}
                value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="call" size={18} color={TEXT_DIM} />
              <TextInput style={styles.input} placeholder="Phone (e.g. +268 7629 5648)" placeholderTextColor={TEXT_DIM}
                value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={18} color={TEXT_DIM} />
              <TextInput style={styles.input} placeholder="Password (min 8 characters)" placeholderTextColor={TEXT_DIM}
                value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" />
            </View>

            {/* T&C checkbox */}
            <TouchableOpacity style={styles.checkboxRow} onPress={() => setAgreedToTerms(!agreedToTerms)}>
              <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                {agreedToTerms && <Ionicons name="checkmark" size={14} color={NAVY} />}
              </View>
              <Text style={styles.checkboxText}>
                I agree to the{' '}
                <Text style={styles.link} onPress={() => Linking.openURL('https://eswatini-cars.vercel.app/terms')}>Terms</Text>
                {' '}and{' '}
                <Text style={styles.link} onPress={() => Linking.openURL('https://eswatini-cars.vercel.app/privacy')}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.registerButton, !canSubmit && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={!canSubmit}
              activeOpacity={0.8}
            >
              {loading ? <ActivityIndicator color={NAVY} /> : <Text style={styles.registerButtonText}>Create Account</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>
                Already have an account? <Text style={styles.loginLinkBold}>Log In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NAVY },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  logoContainer: { alignItems: 'center', paddingTop: 12, paddingBottom: 24 },
  logoCircle: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: NAVY_LIGHT,
    borderWidth: 2, borderColor: SKY_BLUE, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    shadowColor: SKY_BLUE, shadowOpacity: 0.3, shadowRadius: 15, shadowOffset: { width: 0, height: 0 },
  },
  title: { color: TEXT_LIGHT, fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { color: TEXT_DIM, fontSize: 14 },
  form: { paddingHorizontal: 24, gap: 12 },
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
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 4 },
  checkbox: {
    width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: TEXT_DIM,
    alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  checkboxChecked: { backgroundColor: GOLD, borderColor: GOLD },
  checkboxText: { color: TEXT_DIM, fontSize: 13, flex: 1, lineHeight: 20 },
  link: { color: SKY_BLUE },
  registerButton: { backgroundColor: GOLD, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 4 },
  buttonDisabled: { opacity: 0.4 },
  registerButtonText: { color: NAVY, fontSize: 16, fontWeight: 'bold' },
  loginLink: { color: TEXT_DIM, fontSize: 14, textAlign: 'center', marginTop: 8 },
  loginLinkBold: { color: SKY_BLUE, fontWeight: '600' },
})
