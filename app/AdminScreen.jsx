import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
 import AdminApartmentsList from "./components/AdminApartmentsList"
 import AdminUsersList from "./components/AdminUsersList"

export default function AdminScreen() {
  const [showApts, setShowApts] = useState(false);
  const [showUsers, setshowUsers] = useState(false);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={styles.title}>Admin Dashboard</Text>

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
        onPress={() => setshowUsers((prev) => !prev)}
      >
        <Text style={styles.buttonText}>
          {showUsers ? "הסתר משתמשים" : "רשימת משתמשים"}
        </Text>
      </TouchableOpacity>
      {showUsers && <AdminUsersList />}
      {showApts && <AdminApartmentsList />}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    alignSelf: "center",
    marginBottom: 20,
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
