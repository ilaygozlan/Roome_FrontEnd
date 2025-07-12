import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import NewLoadingSign from "./NewLoadingSign";
import { Alert } from "react-native";
import API from "../../config";

const labelToIcon = {
  couch: <FontAwesome5 name="couch" size={24} />,
  sofa: <FontAwesome5 name="couch" size={24} />,
  armchair: <MaterialCommunityIcons name="seat" size={24} />,
  chair: <MaterialIcons name="chair" size={24} />,
  table: <MaterialIcons name="table-restaurant" size={24} />,
  "coffee table": <MaterialCommunityIcons name="coffee" size={24} />,
  "dining table": <MaterialIcons name="table-restaurant" size={24} />,
  desk: <MaterialCommunityIcons name="desk" size={24} />,
  bed: <FontAwesome5 name="bed" size={24} />,
  "bunk bed": <MaterialCommunityIcons name="bunk-bed" size={24} />,
  mattress: <MaterialCommunityIcons name="bed-king" size={24} />,
  dresser: <MaterialCommunityIcons name="dresser" size={24} />,
  wardrobe: <MaterialCommunityIcons name="wardrobe" size={24} />,
  tv: <MaterialIcons name="tv" size={24} />,
  television: <MaterialIcons name="tv" size={24} />,
  lamp: <MaterialIcons name="emoji-objects" size={24} />,
  chandelier: <MaterialCommunityIcons name="chandelier" size={24} />,
  "light fixture": <MaterialCommunityIcons name="ceiling-light" size={24} />,
  bookshelf: <MaterialCommunityIcons name="bookshelf" size={24} />,
  mirror: <MaterialCommunityIcons name="mirror" size={24} />,
  rug: <MaterialCommunityIcons name="rug" size={24} />,
  curtain: <MaterialCommunityIcons name="curtains" size={24} />,
  blinds: <MaterialCommunityIcons name="blinds" size={24} />,
  balcony: <MaterialCommunityIcons name="balcony" size={24} />,
  "patio furniture": <MaterialCommunityIcons name="table-chair" size={24} />,
  "outdoor chair": <MaterialIcons name="chair-alt" size={24} />,
  "outdoor table": <MaterialIcons name="table-restaurant" size={24} />,
  "bar stool": <MaterialCommunityIcons name="stool" size={24} />,
  vanity: <MaterialCommunityIcons name="vanity-light" size={24} />,
  ottoman: <MaterialCommunityIcons name="stool-outline" size={24} />,
  "bean bag": <MaterialCommunityIcons name="stool" size={24} />,
  sideboard: <MaterialCommunityIcons name="sofa-outline" size={24} />,
  "console table": <MaterialCommunityIcons name="table-furniture" size={24} />,
  "shoe rack": <MaterialCommunityIcons name="shoe-formal" size={24} />,
  "air conditioner": (
    <MaterialCommunityIcons name="air-conditioner" size={24} />
  ),
  shower: <MaterialIcons name="shower" size={24} />,
  "washing machine": (
    <MaterialCommunityIcons name="washing-machine" size={24} />
  ),
  dryer: <MaterialCommunityIcons name="tumble-dryer" size={24} />,
  "swimming pool": <MaterialCommunityIcons name="pool" size={24} />,
  garden: <MaterialCommunityIcons name="flower" size={24} />,
  yard: <MaterialCommunityIcons name="grass" size={24} />,
  elevator: <MaterialCommunityIcons name="elevator" size={24} />,
  parking: <MaterialIcons name="local-parking" size={24} />,
  garage: <MaterialCommunityIcons name="garage" size={24} />,
  dishwasher: <MaterialCommunityIcons name="dishwasher" size={24} />,
  microwave: <MaterialCommunityIcons name="microwave" size={24} />,
  oven: <MaterialCommunityIcons name="stove" size={24} />,
  fridge: <MaterialCommunityIcons name="fridge-outline" size={24} />,
  refrigerator: <MaterialCommunityIcons name="fridge-outline" size={24} />,
  stove: <MaterialCommunityIcons name="stove" size={24} />,
  "security camera": <MaterialCommunityIcons name="security" size={24} />,
  intercom: <MaterialCommunityIcons name="home-account" size={24} />,
  jacuzzi: <MaterialCommunityIcons name="hot-tub" size={24} />,
};

