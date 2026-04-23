export type LedgerCompany = {
  clientId: number;
  companyName: string;
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
  clientId?: number | string | null;
  companyName?: string | null;
  email?: string | null;
  phone?: string | null;
  branchId?: number | string | null;
  gstNumber?: string | null;
  totalEntries?: number | string | null;
  totalAmount?: number | string | null;
  pendingAmount?: number | string | null;
  revenue?: number | string | null;
};

type LedgerBranchGroupApiItem = {
  branchId?: number | string | null;
  clients?: LedgerClientApiItem[] | null;
};

function toNumber(value: unknown): number {
  if (value === null || value === undefined || value === "") return 0;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toCleanString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function getEmailLocalPart(email: string): string {
  const normalizedEmail = toCleanString(email);
  if (!normalizedEmail) return "";

  const localPart = normalizedEmail.split("@")[0] || "";
  return toCleanString(localPart);
}

function getClientDisplayName(item: LedgerClientApiItem): string {
  const companyName = toCleanString(item.companyName);
  if (companyName) return companyName;

  const clientId = toNumber(item.clientId);
  const emailLocalPart = getEmailLocalPart(toCleanString(item.email));
  const phone = toCleanString(item.phone);

  if (emailLocalPart) {
    return clientId > 0
      ? `${emailLocalPart} (#${clientId})`
      : emailLocalPart;
  }

  if (phone) {
    const lastDigits = phone.slice(-4);
    return clientId > 0
      ? `Client ${lastDigits} (#${clientId})`
      : `Client ${lastDigits}`;
  }

  if (clientId > 0) {
    return `Client #${clientId}`;
  }

  return "Unnamed Client";
}

function getInitials(name: string): string {
  const cleaned = toCleanString(name).replace(/[^a-zA-Z0-9\s]/g, " ").trim();

  if (!cleaned) return "CL";

  const words = cleaned.split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return words[0].slice(0, 2).toUpperCase();
}

function isMeaningfulClient(client: LedgerClientApiItem): boolean {
  return Boolean(
    toNumber(client.clientId) ||
      toCleanString(client.companyName) ||
      toCleanString(client.email) ||
      toCleanString(client.phone) ||
      toNumber(client.totalEntries) ||
      toNumber(client.totalAmount) ||
      toNumber(client.pendingAmount) ||
      toNumber(client.revenue)
  );
}

export function formatMoney(value: number | string | null | undefined): string {
  const amount = toNumber(value);
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function normalizeLedgerClients(
  rawData: LedgerBranchGroupApiItem[] = []
): LedgerCompany[] {
  if (!Array.isArray(rawData)) return [];

  const flattened: LedgerCompany[] = [];

  rawData.forEach((branchGroup) => {
    const parentBranchId = toNumber(branchGroup?.branchId);
    const clients = Array.isArray(branchGroup?.clients) ? branchGroup.clients : [];

    clients.forEach((client) => {
      if (!isMeaningfulClient(client)) return;

      const clientId = toNumber(client?.clientId);
      const companyName = getClientDisplayName(client);
      const email = toCleanString(client?.email);
      const phone = toCleanString(client?.phone);
      const branchId = toNumber(client?.branchId ?? parentBranchId);
      const gstNumber = toCleanString(client?.gstNumber) || "N/A";
      const totalEntries = toNumber(client?.totalEntries);
      const totalAmt = toNumber(client?.totalAmount);
      const pendingAmt = toNumber(client?.pendingAmount);
      const revenue = toNumber(client?.totalAmount);

      flattened.push({
        clientId,
        companyName,
        companyShort: getInitials(companyName),
        email,
        phone,
        branchId,
        gstNumber,
        totalEntries,
        totalAmt,
        pendingAmt,
        revenue,
      });
    });
  });

  return flattened.sort((a, b) => {
    if (b.totalAmt !== a.totalAmt) return b.totalAmt - a.totalAmt;
    if (b.pendingAmt !== a.pendingAmt) return b.pendingAmt - a.pendingAmt;
    if (b.totalEntries !== a.totalEntries) return b.totalEntries - a.totalEntries;
    return a.clientId - b.clientId;
  });
}