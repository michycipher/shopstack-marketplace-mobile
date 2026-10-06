import { router } from 'expo-router'
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useCart } from '@/lib/cart'
import { useTheme } from '@/lib/theme'
import type { Product } from '@/lib/types'
import { money } from '@/lib/types'

export function ProductCard({ product }: { product: Product }) {
  const { theme } = useTheme()
  const { add } = useCart()
  const { width } = useWindowDimensions()
  const cardWidth = width >= 700 ? '23%' : '48%'
  return <Pressable style={[styles.card, { width: cardWidth, backgroundColor: theme.surface, borderColor: theme.line }]} onPress={() => router.push(`/product/${product.id}`)}><View style={[styles.imageWrap, { backgroundColor: theme.softBlue }]}><Image source={{ uri: product.image }} style={styles.image} /><View style={[styles.discount, { backgroundColor: theme.yellow }]}><Text style={{ color: theme.ink, fontSize: 10, fontWeight: '900' }}>{Math.max(1, Math.round((1 - product.price / product.oldPrice) * 100))}% off</Text></View></View><View style={styles.body}><Text style={[styles.store, { color: theme.blue }]} numberOfLines={1}>{product.store}</Text><Text style={[styles.name, { color: theme.ink }]} numberOfLines={2}>{product.name}</Text><View style={styles.rating}><Ionicons name="star" size={13} color="#F59E0B" /><Text style={[styles.ratingText, { color: theme.muted }]}>{product.rating} ({product.reviews})</Text></View><Text style={[styles.price, { color: theme.ink }]}>{money(product.price)}</Text><Pressable style={[styles.add, { backgroundColor: theme.blue }]} onPress={() => add(product)}><Ionicons name="add" color="#fff" size={17} /><Text style={styles.addText}>Add to cart</Text></Pressable></View></Pressable>
}

const styles = StyleSheet.create({ card: { flexGrow: 0, flexShrink: 0, borderWidth: 1, borderRadius: 18, overflow: 'hidden' }, imageWrap: { height: 155, position: 'relative', overflow: 'hidden' }, image: { width: '100%', height: '100%', resizeMode: 'cover' }, discount: { position: 'absolute', left: 10, bottom: 10, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 6 }, body: { padding: 12, gap: 6 }, store: { fontSize: 10, fontWeight: '800' }, name: { fontSize: 13, lineHeight: 18, fontWeight: '700', minHeight: 36 }, rating: { flexDirection: 'row', gap: 4, alignItems: 'center' }, ratingText: { fontSize: 10 }, price: { fontSize: 16, fontWeight: '900', marginTop: 2 }, add: { minHeight: 36, borderRadius: 9, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, marginTop: 3 }, addText: { color: '#fff', fontSize: 11, fontWeight: '800' } })
