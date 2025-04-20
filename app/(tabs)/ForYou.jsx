import React, { useRef, useState, useContext, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActiveApartmentContext } from "../contex/ActiveApartmentContext";
import API from "../../config";
import { userInfoContext } from "../contex/userInfoContext";
import LikeButton from "../components/LikeButton";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const CARD_WIDTH = SCREEN_WIDTH * 0.9;
const CARD_HEIGHT = 500;
const NAVBAR_HEIGHT = 80;
const EXTRA_OFFSET = 25;
const SWIPE_THRESHOLD = 0.15 * SCREEN_WIDTH; // LOWERED threshold to improve swipe detection
const SWIPE_OUT_DURATION = 250;

const DISLIKED_KEY = "disliked_apartments";

export default function ForYou() {
  const { loginUserId } = useContext(userInfoContext);
  const userId = loginUserId;
  const { allApartments } = useContext(ActiveApartmentContext);

  // App state
  const [interactedApartmentIds, setInteractedApartmentIds] = useState([]);
  const [likedApartments, setLikedApartments] = useState([]);
  const [dislikedApartments, setDislikedApartments] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);
  const [isLoading, setIsLoading] = useState(true);
  const [storageReady, setStorageReady] = useState(false);
  const position = useRef(new Animated.ValueXY()).current;

  // Save disliked apartment IDs to AsyncStorage
  const saveDislikedToStorage = async (ids) => {
    try {
      await AsyncStorage.setItem(DISLIKED_KEY, JSON.stringify([...new Set(ids)]));
    } catch (e) {
      console.error("❌ Failed to save to AsyncStorage:", e);
    }
  };

  // Load disliked apartment IDs from AsyncStorage
  const loadDislikedFromStorage = async () => {
    try {
      const stored = await AsyncStorage.getItem(DISLIKED_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("❌ Failed to load from AsyncStorage:", e);
      return [];
    }
  };

  // Load liked and disliked apartments
  const loadInteracted = async () => {
    try {
      const [likedRes, localDisliked] = await Promise.all([
        fetch(`${API}User/GetUserLikedApartments/${userId}`),
        loadDislikedFromStorage(),
      ]);

      const liked = likedRes.ok ? await likedRes.json() : [];
      const likedIds = liked.map((apt) => apt.ApartmentID);

      const allInteracted = [...new Set([...likedIds, ...localDisliked])];
      setLikedApartments(likedIds);
      setDislikedApartments(localDisliked);
      setInteractedApartmentIds(allInteracted);
      setStorageReady(true);

      console.log("👍 Liked apartments:", likedIds);
      console.log("👎 Disliked apartments (from AsyncStorage):", localDisliked);
      console.log("📦 All interacted apartments:", allInteracted);
    } catch (err) {
      console.error("Error loading interacted apartments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset all disliked apartments
  const clearDislikedApartments = async () => {
    try {
      await AsyncStorage.removeItem(DISLIKED_KEY);
      setDislikedApartments([]);
      setInteractedApartmentIds(likedApartments);
      setCurrentIndex(0);
      currentIndexRef.current = 0;
      console.log("🧹 Disliked apartments cleared!");
    } catch (e) {
      console.error("❌ Failed to clear AsyncStorage:", e);
    }
  };

  useEffect(() => {
    loadInteracted();
  }, []);

  // Filter apartments that were not seen yet and have images
  const swipeableApartments = useMemo(() => {
    if (!storageReady) return [];
    return allApartments.filter(
      (apt) =>
        !interactedApartmentIds.includes(apt.ApartmentID) &&
        apt.Images &&
        apt.Images.trim() !== ""
    );
  }, [allApartments, interactedApartmentIds, storageReady]);

  // Preload images for faster rendering
  useEffect(() => {
    swipeableApartments.forEach((apt) => {
      if (apt?.Images) {
        Image.prefetch(apt.Images)
          .then(() => console.log(`📦 Preloaded: ${apt.Images}`))
          .catch((err) => console.warn("⚠️ Failed to preload image", err));
      }
    });
  }, [swipeableApartments]);

  // PanResponder for swiping gestures
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 10,
      onPanResponderGrant: () => position.setOffset({ x: position.x._value, y: position.y._value }),
      onPanResponderMove: Animated.event([
        null,
        { dx: position.x, dy: position.y }
      ], { useNativeDriver: false }),
      onPanResponderRelease: (_, gesture) => {
        position.flattenOffset();
        console.log("📍 Gesture released with dx:", gesture.dx);
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

  // Animate card off-screen on swipe
  const forceSwipe = (direction) => {
    const x = direction === "right" ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction));
  };

  // Handle liking an apartment
  const likeApartment = async (apartmentId) => {
    try {
      const res = await fetch(`${API}User/LikeApartment/${userId}/${apartmentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to like");
      setLikedApartments((prev) => [...new Set([...prev, apartmentId])]);
      setInteractedApartmentIds((prev) => [...new Set([...prev, apartmentId])]);
    } catch (err) {
      console.error("Error liking apartment:", err);
    }
  };

  // Handle disliking an apartment (also remove like if exists)
  const dislikeApartment = async (apartmentId) => {
    try {
      if (likedApartments.includes(apartmentId)) {
        const res = await fetch(`${API}User/RemoveLikeApartment/${userId}/${apartmentId}`, {
          method: "DELETE",
        });
        if (!res.ok && res.status !== 404) throw new Error("Failed to remove like");
        setLikedApartments((prev) => prev.filter((id) => id !== apartmentId));
      }

      const updated = [...dislikedApartments, apartmentId];
      setDislikedApartments(updated);
      setInteractedApartmentIds((prev) => [...new Set([...prev, apartmentId])]);
      await saveDislikedToStorage(updated);
    } catch (err) {
      console.error("Error disliking apartment:", err);
    }
  };

  // Handle completed swipe action
  const onSwipeComplete = async (direction) => {
    const apartment = swipeableApartments[currentIndexRef.current];
    if (!apartment) return;

    if (direction === "right") {
      await likeApartment(apartment.ApartmentID);
    } else {
      await dislikeApartment(apartment.ApartmentID);
    }

    setCurrentIndex((prev) => {
      currentIndexRef.current = prev + 1;
      return prev + 1;
    });

    position.setValue({ x: 0, y: 0 });
  };

  // Animate card back to center if not swiped enough
  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  // Animation style for top card
  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ["-20deg", "0deg", "20deg"],
    });
    return {
      transform: [
        { translateX: position.x },
        { translateY: position.y },
        { rotate },
      ],
    };
  };

  // Render apartment cards
  const renderCards = () => {
    if (isLoading || !storageReady) {
      return <ActivityIndicator size="large" color="#999" style={{ marginTop: 100 }} />;
    }

    if (currentIndex >= swipeableApartments.length) {
      return <Text style={styles.noMoreText}>No more apartments to show</Text>;
    }

    return swipeableApartments.map((apt, index) => {
      if (index < currentIndex) return null;

      const isTopCard = index === currentIndex;
      const cardStyle = isTopCard
        ? [styles.card, getCardStyle(), { zIndex: 99 }]
        : [styles.card, { top: styles.card.top + 10 * (index - currentIndex), zIndex: 1 }];

      const cardContent = (
        <View key={apt.ApartmentID} style={styles.cardInner}>
          <Image style={styles.image} source={{ uri: apt.Images }} resizeMode="cover" />
          <View style={styles.overlay}>
            <Text style={styles.title}>{apt.Location}</Text>
            <Text style={styles.description}>{apt.Description}</Text>
            <Text style={styles.price}>{apt.Price} ₪</Text>
            <LikeButton
              apartmentId={apt.ApartmentID}
              isLikedByUser={likedApartments.includes(apt.ApartmentID)}
              numOfLikes={apt.NumOfLikes}
            />
          </View>
        </View>
      );

      return isTopCard ? (
        <Animated.View key={apt.ApartmentID} style={cardStyle} {...panResponder.panHandlers}>
          {cardContent}
        </Animated.View>
      ) : (
        <View key={apt.ApartmentID} style={cardStyle}>{cardContent}</View>
      );
    });
  };

  return (
    <View style={styles.container}>
      {renderCards()}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.swipeButton, { backgroundColor: "#ddd" }]}
          onPress={() => forceSwipe("left")}
        >
          <Text style={styles.buttonText}>❌</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.swipeButton, { backgroundColor: "#f99" }]}
          onPress={() => forceSwipe("right")}
        >
          <Text style={styles.buttonText}>❤️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Styles for components
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
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardInner: {
    flex: 1,
    backgroundColor: "transparent",
  },
  image: {
    width: "100%",
    height: "70%",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 12,
    height: "30%",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
  },
  description: {
    fontSize: 14,
    color: "#ddd",
    textAlign: "center",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginTop: 5,
  },
  noMoreText: {
    fontSize: 20,
    color: "gray",
    textAlign: "center",
    marginTop: 50,
    marginBottom: 20,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 60,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    gap: 40,
  },
  swipeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  buttonText: {
    fontSize: 24,
    color: "white",
  },
});
