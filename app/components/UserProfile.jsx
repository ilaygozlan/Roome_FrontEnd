import React, { useState, useContext, useEffect } from "react";
import { Text, TouchableOpacity, View, StyleSheet, Modal, TextInput, Image, ScrollView, ActivityIndicator } from "react-native";
import { FontAwesome5, MaterialIcons, Feather } from "@expo/vector-icons";
import FavoriteApartmentsScreen from "./FavoriteApartmentsScreen";
import MyPublishedApartmentsScreen from "./MyPublishedApartmentsScreen";
import { userInfoContext } from "../contex/userInfoContext";
import API from "../../config";

const UserProfile = () => {
  const { userProfile, setUserProfile, loading, error } = useContext(userInfoContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showMyPublished, setShowMyPublished] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState(userProfile || {});
  
  // state לרשימת החברים
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [friendsError, setFriendsError] = useState(null);

  useEffect(() => {
    if (userProfile) {
      setUpdatedProfile(userProfile);
    }
  }, [userProfile]);

  useEffect(() => {
    if (userProfile && userProfile.id) {
      fetch(API + "User/GetUserFriends/" + userProfile.id)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch friends");
          }
          return response.json();
        })
        .then((data) => {
          setFriends(data);
          setFriendsLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching friends:", err);
          setFriendsError(err);
          setFriendsLoading(false);
        });
    }
  }, [userProfile]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2661A1" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: "red" }}>שגיאה בטעינת הפרופיל: {error.message}</Text>
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View style={styles.loadingContainer}>
        <Text>אין נתוני משתמש להצגה</Text>
      </View>
    );
  }

  const handleSave = () => {
    setUserProfile(updatedProfile);
    setModalVisible(false);
  };

  return (
    <View style={{ flex: 1 }}>
      {showFavorites && (
        <View style={StyleSheet.absoluteFillObject}>
          <FavoriteApartmentsScreen onClose={() => setShowFavorites(false)} />
        </View>
      )}
      {showMyPublished && (
        <View style={StyleSheet.absoluteFillObject}>
          <MyPublishedApartmentsScreen onClose={() => setShowMyPublished(false)} />
        </View>
      )}
      <ScrollView style={styles.container}>
        <View style={styles.headerBackground} />
        <View style={styles.profileContainer}>
          <Image
            source={
              userProfile.profilePicture
                ? { uri: userProfile.profilePicture }
                : { uri: "https://www.w3schools.com/howto/img_avatar.png" }
            }
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.editIcon} onPress={() => setModalVisible(true)}>
            <Feather name="edit" size={20} color="white" />
          </TouchableOpacity>
          <View style={styles.nameContainer}>
            <Text style={styles.profileName}>{userProfile.fullName}</Text>
          </View>
          <View style={styles.infoGrid}>
            <InfoCard full icon={<FontAwesome5 name="envelope" size={18} color="#2661A1" />} value={userProfile.email} />
            <InfoCard full icon={<FontAwesome5 name="phone" size={18} color="#2661A1" />} value={userProfile.phoneNumber} />
            <InfoCard
              full
              icon={<FontAwesome5 name="venus-mars" size={18} color="#2661A1" />}
              value={userProfile.gender === "F" ? "נקבה" : userProfile.gender === "M" ? "זכר" : userProfile.gender}
            />
            <InfoCard
              full
              icon={<FontAwesome5 name="birthday-cake" size={18} color="#2661A1" />}
              value={(() => {
                const date = new Date(userProfile.birthDate);
                const day = date.getDate().toString().padStart(2, "0");
                const month = (date.getMonth() + 1).toString().padStart(2, "0");
                const year = date.getFullYear().toString().slice(-2);
                return `${day}/${month}/${year}`;
              })()}
            />
            <InfoCard full icon={<FontAwesome5 name="dog" size={18} color="#2661A1" />} value={userProfile.ownPet ? "בעל חיית מחמד" : "אין לי חיית מחמד"} />
            <InfoCard full icon={<FontAwesome5 name="smoking" size={18} color="#2661A1" />} value={userProfile.smoke ? "מעשן" : "לא מעשן"} />
            <InfoCard full icon={<FontAwesome5 name="briefcase" size={18} color="#2661A1" />} value={userProfile.jobStatus} />
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.smallButton} onPress={() => setShowFavorites(true)}>
            <MaterialIcons name="favorite" size={20} color="white" />
            <Text style={styles.buttonText}>דירות שאהבתי</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallButton} onPress={() => setShowMyPublished(true)}>
            <MaterialIcons name="apartment" size={20} color="white" />
            <Text style={styles.buttonText}>דירות שפרסמתי</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.friendsSection}>
          <Text style={styles.sectionTitle}>החברים שלי</Text>
          {friendsLoading ? (
            <ActivityIndicator size="small" color="#2661A1" />
          ) : friendsError ? (
            <Text style={{ color: "red" }}>שגיאה בטעינת החברים</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {friends.map((friend) => (
                <TouchableOpacity
                  key={friend.id}
                  style={styles.friendItem}
                  onPress={() => {
                    // כאן יש להוסיף ניווט לפרופיל של החבר, לדוגמה:
                    // navigation.navigate("UserProfile", { id: friend.id });
                  }}
                >
                  <Image
                    source={
                      friend.profilePicture
                        ? { uri: friend.profilePicture }
                        : { uri: "https://www.w3schools.com/howto/img_avatar.png" }
                    }
                    style={styles.friendImage}
                  />
                  <Text style={styles.friendName}>{friend.fullName}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <Modal
          animationType="slide"
          transparent
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>ערוך פרופיל</Text>
              <TextInput
                style={styles.input}
                placeholder="שם מלא"
                value={updatedProfile.fullName}
                onChangeText={(text) => setUpdatedProfile({ ...updatedProfile, fullName: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={updatedProfile.email}
                onChangeText={(text) => setUpdatedProfile({ ...updatedProfile, email: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="מספר טלפון"
                value={updatedProfile.phoneNumber}
                onChangeText={(text) => setUpdatedProfile({ ...updatedProfile, phoneNumber: text })}
              />
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.buttonText}>שמור</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

const InfoCard = ({ icon, value, full = false }) => (
  <View style={[styles.infoCard, full && styles.fullWidth]}>
    <View style={styles.infoIcon}>{icon}</View>
    <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="tail">
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  headerBackground: { width: "100%", height: 200, backgroundColor: "#2661A1", position: "absolute", top: 0 },
  profileContainer: {
    alignItems: "center",
    marginTop: 120,
    backgroundColor: "white",
    width: "90%",
    borderRadius: 25,
    padding: 25,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
    alignSelf: "center",
    position: "relative"
  },
  profileImage: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: "white", marginTop: -80 },
  nameContainer: { marginTop: 10 },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2661A1",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5
  },
  infoGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: 20 },
  infoCard: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row-reverse",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0"
  },
  infoIcon: { marginLeft: 10 },
  infoValue: {
    fontSize: 14,
    flexShrink: 1,
    flexWrap: "wrap",
    overflow: "hidden",
    maxWidth: "100%",
    color: "#333",
    fontWeight: "600",
    textAlign: "right"
  },
  fullWidth: { width: "100%" },
  buttonsContainer: { flexDirection: "row", justifyContent: "space-around", marginVertical: 20, paddingHorizontal: 20 },
  smallButton: {
    alignItems: "center",
    backgroundColor: "#2661A1",
    padding: 5,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    width: 120,
    height: 80,
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6
  },
  friendsSection: { paddingHorizontal: 20, marginBottom: 30 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15, textAlign: "right", color: "#222" },
  friendItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3
  },
  friendImage: { width: 50, height: 50, borderRadius: 25, marginLeft: 10 },
  friendName: { fontSize: 16, fontWeight: "500", color: "#444" },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.4)" },
  modalContent: { backgroundColor: "white", padding: 25, borderRadius: 20, width: "85%", elevation: 15, alignItems: "center" },
  modalTitle: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  input: { borderBottomWidth: 1, borderColor: "#ccc", width: "100%", marginBottom: 20, paddingVertical: 8, fontSize: 16, textAlign: "right" },
  saveButton: { backgroundColor: "#2661A1", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 10, width: "100%" },
  buttonText: { color: "#fff", fontSize: 14, fontWeight: "600", marginTop: 8, textAlign: "center" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" }
});

export default UserProfile;
