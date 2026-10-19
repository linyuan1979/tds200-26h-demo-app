import { Link } from "expo-router";
import { Pressable, View, Text, Image, StyleSheet } from "react-native";
import { PostData } from "@/utils/postData";

// One post in the Home list. Tapping it opens the detail page.
export default function PostCard({ post }: { post: PostData }) {
  return (
    // asChild: Link passes its navigation to the Pressable instead of rendering its own <Text>
    <Link href={`/postDetails/${post.id}`} asChild>
      <Pressable style={styles.card}>
        {post.imageUrl ? <Image source={{ uri: post.imageUrl }} style={styles.image} /> : null}
        <View style={styles.body}>
          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.author}>By {post.authorName}</Text>
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
  author: { fontSize: 14, color: "gray", marginTop: 4 },
});
