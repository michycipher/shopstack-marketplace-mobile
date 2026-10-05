import * as WebBrowser from 'expo-web-browser'
import * as Google from 'expo-auth-session/providers/google'
import { ResponseType, makeRedirectUri } from 'expo-auth-session'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BrandMark } from '@/components/BrandMark'
import { useAuth } from '@/lib/auth'
import { useTheme } from '@/lib/theme'
import { useToast } from '@/lib/toast'

WebBrowser.maybeCompleteAuthSession()

export default function LoginScreen() {
  const { theme } = useTheme()
  const { user, signingIn, signIn } = useAuth()
  const { show } = useToast()
  const [message, setMessage] = useState('')
  const redirectUri = makeRedirectUri({ scheme: 'cartupmobile', path: 'oauth' })
  const [request, response, promptAsync] = Google.useAuthRequest({ webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID, iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID, responseType: ResponseType.IdToken, selectAccount: true, scopes: ['openid', 'profile', 'email'], redirectUri })

  useEffect(() => {
    const credential = response?.type === 'success' ? response.params?.id_token || response.authentication?.idToken : undefined
    if (!credential) return
    signIn(credential).then(() => { show('Welcome back to CartUp'); router.replace('/(tabs)') }).catch(error => { const text = error instanceof Error ? error.message : 'Sign-in failed'; setMessage(text); show(text, 'error') })
  }, [response, signIn, show])

  const authError = response?.type === 'error'
    ? response.params?.error_description || response.params?.error
    : undefined

  if (user) return <View style={[styles.page, { backgroundColor: theme.background }]}><BrandMark /><View style={styles.success}><Ionicons name="checkmark-circle" size={58} color={theme.green} /><Text style={[styles.title, { color: theme.ink }]}>You are signed in.</Text><Text style={[styles.copy, { color: theme.muted }]}>Your cart and orders are connected to {user.email}.</Text><Pressable style={[styles.button, { backgroundColor: theme.blue }]} onPress={() => router.replace('/(tabs)')}><Text style={styles.buttonText}>Back to CartUp</Text></Pressable></View></View>
  return <View style={[styles.page, { backgroundColor: theme.background }]}><View style={styles.top}><Pressable onPress={() => router.back()} style={[styles.back, { backgroundColor: theme.surface, borderColor: theme.line }]}><Ionicons name="arrow-back" size={19} color={theme.ink} /></Pressable><BrandMark /></View><View style={styles.card}><View style={[styles.logo, { backgroundColor: theme.yellow }]}><Text style={[styles.logoText, { color: theme.ink }]}>C</Text></View><Text style={[styles.kicker, { color: theme.blue }]}>YOUR CARTUP ACCOUNT</Text><Text style={[styles.title, { color: theme.ink }]}>Shop across every screen.</Text><Text style={[styles.copy, { color: theme.muted }]}>Sign in with the same Google account you use on CartUp web. Your saved cart and order history follow you.</Text><Pressable disabled={!request || signingIn || !process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID} style={[styles.google, { backgroundColor: theme.surface, borderColor: theme.line, opacity: request && process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ? 1 : .55 }]} onPress={() => promptAsync()}>{signingIn ? <ActivityIndicator color={theme.blue} /> : <><Ionicons name="logo-google" size={19} color="#4285F4" /><Text style={[styles.googleText, { color: theme.ink }]}>Continue with Google</Text></>}</Pressable>{!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID && <Text style={[styles.helper, { color: theme.danger }]}>Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID before testing Google sign-in.</Text>}{(message || authError) && <Text style={[styles.helper, { color: theme.danger }]}>{message || authError}</Text>}<View style={[styles.note, { backgroundColor: theme.softBlue }]}><Ionicons name="shield-checkmark-outline" size={19} color={theme.blue} /><Text style={[styles.noteText, { color: theme.ink }]}>Your mobile session is stored securely on the device.</Text></View></View><Pressable onPress={() => router.replace('/(tabs)')} style={styles.guest}><Text style={[styles.guestText, { color: theme.blue }]}>Continue as a guest</Text><Ionicons name="arrow-forward" size={16} color={theme.blue} /></Pressable></View>
}

const styles = StyleSheet.create({ page: { flex: 1, padding: 22, justifyContent: 'space-between' }, top: { flexDirection: 'row', alignItems: 'center', gap: 16 }, back: { width: 40, height: 40, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, card: { borderRadius: 24, padding: 24, gap: 14 }, logo: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }, logoText: { fontSize: 37, fontWeight: '900', fontStyle: 'italic' }, kicker: { fontSize: 10, fontWeight: '900', letterSpacing: 1.3 }, title: { fontSize: 29, lineHeight: 34, fontWeight: '900', letterSpacing: -.8 }, copy: { fontSize: 14, lineHeight: 21 }, google: { minHeight: 51, borderWidth: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 12, marginTop: 5 }, googleText: { fontSize: 14, fontWeight: '800' }, helper: { fontSize: 11, lineHeight: 16 }, note: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 12, borderRadius: 12 }, noteText: { flex: 1, fontSize: 11, lineHeight: 16, fontWeight: '700' }, guest: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, paddingVertical: 12 }, guestText: { fontSize: 13, fontWeight: '900' }, button: { minHeight: 48, borderRadius: 13, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, marginTop: 8 }, buttonText: { color: '#fff', fontWeight: '900' }, success: { alignItems: 'center', gap: 12 } })
