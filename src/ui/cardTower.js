import { loadState, flipCard, unlockSuit, setLastStageId } from "../core/gameState.js";

const SUITS = ["heart", "spade", "club", "diamond"];
const SUIT_LABEL = { heart: '♡', spade: '♠', club: '♣', diamond: '♦' };

export function renderCardTower({ rootEl, onSelectStage, onClose }){
  if (!rootEl) return;
  const state = loadState();
  rootEl.innerHTML = "";

  // overlay
  const wrap = document.createElement('div');
  Object.assign(wrap.style, { position:'fixed', inset:'0', display:'grid', placeItems:'center', background:'rgba(0,0,0,0.6)', zIndex:'1000' });
  const panel = document.createElement('div');
  Object.assign(panel.style, { background:'#14182c', border:'1px solid #31364b', borderRadius:'12px', padding:'16px 20px', minWidth:'min(860px,92vw)', color:'#e8e8e8', maxHeight:'85vh', overflow:'auto' });

  const header = document.createElement('div');
  header.style.display = 'flex'; header.style.justifyContent = 'space-between'; header.style.alignItems = 'center'; header.style.gap = '8px';
  const title = document.createElement('h3'); title.textContent = 'ステージ選択（52枚）'; title.style.margin = '0';
  const close = document.createElement('button'); close.textContent = '閉じる';
  Object.assign(close.style, { padding:'6px 10px', borderRadius:'8px', border:'1px solid #31364b', background:'#1a2038', color:'#e8e8e8', cursor:'pointer' });
  close.addEventListener('click', () => { wrap.remove(); if (typeof onClose === 'function') onClose(); });
  header.append(title, close);

  const legend = document.createElement('div');
  legend.textContent = '♡=足し算 ＋ / ♠=引き算 − / ♣=かけ算 × / ♦=わり算 ÷ （クリックで開始。ロックは未解放）';
  legend.style.opacity = '0.85'; legend.style.margin = '6px 0 10px';

  const grid = document.createElement('div');
  Object.assign(grid.style, { display:'grid', gridTemplateColumns:'repeat(13, 1fr)', gap:'6px' });

  const btnMap = new Map(); // id -> button

  // 4 × 13
  SUITS.forEach((suit) => {
    for (let rank = 1; rank <= 13; rank++){
      const id = `${suit}_${String(rank).padStart(2,'0')}`;
      const btn = document.createElement("button");
      btn.className = "card";
      btn.dataset.stageId = id;
      btn.setAttribute("aria-label", `${suit.toUpperCase()} ${rank}`);
      btn.textContent = `${SUIT_LABEL[suit]}${rank}`;
      btn.setAttribute("tabindex", "0");

      const isUnlocked = state.unlockedSuits?.[suit] === true;
      const isFlipped = (state.flippedCards || []).includes(id);
      // styles
      Object.assign(btn.style, { padding:'8px 4px', borderRadius:'8px', border:'1px solid #31364b', cursor: isUnlocked ? 'pointer' : 'not-allowed' });
      btn.style.background = isFlipped ? '#2a355f' : (isUnlocked ? '#1a2038' : '#0f1224');
      btn.style.color = isUnlocked ? (isFlipped ? '#9ecbff' : '#e8e8e8') : '#666b86';

      btn.addEventListener("click", () => {
        const st = loadState();
        if (st.unlockedSuits?.[suit] !== true) return;
        setLastStageId(id);
        wrap.remove();
        if (typeof onSelectStage === 'function') onSelectStage(id);
      });

      grid.appendChild(btn);
      btnMap.set(id, btn);
    }
  });

  panel.append(header, legend, grid);
  wrap.append(panel);
  rootEl.appendChild(wrap);

  // パターンのツールチップを非同期で付与
  (async () => {
    for (const suit of SUITS){
      for (let rank = 1; rank <= 13; rank++){
        const id = `${suit}_${String(rank).padStart(2,'0')}`;
        const btn = btnMap.get(id);
        if (!btn) continue;
        try{
          const res = await fetch(`data/stages/${id}.json`);
          if (!res.ok) continue;
          const js = await res.json();
          const pattern = js?.generator?.pattern || '';
          btn.title = pattern ? `${SUIT_LABEL[suit]}${rank}: ${pattern}` : `${SUIT_LABEL[suit]}${rank}`;
        } catch(_e) {
          btn.title = `${SUIT_LABEL[suit]}${rank}`;
        }
      }
    }
  })();
}

export function markStageCleared(stageId){
  // 例: heart_13 クリアで spade を解放、などの進行はここで拡張
  flipCard(stageId);
  const [suit, rankStr] = String(stageId || '').split('_');
  const rank = Number(rankStr);
  if (rank === 13) {
    // 次のスーツを解放
    const order = { heart: 0, spade: 1, club: 2, diamond: 3 };
    const nextSuit = SUITS[order[suit] + 1];
    if (nextSuit) unlockSuit(nextSuit);
  }
}


