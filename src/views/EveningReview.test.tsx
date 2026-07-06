import { fireEvent, render, screen } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { EveningReview } from './EveningReview';

const save = (): Promise<void> => Promise.resolve();
const noop = (): void => undefined;

describe('evening review', () => {
  it('tints wind chips with their hue', () => {
    render(<EveningReview lang="english" onSave={save} onClose={noop} />);
    const chip = screen.getByRole('button', { name: 'Praise' });
    expect(chip.getAttribute('style')).toContain('--wind-praise');
  });

  it('opens a hue-tinted block with gust-glyph intensities when a wind is chosen', () => {
    render(<EveningReview lang="english" onSave={save} onClose={noop} />);
    fireEvent.click(screen.getByRole('button', { name: 'Praise' }));

    const block = document.querySelector('.review-wind');
    expect(block?.getAttribute('style')).toContain('--wind-praise');

    expect(
      screen.getByRole('button', { name: 'Breeze' }).querySelectorAll('.gust-stroke'),
    ).toHaveLength(1);
    expect(
      screen.getByRole('button', { name: 'Gale' }).querySelectorAll('.gust-stroke'),
    ).toHaveLength(5);
  });

  it('closes without saving via the close control', () => {
    let closed = false;
    render(
      <EveningReview
        lang="english"
        onSave={save}
        onClose={() => {
          closed = true;
        }}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Close review' }));
    expect(closed).toBe(true);
  });
});
