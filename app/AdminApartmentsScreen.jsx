import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AdminApartmentsList from "./components/AdminApartmentsList";
import { Feather } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { useRouter } from "expo-router";

export default function AdminApartmentsScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/Login");
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert("שגיאה", "אירעה שגיאה בעת ביצוע התנתקות");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.logoutIcon} onPress={handleLogout}>
          <Feather name="log-out" size={24} color="#A1A7B3" />
        </TouchableOpacity>
        <Text style={styles.title}>Admin - דירות</Text>
      </View>

      <View style={{ flex: 1, padding: 20 }}>
        <AdminApartmentsList />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: "center",
    paddingTop: 100,
    paddingBottom: 16,
    backgroundColor: "#F6F7FB",
    position: "relative",
  },
  logoutIcon: {
    position: "absolute",
    top: 40,
    right: 24,
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222B45",
    marginTop: 8,
    textAlign: "center",
  },
});
