export interface DrainFinalResult {
  final: boolean;
}

export function getDrainFinal(): DrainFinalResult {
  return { final: true };
}
