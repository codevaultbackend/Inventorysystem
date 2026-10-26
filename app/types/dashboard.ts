export type Stats = {
  totalUsers: number;
  totalStock: number;
  totalBranches: number;
  totalStockValue: number;
};

export type Branch = {
  id: number;
  name: string;
  stock_items: string;
  stock_value: number;
};

export type DashboardData = {
  stats: Stats;
  branchOverview: Branch[];
};

export type DashboardProps = {
  data: DashboardData | null;
  loading: boolean;
};
