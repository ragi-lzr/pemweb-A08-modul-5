# HARNESS — ORANG C: "Detail & Analisis" (Detail Lamaran + Interview Timer + Dashboard & Offer Comparator)

> Salin seluruh file ini sebagai prompt pertama ke coding agent (atau simpan sebagai `CLAUDE.md` / `AGENTS.md` di branch kamu).

## Peran Kamu

Kamu adalah agent untuk **Orang C**. Tanggung jawabnya: **isi detail dan analisis** data lamaran, yaitu state machine status, nested checklist, activity log, Interview Prep Timer, 5 kartu statistik, dan Offer Comparator.

## File Milikmu

```
src/utils/stateMachine.ts
src/utils/stats.ts
src/utils/offerScore.ts
src/hooks/useCountdown.ts        (custom hook timer, opsional tapi disarankan)
src/components/detail/    (ApplicationDetail modal, StatusTransition, Checklist, ActivityLogList, InterviewPrep)
src/components/dashboard/ (StatsCards, OfferComparator)
```
Jangan ubah `types/index.ts`, `useApplications`, `useLocalStorage`, `App.tsx` (B) atau file A. Butuh perubahan → bilang ke user.

Data masuk lewat props dari App: `applications`, `updateApplication`, `kaptenSkills`, `selectedId`, `onClose`. Match % pakai `calcSkillMatch` (A), ghosting pakai `isRawanGhosting` (B). Kalau belum ada, buat stub sementara.

## Tugas (kerjakan berurutan)

### C1. `utils/stateMachine.ts`
- `TRANSITIONS` sesuai Kontrak 3.4 (**cek ulang ke Diagram State Machine di soal asli**). OFFER & REJECTED = `[]` (final). GHOSTED → SCREENING.
- `canTransition(from, to)`.
- `validateTransition(to, data)`: APPLIED butuh `cvVersion` & `appliedDate` · INTERVIEW butuh `interviewDateTime` · OFFER butuh `salaryOffer > 0` & `workMode`. Return pesan error atau `null`.
- Fungsi murni, tanpa React, sehingga gampang dijelaskan dan dites.

### C2. Fitur 4: Detail Lamaran (modal)
- Header: role, company, lokasi/mode, status badge, tombol Tutup.
- **Stepper tahap seleksi** (Applied → Screening → Interview → Offer) sebagai visual.
- **StatusTransition**: dropdown/tombol **hanya berisi `TRANSITIONS[status]`**. Kalau tujuan APPLIED/INTERVIEW/OFFER → munculkan input kondisional (form terkontrol): cvVersion + appliedDate / interviewDateTime (`datetime-local`) / salaryOffer (number) + workMode. Tombol "Konfirmasi" → `validateTransition` → kalau OK:
  ```ts
  updateApplication(id, a => ({
    ...a, ...extraFields, status: to,
    lastUpdatedAt: new Date().toISOString(),
    activityLogs: [...a.activityLogs, { id: crypto.randomUUID(), timestamp: new Date().toISOString(), message: `Status: ${a.status} → ${to}` }],
  }))
  ```
  Status final → tampilkan "Status final, tidak bisa diubah".
- **Checklist** (nested, IMMUTABLE):
  - Tambah: `checklist: [...a.checklist, { id, text, done: false }]`
  - Centang: `checklist: a.checklist.map(c => c.id === cid ? { ...c, done: !c.done } : c)`
  - Hapus: `checklist: a.checklist.filter(c => c.id !== cid)`
  - Progress bar `X/Y selesai` (derived). Tolak teks kosong.
- **Activity Log**: list terbaru di atas (`[...logs].reverse()` / sort copy), format tanggal-jam lokal. Input "Catatan manual" → tambah log baru.

### C3. Fitur 5: Interview Prep Timer
- Tab/bagian "Latihan Interview" di dalam modal. Minimal **5 pertanyaan** interview magang IT (misal: perkenalan diri, project paling menantang, beda `let/const/var`, cara handle konflik tim, kenapa tertarik posisi ini, jelaskan REST API, dll).
- Countdown **02:00** per soal: Start/Pause, Reset, Soal Berikutnya (otomatis reset ke 02:00 & berhenti). Tampilkan "Soal X / N".
- Implementasi (disarankan custom hook `useCountdown(initialSeconds)`):
  ```ts
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => setSeconds(s => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(id); // WAJIB: berhenti bersih saat pause/unmount
  }, [isRunning]);
  ```
  Saat `seconds === 0` → `setIsRunning(false)` (di effect terpisah). Pakai functional update `s => s - 1` supaya tidak stale.
- Uji: Start → tutup modal → buka lagi → tidak ada error console, detik normal (tidak 2x cepat).

