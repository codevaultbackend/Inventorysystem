"use client";

import { createContext, useContext, useState } from "react";

/* ================= TYPE ================= */
type AppContextType = {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;

  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

/* ================= CONTEXT ================= */
const AppContext = createContext<AppContextType | null>(null);

/* ================= PROVIDER ================= */
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AppContext.Provider
      value={{
        collapsed,
        setCollapsed,
        mobileOpen,
        setMobileOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

/* ================= HOOK ================= */
export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }

  return context;
}
