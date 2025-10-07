// src/ui/title.js
import { loadState, setDifficulty, setSelectedSuits, setSelectedRanks } from '../core/gameState.js';

const SUITS = ['heart','spade','club','diamond'];
const SUIT_LABEL = { heart: '♡', spade: '♠', club: '♣', diamond: '♦' };

export function mountTitle({ rootEl, onStart }){
  if (!rootEl) return;
  const st = loadState();
  rootEl.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.id = 'title-wrap';
  wrap.style.position = 'fixed';
  wrap.style.inset = '0';
  wrap.style.display = 'grid';
  wrap.style.placeItems = 'center';
  wrap.style.background = 'rgba(0,0,0,0.6)';
  wrap.style.zIndex = '1000';

  const panel = document.createElement('div');
  panel.style.background = '#14182c';
  panel.style.border = '1px solid #31364b';
  panel.style.borderRadius = '12px';
  panel.style.padding = '16px 20px';
  panel.style.minWidth = 'min(680px, 92vw)';
  panel.style.color = '#e8e8e8';
  panel.style.boxShadow = '0 8px 24px rgba(0,0,0,0.45)';

  const h1 = document.createElement('h2');
  h1.textContent = '計算インベーダー';
  h1.style.marginTop = '0';

  // difficulty
  const diffBox = document.createElement('div');
  diffBox.style.display = 'flex'; diffBox.style.gap = '12px'; diffBox.style.alignItems = 'center';
  const diffLabel = document.createElement('div'); diffLabel.textContent = '難易度（スピード）';
  const levels = ['easy','normal','hard'];
  const diffGroup = document.createElement('div');
  levels.forEach(lv => {
    const btn = document.createElement('button');
    btn.textContent = lv.toUpperCase();
    btn.dataset.level = lv;
    styleToggle(btn, lv === st.difficulty);
    btn.addEventListener('click', () => {
      setDifficulty(lv);
      [...diffGroup.children].forEach(ch => styleToggle(ch, ch.dataset.level === lv));
    });
    diffGroup.appendChild(btn);
  });
  diffGroup.style.display = 'flex'; diffGroup.style.gap = '8px';
  diffBox.append(diffLabel, diffGroup);

  // suits
  const suitBox = document.createElement('div');
  suitBox.style.display = 'flex'; suitBox.style.gap = '12px'; suitBox.style.alignItems = 'center'; suitBox.style.marginTop = '8px';
  const suitLabel = document.createElement('div'); suitLabel.textContent = 'スーツ（出題範囲）';
  const suitGroup = document.createElement('div'); suitGroup.style.display = 'flex'; suitGroup.style.gap = '8px';
  SUITS.forEach(s => {
    const btn = document.createElement('button');
    btn.textContent = SUIT_LABEL[s] + ' ' + s;
    btn.dataset.suit = s;
    styleToggle(btn, !!st.selectedSuits?.[s]);
    btn.addEventListener('click', () => {
      const current = loadState().selectedSuits || {};
      const next = { ...current, [s]: !current[s] };
      if (!next.heart && !next.spade && !next.club && !next.diamond) next[s] = true;
      setSelectedSuits(next);
      styleToggle(btn, !!next[s]);
    });
    suitGroup.appendChild(btn);
  });
  suitBox.append(suitLabel, suitGroup);

  // ranks 1..13
  const rankBox = document.createElement('div');
  rankBox.style.display = 'flex'; rankBox.style.flexDirection = 'column'; rankBox.style.gap = '6px'; rankBox.style.marginTop = '8px';
  const rankLabel = document.createElement('div'); rankLabel.textContent = 'ランク（1〜13）';
  const rankGroup = document.createElement('div'); rankGroup.style.display = 'grid'; rankGroup.style.gridTemplateColumns = 'repeat(13, 1fr)'; rankGroup.style.gap = '4px';
  for (let i=1;i<=13;i++){
    const btn = document.createElement('button');
    btn.textContent = String(i);
    btn.dataset.rank = String(i);
    styleToggle(btn, !!st.selectedRanks?.[i]);
    btn.addEventListener('click', () => {
      const cur = loadState().selectedRanks || {};
      const next = { ...cur, [i]: !cur[i] };
      if (!Object.values(next).some(Boolean)) next[i] = true;
      setSelectedRanks(next);
      styleToggle(btn, !!next[i]);
    });
    rankGroup.appendChild(btn);
  }
  rankBox.append(rankLabel, rankGroup);

  const start = document.createElement('button');
  start.textContent = 'スタート';
  start.style.marginTop = '16px';
  start.addEventListener('click', () => {
    const cur = loadState();
    const suit = SUITS.find(s => !!cur.selectedSuits?.[s]) || 'heart';
    const ranks = cur.selectedRanks || {};
    const rank = (Array.from({length:13},(_,k)=>k+1).find(n => !!ranks[n])) || 1;
    onStart?.({ suit, rank, difficulty: cur.difficulty || 'normal' });
    rootEl.innerHTML = '';
  });

  panel.append(h1, diffBox, suitBox, rankBox, start);
  wrap.append(panel);
  rootEl.appendChild(wrap);
}

function styleToggle(btn, active){
  btn.style.padding = '8px 12px';
  btn.style.borderRadius = '8px';
  btn.style.border = '1px solid #31364b';
  btn.style.background = active ? '#2a355f' : '#1a2038';
  btn.style.color = active ? '#9ecbff' : '#e8e8e8';
}