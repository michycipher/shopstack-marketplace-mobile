import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { Pressable, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/theme'

export function BackButton() {
  const { theme } = useTheme()

  return <Pressable
    accessibilityRole="button"
    accessibilityLabel="Go back"
    hitSlop={8}
    onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}
    style={[styles.button, { backgroundColor: theme.surface, borderColor: theme.line }]}
  >
    <Ionicons name="arrow-back" size={22} color={theme.ink} />
  </Pressable>
}

const styles = StyleSheet.create({
  button: { width: 48, height: 48, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
})
