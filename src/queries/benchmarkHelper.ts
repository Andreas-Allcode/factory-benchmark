export function formatScore(score: number): string {
  return score >= 1000 ? `${(score / 1000).toFixed(1)}k` : `${score}`;
}
