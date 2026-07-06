import { fireEvent, render, screen, waitFor } from '@testing-library/preact';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from './app';
import { addEntry, getAllEntries, resetDbForTests } from './lib/db';
import { at, makeEntry, resetIndexedDb } from './test/helpers';

beforeEach(() => {
  resetDbForTests();
  resetIndexedDb();
  localStorage.clear();
  location.hash = '';
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

describe('navigation', () => {
  it('reaches the weather dashboard', async () => {
    render(<App />);
    fireEvent.click(await screen.findByRole('link', { name: 'Weather' }));
    expect(await screen.findByRole('heading', { name: 'Weather' })).toBeTruthy();
  });
});
