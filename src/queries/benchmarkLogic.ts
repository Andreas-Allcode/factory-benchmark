export interface ScoreResult {
  score: number;
  level: string;
}

export function computeScore(points: number, multiplier: number): ScoreResult {
  const score = points * multiplier;
  const level =
    points * multiplier < 50
      ? 'low'
      : points * multiplier < 100
      ? 'medium'
      : 'high';

  return { score, level };
}
