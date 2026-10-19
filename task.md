# Demo App: Features per Phase Branch

Each phase is saved on its own git branch, and each one builds on the phase before it.
Switch with `git checkout phase-N`, then run `npm install` if the dependencies changed.

```
main ── phase-1 ── phase-2 ── phase-3 ── phase-4 ── phase-5            (likes)
                                            
```

## Overview

| Branch | Feature | New files | New packages |
|--------|---------|-----------|--------------|
| `main` | Starting point: project setup, navigation, create-post popup | — | expo-router, @expo/vector-icons, firebase, async-storage |
| `phase-1` | Same as `main`, but the detail route is `postDetails/[id]` | — | — |
| `phase-2` | Firebase email/password authentication and an auth guard | `api/authApi.ts`, `context/AuthContext.tsx`, `README.md` | — |
| `phase-3` | Posts saved in Firestore: list, details, delete your own post | `api/postApi.ts`, `components/PostCard.tsx`, `utils/postData.ts` | — |
| `phase-4` | A photo on every post (gallery or camera), uploaded to Firebase Storage | `api/imageApi.ts`, `components/ImageSelector.tsx` | expo-image-picker, expo-camera, expo-device |
| `phase-5` | Likes: like / unlike, like count on Home, "Liked by" on the detail page | — | — |

---

## Create the project from scratch (how `phase-1` was made)

### 1. Create a blank TypeScript project

```bash
npx create-expo-app@latest demo-app --template blank-typescript@sdk-57
cd demo-app
```

`@sdk-57` pins Expo SDK 57, the version this app uses. Without it you get the newest SDK,
which may not run in your Expo Go app.

The template creates these files:

```
.gitignore   AGENTS.md   LICENSE
App.tsx                 index.ts     app.json    package.json   tsconfig.json
assets/  (icon.png, splash-icon.png, favicon.png, android-icon-*.png)
```

### 2. Delete the files we don't need

Expo Router finds the screens in the `app/` folder, so the template's own entry
files are no longer used:

```bash
rm App.tsx index.ts LICENSE
```

| File | Why it goes |
|------|-------------|
| `App.tsx` | The single screen of a non-router app. Screens now live in `app/` |
| `index.ts` | Calls `registerRootComponent(App)`. Expo Router has its own entry (`expo-router/entry`) |
| `LICENSE` | Not needed for a class project |

Keep `assets/`, `app.json`, `tsconfig.json`, `.gitignore` and `AGENTS.md`.

### 3. Install the packages

Always use `npx expo install` (not `npm install`), so the versions match the SDK:

```bash
# Expo Router and the packages it needs (web support included)
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar react-dom react-native-web

# Icons for the tab bar
npx expo install @expo/vector-icons expo-font

# Firebase, and AsyncStorage so the user stays signed in (used from Phase 2)
npx expo install firebase @react-native-async-storage/async-storage
```

### 4. Change the config files

**`package.json`**: point the entry at Expo Router:

```json
"main": "expo-router/entry",
```

**`app.json`**: give the app a name, a deep-link `scheme`, the router plugin and typed routes:

```json
{
  "expo": {
    "name": "Demo App",
    "slug": "demo-app",
    "scheme": "demoapp",
    "web": { "bundler": "metro", "favicon": "./assets/favicon.png" },
    "plugins": ["expo-router", "expo-status-bar", "expo-font"],
    "experiments": { "typedRoutes": true }
  }
}
```

(Keep the other keys the template created: `version`, `icon`, `ios`, `android`, …)

**`tsconfig.json`**: add the `@/` import alias and include Expo Router's generated route types:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": { "@/*": ["./*"] }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

Now you can write `import PostForm from "@/components/PostForm"` instead of `"../../components/PostForm"`.

**`.gitignore`**: add `.env` at the bottom, so the real Firebase keys are never committed:

```
.env
```

### 5. Add the Firebase setup

- `.env.example`: the `EXPO_PUBLIC_FIREBASE_*` variable names with placeholder values.
  Each student copies it to `.env` and fills in their own values.
- `firebaseConfig.ts`: `initializeApp` with the values from `process.env`, and exports
  `db`, `storage` and `auth` (AsyncStorage persistence on phones, `getAuth` on web).

### 6. Create the Phase 1 screens and components

```
app/
  _layout.tsx                  root Stack: "auth" and "(protected)"
  auth.tsx                     placeholder sign-in screen with a "Continue" button
  (protected)/
    _layout.tsx                Stack for the signed-in part of the app
    (tabs)/
      _layout.tsx              Tabs: Home and Profile
      index.tsx                Home: post list + "+" button that opens PostForm
      profile.tsx              Profile
    postDetails/
      [id].tsx                 one post (dynamic route)
components/
  PostForm.tsx                 create-post popup (<Modal>)
```

### 7. Run it and commit

