 
   export function spawnController({ rootEl, questions, onCorrect, onWrong, cols = 5, descendSpeed = 1, spawnIntervalSec = 2.5 }) {
   const state = { lockEl: null };
   const rowsCount = Math.ceil(questions.length / Math.max(1, cols));
   const rowOffsetPx = Array.from({ length: rowsCount }, () => 0);
   let descendTimer = null;
   let paused = false;
 
   function applyRowTransforms(){
     [...rootEl.children].forEach((el) => {
       const idx = Number(el.dataset.idx);
       const row = Math.floor(idx / Math.max(1, cols));
       el.style.transform = `translateY(${rowOffsetPx[row]}px)`;
     });
   }
   function startDescend(){
     stopDescend();
     const tickMs = Math.max(200, Math.floor(spawnIntervalSec * 1000));
     descendTimer = setInterval(() => {
       if (paused) return;
       const step = Math.max(1, Math.floor(6 * descendSpeed));
       for (let r = 0; r < rowOffsetPx.length; r++) rowOffsetPx[r] += step;
       applyRowTransforms();
     }, tickMs);
   }
   function stopDescend(){
     if (descendTimer) { clearInterval(descendTimer); descendTimer = null; }
   }
   function nudgeRowOf(el){
     if (!el) return;
     const idx = Number(el.dataset.idx);
     const row = Math.floor(idx / Math.max(1, cols));
     rowOffsetPx[row] += Math.max(2, Math.floor(8 * descendSpeed));
     applyRowTransforms();
   }
  
    // 配置
     rootEl.innerHTML = "";
    questions.forEach((q, i) => {
       const div = document.createElement("button");
       div.className = "enemy";
       div.setAttribute("aria-label", `${q.formula} のこたえは？`);
       div.textContent = q.formula + " = ?";
       div.dataset.idx = i;
       div.dataset.answer = String(q.answer);
       if (typeof q.remainder === "number") div.dataset.remainder = String(q.remainder);

      div.addEventListener("click", () => lock(div));
       rootEl.appendChild(div);
     });
    applyRowTransforms();
    startDescend();
  
 
    function lock(el) {
      state.lockEl = el && el.isConnected ? el : null;
      [...rootEl.children].forEach(c => c.classList.toggle("lock", c === state.lockEl));
     }
    function clearLock() {
      state.lockEl = null;
      [...rootEl.children].forEach(c => c.classList.remove("lock"));
    }
  
    function submit(raw) {

      // 選択が無い or 既に削除済み → 何もしない
      const b = state.lockEl;
      if (!b || !b.isConnected || b.parentElement !== rootEl) { state.lockEl = null; return false; }
      const needRem = b.dataset.remainder != null;
  
       // 余り入力: "商,余り" or "商、余り"
       let ok = false;
       if (needRem) {
         const parts = raw.split(/[、,]/).map(s => s.trim()).filter(Boolean);
         if (parts.length === 2) {
           const q = Number(parts[0]), r = Number(parts[1]);
           ok = q === Number(b.dataset.answer) && r === Number(b.dataset.remainder);
         }
       } else {
         ok = Number(raw.trim()) === Number(b.dataset.answer);
       }
  
      if (ok) {
         b.remove();
        state.lockEl = null;
         onCorrect();
        // 全滅時は降下を止める
        if (rootEl.children.length === 0) stopDescend();
         return true;
       } else {
        // 失敗時は同一行を小さく即時降下
        nudgeRowOf(b);
         onWrong();
         return false;
       }
     }
  
   return {
     lock: (iOrEl) => lock(iOrEl?.nodeType ? iOrEl : rootEl.children[iOrEl]),
     submit,
     clear: () => clearLock(),
     getSelected: () => state.lockEl,
     pause: () => { paused = true; },
     resume: () => { paused = false; },
     stop: () => { stopDescend(); }
   };
   }
  