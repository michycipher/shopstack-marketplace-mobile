import type { CartItem } from './types'

export type PurchasedItem = Pick<CartItem, 'id' | 'quantity'>

export type PendingPayment = {
  orderId: string
  purchasedItems: PurchasedItem[]
  accountEmail: string | null
}

export function isPaidStatus(status: string) {
  return status.trim().toLowerCase() === 'paid'
}

export function remainingAfterPurchase(cart: CartItem[], purchasedItems: PurchasedItem[]) {
  const purchased = new Map<string, number>()
  for (const item of purchasedItems) {
    purchased.set(item.id, (purchased.get(item.id) ?? 0) + item.quantity)
  }

  return cart.flatMap(item => {
    const quantity = item.quantity - (purchased.get(item.id) ?? 0)
    return quantity > 0 ? [{ ...item, quantity }] : []
  })
}
