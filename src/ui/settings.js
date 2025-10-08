import { applyAudioSettingsFromStorage, setSfxEnabled, setBgmEnabled, getSfxEnabled, getBgmEnabled, getMasterVolume, setMasterVolume } from "../audio/index.js";

export function mountSettings({ rootEl }){
  if (!rootEl) return;
  applyAudioSettingsFromStorage();

  rootEl.innerHTML = "";
  const wrap = document.createElement('div');
  const sfx = document.createElement('input'); sfx.type = 'checkbox'; sfx.id = 'toggle-sfx';
  const bgm = document.createElement('input'); bgm.type = 'checkbox'; bgm.id = 'toggle-bgm';
  const vol = document.createElement('input'); vol.type = 'range'; vol.min = '0'; vol.max = '1'; vol.step = '0.05'; vol.id = 'master-volume';
  const ls1 = document.createElement('label'); ls1.setAttribute('for','toggle-sfx'); ls1.textContent = '効果音(SFX)';
  const ls2 = document.createElement('label'); ls2.setAttribute('for','toggle-bgm'); ls2.textContent = '音楽(BGM)';
  const lsv = document.createElement('label'); lsv.setAttribute('for','master-volume'); lsv.textContent = '音量(全体)';
  wrap.append(ls1, sfx, ls2, bgm, lsv, vol);
  rootEl.append(wrap);

  sfx.checked = getSfxEnabled();
  bgm.checked = getBgmEnabled();
  vol.value = String(getMasterVolume());
  sfx.addEventListener('change', () => setSfxEnabled(sfx.checked));
  bgm.addEventListener('change', () => setBgmEnabled(bgm.checked));
  vol.addEventListener('input', () => setMasterVolume(vol.value));
}


