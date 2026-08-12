export type ScoreLevel = 'low' | 'medium' | 'high';

export interface ScoreResult {
  score: number;
  level: ScoreLevel;
}

export function computeScore(points: number, multiplier: number): ScoreResult {
  const score = points * multiplier;

  let level: ScoreLevel;
  if (score < 50) {
    level = 'low';
  } else if (score < 100) {
    level = 'medium';
  } else {
    level = 'high';
  }

  return { score, level };
}
