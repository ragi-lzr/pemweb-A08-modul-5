import { useMemo } from 'react';
import type { Application } from '../../types/index.js';
import { findInterviewConflicts } from '../../utils/conflict.js';

interface ConflictBannerProps {
  applications: Application[];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Jadwal tidak valid';

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default function ConflictBanner({ applications }: ConflictBannerProps) {
  const conflicts = useMemo(
    () => findInterviewConflicts(applications),
    [applications]
  );

  if (conflicts.length === 0) return null;

  return (
    <aside className="conflict-banner" role="alert" aria-live="polite">
      <strong>⚠ Bentrok jadwal interview</strong>
      {conflicts.map(([first, second]) => (
        <p key={`${first.id}-${second.id}`}>
          <b>{first.company}</b> ({formatDate(first.interviewDateTime!)})
          {' dan '}
          <b>{second.company}</b> ({formatDate(second.interviewDateTime!)})
        </p>
      ))}
    </aside>
  );
}
