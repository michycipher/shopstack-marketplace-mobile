import { useEffect, useRef, useState } from 'react'
import * as Apple from 'expo-apple-authentication'
import { View } from 'react-native'
import { request } from '@/lib/api'

export default function AppleLogin({ onCredential, onError, disabled }: { onCredential: (token: string, challenge: string, name?: string) => Promise<void>; onError: (message: string) => void; disabled?: boolean }) {
  const [available, setAvailable] = useState(false)
  const [busy, setBusy] = useState(false)
  const pending = useRef(false)
  useEffect(() => { let active = true; Apple.isAvailableAsync().then(value => { if (active) setAvailable(value) }).catch(() => {}); return () => { active = false } }, [])
  async function login() {
    if (pending.current || disabled) return
    pending.current = true
    setBusy(true)
    try {
      const challenge = await request<{ nonce: string; challenge: string }>('/api/auth/apple/challenge', { method: 'POST' })
      const result = await Apple.signInAsync({ requestedScopes: [Apple.AppleAuthenticationScope.FULL_NAME, Apple.AppleAuthenticationScope.EMAIL], nonce: challenge.nonce })
      if (!result.identityToken) throw new Error('Apple did not return a sign-in token.')
      await onCredential(result.identityToken, challenge.challenge, result.fullName ? Apple.formatFullName(result.fullName) : undefined)
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ERR_REQUEST_CANCELED') return
      onError(error instanceof Error ? error.message : 'Apple sign-in failed. Please try again.')
    } finally { pending.current = false; setBusy(false) }
  }
  if (!available) return null
  return <View style={{ opacity: busy || disabled ? 0.6 : 1, pointerEvents: busy || disabled ? 'none' : 'auto' }}><Apple.AppleAuthenticationButton buttonType={Apple.AppleAuthenticationButtonType.CONTINUE} buttonStyle={Apple.AppleAuthenticationButtonStyle.BLACK} cornerRadius={12} style={{ height: 50, width: '100%' }} onPress={login} /></View>
}
