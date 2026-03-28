"use client";

import { createContext, useContext, useState } from "react";

type AppContextType = {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  globalSearch: string;
  setGlobalSearch: React.Dispatch<React.SetStateAction<string>>;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  return (
    <AppContext.Provider
      value={{
        collapsed,
        setCollapsed,
        mobileOpen,
        setMobileOpen,
        globalSearch,
        setGlobalSearch,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }

  return context;
}