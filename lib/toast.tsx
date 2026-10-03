import { createContext, useCallback, useContext, useState, type PropsWithChildren } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from './theme'

type Toast = { id: number; message: string; kind: 'success' | 'error' | 'info' }
type ToastContextValue = { show: (message: string, kind?: Toast['kind']) => void }
const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<Toast[]>([])
  const show = useCallback((message: string, kind: Toast['kind'] = 'success') => {
    const id = Date.now()
    setItems(current => [...current, { id, message, kind }].slice(-3))
    setTimeout(() => setItems(current => current.filter(item => item.id !== id)), 3200)
  }, [])
  return <ToastContext.Provider value={{ show }}>{children}<ToastStack items={items} /></ToastContext.Provider>
}

function ToastStack({ items }: { items: Toast[] }) {
  const { theme } = useTheme()
  return <View pointerEvents="none" style={styles.stack}>{items.map(item => <View key={item.id} style={[styles.toast, { backgroundColor: theme.surface, borderColor: theme.line }]}><Ionicons name={item.kind === 'success' ? 'checkmark-circle' : item.kind === 'error' ? 'alert-circle' : 'information-circle'} size={20} color={item.kind === 'success' ? theme.green : item.kind === 'error' ? theme.danger : theme.blue} /><Text style={[styles.toastText, { color: theme.ink }]}>{item.message}</Text></View>)}</View>
}

export function useToast() {
  const value = useContext(ToastContext)
  if (!value) throw new Error('useToast must be used inside ToastProvider')
  return value
}

const styles = StyleSheet.create({ stack: { position: 'absolute', left: 16, right: 16, bottom: 28, gap: 8, zIndex: 20 }, toast: { minHeight: 50, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 9, shadowColor: '#000', shadowOpacity: .15, shadowRadius: 16, shadowOffset: { width: 0, height: 7 }, elevation: 6 }, toastText: { flex: 1, fontSize: 13, fontWeight: '600' } })
