// GameState persistence utilities (localStorage)

export const STORAGE_KEY = "ci:v1";
const SCHEMA_VERSION = 4;

export function getDefaultState(){
  return {
    schemaVersion: SCHEMA_VERSION,
    lastStageId: null,
    score: 0,
    lives: 3,
    flippedCards: [],
    cardMeta: {},
    incorrectFormulas: [],
    audioSettings: { bgm: true, se: true, volume: 1 },
    gameSettings: { timeLimitEnabled: false, timeLimitSec: 60 },
    a11ySettings: { largeButtons: false, highContrast: false },
    unlockedSuits: { heart: true, spade: false, club: false, diamond: false },
    difficulty: 'normal',
    selectedSuits: { heart: true, spade: false, club: false, diamond: false },
    selectedRanks: { 1:true, 2:false, 3:false, 4:false, 5:false, 6:false, 7:false, 8:false, 9:false, 10:false, 11:false, 12:false, 13:false },
    questionCountMode: '10', // '5' | '10' | '20' | '30' | 'endless'
    // 段階解放（初期は全スーツ1を解放）
    rankProgress: { heart: 1, spade: 1, club: 1, diamond: 1 },
    unlockedCounts: ['5']
  };
}

function normalizeState(input){
  const base = getDefaultState();
  if (!input || typeof input !== 'object') return base;
  const out = { ...base, ...input };
  // arrays
  out.flippedCards = Array.isArray(input.flippedCards) ? input.flippedCards.slice() : base.flippedCards;
  // maps
  out.cardMeta = (input.cardMeta && typeof input.cardMeta === 'object') ? { ...input.cardMeta } : {};
  const gs = input.gameSettings || {};
  out.gameSettings = {
    timeLimitEnabled: typeof gs.timeLimitEnabled === 'boolean' ? gs.timeLimitEnabled : base.gameSettings.timeLimitEnabled,
    timeLimitSec: Number.isFinite(gs.timeLimitSec) ? Math.max(10, Math.min(600, gs.timeLimitSec)) : base.gameSettings.timeLimitSec
  };
  const ax = input.a11ySettings || {};
  out.a11ySettings = {
    largeButtons: typeof ax.largeButtons === 'boolean' ? ax.largeButtons : base.a11ySettings.largeButtons,
    highContrast: typeof ax.highContrast === 'boolean' ? ax.highContrast : base.a11ySettings.highContrast
  };
  out.incorrectFormulas = Array.isArray(input.incorrectFormulas) ? input.incorrectFormulas.slice() : base.incorrectFormulas;
  // audio settings
  const a = input.audioSettings || {};
  out.audioSettings = {
    bgm: typeof a.bgm === 'boolean' ? a.bgm : base.audioSettings.bgm,
    se: typeof a.se === 'boolean' ? a.se : base.audioSettings.se,
    volume: Number.isFinite(a.volume) ? a.volume : base.audioSettings.volume
  };
  // unlocked suits
  const u = input.unlockedSuits || {};
  out.unlockedSuits = {
    heart: typeof u.heart === 'boolean' ? u.heart : base.unlockedSuits.heart,
    spade: typeof u.spade === 'boolean' ? u.spade : base.unlockedSuits.spade,
    club: typeof u.club === 'boolean' ? u.club : base.unlockedSuits.club,
    diamond: typeof u.diamond === 'boolean' ? u.diamond : base.unlockedSuits.diamond
  };
  // scalars
  out.score = Number.isFinite(input.score) ? input.score : base.score;
  out.lives = Number.isFinite(input.lives) ? input.lives : base.lives;
  out.lastStageId = typeof input.lastStageId === 'string' || input.lastStageId === null ? input.lastStageId : base.lastStageId;
  out.difficulty = ['easy','normal','hard'].includes(input.difficulty) ? input.difficulty : base.difficulty;
  const sel = input.selectedSuits || {};
  out.selectedSuits = {
    heart: !!sel.heart, spade: !!sel.spade, club: !!sel.club, diamond: !!sel.diamond
  };
  const rsel = input.selectedRanks || {};
  const ranks = {}; for (let i=1;i<=13;i++) ranks[i] = !!rsel[i];
  if (!Object.values(ranks).some(Boolean)) ranks[1] = true;
  out.selectedRanks = ranks;
  // 段階解放（問題数）
  const CM_ORDER = ['5','10','20','30','endless'];
  const rawCounts = Array.isArray(input.unlockedCounts) ? input.unlockedCounts.filter(v => CM_ORDER.includes(String(v))) : base.unlockedCounts;
  const uniqCounts = Array.from(new Set(rawCounts));
  out.unlockedCounts = uniqCounts.length > 0 ? uniqCounts : base.unlockedCounts;
  // 現在の問題数は解放済みの中からのみ
  const qcm = String(input.questionCountMode || base.questionCountMode);
  const lastUnlocked = out.unlockedCounts[out.unlockedCounts.length - 1] || base.questionCountMode;
  out.questionCountMode = out.unlockedCounts.includes(qcm) ? qcm : lastUnlocked;
  // 段階解放（ランク）
  const rp = input.rankProgress && typeof input.rankProgress === 'object' ? input.rankProgress : base.rankProgress;
  const clampRank = (n) => {
    const v = Number(n);
    return Number.isFinite(v) ? Math.max(0, Math.min(13, v)) : 0;
  };
  out.rankProgress = {
    heart: clampRank(rp.heart),
    spade: clampRank(rp.spade),
    club: clampRank(rp.club),
    diamond: clampRank(rp.diamond)
  };
  // 全スーツ最低1を保証
  if (out.rankProgress.heart < 1) out.rankProgress.heart = 1;
  if (out.rankProgress.spade < 1) out.rankProgress.spade = 1;
  if (out.rankProgress.club < 1) out.rankProgress.club = 1;
  if (out.rankProgress.diamond < 1) out.rankProgress.diamond = 1;
  // version stamp
  out.schemaVersion = Number.isFinite(input.schemaVersion) ? input.schemaVersion : SCHEMA_VERSION;
  return out;
}

