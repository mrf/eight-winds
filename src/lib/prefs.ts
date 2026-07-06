import { WIND_INFO, type Wind } from './model';

export type DisplayLang = 'english' | 'pali';

const DISPLAY_KEY = 'ew.display';
const BACKUP_KEY = 'ew.lastBackupAt';
const INTRO_KEY = 'ew.introSeen';

export function getDisplayLang(): DisplayLang {
  return localStorage.getItem(DISPLAY_KEY) === 'pali' ? 'pali' : 'english';
}

export function setDisplayLang(lang: DisplayLang): void {
  localStorage.setItem(DISPLAY_KEY, lang);
}

export function getIntroSeen(): boolean {
  return localStorage.getItem(INTRO_KEY) === '1';
}

export function setIntroSeen(): void {
  localStorage.setItem(INTRO_KEY, '1');
}

export function getLastBackupAt(): number | null {
  const raw = localStorage.getItem(BACKUP_KEY);
  if (raw === null) {
    return null;
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function setLastBackupAt(ts: number): void {
  localStorage.setItem(BACKUP_KEY, String(ts));
}

export function windLabel(wind: Wind, lang: DisplayLang): { primary: string; secondary: string } {
  const info = WIND_INFO[wind];
  return lang === 'pali'
    ? { primary: info.pali, secondary: info.en }
    : { primary: info.en, secondary: info.pali };
}
