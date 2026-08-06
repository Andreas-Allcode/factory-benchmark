export interface BenchmarkBetaResult {
  beta: boolean;
  version: number;
}

export function getBeta(): BenchmarkBetaResult {
  return { beta: true, version: 1 };
}
