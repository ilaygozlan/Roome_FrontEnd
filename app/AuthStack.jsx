import { View, Text } from "react-native";
import React from "react";
import { Stack, useRouter } from "expo-router";

const AuthStack = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" />
      <Stack.Screen name="SignUp" />
    </Stack>
  );
};

export default AuthStack;
