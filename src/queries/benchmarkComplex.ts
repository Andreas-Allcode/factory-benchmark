export interface AnalyzeDataResult {
  sum: number;
  avg: number;
  max: number;
  min: number;
  trend: 'up' | 'down' | 'flat';
  count: number;
}

/**
 * Analyzes a list of numbers and returns aggregate statistics along with
 * a simple trend indicator based on comparing the first and last items.
 */
export function analyzeData(items: number[]): AnalyzeDataResult {
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
    if (item > max) max = item;
    if (item < min) min = item;
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
