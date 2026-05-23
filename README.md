# GhostLlc

GhostLlc is a React + Vite application for gaming account browsing, community discovery, and user account management. It is built with React 19, Vite 6, Tailwind CSS 4, Firebase authentication + Firestore, and modern React routing.

## What this app does

- Provides a login experience for users to access account-related features.
- Supports email/password sign-in, Google sign-in, and guest access via "Free Login as Guest".
- Includes pages for browsing categories, viewing account details, community content, and managing user settings.
- Uses Firebase for auth and optional user data storage.

## Highlights

- Guest access: visitors can bypass the auth stage and browse the application as guest users without saved profile data.
- Auth-context wrapper: manages Firebase auth state and route guarding.
- Modern responsive UI using Tailwind-style utility classes.

## Folder structure

- `src/App.jsx` — main app router and layout.
- `src/components/AuthContext.jsx` — auth provider and state management.
- `src/components/ProtectedRoute.jsx` — route guard for authenticated access.
- `src/pages/AccountLogin.jsx` — login page with guest login support.
- `src/database/firebaseConfig.js` — Firebase app initialization.
- `src/pages/*` — application pages.
- `src/components/*` — reusable UI components and auth helpers.
- `src/styles/*` — custom CSS for app styling.

## Local setup

1. Install dependencies

```bash
npm install
```

2. Create a `.env` file in the project root and add the Firebase environment variables:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_API_URL=https://your-api.example.com
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
```

3. Start the development server

```bash
npm run dev
```

4. Open the app in the browser at the URL shown in the terminal, usually `http://localhost:5173`.

## Useful scripts

- `npm run dev` — start development server with hot reload.
- `npm run build` — create a production build.
- `npm run preview` — locally preview the production build.
- `npm run lint` — run ESLint across the source files.

## Developer notes

- Login is handled in `src/pages/AccountLogin.jsx`.
- Guest users are authenticated anonymously via Firebase and treated as `currentUser` so protected routes work.
- The auth context is responsible for redirecting users to the correct page based on auth state.
- If you need to add new protected pages, include them under the `<ProtectedRoute />` wrapper in `src/App.jsx`.

## Troubleshooting

- If auth fails, verify your Firebase config values in `.env`.
- If routes unexpectedly redirect to `/login`, clear local storage and refresh.
- For UI issues, confirm Tailwind is configured and the Vite dev server is running.

## Recommended workflow

- Develop with the Vite dev server running.
- Keep Firebase environment variables out of source control.
- Use the existing `AuthContext` and route structure for new auth-aware pages.
