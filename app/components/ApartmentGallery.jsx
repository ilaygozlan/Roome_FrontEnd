import React, { useState, useRef } from "react";
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  Text,
} from "react-native";

const screenWidth = Dimensions.get("window").width;
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

export default function ApartmentGallery({ images, width }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef();
  const imageArray = GetImagesArr(images);

  // fallback to screen width if no width is provided
  const galleryWidth = width ?? screenWidth;

  const handleScroll = (event) => {
    const x = event.nativeEvent.contentOffset.x;
    const index = Math.round(x / galleryWidth);
    setCurrentIndex(index);
  };

  if (imageArray.length === 0) {
    return (
      <View style={[styles.placeholder, { width: galleryWidth }]}>
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
        style={[styles.scrollView, { width: galleryWidth }]}
      >
        {imageArray.map((imgUrl, index) => (
          <Image
            key={index}
            source={{ uri: imgUrl }}
            style={[styles.image, { width: galleryWidth }]}
          />
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
  },
  image: {
    height: 200,
    resizeMode: "cover",
  },
  placeholder: {
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
