import React, { useState, useRef } from "react";
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
import { AntDesign, Ionicons } from "@expo/vector-icons";
import SearchFilters from "./SearchFilters";
import SearchFiltersRentalApt from './SearchFiltersRentalApt';

const colors = {
  primary: "#E3965A",
  background: "#FDEAD7",
};

export default function SearchBar() {
  const [expanded, setExpanded] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [priceRange, setPriceRange] = useState([100, 10000]);

  const googlePlacesRef = useRef();

  if (Platform.OS === "android") {
    UIManager.setLayoutAnimationEnabledExperimental &&
      UIManager.setLayoutAnimationEnabledExperimental(true);
  }

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
      {/* שורת חיפוש ראשית כמו ב-Airbnb */}
      <TouchableOpacity style={styles.searchBar} onPress={toggleExpand}>
        <Ionicons name="search" size={20} color="#000" style={styles.icon} />
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <Text style={[styles.locationMain, { textAlign: "right" }]}>
            {selectedLocation || selectedType !== null
              ? `${selectedLocation || ""}${
                  selectedLocation && selectedType !== null ? " • " : ""
                }${selectedType !== null ? categories[selectedType].name : ""}`
              : "מה תרצה לחפש?"}
          </Text>
          <Text style={[styles.locationSub, { textAlign: "right" }]}>
            הוספת מיקום, תאריכים, טווח מחירים
          </Text>
        </View>
      </TouchableOpacity>

      {/* חלק מורחב */}
      {expanded && (
        <ScrollView style={styles.expandSection}>
          {/* Google Autocomplete */}
          {/*<GooglePlacesAutocomplete
            ref={googlePlacesRef}
            placeholder="הקלד מיקום..."
            onPress={(data, details = null) => {
              setSelectedLocation(data.description);
              setExpanded(false); // סגור את החלק המורחב
            }}
            query={{
              key: "YOUR_GOOGLE_API_KEY", // ← תחליף בזה שלך!
              language: "he",
              components: "country:il",
            }}
            fetchDetails={true}
            styles={{
              container: { zIndex: 1000 },
              textInput: {
                backgroundColor: "#f2f2f2",
                borderRadius: 10,
                paddingVertical: 10,
                paddingHorizontal: 15,
                fontSize: 16,
                textAlign: "right",
              },
              listView: { backgroundColor: "#fff" },
            }}
            enablePoweredByContainer={false}
          />*/}

          {/* מיקומים נפוצים */}
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

          {/* קטגוריות דירה */}
          <Text style={[styles.label, { marginTop: 25 }]}>בחר קטגוריה:</Text>
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

          {/* search btn */}
          <View style={styles.searchButtonContainer}>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => {
                // כאן אתה יכול לבצע ניווט או סינון
                console.log("מיקום שנבחר:", selectedLocation);
                console.log("סוג דירה שנבחר:", selectedType);
                console.log(
                  "טווח מחירים:",
                  `${priceRange[0]} - ${priceRange[1]} `
                );
                setExpanded(false);
              }}
            >
              <Text style={styles.searchButtonText}>חיפוש</Text>
            </TouchableOpacity>
          </View>
          <SearchFilters onSearch={(filters) => console.log("🔎", filters)} />
        </ScrollView>
      )}
      
            
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f2f2f2",
    padding: 15,
    elevation: 2,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fefefe",
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 15,
    zIndex:2
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
    marginTop: -35,
    paddingTop: 50,
    maxHeight: 500,
    padding: 10,
    backgroundColor: "#fefefe",
    zIndex: 1,
    borderRadius : 15,
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
    marginTop: 30,
    alignItems: "center",
  },

  searchButton: {
    backgroundColor: "#E3965A", // צבע כתום
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    elevation: 3, // צל
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
});
