import { applyAudioSettingsFromStorage, setSfxEnabled, setBgmEnabled, getSfxEnabled, getBgmEnabled, getMasterVolume, setMasterVolume } from "../audio/index.js";
import { loadState, setGameSettings, setA11ySettings } from "../core/gameState.js";

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
  // Time limit
  const timeToggle = document.createElement('input'); timeToggle.type = 'checkbox'; timeToggle.id = 'toggle-time';
  const timeLabel = document.createElement('label'); timeLabel.setAttribute('for','toggle-time'); timeLabel.textContent = '時間制限を有効にする';
  const timeSec = document.createElement('input'); timeSec.type = 'number'; timeSec.min = '10'; timeSec.max = '600'; timeSec.step = '5'; timeSec.id = 'time-sec';
  // A11y
  const bigBtn = document.createElement('input'); bigBtn.type = 'checkbox'; bigBtn.id = 'a11y-big';
  const bigLbl = document.createElement('label'); bigLbl.setAttribute('for','a11y-big'); bigLbl.textContent = 'ボタンを大きくする';
  const hiContrast = document.createElement('input'); hiContrast.type = 'checkbox'; hiContrast.id = 'a11y-contrast';
  const hiLbl = document.createElement('label'); hiLbl.setAttribute('for','a11y-contrast'); hiLbl.textContent = 'ハイコントラスト';

  wrap.append(ls1, sfx, ls2, bgm, lsv, vol, timeLabel, timeToggle, timeSec, bigLbl, bigBtn, hiLbl, hiContrast);
  rootEl.append(wrap);

  sfx.checked = getSfxEnabled();
  bgm.checked = getBgmEnabled();
  vol.value = String(getMasterVolume());
  const st = loadState();
  timeToggle.checked = !!st.gameSettings?.timeLimitEnabled;
  timeSec.value = String(st.gameSettings?.timeLimitSec || 60);
  bigBtn.checked = !!st.a11ySettings?.largeButtons;
  hiContrast.checked = !!st.a11ySettings?.highContrast;
  sfx.addEventListener('change', () => setSfxEnabled(sfx.checked));
  bgm.addEventListener('change', () => setBgmEnabled(bgm.checked));
  vol.addEventListener('input', () => setMasterVolume(vol.value));
  timeToggle.addEventListener('change', () => setGameSettings({ timeLimitEnabled: timeToggle.checked }));
  timeSec.addEventListener('change', () => setGameSettings({ timeLimitSec: Number(timeSec.value) }));
  bigBtn.addEventListener('change', () => setA11ySettings({ largeButtons: bigBtn.checked }));
  hiContrast.addEventListener('change', () => setA11ySettings({ highContrast: hiContrast.checked }));
}


