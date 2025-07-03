import React, { useState, useRef, useEffect } from "react";
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
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

export default function ApartmentGalleryWithDelete({ images }) {
  const scrollRef = useRef();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageArray, setImageArray] = useState([]);

  useEffect(() => {
    setImageArray(GetImagesArr(images));
  }, [images]);

  const handleScroll = (event) => {
    const x = event.nativeEvent.contentOffset.x;
    const index = Math.round(x / width);
    setCurrentIndex(index);
  };

  const confirmDeleteImage = (urlToDelete) => {
    Alert.alert(
      "מחיקת תמונה",
      "האם אתה בטוח שברצונך למחוק את התמונה?",
      [
        { text: "בטל", style: "cancel" },
        {
          text: "מחק",
          style: "destructive",
          onPress: () =>
            setImageArray((prev) => prev.filter((img) => img !== urlToDelete)),
        },
      ]
    );
  };

  if (imageArray.length === 0) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>No images available</Text>
      </View>
    );
  }

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ref={scrollRef}
        style={styles.scrollView}
      >
        {imageArray.map((imgUrl, index) => (
          <View key={index} style={styles.imageWrapper}>
            <Image source={{ uri: imgUrl }} style={styles.image} />
            <TouchableOpacity
              style={styles.deleteIcon}
              onPress={() => confirmDeleteImage(imgUrl)}
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={24}
                color="white"
              />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {imageArray.length > 1 && (
        <View style={styles.dotsContainer}>
          {imageArray.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === currentIndex && styles.activeDot]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    height: 200,
    width: width,
  },
  imageWrapper: {
    position: "relative",
    width: width,
    height: 200,
  },
  image: {
    width: width-40,
    height: 200,
    resizeMode: "cover",
  },
  deleteIcon: {
    position: "absolute",
    top: 5,
    right: 50,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    padding: 5,
  },
  placeholder: {
    width: width,
    height: 150,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#777",
    fontSize: 16,
    fontStyle: "italic",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#E3965A",
  },
});
