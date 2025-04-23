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
  const finalUserId = userId ?? props.userId;
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
                props.onClose();
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
                style={styles.backButton}
                onPress={() => props.onClose()}
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
            {isMyProfile ? "החברים שלי" : `החברים של ${userProfile.fullName}`}
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
            onRequestClose={() => setFriendProfile(false)}
          >
            <UserProfile
              userId={selectedFriendId}
              onClose={() => setFriendProfile(false)}
              onRemoveFriend={props.onRemoveFriend}
              onAddFriend={props.onAddFriend}
            />
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
          <UserOwnedApartmentsGrid userId={finalUserId} isMyProfile={false} />
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
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  smallButton: {
    alignItems: "center",
    backgroundColor: "#2661A1",
    padding: 10,
    borderRadius: 10,
    width: 140,
  },
  buttonText: { color: "#fff", textAlign: "center", marginTop: 5 },
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
    backgroundColor: "#fff",
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
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
    padding: 5,
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
});

export default UserProfile;
