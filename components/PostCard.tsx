import { Link } from "expo-router";
import { Pressable, View, Text, Image, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { PostData } from "@/utils/postData";

// One post in the Home list. Tapping it opens the detail page.
export default function PostCard({ post }: { post: PostData }) {
  // Posts from Phase 3/4 have no likes field, so use ?? []
  const likeCount = (post.likes ?? []).length;

  return (
    // asChild: Link passes its navigation to the Pressable instead of rendering its own <Text>
    <Link href={`/postDetails/${post.id}`} asChild>
      <Pressable style={styles.card}>
        {post.imageUrl ? <Image source={{ uri: post.imageUrl }} style={styles.image} /> : null}
        <View style={styles.body}>
          <Text style={styles.title}>{post.title}</Text>
          <View style={styles.row}>
            <Text style={styles.author}>By {post.authorName}</Text>
            {/* Gray heart when nobody has liked it yet, red heart otherwise */}
            <View style={styles.likes}>
              <Ionicons name="heart" size={16} color={likeCount > 0 ? "#FF3B30" : "#c7c7cc"} />
              <Text style={styles.likesText}>{likeCount}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 10,
    overflow: "hidden", // keeps the image inside the rounded corners
  },
  image: { width: "100%", height: 180 },
  body: { padding: 16 },
  title: { fontSize: 17, fontWeight: "600" },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  author: { fontSize: 14, color: "gray" },
  likes: { flexDirection: "row", alignItems: "center", gap: 4 },
  likesText: { fontSize: 14, color: "gray" },
});
