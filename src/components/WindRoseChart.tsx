import type { JSX } from 'preact';
import { COMPASS_ORDER, type Wind } from '../lib/model';
import { windLabel, type DisplayLang } from '../lib/prefs';

interface Props {
  counts: Record<Wind, number>;
  lang: DisplayLang;
}

const C = 150;

function polar(r: number, deg: number): { x: number; y: number } {
  const rad = (deg * Math.PI) / 180;
  return { x: C + r * Math.cos(rad), y: C + r * Math.sin(rad) };
}

function petalPoints(deg: number, r: number): string {
  const tip = polar(r, deg);
  const left = polar(14, deg - 14);
  const right = polar(14, deg + 14);
  return [tip, left, right].map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}

export function WindRoseChart({ counts, lang }: Props): JSX.Element {
  const max = Math.max(1, ...Object.values(counts));
  return (
    <svg
      class="windrose-chart"
      viewBox="0 0 300 300"
      role="img"
      aria-label="Wind rose of recent entries"
    >
      {COMPASS_ORDER.map((wind, i) => {
        const deg = -90 + i * 45;
        const guide = polar(104, deg);
        const lp = polar(120, deg);
        const count = counts[wind];
        const label = windLabel(wind, lang);
        return (
          <g
            key={wind}
            class="windrose-wind"
            style={`--wc: var(--wind-${wind}); --i: ${String(i)}`}
          >
            <line
              x1={C}
              y1={C}
              x2={guide.x.toFixed(1)}
              y2={guide.y.toFixed(1)}
              class="windrose-spoke"
            />
            {count > 0 && (
              <polygon points={petalPoints(deg, 16 + (count / max) * 84)} class="windrose-petal" />
            )}
            <text x={lp.x.toFixed(1)} y={lp.y.toFixed(1)} class="windrose-label" text-anchor="middle">
              {label.primary}
            </text>
            {count > 0 && (
              <text
                x={lp.x.toFixed(1)}
                y={(lp.y + 11).toFixed(1)}
                class="windrose-count"
                text-anchor="middle"
              >
                {count}
              </text>
            )}
          </g>
        );
      })}
      <circle cx={C} cy={C} r={4} class="rose-hub" />
    </svg>
  );
}
