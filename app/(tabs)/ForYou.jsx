import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder
} from "react-native";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const CARD_WIDTH = SCREEN_WIDTH * 0.9;
const CARD_HEIGHT = 500;
const NAVBAR_HEIGHT = 80; // Adjust to match your navbar's height
const EXTRA_OFFSET = 25; // Raise the card 25 pixels higher

// Swipe threshold: if swiped more than 25% of screen width, count as full swipe
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
// Duration for the swipe-off animation in ms
const SWIPE_OUT_DURATION = 250;

export default function ForYou() {
  // List of apartment cards
  const [allApartments, setAllApartments] = useState([
    {
      ApartmentID: 1001,
      Price: 6623,
      Location: "ewr",
      Description: "דירת גן יפיפייה עם נוף",
      Images:
        "https://images2.madlan.co.il/t:nonce:v=2/projects/%D7%9E%D7%AA%D7%97%D7%9D%20%D7%A7%D7%95%D7%A4%D7%AA%20%D7%97%D7%95%D7%9C%D7%99%D7%9D%20-%20%D7%A2%D7%96%D7%A8%D7%99%D7%90%D7%9C%D7%99/48950_br_group_pic_950x650_3-683b75f9-b8f5-427d-8f29-cad7d8865ff4.jpg"
    },
    {
      ApartmentID: 1002,
      Price: 9200,
      Location: "Tel Aviv, King George 77",
      Description: "דירה מהממת במרכז תל אביב",
      Images:
        "https://img.yad2.co.il/Pic/202407/22/2_6/o/o2_6_1_02750_20240722172729.jpg?w=3840&h=3840&c=9"
    }
  ]);

  // Array to store liked apartments (when swiped right)
  const [likedApartments, setLikedApartments] = useState([]);
  // Current index for the top card
  const [currentIndex, setCurrentIndex] = useState(0);

  // Animated value to track the top card's position
  const position = useRef(new Animated.ValueXY()).current;

  // Interpolate opacity for the "like" icon when swiping right
  const likeOpacity = position.x.interpolate({
    inputRange: [0, SCREEN_WIDTH * 0.3],
    outputRange: [0, 1],
    extrapolate: "clamp"
  });

  // Interpolate opacity for the "dislike" icon when swiping left
  const dislikeOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH * 0.3, 0],
    outputRange: [1, 0],
    extrapolate: "clamp"
  });

  // PanResponder to handle swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      // Update card's position as the user swipes
      onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      // When the user releases, determine if swipe is sufficient
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe("right");
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe("left");
        } else {
          resetPosition();
        }
      }
    })
  ).current;

  // Animate the card off-screen when swiped enough
  const forceSwipe = (direction) => {
    const x = direction === "right" ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false
    }).start(() => onSwipeComplete(direction));
  };

  // Update state after swipe animation completes
  const onSwipeComplete = (direction) => {
    const apartment = allApartments[currentIndex];
    if (direction === "right") {
      setLikedApartments((prev) => [...prev, apartment]);
      console.log("Liked apartment:", apartment);
    } else {
      console.log("Disliked apartment:", apartment);
    }
    // Reset the animated position for the next card
    position.setValue({ x: 0, y: 0 });
    // Move to the next card
    setCurrentIndex((prev) => prev + 1);
  };

  // Reset card to original position if swipe is not sufficient
  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false
    }).start();
  };

  // Calculate animated style for the card (includes rotation effect)
  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ["-120deg", "0deg", "120deg"]
    });
    return {
      transform: [
        { translateX: position.x },
        { translateY: position.y },
        { rotate }
      ]
    };
  };

  // Render the stack of cards
  const renderCards = () => {
    if (currentIndex >= allApartments.length) {
      return <Text style={styles.noMoreText}>אין עוד דירות להצגה</Text>;
    }

    return allApartments.map((apt, index) => {
      if (index < currentIndex) {
        return null;
      }
      // Top (active) card with swipe gesture and animated icons
      if (index === currentIndex) {
        return (
          <Animated.View
            key={apt.ApartmentID}
            style={[styles.card, getCardStyle(), { zIndex: 99 }]}
            {...panResponder.panHandlers}
          >
            {/* Like Icon (Heart) for right swipe */}
            <Animated.View style={[styles.likeIconContainer, { opacity: likeOpacity }]}>
              <FontAwesome name="heart" size={50} color="orange" />
            </Animated.View>
            {/* Dislike Icon (Close) for left swipe */}
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
      // Render cards behind the top card with a slight vertical offset
      return (
        <View
          key={apt.ApartmentID}
          style={[
            styles.card,
            { top: styles.card.top + 10 * (index - currentIndex), zIndex: 1 }
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
    backgroundColor: "#F5F5F5"
  },
  // Position the card absolutely in the center, raised by EXTRA_OFFSET
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
    elevation: 3
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover"
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
    borderRadius: 10
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center"
  },
  description: {
    fontSize: 14,
    color: "gray",
    textAlign: "center"
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
    textAlign: "center"
  },
  noMoreText: {
    fontSize: 20,
    color: "gray",
    textAlign: "center",
    marginTop: 50,
    marginBottom: 20
  },
  // Container for the Like (heart) icon, positioned inside the card
  likeIconContainer: {
    position: "absolute",
    top: 30,
    right: 30,
    zIndex: 100
  },
  // Container for the Dislike (close) icon, positioned inside the card
  dislikeIconContainer: {
    position: "absolute",
    top: 30,
    left: 30,
    zIndex: 100
  }
});
