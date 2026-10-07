import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react'
import { AppState } from 'react-native'
import { getCart, getOrders, saveCart } from './api'
import { useAuth } from './auth'
import { isPaidStatus, remainingAfterPurchase, type PendingPayment, type PurchasedItem } from './payment'
import type { CartItem, Product } from './types'
import { useToast } from './toast'

const GUEST_CART_KEY = 'cartup-mobile-guest-cart'
const PENDING_PAYMENT_KEY = 'cartup-mobile-pending-payment'
type CartContextValue = {
  items: CartItem[]
  count: number
  subtotal: number
  syncing: boolean
  pendingPayment: PendingPayment | null
  add: (product: Product, quantity?: number) => Promise<void>
  changeQuantity: (id: string, amount: number) => Promise<void>
  remove: (id: string) => Promise<void>
  refresh: (showIndicator?: boolean) => Promise<void>
  clear: () => Promise<void>
  trackPayment: (orderId: string, purchasedItems: PurchasedItem[]) => Promise<void>
  confirmGuestPayment: () => Promise<void>
}
const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: PropsWithChildren) {
  const { user, ready } = useAuth()
  const { show } = useToast()
  const [items, setItems] = useState<CartItem[]>([])
  const [syncing, setSyncing] = useState(false)
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null)
  const reconcilingPayment = useRef(false)
  const cartRevision = useRef(0)
  const cartMutations = useRef(0)
  const latestRefresh = useRef(0)

  const persistGuest = useCallback(async (next: CartItem[]) => { await AsyncStorage.setItem(GUEST_CART_KEY, JSON.stringify(next)) }, [])
  const refresh = useCallback(async (showIndicator = false) => {
    if (!ready || cartMutations.current) return
    const request = ++latestRefresh.current
    const revision = cartRevision.current
    if (showIndicator) setSyncing(true)
    try {
      let next: CartItem[]
      if (user) {
        const response = await getCart()
        next = response.items
      } else {
        const stored = await AsyncStorage.getItem(GUEST_CART_KEY)
        next = stored ? JSON.parse(stored) as CartItem[] : []
      }
      if (request === latestRefresh.current && revision === cartRevision.current && !cartMutations.current) {
        setItems(current => JSON.stringify(current) === JSON.stringify(next) ? current : next)
      }
    } catch (error) {
      if (showIndicator) show(error instanceof Error ? error.message : 'Cart could not be refreshed', 'error')
    } finally {
      if (showIndicator) setSyncing(false)
    }
  }, [ready, user, show])

  useEffect(() => {
    const task = setTimeout(() => { void refresh() }, 0)
    return () => clearTimeout(task)
  }, [refresh])
  useEffect(() => {
    let active = true
    void AsyncStorage.getItem(PENDING_PAYMENT_KEY).then(stored => {
      if (active && stored) {
        const payment = JSON.parse(stored) as PendingPayment
        setPendingPayment(current => current ?? payment)
      }
    }).catch(() => {})
    return () => { active = false }
  }, [])

  const commit = useCallback(async (next: CartItem[]) => {
    const revision = ++cartRevision.current
    cartMutations.current += 1
    setItems(next)
    try {
      if (user) {
        try {
          const response = await saveCart(next)
          if (revision === cartRevision.current) setItems(response.items)
        } catch (error) { show(error instanceof Error ? error.message : 'Cart could not be saved', 'error') }
      } else await persistGuest(next)
    } finally { cartMutations.current -= 1 }
  }, [persistGuest, show, user])

  const trackPayment = useCallback(async (orderId: string, purchasedItems: PurchasedItem[]) => {
    const payment: PendingPayment = { orderId, purchasedItems, accountEmail: user?.email ?? null }
    setPendingPayment(payment)
    await AsyncStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(payment)).catch(() => {})
  }, [user])

  const reconcilePayment = useCallback(async () => {
    if (!ready || !user || !pendingPayment || pendingPayment.accountEmail?.toLowerCase() !== user.email.toLowerCase() || reconcilingPayment.current || cartMutations.current) return
    reconcilingPayment.current = true
    try {
      const response = await getOrders(1, 20)
      const order = response.orders.find(candidate => candidate.id === pendingPayment.orderId)
      if (!response.authenticated || !order || !isPaidStatus(order.status)) return

      const cartAtStart = cartRevision.current
      const latestCart = await getCart()
      if (cartAtStart !== cartRevision.current || cartMutations.current) return
      const remaining = remainingAfterPurchase(latestCart.items, pendingPayment.purchasedItems)
      const revision = ++cartRevision.current
      cartMutations.current += 1
      try {
        const saved = await saveCart(remaining)
        if (revision === cartRevision.current) setItems(saved.items)
      } finally { cartMutations.current -= 1 }
      await AsyncStorage.removeItem(PENDING_PAYMENT_KEY)
      setPendingPayment(null)
      show('Payment confirmed. Your cart is updated.')
    } catch {
      // Keep the pending order and retry when the app returns or the next poll runs.
    } finally {
      reconcilingPayment.current = false
    }
  }, [pendingPayment, ready, show, user])

  const confirmGuestPayment = useCallback(async () => {
    if (!pendingPayment || pendingPayment.accountEmail) return
    const stored = await AsyncStorage.getItem(GUEST_CART_KEY)
    const current = stored ? JSON.parse(stored) as CartItem[] : items
    const remaining = remainingAfterPurchase(current, pendingPayment.purchasedItems)
    cartRevision.current += 1
    await persistGuest(remaining)
    if (user) {
      const latestCart = await getCart()
      const saved = await saveCart(remainingAfterPurchase(latestCart.items, pendingPayment.purchasedItems))
      setItems(saved.items)
    } else setItems(remaining)
    await AsyncStorage.removeItem(PENDING_PAYMENT_KEY)
    setPendingPayment(null)
    show('Purchased items removed from your cart')
  }, [items, pendingPayment, persistGuest, show, user])

  useEffect(() => {
    const task = setTimeout(() => { void reconcilePayment() }, 0)
    return () => clearTimeout(task)
  }, [reconcilePayment])
  useEffect(() => {
    const handler = (state: string) => {
      if (state === 'active') { void refresh(); void reconcilePayment() }
    }
    const subscription = AppState.addEventListener('change', handler)
    const interval = user && pendingPayment ? setInterval(() => { void reconcilePayment() }, 8000) : undefined
    return () => { subscription.remove(); if (interval) clearInterval(interval) }
  }, [pendingPayment, reconcilePayment, refresh, user])

  const add = useCallback(async (product: Product, quantity = 1) => {
    const found = items.find(item => item.id === product.id)
    const next = found ? items.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item) : [...items, { ...product, quantity }]
    await commit(next)
    show(`${product.name} added to cart`)
  }, [commit, items, show])
  const changeQuantity = useCallback(async (id: string, amount: number) => { await commit(items.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item)) }, [commit, items])
  const remove = useCallback(async (id: string) => { const removed = items.find(item => item.id === id); await commit(items.filter(item => item.id !== id)); if (removed) show(`${removed.name} removed`, 'info') }, [commit, items, show])
  const clear = useCallback(async () => { await commit([]) }, [commit])
  const value = useMemo(() => ({ items, count: items.reduce((sum, item) => sum + item.quantity, 0), subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0), syncing, pendingPayment, add, changeQuantity, remove, refresh, clear, trackPayment, confirmGuestPayment }), [items, syncing, pendingPayment, add, changeQuantity, remove, refresh, clear, trackPayment, confirmGuestPayment])
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart must be used inside CartProvider')
  return value
}
