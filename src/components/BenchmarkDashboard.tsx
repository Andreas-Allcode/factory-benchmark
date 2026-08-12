import React from "react";
import { getDashboardData, DashboardMetric } from "../queries/benchmarkDashboard";

const BenchmarkDashboard: React.FC = () => {
  const data = getDashboardData();

  return (
    <div className="benchmark-dashboard">
      {data.metrics.map((metric: DashboardMetric) => (
        <div key={metric.name} className="benchmark-metric">
          <span className="benchmark-metric-name">{metric.name}</span>
          <span className="benchmark-metric-value">{metric.value}</span>
        </div>
      ))}
    </div>
  );
};

export default BenchmarkDashboard;
