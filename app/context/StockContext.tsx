"use client";

import { createContext, useContext, useState } from "react";

type StockContextType = {
  branches: any[];
  setBranches: (data: any[]) => void;
};

const StockContext = createContext<StockContextType | null>(null);

export const StockProvider = ({ children }: any) => {

  const [branches, setBranches] = useState<any[]>([]);

  return (
    <StockContext.Provider value={{ branches, setBranches }}>
      {children}
    </StockContext.Provider>
  );
};

export const useStock = () => {

  const context = useContext(StockContext);

  if (!context) {
    throw new Error("useStock must be used inside StockProvider");
  }

  return context;
};