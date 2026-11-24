import { useRef, useState, type FormEvent } from 'react';
import type { NewApplicationInput, WorkMode } from '../../types/index.js';
import type { AddResult } from '../../hooks/useApplications.js';

/** TODO(stub): ganti dengan AddApplicationForm milik Orang A saat komponen tersedia. */
interface QuickAddApplicationProps {
  onAdd: (input: NewApplicationInput) => AddResult;
  onClose: () => void;
}

export default function QuickAddApplication({ onAdd, onClose }: QuickAddApplicationProps) {
  const companyRef = useRef<HTMLInputElement>(null);
  const roleRef = useRef<HTMLInputElement>(null);
  const cvRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [workMode, setWorkMode] = useState<WorkMode>('Remote');
  const [status, setStatus] = useState<'WISHLIST' | 'APPLIED'>('WISHLIST');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [cvVersion, setCvVersion] = useState('');
  const [appliedDate, setAppliedDate] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!company.trim()) {
      setError('Nama perusahaan wajib diisi.');
      companyRef.current?.focus();
      return;
    }
    if (!role.trim()) {
      setError('Posisi/role wajib diisi.');
      roleRef.current?.focus();
      return;
    }
    if (status === 'APPLIED' && !cvVersion.trim()) {
      setError('Versi CV wajib diisi untuk status APPLIED.');
      cvRef.current?.focus();
      return;
    }
    if (status === 'APPLIED' && !appliedDate) {
      setError('Tanggal melamar wajib diisi untuk status APPLIED.');
      dateRef.current?.focus();
      return;
    }

    const result = onAdd({
      company: company.trim(),
      role: role.trim(),
      workMode,
      status,
      requiredSkills: requiredSkills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean),
      ...(status === 'APPLIED'
        ? { cvVersion: cvVersion.trim(), appliedDate }
        : {}),
    });

    if (!result.ok) {
      setError(
        result.error === 'DUPLICATE'
          ? 'Lamaran dengan perusahaan dan posisi ini sudah ada.'
          : 'Perusahaan, posisi, serta data wajib untuk status Applied harus diisi.'
      );
      if (result.error === 'INVALID') companyRef.current?.focus();
      return;
    }

    onClose();
  }

  return (
    <form className="quick-add-form" onSubmit={handleSubmit}>
      <div className="quick-add-heading">
        <div>
          <h3>Catat Lamaran</h3>
          <p>Masukkan lowongan yang ingin kamu pantau.</p>
        </div>
        <button type="button" className="quick-add-close" onClick={onClose} aria-label="Tutup form">×</button>
      </div>

      <div className="quick-add-grid">
        <label>
          Perusahaan
          <input ref={companyRef} value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Nama perusahaan" />
        </label>
        <label>
          Posisi / Role
          <input ref={roleRef} value={role} onChange={(event) => setRole(event.target.value)} placeholder="Frontend Developer Intern" />
        </label>
        <label>
          Mode kerja
          <select value={workMode} onChange={(event) => setWorkMode(event.target.value as WorkMode)}>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Onsite">Onsite</option>
          </select>
        </label>
        <label>
          Status awal
          <select value={status} onChange={(event) => setStatus(event.target.value as 'WISHLIST' | 'APPLIED')}>
            <option value="WISHLIST">Wishlist</option>
            <option value="APPLIED">Applied</option>
          </select>
        </label>
        <label className="quick-add-wide">
          Required Skills (pisahkan dengan koma)
          <input value={requiredSkills} onChange={(event) => setRequiredSkills(event.target.value)} placeholder="React, TypeScript, CSS" />
        </label>
        {status === 'APPLIED' && (
          <>
            <label>
              Versi CV
              <input ref={cvRef} value={cvVersion} onChange={(event) => setCvVersion(event.target.value)} placeholder="CV Frontend v2" />
            </label>
            <label>
              Tanggal melamar
              <input ref={dateRef} type="date" value={appliedDate} onChange={(event) => setAppliedDate(event.target.value)} />
            </label>
          </>
        )}
      </div>

      {error && <p className="quick-add-error" role="alert">{error}</p>}
      <div className="quick-add-actions">
        <button type="button" className="quick-add-cancel" onClick={onClose}>Batal</button>
        <button type="submit" className="quick-add-submit">Simpan Lamaran</button>
      </div>
    </form>
  );
}
