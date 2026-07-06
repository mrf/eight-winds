import { describe, expect, it } from 'vitest';
import { ulid, ulidTime } from './ulid';

describe('ulid', () => {
  it('produces 26 characters of Crockford base32', () => {
    const id = ulid();
    expect(id).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
  });

  it('round-trips the timestamp', () => {
    const t = 1_719_999_999_999;
    expect(ulidTime(ulid(t))).toBe(t);
  });

  it('sorts lexicographically by time', () => {
    expect(ulid(1_000_000_000_000) < ulid(1_500_000_000_000)).toBe(true);
  });

  it('is monotonic within the same millisecond', () => {
    const t = 1_600_000_000_000;
    const a = ulid(t);
    const b = ulid(t);
    expect(b > a).toBe(true);
    expect(ulidTime(b)).toBe(t);
  });

  it('never collides across many generations', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      ids.add(ulid());
    }
    expect(ids.size).toBe(1000);
  });
});
