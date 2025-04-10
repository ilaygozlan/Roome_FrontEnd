import { Tabs } from "expo-router";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AntDesign from '@expo/vector-icons/AntDesign';
import { Entypo,Ionicons } from '@expo/vector-icons';


export default function Layout() {
  //tabBar = {props => <TabBar {...props}/>}
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs >
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
            headerShown: false,
            unmountOnBlur: false,
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
              <Ionicons name="fast-food-outline" size={size} color={color} />
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
        <Tabs.Screen
          name="maps"
          options={{
            title: "Map",
            headerShown: false,
            unmountOnBlur: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="map-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}


