import { router } from 'expo-router'
import { useState } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BrandMark } from '@/components/BrandMark'
import GoogleLogin from '@/components/GoogleLogin'
import { useAuth } from '@/lib/auth'
import { getUserAvatar, getUserDisplayName, getUserInitials } from '@/lib/user'
import { useTheme } from '@/lib/theme'
import { useToast } from '@/lib/toast'

export default function LoginScreen() {
  const { theme } = useTheme()
  const { user, signingIn, signIn, signOut } = useAuth()
  const { show } = useToast()
  const [message, setMessage] = useState('')
  function failed(text: string) { setMessage(text); show(text, 'error') }
  function completed() { show('Welcome back to CartUp'); router.replace('/(tabs)') }
  async function google(token: string) { setMessage(''); await signIn(token); completed() }
  async function logout() { await signOut(); show('You have been signed out'); router.replace('/(tabs)') }

  const displayName = user ? getUserDisplayName(user) : ''
  const avatar = user ? getUserAvatar(user) : undefined

  return <ScrollView style={[styles.scroll, { backgroundColor: theme.background }]} contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
    <View style={styles.top}><Pressable accessibilityLabel="Go back" onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} style={[styles.back, { backgroundColor: theme.surface, borderColor: theme.line }]}><Ionicons name="arrow-back" size={19} color={theme.ink} /></Pressable><BrandMark /></View>
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.line }]}>
      <View style={[styles.logo, { backgroundColor: theme.yellow }]}><Text style={styles.logoText}>C</Text></View>
      <Text style={[styles.kicker, { color: theme.blue }]}>YOUR CARTUP ACCOUNT</Text>
      <Text style={[styles.title, { color: theme.ink }]}>{user ? 'You are signed in.' : 'Shop across every screen.'}</Text>
      {user ? <>
        <View style={styles.account}>
          {avatar ? <Image source={{ uri: avatar }} style={styles.accountAvatar} /> : <View style={[styles.accountAvatar, styles.accountFallback, { backgroundColor: theme.softBlue }]}><Text style={[styles.accountInitials, { color: theme.blue }]}>{getUserInitials(displayName)}</Text></View>}
          <View style={styles.accountCopy}><Text style={[styles.accountName, { color: theme.ink }]} numberOfLines={1}>{displayName}</Text><Text style={[styles.accountEmail, { color: theme.muted }]} numberOfLines={1}>{user.email}</Text></View>
        </View>
        <Text style={[styles.copy, { color: theme.muted }]}>Your cart and orders are connected to this account.</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Sign out" onPress={logout} style={[styles.signOut, { borderColor: theme.line }]}><Ionicons name="log-out-outline" size={18} color={theme.danger} /><Text style={[styles.signOutText, { color: theme.danger }]}>Sign out</Text></Pressable>
        <Pressable onPress={() => router.replace('/(tabs)')} style={[styles.button, { backgroundColor: theme.blue }]}><Text style={styles.buttonText}>Back to CartUp</Text></Pressable>
      </> : <>
        <Text style={[styles.copy, { color: theme.muted }]}>Use the same Google account on web and mobile to keep your cart and orders together.</Text>
        <GoogleLogin onCredential={google} onError={failed} disabled={signingIn} />
        {message ? <Text accessibilityRole="alert" style={{ color: theme.danger }}>{message}</Text> : null}
        <View style={[styles.note, { backgroundColor: theme.softBlue }]}><Ionicons name="shield-checkmark-outline" size={19} color={theme.blue} /><Text style={[styles.noteText, { color: theme.ink }]}>Your password stays with your sign-in provider.</Text></View>
      </>}
    </View>
    <Pressable onPress={() => router.replace('/(tabs)')} style={styles.guest}><Text style={{ color: theme.blue, fontWeight: '700' }}>Continue as a guest</Text><Ionicons name="arrow-forward" size={16} color={theme.blue} /></Pressable>
  </ScrollView>
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  page: { flexGrow: 1, padding: 22, gap: 28, justifyContent: 'space-between', alignItems: 'center' },
  top: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 16 },
  back: { width: 40, height: 40, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  card: { width: '100%', maxWidth: 460, borderWidth: 1, borderRadius: 24, padding: 24, gap: 18 },
  logo: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#111a2e', fontSize: 37, fontWeight: '900', fontStyle: 'italic' },
  kicker: { fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  title: { fontSize: 29, lineHeight: 34, fontWeight: '900', letterSpacing: -.8 },
  copy: { fontSize: 14, lineHeight: 21 },
  account: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  accountAvatar: { width: 56, height: 56, borderRadius: 28 },
  accountFallback: { alignItems: 'center', justifyContent: 'center' },
  accountInitials: { fontSize: 18, fontWeight: '900' },
  accountCopy: { flex: 1, gap: 3 },
  accountName: { fontSize: 17, fontWeight: '900' },
  accountEmail: { fontSize: 12 },
  signOut: { minHeight: 46, borderRadius: 13, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  signOutText: { fontWeight: '900' },
  note: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 12, borderRadius: 12 },
  noteText: { flex: 1, fontSize: 11, lineHeight: 16, fontWeight: '700' },
  guest: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, paddingVertical: 12 },
  button: { minHeight: 48, borderRadius: 13, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  buttonText: { color: '#fff', fontWeight: '900' },
})
