import { View, Text, StyleSheet } from "react-native";

// Profile screen. Phase 2 shows the signed-in user's name and email
// and adds a "Sign out" button.
export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>User info comes in Phase 2</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 16, color: "#666" },
});
