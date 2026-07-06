import {
  PAIRS,
  RESPONSES,
  WINDS,
  WIND_INFO,
  type ResponseQuality,
  type Wind,
  type WindEntry,
} from './model';

const DAY = 86_400_000;

export function entriesSince(
  entries: readonly WindEntry[],
  now: number,
  days: number,
): WindEntry[] {
  const cutoff = now - days * DAY;
  return entries.filter((e) => e.timestamp >= cutoff);
}

export function windCounts(entries: readonly WindEntry[]): Record<Wind, number> {
  const counts = Object.fromEntries(WINDS.map((w) => [w, 0])) as Record<Wind, number>;
  for (const entry of entries) {
    counts[entry.wind] += 1;
  }
  return counts;
}

export interface PairBalance {
  pair: readonly [Wind, Wind];
  counts: [number, number];
}

export function pairBalance(entries: readonly WindEntry[]): PairBalance[] {
  const counts = windCounts(entries);
  return PAIRS.map((pair) => ({ pair, counts: [counts[pair[0]], counts[pair[1]]] }));
}

/** Start of the local Monday-based week containing `ts`. */
function weekStart(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.getTime();
}

export interface WeekBucket {
  start: number;
  counts: Record<ResponseQuality, number>;
  total: number;
}

export function weeklyResponseBuckets(
  entries: readonly WindEntry[],
  now: number,
  weeks: number,
): WeekBucket[] {
  const buckets: WeekBucket[] = [];
  const byStart = new Map<number, WeekBucket>();
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(weekStart(now));
    d.setDate(d.getDate() - 7 * i);
    const bucket: WeekBucket = {
      start: d.getTime(),
      counts: Object.fromEntries(RESPONSES.map((r) => [r, 0])) as Record<ResponseQuality, number>,
      total: 0,
    };
    buckets.push(bucket);
    byStart.set(bucket.start, bucket);
  }
  for (const entry of entries) {
    const bucket = byStart.get(weekStart(entry.timestamp));
    if (bucket) {
      bucket.counts[entry.response] += 1;
      bucket.total += 1;
    }
  }
  return buckets;
}

const SETTLED: readonly ResponseQuality[] = ['noticedArising', 'equanimous'];

function settledShare(entries: readonly WindEntry[]): number {
  if (entries.length === 0) {
    return 0;
  }
  const settled = entries.filter((e) => SETTLED.includes(e.response)).length;
  return settled / entries.length;
}

/**
 * A gentle observation about the recent direction of practice, or null.
 * Deliberately one-sided: it notices improvement and is otherwise silent —
 * the app never scolds (§4.2).
 */
export function equanimityPhrase(entries: readonly WindEntry[], now: number): string | null {
  const recent = entriesSince(entries, now, 56).sort((a, b) => a.timestamp - b.timestamp);
  if (recent.length < 10) {
    return null;
  }
  const half = Math.floor(recent.length / 2);
  const earlier = settledShare(recent.slice(0, half));
  const later = settledShare(recent.slice(half));
  if (later - earlier >= 0.15) {
    return 'Mindfulness has been arriving earlier.';
  }
  return null;
}

const MIN_PATTERN_ENTRIES = 6;

/**
 * Sparse pattern observations, always phrased as questions, never diagnoses
 * (§3.3). At most two are surfaced; thin data yields none.
 */
export function patternInsights(entries: readonly WindEntry[], now: number): string[] {
  const recent = entriesSince(entries, now, 30);
  const insights: string[] = [];

  for (const wind of WINDS) {
    const forWind = recent.filter((e) => e.wind === wind);
    if (forWind.length < MIN_PATTERN_ENTRIES) {
      continue;
    }
    const name = WIND_INFO[wind].en;

    const weekdays = forWind.filter((e) => {
      const day = new Date(e.timestamp).getDay();
      return day >= 1 && day <= 5;
    }).length;
    if (weekdays / forWind.length >= 0.75) {
      insights.push(`${name} entries cluster on weekdays. What is different about those days?`);
    } else if ((forWind.length - weekdays) / forWind.length >= 0.75) {
      insights.push(`${name} entries cluster on weekends. What is different about those days?`);
    }

    const byDomain = new Map<string, number>();
    for (const e of forWind) {
      if (e.domain !== undefined) {
        byDomain.set(e.domain, (byDomain.get(e.domain) ?? 0) + 1);
      }
    }
    for (const [domain, count] of byDomain) {
      if (count / forWind.length >= 0.6) {
        insights.push(`${name} tends to blow through '${domain}'. What happens just before?`);
      }
    }

    const caughtLate = forWind.filter((e) => e.response === 'caughtLate').length;
    if (caughtLate / forWind.length >= 0.6) {
      insights.push(
        `${name} entries are usually 'caught, then noticed'. What does the moment before the catch feel like?`,
      );
    }
  }

  return insights.slice(0, 2);
}

const NEVER_BACKED_UP_GRACE = 14 * DAY;
const BACKUP_INTERVAL = 30 * DAY;

export function shouldRemindBackup(
  entries: readonly WindEntry[],
  lastBackupAt: number | null,
  now: number,
): boolean {
  if (entries.length === 0) {
    return false;
  }
  if (lastBackupAt === null) {
    const oldest = Math.min(...entries.map((e) => e.timestamp));
    return now - oldest > NEVER_BACKED_UP_GRACE;
  }
  return now - lastBackupAt > BACKUP_INTERVAL;
}
