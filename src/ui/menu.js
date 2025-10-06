import { buildReviewStage } from "../core/reviewStage.js";
import { getIncorrectFormulas } from "../core/gameState.js";

export function mountMenu({ rootEl, onStartReview }){
  if (!rootEl) return;
  rootEl.innerHTML = "";
  const btn = document.createElement("button");
  btn.id = "btn-review";
  btn.textContent = "Review";
  const toast = document.createElement("div"); toast.id = "toast"; toast.style.display = "none";
  rootEl.append(btn, toast);

  function showToast(msg){ toast.textContent = msg; toast.style.display = "block"; setTimeout(()=> toast.style.display = "none", 1200); }

  function refresh(){
    const has = (getIncorrectFormulas().length > 0);
    btn.disabled = !has;
  }
  refresh();

  btn.addEventListener("click", () => {
    const list = getIncorrectFormulas();
    if (list.length === 0){ showToast("復習ログが空です"); return; }
    const stage = buildReviewStage({ rows: 1, cols: Math.min(10, list.length) });
    if (typeof onStartReview === 'function') onStartReview(stage);
  });
}


