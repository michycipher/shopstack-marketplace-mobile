import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { AppState } from 'react-native'
import { getCart, saveCart } from './api'
import { useAuth } from './auth'
import type { CartItem, Product } from './types'
import { useToast } from './toast'

const GUEST_CART_KEY = 'cartup-mobile-guest-cart'
type CartContextValue = { items: CartItem[]; count: number; subtotal: number; syncing: boolean; add: (product: Product, quantity?: number) => Promise<void>; changeQuantity: (id: string, amount: number) => Promise<void>; remove: (id: string) => Promise<void>; refresh: () => Promise<void>; clear: () => Promise<void> }
const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: PropsWithChildren) {
  const { user, ready } = useAuth()
  const { show } = useToast()
  const [items, setItems] = useState<CartItem[]>([])
  const [syncing, setSyncing] = useState(false)

  const persistGuest = useCallback(async (next: CartItem[]) => { await AsyncStorage.setItem(GUEST_CART_KEY, JSON.stringify(next)) }, [])
  const refresh = useCallback(async () => {
    if (!ready) return
    setSyncing(true)
    try {
      if (user) {
        const response = await getCart()
        setItems(response.items)
      } else {
        const stored = await AsyncStorage.getItem(GUEST_CART_KEY)
        setItems(stored ? JSON.parse(stored) as CartItem[] : [])
      }
    } catch (error) {
      show(error instanceof Error ? error.message : 'Cart could not be refreshed', 'error')
    } finally { setSyncing(false) }
  }, [ready, user, show])

  useEffect(() => {
    const task = setTimeout(() => { void refresh() }, 0)
    return () => clearTimeout(task)
  }, [refresh])
  useEffect(() => {
    const handler = (state: string) => { if (state === 'active' && user) refresh() }
    const subscription = AppState.addEventListener('change', handler)
    const interval = user ? setInterval(refresh, 8000) : undefined
    return () => { subscription.remove(); if (interval) clearInterval(interval) }
  }, [refresh, user])

  const commit = useCallback(async (next: CartItem[]) => {
    setItems(next)
    if (user) {
      try { const response = await saveCart(next); setItems(response.items) } catch (error) { show(error instanceof Error ? error.message : 'Cart could not be saved', 'error') }
    } else await persistGuest(next)
  }, [persistGuest, show, user])

  const add = useCallback(async (product: Product, quantity = 1) => {
    const found = items.find(item => item.id === product.id)
    const next = found ? items.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item) : [...items, { ...product, quantity }]
    await commit(next)
    show(`${product.name} added to cart`)
  }, [commit, items, show])
  const changeQuantity = useCallback(async (id: string, amount: number) => { await commit(items.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item)) }, [commit, items])
  const remove = useCallback(async (id: string) => { const removed = items.find(item => item.id === id); await commit(items.filter(item => item.id !== id)); if (removed) show(`${removed.name} removed`, 'info') }, [commit, items, show])
  const clear = useCallback(async () => { await commit([]) }, [commit])
  const value = useMemo(() => ({ items, count: items.reduce((sum, item) => sum + item.quantity, 0), subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0), syncing, add, changeQuantity, remove, refresh, clear }), [items, syncing, add, changeQuantity, remove, refresh, clear])
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart must be used inside CartProvider')
  return value
}
