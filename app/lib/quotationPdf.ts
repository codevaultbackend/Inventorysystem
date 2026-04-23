"use client";

type GetQuotationPdfOptions = {
  type?: "view" | "download";
};

function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    ""
  ).replace(/\/+$/, "");
}

function getStoredToken() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("ims_token") ||
    localStorage.getItem("imsToken") ||
    localStorage.getItem("jwt") ||
    ""
  );
}

export async function getQuotationPdfUrl(
  quotationId: string | number,
  options: GetQuotationPdfOptions = {}
) {
  const type = options.type || "view";
  const baseUrl = getApiBaseUrl();
  const token = getStoredToken();

  const url = `${baseUrl}/sales/quotation/${quotationId}/pdf?type=${type}`;

  return {
    url,
    token,
  };
}

export async function fetchQuotationPdfBlob(
  quotationId: string | number,
  options: GetQuotationPdfOptions = {}
) {
  const { url, token } = await getQuotationPdfUrl(quotationId, options);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  });

  if (!response.ok) {
    let message = "Failed to fetch quotation PDF";

    try {
      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const json = await response.json();
        message = json?.error || json?.message || message;
      } else {
        const text = await response.text();
        if (text) message = text;
      }
    } catch {
      // ignore parsing failure
    }

    throw new Error(message);
  }

  const blob = await response.blob();

  if (blob.type !== "application/pdf") {
    throw new Error("Invalid PDF response");
  }

  return blob;
}