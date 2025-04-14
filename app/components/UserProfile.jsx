// UserProfile.jsx
import React, { useState, useEffect ,useContext} from "react";
import {
  Text, TouchableOpacity, View, StyleSheet, Modal,
  TextInput, Image, ScrollView, ActivityIndicator
} from "react-native";
import { FontAwesome5, MaterialIcons, Feather } from "@expo/vector-icons";
import FavoriteApartmentsScreen from "./FavoriteApartmentsScreen";
import MyPublishedApartmentsScreen from "./MyPublishedApartmentsScreen";
import API from "../../config";
import { useRouter } from "expo-router";
import { userInfoContext } from "../contex/userInfoContext";

const UserProfile = ({ userId }) => {
  const {loginUserId} = useContext(userInfoContext);
  const isMyProfile = userId === loginUserId;
  const router = useRouter();
  const [showDatePicker, setShowDatePicker] = useState(false);


  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState({});
  const [showFavorites, setShowFavorites] = useState(false);
  const [showMyPublished, setShowMyPublished] = useState(false);
  const [friends, setFriends] = useState([]);
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    fetch(API + "User/GetUserById/" + userId)
      .then(res => {
        if (!res.ok) throw new Error("שגיאה בטעינת פרופיל");
        return res.json();
      })
      .then(data => {
        setUserProfile(data);
        setUpdatedProfile(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetch(API + "User/GetUserFriends/" + userId)
        .then(res => res.json())
        .then(data => {
          setFriends(data);
          setIsFriend(data.some(f => f.id === loginUserId));
        })
        .catch(err => console.error("שגיאה בטעינת חברים", err));
    }
  }, [userId]);

  const handleFriendToggle = () => {
    if (isFriend) {
      fetch(`${API}User/RemoveFriend/${loginUserId}/${userId}`, {
        method: "DELETE",
      })
        .then(() => setIsFriend(false))
        .catch((err) => console.error("שגיאה בהסרת חבר", err));
    } else {
      fetch(`${API}User/AddFriend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userID1: loginUserId,
          userID2: userId,
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("שגיאה בהוספת חבר");
          return res.text();
        })
        .then(() => setIsFriend(true))
        .catch((err) => console.error(err));
    }
  };
  

  const handleSave = async () => {
    const updatedUser = {
      id: loginUserId, 
      email: updatedProfile.email,
      fullName: updatedProfile.fullName,
      phoneNumber: updatedProfile.phoneNumber,
      gender: updatedProfile.gender === "ז" ? "M" :
              updatedProfile.gender === "נ" ? "F" :
              updatedProfile.gender,
      birthDate: updatedProfile.birthDate
        ? new Date(updatedProfile.birthDate).toISOString()
        : null,
      profilePicture: updatedProfile.profilePicture,
      ownPet: updatedProfile.ownPet,
      smoke: updatedProfile.smoke,
      jobStatus: updatedProfile.jobStatus,
      isActive: true,
      token: updatedProfile.token || ""
    };
  
    console.log("🚀 updatedUser:", updatedUser);
  
    try {
      const res = await fetch(API + "User/UpdateUserDetails", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });
  
      if (!res.ok) throw new Error("Failed to update profile");
  
      console.log("✔️ profile updated");
      setModalVisible(false);
    } catch (err) {
      console.error("❌", err);
    }
  };
  
  if (loading) return <ActivityIndicator size="large" color="#2661A1" style={{ flex: 1 }} />;
  if (error || !userProfile) return <Text style={{ color: "red", textAlign: "center", marginTop: 40 }}>שגיאה: {error?.message}</Text>;

  return (
    <View style={{ flex: 1 }}>
      <Modal visible={showFavorites} animationType="slide" onRequestClose={() => setShowFavorites(false)}>
        <FavoriteApartmentsScreen onClose={() => setShowFavorites(false)} />
      </Modal>
      <Modal visible={showMyPublished} animationType="slide" onRequestClose={() => setShowMyPublished(false)}>
        <MyPublishedApartmentsScreen onClose={() => setShowMyPublished(false)} />
      </Modal>

      <ScrollView style={styles.container}>
        <View style={styles.headerBackground} />
        <View style={styles.profileContainer}>
          <Image
            source={userProfile.profilePicture ? { uri: userProfile.profilePicture } : { uri: "https://www.w3schools.com/howto/img_avatar.png" }}
            style={styles.profileImage}
          />
          {isMyProfile ? (
            <TouchableOpacity style={styles.editIcon} onPress={() => setModalVisible(true)}>
              <Feather name="edit" size={20} color="white" />
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.editIcon} onPress={handleFriendToggle}>
                <FontAwesome5 name={isFriend ? "user-minus" : "user-plus"} size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.push({ pathname: "/ProfilePage", params: { userId: userId } })}
              >
                <Feather name="arrow-left" size={24} color="#fff" />
              </TouchableOpacity>
            </>
          )}

          <Text style={styles.profileName}>{userProfile.fullName}</Text>

          <View style={styles.infoGrid}>
            <InfoCard icon={<FontAwesome5 name="envelope" size={18} color="#2661A1" />} value={userProfile.email} />
            <InfoCard icon={<FontAwesome5 name="phone" size={18} color="#2661A1" />} value={userProfile.phoneNumber} />
            <InfoCard icon={<FontAwesome5 name="venus-mars" size={18} color="#2661A1" />} value={userProfile.gender === "F" ? "נקבה" : "זכר"} />
            <InfoCard icon={<FontAwesome5 name="birthday-cake" size={18} color="#2661A1" />} value={new Date(userProfile.birthDate).toLocaleDateString("he-IL")} />
            <InfoCard icon={<FontAwesome5 name="dog" size={18} color="#2661A1" />} value={userProfile.ownPet ? "בעל חיית מחמד" : "אין חיה"} />
            <InfoCard icon={<FontAwesome5 name="smoking" size={18} color="#2661A1" />} value={userProfile.smoke ? "מעשן" : "לא מעשן"} />
            <InfoCard icon={<FontAwesome5 name="briefcase" size={18} color="#2661A1" />} value={userProfile.jobStatus} />
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.smallButton} onPress={() => setShowFavorites(true)}>
            <MaterialIcons name="favorite" size={20} color="white" />
            <Text style={styles.buttonText}>
              {isMyProfile ? "דירות שאהבתי" : `דירות ש${userProfile.fullName} אהב/ה`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallButton} onPress={() => setShowMyPublished(true)}>
            <MaterialIcons name="apartment" size={20} color="white" />
            <Text style={styles.buttonText}>
              {isMyProfile ? "דירות שפרסמתי" : `דירות ש${userProfile.fullName} פרסם/ה`}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.friendsSection}>
          <Text style={styles.sectionTitle}>
            {isMyProfile ? "החברים שלי" : `החברים של ${userProfile.fullName}`}
          </Text>

          {friends.length === 0 ? (
            <Text style={{ textAlign: "right", marginRight: 20, color: "#888" }}>
              אין חברים להצגה כרגע.
            </Text>
          ) : (
            <View style={{ alignItems: "flex-end" }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  flexDirection: "row-reverse",
                  alignItems: "center",
                }}
              >
                {friends.map(friend => (
                  <TouchableOpacity
                    key={friend.id}
                    style={styles.friendCard}
                    onPress={() => router.push({ pathname: "/ProfilePage", params: { userId: friend.id } })}
                  >
                    <Image
                      source={{ uri: friend.profilePicture || "https://www.w3schools.com/howto/img_avatar.png" }}
                      style={styles.friendCardImage}
                    />
                    <Text style={styles.friendCardName}>{friend.fullName}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>


    {isMyProfile && (
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>ערוך פרופיל</Text>

            <TextInput
              style={styles.input}
              placeholder="שם מלא"
              value={updatedProfile.fullName}
              onChangeText={(text) => setUpdatedProfile({ ...updatedProfile, fullName: text })}
            />

            <TextInput
              style={[styles.input, { backgroundColor: "#f2f2f2", color: "#888" }]}
              value={updatedProfile.email}
              editable={false}
            />

            <TextInput
              style={styles.input}
              placeholder="מספר טלפון"
              value={updatedProfile.phoneNumber}
              onChangeText={(text) => setUpdatedProfile({ ...updatedProfile, phoneNumber: text })}
            />

            <Text style={styles.label}>מגדר</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[styles.genderOption, updatedProfile.gender === "M" && styles.genderSelected]}
                onPress={() => setUpdatedProfile({ ...updatedProfile, gender: "M" })}
              >
                <Text style={styles.genderText}>זכר</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.genderOption, updatedProfile.gender === "F" && styles.genderSelected]}
                onPress={() => setUpdatedProfile({ ...updatedProfile, gender: "F" })}
              >
                <Text style={styles.genderText}>נקבה</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>תאריך לידה</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.input}
            >
              <Text>{updatedProfile.birthDate ? updatedProfile.birthDate.substring(0, 10) : "בחר תאריך"}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={updatedProfile.birthDate ? new Date(updatedProfile.birthDate) : new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setUpdatedProfile({ ...updatedProfile, birthDate: selectedDate.toISOString() });
                  }
                }}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="קישור לתמונת פרופיל"
              value={updatedProfile.profilePicture}
              onChangeText={(text) => setUpdatedProfile({ ...updatedProfile, profilePicture: text })}
            />

            <View style={styles.switchRow}>
              <Text style={styles.label}>יש לי חיית מחמד</Text>
              <Switch
                value={updatedProfile.ownPet === true}
                onValueChange={(val) => setUpdatedProfile({ ...updatedProfile, ownPet: val })}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.label}>מעשן/ת</Text>
              <Switch
                value={updatedProfile.smoke === true}
                onValueChange={(val) => setUpdatedProfile({ ...updatedProfile, smoke: val })}
              />
            </View>

            <TextInput
              style={styles.input}
              placeholder="סטטוס תעסוקה"
              value={updatedProfile.jobStatus}
              onChangeText={(text) => setUpdatedProfile({ ...updatedProfile, jobStatus: text })}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.buttonText}>שמור</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )}

      </ScrollView>
    </View>
  );
};

const InfoCard = ({ icon, value }) => (
  <View style={{ flexDirection: "row-reverse", alignItems: "center", marginBottom: 10 }}>
    <View style={{ marginLeft: 10 }}>{icon}</View>
    <Text style={{ fontSize: 16 }}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  headerBackground: { width: "100%", height: 200, backgroundColor: "#2661A1", position: "absolute", top: 0 },
  profileContainer: {
    marginTop: 120,
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 25,
    padding: 20,
    elevation: 5
  },
  closeButton: {
    position: "absolute",
    top: 10,
    left: 10,
    padding: 8,
    zIndex: 10,
  },
  profileImage: { width: 100, height: 100, borderRadius: 50, alignSelf: "center", marginTop: -80, borderWidth: 4, borderColor: "white" },
  editIcon: { position: "absolute", top: 20, right: 20, backgroundColor: "#2661A1", padding: 5, borderRadius: 20 },
  profileName: { fontSize: 22, fontWeight: "bold", color: "#2661A1", textAlign: "center", marginTop: 10 },
  infoGrid: { marginTop: 20 },
  buttonsContainer: { flexDirection: "row", justifyContent: "space-around", marginVertical: 20 },
  smallButton: { alignItems: "center", backgroundColor: "#2661A1", padding: 10, borderRadius: 10, width: 140 },
  buttonText: { color: "#fff", textAlign: "center", marginTop: 5 },
  friendsSection: { marginHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10, textAlign: "right" },
  friendsGrid: {
    flexDirection: "row-reverse",
    paddingHorizontal: 20,
  },
  friendCard: {
    alignItems: "center",
    marginLeft: 15,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    elevation: 2,
  },
  friendCardImage: { width: 60, height: 60, borderRadius: 30 },
  friendCardName: { marginTop: 5, fontSize: 14 },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.4)" },
  modalContent: { backgroundColor: "#fff", borderRadius: 10, padding: 20, width: "80%" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  input: { borderBottomWidth: 1, borderColor: "#ccc", marginBottom: 15, padding: 5 },
  saveButton: { backgroundColor: "#2661A1", padding: 10, borderRadius: 10, marginTop: 10 },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "#2661A1",
    padding: 6,
    borderRadius: 20,
    zIndex: 10,
  },
});

export default UserProfile;
