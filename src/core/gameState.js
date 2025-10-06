// GameState persistence utilities (localStorage)

export const STORAGE_KEY = "ci:v1";

export function getDefaultState(){
  return {
    lastStageId: null,
    score: 0,
    lives: 3,
    flippedCards: [],
    incorrectFormulas: [],
    audioSettings: { bgm: true, se: true, volume: 1 }
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
  // scalars
  out.score = Number.isFinite(input.score) ? input.score : base.score;
  out.lives = Number.isFinite(input.lives) ? input.lives : base.lives;
  out.lastStageId = typeof input.lastStageId === 'string' || input.lastStageId === null ? input.lastStageId : base.lastStageId;
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


