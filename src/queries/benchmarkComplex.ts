export interface AnalyzeDataResult {
  sum: number;
  avg: number;
  max: number;
  min: number;
  trend: 'up' | 'down' | 'flat';
  count: number;
}

export function analyzeData(items: number[]): AnalyzeDataResult {
  const count = items.length;

  if (count === 0) {
    return {
      sum: 0,
      avg: 0,
      max: NaN,
      min: NaN,
      trend: 'flat',
      count: 0,
    };
  }

  const sum = items.reduce((acc, item) => acc + item, 0);
  const avg = sum / count;
  const max = Math.max(...items);
  const min = Math.min(...items);

  const first = items[0];
  const last = items[count - 1];

  let trend: 'up' | 'down' | 'flat';
  if (last > first) {
    trend = 'up';
  } else if (last < first) {
    trend = 'down';
  } else {
    trend = 'flat';
  }

  return { sum, avg, max, min, trend, count };
}
