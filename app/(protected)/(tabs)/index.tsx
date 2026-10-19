import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import PostForm, { PostFormValues } from "@/components/PostForm";
import PostCard from "@/components/PostCard";
import { PostData } from "@/utils/postData";
import { getAllPosts, createPost } from "@/api/postApi";

export default function HomeScreen() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true); // first load: full-screen spinner
  const [refreshing, setRefreshing] = useState(false); // pull-to-refresh spinner
  const [error, setError] = useState("");
  const [formVisible, setFormVisible] = useState(false);

  // useFocusEffect runs every time this screen comes into view,
  // e.g. when you go back from the detail page after deleting a post.
  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [])
  );

  async function loadPosts() {
    try {
      setError("");
      setPosts(await getAllPosts());
    } catch (e) {
      console.error("Failed to load posts:", e);
      setError("Could not load posts. Pull down to try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  }

  // Called by PostForm. If this throws, PostForm stays open and shows an error.
  async function handleNewPost(values: PostFormValues) {
    await createPost(values);
    // Closing a <Modal> does not trigger useFocusEffect, so reload here.
    await loadPosts();
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        ListHeaderComponent={error ? <Text style={styles.error}>{error}</Text> : null}
        ListEmptyComponent={
          error ? null : <Text style={styles.empty}>No posts yet. Tap + to create one.</Text>
        }
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    paddingBottom: 100, // room for the FAB
  },
  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "gray",
  },
  error: {
    textAlign: "center",
    margin: 16,
    color: "#FF3B30",
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
