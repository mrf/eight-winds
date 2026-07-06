import type { JSX, TargetedEvent } from 'preact';
import { useState } from 'preact/hooks';
import { importEntries } from '../lib/db';
import { exportCsv, exportFilename, exportJson, parseImport } from '../lib/export';
import type { WindEntry } from '../lib/model';
import { getLastBackupAt, setLastBackupAt, type DisplayLang } from '../lib/prefs';

interface Props {
  entries: readonly WindEntry[];
  lang: DisplayLang;
  onLangChange: (lang: DisplayLang) => void;
  onRefresh: () => Promise<void>;
}

function downloadText(filename: string, text: string, mime: string): void {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function isStandalone(): boolean {
  if ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true) {
    return true;
  }
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(display-mode: standalone)').matches
  );
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function Settings({ entries, lang, onLangChange, onRefresh }: Props): JSX.Element {
  const [lastBackup, setLastBackup] = useState<number | null>(getLastBackupAt);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const exportAs = (ext: 'json' | 'csv'): void => {
    const now = Date.now();
    const text = ext === 'json' ? exportJson(entries) : exportCsv(entries);
    const mime = ext === 'json' ? 'application/json' : 'text/csv';
    downloadText(exportFilename(now, ext), text, mime);
    setLastBackupAt(now);
    setLastBackup(now);
  };

  const onImportFile = (e: TargetedEvent<HTMLInputElement>): void => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (file === undefined) {
      return;
    }
    void (async () => {
      try {
        const text = await file.text();
        const parsed = parseImport(text);
        const { added, skipped } = await importEntries(parsed);
        await onRefresh();
        setImportStatus(
          `Added ${String(added)} ${added === 1 ? 'entry' : 'entries'}; ${String(skipped)} already present.`,
        );
      } catch (err) {
        setImportStatus(err instanceof Error ? err.message : 'That file could not be read.');
      } finally {
        input.value = '';
      }
    })();
  };

  return (
    <section class="view-settings">
      <h2>Settings</h2>

      <h3>Display</h3>
      <div class="chip-row" role="group" aria-label="Term display">
        <button
          type="button"
          class="chip"
          aria-pressed={lang === 'english'}
          onClick={() => {
            onLangChange('english');
          }}
        >
          English first
        </button>
        <button
          type="button"
          class="chip"
          aria-pressed={lang === 'pali'}
          onClick={() => {
            onLangChange('pali');
          }}
        >
          Pali first
        </button>
      </div>

      <h3>Your record</h3>
      <p class="quiet-note">
        Browser storage is impermanent, like everything else. The file you export is the true
        record; tending it is part of the practice.
      </p>
      <div class="settings-actions">
        <button
          type="button"
          class="primary"
          onClick={() => {
            exportAs('json');
          }}
        >
          Save as JSON
        </button>
        <button
          type="button"
          onClick={() => {
            exportAs('csv');
          }}
        >
          Save as CSV
        </button>
      </div>
      <p class="quiet-note">
        {entries.length === 0
          ? 'No entries yet.'
          : `${String(entries.length)} ${entries.length === 1 ? 'entry' : 'entries'}.`}{' '}
        Last saved: {lastBackup === null ? 'never' : new Date(lastBackup).toLocaleDateString()}
      </p>
      <label class="field">
        Restore from a saved file
        <input type="file" accept=".json,application/json" onChange={onImportFile} />
      </label>
      {importStatus !== null && <p class="gentle-phrase">{importStatus}</p>}

      {!isStandalone() && (
        <>
          <h3>Install</h3>
          {isIos() ? (
            <ol class="install-steps">
              <li>Tap the Share button in Safari.</li>
              <li>Choose “Add to Home Screen”.</li>
            </ol>
          ) : (
            <p class="quiet-note">
              Your browser’s menu has an “Install app” or “Add to Home Screen” option.
            </p>
          )}
          <p class="quiet-note">
            Installing protects your record from browser storage cleanup and adds an app icon.
          </p>
        </>
      )}

      <h3>About</h3>
      <p class="quiet-note">
        The eight worldly winds — gain and loss, status and disrepute, praise and blame, pleasure
        and pain — blow through every life. This app doesn’t measure anything. It only helps you
        look.
      </p>
      <p class="quiet-note">
        Source text:{' '}
        <a href="https://suttacentral.net/an8.6" target="_blank" rel="noreferrer">
          AN 8:6, Lokavipatti Sutta
        </a>{' '}
        ·{' '}
        <a href="https://www.dhammatalks.org/suttas/AN/AN8_6.html" target="_blank" rel="noreferrer">
          dhammatalks.org
        </a>
      </p>
      <p class="quiet-note">Your entries never leave your device.</p>
    </section>
  );
}
