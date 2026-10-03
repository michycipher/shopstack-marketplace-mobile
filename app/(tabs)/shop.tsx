import { useLocalSearchParams } from 'expo-router'
import { useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Header } from '@/components/Header'
import { ProductCard } from '@/components/ProductCard'
import { Screen } from '@/components/Screen'
import { useCatalog } from '@/lib/catalog'
import { useTheme } from '@/lib/theme'

const filters = ['All', 'Electronics', 'Phones & Tablets', 'Fashion', 'Home & Office', 'Beauty']

export default function ShopScreen() {
  const { theme } = useTheme()
  const { products, loading, refresh } = useCatalog()
  const params = useLocalSearchParams<{ category?: string }>()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(() => params.category ? String(params.category) : 'All')
  const filtered = useMemo(() => products.filter(product => (category === 'All' || product.category === category) && `${product.name} ${product.store} ${product.category}`.toLowerCase().includes(search.toLowerCase())), [products, category, search])
  return <Screen refreshing={loading} onRefresh={refresh}><Header title="Shop" /><View style={[styles.search, { backgroundColor: theme.surface, borderColor: theme.line }]}><Ionicons name="search-outline" size={20} color={theme.muted} /><TextInput value={search} onChangeText={setSearch} placeholder="Search products, brands..." placeholderTextColor={theme.muted} style={[styles.input, { color: theme.ink }]} /></View><View style={styles.intro}><View><Text style={[styles.kicker, { color: theme.blue }]}>EXPLORE THE COLLECTION</Text><Text style={[styles.heading, { color: theme.ink }]}>All products</Text></View><Text style={[styles.count, { color: theme.muted }]}>{filtered.length} found</Text></View><View style={styles.filters}>{filters.map(item => <Pressable key={item} onPress={() => setCategory(item)} style={[styles.filter, { backgroundColor: category === item ? theme.blue : theme.surface, borderColor: category === item ? theme.blue : theme.line }]}><Text style={{ color: category === item ? '#fff' : theme.ink, fontSize: 11, fontWeight: '800' }}>{item}</Text></Pressable>)}</View>{loading ? <ActivityIndicator color={theme.blue} style={{ padding: 60 }} /> : filtered.length ? <View style={styles.grid}>{filtered.map(product => <ProductCard key={product.id} product={product} />)}</View> : <View style={styles.noResults}><Ionicons name="search-outline" size={35} color={theme.muted} /><Text style={[styles.heading, { color: theme.ink }]}>No products found</Text><Text style={{ color: theme.muted }}>Try another search or category.</Text></View>}</Screen>
}

const styles = StyleSheet.create({ search: { minHeight: 48, borderWidth: 1, borderRadius: 15, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 9 }, input: { flex: 1, fontSize: 13 }, intro: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 4 }, kicker: { fontSize: 10, fontWeight: '900', letterSpacing: 1.2, marginBottom: 4 }, heading: { fontSize: 23, fontWeight: '900', letterSpacing: -.5 }, count: { fontSize: 12, paddingBottom: 3 }, filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, filter: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 9 }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, noResults: { alignItems: 'center', gap: 10, paddingVertical: 70 } })