// ---- Migration ----
function migrateState(raw){
  try {
    if (!raw || typeof raw !== 'object') return getDefaultState();
    const v = Number(raw.schemaVersion || 1);
    let cur = { ...raw };
    if (v < 2) {
      // v2 introduces: cardMeta, gameSettings, a11ySettings, questionCountMode default
      if (!cur.cardMeta || typeof cur.cardMeta !== 'object') cur.cardMeta = {};
      if (!cur.gameSettings || typeof cur.gameSettings !== 'object') cur.gameSettings = { timeLimitEnabled: false, timeLimitSec: 60 };
      if (!cur.a11ySettings || typeof cur.a11ySettings !== 'object') cur.a11ySettings = { largeButtons: false, highContrast: false };
      if (typeof cur.questionCountMode === 'undefined') cur.questionCountMode = '10';
      cur.schemaVersion = 2;
    }
    if (cur.schemaVersion < 3){
      // v3 introduces: rankProgress, unlockedCounts
      if (!cur.rankProgress || typeof cur.rankProgress !== 'object') cur.rankProgress = { heart: 1, spade: 0, club: 0, diamond: 0 };
      if (!Array.isArray(cur.unlockedCounts)) cur.unlockedCounts = ['5'];
      cur.schemaVersion = 3;
    }
    if (cur.schemaVersion < 4){
      // v4: すべてのスーツでランク1を初期解放
      try {
        const rp = cur.rankProgress && typeof cur.rankProgress === 'object' ? cur.rankProgress : { heart: 1, spade: 0, club: 0, diamond: 0 };
        const fix = (v) => (Number.isFinite(v) && v > 0) ? v : 1;
        cur.rankProgress = { heart: fix(rp.heart), spade: fix(rp.spade), club: fix(rp.club), diamond: fix(rp.diamond) };
      } catch(_e){ cur.rankProgress = { heart: 1, spade: 1, club: 1, diamond: 1 }; }
      cur.schemaVersion = 4;
    }
    // future migrations: if (cur.schemaVersion < 4) { ...; cur.schemaVersion = 4; }
    return cur;
  } catch (_e) {
    return getDefaultState();
  }
}

export function loadState(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw);
    const migrated = migrateState(parsed);
    return normalizeState(migrated);
  } catch (e) {
    // 破損時は安全に初期化
    return getDefaultState();
  }
}

export function saveState(state){
  const safe = normalizeState(state);
  // stamp current schema version on save
  const stamped = { ...safe, schemaVersion: SCHEMA_VERSION };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stamped)); }
  catch (_e) { /* ignore quota or privacy errors */ }
  return stamped;
}

export function resetState(){
  try { localStorage.removeItem(STORAGE_KEY); } catch (_e) {}
}

export function updateState(patch){
  const current = loadState();
  const next = normalizeState({ ...current, ...patch });
  saveState(next);
  return next;
}

export function logIncorrectFormula(formula){
  const current = loadState();
  const max = 100;
  const list = (current.incorrectFormulas || []).concat(String(formula)).slice(-max);
  return updateState({ incorrectFormulas: list });
}

export function getIncorrectFormulas(){
  const current = loadState();
  return Array.isArray(current.incorrectFormulas) ? current.incorrectFormulas.slice() : [];
}

export function clearIncorrectFormula(index){
  const current = loadState();
  const arr = Array.isArray(current.incorrectFormulas) ? current.incorrectFormulas.slice() : [];
  if (Number.isInteger(index) && index >= 0 && index < arr.length){
    arr.splice(index, 1);
    return updateState({ incorrectFormulas: arr });
  }
  return current;
}

export function flipCard(cardId){
  const current = loadState();
  const set = new Set(current.flippedCards || []);
  if (cardId != null) set.add(String(cardId));
  return updateState({ flippedCards: Array.from(set) });
}

