import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, auth } from "@/firebaseConfig";

// UPLOAD — sends a photo from the phone to Firebase Storage and returns
// its download URL (a normal https:// link that works on every device).
export async function uploadImage(localUri: string): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to upload an image.");

  // 1. Read the local file (file://… on a phone, blob:… on web) into a Blob.
  const response = await fetch(localUri);
  const blob = await response.blob();

  // 2. Each user gets their own folder: posts/{uid}/{time}.jpg
  //    (Phase 6 storage rules only let you write into your own folder.)
  const imageRef = ref(storage, `posts/${user.uid}/${Date.now()}.jpg`);

  // 3. Upload, then ask Storage for the public link.
  await uploadBytes(imageRef, blob, { contentType: "image/jpeg" });
  return getDownloadURL(imageRef);
}
