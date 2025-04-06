import React from "react";
import { View, ScrollView } from "react-native";
import { UserInfoProvider } from "../contex/userInfoContext"; // ודא שהנתיב נכון
import UserProfile from "../components/UserProfile";

const ProfilePage = () => {
  return (
    <UserInfoProvider>
      <View>
        <ScrollView>
          <UserProfile />
        </ScrollView>
      </View>
    </UserInfoProvider>
  );
};

export default ProfilePage;
