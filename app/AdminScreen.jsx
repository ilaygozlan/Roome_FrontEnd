import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AdminApartmentsList from "./components/AdminApartmentsList";
import AdminUsersList from "./components/AdminUsersList";
import { Feather } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { useRouter } from "expo-router";

export default function AdminScreen() {
  const [showApts, setShowApts] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
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
      {/* Header with logout icon */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.logoutIcon} onPress={handleLogout}>
          <Feather name="log-out" size={24} color="#A1A7B3" />
        </TouchableOpacity>
        <Text style={styles.title}>Admin Dashboard</Text>
      </View>

      <View style={{ flex: 1, padding: 20 }}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowApts((prev) => !prev)}
        >
          <Text style={styles.buttonText}>
            {showApts ? "הסתר דירות" : "רשימת דירות"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowUsers((prev) => !prev)}
        >
          <Text style={styles.buttonText}>
            {showUsers ? "הסתר משתמשים" : "רשימת משתמשים"}
          </Text>
        </TouchableOpacity>

        {showUsers && <AdminUsersList />}
        {showApts && <AdminApartmentsList />}
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
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});
