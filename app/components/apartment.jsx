import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  Share,
  Linking,
  Platform,
} from "react-native";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "expo-router";
import LikeButton from "./LikeButton";
import OpenHouseButton from "./OpenHouseButton";
import SearchBar from "./SearchBar";
import ApartmentGallery from "./ApartmentGallery";
import { ActiveApartmentContext } from "../contex/ActiveApartmentContext";
import ApartmentDetails from "../ApartmentDetails";
import { userInfoContext } from "../contex/userInfoContext";
//hey
export default function Apartment(props) {
  const { allApartments, setAllApartments } = useContext(
    ActiveApartmentContext
  );
  const { loginUserId } = useContext(userInfoContext);
  const [previewSearchApt, setPreviewSearchApt] = useState(allApartments);
  const [showApartmentDetails, setShowApartmentDetails] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const router = useRouter();
  const [index, setIndex]= useState(true);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [priceRange, setPriceRange] = useState([100, 10000]);

  // Share via WhatsApp
  const handleShareApartment = async (apt) => {
    const message = `דירה שווה שמצאתי באפליקציה:\n\nמיקום: ${apt.Location}\nמחיר: ${apt.Price} ש\"ח\n\n${apt.Description}`;
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;

    try {
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        alert("WhatsApp is not installed or not supported on this device.");
      }
    } catch (error) {
      console.error("Error sharing via WhatsApp:", error);
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
              <Text style={styles.title}>{apt.Location}</Text>
              <Text style={styles.description}>{apt.Description}</Text>
              <Text style={styles.price}>{apt.Price} ש"ח</Text>
            </View>
          </TouchableOpacity>
        </View>

        {!props.hideIcons && (
          <View style={styles.iconRow}>
            <TouchableOpacity>
              <LikeButton
                apartmentId={apt.ApartmentID}
                numOfLikes={apt.LikeCount}
                isLikedByUser={apt.IsLikedByUser == 1}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleShareApartment(apt)}>
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
              userOwnerId={apt.UserID}
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
    const newAptArr = allApartments.filter((apt) => {
      const matchesType =
        selectedType === null || apt.ApartmentType === selectedType;

      const matchesPrice =
        apt.Price >= priceRange[0] && apt.Price <= priceRange[1];

      let matchesLocation = true;

      let aptLocationObj = {};

      if (
        apt.Location &&
        apt.Location.trim().startsWith("{") &&
        apt.Location.trim().endsWith("}")
      ) {
        try {
          aptLocationObj = JSON.parse(apt.Location);
        } catch (e) {
          console.warn("Invalid JSON in apt.Location:", apt.Location);
        }
      } else if (apt.Location) {
        // treat plain string as address only
        aptLocationObj = {
          address: apt.Location,
          latitude: null,
          longitude: null,
        };
      }

      if (selectedLocation?.address) {
        const locationTypes = selectedLocation?.types || [];
        const city = extractCityFromAddress(selectedLocation.address);
        const street = extractStreetFromAddress(selectedLocation.address);

        if (locationTypes.includes("country")) {
          matchesLocation = true;
        } else if (locationTypes.includes("locality")) {
          const normalizedCity = normalizeString(city);

          matchesLocation =
            aptLocationObj.address &&
            normalizeString(aptLocationObj.address).includes(normalizedCity);
        } else if (locationTypes.includes("sublocality")) {
          const normalizedAddress = normalizeString(selectedLocation.address);
          const normalizedCity = normalizeString(city);

          matchesLocation =
            (aptLocationObj.address &&
              normalizeString(aptLocationObj.address).includes(
                normalizedAddress
              )) ||
            (aptLocationObj.address &&
              normalizeString(aptLocationObj.address).includes(normalizedCity));
        } else if (locationTypes.includes("street_address")) {
          const normalizedStreet = normalizeString(street);

          matchesLocation =
            (aptLocationObj.address &&
              normalizeString(aptLocationObj.address).includes(
                normalizedStreet
              )) ||
            (aptLocationObj.latitude != null &&
              aptLocationObj.longitude != null &&
              getDistance(
                selectedLocation.latitude,
                selectedLocation.longitude,
                aptLocationObj.latitude,
                aptLocationObj.longitude
              ) < 0.5);
        }
      }

      return matchesType && matchesPrice && matchesLocation;
    });

    setPreviewSearchApt(newAptArr);
    setIndex(false);
  };

  function extractCityFromAddress(address) {
    if (!address) return "";
    const parts = address.split(",");
    if (parts.length >= 2) {
      return parts[parts.length - 2].trim();
    }
    return parts[0].trim();
  }
  function extractStreetFromAddress(address) {
    if (!address) return "";
    const parts = address.split(",");
    return parts[0].trim();
  }
  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // radius of Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  function normalizeString(str) {
    return str?.replace(/[\s\-–"׳"]/g, "").toLowerCase();
  }

  return (
    <>
      <SearchBar
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        SearchApartments={SearchApartments}
        index={index}
        setIndex={setIndex}
        showAllApartments={()=>{setPreviewSearchApt(allApartments)}}
      />
      <ScrollView>
        <View style={styles.container}>{renderApartments()}</View>
      </ScrollView>

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
  typeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "black",
    textTransform: "uppercase",
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
