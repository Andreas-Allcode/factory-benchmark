import React from "react";
import { getDashboardData } from "../queries/benchmarkDashboard";

const BenchmarkDashboard: React.FC = () => {
  const data = getDashboardData();

  return (
    <div className="benchmark-dashboard">
      {data.metrics.map((metric) => (
        <div key={metric.name} className="benchmark-metric">
          <span className="metric-name">{metric.name}</span>
          <span className="metric-value">{metric.value}</span>
        </div>
      ))}
    </div>
  );
};

export default BenchmarkDashboard;
