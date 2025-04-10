import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import API from "../../config";

export default function OpenHouseButton({ apartmentId, userId }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [openHouses, setOpenHouses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (modalVisible) {
      fetchOpenHouses();
    }
  }, [modalVisible]);

  const fetchOpenHouses = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        API + `OpenHouse/GetOpenHousesByApartment/${apartmentId}/${userId}`
      );
      if (!res.ok) throw new Error("Failed to fetch open houses");
      const data = await res.json();
      setOpenHouses(data);
    } catch (err) {
      console.error("Error fetching open houses:", err.message);
      setOpenHouses([]);
    } finally {
      setLoading(false);
    }
  };

  const registerForOpenHouse = async (openHouseId) => {
    try {
      const res = await fetch(API + `OpenHouse/RegisterForOpenHouse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          openHouseID: openHouseId,
          userID: userId,
          confirmed: false,
        }),
      });

      if (res.ok) {
        Alert.alert("ההרשמה הצליחה", "נרשמת לסיור בהצלחה!");
        fetchOpenHouses(); // רענון הנתונים
      } else if (res.status === 409) {
        Alert.alert("כבר נרשמת", "ההרשמה כבר קיימת או שיש בעיה.");
      } else {
        Alert.alert("שגיאה", "לא הצלחנו לרשום אותך לסיור.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert("שגיאת תקשורת", "לא ניתן להתחבר לשרת.");
    }
  };
  const cancelRegistration = async (openHouseId) => {
    try {
      const res = await fetch(
        API + `OpenHouse/DeleteRegistration/${openHouseId}/${userId}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        Alert.alert("ההרשמה בוטלה", "ביטלת את ההרשמה לסיור.");
        fetchOpenHouses();
      } else {
        Alert.alert("שגיאה", "לא ניתן לבטל את ההרשמה.");
      }
    } catch (error) {
      console.error("Cancellation error:", error);
      Alert.alert("שגיאת תקשורת", "לא ניתן להתחבר לשרת.");
    }
  };

  return (
    <View>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <MaterialCommunityIcons
          name="calendar-outline"
          size={24}
          color="gray"
        />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>🏡 סיורים בדירה</Text>

            {loading ? (
              <ActivityIndicator size="large" color="#E3965A" />
            ) : openHouses.length > 0 ? (
              <FlatList
                data={openHouses}
                keyExtractor={(item) => item.openHouseId.toString()}
                renderItem={({ item }) => {
                  const isFull = item.confirmedPeoples >= item.amountOfPeoples;

                  return (
                    <View style={styles.openHouseItem}>
                      <Text style={styles.openHouseText}>
                        {new Date(item.date).toLocaleDateString("he-IL")} -{" "}
                        {item.startTime} - {item.endTime}
                      </Text>
                      <Text style={styles.openHouseLocation}>
                        נרשמו: {item.totalRegistrations} /{" "}
                        {item.amountOfPeoples}
                      </Text>

                      {/* רישום או סטטוס */}
                      {item.isRegistered ? (
                        <>
                          <Text style={styles.statusConfirmed}>
                            ✔ רשום לסיור
                          </Text>
                          <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => cancelRegistration(item.openHouseId)}
                          >
                            <Text style={styles.cancelText}>בטל רישום</Text>
                          </TouchableOpacity>
                        </>
                      ) : isFull ? (
                        <Text style={styles.fullMessage}>הסיור מלא</Text>
                      ) : (
                        <TouchableOpacity
                          style={styles.registerButton}
                          onPress={() => registerForOpenHouse(item.openHouseId)}
                        >
                          <Text style={styles.registerText}>להרשמה</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                }}
              />
            ) : (
              <Text style={styles.noOpenHouses}>אין סיורים זמינים</Text>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>סגור</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// === styles ===
const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  modalContainer: {
    width: 350,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  openHouseItem: {
    backgroundColor: "#F4B982",
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  openHouseText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  openHouseLocation: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  registerButton: {
    backgroundColor: "#E3965A",
    padding: 8,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 5,
  },
  registerText: {
    color: "white",
    fontWeight: "bold",
  },
  noOpenHouses: {
    textAlign: "center",
    color: "gray",
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: "gray",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  statusConfirmed: {
    color: "green",
    fontWeight: "bold",
    marginTop: 5,
    textAlign: "center",
  },
  cancelButton: {
    backgroundColor: "#aaa",
    padding: 8,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 5,
  },
  cancelText: {
    color: "white",
    fontWeight: "bold",
  },
  fullMessage: {
    color: "red",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 5,
  },
});
