import { fireEvent, render, screen } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { CompassRose } from './CompassRose';

const noop = (): void => undefined;

describe('compass focus states', () => {
  it('highlights the touched wind, stirs its opposite, and dims the rest', () => {
    render(<CompassRose lang="english" onSelect={noop} />);
    const gain = screen.getByRole('button', { name: 'Gain' });
    const loss = screen.getByRole('button', { name: 'Loss' });
    const praise = screen.getByRole('button', { name: 'Praise' });

    expect(gain.classList.contains('is-active')).toBe(false);

    fireEvent.pointerEnter(gain);
    expect(gain.classList.contains('is-active')).toBe(true);
    expect(loss.classList.contains('is-opposite')).toBe(true);
    expect(praise.classList.contains('is-dim')).toBe(true);

    fireEvent.pointerLeave(gain);
    expect(gain.classList.contains('is-active')).toBe(false);
    expect(loss.classList.contains('is-opposite')).toBe(false);
    expect(praise.classList.contains('is-dim')).toBe(false);
  });

  it('treats keyboard focus like touch', () => {
    render(<CompassRose lang="english" onSelect={noop} />);
    const blame = screen.getByRole('button', { name: 'Blame' });
    const praise = screen.getByRole('button', { name: 'Praise' });

    fireEvent.focus(blame);
    expect(blame.classList.contains('is-active')).toBe(true);
    expect(praise.classList.contains('is-opposite')).toBe(true);

    fireEvent.blur(blame);
    expect(blame.classList.contains('is-active')).toBe(false);
  });

  it('exposes the active hue to the svg for hub and ring tinting', () => {
    render(<CompassRose lang="english" onSelect={noop} />);
    const svg = document.querySelector('svg.compass-rose');
    expect(svg?.classList.contains('has-active')).toBe(false);

    fireEvent.pointerEnter(screen.getByRole('button', { name: 'Pain' }));
    expect(svg?.classList.contains('has-active')).toBe(true);
    expect(svg?.getAttribute('style')).toContain('--active-wind');
  });
});