// 記録: カード取得メタ（初取得日時、ベストスコア、クリア回数）
export function recordCardAcquired(stageId, { score } = {}){
  const current = loadState();
  const id = String(stageId || '');
  const meta = { ...(current.cardMeta || {}) };
  const nowIso = new Date().toISOString();
  const prev = meta[id] || {};
  const clears = (prev.clears || 0) + 1;
  const bestScore = Math.max(Number(prev.bestScore||0), Number(score||0));
  meta[id] = {
    obtainedAt: prev.obtainedAt || nowIso,
    lastClearedAt: nowIso,
    clears,
    bestScore
  };
  return updateState({ cardMeta: meta });
}

export function getAllCardMeta(){
  const current = loadState();
  const m = current.cardMeta || {};
  return { ...m };
}

export function setLastStageId(id){
  return updateState({ lastStageId: id == null ? null : String(id) });
}

export function setAudioSettings(settings){
  const current = loadState();
  const a = settings || {};
  const next = {
    bgm: typeof a.bgm === 'boolean' ? a.bgm : current.audioSettings.bgm,
    se: typeof a.se === 'boolean' ? a.se : current.audioSettings.se,
    volume: Number.isFinite(a.volume) ? a.volume : current.audioSettings.volume
  };
  return updateState({ audioSettings: next });
}
export function unlockSuit(suit){
  const current = loadState();
  const next = { ...current.unlockedSuits };
  if (suit && Object.prototype.hasOwnProperty.call(next, suit)) next[suit] = true;
  return updateState({ unlockedSuits: next });
}

export function setDifficulty(level){
  const lv = (['easy','normal','hard'].includes(level) ? level : 'normal');
  return updateState({ difficulty: lv });
}
export function setSelectedSuits(sel){
  const next = {
    heart: !!sel.heart, spade: !!sel.spade, club: !!sel.club, diamond: !!sel.diamond
  };
  if (!next.heart && !next.spade && !next.club && !next.diamond){ next.heart = true; }
  return updateState({ selectedSuits: next });
}
// 追加: ランク選択
export function setSelectedRanks(sel){
  const next = {}; for (let i=1;i<=13;i++) next[i] = !!sel[i];
  if (!Object.values(next).some(Boolean)) next[1] = true;
  return updateState({ selectedRanks: next });
}
// 追加: 問題数モード
export function setQuestionCountMode(mode){
  const m = String(mode || '10');
  const current = loadState();
  const allowed = Array.isArray(current.unlockedCounts) ? current.unlockedCounts : ['5'];
  const fallback = allowed[allowed.length - 1] || '5';
  const ok = allowed.includes(m) ? m : fallback;
  return updateState({ questionCountMode: ok });
}

export function setGameSettings(settings){
  const current = loadState();
  const g = settings || {};
  const next = {
    timeLimitEnabled: typeof g.timeLimitEnabled === 'boolean' ? g.timeLimitEnabled : current.gameSettings.timeLimitEnabled,
    timeLimitSec: Number.isFinite(g.timeLimitSec) ? Math.max(10, Math.min(600, g.timeLimitSec)) : current.gameSettings.timeLimitSec
  };
  return updateState({ gameSettings: next });
}

export function setA11ySettings(settings){
  const current = loadState();
  const a = settings || {};
  const next = {
    largeButtons: typeof a.largeButtons === 'boolean' ? a.largeButtons : current.a11ySettings.largeButtons,
    highContrast: typeof a.highContrast === 'boolean' ? a.highContrast : current.a11ySettings.highContrast
  };
  return updateState({ a11ySettings: next });
}

// ---- 段階解放ユーティリティ ----
export function getRankProgress(){
  const current = loadState();
  return { ...(current.rankProgress || {}) };
}

export function unlockNextRank(suit, clearedRank){
  const s = String(suit || '');
  const r = Number(clearedRank);
  if (!['heart','spade','club','diamond'].includes(s)) return loadState();
  if (!Number.isFinite(r)) return loadState();
  const current = loadState();
  const rp = { ...(current.rankProgress || {}) };
  const cur = Number(rp[s] || 0);
  const next = Math.max(cur, Math.min(13, r + 1));
  if (next !== cur){ rp[s] = next; return updateState({ rankProgress: rp }); }
  return current;
}

const COUNT_ORDER = ['5','10','20','30','endless'];
function sortCounts(arr){
  return Array.from(new Set(arr)).filter(v => COUNT_ORDER.includes(v)).sort((a,b)=> COUNT_ORDER.indexOf(a)-COUNT_ORDER.indexOf(b));
}

export function getUnlockedCounts(){
  const current = loadState();
  return sortCounts(current.unlockedCounts || ['5']);
}

export function unlockNextCount(currentMode){
  const cur = String(currentMode || '5');
  const idx = COUNT_ORDER.indexOf(cur);
  if (idx < 0) return loadState();
  const next = COUNT_ORDER[Math.min(COUNT_ORDER.length-1, idx+1)];
  const st = loadState();
  const list = sortCounts([...(st.unlockedCounts || ['5']), cur, next]);
  return updateState({ unlockedCounts: list });
}
