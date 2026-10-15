import { useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

// Detail screen. The [id] in the file name becomes a URL parameter.
// Phase 3 loads the post from Firestore; Phase 5 adds comments.
export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Post id: {id}</Text>
      <Text style={styles.text}>Post details and comments will be shown here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8 },
  title: { fontSize: 22, fontWeight: "bold" },
  text: { fontSize: 16, color: "#666" },
});
