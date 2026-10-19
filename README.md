# Demo App

A small Expo + Firebase app that pulls together what Sessions 1–9 teach:
navigation, a form popup, Firebase Authentication, and (in later phases)
Firestore posts, images and comments.

The app is built step by step. Each phase is saved on its own git branch,
so you can look at the code as it was after any phase.

| Branch    | What it adds |
|-----------|--------------|
| `phase-1` | Project setup, navigation, create-post popup (local only) |
| `phase-2` | Sign in / register / sign out with Firebase Authentication |

```bash
git checkout phase-1   # look at Phase 1
git checkout phase-2   # look at Phase 2
npm install            # run again if the dependencies changed
```

---

## Run the app

You need **Node.js** and the **Expo Go** app on your phone (it must support Expo SDK 57).

1. Install the dependencies:
   ```bash
   npm install
   ```
2. Set up Firebase (from Phase 2, see below).
3. Start the dev server:
   ```bash
   npx expo start -c
   ```
4. Scan the QR code with Expo Go (Android) or the Camera app (iPhone).
   Press `w` in the terminal to open it in the browser instead.

`-c` clears the cache. Use it every time you change `.env`.

---

## Firebase setup (needed from Phase 2)

1. Go to the [Firebase console](https://console.firebase.google.com) and create a project.
2. In **Project settings → Your apps**, add a **Web app** (`</>`).
3. Copy `.env.example` to a new file called `.env`, then fill in the values from
   the web app's config:
   ```bash
   cp .env.example .env
   ```
4. In **Authentication → Sign-in method**, enable **Email/Password**.

`.env` is listed in `.gitignore`, so it is never committed. Only `.env.example`
(with placeholder values) is in git.

---

## Phase 1: Project setup and navigation

**Goal:** an app you can click through, with no Firebase yet.

- Created with `npx create-expo-app@latest demo-app --template blank-typescript`
  (Expo SDK 57, React Native 0.86, React 19, TypeScript).
- `package.json` uses `"main": "expo-router/entry"`, so Expo Router handles navigation.
  All packages were added with `npx expo install`, which picks versions that match the SDK.
- **Navigation** (file-based routing with Expo Router):
  - `app/_layout.tsx`: the root **Stack** with two screens, `auth` and `(protected)`.
  - `app/auth.tsx`: a placeholder login screen with a "Continue" button.
  - `app/(protected)/(tabs)/_layout.tsx`: **Tabs** with **Home** and **Profile** (AntDesign icons).
  - `app/(protected)/postDetails/[id].tsx`: a **dynamic route** for one post.
    It is pushed on top of the tabs, so the tab bar hides and a Back button appears.
- **Create-post popup:** `components/PostForm.tsx` is a React Native `<Modal>`
  (`animationType="slide"`, `presentationStyle="pageSheet"`) with a title and a description.
  The **+** button (FAB) on Home opens it. The title is required.
- New posts are only kept in the Home screen's state, so they disappear on reload.
  Phase 3 saves them in Firestore.
- `firebaseConfig.ts` is written (it reads the `EXPO_PUBLIC_*` values from `.env`),
  but no screen uses it yet.

## Phase 2: Authentication

**Goal:** only signed-in users can use the app.

| File | What it does |
|------|--------------|
| `api/authApi.ts` | `signInWithEmail`, `signUpWithEmail` (also saves the name with `updateProfile`), `signOutUser`, and friendly error messages for Firebase error codes |
| `context/AuthContext.tsx` | `AuthProvider` listens to `onAuthStateChanged` and shares `{ user, loading }`. Screens read it with `useAuth()` |
| `app/_layout.tsx` | Wraps the root Stack in `<AuthProvider>` |
| `app/(protected)/_layout.tsx` | **Auth guard:** shows a spinner while `loading`, `<Redirect href="/auth" />` if there is no user, otherwise the screens |
| `app/auth.tsx` | Sign in / Register toggle, email and password fields (plus name when registering), error text, spinner while waiting |
| `app/(protected)/(tabs)/profile.tsx` | Shows the user's name and email, and a **Sign out** button |

How the screens change, without any `router.push` calls:

- **Signing in or registering** sets `user` in `AuthContext`. The login screen
  sees `user` and renders `<Redirect href="/" />`, which goes to Home.
- **Signing out** sets `user` to `null`. The guard in `app/(protected)/_layout.tsx`
  renders `<Redirect href="/auth" />`.
- **Restarting the app:** `firebaseConfig.ts` saves the session with AsyncStorage
  (localStorage on web), so you stay signed in.

### Try it

- [ ] When signed out, you only see the login screen
- [ ] Register with a name, which takes you to Home. Profile shows your name and email
- [ ] Close and reopen the app, and you are still signed in
- [ ] Sign out, which takes you back to login
- [ ] A wrong password shows "Incorrect email or password."

---

## Coming next

- **Phase 3:** save and load posts in Firestore, show the post details, delete your own post
- **Phase 4:** pick or take a photo and upload it to Firebase Storage
- **Phase 5:** comments (add, edit and delete your own)
- **Phase 6:** security rules and a concepts guide
