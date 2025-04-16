import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "expo-router";
import LikeButton from "./LikeButton";
import OpenHouseButton from "./OpenHouseButton";
import SearchBar from "./SearchBar";
import ApartmentGallery from "./ApartmentGallery";
import { ActiveApartmentContext } from "../contex/ActiveApartmentContext";
import  ApartmentDetails  from "../ApartmentDetails";
import { userInfoContext } from "../contex/userInfoContext";

export default function Apartment(props) {
  const { allApartments, setAllApartments } = useContext(
    ActiveApartmentContext
  );
  const [previewSearchApt, setPreviewSearchApt] = useState(allApartments);
  const { loginUserId } = useContext(userInfoContext);
  const [showApartmentDetails, setShowApartmentDetails] = useState(false);
  const router = useRouter();

  // search bar filters
  const [selectedType, setSelectedType] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [priceRange, setPriceRange] = useState([100, 10000]);
  //-------------------

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

  const renderApartments = () => {
    return previewSearchApt.map((apt) => (
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

        <TouchableOpacity onPress={() => setShowApartmentDetails(true)}>
          <ApartmentGallery images={apt.Images} />
          <View style={styles.details}>
            <Text style={styles.title}>דירה ברחוב {apt.Location}</Text>
            <Text style={styles.description}>{apt.Description}</Text>
            <Text style={styles.price}>{apt.Price} ש"ח</Text>
          </View>
        </TouchableOpacity>

        <Modal
          visible={showApartmentDetails}
          animationType="slide"
          onRequestClose={() => setShowApartmentDetails(false)}
        >
          <ApartmentDetails
            apt={apt}
            onClose={() => setShowApartmentDetails(false)}
          />
        </Modal>

        {!props.hideIcons && (
          <View style={styles.iconRow}>
            <TouchableOpacity>
              <LikeButton
                apartmentId={apt.ApartmentID}
                numOfLikes={apt.LikeCount}
                isLikedByUser={apt.IsLikedByUser == 1}
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <MaterialCommunityIcons
                name="share-outline"
                size={24}
                color="gray"
              />
            </TouchableOpacity>
            <OpenHouseButton
              apartmentId={apt.ApartmentID}
              userId={loginUserId}
              location={apt.Location}
              userOwnerId={apt.userID}
            />
          </View>
        )}
      </View>
    ));
  };

  useEffect(() => {
    setPreviewSearchApt(allApartments);
  }, [allApartments]);

  const SearchApartments = () => {
    console.log("Searching with type:", selectedType);

    const newAptArr = allApartments.filter((apt) => {
      // Type matching - strict equality check
      const matchesType =
        selectedType === null || apt.ApartmentType === selectedType;

      // Price range matching
      const matchesPrice =
        apt.Price >= priceRange[0] && apt.Price <= priceRange[1];

      // Location matching (commented out for now)
      // const matchesLocation = !selectedLocation ||
      //   apt.Location.toLowerCase().includes(selectedLocation.toLowerCase());

      const shouldInclude = matchesType && matchesPrice;
      console.log(
        `Apartment ${apt.ApartmentID}: Type=${apt.ApartmentType}, Selected=${selectedType}, Matches=${shouldInclude}`
      );

      return shouldInclude;
    });
    setPreviewSearchApt(newAptArr);
  };

  return (
    <>
      <SearchBar
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        SearchApartments={() => {
          SearchApartments();
        }}
      />
      <ScrollView>
        <View style={styles.container}>{renderApartments()}</View>
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
