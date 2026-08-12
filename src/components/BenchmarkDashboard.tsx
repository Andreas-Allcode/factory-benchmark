import React from 'react';
import { getDashboardData } from '../queries/benchmarkDashboard';

const BenchmarkDashboard: React.FC = () => {
  const data = getDashboardData();

  return (
    <div className="benchmark-dashboard">
      <h1>Benchmark Dashboard</h1>
      <p>Last updated: {data.lastUpdated}</p>
      <div className="metrics">
        {data.metrics.map((metric) => (
          <div key={metric.name} className="metric">
            <span className="metric-name">{metric.name}</span>
            <span className="metric-value">{metric.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BenchmarkDashboard;
