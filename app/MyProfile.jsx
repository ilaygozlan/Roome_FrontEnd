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
  ScrollView,
  ActivityIndicator,
  I18nManager,
  RefreshControl 
} from "react-native";
import { FontAwesome5, Feather } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import API from "../config";
import { useRouter } from "expo-router";
import UserOwnedApartmentsGrid from "./UserOwnedApartmentsGrid";
import CustomDateTimePicker from "./components/CustomDateTimePicker";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { ActiveApartmentContext } from "./contex/ActiveApartmentContext";
import MyOpenHouses from "./components/MyOpenHouses";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import RoommatePreferencesForm from "./components/RoommatePreferencesForm";
import RecommendedRoommates from "./components/RecommendedRoommates";
import HouseLoading from "./components/LoadingHouseSign";

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

  // --- State (copied from MyProfile) ---
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState({});
  const [friends, setFriends] = useState([]);
  const [friendsNum, setFriendsNum] = useState(0);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPhoneError, setShowPhoneError] = useState(false);
  const [ownedApartmentsNum, setOwnedApartmentsNum] = useState(0);
  const { allApartments } = useContext(ActiveApartmentContext);
  const [showOpenHousesModal, setShowOpenHousesModal] = useState(false);
  const [openHouses, setOpenHouses] = useState([]);
  const [showPreferencesForm, setShowPreferencesForm] = useState(false);
  const [roommateMatches, setRoommateMatches] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  
const onRefresh = async () => {
  setRefreshing(true);

  try {
  
    await fetch(API + "User/GetUserById/" + loginUserId)
      .then((res) => res.json())
      .then((data) => {
        setUserProfile(data);
        setUpdatedProfile(data);
      });

    await fetch(API + "User/GetUserFriends/" + loginUserId)
      .then((res) => res.json())
      .then((data) => {
        const friendsList = Array.isArray(data) ? data : [];
        setFriends(friendsList);
        setFriendsNum(friendsList.length);
      });

    await fetchOpenHouses();
  } catch (error) {
    console.error("Error refreshing data:", error);
  }

  setRefreshing(false);
};


  useEffect(() => {
    if (!loginUserId) return;

    const filtered = allApartments.filter(
      (apt) => apt.UserID === Number(loginUserId)
    );
    setOwnedApartmentsNum(filtered.length);
    fetchOpenHouses();
  }, [allApartments, loginUserId]);

  // --- Fetch user profile ---
  useEffect(() => {
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
      });
  }, [loginUserId]);

  // --- Fetch friends ---
  useEffect(() => {
    if (loginUserId) {
      fetch(API + "User/GetUserFriends/" + loginUserId)
        .then(async (res) => {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await res.json();
            const friendsList = Array.isArray(data) ? data : [];
            setFriends(friendsList);
            setFriendsNum(friendsList.length)
          } else {
            setFriends([]);
            setFriendsNum(0);
          }
        })
        .catch(() => setFriends([]));
    }
  }, [loginUserId]);

  // --- Profile update logic ---
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
      setModalVisible(false);
      setUserProfile(updatedUser);
      setUpdatedProfile(updatedUser);
    } catch (err) {
      Alert.alert("שגיאה", "עדכון הפרופיל נכשל");
    }
  };

  // --- Image picker logic ---
const handleImagePick = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    setError("Sorry, we need camera roll permissions to make this work!");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaType, 
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });

  if (!result.canceled && result.assets.length > 0) {
    const imageUri = result.assets[0].uri;

    const uploadedUrl = await uploadProfileImage(imageUri);
    if (uploadedUrl) {
      console.log("  Image URL from server:", uploadedUrl);
      setUpdatedProfile((prev) => ({
        ...prev,
        profilePicture: uploadedUrl,
      }));
    }
  }
};



