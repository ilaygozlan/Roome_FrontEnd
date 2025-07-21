import React, { useContext, useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import ApartmentGallery from "./components/ApartmentGallery";
import { ActiveApartmentContext } from "./contex/ActiveApartmentContext";
import ApartmentDetails from "./ApartmentDetails";
import { FontAwesome } from "@expo/vector-icons";
import { userInfoContext } from "./contex/userInfoContext";
import API from "../config";

export default function FavoriteApartmentsScreen({ onClose }) {
  const { loginUserId } = useContext(userInfoContext);

  const [showApartmentDetails, setShowApartmentDetails] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState(null);

  const { allApartments, setAllApartments, refreshFavorites, triggerFavoritesRefresh } = useContext(ActiveApartmentContext);
  const [favoriteApartments, setFavoriteApartments] = useState([]);

  // Filter apartments liked by user from all apartments
  useEffect(() => {
    const liked = allApartments.filter((apt) => apt.IsLikedByUser === true);
    setFavoriteApartments(liked);
  }, [allApartments, refreshFavorites]);

  // Returns border color based on apartment type
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

  // Returns display name for apartment type
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

  // Update the global allApartments array to mark apartment as unliked
  const setApartmentUnLikedByUser = (id) => {
    const updatedApartments = allApartments.map((apt) => {
      if (apt.ApartmentID === id) {
        return { ...apt, IsLikedByUser: false };
      }
      return apt;
    });
    setAllApartments(updatedApartments);
    triggerFavoritesRefresh();
  };

  // Handle unlike action: call API and update local state and global context
  const handleUnlike = async (apartmentId) => {
    try {
      const response = await fetch(
        `${API}User/RemoveLikeApartment/${loginUserId}/${apartmentId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) throw new Error("Failed to unlike apartment");

      // Remove apartment from local favorites list
      setFavoriteApartments((prev) =>
        prev.filter((apt) => apt.ApartmentID !== apartmentId)
      );
      // Update global apartments state
      setApartmentUnLikedByUser(apartmentId);
    } catch (error) {
      Alert.alert("שגיאה", "ארעה שגיאה בהסרת לייק, נסה שוב");
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorite Apartments</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {favoriteApartments.length === 0 && (
          <Text style={styles.emptyText}>No saved apartments yet 💔</Text>
        )}

        {favoriteApartments.map((apt) => (
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
              <Text style={styles.typeText}>{getTypeName(apt.ApartmentType)}</Text>
            </View>

            <ApartmentGallery images={apt.Images} />

            <View style={styles.cardContent}>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => {
                  setSelectedApartment(apt);
                  setShowApartmentDetails(true);
                }}
              >
                <View style={styles.details}>
                  <Text style={styles.title}>Apartment on {apt.Location}</Text>
                  <Text style={styles.description}>{apt.Description}</Text>
                  <Text style={styles.price}>{apt.Price} ₪</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleUnlike(apt.ApartmentID)}
                style={styles.likeButton}
              >
                <FontAwesome name="heart" size={28} color="#E3965A" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Modal for apartment details */}
      <Modal
        visible={showApartmentDetails}
        animationType="slide"
        onRequestClose={() => {
          setShowApartmentDetails(false);
          setSelectedApartment(null);
        }}
      >
        {selectedApartment && (
          <ApartmentDetails
            key={selectedApartment.ApartmentID}
            apt={selectedApartment}
            onClose={() => {
              setShowApartmentDetails(false);
              setSelectedApartment(null);
            }}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "#f5f7fa" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingTop: Constants.statusBarHeight,
    backgroundColor: "#2661A1",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 7,
  },
  backButton: { padding: 8, marginRight: 10 },
  backText: { color: "white", fontSize: 20, fontWeight: "600" },
  headerTitle: { color: "white", fontSize: 20, fontWeight: "700" },
  scrollContainer: {
    padding: 15,
    paddingBottom: 100,
  },
  card: {
    alignSelf: "center",
    width: 350,
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 3,
    marginVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  typeLabel: {
    position: "absolute",
    zIndex: 2,
    top: 10,
    left: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  typeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#222",
    textTransform: "uppercase",
  },
  cardContent: {
    padding: 15,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  details: {
    flex: 1,
    marginLeft: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "right",
    color: "#2c3e50",
  },
  description: {
    fontSize: 15,
    color: "#666",
    textAlign: "right",
    marginTop: 8,
    lineHeight: 22,
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 10,
    textAlign: "right",
    color: "#27ae60",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 60,
    fontSize: 18,
    color: "#777",
  },
  likeButton: {
    padding: 6,
    marginLeft: 10,
  },
});
