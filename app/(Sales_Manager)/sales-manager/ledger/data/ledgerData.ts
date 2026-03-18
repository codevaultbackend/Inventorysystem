export type LedgerInvoiceItem = {
  id: string;
  description: string;
  hsnSac: string;
  quantity: string;
  rate: number;
  disc: string;
  amount: number;
};

export type TaxBreakdownRow = {
  hsnSac: string;
  taxableValue: number;
  centralTaxRate: string;
  centralTaxAmount: number;
  stateTaxRate: string;
  stateTaxAmount: number;
  totalTax: number;
};

export type LedgerEntry = {
  id: string;
  entryId: string;
  transactionId: string;
  client: string;
  dateTime: string;
  receivedAmt: number;
  pendingAmt: number;
  amount: number;
  billNumber: string;
  deliveryDate: string;
  invoiceDate: string;
  modeOfPayment: string;
  referenceNo: string;
  otherReferences: string;
  buyersOrderNo: string;
  dispatchDocNo: string;
  deliveryNoteDate: string;
  seller: {
    company: string;
    address: string;
    gst: string;
    location: string;
  };
  buyer: {
    company: string;
    address: string;
    gst: string;
    location: string;
  };
  items: LedgerInvoiceItem[];
  taxes: TaxBreakdownRow[];
  taxAmountWords: string;
  terms: string;
  irn: string;
  ackNo: string;
  ackDate: string;
};

export type LedgerCompany = {
  id: string;
  companyName: string;
  companyShort: string;
  email: string;
  phone: string;
  gstNumber: string;
  pendingAmt: number;
  revenue: number;
  totalAmt: number;
  entriesToday: number;
  entries: LedgerEntry[];
};

export const ledgerSummary = {
  monthlyRevenueTop: "$0.00",
  monthlyRevenuePercent: "90%",
  monthlyRevenueLabel: "Month’s Revenue",
  activeClients: "49,832",
  pendingAmountTop: "↗ 3 this week",
  pendingAmount: "$12,396",
};

