import { Stack } from "expo-router";

// Root layout: the top-level Stack.
// - (tabs)            → Home and Profile
// - postDetails/[id]  → one post, pushed on top of the tabs
// Phase 2 adds the auth screen and moves these into a (protected) group.
export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="postDetails/[id]" options={{ title: "Post", headerBackTitle: "Back" }} />
    </Stack>
  );
}
