import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { authenticateGoogle, authenticateApple, getMe, setSessionToken } from './api'
import type { User } from './types'
import { sessionStorage } from './session-storage'

type AuthContextValue = { user: User | null; ready: boolean; signingIn: boolean; signIn: (credential: string) => Promise<void>; signInApple: (credential: string, challenge: string, name?: string) => Promise<void>; signOut: () => Promise<void>; refresh: () => Promise<void> }
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
      try {
        const token = await sessionStorage.get()
        if (!active) return
        if (token) {
          setSessionToken(token)
          const response = await getMe()
          if (active) setUser(response.user)
        }
      } catch {
        if (active) {
          setSessionToken(null)
          setUser(null)
          await sessionStorage.remove().catch(() => {})
        }
      } finally {
        if (active) setReady(true)
      }
    }
    restore()
    return () => { active = false }
  }, [])

  const signIn = useCallback(async (credential: string) => {
    setSigningIn(true)
    try {
      const response = await authenticateGoogle(credential)
      if (!response.sessionToken) throw new Error('The mobile session could not be created')
      await sessionStorage.set(response.sessionToken)
      setSessionToken(response.sessionToken)
      setUser(response.user)
    } finally {
      setSigningIn(false)
    }
  }, [])

  const signInApple = useCallback(async (credential: string, challenge: string, name?: string) => {
    setSigningIn(true)
    try {
      const response = await authenticateApple(credential, challenge, name)
      if (!response.sessionToken) throw new Error('The Apple session could not be created')
      await sessionStorage.set(response.sessionToken)
      setSessionToken(response.sessionToken)
      setUser(response.user)
    } finally { setSigningIn(false) }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await sessionStorage.remove()
    } finally {
      setSessionToken(null)
      setUser(null)
    }
  }, [])

  const value = useMemo(() => ({ user, ready, signingIn, signIn, signInApple, signOut, refresh }), [user, ready, signingIn, signIn, signInApple, signOut, refresh])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
