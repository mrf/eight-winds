import type { JSX } from 'preact';
import { useState } from 'preact/hooks';
import { WindRoseChart } from '../components/WindRoseChart';
import { RESPONSES, RESPONSE_INFO, type WindEntry } from '../lib/model';
import { getLastBackupAt, windLabel, type DisplayLang } from '../lib/prefs';
import {
  entriesSince,
  equanimityPhrase,
  pairBalance,
  weeklyResponseBuckets,
  windCounts,
  type WeekBucket,
} from '../lib/stats';

interface Props {
  entries: readonly WindEntry[];
  lang: DisplayLang;
}

const PERIODS = [7, 30, 90] as const;
type Period = (typeof PERIODS)[number];

// A single-hue depth ramp, not a red/green judgment (§4.1): deeper ink as
// mindfulness arrives earlier.
const RESPONSE_OPACITY: Record<(typeof RESPONSES)[number], number> = {
  sweptAway: 0.15,
  caughtLate: 0.35,
  noticedArising: 0.6,
  equanimous: 0.85,
};

function TrendChart({ buckets }: { buckets: readonly WeekBucket[] }): JSX.Element {
  const maxTotal = Math.max(1, ...buckets.map((b) => b.total));
  const barWidth = 24;
  const gap = 13;
  const height = 110;
  return (
    <svg
      class="trend-chart"
      viewBox={`0 0 ${String(buckets.length * (barWidth + gap) + gap)} ${String(height)}`}
      role="img"
      aria-label="Response quality by week"
    >
      {buckets.map((bucket, i) => {
        const x = gap + i * (barWidth + gap);
        let y = height - 6;
        return (
          <g key={bucket.start}>
            <line x1={x} y1={height - 5} x2={x + barWidth} y2={height - 5} class="trend-base" />
            {RESPONSES.map((r) => {
              const h = (bucket.counts[r] / maxTotal) * (height - 16);
              if (h === 0) {
                return null;
              }
              y -= h;
              return (
                <rect
                  key={r}
                  x={x}
                  y={y.toFixed(1)}
                  width={barWidth}
                  height={h.toFixed(1)}
                  class="trend-segment"
                  opacity={RESPONSE_OPACITY[r]}
                />
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

export function Weather({ entries, lang }: Props): JSX.Element {
  const [period, setPeriod] = useState<Period>(30);
  const now = Date.now();
  const recent = entriesSince(entries, now, period);
  const phrase = equanimityPhrase(entries, now);
  const balance = pairBalance(entries);
  const lastBackupAt = getLastBackupAt();

  return (
    <section class="view-weather">
      <h2>Weather</h2>

      {entries.length === 0 ? (
        <p class="empty-note">Nothing yet. When a wind blows, log it on the compass.</p>
      ) : (
        <>
          <div class="chip-row" role="group" aria-label="Period">
            {PERIODS.map((p) => (
              <button
                type="button"
                key={p}
                class="chip"
                aria-pressed={period === p}
                onClick={() => {
                  setPeriod(p);
                }}
              >
                {p} days
              </button>
            ))}
          </div>

          {recent.length === 0 ? (
            <p class="empty-note">No winds logged in this period.</p>
          ) : (
            <WindRoseChart counts={windCounts(recent)} lang={lang} />
          )}

          <h3>How the mind has been meeting them</h3>
          {phrase !== null && <p class="gentle-phrase">{phrase}</p>}
          <TrendChart buckets={weeklyResponseBuckets(entries, now, 8)} />
          <ul class="trend-legend">
            {RESPONSES.map((r) => (
              <li key={r}>
                <span class="legend-swatch" style={`opacity: ${String(RESPONSE_OPACITY[r])}`} />
                {RESPONSE_INFO[r].label}
              </li>
            ))}
          </ul>

          <h3>The pairs</h3>
          <div class="pair-balance">
            {balance.map(({ pair, counts }) => {
              const total = counts[0] + counts[1];
              const leftShare = total === 0 ? 0.5 : counts[0] / total;
              return (
                <div class="pair-row" key={pair[0]}>
                  <span class="pair-label">
                    {windLabel(pair[0], lang).primary} {counts[0]}
                  </span>
                  <span class="pair-track">
                    <span class="pair-fill" style={`width: ${String(leftShare * 100)}%`} />
                  </span>
                  <span class="pair-label pair-label-right">
                    {counts[1]} {windLabel(pair[1], lang).primary}
                  </span>
                </div>
              );
            })}
          </div>
          <p class="quiet-note">
            Over long horizons, each wind and its opposite tend to arrive in equal measure.
          </p>

          <p class="quiet-note">
            Last saved:{' '}
            {lastBackupAt === null ? 'never' : new Date(lastBackupAt).toLocaleDateString()}
          </p>
        </>
      )}
    </section>
  );
}
