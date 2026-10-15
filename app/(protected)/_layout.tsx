import { Stack } from "expo-router";

// Protected route group layout.
// Every screen inside app/(protected)/ will require the user to be signed in.
// Phase 2 adds the guard here (same pattern as Session 9):
//   loading → spinner, no user → <Redirect href="/login" />, user → this Stack.
export default function ProtectedLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="post/[id]" options={{ title: "Post", headerBackTitle: "Back" }} />
    </Stack>
  );
}
