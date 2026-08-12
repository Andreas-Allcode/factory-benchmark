import React from 'react';
import { getDashboardData } from '../queries/benchmarkDashboard';

const BenchmarkDashboard: React.FC = () => {
  const data = getDashboardData();

  return (
    <div>
      {data.metrics.map((metric) => (
        <div key={metric.name}>
          <span>{metric.name}</span>: <span>{metric.value}</span>
        </div>
      ))}
    </div>
  );
};

export default BenchmarkDashboard;
