import { useRef, useState, type FormEvent, type RefObject } from 'react';
import type { NewApplicationInput, WorkMode } from '../../types/index.js';
import type { AddResult } from '../../hooks/useApplications.js';
import './form.css';

type InitialStatus = 'WISHLIST' | 'APPLIED';
type Field = 'company' | 'role' | 'skills' | 'cvVersion' | 'appliedDate';
type FormErrors = Partial<Record<Field, string>>;

interface AddApplicationFormProps {
  onAdd: (input: NewApplicationInput) => AddResult;
  hasApplied: (company: string, role: string) => boolean;
  onClose?: () => void;
}

// Urutan field di layar → dipakai untuk mencari error PERTAMA yang harus difokus.
const FIELD_ORDER: Field[] = ['company', 'role', 'skills', 'cvVersion', 'appliedDate'];

function parseSkills(text: string): string[] {
  return text.split(',').map((skill) => skill.trim()).filter(Boolean);
}

export default function AddApplicationForm({ onAdd, hasApplied, onClose }: AddApplicationFormProps) {
  // Semua input terkontrol: nilainya tinggal di state, input cuma menampilkan.
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [workMode, setWorkMode] = useState<WorkMode>('Remote');
  const [status, setStatus] = useState<InitialStatus>('WISHLIST');
  const [skillsText, setSkillsText] = useState('');
  const [cvVersion, setCvVersion] = useState('');
  const [appliedDate, setAppliedDate] = useState('');

  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState('');

  // useRef per input → bisa memanggil .focus() tanpa re-render.
  const companyRef = useRef<HTMLInputElement>(null);
  const roleRef = useRef<HTMLInputElement>(null);
  const skillsRef = useRef<HTMLInputElement>(null);
  const cvRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  const refs: Record<Field, RefObject<HTMLInputElement | null>> = {
    company: companyRef,
    role: roleRef,
    skills: skillsRef,
    cvVersion: cvRef,
    appliedDate: dateRef,
  };

  function validate(): FormErrors {
    const result: FormErrors = {};
    if (!company.trim()) result.company = 'Nama perusahaan wajib diisi.';
    if (!role.trim()) result.role = 'Posisi/role wajib diisi.';

    if (status === 'APPLIED') {
      if (!cvVersion.trim()) result.cvVersion = 'Versi CV wajib diisi untuk status APPLIED.';
      if (!appliedDate) result.appliedDate = 'Tanggal melamar wajib diisi untuk status APPLIED.';
    }

    // Anti-duplikat: company + role sama (case-insensitive) ditolak.
    if (!result.company && !result.role && hasApplied(company, role)) {
      result.company = `Lamaran "${company.trim()}" – "${role.trim()}" sudah ada.`;
    }
    return result;
  }

  function focusFirstError(found: FormErrors) {
    const firstField = FIELD_ORDER.find((field) => found[field]);
    if (firstField) refs[firstField].current?.focus();
  }

  function resetForm() {
    setCompany('');
    setRole('');
    setWorkMode('Remote');
    setStatus('WISHLIST');
    setSkillsText('');
    setCvVersion('');
    setAppliedDate('');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage('');

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      focusFirstError(found);
      return;
    }

    const input: NewApplicationInput = {
      company: company.trim(),
      role: role.trim(),
      workMode,
      status,
      requiredSkills: parseSkills(skillsText),
      ...(status === 'APPLIED' ? { cvVersion: cvVersion.trim(), appliedDate } : {}),
    };

    const result = onAdd(input);
    if (!result.ok) {
      // Jaga-jaga kalau hook menolak (mis. duplikat yang lolos cek di atas).
      const fallbackErrors: FormErrors = {
        company: result.error === 'DUPLICATE' ? 'Lamaran ini sudah ada.' : 'Data belum lengkap.',
      };
      setErrors(fallbackErrors);
      focusFirstError(fallbackErrors);
      return;
    }

    setSuccessMessage(`Lamaran ${input.role} di ${input.company} tersimpan.`);
    resetForm();
    companyRef.current?.focus();
  }

  // Ubah nilai + hapus error field itu saat user mulai memperbaiki.
  function clearError(field: Field) {
    if (errors[field]) {
      setErrors((prev) => {
        const { [field]: _removed, ...rest } = prev;
        return rest;
      });
    }
  }

  return (
    <form className="quick-add-form add-application-form" onSubmit={handleSubmit} noValidate>
      <div className="quick-add-heading">
        <div>
          <h3>Tambah Lamaran Manual</h3>
          <p>Catat lowongan yang kamu temukan di luar Eksplorasi.</p>
        </div>
        {onClose && (
          <button type="button" className="quick-add-close" onClick={onClose} aria-label="Tutup form">×</button>
        )}
      </div>

      <div className="quick-add-grid">
        <label>
          Perusahaan
          <input
            ref={companyRef}
            value={company}
            onChange={(event) => { setCompany(event.target.value); clearError('company'); }}
            placeholder="Nama perusahaan"
            aria-invalid={Boolean(errors.company)}
          />
          {errors.company && <span className="field-error">{errors.company}</span>}
        </label>

        <label>
          Posisi / Role
          <input
            ref={roleRef}
            value={role}
            onChange={(event) => { setRole(event.target.value); clearError('role'); }}
            placeholder="Frontend Developer Intern"
            aria-invalid={Boolean(errors.role)}
          />
          {errors.role && <span className="field-error">{errors.role}</span>}
        </label>

        <label>
          Mode Kerja
          <select value={workMode} onChange={(event) => setWorkMode(event.target.value as WorkMode)}>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Onsite">Onsite</option>
          </select>
        </label>

        <label>
          Status Awal
          <select value={status} onChange={(event) => setStatus(event.target.value as InitialStatus)}>
            <option value="WISHLIST">WISHLIST</option>
            <option value="APPLIED">APPLIED</option>
          </select>
        </label>

        <label className="quick-add-wide">
          Required Skills (pisahkan dengan koma)
          <input
            ref={skillsRef}
            value={skillsText}
            onChange={(event) => { setSkillsText(event.target.value); clearError('skills'); }}
            placeholder="React, TypeScript, CSS"
            aria-invalid={Boolean(errors.skills)}
          />
          {errors.skills && <span className="field-error">{errors.skills}</span>}
        </label>

        {/* Field kondisional: hanya muncul kalau status APPLIED */}
        {status === 'APPLIED' && (
          <>
            <label>
              Versi CV
              <input
                ref={cvRef}
                value={cvVersion}
                onChange={(event) => { setCvVersion(event.target.value); clearError('cvVersion'); }}
                placeholder="CV Frontend v2"
                aria-invalid={Boolean(errors.cvVersion)}
              />
              {errors.cvVersion && <span className="field-error">{errors.cvVersion}</span>}
            </label>
            <label>
              Tanggal Melamar
              <input
                ref={dateRef}
                type="date"
                value={appliedDate}
                onChange={(event) => { setAppliedDate(event.target.value); clearError('appliedDate'); }}
                aria-invalid={Boolean(errors.appliedDate)}
              />
              {errors.appliedDate && <span className="field-error">{errors.appliedDate}</span>}
            </label>
          </>
        )}
      </div>

      {successMessage && <p className="form-success" role="status">{successMessage}</p>}

      <div className="quick-add-actions">
        {onClose && <button type="button" className="quick-add-cancel" onClick={onClose}>Batal</button>}
        <button type="submit" className="quick-add-submit">Simpan Lamaran</button>
      </div>
    </form>
  );
}
