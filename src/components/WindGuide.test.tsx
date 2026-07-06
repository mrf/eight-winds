import { render, screen } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { WindGuide } from './WindGuide';

const noop = (): void => undefined;

describe('wind guide', () => {
  it('tints each row with its wind hue', () => {
    render(<WindGuide lang="english" onSelect={noop} />);
    const rows = screen.getAllByRole('button');
    expect(rows).toHaveLength(8);
    for (const row of rows) {
      expect(row.getAttribute('style')).toContain('--wc: var(--wind-');
    }
  });
});
