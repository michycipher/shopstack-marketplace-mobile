import { router } from 'expo-router'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BrandMark } from './BrandMark'
import { useAuth } from '@/lib/auth'
import { useCart } from '@/lib/cart'
import { useTheme } from '@/lib/theme'
import { getUserAvatar, getUserDisplayName, getUserInitials } from '@/lib/user'

export function Header({ title }: { title?: string }) {
  const { theme } = useTheme()
  const { user } = useAuth()
  const { count } = useCart()
  const displayName = user ? getUserDisplayName(user) : ''
  const avatar = user ? getUserAvatar(user) : undefined

  return <View style={styles.wrap}>
    <Pressable accessibilityRole="button" accessibilityLabel="Go to home" hitSlop={8} onPress={() => router.replace('/(tabs)')}>
      <BrandMark compact={false} />
    </Pressable>
    <View style={styles.actions}>
      {title && <Text style={[styles.title, { color: theme.muted }]}>{title}</Text>}
      {user ? <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open account for ${displayName}`}
        hitSlop={8}
        style={[styles.profile, { backgroundColor: theme.surface, borderColor: theme.line }]}
        onPress={() => router.push('/login')}
      >
        {avatar ? <Image source={{ uri: avatar }} style={styles.avatar} /> : <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: theme.softBlue }]}><Text style={[styles.initials, { color: theme.blue }]}>{getUserInitials(displayName)}</Text></View>}
        <Text style={[styles.profileName, { color: theme.ink }]} numberOfLines={1}>{displayName}</Text>
      </Pressable> : <Pressable accessibilityRole="button" accessibilityLabel="Sign in" hitSlop={8} style={[styles.icon, { backgroundColor: theme.surface, borderColor: theme.line }]} onPress={() => router.push('/login')}>
        <Ionicons name="person-outline" size={19} color={theme.ink} />
      </Pressable>}
      <Pressable accessibilityRole="button" accessibilityLabel="Open cart" hitSlop={8} style={[styles.icon, { backgroundColor: theme.surface, borderColor: theme.line }]} onPress={() => router.push('/(tabs)/cart')}>
        <Ionicons name="cart-outline" size={20} color={theme.ink} />
        {count > 0 && <View style={[styles.badge, { backgroundColor: theme.danger }]}><Text style={styles.badgeText}>{count}</Text></View>}
      </Pressable>
    </View>
  </View>
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 12, fontWeight: '700', marginRight: 2 },
  icon: { width: 40, height: 40, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  profile: { height: 40, maxWidth: 142, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 6, paddingRight: 10, borderRadius: 14, borderWidth: 1 },
  avatar: { width: 28, height: 28, borderRadius: 14 },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: 10, fontWeight: '900' },
  profileName: { maxWidth: 92, fontSize: 12, fontWeight: '800' },
  badge: { position: 'absolute', right: -4, top: -5, minWidth: 17, height: 17, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
})
