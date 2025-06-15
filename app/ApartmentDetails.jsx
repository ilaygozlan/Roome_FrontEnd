// ApartmentDetails.jsx (React Native)
// Includes all logic to fetch updated apartment info and detected labels

import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Modal,
  FlatList,
} from "react-native";
import Constants from "expo-constants";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import API from "../config";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import UserProfile from "./UserProfile";
import ApartmentGallery from "./components/ApartmentGallery";
import ApartmentReview from "./components/apartmentReview";

const { width } = Dimensions.get("window");

export default function ApartmentDetails({ apt, onClose }) {
  const router = useRouter();
  const navigation = useNavigation();
  const carouselRef = useRef(null);

  const [activeSlide, setActiveSlide] = useState(0);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [updatedApt, setUpdatedApt] = useState(apt);
  const [detectedLabels, setDetectedLabels] = useState([]);

  const fetchUpdatedApartment = async () => {
  try {
    const res = await fetch(`${API}Apartment/GetApartmentById/${apt.ApartmentID}`);
    
    // Check response status
    if (!res.ok) {
      const text = await res.text(); // Log full response text for debugging
      console.error("Server error (non-JSON):", text);
      return;
    }

    const data = await res.json();
    setUpdatedApt(data);
  } catch (err) {
    console.error("Failed to fetch updated apartment:", err);
  }
};

  const fetchLabels = async () => {
  try {
    const res = await fetch(`${API}UploadImage/GetLabelSummaryByApartment/${apt.ApartmentID}`);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.warn("Label fetch failed with response:", errorText);
      return;
    }

    const data = await res.json();
    setDetectedLabels(data);
  } catch (err) {
    console.error("Failed to fetch detected labels:", err);
  }
};


  useEffect(() => {
    fetchUpdatedApartment();
    fetchLabels();
  }, []);

  useEffect(() => {
    if (updatedApt.Images) {
      fetchLabels();
    }
  }, [updatedApt.Images]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await fetch(`${API}User/GetUserById/${apt.UserID}`);
        const data = await res.json();
        setUserInfo(data);
      } catch (err) {
        console.error("Failed to fetch user info:", err);
      }
    };

    if (apt.UserID) fetchUserInfo();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRef.current && updatedApt.ApartmentType === 1 && updatedApt.Roommates) {
        const roommates = parseRoommates(updatedApt.Roommates);
        const nextIndex = (activeSlide + 1) % roommates.length;
        carouselRef.current.scrollTo({ x: nextIndex * width, animated: true });
        setActiveSlide(nextIndex);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeSlide, updatedApt]);

  const getTypeName = (type) => {
    switch (type) {
      case 0: return "השכרה";
      case 1: return "שותפים";
      case 2: return "סאבלט";
      default: return "לא ידוע";
    }
  };

  const parseRoommates = (info) => {
    if (!info) return [];
    const roommateStrings = info.split("||").map((r) => r.trim()).filter(Boolean);
    return roommateStrings.map((rm) => {
      const parts = rm.split("|").map((p) => p.trim());
      const details = {};
      parts.forEach((part) => {
        const [key, value] = part.split(":");
        if (key && value && value.trim() !== "N/A" && value.trim().toLowerCase() !== "null") {
          details[key.trim()] = value.trim();
        }
      });
      return details;
    });
  };

  const renderExtraDetails = () => {
    switch (updatedApt.ApartmentType) {
      case 0:
        return (
          <>
            <View style={styles.detailRow}><MaterialIcons name="calendar-today" size={16} color="#E3965A" /><Text style={styles.detail}>משך חוזה: {updatedApt.Rental_ContractLength} חודשים</Text></View>
            <View style={styles.detailRow}><FontAwesome5 name="sync" size={16} color="#E3965A" /><Text style={styles.detail}>הארכה אפשרית: {updatedApt.Rental_ExtensionPossible ? "כן" : "לא"}</Text></View>
          </>
        );
      case 1:
        return (
          <View style={styles.detailRow}><FontAwesome5 name="users" size={16} color="#E3965A" /><Text style={styles.detail}>מס' שותפים: {updatedApt.Shared_NumberOfRoommates}</Text></View>
        );
      case 2:
        return (
          <>
            <View style={styles.detailRow}><MaterialIcons name="cancel" size={16} color="#E3965A" /><Text style={styles.detail}>ביטול ללא קנס: {updatedApt.Sublet_CanCancelWithoutPenalty ? "כן" : "לא"}</Text></View>
            <View style={styles.detailRow}><MaterialIcons name="home" size={16} color="#E3965A" /><Text style={styles.detail}>נכס שלם: {updatedApt.Sublet_IsWholeProperty ? "כן" : "לא"}</Text></View>
          </>
        );
      default:
        return null;
    }
  };

  const renderImages = () => {
    const images = typeof updatedApt.Images === "string"
      ? updatedApt.Images.split("||").filter(Boolean)
      : updatedApt.Images || [];

    return <ApartmentGallery images={images} />;
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={[]}
        ListHeaderComponent={
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.backButton}>
                <Text style={styles.backText}>←</Text>
              </TouchableOpacity>
            </View>

            {renderImages()}
            <Text style={styles.title}>{updatedApt.Location}</Text>
            <Text style={styles.price}>{updatedApt.Price} ש"ח</Text>
            <Text style={styles.description}>{updatedApt.Description}</Text>

            {detectedLabels.length > 0 && (
              <View style={{ marginTop: 10 }}>
                <Text style={{ fontWeight: "bold", textAlign: "right" }}>תוויות שזוהו:</Text>
                <Text style={{ textAlign: "right", color: "#555" }}>{detectedLabels.map(l => l.Label || l.LabelName).join(", ")}</Text>
              </View>
            )}

            <Text style={styles.sectionTitle}>סוג דירה: {getTypeName(updatedApt.ApartmentType)}</Text>

            <View style={styles.detailRow}><MaterialIcons name="meeting-room" size={16} color="#E3965A" /><Text style={styles.detail}>חדרים: {updatedApt.AmountOfRooms}</Text></View>
            <View style={styles.detailRow}><MaterialIcons name="pets" size={16} color={updatedApt.AllowPet ? "#E3965A" : "#ccc"} /><Text style={styles.detail}>חיות מחמד: {updatedApt.AllowPet ? "מותר" : "אסור"}</Text></View>
            <View style={styles.detailRow}><MaterialIcons name="smoking-rooms" size={16} color={updatedApt.AllowSmoking ? "#E3965A" : "#ccc"} /><Text style={styles.detail}>עישון: {updatedApt.AllowSmoking ? "מותר" : "אסור"}</Text></View>
            <View style={styles.detailRow}><MaterialIcons name="local-parking" size={16} color={updatedApt.ParkingSpace > 0 ? "#E3965A" : "#ccc"} /><Text style={styles.detail}>חניה: {updatedApt.ParkingSpace}</Text></View>
            <View style={styles.detailRow}><MaterialIcons name="event-available" size={16} color="#E3965A" /><Text style={styles.detail}>תאריך כניסה: {updatedApt.EntryDate?.split("T")[0]}</Text></View>
            {updatedApt.ExitDate && <View style={styles.detailRow}><MaterialIcons name="event-busy" size={16} color="#E3965A" /><Text style={styles.detail}>תאריך יציאה: {updatedApt.ExitDate?.split("T")[0]}</Text></View>}

            {renderExtraDetails()}

            {userInfo && (
              <TouchableOpacity onPress={() => setShowUserProfile(true)} style={styles.uploaderContainer}>
                <Image source={{ uri: userInfo.profilePicture || "https://example.com/default-profile.png" }} style={styles.uploaderImage} />
                <Text style={styles.uploaderName}>מפורסם ע"י: {userInfo.fullName}</Text>
              </TouchableOpacity>
            )}

            <ApartmentReview apartmentId={updatedApt.ApartmentID} />
          </View>
        }
      />

      <Modal visible={showUserProfile} animationType="slide" onRequestClose={() => setShowUserProfile(false)}>
        <UserProfile userId={apt.UserID} onClose={() => setShowUserProfile(false)} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 15, paddingVertical: 10, paddingTop: Constants.statusBarHeight + 15, backgroundColor: "#fff" },
  backButton: { padding: 5, marginRight: 10 },
  backText: { fontSize: 24, color: "#E3965A", fontWeight: "bold" },
  title: { fontSize: 20, fontWeight: "bold", textAlign: "right", marginTop: 10 },
  price: { fontSize: 18, fontWeight: "bold", textAlign: "right", color: "green", marginTop: 5 },
  description: { fontSize: 16, textAlign: "right", marginTop: 10, color: "#555" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginTop: 20, textAlign: "right" },
  detailRow: { flexDirection: "row-reverse", alignItems: "center", marginTop: 5 },
  detail: { fontSize: 15, textAlign: "right", marginHorizontal: 8, color: "#444" },
  uploaderContainer: { flexDirection: "row-reverse", alignItems: "center", marginTop: 20, backgroundColor: "#f9f9f9", padding: 10, borderRadius: 8 },
  uploaderImage: { width: 50, height: 50, borderRadius: 25, marginLeft: 10 },
  uploaderName: { fontSize: 16, color: "#333", fontWeight: "bold" },
});
