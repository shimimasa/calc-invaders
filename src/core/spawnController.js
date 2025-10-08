export function spawnController({ rootEl, questions, onCorrect, onWrong, cols = 5, descendSpeed = 1, spawnIntervalSec = 2.5, bottomY, onBottomReached, endless = false }) {
  const state = { lockEl: null, entities: [], paused: false, spawnIdx: 0, spawnTimer: null, descendTimer: null };
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
    if (!endless && state.spawnIdx >= questions.length) { clearInterval(state.spawnTimer); state.spawnTimer = null; return; }
    const q = endless ? questions[Math.floor(Math.random() * questions.length)] : questions[state.spawnIdx++];
    const el = document.createElement("button");
    el.className = "enemy focus-ring";
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.setAttribute("aria-label", `${q.formula} のこたえは？`);
    el.textContent = q.formula + " = ?";
    el.dataset.answer = String(q.answer);
    if (typeof q.remainder === "number") el.dataset.remainder = String(q.remainder);
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

  function startSpawn(){
    stopSpawn();
    const ms = Math.max(250, Math.floor(spawnIntervalSec * 1000));
    state.spawnTimer = setInterval(() => { if (!state.paused) spawnOne(); }, ms);
    spawnOne();
  }
  function stopSpawn(){
    if (state.spawnTimer) { clearInterval(state.spawnTimer); state.spawnTimer = null; }
  }

  // 降下: 全体を一定ステップで降下
  function startDescend(){
    stopDescend();
    const tickMs = 200;
    let t = 0;
    state.descendTimer = setInterval(() => {
      if (state.paused) return;
      t += tickMs;
      const step = Math.max(1, Math.floor(6 * descendSpeed));
      for (let i=0;i<state.entities.length;i++){
        const ent = state.entities[i];
        ent.y += step;
        // ほんの少しの横揺れ（列ランダム＋波）
        const wiggle = Math.sin((ent.y + i*37) * 0.01) * 0.8;
        ent.x = Math.max(0, Math.min(getFieldRect().w - 96, ent.x + wiggle));
        place(ent.el, ent.x, ent.y);
      }
      // 底判定
      const limit = Number.isFinite(bottomY) ? bottomY : (getFieldRect().h - 64);
      const reached = state.entities.some(ent => ent.y >= limit);
      if (reached && onBottomReached) onBottomReached();
    }, tickMs);
  }
  function stopDescend(){
    if (state.descendTimer) { clearInterval(state.descendTimer); state.descendTimer = null; }
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
      const parts = raw.split(/[、,]/).map(s => s.trim()).filter(Boolean);
      if (parts.length !== 2) return false;
      const q = Number(parts[0]), r = Number(parts[1]);
      return (q === Number(b.dataset.answer) && r === Number(b.dataset.remainder));
    } else {
      return Number(raw.trim()) === Number(b.dataset.answer);
    }
  }

  function submit(raw) {
    const b = state.lockEl;
    if (!b || !b.isConnected || b.parentElement !== rootEl) { state.lockEl = null; return false; }
    const ok = previewCheck(raw);

    if (ok) {
      const idx = state.entities.findIndex(e => e.el === b);
      if (idx >= 0) state.entities.splice(idx, 1);
      b.remove();
      state.lockEl = null;
      onCorrect && onCorrect();
      if (!endless && rootEl.children.length === 0) stopDescend();
      return true;
    } else {
      const ent = state.entities.find(e => e.el === b);
      if (ent){ ent.y += Math.max(8, Math.floor(14 * descendSpeed)); place(ent.el, ent.x, ent.y); }
      onWrong && onWrong();
      return false;
    }
  }

  startSpawn();
  startDescend();

  return {
    lock: (iOrEl) => lock(iOrEl?.nodeType ? iOrEl : rootEl.children[iOrEl]),
    submit,
    previewCheck,
    clear: () => clearLock(),
    getSelected: () => state.lockEl,
    pause: () => { state.paused = true; },
    resume: () => { state.paused = false; },
    stop: () => { stopDescend(); stopSpawn(); }
  };
}