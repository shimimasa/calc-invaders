import { formulaStringToAriaLabel, injectFocusStyles } from "../utils/accessibility.js";
import { FpsSampler, logOnceOnDrop } from "../utils/perf.js";

export function renderEnemies({ rootEl, questions }){
  if (!rootEl) return;
  injectFocusStyles();
  rootEl.innerHTML = "";
  const fragment = document.createDocumentFragment();
  questions.forEach((q, i) => {
    const btn = document.createElement("button");
    btn.className = "enemy focus-ring";
    btn.setAttribute("role", "button");
    btn.setAttribute("tabindex", "0");
    btn.setAttribute("aria-label", formulaStringToAriaLabel(q.formula));
    btn.textContent = q.formula + " = ?";
    btn.dataset.idx = i;
    btn.dataset.answer = String(q.answer);
    if (typeof q.remainder === "number") btn.dataset.remainder = String(q.remainder);
    fragment.appendChild(btn);
  });
  rootEl.appendChild(fragment);
}

// Batched transform updater (translate3d)
export function applyRowTransformsBatch({ rootEl, cols = 5, rowOffsetPx = [] }){
  if (!rootEl) return;
  const children = rootEl.children;
  for (let i=0;i<children.length;i++){
    const el = children[i];
    const idx = Number(el.dataset.idx);
    const row = Math.floor(idx / Math.max(1, cols));
    const y = rowOffsetPx[row] || 0;
    el.style.transform = `translate3d(0, ${y}px, 0)`;
  }
}

export function mountFpsConsoleWarn(){
  const sampler = new FpsSampler(30);
  const warn = logOnceOnDrop(30);
  function tick(t){ warn(sampler.sample(t)); requestAnimationFrame(tick); }
  requestAnimationFrame(tick);
}


