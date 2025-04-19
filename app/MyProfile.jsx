import React, { useState, useEffect, useContext } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Modal,
  TextInput,
  Image,
  Alert,
  Lable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { FontAwesome5, Feather } from "@expo/vector-icons";
import FavoriteApartmentsScreen from "./FavoriteApartmentsScreen";
import API from "../config";
import { useRouter } from "expo-router";
import LogoutButton from "./components/LogoutButton";
import UserOwnedApartmentsGrid from "./UserOwnedApartmentsGrid";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import UserProfile from "./UserProfile";
import * as ImagePicker from "expo-image-picker";


const MyProfile = (props) => {
  const loginUserId = props.myId;
  const router = useRouter();

  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState({});
  const [showFavorites, setShowFavorites] = useState(false);
  const [friends, setFriends] = useState([]);
  const [isFriend, setIsFriend] = useState(false);
  const [showFriendProfile, setFriendProfile] = useState(false);
  const [selectedFriendId, setFriendId] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPhoneError, setShowPhoneError] = useState(false);
  useEffect(() => {
    console.log("useinp  ", loginUserId);
    fetch(API + "User/GetUserById/" + loginUserId)
      .then((res) => {
        if (!res.ok) throw new Error("שגיאה בטעינת פרופיל");
        return res.json();
      })
      .then((data) => {
        setUserProfile(data);
        setUpdatedProfile(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
        console.log("ss", err);
      });
  }, [loginUserId]);

  useEffect(() => {
    if (loginUserId) {
      fetch(API + "User/GetUserFriends/" + loginUserId)
        .then((res) => res.json())
        .then((data) => {
          setFriends(data);
          setIsFriend(data.some((f) => f.id === loginUserId));
        })
        .catch((err) => console.error("שגיאה בטעינת חברים", err));
    }
  }, [loginUserId]);

  const removeFriend = (friendId) => {
    setFriends((prev) => prev.filter((f) => f.id !== friendId));
  };

  const addFriend = (newFriend) => {
    setFriends((prev) => {
      return [...prev, newFriend];
    });
  };

  const handleSave = async () => {
    const updatedUser = { ...updatedProfile, id: loginUserId };
    if(!updatedUser.token) {updatedUser.token = "";}

    try {
      const res = await fetch(API + "User/UpdateUserDetails", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      console.log("✔️ profile updated");
      setModalVisible(false);
      setUserProfile(updatedUser);
      setUpdatedProfile(updatedUser);
    } catch (err) {
      console.error("❌", err);
    }
  };
  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("שגיאה", "יש לאשר גישה לגלריה");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setUpdatedProfile({
        ...updatedProfile,
        profilePicture: result.assets[0].uri,
      });
    }
  };
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setUpdatedProfile({ ...updatedProfile, birthDate: selectedDate });
    }
  };

  const HandlePhoneNumber = (phoneNumber) => {
    // Phone number validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setShowPhoneError(true);
      return;
    } else {
      setShowPhoneError(false);
    }
  };

  if (loading)
    return (
      <ActivityIndicator size="large" color="#2661A1" style={{ flex: 1 }} />
    );
  if (error)
    return (
      <Text style={{ color: "red", textAlign: "center", marginTop: 40 }}>
        שגיאה
      </Text>
    );

  return (
    <View style={{ flex: 1 }}>
      <Modal
        visible={showFavorites}
        animationType="slide"
        onRequestClose={() => setShowFavorites(false)}
      >
        <FavoriteApartmentsScreen onClose={() => setShowFavorites(false)} />
      </Modal>

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
          <TouchableOpacity
            style={styles.editIcon}
            onPress={() => setModalVisible(true)}
          >
            <Feather name="edit" size={20} color="white" />
          </TouchableOpacity>

          <Text style={styles.profileName}>{userProfile.fullName}</Text>

          <View style={styles.infoGrid}>
            <InfoCard
              icon={<FontAwesome5 name="envelope" size={18} color="#2661A1" />}
              value={userProfile.email}
            />
            <InfoCard
              icon={<FontAwesome5 name="phone" size={18} color="#2661A1" />}
              value={userProfile.phoneNumber}
            />
            <InfoCard
              icon={
                <FontAwesome5 name="venus-mars" size={18} color="#2661A1" />
              }
              value={userProfile.gender === "F" ? "נקבה" : "זכר"}
            />
            <InfoCard
              icon={
                <FontAwesome5 name="birthday-cake" size={18} color="#2661A1" />
              }
              value={new Date(userProfile.birthDate).toLocaleDateString(
                "he-IL"
              )}
            />
            <InfoCard
              icon={<FontAwesome5 name="dog" size={18} color="#2661A1" />}
              value={userProfile.ownPet ? "בעל חיית מחמד" : "אין חיה"}
            />
            <InfoCard
              icon={<FontAwesome5 name="smoking" size={18} color="#2661A1" />}
              value={userProfile.smoke ? "מעשן" : "לא מעשן"}
            />
            <InfoCard
              icon={<FontAwesome5 name="briefcase" size={18} color="#2661A1" />}
              value={userProfile.jobStatus}
            />
          </View>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.smallButton}
              onPress={() => setShowFavorites(true)}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.buttonText}>דירות שאהבתי</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.friendsSection}>
          <Text style={styles.sectionTitle}>החברים שלי</Text>

          {friends.length === 0 ? (
            <Text
              style={{ textAlign: "right", marginRight: 20, color: "#888" }}
            >
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
                {friends.map((friend) => (
                  <TouchableOpacity
                    key={friend.id}
                    style={styles.friendCard}
                    onPress={() => {
                      setFriendProfile(true);
                      setFriendId(friend.id);
                    }}
                  >
                    <Image
                      source={{
                        uri:
                          friend.profilePicture ||
                          "https://www.w3schools.com/howto/img_avatar.png",
                      }}
                      style={styles.friendCardImage}
                    />
                    <Text style={styles.friendCardName}>{friend.fullName}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {showFriendProfile && (
          <Modal
            visible={true}
            animationType="slide"
            onRequestClose={() => setFriendProfile(false)}
          >
            <UserProfile
              userId={selectedFriendId}
              onClose={() => setFriendProfile(false)}
              onRemoveFriend={removeFriend}
              onAddFriend={addFriend}
            />
              
          </Modal>
        )}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Feather name="x" size={24} color="#333" />
              </TouchableOpacity>
              <View style={{ textAlign: "right", margin: "auto" }}>
                <Text style={styles.modalTitle}>ערוך פרופיל</Text>
              </View>
              <TouchableOpacity
                style={styles.photoContainer}
                onPress={handleImagePick}
              >
                {updatedProfile.profilePicture ? (
                  <Image
                    source={{ uri: updatedProfile.profilePicture }}
                    style={styles.profilePhoto}
                  />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoText}>הוסף תמונה</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TextInput
                style={[styles.input, { textAlign: "right" }]}
                placeholder="שם מלא"
                value={updatedProfile.fullName}
                onChangeText={(text) =>
                  setUpdatedProfile({ ...updatedProfile, fullName: text })
                }
              />
              <TextInput
                style={[styles.inputDisabled, { textAlign: "right" }]}
                value={updatedProfile.email}
                editable={false}
              />
              <TextInput
                style={[styles.input, { textAlign: "right" }]}
                placeholder="מספר טלפון"
                value={updatedProfile.phoneNumber}
                onChangeText={(text) => {
                  setUpdatedProfile({ ...updatedProfile, phoneNumber: text });
                  HandlePhoneNumber(text);
                }}
                keyboardType="phone-pad"
              />
              {showPhoneError && (
                <Text style={{ color: "red", textAlign: "right" }}>
                  Please enter a valid phone number
                </Text>
              )}{" "}
              <TextInput
                style={[styles.input, { textAlign: "right" }]}
                placeholder="סטטוס תעסוקה"
                value={updatedProfile.jobStatus}
                onChangeText={(text) =>
                  setUpdatedProfile({ ...updatedProfile, jobStatus: text })
                }
              />
              <Text style={[styles.label, { textAlign: "right" }]}>מגדר:</Text>
              <Picker
                selectedValue={updatedProfile.gender}
                onValueChange={(val) =>
                  setUpdatedProfile({ ...updatedProfile, gender: val })
                }
                style={styles.picker}
              >
                <Picker.Item label="זכר" value="M" />
                <Picker.Item label="נקבה" value="F" />
                <Picker.Item label="אחר" value="O" />
              </Picker>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  תאריך לידה:{" "}
                  {new Date(updatedProfile.birthDate).toLocaleDateString(
                    "he-IL"
                  )}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={new Date(updatedProfile.birthDate)}
                  mode="date"
                  display="default"
                  maximumDate={new Date()}
                  onChange={handleDateChange}
                />
              )}
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    updatedProfile.ownPet && styles.toggleButtonActive,
                  ]}
                  onPress={() =>
                    setUpdatedProfile({
                      ...updatedProfile,
                      ownPet: !updatedProfile.ownPet,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.toggleText,
                      updatedProfile.ownPet && styles.toggleTextActive,
                    ]}
                  >
                    יש חיית מחמד
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    updatedProfile.smoke && styles.toggleButtonActive,
                  ]}
                  onPress={() =>
                    setUpdatedProfile({
                      ...updatedProfile,
                      smoke: !updatedProfile.smoke,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.toggleText,
                      updatedProfile.smoke && styles.toggleTextActive,
                    ]}
                  >
                    מעשן/ת
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.buttonText}>שמור</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 150,
          }}
        >
          <UserOwnedApartmentsGrid userId={loginUserId} isMyProfile={true} />
          <LogoutButton />
        </View>
      </ScrollView>
    </View>
  );
};

