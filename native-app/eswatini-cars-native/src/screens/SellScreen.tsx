import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { User } from '../auth'
import { uploadImage, createListing } from '../sellApi'

const NAVY = '#0a1834'
const NAVY_LIGHT = '#14254a'
const NAVY_DARK = '#091628'
const GOLD = '#ffc832'
const SKY_BLUE = '#38bdf8'
const TEXT_LIGHT = '#e2e8f0'
const TEXT_DIM = '#94a3b8'
const RED = '#ef4444'

const VEHICLE_TYPES = [
  { key: 'sedan', label: 'Sedan' },
  { key: 'bakkie', label: 'Bakkie' },
  { key: 'van', label: 'Van' },
  { key: 'motorcycle', label: 'Motorcycle' },
  { key: 'parts', label: 'Parts' },
]

const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Electric']
const TRANSMISSIONS = ['Manual', 'Automatic']
const REGIONS = ['Hhohho', 'Manzini', 'Shiselweni', 'Lubombo']

export default function SellScreen({ user, onListingCreated }: { user: User | null; onListingCreated: () => void }) {
  const [images, setImages] = useState<string[]>([])
  const [form, setForm] = useState({
    type: 'sedan',
    make: '',
    model: '',
    year: '',
    price: '',
    fuelType: 'Petrol',
    transmission: 'Manual',
    mileage: '',
    color: '',
    region: 'Hhohho',
    description: '',
  })
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pickImages = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo access to upload car photos.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 6,
    })
    if (!result.canceled && result.assets) {
      setImages(prev => [...prev, ...result.assets.map(a => a.uri)].slice(0, 6))
    }
  }, [])

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const canSubmit = () => {
    return form.make && form.model && form.year && form.price && form.region &&
      form.description.length >= 10 && user && !submitting
  }

  const handleSubmit = async () => {
    if (!user) {
      setError('Please log in to post a listing')
      return
    }
    setSubmitting(true)
    setError(null)

    // Upload images first — surface any errors to the user
    let imageUrls: string[] = []
    if (images.length > 0) {
      setUploading(true)
      for (const uri of images) {
        const result = await uploadImage(uri)
        if (result.success) {
          imageUrls.push(result.url)
        } else {
          // Show the actual error message from the server — no more silent failures
          setUploading(false)
          setSubmitting(false)
          Alert.alert(
            'Photo upload failed',
            result.error + '\n\nYour listing was not posted. Please try again or remove the photo.',
            [{ text: 'OK' }]
          )
          return
        }
      }
      setUploading(false)
    }

    // Create the listing
    const result = await createListing({
      type: form.type,
      make: form.make.trim(),
      model: form.model.trim(),
      year: parseInt(form.year) || new Date().getFullYear(),
      price: parseFloat(form.price) || 0,
      fuelType: form.fuelType,
      transmission: form.transmission,
      mileage: form.mileage ? parseInt(form.mileage) : undefined,
      color: form.color.trim() || undefined,
      region: form.region,
      description: form.description.trim(),
      sellerName: user.name,
      sellerPhone: user.phone || '',
      imageUrls,
    })

    setSubmitting(false)

    if (result.success) {
      Alert.alert('Success!', 'Your listing has been posted.', [{ text: 'OK', onPress: onListingCreated }])
      // Reset form
      setForm({ type: 'sedan', make: '', model: '', year: '', price: '', fuelType: 'Petrol', transmission: 'Manual', mileage: '', color: '', region: 'Hhohho', description: '' })
      setImages([])
    } else {
      setError(result.error || 'Failed to post listing')
    }
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}><Text style={styles.headerTitle}>Sell Your Car</Text></View>
        <View style={styles.loggedOut}>
          <Ionicons name="lock-closed" size={48} color={TEXT_DIM} />
          <Text style={styles.loggedOutTitle}>Login Required</Text>
          <Text style={styles.loggedOutText}>Log in to post a car for sale</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sell Your Car</Text>
        <Text style={styles.headerSubtitle}>Post a listing — it's free</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Photo upload */}
        <Text style={styles.label}>Photos (up to 6)</Text>
        <View style={styles.photoRow}>
          {images.map((uri, i) => (
            <View key={i} style={styles.photoThumb}>
              <Image source={{ uri }} style={styles.photoImage} />
              <TouchableOpacity style={styles.photoRemove} onPress={() => removeImage(i)}>
                <Ionicons name="close" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          {images.length < 6 && (
            <TouchableOpacity style={styles.photoAdd} onPress={pickImages}>
              <Ionicons name="camera" size={24} color={TEXT_DIM} />
              <Text style={styles.photoAddText}>Add Photos</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Vehicle type */}
        <Text style={styles.label}>Vehicle Type *</Text>
        <View style={styles.chipRow}>
          {VEHICLE_TYPES.map(vt => (
            <TouchableOpacity
              key={vt.key}
              style={[styles.chip, form.type === vt.key && styles.chipActive]}
              onPress={() => setForm({ ...form, type: vt.key })}
            >
              <Text style={[styles.chipText, form.type === vt.key && styles.chipTextActive]}>{vt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Make + Model */}
        <Text style={styles.label}>Make *</Text>
        <TextInput style={styles.input} placeholder="e.g. Toyota" placeholderTextColor={TEXT_DIM}
          value={form.make} onChangeText={v => setForm({ ...form, make: v })} />

        <Text style={styles.label}>Model *</Text>
        <TextInput style={styles.input} placeholder="e.g. Corolla" placeholderTextColor={TEXT_DIM}
          value={form.model} onChangeText={v => setForm({ ...form, model: v })} />

        {/* Year + Price */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Year *</Text>
            <TextInput style={styles.input} placeholder="2020" placeholderTextColor={TEXT_DIM}
              value={form.year} onChangeText={v => setForm({ ...form, year: v })}
              keyboardType="numeric" maxLength={4} />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>Price (E) *</Text>
            <TextInput style={styles.input} placeholder="185000" placeholderTextColor={TEXT_DIM}
              value={form.price} onChangeText={v => setForm({ ...form, price: v })}
              keyboardType="numeric" />
          </View>
        </View>

        {/* Fuel + Transmission */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Fuel</Text>
            <View style={styles.pickerRow}>
              {FUEL_TYPES.map(ft => (
                <TouchableOpacity key={ft} style={[styles.chip, form.fuelType === ft && styles.chipActive]}
                  onPress={() => setForm({ ...form, fuelType: ft })}>
                  <Text style={[styles.chipText, form.fuelType === ft && styles.chipTextActive]}>{ft}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Transmission</Text>
            <View style={styles.pickerRow}>
              {TRANSMISSIONS.map(tr => (
                <TouchableOpacity key={tr} style={[styles.chip, form.transmission === tr && styles.chipActive]}
                  onPress={() => setForm({ ...form, transmission: tr })}>
                  <Text style={[styles.chipText, form.transmission === tr && styles.chipTextActive]}>{tr}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Mileage + Color */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Mileage (km)</Text>
            <TextInput style={styles.input} placeholder="50000" placeholderTextColor={TEXT_DIM}
              value={form.mileage} onChangeText={v => setForm({ ...form, mileage: v })}
              keyboardType="numeric" />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>Color</Text>
            <TextInput style={styles.input} placeholder="Silver" placeholderTextColor={TEXT_DIM}
              value={form.color} onChangeText={v => setForm({ ...form, color: v })} />
          </View>
        </View>

        {/* Region */}
        <Text style={styles.label}>Region *</Text>
        <View style={styles.chipRow}>
          {REGIONS.map(r => (
            <TouchableOpacity key={r} style={[styles.chip, form.region === r && styles.chipActive]}
              onPress={() => setForm({ ...form, region: r })}>
              <Text style={[styles.chipText, form.region === r && styles.chipTextActive]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Description */}
        <Text style={styles.label}>Description * (min 10 chars)</Text>
        <TextInput style={[styles.input, styles.textArea]}
          placeholder="Describe the car's condition, features, history..."
          placeholderTextColor={TEXT_DIM}
          value={form.description} onChangeText={v => setForm({ ...form, description: v })}
          multiline numberOfLines={4} textAlignVertical="top" />

        {/* Error */}
        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={RED} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitButton, !canSubmit() && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit()}
          activeOpacity={0.8}
        >
          {submitting ? (
            <ActivityIndicator color={NAVY} />
          ) : uploading ? (
            <Text style={styles.submitText}>Uploading photos...</Text>
          ) : (
            <Text style={styles.submitText}>Post Listing</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NAVY },
  header: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: NAVY_LIGHT, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  headerTitle: { color: TEXT_LIGHT, fontSize: 22, fontWeight: 'bold' },
  headerSubtitle: { color: TEXT_DIM, fontSize: 13, marginTop: 2 },
  loggedOut: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loggedOutTitle: { color: TEXT_LIGHT, fontSize: 18, fontWeight: '600' },
  loggedOutText: { color: TEXT_DIM, fontSize: 14 },
  label: { color: TEXT_DIM, fontSize: 12, fontWeight: '600', marginTop: 14, marginBottom: 6, paddingHorizontal: 20, textTransform: 'uppercase' },
  input: {
    backgroundColor: NAVY_LIGHT, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    color: TEXT_LIGHT, fontSize: 15, marginHorizontal: 20,
  },
  textArea: { minHeight: 80, paddingTop: 12 },
  row: { flexDirection: 'row', marginHorizontal: 20 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20 },
  pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { backgroundColor: NAVY_LIGHT, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  chipActive: { backgroundColor: GOLD },
  chipText: { color: TEXT_DIM, fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: NAVY, fontWeight: '700' },
  photoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20 },
  photoThumb: { width: 80, height: 80, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  photoImage: { width: '100%', height: '100%' },
  photoRemove: { position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  photoAdd: { width: 80, height: 80, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 4 },
  photoAddText: { color: TEXT_DIM, fontSize: 10 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginHorizontal: 20, marginTop: 14 },
  errorText: { color: RED, fontSize: 13, flex: 1 },
  submitButton: { backgroundColor: GOLD, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginHorizontal: 20, marginTop: 20 },
  buttonDisabled: { opacity: 0.4 },
  submitText: { color: NAVY, fontSize: 16, fontWeight: 'bold' },
})
