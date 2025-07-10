import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";

const RecommendedRoommates = ({ roommates }) => {
  const router = useRouter();

  if (!roommates || roommates.length === 0) return null;

  const handleStartChat = (user) => {
    Alert.alert(
      "התחלת שיחה",
      `האם אתה רוצה להתחיל צ'אט עם: ${user.fullName}?`,
      [
        { text: "ביטול", style: "cancel" },
        {
          text: "כן",
          onPress: () => router.push(`/chat/${user.id}`),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>שותפים מומלצים</Text>
      <View style={styles.grid}>
        {roommates.map((user) => (
          <TouchableOpacity
            key={user.id}
            style={styles.card}
            onPress={() => handleStartChat(user)}
          >
            <Image
              source={{
                uri:
                  user.profilePicture ||
                  "https://www.w3schools.com/howto/img_avatar.png",
              }}
              style={styles.avatar}
            />
            <Text style={styles.name}>{user.fullName}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
  },
  card: {
    width: 110,
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});

export default RecommendedRoommates;
