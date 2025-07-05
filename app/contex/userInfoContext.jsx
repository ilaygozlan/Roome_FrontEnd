import React, { createContext, useState, useEffect } from "react";
import API from "../../config";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { registerForPushNotificationsAsync } from '../components/pushNatification';
import SignalRService from './SignalRService'; // Import SignalR service

// Default context value
const defaultContextValue = {
  loginUserId: null,
  error: null,
  isLoading: true
};

// Create the context
export const userInfoContext = createContext(defaultContextValue);

// Provider component
export const UserInfoProvider = ({ children }) => {
  const [loginUserId, setLoginUserId] = useState(null);
  const [error, setError] = useState(null);
  const [expoPushToken, setExpoPushToken] = useState('');
  const [user, loading] = useAuthState(auth);
  const [isUserIdFetched, setIsUserIdFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch userId from the server when user is authenticated
  useEffect(() => {
    const getUserId = async (email) => {
      try {
        const res = await fetch(`${API}User/CheckIfExists?email=${encodeURIComponent(email)}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });

        if (!res.ok) throw new Error(`Server responded with status ${res.status}`);

        const data = await res.json();
        setLoginUserId(data.userId);
        console.log("login: ", data.userId);
        setIsUserIdFetched(true);
        setIsLoading(false);

        // Start SignalR connection once userId is known

      } catch (err) {
        console.error("Error checking if user exists:", err);
        setIsUserIdFetched(true);
        setIsLoading(false);
      }
    };

    if (user) {
      getUserId(user.email);
    } else if (!user) {
      setIsLoading(false);
    }
  }, [user]);

  // Send the push token to the server
  const updatePushTokenOnServer = async (token) => {
    try {
      await fetch(API + 'User/PostPushToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: loginUserId,
          token: token
        }),
      });
    } catch (error) {
      console.error('Error updating push token on server:', error);
    }
  };

  // Register for push notifications and send the token
  useEffect(() => {
    if (!isUserIdFetched || !loginUserId) return;

    // First-time registration
    registerForPushNotificationsAsync()
      .then((token) => {
        if (token) {
          setExpoPushToken(token);
          updatePushTokenOnServer(token);
        }
      })
      .catch((error) => console.error("Error registering for push notifications:", error));

    // Refresh token every 24 hours
    const intervalId = setInterval(() => {
      registerForPushNotificationsAsync()
        .then((token) => {
          if (token && token !== expoPushToken) {
            setExpoPushToken(token);
            updatePushTokenOnServer(token);
          }
        })
        .catch((error) => console.error("Error refreshing push notifications:", error));
    }, 86400000); // 24 hours

    return () => clearInterval(intervalId);
  }, [isUserIdFetched, loginUserId, expoPushToken]);

  const value = {
    loginUserId,
    error,
    isLoading,
    setIsUserIdFetched
  };

  return (
    <userInfoContext.Provider value={value}>
      {children}
    </userInfoContext.Provider>
  );
};

export default UserInfoProvider;
