import React, { useContext, useEffect, useState } from "react";
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
import { MaterialCommunityIcons } from "@expo/vector-icons";

const UserOwnedApartmentsGrid = ({ userId, isMyProfile }) => {
  const { allApartments } = useContext(ActiveApartmentContext);

  const [openHouseModalVisible, setOpenHouseModalVisible] = useState(false);
  const [selectedApartmentId, setSelectedApartmentId] = useState(null);
  const [openHouseDate, setOpenHouseDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [startDateObj, setStartDateObj] = useState(new Date());
  const [endDateObj, setEndDateObj] = useState(new Date());
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [ownedApartments, setOwnedApartments] = useState([]);
  const [peopleCount, setPeopleCount] = useState("");

  useEffect(() => {
    if (!userId) return;

    const filtered = allApartments.filter((apt) => apt.UserID === userId);
    setOwnedApartments(filtered);
  }, [allApartments, userId]);

  const [openHousesMap, setOpenHousesMap] = useState({});

  useEffect(() => {
    ownedApartments.forEach((apt) => {
      fetchOpenHouses(apt.ApartmentID);
    });
  }, [ownedApartments]);

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

  const fetchOpenHouses = async (apartmentId) => {
    try {
      const res = await fetch(
        `${API}OpenHouse/GetOpenHousesByApartment/${apartmentId}/${userId}`
      );
      if (!res.ok) {
        setOpenHousesMap((prev) => ({ ...prev, [apartmentId]: [] }));
        return;
      }
      const data = await res.json();
      setOpenHousesMap((prev) => ({ ...prev, [apartmentId]: data }));
    } catch (err) {
      console.error(`שגיאה אמיתית בטעינת בית פתוח לדירה ${apartmentId}:`, err);
    }
  };

  const handleCreateOpenHouse = (apartmentId) => {
    setSelectedApartmentId(apartmentId);
    setOpenHouseModalVisible(true);
  };

  const submitOpenHouse = async () => {
    if (!startTime || !endTime || !peopleCount || !openHouseDate) {
      alert("אנא מלא את כל שדות הבית הפתוח לפני השליחה");
      return;
    }

    if (isNaN(peopleCount) || Number(peopleCount) <= 0) {
      alert("אנא הזן מספר משתתפים חוקי");
      return;
    }

    const requestBody = {
      openHouseId: 0,
      apartmentId: selectedApartmentId,
      date: formatDateOnly(openHouseDate),
      amountOfPeoples: Number(peopleCount),
      totalRegistrations: 0,
      startTime: startTime,
      endTime: endTime,
      isRegistered: true,
      userConfirmed: true,
    };

    try {
      const response = await fetch(
        API + `OpenHouse/CreateNewOpenHouse/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const text = await response.text();
      let result;

      try {
        result = JSON.parse(text);
      } catch {
        result = { message: text };
      }

      if (!response.ok) {
        throw new Error(result.message || "שגיאה מהשרת");
      }

      alert("✅ " + (result.message || "בית פתוח נוצר בהצלחה!"));
      setOpenHouseModalVisible(false);

      const newOpenHouse = {
        ...requestBody,
        openHouseId: result.id || Math.random(),
      };

      setOpenHousesMap((prev) => {
        const current = prev[selectedApartmentId] || [];
        return {
          ...prev,
          [selectedApartmentId]: [...current, newOpenHouse],
        };
      });
    } catch (error) {
      console.error("שגיאה:", error);
      alert("❌ שגיאה ביצירת בית פתוח:\n" + error.message);
    }
  };

  const formatDateOnly = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatTime = (dateObj) => {
    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
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
            style={[
              styles.card,
              { borderColor: getBorderColor(apt.ApartmentType) },
            ]}
          >
            <View
              style={[
                styles.typeLabel,
                { backgroundColor: getBorderColor(apt.ApartmentType) },
              ]}
            >
              <Text style={styles.typeText}>
                {getTypeName(apt.ApartmentType)}
              </Text>
            </View>

            <ApartmentGallery images={apt.Images} />

            <View style={styles.details}>
              <Text style={styles.titleText}>דירה ברחוב {apt.Location}</Text>
              <Text style={styles.description}>{apt.Description}</Text>
              <Text style={styles.price}>{apt.Price} ש"ח</Text>

              {isMyProfile && (
                <>
                  {(openHousesMap[apt.ApartmentID] || []).map((item, idx) => (
                  <View key={idx} style={styles.openHouseItem}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                
                    <Text style={styles.openHouseButtonText}>
                      {new Date(item.date).toLocaleDateString("he-IL")} | {item.startTime} - {item.endTime} | נרשמו: {item.amountOfPeoples} / {item.totalRegistrations}
                    </Text>
                    <MaterialCommunityIcons name="calendar-outline" size={20} color="white" style={{ marginLeft: 6 }} />
                  </View>
                </View>
                  ))}

                  <TouchableOpacity
                    style={styles.openHouseCreateButton}
                    onPress={() => handleCreateOpenHouse(apt.ApartmentID)}
                  >
                    <Text style={styles.openHouseButtonText}>צור בית פתוח</Text>
                  </TouchableOpacity>
                </>
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
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 10,
              width: "80%",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 10,
                textAlign: "center",
              }}
            >
              צור בית פתוח
            </Text>

            <Text>בחר תאריך:</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <Text
                style={{
                  padding: 10,
                  borderColor: "#ccc",
                  borderWidth: 1,
                  borderRadius: 5,
                }}
              >
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
              <Text
                style={{
                  padding: 10,
                  borderColor: "#ccc",
                  borderWidth: 1,
                  borderRadius: 5,
                }}
              >
                {startTime || "בחר שעה"}
              </Text>
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={startDateObj}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedDate) => {
                  if (event.type === "set" && selectedDate) {
                    setStartDateObj(selectedDate);
                    setStartTime(formatTime(selectedDate));
                  }
                  if (Platform.OS !== "ios") {
                    setShowStartPicker(false);
                  }
                }}
              />
            )}

            <Text>שעת סיום:</Text>
            <TouchableOpacity onPress={() => setShowEndPicker(true)}>
              <Text
                style={{
                  padding: 10,
                  borderColor: "#ccc",
                  borderWidth: 1,
                  borderRadius: 5,
                }}
              >
                {endTime || "בחר שעה"}
              </Text>
            </TouchableOpacity>
            {showEndPicker && (
              <DateTimePicker
                value={endDateObj}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedDate) => {
                  if (event.type === "set" && selectedDate) {
                    setEndDateObj(selectedDate);
                    setEndTime(formatTime(selectedDate));
                  }
                  if (Platform.OS !== "ios") {
                    setShowEndPicker(false);
                  }
                }}
              />
            )}

            <Text>כמות משתתפים:</Text>
            <TextInput
              value={peopleCount.toString()}
              placeholder="יש לבחור כמות משתתפים"
              onChangeText={(val) => setPeopleCount(val)}
              keyboardType="numeric"
              style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
            />

            <TouchableOpacity
              style={{
                backgroundColor: "#2661A1",
                padding: 10,
                borderRadius: 5,
              }}
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
  openHouseRow: {
    backgroundColor: "#FFA500",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  openHouseText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  openHouseCreateButton: {
    backgroundColor: "#FFA500",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  openHouseItem: {
    backgroundColor: "#e68400",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
});

export default UserOwnedApartmentsGrid;