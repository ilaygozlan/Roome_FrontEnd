import React, { useState } from "react";
import { TouchableOpacity, Alert ,StyleSheet, View, Text} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export default function LikeButton(props) {
  const [liked, setLiked] = useState(props.isLikedByUser);
  const [numOfLikes, setNumOfLikes] = useState(props.numOfLikes);

  const likeApartment = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/User/LikeApartment/${11}/${props.apartmentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to like apartment");
      console.log("✅ Liked successfully");
    } catch (error) {
      console.error("❌ Error liking apartment:", error);
      Alert.alert("Error", "Failed to like apartment");
    }
  };

  const unlikeApartment = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/User/RemoveLikeApartment/${11}/${props.apartmentId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to unlike apartment");
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