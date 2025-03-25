import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { AntDesign } from "@expo/vector-icons";

export default function Edit() {
  // Retrieve the apartment parameter from the local search parameters
  const { apartment } = useLocalSearchParams();

  // If an apartment is passed as a parameter, parse it; otherwise, use a default apartment object
  const apt = apartment
    ? JSON.parse(apartment)
    : {
        Location: "גן ורד, גורדון",
        Price: 5500,
        Description: "דירה מקסימה במרכז העיר עם נוף לים",
        Images:
          "https://images2.madlan.co.il/t:nonce:v=2/projects/%D7%9E%D7%AA%D7%97%D7%9D%20%D7%A7%D7%95%D7%A4%D7%AA%20%D7%97%D7%95%D7%9C%D7%99%D7%9D%20-%20%D7%A2%D7%96%D7%A8%D7%99%D7%90%D7%9C%D7%99/48950_br_group_pic_950x650_3-683b75f9-b8f5-427d-8f29-cad7d8865ff4.jpg",
      };

  // Initial reviews state with some default reviews
  const [reviews, setReviews] = useState([
    { id: "1", user: "IDAN", comment: "דירה מקסימה, נהניתי מאוד", rating: 4 },
    { id: "2", user: "VARDA", comment: "מיקום מרכזי, נקייה ומוארת", rating: 4 },
    { id: "3", user: "Ozi", comment: "קצת רועשת, לא הייתי ממליצה", rating: 2 },
  ]);

  // States for storing the new review text and rating, as well as the computed average rating
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  // Calculate the average rating whenever the reviews array changes
  useEffect(() => {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    setAverageRating((totalRating / reviews.length).toFixed(1));
  }, [reviews]);

  // Function to add a new review if both review text and rating are provided
  const addReview = () => {
    if (newReview && newRating) {
      setReviews((prev) => [
        ...prev,
        { id: Date.now().toString(), user: "You", comment: newReview, rating: newRating },
      ]);
      setNewReview("");
      setNewRating(0);
    }
  };

  // Function to delete a review; only allows deletion if the review was created by "You"
  const deleteReview = (id, user) => {
    if (user === "You") {
      setReviews((prev) => prev.filter((review) => review.id !== id));
    }
  };

  return (
    // ScrollView to allow scrolling when content overflows the screen height
    <ScrollView contentContainerStyle={styles.container}>
      {/* Display the apartment image */}
      <Image source={{ uri: apt.Images }} style={styles.image} />

      {/* Display apartment details: location, price, and description */}
      <Text style={styles.title}>{apt.Location}</Text>
      <Text style={styles.price}>{apt.Price} ש"ח</Text>
      <Text style={styles.description}>{apt.Description}</Text>
      
      {/* Rating summary section showing the average rating */}
      <View style={styles.ratingSummary}>
      <Text style={styles.averageRating}>דירוג כולל: {averageRating}/5</Text>
      <AntDesign name="star" size={20} color="#fb923c" />
      </View>
      
      {/* Section title for user reviews */}
      <Text style={styles.sectionTitle}>ביקורות משתמשים</Text>
      {/* Map through the reviews array to display each review */}
      {reviews.map((item) => (
        <View key={item.id} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            {/* Display reviewer's name */}
            <Text style={styles.reviewUser}>{item.user}</Text>
            {/* If the review was made by "You", allow deletion */}
            {item.user === "You" && (
              <TouchableOpacity onPress={() => deleteReview(item.id, item.user)}>
                <AntDesign name="delete" size={20} color="#fb923c" />
              </TouchableOpacity>
            )}
          </View>

          {/* Display the review comment */}
          <Text style={styles.reviewComment}>{item.comment}</Text>

          {/* Display the star rating for the review */}
          <View style={{ flexDirection: "row" }}>
            {Array(5)
              .fill()
              .map((_, index) => (
                <AntDesign
                  key={index}
                  name={index < item.rating ? "star" : "staro"}
                  size={18}
                  color="#fb923c"
                />
              ))}
          </View>
        </View>
      ))}

      {/* Section for adding a new review */}
      <View style={styles.addReviewSection}>
        <Text style={styles.addReviewTitle}>הוסף ביקורת חדשה:</Text>
        {/* Input field for entering the review text */}
        <TextInput
          style={styles.input}
          placeholder="כתוב ביקורת כאן..."
          value={newReview}
          onChangeText={setNewReview}
        />
        {/* Display star icons for selecting a rating */}
        <View style={styles.ratingStars}>
          {Array(5)
            .fill()
            .map((_, index) => (
              <TouchableOpacity key={index} onPress={() => setNewRating(index + 1)}>
                <AntDesign
                  name={index < newRating ? "star" : "staro"}
                  size={30}
                  color="#fb923c"
                />
              </TouchableOpacity>
            ))}
        </View>
        {/* Button to submit the new review */}
        <TouchableOpacity style={styles.submitButton} onPress={addReview}>
          <Text style={styles.submitText}>הוספת ביקורת</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  averageRating:{fontSize: 17, fontWeight: "bold", textAlign: "right", marginTop: 12},
  container: { flexGrow: 1, padding: 15, paddingBottom: 120, backgroundColor: "#fff" },
  image: { width: "100%", height: 250, borderRadius: 12 },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "right", marginTop: 12 },
  price: { fontSize: 18, color: "green", textAlign: "right", marginTop: 5 },
  description: { fontSize: 16, color: "#555", textAlign: "right", marginTop: 8 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#2563eb", marginTop: 25, textAlign: "right" },
  reviewCard: {
    backgroundColor: "#eff6ff",
    padding: 12,
    borderRadius: 10,
    marginVertical: 6,
    elevation: 2,
  },
  reviewHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  reviewUser: { fontWeight: "bold", color: "#1d4ed8" },
  reviewComment: { color: "#555", marginBottom: 5, textAlign: "right" },
  addReviewSection: { marginVertical: 15, padding: 10, borderRadius: 12, backgroundColor: "#fff7ed" },
  addReviewTitle: { fontSize: 18, fontWeight: "bold", textAlign: "right", marginBottom: 8 },
  input: { backgroundColor: "#fff", padding: 10, borderRadius: 8, textAlign: "right", elevation: 2 },
  ratingStars: { flexDirection: "row", marginVertical: 10, alignSelf: "center" },
  submitButton: { backgroundColor: "#fb923c", padding: 12, borderRadius: 10, alignItems: "center" },
  submitText: { color: "white", fontWeight: "bold" },
});
