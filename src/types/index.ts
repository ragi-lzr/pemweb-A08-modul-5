
export type ApplicationStatus =
  | 'WISHLIST'
  | 'APPLIED'
  | 'SCREENING'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'GHOSTED';

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
  id: string; // crypto.randomUUID()
  company: string;
  role: string;
  workMode: WorkMode;
  status: ApplicationStatus;
  requiredSkills: string[];

  cvVersion?: string;
  appliedDate?: string; // YYYY-MM-DD
  interviewDateTime?: string; // YYYY-MM-DDTHH:mm
  salaryOffer?: number; // Rupiah

  createdAt: string; // ISO
  lastUpdatedAt: string; // ISO

  checklist: ChecklistItem[];
  activityLogs: ActivityLog[];

  jobId?: number;
}

/** Data yang diisi user/eksplorasi saat membuat lamaran baru. */
export type NewApplicationInput = Pick<
  Application,
  'company' | 'role' | 'workMode' | 'status' | 'requiredSkills'
> &
  Partial<Pick<Application, 'cvVersion' | 'appliedDate' | 'jobId'>>;

/** Format 1 item lowongan dari Remotive dan fallback lokal. */
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
