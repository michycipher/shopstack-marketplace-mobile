# CartUp Mobile

CartUp Mobile is the Lesson 3 React Native app for the existing CartUp marketplace. It uses Expo SDK 57, React Native 0.86, Expo Router and TypeScript.

## Run locally

1. Copy `.env.example` to `.env`.
2. Set `EXPO_PUBLIC_API_URL` to the deployed CartUp URL.
3. Add the Web Google OAuth client ID as `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.
4. Run `npm install` and `npm run start`.

The app includes the home experience, search and category filtering, product and store details, cart, checkout, Google sign-in, order history, light/dark theme support and mobile toast feedback.

## Shared account and cart

The mobile app sends the same Google ID token to CartUp's `/api/auth/google` route with `platform: "mobile"`. The server returns a signed mobile session token, which the app stores with SecureStore. Authenticated cart changes use `/api/cart` and are persisted in Neon, so the website and mobile app read the same cart. The app refreshes the shared cart when it becomes active and every eight seconds while signed in.

The shared API changes must be deployed before cross-device cart testing. Guest carts remain local to each device.

## Physical-phone test

The mobile app uses browser OAuth with Expo AuthSession. Add
`https://auth.expo.io/@michuo/cartup-mobile` as an Authorized redirect URI on
the Web Google OAuth client, then use a development build to validate the
redirect flow.

```bash
npx eas-cli@latest login
npx eas-cli@latest build --profile development --platform android
npx expo start --dev-client
```

Install the generated Android development build on the phone, sign in with the same Google account used on the website, add an item on the website, then open or foreground the mobile Cart tab. The item should appear after the shared cart refresh.

For iOS builds, run the equivalent EAS command from a macOS environment. No
native Google Sign-In SDK or iOS Keychain entitlement is required.

## Checks

```bash
npx tsc --noEmit
npm run lint
npx expo-doctor
npx expo export --platform web
```
