/* ==========================================
 * patch-pop.js (safe v3)
 * - 文字可読性の自動補正 (.on-dark / .on-light)
 * - Enterキーで発射（IME確定は除外）
 * - フォームsubmit→発射ボタンへ変換
 * - 既存DOMに合わせたセレクタ (#answer / #fire 対応)
 * - MutationObserverは rAF でデバウンス＆属性監視なし（無限ループ防止）
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
    // 背景色（透明なら親を辿る）
    let node = el, bg = '';
    while (node && node !== document && (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')) {
      bg = getComputedStyle(node).backgroundColor;
      node = node.parentElement;
    }
    const isDark = yiq(toRGB(bg)) < 150;

    // 変更がある時だけクラス操作（無駄な attribute 変更を避ける）
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

  // スキャン対象
  const targetsSelector = [
    '.problem-card', '.question', '.question-card',
    'button', '.btn', '.chip', '.pill',
    '.overlay h1', '.overlay h2', '.modal h1', '.modal h2',
    '.pause-text', '.stage-clear-title', '.modal-title'
  ].join(',');

  const scan = () => {
    try {
      qa(targetsSelector).forEach(applyContrast);
    } catch (e) {
      // 失敗してもアプリ自体は止めない
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

  // DOMContentLoaded 後に複数回呼んでおく（SPAや遅延描画対策）
  document.addEventListener('DOMContentLoaded', () => {
    init();
    setTimeout(init, 50);
    setTimeout(init, 300);
  });

  // ---------- 変更監視（安全版） ----------
  // attributes は監視しない（自分の class 付け替えでループするため）
  // childList + subtree のみを rAF でデバウンス
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
  // 監視開始
  window.addEventListener('load', () => {
    try {
      mo.observe(document.body, { childList: true, subtree: true });
    } catch (e) {
      console.warn('[patch-pop] observer start failed', e);
    }
  });

  // ページ離脱時に監視停止（念のため）
  window.addEventListener('beforeunload', () => {
    try { mo.disconnect(); } catch {}
  });
})();
