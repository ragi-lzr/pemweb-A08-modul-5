
import { useMemo, useState } from 'react';
import type { Application, ApplicationStatus } from '../../types/index.js';
import { isRawanGhosting } from '../../utils/ghosting.js';
import './WarRoom.css';

type SortOption = 'newest' | 'interview' | 'offer';

interface WarRoomProps {
  applications: Application[];
  kaptenSkills: string[];
  onSelectApplication: (id: string) => void;
  onUpdateApplication: (
    id: string,
    updater: (application: Application) => Application
  ) => void;
  onDeleteApplication: (id: string) => void;
}

const statuses: ApplicationStatus[] = [
  'WISHLIST',
  'APPLIED',
  'SCREENING',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
  'GHOSTED',
];

function calculateMatchScore(
  kaptenSkills: string[],
  requiredSkills: string[]
): number {
  // TODO: Ganti dengan calcSkillMatch dari Orang A saat helper tersedia.
  if (requiredSkills.length === 0) return 0;

  const userSkills = new Set(
    kaptenSkills.map((skill) => skill.trim().toLowerCase())
  );

  const matchedCount = requiredSkills.filter((skill) =>
    userSkills.has(skill.trim().toLowerCase())
  ).length;

  return Math.round((matchedCount / requiredSkills.length) * 100);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return 'Jadwal tidak valid';

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStatusLabel(status: ApplicationStatus): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default function WarRoom({
  applications,
  kaptenSkills,
  onSelectApplication,
  onUpdateApplication,
  onDeleteApplication,
}: WarRoomProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | ApplicationStatus
  >('ALL');
  const [ghostingOnly, setGhostingOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const filteredApplications = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    const filtered = applications.filter((application) => {
      const matchesSearch =
        application.company.toLowerCase().includes(keyword) ||
        application.role.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === 'ALL' || application.status === statusFilter;

      const matchesGhosting =
        !ghostingOnly || isRawanGhosting(application);

      return matchesSearch && matchesStatus && matchesGhosting;
    });

    // Sort harus memakai salinan, bukan mengubah state asli.
    return [...filtered].sort((a, b) => {
      if (sortBy === 'interview') {
        const timeA = a.interviewDateTime
          ? new Date(a.interviewDateTime).getTime()
          : Number.POSITIVE_INFINITY;

        const timeB = b.interviewDateTime
          ? new Date(b.interviewDateTime).getTime()
          : Number.POSITIVE_INFINITY;

        return timeA - timeB;
      }

      if (sortBy === 'offer') {
        return (b.salaryOffer ?? 0) - (a.salaryOffer ?? 0);
      }

      return (
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
      );
    });
  }, [applications, search, statusFilter, ghostingOnly, sortBy]);

  function simulateGhosting(application: Application) {
    onUpdateApplication(application.id, (current) => ({
      ...current,
      lastUpdatedAt: new Date(
        new Date(current.lastUpdatedAt).getTime() - 15 * 864e5
      ).toISOString(),
    }));
  }

  return (
    <section className="war-room">
      <header className="war-room-heading">
        <div>
          <p className="war-room-eyebrow">YOUR APPLICATIONS</p>
          <h2>War Room Pipeline</h2>
          <p className="war-room-description">
            Pantau setiap lamaran dan langkah berikutnya.
          </p>
        </div>

        <span className="application-count">
          {filteredApplications.length} lamaran
        </span>
      </header>

      <div className="pipeline-filters">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari perusahaan atau posisi..."
          aria-label="Cari perusahaan atau posisi"
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as 'ALL' | ApplicationStatus)
          }
          aria-label="Filter status"
        >
          <option value="ALL">Semua status</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {getStatusLabel(status)}
            </option>
          ))}
        </select>

        <label className="ghosting-filter">
          <input
            type="checkbox"
            checked={ghostingOnly}
            onChange={(event) => setGhostingOnly(event.target.checked)}
          />
          Hanya rawan ghosting
        </label>

        <select
          value={sortBy}
          onChange={(event) =>
            setSortBy(event.target.value as SortOption)
          }
          aria-label="Urutkan lamaran"
        >
          <option value="newest">Terbaru</option>
          <option value="interview">Interview terdekat</option>
          <option value="offer">Offer tertinggi</option>
        </select>
      </div>

      {applications.length === 0 ? (
        <div className="pipeline-empty">
          <h3>Belum ada lamaran</h3>
          <p>Catat lamaran pertamamu untuk mulai mengisi pipeline.</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="pipeline-empty">
          <h3>Tidak ada yang cocok dengan filter</h3>
          <p>Coba ubah kata kunci atau filter yang kamu pilih.</p>
        </div>
      ) : (
        <div className="application-grid">
          {filteredApplications.map((application) => {
            const checklistDone = application.checklist.filter(
              (item) => item.done
            ).length;

            const matchScore = calculateMatchScore(
              kaptenSkills,
              application.requiredSkills
            );

            const rawanGhosting = isRawanGhosting(application);

            return (
              <article className="application-card" key={application.id}>
                <div className="application-card-top">
                  <span
                    className={`status-badge status-${application.status.toLowerCase()}`}
                  >
                    {getStatusLabel(application.status)}
                  </span>

                  {rawanGhosting && (
                    <span className="ghosting-badge">Rawan Ghosting</span>
                  )}
                </div>

                <button
                  className="application-title-button"
                  onClick={() => onSelectApplication(application.id)}
                >
                  <h3>{application.company}</h3>
                  <p>{application.role}</p>
                </button>

                <div className="application-meta">
                  <span>CV: {application.cvVersion || 'Belum dipilih'}</span>
                  <span>
                    Checklist: {checklistDone}/{application.checklist.length}
                  </span>
                </div>

                <div className="match-row">
                  <span>Skill Match</span>
                  <strong>{matchScore}%</strong>
                </div>

                <div className="match-track">
                  <div
                    className={`match-fill ${
                      matchScore >= 70
                        ? 'match-high'
                        : matchScore >= 40
                          ? 'match-medium'
                          : 'match-low'
                    }`}
                    style={{ width: `${matchScore}%` }}
                  />
                </div>

                {application.interviewDateTime && (
                  <p className="application-detail-line">
                    Interview: {formatDate(application.interviewDateTime)}
                  </p>
                )}

                {application.salaryOffer !== undefined && (
                  <p className="application-detail-line">
                    Offer: {formatRupiah(application.salaryOffer)}
                  </p>
                )}

                <div className="application-actions">
                  {(application.status === 'APPLIED' ||
                    application.status === 'SCREENING') && (
                    <button
                      className="secondary-action"
                      onClick={() => simulateGhosting(application)}
                    >
                      Simulasi +15 Hari
                    </button>
                  )}

                  <button
                    className="delete-action"
                    onClick={() => onDeleteApplication(application.id)}
                  >
                    Hapus
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
