import type { JSX } from 'preact';
import { useState } from 'preact/hooks';
import { GustGlyph } from '../components/GustGlyph';
import { SnippetCard } from '../components/SnippetCard';
import {
  DOMAINS,
  INTENSITIES,
  INTENSITY_INFO,
  RESPONSES,
  RESPONSE_INFO,
  WIND_INFO,
  type Domain,
  type Intensity,
  type ResponseQuality,
  type Wind,
  type WindEntry,
} from '../lib/model';
import { windLabel, type DisplayLang } from '../lib/prefs';
import { snippetForCount, type Snippet } from '../lib/texts';
import { ulid } from '../lib/ulid';

interface Props {
  wind: Wind;
  lang: DisplayLang;
  entriesCount: number;
  onSave: (entry: WindEntry) => Promise<void>;
  onClose: () => void;
}

type Step = 'intensity' | 'response' | 'detail' | 'snippet';

export function LogFlow({ wind, lang, entriesCount, onSave, onClose }: Props): JSX.Element {
  const [step, setStep] = useState<Step>('intensity');
  const [intensity, setIntensity] = useState<Intensity>(3);
  const [response, setResponse] = useState<ResponseQuality>('caughtLate');
  const [note, setNote] = useState('');
  const [domain, setDomain] = useState<Domain | null>(null);
  const [snippet, setSnippet] = useState<Snippet | null>(null);

  const label = windLabel(wind, lang);

  const save = (): void => {
    const trimmed = note.trim();
    const entry: WindEntry = {
      id: ulid(),
      timestamp: Date.now(),
      wind,
      intensity,
      response,
      ...(trimmed !== '' ? { note: trimmed } : {}),
      ...(domain !== null ? { domain } : {}),
    };
    void (async () => {
      await onSave(entry);
      const due = snippetForCount(entriesCount + 1);
      if (due !== null) {
        setSnippet(due);
        setStep('snippet');
      } else {
        onClose();
      }
    })();
  };

  return (
    <section class="log-flow" style={`--wc: var(--wind-${wind})`}>
      <header class="log-header">
        <h2>
          {label.primary} <span class="sublabel">{label.secondary}</span>
        </h2>
        {step !== 'snippet' && (
          <button type="button" class="ghost" aria-label="Cancel" onClick={onClose}>
            ✕
          </button>
        )}
      </header>
      {step !== 'snippet' && <p class="wind-desc">{WIND_INFO[wind].description}</p>}

      {step === 'intensity' && (
        <div class="log-step">
          <h3>How strongly is it blowing?</h3>
          <div class="option-column">
            {INTENSITIES.map((n) => (
              <button
                type="button"
                key={n}
                class="option option-gust"
                onClick={() => {
                  setIntensity(n);
                  setStep('response');
                }}
              >
                <GustGlyph intensity={n} />
                {INTENSITY_INFO[n - 1]}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'response' && (
        <div class="log-step">
          <h3>How did the mind meet it?</h3>
          <div class="option-column">
            {RESPONSES.map((r) => (
              <button
                type="button"
                key={r}
                class="option"
                onClick={() => {
                  setResponse(r);
                  setStep('detail');
                }}
              >
                <span class="option-label">{RESPONSE_INFO[r].label}</span>
                <span class="option-desc">{RESPONSE_INFO[r].description}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            class="ghost"
            onClick={() => {
              setStep('intensity');
            }}
          >
            ← Back
          </button>
        </div>
      )}

      {step === 'detail' && (
        <div class="log-step">
          <h3>Anything else?</h3>
          <label class="field">
            Note <span class="optional">(optional)</span>
            <textarea
              rows={2}
              value={note}
              onInput={(e) => {
                setNote(e.currentTarget.value);
              }}
            />
          </label>
          <div class="chip-row" role="group" aria-label="Domain">
            {DOMAINS.map((d) => (
              <button
                type="button"
                key={d}
                class="chip"
                aria-pressed={domain === d}
                onClick={() => {
                  setDomain(domain === d ? null : d);
                }}
              >
                {d}
              </button>
            ))}
          </div>
          <div class="log-actions">
            <button
              type="button"
              class="ghost"
              onClick={() => {
                setStep('response');
              }}
            >
              ← Back
            </button>
            <button type="button" class="primary" onClick={save}>
              Save
            </button>
          </div>
        </div>
      )}

      {step === 'snippet' && snippet !== null && (
        <div class="log-step">
          <SnippetCard snippet={snippet} />
          <button type="button" class="primary" onClick={onClose}>
            Continue
          </button>
        </div>
      )}
    </section>
  );
}
