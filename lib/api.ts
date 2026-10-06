import type { CartItem, Order, Product, Store, User } from './types'

export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'https://e-shop-woad-zeta.vercel.app').replace(/\/$/, '')

let sessionToken: string | null = null

export function setSessionToken(token: string | null) {
  sessionToken = token
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (sessionToken) headers.set('Authorization', `Bearer ${sessionToken}`)

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload?.statusMessage || payload?.message || `Request failed (${response.status})`)
  return payload as T
}

export type Catalog = { source: 'neon' | 'demo'; products: Product[]; stores: Store[] }

export function getCatalog() {
  return request<Catalog>('/api/products')
}

export function getMe() {
  return request<{ user: User | null }>('/api/me')
}

export function authenticateGoogle(credential: string) {
  return request<{ source: string; user: User; sessionToken?: string }>('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential, platform: 'mobile' }),
  })
}

export function getCart() {
  return request<{ authenticated: boolean; items: CartItem[] }>('/api/cart')
}

export function saveCart(items: CartItem[]) {
  return request<{ authenticated: boolean; items: CartItem[] }>('/api/cart', {
    method: 'PUT',
    body: JSON.stringify({ items: items.map(item => ({ id: item.id, quantity: item.quantity })) }),
  })
}

export type OrdersResponse = {
  authenticated: boolean
  orders: Order[]
  pagination: { page: number; pageSize: number; total: number; pageCount: number }
}

export function getOrders(page = 1, pageSize = 5) {
  return request<OrdersResponse>(`/api/orders?page=${page}&pageSize=${pageSize}`)
}

export function deleteOrder(orderId: string) {
  return request<{ deleted: boolean; orderId: string }>(`/api/orders/${encodeURIComponent(orderId)}`, { method: 'DELETE' })
}

export function createOrder(input: { email: string; items: CartItem[]; address: Record<string, string> }) {
  return request<{ order: { id: string }; payment: { authorizationUrl: string }; recipientEmail: string }>('/api/orders', {
    method: 'POST',
    body: JSON.stringify({
      email: input.email,
      items: input.items.map(item => ({ id: item.id, quantity: item.quantity })),
      address: input.address,
    }),
  })
}
