import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import PhotoCamera from "@/components/PhotoCamera";

// What the form gives back to the screen when the user presses "Post".
// imageUri is the photo's local address on this device; Home uploads it to Storage.
export type PostFormValues = {
  title: string;
  description: string;
  imageUri: string;
};

type PostFormProps = {
  visible: boolean;
  onClose: () => void;
  // Returns a Promise so the form can show a spinner until saving is done.
  // If it throws, the form stays open and shows an error.
  onSubmit: (values: PostFormValues) => Promise<void>;
};

// A popup form for creating a post (same Modal pattern as Session 4).
// The screen that uses it decides what to do with the values (Home saves them to Firestore).
export default function PostForm({ visible, onClose, onSubmit }: PostFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false); // true = show the camera instead of the form
  const [titleError, setTitleError] = useState("");
  const [imageError, setImageError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  // Gallery: no permission prompt needed, the system photo picker handles privacy.
  async function pickImage() {
    // quality 0.5: smaller files upload faster (0 = smallest, 1 = best quality)
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.5,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setImageError("");
    }
  }

  // Camera: PhotoCamera (expo-camera) gives us the photo's uri.
  // Note: the iOS Simulator has no camera, so test this on a real phone or in the browser.
  function handleCapture(uri: string) {
    setImageUri(uri);
    setImageError("");
    setCameraOpen(false);
  }

  async function handleSubmit() {
    // Check both fields, so the user sees every problem at once
    if (!title.trim()) setTitleError("Title is required.");
    if (!imageUri) setImageError("Please choose or take a photo.");
    if (!title.trim() || !imageUri) return;

    setSaving(true);
    setSaveError("");
    try {
      await onSubmit({ title: title.trim(), description: description.trim(), imageUri });
      resetForm();
      onClose();
    } catch (e) {
      console.error("Failed to save post:", e);
      setSaveError("Could not save the post. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    if (saving) return; // don't close while the post is being saved
    if (cameraOpen) {
      setCameraOpen(false); // Android back button: leave the camera, keep the form
      return;
    }
    resetForm();
    onClose();
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setImageUri(null);
    setCameraOpen(false);
    setTitleError("");
    setImageError("");
    setSaveError("");
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose} // Android back button
    >
      {cameraOpen ? (
        <PhotoCamera onCapture={handleCapture} onCancel={() => setCameraOpen(false)} />
      ) : (
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.heading}>New Post</Text>
            {saving ? (
              <ActivityIndicator />
            ) : (
              <TouchableOpacity onPress={handleSubmit}>
                <Text style={styles.submitButton}>Post</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
            {saveError ? <Text style={styles.saveError}>{saveError}</Text> : null}

            {/* Title — required */}
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={[styles.input, titleError ? styles.inputError : null]}
              placeholder="What is this post about?"
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (titleError) setTitleError("");
              }}
              autoFocus
            />
            {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}

            {/* Description — optional */}
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add more details…"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />

            {/* Photo — required */}
            <Text style={styles.label}>Photo *</Text>
            {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview} /> : null}
            <View style={styles.photoButtons}>
              <TouchableOpacity style={styles.photoButton} onPress={pickImage} disabled={saving}>
                <Text style={styles.photoButtonText}>Choose photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={() => setCameraOpen(true)}
                disabled={saving}
              >
                <Text style={styles.photoButtonText}>Take photo</Text>
              </TouchableOpacity>
            </View>
            {imageError ? <Text style={styles.imageError}>{imageError}</Text> : null}
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  heading: {
    fontSize: 17,
    fontWeight: "600",
  },
  cancelButton: {
    fontSize: 16,
    color: "#FF3B30",
  },
  submitButton: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "gray",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#f2f2f7",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  preview: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 10,
    marginBottom: 12,
  },
  photoButtons: {
    flexDirection: "row",
    gap: 12,
  },
  photoButton: {
    flex: 1,
    backgroundColor: "#f2f2f7",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  photoButtonText: {
    fontSize: 15,
    color: "#007AFF",
    fontWeight: "600",
  },
  imageError: {
    color: "#FF3B30",
    fontSize: 13,
    marginTop: 6,
  },
  saveError: {
    color: "#FF3B30",
    fontSize: 14,
    marginBottom: 16,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 13,
    marginTop: -14,
    marginBottom: 14,
  },
});
