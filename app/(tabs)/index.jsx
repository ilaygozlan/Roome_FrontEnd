/**
 * @module HomeScreen
 * @description Main home screen component in the tab navigation
 *
 * Features:
 * - Safe area handling
 * - Scrollable apartment listings
 * - Integration with Apartment component
 *
 * @requires expo-router
 * @requires react-native-safe-area-context
 * @requires ../components/apartment
 *
 * Layout:
 * - SafeAreaView container
 * - Scrollable content
 * - Full-screen flex layout
 * - Apartment component integration
 *
 * Navigation:
 * - Uses expo-router for routing
 */
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, ScrollView, View, Button } from "react-native";
import { useRouter } from "expo-router";
import Apartment from "../components/apartment";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Apartment />
    </SafeAreaView>
  );
}
