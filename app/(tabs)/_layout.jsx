import { Tabs } from "expo-router";
import React, {useEffect, useState} from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AntDesign from '@expo/vector-icons/AntDesign';
import { Entypo,Ionicons } from '@expo/vector-icons';
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { ActiveApartmentProvider } from "../contex/ActiveApartmentContext";
import { ActivityIndicator } from 'react-native';
import API from '../../config';

export default function Layout() {
  const [user, loading] = useAuthState(auth);
  const [loginUserId, setLoginUserId] = useState(null);

  if (loading || !user) {
    return (
      <GestureHandlerRootView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </GestureHandlerRootView>
    );
  }
  

  useEffect(()=>{
    const getUserId = async (email) => {
      try {
        const res = await fetch(`${API}User/CheckIfExists?email=${encodeURIComponent(email)}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });
  
        if (!res.ok) throw new Error(`Server responded with status ${res.status}`);
  
        const data = await res.json();
        setLoginUserId(data.userId);
        return;
  
      } catch (err) {
        console.error("Error checking if user exists:", err);
        return null;
      }
    };

    if (user){
      getUserId(user.email);
    }
  },[user])

  console.log(loginUserId);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ActiveApartmentProvider>
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
      </Tabs>
      </ActiveApartmentProvider>
    </GestureHandlerRootView>
  );
}


