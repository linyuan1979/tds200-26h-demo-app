import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, initializeAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// The values come from .env (see .env.example).
// Only variables starting with EXPO_PUBLIC_ are available in app code.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Connect to our Firebase project once, then share the services with the whole app.
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app); // Firestore database (posts, comments)
export const storage = getStorage(app); // Firebase Storage (images)

// Web uses getAuth (keeps the user signed in with the browser's localStorage).
// Native uses initializeAuth with AsyncStorage so the user stays signed in after restarting the app.
// require() is used so the React Native-only code is never loaded in the web bundle.
function createAuth() {
  if (Platform.OS === "web") {
    return getAuth(app);
  }
  const { getReactNativePersistence } = require("@firebase/auth/dist/rn/index.js");
  return initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export const auth = createAuth(); // Firebase Authentication
