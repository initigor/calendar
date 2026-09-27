// Supabase Auth is email-based under the hood, but the app only ever shows a
// username. We map username -> a synthetic, undeliverable email deterministically
// so the same username always resolves to the same Supabase Auth account.
const EMAIL_DOMAIN = "kalender.local";

const USERNAME_PATTERN = /^[a-z0-9_.]{3,20}$/;

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidUsername(username: string): boolean {
  return USERNAME_PATTERN.test(username);
}

export function usernameToEmail(username: string): string {
  return `${username}@${EMAIL_DOMAIN}`;
}

export const USERNAME_RULES_LABEL =
  "3-20 karakter: huruf kecil, angka, titik, atau underscore";
