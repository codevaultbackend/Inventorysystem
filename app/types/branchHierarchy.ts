export type StateRow = {
  state: string;
  totalBranches: number;
  totalCities: number;
  totalStock: number;
  totalSales: number;
};

export type CityRow = {
  city: string;
  state: string;
  totalBranches: number;
  totalStock: number;
  totalSales: number;
};

export type BranchRow = {
  id: string;
  name: string;
  city: string;
  state: string;
  stock: number;
  purchase: number;
  sales: number;
  in: number;
  out: number;
};

export type BranchStats = {
  totalStock: number;
  totalStockValue: number;
  totalSales: number;
  agingItems: number;
};

export type StockStatus = {
  good: number;
  damaged: number;
  repairable: number;
};

export type BranchSummary = {
  totalBranches: number;
  activeBranches: number;
  inactiveBranches: number;
};

export type SalesTrendPoint = {
  week: string;
  purchase: number;
  sales: number;
};

export type StockTrendPoint = {
  week: string;
  in: number;
  out: number;
};

export type BranchItemRow = {
  id: string;
  itemName: string;
  sku?: string;
  category?: string;
  quantity: number;
  stockIn: number;
  stockOut: number;
  sales: number;
  status?: string;
};

export type BranchDetailsResponse = {
  branch: {
    id: string;
    name: string;
    city: string;
    state: string;
  };
  stats: BranchStats;
  stockStatus: StockStatus;
  branchSummary: BranchSummary;
  salesTrend: SalesTrendPoint[];
  stockTrend: StockTrendPoint[];
  items: BranchItemRow[];
};

export type ItemAnalysisResponse = {
  item: {
    id: string;
    itemName: string;
    branchId: string;
    branchName: string;
    city: string;
    state: string;
  };
  stats: BranchStats;
  salesTrend: SalesTrendPoint[];
  stockTrend: StockTrendPoint[];
  agingAnalysis: Array<{
    bucket: string;
    quantity: number;
    value: number;
  }>;
};