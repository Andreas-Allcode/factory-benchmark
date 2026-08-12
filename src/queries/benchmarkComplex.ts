export type Trend = 'up' | 'down' | 'flat';

export interface AnalysisResult {
  sum: number;
  avg: number;
  max: number;
  min: number;
  trend: Trend;
  count: number;
}

/**
 * Analyzes an array of numbers and returns aggregate statistics.
 *
 * @param items - The array of numbers to analyze.
 * @returns An object containing the sum, average, max, min, trend, and count.
 */
export function analyzeData(items: number[]): AnalysisResult {
  const count = items.length;

  if (count === 0) {
    return {
      sum: 0,
      avg: 0,
      max: 0,
      min: 0,
      trend: 'flat',
      count: 0,
    };
  }

  let sum = 0;
  let max = items[0];
  let min = items[0];

  for (const item of items) {
    sum += item;
    if (item > max) {
      max = item;
    }
    if (item < min) {
      min = item;
    }
  }

  const avg = sum / count;

  const first = items[0];
  const last = items[count - 1];

  let trend: Trend;
  if (last > first) {
    trend = 'up';
  } else if (last < first) {
    trend = 'down';
  } else {
    trend = 'flat';
  }

  return {
    sum,
    avg,
    max,
    min,
    trend,
    count,
  };
}
