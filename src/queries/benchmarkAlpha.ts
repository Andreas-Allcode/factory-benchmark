export interface AlphaResult {
  alpha: boolean;
  timestamp: number;
}

export function getAlpha(): AlphaResult {
  return {
    alpha: true,
    timestamp: Date.now(),
  };
}
