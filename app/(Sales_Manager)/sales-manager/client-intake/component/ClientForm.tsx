"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  Mail,
  MapPin,
  Phone,
  UserRound,
  BriefcaseBusiness,
} from "lucide-react";
import ReusableInputComponent from "./ReusableInputComponent";
import type { ClientFormData } from "./ClientIntakePage";

type Props = {
  clientData?: ClientFormData;
  onFieldChange: (field: keyof ClientFormData, value: string) => void;
  onSubmit: () => Promise<void>;
  onReset: () => void;
  loading: boolean;
  apiError: string;
};

type ClientErrors = Partial<Record<keyof ClientFormData, string>>;

const defaultClientData: ClientFormData = {
  clientType: "",
  companyName: "",
  contactPerson: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "",
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ClientForm({
  clientData,
  onFieldChange,
  onSubmit,
  onReset,
  loading,
  apiError,
}: Props) {
  const [errors, setErrors] = useState<ClientErrors>({});

  const safeClientData: ClientFormData = {
    clientType: clientData?.clientType ?? defaultClientData.clientType,
    companyName: clientData?.companyName ?? defaultClientData.companyName,
    contactPerson: clientData?.contactPerson ?? defaultClientData.contactPerson,
    email: clientData?.email ?? defaultClientData.email,
    phone: clientData?.phone ?? defaultClientData.phone,
    address: clientData?.address ?? defaultClientData.address,
    city: clientData?.city ?? defaultClientData.city,
    country: clientData?.country ?? defaultClientData.country,
  };

  const normalizedData = useMemo(
    () => ({
      clientType: safeClientData.clientType.trim(),
      companyName: safeClientData.companyName.trim(),
      contactPerson: safeClientData.contactPerson.trim(),
      email: safeClientData.email.trim(),
      phone: safeClientData.phone.trim(),
      address: safeClientData.address.trim(),
      city: safeClientData.city.trim(),
      country: safeClientData.country.trim(),
    }),
    [
      safeClientData.clientType,
      safeClientData.companyName,
      safeClientData.contactPerson,
      safeClientData.email,
      safeClientData.phone,
      safeClientData.address,
      safeClientData.city,
      safeClientData.country,
    ]
  );

  const canContinue = useMemo(() => {
    return (
      normalizedData.clientType !== "" &&
      normalizedData.companyName !== "" &&
      normalizedData.contactPerson !== "" &&
      emailRegex.test(normalizedData.email) &&
      normalizedData.phone !== "" &&
      normalizedData.address !== "" &&
      normalizedData.city !== "" &&
      normalizedData.country !== ""
    );
  }, [normalizedData]);

  const handleField = (field: keyof ClientFormData, value: string) => {
    onFieldChange(field, value);

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const validate = () => {
    const nextErrors: ClientErrors = {};

    if (!normalizedData.clientType) {
      nextErrors.clientType = "Client type is required.";
    }

    if (!normalizedData.companyName) {
      nextErrors.companyName = "Company name is required.";
    }

    if (!normalizedData.contactPerson) {
      nextErrors.contactPerson = "Contact person is required.";
    }

    if (!normalizedData.email) {
      nextErrors.email = "Email is required.";
    } else if (!emailRegex.test(normalizedData.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!normalizedData.phone) {
      nextErrors.phone = "Phone is required.";
    }

    if (!normalizedData.address) {
      nextErrors.address = "Address is required.";
    }

    if (!normalizedData.city) {
      nextErrors.city = "City is required.";
    }

    if (!normalizedData.country) {
      nextErrors.country = "Country is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleContinue = async () => {
    if (loading) return;
    if (!validate()) return;

    try {
      await onSubmit();
    } catch (error) {
      console.error("Create client failed:", error);
    }
  };

  return (
    <div className="rounded-[20px] border border-[#E5E7EB] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <div className="border-b border-[#EEF2F6] px-5 py-4 sm:px-6">
        <h3 className="text-[20px] font-semibold leading-none text-[#111827]">
          Client Information
        </h3>
        <p className="mt-1 text-[13px] font-normal text-[#6B7280]">
          Enter client details to begin the sales process
        </p>
      </div>

      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <div className="space-y-5">
          <ReusableInputComponent
            label="Client Type"
            value={safeClientData.clientType}
            onChange={(value) => handleField("clientType", value)}
            placeholder="Select client type"
            required
            select
            icon={<BriefcaseBusiness size={16} />}
            options={[
              { label: "Individual", value: "Individual" },
              { label: "Business", value: "Business" },
              { label: "Enterprise", value: "Enterprise" },
            ]}
            error={errors.clientType}
          />

          <ReusableInputComponent
            label="Company Name"
            value={safeClientData.companyName}
            onChange={(value) => handleField("companyName", value)}
            placeholder="Enter company name"
            required
            icon={<Building2 size={16} />}
            error={errors.companyName}
          />

          <ReusableInputComponent
            label="Contact Person"
            value={safeClientData.contactPerson}
            onChange={(value) => handleField("contactPerson", value)}
            placeholder="Enter contact person name"
            required
            icon={<UserRound size={16} />}
            error={errors.contactPerson}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ReusableInputComponent
              label="Email Address"
              value={safeClientData.email}
              onChange={(value) => handleField("email", value)}
              placeholder="email@example.com"
              required
              icon={<Mail size={16} />}
              error={errors.email}
            />

            <ReusableInputComponent
              label="Phone Number"
              value={safeClientData.phone}
              onChange={(value) => handleField("phone", value)}
              placeholder="+1 234 567 8900"
              required
              icon={<Phone size={16} />}
              error={errors.phone}
            />
          </div>

          <ReusableInputComponent
            label="Address"
            value={safeClientData.address}
            onChange={(value) => handleField("address", value)}
            placeholder="Enter full address"
            required
            textarea
            icon={<MapPin size={16} />}
            error={errors.address}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ReusableInputComponent
              label="City"
              value={safeClientData.city}
              onChange={(value) => handleField("city", value)}
              placeholder="Enter city"
              required
              error={errors.city}
            />

            <ReusableInputComponent
              label="Country"
              value={safeClientData.country}
              onChange={(value) => handleField("country", value)}
              placeholder="Enter country"
              required
              error={errors.country}
            />
          </div>
        </div>

        {apiError ? (
          <div className="mt-5 rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] font-medium text-[#B91C1C]">
            {apiError}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-[#EEF2F6] px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
        <button
          type="button"
          onClick={onReset}
          disabled={loading}
          className="h-[44px] rounded-[10px] border border-[#D1D5DB] bg-white px-5 text-[14px] font-medium text-[#374151] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue || loading}
          className={`h-[44px] rounded-[10px] px-5 text-[14px] font-medium text-white transition ${
            !canContinue || loading
              ? "cursor-not-allowed bg-[#BFD0FB]"
              : "bg-[#2563EB] hover:bg-[#1D4ED8]"
          }`}
        >
          {loading ? "Creating Client..." : "Continue to Requirements →"}
        </button>
      </div>
    </div>
  );
}