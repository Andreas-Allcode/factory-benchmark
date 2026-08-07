export interface DashboardMetric {
  name: string;
  value: number;
}

export interface DashboardData {
  metrics: DashboardMetric[];
  lastUpdated: string;
}

export function getDashboardData(): DashboardData {
  return {
    metrics: [
      { name: "Users", value: 1250 },
      { name: "Revenue", value: 45000 },
      { name: "Growth", value: 12.5 },
    ],
    lastUpdated: new Date().toISOString(),
  };
}
