export const WINDS = [
  'gain',
  'loss',
  'fame',
  'disrepute',
  'praise',
  'blame',
  'pleasure',
  'pain',
] as const;

export type Wind = (typeof WINDS)[number];

export const OPPOSITES: Record<Wind, Wind> = {
  gain: 'loss',
  loss: 'gain',
  fame: 'disrepute',
  disrepute: 'fame',
  praise: 'blame',
  blame: 'praise',
  pleasure: 'pain',
  pain: 'pleasure',
};

export const PAIRS: readonly (readonly [Wind, Wind])[] = [
  ['gain', 'loss'],
  ['fame', 'disrepute'],
  ['praise', 'blame'],
  ['pleasure', 'pain'],
];

// Clockwise from north; each wind sits directly across from its opposite.
export const COMPASS_ORDER: readonly Wind[] = [
  'gain',
  'praise',
  'pleasure',
  'fame',
  'loss',
  'blame',
  'pain',
  'disrepute',
];

export type Intensity = 1 | 2 | 3 | 4 | 5;

export const INTENSITIES: readonly Intensity[] = [1, 2, 3, 4, 5];

export const INTENSITY_INFO: readonly string[] = [
  'Breeze',
  'Light wind',
  'Fresh wind',
  'Near gale',
  'Gale',
];

export const RESPONSES = ['sweptAway', 'caughtLate', 'noticedArising', 'equanimous'] as const;

export type ResponseQuality = (typeof RESPONSES)[number];

export const RESPONSE_INFO: Record<ResponseQuality, { label: string; description: string }> = {
  sweptAway: {
    label: 'Swept away',
    description: 'Fully caught — elation, craving, aversion, rumination',
  },
  caughtLate: {
    label: 'Caught, then noticed',
    description: 'Reactivity arose; mindfulness arrived late',
  },
  noticedArising: {
    label: 'Noticed as it arose',
    description: 'The wind was seen as wind',
  },
  equanimous: {
    label: 'Equanimous',
    description: 'Known, felt fully, not grasped',
  },
};

export const DOMAINS = ['work', 'family', 'practice', 'body', 'online', 'other'] as const;

export type Domain = (typeof DOMAINS)[number];

export interface WindEntry {
  id: string; // ULID — sortable, collision-free for merge-on-import
  timestamp: number; // epoch ms
  wind: Wind;
  intensity: Intensity;
  response: ResponseQuality;
  note?: string;
  domain?: Domain;
}

export const WIND_INFO: Record<Wind, { en: string; pali: string }> = {
  gain: { en: 'Gain', pali: 'lābha' },
  loss: { en: 'Loss', pali: 'alābha' },
  fame: { en: 'Status', pali: 'yasa' },
  disrepute: { en: 'Disrepute', pali: 'ayasa' },
  praise: { en: 'Praise', pali: 'pasaṃsā' },
  blame: { en: 'Blame', pali: 'nindā' },
  pleasure: { en: 'Pleasure', pali: 'sukha' },
  pain: { en: 'Pain', pali: 'dukkha' },
};

export function isOneOf<T extends string>(values: readonly T[], v: unknown): v is T {
  return typeof v === 'string' && (values as readonly string[]).includes(v);
}

export function isWindEntry(value: unknown): value is WindEntry {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const v = value as Record<string, unknown>;
  return (
    typeof v['id'] === 'string' &&
    v['id'].length > 0 &&
    typeof v['timestamp'] === 'number' &&
    Number.isFinite(v['timestamp']) &&
    isOneOf(WINDS, v['wind']) &&
    typeof v['intensity'] === 'number' &&
    Number.isInteger(v['intensity']) &&
    v['intensity'] >= 1 &&
    v['intensity'] <= 5 &&
    isOneOf(RESPONSES, v['response']) &&
    (v['note'] === undefined || typeof v['note'] === 'string') &&
    (v['domain'] === undefined || isOneOf(DOMAINS, v['domain']))
  );
}
