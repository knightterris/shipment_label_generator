# Firebase connection and setup

The label editor, preview, Print and Download work without a database. Save and Saved shipments use **Firebase Authentication + Realtime Database**. MongoDB is not included in this version.

## 1. Run the app

Install Node.js 22 or later. Extract the source ZIP, open a terminal in the extracted folder, then run:

```sh
npm install
npm run dev
```

Open the URL printed by Vite. Keep the terminal running.

## 2. Create Firebase resources

1. Open https://console.firebase.google.com/ and select your existing `shipping-labels-b683d` project.
2. Your supplied web app configuration is already included in `src/firebase-config.js`. No new web app is required.
3. Use your existing Realtime Database at `https://shipping-labels-b683d-default-rtdb.firebaseio.com/`. No Firestore database is needed.
4. In Realtime Database → Rules, replace the rules with the supplied `database.rules.json` and click Publish. These rules only let each signed-in account read and create its own shipment batches. No public database access is required.
5. In Authentication → Sign-in method, enable **Email/Password**.
6. In Authentication → Users, use **Add user** to create your own email/password account. There is no public sign-up screen in this app.
7. In Authentication → Settings → Authorized domains, add your deployed app domain. Add `localhost` and `127.0.0.1` for local development if they are not listed.

## 3. Configuration is already included

The app uses your supplied configuration by default. You can skip this section and run the app without creating an environment file. To connect a DIFFERENT Firebase project later, copy `.env.example` to `.env.local` next to `package.json` and replace ALL placeholder values. On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Only when overriding the included project configuration, fill in all five settings for the target project:

```dotenv
VITE_FIREBASE_API_KEY=your-web-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=your-web-app-id
VITE_FIREBASE_DATABASE_URL=https://shipping-labels-b683d-default-rtdb.firebaseio.com/
```

These are web app configuration values, not a Firebase Admin service-account key. Do not place service-account JSON, private keys, or database passwords in frontend source. Realtime Database security rules and authentication protect the saved records.

Stop and restart `npm run dev` after editing the environment file. Vite reads these values at startup/build time.

## 4. Save and reopen shipments

1. Click **Saved shipments** and sign in with the account created above.
2. Close the panel, fill out your labels, and click **Save** in the top-right corner.
3. Every Save creates a new snapshot of the current batch, including sender/receiver details, orders, notes, and logo. Existing batches are preserved.
4. The list opens after saving. Click **Open** to load a saved batch into the editor, then edit, print, or download it. Opening a batch replaces the current unsaved editor contents, so save those first if needed.
5. Click **Sign out** in the library when finished on a shared device. Editor contents remain until the page is refreshed.

Records are stored at `users/{uid}/shipmentBatches/{batchId}`. Batches belong to the signed-in account and are not shared between different accounts.

## 5. Deploy

The included configuration is used automatically. Optional `VITE_FIREBASE_*` build environment values can override it. Run `npm run build` and publish `dist/` to a static host such as Firebase Hosting, Netlify, or Vercel. For Firebase Hosting, use `dist` as the public directory. Rebuild and redeploy after configuration changes. No Node server is needed in production.

## Notes and troubleshooting

- Saving requires an internet connection and configured Firebase resources. Without them, the panel shows setup guidance rather than pretending data was saved.
- This app uses an 850 KB batch size limit to keep uploads and library loading manageable. If you see a size message, use a small logo or split the labels into smaller batches.
- `permission-denied`: publish the supplied rules and confirm you are signed in.
- Sign-in failed: verify Email/Password is enabled, the user exists, and all four environment values belong to the same Firebase project.
- Empty list: ensure you are using the same Firebase account and project as when saving.
- Each save is a new snapshot; this version does not overwrite or delete historical records.
- Your complete web configuration and database URL are included. The production build has been checked; live sign-in and save/load still require your Firebase account, enabled Email/Password authentication, and published database rules. Those remote settings have not been verified.

Official references: https://firebase.google.com/docs/web/setup and https://firebase.google.com/docs/database/security/rules-conditions


