
import type { Application } from '../types/index.js';

export const GHOSTING_DAYS = 14;

const GHOSTING_MS = GHOSTING_DAYS * 24 * 60 * 60 * 1000;

export function isRawanGhosting(
  app: Application,
  now: Date = new Date()
): boolean {
  const eligibleStatus =
    app.status === 'APPLIED' || app.status === 'SCREENING';

  if (!eligibleStatus) {
    return false;
  }

  const lastUpdated = new Date(app.lastUpdatedAt).getTime();

  if (Number.isNaN(lastUpdated)) {
    return false;
  }

  return now.getTime() - lastUpdated > GHOSTING_MS;
}
