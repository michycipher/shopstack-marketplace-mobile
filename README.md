# CartUp Mobile

CartUp Mobile is the Lesson 3 React Native app for the existing CartUp marketplace. It uses Expo SDK 57, React Native 0.86, Expo Router and TypeScript.

## Run locally

1. Copy `.env.example` to `.env`.
2. Set `EXPO_PUBLIC_API_URL` to the deployed CartUp URL.
3. Add the Google OAuth client IDs for the web, Android and iOS clients.
4. Run `npm install` and `npm run start`.

The app includes the home experience, search and category filtering, product and store details, cart, checkout, Google sign-in, order history, light/dark theme support and mobile toast feedback.

## Shared account and cart

The mobile app sends the same Google ID token to CartUp's `/api/auth/google` route with `platform: "mobile"`. The server returns a signed mobile session token, which the app stores with SecureStore. Authenticated cart changes use `/api/cart` and are persisted in Neon, so the website and mobile app read the same cart. The app refreshes the shared cart when it becomes active and every eight seconds while signed in.

The shared API changes must be deployed before cross-device cart testing. Guest carts remain local to each device.

## Physical-phone test

Expo's OAuth guidance requires a development build for a custom app scheme. Expo Go is not sufficient for validating the Google redirect flow.

```powershell
npx eas-cli@latest login
npx eas-cli@latest build --profile development --platform android
npx expo start --dev-client
```

Install the generated Android development build on the phone, sign in with the same Google account used on the website, add an item on the website, then open or foreground the mobile Cart tab. The item should appear after the shared cart refresh.

For iOS builds, run the equivalent EAS command from a macOS environment.

## Checks

```powershell
npx tsc --noEmit
npm run lint
npx expo-doctor
npx expo export --platform web
```
