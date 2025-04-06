import { View, ScrollView } from "react-native";
import React from "react";
import UserProfile from "../components/UserProfile";
import UploadApartmentForm from "../components/UploadNewApartment";

const ProfilePage = () => {
  return (
    <>
    <View>
        <UploadApartmentForm/>
        </View>
    <View>
      <ScrollView>
        <UserProfile />
      </ScrollView>
    </View>

    </>
  );
};

export default ProfilePage;