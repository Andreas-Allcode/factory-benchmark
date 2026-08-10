export interface StressAResult {
  id: string;
  ok: boolean;
}

export function getStressA(): StressAResult {
  return { id: "a", ok: true };
}
