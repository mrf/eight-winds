import { beforeEach, describe, expect, it } from 'vitest';
import {
  getDisplayLang,
  getIntroSeen,
  getLastBackupAt,
  setDisplayLang,
  setIntroSeen,
  setLastBackupAt,
  windLabel,
} from './prefs';

beforeEach(() => {
  localStorage.clear();
});

describe('display language', () => {
  it('defaults to English-primary', () => {
    expect(getDisplayLang()).toBe('english');
  });

  it('persists a Pali-primary preference', () => {
    setDisplayLang('pali');
    expect(getDisplayLang()).toBe('pali');
  });

  it('ignores corrupted stored values', () => {
    localStorage.setItem('ew.display', 'klingon');
    expect(getDisplayLang()).toBe('english');
  });
});

describe('windLabel', () => {
  it('puts English first by default', () => {
    expect(windLabel('gain', 'english')).toEqual({ primary: 'Gain', secondary: 'lābha' });
  });

  it('puts Pali first when preferred', () => {
    expect(windLabel('gain', 'pali')).toEqual({ primary: 'lābha', secondary: 'Gain' });
  });
});

describe('intro', () => {
  it('is unseen by default', () => {
    expect(getIntroSeen()).toBe(false);
  });

  it('remembers dismissal', () => {
    setIntroSeen();
    expect(getIntroSeen()).toBe(true);
  });
});

describe('last backup', () => {
  it('is null before any backup', () => {
    expect(getLastBackupAt()).toBeNull();
  });

  it('round-trips a timestamp', () => {
    setLastBackupAt(1_750_000_000_000);
    expect(getLastBackupAt()).toBe(1_750_000_000_000);
  });
});
