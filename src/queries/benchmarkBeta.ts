export interface BenchmarkBeta {
  beta: boolean;
  version: number;
}

export function getBeta(): BenchmarkBeta {
  return { beta: true, version: 1 };
}
