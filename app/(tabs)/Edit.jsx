import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { AntDesign } from "@expo/vector-icons";

export default function Edit() {
  const { apartment } = useLocalSearchParams();

  const apt = apartment
    ? JSON.parse(apartment)
    : {
        Location: "גן ורד, גורדון",
        Price: 5500,
        Description: "דירה מקסימה במרכז העיר עם נוף לים",
        Images:
          "https://images2.madlan.co.il/t:nonce:v=2/projects/%D7%9E%D7%AA%D7%97%D7%9D%20%D7%A7%D7%95%D7%A4%D7%AA%20%D7%97%D7%95%D7%9C%D7%99%D7%9D%20-%20%D7%A2%D7%96%D7%A8%D7%99%D7%90%D7%9C%D7%99/48950_br_group_pic_950x650_3-683b75f9-b8f5-427d-8f29-cad7d8865ff4.jpg",
      };

  const [reviews, setReviews] = useState([
    { id: "1", user: "IDAN", comment: "דירה מקסימה, נהניתי מאוד", rating: 4 },
    { id: "2", user: "VARDA", comment: "מיקום מרכזי, נקייה ומוארת", rating: 4 },
    { id: "3", user: "Ozi", comment: "קצת רועשת, לא הייתי ממליצה", rating: 2 },
  ]);

  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    setAverageRating((totalRating / reviews.length).toFixed(1));
  }, [reviews]);

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

  const deleteReview = (id, user) => {
    if (user === "You") {
      setReviews((prev) => prev.filter((review) => review.id !== id));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: apt.Images }} style={styles.image} />

      <Text style={styles.title}>{apt.Location}</Text>
      <Text style={styles.price}>{apt.Price} ש"ח</Text>
      <Text style={styles.description}>{apt.Description}</Text>
      <View style={styles.ratingSummary}>
        <Text style={styles.averageRating}>דירוג כולל: 5/{averageRating} </Text>
        <AntDesign name="star" size={20} color="#fb923c" />
      </View>
      <Text style={styles.sectionTitle}>ביקורות משתמשים</Text>
      {reviews.map((item) => (
        <View key={item.id} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewUser}>{item.user}</Text>
            {item.user === "You" && (
              <TouchableOpacity onPress={() => deleteReview(item.id, item.user)}>
                <AntDesign name="delete" size={20} color="#fb923c" />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.reviewComment}>{item.comment}</Text>

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

      <View style={styles.addReviewSection}>
        <Text style={styles.addReviewTitle}>הוסף ביקורת חדשה:</Text>
        <TextInput
          style={styles.input}
          placeholder="כתוב ביקורת כאן..."
          value={newReview}
          onChangeText={setNewReview}
        />
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
        <TouchableOpacity style={styles.submitButton} onPress={addReview}>
          <Text style={styles.submitText}>הוספת ביקורת</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
