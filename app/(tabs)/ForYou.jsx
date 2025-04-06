import React, { useRef, useState, useContext } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
} from "react-native";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { ActiveApartmentContext } from "../contex/ActiveApartmentContext";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const CARD_WIDTH = SCREEN_WIDTH * 0.9;
const CARD_HEIGHT = 500;
const NAVBAR_HEIGHT = 80;
const EXTRA_OFFSET = 25;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

const SERVER_URL = "http://192.168.1.111:5000"; // 🟡 Replace with your backend IP
const userId = 2; // 🟢 Replace with real userId from context/auth

export default function ForYou() {
  const { allApartments } = useContext(ActiveApartmentContext);
  const [likedApartments, setLikedApartments] = useState([]);
  const [seenApartmentIds, setSeenApartmentIds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const position = useRef(new Animated.ValueXY()).current; //card position

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

  // Filter apartments that haven't been seen yet
  const filteredApartments = allApartments.filter(
    (apt) => !seenApartmentIds.includes(apt.ApartmentID)
  );

  const onSwipeComplete = async (direction) => {
    const apartment = filteredApartments[currentIndex]; // ← חשוב שיהיה לפני השינויים

    setSeenApartmentIds((prev) => [...prev, apartment.ApartmentID]);

    if (direction === "right") {
      setLikedApartments((prev) => [...prev, apartment]);

      try {
        const response = await fetch(
          `${SERVER_URL}/api/User/LikeApartment/${userId}/${apartment.ApartmentID}`,
          { method: "POST" }
        );

        if (response.status === 409) {
          console.log("⚠️ Apartment already liked, skipping...");
        } else if (!response.ok) {
          throw new Error("Failed to like apartment");
        } else {
          console.log("✅ Liked:", apartment.ApartmentID);
        }
      } catch (error) {
        console.error("Error liking apartment:", error);
      }

    } else {
      try {
        const response = await fetch(
          `${SERVER_URL}/api/User/RemoveLikeApartment/${userId}/${apartment.ApartmentID}`,
          { method: "DELETE" }
        );
        if (!response.ok) throw new Error("Failed to unlike apartment");
        console.log("🗑️ Disliked (unliked):", apartment.ApartmentID);
      } catch (error) {
        console.error("Error unliking apartment:", error);
      }
    }

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
    if (currentIndex >= filteredApartments.length) {
      return <Text style={styles.noMoreText}>אין עוד דירות להצגה</Text>;
    }

    return filteredApartments.map((apt, index) => {
      if (index < currentIndex) return null;

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
            <Image source={{ uri: apt.Images }} style={styles.image} />
            <View style={styles.overlay}>
              <Text style={styles.title}>דירה ברחוב {apt.Location}</Text>
              <Text style={styles.description}>{apt.Description}</Text>
              <Text style={styles.price}>{apt.Price} ש"ח</Text>
            </View>
          </Animated.View>
        );
      }

      return (
        <View
          key={apt.ApartmentID}
          style={[
            styles.card,
            { top: styles.card.top + 10 * (index - currentIndex), zIndex: 1 },
          ]}
        >
          <Image source={{ uri: apt.Images }} style={styles.image} />
          <View style={styles.overlay}>
            <Text style={styles.title}>דירה ברחוב {apt.Location}</Text>
            <Text style={styles.description}>{apt.Description}</Text>
            <Text style={styles.price}>{apt.Price} ש"ח</Text>
          </View>
        </View>
      );
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
