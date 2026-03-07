"use client";

import { createContext, useContext, useEffect, useState } from "react";

const StateLocationsContext = createContext(null);

export function StateLocationProvider({ children }) {

  const [stateLocation, setStateLocation] = useState(null);
  const [stateLoading, setStateLoading] = useState(true);
  const [stateError, setStateError] = useState("");

  const fetchLocations = async () => {

    try {

      setStateLoading(true);
      setStateError("");

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      const res = await fetch(
        "https://ims-2gyk.onrender.com/stock-manager/state-graph",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (!res.ok) {

        const text = await res.text();
        throw new Error(`API Error: ${res.status} ${text}`);

      }

      const data = await res.json();

      console.log("STATE API RESPONSE:", data);

      /* Store FULL API response */
      setStateLocation(data);

    } catch (err) {

      console.error("STATE API ERROR:", err);

      setStateError(
        err?.message || "Something went wrong while fetching state data"
      );

      setStateLocation(null);

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
        refetchStateLocations: fetchLocations,
      }}
    >
      {children}
    </StateLocationsContext.Provider>
  );
}

export function useStateLocations() {

  const context = useContext(StateLocationsContext);

  if (!context) {
    throw new Error("useStateLocations must be used inside StateLocationProvider");
  }

  return context;

}