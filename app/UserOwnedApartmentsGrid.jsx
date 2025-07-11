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
import { FontAwesome5, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ApartmentLabelsPopup from "./components/ApartmentLabelsPopup";
import OpenHouseButton from "./components/OpenHouseButton";
import EditApartmentModal from "./components/EditApartmentModal";
import { useNavigation } from "@react-navigation/native";
//hey
const UserOwnedApartmentsGrid = ({ userId, isMyProfile, loginUserId }) => {
  const { allApartments } = useContext(ActiveApartmentContext);
  const [openHouseModalVisible, setOpenHouseModalVisible] = useState(false);
  const [selectedApartmentId, setSelectedApartmentId] = useState(null);
  const [openHouseDate, setOpenHouseDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [visibleLabelsPopupId, setVisibleLabelsPopupId] = useState(null);
  const [expandedApartmentId, setExpandedApartmentId] = useState(null);
  const [startDateObj, setStartDateObj] = useState(new Date());
  const [endDateObj, setEndDateObj] = useState(new Date());
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [ownedApartments, setOwnedApartments] = useState([]);
  const [peopleCount, setPeopleCount] = useState("");
  const navigation = useNavigation();
  const handleEdit = (apartment) => {
    navigation.navigate("EditApartment", {
      apartment: JSON.stringify(apartment),
    });
  };

  const labelToIcon = {
    couch: <FontAwesome5 name="couch" size={24} />,
    sofa: <FontAwesome5 name="couch" size={24} />,
    armchair: <MaterialCommunityIcons name="seat" size={24} />,
    chair: <MaterialIcons name="chair" size={24} />,
    table: <MaterialIcons name="table-restaurant" size={24} />,
    "coffee table": <MaterialCommunityIcons name="coffee" size={24} />,
    "dining table": <MaterialIcons name="table-restaurant" size={24} />,
    desk: <MaterialCommunityIcons name="desk" size={24} />,
    bed: <FontAwesome5 name="bed" size={24} />,
    "bunk bed": <MaterialCommunityIcons name="bunk-bed" size={24} />,
    mattress: <MaterialCommunityIcons name="bed-king" size={24} />,
    dresser: <MaterialCommunityIcons name="dresser" size={24} />,
    wardrobe: <MaterialCommunityIcons name="wardrobe" size={24} />,
    tv: <MaterialIcons name="tv" size={24} />,
    television: <MaterialIcons name="tv" size={24} />,
    lamp: <MaterialIcons name="emoji-objects" size={24} />,
    chandelier: <MaterialCommunityIcons name="chandelier" size={24} />,
    "light fixture": <MaterialCommunityIcons name="ceiling-light" size={24} />,
    bookshelf: <MaterialCommunityIcons name="bookshelf" size={24} />,
    mirror: <MaterialCommunityIcons name="mirror" size={24} />,
    rug: <MaterialCommunityIcons name="rug" size={24} />,
    curtain: <MaterialCommunityIcons name="curtains" size={24} />,
    blinds: <MaterialCommunityIcons name="blinds" size={24} />,
    balcony: <MaterialCommunityIcons name="balcony" size={24} />,
    "patio furniture": <MaterialCommunityIcons name="table-chair" size={24} />,
    "outdoor chair": <MaterialIcons name="chair-alt" size={24} />,
    "outdoor table": <MaterialIcons name="table-restaurant" size={24} />,
    "bar stool": <MaterialCommunityIcons name="stool" size={24} />,
    vanity: <MaterialCommunityIcons name="vanity-light" size={24} />,
    ottoman: <MaterialCommunityIcons name="stool-outline" size={24} />,
    "bean bag": <MaterialCommunityIcons name="stool" size={24} />,
    sideboard: <MaterialCommunityIcons name="sofa-outline" size={24} />,
    "console table": (
      <MaterialCommunityIcons name="table-furniture" size={24} />
    ),
    "shoe rack": <MaterialCommunityIcons name="shoe-formal" size={24} />,
    "air conditioner": (
      <MaterialCommunityIcons name="air-conditioner" size={24} />
    ),
    shower: <MaterialIcons name="shower" size={24} />,
    "washing machine": (
      <MaterialCommunityIcons name="washing-machine" size={24} />
    ),
    dryer: <MaterialCommunityIcons name="tumble-dryer" size={24} />,
    "swimming pool": <MaterialCommunityIcons name="pool" size={24} />,
    garden: <MaterialCommunityIcons name="flower" size={24} />,
    yard: <MaterialCommunityIcons name="grass" size={24} />,
    elevator: <MaterialCommunityIcons name="elevator" size={24} />,
    parking: <MaterialIcons name="local-parking" size={24} />,
    garage: <MaterialCommunityIcons name="garage" size={24} />,
    dishwasher: <MaterialCommunityIcons name="dishwasher" size={24} />,
    microwave: <MaterialCommunityIcons name="microwave" size={24} />,
    oven: <MaterialCommunityIcons name="stove" size={24} />,
    fridge: <MaterialCommunityIcons name="fridge-outline" size={24} />,
    refrigerator: <MaterialCommunityIcons name="fridge-outline" size={24} />,
    stove: <MaterialCommunityIcons name="stove" size={24} />,
    "security camera": <MaterialCommunityIcons name="security" size={24} />,
    intercom: <MaterialCommunityIcons name="home-account" size={24} />,
    jacuzzi: <MaterialCommunityIcons name="hot-tub" size={24} />,
  };

  const labelTranslations = {
    couch: "ספה",
    sofa: "ספה",
    armchair: "כורסה",
    chair: "כיסא",
    bench: "ספסל",
    table: "שולחן",
    "coffee table": "שולחן קפה",
    "dining table": "שולחן אוכל",
    desk: "שולחן כתיבה",
    nightstand: "שידה ליד המיטה",
    bed: "מיטה",
    "bunk bed": "מיטת קומותיים",
    mattress: "מזרן",
    dresser: "שידה",
    wardrobe: "ארון בגדים",
    closet: "ארון",
    tv: "טלוויזיה",
    television: "טלוויזיה",
    "tv stand": "שידת טלוויזיה",
    "entertainment unit": "מערכת בידור",
    lamp: "מנורה",
    chandelier: "נברשת",
    "light fixture": "גוף תאורה",
    bookshelf: "כוורת ספרים",
    bookcase: "כוורת ספרים",
    shelf: "מדף",
    cabinet: "ארונית",
    drawer: "מגירה",
    mirror: "מראה",
    rug: "שטיח",
    carpet: "שטיח",
    curtain: "וילון",
    blinds: "תריסים",
    balcony: "מרפסת",
    "patio furniture": "ריהוט חוץ",
    "outdoor chair": "כיסא חוץ",
    "outdoor table": "שולחן חוץ",
    "bar stool": "שרפרף בר",
    vanity: "שידת איפור",
    ottoman: "הדום",
    "bean bag": "פוף",
    recliner: "כורסה נפתחת",
    sideboard: "שידת צד",
    "console table": "קונסולה",
    "shoe rack": "מתקן לנעליים",
    "air conditioner": "מזגן",
    ac: "מזגן",
    shower: "מקלחת",
    "washing machine": "מכונת כביסה",
    dryer: "מייבש כביסה",
    "swimming pool": "בריכה",
    pool: "בריכה",
    garden: "גן",
    yard: "חצר",
    terrace: "טרסה",
    elevator: "מעלית",
    parking: "חניה",
    garage: "מוסך",
    dishwasher: "מדיח כלים",
    microwave: "מיקרוגל",
    oven: "תנור אפייה",
    fridge: "מקרר",
    refrigerator: "מקרר",
    stove: "כיריים",
    "security camera": "מצלמת אבטחה",
    intercom: "אינטרקום",
    jacuzzi: "ג׳קוזי",
  };

  useEffect(() => {
    if (!userId) return;

    const filtered = allApartments.filter(
      (apt) => apt.UserID === Number(userId)
    );
    setOwnedApartments(filtered);
  }, [allApartments, userId]);

  const [openHousesMap, setOpenHousesMap] = useState({});

  useEffect(() => {
    ownedApartments.forEach((apt) => {
      fetchOpenHouses(apt.ApartmentID);
    });
  }, [ownedApartments]);

  const toggleExpand = (apartmentId) => {
    setExpandedApartmentId((prev) =>
      prev === apartmentId ? null : apartmentId
    );
  };

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
const getApartmentLabels = (apt) => {
  if (!apt.LabelsJson) return [];

  try {
    const labelsArr = JSON.parse(apt.LabelsJson);
    return labelsArr
      .map((item) => item.Label?.toLowerCase())
      .filter((label) => label && labelToIcon[label]);
  } catch (e) {
    console.error("Error parsing LabelsJson:", e);
    return [];
  }
};

const renderApartmentLabels = (apt) => {
  const labels = getApartmentLabels(apt);

  if (labels.length === 0) return null;

  return (
    <View style={styles.labelsContainer}>
      <Text style={styles.sectionTitle}>מאפייני דירה:</Text>
      <View style={styles.labelsGrid}>
        {labels.map((label, index) => (
          <View key={index} style={styles.labelItem}>
            {React.cloneElement(labelToIcon[label], {
              size: 24,
              color: "#E3965A",
            })}
            <Text style={styles.labelText}>
              {labelTranslations[label] || label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};


  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{isMyProfile ? "הדירות שלי" : ""}</Text>
      <ScrollView contentContainerStyle={styles.container}>
        {ownedApartments.map((apt) => (
          <View
            key={apt.ApartmentID}
            style={[
              styles.card,
              { borderColor: getBorderColor(apt.ApartmentType) },
            ]}
          >
            {isMyProfile && (
              <View style={styles.rightButtonsContainer}>
                <TouchableOpacity
                  style={styles.editIconButton}
                  onPress={() => handleEdit(apt)}
                >
                  <MaterialCommunityIcons
                    name="pencil"
                    size={20}
                    color="white"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.aiButton}
                  onPress={() => setVisibleLabelsPopupId(apt.ApartmentID)}
                >
                  <Text style={styles.aiButtonText}>שדרג את המודעה עם AI</Text>
                </TouchableOpacity>
              </View>
            )}

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
              {renderApartmentLabels(apt)}
              {isMyProfile && (
                <>
                  <TouchableOpacity
                    style={styles.openHouseCreateButton}
                    onPress={() => handleCreateOpenHouse(apt.ApartmentID)}
                  >
                    <Text style={styles.openHouseButtonText}>צור בית פתוח</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => toggleExpand(apt.ApartmentID)}
                  >
                    <Text
                      style={{
                        color: "#2661A1",
                        marginTop: 6,
                        textAlign: "center",
                      }}
                    >
                      {expandedApartmentId === apt.ApartmentID
                        ? "הסתר בתים פתוחים ▲"
                        : "הצג בתים פתוחים ▼"}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
              {!isMyProfile && (
                <OpenHouseButton
                  apartmentId={apt.ApartmentID}
                  userId={loginUserId}
                  location={apt.Location}
                  userOwnerId={apt.UserID}
                />
              )}

              {expandedApartmentId === apt.ApartmentID &&
                (openHousesMap[apt.ApartmentID] || []).map((item, idx) => (
                  <View key={idx} style={styles.openHouseItem}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={styles.openHouseButtonText}>
                        {new Date(item.date).toLocaleDateString("he-IL")} |{" "}
                        {item.startTime} - {item.endTime} | נרשמו:{" "}
                        {item.amountOfPeoples} / {item.totalRegistrations}
                      </Text>
                      <MaterialCommunityIcons
                        name="calendar-outline"
                        size={20}
                        color="white"
                        style={{ marginLeft: 6 }}
                      />
                    </View>
                  </View>
                ))}
            </View>

            {visibleLabelsPopupId === apt.ApartmentID && (
              <ApartmentLabelsPopup
                apartmentId={apt.ApartmentID}
                onClose={() => setVisibleLabelsPopupId(null)}
              />
            )}
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
              padding: 25,
              borderRadius: 12,
              width: "90%",
              maxWidth: 400,
              direction: "rtl",
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                marginBottom: 20,
                textAlign: "center",
                color: "#333",
              }}
            >
              צור בית פתוח
            </Text>

            {/* Date Picker */}
            <View style={{ marginBottom: 15 }}>
              <Text
                style={{ marginBottom: 6, color: "#555", fontWeight: "bold" }}
              >
                בחר תאריך
              </Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                }}
              >
                <Text style={{ color: "#333" }}>
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
            </View>

            {/* Start Time */}
            <View style={{ marginBottom: 15 }}>
              <Text
                style={{ marginBottom: 6, color: "#555", fontWeight: "bold" }}
              >
                שעת התחלה
              </Text>
              <TouchableOpacity
                onPress={() => setShowStartPicker(true)}
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                }}
              >
                <Text style={{ color: "#333" }}>{startTime || "בחר שעה"}</Text>
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
            </View>

            {/* End Time */}
            <View style={{ marginBottom: 15 }}>
              <Text
                style={{ marginBottom: 6, color: "#555", fontWeight: "bold" }}
              >
                שעת סיום
              </Text>
              <TouchableOpacity
                onPress={() => setShowEndPicker(true)}
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                }}
              >
                <Text style={{ color: "#333" }}>{endTime || "בחר שעה"}</Text>
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
            </View>

            {/* People Count */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{ marginBottom: 6, color: "#555", fontWeight: "bold" }}
              >
                כמות משתתפים
              </Text>
              <TextInput
                value={peopleCount.toString()}
                placeholder="בחר כמות משתתפים"
                onChangeText={(val) => setPeopleCount(val)}
                keyboardType="numeric"
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  color: "#333",
                }}
              />
            </View>

            <TouchableOpacity
              style={{
                backgroundColor: "#5C67F2",
                paddingVertical: 12,
                borderRadius: 8,
                marginBottom: 10,
              }}
              onPress={submitOpenHouse}
            >
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: 16,
                }}
              >
                אישור
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setOpenHouseModalVisible(false)}>
              <Text
                style={{ color: "#888", textAlign: "center", fontSize: 16 }}
              >
                ביטול
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* The EditApartmentModal component is now a screen, not a modal */}
      {/* {editingApartment && (
        <EditApartmentModal
          visible={editModalVisible}
          apartment={editingApartment}
          onClose={() => setEditModalVisible(false)}
          onSave={handleSaveEdit}
        />
      )} */}
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
  openHouseCreateButton: {
    backgroundColor: "#FF9F3D",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    shadowColor: "#FF9F3D",
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  openHouseCreateButtonPressed: {
    backgroundColor: "#E68A2B",
  },
  openHouseItem: {
    backgroundColor: "#e68400",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  openHouseButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  aiButton: {
    backgroundColor: "#5C67F2",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  aiButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  rightButtonsContainer: {
    position: "absolute",
    top: 5,
    right: 5,
    zIndex: 10,
    alignItems: "flex-end",
    gap: 5,
  },
  editIconButton: {
    backgroundColor: "#5C67F2",
    padding: 6,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
   labelsContainer: {
  marginTop: 20,
  marginBottom: 10,
},
labelsGrid: {
  flexDirection: "row-reverse", 
  flexWrap: "wrap",
  justifyContent: "flex-start",
  marginTop: 10,
},

labelItem: {
  width: "22%",
  alignItems: "center",
  marginVertical: 8,
  flexDirection: "column",
},

labelText: {
  fontSize: 12,
  color: "#444",
  marginTop: 4,
  textAlign: "center",
},
sectionTitle: {
  fontSize: 14,
  fontWeight: "bold",
  marginBottom: 6,
  textAlign: "right",
  color: "#333",
},
});

export default UserOwnedApartmentsGrid;