```bash
npx expo start -c        # scan the QR code with Expo Go, or press w for web
npx tsc --noEmit         # check for TypeScript errors

git init
git add -A
git commit -m "Phase 1: project setup, navigation and PostForm modal"
git switch -c phase-1
```

Every later phase starts from the previous branch: `git switch -c phase-2` while on `phase-1`, and so on.

---

## Config files explained

### `.env` and `.env.example`

`.env` holds the settings that are **different for every student**: the values of your own
Firebase project. The app reads them when it starts, so the code never contains them.

```
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

| Variable | What it is |
|----------|------------|
| `API_KEY` | Identifies your Firebase project when the app talks to Google's servers |
| `AUTH_DOMAIN` | The domain Firebase Authentication uses (`<project-id>.firebaseapp.com`) |
| `PROJECT_ID` | The name of your project. Firestore uses it to find your database |
| `STORAGE_BUCKET` | Where Firebase Storage keeps your uploaded images |
| `MESSAGING_SENDER_ID` | Used by Firebase Cloud Messaging (we don't use it, but it is part of the config) |
| `APP_ID` | Identifies this web app inside your Firebase project |

You find all six in **Firebase console → Project settings → Your apps → Web app → SDK setup and configuration**.

Things to know:

- **Two files, two jobs.** `.env.example` is committed to git and only has placeholders,
  so everyone knows *which* variables are needed. `.env` has the real values and is in
  `.gitignore`, so it is never committed. Start with `cp .env.example .env`.
- **The `EXPO_PUBLIC_` prefix is required.** Expo only puts variables that start with
  `EXPO_PUBLIC_` into the app code (`process.env.EXPO_PUBLIC_...`). Other variables are ignored.
- **Restart with `npx expo start -c` after changing `.env`.** The values are copied into
  the app when it is bundled, and `-c` clears the old bundle.
- **These values are not really secret.** Everything with `EXPO_PUBLIC_` ends up inside the
  app, and anyone could read it there. What actually protects your data is
  **Firebase Authentication + Security Rules** (Phase 6). We still keep `.env` out of git
  so each student uses their own project and the keys aren't spread around online.

### `firebaseConfig.ts`

This file connects the app to Firebase **once**, and every other file imports what it needs from here:

```ts
import { db, storage, auth } from "@/firebaseConfig";
```

What it does, step by step:

1. **Builds the config object** from `.env`:
   ```ts
   const firebaseConfig = {
     apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
     projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
     // ... the other four
   };
   ```
2. **Connects to the project:** `const app = initializeApp(firebaseConfig);`
3. **Creates the three services the app uses:**

   | Export | Service | Used in |
   |--------|---------|---------|
   | `auth` | Firebase Authentication (who is signed in) | Phase 2: `api/authApi.ts`, `context/AuthContext.tsx` |
   | `db` | Firestore database (posts, likes, comments) | Phase 3: `api/postApi.ts` |
   | `storage` | Firebase Storage (image files) | Phase 4: `api/imageApi.ts` |

4. **Keeps the user signed in after a restart.** This is the only tricky part:

   ```ts
   function createAuth() {
     if (Platform.OS === "web") {
       return getAuth(app);
     }
     const { getReactNativePersistence } = require("@firebase/auth/dist/rn/index.js");
     return initializeAuth(app, {
       persistence: getReactNativePersistence(AsyncStorage),
     });
   }
   ```

   - **On web**, `getAuth(app)` already saves the session in the browser's `localStorage`.
   - **On a phone**, there is no `localStorage`. Without help, Firebase forgets the user
     every time the app restarts. `initializeAuth(..., getReactNativePersistence(AsyncStorage))`
     tells Firebase to save the session in **AsyncStorage** (the phone's key-value storage) instead.
   - **Why `require(...)` instead of `import`?** `getReactNativePersistence` only exists in
     Firebase's React Native build. Loading it with `require` *inside* the `if` means the web
     version of the app never tries to load it.

Why one shared file? If every screen called `initializeApp` itself, Firebase would complain
that the app is already initialized, and different screens could end up with different
`auth` objects that disagree about who is signed in.

### `app.json`

`app.json` describes the app to Expo: its name, icons, and which native features it uses.
It is read when the app is **built or started**, not while it runs.

```json
{
  "expo": {
    "name": "Demo App",
    "slug": "demo-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "ios": { "supportsTablet": true },
    "android": { "adaptiveIcon": { "...": "..." }, "predictiveBackGestureEnabled": false },
    "web": { "bundler": "metro", "favicon": "./assets/favicon.png" },
    "plugins": ["expo-router", "expo-status-bar", "expo-font"],
    "scheme": "demoapp",
    "experiments": { "typedRoutes": true }
  }
}
```

| Key | What it does |
|-----|--------------|
| `name` | The name shown under the app icon |
| `slug` | A URL-friendly name Expo uses for the project (no spaces) |
| `version` | The version number users see in the app store |
| `orientation` | `"portrait"` locks the app upright |
| `icon` | The app icon (`assets/icon.png`) |
| `userInterfaceStyle` | `"light"` always uses light mode (no automatic dark mode) |
| `ios.supportsTablet` | The app can also run full-screen on iPad |
| `android.adaptiveIcon` | Android icon layers, so the icon fits any shape (circle, square, …) |
| `android.predictiveBackGestureEnabled` | Turns off Android's new "peek back" gesture animation |
| `web.bundler` | `"metro"` uses the same bundler for web as for phones (needed by Expo Router) |
| `web.favicon` | The small icon in the browser tab |
| `plugins` | Packages that need to change the native app setup (see below) |
| `scheme` | `demoapp://` links open this app. Expo Router needs a scheme for deep links |
| `experiments.typedRoutes` | Expo Router writes types for all routes, so a typo like `href="/aut"` is a TypeScript error |

