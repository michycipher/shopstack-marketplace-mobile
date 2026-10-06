# Sign-in setup and device verification

CartUp uses browser-based Google OAuth on iOS and Android. The system browser
handles the Google account screen, then returns a short-lived authorization
ID token to the app. The app sends that web-audience token to CartUp's API.
This avoids the native Google Sign-In SDK and its Google authorization-state
Keychain requirement. Expo web continues to use Google Identity Services in
popup mode.

## Google Cloud

- Use a Web OAuth client ID for `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`. It must
  match the API's `NUXT_GOOGLE_CLIENT_ID`.
- Add this exact value under **Authorized redirect URIs** for that Web client:
  `https://auth.expo.io/@michuo/cartup-mobile`
- Add each web origin you open under **Authorized JavaScript origins**, such as
  `http://localhost:8081` for Expo web and
  `https://e-shop-woad-zeta.vercel.app` for the store. An origin has no path.
- Android and iOS client IDs are no longer used by the mobile app. They may
  remain in Google Cloud for other clients, but they do not fix this browser
  flow.
- Use an External audience for public users. Publishing status is separate from
  an invalid redirect URI or client ID mismatch.

## API and provider

The mobile app exposes Google Sign-In only. The API receives the same web ID
token at `/api/auth/google` with `platform: "mobile"` and returns a signed
mobile session token. The API's Apple endpoint can remain for other clients,
but this app has no Apple button, native Apple module, or Apple entitlement.

## Rebuild and test

Set `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` in local `.env`
and in the selected EAS environment. These are public client settings; never
put database passwords or server secrets in Expo.

```bash
npm install
npx expo prebuild --clean
npx expo run:ios
# or, for an EAS development build:
npx eas-cli@latest build --profile development --platform ios
npx expo start --dev-client --clear
```

Install the newly built app before testing. The browser OAuth flow can run in a
development build without native Google URL schemes or Keychain access. Expo
Go is not a reliable target for the final redirect; use the CartUp development
build from Xcode or EAS.

Test Google login, cancel/retry, sign out, restart and session restore. Then
sign in with the same Google account on the website, add an item, and confirm
that the phone cart refreshes from the shared API.

For web testing:

```bash
npx expo start --web --clear
```
