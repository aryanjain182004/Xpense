# Build Xpense APK (friend’s laptop)

## Before you start

1. **Edit `.env`** (copy from `.env.example` if `.env` is missing):
   ```bash
   cp .env.example .env
   ```
   Set `EXPO_PUBLIC_API_URL` to your real backend, e.g. `https://xpense-api-xxxx.onrender.com` (no `/` at the end).

2. **On Render (backend)** set:
   - `FRONTEND_URL` = `xpenseui://`
   - Google OAuth redirect URI includes: `https://YOUR-API/login/oauth2/code/google`

## Build steps

```bash
cd Xpense-UI
npm install
npx eas-cli@latest login
npx eas-cli@latest build:configure   # first time only — accept defaults
npx eas-cli@latest build -p android --profile preview
```

- Profile `preview` produces an **APK** (install file), not Play Store bundle.
- First build: Expo creates an Android signing key — choose **Let Expo handle it**.
- When finished, open the link in the terminal or on [expo.dev](https://expo.dev) → your project → **Builds** → download **.apk**.

## Install on phone

Download the APK on the Android phone → open it → allow install if prompted → open **Xpense**.

## Troubleshooting

| Problem | Fix |
|--------|-----|
| “Cannot reach server” | Wrong `EXPO_PUBLIC_API_URL` in `.env`; rebuild APK after fixing |
| Google login stuck in browser | Set `FRONTEND_URL=xpenseui://` on Render |
| Build asks for Expo account | Free account at expo.dev |
