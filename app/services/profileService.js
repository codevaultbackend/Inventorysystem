const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.REACT_APP_API_URL ||
  "";

function getToken() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1] ||
    ""
  );
}

async function apiRequest(url, options = {}) {
  const token = getToken();

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Something went wrong");
  }

  return data;
}

export async function getProfileApi() {
  return apiRequest("/profile/get-profile", {
    method: "GET",
  });
}

export async function setProfileApi(payload) {
  const token = getToken();

  const res = await fetch(`${API_BASE}/profile/set-profile`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: payload,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Failed to set profile");
  }

  return data;
}

export async function updateProfileApi(payload) {
  const token = getToken();

  const res = await fetch(`${API_BASE}/profile/update-profile`, {
    method: "PUT",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: payload,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Failed to update profile");
  }

  return data;
}