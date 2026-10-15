import { Timestamp } from "firebase/firestore";

// A post as it is stored in the "posts" collection (plus its document id).
export interface PostData {
  id: string;
  title: string;
  description: string;
  imageUrl: string; // Firebase Storage download URL
  authorId: string; // Firebase UID of the person who wrote it
  authorName: string; // their displayName, for showing in the UI
  likes: string[]; // UIDs of the users who liked this post
  createdAt?: Timestamp; // set by Firestore with serverTimestamp()
}

// What the form gives us when creating a post.
// authorId, authorName and createdAt are added by postApi, not by the form.
export interface NewPostData {
  title: string;
  description: string;
  imageUrl: string;
}
