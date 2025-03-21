import React, { useRef, useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import MapView from "react-native-maps";

const apartments = [
  {
    id: 1,
    title: "דירה בתל אביב",
    latitude: 32.0853,
    longitude: 34.7818,
    price: 9200,
    Location: "תל אביב",
    Description: "דירה מדהימה במרכז תל אביב עם נוף לים",
    Images: "https://example.com/tel-aviv.jpg",
  },
  {
    id: 2,
    title: "דירה בירושלים",
    latitude: 31.7683,
    longitude: 35.2137,
    price: 7800,
    Location: "ירושלים",
    Description: "דירה עם אווירה קסומה במרכז העיר",
    Images: "https://example.com/jerusalem.jpg",
  },
  {
    id: 3,
    title: "דירה בחיפה",
    latitude: 32.794,
    longitude: 34.9896,
    price: 4500,
    Location: "חיפה",
    Description: "דירה מרווחת ליד הים עם מרפסת גדולה",
    Images: "https://example.com/haifa.jpg",
  },
  {
    id: 4,
    title: "דירה באילת",
    latitude: 29.5581,
    longitude: 34.9482,
    price: 5000,
    Location: "אילת",
    Description: "דירה מודרנית ליד הים עם בריכה פרטית",
    Images: "https://example.com/eilat.jpg",
  },
];

export default function MapScreen() {
  const navigation = useNavigation();
  const mapRef = useRef(null);
  const [positions, setPositions] = useState({});

  useEffect(() => {
    if (mapRef.current) {
      updateBubblePositions();
    }
  }, []);

  const updateBubblePositions = async () => {
    if (mapRef.current) {
      const newPositions = {};

      for (const apt of apartments) {
        try {
          const point = await mapRef.current.pointForCoordinate({
            latitude: apt.latitude,
            longitude: apt.longitude,
          });
          newPositions[apt.id] = point;
        } catch (error) {
          console.log("Error:", error);
        }
      }

      setPositions(newPositions);
    }
  };

  const handlePricePress = (apartment) => {
    navigation.navigate("ApartmentDetails", {
      apartment: JSON.stringify(apartment),
    });
  };

  return (
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

      {/* בועות המחירים */}
      {apartments.map((apt) =>
        positions[apt.id] ? (
          <TouchableOpacity
            key={apt.id}
            style={[
              styles.priceBubble,
              {
                top: positions[apt.id].y - 30,
                left: positions[apt.id].x - 30,
              },
            ]}
            onPress={() => handlePricePress(apt)}
          >
            <Text style={styles.priceText}>₪{apt.price}</Text>
          </TouchableOpacity>
        ) : null
      )}
    </View>
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
