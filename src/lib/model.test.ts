import { describe, expect, it } from 'vitest';
import { at, makeEntry } from '../test/helpers';
import {
  COMPASS_ORDER,
  DOMAINS,
  INTENSITY_INFO,
  OPPOSITES,
  PAIRS,
  RESPONSES,
  RESPONSE_INFO,
  WINDS,
  WIND_INFO,
  isWindEntry,
} from './model';

describe('winds', () => {
  it('has exactly eight distinct winds', () => {
    expect(WINDS).toHaveLength(8);
    expect(new Set(WINDS).size).toBe(8);
  });

  it('pairs every wind with a distinct opposite, involutively', () => {
    for (const wind of WINDS) {
      const opposite = OPPOSITES[wind];
      expect(opposite).not.toBe(wind);
      expect(OPPOSITES[opposite]).toBe(wind);
    }
  });

  it('covers all eight winds in the four pairs', () => {
    expect(PAIRS).toHaveLength(4);
    const seen = new Set(PAIRS.flat());
    expect(seen.size).toBe(8);
  });

  it('places opposites across the compass from each other', () => {
    expect(COMPASS_ORDER).toHaveLength(8);
    expect(new Set(COMPASS_ORDER).size).toBe(8);
    for (let i = 0; i < 8; i++) {
      expect(OPPOSITES[at(COMPASS_ORDER, i)]).toBe(at(COMPASS_ORDER, (i + 4) % 8));
    }
  });

  it('has English and Pali labels for every wind', () => {
    for (const wind of WINDS) {
      expect(WIND_INFO[wind].en.length).toBeGreaterThan(0);
      expect(WIND_INFO[wind].pali.length).toBeGreaterThan(0);
    }
  });

  it('describes every wind in plain language', () => {
    for (const wind of WINDS) {
      const description = WIND_INFO[wind].description;
      expect(description.length).toBeGreaterThan(20);
      // Plain words, not doctrine: no Pali inside the descriptions.
      expect(description).not.toMatch(/[āṃṭḍṇḷ]/);
    }
  });
});

describe('responses and scales', () => {
  it('orders the four response qualities from swept to equanimous', () => {
    expect(RESPONSES).toEqual(['sweptAway', 'caughtLate', 'noticedArising', 'equanimous']);
    for (const r of RESPONSES) {
      expect(RESPONSE_INFO[r].label.length).toBeGreaterThan(0);
      expect(RESPONSE_INFO[r].description.length).toBeGreaterThan(0);
    }
  });

  it('has five intensity labels', () => {
    expect(INTENSITY_INFO).toHaveLength(5);
  });

  it('has six domains', () => {
    expect(DOMAINS).toHaveLength(6);
  });
});

describe('isWindEntry', () => {
  it('accepts a minimal valid entry', () => {
    expect(isWindEntry(makeEntry())).toBe(true);
  });

  it('accepts a full valid entry', () => {
    expect(isWindEntry(makeEntry({ note: 'a note', domain: 'work' }))).toBe(true);
  });

  it('rejects non-objects and near-misses', () => {
    expect(isWindEntry(null)).toBe(false);
    expect(isWindEntry('entry')).toBe(false);
    expect(isWindEntry({})).toBe(false);
    expect(isWindEntry({ ...makeEntry(), id: 42 })).toBe(false);
    expect(isWindEntry({ ...makeEntry(), wind: 'jealousy' })).toBe(false);
    expect(isWindEntry({ ...makeEntry(), intensity: 0 })).toBe(false);
    expect(isWindEntry({ ...makeEntry(), intensity: 6 })).toBe(false);
    expect(isWindEntry({ ...makeEntry(), intensity: 2.5 })).toBe(false);
    expect(isWindEntry({ ...makeEntry(), timestamp: 'yesterday' })).toBe(false);
    expect(isWindEntry({ ...makeEntry(), response: 'fine' })).toBe(false);
    expect(isWindEntry({ ...makeEntry(), note: 7 })).toBe(false);
    expect(isWindEntry({ ...makeEntry(), domain: 'submarine' })).toBe(false);
  });
});
