export interface UserStats {
  userId: string;
  score: number;
  level: "bronze" | "silver" | "gold" | "platinum";
  joinedDaysAgo: number;
}

function getLevel(score: number): UserStats["level"] {
  if (score < 100) {
    return "bronze";
  } else if (score < 500) {
    return "silver";
  } else if (score < 1000) {
    return "gold";
  } else {
    return "platinum";
  }
}

export function classifyUser(
  userId: string,
  score: number,
  joinedDaysAgo: number
): UserStats {
  return {
    userId,
    score,
    level: getLevel(score),
    joinedDaysAgo,
  };
}
