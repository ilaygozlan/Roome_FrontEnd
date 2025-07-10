import { Stack } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { ActiveApartmentProvider } from "./contex/ActiveApartmentContext";
import { UserInfoProvider } from "./contex/userInfoContext";
import SignalRProvider from "./contex/SignalRContext";
import useNotificationNavigation from "./contex/useNotificationNavigation";

export default function RootLayout() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const pendingNotification = useRef(null);

  useNotificationNavigation(pendingNotification, !!user);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
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
    <UserInfoProvider>
      <ActiveApartmentProvider>
        <SignalRProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </SignalRProvider>
      </ActiveApartmentProvider>
    </UserInfoProvider>
  );
}
