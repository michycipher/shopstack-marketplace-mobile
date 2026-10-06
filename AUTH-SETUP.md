# Sign-in setup and device verification

Google native login now uses the Google Sign-In SDK on Android/iOS. Expo web
uses Google Identity Services in popup mode. Neither uses the old
`cartupmobile://oauth` authorization request.

## Google Cloud

- Use a Web OAuth client ID for `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`. It must
  match the API's `NUXT_GOOGLE_CLIENT_ID`.
- Web client > Authorized JavaScript origins: add the exact origins you open,
  for example `http://localhost:8081` for Expo web and
  `https://e-shop-woad-zeta.vercel.app` for the store. An origin has no path.
  Popup credential login does not require an `/oauth` redirect URI.
- Android client: package `com.michycipher.cartup`, with the SHA-1 of the
  certificate signing the installed APK. Configure each signing certificate
  used for development, release, or Google Play App Signing as needed. Obtain
  the development SHA-1 using `npx eas-cli@latest credentials -p android`.
  Keep this client in the same Google Cloud project as the Web client.
- iOS client: bundle identifier `com.michycipher.cartup`. Put its ID in
  `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`. `app.config.ts` derives the reversed iOS
  URL scheme from this ID at build time.
- Use External audience for public users. Publishing status is separate from
  a malformed redirect request; publishing cannot repair redirect mismatches.

## API and Apple

1. Apply `db/migrations/20261005_apple_auth.sql` in the web repository to Neon.
2. Deploy the web API changes. Set `NUXT_APPLE_CLIENT_ID=com.michycipher.cartup`.
3. Set `NUXT_MOBILE_WEB_ORIGINS` to a comma-separated list of exact allowed Expo
   web origins, including `http://localhost:8081` for local browser testing.
4. In Apple Developer > Identifiers > `com.michycipher.cartup`, ensure Sign in
   with Apple is enabled. EAS signing must include the entitlement. A physical
   iOS development build needs Apple Developer membership and device registration.

Apple tokens are verified by the API against Apple's public signing keys,
issuer, audience, expiry, and a one-use server challenge. Returning Apple users
are identified by Apple subject, including when Apple no longer supplies a name.
Apple private-relay email can create a different account from Google. The app
does not automatically link different providers; use Google on both devices for
the assignment's same-account cart test.

## Rebuild and test

Set the public API URL and Google client IDs in the selected EAS build environment
as well as local `.env`. Never put database passwords or server secrets in Expo.

```powershell
npx.cmd eas-cli@latest build --profile development --platform android
npx.cmd eas-cli@latest build --profile development --platform ios
npx.cmd expo start --dev-client --clear
```

Install the new builds: an already-installed build lacks the new native modules.
Expo Go cannot run native Google login.

For browser testing: `npx.cmd expo start --web --clear`.

Check on physical Android and iOS devices: Google login, cancel/retry, sign out,
restart and restore session, then add a website cart item while signed into the
same Google account and check the phone cart. On iOS additionally test Apple
sign-in, cancellation, returning user, and Hide My Email.
