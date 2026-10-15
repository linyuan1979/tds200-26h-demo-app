import { Link } from "expo-router";
import { Pressable, Text, StyleSheet } from "react-native";
import { PostData } from "@/types/post";

// One post in the Home list. Tapping it opens the detail page.
export default function PostCard({ post }: { post: PostData }) {
  return (
    // asChild: Link passes its navigation to the Pressable instead of rendering its own <Text>
    <Link href={`/postDetails/${post.id}`} asChild>
      <Pressable style={styles.card}>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.author}>By {post.authorName}</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 10,
  },
  title: { fontSize: 17, fontWeight: "600" },
  author: { fontSize: 14, color: "gray", marginTop: 4 },
});
