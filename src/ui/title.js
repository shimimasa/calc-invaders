// src/ui/title.js
import { loadState, setDifficulty, setSelectedSuits, setSelectedRanks, setQuestionCountMode } from '../core/gameState.js';

const SUITS = ['heart','spade','club','diamond'];
const SUIT_LABEL = { heart: '♡', spade: '♠', club: '♣', diamond: '♦' };
const SUIT_OP = { heart: '＋', spade: '−', club: '×', diamond: '÷' };

export function mountTitle({ rootEl, onStart, onOpenStageSelect }){
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
  panel.style.minWidth = 'min(760px, 92vw)';
  panel.style.color = '#e8e8e8';
  panel.style.boxShadow = '0 8px 24px rgba(0,0,0,0.45)';

  const h1 = document.createElement('h2');
  h1.textContent = '計算インベーダー';
  h1.style.marginTop = '0';

  // legend
  const legend = document.createElement('div');
  legend.textContent = '範囲: ♡=足し算 ＋ / ♠=引き算 − / ♣=かけ算 × / ♦=わり算 ÷';
  legend.style.opacity = '0.9';
  legend.style.marginBottom = '4px';

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
    btn.textContent = `${SUIT_LABEL[s]} ${s}（${SUIT_OP[s]}）`;
    btn.dataset.suit = s;
    styleToggle(btn, !!st.selectedSuits?.[s]);
    btn.addEventListener('click', () => {
      const current = loadState().selectedSuits || {};
      const next = { ...current, [s]: !current[s] };
      if (!next.heart && !next.spade && !next.club && !next.diamond) next[s] = true;
      setSelectedSuits(next);
      styleToggle(btn, !!next[s]);
      updateRankTooltips(activeSuit());
    });
    suitGroup.appendChild(btn);
  });
  suitBox.append(suitLabel, suitGroup);

  // ranks 1..13 + tooltip(pattern)
  const rankBox = document.createElement('div');
  rankBox.style.display = 'flex'; rankBox.style.flexDirection = 'column'; rankBox.style.gap = '6px'; rankBox.style.marginTop = '8px';
  const rankLabel = document.createElement('div'); rankLabel.textContent = 'ランク（1〜13）';
  const rankGroup = document.createElement('div'); rankGroup.style.display = 'grid'; rankGroup.style.gridTemplateColumns = 'repeat(13, 1fr)'; rankGroup.style.gap = '4px';
  const rankButtons = [];
  for (let i=1;i<=13;i++){
    const btn = document.createElement('button');
    btn.textContent = String(i);
    btn.dataset.rank = String(i);
    btn.title = ''; // pattern will be injected
    styleToggle(btn, !!st.selectedRanks?.[i]);
    btn.addEventListener('click', () => {
      const cur = loadState().selectedRanks || {};
      const next = { ...cur, [i]: !cur[i] };
      if (!Object.values(next).some(Boolean)) next[i] = true;
      setSelectedRanks(next);
      styleToggle(btn, !!next[i]);
    });
    rankButtons.push(btn);
    rankGroup.appendChild(btn);
  }
  rankBox.append(rankLabel, rankGroup);

  // 問題数モード
  const countBox = document.createElement('div');
  countBox.style.display = 'flex'; countBox.style.gap = '12px'; countBox.style.alignItems = 'center'; countBox.style.marginTop = '8px';
  const countLabel = document.createElement('div'); countLabel.textContent = '問題数';
  const countGroup = document.createElement('div'); countGroup.style.display = 'flex'; countGroup.style.gap = '8px';
  const modes = [
    { key: '5', label: '5問（ウォームアップ）' },
    { key: '10', label: '10問（標準）' },
    { key: '20', label: '20問（集中ドリル）' },
    { key: '30', label: '30問（やり込み/小テスト）' },
    { key: 'endless', label: '∞（エンドレス）' }
  ];
  modes.forEach(m => {
    const btn = document.createElement('button');
    btn.textContent = m.label;
    btn.dataset.mode = m.key;
    styleToggle(btn, (st.questionCountMode || '10') === m.key);
    btn.addEventListener('click', () => {
      setQuestionCountMode(m.key);
      [...countGroup.children].forEach(ch => styleToggle(ch, ch.dataset.mode === m.key));
    });
    countGroup.appendChild(btn);
  });
  countBox.append(countLabel, countGroup);

  const btns = document.createElement('div');
  btns.style.display = 'flex'; btns.style.gap = '8px'; btns.style.marginTop = '16px'; btns.style.flexWrap = 'wrap';

  const start = document.createElement('button');
  start.textContent = 'スタート';
  start.addEventListener('click', () => {
    const cur = loadState();
    const suit = activeSuit();
    const ranks = cur.selectedRanks || {};
    const rank = (Array.from({length:13},(_,k)=>k+1).find(n => !!ranks[n])) || 1;
    onStart?.({ suit, rank, difficulty: cur.difficulty || 'normal', countMode: cur.questionCountMode || '10' });
    rootEl.innerHTML = '';
  });

  const select = document.createElement('button');
  select.textContent = 'ステージ選択（52枚）';
  select.addEventListener('click', () => {
    onOpenStageSelect?.();
  });

  [start, select].forEach(b => {
    b.style.padding = '8px 12px';
    b.style.borderRadius = '8px';
    b.style.border = '1px solid #31364b';
    b.style.background = '#1a2038';
    b.style.color = '#e8e8e8';
    b.style.cursor = 'pointer';
  });

  btns.append(start, select);

  panel.append(h1, legend, diffBox, suitBox, rankBox, countBox, btns);
  wrap.append(panel);
  rootEl.appendChild(wrap);

  // 初回ツールチップ更新
  updateRankTooltips(activeSuit());

  function activeSuit(){
    const cur = loadState().selectedSuits || {};
    return SUITS.find(s => !!cur[s]) || 'heart';
  }
  async function updateRankTooltips(suit){
    rankButtons.forEach((b)=> b.title = '読み込み中…');
    for (let i=1;i<=13;i++){
      try{
        const id = `${suit}_${String(i).padStart(2,'0')}`;
        const res = await fetch(`data/stages/${id}.json`);
        const js = await res.json();
        const pattern = js?.generator?.pattern || '';
        const btn = rankButtons[i-1];
        if (btn) btn.title = pattern ? `${SUIT_LABEL[suit]}${i}: ${pattern}` : `${SUIT_LABEL[suit]}${i}`;
      } catch {
        const btn = rankButtons[i-1];
        if (btn) btn.title = `${SUIT_LABEL[suit]}${i}`;
      }
    }
  }
}

function styleToggle(btn, active){
  btn.style.padding = '8px 12px';
  btn.style.borderRadius = '8px';
  btn.style.border = '1px solid #31364b';
  btn.style.background = active ? '#2a355f' : '#1a2038';
  btn.style.color = active ? '#9ecbff' : '#e8e8e8';
}