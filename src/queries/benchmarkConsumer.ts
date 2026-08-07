import { formatScore } from './benchmarkHelper';

export function getFormattedStats(scores: number[]): string[] {
  return scores.map(s => formatScore(s));
}
