import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Modal,
} from "react-native";
import { FlatList } from "react-native";
import Constants from "expo-constants";
import ApartmentReview from "./components/apartmentReview";
import { FontAwesome5, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import API from "../config";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import UserProfile from "./UserProfile";
import ApartmentGallery from "./components/ApartmentGallery";

const { width } = Dimensions.get("window");

export default function ApartmentDetails({ apt, onClose }) {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const carouselRef = useRef(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const navigation = useNavigation();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    console.log("APT CHANGED:", apt.ApartmentID);
  }, [apt]);

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
      if (carouselRef.current && apt.ApartmentType === 1 && apt.Roommates) {
        const roommates = parseRoommates(apt.Roommates);
        const nextIndex = (activeSlide + 1) % roommates.length;
        carouselRef.current.scrollTo({ x: nextIndex * width, animated: true });
        setActiveSlide(nextIndex);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeSlide, apt]);

  const getTypeName = (type) => {
    switch (type) {
      case 0:
        return "השכרה";
      case 1:
        return "שותפים";
      case 2:
        return "סאבלט";
      default:
        return "לא ידוע";
    }
  };

  const parseRoommates = (info) => {
    if (!info) return [];
    const roommateStrings = info
      .split("||")
      .map((r) => r.trim())
      .filter(Boolean);
    return roommateStrings.map((rm) => {
      const parts = rm.split("|").map((p) => p.trim());
      const details = {};
      parts.forEach((part) => {
        const [key, value] = part.split(":");
        if (
          key &&
          value &&
          value.trim() !== "N/A" &&
          value.trim().toLowerCase() !== "null"
        ) {
          switch (key.trim()) {
            case "Name":
              details["שם"] = value.trim();
              break;
            case "Gender":
              details["מגדר"] = value.trim();
              break;
            case "Job":
              details["עיסוק"] = value.trim();
              break;
            case "BirthDate":
              details["תאריך לידה"] = value.trim();
              break;
            case "Image":
              details["תמונה"] = value.trim();
              break;
            case "Description":
              details["תיאור"] = value.trim();
              break;
            default:
              break;
          }
        }
      });
      return details;
    });
  };

  const renderExtraDetails = () => {
    switch (apt.ApartmentType) {
      case 0:
        return (
          <>
            <View style={styles.detailRow}>
              <MaterialIcons name="calendar-today" size={18} color="#E3965A" />
              <Text style={styles.detail}>
                משך חוזה: {apt.Rental_ContractLength} חודשים
              </Text>
            </View>
            <View style={styles.detailRow}>
              <FontAwesome5 name="sync" size={16} color="#E3965A" />
              <Text style={styles.detail}>
                הארכה אפשרית: {apt.Rental_ExtensionPossible ? "כן" : "לא"}
              </Text>
            </View>
          </>
        );
      case 1:
        const roommates = parseRoommates(apt.Roommates);
        return (
          <>
            <View style={styles.detailRow}>
              <FontAwesome5 name="users" size={16} color="#E3965A" />
              <Text style={styles.detail}>
                מס' שותפים: {apt.Shared_NumberOfRoommates}
              </Text>
            </View>
            {roommates.length > 0 && (
              <View>
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  ref={carouselRef}
                  onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                  )}
                  scrollEventThrottle={16}
                  contentContainerStyle={{ flexDirection: "row-reverse" }}
                >
                  {roommates.map((rm, index) => (
                    <View key={index} style={styles.roommateCard}>
                      {rm["תמונה"] && (
                        <Image
                          source={{ uri: rm["תמונה"] }}
                          style={styles.roommateImage}
                          resizeMode="cover"
                        />
                      )}
                      <Text style={styles.roommateHeader}>
                        🧑‍🤝‍🧑 שותף {index + 1}
                      </Text>
                      {Object.entries(rm).map(
                        ([label, value]) =>
                          label !== "תמונה" && (
                            <Text key={label} style={styles.roommateDetail}>
                              • {label}: {value}
                            </Text>
                          )
                      )}
                    </View>
                  ))}
                </ScrollView>
                <View style={styles.paginationContainer}>
                  {roommates.map((_, i) => {
                    const inputRange = [
                      (i - 1) * width,
                      i * width,
                      (i + 1) * width,
                    ];
                    const dotWidth = scrollX.interpolate({
                      inputRange,
                      outputRange: [8, 16, 8],
                      extrapolate: "clamp",
                    });
                    const dotColor = scrollX.interpolate({
                      inputRange,
                      outputRange: ["#ccc", "#E3965A", "#ccc"],
                      extrapolate: "clamp",
                    });
                    return (
                      <Animated.View
                        key={i}
                        style={[
                          styles.dot,
                          { width: dotWidth, backgroundColor: dotColor },
                        ]}
                      />
                    );
                  })}
                </View>
              </View>
            )}
          </>
        );
      case 2:
        return (
          <>
            <View style={styles.detailRow}>
              <MaterialIcons name="cancel" size={18} color="#E3965A" />
              <Text style={styles.detail}>
                ביטול ללא קנס:{" "}
                {apt.Sublet_CanCancelWithoutPenalty ? "כן" : "לא"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="home" size={18} color="#E3965A" />
              <Text style={styles.detail}>
                נכס שלם: {apt.Sublet_IsWholeProperty ? "כן" : "לא"}
              </Text>
            </View>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={[]}
        ListHeaderComponent={
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#E3965A" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}></Text>
            </View>

            
              <ApartmentGallery images={apt.Images} />
            
            <Text style={styles.title}>{apt.Location}</Text>
            <Text style={styles.price}>{apt.Price} ש"ח</Text>
            <Text style={styles.description}>{apt.Description}</Text>

            <Text style={styles.sectionTitle}>
              סוג דירה: {getTypeName(apt.ApartmentType)}
            </Text>

            <View style={styles.detailRow}>
              <MaterialIcons name="meeting-room" size={18} color="#E3965A" />
              <Text style={styles.detail}>חדרים: {apt.AmountOfRooms}</Text>
            </View>

            <View style={styles.detailRow}>
              <MaterialIcons
                name="pets"
                size={18}
                color={apt.AllowPet ? "#E3965A" : "#ccc"}
              />
              <Text style={styles.detail}>
                חיות מחמד: {apt.AllowPet ? "מותר" : "אסור"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <MaterialIcons
                name="smoking-rooms"
                size={18}
                color={apt.AllowSmoking ? "#E3965A" : "#ccc"}
              />
              <Text style={styles.detail}>
                עישון: {apt.AllowSmoking ? "מותר" : "אסור"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <MaterialIcons
                name="local-parking"
                size={18}
                color={apt.ParkingSpace > 0 ? "#E3965A" : "#ccc"}
              />
              <Text style={styles.detail}>חניה: {apt.ParkingSpace}</Text>
            </View>

            <View style={styles.detailRow}>
              <MaterialIcons name="event-available" size={18} color="#E3965A" />
              <Text style={styles.detail}>
                תאריך כניסה: {apt.EntryDate?.split("T")[0]}
              </Text>
            </View>

            {apt.ExitDate && (
              <View style={styles.detailRow}>
                <MaterialIcons name="event-busy" size={18} color="#E3965A" />
                <Text style={styles.detail}>
                  תאריך יציאה: {apt.ExitDate?.split("T")[0]}
                </Text>
              </View>
            )}

            {renderExtraDetails()}

            {userInfo && (
              <TouchableOpacity
                onPress={() => setShowUserProfile(true)}
                style={[
                  styles.uploaderContainer,
                  { backgroundColor: "#E3965A" },
                ]}
              >
                <Image
                  source={{
                    uri:
                      userInfo.profilePicture ||
                      "https://example.com/default-profile.png",
                  }}
                  style={styles.uploaderImage}
                />
                <Text style={[styles.uploaderName, { color: "white" }]}>
                  מפורסם ע״י: {userInfo.fullName}
                </Text>
              </TouchableOpacity>
            )}

            <ApartmentReview apartmentId={apt.ApartmentID} />
          </View>
        }
      />

      <Modal
        visible={showUserProfile}
        animationType="slide"
        onRequestClose={() => setShowUserProfile(false)}
      >
        <UserProfile
          userId={apt.UserID}
          onClose={() => setShowUserProfile(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 10,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
    textAlign: "right",
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#28a745",
    marginTop: 8,
    textAlign: "right",
  },
  description: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
    lineHeight: 24,
    textAlign: "right",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 25,
    color: "#E3965A",
    textAlign: "right",
  },
  detailRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  detail: {
    fontSize: 15,
    color: "#444",
    marginHorizontal: 10,
    flexShrink: 1,
    textAlign: "right",
  },
  roommateCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 10,
    alignItems: "center",
    marginTop: 20,
    width: width - 60,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  roommateHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E3965A",
    marginBottom: 10,
  },
  roommateDetail: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
    textAlign: "right",
    alignSelf: "stretch",
  },
  roommateImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  uploaderContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginTop: 30,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  uploaderImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginLeft: 12,
  },
  uploaderName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});
