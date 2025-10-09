// src/ui/patch-pop.js
document.addEventListener('DOMContentLoaded', () => {
    // 1) 上部HUDらしきブロックに data-hud を付与（スタイル適用のため）
    const hudCandidates = Array.from(document.querySelectorAll('header, .top, .top-bar, .status, nav'))
      .filter(el => /score|life|stage|time|remain|mode|op/i.test(el.innerText || ''));
    (hudCandidates[0] || document.body).setAttribute('data-hud','');
  
    // 2) 問題カードらしき要素に .problem-card を付ける（式のみのカードを強調）
    //   例：「123 + 456 = ?」のような数式っぽい文字列を持つ要素を拾う
    const isExpr = (t) => /\d+\s*[+\-×x÷/]\s*\d+/.test(t);
    const allBlocks = Array.from(document.querySelectorAll('div, p, span, li, button'));
    allBlocks.forEach(el => {
      const t = (el.innerText || '').trim();
      if (t && isExpr(t) && t.length <= 32) {
        el.classList.add('problem-card');
        el.setAttribute('role','button');
        el.setAttribute('aria-label','計算問題');
        el.addEventListener('click', ()=> {
          document.querySelectorAll('.problem-card.is-active').forEach(e=>e.classList.remove('is-active'));
          el.classList.add('is-active');
          // クリックしたら回答欄にフォーカス
          const inp = document.querySelector('#answer-panel input[type="text"], .answer-panel input[type="text"], .bottom-input input[type="text"]');
          if (inp) inp.focus();
        }, {passive:true});
      }
    });
  
    // 3) 画面下の回答エリアを検出＆id付与（なければ作る）
    let answerPanel = document.querySelector('#answer-panel, .answer-panel, .bottom-input');
    if (!answerPanel) {
      // 最低限の入力UIを挿入（既存が見つからない場合だけ）
      answerPanel = document.createElement('div');
      answerPanel.id = 'answer-panel';
      answerPanel.innerHTML = `
        <input type="text" placeholder="ここに答えを書いてね！" aria-label="答え入力">
        <button id="fire-btn" class="fire-btn" aria-label="発射">🚀 発射</button>
        <small style="opacity:.7;font-weight:700;">EnterでもOK</small>
      `;
      document.body.appendChild(answerPanel);
    } else {
      // 既存の見た目をポップに
      answerPanel.id = answerPanel.id || 'answer-panel';
      const text = answerPanel.querySelector('input[type="text"]');
      if (text && !text.placeholder) text.placeholder = 'ここに答えを書いてね！';
      const fire = answerPanel.querySelector('button');
      if (fire && !fire.id) {
        fire.id = 'fire-btn';
        fire.classList.add('fire-btn');
        if (!/発射/.test(fire.innerText)) fire.innerText = '🚀 発射';
        fire.setAttribute('aria-label','発射');
      }
    }
  
    // 4) 進捗バー（あればラベルを内側に表示）
    const remain = document.querySelector('.remain-bar, #remainBar, [data-remain]');
    const time = document.querySelector('.time-bar, #timeBar, [data-time]');
    const prepareBar = (bar, label) => {
      if (!bar) return;
      bar.classList.add(bar.id === 'timeBar' ? 'time-bar' : 'remain-bar');
      if (!bar.querySelector('.fill')) {
        const fill = document.createElement('div'); fill.className='fill';
        const lab = document.createElement('div'); lab.className='label'; lab.textContent = label;
        bar.append(fill, lab);
      }
    };
    prepareBar(remain, 'のこり問題');
    prepareBar(time,   'のこり時間');
  
    // 5) Enterで発射（既存のハンドラがあっても衝突しにくい安全実装）
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const fire = document.querySelector('#fire-btn, .fire-btn, button.launch, button.fire');
        if (fire) fire.click?.();
      }
    });
  });
  