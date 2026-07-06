import type { JSX } from 'preact';
import { useState } from 'preact/hooks';
import { WindGuide } from '../components/WindGuide';
import {
  COMPASS_ORDER,
  INTENSITIES,
  RESPONSES,
  RESPONSE_INFO,
  type Intensity,
  type ResponseQuality,
  type Wind,
  type WindEntry,
} from '../lib/model';
import { windLabel, type DisplayLang } from '../lib/prefs';
import { patternInsights } from '../lib/stats';
import { ulid } from '../lib/ulid';

interface Props {
  entries: readonly WindEntry[];
  lang: DisplayLang;
  onSave: (entry: WindEntry) => Promise<void>;
}

interface QuickSpec {
  intensity: Intensity;
  response: ResponseQuality;
}

const DEFAULT_SPEC: QuickSpec = { intensity: 3, response: 'caughtLate' };

export function Reflect({ entries, lang, onSave }: Props): JSX.Element {
  const [selected, setSelected] = useState<readonly Wind[]>([]);
  const [specs, setSpecs] = useState<Partial<Record<Wind, QuickSpec>>>({});
  const [status, setStatus] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);

  const insights = patternInsights(entries, Date.now());

  const toggle = (wind: Wind): void => {
    setStatus(null);
    setSelected((prev) =>
      prev.includes(wind) ? prev.filter((w) => w !== wind) : [...prev, wind],
    );
  };

  const patch = (wind: Wind, change: Partial<QuickSpec>): void => {
    setSpecs((prev) => ({ ...prev, [wind]: { ...(prev[wind] ?? DEFAULT_SPEC), ...change } }));
  };

  const saveAll = (): void => {
    const winds = selected;
    void (async () => {
      for (const wind of winds) {
        const spec = specs[wind] ?? DEFAULT_SPEC;
        await onSave({
          id: ulid(),
          timestamp: Date.now(),
          wind,
          intensity: spec.intensity,
          response: spec.response,
        });
      }
      setSelected([]);
      setSpecs({});
      setStatus('Recorded.');
    })();
  };

  return (
    <section class="view-reflect">
      <h2>Reflect</h2>
      <p class="compass-prompt">Which winds blew today?</p>

      <div class="chip-row">
        {COMPASS_ORDER.map((wind) => (
          <button
            type="button"
            key={wind}
            class="chip"
            aria-pressed={selected.includes(wind)}
            onClick={() => {
              toggle(wind);
            }}
          >
            {windLabel(wind, lang).primary}
          </button>
        ))}
      </div>

      <button
        type="button"
        class="ghost guide-toggle"
        aria-expanded={guideOpen}
        onClick={() => {
          setGuideOpen(!guideOpen);
        }}
      >
        What are the winds?
      </button>
      {guideOpen && (
        <WindGuide
          lang={lang}
          intro="Tap a wind to add it to this evening's review."
          onSelect={toggle}
        />
      )}

      {selected.map((wind) => {
        const spec = specs[wind] ?? DEFAULT_SPEC;
        const label = windLabel(wind, lang);
        return (
          <div class="reflect-wind" key={wind}>
            <h3>
              {label.primary} <span class="sublabel">{label.secondary}</span>
            </h3>
            <div class="chip-row" role="group" aria-label={`${label.primary} intensity`}>
              {INTENSITIES.map((n) => (
                <button
                  type="button"
                  key={n}
                  class="chip"
                  aria-pressed={spec.intensity === n}
                  onClick={() => {
                    patch(wind, { intensity: n });
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
            <div class="chip-row" role="group" aria-label={`${label.primary} response`}>
              {RESPONSES.map((r) => (
                <button
                  type="button"
                  key={r}
                  class="chip"
                  aria-pressed={spec.response === r}
                  onClick={() => {
                    patch(wind, { response: r });
                  }}
                >
                  {RESPONSE_INFO[r].label}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {selected.length > 0 && (
        <button type="button" class="primary" onClick={saveAll}>
          Save
        </button>
      )}
      {status !== null && <p class="gentle-phrase">{status}</p>}

      {insights.length > 0 && (
        <>
          <h3>Worth a look</h3>
          {insights.map((q) => (
            <blockquote class="insight" key={q}>
              {q}
            </blockquote>
          ))}
        </>
      )}
    </section>
  );
}
