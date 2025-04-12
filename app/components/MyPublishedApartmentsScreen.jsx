import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import API from "../../config";
import { userInfoContext } from "../contex/userInfoContext";

const { width } = Dimensions.get("window");

const MyPublishedApartmentsScreen = ({ onClose }) => {
  const { userProfile } = useContext(userInfoContext);
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollIndices, setScrollIndices] = useState({}); // To track current image index per apartment
  const router = useRouter();

  useEffect(() => {
    if (userProfile && userProfile.id) {
      fetch(API + "User/GetUserOwnedApartments/" + userProfile.id)
        .then((response) => {
          if (!response.ok) {
            return response.text().then((text) => {
              if (text.includes("No owned apartments found")) {
                return [];
              }
              throw new Error(text);
            });
          }
          return response.json();
        })
        .then((data) => {
          setApartments(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching published apartments:", err);
          setLoading(false);
        });
    }
  }, [userProfile]);

  const getBorderColor = (type) => {
    switch (type) {
      case "RentalApartment":
        return "#F0C27B";
      case "SharedApartment":
        return "#F4B982";
      case "SubletApartment":
        return "#E3965A";
      default:
        return "#ddd";
    }
  };

  const getTypeName = (type) => {
    switch (type) {
      case "RentalApartment":
        return "Rental";
      case "SharedApartment":
        return "Roommates";
      case "SubletApartment":
        return "Sublet";
      default:
        return "Unknown";
    }
  };

  const handleScroll = (event, aptId) => {
    const x = event.nativeEvent.contentOffset.x;
    const index = Math.round(x / width);
    setScrollIndices((prev) => ({ ...prev, [aptId]: index }));
  };

  const getImagesArray = (images) => {
    if (Array.isArray(images)) return images;
    if (typeof images === "string") return images.split(",").map((i) => i.trim());
    return [];
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <ActivityIndicator size="large" color="#2661A1" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>דירות שפרסמתי</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {apartments.length > 0 ? (
          apartments.map((apt) => {
            const images = getImagesArray(apt.Images);
            const currentIndex = scrollIndices[apt.ApartmentID] || 0;

            return (
              <View
                key={apt.ApartmentID}
                style={[styles.card, { borderColor: getBorderColor(apt.ApartmentType) }]}
              >
                <View
                  style={[
                    styles.typeLabel,
                    { backgroundColor: getBorderColor(apt.ApartmentType) },
                  ]}
                >
                  <Text style={styles.typeText}>{getTypeName(apt.ApartmentType)}</Text>
                </View>
                <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={(e) => handleScroll(e, apt.ApartmentID)}
                    scrollEventThrottle={16}
                    style={styles.galleryScroll}
                  >
                    {images.map((imgUrl, index) => (
                      <View key={index} style={styles.fullImageWrapper}>
                        <Image source={{ uri: imgUrl }} style={styles.fullImage} />
                      </View>
                    ))}
                  </ScrollView>

                  {images.length > 1 && (
                    <View style={styles.dotsWrapper}>
                      <View style={styles.dotsContainer}>
                        {images.map((_, index) => (
                          <View
                            key={index}
                            style={[
                              styles.dot,
                              index === currentIndex && styles.activeDot,
                            ]}
                          />
                        ))}
                      </View>
                    </View>
                  )}
                <TouchableOpacity
                  onPress={() => {
                    onClose();
                    setTimeout(() => {
                      router.push({
                        pathname: "/ApartmentDetails",
                        params: { apartment: JSON.stringify(apt) },
                      });
                    }, 300);
                  }}
                >

                  <View style={styles.details}>
                    <Text style={styles.title}>דירה ברחוב {apt.Location}</Text>
                    <Text style={styles.description}>{apt.Description}</Text>
                    <Text style={styles.price}>{apt.Price} ש"ח</Text>
                  </View>
                </TouchableOpacity>
                
              </View>
            );
          })
        ) : (
          <View style={styles.noApartmentsContainer}>
            <Text style={styles.emptyText}>עוד לא פרסמת דירות</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => router.push("/NewApartment")}
            >
              <Text style={styles.uploadButtonText}>העלה דירה חדשה</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "white" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingTop: Constants.statusBarHeight + 15,
    backgroundColor: "#2661A1",
  },
  backButton: { padding: 5, marginRight: 10 },
  backText: { color: "white", fontSize: 18 },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  scrollContainer: { padding: 10, paddingBottom: 100 },
  card: {
    alignSelf: "center",
    width: "100%",
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    borderWidth: 3,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 20,
  },
  galleryScroll: {
    width: width,
    height: 200,
  },
  fullImageWrapper: {
    width: width,
    height: 200,
  },
  fullImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  dotsWrapper: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  
  activeDot: {
    backgroundColor: "#2661A1",
  },
  
  activeDot: {
    backgroundColor: "#E3965A",
  },
  details: { padding: 10 },
  title: { fontSize: 16, fontWeight: "bold", textAlign: "right" },
  description: { fontSize: 14, color: "gray", textAlign: "right" },
  price: { fontSize: 16, fontWeight: "bold", marginTop: 5, textAlign: "right" },
  typeText: { fontSize: 14, fontWeight: "bold", color: "black", textTransform: "uppercase" },
  typeLabel: {
    position: "absolute",
    zIndex: 2,
    top: 5,
    left: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  emptyText: { textAlign: "center", marginTop: 20, fontSize: 16, color: "#777" },
  noApartmentsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  uploadButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#2661A1",
    borderRadius: 5,
  },
  uploadButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});

export default MyPublishedApartmentsScreen;
