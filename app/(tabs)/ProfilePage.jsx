// app/tabs/ProfilePage.jsx
import React, { useContext, useEffect, useState } from "react";
import { View, ScrollView } from "react-native";
import MyProfile from "../MyProfile";
import { userInfoContext } from "../contex/userInfoContext";
import AdminScreen from "../AdminScreen";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { ActivityIndicator } from "react-native";
import { checkIfAdmin } from "../../checkAdmin";

/**
 * @module ProfilePage
 * @description Tab screen component for displaying user profile information
 *
 * Features:
 * - Scrollable profile view
 * - Integration with MyProfile component
 * - User context integration
 *
 * @requires MyProfile
 * @requires userInfoContext
 *
 * Context Usage:
 * - userInfoContext for user ID
 *
 * Layout:
 * - Scrollable container
 * - Full-screen flex layout
 * - MyProfile component with user ID prop
 */

const ProfilePage = () => {
  const { loginUserId } = useContext(userInfoContext);
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/Login");
      } else {
        // Check if user is admin
        const isAdminUser = await checkIfAdmin();
        setIsAdmin(isAdminUser);
      }
      setChecking(false);
    });
    return () => unsubscribe();
  }, []);

  if (checking || isAdmin === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {isAdmin ? <AdminScreen /> : <MyProfile myId={loginUserId} />}
      </ScrollView>
    </View>
  );
};

export default ProfilePage;
