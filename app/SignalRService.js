import * as signalR from '@microsoft/signalr';
import API from '../config';

class SignalRService {
  constructor() {
    this.connection = null;
  }
startConnection(userId) {
  const baseUrl = API.replace('/api/', '').replace(/\/$/, ''); // נוודא שאין סלאש כפול
  this.connection = new signalR.HubConnectionBuilder()
    .withUrl(`${baseUrl}/chatHub?userId=${userId}`) // הוספנו את הסלאש לפני chatHub
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

  this.connection
    .start()
    .then(() => {
      console.log("SignalR Connected.");
    })
    .catch(err => console.log("SignalR Connection Error: ", err));
}

  stopConnection() {
    if (this.connection) {
      this.connection.stop();
    }
  }

  sendMessage(toUserId, message) {
    this.connection.invoke("SendMessage", toUserId, message)
      .catch(err => console.error(err.toString()));
  }

  onReceiveMessage(callback) {
    this.connection.on("ReceiveMessage", callback);
  }
}

const instance = new SignalRService();
export default instance;
