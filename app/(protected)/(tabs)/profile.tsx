import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { signOutUser } from "@/api/authApi";

// Profile screen: shows the signed-in user and a Sign out button.
export default function ProfileScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{user?.displayName || "No name"}</Text>
      <Text style={styles.email}>{user?.email}</Text>

      {/* No navigation needed: after sign out, user becomes null and
          the guard in app/(protected)/_layout.tsx redirects to /auth. */}
      <TouchableOpacity style={styles.button} onPress={signOutUser}>
        <Text style={styles.buttonText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8 },
  name: { fontSize: 22, fontWeight: "bold" },
  email: { fontSize: 16, color: "#666", marginBottom: 24 },
  button: { backgroundColor: "#FF3B30", paddingVertical: 12, paddingHorizontal: 32, borderRadius: 8 },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
});
