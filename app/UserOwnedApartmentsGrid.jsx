import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform, 
} from "react-native";
import ApartmentGallery from "./components/ApartmentGallery";
import { ActiveApartmentContext } from "./contex/ActiveApartmentContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import API from "../config";

/**
 * @component UserOwnedApartmentsGrid
 * @description Grid display of apartments owned by a user with open house management functionality.
 * Allows apartment owners to create and manage open house events for their properties.
 * 
 * Features:
 * - Display owned apartments in a grid
 * - Create open house events
 * - Apartment type categorization
 * - Image gallery integration
 * - RTL (Right-to-Left) support
 * - Date and time picker integration
 * 
 * @param {Object} props
 * @param {number} props.userId - ID of the user whose apartments to display
 * @param {boolean} props.isMyProfile - Whether the apartments belong to the current user
 * 
 * Context:
 * - ActiveApartmentContext for apartment data
 */

const UserOwnedApartmentsGrid = ({ userId, isMyProfile }) => {
  const { allApartments } = useContext(ActiveApartmentContext);

  const [openHouseModalVisible, setOpenHouseModalVisible] = useState(false);
  const [selectedApartmentId, setSelectedApartmentId] = useState(null);
  const [openHouseDate, setOpenHouseDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [peopleCount, setPeopleCount] = useState(20);

  const ownedApartments = allApartments.filter((apt) => apt.UserID === userId);

  /**
   * Helper function to determine border color based on apartment type
   * @function getBorderColor
   * @param {number} type - Apartment type (0: Rental, 1: Roommates, 2: Sublet)
   * @returns {string} Color code
   */
  const getBorderColor = (type) => {
    switch (type) {
      case 0:
        return "#F0C27B";
      case 1:
        return "#F4B982";
      case 2:
        return "#E3965A";
      default:
        return "#ddd";
    }
  };

  /**
   * Helper function to get display name for apartment type
   * @function getTypeName
   * @param {number} type - Apartment type (0: Rental, 1: Roommates, 2: Sublet)
   * @returns {string} Display name
   */
  const getTypeName = (type) => {
    switch (type) {
      case 0:
        return "Rental";
      case 1:
        return "Roommates";
      case 2:
        return "Sublet";
      default:
        return "Unknown";
    }
  };

  const handleCreateOpenHouse = (apartmentId) => {
    setSelectedApartmentId(apartmentId);
    setOpenHouseModalVisible(true);
  };

  /**
   * Creates a new open house event
   * @async
   * @function submitOpenHouse
   * @returns {Promise<void>}
   * 
   * Handles:
   * - Data validation
   * - API communication
   * - Success/error feedback
   */
  const submitOpenHouse = async () => {
    if (!startTime || !endTime || !peopleCount || !openHouseDate) {
      alert("אנא מלא את כל שדות הבית הפתוח לפני השליחה");
      return;
    }

    const requestBody = {
      openHouseId: 0,
      apartmentId: selectedApartmentId,
      date: formatDateOnly(openHouseDate), 
      amountOfPeoples: peopleCount,
      totalRegistrations: 0,
      startTime: startTime,
      endTime: endTime,    
      isRegistered: true,
      userConfirmed: true,
    };

    try {
      const response = await fetch(
        API+`/OpenHouse/CreateNewOpenHouse/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );
      const result = await response.json();
      alert("✅ בית פתוח נוצר בהצלחה!");
      setOpenHouseModalVisible(false);
    } catch (error) {
      console.error("שגיאה:", error);
      alert("❌ שגיאה ביצירת בית פתוח");
    }
  };

  /**
   * Formats date object to YYYY-MM-DD string
   * @function formatDateOnly
   * @param {Date} dateObj - Date to format
   * @returns {string} Formatted date string
   */
  const formatDateOnly = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  

  if (ownedApartments.length === 0) {
    return (
      <Text style={{ textAlign: "center", marginTop: 20, color: "#666" }}>
        {isMyProfile ? "עוד לא פרסמת דירות" : "אין דירות להצגה"}
      </Text>
    );
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>
        {isMyProfile ? "הדירות שלי" : ""}
      </Text>
      <ScrollView contentContainerStyle={styles.container}>
        {ownedApartments.map((apt) => (
          <View
            key={apt.ApartmentID}
            style={[styles.card, { borderColor: getBorderColor(apt.ApartmentType) }]}
          >
            <View
              style={[styles.typeLabel, { backgroundColor: getBorderColor(apt.ApartmentType) }]}
            >
              <Text style={styles.typeText}>{getTypeName(apt.ApartmentType)}</Text>
            </View>

            <ApartmentGallery images={apt.Images} />

            <View style={styles.details}>
              <Text style={styles.titleText}>דירה ברחוב {apt.Location}</Text>
              <Text style={styles.description}>{apt.Description}</Text>
              <Text style={styles.price}>{apt.Price} ש"ח</Text>

              {isMyProfile && (
                <TouchableOpacity
                  style={styles.openHouseButton}
                  onPress={() => handleCreateOpenHouse(apt.ApartmentID)}
                >
                  <Text style={styles.openHouseButtonText}>צור בית פתוח</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={openHouseModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setOpenHouseModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
          <View style={{ backgroundColor: "#fff", padding: 20, borderRadius: 10, width: "80%" }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10, textAlign: "center" }}>צור בית פתוח</Text>

            <Text>בחר תאריך:</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <Text style={{ padding: 10, borderColor: "#ccc", borderWidth: 1, borderRadius: 5 }}>
                {openHouseDate.toLocaleDateString("he-IL")}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={openHouseDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setOpenHouseDate(selectedDate);
                }}
              />
            )}

            <Text>שעת התחלה:</Text>
            <TouchableOpacity onPress={() => setShowStartPicker(true)}>
              <Text style={{ padding: 10, borderColor: "#ccc", borderWidth: 1, borderRadius: 5 }}>
                {startTime ? startTime : "בחר שעה"}
              </Text>
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={new Date()}
                mode="time"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowStartPicker(false);
                  if (selectedDate) setStartTime(formatTime(selectedDate));
                }}
              />
            )}

            <Text>שעת סיום:</Text>
            <TouchableOpacity onPress={() => setShowEndPicker(true)}>
              <Text style={{ padding: 10, borderColor: "#ccc", borderWidth: 1, borderRadius: 5 }}>
                {endTime ? endTime : "בחר שעה"}
              </Text>
            </TouchableOpacity>
            {showEndPicker && (
              <DateTimePicker
                value={new Date()}
                mode="time"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowEndPicker(false);
                  if (selectedDate) setEndTime(formatTime(selectedDate));
                }}
              />
            )}

            <Text>כמות משתתפים:</Text>
            <TextInput
              value={peopleCount.toString()}
              onChangeText={(val) => setPeopleCount(Number(val))}
              keyboardType="numeric"
              style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
            />

            <TouchableOpacity
              style={{ backgroundColor: "#2661A1", padding: 10, borderRadius: 5 }}
              onPress={submitOpenHouse}
            >
              <Text style={{ color: "white", textAlign: "center" }}>אישור</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ marginTop: 10 }}
              onPress={() => setOpenHouseModalVisible(false)}
            >
              <Text style={{ color: "#888", textAlign: "center" }}>ביטול</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

/**
 * Component styles
 * @constant
 * @type {Object}
 */
const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "right",
    marginHorizontal: 20,
    marginBottom: 10,
  },
  container: {
    alignItems: "center",
  },
  card: {
    width: 350,
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    borderWidth: 3,
    shadowRadius: 5,
    elevation: 3,
    marginVertical: 10,
  },
  details: {
    padding: 10,
  },
  titleText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
  },
  description: {
    fontSize: 14,
    color: "gray",
    textAlign: "right",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
    textAlign: "right",
  },
  typeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "black",
    textTransform: "uppercase",
  },
  typeLabel: {
    position: "absolute",
    zIndex: 2,
    top: 5,
    left: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  openHouseButton: {
    backgroundColor: "#2661A1",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  openHouseButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default UserOwnedApartmentsGrid;