import React, { useState } from "react";
import { Text, TouchableOpacity, View, StyleSheet, Modal, TextInput, Image, ScrollView } from "react-native";
import { FontAwesome5, MaterialIcons, Feather } from '@expo/vector-icons';

const UserProfile = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [profile, setProfile] = useState({
    Email: "user@example.com",
    FullName: "דנה כהן",
    PhoneNumber: "054-123-4567",
    Sex: "נקבה",
    ProfilePicture: "https://img.freepik.com/premium-photo/happy-student-starts-study-freshman-university-ai-generated_894218-1699.jpg",
    OwnPet: true,
    Smoke: false,
    BirthDate: "1998-05-20",
  });

  const [updatedProfile, setUpdatedProfile] = useState(profile);

  const handleSave = () => {
    setProfile(updatedProfile);
    setModalVisible(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerBackground} />
      <View style={styles.profileContainer}>
        <Image source={{ uri: profile.ProfilePicture }} style={styles.profileImage} />
        <TouchableOpacity style={styles.editIcon} onPress={() => setModalVisible(true)}>
          <Feather name="edit" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.name}>{profile.FullName}</Text>
        <Text style={styles.text}><FontAwesome5 name="envelope" size={16} /> {profile.Email}</Text>
        <Text style={styles.text}><FontAwesome5 name="phone" size={16} /> {profile.PhoneNumber}</Text>
        <Text style={styles.text}><FontAwesome5 name="venus-mars" size={16} /> {profile.Sex}</Text>
        <Text style={styles.text}><FontAwesome5 name="dog" size={16} />  {profile.OwnPet ? "כן" : "לא"}</Text>
        <Text style={styles.text}><FontAwesome5 name="smoking" size={16} /> {profile.Smoke ? "כן" : "לא"}</Text>
        <Text style={styles.text}><FontAwesome5 name="birthday-cake" size={16} />  {profile.BirthDate}</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.smallButton}>
          <MaterialIcons name="favorite" size={20} color="white" />
          <Text style={styles.buttonText}>דירות שאהבתי</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.smallButton}>
          <MaterialIcons name="apartment" size={20} color="white" />
          <Text style={styles.buttonText}>דירות שפרסמתי</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.friendsSection}>
        <Text style={styles.sectionTitle}>החברים שלי</Text>
        <View style={styles.friendItem}>
          <Image source={{ uri: "https://www.profilebakery.com/wp-content/uploads/2024/05/Profile-picture-created-with-ai.jpeg" }} style={styles.friendImage} />
          <Text style={styles.friendName}>יוסי לוי</Text>
        </View>
        <View style={styles.friendItem}>
          <Image source={{ uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5rCFA8I6w_adX3lzUTmYjf75gvFmrvoKBMg&s" }} style={styles.friendImage} />
          <Text style={styles.friendName}>אורנה כהן</Text>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>ערוך פרופיל</Text>
            <TextInput
              style={styles.input}
              placeholder="שם מלא"
              value={updatedProfile.FullName}
              onChangeText={(text) => setUpdatedProfile({ ...updatedProfile, FullName: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="אימייל"
              value={updatedProfile.Email}
              onChangeText={(text) => setUpdatedProfile({ ...updatedProfile, Email: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="מספר טלפון"
              value={updatedProfile.PhoneNumber}
              onChangeText={(text) => setUpdatedProfile({ ...updatedProfile, PhoneNumber: text })}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.buttonText}>שמור</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  headerBackground: { width: "100%", height: 120, backgroundColor: "#2661A1", position: "absolute", top: 0 },
  profileContainer: { alignItems: "center", marginTop: 60, backgroundColor: "white", width: "90%", borderRadius: 15, padding: 20, elevation: 5, alignSelf: "center", position: "relative" },
  profileImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: "white", marginTop: -50 },
  editIcon: { position: "absolute", top: 20, right: 20, backgroundColor: "#2661A1", padding: 8, borderRadius: 10 },
  name: { fontSize: 22, fontWeight: "bold", marginTop: 10, color: "#2661A1" },
  text: { fontSize: 16, marginBottom: 5 },
  buttonsContainer: { flexDirection: "row", justifyContent: "center", marginVertical: 10 },
  smallButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#2661A1", padding: 8, borderRadius: 5, marginHorizontal: 5 },
  buttonText: { color: "white", fontSize: 14, fontWeight: "bold", marginLeft: 5 },
  friendsSection: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10, textAlign: "right" },
  friendItem: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  friendImage: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  friendName: { fontSize: 16 },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    elevation: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  input: {
    borderBottomWidth: 1,
    width: "100%",
    marginBottom: 15,
    padding: 8,
    fontSize: 16,
    textAlign: "right",
  },
  saveButton: {
    backgroundColor: "#2661A1",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

});

export default UserProfile;