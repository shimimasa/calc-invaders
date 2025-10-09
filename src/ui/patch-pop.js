/* ===== Enter発射の堅牢化パッチ ===== */
(function () {
    const q = (sel) => document.querySelector(sel);
  
    // 面倒でも毎回安全に参照
    const getFireBtn = () => q('#fire, #fire-btn, .fire-btn, button.launch, button.fire');
  
    // 1) 入力欄で Enter → 発射（IME確定は除外）
    const bindEnter = () => {
      const inp = q('#answer, #answer-panel input[type="text"], .answer-panel input[type="text"], .bottom-input input[type="text"]');
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
  
  /* ===== 背景明度で .on-dark / .on-light を自動付与 ===== */
(function () {
    const targetsSelector = [
      '.problem-card', '.question', '.question-card',
      'button', '.btn', '.chip', '.pill',
      '.overlay h1', '.overlay h2', '.modal h1', '.modal h2'
    ].join(',');
  
    const toRGB = (cssColor) => {
      if (!cssColor) return [255,255,255];
      const m = cssColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
      return m ? [ +m[1], +m[2], +m[3] ] : [255,255,255];
    };
    const yiq = ([r,g,b]) => (r*299 + g*587 + b*114) / 1000; // 明度
  
    const applyContrast = (el) => {
      // 背景色（透明のときは親を辿る）
      let node = el, bg;
      while (node && node !== document && (!bg || bg === 'rgba(0, 0, 0, 0)')) {
        bg = getComputedStyle(node).backgroundColor;
        node = node.parentElement;
      }
      const y = yiq(toRGB(bg));
      el.classList.remove('on-dark', 'on-light');
      el.classList.add(y < 150 ? 'on-dark' : 'on-light');
    };
  
    const scan = () => document.querySelectorAll(targetsSelector).forEach(applyContrast);
  
    // 初期＋遅延（SPA/描画遅延対策）
    document.addEventListener('DOMContentLoaded', () => { scan(); setTimeout(scan, 50); setTimeout(scan, 300); });
  
    // 変化を監視（カード出現・画面遷移時）
    const mo = new MutationObserver(() => scan());
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class','style'] });
  })();
  