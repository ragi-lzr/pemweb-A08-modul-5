import type { Application, WorkMode } from '../types/index.js';
import { calcSkillMatch } from './skillMatch.js';

export const WORK_MODE_SCORE: Record<WorkMode, number> = {
  Remote: 100,
  Hybrid: 75,
  Onsite: 50,
};

export interface OfferScoreResult {
  salary: number;
  mode: number;
  skill: number;
  total: number;
}

export function calcOfferScore(
  app: Application,
  maxSalary: number,
  matchScore: number
): OfferScoreResult {
  const salary =
    maxSalary > 0
      ? (Math.min(app.salaryOffer ?? 0, maxSalary) / maxSalary) * 50
      : 0;

  const mode = WORK_MODE_SCORE[app.workMode] * 0.25;
  const skill = matchScore * 0.25;

  return {
    salary,
    mode,
    skill,
    total: salary + mode + skill,
  };
}

export function getMatchScore(
  app: Application,
  kaptenSkills: string[]
): number {
  return calcSkillMatch(kaptenSkills, app.requiredSkills).score;
}
