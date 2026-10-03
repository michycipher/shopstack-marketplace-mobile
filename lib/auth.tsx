import * as SecureStore from 'expo-secure-store'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { authenticateGoogle, getMe, setSessionToken } from './api'
import type { User } from './types'

const TOKEN_KEY = 'cartup-mobile-session'
type AuthContextValue = { user: User | null; ready: boolean; signingIn: boolean; signIn: (credential: string) => Promise<void>; signOut: () => Promise<void>; refresh: () => Promise<void> }
const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  const [signingIn, setSigningIn] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const response = await getMe()
      setUser(response.user)
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    let active = true
    async function restore() {
      const token = await SecureStore.getItemAsync(TOKEN_KEY)
      if (token) {
        setSessionToken(token)
        try {
          const response = await getMe()
          if (active) setUser(response.user)
        } catch {
          await SecureStore.deleteItemAsync(TOKEN_KEY)
          setSessionToken(null)
        }
      }
      if (active) setReady(true)
    }
    restore()
    return () => { active = false }
  }, [])

  const signIn = useCallback(async (credential: string) => {
    setSigningIn(true)
    try {
      const response = await authenticateGoogle(credential)
      if (!response.sessionToken) throw new Error('The mobile session could not be created')
      await SecureStore.setItemAsync(TOKEN_KEY, response.sessionToken)
      setSessionToken(response.sessionToken)
      setUser(response.user)
    } finally {
      setSigningIn(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY)
    setSessionToken(null)
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, ready, signingIn, signIn, signOut, refresh }), [user, ready, signingIn, signIn, signOut, refresh])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
