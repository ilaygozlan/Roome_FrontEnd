import { Stack } from "expo-router";

const TabsStack = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="ChatRoom" />
    </Stack>
  );
};

export default TabsStack;
