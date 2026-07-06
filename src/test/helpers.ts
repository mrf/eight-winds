import { IDBFactory } from 'fake-indexeddb';
import type { Domain, Intensity, ResponseQuality, Wind, WindEntry } from '../lib/model';
import { ulid } from '../lib/ulid';

export function at<T>(arr: readonly T[], i: number): T {
  const v = arr[i];
  if (v === undefined) {
    throw new Error(`missing index ${String(i)}`);
  }
  return v;
}

interface EntrySpec {
  timestamp?: number;
  wind?: Wind;
  intensity?: Intensity;
  response?: ResponseQuality;
  note?: string;
  domain?: Domain;
}

export function makeEntry(spec: EntrySpec = {}): WindEntry {
  const timestamp = spec.timestamp ?? 1_750_000_000_000;
  return {
    id: ulid(timestamp),
    timestamp,
    wind: spec.wind ?? 'gain',
    intensity: spec.intensity ?? 3,
    response: spec.response ?? 'caughtLate',
    ...(spec.note !== undefined ? { note: spec.note } : {}),
    ...(spec.domain !== undefined ? { domain: spec.domain } : {}),
  };
}

export function resetIndexedDb(): void {
  // A fresh factory gives each test an empty database universe.
  Object.defineProperty(globalThis, 'indexedDB', {
    value: new IDBFactory(),
    configurable: true,
    writable: true,
  });
}
