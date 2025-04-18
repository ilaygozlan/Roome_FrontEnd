import { useState } from "react";
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Platform, KeyboardAvoidingView, ScrollView, Image, ActivityIndicator } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { auth } from './firebase';
import { useRouter } from 'expo-router';
import API from '../config';

export default function ProfileInfo() {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("M");
  const [birthdate, setBirthdate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [jobStatus, setJobStatus] = useState("");
  const [ownPet, setOwnPet] = useState(false);
  const [smoke, setSmoke] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate =
      `${selectedDate.getDate().toString().padStart(2, '0')}-` +
      `${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-` +
      `${selectedDate.getFullYear()}`;
  
    alert(formattedDate);
    setBirthdate(formattedDate);
   }
  };

  const formatDate = (date) => {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePhoto(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    // Validate all required fields
    if (!fullName || !phoneNumber || !jobStatus) {
      setError("Please fill in all required fields");
      return;
    }

    // Phone number validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No authenticated user found");
      }

      const userData = {
        "jobStatus": jobStatus,
        "id": 0,
        "email": user.email,
        "fullName": fullName,
        "phoneNumber": phoneNumber,
        "gender": gender,
        "birthDate": birthdate,
        "profilePicture": "string",
        "ownPet": ownPet,
        "smoke": smoke,
        "isActive": true,
        "token": ""
      }
      const response = await fetch(`${API}User/AddNewUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to create user profile');
      }

      // Navigate to the main app after successful save
      router.replace('/(tabs)');
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Complete Your Profile</Text>

        <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
          {profilePhoto ? (
            <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoText}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
        />

        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />

        <TextInput
          style={styles.input}
          placeholder="Job Status"
          value={jobStatus}
          onChangeText={setJobStatus}
        />

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Gender:</Text>
          <Picker
            selectedValue={gender}
            onValueChange={(itemValue) => setGender(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Male" value="M" />
            <Picker.Item label="Female" value="F" />
            <Picker.Item label="Other" value="O" />
          </Picker>
        </View>

        <TouchableOpacity 
          style={styles.dateButton} 
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>
            Birthdate: {formatDate(birthdate)}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={birthdate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleButton, ownPet && styles.toggleButtonActive]} 
            onPress={() => setOwnPet(!ownPet)}
          >
            <Text style={[styles.toggleText, ownPet && styles.toggleTextActive]}>
              Own Pet
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.toggleButton, smoke && styles.toggleButtonActive]} 
            onPress={() => setSmoke(!smoke)}
          >
            <Text style={[styles.toggleText, smoke && styles.toggleTextActive]}>
              Smoke
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Profile</Text>
          )}
        </TouchableOpacity>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#333",
  },
  photoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profilePhoto: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  photoPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  photoText: {
    color: "#666",
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  pickerContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#333",
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  toggleButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    width: '45%',
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  toggleText: {
    fontSize: 16,
    color: '#333',
  },
  toggleTextActive: {
    color: '#fff',
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  error: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
}); 