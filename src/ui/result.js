// src/ui/result.js
export function showStageClear({ stageId, score, onRetry, onNext, onTitle, onCollection, earned }){
  const wrap = document.createElement('div');
  wrap.className = 'modal-overlay';
  const panel = document.createElement('div');
  panel.className = 'modal-panel card';
  panel.style.minWidth = 'min(560px, 92vw)';

  const h = document.createElement('h2'); h.textContent = 'STAGE CLEAR!';
  const s = document.createElement('div'); s.textContent = `Stage: ${stageId}  |  Score: ${score}`;

  // Card reveal
  const [suit, rstr] = String(stageId||'').split('_');
  const rank = Number(rstr)||1;
  const SUIT_LABEL = { heart: '♡', spade: '♠', club: '♣', diamond: '♦' };
  const reveal = document.createElement('div');
  Object.assign(reveal.style, { display:'flex', alignItems:'center', gap:'12px', marginTop:'12px' });
  const card = document.createElement('div');
  Object.assign(card.style, {
    width:'84px', height:'116px', borderRadius:'12px', border:'1px solid var(--border)',
    display:'grid', placeItems:'center', fontSize:'34px', background:'var(--panel)', boxShadow:'var(--shadow-md)',
    transform:'scale(0.8) rotate(-6deg)', opacity:'0'
  });
  card.textContent = `${SUIT_LABEL[suit]||''}${rank}`;
  const gained = document.createElement('div');
  gained.textContent = earned ? '新規獲得！' : '獲得済み';
  gained.className = 'pill';
  reveal.append(card, gained);

  // simple reveal animation
  requestAnimationFrame(() => {
    card.animate([
      { transform:'scale(0.8) rotate(-6deg)', opacity:0 },
      { transform:'scale(1) rotate(0deg)', opacity:1 }
    ], { duration: 380, easing: 'cubic-bezier(0.2,0.7,0.2,1)', fill:'forwards' });
  });

  // CTAs
  const row = document.createElement('div'); row.className = 'row'; row.style.justifyContent = 'center'; row.style.flexWrap = 'wrap'; row.style.marginTop = '16px'; row.style.gap = '10px';
  const btnNext  = document.createElement('button'); btnNext.textContent  = '次のランクへ'; btnNext.className = 'btn btn--primary';
  const btnRetry = document.createElement('button'); btnRetry.textContent = 'もう一度'; btnRetry.className = 'btn';
  const btnColl  = document.createElement('button'); btnColl.textContent  = 'コレクション'; btnColl.className = 'btn';
  const btnTitle = document.createElement('button'); btnTitle.textContent = 'タイトルへ'; btnTitle.className = 'btn';

  btnRetry.addEventListener('click', () => { cleanup(); onRetry?.(); });
  btnNext .addEventListener('click', () => { cleanup(); onNext?.(); });
  btnTitle.addEventListener('click', () => { cleanup(); onTitle?.(); });
  btnColl .addEventListener('click', () => { cleanup(); onCollection?.(); });

  row.append(btnNext, btnRetry, btnColl, btnTitle);
  panel.append(h, s, reveal, row);
  wrap.append(panel);
  document.body.appendChild(wrap);

  function cleanup(){ wrap.remove(); }
  return cleanup;
}

export function showGameOver({ stageId, score, onRetry, onStageSelect, onTitle }){
  const wrap = document.createElement('div');
  wrap.className = 'modal-overlay';
  const panel = document.createElement('div');
  panel.className = 'modal-panel card';
  panel.style.minWidth = 'min(560px, 92vw)';
  // calm color accent
  panel.style.background = 'linear-gradient(180deg, #12162a, #0f1424)';

  const h = document.createElement('h2'); h.textContent = 'GAME OVER';
  const s = document.createElement('div'); s.textContent = `Stage: ${stageId}  |  Score: ${score}`;
  const hint = document.createElement('small'); hint.textContent = 'ヒント: 焦らず1問ずつ、選択後に答えを落ち着いて入力しよう。';

  const row = document.createElement('div'); row.className = 'row'; row.style.justifyContent = 'center'; row.style.flexWrap = 'wrap'; row.style.marginTop = '16px'; row.style.gap = '10px';

  const btnRetry = document.createElement('button'); btnRetry.textContent = 'もう一度'; btnRetry.className = 'btn btn--primary';
  const btnSelect= document.createElement('button'); btnSelect.textContent= 'ステージ選択'; btnSelect.className = 'btn';
  const btnTitle = document.createElement('button'); btnTitle.textContent = 'タイトルへ'; btnTitle.className = 'btn';

  btnRetry.addEventListener('click', () => { cleanup(); onRetry?.(); });
  btnSelect.addEventListener('click', () => { cleanup(); onStageSelect?.(); });
  btnTitle.addEventListener('click', () => { cleanup(); onTitle?.(); });

  row.append(btnRetry, btnSelect, btnTitle);
  panel.append(h, s, hint, row);
  wrap.append(panel);
  document.body.appendChild(wrap);

  function cleanup(){ wrap.remove(); }
  return cleanup;
}