// app/tabs/ProfilePage.jsx
import React from "react";
import { View, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { UserInfoProvider } from "../contex/userInfoContext";
import UserProfile from "../components/UserProfile";

const ProfilePage = () => {
  const { userId } = useLocalSearchParams(); 
  const loggedInUserId = 11;

  const parsedId = parseInt(userId); 
  const finalId = isNaN(parsedId) ? loggedInUserId : parsedId;

  return (
    <UserInfoProvider>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <UserProfile userId={finalId} />
        </ScrollView>
      </View>
    </UserInfoProvider>
  );
};

export default ProfilePage;
