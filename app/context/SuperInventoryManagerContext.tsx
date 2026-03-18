"use client";

import { createContext, useContext, ReactNode } from "react";

type CountsType = {
  total: number;
  low: number;
  scrap: number;
  transit: number;
};

type CategoryType = {
  name: string;
  currentStock: number;
  stockIn: number;
  stockOut: number;
  aging: number;
};

type LineType = {
  date: string;
  stockIn: number;
  stockOut: number;
};

type DashboardType = {
  counts: CountsType;
  categoryData: CategoryType[];
  lineData: LineType[];
};

const staticDashboard: DashboardType = {
  counts: {
    total: 2543,
    low: 48,
    scrap: 19,
    transit: 158,
  },

  categoryData: [
    { name: "Laptops", currentStock: 320, stockIn: 360, stockOut: 40, aging: 12 },
    { name: "Monitors", currentStock: 210, stockIn: 250, stockOut: 40, aging: 9 },
    { name: "Printers", currentStock: 140, stockIn: 180, stockOut: 40, aging: 7 },
    { name: "Routers", currentStock: 190, stockIn: 230, stockOut: 40, aging: 6 },
    { name: "Accessories", currentStock: 390, stockIn: 450, stockOut: 60, aging: 14 },
  ],

  lineData: [
    { date: "Jan", stockIn: 120, stockOut: 60 },
    { date: "Feb", stockIn: 160, stockOut: 80 },
    { date: "Mar", stockIn: 140, stockOut: 70 },
    { date: "Apr", stockIn: 180, stockOut: 90 },
    { date: "May", stockIn: 210, stockOut: 100 },
    { date: "Jun", stockIn: 190, stockOut: 95 },
  ],
};

const SuperInventoryManagerContext = createContext({
  data: staticDashboard,
  loading: false,
  error: null,
  refresh: () => {},
});

export const SuperInventoryManagerProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <SuperInventoryManagerContext.Provider
      value={{
        data: staticDashboard,
        loading: false,
        error: null,
        refresh: () => {},
      }}
    >
      {children}
    </SuperInventoryManagerContext.Provider>
  );
};

export const useSuperInventoryManager = () =>
  useContext(SuperInventoryManagerContext);