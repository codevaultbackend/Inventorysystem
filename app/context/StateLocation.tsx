"use client";

import { createContext, useContext, useEffect, useState } from "react";

const StateLocationsContext = createContext(null);

export function StateLocationProvider({ children }) {

  const [stateLocation, setStateLocation] = useState([]);
  const [stateLoading, setStateLoading] = useState(true);
  const [stateError, setStateError] = useState("");

  const fetchLocations = async () => {

    try {

      setStateLoading(true);

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      const res = await fetch(
        "https://ims-2gyk.onrender.com/stock-manager/state",
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (!res.ok) throw new Error("API Error");

      const data = await res.json();

      console.log("STATE API:", data);

      /* FIX HERE */
      setStateLocation(Array.isArray(data) ? data : []);

      setStateError("");

    } catch (err) {

      console.error(err);
      setStateError("Failed to fetch locations");
      setStateLocation([]);

    } finally {
      setStateLoading(false);
    }

  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return (
    <StateLocationsContext.Provider
      value={{
        stateLocation,
        stateLoading,
        stateError,
      }}
    >
      {children}
    </StateLocationsContext.Provider>
  );
}

export function useStateLocations() {
  return useContext(StateLocationsContext);
}