import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, ScrollView, View, Button } from "react-native";
import Apartment from "../components/apartment";
import { useRouter } from "expo-router";
import LogoutButton from "../components/LogoutButton";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import UserProgressTrack from "../components/userProgressTrack";

export default function HomeScreen() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);

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
