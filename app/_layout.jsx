import { useEffect, useState, useContext } from "react";
import { Stack, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { ActivityIndicator, View } from "react-native";
import { ActiveApartmentProvider } from "./contex/ActiveApartmentContext";
import { UserInfoProvider } from "./contex/userInfoContext";
import AuthStack from "./AuthStack";
import API from "../config";

export default function RootLayout() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [userId, setUserId] = useState(null);
  const [isNewUser, setIsNewUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      console.log("Auth state changed:", u);
      console.log("checking changed:", checking);
      if (u) {
        setUser(u);
      } else {
        setUser(null);
        setUserId(null);
        setIsNewUser(null);
      }
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

  const AppStack = ({ isNewUser, userId }) => (
    <Stack screenOptions={{ headerShown: false }}>
      {isNewUser ? (
        <Stack.Screen name="ProfileInfo" />
      ) : (
        <Stack.Screen name="(tabs)" />
      )}
      <Stack.Screen name="ApartmentDetails"/>
      <Stack.Screen name="UserProfile"/>
    </Stack>
  );


  return (
    <UserInfoProvider>
      <ActiveApartmentProvider>
       <AuthStack/>
      </ActiveApartmentProvider>
    </UserInfoProvider>
  );
}
