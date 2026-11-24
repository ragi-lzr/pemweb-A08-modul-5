
import type { Application } from '../types/index.js';

const CONFLICT_WINDOW_MS = 60 * 60 * 1000;

export function findInterviewConflicts(
  apps: Application[]
): Array<[Application, Application]> {
  const interviews = apps.filter(
    (app): app is Application & { interviewDateTime: string } =>
      app.status === 'INTERVIEW' &&
      typeof app.interviewDateTime === 'string' &&
      app.interviewDateTime.trim() !== ''
  );

  const conflicts: Array<[Application, Application]> = [];

  for (let i = 0; i < interviews.length; i++) {
    const first = interviews[i];

    if (!first) {
      continue;
    }

    const firstTime = new Date(first.interviewDateTime).getTime();

    if (Number.isNaN(firstTime)) {
      continue;
    }

    for (let j = i + 1; j < interviews.length; j++) {
      const second = interviews[j];

      if (!second) {
        continue;
      }

      const secondTime = new Date(second.interviewDateTime).getTime();

      if (Number.isNaN(secondTime)) {
        continue;
      }

      const difference = Math.abs(firstTime - secondTime);

      if (difference < CONFLICT_WINDOW_MS) {
        conflicts.push([first, second]);
      }
    }
  }

  return conflicts;
}
