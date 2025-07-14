/**
 * @module HomeScreen
 * @description Main home screen component in the tab navigation
 * 
 * Features:
 * - Safe area handling
 * - Scrollable apartment listings
 * - Integration with Apartment component
 * - Redirects admin to AdminScreen
 * 
 * @requires expo-router
 * @requires react-native-safe-area-context
 * @requires ../components/apartment
 */

import { SafeAreaView } from "react-native-safe-area-context";
import {
  StyleSheet,
  ScrollView,
  View,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import Apartment from "../components/apartment";
import { useContext, useEffect, useState } from "react";
import { userInfoContext } from "../contex/userInfoContext";
import { checkIfAdmin } from "../../checkAdmin";
import AdminApartmentsScreen from "../AdminApartmentsScreen";

export default function HomeScreen() {
  const router = useRouter();
  const { loginUserId } = useContext(userInfoContext);
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const check = async () => {
      try {
        const isAdminUser = await checkIfAdmin();
        setIsAdmin(isAdminUser);
      } catch (err) {
        console.error("Error checking admin:", err);
        setIsAdmin(false);
      } finally {
        setChecking(false);
      }
    };

    check();
  }, []);

  if (checking || isAdmin === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
        {isAdmin ? <AdminApartmentsScreen /> : <Apartment />}
    </SafeAreaView>
  );
}
