import { render, screen } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { LogFlow } from './LogFlow';

const noop = (): void => undefined;
const saveStub = (): Promise<void> => Promise.resolve();

describe('log flow intensity step', () => {
  it('carries the chosen wind hue for the step styling', () => {
    render(
      <LogFlow wind="pain" lang="english" entriesCount={0} onSave={saveStub} onClose={noop} />,
    );
    const section = document.querySelector('section.log-flow');
    expect(section?.getAttribute('style')).toContain('--wind-pain');
  });

  it('shows escalating gust glyphs, breeze through gale', () => {
    render(
      <LogFlow wind="gain" lang="english" entriesCount={0} onSave={saveStub} onClose={noop} />,
    );
    const options = screen
      .getAllByRole('button')
      .filter((b) => b.classList.contains('option'));
    expect(options).toHaveLength(5);
    options.forEach((option, i) => {
      expect(option.querySelectorAll('.gust-stroke')).toHaveLength(i + 1);
    });
  });
});
