import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  LayoutAnimation,
  Platform,
  ScrollView,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * @component SearchFilters
 * @description Advanced search filters component for apartment and roommate searching.
 * Provides extensive filtering options including dates, gender preferences, amenities, and more.
 *
 * Features:
 * - Expandable/collapsible interface
 * - Date range selection (entry/exit dates)
 * - Gender preference filtering
 * - Amenities checklist
 * - Icon-based feature selection
 * - Responsive layout with animations
 *
 * Filter Categories:
 * - Date Range
 * - Gender Preferences
 * - Roommate Preferences
 * - Amenities
 * - Property Features
 *
 * @param {Object} props
 * @param {Function} props.onSearch - Callback function that receives the filter selections
 */

// Constants
const colors = {
  primary: "#E3965A",
  background: "#FDEAD7",
  textDark: "#333",
  border: "#ccc",
};

/**
 * Available gender filter options
 * @constant
 * @type {Array<string>}
 */
const genderOptions = ["אין העדפה", "רק גברים", "רק נשים"];

/**
 * Available roommate filter options
 * @constant
 * @type {Array<string>}
 */
const roommateFilters = [
  "מאפשרים חיות מחמד",
  "חניה",
  "ביטול ללא קנס",
  "מיזוג אוויר",
  "חצר / מרפסת",
  "מותר לעשן",
  "מרוהטת",
];

/**
 * Icon-based feature options
 * @constant
 * @type {Array<Object>}
 */
const iconOptions = [
  { id: "wifi", name: "wifi", label: "אינטרנט" },
  { id: "happy", name: "happy-outline", label: "חברתי" },
  { id: "anchor", name: "navigate-outline", label: "יציבות" },
  { id: "headphones", name: "headset-outline", label: "שקט" },
  { id: "bus", name: "bus-outline", label: "תחבורה" },
  { id: "tv", name: "tv-outline", label: "טלוויזיה" },
  { id: "key", name: "key-outline", label: "גישה" },
];

export default function SearchFilters( {
  SearchApartments,
  initialEntryDate,
  initialExitDate,
  initialGenderIndex,
  initialRoommateOptions,
  initialSelectedIcons
}) {
  const [expanded, setExpanded] = useState(true);
const [entryDate, setEntryDate] = useState(initialEntryDate || null);
const [exitDate, setExitDate] = useState(initialExitDate || null);
const [selectedGender, setSelectedGender] = useState(initialGenderIndex ?? null);
const [roommateOptions, setRoommateOptions] = useState(initialRoommateOptions || new Array(roommateFilters.length).fill(false));
const [selectedIcons, setSelectedIcons] = useState(initialSelectedIcons || []);

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [dateType, setDateType] = useState("entry");

  const toggleOption = (index) => {
    const updated = [...roommateOptions];
    updated[index] = !updated[index];
    setRoommateOptions(updated);
  };

  const toggleIcon = (id) => {
    setSelectedIcons((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDateConfirm = (date) => {
    setDatePickerVisibility(false);
    if (dateType === "entry") {
      if (exitDate && date > exitDate) {
        setExitDate(null);
      }
      setEntryDate(date);

      setTimeout(() => {
        setDateType("exit");
        setDatePickerVisibility(true);
      }, 300);
    } else {
      if (entryDate && date <= entryDate) {
        alert("תאריך יציאה חייב להיות אחרי תאריך כניסה");
        return;
      }
      setExitDate(date);
    }
  };

  return (
    <View style={styles.container}>
      {expanded && (
        <ScrollView>
          {/* date */}
          <View style={styles.dateSection}>
            <TouchableOpacity
              style={styles.dateBox}
              onPress={() => {
                setDateType("entry");
                setDatePickerVisibility(true);
              }}
            >
              <Text style={styles.dateLabel}>תאריך כניסה</Text>
              <Text style={styles.dateValue}>
                {entryDate
                  ? entryDate.toLocaleDateString("he-IL")
                  : "בחר תאריך"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateBox}
              onPress={() => {
                setDateType("exit");
                setDatePickerVisibility(true);
              }}
            >
              <Text style={styles.dateLabel}>תאריך יציאה</Text>
              <Text style={styles.dateValue}>
                {exitDate ? exitDate.toLocaleDateString("he-IL") : "בחר תאריך"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* gender */}
          <View style={styles.genderRow}>
            {genderOptions.map((gender, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.genderButton,
                  selectedGender === index && styles.genderButtonSelected,
                ]}
                onPress={() =>
                  setSelectedGender(selectedGender === index ? null : index)
                }
              >
                <Text
                  style={[
                    styles.genderText,
                    selectedGender === index && { color: "#fff" },
                  ]}
                >
                  {gender}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* roommate filters */}
          <FlatList
            data={roommateFilters}
            scrollEnabled={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => toggleOption(index)}
              >
                <Ionicons
                  name={roommateOptions[index] ? "checkbox" : "square-outline"}
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.optionText}>{item}</Text>
              </TouchableOpacity>
            )}
          />

          {/* icons */}
          <View style={styles.iconsRow}>
            {iconOptions.map((icon) => {
              const isSelected = selectedIcons.includes(icon.id);
              return (
                <TouchableOpacity
                  key={icon.id}
                  onPress={() => toggleIcon(icon.id)}
                  style={styles.iconWrapper}
                >
                  <Ionicons
                    name={icon.name}
                    size={28}
                    color={isSelected ? colors.primary : "#888"}
                  />
                  <Text
                    style={[
                      styles.iconLabel,
                      isSelected && {
                        color: colors.primary,
                        fontWeight: "bold",
                      },
                    ]}
                  >
                    {icon.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* search button */}
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => {
              SearchApartments({
                entryDate,
                exitDate,
                gender: genderOptions[selectedGender],
                filters: roommateFilters.filter((_, i) => roommateOptions[i]),
                icons: selectedIcons,
              });
              setExpanded(false);
            }}
          >
            <Text style={styles.searchButtonText}>חיפוש</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={() => setDatePickerVisibility(false)}
          locale="he-IL"
          style={{ zIndex: 9999 }}
          minimumDate={
            dateType === "exit" && entryDate
              ? new Date(entryDate.getTime() + 24 * 60 * 60 * 1000)
              : new Date()
          }
        />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: -5,
    padding: 10,
    backgroundColor: "#ffffffff",
    borderRadius: 10,
  },
  advancedToggle: {
    alignSelf: "center",
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#f2f2f2",
  },
  advancedToggleText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  genderRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 10,
  },
  genderButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 5,
  },
  genderButtonSelected: {
    backgroundColor: colors.primary,
  },
  genderText: {
    color: colors.textDark,
    fontWeight: "500",
  },
  optionRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginVertical: 8,
    gap: 10,
  },
  optionText: {
    fontSize: 14,
    color: colors.textDark,
  },
  iconsRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 20,
    marginTop: 20,
  },
  iconWrapper: {
    alignItems: "center",
    padding: 8,
  },
  iconLabel: {
    marginTop: 4,
    fontSize: 12,
    color: "#555",
    textAlign: "center",
  },
  searchButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 30,
    alignItems: "center",
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  scrollContainer: {
    maxHeight: 500,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  dateSection: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 15,
    gap: 10,
  },
  dateBox: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    padding: 12,
  },
  dateLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    textAlign: "right",
  },
  dateValue: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "right",
  },
});
