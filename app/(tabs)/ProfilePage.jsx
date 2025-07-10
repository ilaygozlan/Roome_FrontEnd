// app/tabs/ProfilePage.jsx
import React, { useContext, useEffect, useState } from "react";
import { View, ScrollView, ActivityIndicator } from "react-native";
import MyProfile from "../MyProfile";
import { userInfoContext } from "../contex/userInfoContext";

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
const { loginUserId, isLoading } = useContext(userInfoContext);

if (isLoading || !loginUserId) {
  return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: "center" }} />;
}

return (
  <View style={{ flex: 1 }}>
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <MyProfile myId={loginUserId} />
    </ScrollView>
  </View>
);
}
export default ProfilePage;
