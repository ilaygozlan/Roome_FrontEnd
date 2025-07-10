// EditApartmentModal.js (Final version with full integration)
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  Platform, FlatList,
 KeyboardAvoidingView,

} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import API from "../../config";
import GooglePlacesInput from "../components/GooglePlacesAPI";
import ApartmentGalleryWithDelete from "./ApartmentGalleryWithDelete";
import { AntDesign } from "@expo/vector-icons";
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useLocalSearchParams, useRouter } from 'expo-router';

//hey
export default function EditApartmentModal() {
  const params = useLocalSearchParams();
  let apartment = params.apartment;
  if (typeof apartment === 'string') {
    try {
      apartment = JSON.parse(apartment);
    } catch {
      apartment = undefined;
    }
  }
  const router = useRouter();
  if (!apartment || !apartment.ApartmentID) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>טוען פרטי דירה...</Text>
      </View>
    );
  }

  const [price, setPrice] = useState("");
  const [rooms, setRooms] = useState("");
  const [description, setDescription] = useState("");
  const [floor, setFloor] = useState("");
  const [parkingSpace, setParkingSpace] = useState("");
  const [location, setLocation] = useState("");
  const [propertyTypeID, setPropertyTypeID] = useState(null);
  const [allowPet, setAllowPet] = useState(false);
  const [allowSmoking, setAllowSmoking] = useState(false);
  const [gardenBalcony, setGardenBalcony] = useState(false);
  const [numberOfRoommates, setNumberOfRoommates] = useState("");
  const [contractLength, setContractLength] = useState("");
  const [extensionPossible, setExtensionPossible] = useState(false);
  const [canCancelWithoutPenalty, setCanCancelWithoutPenalty] = useState(false);
  const [isWholeProperty, setIsWholeProperty] = useState(false);

  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [exitDate, setExitDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [images, setImages] = useState([]);
  const [showEntryPicker, setShowEntryPicker] = useState(false);
  const [showExitPicker, setShowExitPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const categories = [
    { id: 0, name: "השכרה", icon: "home" },
    { id: 1, name: "שותפים", icon: "team" },
    { id: 2, name: "סאבלט", icon: "swap" },
  ];

  // Only reset fields when a new apartment is loaded for editing
  useEffect(() => {
    setPrice(apartment.Price?.toString() || "");
    setLocation({
      address: apartment.Location,
      latitude: apartment.Latitude,
      longitude: apartment.Longitude,
    });
    setRooms(apartment.AmountOfRooms?.toString() || "");
    setDescription(apartment.Description || "");
    setFloor(apartment.Floor?.toString() || "");
    setParkingSpace(apartment.ParkingSpace?.toString() || "");
    setPropertyTypeID(apartment.PropertyTypeID);
    setAllowPet(apartment.AllowPet);
    setAllowSmoking(apartment.AllowSmoking);
    setGardenBalcony(apartment.GardenBalcony);
    setEntryDate(apartment.EntryDate?.split("T")[0] || "");
    setExitDate(apartment.ExitDate?.split("T")[0] || "");
    setImages(apartment.Images?.split(",").map((img) => img.trim()) || []);
    if (apartment.ApartmentType === 1) {
      setNumberOfRoommates(apartment.NumberOfRoommates?.toString() || "");
    }
    if (apartment.ApartmentType === 0) {
      setContractLength(apartment.ContractLength?.toString() || "");
      setExtensionPossible(apartment.ExtensionPossible || false);
    }
    if (apartment.ApartmentType === 2) {
      setCanCancelWithoutPenalty(apartment.CanCancelWithoutPenalty || false);
      setIsWholeProperty(apartment.IsWholeProperty || false);
    }
  }, [apartment.ApartmentID]);

  useEffect(() => {
    console.log("location state changed:", location);
  }, [location]);

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

  const removeImage = (uriToRemove) => {
    setImages(images.filter((uri) => uri !== uriToRemove));
  };

const handleUpdate = async () => {
  if (!location || !price || !rooms) {
    Alert.alert("שגיאה", "אנא מלא את כל השדות הנדרשים");
    return;
  }

const parsedLocation = 
  location && location !== "" 
    ? (typeof location === "string" ? JSON.parse(location) : location) 
    : {
        address: apartment.Location,
        latitude: apartment.Latitude,
        longitude: apartment.Longitude,
      };

const commonFields = {
  Id: apartment.ApartmentID,
  UserID: apartment.UserID,
  Price: Number(price),
  AmountOfRooms: Number(rooms),
  Location: parsedLocation?.address,
  AllowPet: allowPet,
  AllowSmoking: allowSmoking,
  GardenBalcony: gardenBalcony,
  ParkingSpace: Number(parkingSpace),
  EntryDate: entryDate,
  ExitDate: exitDate,
  IsActive: true,
  Floor: Number(floor),
  ApartmentType: apartment.ApartmentType,
  Description: description,
  PropertyTypeID: propertyTypeID,
};

let updatedApartment = {};

if (apartment.ApartmentType === 0) {
  updatedApartment = {
    ...commonFields,
    ContractLength: Number(contractLength),
    ExtensionPossible: extensionPossible,
  };
} else if (apartment.ApartmentType === 1) {
  updatedApartment = {
    ...commonFields,
    NumberOfRoommates: Number(numberOfRoommates),
  };
} else if (apartment.ApartmentType === 2) {
  updatedApartment = {
    ...commonFields,
    CanCancelWithoutPenalty: canCancelWithoutPenalty,
    IsWholeProperty: isWholeProperty,
  };
}

  let endpoint = "";
  if (apartment.ApartmentType === 0)
    endpoint = `${API}Apartment/EditRentalApartment`;
  if (apartment.ApartmentType === 1)
    endpoint = `${API}Apartment/EditSharedApartment`;
  if (apartment.ApartmentType === 2)
    endpoint = `${API}Apartment/EditSubletApartment`;

  try {
    setIsUploading(true);

    const res = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedApartment),
    });

    if (!res.ok) throw new Error("שגיאה בעדכון הדירה");

    const formData = new FormData();
    images.forEach((uri) => {
      if (!uri.startsWith("/uploadedFiles")) {
        const fileName = uri.split("/").pop();
        const fileType = fileName.split(".").pop();
        const mimeType = fileType === "png" ? "image/png" : "image/jpeg";

        formData.append("files", {
          uri,
          name: fileName,
          type: mimeType,
        });
      }
    });

    if (formData._parts.length > 0) {
      await fetch(
        `${API}UploadImageCpntroller/uploadApartmentImage/${apartment.ApartmentID}`,
        {
          method: "POST",
          body: formData,
        }
      );
    }

    setIsUploading(false);
    Alert.alert("הצלחה", "הדירה עודכנה בהצלחה");
    // onSave && onSave(); // Removed as per edit hint
    // onClose(); // Removed as per edit hint
  } catch (err) {
    setIsUploading(false);
    Alert.alert("שגיאה", err.message);
  }
};

