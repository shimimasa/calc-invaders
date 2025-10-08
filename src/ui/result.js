// src/ui/result.js
export function showStageClear({ stageId, score, onRetry, onNext, onTitle, onCollection, earned }){
  const wrap = document.createElement('div');
  Object.assign(wrap.style, {
    position:'fixed', inset:'0', display:'grid', placeItems:'center', background:'rgba(0,0,0,0.6)', zIndex:'1000'
  });
  const panel = document.createElement('div');
  Object.assign(panel.style, {
    background:'#14182c', border:'1px solid #31364b', borderRadius:'12px', padding:'16px 20px', minWidth:'min(460px,92vw)', color:'#e8e8e8'
  });
  const h = document.createElement('h3'); h.textContent = 'STAGE CLEAR!';
  const s = document.createElement('div'); s.textContent = `Stage: ${stageId}  |  Score: ${score}`;

  // Card preview
  const [suit, rstr] = String(stageId||'').split('_');
  const rank = Number(rstr)||1;
  const SUIT_LABEL = { heart: '♡', spade: '♠', club: '♣', diamond: '♦' };
  const cardWrap = document.createElement('div');
  Object.assign(cardWrap.style, { display:'flex', alignItems:'center', gap:'10px', marginTop:'8px' });
  const card = document.createElement('div');
  Object.assign(card.style, { width:'64px', height:'88px', borderRadius:'8px', border:'1px solid #31364b', display:'grid', placeItems:'center', fontSize:'28px', background:'#1a2038' });
  card.textContent = `${SUIT_LABEL[suit]||''}${rank}`;
  const gained = document.createElement('div');
  gained.textContent = earned ? '新規獲得!' : '獲得済み';
  Object.assign(gained.style, { color: earned ? '#9ecbff' : '#8b90a5' });
  cardWrap.append(card, gained);

  const row = document.createElement('div'); Object.assign(row.style, { display:'flex', gap:'8px', marginTop:'12px', justifyContent:'center', flexWrap:'wrap' });

  const btnRetry = document.createElement('button'); btnRetry.textContent = 'もう一度';
  const btnNext  = document.createElement('button'); btnNext.textContent  = '次のランクへ';
  const btnTitle = document.createElement('button'); btnTitle.textContent = 'タイトルへ';
  const btnColl  = document.createElement('button'); btnColl.textContent  = 'コレクション';

  [btnRetry, btnNext, btnTitle, btnColl].forEach(b => {
    Object.assign(b.style, { padding:'8px 12px', borderRadius:'8px', border:'1px solid #31364b', background:'#1a2038', color:'#e8e8e8', cursor:'pointer' });
  });

  btnRetry.addEventListener('click', () => { cleanup(); onRetry?.(); });
  btnNext .addEventListener('click', () => { cleanup(); onNext?.(); });
  btnTitle.addEventListener('click', () => { cleanup(); onTitle?.(); });
  btnColl .addEventListener('click', () => { cleanup(); onCollection?.(); });

  row.append(btnRetry, btnNext, btnColl, btnTitle);
  panel.append(h, s, cardWrap, row);
  wrap.append(panel);
  document.body.appendChild(wrap);

  function cleanup(){ wrap.remove(); }
  return cleanup;
}

export function showGameOver({ stageId, score, onRetry, onStageSelect, onTitle }){
  const wrap = document.createElement('div');
  Object.assign(wrap.style, {
    position:'fixed', inset:'0', display:'grid', placeItems:'center', background:'rgba(0,0,0,0.6)', zIndex:'1000'
  });
  const panel = document.createElement('div');
  Object.assign(panel.style, {
    background:'#14182c', border:'1px solid #31364b', borderRadius:'12px', padding:'16px 20px', minWidth:'min(460px,92vw)', color:'#e8e8e8'
  });
  const h = document.createElement('h3'); h.textContent = 'GAME OVER';
  const s = document.createElement('div'); s.textContent = `Stage: ${stageId}  |  Score: ${score}`;

  const row = document.createElement('div'); Object.assign(row.style, { display:'flex', gap:'8px', marginTop:'12px', justifyContent:'center', flexWrap:'wrap' });

  const btnRetry = document.createElement('button'); btnRetry.textContent = 'もう一度';
  const btnSelect= document.createElement('button'); btnSelect.textContent= 'ステージ選択';
  const btnTitle = document.createElement('button'); btnTitle.textContent = 'タイトルへ';

  ;[btnRetry, btnSelect, btnTitle].forEach(b => {
    Object.assign(b.style, { padding:'8px 12px', borderRadius:'8px', border:'1px solid #31364b', background:'#1a2038', color:'#e8e8e8', cursor:'pointer' });
  });

  btnRetry.addEventListener('click', () => { cleanup(); onRetry?.(); });
  btnSelect.addEventListener('click', () => { cleanup(); onStageSelect?.(); });
  btnTitle.addEventListener('click', () => { cleanup(); onTitle?.(); });

  row.append(btnRetry, btnSelect, btnTitle);
  panel.append(h, s, row);
  wrap.append(panel);
  document.body.appendChild(wrap);

  function cleanup(){ wrap.remove(); }
  return cleanup;
}