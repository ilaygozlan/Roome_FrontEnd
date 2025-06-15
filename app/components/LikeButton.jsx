import React, { useState, useContext,useEffect } from "react";
import { TouchableOpacity, Alert, StyleSheet, View, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import API from "../../config";
import { userInfoContext } from "../contex/userInfoContext";
import { ActiveApartmentContext } from "../contex/ActiveApartmentContext";

/**
 * @component LikeButton
 * @description Interactive like button component for apartments with real-time update functionality.
 * Manages likes state and communicates with the backend API for persistence.
 * 
 * Features:
 * - Toggle like/unlike state
 * - Real-time like count update
 * - API integration for persisting likes
 * - Visual feedback with heart icon
 * - Context-aware user state management
 * 
 * @param {Object} props
 * @param {number} props.apartmentId - ID of the apartment
 * @param {number} props.numOfLikes - Initial number of likes
 * @param {boolean} props.isLikedByUser - Whether the current user has liked the apartment
 */

export default function LikeButton(props) {
  const [liked, setLiked] = useState(props.isLikedByUser);
  useEffect(()=>{
    setLiked(props.isLikedByUser);
  },[props.isLikedByUser]);
  const { loginUserId } = useContext(userInfoContext);
  const [numOfLikes, setNumOfLikes] = useState(props.numOfLikes);
  const {
    allApartments,
    setAllApartments,
    triggerFavoritesRefresh,
  } = useContext(ActiveApartmentContext);

  /**
   * Helper function to update apartment like status in global context
   * @param {number} id - Apartment ID to update
   */
  const setApartmentLikedByUser = (id) => {
    const updatedApartments = allApartments.map((apt) => {
      if (apt.ApartmentID === id) {
        return { ...apt, IsLikedByUser: true };
      }
      return apt;
    });
  
    setAllApartments(updatedApartments);
    triggerFavoritesRefresh();
  };

  /**
   * Helper function to update apartment unlike status in global context
   * @param {number} id - Apartment ID to update
   */
  const setApartmentUnLikedByUser = (id) => {
    const updatedApartments = allApartments.map((apt) => {
      if (apt.ApartmentID === id) {
        return { ...apt, IsLikedByUser: false };
      }
      return apt;
    });
  
    setAllApartments(updatedApartments);
    triggerFavoritesRefresh();
  };
  
  const likeApartment = async () => {
    try {
      const response = await fetch(
        API + `User/LikeApartment/${loginUserId}/${props.apartmentId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) throw new Error("Failed to like apartment");
      setApartmentLikedByUser(props.apartmentId);
      console.log("✅ Liked successfully");
    } catch (error) {
      console.error("❌ Error liking apartment:", error);
      Alert.alert("Error", "Failed to like apartment");
    }
  };

  const unlikeApartment = async () => {
    try {
      const response = await fetch(
        API + `User/RemoveLikeApartment/${loginUserId}/${props.apartmentId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) throw new Error("Failed to unlike apartment");
      setApartmentUnLikedByUser(props.apartmentId);
      console.log("✅ Unliked successfully");
    } catch (error) {
      console.error("❌ Error unliking apartment:", error);
      Alert.alert("Error", "Failed to unlike apartment");
    }
  };

  const handlePress = () => {
    const newLiked = !liked;
    setLiked(newLiked);

    if (newLiked) {
      likeApartment();
      let newNumOfLikes = numOfLikes + 1;
      setNumOfLikes(newNumOfLikes);
    } else {
      unlikeApartment();
      let newNumOfLikes = numOfLikes - 1;
      setNumOfLikes(newNumOfLikes);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={styles.container}>
        <FontAwesome
          name={liked ? "heart" : "heart-o"}
          size={24}
          color={liked ? "red" : "gray"}
        />
        <Text style={styles.countText}>{numOfLikes}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  countText: {
    fontSize: 14,
    color: "gray",
  },
});
