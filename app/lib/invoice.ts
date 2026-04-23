export type InvoicePdfResponse = {
  success: boolean;
  message?: string;
  invoice_no?: string;
  download_url?: string;
  error?: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "";

function getAuthToken() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    ""
  );
}

/**
 * Transaction ID is invoiceId
 * Endpoint: /sales/invoice/id/:invoiceId
 */
export async function getInvoicePdf(
  invoiceId: string
): Promise<InvoicePdfResponse> {
  if (!invoiceId?.trim()) {
    throw new Error("invoiceId is required");
  }

  const token = getAuthToken();

  const response = await fetch(
    `${API_BASE}/sales/invoice/${encodeURIComponent(invoiceId)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    }
  );

  let data: InvoicePdfResponse;

  try {
    data = await response.json();
  } catch {
    throw new Error("Invalid server response");
  }

  if (!response.ok || !data?.success) {
    throw new Error(
      data?.error || data?.message || "Failed to fetch invoice PDF"
    );
  }

  if (!data.download_url) {
    throw new Error("Download URL not found");
  }

  return data;
}

export async function openInvoicePdf(invoiceId: string) {
  const data = await getInvoicePdf(invoiceId);
  window.open(data.download_url!, "_blank", "noopener,noreferrer");
}

export async function downloadInvoicePdf(invoiceId: string) {
  const data = await getInvoicePdf(invoiceId);

  const link = document.createElement("a");
  link.href = data.download_url!;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.download = `${invoiceId}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}