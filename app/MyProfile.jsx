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
import RoommatePreferencesForm from "./components/RoommatePreferencesForm";

/**
 * @component MyProfile
 * @description User's personal profile management component with comprehensive profile
 * information display and editing capabilities.
 *
 * Features:
 * - Profile information display
 * - Profile editing
 * - Profile picture management
 * - Friends list management
 * - Favorite apartments access
 * - Phone number validation
 * - Date picker integration
 * - RTL (Right-to-Left) support
 *
 * @param {Object} props
 * @param {number} props.myId - User's ID
 *
 * Dependencies:
 * - expo-image-picker
 * - @react-native-community/datetimepicker
 * - @react-native-picker/picker
 */

const baseUrl = "https://roomebackend20250414140006.azurewebsites.net";

const GetImageUrl = (image) => {
  if (!image) return "";

  const trimmed = image.trim();
  return trimmed.startsWith("https")
    ? trimmed
    : `${baseUrl}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
};

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
  const [showPreferences, setShowPreferences] = useState(false);
  const [matches, setMatches] = useState([]);
  const [showMatchesModal, setShowMatchesModal] = useState(false);

  /**
   * Profile data fetching effect
   * @effect
   * Handles:
   * - Initial profile data loading
   * - Error handling
   * - Loading state management
   */
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

  /**
   * Friends list fetching effect
   * @effect
   * Handles:
   * - Friends list loading
   * - Friend status checking
   */
  useEffect(() => {
    if (loginUserId) {
      fetch(API + "User/GetUserFriends/" + loginUserId)
        .then(async (res) => {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await res.json();
            const friendsList = Array.isArray(data) ? data : [];
            setFriends(friendsList);
            setIsFriend(friendsList.some((f) => f.id === loginUserId));
          } else {
            console.warn("השרת החזיר תגובה לא JSON:", await res.text());
            setFriends([]);
            setIsFriend(false);
          }
        })
        .catch((err) => console.error("שגיאה בטעינת חברים", err));
    }
  }, [loginUserId]);

  /**
   * Friend list management functions
   */
  const removeFriend = (friendId) => {
    setFriends((prev) => prev.filter((f) => f.id !== friendId));
  };

  const addFriend = (newFriend) => {
    setFriends((prev) => {
      return [...prev, newFriend];
    });
  };

  /**
   * Profile update handler
   * @async
   * @function handleSave
   * @returns {Promise<void>}
   */
  const handleSave = async () => {
    const updatedUser = { ...updatedProfile, id: loginUserId };
    if (!updatedUser.token) {
      updatedUser.token = "";
    }

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

  /**
   * Image picker handler
   * @async
   * @function handleImagePick
   * @returns {Promise<void>}
   */
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

  /**
   * Phone number validation handler
   * @function HandlePhoneNumber
   * @param {string} phoneNumber - Phone number to validate
   */
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

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setUpdatedProfile({ ...updatedProfile, birthDate: selectedDate });
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
                ? { uri:(userProfile.profilePicture) }
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
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.smallButton}
              onPress={() => setShowPreferences(true)}
            >
              <Text style={styles.buttonText}>
                מצא את השותפים המושלמים עבורך
              </Text>
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
                      router.push({
                        pathname: "UserProfile",
                        params: { userId: friend.id },
                      });
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
              )}
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
        <Modal
          visible={showPreferences}
          animationType="slide"
          onRequestClose={() => setShowPreferences(false)}
        >
          <RoommatePreferencesForm
            onClose={() => setShowPreferences(false)}
            onMatchesFound={(foundMatches) => {
              setMatches(foundMatches);
              setShowPreferences(false);
              setShowMatchesModal(true);
            }}
          />
        </Modal>
        <Modal
          visible={showMatchesModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowMatchesModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>השותפים שנמצאו עבורך:</Text>
              <ScrollView horizontal>
                {matches.map((user) => (
                  <TouchableOpacity
                    key={user.id}
                    style={styles.userCard}
                    onPress={() => {
                      setShowMatchesModal(false);
                      router.push({
                        pathname: "ChatRoom",
                        params: { recipientId: user.id },
                      });
                    }}
                  >
                    <Image
                      source={{
                        uri:
                          user.profilePicture ||
                          "https://www.w3schools.com/howto/img_avatar.png",
                      }}
                      style={styles.avatar}
                    />
                    <Text style={styles.userName}>{user.fullName}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={styles.closeResultBtn}
                onPress={() => setShowMatchesModal(false)}
              >
                <Text style={{ color: "white", fontSize: 18 }}>סגור</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 50,
          }}
        >
          <UserOwnedApartmentsGrid userId={loginUserId} isMyProfile={true} />
        </View>

        <View style={styles.logoutContainer}>
          <LogoutButton />
        </View>
      </ScrollView>
    </View>
  );
};

/**
 * Info card subcomponent
 * @component InfoCard
 * @param {Object} props
 * @param {JSX.Element} props.icon - Icon element
 * @param {string} props.value - Value to display
 */
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

/**
 * Component styles
 * @constant
 * @type {Object}
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  headerBackground: {
    width: "100%",
    height: 220,
    backgroundColor: "#4A90E2",
    position: "absolute",
    top: 0,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 7,
  },
  profileContainer: {
    marginTop: 140,
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 25,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  closeButton: {
    position: "absolute",
    top: 15,
    left: 15,
    padding: 8,
    zIndex: 10,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignSelf: "center",
    marginTop: -85,
    borderWidth: 5,
    borderColor: "#fff",
    backgroundColor: "#eee",
  },
  editIcon: {
    position: "absolute",
    top: 25,
    right: 25,
    backgroundColor: "#4A90E2",
    padding: 7,
    borderRadius: 25,
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  profileName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#2c3e50",
    textAlign: "center",
    marginTop: 15,
    letterSpacing: 0.5,
  },
  infoGrid: {
    marginTop: 25,
    gap: 15,
  },
  buttonsContainer: {
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 25,
  },
  smallButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
  friendsSection: {
    marginHorizontal: 20,
    marginTop: 35,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15,
    textAlign: "right",
    color: "#34495e",
  },
  friendsGrid: {
    flexDirection: "row-reverse",
    paddingHorizontal: 20,
  },
  friendCard: {
    alignItems: "center",
    marginLeft: 15,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    width: 85,
  },
  friendCardImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  friendCardName: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#2c3e50",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    width: "85%",
    direction: "rtl",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 25,
    textAlign: "right",
    color: "#34495e",
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginBottom: 20,
    paddingVertical: 8,
    fontSize: 16,
    color: "#34495e",
  },
  inputDisabled: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 20,
    color: "#999",
    fontSize: 16,
    textAlign: "right",
  },
  saveButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 15,
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  backButton: {
    position: "absolute",
    top: 25,
    left: 25,
    backgroundColor: "#4A90E2",
    padding: 8,
    borderRadius: 25,
    zIndex: 10,
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  photoContainer: {
    alignItems: "center",
    marginBottom: 25,
  },
  profilePhoto: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#eee",
  },
  photoPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#d9d9d9",
    justifyContent: "center",
    alignItems: "center",
  },
  photoText: {
    color: "#666",
    fontWeight: "500",
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: "right",
    fontWeight: "600",
    color: "#34495e",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 10,
    fontSize: 16,
    color: "#34495e",
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  dateButtonText: {
    textAlign: "right",
    fontSize: 16,
    color: "#34495e",
  },
  toggleContainer: {
    flexDirection: "row-reverse",
    justifyContent: "space-around",
    marginBottom: 30,
  },
  toggleButton: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    width: "45%",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  toggleButtonActive: {
    backgroundColor: "#4A90E2",
    borderColor: "#4A90E2",
  },
  toggleText: {
    fontSize: 16,
    color: "#34495e",
  },
  toggleTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  logoutContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    marginBottom: 40,
  },
  resultCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    width: "85%",
    alignItems: "center",
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
  userCard: {
    alignItems: "center",
    marginHorizontal: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: "500",
  },
  closeResultBtn: {
    backgroundColor: "#4A90E2",
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },
});

export default MyProfile;
