// 置換ではなく、下記全体に差し替え推奨
const STORAGE_KEY = 'ci:audio:v2';

let sfxEnabled = true;
let bgmEnabled = true;
let masterVolume = 1.0; // 0..1
let unlocked = false;

const buffers = new Map(); // name -> HTMLAudioElement (template)
const bgmPlaying = new Map(); // name -> HTMLAudioElement (active)

function load(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.sfxEnabled === 'boolean') sfxEnabled = parsed.sfxEnabled;
    if (typeof parsed?.bgmEnabled === 'boolean') bgmEnabled = parsed.bgmEnabled;
    if (Number.isFinite(parsed?.masterVolume)) masterVolume = Math.max(0, Math.min(1, parsed.masterVolume));
  }catch(_e){}
}
function save(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify({ sfxEnabled, bgmEnabled, masterVolume })); }catch(_e){}
}
function getOrCreate(name, loop=false){
  if (buffers.has(name)) return buffers.get(name);
  // 実ファイル名はプロジェクトに合わせて配置してください
  const srcMap = {
    shot: 'assets/audio/shot.mp3',
    hit: 'assets/audio/hit.mp3',
    miss: 'assets/audio/miss.mp3',
    explosion: 'assets/audio/explosion.mp3',
    clear: 'assets/audio/clear.mp3',
    gameover: 'assets/audio/gameover.mp3',
    bgm_stage: 'assets/audio/bgm_stage.mp3',
    bgm_title: 'assets/audio/bgm_title.mp3',
  };
  const a = new Audio(srcMap[name] || '');
  a.preload = 'auto';
  a.loop = !!loop;
  a.volume = masterVolume;
  buffers.set(name, a);
  return a;
}

export function applyAudioSettingsFromStorage(){ load(); return { sfxEnabled, bgmEnabled, masterVolume }; }
export function getSfxEnabled(){ return sfxEnabled; }
export function getBgmEnabled(){ return bgmEnabled; }
export function getMasterVolume(){ return masterVolume; }
export function setSfxEnabled(v){ sfxEnabled = !!v; save(); }
export function setBgmEnabled(v){ bgmEnabled = !!v; save(); }
export function setMasterVolume(v){ masterVolume = Math.max(0, Math.min(1, Number(v)||0)); save();
  for (const a of bgmPlaying.values()){ try{ a.volume = masterVolume; }catch(_e){} }
}
export function unlockAudio(){ unlocked = true; }

export function playSfx(name){
  if (!unlocked || !sfxEnabled) return false;
  const tmpl = getOrCreate(name, false);
  if (!tmpl.src) return false;
  try {
    const c = tmpl.cloneNode(true);
    c.volume = masterVolume;
    c.currentTime = 0; c.play().catch(()=>{});
  } catch(_e){}
  return true;
}
export function startBgm(name){
  if (!unlocked || !bgmEnabled) return false;
  const a = getOrCreate(name, true);
  if (!a.src) return false;
  try {
    const prev = bgmPlaying.get(name);
    if (prev) { try{ prev.pause(); }catch(_e){} }
    a.currentTime = 0; a.volume = masterVolume; a.play().catch(()=>{});
    bgmPlaying.set(name, a);
  } catch(_e){}
  return true;
}
export function stopBgm(name){
  if (name){
    const a = bgmPlaying.get(name) || buffers.get(name);
    try { a && a.pause(); } catch(_e){}
    bgmPlaying.delete(name);
    return true;
  }
  // 全停止
  for (const a of bgmPlaying.values()){
    try{ a.pause(); }catch(_e){}
  }
  bgmPlaying.clear();
  return true;
}

