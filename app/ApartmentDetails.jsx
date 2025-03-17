import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function ApartmentDetails() {
  const { apartment } = useLocalSearchParams();
  const apt = JSON.parse(apartment);

  return (
    <View style={styles.container}>
      <Image source={{ uri: apt.Images }} style={styles.image} />
      <Text style={styles.title}>{apt.Location}</Text>
      <Text style={styles.price}>{apt.Price} ש"ח</Text>
      <Text style={styles.description}>{apt.Description}</Text>
    </View>
  );
}

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
});
