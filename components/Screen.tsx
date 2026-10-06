import { PropsWithChildren } from 'react'
import { RefreshControl, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/lib/theme'

export function Screen({ children, scroll = true, refreshing, onRefresh }: PropsWithChildren<{ scroll?: boolean; refreshing?: boolean; onRefresh?: () => void }>) {
  const { theme } = useTheme()
  if (!scroll) return <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safe, { backgroundColor: theme.background }]}>{children}</SafeAreaView>
  return <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: theme.background }}><ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} refreshControl={onRefresh ? <RefreshControl refreshing={Boolean(refreshing)} onRefresh={onRefresh} tintColor={theme.blue} /> : undefined}>{children}</ScrollView></SafeAreaView>
}

export const styles = StyleSheet.create({ safe: { flex: 1 }, content: { flexGrow: 1, padding: 20, paddingBottom: 110, gap: 20 } })
