  
  // src/ui/hud.js
  import { formatTime } from '../systems/StageTimer.js';

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

let elTimer;

export function ensureHUD() {
  if (!document.getElementById('hud')) {
    const hud = document.createElement('div');
    hud.id = 'hud';
    hud.className = 'ci-hud';
    hud.innerHTML = `
      <div id="stageTimer" class="ci-timer" aria-live="polite">00:00.00</div>
    `;
    document.body.appendChild(hud);
  }
  elTimer = document.getElementById('stageTimer');
}

export function updateTimer(ms) {
  if (!elTimer) return;
  elTimer.textContent = formatTime(ms);
}
