import { useCallback } from 'react';
import type { Application, NewApplicationInput } from '../types/index.js';
import { normalizeKey } from '../utils/duplicate.js';
import { useLocalStorage } from './useLocalStorage.js';

export type AddResult =
  | { ok: true; id: string }
  | { ok: false; error: 'DUPLICATE' | 'INVALID' };

export interface UseApplicationsResult {
  applications: Application[];
  addApplication: (input: NewApplicationInput) => AddResult;
  updateApplication: (
    id: string,
    updater: (application: Application) => Application
  ) => void;
  removeApplication: (id: string) => Application | undefined;
  restoreApplication: (application: Application) => void;
  hasApplied: (company: string, role: string) => boolean;
}

export function useApplications(): UseApplicationsResult {
  const [applications, setApplications] = useLocalStorage<Application[]>(
    'akm:applications',
    []
  );

  const addApplication = useCallback(
    (input: NewApplicationInput): AddResult => {
      const company = input.company.trim();
      const role = input.role.trim();

      if (
        !company ||
        !role ||
        (input.status === 'APPLIED' &&
          (!input.cvVersion?.trim() || !input.appliedDate))
      ) {
        return { ok: false, error: 'INVALID' };
      }

      const key = normalizeKey(company, role);
      const isDuplicate = applications.some(
        (application) => normalizeKey(application.company, application.role) === key
      );

      if (isDuplicate) {
        return { ok: false, error: 'DUPLICATE' };
      }

      const now = new Date().toISOString();
      const id = crypto.randomUUID();

      const newApplication: Application = {
        ...input,
        company,
        role,
        id,
        createdAt: now,
        lastUpdatedAt: now,
        checklist: [],
        activityLogs: [
          {
            id: crypto.randomUUID(),
            timestamp: now,
            message: `Lamaran dibuat dengan status ${input.status}`,
          },
        ],
      };

      setApplications((previous) => [newApplication, ...previous]);
      return { ok: true, id };
    },
    [applications, setApplications]
  );

  const updateApplication = useCallback(
    (id: string, updater: (application: Application) => Application) => {
      setApplications((previous) =>
        previous.map((application) =>
          application.id === id ? updater(application) : application
        )
      );
    },
    [setApplications]
  );

  const removeApplication = useCallback(
    (id: string): Application | undefined => {
      const removed = applications.find((application) => application.id === id);
      if (!removed) return undefined;

      setApplications((previous) =>
        previous.filter((application) => application.id !== id)
      );
      return removed;
    },
    [applications, setApplications]
  );

  const restoreApplication = useCallback(
    (application: Application) => {
      setApplications((previous) => {
        if (previous.some((item) => item.id === application.id)) {
          return previous;
        }
        return [application, ...previous];
      });
    },
    [setApplications]
  );

  const hasApplied = useCallback(
    (company: string, role: string): boolean => {
      const key = normalizeKey(company, role);
      return applications.some(
        (application) => normalizeKey(application.company, application.role) === key
      );
    },
    [applications]
  );

  return {
    applications,
    addApplication,
    updateApplication,
    removeApplication,
    restoreApplication,
    hasApplied,
  };
}
