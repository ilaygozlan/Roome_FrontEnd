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
import { sendPushNotification } from "./pushNatification";
import { Linking } from "react-native";

/**
 * @component OpenHouseButton
 * @description Component for managing open house viewings for apartments.
 * Handles registration, cancellation, and viewing of available open house slots.
 * Includes push notification functionality for property owners.
 *
 * Features:
 * - Display available open house times
 * - Registration for open house viewings
 * - Cancellation of registrations
 * - Real-time capacity tracking
 * - Push notifications to property owners
 * - Modal interface for viewing and managing registrations
 *
 * @param {Object} props
 * @param {number} props.apartmentId - ID of the apartment
 * @param {number} props.userId - ID of the current user
 * @param {string} props.location - Location of the apartment
 * @param {number} props.userOwnerId - ID of the apartment owner
 */

export default function OpenHouseButton({
  apartmentId,
  userId,
  location,
  userOwnerId,
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [openHouses, setOpenHouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [calendarLink, setCalendarLink] = useState(null);

  useEffect(() => {
    if (modalVisible) {
      fetchOpenHouses();
    }
  }, [modalVisible]);

  /**
   * Fetches open house listings for the specified apartment
   * @async
   * @function fetchOpenHouses
   * @returns {Promise<void>}
   */
  const fetchOpenHouses = async () => {
    try {
      const res = await fetch(
        API + `OpenHouse/GetOpenHousesByApartment/${apartmentId}/${userId}`
      );
      if (res.status === 404) {
        setOpenHouses([]);
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch open houses");
      const data = await res.json();
      setOpenHouses(data);
      console.log(data);
    } catch (err) {
      console.error("Error fetching open houses:", err.message);
      setOpenHouses([]);
    }
  };

  /**
   * Registers a user for an open house and sends notification to owner
   * @async
   * @function registerForOpenHouse
   * @param {number} openHouseId - ID of the open house session
   * @returns {Promise<void>}
   */
  const offerToSyncWithCalendar = async (openHouseId) => {
    console.log("🟡 שואלת את המשתמש אם להוסיף ליומן...");
    Alert.alert("הוספה ליומן Google", "האם תרצה להוסיף את הסיור ליומן שלך?", [
      {
        text: "לא תודה",
        style: "cancel",
        onPress: () => console.log("🙅‍♂️ המשתמש סירב להוספה ליומן"),
      },
      {
        text: "כן, הוסף ליומן",
        onPress: async () => {
          console.log("✅ המשתמש בחר להוסיף ליומן");
          try {
            const res = await fetch(
              API +
                `OpenHouse/RegisterAndSyncToCalendar?userId=${userId}&openHouseId=${openHouseId}`,
              { method: "POST" }
            );

            const text = await res.text();
            const result = text ? JSON.parse(text) : {};

            console.log("📨 התקבלה תגובה מהשרת:", result);

            if (res.ok && result.calendarEventLink) {
              console.log("📅 קישור לאירוע ביומן:", result.calendarEventLink);
              Linking.openURL(result.calendarEventLink);
            } else {
              console.warn(
                "⚠️ לא נשלח קישור ליומן:",
                result.message || "אין קישור"
              );
              Alert.alert(
                "הוספה ליומן נכשלה",
                result.message || "נסה שוב מאוחר יותר"
              );
            }
          } catch (error) {
            console.error("❌ שגיאה בזמן התחברות ליומן:", error);
            Alert.alert("שגיאה", "לא ניתן להתחבר ליומן Google כרגע.");
          }
        },
      },
    ]);
  };

  const registerForOpenHouse = async (openHouseId) => {
    try {
      // 1. Register the user for the open house
      const res = await fetch(API + `OpenHouse/RegisterForOpenHouse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          openHouseID: openHouseId,
          userID: userId,
          confirmed: 0,
        }),
      });

      if (res.ok) {
        Alert.alert("ההרשמה הצליחה", "נרשמת בהצלחה לבית הפתוח!");

        console.log(" נרשמת בהצלחה לסיור, מנסה לשלוח התראה לבעל הדירה");
        console.log(userOwnerId);
        offerToSyncWithCalendar(openHouseId);

        // 2. Retrieve the push token for the property owner using the ownerId
        const tokenResponse = await fetch(
          API + `User/GetPushToken/${userOwnerId}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (tokenResponse.ok) {
          const result = await tokenResponse.json();
          const ownerPushToken = result.pushToken;

          console.log("📬 טוקן של בעל הדירה:", ownerPushToken);

          // 3. Send the push notification to the property owner
          await sendPushNotification(ownerPushToken);

          console.log(" שלחתי את ההתראה לבעל הדירה");
        } else {
          console.error(" לא הצלחתי להביא טוקן של בעל הדירה");
        }

        fetchOpenHouses();
      } else if (res.status === 409) {
        Alert.alert(
          "Already Registered",
          "You are already registered or there is an issue."
        );
      } else {
        Alert.alert("Error", "Failed to register for the open house.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert("Network Error", "Could not connect to the server.");
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
            {openHouses.length > 0 ? (
              openHouses.map((item) => {
                const isFull = item.confirmedPeoples >= item.amountOfPeoples;

                return (
                  <View key={item.openHouseId} style={styles.openHouseItem}>
                    <Text style={styles.openHouseText}>
                      {new Date(item.date).toLocaleDateString("he-IL")} -{" "}
                      {item.startTime} - {item.endTime}
                    </Text>
                    <Text style={styles.openHouseLocation}>{location}</Text>
                    <Text style={styles.openHouseLocation}>
                      נרשמו: {item.totalRegistrations} / {item.amountOfPeoples}
                    </Text>

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
              })
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
