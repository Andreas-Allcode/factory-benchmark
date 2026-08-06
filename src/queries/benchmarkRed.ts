export interface RedMetric {
  color: "red";
  score: number;
}

export function getRedMetric(): RedMetric {
  return { color: "red", score: 10 };
}
