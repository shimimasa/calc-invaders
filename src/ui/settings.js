import {
  applyAudioSettingsFromStorage, setSfxEnabled, setBgmEnabled,
  getSfxEnabled, getBgmEnabled, getMasterVolume, setMasterVolume
} from "../audio/index.js";
import { loadState, setGameSettings, setA11ySettings } from "../core/gameState.js";

export function mountSettings({ rootEl }){
  if (!rootEl) return;
  applyAudioSettingsFromStorage();

  rootEl.innerHTML = "";
  const container = document.createElement('div');
  container.className = 'col settings';
  container.setAttribute('data-settings', '');   // ← CSS側の強制黒指定に使う

  // --- Audio Section ---
  const secAudio = sectionCard('🔊 音の設定', '効果音やBGM、全体の音量を調整できます。');
  const rowSfx = rowToggle('効果音 (SFX)', 'toggle-sfx');
  const rowBgm = rowToggle('音楽 (BGM)', 'toggle-bgm');
  const rowVol = document.createElement('div'); rowVol.className = 'row setting-row';
  const lVol = labelFor('master-volume', '音量 (全体)');
  const vol = document.createElement('input'); vol.type = 'range'; vol.min = '0'; vol.max = '1'; vol.step = '0.05'; vol.id = 'master-volume'; vol.style.flex = '1';
  const volVal = document.createElement('span'); volVal.className = 'value'; volVal.style.minWidth = '48px'; volVal.style.textAlign = 'right';
  rowVol.append(lVol, vol, volVal);
  secAudio.body.append(rowSfx.wrap, rowBgm.wrap, rowVol);

  // --- Game Section ---
  const secGame = sectionCard('🕒 ゲーム設定', '時間制限の有効/無効と秒数を設定します。');
  const rowTime = rowToggle('時間制限を有効にする', 'toggle-time');
  const rowSec = document.createElement('div'); rowSec.className = 'row setting-row';
  const lSec = labelFor('time-sec', '時間制限 (秒)');
  const timeSec = document.createElement('input'); timeSec.type = 'number'; timeSec.min = '10'; timeSec.max = '600'; timeSec.step = '5'; timeSec.id = 'time-sec';
  rowSec.append(lSec, timeSec);
  secGame.body.append(rowTime.wrap, rowSec);

  // --- Accessibility Section ---
  const secA11y = sectionCard('♿ アクセシビリティ', '見やすさ/押しやすさの配慮を切り替えます。');
  const rowBig = rowToggle('ボタンを大きくする', 'a11y-big');
  const rowHi = rowToggle('ハイコントラスト', 'a11y-contrast');
  secA11y.body.append(rowBig.wrap, rowHi.wrap);

  container.append(secAudio.card, secGame.card, secA11y.card);
  rootEl.append(container);

  // ---- bind values ----
  const st = loadState();
  rowSfx.input.checked = getSfxEnabled();
  rowBgm.input.checked = getBgmEnabled();
  vol.value = String(getMasterVolume()); volVal.textContent = Math.round(Number(vol.value) * 100) + '%';
  rowTime.input.checked = !!st.gameSettings?.timeLimitEnabled;
  timeSec.value = String(st.gameSettings?.timeLimitSec ?? 60);
  rowBig.input.checked = !!st.a11ySettings?.largeButtons;
  rowHi.input.checked = !!st.a11ySettings?.highContrast;

  // ---- events ----
  rowSfx.input.addEventListener('change', () => setSfxEnabled(rowSfx.input.checked));
  rowBgm.input.addEventListener('change', () => setBgmEnabled(rowBgm.input.checked));
  vol.addEventListener('input', () => { setMasterVolume(vol.value); volVal.textContent = Math.round(Number(vol.value) * 100) + '%'; });
  rowTime.input.addEventListener('change', () => setGameSettings({ timeLimitEnabled: rowTime.input.checked }));
  timeSec.addEventListener('change', () => setGameSettings({ timeLimitSec: Number(timeSec.value) }));
  rowBig.input.addEventListener('change', () => setA11ySettings({ largeButtons: rowBig.input.checked }));
  rowHi.input.addEventListener('change', () => setA11ySettings({ highContrast: rowHi.input.checked }));
}

function sectionCard(title, desc){
  const card = document.createElement('div'); card.className = 'card settings-panel';
  const head = document.createElement('div'); head.className = 'col settings-head';
  const h = document.createElement('h3'); h.className = 'section-title'; h.textContent = title;
  const p = document.createElement('small'); p.className = 'desc'; p.textContent = desc;
  head.append(h, p);
  const body = document.createElement('div'); body.className = 'col settings-section';
  card.append(head, body);
  return { card, body };
}

function rowToggle(labelText, id){
  const wrap = document.createElement('div'); wrap.className = 'row setting-row';
  const label = labelFor(id, labelText);
  const input = document.createElement('input'); input.type = 'checkbox'; input.id = id;
  wrap.append(label, input);
  return { wrap, input };
}

function labelFor(forId, text){
  const l = document.createElement('label');
  l.setAttribute('for', forId);
  l.className = 'label';
  l.textContent = text;
  return l;
}
