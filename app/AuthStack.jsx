import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import ChatRoom from "./ChatRoom";

const AuthStack = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" />
      <Stack.Screen name="SignUp" />
    </Stack>
  );
};

export default AuthStack;
