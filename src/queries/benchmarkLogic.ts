export function computeScore(points: number, multiplier: number) {
  return {
    score: points * multiplier,
    level:
      points * multiplier < 50
        ? "low"
        : points * multiplier < 100
        ? "medium"
        : "high",
  };
}
