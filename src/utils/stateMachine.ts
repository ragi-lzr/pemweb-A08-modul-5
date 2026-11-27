import type { Application, ApplicationStatus } from '../types/index.js';

export const TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  WISHLIST: ['APPLIED', 'REJECTED'],
  APPLIED: ['SCREENING', 'REJECTED', 'GHOSTED'],
  SCREENING: ['INTERVIEW', 'REJECTED', 'GHOSTED'],
  INTERVIEW: ['OFFER', 'REJECTED', 'GHOSTED'],
  GHOSTED: ['SCREENING'],
  OFFER: [],
  REJECTED: [],
};

export function canTransition(
  from: ApplicationStatus,
  to: ApplicationStatus
): boolean {
  return TRANSITIONS[from].includes(to);
}

export function validateTransition(
  to: ApplicationStatus,
  data: Partial<Application>
): string | null {
  if (to === 'APPLIED') {
    if (!data.cvVersion?.trim()) return 'Versi CV wajib diisi.';
    if (!data.appliedDate) return 'Tanggal melamar wajib diisi.';
  }

  if (to === 'INTERVIEW') {
    if (!data.interviewDateTime) return 'Jadwal interview wajib diisi.';
  }

  if (to === 'OFFER') {
    if (!data.salaryOffer || data.salaryOffer <= 0) {
      return 'Nilai offer harus lebih dari 0.';
    }
    if (!data.workMode) return 'Mode kerja wajib dipilih.';
  }

  return null;
}
