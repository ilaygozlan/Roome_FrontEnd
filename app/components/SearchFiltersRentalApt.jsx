import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
/*import DateTimePickerModal from "@react-native-community/datetimepicker";*/

const colors = {
  primary: "#E3965A",
  background: "#FDEAD7",
  textDark: "#333",
  border: "#ccc",
};

const propertyTypes = [
  "דירה",
  "פנטהאוז",
  "דופלקס",
  "דירת גן",
  "בית פרטי",
  "דו משפחתי",
];

const features = ["חניה", "ממ\"ד", "חצר"];

export default function SearchFiltersRentalApt({ onFilter }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedPropertyType, setSelectedPropertyType] = useState(null);
  const [selectedFeatures, setSelectedFeatures] = useState(
    new Array(features.length).fill(false)
  );
  const [entryDate, setEntryDate] = useState(null);

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const toggleFeature = (index) => {
    const updated = [...selectedFeatures];
    updated[index] = !updated[index];
    setSelectedFeatures(updated);
  };

  return (
    <View style={styles.container}>
      {/* כפתור פתיחה וסגירה */}
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.toggleButtonText}>
          {expanded ? "סגור סינון מתקדם" : "סינון מתקדם"}
        </Text>
      </TouchableOpacity>

      {expanded && (
        <ScrollView contentContainerStyle={styles.content}>
          {/* תאריך כניסה */}
          <TouchableOpacity
            style={styles.dateBox}
            onPress={() => setDatePickerVisibility(true)}
          >
            <Text style={styles.dateLabel}>כניסה החל מתאריך</Text>
            <Text style={styles.dateValue}>
              {entryDate ? entryDate.toLocaleDateString("he-IL") : "בחר תאריך"}
            </Text>
          </TouchableOpacity>

          {/* סוג הנכס */}
          <Text style={styles.sectionTitle}>סוג הנכס</Text>
          <View style={styles.propertyGrid}>
            {propertyTypes.map((type, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.typeBox,
                  selectedPropertyType === index && styles.typeBoxSelected,
                ]}
                onPress={() =>
                  setSelectedPropertyType(
                    selectedPropertyType === index ? null : index
                  )
                }
              >
                <Text
                  style={[
                    styles.typeText,
                    selectedPropertyType === index && { color: colors.primary },
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* תכונות */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <TouchableOpacity
                key={index}
                style={styles.featureRow}
                onPress={() => toggleFeature(index)}
              >
                <Ionicons
                  name={
                    selectedFeatures[index] ? "checkbox" : "square-outline"
                  }
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.featureText}>{feature}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* כפתור חיפוש */}
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => {
              onFilter &&
                onFilter({
                  entryDate,
                  propertyType:
                    selectedPropertyType !== null
                      ? propertyTypes[selectedPropertyType]
                      : null,
                  features: features.filter((_, i) => selectedFeatures[i]),
                });
              setExpanded(false);
            }}
          >
            <Text style={styles.searchButtonText}>חיפוש</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* בוחר תאריכים */}
      {/*<DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={(date) => {
          setDatePickerVisibility(false);
          setEntryDate(date);
        }}
        onCancel={() => setDatePickerVisibility(false)}
        locale="he-IL"
        minimumDate={new Date()} // לא מאפשר לבחור תאריך בעבר
      />*/}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
  },
  toggleButton: {
    alignSelf: "center",
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#f2f2f2",
  },
  toggleButtonText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  content: {
    maxHeight: 400,
    gap: 20,
  },
  dateBox: {
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    padding: 12,
  },
  dateLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    textAlign: "right",
  },
  dateValue: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "right",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
  },
  propertyGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "flex-start",
  },
  typeBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
  },
  typeBoxSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  typeText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textDark,
    textAlign: "center",
  },
  featuresContainer: {
    marginTop: 10,
  },
  featureRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    color: colors.textDark,
  },
  searchButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
    alignItems: "center",
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});