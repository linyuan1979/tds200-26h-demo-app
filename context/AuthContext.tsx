import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebaseConfig";

// The data every component can read from the context
type AuthContextType = {
  user: User | null; // null = signed out
  loading: boolean; // true until Firebase knows if someone is signed in
};

// Default value, only used if a component is outside <AuthProvider> (should not happen).
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

// AuthProvider wraps the whole app (see app/_layout.tsx) and keeps the auth state in one place.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged runs once at startup (after Firebase reads the saved session)
    // and again on every sign in / sign out.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe; // stop listening when the provider unmounts
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

// Custom hook. Usage: const { user, loading } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}
