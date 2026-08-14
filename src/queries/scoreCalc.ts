/**
 * Score calculation utilities
 */

export function calculateScore(correct: number, total: number): { score: number, grade: string } {
  // Calculate score as percentage
  const score = (correct / total) * 100;
  const grade = getLetterGrade(score);
  return { score, grade };
}

export function getLetterGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export function calculateAverage(scores: number[]): number {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((acc, score) => acc + score, 0);
  return sum / scores.length;
}

export function isPassing(score: number): boolean {
  return score >= 60;
}
