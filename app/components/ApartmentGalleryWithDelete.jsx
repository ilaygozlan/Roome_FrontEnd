import React, { useRef, useState } from "react";
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
import API from "../../config";

const { width } = Dimensions.get("window");
const baseUrl = "https://roomebackend20250414140006.azurewebsites.net";

const prepareImages = (images) => {
  if (!images) return [];

  if (typeof images === "string") {
    return images.split(",").map((img) => {
      const trimmed = img.trim();
      return {
        original: trimmed,
        fullUrl: trimmed.startsWith("https")
          ? trimmed
          : `${baseUrl}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`,
      };
    });
  }

  if (Array.isArray(images)) {
    return images.map((uri) => {
      const trimmed = uri.trim?.() || uri;
      return {
        original: trimmed,
        fullUrl: trimmed.startsWith("http")
          ? trimmed
          : trimmed.startsWith("file://")
          ? trimmed
          : `${baseUrl}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`,
      };
    });
  }

  return [];
};

export default function ApartmentGalleryWithDelete({ images, removeImage }) {
  const scrollRef = useRef();
  const [currentIndex, setCurrentIndex] = useState(0);
  const prepared = prepareImages(images);

  const handleScroll = (event) => {
    const x = event.nativeEvent.contentOffset.x;
    setCurrentIndex(Math.round(x / width));
  };

  const confirmDeleteImage = (originalPath) => {
    Alert.alert("מחיקת תמונה", "האם למחוק תמונה זו?", [
      { text: "ביטול", style: "cancel" },
      {
        text: "מחק",
        style: "destructive",
        onPress: async () => {
          if (typeof removeImage === "function") {
            removeImage(originalPath);
            return;
          }

          try {
            await fetch(
              `${API}UploadImageCpntroller/deleteApartmentImage?imageUrl=${encodeURIComponent(originalPath)}`,
              { method: "DELETE" }
            );
          } catch (err) {
            console.error("Delete failed:", err);
          }
        },
      },
    ]);
  };

  if (!prepared.length) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>אין תמונות להצגה</Text>
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
        {prepared.map((img, index) => (
          <View key={index} style={styles.imageWrapper}>
            <Image source={{ uri: img.fullUrl }} style={styles.image} />
            <TouchableOpacity
              style={styles.deleteIcon}
              onPress={() => confirmDeleteImage(img.original)}
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

      {prepared.length > 1 && (
        <View style={styles.dotsContainer}>
          {prepared.map((_, index) => (
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
    width: width - 40,
  },
  imageWrapper: {
    position: "relative",
    width: width - 40,
    height: 200,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: width - 40,
    height: 200,
    resizeMode: "cover",
    borderRadius: 10,
  },
  deleteIcon: {
    position: "absolute",
    top: 5,
    right: 30,
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
