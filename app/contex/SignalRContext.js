// contex/SignalRContext.js
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import API from '../../config';

const SignalRContext = createContext();

export const SignalRProvider = ({ children }) => {
  const [connection, setConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const handlersRef = useRef([]);

  useEffect(() => {
    return () => {
      if (connection) connection.stop();
    };
  }, [connection]);

  const startConnection = async (userId) => {
    if (connection) return;

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://roomebackend20250414140006.azurewebsites.net/chatHub?userId='+userId  )  
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    newConnection.onclose(() => setIsConnected(false));
    newConnection.onreconnected(() => setIsConnected(true));

    newConnection.on("ReceiveMessage", (senderId, message) => {
      handlersRef.current.forEach((handler) => handler(senderId, message));
    });

    try {
      await newConnection.start();
      setConnection(newConnection);
      setIsConnected(true);
      console.log("  SignalR connected");
    } catch (err) {
      console.error("  SignalR connection error:", err);
    }
  };

  const sendMessage = (toUserId, message) => {
    if (connection && isConnected) {
      connection.invoke("SendMessage", toUserId, message).catch((err) => {
        console.error("SendMessage error:", err);
      });
    }
  };

  const onReceiveMessage = (handler) => {
    handlersRef.current.push(handler);
  };

  return (
    <SignalRContext.Provider
      value={{ startConnection, sendMessage, onReceiveMessage, isConnected }}
    >
      {children}
    </SignalRContext.Provider>
  );
};

export const useSignalR = () => useContext(SignalRContext);

//   DEFAULT EXPORT FIX
export default SignalRProvider;
