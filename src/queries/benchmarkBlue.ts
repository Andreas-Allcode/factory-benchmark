export interface BlueMetric {
  color: string;
  score: number;
}

export function getBlueMetric(): BlueMetric {
  return { color: "blue", score: 30 };
}
