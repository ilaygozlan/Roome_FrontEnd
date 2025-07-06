/**
 * @component SignUpScreen
 * @description User registration screen component that handles new user sign-up
 * through email/password and Google Sign-In methods.
 * 
 * Features:
 * - Email/password registration
 * - Google Sign-In integration
 * - Password confirmation
 * - Form validation
 * - Error handling
 * - Navigation flow management
 * - Keyboard handling
 * 
 * Registration Methods:
 * - Email/Password
 * - Google OAuth
 * 
 * Validation Rules:
 * - Required fields check
 * - Password match verification
 * - Minimum password length (6 characters)
 * 
 * @requires firebase/auth
 * @requires expo-auth-session
 * @requires expo-web-browser
 */

import { useState } from "react";
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Platform, KeyboardAvoidingView, ScrollView } from "react-native";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "./firebase";
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useRouter } from "expo-router";

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

const redirectUri = "https://auth.expo.io/@ofrig/roome";

const [request, response, promptAsync] = Google.useAuthRequest({
  androidClientId: "182842175967-l3ihifvtioodbbkv4pgv99358ed2ih4u.apps.googleusercontent.com",
  iosClientId: "182842175967-l3ihifvtioodbbkv4pgv99358ed2ih4u.apps.googleusercontent.com",
  expoClientId: "182842175967-l3ihifvtioodbbkv4pgv99358ed2ih4u.apps.googleusercontent.com",
  webClientId: "541845970315-u3vj2nb8dd8ea104fr61maa9j8g5d8op.apps.googleusercontent.com",
  redirectUri,
});


  /**
   * Handles Google Sign-In process
   * @async
   * @function handleGoogleSignIn
   * @returns {Promise<void>}
   */
  const handleGoogleSignIn = async () => {
    try {
      const result = await promptAsync();
      if (result?.type === 'success') {
        const { id_token } = result.params;
        const credential = GoogleAuthProvider.credential(id_token);
        await signInWithCredential(auth, credential);
      }
    } catch (err) {
      console.log("Google Sign-In error:", err);
      setError("Failed to sign in with Google");
    }
  };

  /**
   * Handles email/password registration
   * @async
   * @function handleSignUp
   * @returns {Promise<void>}
   * 
   * Error Codes:
   * - auth/email-already-in-use
   * - auth/invalid-email
   * - auth/operation-not-allowed
   * - auth/weak-password
   */
  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // After successful signup, navigate to profile info page
      router.push("/ProfileInfo");
    } catch (err) {
      console.log("SignUp error:", err.code);
      switch (err.code) {
        case "auth/email-already-in-use":
          setError("Email is already registered");
          break;
        case "auth/invalid-email":
          setError("Invalid email address");
          break;
        case "auth/operation-not-allowed":
          setError("Email/password accounts are not enabled");
          break;
        case "auth/weak-password":
          setError("Password is too weak");
          break;
        default:
          setError("Failed to create account. Please try again.");
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create Account</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity 
          style={styles.googleButton} 
          onPress={handleGoogleSignIn}
          disabled={!request}
        >
          <Text style={styles.googleButtonText}>Sign up with Google</Text>
        </TouchableOpacity>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/Login")}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/**
 * Component styles
 * @constant
 * @type {Object}
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  error: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  loginText: {
    color: "#666",
  },
  loginLink: {
    color: "#007AFF",
    fontWeight: "bold",
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666',
  },
  googleButton: {
    backgroundColor: '#4285F4',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  googleButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 