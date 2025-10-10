// src/ui/settings.js
// 設定画面：時間制限UIを撤廃。SFX/BGM/音量/アクセシビリティのみ。

import { state, saveState } from '../state/storage.js';

export function openSettingsModal() {
  const modal = ensureModal();
  render(modal);
  modal.showModal();
}

// --- 既存の import/コードはそのまま ---
// import { state, saveState } from '../state/storage.js';
// export function openSettingsModal() { ... } など

// ▼▼ ここから追加：互換用フック（呼び出し元が期待しているエクスポート） ▼▼
export function mountSettings() {
  // Vercelのビルド時などSSR環境で実行されても安全に抜ける
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // よくあるセレクタを順に探す（あなたのUIに合わせて増やしてOK）
  const btn =
    document.querySelector('[data-action="open-settings"]') ||
    document.querySelector('#btnSettings') ||
    document.querySelector('.js-open-settings');

  // 二重バインド防止
  if (btn && !btn.dataset.boundSettings) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      try { openSettingsModal(); } catch (_) {}
    });
    btn.dataset.boundSettings = '1';
  }
}
// ▲▲ ここまで追加 ▲▲


function ensureModal() {
  let modal = document.getElementById('settingsModal');
  if (modal) return modal;

  modal = document.createElement('dialog');
  modal.id = 'settingsModal';
  modal.className = 'ci-modal';
  modal.innerHTML = `
    <form method="dialog" class="ci-modal__panel" aria-labelledby="settingsTitle">
      <h2 id="settingsTitle" class="ci-modal__title">設定</h2>

      <section class="ci-fieldset">
        <h3 class="ci-fieldset__title">サウンド</h3>
        <label class="ci-row">
          <span>効果音（SFX）</span>
          <input id="sfxToggle" type="checkbox" />
        </label>
        <label class="ci-row">
          <span>音楽（BGM）</span>
          <input id="bgmToggle" type="checkbox" />
        </label>
        <label class="ci-row">
          <span>音量（全体）</span>
          <input id="masterVolume" type="range" min="0" max="1" step="0.05" />
        </label>
      </section>

      <section class="ci-fieldset">
        <h3 class="ci-fieldset__title">アクセシビリティ</h3>
        <label class="ci-row">
          <span>ボタン大きめ</span>
          <input id="a11yLargeButtons" type="checkbox" />
        </label>
        <label class="ci-row">
          <span>ハイコントラスト</span>
          <input id="a11yHighContrast" type="checkbox" />
        </label>
      </section>

      <section class="ci-note">
        <p>※ 時間制限は廃止しました。今後は「クリアタイム」で評価されます。</p>
      </section>

      <menu class="ci-modal__menu">
        <button value="cancel" class="btn secondary">閉じる</button>
        <button id="settingsSave" value="default" class="btn primary">保存</button>
      </menu>
    </form>
  `;
  document.body.appendChild(modal);
  return modal;
}

function render(modal) {
  // 現在値をUIへ
  modal.querySelector('#sfxToggle').checked = !!state.gameSettings.sfx;
  modal.querySelector('#bgmToggle').checked = !!state.gameSettings.bgm;
  modal.querySelector('#masterVolume').value = Number(state.gameSettings.masterVolume ?? 1);

  modal.querySelector('#a11yLargeButtons').checked = !!state.a11ySettings.largeButtons;
  modal.querySelector('#a11yHighContrast').checked = !!state.a11ySettings.highContrast;

  // 保存
  modal.querySelector('#settingsSave').onclick = (e) => {
    e.preventDefault();

    state.gameSettings.sfx = modal.querySelector('#sfxToggle').checked;
    state.gameSettings.bgm = modal.querySelector('#bgmToggle').checked;
    state.gameSettings.masterVolume = Number(modal.querySelector('#masterVolume').value);

    state.a11ySettings.largeButtons = modal.querySelector('#a11yLargeButtons').checked;
    state.a11ySettings.highContrast = modal.querySelector('#a11yHighContrast').checked;

    saveState();
    modal.close();
  };
}

