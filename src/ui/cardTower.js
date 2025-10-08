import { loadState, flipCard, unlockSuit, setLastStageId } from "../core/gameState.js";

const SUITS = ["heart", "spade", "club", "diamond"];
const SUIT_LABEL = { heart: '♡', spade: '♠', club: '♣', diamond: '♦' };

export function renderCardTower({ rootEl, onSelectStage, onClose }){
  if (!rootEl) return;
  const state = loadState();
  rootEl.innerHTML = "";

  // overlay
  const wrap = document.createElement('div');
  wrap.className = 'modal-overlay';
  const panel = document.createElement('div');
  panel.className = 'modal-panel card';
  panel.style.minWidth = 'min(960px, 94vw)';
  panel.style.maxHeight = '85vh';
  panel.style.overflow = 'auto';

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

  // filters
  const controls = document.createElement('div'); controls.style.display = 'flex'; controls.style.gap = '12px'; controls.style.alignItems = 'center'; controls.style.margin = '8px 0';
  const suitFilterBox = document.createElement('div'); suitFilterBox.style.display = 'flex'; suitFilterBox.style.gap = '6px';
  const ownedFilterBox = document.createElement('div'); ownedFilterBox.style.display = 'flex'; ownedFilterBox.style.gap = '6px';
  let suitFilter = 'all'; // 'all' | suit
  let ownedFilter = 'all'; // 'all' | 'owned' | 'unowned'

  function mkBtn(label){ const b = document.createElement('button'); b.className = 'btn'; b.textContent = label; return b; }
  const suitAll = mkBtn('すべて');
  const suitH = mkBtn('♡'); const suitS = mkBtn('♠'); const suitC = mkBtn('♣'); const suitD = mkBtn('♦');
  [suitAll, suitH, suitS, suitC, suitD].forEach(b => suitFilterBox.appendChild(b));
  suitAll.addEventListener('click', () => { suitFilter = 'all'; applyFilters(); });
  suitH.addEventListener('click', () => { suitFilter = 'heart'; applyFilters(); });
  suitS.addEventListener('click', () => { suitFilter = 'spade'; applyFilters(); });
  suitC.addEventListener('click', () => { suitFilter = 'club'; applyFilters(); });
  suitD.addEventListener('click', () => { suitFilter = 'diamond'; applyFilters(); });

  const ownAll = mkBtn('すべて'); const ownYes = mkBtn('獲得'); const ownNo = mkBtn('未獲得');
  ownedFilterBox.append(ownAll, ownYes, ownNo);
  ownAll.addEventListener('click', () => { ownedFilter = 'all'; applyFilters(); });
  ownYes.addEventListener('click', () => { ownedFilter = 'owned'; applyFilters(); });
  ownNo.addEventListener('click', () => { ownedFilter = 'unowned'; applyFilters(); });

  controls.append(suitFilterBox, ownedFilterBox);

  const grid = document.createElement('div');
  Object.assign(grid.style, { display:'grid', gridTemplateColumns:'repeat(13, 1fr)', gap:'8px' });

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
      const owned = isFlipped === true;
      btn.dataset.suit = suit;
      btn.dataset.owned = owned ? '1' : '0';
      // styles - card like
      Object.assign(btn.style, {
        height:'112px', display:'grid', placeItems:'center', fontSize:'24px',
        borderRadius:'12px', border:'1px solid var(--border)', boxShadow:'var(--shadow-sm)',
        background: owned ? '#2a355f' : (isUnlocked ? 'var(--panel)' : '#0f1224'),
        color: isUnlocked ? (owned ? 'var(--accent-2)' : 'var(--text)') : '#666b86',
        cursor: isUnlocked ? 'pointer' : 'not-allowed'
      });
      if (!isUnlocked){ btn.style.filter = 'grayscale(0.4)'; }

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

  panel.append(header, legend, controls, grid);
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

  function applyFilters(){
    const children = Array.from(grid.children);
    children.forEach((el) => {
      const suit = el.dataset.suit;
      const owned = el.dataset.owned === '1';
      const suitOk = (suitFilter === 'all') || (suitFilter === suit);
      const ownedOk = (ownedFilter === 'all') || (ownedFilter === 'owned' && owned) || (ownedFilter === 'unowned' && !owned);
      el.style.display = (suitOk && ownedOk) ? '' : 'none';
    });
  }
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


