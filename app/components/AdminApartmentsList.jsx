import React, { useEffect, useState, useContext } from "react";
import {
  View,
  ScrollView,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import ApartmentGallery from "./ApartmentGallery";
import ApartmentDetails from "../ApartmentDetails";
import { userInfoContext } from "../contex/userInfoContext";
import API from "../../config";
import { useRouter } from "expo-router";

export default function AdminApartmentsList() {
  const { loginUserId } = useContext(userInfoContext);
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [showApartmentDetails, setShowApartmentDetails] = useState(false);
  const router = useRouter();
const sendChatMessage = async (receiverId, message) => {
  try {
    await fetch(`${API}Chat/SaveMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromUserId: loginUserId,
        toUserId: receiverId,
        content: message,
      }),
    });
if (receiverId) {
  router.push(`/chat/${receiverId}`);
}
 
  } catch (err) {
    console.error("Failed to send message:", err);
  }
};

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

  const toggleActiveStatus = async (apartmentId, userId, isActive) => {
    const statusText = isActive
      ? "האם אתה בטוח שאתה רוצה להפוך את הדירה ללא פעילה?"
      : "האם אתה בטוח שאתה רוצה להחזיר את הדירה לפעילה?";
    Alert.alert("אישור פעולה", statusText, [
      {
        text: "ביטול",
        style: "cancel",
      },
      {
        text: "אישור",
        onPress: async () => {
          try {
            const response = await fetch(
              `${API}Admin/ToggleActive/${apartmentId}`,
              {
                method: "PUT",
              }
            );

            if (response.ok) {
              setApartments((prev) =>
                prev.map((apt) =>
                  apt.ApartmentID === apartmentId
                    ? { ...apt, IsActive: !apt.IsActive }
                    : apt
                )
              );

              const message = isActive
                ? "היי, הדירה שפרסמת לא עמדה בכללי האפלקציה ולכן נחסמה."
                : "היי, קיבלנו את הערעור שלך והדירה שפרסמת חזרה להיות פעילה";

              await sendChatMessage(userId, message);
            } else {
              Alert.alert("שגיאה", "לא ניתן לעדכן את הסטטוס כרגע.");
            }
          } catch (error) {
            console.error("Toggle error:", error);
            Alert.alert("שגיאה", "אירעה תקלה בתקשורת עם השרת.");
          }
        },
      },
    ]);
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
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "UserProfile",
                  params: { userId: apt.Creator_ID },
                })
              }
            >
              <View style={styles.creatorContainer}>
                <Image
                  source={{
                    uri:
                      apt.Creator_ProfilePicture ||
                      "https://example.com/default-profile.png",
                  }}
                  style={styles.creatorImage}
                />
                <Text style={styles.creatorName}>{apt.Creator_FullName}</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.cardContent}>
              <ApartmentGallery images={apt.Images} />

              <TouchableOpacity
                onPress={() => {
                  setSelectedApartment(apt);
                  setShowApartmentDetails(true);
                }}
              >
                <View style={styles.details}>
                  <Text style={styles.title}>
                    {typeof apt.Location === "string" &&
                    apt.Location.trim().startsWith("{")
                      ? JSON.parse(apt.Location).address
                      : apt.Location}
                  </Text>
                  <Text style={styles.description}>{apt.Description}</Text>
                  <Text style={styles.price}>{apt.Price} ש"ח</Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() =>
                toggleActiveStatus(apt.ApartmentID, apt.UserID, apt.IsActive)
              }
              style={{
                marginTop: 0,
                marginBottom: 10,
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
    backgroundColor: "#F0F0F0",
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
    shadowColor: "#000",
    shadowOpacity: 0.1,
    borderWidth: 3,
    shadowRadius: 5,
    elevation: 3,
    margin: 10,
  },
  cardContent: {
    paddingBottom: 10,
  },
  typeLabel: {
    position: "absolute",
    zIndex: 2,
    top: 12,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  typeText: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#000",
    textTransform: "uppercase",
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
  creatorContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    margin: 10,
  },
  creatorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "#E3965A",
  },
  creatorName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});
