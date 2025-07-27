import React, { useRef, useState, useEffect, useMemo, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Image,
  Alert,
  Modal,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import { userInfoContext } from "../contex/userInfoContext";
import API from "../../config";
import Swiper from "react-native-deck-swiper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AdminDashboardGraphs from "../AdminDashboardGraphs";
import { checkIfAdmin } from "../../checkAdmin";
import HouseLoading from "../components/LoadingHouseSign";
import ApartmentDetails from "../ApartmentDetails";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = SCREEN_WIDTH * 0.9;
const CARD_HEIGHT = 500;

const colors = {
  primary: "#E3965A",
  background: "#f2f2f2",
  white: "#ffffff",
  gray: "#424242",
  lightGray: "#86888A",
};

const baseUrl = "https://roomebackend20250414140006.azurewebsites.net";

const GetImagesArr = (images) => {
  const imageArray =
    images?.split(",").map((img) => {
      const trimmed = img.trim();
      return trimmed.startsWith("https")
        ? trimmed
        : `${baseUrl}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
    }) || [];
  return imageArray;
};

export default function ForYou() {
  const { loginUserId } = useContext(userInfoContext);
  const userId = loginUserId;
  const swiperRef = useRef(null);
  const navigation = useNavigation();
  const [showAptDt, setShowAptDt] = useState(false);
  const [apartments, setApartments] = useState([]);
  const [interactedIds, setInteractedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [finishedSwiping, setFinishedSwiping] = useState(false);
  const [selectedApt, setSelectedApt] = useState();

const handleSwipeUp = (cardIndex) => {
 

  const apartment = swipeableApartments[cardIndex];
  if (!apartment || !apartment.ApartmentID) {
    console.log("No apartment found at index or missing ApartmentID");
    return;
  }

  setInteractedIds((prev) => [...prev, apartment.ApartmentID]);

 
  setShowAptDt(true);
  setSelectedApt(apartment);
};


  useEffect(() => {
    const checkAdminAndFetch = async () => {
      try {
        const admin = await checkIfAdmin();
        setIsAdmin(admin);

        if (!admin) {
          const res = await fetch(
            `${API}User/GetRecommendedApartments/${userId}`
          );
          const data = res.ok ? await res.json() : [];
          const apartmentsWithImages = data.filter(
            (apartment) => apartment.Images && apartment.Images.trim() !== ""
          );
          setApartments(apartmentsWithImages);
        }
      } catch {
        Alert.alert("שגיאה", "לא ניתן לבדוק הרשאות או לטעון המלצות");
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAndFetch();
  }, []);

  const swipeableApartments = useMemo(() => {
    return apartments.filter(
      (apt) =>
        apt?.ApartmentID &&
        !interactedIds.includes(apt.ApartmentID) &&
        apt.Images &&
        apt.Images.trim() !== "" &&
        apt.Images.split(",")[0].trim().length > 0
    );
  }, [apartments, interactedIds]);

  const handleSwipe = async (cardIndex, direction) => {
    const apartment = swipeableApartments[cardIndex];
    if (!apartment?.ApartmentID) return;

    setInteractedIds((prev) => [...prev, apartment.ApartmentID]);

    if (direction === "right") {
      await fetch(
        `${API}User/LikeApartment/${userId}/${apartment.ApartmentID}`,
        { method: "POST" }
      );
    }
  };

  const refreshRecommendations = async () => {
    setIsLoading(true);
    setFinishedSwiping(false);
    setInteractedIds([]);

    try {
      const res = await fetch(`${API}User/GetRecommendedApartments/${userId}`);
      const data = res.ok ? await res.json() : [];
      setApartments(data);
    } catch {
      Alert.alert("שגיאה", "לא ניתן לטעון מחדש את ההמלצות");
    } finally {
      setIsLoading(false);
    }
  };
  const renderCard = (card) => {
    if (!card || !card.ApartmentID) return null;

    let locationAddress = "מיקום לא ידוע";
    try {
      const loc = JSON.parse(card.Location);
      locationAddress = loc.address || "מיקום לא ידוע";
    } catch {
      locationAddress = card.Location || "מיקום לא ידוע";
    }

    const imagesArray = GetImagesArr(card.Images);
    const imageUrl =
      imagesArray.length > 0
        ? imagesArray[0]
        : "https://via.placeholder.com/500x300?text=No+Image";

    return (
      <View style={styles.card}>
        <View style={styles.image}>
          {!imageErrors[card.ApartmentID] ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: "100%", height: "100%" }}
              onError={() =>
                setImageErrors((prev) => ({
                  ...prev,
                  [card.ApartmentID]: true,
                }))
              }
            />
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons
                name="image-off"
                size={48}
                color={colors.gray}
              />
              <Text style={{ color: colors.gray }}>אין תמונה</Text>
            </View>
          )}
        </View>
        <View style={styles.overlay}>
          <Text style={styles.title}>{locationAddress}</Text>
          <Text style={styles.price}>
            {card.Price ? `${card.Price} ₪` : "מחיר לא ידוע"}
          </Text>
          <Text style={styles.description}>
            {card.Description || "אין תיאור"}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return <HouseLoading text="טוען דירות מומלצות בשבילך" />;
  }

  if (isAdmin) {
    return <AdminDashboardGraphs />;
  }

  if (swipeableApartments.length <= 0 && finishedSwiping) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <MaterialCommunityIcons
          name="home-search"
          size={64}
          color={colors.gray}
        />
        <Text style={{ fontSize: 24, marginTop: 20, color: colors.primary }}>
          אין דירות להצגה כרגע
        </Text>

        <TouchableOpacity
          onPress={refreshRecommendations}
          style={{
            marginTop: 20,
            backgroundColor: colors.primary,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "white", fontSize: 16 }}>רענן המלצות</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        {swipeableApartments.length > 0 && !finishedSwiping ? (
          <Swiper
            ref={swiperRef}
            cards={swipeableApartments}
            renderCard={renderCard}
            onSwipedLeft={(index) => handleSwipe(index, "left")}
            onSwipedRight={(index) => handleSwipe(index, "right")}
            onSwipedTop={(index) => handleSwipeUp(index)}
            onSwipedAll={() => setFinishedSwiping(true)}
            cardVerticalMargin={50}
            stackSize={3}
            stackSeparation={14}
            disableBottomSwipe
            infinite={false}
            verticalSwipe={true}
            cardStyle={styles.card}
            containerStyle={{ flex: 1 }}
            backgroundColor={colors.background}
            swipeAnimationDuration={350}
          />
        ) : (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <MaterialCommunityIcons
              name="home-search"
              size={64}
              color={colors.gray}
            />
            <Text
              style={{ fontSize: 24, marginTop: 20, color: colors.primary }}
            >
              אין דירות להצגה כרגע
            </Text>

            <TouchableOpacity
              onPress={refreshRecommendations}
              style={{
                marginTop: 20,
                backgroundColor: colors.primary,
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: "white", fontSize: 16 }}>רענן המלצות</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Modal
        visible={showAptDt}
        animationType="slide"
        onRequestClose={() => {
          setShowAptDt(false);
          setSelectedApt(null);
        }}
      >
        {showAptDt && (
          <ApartmentDetails
            key={selectedApt.ApartmentID}
            apt={selectedApt}
            onClose={() => {
             setShowAptDt(false);
          setSelectedApt(null);
            }}
          />
        )}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    flex: 1,
    height: "100%",
    backgroundColor: colors.background,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: colors.background,
  },
  image: { width: "100%", height: "100%", backgroundColor: colors.background },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: "rgba(166, 142, 142, 0.5)",
  },
  title: { fontSize: 24, color: colors.background, fontWeight: "bold" },
  price: { fontSize: 20, color: colors.background, marginVertical: 5 },
  description: { fontSize: 16, color: colors.background },
});
