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
  onSubmit: (values: PostFormValues) => void;
};

// A popup form for creating a post (same Modal pattern as Session 4).
// The screen that uses it decides what to do with the values (Phase 3: save to Firestore).
export default function PostForm({ visible, onClose, onSubmit }: PostFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [titleError, setTitleError] = useState("");

  function handleSubmit() {
    if (!title.trim()) {
      setTitleError("Title is required.");
      return;
    }

    onSubmit({ title: title.trim(), description: description.trim() });
    resetForm();
    onClose();
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setTitleError("");
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
          <TouchableOpacity onPress={handleSubmit}>
            <Text style={styles.submitButton}>Post</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
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
  errorText: {
    color: "#FF3B30",
    fontSize: 13,
    marginTop: -14,
    marginBottom: 14,
  },
});
