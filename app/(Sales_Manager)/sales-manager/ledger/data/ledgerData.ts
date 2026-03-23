export type LedgerCompany = {
  clientId: number;
  companyName: string | null;
  companyShort: string;
  email: string;
  phone: string;
  branchId: number;
  gstNumber: string;
  totalEntries: number;
  totalAmt: number;
  pendingAmt: number;
  revenue: number;
};

type LedgerClientApiItem = {
  clientId: number;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  branchId: number;
  gstNumber: string | null;
  totalEntries: number | string;
  totalAmount: number | string;
  pendingAmount: number | string;
  revenue: number | string;
};

type LedgerBranchApiItem = {
  branchId: number;
  totalClients?: number;
  totalEntries?: number;
  totalAmount?: number;
  pendingAmount?: number;
  revenue?: number;
  clients?: LedgerClientApiItem[];
};

export type LedgerApiResponse = {
  success: boolean;
  clients: LedgerBranchApiItem[];
};

function toNumber(value: unknown): number {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

export function formatMoney(value: number | string | null | undefined) {
  const num = toNumber(value);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

function getCompanyShortName(companyName?: string | null) {
  if (!companyName) return "NA";

  const words = companyName.trim().split(/\s+/).filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || "")
    .join("");
}

export function normalizeLedgerClients(
  branches: LedgerBranchApiItem[] = []
): LedgerCompany[] {
  return branches.flatMap((branch) =>
    (branch.clients || []).map((client) => ({
      clientId: toNumber(client.clientId),
      companyName: client.companyName ?? "Unnamed Company",
      companyShort: getCompanyShortName(client.companyName),
      email: client.email ?? "N/A",
      phone: client.phone ?? "N/A",
      branchId: toNumber(client.branchId),
      gstNumber: client.gstNumber ?? "N/A",
      totalEntries: toNumber(client.totalEntries),
      totalAmt: toNumber(client.totalAmount),
      pendingAmt: toNumber(client.pendingAmount),
      revenue: toNumber(client.revenue),
    }))
  );
}