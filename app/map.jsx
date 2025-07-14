/**
 * @component Map
 * @description Interactive map component that displays apartment locations with markers.
 * Uses device location and apartment data to show available properties on a map interface.
 *
 * Features:
 * - Current location detection
 * - Permission handling
 * - Interactive markers for apartments
 * - Price and description tooltips
 * - Back navigation
 * - Loading state handling
 *
 * Dependencies:
 * - react-native-maps
 * - expo-location
 * - expo-router
 *
 * Context:
 * - ActiveApartmentContext for apartment data
 *
 * @requires react-native-maps
 * @requires expo-location
 * @requires expo-router
 */

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
import { Callout } from "react-native-maps";
import HouseLoading from "./components/LoadingHouseSign";
export default function Map() {
  const { mapLocationAllApt, setAllApartments } = useContext(
    ActiveApartmentContext
  );
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /**
   * Location permission and initialization effect
   * @effect
   * Handles:
   * - Location permission request
   * - Current position detection
   * - Initial map region setup
   */
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

  /**
   * Renders apartment markers on the map
   * @function renderMarkers
   * @returns {Array<JSX.Element>} Array of Marker components
   *
   * Marker Properties:
   * - Location coordinates
   * - Price display
   * - Apartment description
   */
  const renderMarkers = () => {
    return mapLocationAllApt.map((apt, index) => {
      if (
        apt.Location &&
        typeof apt.Location === "string" &&
        apt.Location.trim().startsWith("{")
      ) {
        const address = JSON.parse(apt.Location);
        const lat = address.latitude;
        const lng = address.longitude;

        if (lat && lng) {
          return (
            <Marker
              key={index}
              coordinate={{ latitude: lat, longitude: lng }}
              title={apt.Price?.toLocaleString("he-IL") + " ₪"}
              description={apt.Description || "אין תיאור"}
              
            >
            </Marker>
          );
        }
      }
    });
  };

  if (loading || !region) {
    return <HouseLoading text="מעלה דירות על המפה" />;
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

/**
 * Component styles
 * @constant
 * @type {Object}
 */
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
  callout: {
    width: 200,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "right",
    color: "#333",
  },
  calloutDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
    textAlign: "right",
  },
  calloutButton: {
    backgroundColor: "#5C67F2",
    paddingVertical: 8,
    borderRadius: 5,
  },
  calloutButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});
