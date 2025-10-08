// src/ui/collection.js
import { loadState, getAllCardMeta } from '../core/gameState.js';

const SUITS = ['heart','spade','club','diamond'];
const SUIT_LABEL = { heart: '♡', spade: '♠', club: '♣', diamond: '♦' };

export function showCollection({ rootEl, onClose }){
  if (!rootEl) rootEl = document.body;
  const wrap = document.createElement('div');
  Object.assign(wrap.style, { position:'fixed', inset:'0', background:'rgba(0,0,0,0.6)', display:'grid', placeItems:'center', zIndex:'1000' });
  const panel = document.createElement('div');
  Object.assign(panel.style, { background:'#14182c', border:'1px solid #31364b', borderRadius:'12px', padding:'16px 20px', minWidth:'min(720px,92vw)', color:'#e8e8e8', maxHeight:'85vh', overflow:'auto' });

  const h = document.createElement('h3'); h.textContent = 'コレクション（52枚）';

  const grid = document.createElement('div');
  Object.assign(grid.style, { display:'grid', gridTemplateColumns:'repeat(13, 1fr)', gap:'6px' });

  const st = loadState();
  const owned = new Set(st.flippedCards || []);
  const meta = getAllCardMeta();
  let count = 0;

  SUITS.forEach(suit => {
    for (let r=1;r<=13;r++){
      const id = `${suit}_${String(r).padStart(2,'0')}`;
      const btn = document.createElement('button');
      const has = owned.has(id);
      if (has) count++;
      btn.textContent = `${SUIT_LABEL[suit]}${r}`;
      Object.assign(btn.style, {
        padding:'8px 4px', textAlign:'center', borderRadius:'8px',
        border:'1px solid #31364b', background: has ? '#2a355f' : '#1a2038', color: has ? '#9ecbff' : '#8b90a5', cursor:'pointer'
      });
      btn.title = has ? '獲得済み' : '未獲得';
      btn.addEventListener('click', () => showDetail({ id, has, meta: meta[id] }));
      grid.appendChild(btn);
    }
  });

  const info = document.createElement('div'); info.textContent = `獲得: ${count} / 52`;
  info.style.margin = '8px 0';

  const close = document.createElement('button'); close.textContent = '閉じる';
  Object.assign(close.style, { padding:'8px 12px', borderRadius:'8px', border:'1px solid #31364b', background:'#1a2038', color:'#e8e8e8', cursor:'pointer', marginTop:'8px' });
  close.addEventListener('click', () => { wrap.remove(); onClose?.(); });

  panel.append(h, info, grid, close);
  wrap.append(panel);
  rootEl.appendChild(wrap);

  function showDetail({ id, has, meta }){
    const dw = document.createElement('div');
    Object.assign(dw.style, { position:'fixed', inset:'0', display:'grid', placeItems:'center', background:'rgba(0,0,0,0.6)', zIndex:'1100' });
    const dp = document.createElement('div');
    Object.assign(dp.style, { background:'#14182c', border:'1px solid #31364b', borderRadius:'12px', padding:'16px 20px', minWidth:'min(420px,92vw)', color:'#e8e8e8' });
    const h4 = document.createElement('h4'); h4.textContent = `カード詳細: ${id}`;
    const info = document.createElement('div');
    const obtained = has ? (meta?.obtainedAt || '-') : '-';
    const clears = has ? (meta?.clears || 1) : 0;
    const best = has ? (meta?.bestScore || 0) : 0;
    info.textContent = `初取得: ${obtained} / クリア回数: ${clears} / ベスト: ${best}`;

    const play = document.createElement('button'); play.textContent = 'このステージで遊ぶ';
    Object.assign(play.style, { padding:'8px 12px', borderRadius:'8px', border:'1px solid #31364b', background:'#1a2038', color:'#e8e8e8', cursor:'pointer', marginTop:'10px' });
    play.addEventListener('click', () => {
      const ev = new CustomEvent('ci:playStage', { detail: { stageId: id } });
      window.dispatchEvent(ev);
      dw.remove();
      wrap.remove();
    });

    const close2 = document.createElement('button'); close2.textContent = '閉じる';
    Object.assign(close2.style, { padding:'8px 12px', borderRadius:'8px', border:'1px solid #31364b', background:'#1a2038', color:'#e8e8e8', cursor:'pointer', marginTop:'10px', marginLeft:'8px' });
    close2.addEventListener('click', () => dw.remove());

    const row = document.createElement('div');
    Object.assign(row.style, { display:'flex', gap:'8px', marginTop:'8px' });
    row.append(play, close2);

    dp.append(h4, info, row);
    dw.append(dp);
    document.body.appendChild(dw);
  }
}