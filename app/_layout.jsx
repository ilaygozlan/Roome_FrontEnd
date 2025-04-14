import { useEffect, useState, useContext } from "react";
import { Stack, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { ActivityIndicator, View } from "react-native";
import { ActiveApartmentProvider } from "./contex/ActiveApartmentContext";
import { UserInfoProvider } from "./contex/userInfoContext";
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
      if (u) {
        const result = await checkIfUserExists(u.email);
        setUserId(result?.userId);
        setIsNewUser(result?.isNewUser);
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

  const checkIfUserExists = async (email) => {
    try {
      const res = await fetch(`${API}User/CheckIfExists?email=${encodeURIComponent(email)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) throw new Error(`Server responded with status ${res.status}`);

      const data = await res.json();
      return {
        userId: data.userId,
        isNewUser: !data.exists 
      };
    } catch (err) {
      console.error("Error checking if user exists:", err);
      return null;
    }
  };

  if (checking ) {
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
  
  const AppStack = ({ isNewUser, userId }) => (
    <ActiveApartmentProvider>
      <UserInfoProvider>
        <Stack screenOptions={{ headerShown: false }}>
          {isNewUser ? (
            <Stack.Screen name="ProfileInfo" initialParams={{ userId }} />
          ) : (
            <Stack.Screen name="(tabs)" initialParams={{ userId }} />
          )}
        </Stack>
      </UserInfoProvider>
    </ActiveApartmentProvider>
  );
  
  return <AuthStack />;
}
