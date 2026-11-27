export interface SkillMatchResult {
  score: number;
  matched: string[];
  missing: string[];
}

export function calcSkillMatch(
  kaptenSkills: string[],
  required: string[]
): SkillMatchResult {
  if (required.length === 0) {
    return { score: 0, matched: [], missing: [] };
  }

  const userSkills = new Set(
    kaptenSkills.map((skill) => skill.trim().toLowerCase()).filter(Boolean)
  );

  const matched: string[] = [];
  const missing: string[] = [];

  for (const skill of required) {
    const normalized = skill.trim();
    const key = normalized.toLowerCase();

    if (userSkills.has(key)) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  }

  const score = Math.round((matched.length / required.length) * 100);

  return { score, matched, missing };
}
