import { useState } from "react";
import { Link } from "expo-router";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import PostForm, { PostFormValues } from "@/components/PostForm";

// Phase 1: posts only live in this screen's state (gone after reload).
// Phase 3 loads and saves them in Firestore instead.
type LocalPost = PostFormValues & { id: string };

export default function HomeScreen() {
  const [posts, setPosts] = useState<LocalPost[]>([]);
  const [formVisible, setFormVisible] = useState(false);

  function handleNewPost(values: PostFormValues) {
    const newPost = { id: Date.now().toString(), ...values };
    setPosts((prev) => [newPost, ...prev]); // newest first
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          // Dynamic route: opens app/postDetails/[id].tsx with this post's id
          <Link href={`/postDetails/${item.id}`} style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
          </Link>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No posts yet. Tap + to create one.</Text>}
      />

      {/* Floating action button (FAB) opens the form popup */}
      <TouchableOpacity style={styles.fab} onPress={() => setFormVisible(true)}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <PostForm
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        onSubmit={handleNewPost}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f7",
  },
  card: {
    backgroundColor: "white",
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
  },
  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "gray",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  fabIcon: {
    color: "white",
    fontSize: 30,
    lineHeight: 34,
  },
});
