import React, { createContext, useState, useEffect } from "react";

export const ActiveApartmentContext = createContext();

export const ActiveApartmentProvider = ({ children }) => {
  const [allApartments, setAllApartments] = useState([]);

  useEffect(() => {
    
    fetch("http://192.168.1.111:5000/api/Apartment/GetAllActiveApartments")
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
