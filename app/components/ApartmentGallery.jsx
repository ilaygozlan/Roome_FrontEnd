// ApartmentGallery.js
import React, { useState, useRef } from "react";
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  Text,
} from "react-native";

const { width } = Dimensions.get("window");

// Get the correct base URL depending on environment
const getBaseUrl = () => {
  if (__DEV__) {
    return "https://192.168.68.113:5000"; // development
  } else {
    return "https://roomebackend20250414140006.azurewebsites.net"; // production
  }
};

const baseUrl = getBaseUrl();

// Convert image paths (array or comma-separated string) into full URLs

const GetImagesArr = (images) => {
    const ts = Date.now(); // new timestamp

  const imageArray =
    images?.split(",").map((img) => {
      const trimmed = img.trim();
      return trimmed.startsWith("https")
        ? trimmed
        : `${baseUrl}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
    }) || [];
  return imageArray;
};

export default function ApartmentGallery({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef();
  const imageArray = GetImagesArr(images);

  const handleScroll = (event) => {
    const x = event.nativeEvent.contentOffset.x;
    const index = Math.round(x / width);
    setCurrentIndex(index);
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
          <Image key={index} source={{ uri: imgUrl }} style={styles.image} />
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
  image: {
    width: width,
    height: 200,
    resizeMode: "cover",
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
