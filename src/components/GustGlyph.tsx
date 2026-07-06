import type { JSX } from 'preact';
import type { Intensity } from '../lib/model';

interface Props {
  intensity: Intensity;
}

/**
 * A wind glyph: one flowing stroke per level of intensity, longer and more
 * numerous as the wind strengthens. Purely decorative — the button's text
 * label carries the meaning.
 */
export function GustGlyph({ intensity }: Props): JSX.Element {
  const strokes = [];
  for (let i = 0; i < intensity; i++) {
    // Center the strokes vertically; alternate lengths and starts so the
    // gust reads as weather, not a barcode.
    const y = 20 + (i - (intensity - 1) / 2) * 7;
    const len = 38 + intensity * 9 - (i % 2) * 10;
    const x0 = 6 + (i % 3) * 4;
    const half = len / 2;
    const d = `M ${String(x0)} ${String(y)} q ${String(half * 0.5)} -5 ${String(half)} 0 t ${String(half)} 0`;
    strokes.push(
      <path key={i} class="gust-stroke" d={d} pathLength={100} style={`--s: ${String(i)}`} />,
    );
  }
  return (
    <svg class="gust" viewBox="0 0 96 40" aria-hidden="true">
      {strokes}
    </svg>
  );
}
