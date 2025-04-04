import { Stack } from "expo-router";
import { ActiveApartmentProvider } from "./contex/ActiveApartmentContext";

export default function RootLayout() {
  return (
    <ActiveApartmentProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ActiveApartmentProvider>
  );
}
