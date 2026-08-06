interface BenchmarkValue {
  value: number;
  message: string;
}

export function getBenchmarkValue(): BenchmarkValue {
  return { value: 42, message: "benchmark" };
}
