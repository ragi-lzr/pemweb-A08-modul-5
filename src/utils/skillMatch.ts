export interface SkillMatchResult {
  score: number;
  matched: string[];
  missing: string[];
}

const normalize = (skill: string) => skill.trim().toLowerCase();

/**
 * Hitung Match % = Math.round(cocok / total * 100), case-insensitive.
 * Contoh: [React, TypeScript, CSS] vs [React, TypeScript, CSS, Docker] → 75, missing ['Docker'].
 */
export function calcSkillMatch(kaptenSkills: string[], required: string[]): SkillMatchResult {
  const requiredClean = required.map((skill) => skill.trim()).filter(Boolean);
  if (requiredClean.length === 0) return { score: 0, matched: [], missing: [] };

  const owned = new Set(kaptenSkills.map(normalize));
  const matched = requiredClean.filter((skill) => owned.has(normalize(skill)));
  const missing = requiredClean.filter((skill) => !owned.has(normalize(skill)));

  return {
    score: Math.round((matched.length / requiredClean.length) * 100),
    matched,
    missing,
  };
}

export type MatchLevel = 'high' | 'medium' | 'low';

/** Warna badge: ≥70 hijau (high), 40–69 kuning (medium), <40 merah (low). */
export function matchLevel(score: number): MatchLevel {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}
