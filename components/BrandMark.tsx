import { StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/lib/theme'

export function BrandMark({ compact = false }: { compact?: boolean }) {
  const { theme } = useTheme()
  return <View style={styles.row}><View style={[styles.mark, { backgroundColor: theme.yellow }]}><Text style={[styles.markText, { color: theme.ink }]}>C</Text></View>{!compact && <Text style={[styles.wordmark, { color: theme.ink }]}>cart<Text style={{ color: theme.blue }}>up</Text></Text>}</View>
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', gap: 9 }, mark: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, markText: { fontSize: 25, fontWeight: '900', fontStyle: 'italic' }, wordmark: { fontSize: 22, fontWeight: '900', letterSpacing: -1.2 } })
