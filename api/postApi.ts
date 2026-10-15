import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "@/firebaseConfig";
import { PostData, NewPostData, Like } from "@/types/post";

const POSTS_COLLECTION = "posts";

// CREATE — the author comes from the signed-in Firebase user, never from the form.
export async function createPost(data: NewPostData): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to create a post.");

  await addDoc(collection(db, POSTS_COLLECTION), {
    ...data,
    authorId: user.uid,
    authorName: user.displayName ?? "Anonymous",
    likes: [], // nobody has liked it yet
    createdAt: serverTimestamp(), // the server's time, not the phone's
  });
}

// READ ALL — newest first.
export async function getAllPosts(): Promise<PostData[]> {
  const snapshot = await getDocs(
    query(collection(db, POSTS_COLLECTION), orderBy("createdAt", "desc")),
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as PostData);
}

// READ ONE — returns null if the post does not exist (for example, it was deleted).
export async function getPostById(id: string): Promise<PostData | null> {
  const snap = await getDoc(doc(db, POSTS_COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as PostData;
}

// DELETE
export async function deletePost(id: string): Promise<void> {
  await deleteDoc(doc(db, POSTS_COLLECTION, id));
}

// LIKE / UNLIKE — add or remove one { uid, name } object in the post's likes array.
// arrayUnion adds it only if it is not already there.
// arrayRemove removes items that are exactly equal, so pass the same object that is stored.
export async function toggleLike(postId: string, like: Like, liked: boolean): Promise<void> {
  await updateDoc(doc(db, POSTS_COLLECTION, postId), {
    likes: liked ? arrayRemove(like) : arrayUnion(like),
  });
}
