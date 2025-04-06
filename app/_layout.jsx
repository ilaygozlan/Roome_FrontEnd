import { Stack } from "expo-router";
import { ActiveApartmentProvider } from "./contex/ActiveApartmentContext";
import {useAuth0, Auth0Provider} from 'react-native-auth0';

export default function RootLayout() {
  return (
    <Auth0Provider domain={"dev-1jjoo8rg2l2dcse2.eu.auth0.com"} clientId={"yRte8q3SriyvN9vz6ZRwfVE0x0sKPkfh"}>
    <ActiveApartmentProvider>
      <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ActiveApartmentProvider>
    </Auth0Provider>

  );
}
