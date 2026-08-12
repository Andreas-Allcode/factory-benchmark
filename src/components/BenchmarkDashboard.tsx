import React from "react";
import {
  getDashboardData,
  DashboardData,
  DashboardMetric,
} from "../queries/benchmarkDashboard";

const BenchmarkDashboard: React.FC = () => {
  const data: DashboardData = getDashboardData();

  return (
    <div className="benchmark-dashboard">
      <h2>Benchmark Dashboard</h2>
      <div className="benchmark-dashboard__metrics">
        {data.metrics.map((metric: DashboardMetric) => (
          <div key={metric.name} className="benchmark-dashboard__metric">
            <span className="benchmark-dashboard__metric-name">
              {metric.name}
            </span>
            <span className="benchmark-dashboard__metric-value">
              {metric.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BenchmarkDashboard;
