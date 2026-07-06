import { render } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { makeEntry } from '../test/helpers';
import { Weather } from './Weather';

describe('weather dashboard', () => {
  it('renders both hues in each pair track and staggers the trend weeks', () => {
    const entries = [
      makeEntry({ wind: 'gain' }),
      makeEntry({ wind: 'gain' }),
      makeEntry({ wind: 'loss' }),
    ];
    render(<Weather entries={entries} lang="english" />);

    const rows = document.querySelectorAll('.pair-row');
    expect(rows).toHaveLength(4);
    expect(rows[0]?.getAttribute('style')).toContain('--wa: var(--wind-gain)');
    expect(rows[0]?.getAttribute('style')).toContain('--wb: var(--wind-loss)');
    expect(rows[0]?.querySelector('.pair-fill-left')).toBeTruthy();
    expect(rows[0]?.querySelector('.pair-fill-right')).toBeTruthy();

    const weeks = document.querySelectorAll('.trend-chart g');
    expect(weeks).toHaveLength(8);
    expect(weeks[3]?.getAttribute('style')).toContain('--i: 3');
  });

  it('surfaces pattern questions when recent entries cluster', () => {
    const now = Date.now();
    const entries = Array.from({ length: 6 }, (_, i) =>
      makeEntry({ timestamp: now - (i + 1) * 3_600_000, wind: 'blame', domain: 'work' }),
    );
    render(<Weather entries={entries} lang="english" />);
    const insights = [...document.querySelectorAll('.insight')];
    expect(insights.length).toBeGreaterThan(0);
    expect(insights.map((el) => el.textContent).join(' ')).toContain('Blame');
  });
});
