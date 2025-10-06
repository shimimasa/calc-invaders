import { loadState, flipCard, unlockSuit, setLastStageId } from "../core/gameState.js";

const SUITS = ["heart", "spade", "club", "diamond"];

export function renderCardTower({ rootEl, onSelectStage }){
  if (!rootEl) return;
  const state = loadState();
  rootEl.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "card-tower";
  rootEl.appendChild(grid);

  // 4 × 13
  SUITS.forEach((suit, sIdx) => {
    for (let rank = 1; rank <= 13; rank++){
      const id = `${suit}_${String(rank).padStart(2,'0')}`;
      const btn = document.createElement("button");
      btn.className = "card";
      btn.dataset.stageId = id;
      btn.setAttribute("aria-label", `${suit.toUpperCase()} ${rank}`);
      btn.textContent = `${suit[0].toUpperCase()}${rank}`;
      btn.setAttribute("tabindex", "0");

      const isUnlocked = state.unlockedSuits?.[suit] === true;
      const isFlipped = (state.flippedCards || []).includes(id);
      btn.classList.toggle("locked", !isUnlocked);
      btn.classList.toggle("unlocked", isUnlocked);
      btn.classList.toggle("flipped", isFlipped);

      btn.addEventListener("click", () => {
        const st = loadState();
        if (st.unlockedSuits?.[suit] !== true) return;
        setLastStageId(id);
        if (typeof onSelectStage === 'function') onSelectStage(id);
      });

      grid.appendChild(btn);
    }
  });
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


