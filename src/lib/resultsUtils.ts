/**
 * Pure utility functions for academic result calculations.
 * These are framework-agnostic and safe to import in both client and server components.
 */

/**
 * Returns a letter grade for a given numeric score (0–100).
 */
export function calculateGrade(score: number): string {
  if (score >= 70) return "A";
  if (score >= 60) return "B";
  if (score >= 50) return "C";
  if (score >= 40) return "D";
  return "F";
}

/**
 * Returns human-readable remarks for a given grade letter.
 */
export function calculateRemarks(grade: string): string {
  const map: Record<string, string> = {
    A: "Excellent",
    B: "Very Good",
    C: "Good",
    D: "Pass",
    F: "Fail",
  };
  return map[grade] ?? "—";
}

/**
 * Converts a number to its ordinal string (1st, 2nd, 3rd, etc.).
 */
export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
