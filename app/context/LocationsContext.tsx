"use client";

import { createContext, useContext, useEffect, useState } from "react";

const LocationsContext = createContext(null);

export function LocationsProvider({ children }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLocations = async () => {
    try {
      setLoading(true);

      const storedToken =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      const res = await fetch(
        "https://ims-2gyk.onrender.com/stock-manager/locations",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: storedToken
              ? `Bearer ${storedToken}`
              : "",
          },
        }
      );

      if (!res.ok) {
        throw new Error("Unauthorized or API error");
      }

      const data = await res.json();

      console.log("LOCATIONS API:", data);

      setLocations(data?.locations || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch locations");
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return (
    <LocationsContext.Provider
      value={{
        locations,
        loading,
        error,
        refresh: fetchLocations,
      }}
    >
      {children}
    </LocationsContext.Provider>
  );
}

export function useLocations() {
  return useContext(LocationsContext);
}