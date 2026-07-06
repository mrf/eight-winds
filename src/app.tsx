import type { JSX } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import { CompassRose } from './components/CompassRose';
import { WindGuide } from './components/WindGuide';
import { addEntry, deleteEntry, getAllEntries } from './lib/db';
import type { Wind, WindEntry } from './lib/model';
import {
  getDisplayLang,
  getIntroSeen,
  getLastBackupAt,
  setDisplayLang,
  setIntroSeen,
  type DisplayLang,
} from './lib/prefs';
import { shouldRemindBackup } from './lib/stats';
import { LogFlow } from './views/LogFlow';
import { Journal } from './views/Journal';
import { Reflect } from './views/Reflect';
import { Settings } from './views/Settings';
import { Weather } from './views/Weather';

const VIEWS = ['compass', 'weather', 'journal', 'reflect', 'settings'] as const;
type View = (typeof VIEWS)[number];

const NAV_LABELS: Record<View, string> = {
  compass: 'Compass',
  weather: 'Weather',
  journal: 'Journal',
  reflect: 'Reflect',
  settings: 'Settings',
};

function viewFromHash(): View {
  const name = location.hash.replace(/^#\/?/, '');
  return (VIEWS as readonly string[]).includes(name) ? (name as View) : 'compass';
}

export function App(): JSX.Element {
  const [view, setView] = useState<View>(viewFromHash);
  const [logging, setLogging] = useState<Wind | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [introOpen, setIntroOpen] = useState(() => !getIntroSeen());
  const [entries, setEntries] = useState<readonly WindEntry[]>([]);
  const [lang, setLang] = useState<DisplayLang>(getDisplayLang);

  const refresh = useCallback(async (): Promise<void> => {
    setEntries(await getAllEntries());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onHashChange = (): void => {
      setView(viewFromHash());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  const navigate = (next: View): void => {
    location.hash = `#/${next}`;
    setView(next);
  };

  const saveEntry = useCallback(
    async (entry: WindEntry): Promise<void> => {
      await addEntry(entry);
      await refresh();
    },
    [refresh],
  );

  const removeEntry = useCallback(
    async (id: string): Promise<void> => {
      await deleteEntry(id);
      await refresh();
    },
    [refresh],
  );

  const changeLang = (next: DisplayLang): void => {
    setDisplayLang(next);
    setLang(next);
  };

  const remindBackup = shouldRemindBackup(entries, getLastBackupAt(), Date.now());

  const dismissIntro = (): void => {
    setIntroSeen();
    setIntroOpen(false);
  };

  return (
    <div class="app">
      <header class="app-header">
        <h1>Eight Winds</h1>
      </header>

      <main class="app-main">
        {logging !== null ? (
          <LogFlow
            wind={logging}
            lang={lang}
            entriesCount={entries.length}
            onSave={saveEntry}
            onClose={() => {
              setLogging(null);
            }}
          />
        ) : (
          <>
            {view === 'compass' && introOpen && (
              <section class="view-intro">
                <p>
                  The Buddha spoke of eight worldly winds — four pairs of conditions that blow
                  through every life: gain and loss, status and disrepute, praise and blame,
                  pleasure and pain.
                </p>
                <p>
                  This app measures nothing. It only helps you look — at which wind is blowing,
                  and at how the mind meets it.
                </p>
                <WindGuide
                  lang={lang}
                  intro=""
                  onSelect={(wind) => {
                    dismissIntro();
                    setLogging(wind);
                  }}
                />
                <button type="button" class="primary intro-begin" onClick={dismissIntro}>
                  Begin
                </button>
              </section>
            )}
            {view === 'compass' && !introOpen && (
              <section class="view-compass">
                <p class="compass-prompt">Which wind is blowing?</p>
                <CompassRose lang={lang} onSelect={setLogging} />
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
                {guideOpen && <WindGuide lang={lang} onSelect={setLogging} />}
                {remindBackup && (
                  <p class="quiet-banner">
                    It has been a while since you saved your record.{' '}
                    <a
                      href="#/settings"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('settings');
                      }}
                    >
                      Save it now
                    </a>
                    .
                  </p>
                )}
              </section>
            )}
            {view === 'weather' && <Weather entries={entries} lang={lang} />}
            {view === 'journal' && <Journal entries={entries} lang={lang} onDelete={removeEntry} />}
            {view === 'reflect' && <Reflect entries={entries} lang={lang} onSave={saveEntry} />}
            {view === 'settings' && (
              <Settings entries={entries} lang={lang} onLangChange={changeLang} onRefresh={refresh} />
            )}
          </>
        )}
      </main>

      <nav class="app-nav" aria-label="Main">
        {VIEWS.map((v) => (
          <a
            key={v}
            href={`#/${v}`}
            class={view === v && logging === null ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault();
              setLogging(null);
              navigate(v);
            }}
          >
            {NAV_LABELS[v]}
          </a>
        ))}
      </nav>
    </div>
  );
}
