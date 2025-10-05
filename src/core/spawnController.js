// 極薄のDOM版コントローラ（演出は最小）
export function spawnController({ rootEl, questions, onCorrect, onWrong }) {
    const state = { lockIdx: -1 };
  
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
      div.addEventListener("click", () => lock(i));
      rootEl.appendChild(div);
    });
  
    function lock(i) {
      state.lockIdx = i;
      [...rootEl.children].forEach((c, j) => c.classList.toggle("lock", j === i));
    }
  
    function submit(raw) {
      if (state.lockIdx < 0) return;
      const b = rootEl.children[state.lockIdx];
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
        state.lockIdx = -1;
        onCorrect();
        return true;
      } else {
        onWrong();
        return false;
      }
    }
  
    return { lock: (i) => lock(i), submit };
  }
  