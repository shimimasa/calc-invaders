// GameState persistence utilities (localStorage)

export const STORAGE_KEY = "ci:v1";

export function getDefaultState(){
  return {
    lastStageId: null,
    score: 0,
    lives: 3,
    flippedCards: [],
    incorrectFormulas: [],
    audioSettings: { bgm: true, se: true, volume: 1 },
    unlockedSuits: { heart: true, spade: false, club: false, diamond: false },
    difficulty: 'normal',
    selectedSuits: { heart: true, spade: false, club: false, diamond: false },
    selectedRanks: { 1:true, 2:false, 3:false, 4:false, 5:false, 6:false, 7:false, 8:false, 9:false, 10:false, 11:false, 12:false, 13:false }
  };
}

function normalizeState(input){
  const base = getDefaultState();
  if (!input || typeof input !== 'object') return base;
  const out = { ...base, ...input };
  // arrays
  out.flippedCards = Array.isArray(input.flippedCards) ? input.flippedCards.slice() : base.flippedCards;
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
  return out;
}

export function loadState(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw);
    return normalizeState(parsed);
  } catch (e) {
    // 破損時は安全に初期化
    return getDefaultState();
  }
}

export function saveState(state){
  const safe = normalizeState(state);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(safe)); }
  catch (_e) { /* ignore quota or privacy errors */ }
  return safe;
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
