export interface Snippet {
  text: string;
  source: string;
}

export const SNIPPETS: readonly Snippet[] = [
  {
    text: 'Gain and loss, status and disgrace, censure and praise, pleasure and pain: these conditions among human beings are inconstant, impermanent, subject to change.',
    source: 'AN 8:6, Lokavipatti Sutta',
  },
  {
    text: 'As a solid rock is unshaken by the wind, so the wise are unmoved by praise or blame.',
    source: 'Dhp 81',
  },
  {
    text: 'Knowing this, the wise person, mindful, ponders these changing conditions.',
    source: 'AN 8:6, Lokavipatti Sutta',
  },
  {
    text: "Desirable things don't charm the mind, undesirable ones bring no resistance.",
    source: 'AN 8:6, Lokavipatti Sutta',
  },
  {
    text: 'Whatever is subject to origination is all subject to cessation.',
    source: 'SN 56:11',
  },
];

/**
 * Occasionally offer a snippet after logging: every third entry, rotating
 * through the collection. Deterministic, sparing, skippable (§3.3).
 */
export function snippetForCount(count: number): Snippet | null {
  if (count <= 0 || count % 3 !== 0) {
    return null;
  }
  return SNIPPETS[(count / 3 - 1) % SNIPPETS.length] ?? null;
}
