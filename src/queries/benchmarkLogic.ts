export type Level = 'low' | 'medium' | 'high';

export interface ScoreResult {
  score: number;
  level: Level;
}

export function computeScore(points: number, multiplier: number): ScoreResult {
  const score = points * multiplier;

  let level: Level;
  if (score < 50) {
    level = 'low';
  } else if (score < 100) {
    level = 'medium';
  } else {
    level = 'high';
  }

  return { score, level };
}
