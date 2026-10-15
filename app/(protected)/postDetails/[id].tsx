import { useEffect, useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
  StyleSheet,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { PostData } from "@/types/post";
import { getPostById, deletePost } from "@/api/postApi";

// Detail screen. The [id] in the file name becomes a URL parameter.
export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      try {
        setPost(await getPostById(id));
      } catch (e) {
        console.error("Failed to load post:", e);
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [id]);

  async function confirmAndDelete() {
    try {
      await deletePost(id);
      router.back(); // Home reloads its list in useFocusEffect
    } catch (e) {
      console.error("Failed to delete post:", e);
      Alert.alert("Error", "Could not delete the post. Please try again.");
    }
  }

  function handleDelete() {
    // Alert.alert does nothing on web, so use the browser's confirm() there.
    if (Platform.OS === "web") {
      if (window.confirm("Delete this post?")) confirmAndDelete();
      return;
    }
    Alert.alert("Delete post", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: confirmAndDelete },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.centered}>
        <Text style={styles.description}>Post not found.</Text>
      </View>
    );
  }

  const isOwner = post.authorId === user?.uid;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Sets this screen's header title from inside the screen */}
      <Stack.Screen options={{ title: post.title }} />

      {post.imageUrl ? <Image source={{ uri: post.imageUrl }} style={styles.image} /> : null}

      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.meta}>
        By {post.authorName}
        {post.createdAt ? ` · ${post.createdAt.toDate().toLocaleDateString()}` : ""}
      </Text>
      {post.description ? <Text style={styles.description}>{post.description}</Text> : null}

      {/* Only the author can delete their own post */}
      {isOwner && (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteText}>Delete post</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { padding: 20, backgroundColor: "white", flexGrow: 1 },
  image: { width: "100%", aspectRatio: 4 / 3, borderRadius: 10, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "bold" },
  meta: { fontSize: 14, color: "gray", marginTop: 4, marginBottom: 16 },
  description: { fontSize: 16, color: "#333", lineHeight: 22 },
  deleteButton: {
    marginTop: 32,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF3B30",
    alignItems: "center",
  },
  deleteText: { color: "#FF3B30", fontSize: 16, fontWeight: "600" },
});
