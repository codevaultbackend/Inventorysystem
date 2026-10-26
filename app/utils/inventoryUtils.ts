export const toNumber = (value: unknown) => {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
};

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-IN").format(Number(value || 0));

export const formatMoney = (value: number) =>
  `₹ ${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Number(value || 0))}`;

export const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const normalizeStatus = (status?: string) => {
  if (status === "GOOD") return "Good";
  if (status === "DAMAGED") return "Damaged";
  if (status === "REPAIRABLE") return "Repairable";
  return status || "-";
};

export const statusClass = (status: string) => {
  const s = String(status || "").toLowerCase();

  if (s.includes("fresh") || s.includes("good")) {
    return "bg-[#D9FBE8] text-[#11B85A]";
  }
  if (s.includes("damage")) {
    return "bg-[#FFE3E5] text-[#FF4D55]";
  }
  if (s.includes("repair")) {
    return "bg-[#FFF8BF] text-[#D3AA00]";
  }

  return "bg-[#EAF1FF] text-[#2F80ED]";
};