// src/ui/result.js
// 結果モーダル（クリア／ゲームオーバー）
// - クリアタイム表示（今回 / ベスト）
// - ベスト更新バッジ
// - 既存のレイアウトとスタイル（.modal-overlay .modal-panel .card .row .btn 等）に準拠

// ===== 共通ユーティリティ =====
function formatTime(ms){
  if (typeof ms !== 'number' || !isFinite(ms)) return '--:--.--';
  const m = Math.floor(ms/60000);
  const s = Math.floor((ms%60000)/1000);
  const cs = Math.floor((ms%1000)/10);
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(cs).padStart(2,'0')}`;
}

function bestKey(stageId){ return `ci_best_${stageId}`; }

function readBest(stageId){
  try { return JSON.parse(localStorage.getItem(bestKey(stageId)) || 'null'); }
  catch { return null; }
}

function writeBest(stageId, elapsedMs){
  try {
    const rec = { stageId, elapsedMs, endedAt: Date.now() };
    localStorage.setItem(bestKey(stageId), JSON.stringify(rec));
    return rec;
  } catch { return null; }
}

// ====== STAGE CLEAR ======
export function showStageClear({
  stageId,
  score,
  elapsedMs,      // ← 今回プレイの経過ms（任意。無い場合は表示のみ）
  onRetry,
  onNext,
  onTitle,
  onCollection,
  earned
}){
  // 重複モーダル防止
  document.querySelectorAll('.modal-overlay').forEach(el => el.remove());

  const wrap = document.createElement('div');
  wrap.className = 'modal-overlay';

  const panel = document.createElement('div');
  panel.className = 'modal-panel card';
  panel.style.minWidth = 'min(560px, 92vw)';

  const h = document.createElement('h2');
  h.textContent = 'STAGE CLEAR!';

  const meta = document.createElement('div');
  meta.textContent = `Stage: ${stageId}  |  Score: ${score}`;

  // タイム表示＆ベスト更新判定
  const times = document.createElement('div');
  times.style.marginTop = '10px';
  times.style.display = 'grid';
  times.style.gap = '6px';

  const rowNow = document.createElement('div');
  const rowBest = document.createElement('div');

  // ベスト更新ロジック（elapsedMs があれば保存・比較）
  let isNewRecord = false;
  let bestAfter = readBest(stageId);
  if (typeof elapsedMs === 'number' && isFinite(elapsedMs)) {
    if (!bestAfter || elapsedMs < Number(bestAfter.elapsedMs)) {
      bestAfter = writeBest(stageId, elapsedMs);
      isNewRecord = true;
    }
  }

  rowNow.innerHTML  = `<span>クリアタイム</span>：<strong>${formatTime(elapsedMs)}</strong>`;
  rowBest.innerHTML = `<span>ベストタイム</span>：<strong>${bestAfter ? formatTime(bestAfter.elapsedMs) : '--:--.--'}</strong>`;

  times.append(rowNow, rowBest);

  // カード獲得演出（既存UI踏襲）
  const [suit, rstr] = String(stageId||'').split('_');
  const rank = Number(rstr)||1;
  const SUIT_LABEL = { heart: '♡', spade: '♠', club: '♣', diamond: '♦' };

  const reveal = document.createElement('div');
  Object.assign(reveal.style, { display:'flex', alignItems:'center', gap:'12px', marginTop:'12px', flexWrap:'wrap' });

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

  const record = document.createElement('div');
  record.textContent = isNewRecord ? 'NEW RECORD!' : '';
  record.className = 'pill';
  if (isNewRecord){
    record.style.background = 'var(--accent, #ffcc00)';
    record.style.color = '#000';
    record.style.fontWeight = '700';
  } else {
    record.style.display = 'none';
  }

  reveal.append(card, gained, record);

  // アニメーション
  requestAnimationFrame(() => {
    card.animate(
      [
        { transform:'scale(0.8) rotate(-6deg)', opacity:0 },
        { transform:'scale(1) rotate(0deg)', opacity:1 }
      ],
      { duration: 380, easing: 'cubic-bezier(0.2,0.7,0.2,1)', fill:'forwards' }
    );
  });

  // CTA
  const row = document.createElement('div');
  row.className = 'row';
  row.style.justifyContent = 'center';
  row.style.flexWrap = 'wrap';
  row.style.marginTop = '16px';
  row.style.gap = '10px';

  const btnNext  = document.createElement('button'); btnNext.textContent  = '次のランクへ'; btnNext.className  = 'btn btn--primary';
  const btnRetry = document.createElement('button'); btnRetry.textContent = 'もう一度';   btnRetry.className = 'btn';
  const btnColl  = document.createElement('button'); btnColl.textContent  = 'コレクション'; btnColl.className  = 'btn';
  const btnTitle = document.createElement('button'); btnTitle.textContent = 'タイトルへ';  btnTitle.className = 'btn';

  btnRetry.addEventListener('click', () => { cleanup(); onRetry?.(); });
  btnNext .addEventListener('click', () => { cleanup(); onNext?.(); });
  btnTitle.addEventListener('click', () => { cleanup(); onTitle?.(); });
  btnColl .addEventListener('click', () => { cleanup(); onCollection?.(); });

  row.append(btnNext, btnRetry, btnColl, btnTitle);

  // 組み立て
  panel.append(h, meta, times, reveal, row);
  wrap.append(panel);
  document.body.appendChild(wrap);

  // 初期フォーカス
  try { btnNext.focus(); } catch(_e){}

  // 閉じ処理
  function cleanup(){
    wrap.remove();
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e){ if (e.key === 'Escape') cleanup(); }
  document.addEventListener('keydown', onKey);
  wrap.addEventListener('click', (e) => { if (e.target === wrap) cleanup(); });

  return cleanup;
}

// ====== GAME OVER ======
export function showGameOver({
  stageId,
  score,
  elapsedMs,       // 任意：タイムを見せたい場合のみ
  onRetry,
  onStageSelect,
  onTitle
}){
  document.querySelectorAll('.modal-overlay').forEach(el => el.remove());

  const wrap = document.createElement('div');
  wrap.className = 'modal-overlay';

  const panel = document.createElement('div');
  panel.className = 'modal-panel card';
  panel.style.minWidth = 'min(560px, 92vw)';
  panel.style.background = 'linear-gradient(180deg, #12162a, #0f1424)'; // 落ち着いたトーン

  const h = document.createElement('h2');
  h.textContent = 'GAME OVER';

  const meta = document.createElement('div');
  meta.textContent = `Stage: ${stageId}  |  Score: ${score}`;

  const hint = document.createElement('small');
  hint.textContent = 'ヒント: 焦らず1問ずつ、選択後に答えを落ち着いて入力しよう。';

  // （任意）今回タイムだけ表示（ベスト更新は行わない）
  const times = document.createElement('div');
  times.style.marginTop = '10px';
  if (typeof elapsedMs === 'number' && isFinite(elapsedMs)) {
    const rowNow = document.createElement('div');
    rowNow.innerHTML = `<span>今回のタイム</span>：<strong>${formatTime(elapsedMs)}</strong>`;
    times.append(rowNow);
  }

  const row = document.createElement('div');
  row.className = 'row';
  row.style.justifyContent = 'center';
  row.style.flexWrap = 'wrap';
  row.style.marginTop = '16px';
  row.style.gap = '10px';

  const btnRetry  = document.createElement('button'); btnRetry.textContent  = 'もう一度';     btnRetry.className  = 'btn btn--primary';
  const btnSelect = document.createElement('button'); btnSelect.textContent = 'ステージ選択'; btnSelect.className = 'btn';
  const btnTitle  = document.createElement('button'); btnTitle.textContent  = 'タイトルへ';   btnTitle.className  = 'btn';

  btnRetry .addEventListener('click', () => { cleanup(); onRetry?.(); });
  btnSelect.addEventListener('click', () => { cleanup(); onStageSelect?.(); });
  btnTitle.addEventListener('click', () => { cleanup(); onTitle?.(); });

  row.append(btnRetry, btnSelect, btnTitle);

  panel.append(h, meta, hint, times, row);
  wrap.append(panel);
  document.body.appendChild(wrap);

  try { btnRetry.focus(); } catch(_e){}

  function cleanup(){
    wrap.remove();
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e){ if (e.key === 'Escape') cleanup(); }
  document.addEventListener('keydown', onKey);
  wrap.addEventListener('click', (e) => { if (e.target === wrap) cleanup(); });

  return cleanup;
}
