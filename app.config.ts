import type { ConfigContext, ExpoConfig } from 'expo/config'

export default ({ config }: ConfigContext): ExpoConfig => {
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim()
  const iosUrlScheme = iosClientId?.endsWith('.apps.googleusercontent.com')
    ? `com.googleusercontent.apps.${iosClientId.slice(0, -'.apps.googleusercontent.com'.length)}`
    : undefined
  if (process.env.EAS_BUILD_PLATFORM === 'ios' && !iosUrlScheme) {
    throw new Error('Set EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID in the EAS build environment before building iOS.')
  }
  return {
    ...config,
    name: config.name || 'CartUp Mobile',
    slug: config.slug || 'cartup-mobile',
    ios: { ...config.ios, usesAppleSignIn: true },
    plugins: [...(config.plugins || []).filter(plugin => !['expo-apple-authentication', '@react-native-google-signin/google-signin'].includes((typeof plugin === 'string' ? plugin : plugin[0]) || '')),
      'expo-apple-authentication',
      ...(iosUrlScheme ? [['@react-native-google-signin/google-signin', { iosUrlScheme }] as [string, { iosUrlScheme: string }]] : []),
    ],
  }
}
