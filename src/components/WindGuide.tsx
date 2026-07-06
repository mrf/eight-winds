import type { JSX } from 'preact';
import { PAIRS, WIND_INFO } from '../lib/model';
import type { Wind } from '../lib/model';
import { windLabel, type DisplayLang } from '../lib/prefs';

interface Props {
  lang: DisplayLang;
  onSelect: (wind: Wind) => void;
}

/**
 * A plain-language introduction to the eight winds, grouped as the four
 * pairs. Each row is tappable, so the guide is also a way to log.
 */
export function WindGuide({ lang, onSelect }: Props): JSX.Element {
  return (
    <div class="wind-guide">
      <p class="quiet-note">
        Four pairs of conditions that blow through every life. Each wind arrives with its
        opposite never far behind. Tap one to log it.
      </p>
      {PAIRS.map(([a, b]) => (
        <div class="guide-pair" key={a}>
          {[a, b].map((wind) => {
            const label = windLabel(wind, lang);
            return (
              <button
                type="button"
                class="guide-wind"
                key={wind}
                onClick={() => {
                  onSelect(wind);
                }}
              >
                <span class="guide-name" style={`border-color: var(--wind-${wind})`}>
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
