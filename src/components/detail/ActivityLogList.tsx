import { useState, type FormEvent } from 'react';
import type { Application } from '../../types/index.js';

interface ActivityLogListProps {
  application: Application;
  onUpdate: (updater: (app: Application) => Application) => void;
}

function formatDate(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return 'Waktu tidak valid';

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default function ActivityLogList({
  application,
  onUpdate,
}: ActivityLogListProps) {
  const [note, setNote] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = note.trim();
    if (!value) return;

    onUpdate((current) => ({
      ...current,
      activityLogs: [
        ...current.activityLogs,
        {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          message: value,
        },
      ],
    }));

    setNote('');
  }

  const newestFirst = [...application.activityLogs].reverse();

  return (
    <div className="activity-log">
      <form className="activity-log-form" onSubmit={handleSubmit}>
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Catatan manual..."
          aria-label="Catatan manual baru"
        />
        <button type="submit">Tambah Log</button>
      </form>

      <ul className="activity-log-items">
        {newestFirst.map((log) => (
          <li key={log.id}>
            <time>{formatDate(log.timestamp)}</time>
            <p>{log.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
