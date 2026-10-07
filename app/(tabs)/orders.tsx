import { router, useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { ActivityIndicator, Alert, AppState, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Header } from '@/components/Header'
import { EmptyState } from '@/components/EmptyState'
import { Screen } from '@/components/Screen'
import { deleteOrder, getOrders } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { useCart } from '@/lib/cart'
import { useTheme } from '@/lib/theme'
import { useToast } from '@/lib/toast'
import type { Order } from '@/lib/types'
import { money } from '@/lib/types'

const PAGE_SIZE = 5

export default function OrdersScreen() {
  const { theme } = useTheme()
  const { user, ready } = useAuth()
  const { pendingPayment } = useCart()
  const { show } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(0)
  const [totalOrders, setTotalOrders] = useState(0)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async (targetPage = 1, silent = false) => {
    if (!user) return
    if (!silent) setLoading(true)
    try {
      const response = await getOrders(targetPage, PAGE_SIZE)
      setOrders(current => JSON.stringify(current) === JSON.stringify(response.orders) ? current : response.orders)
      setPage(response.pagination.page)
      setPageCount(response.pagination.pageCount)
      setTotalOrders(response.pagination.total)
      setError('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Orders unavailable')
    } finally { if (!silent) setLoading(false) }
  }, [user])

  useFocusEffect(useCallback(() => {
    const timer = setTimeout(() => { void load(1) }, 0)
    const interval = pendingPayment && user ? setInterval(() => { void load(1, true) }, 8000) : undefined
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') void load(1, true)
    })
    return () => { clearTimeout(timer); if (interval) clearInterval(interval); subscription.remove() }
  }, [load, pendingPayment, user]))

  function itemCount(order: Order) {
    return order.itemCount ?? order.items.reduce((count, item) => count + item.quantity, 0)
  }

  function confirmDelete(order: Order) {
    Alert.alert('Delete this order?', 'It will be removed from your order history.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { void remove(order) } },
    ])
  }

  async function remove(order: Order) {
    setDeleting(order.id)
    try {
      await deleteOrder(order.id)
      show('Order removed from your history')
      const nextPage = orders.length === 1 && page > 1 ? page - 1 : page
      await load(nextPage)
    } catch (requestError) { show(requestError instanceof Error ? requestError.message : 'Order could not be deleted', 'error') } finally { setDeleting(null) }
  }

  return <Screen refreshing={loading} onRefresh={() => load(page)}>
    <Header title="Orders" />
    {!ready || loading && !orders.length ? <ActivityIndicator color={theme.blue} style={{ padding: 60 }} /> : !user ? <>
      <EmptyState icon="person-outline" title="Sign in to see your orders" copy="Use the same Google account as CartUp on the web to keep your order history together." />
      <Pressable style={[styles.button, { backgroundColor: theme.blue }]} onPress={() => router.push('/login')}><Text style={styles.buttonText}>Continue with Google</Text></Pressable>
    </> : error ? <EmptyState icon="alert-circle-outline" title="Orders are unavailable" copy={error} /> : !orders.length ? <EmptyState icon="cube-outline" title="No orders yet" copy="Your confirmed purchases will appear here." /> : <>
      <View style={styles.toolbar}><Text style={[styles.count, { color: theme.muted }]}>{totalOrders} order{totalOrders === 1 ? '' : 's'}</Text><Text style={[styles.count, { color: theme.muted }]}>Page {page} of {pageCount}</Text></View>
      <View style={{ gap: 12 }}>{orders.map(order => <View key={order.id} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.line }]}>
        <View style={styles.cardTop}><View><Text style={[styles.orderId, { color: theme.muted }]}>ORDER {order.id.slice(0, 8).toUpperCase()}</Text><Text style={[styles.date, { color: theme.ink }]}>{new Date(order.date).toLocaleDateString('en-NG', { dateStyle: 'medium' })}</Text></View><View style={styles.topRight}><View style={[styles.status, { backgroundColor: order.status === 'Paid' ? '#DDF8EC' : '#FFF1D6' }]}><Text style={{ color: order.status === 'Paid' ? '#087443' : '#9A6500', fontSize: 10, fontWeight: '900' }}>{order.status}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={`Delete order ${order.id.slice(0, 8)}`} hitSlop={8} disabled={deleting === order.id} onPress={() => confirmDelete(order)} style={styles.delete}><Ionicons name="trash-outline" size={18} color={theme.danger} /></Pressable></View></View>
        <View style={styles.products}>{order.items.slice(0, 3).map(item => <View key={item.id} style={styles.product}><Image source={{ uri: item.image }} style={styles.productImage} /><Text style={[styles.productName, { color: theme.ink }]} numberOfLines={2}>{item.quantity} × {item.name}</Text></View>)}</View>
        <View style={[styles.orderBottom, { borderTopColor: theme.line }]}><Text style={{ color: theme.muted, fontSize: 11 }}>{itemCount(order)} item{itemCount(order) === 1 ? '' : 's'}</Text><Text style={[styles.orderTotal, { color: theme.ink }]}>{money(order.total)}</Text></View>
      </View>)}</View>
      {pageCount > 1 && <View style={styles.pagination}><Pressable accessibilityRole="button" accessibilityLabel="Previous orders page" disabled={page <= 1 || loading} onPress={() => load(page - 1)} style={[styles.pageButton, { borderColor: theme.line, backgroundColor: theme.surface, opacity: page <= 1 ? .45 : 1 }]}><Ionicons name="chevron-back" size={17} color={theme.ink} /></Pressable><Text style={[styles.pageText, { color: theme.muted }]}>Page {page} of {pageCount}</Text><Pressable accessibilityRole="button" accessibilityLabel="Next orders page" disabled={page >= pageCount || loading} onPress={() => load(page + 1)} style={[styles.pageButton, { borderColor: theme.line, backgroundColor: theme.surface, opacity: page >= pageCount ? .45 : 1 }]}><Ionicons name="chevron-forward" size={17} color={theme.ink} /></Pressable></View>}
    </>}
  </Screen>
}

const styles = StyleSheet.create({
  button: { minHeight: 48, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 13, fontWeight: '900' },
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  count: { fontSize: 11, fontWeight: '700' },
  card: { borderWidth: 1, borderRadius: 18, padding: 14, gap: 13 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  orderId: { fontSize: 10, fontWeight: '800', letterSpacing: .7 },
  date: { fontSize: 14, fontWeight: '900', marginTop: 4 },
  status: { borderRadius: 13, paddingHorizontal: 9, paddingVertical: 6 },
  delete: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  products: { flexDirection: 'row', gap: 8 },
  product: { flex: 1, gap: 5 },
  productImage: { width: '100%', aspectRatio: 1, borderRadius: 11 },
  productName: { fontSize: 10, lineHeight: 14, fontWeight: '700' },
  orderBottom: { borderTopWidth: 1, paddingTop: 11, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderTotal: { fontSize: 16, fontWeight: '900' },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, paddingVertical: 4 },
  pageButton: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  pageText: { fontSize: 12, fontWeight: '800' },
})
