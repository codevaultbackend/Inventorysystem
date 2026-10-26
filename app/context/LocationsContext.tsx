"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiFetch, ApiError, getErrorMessage } from "@/app/lib/http";

type LocationItem = {
  id?: string | number;
  name?: string;
  state?: string;
  [key: string]: any;
};

type LocationsContextType = {
  locations: LocationItem[];
  loading: boolean;
  error: string;
  errorStatus: number | null;
  refreshLocations: () => Promise<void>;
  clearLocationsError: () => void;
};

const LocationsContext = createContext<LocationsContextType | undefined>(
  undefined
);

export function LocationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const BaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const clearLocationsError = useCallback(() => {
    setError("");
    setErrorStatus(null);
  }, []);

  const fetchLocations = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setErrorStatus(null);

      const data = await apiFetch<any>(
        `${BaseUrl}/stock-manager/locations`
      );

      const normalized = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.locations)
        ? data.locations
        : [];

      setLocations(normalized);
    } catch (err) {
      console.error("Locations fetch failed:", err);

      setLocations([]);

      if (err instanceof ApiError) {
        setError(err.message);
        setErrorStatus(err.status);

        if (err.status === 401) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("token");
          }
        }
      } else {
        setError(getErrorMessage(err));
        setErrorStatus(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const value = useMemo(
    () => ({
      locations,
      loading,
      error,
      errorStatus,
      refreshLocations: fetchLocations,
      clearLocationsError,
    }),
    [locations, loading, error, errorStatus, fetchLocations, clearLocationsError]
  );

  return (
    <LocationsContext.Provider value={value}>
      {children}
    </LocationsContext.Provider>
  );
}

export function useLocations() {
  const context = useContext(LocationsContext);

  if (!context) {
    throw new Error("useLocations must be used within LocationsProvider");
  }

  return context;
}