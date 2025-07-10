import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import API from "../../config";
import { sendNotificationAdmin } from "./pushNatification";
export default function AdminUsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API}Admin/GetAllUsers`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      Alert.alert("שגיאה", "לא הצלחנו לטעון את רשימת המשתמשים.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserActive = async (user) => {
    const action = user.isActive ? "להפוך את" : "להחזיר את";
    const statusText = user.isActive ? "ללא פעיל" : "לפעיל";

    Alert.alert(
      "אישור פעולה",
      `האם אתה בטוח שברצונך ${action} "${user.fullName}" ${statusText}?`,
      [
        { text: "ביטול", style: "cancel" },
        {
          text: "כן",
          onPress: async () => {
            try {
              const encodedEmail = encodeURIComponent(user.email);
              const updatedIsActive = !user.isActive;

              const res = await fetch(
                `${API}Admin/DeactivateUser/${encodedEmail}`,
                {
                  method: "PUT",
                }
              );

              if (res.ok) {
                setUsers((prev) =>
                  prev.map((u) =>
                    u.email === user.email
                      ? { ...u, isActive: updatedIsActive }
                      : u
                  )
                );

                const tokenResponse = await fetch(
                  `${API}User/GetPushToken/${user.id}`,
                  {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                  }
                );

                if (tokenResponse.ok) {
                  const result = await tokenResponse.json();
                  const userPushToken = result.pushToken;

                  if (userPushToken) {
                    const title = updatedIsActive
                      ? "החשבון שלך הוחזר לפעילות"
                      : "החשבון שלך הושעה";
                    const body = updatedIsActive
                      ? "שלום, החשבון שלך חזר לפעילות. הקפד לפעול לפי כללי האפליקציה."
                      : "שלום, החשבון שלך הושעה זמנית. ניתן ליצור קשר עם התמיכה לפרטים.";

                    await sendNotificationAdmin(userPushToken, title, body);
                  }
                } else {
                  console.warn("❌ לא הצלחתי להביא את הטוקן של המשתמש");
                }
              } else {
                Alert.alert("שגיאה", "לא ניתן לעדכן את המשתמש.");
              }
            } catch (err) {
              console.error("Toggle error:", err);
              Alert.alert("שגיאה", "שגיאה בזמן עדכון המשתמש.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {users.map((user) => (
        <TouchableOpacity
          key={user.id}
          style={styles.userCard}
          onPress={() =>
            router.push({
              pathname: "UserProfile",
              params: { userId: user.id },
            })
          }
        >
          <Image
            source={{
              uri:
                user.profilePicture ||
                "https://www.w3schools.com/howto/img_avatar.png",
            }}
            style={styles.avatar}
          />

          <View style={styles.userInfo}>
            <Text style={styles.fullName}>{user.fullName}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <Text style={styles.status}>
              סטטוס: {user.isActive ? "פעיל" : "לא פעיל"}
            </Text>

            <TouchableOpacity
              style={[
                styles.deactivateBtn,
                { backgroundColor: user.isActive ? "#FF3B30" : "#4CD964" },
              ]}
              onPress={() => toggleUserActive(user)}
            >
              <Text style={styles.deactivateText}>
                {user.isActive ? "הפוך ללא פעיל" : "החזר לפעיל"}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    paddingVertical: 20,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  fullName: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
  },
  email: {
    fontSize: 14,
    color: "gray",
    textAlign: "right",
  },
  status: {
    fontSize: 13,
    color: "#333",
    marginVertical: 4,
    textAlign: "right",
  },
  deactivateBtn: {
    padding: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 5,
  },
  deactivateText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 13,
  },
});
