import { beforeEach, describe, expect, it } from 'vitest';
import { makeEntry, resetIndexedDb } from '../test/helpers';
import { addEntry, deleteEntry, getAllEntries, importEntries, resetDbForTests } from './db';

beforeEach(() => {
  resetDbForTests();
  resetIndexedDb();
});

describe('entry storage', () => {
  it('stores and retrieves an entry', async () => {
    const entry = makeEntry({ note: 'praise at standup' });
    await addEntry(entry);
    expect(await getAllEntries()).toEqual([entry]);
  });

  it('returns entries in ascending timestamp order regardless of insert order', async () => {
    const later = makeEntry({ timestamp: 3_000_000 });
    const earliest = makeEntry({ timestamp: 1_000_000 });
    const middle = makeEntry({ timestamp: 2_000_000 });
    await addEntry(later);
    await addEntry(earliest);
    await addEntry(middle);
    const all = await getAllEntries();
    expect(all.map((e) => e.timestamp)).toEqual([1_000_000, 2_000_000, 3_000_000]);
  });

  it('deletes an entry by id', async () => {
    const keep = makeEntry();
    const drop = makeEntry();
    await addEntry(keep);
    await addEntry(drop);
    await deleteEntry(drop.id);
    expect(await getAllEntries()).toEqual([keep]);
  });
});

describe('importEntries', () => {
  it('adds new entries and reports the count', async () => {
    const a = makeEntry();
    const b = makeEntry();
    expect(await importEntries([a, b])).toEqual({ added: 2, skipped: 0 });
    expect(await getAllEntries()).toHaveLength(2);
  });

  it('skips entries whose ids are already present', async () => {
    const a = makeEntry();
    const b = makeEntry();
    await addEntry(a);
    expect(await importEntries([a, b])).toEqual({ added: 1, skipped: 1 });
    expect(await getAllEntries()).toHaveLength(2);
  });

  it('re-importing a full export is a no-op', async () => {
    const entries = [makeEntry(), makeEntry(), makeEntry()];
    await importEntries(entries);
    expect(await importEntries(entries)).toEqual({ added: 0, skipped: 3 });
    expect(await getAllEntries()).toHaveLength(3);
  });
});
