
export function normalizeKey(company: string, role: string): string {
  return `${company.trim().toLowerCase()}|${role.trim().toLowerCase()}`;
}

/** true kalau sudah ada lamaran dengan company + role sama (case-insensitive, trim). */
export function isDuplicate(
  apps: ReadonlyArray<{ company: string; role: string }>,
  company: string,
  role: string
): boolean {
  const key = normalizeKey(company, role);
  return apps.some((app) => normalizeKey(app.company, app.role) === key);
}
