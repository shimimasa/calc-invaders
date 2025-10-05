
   export function spawnController({ rootEl, questions, onCorrect, onWrong }) {
    const state = { lockEl: null };
  
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
  
 
    function lock(el) {
      state.lockEl = el && el.isConnected ? el : null;
      [...rootEl.children].forEach(c => c.classList.toggle("lock", c === state.lockEl));
     }
  
     function submit(raw) {

      // 選択が無い or 既に削除済み → 何もしない
      const b = state.lockEl;
      if (!b || !b.isConnected) { state.lockEl = null; return false; }
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
         return true;
       } else {
         onWrong();
         return false;
       }
     }
  
    return { lock: (iOrEl) => lock(iOrEl?.nodeType ? iOrEl : rootEl.children[iOrEl]), submit };
   }
  