import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  ScrollView,
  FlatList,
} from "react-native";
/*import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";*/

import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { AntDesign, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import SearchFilters from "./SearchFilters";
import { useRouter } from "expo-router";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import GooglePlacesInput from "./GooglePlacesAPI";

/**
 * @component SearchBar
 * @description Advanced search component for apartment filtering with expandable interface.
 * Provides functionality for filtering apartments by type, location, and price range.
 *
 * Features:
 * - Expandable search interface
 * - Category selection (Rental, Roommates, Sublet)
 * - Price range slider
 * - Location selection
 * - Map view navigation
 * - Search filters integration
 *
 * @param {Object} props
 * @param {number|null} props.selectedType - Currently selected apartment type
 * @param {Function} props.setSelectedType - Function to update selected type
 * @param {string} props.selectedLocation - Currently selected location
 * @param {Function} props.setSelectedLocation - Function to update selected location
 * @param {Array<number>} props.priceRange - Current price range [min, max]
 * @param {Function} props.setPriceRange - Function to update price range
 * @param {Function} props.SearchApartments - Function to trigger apartment search
 */

const colors = {
  primary: "#E3965A",
  background: "#FDEAD7",
};

export default function SearchBar({
  selectedType,
  setSelectedType,
  selectedLocation,
  setSelectedLocation,
  priceRange,
  setPriceRange,
  SearchApartments,
}) {
  const [expanded, setExpanded] = useState(false);
  const [searchInput, setSearchInput] = useState(
    selectedLocation?.address || ""
  );

  const router = useRouter();
  const googlePlacesRef = useRef();

  if (Platform.OS === "android") {
    UIManager.setLayoutAnimationEnabledExperimental &&
      UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  useEffect(() => {
    setSearchInput(selectedLocation?.address || "");
  }, [expanded, selectedLocation]);

  const locations = ["גמישות בחיפוש", "תל אביב", "חיפה", "באר שבע"];
  const categories = [
    { id: 0, name: "השכרה", icon: "home" },
    { id: 1, name: "שותפים", icon: "team" },
    { id: 2, name: "סאבלט", icon: "swap" },
  ];

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      {/* Row: Search bar + Map icon */}
      <View style={styles.searchRow}>
        {/* Search bar */}
        <TouchableOpacity style={styles.searchBar} onPress={toggleExpand}>
          <Ionicons name="search" size={20} color="#000" style={styles.icon} />
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text style={[styles.locationMain, { textAlign: "right" }]}>
              {selectedLocation || selectedType !== null
                ? `${selectedLocation?.address || ""}${
                    selectedLocation && selectedType !== null ? " • " : ""
                  }${
                    selectedType !== null ? categories[selectedType].name : ""
                  }`
                : "מה תרצה לחפש?"}
            </Text>
            <Text style={[styles.locationSub, { textAlign: "right" }]}>
              הוספת מיקום, תאריכים, טווח מחירים
            </Text>
          </View>
        </TouchableOpacity>

        {/* Map icon */}
        <TouchableOpacity
          style={styles.mapIconContainer}
          onPress={() => router.push({ pathname: "/map" })}
        >
          <FontAwesome5 name="map-marked-alt" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {expanded && (
        <View style={styles.expandSection}>
          {/* Google Autocomplete */}
          <View style={{ zIndex: 2, width: "100%", margin: 0 }}>
            <Text style={[styles.label, { marginTop: 0 }]}>בחר מיקום:</Text>
            <GooglePlacesAutocomplete
              placeholder={selectedLocation?.address || "הקלד מיקום..."}
            
              onPress={(data, details = null) => {
                if (details) {
                  const location = details.formatted_address;
                  const lat = details.geometry.location.lat;
                  const lng = details.geometry.location.lng;

                  console.log("📍 Address:", location);
                  console.log("🌍 Latitude:", lat);
                  console.log("🌍 Longitude:", lng);
                  console.log("🌍 type:", details.types);

                  const fullAddress = {
                    address: location,
                    latitude: lat,
                    longitude: lng,
                    types: details.types,
                  };

                  setSelectedLocation(fullAddress);
                }
              }}
              fetchDetails={true}
              query={{
                key: "AIzaSyCy4JnaYp3wvOAUH7-lOA4IFB_tBK9-5BE",
                language: "he",
                components: "country:il",
              }}
              enablePoweredByContainer={false}
              styles={{
                textInput: {
                  height: 48,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  fontSize: 16,
                  marginBottom: 15,
                  textAlign: "right",
                  backgroundColor: "white",
                },
                listView: {
                  position: "absolute",
                  top: 50,
                  zIndex: 1000,
                  elevation: 5, // for Android
                  backgroundColor: "white",
                  width: "100%",
                },
              }}
            />
          </View>

          {/* most common locations*/}
          {/*
           <Text style={[styles.label, { marginTop: 0 }]}>בחר מיקום:</Text>

            <FlatList
              data={locations}
              horizontal
              inverted // makes the list scroll from right to left
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={styles.commonLocations}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = selectedLocation === item;

                return (
                  <TouchableOpacity
                    style={[
                      styles.locationOption,
                      isSelected && {
                        backgroundColor: colors.background,
                        borderColor: colors.primary,
                      },
                    ]}
                    onPress={() => {
                      setSelectedLocation(isSelected ? "" : item);
                    }}
                  >
                    <Text
                      style={[
                        styles.locationOptionText,
                        isSelected && {
                          color: colors.primary,
                          fontWeight: "bold",
                        },
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
            */}
          {/* apartment categories */}
          <Text style={[styles.label, { marginTop: 65 }]}>בחר קטגוריה:</Text>
          <View style={styles.categories}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryBox,
                  selectedType === cat.id && styles.selectedCategory,
                ]}
                onPress={() =>
                  setSelectedType(selectedType === cat.id ? null : cat.id)
                }
              >
                <AntDesign
                  name={cat.icon}
                  size={28}
                  color={selectedType === cat.id ? colors.primary : "gray"}
                  style={{ marginBottom: 5 }}
                />
                <Text style={styles.categoryText}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* select apartment price range */}
          <Text style={[styles.label, { marginTop: 25 }]}>
            בחר טווח מחירים:
          </Text>

          <MultiSlider
            values={priceRange}
            min={0}
            max={20000}
            step={100}
            onValuesChange={(values) => setPriceRange(values)}
            selectedStyle={{ backgroundColor: colors.primary }}
            markerStyle={{ backgroundColor: colors.primary }}
            containerStyle={{ marginHorizontal: 10 }}
          />

          <View style={styles.priceDisplay}>
            <Text style={styles.priceText}>מינימום: {priceRange[0]} ₪</Text>
            <Text style={styles.priceText}>מקסימום: {priceRange[1]} ₪</Text>
          </View>
          <SearchFilters onSearch={(filters) => console.log("🔎", filters)} />
          {/* search btn */}
          <View style={styles.searchButtonContainer}>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => {
                console.log("מיקום שנבחר:", selectedLocation);
                console.log("סוג דירה שנבחר:", selectedType);
                console.log(
                  "טווח מחירים:",
                  `${priceRange[0]} - ${priceRange[1]} `
                );
                SearchApartments();
                setExpanded(false);
              }}
            >
              <Text style={styles.searchButtonText}>חיפוש</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f2f2f2",
    padding: 15,
    elevation: 2,
    alignItems: "center",
    gap: 10,
  },
  searchRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    zIndex: 2,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fefefe",
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 15,
    zIndex: 2,
  },
  icon: {
    marginRight: 10,
  },
  locationMain: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  locationSub: {
    fontSize: 12,
    color: "gray",
  },
  expandSection: {
    marginTop: 0,
    maxHeight: 500,
    padding: 10,
    backgroundColor: "#fefefe",
    zIndex: 1,
    borderRadius: 15,
    width: "100%",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "right",
    marginTop: 20,
  },
  commonLocations: {
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 0,
  },
  locationOption: {
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    margin: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f9f9f9",
  },
  locationOptionText: {
    fontSize: 14,
    color: "#333",
  },
  categories: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  categoryBox: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 10,
    width: 100,
    backgroundColor: "#f9f9f9",
  },
  selectedCategory: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
  },
  searchButtonContainer: {
    marginTop: 10,
    alignItems: "center",
  },

  searchButton: {
    backgroundColor: "#E3965A", 
    paddingVertical: 12,
    paddingHorizontal: 60,
    borderRadius: 25,
    elevation: 3, 
  },

  searchButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  priceDisplay: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 10,
    marginTop: 10,
  },

  priceText: {
    fontSize: 14,
    color: "#555",
  },
  mapIconContainer: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 30,
    elevation: 4,
    alignItems: "center",
    justifyContent: "center",
  },
});
