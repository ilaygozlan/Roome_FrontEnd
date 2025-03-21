import React, { useState } from "react";
import { Text, TouchableOpacity, View, StyleSheet, Modal, TextInput, Image, ScrollView } from "react-native";
import { FontAwesome5, MaterialIcons, Feather } from '@expo/vector-icons';
import FavoriteApartmentsScreen from "./FavoriteApartmentsScreen";
import MyPublishedApartmentsScreen  from "./MyPublishedApartmentsScreen";


const UserProfile = () => {
  const [showFavorites, setShowFavorites] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showMyPublished, setShowMyPublished] = useState(false);
 
  
  const [profile, setProfile] = useState({
    Email: "user@example.com",
    FullName: "דנה כהן",
    PhoneNumber: "054-123-4567",
    Sex: "נקבה",
    ProfilePicture: "https://img.freepik.com/premium-photo/happy-student-starts-study-freshman-university-ai-generated_894218-1699.jpg",
    OwnPet: true,
    Smoke: false,
    BirthDate: "1998-05-20",
    Job: "סטודנט",//להוסיף לדאטה בייס
  });

  const [updatedProfile, setUpdatedProfile] = useState(profile);

  const handleSave = () => {
    setProfile(updatedProfile);
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
        <Image source={{ uri: profile.ProfilePicture }} style={styles.profileImage} />
        <TouchableOpacity style={styles.editIcon} onPress={() => setModalVisible(true)}>
          <Feather name="edit" size={20} color="white" />
        </TouchableOpacity>
        <View style={styles.nameContainer}>
          <Text style={styles.profileName}>{profile.FullName}</Text>
        </View>

        <View style={styles.infoGrid}>
          <InfoCard full icon={<FontAwesome5 name="envelope" size={18} color="#2661A1" />} value={profile.Email} />
          <InfoCard full icon={<FontAwesome5 name="phone" size={18} color="#2661A1" />} value={profile.PhoneNumber} />
          <InfoCard icon={<FontAwesome5 name="venus-mars" size={18} color="#2661A1" />} value={profile.Sex} />
          <InfoCard icon={<FontAwesome5 name="birthday-cake" size={18} color="#2661A1" />} value={profile.BirthDate} />
          <InfoCard  full icon={<FontAwesome5 name="dog" size={18} color="#2661A1" />} value={profile.OwnPet ? "בעל חיית מחמד" : "אין לי חיית מחמד"} />
          <InfoCard icon={<FontAwesome5 name="smoking" size={18} color="#2661A1" />} value={profile.Smoke ? "מעשן" : "לא מעשן"} />
          <InfoCard icon={<FontAwesome5 name="briefcase" size={18} color="#2661A1" />} value={profile.Job} />

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
  
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  headerBackground: {
    width: "100%",
    height: 200,
    backgroundColor: "#2661A1",
    position: "absolute",
    top: 0,
  },
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
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "white",
    marginTop: -80,
  },
  nameContainer: {
    marginTop: 10,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2661A1",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.2)", 
    textShadowOffset: { width: 1, height: 1 }, 
    textShadowRadius: 5, 
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 20,
  },
  
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
    borderColor: "#f0f0f0",
  },
  
  infoIcon: {
    marginLeft: 10,
  },
  
  infoText: {
    flex: 1,
  },
  
  infoLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
    textAlign: "right",
  },
  fullWidth: {
    width: "100%",
  },
  
  infoValue: {
    fontSize: 14,
    flexShrink: 1, 
    flexWrap: 'wrap',
    overflow: 'hidden',
    maxWidth: '100%', 
    color: "#333",
    fontWeight: "600",
    textAlign: "right",
  },
  
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "white",
    marginTop: -80,
  },
  editIcon: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "#2661A1",
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 15,
    color: "#333",
  },
  text: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
    paddingHorizontal: 20,
  },
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
    elevation: 6,
  },

  friendsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "right",
    color: "#222",
  },
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
    elevation: 3,
  },
  friendImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginLeft: 10,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#444",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 25,
    borderRadius: 20,
    width: "85%",
    elevation: 15,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    width: "100%",
    marginBottom: 20,
    paddingVertical: 8,
    fontSize: 16,
    textAlign: "right",
  },
  saveButton: {
    backgroundColor: "#2661A1",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  }
});


export default UserProfile;