import { useEffect, useState } from "react";
import { Tabs, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Feather from "@expo/vector-icons/Feather";
import { ActiveApartmentProvider } from "../contex/ActiveApartmentContext";
import { UserInfoProvider } from "../contex/userInfoContext";

/**
 * @module TabsLayout
 * @description Main tab navigation layout component for the application.
 * Manages authentication state and tab navigation structure.
 *
 * Features:
 * - Authentication state monitoring
 * - Tab-based navigation
 * - Context providers integration
 * - Loading state management
 * - Protected route handling
 *
 * @requires expo-router
 * @requires firebase/auth
 * @requires react-native-gesture-handler
 * @requires @expo/vector-icons
 *
 * Tab Screens:
 * - Home (index)
 * - For You
 * - Profile
 * - Post (Upload New Apartment)
 */

/**
 * Layout component for tab navigation
 * @component Layout
 *
 * States:
 * @property {boolean} checking - Loading state for authentication check
 *
 * Effects:
 * @effect Authentication state monitoring
 * - Redirects to login if user is not authenticated
 * - Updates checking state when auth state changes
 *
 * Context Providers:
 * - UserInfoProvider
 * - ActiveApartmentProvider
 *
 * Tab Configuration:
 * - headerShown: false (global)
 * - Custom icons for each tab
 * - Specific unmountOnBlur settings
 */

export default function Layout() {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/Login");
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

  return (
    <UserInfoProvider>
      <ActiveApartmentProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Tabs
            screenOptions={{
              headerShown: false,
            }}
          >
            <Tabs.Screen
              name="index"
              options={{
                title: "Home",
                tabBarIcon: ({ color, size }) => (
                  <AntDesign name="home" size={size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="ForYou"
              options={{
                title: "For You",
                unmountOnBlur: false,
                tabBarIcon: ({ color, size }) => (
                  <FontAwesome name="star-o" size={size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="ProfilePage"
              options={{
                title: "Profile",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="person-outline" size={size} color={color} />
                ),
              }}
            /> 
            <Tabs.Screen
              name="Admin"
              options={{
                title: "Admin",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="person-outline" size={size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="UploadNewApartment"
              options={{
                title: "Post",
                tabBarIcon: ({ color, size }) => (
                  <Feather name="plus-circle" size={size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="ChatRoomListScreen"
              options={{
                title: "Chats",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={size}
                    color={color}
                  />
                ),
              }}
            />
          </Tabs>
        </GestureHandlerRootView>
      </ActiveApartmentProvider>
    </UserInfoProvider>
  );
}
