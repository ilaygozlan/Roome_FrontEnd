import React, { useEffect, useState, useContext } from "react";
import {
  View,
  ScrollView,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ApartmentGallery from "./ApartmentGallery";
import ApartmentDetails from "../ApartmentDetails";
import { userInfoContext } from "../contex/userInfoContext";
import OpenHouseButton from "./OpenHouseButton";
import API from "../../config";

export default function AdminApartmentsList() {
  const { loginUserId } = useContext(userInfoContext);
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [showApartmentDetails, setShowApartmentDetails] = useState(false);

  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const res = await fetch(`${API}Admin/GetAllApartmentsForAdmin`);
        const data = await res.json();
        setApartments(data);
      } catch (err) {
        console.error("Error fetching apartments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApartments();
  }, []);

  const toggleActiveStatus = async (apartmentId) => {
    try {
      const response = await fetch(`${API}Admin/ToggleActive/${apartmentId}`, {
        method: "PUT",
      });

      if (response.ok) {
        setApartments((prev) =>
          prev.map((apt) =>
            apt.ApartmentID === apartmentId
              ? { ...apt, IsActive: !apt.IsActive }
              : apt
          )
        );
      } else {
        Alert.alert("שגיאה", "לא ניתן לעדכן את הסטטוס כרגע.");
      }
    } catch (error) {
      console.error("Toggle error:", error);
      Alert.alert("שגיאה", "אירעה תקלה בתקשורת עם השרת.");
    }
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

  const handleShare = async (apt) => {
    const message = `דירה שווה באפליקציה:\n\nמיקום: ${apt.Location}\nמחיר: ${apt.Price} ש"ח\n\n${apt.Description}`;
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;

    const supported = await Linking.canOpenURL(url);
    if (supported) {
      Linking.openURL(url);
    } else {
      alert("WhatsApp is not installed");
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        {apartments.map((apt) => (
          <View
            key={apt.ApartmentID}
            style={[styles.card, { borderColor: getBorderColor(apt.ApartmentType) }]}
          >
            <View
              style={[styles.typeLabel, { backgroundColor: getBorderColor(apt.ApartmentType) }]}
            >
              <Text style={styles.typeText}>{getTypeName(apt.ApartmentType)}</Text>
            </View>

            <View style={styles.cardContent}>
              <ApartmentGallery images={apt.Images} />

              <TouchableOpacity
                onPress={() => {
                  setSelectedApartment(apt);
                  setShowApartmentDetails(true);
                }}
              >
                <View style={styles.details}>
                  <Text style={styles.title}>{apt.Location}</Text>
                  <Text style={styles.description}>{apt.Description}</Text>
                  <Text style={styles.price}>{apt.Price} ש"ח</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.iconRow}>
              <TouchableOpacity onPress={() => handleShare(apt)}>
                <MaterialCommunityIcons name="share-outline" size={24} color="gray" />
              </TouchableOpacity>
              <OpenHouseButton
                apartmentId={apt.ApartmentID}
                userId={loginUserId}
                location={apt.Location}
                userOwnerId={apt.UserID}
              />
            </View>

            <TouchableOpacity
              onPress={() => toggleActiveStatus(apt.ApartmentID)}
              style={{
                marginTop: 10,
                backgroundColor: apt.IsActive ? "#FF3B30" : "#34C759",
                padding: 10,
                borderRadius: 6,
                alignItems: "center",
                marginHorizontal: 15,
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
                {apt.IsActive ? "הפוך ללא פעיל" : "החזר לפעיל"}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={showApartmentDetails}
        animationType="slide"
        onRequestClose={() => {
          setSelectedApartment(null);
          setShowApartmentDetails(false);
        }}
      >
        {selectedApartment && (
          <ApartmentDetails
            apt={selectedApartment}
            onClose={() => {
              setSelectedApartment(null);
              setShowApartmentDetails(false);
            }}
          />
        )}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    alignSelf: "center",
    width: 350,
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 3,
    marginBottom: 20,
  },
  cardContent: {
    paddingBottom: 10,
  },
  typeLabel: {
    position: "absolute",
    zIndex: 2,
    top: 5,
    left: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  typeText: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#000",
  },
  details: {
    padding: 10,
  },
  title: {
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
  iconRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 5,
  },
});
