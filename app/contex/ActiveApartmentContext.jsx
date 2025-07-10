import React, { createContext, useState, useEffect } from "react";
import API from "../../config";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

/**
 * @module ActiveApartmentContext
 * @description Context provider for managing apartment data across the application.
 * Handles apartment data fetching, location parsing, and favorites management.
 * 
 * Features:
 * - Apartment data management
 * - Location data parsing
 * - Map location data handling
 * - Favorites refresh functionality
 * - User authentication integration
 * 
 * @requires react-firebase-hooks/auth
 * 
 * Context Values:
 * @property {Array<Object>} allApartments - List of all apartments with parsed locations
 * @property {Array<Object>} mapLocationAllApt - List of all apartments with raw location data
 * @property {Function} setMapLocationAllApt - Function to update map location data
 * @property {Function} setAllApartments - Function to update apartments list
 * @property {boolean} refreshFavorites - Trigger for favorites refresh
 * @property {Function} triggerFavoritesRefresh - Function to trigger favorites refresh
 */

/**
 * Active apartment context
 * @constant
 * @type {React.Context}
 */
export const ActiveApartmentContext = createContext();

/**
 * Active apartment provider component
 * @component ActiveApartmentProvider
 * @param {Object} props
 * @param {ReactNode} props.children - Child components
 */
export const ActiveApartmentProvider = ({ children }) => {
  const [allApartments, setAllApartments] = useState([]);
  const [mapLocationAllApt, setMapLocationAllApt] = useState([]);
  const [loginUserId, setLoginUserId] = useState(null);
  const [user, loading] = useAuthState(auth);
  const [refreshFavorites, setRefreshFavorites] = useState(false);

  /**
   * Fetches user ID from server
   * @async
   * @function getUserId
   * @param {string} email - User's email
   */
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

  /**
   * User ID fetching effect
   * @effect
   */
  useEffect(() => {
    if (loginUserId) {
      console.log("=== Fetching Apartments ===");
      console.log("Requesting apartments for userId:", loginUserId);
      
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
                Location: apt.Location, 
              };
            }
          });
          setAllApartments(updatedData);
          setMapLocationAllApt(data);
        })
        .catch((error) => console.error("Error fetching apartments:", error));
    }
  }, [loginUserId]);

  return (
    <ActiveApartmentContext.Provider value={{
      allApartments,
      mapLocationAllApt,
      setMapLocationAllApt,
      setAllApartments,
      refreshFavorites,
      triggerFavoritesRefresh: () => setRefreshFavorites((prev) => !prev),
    }}>
      {children}
    </ActiveApartmentContext.Provider>
  );
};
export default ActiveApartmentProvider;