const uploadProfileImage = async (uri) => {
 const fileName = uri.split('/').pop();
  const match = /\.(\w+)$/.exec(fileName ?? '');
  const fileType = match ? `image/${match[1]}` : `image`;

   const formData = new FormData();
  formData.append("files", {
    uri,
    name: fileName,
    type: fileType,
  });

  console.log(fileName, fileType);
  try {
    const response = await fetch(
      `${API}UploadImageCpntroller/uploadImageProfile`,
      {
        method: "POST",
        headers: {},
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Upload failed with status " + response.status);
    }

    const imageUrl = await response.text(); 
    return GetImageUrl("uploadedFiles/" + JSON.parse(imageUrl));
  } catch (error) {
    console.error("  Error uploading image:", error);
    return null;
  }
};


  // --- Phone validation ---
  const HandlePhoneNumber = (phoneNumber) => {
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

  const fetchOpenHouses = async () => {
    try {
      const response = await fetch(`${API}OpenHouse/getByUser/${loginUserId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch open houses");
      }
      console.log(data)
      const data = await response.json();

      if (!Array.isArray(data)) {
        console.error("Unexpected data shape:", data);
        setOpenHouses([]);
        return;
      }

      const formattedData = data.map((item) => {

        return {
          id: item.ID,
          apartmentId: item.ApartmentID,
          location: JSON.parse(item.Location).address,
          date: item.Date ? item.Date.split("T")[0] : "",
          startTime: item.StartTime?.substring(0, 5) || "",
          endTime: item.EndTime?.substring(0, 5) || "",
          amountOfPeoples: item.AmountOfPeople ?? 0,
          totalRegistrations: item.TotalRegistrations ?? 0,
        };
      });

      setOpenHouses(formattedData);
    } catch (err) {
      console.error("Error fetching open houses:", err);
      setOpenHouses([]);
    }
  };

  // --- Loading/Error ---
  if (loading) return <HouseLoading text="הפרופיל שלי" />;
  if (error)
    return (
      <Text style={{ color: "red", textAlign: "center", marginTop: 40 }}>
        שגיאה
      </Text>
    );

  // --- RTL helper ---
  const rtl = I18nManager.isRTL;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/Login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <ScrollView
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
>
    <View style={{ flex: 1, backgroundColor: "#F6F7FB" }}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.logoutIcon} onPress={handleLogout}>
          <Feather name="log-out" size={24} color="#A1A7B3" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.avatarWrapper}
          onPress={() => setModalVisible(true)}
        >
          <Image
            source={
              userProfile.profilePicture
                ? { uri: userProfile.profilePicture }
                : { uri: "https://www.w3schools.com/howto/img_avatar.png" }
            }
            style={styles.avatar}
          />
          <View style={styles.editIconCircle}>
            <Feather name="edit" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.profileName}>{userProfile.fullName}</Text>
        <Text style={styles.profileEmail}>{userProfile.email}</Text>
      </View>

      {/* Counters Row */}
      <View
        style={[styles.countersRow, rtl && { flexDirection: "row-reverse" }]}
      >
        <TouchableOpacity
          style={[styles.counterCard, styles.counterCardActive]}
          onPress={() => setShowFriendsModal(true)}
        >
          <Text style={styles.counterNumber}>{friendsNum}</Text>
          <Text style={styles.counterLabel}>חברים</Text>
        </TouchableOpacity>
        <View style={styles.counterCard}>
          <Text style={styles.counterNumber}>{ownedApartmentsNum}</Text>
          <Text style={styles.counterLabel}>הדירות שלי</Text>
        </View>
        <TouchableOpacity
          style={[styles.counterCard, styles.counterCardActive]}
          onPress={() => setShowOpenHousesModal(true)}
        >
          <Text style={styles.counterNumber}>{openHouses.length}</Text>
          <Text style={styles.counterLabel}>בתים פתוחים</Text>
        </TouchableOpacity>
      </View>

      {/* Friends Modal */}
      <Modal
        visible={showFriendsModal}
        animationType="slide"
        onRequestClose={() => setShowFriendsModal(false)}
      >
        <View style={styles.friendsModalContainer}>
          <Text style={styles.friendsModalTitle}>החברים שלי</Text>
          <ScrollView>
            {friends.map((friend) => (
              <TouchableOpacity
                key={friend.id}
                style={styles.friendRow}
                onPress={() => {
                  setShowFriendsModal(false);
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

      {/* Edit Profile Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <ScrollView>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>ערוך פרופיל</Text>
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
              style={styles.input}
              placeholder="שם מלא"
              value={updatedProfile.fullName}
              onChangeText={(text) =>
                setUpdatedProfile({ ...updatedProfile, fullName: text })
              }
            />
            <TextInput
              style={styles.inputDisabled}
              value={updatedProfile.email}
              editable={false}
            />
            <TextInput
              style={styles.input}
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
                יש להזין מספר טלפון תקין
              </Text>
            )}
            <TextInput
              style={styles.input}
              placeholder="סטטוס תעסוקה"
              value={updatedProfile.jobStatus}
              onChangeText={(text) =>
                setUpdatedProfile({ ...updatedProfile, jobStatus: text })
              }
            />
            <Text style={styles.label}>מגדר:</Text>
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
                {new Date(updatedProfile.birthDate).toLocaleDateString("he-IL")}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <CustomDateTimePicker
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
        </ScrollView>
      </Modal>

      {/* Profile Info Card */}
      <View style={styles.infoCard}>
        <InfoRow
          icon={<FontAwesome5 name="envelope" size={18} color="#5C67F2" />}
          label="אימייל"
          value={userProfile.email}
        />
        <InfoRow
          icon={<FontAwesome5 name="phone" size={18} color="#5C67F2" />}
          label="טלפון"
          value={userProfile.phoneNumber}
        />
        <InfoRow
          icon={<FontAwesome5 name="venus-mars" size={18} color="#5C67F2" />}
          label="מגדר"
          value={userProfile.gender === "F" ? "נקבה" : "זכר"}
        />
        <InfoRow
          icon={<FontAwesome5 name="birthday-cake" size={18} color="#5C67F2" />}
          label="תאריך לידה"
          value={new Date(userProfile.birthDate).toLocaleDateString("he-IL")}
        />
        <InfoRow
          icon={<FontAwesome5 name="dog" size={18} color="#5C67F2" />}
          label="חיית מחמד"
          value={userProfile.ownPet ? "בעל חיית מחמד" : "אין חיה"}
        />
        <InfoRow
          icon={<FontAwesome5 name="smoking" size={18} color="#5C67F2" />}
          label="עישון"
          value={userProfile.smoke ? "מעשן" : "לא מעשן"}
        />
        <InfoRow
          icon={<FontAwesome5 name="briefcase" size={18} color="#5C67F2" />}
          label="סטטוס"
          value={userProfile.jobStatus}
        />
      </View>
      <TouchableOpacity
        style={styles.aiButton}
        onPress={() => setShowPreferencesForm(true)}
      >
        <MaterialCommunityIcons
          name="robot"
          size={22}
          color="#fff"
          style={{ marginLeft: 10 }}
        />
        <Text style={styles.aiButtonText}>{"\u202A"} למציאת שותפים AI{"\u202C"}</Text>
        <Feather
          name="chevron-left"
          size={22}
          color="#fff"
          style={{ marginRight: 10 }}
        />
      </TouchableOpacity>

      {/* Open Houses Modal */}
      <MyOpenHouses
        visible={showOpenHousesModal}
        onClose={() => setShowOpenHousesModal(false)}
        userId={loginUserId}
        openHouses={openHouses}
      />

      {/* Apartments Grid */}
      <View style={{ width: "100%", alignItems: "center", marginTop: 30 }}>
        <UserOwnedApartmentsGrid
          userId={loginUserId}
          isMyProfile={true}
          loginUserId={loginUserId}
        />
      </View>
      {showPreferencesForm && (
        <Modal visible={showPreferencesForm} animationType="slide">
          <RoommatePreferencesForm
            onClose={() => setShowPreferencesForm(false)}
          />
        </Modal>
      )}
    </View>
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
  logoutIcon: { position: "absolute", top: 40, right: 24, zIndex: 10 },
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
  countersRow: {
    flexDirection: "row",
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
  },
  counterLabel: { fontSize: 13, color: "#A1A7B3", fontWeight: "500" },
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
    textAlign: "center",
  },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F8",
  },
  friendAvatar: { width: 48, height: 48, borderRadius: 24, marginRight: 16 },
  friendName: { fontSize: 16, fontWeight: "600", color: "#222B45" },
  friendUsername: { fontSize: 13, color: "#A1A7B3" },
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
  },
  infoRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingBottom: 6,
  },
  infoLabelContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    minWidth: 110,
  },
  infoLabel: {
    fontSize: 15,
    color: "#7C83FD",
    fontWeight: "600",
    marginRight: 8,
  },
  infoValue: {
    fontSize: 15,
    color: "#A1A7B3",
    fontWeight: "500",
    textAlign: "left",
    flex: 1,
  },
  aiButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E3965A",
    paddingVertical: 12,
    borderRadius: 30,
    marginHorizontal: 50,
    marginTop: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  aiButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 10,
    textAlign: "right",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
  },
  closeButton: {
    position: "absolute",
    top: 15,
    left: 15,
    padding: 8,
    zIndex: 10,
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
    textAlign: "right",
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
    backgroundColor: "#7C83FD",
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 15,
    shadowColor: "#7C83FD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
  photoContainer: { alignItems: "center", marginBottom: 25 },
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
  photoText: { color: "#666", fontWeight: "500" },
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
  dateButtonText: { textAlign: "right", fontSize: 16, color: "#34495e" },
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
  toggleButtonActive: { backgroundColor: "#7C83FD", borderColor: "#7C83FD" },
  toggleText: { fontSize: 16, color: "#34495e" },
  toggleTextActive: { color: "#fff", fontWeight: "700" },
});

export default MyProfile;