// Handle location selection from GooglePlacesInput
const handleLocationSelected = (loc) => {
  // If loc is a string (JSON), parse it
  let parsedLoc = loc;
  if (typeof loc === "string") {
    try {
      parsedLoc = JSON.parse(loc);
    } catch {
      // If parsing fails, fallback to address only
      parsedLoc = { address: loc };
    }
  }
  // Ensure address, latitude, and longitude are always present
  setLocation({
    address: parsedLoc.address || "",
    latitude: parsedLoc.latitude || null,
    longitude: parsedLoc.longitude || null,
  });
};


return (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <FlatList
          data={[]} // dummy list to allow FlatList rendering
          renderItem={null}
          ListHeaderComponent={
            <View style={styles.container}>
              <Text style={styles.title}>עריכת דירה</Text>

              <View style={styles.typeRow}>
                {(() => {
                  const category = categories.find(
                    (cat) => cat.id === apartment.ApartmentType
                  );
                  return (
                    <View style={[styles.typeOption, styles.selectedType]}>
                      <AntDesign
                        name={category.icon}
                        size={24}
                        color="#E3965A"
                        style={{ marginBottom: 4 }}
                      />
                      <Text>{category.name}</Text>
                    </View>
                  );
                })()}
              </View>

              <Text style={styles.label}>כתובת נוכחית:</Text>
              <Text style={styles.currentLocation}>{apartment.Location}</Text>

   <Text style={styles.label}>כתובת חדשה:</Text>

<View style={{ width: "100%" }}>
  <GooglePlacesInput onLocationSelected={handleLocationSelected} />
</View>







              <Text style={styles.label}>מחיר:</Text>
              <TextInput
                style={styles.input}
                keyboaהrdType="numeric"
                value={price}
                onChangeText={setPrice}
              />

              <Text style={styles.label}>חדרים:</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={rooms}
                onChangeText={setRooms}
              />

              <Text style={styles.label}>תיאור:</Text>
              <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                multiline
              />

              <Text style={styles.label}>קומה:</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={floor}
                onChangeText={setFloor}
              />

              <Text style={styles.label}>חניה:</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={parkingSpace}
                onChangeText={setParkingSpace}
              />

              {apartment.ApartmentType === 1 && (
                <>
                  <Text style={styles.label}>מספר שותפים:</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={numberOfRoommates}
                    onChangeText={setNumberOfRoommates}
                  />
                </>
              )}

              {apartment.ApartmentType === 0 && (
                <>
                  <Text style={styles.label}>אורך חוזה (חודשים):</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={contractLength}
                    onChangeText={setContractLength}
                  />
                  <Text style={styles.label}>אפשרות להארכה:</Text>
                  <TouchableOpacity
                    style={styles.input}
                    onPress={() =>
                      setExtensionPossible(!extensionPossible)
                    }
                  >
                    <Text>{extensionPossible ? "כן" : "לא"}</Text>
                  </TouchableOpacity>
                </>
              )}

              {apartment.ApartmentType === 2 && (
                <>
                  <Text style={styles.label}>ביטול ללא קנס:</Text>
                  <TouchableOpacity
                    style={styles.input}
                    onPress={() =>
                      setCanCancelWithoutPenalty(!canCancelWithoutPenalty)
                    }
                  >
                    <Text>{canCancelWithoutPenalty ? "כן" : "לא"}</Text>
                  </TouchableOpacity>
                  <Text style={styles.label}>האם מדובר בדירה שלמה:</Text>
                  <TouchableOpacity
                    style={styles.input}
                    onPress={() =>
                      setIsWholeProperty(!isWholeProperty)
                    }
                  >
                    <Text>{isWholeProperty ? "כן" : "לא"}</Text>
                  </TouchableOpacity>
                </>
              )}

              <Text style={styles.label}>תאריך כניסה:</Text>
              <TouchableOpacity
                onPress={() => setShowEntryPicker(true)}
                style={styles.input}
              >
                <Text>{entryDate}</Text>
              </TouchableOpacity>
              {showEntryPicker && (
                <DateTimePicker
                  value={new Date(entryDate)}
                  mode="date"
                  minimumDate={new Date()}
                  onChange={(event, date) => {
                    setShowEntryPicker(false);
                    if (date) setEntryDate(date.toISOString().split("T")[0]);
                  }}
                />
              )}

              <Text style={styles.label}>תאריך יציאה:</Text>
              <TouchableOpacity
                onPress={() => setShowExitPicker(true)}
                style={styles.input}
              >
                <Text>{exitDate}</Text>
              </TouchableOpacity>
              {showExitPicker && (
                <DateTimePicker
                  value={new Date(exitDate)}
                  mode="date"
                  minimumDate={new Date(entryDate)}
                  onChange={(event, date) => {
                    setShowExitPicker(false);
                    if (date) setExitDate(date.toISOString().split("T")[0]);
                  }}
                />
              )}

              <Text style={styles.label}>תמונות שהועלו:</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                <ApartmentGalleryWithDelete images={apartment.Images} />
              </View>

              <TouchableOpacity onPress={pickImage} style={styles.cameraButton}>
                <Text style={{ color: "#E3965A", fontWeight: "bold" }}>
                  הוסף תמונות נוספות
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.submitButton} onPress={handleUpdate}>
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  שמור שינויים
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
                <Text style={styles.cancelText}>ביטול</Text>
              </TouchableOpacity>
            </View>
          }
          keyboardShouldPersistTaps="handled"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  </View>
);

}
const autocompleteStyles = StyleSheet.create({
  textInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'right',
    backgroundColor: 'white',
  },
  listView: {
    position: 'absolute',
    top: 50,
    zIndex: 1000,
    elevation: 5, // for Android
    backgroundColor: 'white',
    width: '100%',
  },
});

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    marginTop: 15,
    marginBottom: 30,
    fontWeight: "bold",
  },
  label: {
    alignSelf: "flex-end",
    marginBottom: 5,
    fontWeight: "500",
  },
  currentLocation: {
    alignSelf: "flex-end",
    marginBottom: 15,
    fontSize: 16,
    color: "#555",
  },
  googleInputWrapper: {
    width: "100%",
    marginBottom: 15,
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
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "red",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: "#E3965A",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginTop: 10,
  },
  cancelButton: {
    marginTop: 10,
    padding: 10,
    alignItems: "center",
  },
  cancelText: {
    color: "red",
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
});
