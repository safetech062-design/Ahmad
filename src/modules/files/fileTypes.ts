/** File matching helpers (pure). */
export type FileKind = 'excel' | 'pdf' | 'image' | 'document' | 'any';

export const EXT_BY_KIND: Record<Exclude<FileKind, 'any'>, string[]> = {
  excel: ['xlsx', 'xls', 'xlsm', 'xlsb', 'csv'],
  pdf: ['pdf'],
  image: ['jpg', 'jpeg', 'png', 'webp', 'heic', 'gif', 'bmp'],
  document: ['doc', 'docx', 'txt', 'odt', 'rtf', 'ppt', 'pptx'],
};

export function normalizeKind(raw: unknown): FileKind {
  const s = String(raw ?? '').toLowerCase();
  if (/excel|spreadsheet|xls|csv|sheet/.test(s)) return 'excel';
  if (/pdf/.test(s)) return 'pdf';
  if (/image|photo|picture|png|jpg|jpeg/.test(s)) return 'image';
  if (/doc|word|text|slide|presentation/.test(s)) return 'document';
  return 'any';
}

export function extensionOf(name: string): string {
  const i = name.lastIndexOf('.');
  return i > 0 && i < name.length - 1 ? name.slice(i + 1).toLowerCase() : '';
}

export function matchesKind(name: string, kind: FileKind): boolean {
  if (kind === 'any') return true;
  return EXT_BY_KIND[kind].includes(extensionOf(name));
}

/** Every word of the query must appear in the name (case-insensitive). Empty query matches all. */
export function matchesQuery(name: string, query: string): boolean {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const n = name.toLowerCase();
  return words.every((w) => n.includes(w));
}

/** Last path segment of a (possibly URL-encoded) Storage Access Framework URI. */
export function displayName(uri: string): string {
  let decoded = uri;
  try {
    decoded = decodeURIComponent(uri);
  } catch {
    /* keep raw */
  }
  const parts = decoded.split(/[/:]/);
  return parts[parts.length - 1] || decoded;
}
