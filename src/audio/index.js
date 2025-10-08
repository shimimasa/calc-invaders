// 置換ではなく、下記全体に差し替え推奨
const STORAGE_KEY = 'ci:audio:v1';

let sfxEnabled = true;
let bgmEnabled = true;
let unlocked = false;

const buffers = new Map(); // name -> HTMLAudioElement
const bgmPlaying = new Set();

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
function getOrCreate(name, loop=false){
  if (buffers.has(name)) return buffers.get(name);
  // ここは実ファイルに合わせて名前を調整してください
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
  buffers.set(name, a);
  return a;
}

export function applyAudioSettingsFromStorage(){ load(); return { sfxEnabled, bgmEnabled }; }
export function getSfxEnabled(){ return sfxEnabled; }
export function getBgmEnabled(){ return bgmEnabled; }
export function setSfxEnabled(v){ sfxEnabled = !!v; save(); }
export function setBgmEnabled(v){ bgmEnabled = !!v; save(); }
export function unlockAudio(){ unlocked = true; }

export function playSfx(name){
  if (!unlocked || !sfxEnabled) return false;
  const a = getOrCreate(name, false);
  if (!a.src) return false;
  // 連打でも鳴るように都度clone
  try { const c = a.cloneNode(true); c.currentTime = 0; c.play().catch(()=>{}); } catch(_e){}
  return true;
}
export function startBgm(name){
  if (!unlocked || !bgmEnabled) return false;
  const a = getOrCreate(name, true);
  if (!a.src) return false;
  try { a.currentTime = 0; a.play().catch(()=>{}); bgmPlaying.add(name); } catch(_e){}
  return true;
}
export function stopBgm(name){
  if (name){
    const a = buffers.get(name);
    try { a && a.pause(); } catch(_e){}
    bgmPlaying.delete(name);
    return true;
  }
  // 全停止
  for (const n of Array.from(bgmPlaying)){
    const a = buffers.get(n); try{ a && a.pause(); }catch(_e){}
  }
  bgmPlaying.clear();
  return true;
}

