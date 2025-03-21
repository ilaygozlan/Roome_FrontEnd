import { View, Text, Image, StyleSheet, TouchableOpacity , ScrollView} from "react-native";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState} from "react";
import { useRouter } from "expo-router";
import LikeButton from "./LikeButton";
import OpenHouseButton from "./OpenHouseButton";

export default function Apartment(props) {

  const router = useRouter();

    // Define colors for each apartment type
    const getBorderColor = (type) => {
        switch (type) {
          case 0: return "#F0C27B"; // Rental - Soft Pastel Orange
          case 1: return "#F4B982"; // Roommates - Warm Peach
          case 2: return "#E3965A"; // Sublet - Light Apricot
          default: return "#ddd";
        }
      };
    
    const getTypeName = (type) => {
        switch (type) {
          case 0: return "Rental";
          case 1: return "Roommates";
          case 2: return "Sublet";
          default: return "Unknown";
        }
      };
      const openHouses = [
        { id: 1, date: "March 25, 2025", time: "10:00 AM", location: "Tel Aviv, King George 77" },
        { id: 2, date: "April 1, 2025", time: "2:00 PM", location: "Dizengoff, Tel Aviv" },
      ];
  const [allApartments, setAllApartments] = useState([
    {
        "ApartmentID": 1001,
        "Price": 6623,
        "AmountOfRooms": 3,
        "Location": "ewr",
        "AllowPet": 1,
        "AllowSmoking": 1,
        "GardenBalcony": 1,
        "ParkingSpace": 0,
        "EntryDate": "2025-03-11",
        "ExitDate": "2025-03-11",
        "IsActive": 1,
        "PropertyTypeID": 2,
        "UserID": 4,
        "Floor": 3,
        "Description": "eed",
        "Shared_NumberOfRoommates": null,
        "Rental_ContractLength": 0,
        "Rental_ExtensionPossible": 1,
        "Sublet_CanCancelWithoutPenalty": null,
        "Sublet_IsWholeProperty": null,
        "Images": "https://images2.madlan.co.il/t:nonce:v=2/projects/%D7%9E%D7%AA%D7%97%D7%9D%20%D7%A7%D7%95%D7%A4%D7%AA%20%D7%97%D7%95%D7%9C%D7%99%D7%9D%20-%20%D7%A2%D7%96%D7%A8%D7%99%D7%90%D7%9C%D7%99/48950_br_group_pic_950x650_3-683b75f9-b8f5-427d-8f29-cad7d8865ff4.jpg",
        "Roommates": null,
        "ApartmentType": 0,
    },
    {
        "ApartmentID": 1002,
        "Price": 9200,
        "AmountOfRooms": 4,
        "Location": "Tel Aviv, King George 77",
        "AllowPet": 1,
        "AllowSmoking": 1,
        "GardenBalcony": 1,
        "ParkingSpace": 2,
        "EntryDate": "2025-07-15",
        "ExitDate": "2026-07-15",
        "IsActive": 1,
        "PropertyTypeID": 2,
        "UserID": 5,
        "Floor": 0,
        "Description": "דירת גן מפוארת עם חצר פרטית ענקית ומיקום שקט",
        "Shared_NumberOfRoommates": 4,
        "Rental_ContractLength": null,
        "Rental_ExtensionPossible": null,
        "Sublet_CanCancelWithoutPenalty": null,
        "Sublet_IsWholeProperty": null,
        "Images": "https://img.yad2.co.il/Pic/202407/22/2_6/o/o2_6_1_02750_20240722172729.jpg?w=3840&h=3840&c=9",
        "Roommates": "UserID: 5 | Name: Danny | Gender: male | Job: מפתח תוכנה | BirthDate: N/A",
        "ApartmentType": 1,
    },
    {
        "ApartmentID": 1004,
        "Price": 5000,
        "AmountOfRooms": 4,
        "Location": "Tel Aviv, Dizengoff",
        "AllowPet": 1,
        "AllowSmoking": 0,
        "GardenBalcony": 1,
        "ParkingSpace": 1,
        "EntryDate": "2025-03-01",
        "ExitDate": "2025-03-14",
        "IsActive": 1,
        "PropertyTypeID": 2,
        "UserID": 5,
        "Floor": 3,
        "Description": "Beautiful shared apartment in central Tel Aviv",
        "Shared_NumberOfRoommates": null,
        "Rental_ContractLength": null,
        "Rental_ExtensionPossible": null,
        "Sublet_CanCancelWithoutPenalty": 0,
        "Sublet_IsWholeProperty": null,
        "Images": "https://israprop.com/wp-content/uploads/2022/02/42a04fd7-c5d7-4561-981c-b96fb4e461cd.jpg",
        "Roommates": null,
        "ApartmentType": 2,
    }]);
/*props.apartments */
    let apartmentsList = allApartments.map(apt => (

    <View key={apt.ApartmentID} style={[styles.card, { borderColor: getBorderColor(apt.ApartmentType) }]} >
        {/* Label for Apartment Type */}
        <View style={[styles.typeLabel, { backgroundColor: getBorderColor(apt.ApartmentType) }]}>
            <Text style={styles.typeText}>{getTypeName(apt.ApartmentType)}</Text>
        </View>
    <TouchableOpacity onPress={() => router.push({ pathname: "/ApartmentDetails", params: { apartment: JSON.stringify(apt) } })}>
      {/* Apartment Image */}
      <Image source={{ uri: apt.Images }} style={styles.image} />

      {/* Apartment Details */}
      <View style={styles.details}>
        <Text style={styles.title}>דירה ברחוב {apt.Location}</Text>
        <Text style={styles.description}>מתאים ל{apt.Shared_NumberOfRoommates} שותפים</Text>
        <Text style={styles.price}>{apt.Price} ש"ח</Text>
      </View>
      </TouchableOpacity>
    {/* Icons Row */}
    {!props.hideIcons && (
  <View style={styles.iconRow}>
    <TouchableOpacity>
      <LikeButton />
    </TouchableOpacity>
    <TouchableOpacity>
      <MaterialCommunityIcons name="share-outline" size={24} color="gray" />
    </TouchableOpacity>
    <OpenHouseButton openHouses={openHouses} />
  </View>
)}

    </View>
  )); 
  return (
    <>
    <ScrollView>
    
    <View style={styles.container}>
      {apartmentsList}
    </View>
    </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#F0F0F0",
    },
    card: {
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