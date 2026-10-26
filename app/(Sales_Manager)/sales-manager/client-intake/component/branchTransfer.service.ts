const BaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export const searchBranches = async (
  query: string,
  token: string
) => {
  const res = await fetch(
    `${BaseUrl}/sales/search-Branche?q=${encodeURIComponent(query)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch branches");
  }

  return res.json();
};

export const createBranchTransfer = async (
  payload: {
    to_branch_id: number;
    remark: string;
  },
  token: string
) => {
  const res = await fetch(
    `${BaseUrl}/sales/branch-transfer`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Transfer failed");
  }

  return res.json();
};
