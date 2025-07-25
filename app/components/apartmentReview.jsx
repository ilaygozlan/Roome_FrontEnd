import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Image
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { userInfoContext } from "../contex/userInfoContext";
import API from "../../config";

/**
 * @component ApartmentReview
 * @description Component for displaying and managing apartment reviews and ratings.
 * Allows users to view, add, and delete reviews, and displays average ratings.
 *
 * Features:
 * - Display average rating
 * - List all reviews
 * - Add new reviews with star rating
 * - Delete own reviews
 * - RTL (Right-to-Left) layout support
 * - User-specific review management
 *
 * @param {Object} props
 * @param {number} props.apartmentId - ID of the apartment being reviewed
 *
 * State Management:
 * - Reviews list
 * - Average rating
 * - New review input
 * - User review status
 * - Rating selection
 */

export default function ApartmentReview({ apartmentId }) {
  const { loginUserId } = useContext(userInfoContext);

  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [averageRating, setAverageRating] = useState("0");
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    if (!apartmentId) return;
    setReviews([]);
    setNewReview("");
    setNewRating(0);
    setHasReviewed(false);
    fetchReviews();
  }, [apartmentId]);

  useEffect(() => {
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    setAverageRating(
      reviews.length ? (total / reviews.length).toFixed(1) : "0"
    );
  }, [reviews]);

  /**
   * Fetches reviews for a specific apartment
   * @async
   * @function fetchReviews
   * @returns {Promise<void>}
   */
  const fetchReviews = async () => {
    try {
      const response = await fetch(
        API + `Review/GetReviewsForApartment/${apartmentId}`
      );
      const contentType = response.headers.get("content-type");

      if (!response.ok) {
        const errorText = await response.text();
        console.warn("No reviews found:", errorText);
        setReviews([]);
        setHasReviewed(false);
        return;
      }

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        const mapped = data.map((r) => ({
          id: r.reviewId,
          user: r.UserID === loginUserId ? "You" : r.ReviewerName,
          comment: r.review,
          rating: r.rate,
          userId: r.UserID,
          avatar: r.ReviewerProfilePicture,
        }));

        setReviews(mapped);
        setHasReviewed(mapped.some((r) => r.userId === loginUserId));
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  /**
   * Adds a new review for the apartment
   * @async
   * @function addReview
   * @returns {Promise<void>}
   */
  const addReview = async () => {
    if (!newReview || !newRating) return;
    try {
      const response = await fetch(API + "Review/AddNewReview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/plain",
        },
        body: JSON.stringify({
          reviewId: 0,
          apartmentId,
          rate: newRating,
          reviewText: newReview,
          userId: loginUserId,
        }),
      });

      if (response.ok) {
        await fetchReviews();
        setNewReview("");
        setNewRating(0);
      } else {
        console.error("Error adding review:", response.status);
      }
    } catch (err) {
      console.error("Error sending review:", err);
    }
  };

  /**
   * Deletes a review by ID
   * @async
   * @function deleteReview
   * @param {number} reviewId - ID of the review to delete
   * @returns {Promise<void>}
   */
  const deleteReview = async (reviewId) => {
    Alert.alert("מחיקת ביקורת", "אתה בטוח?", [
      { text: "ביטול", style: "cancel" },
      {
        text: "מחק",
        onPress: async () => {
          try {
            const response = await fetch(
              API + `Review/DeleteReview/${reviewId}`,
              {
                method: "DELETE",
                headers: { Accept: "text/plain" },
              }
            );
            if (response.ok) {
              await fetchReviews();
            } else {
              console.error("Failed to delete review:", response.status);
            }
          } catch (err) {
            console.error("Error deleting review:", err);
          }
        },
      },
    ]);
  };

  /**
   * Renders an individual review item
   * @function renderItem
   * @param {Object} props
   * @param {Object} props.item - Review data object
   * @returns {JSX.Element}
   */
const renderItem = ({ item }) => (
  <View key={item.id} style={styles.reviewCard}>
    <View style={styles.reviewHeader}>
      <View style={styles.rightSide}>
        {item.avatar && (
          <Image
            source={{ uri: item.avatar }}
            style={styles.avatar}
          />
        )}
        <Text style={styles.reviewUser}>{item.user}</Text>
      </View>

      <View style={styles.leftSide}>
        <View style={styles.ratingRow}>
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

        {item.userId === loginUserId && (
          <TouchableOpacity onPress={() => deleteReview(item.id)}>
            <AntDesign name="delete" size={20} color="#fb923c" />
          </TouchableOpacity>
        )}
      </View>
    </View>

    <Text style={styles.reviewComment}>{item.comment}</Text>
  </View>
);


  return (
    <View style={{ paddingBottom: 50 }}>
      <View style={styles.ratingSummary}>
        <Text style={styles.averageRating}>דירוג כולל: {averageRating}/5</Text>
        <AntDesign name="star" size={20} color="#fb923c" />
      </View>

      <Text style={styles.sectionTitle}>ביקורות משתמשים</Text>

      <FlatList
        data={reviews}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 10, color: "gray" }}>
            עדיין אין ביקורות.
          </Text>
        }
      />

      {!hasReviewed && (
        <KeyboardAvoidingView>
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
                  <TouchableOpacity
                    key={index}
                    onPress={() => setNewRating(index + 1)}
                  >
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
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

/**
 * Component styles
 * @constant
 * @type {Object}
 */
const styles = StyleSheet.create({
  averageRating: {
    fontSize: 17,
    fontWeight: "bold",
    textAlign: "right",
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2563eb",
    marginTop: 25,
    textAlign: "right",
  },
  reviewCard: {
    backgroundColor: "#eff6ff",
    padding: 12,
    borderRadius: 10,
    marginVertical: 6,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  reviewUser: { fontWeight: "bold", color: "#1d4ed8" },
  reviewComment: { color: "#555", marginBottom: 5, textAlign: "right" },
  addReviewSection: {
    marginVertical: 15,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#fff7ed",
  },
  addReviewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "right",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    textAlign: "right",
    elevation: 2,
  },
  ratingStars: {
    flexDirection: "row",
    marginVertical: 10,
    alignSelf: "center",
  },
  submitButton: {
    backgroundColor: "#fb923c",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  submitText: { color: "white", fontWeight: "bold" },
  reviewInfo: {
  flexDirection: "row-reverse",
  alignItems: "center",
  gap: 8,
},

reviewHeader: {
  flexDirection: "row-reverse",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 6,
},

rightSide: {
  flexDirection: "row-reverse",
  alignItems: "center",
  gap: 8,
},

leftSide: {
  flexDirection: "row-reverse",
  alignItems: "center",
  gap: 10,
},

ratingRow: {
  flexDirection: "row-reverse",
  alignItems: "center",
},

avatar: {
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: "#ddd",
},

});
