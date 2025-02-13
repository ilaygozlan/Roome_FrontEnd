import { View, Text, ScrollView, StyleSheet } from 'react-native';
import React from 'react';
import { useLocalSearchParams } from 'expo-router';

const Items = () => {
  const { itemName } = useLocalSearchParams();

  // Pre-made information for each item
  const itemInfo = {
    Apple: {
      description: 'Apples are sweet, crunchy fruits that come in a variety of colors including red, green, and yellow.',
      nutrition: 'High in fiber, vitamin C, and antioxidants.',
    },
    Banana: {
      description: 'Bananas are tropical fruits that have a sweet taste and soft texture when ripe.',
      nutrition: 'Rich in potassium, vitamin B6, and vitamin C.',
    },
    Carrot: {
      description: 'Carrots are root vegetables, typically orange, and are known for their crunchy texture.',
      nutrition: 'High in vitamin A, fiber, and antioxidants.',
    },
    Tomato: {
      description: 'Tomatoes are juicy, red fruits that are often used in salads, sauces, and soups.',
      nutrition: 'High in vitamin C, potassium, and antioxidants like lycopene.',
    },
    Potato: {
      description: 'Potatoes are starchy tubers that can be boiled, mashed, baked, or fried.',
      nutrition: 'High in carbohydrates, vitamin C, and potassium.',
    },
    Spinach: {
      description: 'Spinach is a leafy green vegetable that is often used in salads or cooked dishes.',
      nutrition: 'High in iron, vitamin K, and folate.',
    },
    Cucumber: {
      description: 'Cucumbers are cool, crunchy vegetables often used in salads or eaten raw.',
      nutrition: 'Low in calories, high in water content, and a good source of vitamins K and C.',
    },
    Onion: {
      description: 'Onions are round vegetables with a strong flavor, often used in cooking to add flavor to dishes.',
      nutrition: 'High in antioxidants, vitamin C, and various minerals.',
    },
    Lettuce: {
      description: 'Lettuce is a leafy green vegetable commonly used in salads and sandwiches.',
      nutrition: 'Low in calories, a good source of vitamins A and K.',
    },
    Mango: {
      description: 'Mangoes are tropical fruits known for their sweet and juicy flesh.',
      nutrition: 'Rich in vitamin C, vitamin A, and fiber.',
    },
  };

  // Check if itemName exists in the itemInfo object
  const selectedItemInfo = itemName && itemInfo[itemName];

  return (
    <View style={styles.container}>
      <ScrollView>
        {selectedItemInfo ? (
          <View style={styles.itemInfoContainer}>
            <Text style={styles.title}>{itemName}</Text>
            <Text style={styles.description}>{selectedItemInfo.description}</Text>
            <Text style={styles.nutrition}>Nutrition: {selectedItemInfo.nutrition}</Text>
          </View>
        ) : (
          <Text style={styles.noItemMessage}>No item selected. Please select a valid item to view more information.</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
  },
  nutrition: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  noItemMessage: {
    fontSize: 18,
    color: 'gray',
    textAlign: 'center',
    marginTop: 20,
  },
  itemInfoContainer: {
    marginBottom: 20,
  },
});

export default Items;
