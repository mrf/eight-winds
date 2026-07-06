import { describe, expect, it } from 'vitest';
import { at, makeEntry } from '../test/helpers';
import type { WindEntry } from './model';
import {
  entriesSince,
  equanimityPhrase,
  pairBalance,
  patternInsights,
  shouldRemindBackup,
  weeklyResponseBuckets,
  windCounts,
} from './stats';

const DAY = 86_400_000;
// Local-time constructor keeps weekday math stable across timezones.
// 2026-07-06 is a Monday.
const NOW = new Date(2026, 6, 6, 12, 0, 0).getTime();

function daysAgo(n: number): number {
  return NOW - n * DAY;
}

describe('entriesSince', () => {
  it('keeps entries at or after the cutoff and drops older ones', () => {
    const inside = makeEntry({ timestamp: daysAgo(6) });
    const boundary = makeEntry({ timestamp: daysAgo(7) });
    const outside = makeEntry({ timestamp: daysAgo(7) - 1 });
    expect(entriesSince([inside, boundary, outside], NOW, 7)).toEqual([inside, boundary]);
  });
});

describe('windCounts', () => {
  it('counts entries per wind, with zeroes for silent winds', () => {
    const counts = windCounts([
      makeEntry({ wind: 'praise' }),
      makeEntry({ wind: 'praise' }),
      makeEntry({ wind: 'loss' }),
    ]);
    expect(counts.praise).toBe(2);
    expect(counts.loss).toBe(1);
    expect(counts.gain).toBe(0);
  });
});

describe('pairBalance', () => {
  it('reports counts for each side of all four pairs', () => {
    const balance = pairBalance([
      makeEntry({ wind: 'gain' }),
      makeEntry({ wind: 'gain' }),
      makeEntry({ wind: 'loss' }),
      makeEntry({ wind: 'blame' }),
    ]);
    expect(balance).toHaveLength(4);
    const gainLoss = at(
      balance.filter((b) => b.pair[0] === 'gain'),
      0,
    );
    expect(gainLoss.counts).toEqual([2, 1]);
    const praiseBlame = at(
      balance.filter((b) => b.pair[0] === 'praise'),
      0,
    );
    expect(praiseBlame.counts).toEqual([0, 1]);
  });
});

describe('weeklyResponseBuckets', () => {
  it('returns one bucket per requested week, oldest first', () => {
    const buckets = weeklyResponseBuckets([], NOW, 8);
    expect(buckets).toHaveLength(8);
    expect(buckets.every((b) => b.total === 0)).toBe(true);
  });

  it('buckets entries into their local Monday-start weeks', () => {
    const thisWeek = makeEntry({ timestamp: NOW, response: 'equanimous' });
    const lastWeek = makeEntry({ timestamp: daysAgo(7), response: 'sweptAway' });
    const buckets = weeklyResponseBuckets([thisWeek, lastWeek], NOW, 4);
    expect(buckets).toHaveLength(4);
    expect(at(buckets, 3).counts.equanimous).toBe(1);
    expect(at(buckets, 3).total).toBe(1);
    expect(at(buckets, 2).counts.sweptAway).toBe(1);
    expect(at(buckets, 0).total).toBe(0);
  });
});

describe('equanimityPhrase', () => {
  it('stays silent with too few entries', () => {
    const few = [makeEntry({ timestamp: daysAgo(1), response: 'equanimous' })];
    expect(equanimityPhrase(few, NOW)).toBeNull();
  });

  it('notices when mindfulness is arriving earlier', () => {
    const entries: WindEntry[] = [];
    for (let i = 0; i < 6; i++) {
      entries.push(makeEntry({ timestamp: daysAgo(40 - i), response: 'sweptAway' }));
    }
    for (let i = 0; i < 6; i++) {
      entries.push(makeEntry({ timestamp: daysAgo(6 - i), response: 'noticedArising' }));
    }
    expect(equanimityPhrase(entries, NOW)).toContain('earlier');
  });

  it('never scolds: a rough stretch yields silence, not judgment', () => {
    const entries: WindEntry[] = [];
    for (let i = 0; i < 6; i++) {
      entries.push(makeEntry({ timestamp: daysAgo(40 - i), response: 'equanimous' }));
    }
    for (let i = 0; i < 6; i++) {
      entries.push(makeEntry({ timestamp: daysAgo(6 - i), response: 'sweptAway' }));
    }
    expect(equanimityPhrase(entries, NOW)).toBeNull();
  });
});

describe('patternInsights', () => {
  it('returns nothing for an empty record', () => {
    expect(patternInsights([], NOW)).toEqual([]);
  });

  it('returns nothing when data is thin', () => {
    expect(patternInsights([makeEntry({ timestamp: daysAgo(1), wind: 'blame' })], NOW)).toEqual([]);
  });

  it('asks about weekday clustering when a wind blows on workdays', () => {
    // NOW is a Monday; daysAgo(0, 3, 4, 5, 6, 7) are Mon, Fri, Thu, Wed, Tue, Mon.
    const entries = [0, 3, 4, 5, 6, 7].map((d) =>
      makeEntry({ timestamp: daysAgo(d), wind: 'blame', response: 'caughtLate' }),
    );
    const insights = patternInsights(entries, NOW);
    expect(insights.length).toBeGreaterThan(0);
    expect(insights.join(' ')).toContain('Blame');
    for (const insight of insights) {
      expect(insight.endsWith('?')).toBe(true);
    }
  });

  it('never surfaces more than two questions', () => {
    const entries: WindEntry[] = [];
    for (let i = 0; i < 10; i++) {
      entries.push(
        makeEntry({ timestamp: daysAgo(i % 5), wind: 'blame', domain: 'work', response: 'caughtLate' }),
      );
      entries.push(
        makeEntry({ timestamp: daysAgo(i % 5), wind: 'praise', domain: 'online', response: 'sweptAway' }),
      );
    }
    expect(patternInsights(entries, NOW).length).toBeLessThanOrEqual(2);
  });
});

describe('shouldRemindBackup', () => {
  it('never reminds when there is nothing to back up', () => {
    expect(shouldRemindBackup([], null, NOW)).toBe(false);
  });

  it('reminds when a record has never been saved and is getting old', () => {
    const entries = [makeEntry({ timestamp: daysAgo(20) })];
    expect(shouldRemindBackup(entries, null, NOW)).toBe(true);
  });

  it('stays quiet when a young record has never been saved', () => {
    const entries = [makeEntry({ timestamp: daysAgo(2) })];
    expect(shouldRemindBackup(entries, null, NOW)).toBe(false);
  });

  it('reminds roughly monthly after a backup', () => {
    const entries = [makeEntry({ timestamp: daysAgo(60) })];
    expect(shouldRemindBackup(entries, daysAgo(10), NOW)).toBe(false);
    expect(shouldRemindBackup(entries, daysAgo(31), NOW)).toBe(true);
  });
});