export const ledgerCompanies: LedgerCompany[] = [
  {
    id: "athratech-pvt-ltd",
    companyName: "Company Name",
    companyShort: "Athratech Pvt Ltd",
    email: "alice.@email.com",
    phone: "+91 9580158154",
    gstNumber: "INV-001",
    pendingAmt: 179.96,
    revenue: 18799.96,
    totalAmt: 1879.96,
    entriesToday: 3,
    entries: [
      {
        id: "ledger-001",
        entryId: "LE666423",
        transactionId: "QT647757",
        client: "vivek",
        dateTime: "20/02/2026, 16:04:26",
        receivedAmt: 120000,
        pendingAmt: 80000,
        amount: 20000,
        billNumber: "SHB/456/20",
        deliveryDate: "20-Dec-20",
        invoiceDate: "20-Dec-20",
        modeOfPayment: "UPI/Credit/Cash Payment",
        referenceNo: "R-D696",
        otherReferences: "-",
        buyersOrderNo: "Dated",
        dispatchDocNo: "Delivery Note Date",
        deliveryNoteDate: "Delivery Note Date",
        seller: {
          company: "Surabhi Hardwares, Bangalore",
          address: "HSR Layout",
          gst: "29AACCT3705E00Q",
          location: "12th Cross - Karnataka, Code - 29",
        },
        buyer: {
          company: "Kiran Enterprises",
          address: "12th Cross",
          gst: "29AAFFG817AN1ZZ",
          location: "Karnataka, Code - 29",
        },
        items: [
          {
            id: "item-1",
            description: "12MM*",
            hsnSac: "1005",
            quantity: "7 No",
            rate: 500,
            disc: "No",
            amount: 3500,
          },
        ],
        taxes: [
          {
            hsnSac: "1005",
            taxableValue: 3500,
            centralTaxRate: "9%",
            centralTaxAmount: 315,
            stateTaxRate: "9%",
            stateTaxAmount: 315,
            totalTax: 630,
          },
        ],
        taxAmountWords: "Indian Rupees Four Thousand One Hundred Thirty Only",
        terms: "for Surabhi Hardwares, Bangalore",
        irn: "fef3ff0b50bb92db4bb0b84f961f6bbb9c9b0b55659475e8c-2fb6393",
        ackNo: "AC4567",
        ackDate: "21-Dec-20",
      },
      {
        id: "ledger-002",
        entryId: "LE666424",
        transactionId: "QT647758",
        client: "vivek",
        dateTime: "20/02/2026, 16:14:26",
        receivedAmt: 120000,
        pendingAmt: 80000,
        amount: 20000,
        billNumber: "SHB/457/20",
        deliveryDate: "20-Dec-20",
        invoiceDate: "20-Dec-20",
        modeOfPayment: "UPI/Credit/Cash Payment",
        referenceNo: "R-D697",
        otherReferences: "-",
        buyersOrderNo: "Dated",
        dispatchDocNo: "Delivery Note Date",
        deliveryNoteDate: "Delivery Note Date",
        seller: {
          company: "Surabhi Hardwares, Bangalore",
          address: "HSR Layout",
          gst: "29AACCT3705E00Q",
          location: "12th Cross - Karnataka, Code - 29",
        },
        buyer: {
          company: "Kiran Enterprises",
          address: "12th Cross",
          gst: "29AAFFG817AN1ZZ",
          location: "Karnataka, Code - 29",
        },
        items: [
          {
            id: "item-1",
            description: "12MM*",
            hsnSac: "1005",
            quantity: "7 No",
            rate: 500,
            disc: "No",
            amount: 3500,
          },
        ],
        taxes: [
          {
            hsnSac: "1005",
            taxableValue: 3500,
            centralTaxRate: "9%",
            centralTaxAmount: 315,
            stateTaxRate: "9%",
            stateTaxAmount: 315,
            totalTax: 630,
          },
        ],
        taxAmountWords: "Indian Rupees Four Thousand One Hundred Thirty Only",
        terms: "for Surabhi Hardwares, Bangalore",
        irn: "fef3ff0b50bb92db4bb0b84f961f6bbb9c9b0b55659475e8c-2fb6394",
        ackNo: "AC4568",
        ackDate: "21-Dec-20",
      },
      {
        id: "ledger-003",
        entryId: "LE666425",
        transactionId: "QT647759",
        client: "vivek",
        dateTime: "20/02/2026, 16:24:26",
        receivedAmt: 120000,
        pendingAmt: 80000,
        amount: 20000,
        billNumber: "SHB/458/20",
        deliveryDate: "20-Dec-20",
        invoiceDate: "20-Dec-20",
        modeOfPayment: "UPI/Credit/Cash Payment",
        referenceNo: "R-D698",
        otherReferences: "-",
        buyersOrderNo: "Dated",
        dispatchDocNo: "Delivery Note Date",
        deliveryNoteDate: "Delivery Note Date",
        seller: {
          company: "Surabhi Hardwares, Bangalore",
          address: "HSR Layout",
          gst: "29AACCT3705E00Q",
          location: "12th Cross - Karnataka, Code - 29",
        },
        buyer: {
          company: "Kiran Enterprises",
          address: "12th Cross",
          gst: "29AAFFG817AN1ZZ",
          location: "Karnataka, Code - 29",
        },
        items: [
          {
            id: "item-1",
            description: "12MM*",
            hsnSac: "1005",
            quantity: "7 No",
            rate: 500,
            disc: "No",
            amount: 3500,
          },
        ],
        taxes: [
          {
            hsnSac: "1005",
            taxableValue: 3500,
            centralTaxRate: "9%",
            centralTaxAmount: 315,
            stateTaxRate: "9%",
            stateTaxAmount: 315,
            totalTax: 630,
          },
        ],
        taxAmountWords: "Indian Rupees Four Thousand One Hundred Thirty Only",
        terms: "for Surabhi Hardwares, Bangalore",
        irn: "fef3ff0b50bb92db4bb0b84f961f6bbb9c9b0b55659475e8c-2fb6395",
        ackNo: "AC4569",
        ackDate: "21-Dec-20",
      },
    ],
  },
];

export const emptyLedgerCompanies: LedgerCompany[] = [];

export const formatMoney = (value: number) => {
  return `$${value.toFixed(2)}`;
};

export const formatRupee = (value: number) => {
  return `₹ ${value.toFixed(2)}`;
};

export function getLedgerCompanyById(companyId: string) {
  return ledgerCompanies.find((company) => company.id === companyId) ?? null;
}

export function getLedgerEntryById(companyId: string, entryId: string) {
  const company = getLedgerCompanyById(companyId);
  if (!company) return null;

  return company.entries.find((entry) => entry.id === entryId) ?? null;
}