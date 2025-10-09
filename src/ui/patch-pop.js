/* ===== Enter発射の堅牢化パッチ ===== */
(function () {
    const q = (sel) => document.querySelector(sel);
  
    // 面倒でも毎回安全に参照
    const getFireBtn = () => q('#fire-btn, .fire-btn, button.launch, button.fire');
  
    // 1) 入力欄で Enter → 発射（IME確定は除外）
    const bindEnter = () => {
      const inp = q('#answer-panel input[type="text"], .answer-panel input[type="text"], .bottom-input input[type="text"]');
      if (!inp) return;
  
      // 既存重複を避ける
      inp.removeEventListener('keydown', window.__ci_enterHandler);
      window.__ci_enterHandler = (e) => {
        if (e.key === 'Enter' && !e.isComposing) {
          const fire = getFireBtn();
          if (fire && !fire.disabled) {
            e.preventDefault();
            fire.click?.();
          }
        }
      };
      inp.addEventListener('keydown', window.__ci_enterHandler);
  
      // 2) もしフォーム内なら submit を横取りしてクリックに変換
      const form = inp.closest('form');
      if (form && !form.__ci_submitBound) {
        form.addEventListener('submit', (e) => {
          const fire = getFireBtn();
          if (fire && !fire.disabled) {
            e.preventDefault();
            fire.click?.();
          }
        });
        form.__ci_submitBound = true;
      }
    };
  
    // 3) 初期化時＋微小遅延でもバインド（SPA対策）
    const init = () => {
      // 発射ボタンに id/class 付与（なければ）
      const btn = getFireBtn();
      if (btn) {
        btn.id = btn.id || 'fire-btn';
        btn.classList.add('fire-btn');
        btn.setAttribute('aria-label','発射');
        if (!/発射/.test(btn.innerText)) btn.innerText = '🚀 発射';
        btn.tabIndex = 0;
      }
      bindEnter();
    };
    document.addEventListener('DOMContentLoaded', () => { init(); setTimeout(init, 50); });
  })();
  