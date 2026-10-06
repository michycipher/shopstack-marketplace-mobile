import * as Linking from 'expo-linking'
import { router } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/lib/auth'
import { createOrder } from '@/lib/api'
import { useCart } from '@/lib/cart'
import { useTheme } from '@/lib/theme'
import { useToast } from '@/lib/toast'
import { money } from '@/lib/types'

export default function CheckoutScreen() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const { items, subtotal } = useCart()
  const { show } = useToast()
  const [form, setForm] = useState({ email: user?.email || '', firstName: '', lastName: '', phone: '', address: '', city: 'Lagos', state: 'Lagos' })
  const [submitting, setSubmitting] = useState(false)
  const delivery = subtotal >= 50000 ? 0 : 2500
  const update = (key: keyof typeof form, value: string) => setForm(current => ({ ...current, [key]: value }))
  async function placeOrder() {
    if (!items.length || !form.email || !form.firstName || !form.phone || !form.address) { show('Complete your delivery details first', 'error'); return }
    setSubmitting(true)
    try {
      const response = await createOrder({ email: form.email, items, address: form })
      show('Order saved. Opening secure payment...')
      await Linking.openURL(response.payment.authorizationUrl)
    } catch (error) { show(error instanceof Error ? error.message : 'Order could not be placed', 'error') } finally { setSubmitting(false) }
  }
  return <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}><View style={styles.top}><Pressable onPress={() => router.back()} style={[styles.back, { backgroundColor: theme.surface, borderColor: theme.line }]}><Ionicons name="arrow-back" size={19} color={theme.ink} /></Pressable><Text style={[styles.topTitle, { color: theme.ink }]}>Checkout</Text><View style={{ width: 40 }} /></View><View style={[styles.notice, { backgroundColor: theme.softBlue }]}><Ionicons name="lock-closed-outline" size={18} color={theme.blue} /><Text style={[styles.noticeText, { color: theme.ink }]}>Your details are encrypted and payment is completed securely by Paystack.</Text></View><Text style={[styles.heading, { color: theme.ink }]}>Delivery details</Text><View style={styles.form}>{[['firstName', 'First name'], ['lastName', 'Last name'], ['email', 'Email address'], ['phone', 'Phone number'], ['address', 'Delivery address'], ['city', 'City'], ['state', 'State']].map(([key, label]) => <View key={key} style={styles.field}><Text style={[styles.label, { color: theme.muted }]}>{label}</Text><TextInput value={form[key as keyof typeof form]} onChangeText={value => update(key as keyof typeof form, value)} placeholder={label} placeholderTextColor={theme.muted} keyboardType={key === 'email' ? 'email-address' : key === 'phone' ? 'phone-pad' : 'default'} style={[styles.input, { color: theme.ink, backgroundColor: theme.surface, borderColor: theme.line }]} autoCapitalize={key === 'email' ? 'none' : 'words'} /></View>)}</View><View style={[styles.summary, { backgroundColor: theme.surface, borderColor: theme.line }]}><Text style={[styles.summaryTitle, { color: theme.ink }]}>Order summary</Text><View style={styles.line}><Text style={{ color: theme.muted }}>Items</Text><Text style={[styles.value, { color: theme.ink }]}>{money(subtotal)}</Text></View><View style={styles.line}><Text style={{ color: theme.muted }}>Delivery</Text><Text style={[styles.value, { color: delivery ? theme.ink : theme.green }]}>{delivery ? money(delivery) : 'FREE'}</Text></View><View style={[styles.divider, { backgroundColor: theme.line }]} /><View style={styles.line}><Text style={[styles.totalLabel, { color: theme.ink }]}>Total</Text><Text style={[styles.total, { color: theme.ink }]}>{money(subtotal + delivery)}</Text></View></View><Pressable disabled={submitting} style={[styles.button, { backgroundColor: theme.blue, opacity: submitting ? .65 : 1 }]} onPress={placeOrder}>{submitting ? <ActivityIndicator color="#fff" /> : <><Text style={styles.buttonText}>Continue to secure payment</Text><Ionicons name="arrow-forward" size={18} color="#fff" /></>}</Pressable></ScrollView></KeyboardAvoidingView>
}

const styles = StyleSheet.create({ scroll: { flex: 1 }, content: { flexGrow: 1, padding: 20, paddingBottom: 50, gap: 18 }, top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, back: { width: 40, height: 40, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, topTitle: { fontSize: 16, fontWeight: '900' }, notice: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 13, borderRadius: 14 }, noticeText: { flex: 1, fontSize: 11, lineHeight: 16, fontWeight: '700' }, heading: { fontSize: 22, fontWeight: '900', marginTop: 3 }, form: { gap: 12 }, field: { gap: 6 }, label: { fontSize: 11, fontWeight: '800' }, input: { minHeight: 47, borderWidth: 1, borderRadius: 13, paddingHorizontal: 13, fontSize: 13 }, summary: { borderWidth: 1, borderRadius: 18, padding: 16, gap: 13 }, summaryTitle: { fontSize: 17, fontWeight: '900' }, line: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, value: { fontSize: 13, fontWeight: '800' }, divider: { height: 1 }, totalLabel: { fontSize: 15, fontWeight: '900' }, total: { fontSize: 20, fontWeight: '900' }, button: { minHeight: 52, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }, buttonText: { color: '#fff', fontSize: 13, fontWeight: '900' } })
