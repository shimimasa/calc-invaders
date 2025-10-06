const STORAGE_KEY = 'ci:audio:v1';

let sfxEnabled = true;
let bgmEnabled = true;
let unlocked = false;

function load(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.sfxEnabled === 'boolean') sfxEnabled = parsed.sfxEnabled;
    if (typeof parsed?.bgmEnabled === 'boolean') bgmEnabled = parsed.bgmEnabled;
  }catch(_e){}
}
function save(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify({ sfxEnabled, bgmEnabled })); }catch(_e){}
}

export function applyAudioSettingsFromStorage(){ load(); return { sfxEnabled, bgmEnabled }; }
export function getSfxEnabled(){ return sfxEnabled; }
export function getBgmEnabled(){ return bgmEnabled; }
export function setSfxEnabled(v){ sfxEnabled = !!v; save(); }
export function setBgmEnabled(v){ bgmEnabled = !!v; save(); }
export function unlockAudio(){ unlocked = true; }

// Stubs: 実オーディオ再生は未実装。戻り値で有効/無効を示す。
export function playSfx(_name){ return unlocked && !!sfxEnabled; }
export function startBgm(_name){ return unlocked && !!bgmEnabled; }
export function stopBgm(){ return true; }


