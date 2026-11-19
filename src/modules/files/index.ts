import { displayName, extensionOf, FileKind, matchesKind, matchesQuery } from './fileTypes';

export * from './fileTypes';

/**
 * File Management Engine - built on Android's Storage Access Framework.
 *
 * Android 11+ scoped storage means an app cannot freely search the phone.
 * The user chooses ONE folder (e.g. Documents) once; the assistant can then
 * search, create folders in, and delete files inside that folder tree only.
 * Rename/move/organise are NOT implemented: the SAF helper in Expo cannot rename,
 * so that needs a small native module (planned, see docs/ARCHITECTURE.md).
 */
let FS: any;
try {
  // SDK 54+ keeps the SAF API in the "legacy" entry point.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  FS = require('expo-file-system/legacy');
} catch {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  FS = require('expo-file-system');
}
const SAF = () => FS.StorageAccessFramework;

export interface FileEntry {
  uri: string;
  name: string;
}

export async function pickFolder(): Promise<string | null> {
  const p = await SAF().requestDirectoryPermissionsAsync();
  return p.granted ? (p.directoryUri as string) : null;
}

export interface SearchOptions {
  kind: FileKind;
  query: string;
  maxResults?: number;
  maxDepth?: number;
  maxScanned?: number;
}

/**
 * Breadth-first search. SAF gives no "is directory" flag cheaply, so an entry
 * with a file extension is treated as a file and one without as a folder.
 */
export async function searchFiles(rootUri: string, opts: SearchOptions): Promise<FileEntry[]> {
  const { kind, query, maxResults = 20, maxDepth = 5, maxScanned = 4000 } = opts;
  const queue: { uri: string; depth: number }[] = [{ uri: rootUri, depth: 0 }];
  const results: FileEntry[] = [];
  let scanned = 0;

  while (queue.length && results.length < maxResults && scanned < maxScanned) {
    const { uri, depth } = queue.shift()!;
    let children: string[];
    try {
      children = await SAF().readDirectoryAsync(uri);
    } catch {
      continue;
    }
    for (const child of children) {
      scanned++;
      const name = displayName(child);
      if (extensionOf(name)) {
        if (matchesKind(name, kind) && matchesQuery(name, query)) results.push({ uri: child, name });
      } else if (depth < maxDepth) {
        queue.push({ uri: child, depth: depth + 1 });
      }
      if (results.length >= maxResults) break;
    }
  }
  return results.sort((a, b) => a.name.localeCompare(b.name));
}

export async function createFolder(parentUri: string, name: string): Promise<string> {
  const safe = name.replace(/[\\/:*?"<>|]/g, '').trim();
  if (!safe) throw new Error('Invalid folder name');
  return SAF().makeDirectoryAsync(parentUri, safe);
}

export async function deleteEntry(uri: string): Promise<void> {
  await FS.deleteAsync(uri, { idempotent: true });
}
