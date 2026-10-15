import { Stack } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";

// Root layout: the top-level Stack, wrapped in <AuthProvider>
// so every screen can call useAuth().
// - login        → public screen
// - (protected)  → everything else; the guard lives in app/(protected)/_layout.tsx
export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="(protected)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
