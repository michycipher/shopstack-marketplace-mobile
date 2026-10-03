import { StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/lib/theme'

export function EmptyState({ icon = 'bag-outline', title, copy }: { icon?: keyof typeof Ionicons.glyphMap; title: string; copy: string }) {
  const { theme } = useTheme()
  return <View style={styles.wrap}><View style={[styles.icon, { backgroundColor: theme.softBlue }]}><Ionicons name={icon} size={34} color={theme.blue} /></View><Text style={[styles.title, { color: theme.ink }]}>{title}</Text><Text style={[styles.copy, { color: theme.muted }]}>{copy}</Text></View>
}

const styles = StyleSheet.create({ wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50, gap: 10 }, icon: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }, title: { fontSize: 19, fontWeight: '900', marginTop: 4 }, copy: { fontSize: 13, textAlign: 'center', lineHeight: 19, maxWidth: 290 } })
