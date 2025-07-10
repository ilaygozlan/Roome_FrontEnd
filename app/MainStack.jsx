// app/MainStack.jsx
import { Stack } from "expo-router";

const MainStack = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="ChatRoom" />
      <Stack.Screen name="EditApartment" />
    </Stack>
  );
};

export default MainStack;
