import type { JSX } from 'preact';
import { useState } from 'preact/hooks';
import {
  DOMAINS,
  INTENSITY_INFO,
  RESPONSE_INFO,
  WINDS,
  WIND_INFO,
  isOneOf,
  type Domain,
  type Wind,
  type WindEntry,
} from '../lib/model';
import { windLabel, type DisplayLang } from '../lib/prefs';

interface Props {
  entries: readonly WindEntry[];
  lang: DisplayLang;
  onDelete: (id: string) => Promise<void>;
}

export function Journal({ entries, lang, onDelete }: Props): JSX.Element {
  const [windFilter, setWindFilter] = useState<Wind | 'all'>('all');
  const [domainFilter, setDomainFilter] = useState<Domain | 'all'>('all');
  const [search, setSearch] = useState('');

  const needle = search.trim().toLowerCase();
  const filtered = [...entries]
    .reverse()
    .filter((e) => windFilter === 'all' || e.wind === windFilter)
    .filter((e) => domainFilter === 'all' || e.domain === domainFilter)
    .filter((e) => needle === '' || (e.note ?? '').toLowerCase().includes(needle));

  const groups: { date: string; items: WindEntry[] }[] = [];
  for (const entry of filtered) {
    const date = new Date(entry.timestamp).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const last = groups[groups.length - 1];
    if (last?.date === date) {
      last.items.push(entry);
    } else {
      groups.push({ date, items: [entry] });
    }
  }

  return (
    <section class="view-journal">
      <h2>Journal</h2>

      <div class="journal-filters">
        <select
          aria-label="Filter by wind"
          value={windFilter}
          onChange={(e) => {
            const v = e.currentTarget.value;
            setWindFilter(isOneOf(WINDS, v) ? v : 'all');
          }}
        >
          <option value="all">All winds</option>
          {WINDS.map((w) => (
            <option key={w} value={w}>
              {WIND_INFO[w].en}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by domain"
          value={domainFilter}
          onChange={(e) => {
            const v = e.currentTarget.value;
            setDomainFilter(isOneOf(DOMAINS, v) ? v : 'all');
          }}
        >
          <option value="all">All domains</option>
          {DOMAINS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <input
          type="search"
          aria-label="Search notes"
          placeholder="Search notes"
          value={search}
          onInput={(e) => {
            setSearch(e.currentTarget.value);
          }}
        />
      </div>

      {entries.length === 0 ? (
        <p class="empty-note">Nothing yet. When a wind blows, log it on the compass.</p>
      ) : filtered.length === 0 ? (
        <p class="empty-note">No entries match.</p>
      ) : (
        groups.map((group) => (
          <div class="journal-day" key={group.date}>
            <h3>{group.date}</h3>
            <ul class="journal-list">
              {group.items.map((entry) => {
                const label = windLabel(entry.wind, lang);
                return (
                  <li class="journal-entry" key={entry.id}>
                    <div class="entry-head">
                      <span class="entry-wind" style={`border-color: var(--wind-${entry.wind})`}>
                        {label.primary} <span class="sublabel">{label.secondary}</span>
                      </span>
                      <span class="entry-meta">
                        {INTENSITY_INFO[entry.intensity - 1]} · {RESPONSE_INFO[entry.response].label}
                        {entry.domain !== undefined && ` · ${entry.domain}`}
                      </span>
                      <button
                        type="button"
                        class="ghost entry-delete"
                        aria-label="Delete entry"
                        onClick={() => {
                          if (window.confirm('Remove this entry?')) {
                            void onDelete(entry.id);
                          }
                        }}
                      >
                        ✕
                      </button>
                    </div>
                    {entry.note !== undefined && <p class="entry-note">{entry.note}</p>}
                    <p class="entry-time">
                      {new Date(entry.timestamp).toLocaleTimeString(undefined, {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        ))
      )}
    </section>
  );
}
