import { Tabs } from "expo-router";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AntDesign, Ionicons } from "@expo/vector-icons";

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <AntDesign name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="ForYou"
          options={{
            title: "For You",
            unmountOnBlur: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="fast-food-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="ProfilePage"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}
