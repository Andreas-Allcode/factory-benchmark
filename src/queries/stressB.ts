export interface StressB {
  id: string;
  ok: boolean;
}

export function getStressB(): StressB {
  return { id: "b", ok: true };
}
