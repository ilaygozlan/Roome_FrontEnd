import 'react-native-get-random-values';
import { useEffect, useState, useContext } from "react";
import { Stack, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { ActivityIndicator, View } from "react-native";
import { ActiveApartmentProvider } from "./contex/ActiveApartmentContext";
import { UserInfoProvider } from "./contex/userInfoContext";
import AuthStack from "./AuthStack";

/**
 * @component RootLayout
 * @description Root layout component that handles application-wide layout and authentication state.
 * Serves as the main wrapper for the entire application, managing authentication flow and context providers.
 * 
 * Features:
 * - Firebase authentication state management
 * - Loading state handling
 * - Navigation stack configuration
 * - Context providers setup
 * - New user flow handling
 * 
 * Context Providers:
 * - ActiveApartmentProvider
 * - UserInfoProvider
 * 
 * Navigation:
 * - Conditional rendering based on authentication state
 * - New user vs existing user routing
 * - Stack navigation configuration
 * 
 * @requires expo-router
 * @requires firebase/auth
 * @requires react-native-get-random-values
 */

export default function RootLayout() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [userId, setUserId] = useState(null);
  const [isNewUser, setIsNewUser] = useState(null);
  const router = useRouter();

  /**
   * Authentication state management effect
   * @effect
   * Handles:
   * - User authentication state changes
   * - User data management
   * - Loading state
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      console.log("Auth state changed:", u);
      console.log("checking changed:", checking);
      if (u) {
        setUser(u);
      } else {
        setUser(null);
        setUserId(null);
        setIsNewUser(null);
      }
      setChecking(false);
    });

    return () => unsubscribe();
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  /**
   * App Stack component for authenticated users
   * @component
   * @param {Object} props
   * @param {boolean} props.isNewUser - Whether the user is new
   * @param {string} props.userId - User's ID
   */
  const AppStack = ({ isNewUser, userId }) => (
    <Stack screenOptions={{ headerShown: false }}>
      {isNewUser ? (
        <Stack.Screen name="ProfileInfo" />
      ) : (
        <Stack.Screen name="(tabs)" />
      )}
      <Stack.Screen name="ApartmentDetails"/>
      <Stack.Screen name="UserProfile"/>
        <Stack.Screen name="ChatRoom" />
    </Stack>
  );


  return (
    <ActiveApartmentProvider>
    <UserInfoProvider>
       <AuthStack/>
    </UserInfoProvider>
    </ActiveApartmentProvider>
  );
}
