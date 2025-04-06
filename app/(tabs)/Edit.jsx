<<<<<<< Updated upstream
=======
import React, { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { ActiveApartmentContext } from "../contex/ActiveApartmentContext";
import ApartmentGallery from "../components/ApartmentGallery";

export default function Edit() {
  const { apartment } = useLocalSearchParams();

  // Temporary userId (in real use, this would come from login/session)
  const userId = 999;

  // Parse apartment from params or use default

     const { allApartments, setAllApartments } = useContext(ActiveApartmentContext);
     const apt = allApartments;
  console.log(apt);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [hasReviewed, setHasReviewed] = useState(false);

  // Calculate average rating
  useEffect(() => {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    setAverageRating(reviews.length ? (totalRating / reviews.length).toFixed(1) : "0");
  }, [reviews]);

  // Fetch reviews from server and check if current user has already submitted one
  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/Review/GetReviewsForApartment/${apt.ApartmentID}`);
      const data = await response.json();

      const mappedReviews = data.map((r) => ({
        id: r.reviewId,
        user: r.userId === userId ? "You" : `User ${r.userId}`,
        comment: r.reviewText,
        rating: r.rate,
        userId: r.userId
      }));

      setReviews(mappedReviews);

      const found = mappedReviews.find((r) => r.userId === userId);
      setHasReviewed(!!found);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Add a new review
  const addReview = async () => {
    if (newReview && newRating) {
      try {
        const response = await fetch("http://localhost:5000/api/Review/AddNewReview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/plain",
          },
          body: JSON.stringify({
            reviewId: 0,
            apartmentId: apt.ApartmentId,
            rate: newRating,
            reviewText: newReview,
            userId: userId,
          }),
        });

        if (response.ok) {
          const responseText = await response.text();
          console.log("Review added:", responseText);

          // Refresh list from server
          await fetchReviews();
          setNewReview("");
          setNewRating(0);
          setHasReviewed(true);
        } else {
          console.error("Server returned an error:", response.status);
        }
      } catch (error) {
        console.error("Error sending review:", error);
      }
    }
  };

  // Delete review and refresh list
  const deleteReview = async (reviewId) => {
    Alert.alert("מחיקת ביקורת", "אתה בטוח שאתה רוצה למחוק את הביקורת?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: async () => {
          try {
            const response = await fetch(`http://localhost:5000/api/Review/DeleteReview/${reviewId}`, {
              method: "DELETE",
              headers: {
                Accept: "text/plain",
              },
            });

            if (response.ok) {
              console.log("Review deleted");
              await fetchReviews(); // Refresh after deletion
              setHasReviewed(false);
            } else {
              console.error("Failed to delete review:", response.status);
            }
          } catch (error) {
            console.error("Error deleting review:", error);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ApartmentGallery images={apt.Images} />
      <Text style={styles.title}>{apt.Location}</Text>
      <Text style={styles.price}>{apt.Price} ש"ח</Text>
      <Text style={styles.description}>{apt.Description}</Text>

      <View style={styles.ratingSummary}>
        <Text style={styles.averageRating}>דירוג כולל: {averageRating}/5</Text>
        <AntDesign name="star" size={20} color="#fb923c" />
      </View>

      <Text style={styles.sectionTitle}>ביקורות משתמשים</Text>

      {reviews.map((item) => (
        <View key={item.id} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewUser}>{item.user}</Text>
            {item.userId === userId && (
              <TouchableOpacity onPress={() => deleteReview(item.id)}>
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

      {/* Show form only if user hasn't reviewed yet */}
      {!hasReviewed ? (
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
      ) : (
        <Text style={{ textAlign: "center", marginVertical: 10, fontWeight: "bold", color: "#fb923c" }}>
          כבר הוספת ביקורת לדירה זו 📝
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  averageRating: { fontSize: 17, fontWeight: "bold", textAlign: "right", marginTop: 12 },
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
>>>>>>> Stashed changes
