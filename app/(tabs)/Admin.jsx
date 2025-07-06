// app/tabs/ProfilePage.jsx
import React, { useContext, useEffect, useState } from "react";
import { View, ScrollView } from "react-native";
import AdminPage from "../AdminPage"

const Admin = () => {

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <AdminPage  />
      </ScrollView>
    </View>
  );
};

export default Admin;
