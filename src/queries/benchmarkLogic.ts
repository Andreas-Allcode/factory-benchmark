export function computeScore(points: number, multiplier: number): { score: number; level: string } {
  const score = points * multiplier;
  const level = score < 50 ? "low" : score < 100 ? "medium" : "high";
  return { score, level };
}
