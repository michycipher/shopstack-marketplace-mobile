import { router } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { Header } from '@/components/Header'
import { EmptyState } from '@/components/EmptyState'
import { Screen } from '@/components/Screen'
import { getOrders } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { useTheme } from '@/lib/theme'
import type { Order } from '@/lib/types'
import { money } from '@/lib/types'

export default function OrdersScreen() {
  const { theme } = useTheme()
  const { user, ready } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const load = useCallback(async () => { if (!user) return; setLoading(true); try { const response = await getOrders(); setOrders(response.orders); setError('') } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Orders unavailable') } finally { setLoading(false) } }, [user])
  useEffect(() => { const timer = setTimeout(() => { void load() }, 0); return () => clearTimeout(timer) }, [load])
  return <Screen refreshing={loading} onRefresh={load}><Header title="Orders" />{!ready || loading ? <ActivityIndicator color={theme.blue} style={{ padding: 60 }} /> : !user ? <><EmptyState icon="person-outline" title="Sign in to see your orders" copy="Use the same Google account as CartUp on the web to keep your order history together." /><Pressable style={[styles.button, { backgroundColor: theme.blue }]} onPress={() => router.push('/login')}><Text style={styles.buttonText}>Continue with Google</Text></Pressable></> : error ? <EmptyState icon="alert-circle-outline" title="Orders are unavailable" copy={error} /> : !orders.length ? <EmptyState icon="cube-outline" title="No orders yet" copy="Your confirmed purchases will appear here." /> : <View style={{ gap: 12 }}>{orders.map(order => <View key={order.id} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.line }]}><View style={styles.cardTop}><View><Text style={[styles.orderId, { color: theme.muted }]}>ORDER {order.id.slice(0, 8).toUpperCase()}</Text><Text style={[styles.date, { color: theme.ink }]}>{new Date(order.date).toLocaleDateString('en-NG', { dateStyle: 'medium' })}</Text></View><View style={[styles.status, { backgroundColor: order.status === 'Paid' ? '#DDF8EC' : '#FFF1D6' }]}><Text style={{ color: order.status === 'Paid' ? '#087443' : '#9A6500', fontSize: 10, fontWeight: '900' }}>{order.status}</Text></View></View><View style={styles.products}>{order.items.slice(0, 3).map(item => <View key={item.id} style={styles.product}><Image source={{ uri: item.image }} style={styles.productImage} /><Text style={[styles.productName, { color: theme.ink }]} numberOfLines={2}>{item.quantity} × {item.name}</Text></View>)}</View><View style={styles.orderBottom}><Text style={{ color: theme.muted, fontSize: 11 }}>{order.items.length} items</Text><Text style={[styles.orderTotal, { color: theme.ink }]}>{money(order.total)}</Text></View></View>)}</View>}</Screen>
}

const styles = StyleSheet.create({ button: { minHeight: 48, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }, buttonText: { color: '#fff', fontSize: 13, fontWeight: '900' }, card: { borderWidth: 1, borderRadius: 18, padding: 14, gap: 13 }, cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }, orderId: { fontSize: 10, fontWeight: '800', letterSpacing: .7 }, date: { fontSize: 14, fontWeight: '900', marginTop: 4 }, status: { borderRadius: 13, paddingHorizontal: 9, paddingVertical: 6 }, products: { flexDirection: 'row', gap: 8 }, product: { flex: 1, gap: 5 }, productImage: { width: '100%', aspectRatio: 1, borderRadius: 11 }, productName: { fontSize: 10, lineHeight: 14, fontWeight: '700' }, orderBottom: { borderTopWidth: 1, borderTopColor: '#E4E7EC', paddingTop: 11, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, orderTotal: { fontSize: 16, fontWeight: '900' } })