### C4. Fitur 7: Dashboard Statistik (`utils/stats.ts` + StatsCards)
- 5 kartu, **semua derived** (fungsi murni dipanggil di render / `useMemo`, BUKAN `useState`):
  - **Total Lamaran** = semua aplikasi.
  - **Response Rate %** = lamaran yang dapat respons (SCREENING, INTERVIEW, OFFER, REJECTED) ÷ lamaran yang sudah dikirim (semua kecuali WISHLIST).
  - **Interview Rate %** = (INTERVIEW + OFFER) ÷ lamaran yang sudah dikirim.
  - **Rawan Ghosting** = jumlah `isRawanGhosting`.
  - **Total Offer** = status OFFER.
  - Pembagi 0 → tampilkan 0%. Sertakan sub-teks (misal "7 dari 12 diproses"). *(Definisi rate ini kesepakatan kelompok. Kalau asisten punya definisi lain, ikuti asisten.)*

### C5. Offer Comparator (`utils/offerScore.ts` + OfferComparator)
- Ambil lamaran berstatus OFFER. Kalau **< 2** → pesan kosong jelas ("Butuh minimal 2 offer untuk dibandingkan").
- Dua dropdown **Offer A** vs **Offer B** (default 2 pertama, cegah pilih yang sama).
- Skor (cocok dengan wireframe: 6jt vs 4,5jt → 50 vs 37,5):
  - Gaji = `salaryOffer / max(salaryA, salaryB) * 50`
  - Mode = `WORK_MODE_SCORE[workMode] * 0.25` (Remote 100, Hybrid 75, Onsite 50)
  - Skill = `matchScore * 0.25` (dari `calcSkillMatch(kaptenSkills, requiredSkills)`)
  - Total = jumlah ketiganya, tampilkan 1 desimal.
- Tabel per baris: Uang Saku/Bulan, Mode Kerja, Kecocokan Skill (`80% (4 dari 5 skill)`), masing-masing dengan `nilai / bobot`. Badge **"Rekomendasi Terbaik"** di skor tertinggi (seri → tampilkan "Seri").
- Bonus: Dark Mode (toggle tema disimpan pakai `useLocalStorage` milik B, class `dark` di root).

## Testcase yang Jadi Tanggunganmu
| No | Skenario | Cara uji |
|---|---|---|
| 5 | State Machine | WISHLIST → APPLIED (isi CV & tanggal) → SCREENING → INTERVIEW (isi jadwal). WISHLIST tidak punya opsi OFFER |
| 8a | Checklist | Tambah 2 item, centang 1 → progress 1/2 → F5 → tetap |
| 9 | Timer Cleanup | Start → tutup modal → buka lagi → tidak ada error, detik normal |
| 10b | Comparator | Pindahkan 2 lamaran ke OFFER → skor berbobot benar + badge rekomendasi |

## Persiapan Demo & Live-Coding (latih ini)
- Jelaskan kenapa statistik **tidak** disimpan di `useState` (derived state, sumber kebenaran tunggal).
- Jelaskan cleanup `clearInterval` dan apa yang terjadi tanpa itu (interval dobel → detik 2x cepat).
- Jelaskan immutable update nested (spread objek lamaran → map checklist → spread item).
- Kemungkinan live-coding: ubah timer jadi 03:00; tambah status transisi baru; ubah bobot skor (gaji 40%, mode 30%, skill 30%); tambah tombol "Tandai semua checklist selesai".

## Definition of Done
- [ ] `stateMachine.ts` murni + validasi syarat status
- [ ] Opsi status hanya yang sah + input kondisional + log otomatis
- [ ] Checklist tambah/centang/hapus immutable + progress bar
- [ ] Activity log otomatis + catatan manual
- [ ] Timer 02:00, Start/Pause/Reset/Next, ≥ 5 soal, cleanup benar
- [ ] 5 kartu statistik derived
- [ ] Offer Comparator + skor berbobot + badge + empty state
- [ ] Testcase 5, 8a, 9, 10b lolos
- [ ] `npx tsc --noEmit` & `npm run build` lolos

---

## 0. Konteks Proyek (baca dulu)

Kamu membantu satu anggota kelompok (3 orang) mengerjakan **Praktikum Pemweb Modul 5: Frontend React "Aku Mw Magang"**. Aplikasi ini membantu "Kapten" mengelola lamaran magang: eksplorasi lowongan + Skill Match %, War Room pipeline lamaran (state machine, ghosting, bentrok jadwal), detail lamaran (checklist, activity log, interview timer), undo delete, dashboard statistik, dan Offer Comparator.

- Repo: `pweb-react-p01-2026` (public). Deadline: **Jumat, 27 Nov 2026, 23:59 WIB**.
- Kode ini akan **didemokan oleh anggota sendiri** + tanya-jawab + **mini live-coding** di depan asisten. Jadi anggota harus paham setiap baris yang kamu tulis.

