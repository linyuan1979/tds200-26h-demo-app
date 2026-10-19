import { useState } from "react";
import { Redirect } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import {
  signInWithEmail,
  signUpWithEmail,
  getSignInErrorMessage,
  getSignUpErrorMessage,
} from "@/api/authApi";

type Mode = "signIn" | "signUp";

export default function LoginScreen() {
  const { user } = useAuth();

  const [mode, setMode] = useState<Mode>("signIn");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Already signed in (or just signed in) → go to Home.
  // <Redirect /> replaces this screen, so "back" does not return to login.
  if (user) {
    return <Redirect href="/" />;
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError("");
  }

  async function handleSubmit() {
    // Simple checks before calling Firebase
    if (mode === "signUp" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setError("");
    setBusy(true);
    try {
      if (mode === "signIn") {
        await signInWithEmail(email.trim(), password);
      } else {
        await signUpWithEmail(email.trim(), password, name.trim());
      }
      // No navigation here: AuthContext gets the new user and the
      // "if (user)" check above redirects to Home.
    } catch (e: any) {
      setError(mode === "signIn" ? getSignInErrorMessage(e.code) : getSignUpErrorMessage(e.code));
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>Demo App</Text>

      {/* Sign in / Register toggle */}
      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.toggleButton, mode === "signIn" && styles.toggleActive]}
          onPress={() => switchMode("signIn")}
        >
          <Text style={[styles.toggleText, mode === "signIn" && styles.toggleTextActive]}>
            Sign in
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, mode === "signUp" && styles.toggleActive]}
          onPress={() => switchMode("signUp")}
        >
          <Text style={[styles.toggleText, mode === "signUp" && styles.toggleTextActive]}>
            Register
          </Text>
        </TouchableOpacity>
      </View>

      {mode === "signUp" && (
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <TextInput
        style={styles.input}
        placeholder="Password (at least 6 characters)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={busy}>
        {busy ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>{mode === "signIn" ? "Sign in" : "Create account"}</Text>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "white" },
  title: { fontSize: 32, fontWeight: "bold", textAlign: "center", marginBottom: 24 },
  toggle: {
    flexDirection: "row",
    backgroundColor: "#f2f2f7",
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  toggleButton: { flex: 1, paddingVertical: 10, borderRadius: 6, alignItems: "center" },
  toggleActive: { backgroundColor: "white" },
  toggleText: { fontSize: 15, color: "#666" },
  toggleTextActive: { color: "black", fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  error: { color: "#FF3B30", marginBottom: 12 },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
});
