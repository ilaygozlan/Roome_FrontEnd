import React, { useRef, useState, useContext, useEffect } from "react";
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
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { ActiveApartmentContext } from "../contex/ActiveApartmentContext";
import API from "../../config";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const CARD_WIDTH = SCREEN_WIDTH * 0.9;
const CARD_HEIGHT = 500;
const NAVBAR_HEIGHT = 80;
const EXTRA_OFFSET = 25;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

const userId = 22;

export default function ForYou() {
  const { allApartments } = useContext(ActiveApartmentContext);
  const [interactedApartmentIds, setInteractedApartmentIds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const position = useRef(new Animated.ValueXY()).current;

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
      onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (event, gesture) => {
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

  const filteredApartments = allApartments.filter(
    (apt) => !interactedApartmentIds.includes(apt.ApartmentID)
  );

  const onSwipeComplete = async (direction) => {
    const apartment = filteredApartments[currentIndex];

    if (direction === "right") {
      try {
        const url = `${API}User/LikeApartment/${userId}/${apartment.ApartmentID}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const text = await response.text();
        console.log("Like response:", response.status, text);
        if (!response.ok) throw new Error("Failed to like apartment");
      } catch (error) {
        console.error("Error liking apartment:", error);
      }
    } else {
      try {
        const url = `${API}User/RemoveLikeApartment/${userId}/${apartment.ApartmentID}`;
        const response = await fetch(url, { method: "DELETE" });
        const text = await response.text();
        console.log("Dislike response:", response.status, text);
        if (!response.ok && response.status !== 404) {
          throw new Error("Failed to dislike apartment");
        }
      } catch (error) {
        console.error("Error disliking apartment:", error);
      }
    }

    setInteractedApartmentIds((prev) => [...prev, apartment.ApartmentID]);
    position.setValue({ x: 0, y: 0 });
    setCurrentIndex((prev) => prev + 1);
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
    if (isLoading) {
      return <ActivityIndicator size="large" color="#999" style={{ marginTop: 100 }} />;
    }

    if (currentIndex >= filteredApartments.length) {
      return <Text style={styles.noMoreText}>No more apartments to show</Text>;
    }

    return filteredApartments.map((apt, index) => {
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
            <Animated.View style={[styles.likeIconContainer, { opacity: likeOpacity }]}>
              <FontAwesome name="heart" size={50} color="orange" />
            </Animated.View>
            <Animated.View style={[styles.dislikeIconContainer, { opacity: dislikeOpacity }]}>
              <MaterialCommunityIcons name="close" size={50} color="red" />
            </Animated.View>
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
  likeIconContainer: {
    position: "absolute",
    top: 30,
    right: 30,
    zIndex: 100,
  },
  dislikeIconContainer: {
    position: "absolute",
    top: 30,
    left: 30,
    zIndex: 100,
  },
});
