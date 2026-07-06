import type { JSX } from 'preact';
import { COMPASS_ORDER, WIND_INFO, type Wind } from '../lib/model';
import { windLabel, type DisplayLang } from '../lib/prefs';

interface Props {
  lang: DisplayLang;
  onSelect: (wind: Wind) => void;
}

const C = 170;

function polar(r: number, deg: number): { x: number; y: number } {
  const rad = (deg * Math.PI) / 180;
  return { x: C + r * Math.cos(rad), y: C + r * Math.sin(rad) };
}

function kitePoints(deg: number): string {
  const tip = polar(110, deg);
  const left = polar(40, deg - 10);
  const tail = polar(14, deg);
  const right = polar(40, deg + 10);
  return [tip, left, tail, right].map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}

export function CompassRose({ lang, onSelect }: Props): JSX.Element {
  return (
    <svg
      class="compass-rose"
      viewBox="0 0 340 340"
      role="group"
      aria-label="Compass of the eight winds"
    >
      <circle cx={C} cy={C} r={118} class="rose-ring" />
      {COMPASS_ORDER.map((wind, i) => {
        const deg = -90 + i * 45;
        const label = windLabel(wind, lang);
        const lp = polar(138, deg);
        return (
          <g
            key={wind}
            role="button"
            tabIndex={0}
            aria-label={WIND_INFO[wind].en}
            class="rose-wind"
            onClick={() => {
              onSelect(wind);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(wind);
              }
            }}
          >
            <polygon
              points={kitePoints(deg)}
              class="rose-petal"
              style={`fill: var(--wind-${wind})`}
            />
            <text x={lp.x.toFixed(1)} y={lp.y.toFixed(1)} class="rose-label" text-anchor="middle">
              {label.primary}
            </text>
            <text
              x={lp.x.toFixed(1)}
              y={(lp.y + 13).toFixed(1)}
              class="rose-sublabel"
              text-anchor="middle"
            >
              {label.secondary}
            </text>
          </g>
        );
      })}
      <circle cx={C} cy={C} r={7} class="rose-hub" />
    </svg>
  );
}
