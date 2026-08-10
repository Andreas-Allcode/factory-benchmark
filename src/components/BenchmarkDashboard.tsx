import React from 'react';
import { getDashboardData } from '../queries/benchmarkDashboard';

const BenchmarkDashboard: React.FC = () => {
  const data = getDashboardData();
  const { metrics } = data;

  return (
    <div className="benchmark-dashboard">
      {metrics.map((metric) => (
        <div key={metric.name} className="benchmark-dashboard__metric">
          <span className="benchmark-dashboard__metric-name">{metric.name}</span>
          <span className="benchmark-dashboard__metric-value">{metric.value}</span>
        </div>
      ))}
    </div>
  );
};

export default BenchmarkDashboard;
