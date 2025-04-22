import React, { createContext, useState, useEffect } from "react";
import API from "../../config";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { registerForPushNotificationsAsync } from '../components/pushNatification';

/**
 * @module userInfoContext
 * @description Context provider for managing user authentication state and push notification tokens.
 * Handles user ID fetching, push notification registration, and token management.
 * 
 * Features:
 * - User authentication state management
 * - Push notification token handling
 * - Periodic token refresh
 * - Server synchronization
 * - Loading state management
 * - Error handling
 * 
 * @requires react-firebase-hooks/auth
 * @requires expo-notifications
 * 
 * Context Values:
 * @property {number|null} loginUserId - Current user's ID
 * @property {Error|null} error - Error state
 * @property {boolean} isLoading - Loading state
 */

/**
 * Default context value
 * @constant
 * @type {Object}
 */
const defaultContextValue = {
  loginUserId: null,
  error: null,
  isLoading: true
};

/**
 * User information context
 * @constant
 * @type {React.Context}
 */
export const userInfoContext = createContext(defaultContextValue);

/**
 * User information provider component
 * @component UserInfoProvider
 * @param {Object} props
 * @param {ReactNode} props.children - Child components
 */
export const UserInfoProvider = ({ children }) => {
  const [loginUserId, setLoginUserId] = useState(null);
  const [error, setError] = useState(null);
  const [expoPushToken, setExpoPushToken] = useState('');
  const [user, loading] = useAuthState(auth);
  const [isUserIdFetched, setIsUserIdFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetches user ID from server
   * @async
   * @function getUserId
   * @param {string} email - User's email
   */
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
        console.log("login: ",data.userId )
        setIsUserIdFetched(true);
        setIsLoading(false);
      } catch (err) {
        console.error("Error checking if user exists:", err);
        setError(err);
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

  /**
   * Updates push notification token on server
   * @async
   * @function updatePushTokenOnServer
   * @param {string} token - Push notification token
   */
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

  /**
   * Push notification token management effect
   * @effect
   */
  useEffect(() => {
    if (!isUserIdFetched || !loginUserId) return;

    // Initial token registration
    registerForPushNotificationsAsync()
      .then((token) => {
        if (token) {
          setExpoPushToken(token);
          updatePushTokenOnServer(token);
        }
      })
      .catch((error) => console.error("Error registering for push notifications:", error));

    // Set up periodic token refresh
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
