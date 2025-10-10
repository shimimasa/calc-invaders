/* ==========================================
 * patch-pop.js (safe v3.1)
 * - 文字可読性の自動補正 (.on-dark / .on-light)
 * - Enterキーで発射（IME確定は除外）
 * - フォームsubmit→発射ボタンへ変換
 * - 既存DOMに合わせたセレクタ (#answer / #fire 対応)
 * - MutationObserverは rAF デバウンス（属性監視なし）
 * ========================================== */

(function () {
  // ---------- util ----------
  const q  = (sel) => document.querySelector(sel);
  const qa = (sel) => Array.from(document.querySelectorAll(sel));
  const getFireBtn = () => q('#fire, #fire-btn, .fire-btn, button.launch, button.fire');

  // 背景明度 → on-dark / on-light
  const toRGB = (cssColor) => {
    if (!cssColor) return [255, 255, 255];
    const m = cssColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    return m ? [ +m[1], +m[2], +m[3] ] : [255, 255, 255];
  };
  const yiq = ([r,g,b]) => (r*299 + g*587 + b*114) / 1000;

  const applyContrast = (el) => {
    // HUD・回答パネル・設定画面は自動付与対象から除外
    if (el.closest('[data-hud], .hud, header .status, .top-bar')) return;
    if (el.closest('#answer-panel, .answer-panel, .bottom-input')) return;
    if (el.closest('[data-settings], .settings, .settings-panel, .settings-section, .settings-modal')) return;

    // 背景色（透明なら親を辿る）
    let node = el, bg = '';
    while (node && node !== document && (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')) {
      bg = getComputedStyle(node).backgroundColor;
      node = node.parentElement;
    }
    const isDark = yiq(toRGB(bg)) < 150;

    // 変更がある時だけクラス操作（無駄を避ける）
    if (isDark) {
      if (!el.classList.contains('on-dark')) {
        el.classList.remove('on-light');
        el.classList.add('on-dark');
      }
    } else {
      if (!el.classList.contains('on-light')) {
        el.classList.remove('on-dark');
        el.classList.add('on-light');
      }
    }
  };

  // スキャン対象（設定画面の .modal 見出しは除外）
  const targetsSelector = [
    '.problem-card', '.question', '.question-card',
    'button', '.btn', '.chip', '.pill',
    '.overlay h1', '.overlay h2',
    '.pause-text', '.stage-clear-title', '.modal-title'
  ].join(',');

  const scan = () => {
    try {
      qa(targetsSelector).forEach(applyContrast);
    } catch (e) {
      console.error('[patch-pop] scan error', e);
    }
  };

  // ---------- input / enter ----------
  const bindEnterAndSubmit = () => {
    const inp = q('#answer, #answer-panel input[type="text"], .answer-panel input[type="text"], .bottom-input input[type="text"]');
    if (!inp) return;

    // 二重登録防止
    if (inp.__ci_enterBound) return;
    inp.__ci_enterBound = true;

    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.isComposing) {
        const fire = getFireBtn();
        if (fire && !fire.disabled) {
          e.preventDefault();
          fire.click?.();
        }
      }
    });

    const form = inp.closest('form');
    if (form && !form.__ci_submitBound) {
      form.__ci_submitBound = true;
      form.addEventListener('submit', (e) => {
        const fire = getFireBtn();
        if (fire && !fire.disabled) {
          e.preventDefault();
          fire.click?.();
        }
      });
    }

    // 発射ボタンに最低限の属性を付与
    const btn = getFireBtn();
    if (btn) {
      btn.id = btn.id || 'fire';
      btn.classList.add('fire-btn');
      btn.setAttribute('aria-label','発射');
      if (!/発射/.test(btn.innerText)) btn.innerText = '🚀 発射';
      btn.tabIndex = 0;
    }
  };

  // ---------- 初期化 ----------
  const init = () => {
    bindEnterAndSubmit();
    scan();
  };

  document.addEventListener('DOMContentLoaded', () => {
    init();
    setTimeout(init, 50);
    setTimeout(init, 300);
  });

  // ---------- 変更監視（安全版） ----------
  let scanPending = false;
  const mo = new MutationObserver(() => {
    if (scanPending) return;
    scanPending = true;
    requestAnimationFrame(() => {
      try {
        bindEnterAndSubmit(); // 新規ノードに入力・ボタンが来た場合
        scan();
      } finally {
        scanPending = false;
      }
    });
  });
  window.addEventListener('load', () => {
    try {
      mo.observe(document.body, { childList: true, subtree: true });
    } catch (e) {
      console.warn('[patch-pop] observer start failed', e);
    }
  });
  window.addEventListener('beforeunload', () => {
    try { mo.disconnect(); } catch {}
  });
})();
