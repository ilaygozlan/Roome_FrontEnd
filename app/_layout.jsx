import { useEffect, useState } from "react";
import { Stack, useRouter, Redirect } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { ActivityIndicator, View } from "react-native";
import { ActiveApartmentProvider } from "./contex/ActiveApartmentContext";

export default function RootLayout() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      console.log("Auth state changed:", u);
      setUser(u);
      setChecking(false);
    });

    return () => unsubscribe();
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ActiveApartmentProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" />
            <Stack.Screen name="SignUp" />
          </>
        ) : (
          <Stack.Screen name="(tabs)" />
        )}
      </Stack>
    </ActiveApartmentProvider>
  );
}
