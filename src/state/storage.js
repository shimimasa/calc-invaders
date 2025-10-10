// src/state/storage.js
// 単純な状態管理（設定保存用）。ビルド時(SSR)でも落ちない localStorage ラッパ付き。

const storage =
  (typeof window !== 'undefined' && window.localStorage)
    ? window.localStorage
    : { getItem() { return null; }, setItem() {}, removeItem() {} };

export const STORAGE_KEY = 'ci:v1';
export const SCHEMA_VERSION = 3; // 時間制限UI撤廃後のスキーマ

export const state = loadState();

export function saveState() {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_) {
    // 何もしない（ストレージ不可環境でもビルドは通す）
  }
}

function loadState() {
  const raw = storage.getItem(STORAGE_KEY);
  const base = raw ? safeParse(raw) : createDefaultState();
  return migrateState(base);
}

function safeParse(raw) {
  try { return JSON.parse(raw); } catch { return createDefaultState(); }
}

function createDefaultState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    gameSettings: {
      sfx: true,
      bgm: true,
      masterVolume: 1,
      // timeLimit* は作らない
    },
    a11ySettings: {
      largeButtons: false,
      highContrast: false,
    },
    // 必要に応じて他の永続データを追加
    cardMeta: {},
    questionCountMode: 10,
  };
}

export function migrateState(s) {
  const v = Number(s?.schemaVersion ?? 0);

  // ここに v<2 など既存の移行処理があれば順に置く

  // v<3: 時間制限設定の完全撤廃
  if (v < 3) {
    if (s?.gameSettings) {
      delete s.gameSettings.timeLimitEnabled;
      delete s.gameSettings.timeLimitSec;
    }
    s.schemaVersion = 3;
  }

  // ホール埋め＆型保護
  s.gameSettings ??= {};
  s.gameSettings.sfx = !!s.gameSettings.sfx;
  s.gameSettings.bgm = !!s.gameSettings.bgm;
  if (typeof s.gameSettings.masterVolume !== 'number') s.gameSettings.masterVolume = 1;

  s.a11ySettings ??= {};
  s.a11ySettings.largeButtons = !!s.a11ySettings.largeButtons;
  s.a11ySettings.highContrast = !!s.a11ySettings.highContrast;

  return s;
}
