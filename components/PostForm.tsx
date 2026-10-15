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
} from "react-native";

// What the form gives back to the screen when the user presses "Post".
// Phase 4 adds the picked image here.
export type PostFormValues = {
  title: string;
  description: string;
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
  const [titleError, setTitleError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!title.trim()) {
      setTitleError("Title is required.");
      return;
    }

    setSaving(true);
    setSaveError("");
    try {
      await onSubmit({ title: title.trim(), description: description.trim() });
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
    resetForm();
    onClose();
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setTitleError("");
    setSaveError("");
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose} // Android back button
    >
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
        </ScrollView>
      </KeyboardAvoidingView>
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
