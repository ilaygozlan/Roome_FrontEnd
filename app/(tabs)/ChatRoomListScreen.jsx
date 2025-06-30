
import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { userInfoContext } from "../contex/userInfoContext";
import API from "../../config";
import { useRouter, useFocusEffect } from "expo-router";
import SignalRService from "../SignalRService";

const ChatRoomListScreen = () => {
  const { loginUserId } = useContext(userInfoContext);
  const [chatList, setChatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadChatList = () => {
    fetch(`${API}Chat/GetChatList/${loginUserId}`)
      .then((res) => res.json())
      .then(async (data) => {
        const fullData = await Promise.all(
          data.map(async (chat) => {
            const res = await fetch(
              `${API}User/GetUserById/${chat.otherUserId}`
            );
            const userData = await res.json();
            return { ...chat, userData };
          })
        );
        setChatList(fullData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading chat list:", err);
        setLoading(false);
      });
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadChatList();
    }, [loginUserId])
  );

  useEffect(() => {
    SignalRService.startConnection(loginUserId);
    SignalRService.onReceiveMessage((senderId, message) => {
      setTimeout(() => {
        setChatList((prevList) => {
          const existingChat = prevList.find(
            (chat) => chat.otherUserId === senderId
          );

          if (existingChat) {
            const updatedChat = {
              ...existingChat,
              lastMessage: message,
              lastMessageTime: new Date().toISOString(),
            };
            const others = prevList.filter(
              (chat) => chat.otherUserId !== senderId
            );
            return [updatedChat, ...others];
          } else {
            loadChatList();
            return prevList;
          }
        });
      }, 40);
    });

    return () => {
      SignalRService.stopConnection();
    };
  }, [loginUserId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {chatList.map((chat, index) => (
        <TouchableOpacity
          key={index}
          style={styles.chatItem}
          onPress={() =>
            router.push({
              pathname: "ChatRoom",
              params: { recipientId: chat.otherUserId },
            })
          }
        >
          <Image
            source={{
              uri:
                chat.userData?.profilePicture ||
                "https://www.w3schools.com/howto/img_avatar.png",
            }}
            style={styles.avatar}
          />
          <View style={styles.chatInfo}>
            <Text style={styles.userName}>
              {chat.userData?.fullName || "..."}
            </Text>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {chat.lastMessage}
            </Text>
            <Text style={styles.time}>
              {new Date(chat.lastMessageTime).toLocaleString()}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default ChatRoomListScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  chatItem: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  chatInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  lastMessage: { fontSize: 14, color: "#666", marginTop: 5 },
  time: { fontSize: 12, color: "#aaa", marginTop: 3 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});

