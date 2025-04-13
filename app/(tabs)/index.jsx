import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, ScrollView, View, Button } from "react-native";
import { useState, useEffect } from 'react';
import { useRouter } from "expo-router";
import { registerForPushNotificationsAsync } from '../components/pushNatification';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import Apartment from "../components/apartment";
import LogoutButton from "../components/LogoutButton";
import UserProgressTrack from "../components/userProgressTrack";
import API from "../../config";


export default function HomeScreen() {
  const router = useRouter();
  const [expoPushToken, setExpoPushToken] = useState('');
  const [user, loading] = useAuthState(auth);

  // 🔄 Send push token to the server (as a plain string, not object!)
  const updatePushTokenOnServer = async (token) => {
    try {
      await fetch(API + 'User/PostPushToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 5, // 
          token: token
        }),
      });
    } catch (error) {
      console.error('Error updating push token on server:', error);
    }
  };
      

  // 🔁 Register and send push token on first load
  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => {
        if (token) {
          setExpoPushToken(token);
          updatePushTokenOnServer(token);
        }
      })
      .catch((error) => console.error("Error registering for push notifications:", error));
  }, []);

  // 🔁 Re-check every 24h in case token changes
  useEffect(() => {
    const intervalId = setInterval(() => {
      registerForPushNotificationsAsync()
        .then((token) => {
          if (token && token !== expoPushToken) {
            setExpoPushToken(token);
            updatePushTokenOnServer(token);
          }
        })
        .catch((error) => console.error("Error refreshing push notifications:", error));
    }, 86400000); // 24 hours

    return () => clearInterval(intervalId);
  }, [expoPushToken]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <UserProgressTrack
        currentStep="lookingFor"
        completedSteps={["userSettings"]}
        onStepPress={(stepKey) => navigation.navigate(stepKey)}
      />
      <LogoutButton />
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <Apartment />
      </ScrollView>
    </SafeAreaView>
  );
}
