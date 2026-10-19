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
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/context/AuthContext";
import { PostData, Like } from "@/utils/postData";
import { getPostById, deletePost, toggleLike } from "@/api/postApi";

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

  // LIKE — optimistic update: change the screen first, then save to Firestore.
  // If saving fails, put the old likes back.
  async function handleToggleLike() {
    if (!post || !user) return;
    const oldLikes = post.likes ?? [];

    // Did I already like it? Then remove the exact object that is stored.
    const myLike = oldLikes.find((like) => like.uid === user.uid);
    const like: Like = myLike ?? { uid: user.uid, name: user.displayName ?? "Anonymous" };
    const liked = myLike !== undefined;
    const newLikes = liked ? oldLikes.filter((l) => l.uid !== user.uid) : [...oldLikes, like];

    setPost({ ...post, likes: newLikes });
    try {
      await toggleLike(post.id, like, liked);
    } catch (e) {
      console.error("Failed to update like:", e);
      setPost({ ...post, likes: oldLikes });
    }
  }

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
  const likes = post.likes ?? []; // posts from Phase 3/4 have no likes field
  const isLiked = likes.some((like) => like.uid === user?.uid);

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

      {/* Like button + how many users liked this post */}
      <View style={styles.likeRow}>
        <TouchableOpacity style={styles.likeButton} onPress={handleToggleLike}>
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={24}
            color={isLiked ? "#FF3B30" : "gray"}
          />
          <Text style={styles.likeLabel}>{isLiked ? "Liked" : "Like"}</Text>
        </TouchableOpacity>
        <Text style={styles.likeCount}>
          {likes.length} {likes.length === 1 ? "like" : "likes"}
        </Text>
      </View>

      {/* Who liked this post */}
      <Text style={styles.likedBy}>
        {likes.length === 0
          ? "No likes yet. Be the first!"
          : `Liked by ${likes.map((like) => like.name).join(", ")}`}
      </Text>

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
  likeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  likeButton: { flexDirection: "row", alignItems: "center", gap: 6 },
  likeLabel: { fontSize: 16, color: "#333" },
  likeCount: { fontSize: 15, color: "gray" },
  likedBy: { fontSize: 14, color: "#333", marginTop: 12, lineHeight: 20 },
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
