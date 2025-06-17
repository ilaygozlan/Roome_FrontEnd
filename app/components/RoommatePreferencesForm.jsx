import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { userInfoContext } from "../contex/userInfoContext";
import API from "../../config";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { Ionicons } from "@expo/vector-icons";

const RoommatePreferencesForm = ({ onClose, onMatchesFound }) => {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const { loginUserId } = useContext(userInfoContext);
  const [preferences, setPreferences] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [numOfRoommates, setNumOfRoommates] = useState(3);

  const introCard = [{ key: "intro", label: "ברוכים הבאים" }];

  const fields = [
    {
      key: "preferredGender",
      question: "עם איזה שותפים היית רוצה לגור?",
      options: ["נשים בלבד", "גברים בלבד", "אין לי העדפה"],
    },
    {
      key: "preferredAge",
      question: "באיזה טווח גילאים היית רוצה שהשותפים שלך יהיו?",
    },
    {
      key: "allowSmoking",
      question: "האם מפריע לך שיעשנו בבית?",
      options: ["כן", "לא"],
    },
    {
      key: "allowPets",
      question: "האם נוח לך לגור עם חיות מחמד?",
      options: ["כן", "לא"],
    },
    {
      key: "cleanlinessLevel",
      question: "עד כמה חשוב לך סדר וניקיון בדירה?",
      options: ["בכלל לא", "במידה סבירה", "חשוב לי ברמות!"],
    },
    {
      key: "sleepSchedule",
      question: "מתי אתה לרוב הולך לישון?",
      options: ["מוקדם", "מאוחר"],
    },
    {
      key: "socialLevel",
      question: "עד כמה אתה אוהב להיות בחברת אנשים בבית?",
      options: [
        "מעדיף את הבית שלי לעצמי",
        "אין לי בעיה שמארחים מדי פעם",
        "הבית שלי תמיד פתוח לאנשים",
      ],
    },
    {
      key: "workHours",
      question: "כמה שעות ביום אתה עובד בממוצע?",
      options: ["9 שעות", "12 שעות", "משתנה בכל יום"],
    },
    {
      key: "workFromHome",
      question: "האם אתה עובד מהבית?",
      options: ["כן", "לא"],
    },
    {
      key: "relationshipStatus",
      question: "מה הסטטוס הזוגי שלך?",
      options: ["רווק/ה", "בזוגיות", "בין סטוצים"],
    },
    {
      key: "socialStyle",
      question: "איך אתה אוהב לבלות את הזמן ?",
      options: ["יוצא לבלות הרבה", "אוהב להיות בבית", "תלוי ביום"],
    },
    {
      key: "openToFriendship",
      question: "האם אתה פתוח ליצור חברויות עם השותפים?",
      options: ["כן", "לא"],
    },
  ];

  const allFields = [...introCard, ...fields];

  useEffect(() => {
    fetch(`${API}RoommatePreferences/GetByUserId/${loginUserId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        setPreferences(data ?? {});
        setLoading(false);
      })
      .catch(() => {
        setPreferences({});
        setLoading(false);
      });
  }, []);

  const handleChange = (key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const buildPayload = () => ({
    preferenceId: preferences.preferenceId ?? 0,
    userId: loginUserId,
    preferredGender: preferences.preferredGender ?? "",
    preferredMinAge: preferences.preferredMinAge ?? 18,
    preferredMaxAge: preferences.preferredMaxAge ?? 99,
    allowSmoking: preferences.allowSmoking === "כן",
    allowPets: preferences.allowPets === "כן",
    cleanlinessLevel: preferences.cleanlinessLevel ?? "",
    sleepSchedule: preferences.sleepSchedule ?? "",
    socialLevel: preferences.socialLevel ?? "",
    workHours: preferences.workHours ?? "",
    workFromHome: preferences.workFromHome === "כן",
    hasPet: preferences.hasPet ?? false,
    petType: preferences.petType ?? "",
    relationshipStatus: preferences.relationshipStatus ?? "",
    socialStyle: preferences.socialStyle ?? "",
    openToFriendship: preferences.openToFriendship === "כן",
    notes: preferences.notes ?? "",
  });

  const handleSaveAndFind = () => {
    const payload = buildPayload();

    fetch(`${API}RoommatePreferences/Upsert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(() =>
        fetch(
          `${API}RoommatePreferences/GetMatches/${loginUserId}/${numOfRoommates}`
        )
      )
      .then((res) => res.json())
      .then((data) =>
        Promise.all(
          data.map((id) =>
            fetch(`${API}User/GetUserById/${id}`).then((res) => res.json())
          )
        )
      )
      .then((fullUsers) => {
        onMatchesFound(fullUsers);
      })
      .catch((err) => {
        console.error("Error:", err);
        Alert.alert("שגיאה", "אירעה שגיאה בתהליך.");
      });
  };

  const renderField = (field) => {
    if (field.key === "preferredAge") {
      const ageRange = [
        preferences.preferredMinAge ?? 18,
        preferences.preferredMaxAge ?? 99,
      ];
      return (
        <View style={styles.sliderContainer}>
          <MultiSlider
            values={ageRange}
            onValuesChangeStart={() => setScrollEnabled(false)}
            onValuesChange={(vals) => {
              handleChange("preferredMinAge", vals[0]);
              handleChange("preferredMaxAge", vals[1]);
            }}
            onValuesChangeFinish={() => setScrollEnabled(true)}
            min={18}
            max={99}
            step={1}
            allowOverlap={false}
            snapped
          />
          <Text
            style={styles.sliderText}
          >{`${ageRange[0]} - ${ageRange[1]} שנים`}</Text>
        </View>
      );
    }

    return (
      <View style={styles.optionsContainer}>
        {field.options.map((option, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.optionBtn,
              preferences[field.key] === option && styles.optionSelected,
            ]}
            onPress={() => handleChange(field.key, option)}
          >
            <Text
              style={[
                styles.optionText,
                preferences[field.key] === option && { color: "white" },
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleScroll = (event) => {
    const page = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentPage(page);
  };

  if (loading) return <ActivityIndicator size="large" color="#4A90E2" />;

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={30} color="#333" />
      </TouchableOpacity>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        scrollEnabled={scrollEnabled}
      >
        {allFields.map((field, index) => (
          <View
            key={index}
            style={{
              width: SCREEN_WIDTH,
              justifyContent: "center",
              alignItems: "center",
              height: SCREEN_HEIGHT,
            }}
          >
            <View style={styles.card}>
              {field.key === "intro" ? (
                <>
                  <Text style={styles.introTitle}>מלא את השאלון</Text>
                  <Text style={styles.introText}>
                    כדי למצוא את השותפים המושלמים עבורך
                  </Text>
                  <Text style={styles.introTextSmall}>
                    כמה שותפים אתה מחפש?
                  </Text>

                  <View style={styles.roommatesButtonsContainer}>
                    {[1, 2, 3].map((num) => (
                      <TouchableOpacity
                        key={num}
                        style={[
                          styles.roommateButton,
                          numOfRoommates === num &&
                            styles.roommateButtonSelected,
                        ]}
                        onPress={() => setNumOfRoommates(num)}
                      >
                        <Text
                          style={[
                            styles.roommateButtonText,
                            numOfRoommates === num &&
                              styles.roommateButtonTextSelected,
                          ]}
                        >
                          {num}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.introTextSmall}>
                    גלול ימינה כדי להתחיל
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.label}>{field.question}</Text>
                  {renderField(field)}
                  {index === allFields.length - 1 && (
                    <TouchableOpacity
                      style={[styles.submitBtn, { marginTop: 20 }]}
                      onPress={handleSaveAndFind}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontSize: 18,
                          textAlign: "center",
                        }}
                      >
                        מצא את השותפים המושלמים עבורך
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {currentPage > 0 && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentPage} מתוך {fields.length}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#f5f7fa",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 10,
    backgroundColor: "#fff",
    padding: 5,
    borderRadius: 20,
    elevation: 5,
  },
  card: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    elevation: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  introTitle: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  introText: { fontSize: 18, textAlign: "center", color: "#555" },
  introTextSmall: { fontSize: 16, color: "#666", marginTop: 20 },
  optionsContainer: { flexDirection: "column", gap: 10, width: "100%" },
  optionBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#eee",
    alignItems: "center",
  },
  optionSelected: { backgroundColor: "#2661A1" },
  optionText: { fontSize: 18 },
  sliderContainer: { alignItems: "center", width: "100%" },
  sliderText: { marginTop: 15, fontSize: 18 },
  submitBtn: {
    marginTop: 50,
    backgroundColor: "#2661A1",
    padding: 20,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  progressContainer: { position: "absolute", bottom: 40 },
  progressText: { fontSize: 18, color: "#333" },
  roommatesButtonsContainer: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  marginVertical: 20,
  width: '100%',
},
roommateButton: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 12,
  paddingVertical: 15,
  paddingHorizontal: 25,
  backgroundColor: '#eee',
},
roommateButtonSelected: {
  backgroundColor: '#2661A1',
},
roommateButtonText: {
  fontSize: 18,
  color: '#333',
},
roommateButtonTextSelected: {
  color: '#fff',
},

});

export default RoommatePreferencesForm;
