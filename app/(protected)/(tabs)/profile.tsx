import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

// Profile screen. Phase 2 shows the signed-in user's name and email
// and makes "Sign out" call Firebase.
export default function ProfileScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>User info comes in Phase 2</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.replace("/login")}>
        <Text style={styles.buttonText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", gap: 24 },
  text: { fontSize: 16, color: "#666" },
  button: { backgroundColor: "#FF3B30", paddingVertical: 12, paddingHorizontal: 32, borderRadius: 8 },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
});