**Plugins grow with the phases.** Phase 4 adds two plugins with the text shown when the app
asks for permission:

```json
["expo-image-picker", {
  "photosPermission": "Allow $(PRODUCT_NAME) to choose photos for your posts.",
  "microphonePermission": false
}],
["expo-camera", {
  "cameraPermission": "Allow $(PRODUCT_NAME) to take photos for your posts.",
  "microphonePermission": false,
  "recordAudioAndroid": false
}]
```

`$(PRODUCT_NAME)` is replaced by the app's name. `microphonePermission: false` means
we never ask for the microphone, because we only take photos, not videos.

> In **Expo Go** you can test without these plugins, because Expo Go already has the
> permissions. They matter when you make your own build (`npx expo run:ios` or `eas build`).

---

## `main` / `phase-1`: Project setup and navigation

No Firebase features yet.

- [x] Expo SDK 57 + TypeScript, `"main": "expo-router/entry"`
- [x] Root **Stack** (`app/_layout.tsx`) with the `auth` and `(protected)` screens
- [x] Placeholder sign-in screen (`app/auth.tsx`) with a "Continue" button
- [x] **Tabs** with Home and Profile (`app/(protected)/(tabs)/_layout.tsx`)
- [x] Dynamic route for one post: `app/(protected)/postDetails/[id].tsx`
      (on `main` it is still called `post/[id].tsx`)
- [x] Create-post popup `components/PostForm.tsx` (`<Modal>`), opened by the **+** button on Home
- [x] New posts are kept only in state, so they disappear on reload
- [x] `firebaseConfig.ts` reads the `EXPO_PUBLIC_*` variables (no screen uses it yet)

## `phase-2`: Authentication

- [x] `api/authApi.ts`: sign in, register (saves the name with `updateProfile`), sign out, friendly error messages
- [x] `context/AuthContext.tsx`: `AuthProvider` + `useAuth()` sharing `{ user, loading }`
- [x] Auth guard in `app/(protected)/_layout.tsx`: shows a spinner while loading, redirects to `/auth` when there is no user
- [x] `app/auth.tsx`: Sign in / Register toggle, name field when registering, error text, spinner
- [x] Profile shows the user's name and email and has a **Sign out** button
- [x] Stays signed in after a restart (AsyncStorage persistence)

## `phase-3`: Posts in Firestore

- [x] `utils/postData.ts`: `PostData` and `NewPostData` types
- [x] `api/postApi.ts`: `createPost`, `getAllPosts` (newest first), `getPostById`, `deletePost`
- [x] `components/PostCard.tsx`: one post in the list, linking to the detail page
- [x] Home loads posts in `useFocusEffect`, with pull-to-refresh (`RefreshControl`)
- [x] `PostForm` shows a spinner while saving and stays open if saving fails
- [x] Detail page shows the title, author, date and description; **Delete post** only for the author
- [x] Author is taken from `auth.currentUser`, never typed into the form

## `phase-4`: Images

- [x] `components/ImageSelector.tsx`: **Gallery** (`expo-image-picker`) or **Camera** (`expo-camera` in its own Modal)
- [x] Camera permission with `useCameraPermissions`, shutter via `useRef` + `takePictureAsync()`
- [x] "Camera unavailable on simulator" message (`expo-device`)
- [x] Camera also works in the browser (`data:` URLs are handled)
- [x] `api/imageApi.ts`: `uploadImage` to `posts/{uid}/{time}.jpg` in Firebase Storage, returns the download URL
- [x] Upload first, then save the post with `imageUrl`; a photo is required
- [x] Image shown on Home cards and on the detail page

## `phase-5`: Likes

- [x] `Like` type `{ uid, name }` and `likes: Like[]` on `PostData`
- [x] `toggleLike` with `arrayUnion` / `arrayRemove`
- [x] Home card: heart + count (gray when nobody has liked the post, red when someone has)
- [x] Detail page: Like button (filled when *you* liked it), "N likes", "Liked by Ada, Bob"
- [x] Optimistic update, rolled back if saving fails
- [x] `post.likes ?? []` for older posts without a `likes` field


