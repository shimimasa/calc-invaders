import { formulaStringToAriaLabel, injectFocusStyles } from "../utils/accessibility.js";

export function renderEnemies({ rootEl, questions }){
  if (!rootEl) return;
  injectFocusStyles();
  rootEl.innerHTML = "";
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
    rootEl.appendChild(btn);
  });
}


