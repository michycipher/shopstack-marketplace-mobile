import type { ConfigContext, ExpoConfig } from 'expo/config'

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    name: config.name || 'CartUp Mobile',
    slug: config.slug || 'cartup-mobile',
    ios: { ...config.ios },
  }
}
