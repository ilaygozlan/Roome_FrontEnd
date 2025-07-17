import { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image
} from "react-native";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { auth } from "./firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import API from "../config";
import RoomeLogo from "../assets/images/romee.png";

WebBrowser.maybeCompleteAuthSession();

/**
 * @component LoginScreen
 * @description Authentication screen component that handles user login through
 * email/password and Google Sign-In methods.
 *
 * Features:
 * - Email/password authentication
 * - Google Sign-In integration
 * - Form validation
 * - Error handling
 * - New user detection
 * - Navigation flow management
 * - Keyboard handling
 *
 * Authentication Methods:
 * - Email/Password
 * - Google OAuth
 *
 * @requires firebase/auth
 * @requires expo-auth-session
 * @requires expo-web-browser
 */

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);
  const router = useRouter();

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      "182842175967-vgsq937kjmtv3bbnsckm4p7l8dbe3mgd.apps.googleusercontent.com",
    iosClientId:
      "182842175967-vgsq937kjmtv3bbnsckm4p7l8dbe3mgd.apps.googleusercontent.com",
    webClientId:
      "541845970315-u3vj2nb8dd8ea104fr61maa9j8g5d8op.apps.googleusercontent.com",
    expoClientId:
      "182842175967-vgsq937kjmtv3bbnsckm4p7l8dbe3mgd.apps.googleusercontent.com",
    scopes: [
      "openid",
      "email",
      "profile",
      "https://www.googleapis.com/auth/calendar",
    ],
  });

  /**
   * Checks if a user exists in the backend
   * @async
   * @function checkIfUserExists
   * @param {string} email - User's email address
   * @returns {Promise<Object>} User existence data
   * @property {number} userId - User's ID if exists
   * @property {boolean} isNewUser - Whether the user is new
   */
  const checkIfUserExists = async (email) => {
    try {
      const res = await fetch(
        `${API}User/CheckIfExists?email=${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok)
        throw new Error(`Server responded with status ${res.status}`);

      const data = await res.json();

      return {
        userId: data.userId,
        isNewUser: data.status === "not_found",
        isInactive: data.status === "inactive",
        isActive: data.status === "active",
      };
    } catch (err) {
      console.error("Error checking if user exists:", err);
      return null;
    }
  };

  /**
   * Handles Google Sign-In process
   * @async
   * @function handleGoogleSignIn
   * @returns {Promise<void>}
   */
  const handleGoogleSignIn = async () => {
    try {
      const result = await promptAsync();
      if (result?.type === "success") {
        const { id_token, access_token } = result.authentication;

        const credential = GoogleAuthProvider.credential(id_token);
        await signInWithCredential(auth, credential);

        const user = auth.currentUser;
        if (user) {
          await fetch(`${API}User/SaveGoogleToken`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user.uid,
              token: access_token,
            }),
          });

          const result = await checkIfUserExists(user.email);
          if (result?.isNewUser) {
            router.replace("/ProfileInfo");
          } else {
            router.replace("/(tabs)");
          }
        }
      }
    } catch (err) {
      console.log("Google Sign-In error:", err);
      setError("Failed to sign in with Google");
    }
  };

  /**
   * Handles email/password login
   * @async
   * @function handleLogin
   * @returns {Promise<void>}
   *
   * Error Codes:
   * - auth/invalid-credential
   * - auth/invalid-email
   * - auth/user-disabled
   * - auth/user-not-found
   * - auth/wrong-password
   */
  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;

      if (user) {
        const result = await checkIfUserExists(user.email);

        if (result.userId == -2) {
          setError("המשתמש שלך נחסם. אנא פנה לשירות לקוחות.");
          return; // עצירה – לא ממשיכים לניווט
        }

        if (result?.isNewUser) {
          router.replace("/ProfileInfo");
        } else {
          router.replace("/(tabs)");
        }
      }
    } catch (err) {
      console.log("Login error:", err.code);
      switch (err.code) {
        case "auth/invalid-credential":
          {
            setError("Invalid email or password");
            setForgotPassword(true);
          }
          break;
        case "auth/invalid-email":
          setError("Invalid email address");
          break;
        case "auth/user-disabled":
          setError("This account has been disabled");
          break;
        case "auth/user-not-found":
          setError("No account found with this email");
          break;
        case "auth/wrong-password":
          {
            setError("Incorrect password");
            setForgotPassword(true);
          }
          break;
        default:
          setError("Login failed. Please check your credentials");
      }
    }
  };

  const handlePasswordReset = async () => {
    setError("");

    if (!email) {
      setError("Please enter your email to reset password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent successfully!");
      setForgotPassword(false);
    } catch (error) {
      console.error("Password reset error:", error);
      setError("Failed to send password reset email. Please try again.");
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
        <Image
  source={RoomeLogo}
  style={styles.logo}
/>
        <Text style={styles.title}>Welcome Back!</Text>
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
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        {forgotPassword && (
          <TouchableOpacity
            onPress={handlePasswordReset}
            disabled={!email.trim()}
          >
            <Text
              style={{
                color: email.trim() ? "#007AFF" : "#aaa",
                textAlign: "center",
                marginBottom: 10,
              }}
            >
              Forgot Password?
            </Text>
          </TouchableOpacity>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/SignUp")}>
            <Text style={styles.signupLink}>Sign Up</Text>
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
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  signupText: {
    color: "#666",
  },
  signupLink: {
    color: "#007AFF",
    fontWeight: "bold",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#666",
  },
  googleButton: {
    backgroundColor: "#4285F4",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  googleButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  logo: {
  width: 200,
  height: 200,
  resizeMode: "contain",
  alignSelf: "center",
  marginBottom: 20,
},

});
