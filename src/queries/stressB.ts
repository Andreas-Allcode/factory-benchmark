export interface StressBResult {
  id: string;
  ok: boolean;
}

export function getStressB(): StressBResult {
  return {
    id: "b",
    ok: true,
  };
}
