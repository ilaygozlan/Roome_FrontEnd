// app/Map.jsx
import React, { useEffect, useState, useContext } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Dimensions } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { ApartmentContext } from "./contex/ActiveApartmentContext";
import * as Location from "expo-location";

export default function Map() {
  const { apartments } = useContext(ApartmentContext);
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });

      setLoading(false);
    })();
  }, []);

  const renderMarkers = () => {
    return apartments.map((apt, index) => {
      const lat = apt.latitude;
      const lng = apt.longitude;

      if (!lat || !lng) return null;

      return (
        <Marker
          key={index}
          coordinate={{ latitude: lat, longitude: lng }}
          title={apt.title}
          description={apt.description || "Apartment"}
        />
      );
    });
  };

  if (loading || !region) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Loading map...</Text>
      </View>
    );
  }

  return (
    <MapView style={styles.map} region={region}>
      {renderMarkers()}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
