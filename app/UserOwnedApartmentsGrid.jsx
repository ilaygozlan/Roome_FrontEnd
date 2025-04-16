import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import ApartmentGallery from "./components/ApartmentGallery";
import { ActiveApartmentContext } from "./contex/ActiveApartmentContext";

const UserOwnedApartmentsGrid = ({ userId, isMyProfile }) => {
  const { allApartments } = useContext(ActiveApartmentContext);

  const ownedApartments = allApartments.filter(
    (apt) => apt.UserID === userId
  );

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

  if (ownedApartments.length === 0) {
    return (
      <Text style={{ textAlign: "center", marginTop: 20, color: "#666" }}>
        {isMyProfile ? "עוד לא פרסמת דירות" : "אין דירות להצגה"}
      </Text>
    );
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{isMyProfile ? "הדירות שלי" : "הדירות שפרסם/ה"}</Text>
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
            </View>
          </View>
        ))}
      </ScrollView>
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
});

export default UserOwnedApartmentsGrid;
