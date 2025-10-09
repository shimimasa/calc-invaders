export const Hud = {
    /**
     * 残数の表示とバー更新（ターゲットが有限のときのみバー更新）
     */
    setRemain(el, remain, target, barEl) {
      if (!el) return;
      el.textContent = (remain === Infinity) ? "∞" : String(remain);
      if (barEl && Number.isFinite(target) && target > 0 && Number.isFinite(remain)) {
        const ratio = Math.max(0, Math.min(1, remain / target));
        barEl.style.width = `${ratio * 100}%`;
      }
    },
    setLives(el, lives) { if (el) el.textContent = String(lives); },
    setScore(el, score) { if (el) el.textContent = String(score); },
  };
  