import React, { useRef, useState, useContext, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  ActivityIndicator,
} from "react-native";
import { ActiveApartmentContext } from "../contex/ActiveApartmentContext";
import API from "../../config";
import { userInfoContext } from "../contex/userInfoContext";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const CARD_WIDTH = SCREEN_WIDTH * 0.9;
const CARD_HEIGHT = 500;
const NAVBAR_HEIGHT = 80;
const EXTRA_OFFSET = 25;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

export default function ForYou() {
  const { loginUserId } = useContext(userInfoContext);
  const userId = loginUserId;
  const { allApartments,setAllApartments } = useContext(ActiveApartmentContext);

  const [interactedApartmentIds, setInteractedApartmentIds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);
  const [isLoading, setIsLoading] = useState(true);
  const position = useRef(new Animated.ValueXY()).current;

  // Load liked and disliked apartments for the user
  useEffect(() => {
    const loadInteracted = async () => {
      try {
        const [likedRes, dislikedRes] = await Promise.all([
          fetch(`${API}User/GetUserLikedApartments/${userId}`),
          fetch(`${API}User/GetUserDislikedApartments/${userId}`),
        ]);

        const liked = likedRes.ok ? await likedRes.json() : [];
        const disliked = dislikedRes.ok ? await dislikedRes.json() : [];

        const ids = [...new Set([
          ...liked.map((apt) => apt.ApartmentID),
          ...disliked.map((apt) => apt.ApartmentID),
        ])];

        setInteractedApartmentIds(ids);
      } catch (err) {
        console.error("Error loading interacted apartments:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInteracted();
  }, []);

  // Filter apartments once
  const swipeableApartments = useMemo(() => {
    const filtered = allApartments.filter(
      (apt) => !interactedApartmentIds.includes(apt.ApartmentID)
    );
    console.log("✅ Filtered swipeable apartments:", filtered.map((a) => a.ApartmentID));
    return filtered;
  }, [allApartments]);

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SCREEN_WIDTH * 0.3],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const dislikeOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH * 0.3, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe("right");
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe("left");
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const forceSwipe = (direction) => {
    const x = direction === "right" ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = async (direction) => {
    const apartment = swipeableApartments[currentIndexRef.current];

    console.log("👉 Swiped direction:", direction);
    console.log("📦 currentIndexRef:", currentIndexRef.current);
    console.log("🏠 Current apartment:", apartment);

    if (!apartment) {
      console.warn("⚠️ No apartment found at index", currentIndexRef.current);
      return;
    }

    if (direction === "right") {
      try {
        const response = await fetch(`${API}User/LikeApartment/${userId}/${apartment.ApartmentID}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error("Failed to like apartment");
        else {
        const updatedApartments = allApartments.map((apt)=>
          apt.ApartmentID == apartment.ApartmentID ? {...apt, IsLikedByUser : true} : apt
        );
        setAllApartments(updatedApartments);
        }
        console.log("✅ Liked apartment ID:", apartment.ApartmentID,allApartments);
      } catch (error) {
        console.error("❌ Error liking apartment:", error);
      }
    } else {
      try {
        const response = await fetch(`${API}User/RemoveLikeApartment/${userId}/${apartment.ApartmentID}`, {
          method: "DELETE",
        });
        if (!response.ok && response.status !== 404) {
          throw new Error("Failed to dislike apartment");
        }   else {
          const updatedApartments = allApartments.map((apt)=>
            apt.ApartmentID == apartment.ApartmentID ? {...apt, IsLikedByUser : false} : apt
          );
          setAllApartments(updatedApartments);
          }
        console.log("❎ Disliked apartment ID:", apartment.ApartmentID);
      } catch (error) {
        console.error("Error disliking apartment:", error);
      }
    }

    // Advance index safely
    setCurrentIndex((prev) => {
      currentIndexRef.current = prev + 1;
      return prev + 1;
    });

    position.setValue({ x: 0, y: 0 });
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ["-120deg", "0deg", "120deg"],
    });
    return {
      transform: [
        { translateX: position.x },
        { translateY: position.y },
        { rotate },
      ],
    };
  };

  const renderCards = () => {
    console.log("🖼 Rendering cards. Index:", currentIndex, "Available:", swipeableApartments.length);

    if (isLoading) {
      return <ActivityIndicator size="large" color="#999" style={{ marginTop: 100 }} />;
    }

    if (currentIndex >= swipeableApartments.length) {
      return <Text style={styles.noMoreText}>No more apartments to show</Text>;
    }

    return swipeableApartments.map((apt, index) => {
      if (index < currentIndex) return null;

      const cardContent = (
        <View key={apt.ApartmentID} style={[styles.card, { top: styles.card.top + 10 * (index - currentIndex), zIndex: 1 }]}>
          <Image source={{ uri: apt.Images || "https://via.placeholder.com/400x300?text=No+Image" }} style={styles.image} />
          <View style={styles.overlay}>
            <Text style={styles.title}>Apartment at {apt.Location}</Text>
            <Text style={styles.description}>{apt.Description}</Text>
            <Text style={styles.price}>{apt.Price} ₪</Text>
          </View>
        </View>
      );

      if (index === currentIndex) {
        return (
          <Animated.View
            key={apt.ApartmentID}
            style={[styles.card, getCardStyle(), { zIndex: 99 }]}
            {...panResponder.panHandlers}
          >
            {cardContent}
          </Animated.View>
        );
      }

      return cardContent;
    });
  };

  return <View style={styles.container}>{renderCards()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  card: {
    position: "absolute",
    top: (SCREEN_HEIGHT - CARD_HEIGHT) / 2 - NAVBAR_HEIGHT / 2 - EXTRA_OFFSET,
    left: (SCREEN_WIDTH - CARD_WIDTH) / 2,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  overlay: {
    position: "absolute",
    top: "20%",
    left: 0,
    width: "100%",
    height: "60%",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
    textAlign: "center",
  },
  noMoreText: {
    fontSize: 20,
    color: "gray",
    textAlign: "center",
    marginTop: 50,
    marginBottom: 20,
  },
});
