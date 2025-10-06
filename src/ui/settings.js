import { applyAudioSettingsFromStorage, setSfxEnabled, setBgmEnabled, getSfxEnabled, getBgmEnabled } from "../audio/index.js";

export function mountSettings({ rootEl }){
  if (!rootEl) return;
  applyAudioSettingsFromStorage();

  rootEl.innerHTML = "";
  const sfx = document.createElement('input'); sfx.type = 'checkbox'; sfx.id = 'toggle-sfx';
  const bgm = document.createElement('input'); bgm.type = 'checkbox'; bgm.id = 'toggle-bgm';
  const ls1 = document.createElement('label'); ls1.setAttribute('for','toggle-sfx'); ls1.textContent = 'SFX';
  const ls2 = document.createElement('label'); ls2.setAttribute('for','toggle-bgm'); ls2.textContent = 'BGM';
  rootEl.append(ls1, sfx, ls2, bgm);

  sfx.checked = getSfxEnabled();
  bgm.checked = getBgmEnabled();
  sfx.addEventListener('change', () => setSfxEnabled(sfx.checked));
  bgm.addEventListener('change', () => setBgmEnabled(bgm.checked));
}


