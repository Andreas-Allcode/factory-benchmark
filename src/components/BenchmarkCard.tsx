import React from 'react';

export interface BenchmarkCardProps {
  title: string;
  value: number;
}

const BenchmarkCard: React.FC<BenchmarkCardProps> = ({ title, value }) => {
  return (
    <div>
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  );
};

export default BenchmarkCard;
