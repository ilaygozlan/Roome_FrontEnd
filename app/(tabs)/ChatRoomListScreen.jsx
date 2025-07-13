import React, { useEffect, useState, useContext, useCallback } from "react";
import { useLocalSearchParams } from "expo-router";
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
import SignalRService from "../contex/SignalRService";
import HouseLoading from "../components/LoadingHouseSign"

const ChatRoomListScreen = () => {
  const { loginUserId } = useContext(userInfoContext);
  const [chatList, setChatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadChatList = () => {
    console.log("📥 Loading chat list for user:", loginUserId);
    fetch(`${API}Chat/GetChatList/${loginUserId}`)
      .then((res) => res.json())
      .then(async (data) => {
        console.log("✅ Chat list fetched from server", data);
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
        console.log("🧾 Final chat list with user data", fullData);
      })
      .catch((err) => {
        console.error("❌ Error loading chat list:", err);
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
    console.log("🔌 Starting SignalR connection for user:", loginUserId);
    SignalRService.startConnection(loginUserId);
    SignalRService.onReceiveMessage((senderId, message) => {
      console.log("📨 Received new message from:", senderId, "Content:", message);
      setTimeout(() => {
        setChatList((prevList) => {
          const existingChat = prevList.find(
            (chat) => chat.otherUserId === senderId
          );

          if (existingChat) {
            console.log("🔁 Updating existing chat with message");
            const updatedChat = {
              ...existingChat,
              lastMessage: message,
              lastMessageTime: new Date().toISOString(),
              unreadCount: (existingChat.unreadCount || 0) + 1,
            };
            const others = prevList.filter(
              (chat) => chat.otherUserId !== senderId
            );
            return [updatedChat, ...others];
          } else {
            console.log("🆕 New chat detected, reloading list");
            loadChatList();
            return prevList;
          }
        });
      }, 40);
    });

    return () => {
      console.log("🔌 Stopping SignalR connection");
      SignalRService.stopConnection();
    };
  }, [loginUserId]);

  if (loading) {
    return (
             <HouseLoading  text="הצאטים שלי "/>
      
    );
  }

  return (
    <ScrollView style={styles.container}>
      {chatList.map((chat, index) => (
        <TouchableOpacity
          key={index}
          style={styles.chatItem}
          onPress={async () => {
            console.log("➡️ Navigating to ChatRoom with user:", chat.otherUserId);
            try {
              await fetch(
                `${API}Chat/MarkAsRead/${chat.otherUserId}/${loginUserId}`,
                {
                  method: "POST",
                }
              );

              setChatList((prevList) =>
                prevList.map((c) =>
                  c.otherUserId === chat.otherUserId
                    ? { ...c, unreadCount: 0 }
                    : c
                )
              );

              router.push({
                pathname: "chat/ChatRoom",
                params: { recipientId: chat.otherUserId },
              });
            } catch (err) {
              console.error("❌ Failed to mark messages as read:", err);
            }
          }}
        >
          <Image
            source={{
              uri:
                chat.userData?.profilePicture ||
                "https://www.w3schools.com/howto/img_avatar.png",
            }}
            style={styles.avatar}
          />
          <View style={styles.chatInfoContainer}>
            <View style={styles.chatInfo}>
              <Text style={styles.userName}>
                {chat.userData?.fullName || "..."}
              </Text>
              <Text style={styles.lastMessage} numberOfLines={1}>
                {chat.lastMessage}
              </Text>
            </View>
            <View style={styles.rightSection}>
              <Text style={styles.time}>
                {new Date(chat.lastMessageTime).toLocaleString()}
              </Text>
              {chat.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{chat.unreadCount}</Text>
                </View>
              )}
            </View>
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
  chatInfoContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  lastMessage: { fontSize: 14, color: "#666", marginTop: 5 },
  rightSection: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: "100%",
  },
  time: { fontSize: 12, color: "#aaa", marginBottom: 4 },
  unreadBadge: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 6,
    minWidth: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});
