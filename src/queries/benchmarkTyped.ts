export interface UserStats {
  userId: string;
  score: number;
  level: "bronze" | "silver" | "gold" | "platinum";
  joinedDaysAgo: number;
}

export function classifyUser(
  userId: string,
  score: number,
  joinedDaysAgo: number
): UserStats {
  let level: UserStats["level"];

  if (score < 100) {
    level = "bronze";
  } else if (score < 500) {
    level = "silver";
  } else if (score < 1000) {
    level = "gold";
  } else {
    level = "platinum";
  }

  return {
    userId,
    score,
    level,
    joinedDaysAgo,
  };
}
