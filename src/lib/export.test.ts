import { describe, expect, it } from 'vitest';
import { makeEntry } from '../test/helpers';
import { exportCsv, exportFilename, exportJson, parseImport } from './export';

describe('exportJson / parseImport', () => {
  it('round-trips entries through a wrapped export', () => {
    const entries = [makeEntry({ note: 'gain at work' }), makeEntry({ domain: 'family' })];
    const text = exportJson(entries);
    const parsed: unknown = JSON.parse(text);
    expect(parsed).toMatchObject({ app: 'eight-winds', version: 1 });
    expect(parseImport(text)).toEqual(entries);
  });

  it('accepts a bare array of entries', () => {
    const entries = [makeEntry()];
    expect(parseImport(JSON.stringify(entries))).toEqual(entries);
  });

  it('rejects malformed JSON', () => {
    expect(() => parseImport('not json at all')).toThrow();
  });

  it('rejects JSON that is not an entry collection', () => {
    expect(() => parseImport('{"hello":"world"}')).toThrow();
    expect(() => parseImport('42')).toThrow();
  });

  it('rejects a collection containing an invalid entry, naming its position', () => {
    const text = JSON.stringify([makeEntry(), { id: 'x', wind: 'jealousy' }]);
    expect(() => parseImport(text)).toThrow(/entry 2/i);
  });
});

describe('exportCsv', () => {
  it('emits a header plus one row per entry', () => {
    const csv = exportCsv([makeEntry(), makeEntry()]);
    expect(csv.trimEnd().split('\n')).toHaveLength(3);
    expect(csv.startsWith('id,timestamp,iso,wind,intensity,response,domain,note')).toBe(true);
  });

  it('escapes quotes, commas, and newlines in notes', () => {
    const csv = exportCsv([makeEntry({ note: 'a "quoted" note, with\nnewline' })]);
    expect(csv).toContain('"a ""quoted"" note, with\nnewline"');
  });
});

describe('exportFilename', () => {
  it('names files by app and date', () => {
    expect(exportFilename(new Date(2026, 6, 6, 12).getTime(), 'json')).toBe('eight-winds-2026-07-06.json');
    expect(exportFilename(new Date(2026, 0, 3, 12).getTime(), 'csv')).toBe('eight-winds-2026-01-03.csv');
  });
});
