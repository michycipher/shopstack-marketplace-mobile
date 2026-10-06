import * as SecureStore from 'expo-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'

const TOKEN_KEY = 'cartup-mobile-session'

export const sessionStorage = {
  async get() {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY)
    } catch (error) {
      if (!__DEV__) throw error
      return AsyncStorage.getItem(TOKEN_KEY)
    }
  },
  async set(token: string) {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token)
    } catch (error) {
      if (!__DEV__) throw error
      await AsyncStorage.setItem(TOKEN_KEY, token)
    }
  },
  async remove() {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY)
    } catch (error) {
      if (!__DEV__) throw error
    }
    if (__DEV__) await AsyncStorage.removeItem(TOKEN_KEY)
  },
}
