import React, { createContext, useState, useEffect } from "react";
import API from "../../config";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { registerForPushNotificationsAsync } from '../components/pushNatification';

export const userInfoContext = createContext();

export const UserInfoProvider = ({ children }) => {
  const [loginUserId, setLoginUserId] = useState(null);
  const [error, setError] = useState(null);
  const [expoPushToken, setExpoPushToken] = useState('');
  const [user, loading] = useAuthState(auth);

  useEffect(()=>{
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
        return;
  
      } catch (err) {
        console.error("Error checking if user exists:", err);
        return null;
      }
    };

    if (user){
      getUserId(user.email);
    }
  },[user])

  
    // 🔄 Send push token to the server (as a plain string, not object!)
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
        
  
    // 🔁 Register and send push token on first load
    useEffect(() => {
      registerForPushNotificationsAsync()
        .then((token) => {
          if (token) {
            setExpoPushToken(token);
            updatePushTokenOnServer(token);
          }
        })
        .catch((error) => console.error("Error registering for push notifications:", error));
    }, [loginUserId]);
  
    // 🔁 Re-check every 24h in case token changes
    useEffect(() => {
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
    }, [expoPushToken]);
  

  return (
    <userInfoContext.Provider value={{ loginUserId }}>
      {children}
    </userInfoContext.Provider>
  );
};

export default UserInfoProvider;
