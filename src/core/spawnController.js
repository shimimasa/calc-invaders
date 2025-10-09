export function spawnController({ rootEl, questions, onCorrect, onWrong, cols = 5, descendSpeed = 1, spawnIntervalSec = 2.5, bottomY, onBottomReached, endless = false }) {
  const state = { lockEl: null, entities: [], paused: false, spawnIdx: 0, rafId: null, lastTs: null, spawnAccumSec: 0, startMs: null, bottomFired: false };
  if (!rootEl) throw new Error('rootEl required');
  rootEl.innerHTML = "";
  rootEl.style.position = 'relative';

  function getFieldRect(){
    const r = rootEl.getBoundingClientRect();
    return { w: r.width, h: r.height };
  }
  function place(el, x, y){
    el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  }

  // 生成: 1体ずつスポーン（ランダム列）
  function spawnOne(){
    if (!endless && state.spawnIdx >= questions.length) { return; }
    const q = endless ? questions[Math.floor(Math.random() * questions.length)] : questions[state.spawnIdx++];
    const el = document.createElement("button");
    el.className = "enemy focus-ring";
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.setAttribute("aria-label", `${q.formula} のこたえは？`);
    el.textContent = q.formula + " = ?";
    el.dataset.answer = String(q.answer);
    if (typeof q.remainder === "number") el.dataset.remainder = String(q.remainder);
    el.style.willChange = 'transform';
    rootEl.appendChild(el);

    const { w } = getFieldRect();
    const col = Math.floor(Math.random() * Math.max(1, cols));
    const colW = w / Math.max(1, cols);
    const ex = Math.max(0, (colW * col) + (colW / 2) - 48);
    const ey = -Math.random() * 40 - 20;
    state.entities.push({ el, x: ex, y: ey, vy: 0 });
    place(el, ex, ey);

    el.addEventListener("click", () => lock(el));
  }

  function wantMoreSpawns(){
    return endless || state.spawnIdx < questions.length;
  }

  // rAF ループ: 降下(デルタ駆動) + スポーン(経過時間)
  function loop(ts){
    state.rafId = requestAnimationFrame(loop);
    const now = ts || performance.now();
    if (state.startMs == null) state.startMs = now;
    const last = state.lastTs == null ? now : state.lastTs;
    state.lastTs = now;
    let dt = (now - last) / 1000; // seconds
    if (state.paused) return;
    // タブ復帰などでのジャンプ抑制
    if (!(dt >= 0) || dt > 0.25) dt = 0.25;

    // スポーン
    if (wantMoreSpawns()){
      state.spawnAccumSec += dt;
      while (state.spawnAccumSec >= Math.max(0.2, spawnIntervalSec)){
        spawnOne();
        state.spawnAccumSec -= Math.max(0.2, spawnIntervalSec);
        if (!wantMoreSpawns()) break;
      }
    }

    // 降下（px/sec基準）：旧仕様の約30px/sec * descendSpeed を踏襲
    const pxPerSec = 30 * Math.max(0.1, descendSpeed);
    const dy = pxPerSec * dt;
    const field = getFieldRect();
    for (let i=0;i<state.entities.length;i++){
      const ent = state.entities[i];
      ent.y += dy;
      // ほんの少しの横揺れ（列ランダム＋波）
      const wiggle = Math.sin((ent.y + i*37) * 0.01) * 0.8;
      ent.x = Math.max(0, Math.min(field.w - 96, ent.x + wiggle));
      place(ent.el, ent.x, ent.y);
    }
    // 底判定
    const limit = Number.isFinite(bottomY) ? bottomY : (field.h - 64);
    const reached = state.entities.length > 0 && Number.isFinite(limit) && (field.h > 80) && state.entities.some(ent => ent.y >= limit);
    const armed = (now - state.startMs) > 600; // 起動直後の誤判定を抑止
    if (!state.bottomFired && reached && armed && onBottomReached){
      state.bottomFired = true;
      onBottomReached();
    }
  }

  function lock(el) {
    state.lockEl = el && el.isConnected ? el : null;
    [...rootEl.children].forEach(c => c.classList.toggle("lock", c === state.lockEl));
  }
  function clearLock() {
    state.lockEl = null;
    [...rootEl.children].forEach(c => c.classList.remove("lock"));
  }

  function previewCheck(raw){
    const b = state.lockEl;
    if (!b || !b.isConnected || b.parentElement !== rootEl) return false;
    const needRem = b.dataset.remainder != null;
    if (needRem) {
            // 余りつき回答の区切り: カンマ / 全角カンマ / 空白 を許可
      const parts = String(raw).split(/[、,\s]+/).map(s => s.trim()).filter(Boolean);
      if (parts.length !== 2) return false;
      const q = Number(parts[0]), r = Number(parts[1]);
      return (q === Number(b.dataset.answer) && r === Number(b.dataset.remainder));
    } else {
      return Number(String(raw).trim()) === Number(b.dataset.answer);
    }
  }

  function submit(raw) {
    const b = state.lockEl;
    try { console.debug('[ctrl.submit] lockEl:', b, 'isConnected:', b?.isConnected, 'parent:', b?.parentElement === rootEl); } catch(_e){}
    if (!b || !b.isConnected || b.parentElement !== rootEl) { 
      try { console.debug('[ctrl.submit] invalid lock, aborting'); } catch(_e){}
      state.lockEl = null; return false; 
    }
    const ok = previewCheck(raw);
    try { console.debug('[ctrl.submit] previewCheck result:', ok, 'expected:', b.dataset.answer, 'remainder:', b.dataset.remainder, 'input:', raw); } catch(_e){}

    if (ok) {
      const idx = state.entities.findIndex(e => e.el === b);
      if (idx >= 0) state.entities.splice(idx, 1);
      b.remove();
      state.lockEl = null;
      try { console.debug('[ctrl.submit] correct! calling onCorrect'); } catch(_e){}
      onCorrect && onCorrect();
      return true;
    } else {
      const ent = state.entities.find(e => e.el === b);
      if (ent){ ent.y += Math.max(8, Math.floor(14 * descendSpeed)); place(ent.el, ent.x, ent.y); }
      try { console.debug('[ctrl.submit] wrong! calling onWrong'); } catch(_e){}
      onWrong && onWrong();
      return false;
    }
  }

  // 初期スポーン1体（体感待ちを減らす）
  spawnOne();
  state.rafId = requestAnimationFrame(loop);

  return {
    lock: (iOrEl) => lock(iOrEl?.nodeType ? iOrEl : rootEl.children[iOrEl]),
    submit,
    previewCheck,
    clear: () => clearLock(),
    getSelected: () => state.lockEl,
    pause: () => { state.paused = true; },
        resume: () => { state.paused = false; state.lastTs = performance.now(); },
        stop: () => { if (state.rafId) cancelAnimationFrame(state.rafId); state.rafId = null; },
        // 現在の敵とロックを全て破棄（cleanupStageで呼ぶと安全）
        dispose: () => {
          try { clearLock(); } catch(_) {}
          state.entities.splice(0).forEach(ent => { try { ent.el.remove(); } catch(_) {} });
          rootEl.innerHTML = "";
        },
    // 追加: 残スポーン/盤面情報
    isSpawningDone: () => !wantMoreSpawns(),
    getSpawnedCount: () => state.spawnIdx,
    getActiveCount: () => state.entities.length
  };
}