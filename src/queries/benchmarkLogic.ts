export function computeScore(
  points: number,
  multiplier: number
): { score: number; level: string } {
  const score = points * multiplier;

  let level: string;
  if (score < 50) {
    level = 'low';
  } else if (score < 100) {
    level = 'medium';
  } else {
    level = 'high';
  }

  return { score, level };
}
