export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  isNetworkError?: boolean;

  constructor(
    message: string,
    options?: {
      status?: number;
      code?: string;
      details?: unknown;
      isNetworkError?: boolean;
    }
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options?.status ?? 0;
    this.code = options?.code;
    this.details = options?.details;
    this.isNetworkError = options?.isNetworkError ?? false;
  }
}

export function getStoredToken() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("ims_token") ||
    localStorage.getItem("imsToken") ||
    localStorage.getItem("jwt") ||
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1] ||
    ""
  );
}

export function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

export async function safeJsonParse(res: Response) {
  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }

  try {
    return await res.text();
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  input: string,
  init: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();

  try {
    const res = await fetch(input, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers || {}),
      },
      cache: "no-store",
    });

    const payload = await safeJsonParse(res);

    if (!res.ok) {
      const serverMessage =
        typeof payload === "object" && payload !== null
          ? (payload as any).message ||
            (payload as any).error ||
            (payload as any).details
          : typeof payload === "string"
          ? payload
          : "";

      let message = serverMessage || `Request failed with status ${res.status}`;

      if (res.status === 401) {
        message = serverMessage || "Session expired. Please login again.";
      } else if (res.status === 403) {
        message = serverMessage || "You do not have permission to access this.";
      } else if (res.status === 404) {
        message = serverMessage || "Requested endpoint was not found.";
      } else if (res.status >= 500) {
        message = serverMessage || "Server error. Please try again later.";
      }

      throw new ApiError(message, {
        status: res.status,
        details: payload,
      });
    }

    return payload as T;
  } catch (error: any) {
    if (error instanceof ApiError) throw error;

    throw new ApiError(
      error?.message || "Network error. Please check your connection.",
      {
        isNetworkError: true,
      }
    );
  }
}