import { View, ScrollView } from "react-native";
import React from "react";
import UserProfile from "../components/UserProfile";

const ProfilePage = () => {
  return (
    <View>
      <ScrollView>
        <UserProfile />
      </ScrollView>
    </View>
  );
};

export default ProfilePage;