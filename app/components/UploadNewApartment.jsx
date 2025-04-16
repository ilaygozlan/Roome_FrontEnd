import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";

export default function UploadApartmentForm() {
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [rooms, setRooms] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [apartmentType, setApartmentType] = useState(null); // 0=rental, 1=roommates, 2=sublet

  const categories = [
    { id: 0, name: "השכרה", icon: "home" },
    { id: 1, name: "שותפים", icon: "team" },
    { id: 2, name: "סאבלט", icon: "swap" },
  ];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets.map((a) => a.uri)]);
    }
  };
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("שגיאה", "לא התקבלו הרשאות למצלמה");
      return;
    }
  
    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
      allowsEditing: true,
    });
  
    if (!result.canceled) {
      setImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const handleSubmit = () => {
    if (!location || !price || !rooms || apartmentType === null) {
      Alert.alert("שגיאה", "אנא מלא את כל השדות");
      return;
    }

    const apartmentData = {
      location,
      price,
      rooms,
      description,
      apartmentType,
      images, // array of URIs
    };

    console.log("Submitted Apartment:", apartmentData);
    Alert.alert("✔️ הדירה הועלתה בהצלחה!");
    // You can now send this data to your backend
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.imageBox}>
        {images.length === 0 ? (
          <>
            <Ionicons name="image-outline" size={60} color="gray" />
            <Text>הוסף תמונות מהגלריה</Text>
          </>
        ) : (
          <ScrollView horizontal>
            {images.map((uri, idx) => (
              <Image key={idx} source={{ uri }} style={styles.previewImage} />
            ))}
          </ScrollView>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={takePhoto} style={styles.cameraButton}>
        <Ionicons name="camera-outline" size={24} color="#333" />
        <Text style={{ marginLeft: 8 }}>צלם תמונה</Text>
      </TouchableOpacity>

      {/* Apartment Type */}
      <View style={styles.typeRow}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => setApartmentType(cat.id)}
            style={[
              styles.typeOption,
              apartmentType === cat.id && styles.selectedType,
            ]}
          >
            <AntDesign
              name={cat.icon}
              size={24}
              color={apartmentType === cat.id ? "#E3965A" : "#aaa"}
              style={{ marginBottom: 4 }}
            />
            <Text>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Form fields */}
      <TextInput
        placeholder="מיקום הדירה"
        value={location}
        onChangeText={setLocation}
        style={styles.input}
      />
      <TextInput
        placeholder="מחיר הדירה"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="כמות חדרים"
        value={rooms}
        onChangeText={setRooms}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="מידע נוסף על הדירה"
        value={description}
        onChangeText={setDescription}
        multiline
        style={[styles.input, { height: 80 }]}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={{ color: "white", fontWeight: "bold" }}>שיתוף הדירה</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  imageBox: {
    height: 150,
    width: "100%",
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#fafafa",
  },
  cameraButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  previewImage: {
    height: 100,
    width: 100,
    marginRight: 10,
    borderRadius: 8,
  },
  typeRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  typeOption: {
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    width: 80,
  },
  selectedType: {
    borderColor: "#E3965A",
    backgroundColor: "#FDEAD7",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "white",
    textAlign: "right",
  },
  submitButton: {
    backgroundColor: "#E3965A",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginTop: 20,
  },
});
