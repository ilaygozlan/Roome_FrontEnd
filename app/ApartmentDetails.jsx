import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function ApartmentDetails() {
  const { apartment } = useLocalSearchParams();
  const apt = JSON.parse(apartment);

  // Dummy Open House Data (You can fetch this dynamically)
  const openHouses = [
    { id: 1, date: "March 25, 2025", time: "10:00 AM", location: apt.Location },
    { id: 2, date: "April 1, 2025", time: "2:00 PM", location: apt.Location },
  ];

  return (
    <View style={styles.container}>
      {/* Apartment Image */}
      <Image source={{ uri: apt.Images }} style={styles.image} />

      {/* Apartment Details */}
      <Text style={styles.title}>{apt.Location}</Text>
      <Text style={styles.price}>{apt.Price} ש"ח</Text>
      <Text style={styles.description}>{apt.Description}</Text>

      {/* Open House Section */}
      <Text style={styles.sectionTitle}>🏡 Open Houses:</Text>
      
      {openHouses.length > 0 ? (
        <FlatList
          data={openHouses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.openHouseItem}>
              <Text style={styles.openHouseText}>{item.date} - {item.time}</Text>
              <Text style={styles.openHouseLocation}>{item.location}</Text>
              <TouchableOpacity
                style={styles.registerButton}
                onPress={() => alert(`Registered for ${item.date} at ${item.location}`)}
              >
                <Text style={styles.registerText}>Register</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noOpenHouses}>No open houses available</Text>
      )}
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "right",
    marginTop: 10,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "right",
    color: "green",
    marginTop: 5,
  },
  description: {
    fontSize: 16,
    textAlign: "right",
    marginTop: 10,
    color: "#555",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    textAlign: "right",
  },
  openHouseItem: {
    backgroundColor: "#F4B982",
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  openHouseText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  openHouseLocation: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  registerButton: {
    backgroundColor: "#E3965A",
    padding: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  registerText: {
    color: "white",
    fontWeight: "bold",
  },
  noOpenHouses: {
    textAlign: "center",
    color: "gray",
    fontSize: 16,
  },
});