const labelTranslations = {
  couch: "ספה",
  sofa: "ספה",
  armchair: "כורסה",
  chair: "כיסא",
  bench: "ספסל",
  table: "שולחן",
  "coffee table": "שולחן קפה",
  "dining table": "שולחן אוכל",
  desk: "שולחן כתיבה",
  nightstand: "שידה ליד המיטה",
  bed: "מיטה",
  "bunk bed": "מיטת קומותיים",
  mattress: "מזרן",
  dresser: "שידה",
  wardrobe: "ארון בגדים",
  closet: "ארון",
  tv: "טלוויזיה",
  television: "טלוויזיה",
  "tv stand": "שידת טלוויזיה",
  "entertainment unit": "מערכת בידור",
  lamp: "מנורה",
  chandelier: "נברשת",
  "light fixture": "גוף תאורה",
  bookshelf: "כוורת ספרים",
  bookcase: "כוורת ספרים",
  shelf: "מדף",
  cabinet: "ארונית",
  drawer: "מגירה",
  mirror: "מראה",
  rug: "שטיח",
  carpet: "שטיח",
  curtain: "וילון",
  blinds: "תריסים",
  balcony: "מרפסת",
  "patio furniture": "ריהוט חוץ",
  "outdoor chair": "כיסא חוץ",
  "outdoor table": "שולחן חוץ",
  "bar stool": "שרפרף בר",
  vanity: "שידת איפור",
  ottoman: "הדום",
  "bean bag": "פוף",
  recliner: "כורסה נפתחת",
  sideboard: "שידת צד",
  "console table": "קונסולה",
  "shoe rack": "מתקן לנעליים",
  "air conditioner": "מזגן",
  ac: "מזגן",
  shower: "מקלחת",
  "washing machine": "מכונת כביסה",
  dryer: "מייבש כביסה",
  "swimming pool": "בריכה",
  pool: "בריכה",
  garden: "גן",
  yard: "חצר",
  terrace: "טרסה",
  elevator: "מעלית",
  parking: "חניה",
  garage: "מוסך",
  dishwasher: "מדיח כלים",
  microwave: "מיקרוגל",
  oven: "תנור אפייה",
  fridge: "מקרר",
  refrigerator: "מקרר",
  stove: "כיריים",
  "security camera": "מצלמת אבטחה",
  intercom: "אינטרקום",
  jacuzzi: "ג׳קוזי",
};

const ApartmentLabelsPopup = ({
  apartmentId,
  onClose,
  onUpdateApartment,
  setLabelsP,
}) => {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLabels, setSelectedLabels] = useState([]);

  useEffect(() => {
    fetchLabels();
  }, []);

  const fetchLabels = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://roomebackend20250414140006.azurewebsites.net/api/ApartmentLabel/detect/${apartmentId}`,
        { method: "POST" }
      );
      const data = await res.json();
      const detected = Array.from(data.labels).map((l) => l.toLowerCase());
      setLabels(detected);
      setSelectedLabels(detected);
    } catch (err) {
      console.error("Error fetching labels:", err);
    }
    setLoading(false);
  };

  const allLabels = Object.keys(labelToIcon);

  const toggleLabel = (label) => {
    setSelectedLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const createApartmentLabel = async () => {
    try {
      console.log(selectedLabels.join(","));
      const response = await fetch(API + "ApartmentLabel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: 0,
          apartmentId: apartmentId,
          label: selectedLabels.join(","),
          createdAt: "2025-07-12T06:10:38.972Z",
        }),
      });
      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        result = { message: text };
      }
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Request failed");
      }

      console.log("Success:", result);
      Alert.alert("הצלחה", "התווסף תוית לדירה בהצלחה!");
      await refreshApartment();
      onClose();
    } catch (error) {
      console.error("Error creating apartment label:", error);
      Alert.alert("שגיאה", "אירעה שגיאה בהוספת תוית לדירה:\n");
    }
  };
  const refreshApartment = async () => {
    try {
      const res = await fetch(
        API + `Apartment/GetApartmentById/${apartmentId}`
      );
      if (!res.ok) throw new Error("Failed to fetch updated apartment");
      const updatedApt = await res.json();

      onUpdateApartment(updatedApt, selectedLabels);
    } catch (err) {
      console.error("Error refreshing apartment:", err);
    }
  };

  if (loading) {
    return <NewLoadingSign />;
  }
  return (
    <Modal
      visible={true}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.title}>בחר רהיטים:</Text>

          <>
            <ScrollView contentContainerStyle={styles.iconGrid}>
              {allLabels.map((label, i) => {
                const isSelected = selectedLabels.includes(label);
                return (
                  <TouchableOpacity
                    key={i}
                    style={styles.iconItem}
                    onPress={() => toggleLabel(label)}
                  >
                    <View style={{ opacity: isSelected ? 1 : 0.3 }}>
                      {React.cloneElement(labelToIcon[label], {
                        color: isSelected ? "orange" : "#666",
                      })}
                    </View>
                    <Text
                      style={[
                        styles.labelText,
                        { color: isSelected ? "orange" : "#666" },
                      ]}
                    >
                      {labelTranslations[label] || label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={styles.addButton}
              onPress={createApartmentLabel}
            >
              <Text style={styles.addButtonText}>הוסף</Text>
            </TouchableOpacity>
          </>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    width: "90%",
    maxHeight: "85%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
  },
  closeButton: {
    alignSelf: "flex-end",
  },
  closeText: {
    fontSize: 22,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    alignSelf: "center",
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  iconItem: {
    alignItems: "center",
    margin: 6,
    width: "18%",
  },
  labelText: {
    fontSize: 10,
    textAlign: "center",
    marginTop: 3,
  },
  addButton: {
    marginTop: 20,
    backgroundColor: "#E3965A",
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default ApartmentLabelsPopup;