## 1. Aturan Keras (TIDAK BOLEH dilanggar)

1. **React 19 + TypeScript `strict: true`**, Vite template `react-ts`. **Dilarang `any`** (termasuk `as any`, `: any`, `any[]`). Untuk data luar (JSON/API) pakai `unknown` + type guard / narrowing.
2. **Dilarang**: Redux, Zustand, TanStack Query, React Hook Form, Formik, atau library state/form lain. Hanya React Hooks bawaan + custom hooks buatan sendiri. Styling: CSS murni atau Tailwind. Ikon boleh `lucide-react`.
3. **Update state wajib immutable**: pakai `map`, `filter`, spread `{...obj}`, `[...arr]`. Dilarang `.push()`, `.splice()`, `.sort()` langsung pada state (copy dulu: `[...arr].sort()`), atau `obj.field = x`.
4. Nilai turunan (Match %, Rawan Ghosting, statistik, bentrok, skor offer) = **derived state**: dihitung saat render (boleh `useMemo`), **jangan** disimpan di `useState` terpisah.
5. Setiap `setInterval` / `setTimeout` / `fetch` di `useEffect` wajib punya **cleanup** (`clearInterval`, `clearTimeout`, `AbortController.abort()`).
6. Sebelum bilang "selesai", jalankan **`npx tsc --noEmit`** dan **`npm run build`**. Keduanya harus lolos tanpa error.
7. **Hanya sentuh file milik role kamu** (lihat bagian "File Milikmu"). Kalau butuh perubahan di file orang lain atau di kontrak bersama, **berhenti dan bilang ke user** apa yang perlu diubah. Jangan ubah sendiri.

## 2. Struktur Folder (disepakati bersama)

```
public/
  magang-fallback.json
src/
  components/
    explore/        ← Orang A
    form/           ← Orang A
    pipeline/       ← Orang B
    toast/          ← Orang B
    detail/         ← Orang C
    dashboard/      ← Orang C
    common/         ← bebas, komponen kecil reusable (Badge, Button, Modal)
  hooks/
  services/
  types/
  utils/
  App.tsx           ← Orang B (shell + state utama)
  main.tsx
```

## 3. KONTRAK BERSAMA (jangan diubah tanpa persetujuan kelompok)

### 3.1 `src/types/index.ts` (ditulis Orang B, dipakai semua)

```ts
export type ApplicationStatus =
  | 'WISHLIST' | 'APPLIED' | 'SCREENING' | 'INTERVIEW'
  | 'OFFER' | 'REJECTED' | 'GHOSTED';

export type WorkMode = 'Remote' | 'Hybrid' | 'Onsite';

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string; // ISO
  message: string;
}

export interface Application {
  id: string;                 // crypto.randomUUID()
  company: string;
  role: string;
  workMode: WorkMode;
  status: ApplicationStatus;
  requiredSkills: string[];
  cvVersion?: string;
  appliedDate?: string;       // YYYY-MM-DD
  interviewDateTime?: string; // YYYY-MM-DDTHH:mm
  salaryOffer?: number;       // Rupiah
  createdAt: string;          // ISO
  lastUpdatedAt: string;      // ISO — basis Rawan Ghosting
  checklist: ChecklistItem[];
  activityLogs: ActivityLog[];
  jobId?: number;             // id lowongan asal (kalau dari Eksplorasi)
}

/** Data yang diisi user/eksplorasi saat membuat lamaran baru. */
export type NewApplicationInput = Pick<
  Application,
  'company' | 'role' | 'workMode' | 'status' | 'requiredSkills'
> &
  Partial<Pick<Application, 'cvVersion' | 'appliedDate' | 'jobId'>>;

/** Format 1 item lowongan (Remotive & fallback lokal sama). */
export interface JobListing {
  id: number;
  title: string;
  company_name: string;
  category: string;
  candidate_required_location: string;
  salary: string;
  tags: string[];
  url?: string;
}

export type JobSource = 'remotive' | 'fallback';
```

### 3.2 Hook state utama: `src/hooks/useApplications.ts` (ditulis Orang B)

```ts
export type AddResult = { ok: true; id: string } | { ok: false; error: 'DUPLICATE' | 'INVALID' };

export interface UseApplicationsResult {
  applications: Application[];
  addApplication: (input: NewApplicationInput) => AddResult;          // otomatis isi id, createdAt, lastUpdatedAt, checklist: [], activityLogs: [log "Lamaran dibuat"]
  updateApplication: (id: string, updater: (app: Application) => Application) => void; // updater WAJIB return objek baru
  removeApplication: (id: string) => Application | undefined;         // return data yang dihapus (untuk Undo)
  restoreApplication: (app: Application) => void;                     // kembalikan utuh (checklist + logs ikut)
  hasApplied: (company: string, role: string) => boolean;             // case-insensitive + trim
}
```

