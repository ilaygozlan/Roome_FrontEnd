// app/tabs/ProfilePage.jsx
import React, { useContext } from "react";
import { View, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import UserProfile from "../components/UserProfile";
import { userInfoContext } from "../contex/userInfoContext";
import { UserInfoProvider } from "../contex/userInfoContext";

const ProfilePage = () => {
  const { userId } = useLocalSearchParams();
  const { loginUserId } = useContext(userInfoContext);

  const parsedId = parseInt(userId);
  const finalId = isNaN(parsedId) ? loginUserId : parsedId;

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
