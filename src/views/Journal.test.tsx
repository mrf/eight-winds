import { render } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { makeEntry } from '../test/helpers';
import { Journal } from './Journal';

const del = (): Promise<void> => Promise.resolve();

describe('journal entries', () => {
  it('carries wind hue and stagger index, newest first', () => {
    const older = makeEntry({ timestamp: 1_000, wind: 'gain' });
    const newer = makeEntry({ timestamp: 2_000, wind: 'blame' });
    const { container } = render(<Journal entries={[older, newer]} lang="english" onDelete={del} />);
    const items = container.querySelectorAll('li.journal-entry');
    expect(items).toHaveLength(2);
    expect(items[0]?.getAttribute('style')).toContain('--wind-blame');
    expect(items[0]?.getAttribute('style')).toContain('--i: 0');
    expect(items[1]?.getAttribute('style')).toContain('--wind-gain');
    expect(items[1]?.getAttribute('style')).toContain('--i: 1');
  });
});