### 3.3 State global di `App.tsx` (Orang B) → dioper lewat props

```ts
const apps = useApplications();                                        // localStorage key: 'akm:applications'
const [kaptenSkills, setKaptenSkills] = useLocalStorage<string[]>(
  'akm:kaptenSkills', ['React', 'TypeScript', 'CSS']);
```
Tab navigasi: **Eksplorasi Lowongan** (A) | **Pipeline Lamaran** (B) | **Bandingkan Offer** (C). Kartu statistik (C) dan Banner Bentrok (B) tampil di atas semua tab. Modal Detail Lamaran (C) dibuka dari kartu War Room (B) via `selectedId` di App.

### 3.4 Signature helper bersama (`src/utils/`)

```ts
// utils/skillMatch.ts (A)
export function calcSkillMatch(kaptenSkills: string[], required: string[]):
  { score: number; matched: string[]; missing: string[] };   // score = Math.round(cocok/total*100), case-insensitive; required kosong → 0

// utils/duplicate.ts (A)
export function normalizeKey(company: string, role: string): string; // trim + lowercase, "company|role"

// utils/ghosting.ts (B)
export const GHOSTING_DAYS = 14;
export function isRawanGhosting(app: Application, now?: Date): boolean; // APPLIED/SCREENING && (now - lastUpdatedAt) > 14 hari

// utils/conflict.ts (B)
export function findInterviewConflicts(apps: Application[]): Array<[Application, Application]>; // status INTERVIEW, |selisih| < 60 menit

// utils/stateMachine.ts (C)
export const TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]>;
export function canTransition(from: ApplicationStatus, to: ApplicationStatus): boolean;
export function validateTransition(to: ApplicationStatus, data: Partial<Application>): string | null; // null = valid, string = pesan error

// utils/offerScore.ts (C)
export const WORK_MODE_SCORE: Record<WorkMode, number>; // Remote 100, Hybrid 75, Onsite 50
export function calcOfferScore(app: Application, maxSalary: number, matchScore: number):
  { salary: number; mode: number; skill: number; total: number }; // salary = salaryOffer/maxSalary*50, mode = modeScore*0.25, skill = match*0.25
```

> ⚠️ `TRANSITIONS` sementara (cek lagi dengan **Diagram State Machine** di soal asli sebelum final):
> WISHLIST → APPLIED, REJECTED · APPLIED → SCREENING, REJECTED, GHOSTED · SCREENING → INTERVIEW, REJECTED, GHOSTED · INTERVIEW → OFFER, REJECTED, GHOSTED · GHOSTED → SCREENING · OFFER → (final) · REJECTED → (final)

### 3.5 Aturan Main dari soal (rujukan cepat)

| Aturan | Ketentuan |
|---|---|
| Anti-duplikat | company + role sama tidak boleh 2x (case-insensitive) |
| Syarat status | APPLIED: cvVersion & appliedDate · INTERVIEW: interviewDateTime · OFFER: salaryOffer > 0 & workMode |
| Rawan Ghosting | APPLIED/SCREENING tidak berubah > 14 hari (derived) |
| Bentrok | ≥ 2 INTERVIEW selisih < 60 menit, cek dari SELURUH data, bukan data ter-filter |
| Match % | `Math.round((cocok/total)*100)`, case-insensitive. Badge: ≥70 hijau, 40–69 kuning, <40 merah |
| Undo | toast 5 detik, ID timeout di `useRef`, hapus 2x beruntun → `clearTimeout` yang lama |
| Skor Offer | Gaji ternormalisasi ×50% + Mode ×25% + Match ×25% |

## 4. Cara Kerja Kamu (Agent)

1. **Mulai dengan rencana singkat** (daftar file + urutan), lalu kerjakan satu file per langkah.
2. **Setiap selesai satu file**, beri penjelasan singkat pakai analogi sederhana (bahasa Indonesia santai): state apa yang dipegang, kenapa pakai hook itu, di mana cleanup-nya. Ini bahan demo.
3. Kode harus **sederhana dan mudah dijelaskan**. Hindari abstraksi berlebihan. Beri komentar singkat di bagian kunci (immutable update, cleanup, useRef, derived state).
4. Sementara file milik orang lain belum ada, boleh bikin **stub sementara** yang patuh kontrak di atas (misal `useApplications` dummy). **Tandai dengan `// TODO(stub): ganti dengan versi Orang X`** dan jangan di-commit ke `main`.
5. Kerja di branch sendiri, commit kecil dengan pesan jelas (`feat(explore): ...`, `fix(pipeline): ...`), lalu PR ke `main`.
6. Di akhir, keluarkan **checklist Definition of Done** milik role ini beserta status ✅/❌.
