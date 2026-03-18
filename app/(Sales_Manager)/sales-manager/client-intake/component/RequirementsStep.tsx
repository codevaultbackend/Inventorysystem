"use client";

import { useMemo, useState } from "react";
import { Building2, Mail, MapPin, Phone, UserRound } from "lucide-react";
import ReusableInputComponent from "./ReusableInputComponent";
import type { ClientFormData } from "./ClientIntakePage";

type Props = {
  clientData: ClientFormData;
  onFieldChange: (field: keyof ClientFormData, value: string) => void;
  onSubmit: () => Promise<void>;
  onReset: () => void;
  loading: boolean;
  apiError: string;
};

type ClientErrors = Partial<Record<keyof ClientFormData, string>>;

export default function ClientForm({
  clientData,
  onFieldChange,
  onSubmit,
  onReset,
  loading,
  apiError,
}: Props) {
  const [errors, setErrors] = useState<ClientErrors>({});

  const canContinue = useMemo(() => {
    return (
      clientData.clientType.trim() &&
      clientData.companyName.trim() &&
      clientData.contactPerson.trim() &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientData.email) &&
      clientData.phone.trim() &&
      clientData.address.trim() &&
      clientData.city.trim() &&
      clientData.country.trim()
    );
  }, [clientData]);

  const handleField = (field: keyof ClientFormData, value: string) => {
    onFieldChange(field, value);

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const validate = () => {
    const nextErrors: ClientErrors = {};

    if (!clientData.clientType.trim()) nextErrors.clientType = "Client type is required.";
    if (!clientData.companyName.trim()) nextErrors.companyName = "Company name is required.";
    if (!clientData.contactPerson.trim()) nextErrors.contactPerson = "Contact person is required.";

    if (!clientData.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientData.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!clientData.phone.trim()) nextErrors.phone = "Phone is required.";
    if (!clientData.address.trim()) nextErrors.address = "Address is required.";
    if (!clientData.city.trim()) nextErrors.city = "City is required.";
    if (!clientData.country.trim()) nextErrors.country = "Country is required.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validate()) return;
    await onSubmit();
  };

  return (
    <div className="rounded-[14px] border border-[#DDE3EA] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)] p-4 sm:p-5">
      <div className="space-y-5">
        <ReusableInputComponent
          label="Client Type"
          value={clientData.clientType}
          onChange={(value) => handleField("clientType", value)}
          placeholder="Select client type"
          required
          select
          options={[
            { label: "Individual", value: "Individual" },
            { label: "Business", value: "Business" },
            { label: "Enterprise", value: "Enterprise" },
          ]}
          error={errors.clientType}
        />

        <ReusableInputComponent
          label="Company Name"
          value={clientData.companyName}
          onChange={(value) => handleField("companyName", value)}
          placeholder="Enter company name"
          required
          icon={<Building2 size={16} />}
          error={errors.companyName}
        />

        <ReusableInputComponent
          label="Contact Person"
          value={clientData.contactPerson}
          onChange={(value) => handleField("contactPerson", value)}
          placeholder="Enter contact person name"
          required
          icon={<UserRound size={16} />}
          error={errors.contactPerson}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReusableInputComponent
            label="Email"
            value={clientData.email}
            onChange={(value) => handleField("email", value)}
            placeholder="email@example.com"
            required
            icon={<Mail size={16} />}
            error={errors.email}
          />

          <ReusableInputComponent
            label="Phone"
            value={clientData.phone}
            onChange={(value) => handleField("phone", value)}
            placeholder="+1 234 567 8900"
            required
            icon={<Phone size={16} />}
            error={errors.phone}
          />
        </div>

        <ReusableInputComponent
          label="Address"
          value={clientData.address}
          onChange={(value) => handleField("address", value)}
          placeholder="Enter full address"
          required
          textarea
          icon={<MapPin size={16} />}
          error={errors.address}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReusableInputComponent
            label="City"
            value={clientData.city}
            onChange={(value) => handleField("city", value)}
            placeholder="City"
            required
            error={errors.city}
          />

          <ReusableInputComponent
            label="Country"
            value={clientData.country}
            onChange={(value) => handleField("country", value)}
            placeholder="Country"
            required
            error={errors.country}
          />
        </div>
      </div>

      {apiError ? (
        <div className="mt-4 rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#B91C1C]">
          {apiError}
        </div>
      ) : null}

      <div className="mt-6 border-t border-[#E5E7EB] pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        <button
          type="button"
          onClick={onReset}
          disabled={loading}
          className="h-[40px] px-6 rounded-[10px] border border-[#D1D5DB] bg-white text-[14px] font-[500] text-[#111827] hover:bg-[#F9FAFB] transition disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue || loading}
          className={`
            h-[40px] px-6 rounded-[10px] text-[14px] font-[500] text-white transition
            ${
              !canContinue || loading
                ? "bg-[#BFD0FB] cursor-not-allowed"
                : "bg-[#7DA2F7] hover:bg-[#6A92F5]"
            }
          `}
        >
          {loading ? "Creating Client..." : "Continue to Requirements →"}
        </button>
      </div>
    </div>
  );
}