# Demo App: Features per Phase Branch

Each phase is saved on its own git branch, and each one builds on the phase before it.
Switch with `git checkout phase-N`, then run `npm install` if the dependencies changed.

```
main ── phase-1 ── phase-2 ── phase-3 ── phase-4 ── phase-5            (likes)
                                            └── phase-5-comments       (comments, alternative)
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
| `phase-5-comments` | Comments instead of likes: add / edit / delete your own comments | `api/commentApi.ts`, `components/CommentModal.tsx`, `components/CommentsSection.tsx`, `components/PhotoCamera.tsx` | expo-image-picker, expo-camera |

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

## `phase-5-comments`: Comments (alternative to `phase-5`)

Branches off an earlier Phase 4 commit, so it uses `components/PhotoCamera.tsx`
instead of `ImageSelector.tsx`. Follows the Session 6 approach.

- [x] `comments: string[]` on `PostData`, plus `CommentData` / `CommentObject` types
- [x] `api/commentApi.ts`: `addComment`, `getCommentsByIds`, `updateComment`, `deleteComment`, `deleteCommentsByIds`
- [x] `components/CommentModal.tsx`: one popup for adding and editing
- [x] `components/CommentsSection.tsx`: list, **+ Add comment**, edit / delete icons on your own comments
- [x] Deleting a post also deletes its comments
- [x] Optimistic updates; ownership is checked by UID

---

## Coming next

- [ ] **Phase 6:** Firestore / Storage security rules and a concepts guide
