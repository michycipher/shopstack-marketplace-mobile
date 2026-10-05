import { useRef, useState } from 'react'
import { ActivityIndicator, Platform, Pressable, Text } from 'react-native'
import Constants from 'expo-constants'

type Props = { onCredential: (token: string) => Promise<void>; onError: (message: string) => void; disabled?: boolean }

export default function GoogleLogin({ onCredential, onError, disabled }: Props) {
  const [busy, setBusy] = useState(false)
  const pending = useRef(false)
  async function login() {
    if (pending.current || disabled) return
    pending.current = true
    setBusy(true)
    try {
      if (Constants.appOwnership === 'expo') throw new Error('Install the CartUp development build to sign in with Google.')
      const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
      const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
      if (!webClientId || (Platform.OS === 'ios' && !iosClientId)) throw new Error('Google sign-in is not configured for this build.')
      // Import only when requested so an older development build can show a
      // helpful error instead of crashing on startup over a missing native module.
      const { GoogleSignin, isSuccessResponse } = await import('@react-native-google-signin/google-signin')
      GoogleSignin.configure({ webClientId, iosClientId, offlineAccess: false })
      if (Platform.OS === 'android') await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
      const response = await GoogleSignin.signIn()
      if (isSuccessResponse(response)) {
        if (!response.data.idToken) throw new Error('Google did not return a sign-in token. Check the Web OAuth client configuration.')
        await onCredential(response.data.idToken)
      }
    } catch (error) {
      const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : ''
      if (code === 'SIGN_IN_CANCELLED') return
      const message = error instanceof Error ? error.message : 'Google sign-in failed. Please try again.'
      onError(code === '10' || code === 'DEVELOPER_ERROR'
        ? 'Google rejected this app build. Its Android package and signing SHA-1 must match the Google Cloud Android client.'
        : message.includes('RNGoogleSignin') ? 'Install a new CartUp build with Google sign-in support, then try again.' : message)
    } finally {
      pending.current = false
      setBusy(false)
    }
  }
  return <Pressable accessibilityRole="button" disabled={disabled || busy} onPress={login} style={{ minHeight: 50, borderRadius: 12, borderWidth: 1, borderColor: '#747775', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', opacity: disabled || busy ? 0.6 : 1 }}>
    {busy ? <ActivityIndicator color="#1355d8" /> : <Text style={{ color: '#1f1f1f', fontSize: 16, fontWeight: '600' }}>Continue with Google</Text>}
  </Pressable>
}
