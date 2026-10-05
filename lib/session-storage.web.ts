const TOKEN_KEY = 'cartup-mobile-session'

// Browser storage is separate from the encrypted native keychain. If browser
// storage is blocked, keep this session in memory until the page is closed.
let memoryToken: string | null = null

export const sessionStorage = {
  async get(): Promise<string | null> {
    if (typeof window === 'undefined') return null
    try {
      return window.localStorage.getItem(TOKEN_KEY) ?? memoryToken
    } catch {
      return memoryToken
    }
  },
  async set(token: string): Promise<void> {
    if (typeof window === 'undefined') return
    memoryToken = token
    try { window.localStorage.setItem(TOKEN_KEY, token) } catch { /* Memory-only session. */ }
  },
  async remove(): Promise<void> {
    memoryToken = null
    if (typeof window === 'undefined') return
    try { window.localStorage.removeItem(TOKEN_KEY) } catch { /* Storage is unavailable. */ }
  },
}
