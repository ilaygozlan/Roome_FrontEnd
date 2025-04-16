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
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import ApartmentReview from "./components/apartmentReview";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import API from "../config";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";


const { width } = Dimensions.get("window");

export default function ApartmentDetails() {
  const { apartment } = useLocalSearchParams();
  const apt = JSON.parse(apartment);
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const carouselRef = useRef(null);

  const navigation = useNavigation();
  const [userInfo, setUserInfo] = useState(null);

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
    }, 5000); // every 5 seconds

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
              <MaterialIcons name="calendar-today" size={16} color="#E3965A" />
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
                    <View
                      key={index}
                      style={[styles.roommateCard, { width: width - 40 }]}
                    >
                      {rm["תמונה"] && (
                        <Image
                          source={{ uri: rm["תמונה"] }}
                          style={styles.roommateImage}
                        />
                      )}
                      <Text style={styles.roommateHeader}>
                        שותף {index + 1}
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
              <MaterialIcons name="cancel" size={16} color="#E3965A" />
              <Text style={styles.detail}>
                ביטול ללא קנס:{" "}
                {apt.Sublet_CanCancelWithoutPenalty ? "כן" : "לא"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="home" size={16} color="#E3965A" />
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

  const openHouses = [
    { id: 1, date: "25 במרץ 2025", time: "10:00", location: apt.Location },
    { id: 2, date: "1 באפריל 2025", time: "14:00", location: apt.Location },
  ];

  return (
     <SafeAreaView style={{ flex: 1 }}>
    <ScrollView>
      <View style={styles.container}>
        <Image
          source={{ uri: apt.Images?.split(",")[0] }}
          style={styles.image}
        />

        <Text style={styles.title}>{apt.Location}</Text>
        <Text style={styles.price}>{apt.Price} ש"ח</Text>
        <Text style={styles.description}>{apt.Description}</Text>

        <Text style={styles.sectionTitle}>
          סוג דירה: {getTypeName(apt.ApartmentType)}
        </Text>

        <View style={styles.detailRow}>
          <MaterialIcons name="meeting-room" size={16} color="#E3965A" />
          <Text style={styles.detail}>חדרים: {apt.AmountOfRooms}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons
            name="pets"
            size={16}
            color={apt.AllowPet ? "#E3965A" : "#ccc"}
          />
          <Text style={styles.detail}>
            חיות מחמד: {apt.AllowPet ? "מותר" : "אסור"}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons
            name="smoking-rooms"
            size={16}
            color={apt.AllowSmoking ? "#E3965A" : "#ccc"}
          />
          <Text style={styles.detail}>
            עישון: {apt.AllowSmoking ? "מותר" : "אסור"}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons
            name="local-parking"
            size={16}
            color={apt.ParkingSpace > 0 ? "#E3965A" : "#ccc"}
          />
          <Text style={styles.detail}>חניה: {apt.ParkingSpace}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="event-available" size={16} color="#E3965A" />
          <Text style={styles.detail}>
            תאריך כניסה: {apt.EntryDate?.split("T")[0]}
          </Text>
        </View>
        {apt.ExitDate && (
          <View style={styles.detailRow}>
            <MaterialIcons name="event-busy" size={16} color="#E3965A" />
            <Text style={styles.detail}>
              תאריך יציאה: {apt.ExitDate?.split("T")[0]}
            </Text>
          </View>
        )}

        {renderExtraDetails()}

        <Text style={styles.sectionTitle}>🏡 סיורים בדירה:</Text>
        {openHouses.length > 0 ? (
          openHouses.map((item) => (
            <View key={item.id.toString()} style={styles.openHouseItem}>
              <Text style={styles.openHouseText}>
                {item.date} - {item.time}
              </Text>
              <Text style={styles.openHouseLocation}>{item.location}</Text>
              <TouchableOpacity
                style={styles.registerButton}
                onPress={() => alert(`נרשמת לסיור בתאריך ${item.date}`)}
              >
                <Text style={styles.registerText}>להרשמה</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.noOpenHouses}>אין סיורים זמינים כרגע</Text>
        )}

        {userInfo && (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/UserProfile",
                params: { userId: userInfo.id },
              })
            }
            style={styles.uploaderContainer}
          >
            <Image
              source={{
                uri:
                  userInfo.profilePicture ||
                  "https://example.com/default-profile.png",
              }}
              style={styles.uploaderImage}
            />
            <Text style={styles.uploaderName}>
              מפורסם ע״י: {userInfo.fullName}
            </Text>
          </TouchableOpacity>
        )}
        <ApartmentReview apartmentId={apt.ApartmentID} />
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "right",
    marginTop: 10,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "right",
    color: "green",
    marginTop: 5,
  },
  description: {
    fontSize: 16,
    textAlign: "right",
    marginTop: 10,
    color: "#555",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    textAlign: "right",
  },
  detailRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginTop: 5,
  },
  detail: {
    fontSize: 15,
    textAlign: "right",
    marginHorizontal: 8,
    color: "#444",
  },
  roommateScroll: {
    marginTop: 10,
    paddingVertical: 10,
  },
  roommateCard: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    marginLeft: 0,
    width: 200,
    alignItems: "center",
    marginTop: 15,
  },
  roommateHeader: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
    color: "#333",
  },
  roommateDetail: {
    fontSize: 14,
    textAlign: "right",
    marginBottom: 4,
    color: "#444",
    alignSelf: "flex-end",
  },
  roommateImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  openHouseItem: {
    backgroundColor: "#F4B982",
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  openHouseText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  openHouseLocation: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  registerButton: {
    backgroundColor: "#E3965A",
    padding: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  registerText: {
    color: "white",
    fontWeight: "bold",
  },
  noOpenHouses: {
    textAlign: "center",
    color: "gray",
    fontSize: 16,
  },
  uploaderContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginTop: 20,
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 8,
  },
  uploaderImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginLeft: 10,
  },
  uploaderName: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
});
