export function getAlpha(): { alpha: boolean; timestamp: number } {
  return { alpha: true, timestamp: Date.now() };
}
