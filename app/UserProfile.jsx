// UserProfile.jsx
import React, { useState, useEffect, useContext } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Modal,
  TextInput,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { FontAwesome5, MaterialIcons, Feather } from "@expo/vector-icons";
import UserOwnedApartmentsGrid from "./UserOwnedApartmentsGrid";
import API from "../config";
import { useRouter } from "expo-router";
import { userInfoContext } from "./contex/userInfoContext";
import LogoutButton from "./components/LogoutButton";
import { useLocalSearchParams } from "expo-router";

/**
 * @module UserProfile
 * @description Component for displaying user profile information and managing user relationships
 *
 * Features:
 * - Profile information display
 * - Friend management (add/remove friends)
 * - Profile editing capabilities
 * - User apartment listings
 * - Friends list with horizontal scrolling
 * - Profile image handling
 *
 * @requires expo-router
 * @requires @expo/vector-icons
 *
 * State Management:
 * @state {Object} userProfile - User's profile data
 * @state {boolean} loading - Loading state indicator
 * @state {Object} error - Error state
 * @state {boolean} modalVisible - Edit modal visibility
 * @state {Object} updatedProfile - Temporary profile data for editing
 * @state {Array} friends - User's friends list
 * @state {boolean} isFriend - Friendship status with viewed profile
 *
 * Props:
 * @prop {string} userId - User ID to display (optional)
 * @prop {Function} onClose - Callback for closing profile view
 * @prop {Function} onAddFriend - Callback when adding friend
 * @prop {Function} onRemoveFriend - Callback when removing friend
 *
 * Components:
 * @component InfoCard - Displays individual profile information fields
 *
 * API Integration:
 * - User profile fetching
 * - Friend list management
 * - Profile updates
 *
 * Context Usage:
 * - userInfoContext for authentication
 *
 * Features:
 * 1. Profile Information Display:
 *    - Profile picture
 *    - Basic user information
 *    - Contact details
 *    - Personal preferences (smoking, pets)
 *
 * 2. Friend Management:
 *    - Add/Remove friends
 *    - View friends list
 *    - Navigate to friend profiles
 *
 * 3. Profile Editing:
 *    - Edit personal information
 *    - Update profile picture
 *    - Save profile changes
 *
 * 4. Responsive Layout:
 *    - Scrollable content
 *    - Horizontal scrolling friends list
 *    - Modal forms for editing
 */

const UserProfile = (props) => {
  const { loginUserId } = useContext(userInfoContext);
  const { userId } = useLocalSearchParams();
  const finalUserId = props.userId ?? userId;
  const isMyProfile = finalUserId == loginUserId;
  const router = useRouter();
  const [showFriendProfile, setFriendProfile] = useState(false);
  const [selectedFriendId, setFriendId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState({});
  const [friends, setFriends] = useState([]);
  const [isFriend, setIsFriend] = useState(false);
//hey
  useEffect(() => {
    console.log(finalUserId);
    fetch(API + "User/GetUserById/" + finalUserId)
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
      });
  }, [finalUserId]);

  useEffect(() => {
    if (finalUserId) {
      fetch(API + "User/GetUserFriends/" + finalUserId)
        .then((res) => res.json())
        .then((data) => {
          setFriends(data);
          setIsFriend(data.some((f) => f.id === loginUserId));
        })
        .catch((err) => console.error("שגיאה בטעינת חברים", err));
    }
  }, [finalUserId]);

  const handleFriendToggle = () => {
    if (isFriend) {
      fetch(`${API}User/RemoveFriend/${loginUserId}/${finalUserId}`, {
        method: "DELETE",
      })
        .then(() => {
          setIsFriend(false);
          if (props.onRemoveFriend) {
            props.onRemoveFriend(finalUserId);
          }
        })
        .catch((err) => console.error("שגיאה בהסרת חבר", err));
    } else {
      fetch(`${API}User/AddFriend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userID1: loginUserId,
          userID2: finalUserId,
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("שגיאה בהוספת חבר");
          return res.text();
        })
        .then(() => {
          setIsFriend(true);
          if (props.onAddFriend) {
            props.onAddFriend(userProfile);
          }
        })
        .catch((err) => console.error(err));
    }
  };

  const handleSave = async () => {
    const updatedUser = { ...updatedProfile, id: loginUserId };
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

  if (loading)
    return (
      <ActivityIndicator size="large" color="#2661A1" style={{ flex: 1 }} />
    );
  if (error || !userProfile)
    return (
      <Text style={{ color: "red", textAlign: "center", marginTop: 40 }}>
        שגיאה: {error?.message}
      </Text>
    );

  return (
    <View style={{ flex: 1 }}>
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
          {isMyProfile ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
            
                  router.back();
          
              }}
            >
              <Feather name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={styles.editIcon}
                onPress={handleFriendToggle}
              >
                <FontAwesome5
                  name={isFriend ? "user-minus" : "user-plus"}
                  size={18}
                  color="#fff"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.chatButton}
                onPress={() =>
                  router.push({
                    pathname: "ChatRoom",
                    params: { recipientId: finalUserId },
                  })
                }
              >
                <FontAwesome5 name="comments" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.backButton}
                 onPress={() => router.back()}
              >
                <Feather name="arrow-left" size={24} color="#fff" />
              </TouchableOpacity>
            </>
          )}

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
        </View>

        <View style={styles.friendsSection}>
          <Text style={styles.sectionTitle}>
            {isMyProfile
              ? "החברים שלי"
              : userProfile?.fullName
                ? `החברים של ${userProfile.fullName}`
                : "החברים"}
          </Text>

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
            onRequestClose={() => setFriendProfile(false)}>

            <UserProfile
              userId={selectedFriendId}
              onClose={() => setFriendProfile(false)}
              onRemoveFriend={props.onRemoveFriend}
              onAddFriend={props.onAddFriend} />

          </Modal>
        )}

        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 50,
          }}
        >
          <UserOwnedApartmentsGrid userId={finalUserId} isMyProfile={false} loginUserId={loginUserId} />
        </View>
        {isMyProfile && (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingTop: 150,
            }}
          >
            <LogoutButton />
          </View>
        )}
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
  chatButton: {
    position: "absolute",
    top: 25,
    right: 70,
    backgroundColor: "#4A90E2",
    padding: 8,
    borderRadius: 25,
    zIndex: 10,
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
});

export default UserProfile;
