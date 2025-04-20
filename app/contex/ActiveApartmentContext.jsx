import React, { createContext, useState, useEffect } from "react";
import API from "../../config";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

export const ActiveApartmentContext = createContext();

export const ActiveApartmentProvider = ({ children }) => {
  const [allApartments, setAllApartments] = useState([]);
  const [mapLocationAllApt, setMapLocationAllApt] = useState([]);
  const [loginUserId, setLoginUserId] = useState(null);
  const [user, loading] = useAuthState(auth);
  const [refreshFavorites, setRefreshFavorites] = useState(false);


  useEffect(() => {
    const getUserId = async (email) => {
      try {
        const res = await fetch(`${API}User/CheckIfExists?email=${encodeURIComponent(email)}`);
        if (!res.ok) throw new Error(`Server responded with status ${res.status}`);
        const data = await res.json();
        setLoginUserId(data.userId);
      } catch (err) {
        console.error("Error checking if user exists:", err);
      }
    };

    if (user?.email) {
      getUserId(user.email);
    }

  }, [user]);


  useEffect(() => {
    if (loginUserId) {
      fetch(`${API}Apartment/GetAllActiveApartments/${loginUserId}`)
        .then((response) => response.json())
        .then((data) => {
          const updatedData = data.map((apt) => {
            try {
              const parsedLocation = JSON.parse(apt.Location);
              return {
                ...apt,
                Location: parsedLocation.address,
              };
            } catch (e) {
              return {
                ...apt,
                Location: apt.Location, // שומר את המיקום המקורי אם זה לא JSON
              };
            }
          });
          setAllApartments(updatedData);
          setMapLocationAllApt(data);
        })
        .catch((error) => console.error("Error fetching apartments:", error));
    }
    console.log("apt login ", loginUserId)
  }, [loginUserId]);

  return (
    <ActiveApartmentContext.Provider value={{
      allApartments,
      mapLocationAllApt,
      setMapLocationAllApt,
      setAllApartments,
      refreshFavorites,
      loginUserId,
      triggerFavoritesRefresh: () => setRefreshFavorites((prev) => !prev),
    }}>
      {children}
    </ActiveApartmentContext.Provider>
  );
};
