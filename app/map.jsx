import React, { useRef, useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import MapView from "react-native-maps";
import { ActiveApartmentContext } from "./contex/ActiveApartmentContext";

export default function MapScreen() {
  const navigation = useNavigation();
  const mapRef = useRef(null);
  const [positions, setPositions] = useState({});

  // Get apartments from context
  const { allApartments, setAllApartments } = useContext(ActiveApartmentContext);
  const apartments = allApartments;

  // Fetch coordinates from address using OpenStreetMap API (Nominatim)
  const fetchCoordinates = async (address) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
        {
          headers: {
            "User-Agent": "RoomeApp/1.0 (ofri900@email.com)", // Required by Nominatim
          },
        }
      );
      const data = await response.json();
      if (data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        };
      }
      return null;
    } catch (error) {
      console.error("Geocoding failed:", error);
      return null;
    }
  };

  // On initial load: add coordinates to apartments that don't have them
  useEffect(() => {
    const loadCoordinates = async () => {
      const updatedApartments = await Promise.all(
        allApartments.map(async (apt) => {
          if (!apt.latitude || !apt.longitude) {
            const coords = await fetchCoordinates(apt.Location); // Location is address
            return coords ? { ...apt, ...coords } : apt;
          }
          return apt;
        })
      );

      setAllApartments(updatedApartments);
    };

    if (allApartments.length > 0) {
      loadCoordinates();
    }
  }, [allApartments]);

  // Update positions (pixel coordinates) for bubbles on map
  const updateBubblePositions = async () => {
    if (mapRef.current) {
      const newPositions = {};

      for (const apt of apartments) {
        if (!apt.latitude || !apt.longitude) continue;

        try {
          const point = await mapRef.current.pointForCoordinate({
            latitude: apt.latitude,
            longitude: apt.longitude,
          });
          newPositions[apt.ApartmentID] = point;
        } catch (error) {
          console.log("Error:", error);
        }
      }

      setPositions(newPositions);
    }
  };

  // Recalculate bubble positions when apartments change
  useEffect(() => {
    if (mapRef.current) {
      updateBubblePositions();
    }
  }, [apartments]);

  // Navigate to apartment detail screen
  const handlePricePress = (apartment) => {
    navigation.navigate("ApartmentDetails", {
      apartment: JSON.stringify(apartment),
    });
  };

  return (
    // ScrollView used to isolate this screen, with nested scroll handling
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled={true}
    >
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.map}
          onRegionChangeComplete={updateBubblePositions}
          initialRegion={{
            latitude: 31.5,
            longitude: 34.8,
            latitudeDelta: 3,
            longitudeDelta: 3,
          }}
        />

        {/* Price bubbles for each apartment */}
        {apartments.map((apt) =>
          positions[apt.ApartmentID] ? (
            <TouchableOpacity
              key={apt.ApartmentID}
              style={[
                styles.priceBubble,
                {
                  top: positions[apt.ApartmentID].y - 30,
                  left: positions[apt.ApartmentID].x - 30,
                },
              ]}
              onPress={() => handlePricePress(apt)}
            >
              <Text style={styles.priceText}>₪{apt.Price}</Text>
            </TouchableOpacity>
          ) : null
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  priceBubble: {
    position: "absolute",
    backgroundColor: "white",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderColor: "#000",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  priceText: {
    fontWeight: "bold",
    color: "black",
    fontSize: 14,
  },
});
