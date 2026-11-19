/** Phone-number helpers (pure). */

/** Digits only for wa.me links (international format, no +). Returns null if it cannot be made international. */
export function normalizePhone(raw: string, countryCode = ''): string | null {
  const cc = countryCode.replace(/\D/g, '');
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return null;
  if (trimmed.startsWith('+')) return digits;
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith('0')) return cc ? cc + digits.slice(1) : null;
  return digits;
}

/** Value for a tel: link: keep a leading + and digits. */
export function toDialable(raw: string): string {
  return raw.replace(/[^\d+]/g, '');
}
