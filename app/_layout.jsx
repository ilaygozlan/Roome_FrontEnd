import { Stack } from "expo-router";
import { ActiveApartmentProvider } from "./contex/ActiveApartmentContext";
import {useAuth0, Auth0Provider} from 'react-native-auth0';

export default function RootLayout() {
  return (
    <ActiveApartmentProvider>
      <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ActiveApartmentProvider>

  );
}
