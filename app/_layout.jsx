// RootLayout.jsx

import 'react-native-get-random-values';
import { useEffect, useState, useRef } from "react";
import { Stack, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { ActivityIndicator, View } from "react-native";

import { ActiveApartmentProvider } from "./contex/ActiveApartmentContext";
import { UserInfoProvider } from "./contex/userInfoContext";
import SignalRProvider from './contex/SignalRContext';
import useNotificationNavigation from './contex/useNotificationNavigation';
import AuthStack from "./AuthStack"; // ← הוסף שורה זו

export default function RootLayout() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [userId, setUserId] = useState(null);
  const [isNewUser, setIsNewUser] = useState(null);
  const router = useRouter();
  const pendingNotification = useRef(null);

  useNotificationNavigation(pendingNotification, !!user); // העבר את ה-ref ואת מצב ההתחברות

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      console.log("Auth state changed:", u?.uid);
      if (u) {
        setUser(u);
        setChecking(false);

        if (pendingNotification.current) {
          const recipientId = "123"; // קבע את recipientId כאן
          router.push({ pathname: "ChatRoom", params: { recipientId } });
          console.log("Notification recipientId:", recipientId); // הוסף שורה זו
          pendingNotification.current = null;
        }
      } else {
        setUser(null);
        setUserId(null);
        setIsNewUser(null);
        setChecking(false);
      }
    });

    return () => {
      unsubscribeAuth();
    };
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
      <UserInfoProvider>
        <SignalRProvider>
          <AuthStack />
        </SignalRProvider>
      </UserInfoProvider>
    </ActiveApartmentProvider>
  );
}
