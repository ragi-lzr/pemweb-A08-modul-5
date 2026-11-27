import { useState } from 'react';
import type { Application, ApplicationStatus, WorkMode } from '../../types/index.js';
import {
  TRANSITIONS,
  canTransition,
  validateTransition,
} from '../../utils/stateMachine.js';

interface StatusTransitionProps {
  application: Application;
  onUpdate: (updater: (app: Application) => Application) => void;
}

function getStatusLabel(status: ApplicationStatus): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default function StatusTransition({
  application,
  onUpdate,
}: StatusTransitionProps) {
  const [target, setTarget] = useState<ApplicationStatus | ''>('');
  const [cvVersion, setCvVersion] = useState('');
  const [appliedDate, setAppliedDate] = useState('');
  const [interviewDateTime, setInterviewDateTime] = useState('');
  const [salaryOffer, setSalaryOffer] = useState('');
  const [workMode, setWorkMode] = useState<WorkMode>(application.workMode);
  const [error, setError] = useState('');

  const allowedTargets = TRANSITIONS[application.status];
  const isFinal = allowedTargets.length === 0;

  function resetForm() {
    setTarget('');
    setCvVersion('');
    setAppliedDate('');
    setInterviewDateTime('');
    setSalaryOffer('');
    setWorkMode(application.workMode);
    setError('');
  }

  function handleConfirm() {
    if (!target) return;

    if (!canTransition(application.status, target)) {
      setError('Status tujuan tidak valid dari posisi saat ini.');
      return;
    }

    const extraFields: Partial<Application> = {};

    if (target === 'APPLIED') {
      extraFields.cvVersion = cvVersion.trim();
      extraFields.appliedDate = appliedDate;
    }

    if (target === 'INTERVIEW') {
      extraFields.interviewDateTime = interviewDateTime;
    }

    if (target === 'OFFER') {
      const parsedSalary = Number(salaryOffer);
      extraFields.salaryOffer = Number.isFinite(parsedSalary) ? parsedSalary : 0;
      extraFields.workMode = workMode;
    }

    const validationError = validateTransition(target, { ...application, ...extraFields });
    if (validationError) {
      setError(validationError);
      return;
    }

    const timestamp = new Date().toISOString();

    onUpdate((current) => ({
      ...current,
      ...extraFields,
      status: target,
      lastUpdatedAt: timestamp,
      activityLogs: [
        ...current.activityLogs,
        {
          id: crypto.randomUUID(),
          timestamp,
          message: `Status: ${current.status} → ${target}`,
        },
      ],
    }));

    resetForm();
  }

  if (isFinal) {
    return (
      <div className="status-transition-final">
        Status <b>{getStatusLabel(application.status)}</b> sudah final, tidak bisa diubah.
      </div>
    );
  }

  return (
    <div className="status-transition">
      <div className="status-transition-row">
        <label>
          Pindah ke status
          <select
            value={target}
            onChange={(event) => {
              setTarget(event.target.value as ApplicationStatus | '');
              setError('');
            }}
          >
            <option value="">Pilih status...</option>
            {allowedTargets.map((next) => (
              <option key={next} value={next}>
                {getStatusLabel(next)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {target === 'APPLIED' && (
        <div className="conditional-fields">
          <label>
            Versi CV
            <input value={cvVersion} onChange={(e) => setCvVersion(e.target.value)} placeholder="CV Frontend v2" />
          </label>
          <label>
            Tanggal melamar
            <input type="date" value={appliedDate} onChange={(e) => setAppliedDate(e.target.value)} />
          </label>
        </div>
      )}

      {target === 'INTERVIEW' && (
        <div className="conditional-fields">
          <label>
            Jadwal interview
            <input
              type="datetime-local"
              value={interviewDateTime}
              onChange={(e) => setInterviewDateTime(e.target.value)}
            />
          </label>
        </div>
      )}

      {target === 'OFFER' && (
        <div className="conditional-fields">
          <label>
            Uang saku / bulan (Rp)
            <input
              type="number"
              min="1"
              value={salaryOffer}
              onChange={(e) => setSalaryOffer(e.target.value)}
              placeholder="6000000"
            />
          </label>
          <label>
            Mode kerja
            <select value={workMode} onChange={(e) => setWorkMode(e.target.value as WorkMode)}>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Onsite">Onsite</option>
            </select>
          </label>
        </div>
      )}

      {error && <p className="detail-error" role="alert">{error}</p>}

      <div className="status-transition-actions">
        <button type="button" onClick={handleConfirm} disabled={!target}>
          Konfirmasi
        </button>
      </div>
    </div>
  );
}


