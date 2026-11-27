import './detail.css';
import type { Application, ApplicationStatus } from '../../types/index.js';
import StatusTransition from './StatusTransition.js';
import Checklist from './Checklist.js';
import ActivityLogList from './ActivityLogList.js';
import InterviewPrep from './InterviewPrep.js';

interface ApplicationDetailProps {
  application: Application;
  kaptenSkills: string[];
  onUpdateApplication: (
    id: string,
    updater: (app: Application) => Application
  ) => void;
  onClose: () => void;
}

const steps: ApplicationStatus[] = [
  'APPLIED',
  'SCREENING',
  'INTERVIEW',
  'OFFER',
];

function getStatusLabel(status: ApplicationStatus): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default function ApplicationDetail({
  application,
  kaptenSkills: _kaptenSkills,
  onUpdateApplication,
  onClose,
}: ApplicationDetailProps) {
  const currentIndex = steps.indexOf(application.status);

  const update = (updater: (app: Application) => Application) =>
    onUpdateApplication(application.id, updater);

  return (
    <div className="detail-overlay" role="dialog" aria-modal="true">
      <div className="detail-modal">
        <header className="detail-header">
          <div>
            <p className="detail-eyebrow">DETAIL LAMARAN</p>
            <h2>{application.company}</h2>
            <p className="detail-role">{application.role}</p>
            <div className="detail-meta">
              <span className={`status-badge status-${application.status.toLowerCase()}`}>
                {getStatusLabel(application.status)}
              </span>
              <span>{application.workMode}</span>
            </div>
          </div>
          <button type="button" className="detail-close" onClick={onClose} aria-label="Tutup detail">
            ×
          </button>
        </header>

        <div className="stepper">
          {steps.map((step, index) => {
            const reached = currentIndex >= 0 && index <= currentIndex;
            const isCurrent = step === application.status;
            return (
              <div
                key={step}
                className={`stepper-step ${reached ? 'reached' : ''} ${isCurrent ? 'current' : ''}`}
              >
                <span className="stepper-dot">{index + 1}</span>
                <span className="stepper-label">{getStatusLabel(step)}</span>
              </div>
            );
          })}
        </div>

        <div className="detail-sections">
          <section className="detail-card">
            <h3>Perpindahan Status</h3>
            <StatusTransition application={application} onUpdate={update} />
          </section>

          <section className="detail-card">
            <h3>Checklist Persiapan</h3>
            <Checklist application={application} onUpdate={update} />
          </section>

          <section className="detail-card">
            <h3>Aktivitas</h3>
            <ActivityLogList application={application} onUpdate={update} />
          </section>

          <section className="detail-card">
            <h3>Latihan Interview</h3>
            <InterviewPrep />
          </section>
        </div>
      </div>
    </div>
  );
}
