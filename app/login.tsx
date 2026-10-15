import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

// Placeholder login screen. Phase 2 replaces this with the real
// email/password sign in and register form.
export default function LoginScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Demo App</Text>
      <Text style={styles.subtitle}>Sign in comes in Phase 2</Text>

      {/* replace() instead of push(): the user should not go "back" to the login screen */}
      <TouchableOpacity style={styles.button} onPress={() => router.replace("/")}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 32 },
  button: { backgroundColor: "#007AFF", paddingVertical: 12, paddingHorizontal: 32, borderRadius: 8 },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
});
