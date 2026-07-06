import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { WindEntry } from './model';

interface EightWindsDB extends DBSchema {
  entries: {
    key: string;
    value: WindEntry;
    indexes: { 'by-timestamp': number };
  };
}

let dbPromise: Promise<IDBPDatabase<EightWindsDB>> | null = null;

function getDb(): Promise<IDBPDatabase<EightWindsDB>> {
  dbPromise ??= openDB<EightWindsDB>('eight-winds', 1, {
    upgrade(db) {
      const store = db.createObjectStore('entries', { keyPath: 'id' });
      store.createIndex('by-timestamp', 'timestamp');
    },
  });
  return dbPromise;
}

export async function addEntry(entry: WindEntry): Promise<void> {
  const db = await getDb();
  await db.add('entries', entry);
}

export async function getAllEntries(): Promise<WindEntry[]> {
  const db = await getDb();
  return db.getAllFromIndex('entries', 'by-timestamp');
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('entries', id);
}

export async function importEntries(
  entries: readonly WindEntry[],
): Promise<{ added: number; skipped: number }> {
  const db = await getDb();
  const tx = db.transaction('entries', 'readwrite');
  let added = 0;
  let skipped = 0;
  for (const entry of entries) {
    const existing = await tx.store.getKey(entry.id);
    if (existing === undefined) {
      await tx.store.add(entry);
      added++;
    } else {
      skipped++;
    }
  }
  await tx.done;
  return { added, skipped };
}

export function resetDbForTests(): void {
  dbPromise = null;
}
