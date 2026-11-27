import { useEffect, useMemo, useRef, useState } from 'react';
import type { JobListing, JobSource, NewApplicationInput } from '../../types/index.js';
import type { AddResult } from '../../hooks/useApplications.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { fetchJobs } from '../../services/jobService.js';
import { calcSkillMatch } from '../../utils/skillMatch.js';
import JobCard from './JobCard.js';
import SourceToggle from './SourceToggle.js';
import './explore.css';

type FetchStatus = 'loading' | 'error' | 'success';

interface JobExplorerProps {
  kaptenSkills: string[];
  addApplication: (input: NewApplicationInput) => AddResult;
  hasApplied: (company: string, role: string) => boolean;
}

const ALL_CATEGORIES = 'ALL';

export default function JobExplorer({ kaptenSkills, addApplication, hasApplied }: JobExplorerProps) {
  const [source, setSource] = useState<JobSource>('remotive');
  const [reloadKey, setReloadKey] = useState(0); // naik 1 = paksa effect fetch jalan ulang (Retry)
  const [status, setStatus] = useState<FetchStatus>('loading');
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const debouncedKeyword = useDebounce(keyword, 400);

  const searchRef = useRef<HTMLInputElement>(null);

  // Fetch lowongan. Jalan ulang kalau source / reloadKey berubah.
  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');
    setErrorMessage('');

    fetchJobs(source, controller.signal)
      .then((result) => {
        setJobs(result);
        setStatus('success');
      })
      .catch((error: unknown) => {
        // Fetch dibatalkan karena unmount/ganti source → bukan error sungguhan.
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setErrorMessage(error instanceof Error ? error.message : 'Terjadi kesalahan.');
        setStatus('error');
      });

    // Cleanup: batalkan request lama supaya tidak set state setelah unmount / balapan respons.
    return () => controller.abort();
  }, [source, reloadKey]);

  // Bonus: tekan "/" untuk fokus ke search bar.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== '/') return;
      const target = event.target;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable);
      if (isTyping) return;

      event.preventDefault();
      searchRef.current?.focus();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Derived: daftar kategori unik dari data.
  const categories = useMemo(
    () => [...new Set(jobs.map((job) => job.category))].sort(),
    [jobs]
  );

  // Derived: filter + hitung Match % + sort. TIDAK disimpan di useState,
  // jadi saat kaptenSkills berubah, persen langsung ikut berubah.
  const visibleJobs = useMemo(() => {
    const q = debouncedKeyword.trim().toLowerCase();

    const withMatch = jobs
      .filter((job) => category === ALL_CATEGORIES || job.category === category)
      .filter(
        (job) =>
          q === '' ||
          job.title.toLowerCase().includes(q) ||
          job.company_name.toLowerCase().includes(q)
      )
      .map((job) => ({ job, match: calcSkillMatch(kaptenSkills, job.tags) }));

    // Copy dulu baru sort (sort memutasi array).
    return [...withMatch].sort((a, b) => b.match.score - a.match.score);
  }, [jobs, category, debouncedKeyword, kaptenSkills]);

  function handleSourceChange(next: JobSource) {
    setCategory(ALL_CATEGORIES);
    setSource(next);
  }

  function handleUseLocalData() {
    if (source === 'fallback') setReloadKey((k) => k + 1);
    else handleSourceChange('fallback');
  }

  const isSearching = keyword !== debouncedKeyword;

  return (
    <section className="explore-panel job-explorer">
      <div className="explore-panel-heading explore-heading-row">
        <div>
          <h2>Eksplorasi Lowongan</h2>
          <p>Diurutkan dari Match % tertinggi. Tekan <kbd>/</kbd> untuk mencari.</p>
        </div>
        <SourceToggle source={source} onChange={handleSourceChange} />
      </div>

      <div className="explore-filters">
        <input
          ref={searchRef}
          type="search"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Cari posisi atau perusahaan…"
          aria-label="Cari lowongan"
        />
        <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter kategori">
          <option value={ALL_CATEGORIES}>Semua kategori</option>
          {categories.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>
      <p className="explore-hint" aria-live="polite">
        {isSearching ? 'Mengetik… (filter jalan 400ms setelah berhenti)' : `${visibleJobs.length} lowongan`}
      </p>

      {status === 'loading' && (
        <div className="explore-state">
          <span className="explore-spinner" aria-hidden="true" />
          Memuat lowongan dari {source === 'remotive' ? 'Remotive' : 'data lokal'}…
        </div>
      )}

      {status === 'error' && (
        <div className="explore-state explore-state-error" role="alert">
          <strong>Gagal memuat lowongan.</strong>
          <p>{errorMessage}</p>
          <div className="explore-state-actions">
            <button type="button" className="secondary-button" onClick={() => setReloadKey((k) => k + 1)}>
              Coba Lagi
            </button>
            <button type="button" className="primary-action" onClick={handleUseLocalData}>
              Pakai Data Lokal
            </button>
          </div>
        </div>
      )}

      {status === 'success' && visibleJobs.length === 0 && (
        <div className="explore-state">
          {jobs.length === 0
            ? 'Belum ada lowongan dari sumber ini.'
            : 'Tidak ada lowongan yang cocok dengan pencarian/filter.'}
        </div>
      )}

      {status === 'success' && visibleJobs.length > 0 && (
        <div className="job-grid">
          {visibleJobs.map(({ job, match }) => (
            <JobCard
              key={job.id}
              job={job}
              match={match}
              alreadyApplied={hasApplied(job.company_name, job.title)}
              onSave={addApplication}
            />
          ))}
        </div>
      )}
    </section>
  );
}
