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
  I18nManager,
} from "react-native";
import { FontAwesome5, Feather } from "@expo/vector-icons";
import UserOwnedApartmentsGrid from "./UserOwnedApartmentsGrid";
import API from "../config";
import { useRouter, useLocalSearchParams } from "expo-router";
import { userInfoContext } from "./contex/userInfoContext";
import LogoutButton from "./components/LogoutButton";
import { ActiveApartmentContext } from "./contex/ActiveApartmentContext";

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
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [showPhoneError, setShowPhoneError] = useState(false);
  const [ownedApartmentsNum, setOwnedApartmentsNum] = useState(0);
   const { allApartments } = useContext(ActiveApartmentContext);
  
  const rtl = I18nManager.isRTL;

  useEffect(() => {
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
  }, [finalUserId, loginUserId]);

  useEffect(() => {
       const filtered = allApartments.filter(
      (apt) => apt.UserID === Number(finalUserId)
    );
    setOwnedApartmentsNum(filtered.length);
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
      setModalVisible(false);
      setUserProfile(updatedUser);
      setUpdatedProfile(updatedUser);
    } catch (err) {
      setError(err);
    }
  };

  const HandlePhoneNumber = (phoneNumber) => {
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
      <ActivityIndicator size="large" color="#7C83FD" style={{ flex: 1 }} />
    );
  if (error || !userProfile)
    return (
      <Text style={{ color: "red", textAlign: "center", marginTop: 40 }}>
        שגיאה: {error?.message}
      </Text>
    );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#F6F7FB" }}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Header */}
      <View style={styles.headerContainer}>
        {/* כפתורי חבר/צ'אט בפינה הימנית העליונה */}
        {!isMyProfile && (
          <View style={styles.topRightActions}>
            <TouchableOpacity
              style={styles.actionIcon}
              onPress={handleFriendToggle}
            >
              <FontAwesome5
                name={isFriend ? "user-minus" : "user-plus"}
                size={18}
                color="#7C83FD"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionIcon}
              onPress={() => router.push(`/chat/${finalUserId}`)}
            >
              <FontAwesome5 name="comments" size={18} color="#7C83FD" />
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color="#A1A7B3" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.avatarWrapper}
          onPress={isMyProfile ? () => setModalVisible(true) : undefined}
        >
          <Image
            source={
              userProfile.profilePicture
                ? { uri: userProfile.profilePicture }
                : { uri: "https://www.w3schools.com/howto/img_avatar.png" }
            }
            style={styles.avatar}
          />
          {isMyProfile && (
            <View style={styles.editIconCircle}>
              <Feather name="edit" size={16} color="#fff" />
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.profileName}>{userProfile.fullName}</Text>
        {/* אל תציג אימייל */}
      </View>

      {/* Counters Row */}
      <View
        style={[styles.countersRow, rtl && { flexDirection: "row-reverse" }]}
      >
        <TouchableOpacity
          style={[styles.counterCard, styles.counterCardActive]}
          onPress={() => setShowFriendsModal(true)}
        >
          <Text style={styles.counterNumber}>{friends.length}</Text>
          <Text style={styles.counterLabel}>חברים</Text>
        </TouchableOpacity>
        <View style={styles.counterCard}>
          <Text style={styles.counterNumber}>{ownedApartmentsNum}</Text>
          <Text style={styles.counterLabel}>הדירות</Text>
        </View>
      </View>

      {/* Friends Modal */}
      <Modal
        visible={showFriendsModal}
        animationType="slide"
        onRequestClose={() => setShowFriendsModal(false)}
      >
        <View style={styles.friendsModalContainer}>
          <Text style={styles.friendsModalTitle}>החברים</Text>
          <ScrollView>
            {friends.map((friend) => (
              <TouchableOpacity
                key={friend.id}
                style={styles.friendRow}
                onPress={() => {
                  setShowFriendsModal(false);
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
                  style={styles.friendAvatar}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.friendName}>{friend.fullName}</Text>
                  <Text style={styles.friendUsername}>@{friend.username}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.closeModalBtn}
            onPress={() => setShowFriendsModal(false)}
          >
            <Text style={{ color: "#fff", fontSize: 18 }}>סגור</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Friend Profile Modal */}
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

      {/* Profile Info Card */}
      <View style={styles.infoCard}>
        {/* מגדר */}
        <View style={styles.infoRow}>
          <FontAwesome5
            name="venus-mars"
            size={18}
            color="#7C83FD"
            style={{ marginLeft: 8 }}
          />
          <Text
            style={{
              color: "#7C83FD",
              fontWeight: "600",
              fontSize: 15,
              textAlign: "right",
            }}
          >
            {userProfile.gender === "F"
              ? "נקבה"
              : userProfile.gender === "M"
                ? "זכר"
                : "אחר"}
          </Text>
        </View>

        {/* תאריך לידה */}
        <View style={styles.infoRow}>
          <FontAwesome5
            name="birthday-cake"
            size={18}
            color="#7C83FD"
            style={{ marginLeft: 8 }}
          />
          <Text
            style={{
              color: "#7C83FD",
              fontWeight: "600",
              fontSize: 15,
              textAlign: "right",
            }}
          >
            {new Date(userProfile.birthDate).toLocaleDateString("he-IL")}
          </Text>
        </View>

        {/* חיית מחמד */}
        <View style={styles.infoRow}>
          <FontAwesome5
            name="dog"
            size={18}
            color="#7C83FD"
            style={{ marginLeft: 8 }}
          />
          <Text
            style={{
              color: "#7C83FD",
              fontWeight: "600",
              fontSize: 15,
              textAlign: "right",
            }}
          >
            {userProfile.ownPet ? "יש לי חיית מחמד" : "אין לי חיית מחמד"}
          </Text>
        </View>

        {/* עישון */}
        <View style={styles.infoRow}>
          <FontAwesome5
            name="smoking"
            size={18}
            color="#7C83FD"
            style={{ marginLeft: 8 }}
          />
          <Text
            style={{
              color: "#7C83FD",
              fontWeight: "600",
              fontSize: 15,
              textAlign: "right",
            }}
          >
            {userProfile.smoke ? "מעשן" : "לא מעשן"}
          </Text>
        </View>

        {/* סטטוס תעסוקתי */}
        <View style={styles.infoRow}>
          <FontAwesome5
            name="briefcase"
            size={18}
            color="#7C83FD"
            style={{ marginLeft: 8 }}
          />
          <Text
            style={{
              color: "#7C83FD",
              fontWeight: "600",
              fontSize: 15,
              textAlign: "right",
            }}
          >
            {userProfile.jobStatus}
          </Text>
        </View>
      </View>

      {/* Apartments Grid */}
      <View style={{ width: "100%", alignItems: "center", marginTop: 30 }}>
        <UserOwnedApartmentsGrid
          userId={finalUserId}
          isMyProfile={isMyProfile}
          loginUserId={loginUserId}
        />
      </View>
      {isMyProfile && (
        <View style={styles.logoutContainer}>
          <LogoutButton />
        </View>
      )}
    </ScrollView>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLabelContainer}>
      {icon}
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: "#F6F7FB",
    position: "relative",
  },
  backButton: { position: "absolute", top: 40, left: 24, zIndex: 10 },
  avatarWrapper: {
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 60,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  editIconCircle: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#E3965A",
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: "#fff",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222B45",
    marginTop: 8,
    textAlign: "center",
  },
  profileEmail: {
    fontSize: 15,
    color: "#A1A7B3",
    marginTop: 2,
    marginBottom: 10,
    textAlign: "center",
  },
  profileActionsRow: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    gap: 18,
  },
  actionIcon: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 5,
    shadowColor: "#7C83FD",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  countersRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    width: "90%",
    alignSelf: "center",
    marginBottom: 18,
  },
  counterCard: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 18,
    alignItems: "center",
    paddingVertical: 18,
    backgroundColor: "#F3F4F8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  counterCardActive: { backgroundColor: "#E6E6FA" },
  counterNumber: {
    fontSize: 22,
    fontWeight: "700",
    color: "#E3965A",
    marginBottom: 2,
    textAlign: "right",
  },
  counterLabel: {
    fontSize: 13,
    color: "#A1A7B3",
    fontWeight: "500",
    textAlign: "right",
  },
  friendsModalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 40,
    paddingHorizontal: 18,
  },
  friendsModalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 18,
    textAlign: "right",
  },
  friendRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F8",
  },
  friendAvatar: { width: 48, height: 48, borderRadius: 24, marginLeft: 16 },
  friendName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222B45",
    textAlign: "right",
  },
  friendUsername: { fontSize: 13, color: "#A1A7B3", textAlign: "right" },
  closeModalBtn: {
    backgroundColor: "#7C83FD",
    padding: 14,
    borderRadius: 12,
    marginTop: 18,
    marginBottom: 18,
    alignItems: "center",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 22,
    marginTop: 18,
    marginHorizontal: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    direction: "rtl",
  },
  infoRow: {
    flexDirection: "row",
    direction: "rtl",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 6,
  },
  infoLabelContainer: {
    flexDirection: "row-reverse",
    direction: "rtl",
    alignItems: "center",
    gap: 8,
    minWidth: 110,
  },
  infoLabel: {
    fontSize: 15,
    color: "#7C83FD",
    fontWeight: "600",
    marginRight: 8,
    textAlign: "right",
    marginLeft: 12,
  },
  infoValue: {
    fontSize: 15,
    color: "#A1A7B3",
    fontWeight: "500",
    textAlign: "right",
    flex: 1,
  },
  logoutContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    marginBottom: 40,
  },
  topRightActions: {
    position: "absolute",
    top: 40,
    right: 24,
    flexDirection: "row-reverse",
    zIndex: 20,
    gap: 4,
  },
});

export default UserProfile;
