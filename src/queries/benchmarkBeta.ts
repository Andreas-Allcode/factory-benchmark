export interface BetaResult {
  beta: boolean;
  version: number;
}

export function getBeta(): BetaResult {
  return {
    beta: true,
    version: 1,
  };
}
