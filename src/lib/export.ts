import { isWindEntry, type WindEntry } from './model';

interface ExportEnvelope {
  app: 'eight-winds';
  version: 1;
  exportedAt: string;
  entries: WindEntry[];
}

export function exportJson(entries: readonly WindEntry[]): string {
  const envelope: ExportEnvelope = {
    app: 'eight-winds',
    version: 1,
    exportedAt: new Date().toISOString(),
    entries: [...entries],
  };
  return JSON.stringify(envelope, null, 2);
}

function csvField(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

export function exportCsv(entries: readonly WindEntry[]): string {
  const header = 'id,timestamp,iso,wind,intensity,response,domain,note';
  const rows = entries.map((e) =>
    [
      e.id,
      String(e.timestamp),
      new Date(e.timestamp).toISOString(),
      e.wind,
      String(e.intensity),
      e.response,
      e.domain ?? '',
      csvField(e.note ?? ''),
    ].join(','),
  );
  return [header, ...rows].join('\n') + '\n';
}

export function exportFilename(now: number, ext: 'json' | 'csv'): string {
  const d = new Date(now);
  const y = String(d.getFullYear());
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `eight-winds-${y}-${m}-${day}.${ext}`;
}

/**
 * Parse an import file: either a full export envelope or a bare entry array.
 * Throws with a human-readable message on anything invalid.
 */
export function parseImport(text: string): WindEntry[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('This file is not valid JSON.');
  }

  let list: unknown;
  if (Array.isArray(parsed)) {
    list = parsed;
  } else if (typeof parsed === 'object' && parsed !== null && 'entries' in parsed) {
    list = (parsed as Record<string, unknown>)['entries'];
  }
  if (!Array.isArray(list)) {
    throw new Error('This file does not look like an Eight Winds export.');
  }

  return list.map((item: unknown, i) => {
    if (!isWindEntry(item)) {
      throw new Error(`Entry ${String(i + 1)} is not a valid wind entry.`);
    }
    return item;
  });
}
