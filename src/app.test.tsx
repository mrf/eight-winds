import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/preact';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from './app';
import { addEntry, getAllEntries, resetDbForTests } from './lib/db';
import { setIntroSeen } from './lib/prefs';
import { at, makeEntry, resetIndexedDb } from './test/helpers';

beforeEach(() => {
  resetDbForTests();
  resetIndexedDb();
  localStorage.clear();
  setIntroSeen();
  location.hash = '';
});

describe('first run', () => {
  it('greets a new visitor with the guide, once', async () => {
    localStorage.clear();
    render(<App />);
    expect(await screen.findByText(/measures nothing/i)).toBeTruthy();
    expect(await screen.findByText(/Losing something you had/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Gain' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Begin' }));
    expect(await screen.findByRole('button', { name: 'Gain' })).toBeTruthy();

    cleanup();
    render(<App />);
    expect(await screen.findByRole('button', { name: 'Gain' })).toBeTruthy();
    expect(screen.queryByText(/measures nothing/i)).toBeNull();
  });

  it('can log a first wind straight from the intro guide', async () => {
    localStorage.clear();
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /Kind words aimed at you/ }));
    expect(await screen.findByRole('heading', { name: /How strongly is it blowing/ })).toBeTruthy();
  });
});

describe('compass (home)', () => {
  it('offers all eight winds', async () => {
    render(<App />);
    for (const name of ['Gain', 'Loss', 'Status', 'Disrepute', 'Praise', 'Blame', 'Pleasure', 'Pain']) {
      expect(await screen.findByRole('button', { name })).toBeTruthy();
    }
  });
});

describe('wind guide', () => {
  it('explains the winds in plain language and can log straight from a description', async () => {
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /What are the winds/i }));
    expect(await screen.findByText(/Losing something you had/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Losing something you had/ }));
    expect(await screen.findByRole('heading', { name: /How strongly is it blowing/ })).toBeTruthy();
    // The chosen wind's description is echoed in the log flow for confirmation.
    expect(screen.getByText(/Losing something you had/)).toBeTruthy();
    const saved = await getAllEntries();
    expect(saved).toHaveLength(0);
  });
});

describe('logging a wind', () => {
  it('walks intensity, response, and save, then lands the entry in the record', async () => {
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: 'Gain' }));

    fireEvent.click(await screen.findByRole('button', { name: /Fresh wind/ }));
    fireEvent.click(await screen.findByRole('button', { name: /Equanimous/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Save' }));

    await waitFor(async () => {
      expect(await getAllEntries()).toHaveLength(1);
    });
    const entry = at(await getAllEntries(), 0);
    expect(entry.wind).toBe('gain');
    expect(entry.intensity).toBe(3);
    expect(entry.response).toBe('equanimous');
  });
});

describe('journal', () => {
  it('shows an existing entry', async () => {
    await addEntry(makeEntry({ wind: 'blame', note: 'code review sting' }));
    render(<App />);
    fireEvent.click(await screen.findByRole('link', { name: 'Journal' }));
    expect(await screen.findByText('code review sting')).toBeTruthy();
  });
});

describe('evening review', () => {
  it('is a compass affordance, not a tab', async () => {
    render(<App />);
    await screen.findByRole('button', { name: 'Gain' });
    expect(screen.queryByRole('link', { name: 'Reflect' })).toBeNull();
    expect(screen.getByRole('button', { name: /Review the day/i })).toBeTruthy();
  });

  it('records several winds and returns to the compass', async () => {
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /Review the day/i }));
    fireEvent.click(await screen.findByRole('button', { name: 'Praise' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Pain' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(async () => {
      expect(await getAllEntries()).toHaveLength(2);
    });
    expect(await screen.findByRole('button', { name: 'Gain' })).toBeTruthy();
  });

  it('keeps the plain-language guide available inside the review', async () => {
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /Review the day/i }));
    fireEvent.click(await screen.findByRole('button', { name: /What are the winds/i }));
    fireEvent.click(await screen.findByRole('button', { name: /Kind words aimed at you/ }));
    const chip = await screen.findByRole('button', { name: 'Praise' });
    expect(chip.getAttribute('aria-pressed')).toBe('true');
  });
});

describe('navigation', () => {
  it('reaches the weather dashboard', async () => {
    render(<App />);
    fireEvent.click(await screen.findByRole('link', { name: 'Weather' }));
    expect(await screen.findByRole('heading', { name: 'Weather' })).toBeTruthy();
  });
});
