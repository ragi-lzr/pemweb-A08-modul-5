import './dashboard.css';
import { useMemo } from 'react';
import type { Application } from '../../types/index.js';
import { calcStats } from '../../utils/stats.js';

interface StatsCardsProps {
  applications: Application[];
}

export default function StatsCards({ applications }: StatsCardsProps) {
  const stats = useMemo(() => calcStats(applications), [applications]);

  const cards = [
    {
      label: 'Total Lamaran',
      value: String(stats.total),
      sub: `${stats.sent} sudah dikirim`,
    },
    {
      label: 'Response Rate',
      value: `${stats.responseRate.percentage}%`,
      sub: `${stats.responseRate.responded} dari ${stats.responseRate.sent} diproses`,
    },
    {
      label: 'Interview Rate',
      value: `${stats.interviewRate.percentage}%`,
      sub: `${stats.interviewRate.interviews} dari ${stats.interviewRate.sent} interview/offer`,
    },
    {
      label: 'Rawan Ghosting',
      value: String(stats.ghosting),
      sub: 'tidak berubah > 14 hari',
    },
    {
      label: 'Total Offer',
      value: String(stats.offers),
      sub: stats.offers === 1 ? '1 lamaran' : `${stats.offers} lamaran`,
    },
  ];

  return (
    <section className="stats-cards" aria-label="Statistik lamaran">
      {cards.map((card) => (
        <article className="stats-card" key={card.label}>
          <span className="stats-card-label">{card.label}</span>
          <strong className="stats-card-value">{card.value}</strong>
          <small className="stats-card-sub">{card.sub}</small>
        </article>
      ))}
    </section>
  );
}
