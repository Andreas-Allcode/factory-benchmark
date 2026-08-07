export interface BenchmarkResult {
  value: number;
  message: string;
}

export function getBenchmarkValue(): BenchmarkResult {
  return {
    value: 42,
    message: "benchmark",
  };
}
