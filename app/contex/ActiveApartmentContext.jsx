import React, { createContext, useState, useEffect } from "react";
import API from "../../config"

export const ActiveApartmentContext = createContext();

export const ActiveApartmentProvider = ({ children }) => {
  const [allApartments, setAllApartments] = useState([]);

  useEffect(() => {
    fetch(API + `Apartment/GetAllActiveApartments/${11}`)
      .then((response) => response.json())
      .then((data) => setAllApartments(data))
      .catch((error) => console.error("Error fetching apartments:", error));
  }, []);

  return (
    <ActiveApartmentContext.Provider value={{ allApartments, setAllApartments }}>
      {children}
    </ActiveApartmentContext.Provider>
  );
};
