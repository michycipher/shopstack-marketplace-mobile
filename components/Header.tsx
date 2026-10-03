import { router } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BrandMark } from './BrandMark'
import { useAuth } from '@/lib/auth'
import { useCart } from '@/lib/cart'
import { useTheme } from '@/lib/theme'

export function Header({ title }: { title?: string }) {
  const { theme } = useTheme()
  const { user } = useAuth()
  const { count } = useCart()
  return <View style={styles.wrap}><BrandMark compact={false} /><View style={styles.actions}>{title && <Text style={[styles.title, { color: theme.muted }]}>{title}</Text>}<Pressable style={[styles.icon, { backgroundColor: theme.surface, borderColor: theme.line }]} onPress={() => router.push('/login')}><Ionicons name={user ? 'person' : 'person-outline'} size={19} color={theme.ink} /></Pressable><Pressable style={[styles.icon, { backgroundColor: theme.surface, borderColor: theme.line }]} onPress={() => router.push('/(tabs)/cart')}><Ionicons name="cart-outline" size={20} color={theme.ink} />{count > 0 && <View style={[styles.badge, { backgroundColor: theme.danger }]}><Text style={styles.badgeText}>{count}</Text></View>}</Pressable></View></View>
}

const styles = StyleSheet.create({ wrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }, actions: { flexDirection: 'row', alignItems: 'center', gap: 8 }, title: { fontSize: 12, fontWeight: '700', marginRight: 2 }, icon: { width: 40, height: 40, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' }, badge: { position: 'absolute', right: -4, top: -5, minWidth: 17, height: 17, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 }, badgeText: { color: '#fff', fontSize: 9, fontWeight: '800' } })
