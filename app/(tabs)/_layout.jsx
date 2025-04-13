import { Tabs } from "expo-router";
import React, { useEffect, useState, useContext } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { ActiveApartmentProvider } from "../contex/ActiveApartmentContext";
import { UserInfoProvider } from "../contex/userInfoContext";
import { ActivityIndicator } from "react-native";
import { userInfoContext } from "../contex/userInfoContext";
import API from "../../config";

export default function Layout() {
  const [user, loading] = useAuthState(auth);
 const {loginUserId} = useContext(userInfoContext);

  if (loading || !user) {
    return (
      <GestureHandlerRootView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color="#0000ff" />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ActiveApartmentProvider>
        <UserInfoProvider>
          <Tabs>
            <Tabs.Screen
              name="index"
              options={{
                title: "Home",
                headerShown: false,
                unmountOnBlur: false,
                tabBarIcon: ({ color, size }) => (
                  <AntDesign name="home" size={size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="ProfilePage"
              options={{
                title: "Profile",
                href: {
                  pathname: "/ProfilePage",
                  params: { userId: loginUserId },
                },
                headerShown: false,
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="person-outline" size={size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="ForYou"
              options={{
                title: "For You",
                headerShown: false,
                unmountOnBlur: false,
                tabBarIcon: ({ color, size }) => (
                  <Ionicons
                    name="fast-food-outline"
                    size={size}
                    color={color}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="Edit"
              options={{
                title: "Edit",
                headerShown: false,
                unmountOnBlur: false,
                tabBarIcon: ({ color, size }) => (
                  <Entypo name="add-to-list" size={size} color={color} />
                ),
              }}
            />
          </Tabs>
        </UserInfoProvider>
      </ActiveApartmentProvider>
    </GestureHandlerRootView>
  );
}
