import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react'
import { useColorScheme } from 'react-native'

const light = {
  background: '#F7F8FA', surface: '#FFFFFF', ink: '#101828', muted: '#667085', line: '#E4E7EC', yellow: '#FBBF24', blue: '#1455D9', softBlue: '#EAF1FF', green: '#079455', danger: '#D92D20', darkNavy: '#14213D', tab: '#FFFFFF', shadow: '#101828',
}
const dark = {
  background: '#0E1628', surface: '#16233B', ink: '#F8FAFC', muted: '#A7B2C7', line: '#2E3E59', yellow: '#FBBF24', blue: '#78A6FF', softBlue: '#213B6C', green: '#5BD49A', danger: '#FF8E8E', darkNavy: '#0A1222', tab: '#121E34', shadow: '#000000',
}

type Theme = typeof light
type ThemeContextValue = { theme: Theme; isDark: boolean; toggle: () => void }
const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: PropsWithChildren) {
  const system = useColorScheme()
  const [override, setOverride] = useState<boolean | null>(null)
  const isDark = override ?? system === 'dark'
  const value = useMemo(() => ({ theme: isDark ? dark : light, isDark, toggle: () => setOverride(current => !(current ?? isDark)) }), [isDark])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const value = useContext(ThemeContext)
  if (!value) throw new Error('useTheme must be used inside ThemeProvider')
  return value
}
