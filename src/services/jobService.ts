import type { JobListing, JobSource, WorkMode } from '../types/index.js';

const REMOTIVE_URL = 'https://remotive.com/api/remote-jobs?category=software-dev&limit=30';
const FALLBACK_URL = '/magang-fallback.json';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Type guard: memastikan data `unknown` dari API benar-benar berbentuk JobListing. */
export function isJobListing(x: unknown): x is JobListing {
  if (!isRecord(x)) return false;

  return (
    typeof x.id === 'number' &&
    typeof x.title === 'string' &&
    typeof x.company_name === 'string' &&
    typeof x.category === 'string' &&
    typeof x.candidate_required_location === 'string' &&
    typeof x.salary === 'string' &&
    Array.isArray(x.tags) &&
    x.tags.every((tag) => typeof tag === 'string') &&
    (x.url === undefined || typeof x.url === 'string')
  );
}

/** Ambil array lowongan dari JSON: bisa array langsung atau `{ jobs: [...] }`. */
function extractJobs(data: unknown): JobListing[] {
  const list: unknown = Array.isArray(data) ? data : isRecord(data) ? data.jobs : undefined;

  if (!Array.isArray(list)) {
    throw new Error('Format data lowongan tidak dikenali.');
  }

  // Item yang tidak valid dibuang, bukan bikin seluruh list gagal.
  return list.filter(isJobListing);
}

export async function fetchJobs(source: JobSource, signal: AbortSignal): Promise<JobListing[]> {
  const url = source === 'remotive' ? REMOTIVE_URL : FALLBACK_URL;
  const res = await fetch(url, { signal });

  if (!res.ok) {
    throw new Error(`Gagal memuat lowongan (HTTP ${res.status}).`);
  }

  const data: unknown = await res.json();
  return extractJobs(data);
}

/** Tebak mode kerja dari teks lokasi. Default: Remote (Remotive = remote jobs). */
export function detectWorkMode(location: string): WorkMode {
  const text = location.toLowerCase();
  if (text.includes('hybrid')) return 'Hybrid';
  if (text.includes('onsite') || text.includes('on-site') || text.includes('office')) return 'Onsite';
  return 'Remote';
}
