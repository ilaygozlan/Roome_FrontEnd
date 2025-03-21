import React, { useState } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, Text } from "react-native";
import ApartmentCard from "./apartment"; 

const initialFavorites = [
  {
    id: 1,
    image: "https://images2.madlan.co.il/t:nonce:v=2/projects/48950_br_group_pic.jpg",
    location: "King George 77, תל אביב",
    price: 6623,
    description: "דירת 3 חדרים עם נוף",
  },
  {
    id: 2,
    image: "https://img.yad2.co.il/Pic/202407/22/2_6/o2_6_1_02750.jpg",
    location: "Dizengoff, תל אביב",
    price: 9200,
    description: "דירת גן מהממת עם חנייה",
  },
  {
    id: 3,
    image: "https://israprop.com/wp-content/uploads/2022/02/42a04fd7.jpg",
    location: "רחוב הירקון, תל אביב",
    price: 5000,
    description: "דירה מושקעת ליד הים",
  },
];

const FavoriteApartmentsScreen = ({ onClose }) => {
  const [favorites, setFavorites] = useState(initialFavorites);

  const handleUnlike = (id) => {
    setFavorites((prev) => prev.filter((apt) => apt.id !== id));
  };

  return (
    <View style={styles.overlay}>
     <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>הדירות שאהבתי</Text>
          </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {favorites.map((apt) => (
          <View key={apt.id} style={styles.card}>
            <ApartmentCard
              apartment={apt}
              isFavorite
              onUnlike={() => handleUnlike(apt.id)}
            />
          </View>
        ))}

        {favorites.length === 0 && (
          <Text style={styles.emptyText}>אין דירות שמורות כרגע 💔</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "white",
    zIndex: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", 
    padding: 15,
    backgroundColor: "#2661A1",
  },
  backButton: {
    padding: 5,
  },
  backText: {
    color: "white",
    fontSize: 18,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  scrollContainer: {
    padding: 10,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 15,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#777",
  },
});

export default FavoriteApartmentsScreen;
