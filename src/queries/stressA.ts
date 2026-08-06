export interface StressA {
  id: string;
  ok: boolean;
}

export function getStressA(): StressA {
  return { id: "a", ok: true };
}
