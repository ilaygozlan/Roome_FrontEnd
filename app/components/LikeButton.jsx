import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export default function LikeButton() {
  const [liked, setLiked] = useState(false);

  return (
    <TouchableOpacity onPress={() => setLiked(!liked)}>
      <FontAwesome 
        name={liked ? "heart" : "heart-o"}  // Changes icon
        size={24} 
        color={liked ? "red" : "gray"}  // Changes color
      />
    </TouchableOpacity>
  );
}
