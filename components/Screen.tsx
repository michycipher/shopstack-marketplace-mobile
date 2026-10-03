import { PropsWithChildren } from 'react'
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native'
import { useTheme } from '@/lib/theme'

export function Screen({ children, scroll = true, refreshing, onRefresh }: PropsWithChildren<{ scroll?: boolean; refreshing?: boolean; onRefresh?: () => void }>) {
  const { theme } = useTheme()
  if (!scroll) return <View style={[styles.safe, { backgroundColor: theme.background }]}>{children}</View>
  return <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} refreshControl={onRefresh ? <RefreshControl refreshing={Boolean(refreshing)} onRefresh={onRefresh} tintColor={theme.blue} /> : undefined}>{children}</ScrollView>
}

export const styles = StyleSheet.create({ safe: { flex: 1 }, content: { padding: 20, paddingBottom: 110, gap: 20 } })
