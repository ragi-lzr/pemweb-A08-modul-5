import { useState } from 'react';
import type { JobListing, NewApplicationInput } from '../../types/index.js';
import type { AddResult } from '../../hooks/useApplications.js';
import type { SkillMatchResult } from '../../utils/skillMatch.js';
import { detectWorkMode } from '../../services/jobService.js';
import MatchBadge from './MatchBadge.js';

interface JobCardProps {
  job: JobListing;
  match: SkillMatchResult;
  alreadyApplied: boolean;
  onSave: (input: NewApplicationInput) => AddResult;
}

export default function JobCard({ job, match, alreadyApplied, onSave }: JobCardProps) {
  const [error, setError] = useState('');

  function handleSave() {
    const result = onSave({
      company: job.company_name,
      role: job.title,
      workMode: detectWorkMode(job.candidate_required_location),
      status: 'WISHLIST',
      requiredSkills: job.tags,
      jobId: job.id,
    });
    setError(result.ok ? '' : result.error === 'DUPLICATE' ? 'Sudah ada di daftar lamaran.' : 'Data lowongan tidak lengkap.');
  }

  return (
    <article className="job-card">
      <div className="job-card-top">
        <div>
          <h3>{job.title}</h3>
          <p className="job-company">{job.company_name}</p>
        </div>
        <MatchBadge score={match.score} />
      </div>

      <p className="job-meta">
        <span>{job.category}</span>
        <span>{job.candidate_required_location || 'Lokasi tidak disebut'}</span>
        {job.salary && <span>{job.salary}</span>}
      </p>

      <ul className="job-skill-list">
        {match.matched.map((skill) => (
          <li key={`m-${skill}`} className="job-skill matched">✓ {skill}</li>
        ))}
        {match.missing.map((skill) => (
          <li key={`x-${skill}`} className="job-skill missing">{skill}</li>
        ))}
        {job.tags.length === 0 && <li className="job-skill none">Tidak ada skill tercantum</li>}
      </ul>

      <div className="job-card-actions">
        {job.url && (
          <a href={job.url} target="_blank" rel="noreferrer">Lihat lowongan</a>
        )}
        <button type="button" className="primary-action" onClick={handleSave} disabled={alreadyApplied}>
          {alreadyApplied ? 'Sudah Dilamar' : 'Simpan ke Wishlist'}
        </button>
      </div>
      {error && <p className="explore-error-text">{error}</p>}
    </article>
  );
}
