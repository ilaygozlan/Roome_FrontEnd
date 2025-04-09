import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, ScrollView, View, Button } from 'react-native';
import Apartment from '../components/apartment';
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <Apartment />
      </ScrollView>
    </SafeAreaView>
  );
}