const InfoCard = ({ icon, value }) => (
  <View
    style={{
      flexDirection: "row-reverse",
      alignItems: "center",
      marginBottom: 10,
    }}
  >
    <View style={{ marginLeft: 10 }}>{icon}</View>
    <Text style={{ fontSize: 16 }}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  headerBackground: {
    width: "100%",
    height: 200,
    backgroundColor: "#2661A1",
    position: "absolute",
    top: 0,
  },
  profileContainer: {
    marginTop: 120,
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 25,
    padding: 20,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    left: 10,
    padding: 8,
    zIndex: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginTop: -80,
    borderWidth: 4,
    borderColor: "white",
  },
  editIcon: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "#2661A1",
    padding: 5,
    borderRadius: 20,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2661A1",
    textAlign: "center",
    marginTop: 10,
  },
  infoGrid: { marginTop: 20 },
  buttonsContainer: {
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 20,
  },

  smallButton: {
    alignItems: "center",
    backgroundColor: "#2661A1",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    marginTop: 5,
    justifyContent: "center",
  },
  friendsSection: { marginHorizontal: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "right",
  },
  friendsGrid: {
    flexDirection: "row-reverse",
    paddingHorizontal: 20,
  },
  friendCard: {
    alignItems: "center",
    marginLeft: 15,
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 10,
    elevation: 2,
  },
  friendCardImage: { width: 60, height: 60, borderRadius: 30 },
  friendCardName: { marginTop: 5, fontSize: 14 },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    direction: "rtl",
    textAlign: "right",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "right",
    paddingRight: 10,
    alignSelf: "flex-start",
    width: "100%",
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
    padding: 5,
  },
  inputDisabled: {
    backgroundColor: "#eee",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    textAlign: "right",
    color: "#888",
  },
  saveButton: {
    backgroundColor: "#2661A1",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "#2661A1",
    padding: 6,
    borderRadius: 20,
    zIndex: 10,
  },

  photoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  photoText: {
    color: "#666",
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: "right",
    margin: "auto",
    fontWeight: "bold",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  dateButtonText: {
    textAlign: "right",
    fontSize: 16,
  },
  toggleContainer: {
    flexDirection: "row-reverse",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  toggleButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    width: "45%",
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  toggleText: {
    fontSize: 16,
    color: "#333",
  },
  toggleTextActive: {
    color: "#fff",
  },
});

export default MyProfile;
