import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "expo-router";
import LikeButton from "./LikeButton";
import OpenHouseButton from "./OpenHouseButton";
import SearchBar from "./SearchBar";
import ApartmentGallery from "./ApartmentGallery";
import { ActiveApartmentContext } from "../contex/ActiveApartmentContext";

export default function Apartment(props) {
  const { allApartments, setAllApartments } = useContext(
    ActiveApartmentContext
  );

  const router = useRouter();

  // Define colors for each apartment type
  const getBorderColor = (type) => {
    switch (type) {
      case 0:
        return "#F0C27B"; // Rental - Soft Pastel Orange
      case 1:
        return "#F4B982"; // Roommates - Warm Peach
      case 2:
        return "#E3965A"; // Sublet - Light Apricot
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

  let apartmentsList = allApartments.map((apt) => (
    <View
      key={apt.ApartmentID}
      style={[styles.card, { borderColor: getBorderColor(apt.ApartmentType) }]}
    >
      {/* Label for Apartment Type */}
      <View
        style={[
          styles.typeLabel,
          { backgroundColor: getBorderColor(apt.ApartmentType) },
        ]}
      >
        <Text style={styles.typeText}>{getTypeName(apt.ApartmentType)}</Text>
      </View>
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/ApartmentDetails",
            params: { apartment: JSON.stringify(apt) },
          })
        }
      >
        {/* Apartment Image */}
        <ApartmentGallery images={apt.Images} />

        {/* Apartment Details */}
        <View style={styles.details}>
          <Text style={styles.title}>דירה ברחוב {apt.Location}</Text>
          <Text style={styles.description}>{apt.Description}</Text>
          <Text style={styles.price}>{apt.Price} ש"ח</Text>
        </View>
      </TouchableOpacity>
      {/* Icons Row */}
      {!props.hideIcons && (
        <View style={styles.iconRow}>
          <TouchableOpacity>
            <LikeButton apartmentId={apt.ApartmentID} numOfLikes={apt.LikeCount} isLikedByUser={apt.IsLikedByUser == 1}/>
          </TouchableOpacity>
          <TouchableOpacity>
            <MaterialCommunityIcons
              name="share-outline"
              size={24}
              color="gray"
            />
          </TouchableOpacity>
          <OpenHouseButton apartmentId={apt.ApartmentID} userId={11} location={apt.Location}/>
        </View>
      )}
    </View>
  ));
  return (
    <>
      <ScrollView>
        <SearchBar />
        <View style={styles.container}>{apartmentsList}</View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#F0F0F0",
  },
  card: {
    alignSelf: "center",
    fontFamily: "RubikRegular",
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
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 200,
  },
  infoIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 5,
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  searchIcon: {
    marginRight: 5,
  },
  searchInput: {
    flex: 1,
    height: 40,
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
    paddingHorizontal: 10, // Adjust width to text size
    paddingVertical: 5,
    borderRadius: 5,
    alignSelf: "flex-start", // Ensures the label wraps around text
  },
});
