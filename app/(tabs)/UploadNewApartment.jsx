import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { userInfoContext } from "../contex/userInfoContext";
import { ActiveApartmentContext } from "../contex/ActiveApartmentContext";
import API from "../../config";
import * as FileSystem from "expo-file-system";

export default function UploadApartmentForm() {
  const { allApartments, setAllApartments } = useContext(
    ActiveApartmentContext
  );
  const { loginUserId } = useContext(userInfoContext);
  const [apartmentType, setApartmentType] = useState(null);
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [rooms, setRooms] = useState("");
  const [description, setDescription] = useState("");
  const [floor, setFloor] = useState("");
  const [parkingSpace, setParkingSpace] = useState("");
  const [contractLength, setContractLength] = useState("");
  const [numberOfRoommates, setNumberOfRoommates] = useState("");
  const [canCancelWithoutPenalty, setCanCancelWithoutPenalty] = useState(false);
  const [isWholeProperty, setIsWholeProperty] = useState(false);
  const [allowPet, setAllowPet] = useState(false);
  const [allowSmoking, setAllowSmoking] = useState(false);
  const [gardenBalcony, setGardenBalcony] = useState(false);
  const [extensionPossible, setExtensionPossible] = useState(false);
  const [images, setImages] = useState([]);
  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [exitDate, setExitDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [showEntryPicker, setShowEntryPicker] = useState(false);
  const [showExitPicker, setShowExitPicker] = useState(false);
  const [propertyTypeID, setPropertyTypeID] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const categories = [
    { id: 0, name: "השכרה", icon: "home" },
    { id: 1, name: "שותפים", icon: "team" },
    { id: 2, name: "סאבלט", icon: "swap" },
  ];

  const propertyTypes = [
    { id: 1, name: "דירת גן" },
    { id: 2, name: "דירה" },
    { id: 3, name: "דופלקס" },
    { id: 4, name: "פרטר" },
    { id: 5, name: "וילה" },
    { id: 6, name: "דו משפחתי" },
    { id: 7, name: "יחידת דיור" },
    { id: 8, name: "פנטהאוז" },
    { id: 9, name: "לופט" },
    { id: 10, name: "קוטג׳" },
    { id: 11, name: "דירת סטודיו" },
    { id: 12, name: "דירת גג" },
    { id: 13, name: "דירה מחולקת" },
  ];

  const toggleIcon = (value, setter) => setter(!value);

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
    if (status !== "granted") {
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

  const handleEntryDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date(entryDate);
    setShowEntryPicker(false);

    const entryString = currentDate.toISOString().split("T")[0];
    setEntryDate(entryString);

    const exitAsDate = new Date(exitDate);
    if (exitAsDate <= currentDate) {
      const newExit = new Date(new Date(currentDate).getTime() + 86400000);
      setExitDate(newExit.toISOString().split("T")[0]);
    }
  };

  const handleExitDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date(exitDate); // exitDate הוא string

    const entry = new Date(entryDate); // ממיר את התאריך שנשמר כ־string ל־Date
    if (currentDate > entry) {
      setExitDate(currentDate.toISOString().split("T")[0]);
    } else {
      Alert.alert("שגיאה", "תאריך יציאה חייב להיות אחרי תאריך כניסה");
    }

    setShowExitPicker(false);
  };

  const removeImage = (uriToRemove) => {
    setImages(images.filter((uri) => uri !== uriToRemove));
  };

  const ClearFormFields = () => {
    setLocation("");
    setPrice("");
    setRooms("");
    setDescription("");
    setFloor("");
    setParkingSpace("");
    setContractLength("");
    setNumberOfRoommates("");
    setImages([]);
    setApartmentType(null);
    setAllowPet(false);
    setAllowSmoking(false);
    setGardenBalcony(false);
    setExtensionPossible(false);
    setCanCancelWithoutPenalty(false);
    setIsWholeProperty(false);
    setPropertyTypeID(null);
    setEntryDate(new Date().toISOString().split("T")[0]);
    setExitDate(new Date(Date.now() + 86400000).toISOString().split("T")[0]);
  };

  const handleSubmit = () => {
    if (!location || !price || !rooms || apartmentType === null) {
      Alert.alert("שגיאה", "אנא מלא את כל השדות");
      return;
    }

    const commonFields = {
      id: 0,
      userID: loginUserId,
      price: Number(price),
      amountOfRooms: Number(rooms),
      location: location,
      allowPet: allowPet,
      allowSmoking: allowSmoking,
      gardenBalcony: gardenBalcony,
      parkingSpace: Number(parkingSpace),
      entryDate: entryDate,
      exitDate: exitDate,
      isActive: true,
      floor: Number(floor),
      apartmentType: apartmentType,
      description: description,
      propertyTypeID: propertyTypeID,
    };

    let apartmentData = {};

    if (apartmentType === 0) {
      apartmentData = {
        ...commonFields,
        contractLength: Number(contractLength),
        extensionPossible: extensionPossible,
      };
    } else if (apartmentType === 1) {
      apartmentData = {
        ...commonFields,
        numberOfRoommates: Number(numberOfRoommates),
      };
    } else if (apartmentType === 2) {
      apartmentData = {
        ...commonFields,
        canCancelWithoutPenalty: canCancelWithoutPenalty,
        isWholeProperty: isWholeProperty,
      };
    }

    let endpoint = "";

    setIsUploading(true);

    if (apartmentType === 0) {
      endpoint = `${API}Apartment/AddRentalApartment`;
    } else if (apartmentType === 1) {
      endpoint = `${API}Apartment/AddSharedApartment`;
    } else if (apartmentType === 2) {
      endpoint = `${API}Apartment/AddSubletApartment`;
    }
    console.log(apartmentData);
    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apartmentData),
    })
      .then((res) => {
        if (!res.ok) {
          setIsUploading(false);
          throw new Error("פרסום נכשל");
        }
        return res.json();
      })
      .then((newApartmentId) => {
        console.log(newApartmentId);
        apartmentData.ApartmentID = newApartmentId;
        setApartmentType(null);

        if (images.length > 0) {
          const formData = new FormData();

          images.forEach((uri) => {
            const fileName = uri.split("/").pop();
            const fileType = fileName.split(".").pop();

            let mimeType = "image/jpeg";

            if (fileType === "png") mimeType = "image/png";
            if (fileType === "jpg" || fileType === "jpeg")
              mimeType = "image/jpeg";

            let fileUri = uri;

            // Andorid
            if (Platform.OS === "android" && uri.startsWith("content://")) {
              const fileInfo = FileSystem.getInfoAsync(uri);
              if (fileInfo.exists) {
                fileUri = fileInfo.uri;
              } else {
                console.error("❌ לא ניתן לגשת לקובץ:", uri);
                return;
              }
            }

            formData.append("files", {
              uri: fileUri,
              name: fileName,
              type: mimeType,
            });

            console.log("📤 שולח תמונה:", {
              uri,
              name: fileName,
              type: mimeType,
            });
          });

          fetch(
            `${API}UploadImageCpntroller/uploadApartmentImage/${newApartmentId}`,
            {
              method: "POST",
              body: formData,
              headers: {},
            }
          )
            .then((res) => {
              if (!res.ok) {
                const errorText = res.text();
                console.error("❌ תגובת השרת:", res.status, errorText);
                setIsUploading(false);
                throw new Error("העלאת תמונות נכשלה");
              }
              return res.json();
            })
            .then((uploadResult) => {
              console.log("📸 תמונות הועלו:", uploadResult);

              const imageLinks = images.map((uri) => {
                const fileName = uri.split("/").pop();
                return `/uploadedFiles/${fileName}`;
              });

              apartmentData.Images = imageLinks.join(",");
              const updatedAllApartments = [...prev, apartmentData];
              setAllApartments(updatedAllApartments);
              console.log(apartmentData.Images, apartmentData);
              Alert.alert("הצלחה", "הדירה והתמונות פורסמו בהצלחה!");
            })
            .catch((error) => {
              console.error("❌ שגיאה בהעלאת תמונות:", error);
              setIsUploading(false);
              Alert.alert("שגיאה", "הדירה פורסמה, אך העלאת התמונות נכשלה");
            });
        } else {
          Alert.alert("הצלחה", "הדירה פורסמה בהצלחה!");
          ClearFormFields();
          setIsUploading(false);
        }
      })
      .catch((error) => {
        console.error(error);
        setIsUploading(false);
        Alert.alert("שגיאה", "אירעה שגיאה בעת פרסום הדירה");
      });
  };

  if (isUploading) {
    return (
      <View style={styles.loadingContainer}>
        <FontAwesome5 name="home" size={60} color="#E3965A" />
        <Text style={{ marginTop: 20, fontSize: 16 }}>
          מעלה את הדירה והתמונות...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>בחר סוג דירה:</Text>
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

          {apartmentType !== null && (
            <>
              {/* תמונות */}
              <TouchableOpacity onPress={pickImage} style={styles.imageBox}>
                {images.length === 0 ? (
                  <>
                    <Ionicons name="image-outline" size={60} color="gray" />
                    <Text>הוסף תמונות מהגלריה</Text>
                  </>
                ) : (
                  <ScrollView horizontal>
                    {images.map((uri, idx) => (
                      <View
                        key={idx}
                        style={{ position: "relative", marginRight: 10 }}
                      >
                        <Image source={{ uri }} style={styles.previewImage} />
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removeImage(uri)}
                        >
                          <Text style={{ color: "white" }}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={takePhoto} style={styles.cameraButton}>
                <Ionicons name="camera-outline" size={24} color="#333" />
                <Text style={{ marginLeft: 8 }}>צלם תמונה</Text>
              </TouchableOpacity>

              {/* שדות */}
              <TextInput
                style={styles.input}
                placeholder="מיקום"
                value={location}
                onChangeText={setLocation}
              />
              <TextInput
                style={styles.input}
                placeholder="מחיר"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
              <TextInput
                style={styles.input}
                placeholder="חדרים"
                keyboardType="numeric"
                value={rooms}
                onChangeText={setRooms}
              />
              <TextInput
                style={styles.input}
                placeholder="תיאור"
                value={description}
                onChangeText={setDescription}
                multiline
              />
              <TextInput
                style={styles.input}
                placeholder="קומה"
                keyboardType="numeric"
                value={floor}
                onChangeText={setFloor}
              />
              <TextInput
                style={styles.input}
                placeholder="חניה"
                keyboardType="numeric"
                value={parkingSpace}
                onChangeText={setParkingSpace}
              />
              <Text
                style={{
                  alignSelf: "flex-start",
                  marginBottom: 5,
                  textAlign: "right",
                  width: "100%",
                }}
              >
                סוג הנכס:
              </Text>
              <View style={styles.propertyTypeList}>
                {propertyTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    onPress={() => setPropertyTypeID(type.id)}
                    style={[
                      styles.propertyTypeButton,
                      propertyTypeID === type.id && styles.selectedPropertyType,
                    ]}
                  >
                    <Text>{type.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={() => setShowEntryPicker(true)}
                style={styles.input}
              >
                <Text>תאריך כניסה: {entryDate}</Text>
              </TouchableOpacity>
              {showEntryPicker && (
                <DateTimePicker
                  value={new Date(entryDate)}
                  mode="date"
                  minimumDate={new Date()}
                  onChange={handleEntryDateChange}
                />
              )}

              <TouchableOpacity
                onPress={() => setShowExitPicker(true)}
                style={styles.input}
              >
                <Text>תאריך יציאה: {exitDate}</Text>
              </TouchableOpacity>
              {showExitPicker && (
                <DateTimePicker
                  value={new Date(exitDate)}
                  mode="date"
                  minimumDate={
                    new Date(new Date(entryDate).getTime() + 86400000)
                  }
                  onChange={handleExitDateChange}
                />
              )}

              <View style={styles.booleanRow}>
                <TouchableOpacity
                  onPress={() => toggleIcon(allowPet, setAllowPet)}
                >
                  <MaterialIcons
                    name="pets"
                    size={30}
                    color={allowPet ? "#E3965A" : "#ccc"}
                  />
                  <Text>חיות</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => toggleIcon(allowSmoking, setAllowSmoking)}
                >
                  <MaterialIcons
                    name="smoking-rooms"
                    size={30}
                    color={allowSmoking ? "#E3965A" : "#ccc"}
                  />
                  <Text>עישון</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => toggleIcon(gardenBalcony, setGardenBalcony)}
                >
                  <FontAwesome5
                    name="tree"
                    size={30}
                    color={gardenBalcony ? "#E3965A" : "#ccc"}
                  />
                  <Text>מרפסת</Text>
                </TouchableOpacity>
              </View>

              {/* שדות ייחודיים */}
              {apartmentType === 0 && (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="משך חוזה (חודשים)"
                    keyboardType="numeric"
                    value={contractLength}
                    onChangeText={setContractLength}
                  />
                  <TouchableOpacity
                    onPress={() =>
                      toggleIcon(extensionPossible, setExtensionPossible)
                    }
                  >
                    <Text>
                      אפשרות להארכה: {extensionPossible ? "✔️" : "❌"}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
              {apartmentType === 1 && (
                <TextInput
                  style={styles.input}
                  placeholder="מספר שותפים"
                  keyboardType="numeric"
                  value={numberOfRoommates}
                  onChangeText={setNumberOfRoommates}
                />
              )}
              {apartmentType === 2 && (
                <>
                  <TouchableOpacity
                    onPress={() =>
                      toggleIcon(
                        canCancelWithoutPenalty,
                        setCanCancelWithoutPenalty
                      )
                    }
                  >
                    <Text>
                      ביטול ללא קנס: {canCancelWithoutPenalty ? "✔️" : "❌"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      toggleIcon(isWholeProperty, setIsWholeProperty)
                    }
                  >
                    <Text>כל הדירה: {isWholeProperty ? "✔️" : "❌"}</Text>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  שיתוף הדירה
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
  booleanRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: "#E3965A",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginTop: 20,
  },
  propertyTypeList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end", // יישור לימין
    rowGap: 10,
    columnGap: 10,
    marginBottom: 20,
  },
  propertyTypeButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    margin: 5,
    backgroundColor: "#f4f4f4",
    alignItems: "center",
    flexDirection: "row-reverse", // טקסט מימין
  },
  selectedPropertyType: {
    borderColor: "#E3965A",
    backgroundColor: "#FDEAD7",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  
});
