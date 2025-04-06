import React, { createContext, useState, useEffect } from "react";
import API from "../../config";

export const userInfoContext = createContext();

export const UserInfoProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(API + "User/GetUserById/11")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }
        return response.json();
      })
      .then((data) => {
        setUserProfile(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching user profile:", error);
        setError(error);
        setLoading(false);
      });
  }, []);

  return (
    <userInfoContext.Provider value={{ userProfile, setUserProfile, loading, error }}>
      {children}
    </userInfoContext.Provider>
  );
};

export default UserInfoProvider;
