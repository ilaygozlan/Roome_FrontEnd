// === SignalRService.js ===

import * as signalR from "@microsoft/signalr";

class SignalRService {
  constructor() {
    this.connection = null;
    this.connected = false;
    this.messageHandler = null;
  }

  startConnection(userId) {
    if (
      this.connection &&
      (this.connection.state === signalR.HubConnectionState.Connected ||
        this.connection.state === signalR.HubConnectionState.Connecting)
    ) {
      console.warn("SignalR is already connected or connecting.");
      return;
    }

    console.log("🔌 Starting SignalR connection for user:", userId);

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(
        `https://roomebackend20250414140006.azurewebsites.net/chatHub?userId=${userId}`
      )
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Handle reconnecting
    this.connection.onreconnecting((error) => {
      this.connected = false;
      console.warn(" SignalR reconnecting...", error);
    });

    // Handle successful reconnect
    this.connection.onreconnected(() => {
      this.connected = true;
      console.log("  SignalR reconnected.");
    });

    // Handle disconnection
    this.connection.onclose((error) => {
      this.connected = false;
      console.warn("SignalR disconnected.", error);
    });

    // Listen for incoming messages
    this.connection.on("ReceiveMessage", (senderId, message) => {
      console.log(" Received message:", senderId, message);
      if (this.messageHandler) {
        this.messageHandler(senderId, message);
      }
    });

    // Optional: handle force disconnect from server (duplicate connection handling)
    this.connection.on("ForceDisconnect", () => {
      console.warn("Forcefully disconnected by server due to duplicate connection.");
      this.stopConnection();
    });

    // Start the connection
    this.connection
      .start()
      .then(() => {
        this.connected = true;
        console.log("  SignalR connected successfully.");
      })
      .catch((error) => {
        console.error("  SignalR connection failed:", error);
      });
  }

  stopConnection() {
    if (this.connection && this.connection.state !== signalR.HubConnectionState.Disconnected) {
      this.connection.stop();
      this.connection = null;
      this.connected = false;
    }
  }

  isSignalRReady() {
    return (
      this.connection &&
      this.connection.state === signalR.HubConnectionState.Connected
    );
  }

  onReceiveMessage(callback) {
    this.messageHandler = callback;
  }

  sendMessage(recipientId, message) {
    if (!this.isSignalRReady()) {
      console.warn("SignalR is not connected. Cannot send message.");
      return;
    }
    this.connection
      .invoke("SendMessage", recipientId, message)
      .catch((err) => console.error("Error sending message:", err));
  }
}

export default new SignalRService();
