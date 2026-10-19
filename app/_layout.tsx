import { Stack } from "expo-router";

// Root layout: the top-level Stack.
// - auth         → public screen
// - (protected)  → everything else; the guard lives in app/(protected)/_layout.tsx
// Phase 2 wraps this Stack in <AuthProvider>.
export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(protected)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
    </Stack>
  );
}
