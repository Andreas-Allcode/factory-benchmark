export interface DrainStatus {
  drained: boolean;
  timestamp: number;
}

export function getDrainStatus(): DrainStatus {
  return {
    drained: true,
    timestamp: Date.now(),
  };
}
