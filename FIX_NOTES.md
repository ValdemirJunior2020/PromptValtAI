# PromptVault AI fix notes

## Main fixes applied

1. Added auth gating in `App.tsx`
   - App now shows `LoginScreen` when no Firebase user is signed in.
   - Prevents API calls with missing tokens.

2. Replaced hardcoded `http://localhost:3000`
   - Frontend now uses `EXPO_PUBLIC_API_BASE_URL` from `.env`.
   - File: `src/config.ts`

3. Hardened Firebase Auth initialization
   - Safer web/native auth setup in `src/lib/firebase.ts`.

4. Fixed backend token parsing and verification
   - Rejects missing/invalid bearer tokens with `401` instead of crashing.
   - File: `my-backend-server/server.js`

5. Added keyboard dismiss on generate
   - When user taps `Generate Magic`, the iPhone keyboard closes.
   - File: `src/screens/GeneratorScreen.tsx`

6. Added backend start scripts
   - File: `my-backend-server/package.json`

## What you must set before testing

### Frontend
Create a `.env` file in the project root:

```env
EXPO_PUBLIC_API_BASE_URL=https://YOUR-RENDER-SERVICE.onrender.com
```

### Backend on Render
Set these environment variables:

- `OPENAI_API_KEY`
- `OPENAI_MODEL=gpt-4o-mini`
- `CORS_ORIGIN=*`

Also make sure `firebase.json` in the project matches the same Firebase project used by the app:
- `agents-name`

## Important
If your current Render deployment still runs the old server code, the app will still fail until you redeploy the backend.
