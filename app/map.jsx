import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { ActiveApartmentContext } from "./contex/ActiveApartmentContext";
import * as Location from "expo-location";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Map() {
  const { allApartments } = useContext(ActiveApartmentContext);
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
    return allApartments.map((apt, index) => {
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
    <View style={{ flex: 1 }}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Feather name="arrow-left" size={24} color="#fff" />
      </TouchableOpacity>

      <MapView style={styles.map} region={region}>
        {renderMarkers()}
      </MapView>
    </View>
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
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1000,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 10,
    borderRadius: 30,
  },
});
