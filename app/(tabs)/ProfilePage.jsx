// app/tabs/ProfilePage.jsx
import React, { useContext, useEffect, useState } from "react";
import { View, ScrollView } from "react-native";
import MyProfile from "../MyProfile";
import { userInfoContext } from "../contex/userInfoContext";


const ProfilePage = () => {
  const { loginUserId } = useContext(userInfoContext);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <MyProfile myId={loginUserId} />
      </ScrollView>
    </View>
  );
};

export default ProfilePage;
