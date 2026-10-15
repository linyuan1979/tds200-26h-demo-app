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
| `phase-3` | Posts saved in Firestore: list, details, delete your own post |
| `phase-4` | A photo on every post: gallery or camera, uploaded to Firebase Storage |

```bash
git checkout phase-1   # look at Phase 1
git checkout phase-4   # look at Phase 4
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
5. (Phase 3) In **Firestore Database**, click **Create database**. In the **Rules** tab, paste
   these temporary rules and click **Publish**:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
   This means "any signed-in user can read and write everything", which is fine while you
   are learning. Phase 6 replaces it with stricter rules (for example, only the author can
   delete a post).
6. (Phase 4) In **Storage**, click **Get started**. In the **Rules** tab, paste and **Publish**:
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
   ⚠️ New Firebase projects need the **Blaze (pay-as-you-go)** plan to use Storage. There is
   still a free monthly quota, and this app compresses photos (`quality: 0.5`), so normal class
   use stays free. Set a **budget alert** in the Google Cloud console to be safe.

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
  - `app/_layout.tsx`: the root **Stack** with two screens, `login` and `(protected)`.
  - `app/login.tsx`: a placeholder login screen with a "Continue" button.
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
| `app/(protected)/_layout.tsx` | **Auth guard:** shows a spinner while `loading`, `<Redirect href="/login" />` if there is no user, otherwise the screens |
| `app/login.tsx` | Sign in / Register toggle, email and password fields (plus name when registering), error text, spinner while waiting |
| `app/(protected)/(tabs)/profile.tsx` | Shows the user's name and email, and a **Sign out** button |

How the screens change, without any `router.push` calls:

- **Signing in or registering** sets `user` in `AuthContext`. The login screen
  sees `user` and renders `<Redirect href="/" />`, which goes to Home.
- **Signing out** sets `user` to `null`. The guard in `app/(protected)/_layout.tsx`
  renders `<Redirect href="/login" />`.
- **Restarting the app:** `firebaseConfig.ts` saves the session with AsyncStorage
  (localStorage on web), so you stay signed in.

### Try it

- [ ] When signed out, you only see the login screen
- [ ] Register with a name, which takes you to Home. Profile shows your name and email
- [ ] Close and reopen the app, and you are still signed in
- [ ] Sign out, which takes you back to login
- [ ] A wrong password shows "Incorrect email or password."

## Phase 3: Posts in Firestore

**Goal:** posts are saved in the cloud, so every user and device sees them.

| File | What it does |
|------|--------------|
| `types/post.ts` | `PostData` (a post read from Firestore) and `NewPostData` (what the form sends) |
| `api/postApi.ts` | `createPost`, `getAllPosts` (newest first), `getPostById`, `deletePost` |
| `components/PostCard.tsx` | One post in the list (title + author), and a `Link` to the detail page |
| `app/(protected)/(tabs)/index.tsx` | Loads posts in `useFocusEffect`, pull-to-refresh with `RefreshControl`, and the **+** button opens `PostForm` |
| `components/PostForm.tsx` | `onSubmit` now returns a Promise, so the form shows a spinner while saving and stays open with an error message if saving fails |
| `app/(protected)/postDetails/[id].tsx` | Loads one post with `getPostById(id)`, shows title, author, date and description. **Delete post** is only shown to the author |

A post in Firestore looks like this:

```
posts/{postId}
  title:       "My first post"
  description: "Hello!"
  authorId:    "Xy12…"            ← Firebase UID, taken from auth.currentUser
  authorName:  "Ada"              ← displayName, for showing in the UI
  createdAt:   Timestamp           ← serverTimestamp()
```

Things to notice:

- **The author is never typed in the form.** `createPost` takes it from
  `auth.currentUser`, so nobody can post as someone else.
- **`useFocusEffect` vs `useEffect`:** Home uses `useFocusEffect`, so the list
  reloads every time you come back to it (for example, after deleting a post).
- **Closing a `<Modal>` is not a focus change.** That is why Home calls
  `loadPosts()` itself after a new post is saved.
- **Deleting asks first:** `Alert.alert` on phones, `window.confirm` on web
  (because `Alert` does nothing in the browser).

### Try it

- [ ] Create a post. The popup shows a spinner, closes, and the post is at the top of Home
- [ ] Create a post on another device (or in the browser), then pull down on Home to see it
- [ ] Tap a post to see its details
- [ ] **Delete post** only appears on your own posts, and deleting takes you back to Home
- [ ] The post appears in the Firebase console under **Firestore Database → posts**

## Phase 4: Images

**Goal:** every post has a photo, taken with the camera or chosen from the gallery.

New package: `expo-image-picker` (installed with `npx expo install expo-image-picker`).

| File | What it does |
|------|--------------|
| `app.json` | Adds the `expo-image-picker` plugin with the text iOS shows when asking for photo / camera access |
| `components/PostForm.tsx` | **Choose photo** (`launchImageLibraryAsync`) and **Take photo** (`requestCameraPermissionsAsync` + `launchCameraAsync`), a preview, and "Photo is required" validation |
| `api/imageApi.ts` | `uploadImage(localUri)`: reads the file with `fetch(...).blob()`, uploads it to `posts/{uid}/{time}.jpg` with `uploadBytes`, and returns the `getDownloadURL` link |
| `app/(protected)/(tabs)/index.tsx` | Saving a post now means: 1) upload the photo, 2) save the post with its `imageUrl` |
| `types/post.ts` | `imageUrl` added to `PostData` and `NewPostData` |
| `components/PostCard.tsx`, `app/(protected)/postDetails/[id].tsx` | Show the image |

Things to notice:

- **A local URI is not enough.** The picker gives an address like `file:///…/photo.jpg`
  that only exists on *your* phone. That is why we upload the file and save the
  `https://` download URL in Firestore instead.
- **Upload first, then save.** If the upload fails, no post is created, and the form
  stays open with an error.
- **Permissions:** the gallery uses the system photo picker, so no permission prompt is
  needed. The camera always asks first.
- **The iOS Simulator has no camera.** Test **Take photo** on a real phone with Expo Go.

### Try it

- [ ] Pressing **Post** without a photo shows "Please choose or take a photo."
- [ ] **Choose photo** shows a preview in the form
- [ ] **Take photo** (real phone) asks for camera access, then shows a preview
- [ ] After saving, the image shows on Home and on the detail page
- [ ] The file appears in the Firebase console under **Storage → posts → (your uid)**

---

## Coming next

- **Phase 5:** comments (add, edit and delete your own)
- **Phase 6:** security rules and a concepts guide
