import React, { createContext, useState, useEffect } from "react";
import API from "../../config";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

export const userInfoContext = createContext();

export const UserInfoProvider = ({ children }) => {
  const [loginUserId, setLoginUserId] = useState(null);
  const [error, setError] = useState(null);
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

  console.log(loginUserId);

  return (
    <userInfoContext.Provider value={{ loginUserId }}>
      {children}
    </userInfoContext.Provider>
  );
};

export default UserInfoProvider;
