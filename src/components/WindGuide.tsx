import type { JSX } from 'preact';
import { PAIRS, WIND_INFO } from '../lib/model';
import type { Wind } from '../lib/model';
import { windLabel, type DisplayLang } from '../lib/prefs';

const DEFAULT_INTRO =
  'Four pairs of conditions that blow through every life. Each wind arrives with its ' +
  'opposite never far behind. Tap one to log it.';

interface Props {
  lang: DisplayLang;
  onSelect: (wind: Wind) => void;
  /** Lead-in line above the pairs; pass '' to omit. */
  intro?: string;
}

/**
 * A plain-language introduction to the eight winds, grouped as the four
 * pairs. Each row is tappable, so the guide is also a way to act.
 */
export function WindGuide({ lang, onSelect, intro = DEFAULT_INTRO }: Props): JSX.Element {
  return (
    <div class="wind-guide">
      {intro !== '' && <p class="quiet-note">{intro}</p>}
      {PAIRS.map(([a, b]) => (
        <div class="guide-pair" key={a}>
          {[a, b].map((wind) => {
            const label = windLabel(wind, lang);
            return (
              <button
                type="button"
                class="guide-wind"
                key={wind}
                style={`--wc: var(--wind-${wind})`}
                onClick={() => {
                  onSelect(wind);
                }}
              >
                <span class="guide-name">
                  {label.primary} <span class="sublabel">{label.secondary}</span>
                </span>
                <span class="guide-desc">{WIND_INFO[wind].description}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
