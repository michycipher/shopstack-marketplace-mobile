import { router, useLocalSearchParams } from 'expo-router'
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ProductCard } from '@/components/ProductCard'
import { useCatalog } from '@/lib/catalog'
import { useTheme } from '@/lib/theme'

export default function StoreScreen() {
  const { theme } = useTheme()
  const { stores, products } = useCatalog()
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const store = stores.find(item => item.slug === slug)
  const storeProducts = products.filter(item => item.storeSlug === slug)
  if (!store) return <View style={[styles.center, { backgroundColor: theme.background }]}><Text style={{ color: theme.ink }}>Store not found.</Text></View>
  return <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.content}><Pressable onPress={() => router.back()} style={[styles.back, { backgroundColor: theme.surface, borderColor: theme.line }]}><Ionicons name="arrow-back" size={19} color={theme.ink} /></Pressable><View style={[styles.cover, { backgroundColor: theme.darkNavy }]}><Image source={{ uri: store.image }} style={styles.coverImage} /><View style={styles.coverShade} /><View style={styles.coverCopy}><Text style={styles.coverKicker}>OFFICIAL STORE</Text><Text style={styles.storeName}>{store.name}</Text><Text style={styles.storeMeta}>{store.category} · {store.productCount} products</Text></View></View><Text style={[styles.heading, { color: theme.ink }]}>Shop this store</Text><View style={styles.grid}>{storeProducts.map(product => <ProductCard key={product.id} product={product} />)}</View></ScrollView>
}

const absolute = { position: 'absolute' as const, top: 0, right: 0, bottom: 0, left: 0 }
const styles = StyleSheet.create({ content: { padding: 20, paddingBottom: 60, gap: 18 }, center: { flex: 1, alignItems: 'center', justifyContent: 'center' }, back: { width: 40, height: 40, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, cover: { height: 220, borderRadius: 24, overflow: 'hidden', position: 'relative', justifyContent: 'flex-end' }, coverImage: { ...absolute, width: '100%', height: '100%', opacity: .55 }, coverShade: { ...absolute, backgroundColor: '#071225', opacity: .4 }, coverCopy: { padding: 20, gap: 5 }, coverKicker: { color: '#A9C3FF', fontSize: 10, fontWeight: '900', letterSpacing: 1.3 }, storeName: { color: '#fff', fontSize: 25, fontWeight: '900' }, storeMeta: { color: '#D6E0F1', fontSize: 12 }, heading: { fontSize: 21, fontWeight: '900' }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 } })
