import { useRef, useState } from 'react'
import { ActivityIndicator, Pressable, Text } from 'react-native'
import { AuthRequest, ResponseType, makeRedirectUri } from 'expo-auth-session'
import { discovery } from 'expo-auth-session/providers/google'
import * as Crypto from 'expo-crypto'
import * as WebBrowser from 'expo-web-browser'

WebBrowser.maybeCompleteAuthSession()

const EXPO_AUTH_PROXY_URL = 'https://auth.expo.io/@michuo/cartup-mobile'

type Props = { onCredential: (token: string) => Promise<void>; onError: (message: string) => void; disabled?: boolean }

function getOAuthErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return 'Google sign-in failed. Please try again.'
}

export default function GoogleLogin({ onCredential, onError, disabled }: Props) {
  const [busy, setBusy] = useState(false)
  const pending = useRef(false)
  async function login() {
    if (pending.current || disabled) return
    pending.current = true
    setBusy(true)
    try {
      const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim()
      if (!webClientId) throw new Error('Google sign-in is not configured for this build.')

      // Use the web OAuth client for every native platform. The browser does
      // the Google login and returns the web-audience ID token directly. No
      // client secret is ever shipped in the mobile app.
      const request = new AuthRequest({
        clientId: webClientId,
        responseType: ResponseType.IdToken,
        redirectUri: EXPO_AUTH_PROXY_URL,
        scopes: ['openid', 'profile', 'email'],
        usePKCE: false,
        extraParams: { prompt: 'select_account', nonce: Crypto.randomUUID() },
      })
      const authUrl = await request.makeAuthUrlAsync(discovery)
      const returnUrl = makeRedirectUri({ scheme: 'cartupmobile', path: 'oauthredirect' })
      const startUrl = `${EXPO_AUTH_PROXY_URL}/start?${new URLSearchParams({ authUrl, returnUrl })}`
      const browserResult = await WebBrowser.openAuthSessionAsync(startUrl, returnUrl)

      if (browserResult.type === 'cancel' || browserResult.type === 'dismiss') return
      if (browserResult.type !== 'success') throw new Error('Google sign-in was not completed.')

      const result = request.parseReturnUrl(browserResult.url)
      if (result.type === 'error') throw result.error ?? new Error('Google did not approve this sign-in.')
      if (result.type !== 'success') throw new Error('Google did not approve this sign-in.')

      const idToken = result.params.id_token
      if (!idToken) throw new Error('Google did not return an ID token.')
      await onCredential(idToken)
    } catch (error) {
      const message = getOAuthErrorMessage(error)
      if (/cancel|dismiss/i.test(message)) return
      onError(message)
    } finally {
      pending.current = false
      setBusy(false)
    }
  }
  return <Pressable accessibilityRole="button" disabled={disabled || busy} onPress={login} style={{ minHeight: 50, borderRadius: 12, borderWidth: 1, borderColor: '#747775', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', opacity: disabled || busy ? 0.6 : 1 }}>
    {busy ? <ActivityIndicator color="#1355d8" /> : <Text style={{ color: '#1f1f1f', fontSize: 16, fontWeight: '600' }}>Continue with Google</Text>}
  </Pressable>
}
