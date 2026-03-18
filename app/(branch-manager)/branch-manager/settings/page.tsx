"use client";

import { useState } from "react";
import {
  Settings,
  Bell,
  Shield,
  User,
  Package,
  DollarSign,
  AlertTriangle,
  Mail,
  Smartphone,
  KeyRound,
} from "lucide-react";

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "general" | "notification" | "security"
  >("general");

  return (
    <div className="space-y-6">

      {/* ================= PAGE TITLE ================= */}
      <div>
        <h1 className="text-[28px] font-semibold text-[#0F172A]">
          System Settings
        </h1>
        <p className="text-[13px] text-[#64748B] mt-1">
          Manage companies, subscriptions, and licenses
        </p>
      </div>

      {/* ================= SETTINGS CARD ================= */}
      <div className="bg-white rounded-2xl border border-[#EEF2F6] shadow-[0_6px_20px_rgba(0,0,0,0.04)]">

        {/* ================= TABS ================= */}
        <div className="flex border-b border-[#F1F5F9] px-6 overflow-x-auto overflow-y-auto no-scrollbar">

          <TabButton
            active={activeTab === "general"}
            onClick={() => setActiveTab("general")}
            icon={<Settings className="w-4 h-4" />}
            label="General"
          />

          <TabButton
            active={activeTab === "notification"}
            onClick={() => setActiveTab("notification")}
            icon={<Bell className="w-4 h-4" />}
            label="Notification"
          />

          <TabButton
            active={activeTab === "security"}
            onClick={() => setActiveTab("security")}
            icon={<Shield className="w-4 h-4" />}
            label="Security"
          />
        </div>

        <div className="p-8">

          {/* ================= GENERAL TAB ================= */}
          {activeTab === "general" && (
            <div className="space-y-6 max-w-[720px]">

              <FormField label="Company Name">
                <input
                  type="text"
                  className="w-full h-[48px] rounded-[14px] border border-[#E2E8F0] px-4 text-[14px] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </FormField>

              <FormField label="Time Zone">
                <input
                  type="text"
                  placeholder="Asia/Kolkata (IST)"
                  className="w-full h-[48px] rounded-[14px] border border-[#E2E8F0] px-4 text-[14px] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </FormField>

              <FormField label="Date Format">
                <input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  className="w-full h-[48px] rounded-[14px] border border-[#E2E8F0] px-4 text-[14px] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </FormField>

              <FormField label="Currency">
                <input
                  type="text"
                  placeholder="INR (₹)"
                  className="w-full h-[48px] rounded-[14px] border border-[#E2E8F0] px-4 text-[14px] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </FormField>

              <button className="mt-4 px-6 py-3 bg-[#1D4ED8] text-white rounded-xl text-[15px] font-medium shadow-md hover:bg-[#1E40AF] transition">
                Save Changes
              </button>
            </div>
          )}

          {/* ================= NOTIFICATION TAB ================= */}
          {activeTab === "notification" && (
            <div className="space-y-6 max-w-[900px]">
              <SectionTitle
                title="Recent Activities"
                subtitle="Latest System Activities and updates"
              />
              <ActivityList />
            </div>
          )}

          {/* ================= SECURITY TAB ================= */}
          {activeTab === "security" && (
            <div className="space-y-8 max-w-[900px]">

              <SectionTitle title="Recent Security Activity" />

              <SimpleCard title="New sign-in on Mac OS" subtitle="Jan 30 . India" />
              <SimpleCard title="New sign-in on Mac OS" subtitle="Jan 30 . India" />
              <SimpleCard title="New sign-in on Mac OS" subtitle="Jan 30 . India" />

              <SectionTitle
                title="How you sign in"
                subtitle="Make sure you can always access your Google Account by keeping this information up to date"
              />

              <SecurityOption
                icon={<KeyRound className="w-5 h-5" />}
                title="Change Password"
                subtitle="Last Change 27 Jan. 2026"
              />

              <SecurityOption
                icon={<Smartphone className="w-5 h-5" />}
                title="Recovery Phone"
                subtitle="Enter you Phone Number"
              />

              <SecurityOption
                icon={<Mail className="w-5 h-5" />}
                title="Recovery Email"
                subtitle="Enter you Email"
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-4 text-[14px] font-medium relative transition ${
        active
          ? "text-[#2563EB]"
          : "text-[#64748B] hover:text-[#0F172A]"
      }`}
    >
      {icon}
      {label}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#2563EB] rounded-full" />
      )}
    </button>
  );
}

function FormField({ label, children }: any) {
  return (
    <div>
      <label className="block text-[14px] text-[#475569] mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function SectionTitle({ title, subtitle }: any) {
  return (
    <div>
      <h3 className="text-[16px] font-semibold text-[#0F172A]">{title}</h3>
      {subtitle && (
        <p className="text-[12px] text-[#64748B] mt-1">{subtitle}</p>
      )}
    </div>
  );
}

function ActivityList() {
  const items = [
    { icon: <User />, title: "User Registered", sub: "Tech Corporate", time: "5 minutes ago" },
    { icon: <Package />, title: "Stock Updated", sub: "Latest System Activities and updates", time: "15 minutes ago" },
    { icon: <Settings />, title: "Setting Updated", sub: "System", time: "1 hour ago" },
    { icon: <DollarSign />, title: "Sales Transaction", sub: "Sale completed - $4,500", time: "7 hours ago" },
    { icon: <AlertTriangle />, title: "Stock Alert", sub: "Low stock alert from #2461", time: "22 hours ago" },
  ];

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-center justify-between bg-[#F8FAFC] rounded-xl px-5 py-4 hover:bg-[#F1F5F9] transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] flex items-center justify-center text-[#2563EB]">
              {item.icon}
            </div>
            <div>
              <p className="text-[14px] font-medium text-[#0F172A]">
                {item.title}
              </p>
              <p className="text-[12px] text-[#64748B]">{item.sub}</p>
            </div>
          </div>
          <span className="text-[12px] text-[#94A3B8]">
            {item.time}
          </span>
        </div>
      ))}
    </div>
  );
}

function SimpleCard({ title, subtitle }: any) {
  return (
    <div className="bg-[#F8FAFC] rounded-xl px-6 py-4">
      <p className="text-[15px] font-medium text-[#0F172A]">{title}</p>
      <p className="text-[12px] text-[#64748B] mt-1">{subtitle}</p>
    </div>
  );
}

function SecurityOption({ icon, title, subtitle }: any) {
  return (
    <div className="bg-[#F8FAFC] rounded-xl px-6 py-4 flex items-center gap-4 hover:bg-[#F1F5F9] transition">
      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center border border-[#E2E8F0]">
        {icon}
      </div>
      <div>
        <p className="text-[14px] font-medium text-[#0F172A]">{title}</p>
        <p className="text-[12px] text-[#64748B] mt-1">{subtitle}</p>
      </div>
    </div>
  );
}
