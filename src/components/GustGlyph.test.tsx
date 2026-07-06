import { render } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { INTENSITIES } from '../lib/model';
import { GustGlyph } from './GustGlyph';

describe('gust glyph', () => {
  it('draws one stroke per level of intensity', () => {
    for (const n of INTENSITIES) {
      const { container, unmount } = render(<GustGlyph intensity={n} />);
      expect(container.querySelectorAll('.gust-stroke')).toHaveLength(n);
      unmount();
    }
  });

  it('normalizes path lengths so dash animations are uniform', () => {
    const { container } = render(<GustGlyph intensity={4} />);
    for (const path of container.querySelectorAll('.gust-stroke')) {
      expect(path.getAttribute('pathLength')).toBe('100');
    }
  });

  it('is decorative: hidden from the accessibility tree', () => {
    const { container } = render(<GustGlyph intensity={2} />);
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });
});
