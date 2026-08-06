export interface AnalyzeDataResult {
  sum: number;
  avg: number;
  max: number | null;
  min: number | null;
  trend: 'up' | 'down' | 'flat';
  count: number;
}

/**
 * Analyzes an array of numbers and returns aggregate statistics.
 *
 * @param items - Array of numbers to analyze.
 * @returns An object containing sum, avg, max, min, trend, and count.
 */
export function analyzeData(items: number[]): AnalyzeDataResult {
  const count = items.length;

  if (count === 0) {
    return {
      sum: 0,
      avg: 0,
      max: null,
      min: null,
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
  let trend: 'up' | 'down' | 'flat' = 'flat';
  if (last > first) {
    trend = 'up';
  } else if (last < first) {
    trend = 'down';
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
