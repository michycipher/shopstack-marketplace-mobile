import { createElement, useEffect, useRef, useState } from 'react'
import { Text, View } from 'react-native'

type Props = { onCredential: (token: string) => Promise<void>; onError: (message: string) => void; disabled?: boolean }
type GoogleIdentity = { accounts: { id: {
  initialize: (options: { client_id: string; callback: (response: { credential: string }) => void; ux_mode: 'popup' }) => void
  renderButton: (element: HTMLElement, options: { theme: string; size: string; text: string; width: number }) => void
} } }

let loading: Promise<GoogleIdentity> | undefined
function loadGoogle(): Promise<GoogleIdentity> {
  const browser = window as Window & { google?: GoogleIdentity }
  if (browser.google) return Promise.resolve(browser.google)
  if (!loading) loading = new Promise<GoogleIdentity>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => browser.google ? resolve(browser.google) : reject(new Error('Google sign-in could not load.'))
    script.onerror = () => { script.remove(); reject(new Error('Unable to reach Google. Check your connection and reload.')) }
    document.head.appendChild(script)
  }).catch(error => { loading = undefined; throw error })
  return loading
}

export default function GoogleLogin(props: Props) {
  const container = useRef<HTMLDivElement>(null)
  const latest = useRef(props)
  useEffect(() => { latest.current = props }, [props])
  const pending = useRef(false)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    let active = true
    const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
    if (!clientId) { latest.current.onError('Google sign-in is not configured.'); return }
    loadGoogle().then(google => {
      if (!active || !container.current) return
      google.accounts.id.initialize({ client_id: clientId, ux_mode: 'popup', callback: response => {
        if (!active || pending.current || latest.current.disabled) return
        pending.current = true
        setBusy(true)
        latest.current.onCredential(response.credential).catch(error => {
          if (active) latest.current.onError(error instanceof Error ? error.message : 'Sign-in failed.')
        }).finally(() => { pending.current = false; if (active) setBusy(false) })
      } })
      google.accounts.id.renderButton(container.current, { theme: 'outline', size: 'large', text: 'continue_with', width: Math.min(360, container.current.clientWidth || 280) })
    }).catch(error => { if (active) latest.current.onError(error.message) })
    return () => { active = false }
  }, [])
  return <View style={{ minHeight: 48, opacity: busy || props.disabled ? 0.6 : 1, pointerEvents: busy || props.disabled ? 'none' : 'auto' }}>
    {createElement('div', { ref: container, style: { width: '100%', minHeight: 44 } })}
    {busy && <Text accessibilityLiveRegion="polite">Signing in…</Text>}
  </View>
}
