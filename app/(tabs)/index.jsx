import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, ScrollView, View, Button } from "react-native";
import { useRouter } from "expo-router";
import Apartment from "../components/apartment";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 0 , flex: 1}}>
        <Apartment />
      </ScrollView>
    </SafeAreaView>
  );
}
