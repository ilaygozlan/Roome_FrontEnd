import React, { useState, useRef } from 'react';
import { View, ScrollView, Image, StyleSheet, Dimensions, Text } from 'react-native';

/**
 * @component ApartmentGallery
 * @description Image gallery component for displaying apartment photos with pagination.
 * Supports both local and remote images with automatic URL handling.
 * 
 * Features:
 * - Horizontal scrolling gallery
 * - Pagination dots indicator
 * - Placeholder for no images
 * - Automatic image URL handling
 * - Responsive design
 * 
 * @param {Object} props
 * @param {string} props.images - Comma-separated string of image URLs
 */

const { width } = Dimensions.get('window');
const baseUrl = "https://roomebackend20250414140006.azurewebsites.net";

/**
 * Processes image URLs to ensure they are properly formatted
 * @param {string} images - Comma-separated string of image URLs
 * @returns {Array<string>} Array of properly formatted image URLs
 */
const GetImagesArr = (images)=>{
  const imageArray = images?.split(',').map((img) => {
    const trimmed = img.trim();
    return trimmed.startsWith('https') ? trimmed : `${baseUrl}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
  }) || [];
  return imageArray;
}


/**
 * Handles scroll events to update the current image index
 * @param {Object} event - Scroll event object
 */
const handleScroll = (event) => {
  const x = event.nativeEvent.contentOffset.x;
  const index = Math.round(x / width);
  setCurrentIndex(index);
};

export default function ApartmentGallery({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef();
  const imageArray = GetImagesArr(images);

  // If no images, return a placeholder box
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
              style={[
                styles.dot,
                index === currentIndex && styles.activeDot,
              ]}
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
    width: width,
    height: 200,
    resizeMode: 'cover',
  },
  placeholder: {
    width: width,
    height: 150,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#777',
    fontSize: 16,
    fontStyle: 'italic',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#E3965A',
  },
});
