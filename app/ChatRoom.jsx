import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import SignalRService from "./SignalRService";
import { userInfoContext } from "./contex/userInfoContext";
import { Ionicons } from "@expo/vector-icons";
import API from "../config";

const ChatRoom = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { recipientId } = route.params;

  const { loginUserId } = useContext(userInfoContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const scrollViewRef = useRef();
  const recipient = parseInt(recipientId);
  const colorScheme = useColorScheme();

  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    fetch(API + "User/GetUserById/" + recipientId)
      .then((response) => response.json())
      .then((data) => {
        setUserProfile(data);
        setLoadingProfile(false);
      })
      .catch((error) => {
        console.error("Error fetching user profile:", error);
        setLoadingProfile(false);
      });
  }, []);

  // טעינת היסטוריית הצ'אט
  useEffect(() => {
    fetch(`${API}Chat/GetMessages/${loginUserId}/${recipient}`)
      .then((res) => res.json())
      .then((data) => {
        const loadedMessages = data.map(m => ({
          from: m.fromUserId,
          text: m.content,
          time: new Date(m.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }));
        setMessages(loadedMessages);
      })
      .catch(err => {
        console.error("Error loading chat history:", err);
      });
  }, []);

  useEffect(() => {
    SignalRService.startConnection(loginUserId);
    SignalRService.onReceiveMessage((senderId, message) => {
      const newMsg = {
        from: senderId,
        text: message,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, newMsg]);
    });

    return () => {
      SignalRService.stopConnection();
    };
  }, []);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = () => {
    if (input.trim() === "") return;

    const myMsg = {
      from: loginUserId,
      text: input,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    SignalRService.sendMessage(recipient.toString(), input);
    setMessages((prev) => [...prev, myMsg]);

    // שמירה בשרת
    fetch(`${API}Chat/SaveMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromUserId: loginUserId,
        toUserId: recipient,
        content: input
      }),
    }).catch(err => {
      console.error("Failed to save message:", err);
    });

    setInput("");
  };

  const isDark = colorScheme === "dark";
  const styles = createStyles(isDark);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : null}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons
              name="arrow-back"
              size={26}
              color={isDark ? "#fff" : "#333"}
            />
          </TouchableOpacity>

          {loadingProfile ? (
            <ActivityIndicator size="small" color="#4A90E2" />
          ) : (
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userProfile.fullName}</Text>
              <Image
                source={{
                  uri: userProfile.profilePicture
                    ? userProfile.profilePicture
                    : "https://www.w3schools.com/howto/img_avatar.png",
                }}
                style={styles.userImage}
              />
            </View>
          )}
        </View>

        <ScrollView
          contentContainerStyle={styles.messagesContainer}
          ref={scrollViewRef}
        >
          {messages.map((item, index) => {
            const isMe = item.from === loginUserId;
            return (
              <View
                key={index}
                style={[
                  styles.messageRow,
                  isMe ? styles.myRow : styles.otherRow,
                ]}
              >
                {!isMe && (
                  <Image
                    source={{
                      uri: userProfile?.profilePicture
                        ? userProfile.profilePicture
                        : "https://www.w3schools.com/howto/img_avatar.png",
                    }}
                    style={styles.avatar}
                  />
                )}
                <View
                  style={[
                    styles.messageBubble,
                    isMe ? styles.myMessage : styles.otherMessage,
                  ]}
                >
                  <Text style={styles.messageText}>{item.text}</Text>
                  <Text style={styles.messageTime}>{item.time}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="הקלד הודעה..."
            style={styles.input}
            placeholderTextColor={isDark ? "#aaa" : "#999"}
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Ionicons name="send" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (isDark) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: isDark ? "#121212" : "#fdfdfd" },
    container: { flex: 1 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#333" : "#ddd",
      backgroundColor: isDark ? "#1e1e1e" : "#ffffff",
    },
    backButton: { padding: 10 },
    userInfo: { flexDirection: "row", alignItems: "center", marginLeft: 10 },
    userName: {
      fontSize: 16,
      color: isDark ? "#fff" : "#333",
      marginRight: 10,
    },
    userImage: { width: 40, height: 40, borderRadius: 20 },
    messagesContainer: { flexGrow: 1, padding: 10 },
    messageRow: {
      flexDirection: "row",
      marginVertical: 5,
      alignItems: "flex-end",
    },
    myRow: { justifyContent: "flex-end" },
    otherRow: { justifyContent: "flex-start" },
    avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 8 },
    messageBubble: {
      padding: 12,
      borderRadius: 18,
      maxWidth: "75%",
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    myMessage: { backgroundColor: "#4A90E2" },
    otherMessage: { backgroundColor: isDark ? "#2b2b2b" : "#e0e0e0" },
    messageText: { color: "#fff", fontSize: 16 },
    messageTime: {
      fontSize: 12,
      marginTop: 5,
      color: "rgba(255,255,255,0.7)",
      alignSelf: "flex-end",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      padding: 10,
      borderTopWidth: 1,
      borderTopColor: isDark ? "#333" : "#ddd",
      backgroundColor: isDark ? "#1e1e1e" : "#fff",
    },
    input: {
      flex: 1,
      height: 45,
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 25,
      paddingHorizontal: 15,
      fontSize: 16,
      backgroundColor: isDark ? "#2a2a2a" : "#f9f9f9",
      marginRight: 10,
      color: isDark ? "#fff" : "#000",
    },
    sendButton: {
      backgroundColor: "#4A90E2",
      padding: 12,
      borderRadius: 25,
    },
  });

export default ChatRoom;
