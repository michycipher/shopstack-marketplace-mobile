export type Product = {
  id: string
  name: string
  category: string
  price: number
  oldPrice: number
  rating: number
  reviews: number
  store: string
  verified: boolean
  image: string
  tags: string[]
  description?: string
  storeSlug?: string
  stock?: number
}

export type Store = {
  slug: string
  name: string
  description?: string
  category: string
  rating: number | string
  productCount: number
  image: string
  logo: string
  verified?: boolean
}

export type User = {
  email: string
  name?: string
  full_name?: string
  avatar_url?: string
  avatarUrl?: string
}

export type CartItem = Product & { quantity: number }

export type Order = {
  id: string
  email: string
  status: string
  total: number
  date: string
  items: { id: string; name: string; image: string; quantity: number }[]
}

export const money = (value: number) => `₦${value.toLocaleString('en-NG')}`
