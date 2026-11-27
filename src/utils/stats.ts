import type { Application } from '../types/index.js';
import { isRawanGhosting } from './ghosting.js';

export interface StatsSnapshot {
  total: number;
  sent: number;
  responseRate: {
    percentage: number;
    responded: number;
    sent: number;
  };
  interviewRate: {
    percentage: number;
    interviews: number;
    sent: number;
  };
  ghosting: number;
  offers: number;
}

const RESPONSE_STATUSES = new Set([
  'SCREENING',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
]);

function percent(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

export function calcStats(
  applications: Application[],
  now: Date = new Date()
): StatsSnapshot {
  const sent = applications.filter((app) => app.status !== 'WISHLIST');
  const responded = sent.filter((app) => RESPONSE_STATUSES.has(app.status));
  const interviews = sent.filter(
    (app) => app.status === 'INTERVIEW' || app.status === 'OFFER'
  );
  const ghosting = applications.filter((app) => isRawanGhosting(app, now));
  const offers = applications.filter((app) => app.status === 'OFFER');

  return {
    total: applications.length,
    sent: sent.length,
    responseRate: {
      percentage: percent(responded.length, sent.length),
      responded: responded.length,
      sent: sent.length,
    },
    interviewRate: {
      percentage: percent(interviews.length, sent.length),
      interviews: interviews.length,
      sent: sent.length,
    },
    ghosting: ghosting.length,
    offers: offers.length,
  };
}
