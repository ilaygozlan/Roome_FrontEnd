import { createContext, useState, useContext } from "react";
import { ActiveApartmentContext } from "./ActiveApartmentContext";
import API from "../../config";

export const OpenHouseContext = createContext();

export function OpenHouseProvider({ children }) {
  const { loginUserId } = useContext(ActiveApartmentContext);
  const [openHouses, setOpenHouses] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAndSetOpenHouse = async (apartmentId) => {
    try {
      if (!apartmentId || !loginUserId) return;

      setLoading(true);
      const url = `${API}OpenHouse/GetOpenHousesByApartment/${apartmentId}/${loginUserId}`;
      const res = await fetch(url);

      if (res.status === 404) {
        setOpenHouses([]);
        return;
      }

      if (!res.ok) throw new Error("Unexpected error fetching open houses");

      const data = await res.json();
      setOpenHouses(data);
    } catch (err) {
      // ❌ אל תדפיס שגיאה לקונסול אם זו שגיאת 404 — זה כבר טופל
      setOpenHouses([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <OpenHouseContext.Provider value={{
      openHouses,
      setOpenHouses,
      loading,
      setLoading,
      fetchAndSetOpenHouse
    }}>
      {children}
    </OpenHouseContext.Provider>
  );
}

export const useOpenHouse = () => useContext(OpenHouseContext);
export default OpenHouseContext;
