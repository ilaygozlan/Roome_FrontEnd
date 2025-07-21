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
import * as Calendar from "expo-calendar";

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
  const offerToSyncWithCalendar = async (openHouse) => {
    Alert.alert("נרשמת בהצלחה לבית פתוח ", "האם תרצה להוסיף את הסיור ליומן שלך?", [
      {
        text: "לא תודה",
        style: "cancel",
        onPress: () => console.log("🙅‍♂️ המשתמש סירב להוספה ליומן"),
      },
      {
        text: "כן, הוסף ליומן",
        onPress: async () => {
          addToCalendar(openHouse);
          console.log("  המשתמש בחר להוסיף ליומן");}
          
        }])
  };
  const addToCalendar = async (openHouse) => {

    try {
      // Request calendar permissions
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("הרשאה נדרשת", "יש לאשר גישה ליומן כדי להוסיף את האירוע");
        return;
      }

      // Get default calendar
      const calendars = await Calendar.getCalendarsAsync(
        Calendar.EntityTypes.EVENT
      );
      const defaultCalendar =
        calendars.find((cal) => cal.isPrimary) || calendars[0];

      if (!defaultCalendar) {
        Alert.alert("שגיאה", "לא נמצא יומן ברירת מחדל");
        return;
      }

      // Create event details
      const startDate = new Date(`${(openHouse.Date).split("T")[0]}T${openHouse.StartTime}`);
      const endDate = new Date(`${(openHouse.Date).split("T")[0]}T${openHouse.EndTime}`);

      const eventDetails = {
        title: `בית פתוח - ${openHouse.Location}`,
        startDate: startDate,
        endDate: endDate,
        timeZone: "Asia/Jerusalem",
        location: openHouse.Location,
        notes: `בית פתוח שנרשמת אליו. מספר משתתפים: ${openHouse.TotalRegistrations}/${openHouse.AmountOfPeople}`,
        alarms: [{ relativeOffset: -60 }], // 1 hour before
      };

      // Create the event
      const eventId = await Calendar.createEventAsync(
        defaultCalendar.id,
        eventDetails
      );

      if (eventId) {
        Alert.alert("הצלחה", "האירוע נוסף ליומן בהצלחה!");
      }
    } catch (err) {
      console.error("Error adding to calendar:", err);
      Alert.alert("שגיאה", "שגיאה בהוספת האירוע ליומן");
    } finally {
    }
  };
  const registerForOpenHouse = async (openHouse) => {
    if(userOwnerId == userId) {
      Alert.alert("שגיאה", "לא ניתן להרשם לבית פתוח שלך");
      return;
    }
    try {
      console.log(openHouse)
      // 1. Register the user for the open house
      const res = await fetch(API + `OpenHouse/RegisterForOpenHouse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          openHouseID: openHouse.OpenHouseID,
          userID: userId,
          confirmed: 0,
        }),
      });

      if (res.ok) {

        console.log(" נרשמת בהצלחה לסיור, מנסה לשלוח התראה לבעל הדירה");
        console.log(userOwnerId);
        offerToSyncWithCalendar(openHouse);

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
          "כבר נרשמת לבית הפתוח",
          " כבר נרשמת לבית הפתוח או דיד בעיה אחרת"
        );
      } else {
        Alert.alert("שגיאה", "שגיאה בהרשמה לבית פתוח");
      }
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert("שגיאת רשת", "שגיאה בהתחברות לשרת");
    }
  };

  const cancelRegistration = async (openHouseId) => {
    try {
      console.log(openHouseId,userId)
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
                  <View key={item.OpenHouseID} style={styles.openHouseItem}>
                    <Text style={styles.openHouseText}>
                      {new Date(item.Date).toLocaleDateString("he-IL")} -{" "}
                      {item.StartTime} - {item.EndTime}
                    </Text>
                    <Text style={styles.openHouseLocation}>{location}</Text>
                    <Text style={styles.openHouseLocation}>
                      נרשמו: {item.TotalRegistrations} / {item.AmountOfPeople}
                    </Text>

                    {item.IsRegistered ? (
                      <>
                        <Text style={styles.statusConfirmed}>
                          ✔ רשום לסיור
                        </Text>
                        <TouchableOpacity
                          style={styles.cancelButton}
                          onPress={() => cancelRegistration(item.OpenHouseID)}
                        >
                          <Text style={styles.cancelText}>בטל רישום</Text>
                        </TouchableOpacity>
                      </>
                    ) : isFull ? (
                      <Text style={styles.fullMessage}>הסיור מלא</Text>
                    ) : (
                      <TouchableOpacity
                        style={styles.registerButton}
                        onPress={() => registerForOpenHouse(item)}
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
