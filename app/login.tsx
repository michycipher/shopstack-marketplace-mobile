import { router } from 'expo-router'
import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BrandMark } from '@/components/BrandMark'
import GoogleLogin from '@/components/GoogleLogin'
import AppleLogin from '@/components/AppleLogin'
import { useAuth } from '@/lib/auth'
import { useTheme } from '@/lib/theme'
import { useToast } from '@/lib/toast'

export default function LoginScreen() {
  const { theme } = useTheme()
  const { user, signingIn, signIn, signInApple } = useAuth()
  const { show } = useToast()
  const [message, setMessage] = useState('')
  function failed(text: string) { setMessage(text); show(text, 'error') }
  function completed() { show('Welcome back to CartUp'); router.replace('/(tabs)') }
  async function google(token: string) { setMessage(''); await signIn(token); completed() }
  async function apple(token: string, challenge: string, name?: string) { setMessage(''); await signInApple(token, challenge, name); completed() }

  return <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.page}>
    <View style={styles.top}><Pressable accessibilityLabel="Go back" onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} style={[styles.back, { backgroundColor: theme.surface, borderColor: theme.line }]}><Ionicons name="arrow-back" size={19} color={theme.ink} /></Pressable><BrandMark /></View>
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.line }]}>
      <View style={[styles.logo, { backgroundColor: theme.yellow }]}><Text style={styles.logoText}>C</Text></View>
      <Text style={[styles.kicker, { color: theme.blue }]}>YOUR CARTUP ACCOUNT</Text>
      <Text style={[styles.title, { color: theme.ink }]}>{user ? 'You are signed in.' : 'Shop across every screen.'}</Text>
      <Text style={[styles.copy, { color: theme.muted }]}>{user ? `Your cart and orders are connected to ${user.email}.` : 'Use the same Google account on web and mobile to keep your cart and orders together.'}</Text>
      {user ? <Pressable onPress={() => router.replace('/(tabs)')} style={[styles.button, { backgroundColor: theme.blue }]}><Text style={styles.buttonText}>Back to CartUp</Text></Pressable> : <>
        <GoogleLogin onCredential={google} onError={failed} disabled={signingIn} />
        <AppleLogin onCredential={apple} onError={failed} disabled={signingIn} />
        {message ? <Text accessibilityRole="alert" style={{ color: theme.danger }}>{message}</Text> : null}
        <View style={[styles.note, { backgroundColor: theme.softBlue }]}><Ionicons name="shield-checkmark-outline" size={19} color={theme.blue} /><Text style={[styles.noteText, { color: theme.ink }]}>Your password stays with your sign-in provider.</Text></View>
      </>}
    </View>
    <Pressable onPress={() => router.replace('/(tabs)')} style={styles.guest}><Text style={{ color: theme.blue, fontWeight: '700' }}>Continue as a guest</Text><Ionicons name="arrow-forward" size={16} color={theme.blue} /></Pressable>
  </ScrollView>
}

const styles = StyleSheet.create({ page: { flexGrow: 1, padding: 22, gap: 28, justifyContent: 'space-between', alignItems: 'center' }, top: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 16 }, back: { width: 40, height: 40, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, card: { width: '100%', maxWidth: 460, borderWidth: 1, borderRadius: 24, padding: 24, gap: 18 }, logo: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }, logoText: { color: '#111a2e', fontSize: 37, fontWeight: '900', fontStyle: 'italic' }, kicker: { fontSize: 10, fontWeight: '900', letterSpacing: 1.3 }, title: { fontSize: 29, lineHeight: 34, fontWeight: '900', letterSpacing: -.8 }, copy: { fontSize: 14, lineHeight: 21 }, note: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 12, borderRadius: 12 }, noteText: { flex: 1, fontSize: 11, lineHeight: 16, fontWeight: '700' }, guest: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, paddingVertical: 12 }, button: { minHeight: 48, borderRadius: 13, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 }, buttonText: { color: '#fff', fontWeight: '900' } })
