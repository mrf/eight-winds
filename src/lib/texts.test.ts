import { describe, expect, it } from 'vitest';
import { SNIPPETS, snippetForCount } from './texts';

describe('sutta snippets', () => {
  it('every snippet has text and a source', () => {
    expect(SNIPPETS.length).toBeGreaterThanOrEqual(3);
    for (const s of SNIPPETS) {
      expect(s.text.length).toBeGreaterThan(0);
      expect(s.source.length).toBeGreaterThan(0);
    }
  });

  it('appears only occasionally, not after every entry', () => {
    expect(snippetForCount(1)).toBeNull();
    expect(snippetForCount(2)).toBeNull();
    expect(snippetForCount(3)).not.toBeNull();
  });

  it('rotates deterministically through the collection', () => {
    expect(snippetForCount(3)).toEqual(snippetForCount(3));
    expect(snippetForCount(6)).not.toEqual(snippetForCount(3));
  });
});
