"use client";

import { useEffect, useMemo, useState } from "react";
import ClientForm from "./ClientForm";
import RequirementsStep from "./RequirementsStep";
import QuotationStep from "./QuotationStep";
import { useAuth } from "@/app/context/AuthContext";

export type ClientFormData = {
  clientType: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
};

export type Product = {
  id: string;
  name: string;
  quantity: string;
  price: string;
  specs: string;
  unit?: string;
  hsn?: string;
};

export type CreatedClient = {
  id?: number;
  client_code?: string;
  client_type?: string;
  company_name?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  branch_id?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type CreatedQuotation = {
  id?: number;
  quotation_no?: string;
  createdAt?: string;
  updatedAt?: string;
  pdf_url?: string;
};

type WorkflowStage = "builder" | "quotation_created";

const STEPS = [
  { id: 1, label: "Client-intake" },
  { id: 2, label: "Requirements" },
  { id: 3, label: "Quotation" },
];

const BaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const CREATE_CLIENT_URL =
  process.env.NEXT_PUBLIC_CREATE_CLIENT_URL ||
  `${BaseUrl}/sales/clients-create`;

const CREATE_QUOTATION_URL =
  process.env.NEXT_PUBLIC_CREATE_QUOTATION_URL ||
  `${BaseUrl}/sales/qt-gen`;

const STORAGE_KEYS = {
  step: "client-intake-step",
  clientData: "client-intake-client-data",
  createdClient: "client-intake-created-client",
  createdQuotation: "client-intake-created-quotation",
  products: "client-intake-products",
  workflowStage: "client-intake-workflow-stage",
  quotationNo: "client-intake-quotation-no",
  quotationCreatedAt: "client-intake-quotation-created-at",
};

const initialClientData: ClientFormData = {
  clientType: "",
  companyName: "",
  contactPerson: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "",
};

const createInitialProduct = (): Product => ({
  id:
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `product-${Date.now()}`,
  name: "",
  quantity: "1",
  price: "",
  specs: "",
  unit: "",
  hsn: "",
});

function getStoredJson(key: string) {
  if (typeof window === "undefined") return null;

  const raw =
    window.localStorage.getItem(key) || window.sessionStorage.getItem(key);

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getPersistedToken() {
  if (typeof window === "undefined") return "";

  const directKeys = [
    "token",
    "accessToken",
    "authToken",
    "ims_token",
    "imsToken",
    "jwt",
  ];

  for (const key of directKeys) {
    const localValue = window.localStorage.getItem(key);
    if (localValue) return localValue;

    const sessionValue = window.sessionStorage.getItem(key);
    if (sessionValue) return sessionValue;
  }

  const userLikeKeys = ["user", "authUser", "currentUser", "profile"];

  for (const key of userLikeKeys) {
    const parsed = getStoredJson(key);
    if (!parsed) continue;

    const nestedToken =
      parsed?.token ||
      parsed?.accessToken ||
      parsed?.authToken ||
      parsed?.jwt ||
      parsed?.data?.token ||
      parsed?.data?.accessToken;

    if (nestedToken) return nestedToken;
  }

  return "";
}

async function parseErrorResponse(response: Response) {
  const text = await response.text();

  try {
    const parsed = text ? JSON.parse(text) : {};
    return (
      parsed?.error ||
      parsed?.message ||
      parsed?.errors?.[0]?.message ||
      "Something went wrong."
    );
  } catch {
    return text || "Something went wrong.";
  }
}

function formatUiDateTime(date: Date) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();

  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");

  return `${dd}/${mm}/${yyyy}, ${hh}:${min}:${ss}`;
}

function generateUiQuotationNo() {
  const tail = String(Date.now()).slice(-6);
  return `QT${tail}`;
}

export default function ClientIntakePage() {
  const { token, user, loading: authLoading } = useAuth();

  const [hydrated, setHydrated] = useState(false);

  const [step, setStep] = useState(1);
  const [workflowStage, setWorkflowStage] =
    useState<WorkflowStage>("builder");

  const [clientData, setClientData] =
    useState<ClientFormData>(initialClientData);
  const [products, setProducts] = useState<Product[]>([createInitialProduct()]);
  const [createdClient, setCreatedClient] =
    useState<CreatedClient | null>(null);
  const [createdQuotation, setCreatedQuotation] =
    useState<CreatedQuotation | null>(null);

  const [clientLoading, setClientLoading] = useState(false);
  const [clientApiError, setClientApiError] = useState("");

  const [quotationLoading, setQuotationLoading] = useState(false);
  const [quotationApiError, setQuotationApiError] = useState("");

  const [quotationPdfUrl, setQuotationPdfUrl] = useState("");
  const [quotationNo, setQuotationNo] = useState("");
  const [quotationCreatedAt, setQuotationCreatedAt] = useState("");

  useEffect(() => {
    return () => {
      if (quotationPdfUrl) {
        URL.revokeObjectURL(quotationPdfUrl);
      }
    };
  }, [quotationPdfUrl]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedStep = window.sessionStorage.getItem(STORAGE_KEYS.step);
    const savedClientData = window.sessionStorage.getItem(
      STORAGE_KEYS.clientData
    );
    const savedCreatedClient = window.sessionStorage.getItem(
      STORAGE_KEYS.createdClient
    );
    const savedCreatedQuotation = window.sessionStorage.getItem(
      STORAGE_KEYS.createdQuotation
    );
    const savedProducts = window.sessionStorage.getItem(STORAGE_KEYS.products);
    const savedWorkflowStage = window.sessionStorage.getItem(
      STORAGE_KEYS.workflowStage
    );
    const savedQuotationNo = window.sessionStorage.getItem(
      STORAGE_KEYS.quotationNo
    );
    const savedQuotationCreatedAt = window.sessionStorage.getItem(
      STORAGE_KEYS.quotationCreatedAt
    );

    if (savedStep) setStep(Number(savedStep));
    if (savedClientData) setClientData(JSON.parse(savedClientData));
    if (savedCreatedClient) setCreatedClient(JSON.parse(savedCreatedClient));
    if (savedCreatedQuotation)
      setCreatedQuotation(JSON.parse(savedCreatedQuotation));
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedWorkflowStage) setWorkflowStage(savedWorkflowStage as WorkflowStage);
    if (savedQuotationNo) setQuotationNo(savedQuotationNo);
    if (savedQuotationCreatedAt) setQuotationCreatedAt(savedQuotationCreatedAt);

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    window.sessionStorage.setItem(STORAGE_KEYS.step, String(step));
  }, [step, hydrated]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    window.sessionStorage.setItem(
      STORAGE_KEYS.clientData,
      JSON.stringify(clientData)
    );
  }, [clientData, hydrated]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    window.sessionStorage.setItem(
      STORAGE_KEYS.products,
      JSON.stringify(products)
    );
  }, [products, hydrated]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;

    if (createdClient) {
      window.sessionStorage.setItem(
        STORAGE_KEYS.createdClient,
        JSON.stringify(createdClient)
      );
    } else {
      window.sessionStorage.removeItem(STORAGE_KEYS.createdClient);
    }
  }, [createdClient, hydrated]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;

    if (createdQuotation) {
      window.sessionStorage.setItem(
        STORAGE_KEYS.createdQuotation,
        JSON.stringify(createdQuotation)
      );
    } else {
      window.sessionStorage.removeItem(STORAGE_KEYS.createdQuotation);
    }
  }, [createdQuotation, hydrated]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    window.sessionStorage.setItem(STORAGE_KEYS.workflowStage, workflowStage);
  }, [workflowStage, hydrated]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    window.sessionStorage.setItem(STORAGE_KEYS.quotationNo, quotationNo);
  }, [quotationNo, hydrated]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    window.sessionStorage.setItem(
      STORAGE_KEYS.quotationCreatedAt,
      quotationCreatedAt
    );
  }, [quotationCreatedAt, hydrated]);

  const progress = useMemo(() => {
    if (workflowStage === "quotation_created") return 100;
    if (step === 1) return 13;
    if (step === 2) return 67;
    return 100;
  }, [step, workflowStage]);

  const total = useMemo(() => {
    return products.reduce((sum, item) => {
      const quantity = Number(item.quantity || 0);
      const price = Number(item.price || 0);
      return sum + quantity * price;
    }, 0);
  }, [products]);

  const handleClientFieldChange = (
    field: keyof ClientFormData,
    value: string
  ) => {
    setClientData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setClientApiError("");
  };

  const clearSessionData = () => {
    if (typeof window === "undefined") return;

    Object.values(STORAGE_KEYS).forEach((key) => {
      window.sessionStorage.removeItem(key);
    });
  };

  const handleClientReset = () => {
    setClientData(initialClientData);
    setCreatedClient(null);
    setCreatedQuotation(null);
    setClientApiError("");
    setQuotationApiError("");
    setProducts([createInitialProduct()]);
    setStep(1);
    setWorkflowStage("builder");

    if (quotationPdfUrl) {
      URL.revokeObjectURL(quotationPdfUrl);
      setQuotationPdfUrl("");
    }

    setQuotationNo("");
    setQuotationCreatedAt("");
    clearSessionData();
  };

  const handleCreateAnotherQuotation = () => {
    const freshProduct = createInitialProduct();

    setClientData(initialClientData);
    setCreatedClient(null);
    setCreatedQuotation(null);
    setProducts([freshProduct]);

    setClientApiError("");
    setQuotationApiError("");

    setStep(1);
    setWorkflowStage("builder");

    if (quotationPdfUrl) {
      URL.revokeObjectURL(quotationPdfUrl);
      setQuotationPdfUrl("");
    }

    setQuotationNo("");
    setQuotationCreatedAt("");

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(STORAGE_KEYS.step, "1");
      window.sessionStorage.setItem(STORAGE_KEYS.workflowStage, "builder");
      window.sessionStorage.setItem(
        STORAGE_KEYS.clientData,
        JSON.stringify(initialClientData)
      );
      window.sessionStorage.setItem(
        STORAGE_KEYS.products,
        JSON.stringify([freshProduct])
      );
      window.sessionStorage.removeItem(STORAGE_KEYS.createdClient);
      window.sessionStorage.removeItem(STORAGE_KEYS.createdQuotation);
      window.sessionStorage.removeItem(STORAGE_KEYS.quotationNo);
      window.sessionStorage.removeItem(STORAGE_KEYS.quotationCreatedAt);
    }
  };

  const handleCreateClient = async () => {
    setClientApiError("");
    setClientLoading(true);

    try {
      const authToken = token || getPersistedToken();

      if (!authToken) {
        throw new Error("No authentication token found. Please login again.");
      }

      const payload = {
        client_type: clientData.clientType.trim(),
        company_name: clientData.companyName.trim(),
        contact_person: clientData.contactPerson.trim(),
        phone: clientData.phone.trim(),
        email: clientData.email.trim(),
        address: clientData.address.trim(),
        city: clientData.city.trim(),
        country: clientData.country.trim(),
      };

      const response = await fetch(CREATE_CLIENT_URL, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(await parseErrorResponse(response));
      }

      const data = await response.json();
      const newClient = data?.client ?? null;
      setCreatedClient(newClient);

      if (typeof window !== "undefined" && newClient) {
        window.sessionStorage.setItem(
          STORAGE_KEYS.createdClient,
          JSON.stringify(newClient)
        );
      }

      setTimeout(() => {
        setStep(2);
      }, 400);

      return data?.message || "Client created successfully.";
    } catch (error: unknown) {
      setClientApiError(
        error instanceof Error
          ? error.message
          : "Failed to create client. Check authentication, CORS, or network."
      );
      throw error;
    } finally {
      setClientLoading(false);
    }
  };

  const handleCreateQuotation = async () => {
    setQuotationApiError("");
    setQuotationLoading(true);

    try {
      const authToken = token || getPersistedToken();

      if (!authToken) {
        throw new Error("No authentication token found. Please login again.");
      }

      const branchId = createdClient?.branch_id ?? user?.branch_id;

      if (!branchId) {
        throw new Error("Branch ID not found. Please login again and retry.");
      }

      const response = await fetch(CREATE_QUOTATION_URL, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          client: {
            client_type: clientData.clientType.trim(),
            company_name: clientData.companyName.trim(),
            contact_person: clientData.contactPerson.trim(),
            phone: clientData.phone.trim(),
            email: clientData.email.trim(),
            address: clientData.address.trim(),
            city: clientData.city.trim(),
            country: clientData.country.trim(),
          },
          branch_id: branchId,
          gst_percent: 0,
          valid_till: null,
          products: products.map((item) => ({
            product_name: item.name.trim(),
            quantity: Number(item.quantity || 0),
            unit_price: Number(item.price || 0),
            unit: item.unit?.trim() || "",
            hsn: item.hsn?.trim() || "",
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(await parseErrorResponse(response));
      }

      const contentType = response.headers.get("content-type") || "";

      let quotationRecord: CreatedQuotation | null = null;
      let quotationNumber = generateUiQuotationNo();
      let quotationDate = formatUiDateTime(new Date());
      let pdfUrl = "";

      if (contentType.includes("application/json")) {
        const data = await response.json();

        quotationRecord =
          data?.quotation ||
          data?.data?.quotation ||
          data?.result?.quotation ||
          null;

        quotationNumber =
          quotationRecord?.quotation_no ||
          data?.quotation_no ||
          generateUiQuotationNo();

        quotationDate =
          quotationRecord?.createdAt ||
          data?.createdAt ||
          formatUiDateTime(new Date());

        if (data?.pdf_url) {
          pdfUrl = data.pdf_url;
        } else if (quotationRecord?.pdf_url) {
          pdfUrl = quotationRecord.pdf_url;
        }
      } else {
        const blob = await response.blob();

        if (quotationPdfUrl) {
          URL.revokeObjectURL(quotationPdfUrl);
        }

        pdfUrl = URL.createObjectURL(blob);
      }

      setCreatedQuotation(quotationRecord);
      setQuotationPdfUrl(pdfUrl);
      setQuotationNo(quotationNumber);
      setQuotationCreatedAt(quotationDate);
      setStep(3);
      setWorkflowStage("quotation_created");

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(STORAGE_KEYS.step, "3");
        window.sessionStorage.setItem(
          STORAGE_KEYS.workflowStage,
          "quotation_created"
        );
        window.sessionStorage.setItem(STORAGE_KEYS.quotationNo, quotationNumber);
        window.sessionStorage.setItem(
          STORAGE_KEYS.quotationCreatedAt,
          quotationDate
        );

        if (quotationRecord) {
          window.sessionStorage.setItem(
            STORAGE_KEYS.createdQuotation,
            JSON.stringify(quotationRecord)
          );
        } else {
          window.sessionStorage.removeItem(STORAGE_KEYS.createdQuotation);
        }
      }
    } catch (error: unknown) {
      setQuotationApiError(
        error instanceof Error
          ? error.message
          : "Failed to create quotation. Please verify stock, auth, and backend response."
      );
    } finally {
      setQuotationLoading(false);
    }
  };

  if (authLoading || !hydrated) {
    return (
      <div className="flex w-full justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-[980px] rounded-[18px] border border-[#DEE4EC] bg-white p-6 text-[14px] text-[#4B5563]">
          Loading...
        </div>
      </div>
    );
  }

  if (workflowStage === "quotation_created") {
    return (
      <QuotationStep
  clientData={clientData}
  createdClient={createdClient}
  products={products}
  total={total}
  quotationId={createdQuotation?.id ?? null}
  quotationPdfUrl={quotationPdfUrl}
  quotationNo={createdQuotation?.quotation_no || quotationNo}
  quotationCreatedAt={createdQuotation?.createdAt || quotationCreatedAt}
  status="pending"
  onCreateAnotherQuotation={handleCreateAnotherQuotation}
/>
    );
  }

  return (
    <div className=" w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-5">
      <div className="w-full max-w-full">
        {createdClient?.id ? (
          <div className="mb-4 rounded-[12px] border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-[13px] text-[#166534]">
            Client saved successfully. Client Code:{" "}
            <span className="font-semibold">
              {createdClient.client_code || "Generated"}
            </span>
          </div>
        ) : null}

        <div className="mb-5 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="w-full max-w-[620px]">
            <h1 className="text-[28px] font-[700] leading-[34px] tracking-[-0.02em] text-[#111827]">
              Client Intake
            </h1>

            <p className="mt-[10px] text-[14px] font-[400] leading-[20px] text-[#4B5563]">
              Enter client details to begin the sales process
            </p>

            <div className="mt-[14px] w-full max-w-[520px]">
              <div className="mb-[8px] flex items-center justify-between">
                <span className="text-[13px] font-[500] leading-[18px] text-[#374151]">
                  Form Completion
                </span>

                <span className="text-[13px] font-[700] leading-[18px] text-[#2563EB]">
                  {progress}%
                </span>
              </div>

              <div className="relative h-[8px] w-full overflow-hidden rounded-full border border-[#E2E8F0] bg-[#E9EDF3] shadow-[inset_0_1px_2px_rgba(15,23,42,0.06),0_1px_0_rgba(255,255,255,0.7)]">
                <div
                  className="h-full rounded-full bg-[#2563EB] shadow-[0_1px_2px_rgba(37,99,235,0.28),inset_0_1px_0_rgba(255,255,255,0.18)] transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full rounded-[18px] border border-[#DEE4EC] bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.04)] sm:p-5 lg:p-6">
          <div className="mb-8 sm:hidden">
            <div className="relative pl-[52px]">
              <div className="absolute bottom-[18px] left-[18px] top-[18px] w-[8px] rounded-full border border-[#DADADA] bg-[#E7E7E7]" />

              <div className="flex flex-col gap-6">
                {STEPS.map((item) => {
                  const isActive = item.id <= step;

                  return (
                    <div
                      key={item.id}
                      className="relative flex min-h-[44px] items-center gap-4"
                    >
                      <div className="absolute -left-[52px] h-[38px] w-[38px] shrink-0 rounded-full border border-[#D5D5D5] bg-[#F8F8F8]">
                        <div
                          className={`absolute inset-[3px] flex items-center justify-center rounded-full border text-[14px] font-[700] text-white ${
                            isActive
                              ? "border-[#2563EB] bg-[#2563EB]"
                              : "border-[#C9C9C9] bg-[#D3D3D3]"
                          }`}
                        >
                          {item.id}
                        </div>
                      </div>

                      <div
                        className={`flex h-[32px] items-center justify-center whitespace-nowrap rounded-full border px-[16px] text-[13px] font-[600] ${
                          isActive
                            ? "border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB]"
                            : "border-[#DFDFDF] bg-[#EFEFEF] text-[#7A7A7A]"
                        }`}
                      >
                        {item.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mb-8 hidden w-full overflow-x-auto pb-1 sm:block">
            <div className="relative min-w-[560px] px-[18px] sm:px-[28px] lg:px-[42px]">
              <div className="absolute left-[74px] right-[74px] top-[15px] h-[8px] rounded-full border border-[#DADADA] bg-[#E7E7E7]" />

              <div className="relative flex items-start justify-between">
                {STEPS.map((item) => {
                  const isActive = item.id <= step;

                  return (
                    <div
                      key={item.id}
                      className="flex min-w-[128px] flex-col items-center"
                    >
                      <div className="relative h-[38px] w-[38px] rounded-full border border-[#D5D5D5] bg-[#F8F8F8]">
                        <div
                          className={`absolute inset-[3px] flex items-center justify-center rounded-full border text-[14px] font-[700] text-white ${
                            isActive
                              ? "border-[#2563EB] bg-[#2563EB]"
                              : "border-[#C9C9C9] bg-[#D3D3D3]"
                          }`}
                        >
                          {item.id}
                        </div>
                      </div>

                      <div className="mt-[5px] h-0 w-0 border-b-[7px] border-l-[5px] border-r-[5px] border-b-[#D9D9D9] border-l-transparent border-r-transparent" />

                      <div
                        className={`mt-[6px] flex h-[32px] items-center justify-center whitespace-nowrap rounded-full border px-[16px] text-[13px] font-[600] ${
                          isActive
                            ? "border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB]"
                            : "border-[#DFDFDF] bg-[#EFEFEF] text-[#7A7A7A]"
                        }`}
                      >
                        {item.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {step === 1 && (
            <ClientForm
              clientData={clientData}
              onFieldChange={handleClientFieldChange}
              onSubmit={handleCreateClient}
              onReset={handleClientReset}
              loading={clientLoading}
              apiError={clientApiError}
            />
          )}

          {step === 2 && (
            <RequirementsStep
              products={products}
              setProducts={setProducts}
              total={total}
              onCreateQuotation={handleCreateQuotation}
              back={() => setStep(1)}
              loading={quotationLoading}
              apiError={quotationApiError}
            />
          )}
        </div>

        <div className="mt-4 rounded-[12px] border border-[#B9D3FF] bg-[#EEF5FF] px-4 py-[14px] text-[13px] leading-[18px] text-[#1D4ED8]">
          <span className="font-[700]">💡 Tip:</span>{" "}
          <span className="font-[400]">
            Make sure all required fields are filled correctly. You'll be able
            to add product requirements in the next step.
          </span>
        </div>
      </div>
    </div>
  );
}