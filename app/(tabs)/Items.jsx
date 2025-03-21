import React, { useState } from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { RectButton, Swipeable } from "react-native-gesture-handler";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function Items() {
  const [allApartments, setAllApartments] = useState([
    {
      "ApartmentID": 1001,
      "Price": 6623,
      "Location": "ewr",
      "Description": "דירת גן יפיפייה עם נוף",
      "Images": "https://images2.madlan.co.il/t:nonce:v=2/projects/%D7%9E%D7%AA%D7%97%D7%9D%20%D7%A7%D7%95%D7%A4%D7%AA%20%D7%97%D7%95%D7%9C%D7%99%D7%9D%20-%20%D7%A2%D7%96%D7%A8%D7%99%D7%90%D7%9C%D7%99/48950_br_group_pic_950x650_3-683b75f9-b8f5-427d-8f29-cad7d8865ff4.jpg"
    },
    {
      "ApartmentID": 1002,
      "Price": 9200,
      "Location": "Tel Aviv, King George 77",
      "Description": "דירה מהממת במרכז תל אביב",
      "Images": "https://img.yad2.co.il/Pic/202407/22/2_6/o/o2_6_1_02750_20240722172729.jpg?w=3840&h=3840&c=9"
    }
  ]
  );

  const [likedApartments, setLikedApartments] = useState([]);

  const handleSwipeComplete = (direction, index) => {
    if (direction === "right") {
      setLikedApartments([...likedApartments, allApartments[index]]); //add apartment to likedApartments list 
      console.log("אהבת את הדירה:", allApartments[index]);
    } else {
      console.log("דחית את הדירה:", allApartments[index]);
    }

    setAllApartments((prev) => prev.filter((_, i) => i !== index)); //remove apartment from the list 
  };

  const renderLeftActions = (progress, dragX) => (
    <RectButton style={styles.leftAction}>
      <FontAwesome name="heart" size={40} color="white" />
      <Text style={styles.actionText}>לייק</Text>
    </RectButton>
  );

  const renderRightActions = (progress, dragX) => (
    <RectButton style={styles.rightAction}>
      <MaterialCommunityIcons name="close" size={40} color="white" />
    </RectButton>
  );

  return (
    <View style={styles.container}>
      {allApartments.length > 0 ? (
        allApartments.map((apt, index) => (
          <Swipeable
            key={apt.ApartmentID}
            renderLeftActions={renderLeftActions}
            renderRightActions={renderRightActions}
            onSwipeableRightOpen={() => handleSwipeComplete("left", index)}
            onSwipeableLeftOpen={() => handleSwipeComplete("right", index)}
          >
            <View style={styles.card}>
              <Image source={{ uri: apt.Images }} style={styles.image} />
              <View style={styles.details}>
                <Text style={styles.title}>דירה ברחוב {apt.Location}</Text>
                <Text style={styles.description}>{apt.Description}</Text>
                <Text style={styles.price}>{apt.Price} ש"ח</Text>
              </View>
            </View>
          </Swipeable>
        ))
      ) : (
        <Text style={styles.noMoreText}> אין עוד דירות להצגה</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: SCREEN_WIDTH * 0.9,
    height: 500,
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginVertical: 10,
    alignSelf: "center",
  },
  image: {
    width: "100%",
    height: 250, // Adjust height to be consistent
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    resizeMode: "cover", // Ensure the image scales properly
  },
  details: {
    padding: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
    textAlign: "center",
  },
  leftAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: "100%",
    borderRadius: 10,
  },
  rightAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: "100%",
    borderRadius: 10,
  },
  actionText: {
    color: "white",
    fontWeight: "bold",
    marginTop: 5,
  },
  noMoreText: {
    fontSize: 20,
    color: "gray",
    marginTop: 50, 
    marginBottom: 20,
  },
});
