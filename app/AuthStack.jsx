import { Stack } from "expo-router";
import useNotificationNavigation from "./contex/useNotificationNavigation"; // ודא שהנתיב נכון

const AuthStack = () => {
  useNotificationNavigation();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" />
      <Stack.Screen name="SignUp" />
      <Stack.Screen name="ChatRoom" /> 
    </Stack>
  );
};

export default AuthStack;
