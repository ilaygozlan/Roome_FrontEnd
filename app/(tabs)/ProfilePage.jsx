// app/tabs/ProfilePage.jsx
import React, { useContext } from "react";
import { View, ScrollView } from "react-native";
import MyProfile from "../MyProfile";
import { userInfoContext } from "../contex/userInfoContext";
import {UserInfoProvider} from "../contex/userInfoContext"
const ProfilePage = () => {
  const { loginUserId } = useContext(userInfoContext);

  return (
    <UserInfoProvider>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <MyProfile myId={loginUserId} />
        </ScrollView>
      </View>
      </UserInfoProvider>
  );
};

export default ProfilePage;
