export interface RedMetric {
  color: string;
  score: number;
}

export function getRedMetric(): RedMetric {
  return { color: "red", score: 10 };
}
