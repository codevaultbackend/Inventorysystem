"use client";

import DashboardLayout from "../../Component/DashboardLayout";
import { SuperDashboardProvider } from "@/app/context/SuperDashboardContext";
import DashboardPage from "./Dashboard/page";

export default function Dashboard(){
 
  return (
   <>
   <DashboardPage />
   </>
  );
}