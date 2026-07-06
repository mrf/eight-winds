import { render } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { WINDS, type Wind } from '../lib/model';
import { WindRoseChart } from './WindRoseChart';

function counts(over: Partial<Record<Wind, number>>): Record<Wind, number> {
  const zero = Object.fromEntries(WINDS.map((w) => [w, 0])) as Record<Wind, number>;
  return { ...zero, ...over };
}

describe('wind rose chart', () => {
  it('gives each direction its hue and stagger index', () => {
    const { container } = render(<WindRoseChart counts={counts({ gain: 4 })} lang="english" />);
    const groups = container.querySelectorAll('g.windrose-wind');
    expect(groups).toHaveLength(8);
    expect(groups[0]?.getAttribute('style')).toContain('--wind-gain');
    expect(groups[0]?.getAttribute('style')).toContain('--i: 0');
    expect(groups[7]?.getAttribute('style')).toContain('--i: 7');
  });

  it('carries a count for each wind that has blown, and none for the silent', () => {
    const { container } = render(
      <WindRoseChart counts={counts({ gain: 4, blame: 2 })} lang="english" />,
    );
    const countTexts = [...container.querySelectorAll('.windrose-count')].map(
      (t) => t.textContent,
    );
    expect(countTexts.sort()).toEqual(['2', '4']);
  });
});
