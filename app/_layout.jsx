import { useEffect, useState } from "react";
import { Stack, useRouter, Redirect } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { ActivityIndicator, View } from "react-native";
import { ActiveApartmentProvider } from "./contex/ActiveApartmentContext";
import * as Linking from 'expo-linking';

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
  const AuthStack = () => (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" />
      <Stack.Screen name="SignUp" />
    </Stack>
  );
  
  const AppStack = ({loginUser}) => (
    <ActiveApartmentProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)"  user={loginUser}/>
      </Stack>
    </ActiveApartmentProvider>
  );
  
  return user ? <AppStack loginUser ={user}/> : <AuthStack />;
}
