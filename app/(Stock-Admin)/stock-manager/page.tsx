"use client";

import { useSuperStockAdmin } from "@/app/context/SuperStockAdminContext";

export default function StockManagerPage() {
  const { data, loading, error, refresh } = useSuperStockAdmin();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Super Stock Manager Dashboard</h1>

      <p>Total Items: {data?.totalStockItems}</p>
      <p>Total Value: ₹{data?.totalStockValue}</p>

      <button onClick={refresh}>Refresh</button>
    </div>
  );
}