import React, { useContext, useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import ApartmentGallery from "./components/ApartmentGallery";
import { ActiveApartmentContext } from "./contex/ActiveApartmentContext";
import ApartmentDetails from "./ApartmentDetails";

export default function FavoriteApartmentsScreen({ onClose }) {
  const { allApartments } = useContext(ActiveApartmentContext);
  const [showApartmentDeatils, setshowApartmentDeatils] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState(null);

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

  const favoriteApartments = allApartments.filter(
    (apt) => apt.IsLikedByUser === 1 || apt.IsLikedByUser === true
  );

  return (
    <SafeAreaView style={styles.safeContainer} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>הדירות שאהבתי</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {favoriteApartments.map((apt) => (
          <TouchableOpacity
            key={apt.ApartmentID}
            onPress={() => {
              setSelectedApartment(apt);
              setshowApartmentDeatils(true);
            }}
          >
            <View
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
                <Text style={styles.title}>דירה ברחוב {apt.Location}</Text>
                <Text style={styles.description}>{apt.Description}</Text>
                <Text style={styles.price}>{apt.Price} ש"ח</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        {favoriteApartments.length === 0 && (
          <Text style={styles.emptyText}>אין דירות שמורות כרגע 💔</Text>
        )}
      </ScrollView>


      <Modal
        visible={showApartmentDeatils}
        animationType="slide"
        onRequestClose={() => setshowApartmentDeatils(false)}
      >
        <ApartmentDetails
          apartment={selectedApartment}
          onClose={() => setshowApartmentDeatils(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "white" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingTop: Constants.statusBarHeight + 15,
    backgroundColor: "#2661A1",
  },
  backButton: { padding: 5, marginRight: 10 },
  backText: { color: "white", fontSize: 18 },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  scrollContainer: { padding: 10, paddingBottom: 100 },
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
  details: { padding: 10 },
  title: { fontSize: 16, fontWeight: "bold", textAlign: "right" },
  description: { fontSize: 14, color: "gray", textAlign: "right" },
  price: { fontSize: 16, fontWeight: "bold", marginTop: 5, textAlign: "right" },
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
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#777",
  },
});
