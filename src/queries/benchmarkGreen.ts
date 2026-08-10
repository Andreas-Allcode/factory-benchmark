export interface GreenMetric {
  color: string;
  score: number;
}

export function getGreenMetric(): GreenMetric {
  return { color: "green", score: 20 };
}
