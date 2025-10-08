let injected = false;
// src/ui/effects.js
function cssVar(name, fallback){
  try { const v = getComputedStyle(document.documentElement).getPropertyValue(name); return (v && v.trim()) ? v.trim() : fallback; } catch(_e){ return fallback; }
}

export function shootProjectile({ fromEl, toEl, from, to, color, duration = 300, hit = true, arc = true }) {
  return new Promise((resolve) => {
    const root = document.body;
    const aRect = fromEl?.getBoundingClientRect?.();
    const bRect = toEl?.getBoundingClientRect?.();
    const ax = typeof from?.x === 'number' ? from.x : (aRect ? (aRect.left + aRect.width/2) : 0);
    const ay = typeof from?.y === 'number' ? from.y : (aRect ? (aRect.top + aRect.height/2) : 0);
    const bx = typeof to?.x === 'number' ? to.x : (bRect ? (bRect.left + bRect.width/2) : 0);
    const by = typeof to?.y === 'number' ? to.y : (bRect ? (bRect.top + bRect.height/2) : 0);
    const dx = bx - ax; const dy = by - ay;
    const accent = cssVar('--accent', '#3BE3FF');
    const danger = cssVar('--danger', '#ff5252');
    const col = color || (hit ? accent : danger);

    const dot = document.createElement('div');
    Object.assign(dot.style, {
      position: 'fixed', left: `${ax}px`, top: `${ay}px`, width: '10px', height: '10px',
      borderRadius: '50%', background: col, boxShadow: `0 0 10px ${col}, 0 0 20px ${col}88`, zIndex: 9999, willChange: 'transform, opacity'
    });
    root.appendChild(dot);

    if (arc && typeof dot.animate === 'function'){
      const h = Math.max(30, Math.min(120, Math.hypot(dx, dy) * 0.2));
      const anim = dot.animate([
        { transform: 'translate(0, 0)' },
        { transform: `translate(${dx*0.5}px, ${dy*0.5 - h}px)` },
        { transform: `translate(${dx}px, ${dy}px)` }
      ], { duration, easing: 'cubic-bezier(0.2,0.7,0.2,1)', fill: 'forwards' });
      anim.onfinish = () => impact();
    } else {
      dot.style.transition = `transform ${duration}ms linear, opacity 120ms ease-out`;
      requestAnimationFrame(() => { dot.style.transform = `translate(${dx}px, ${dy}px)`; });
      setTimeout(impact, duration);
    }

    function impact(){
      if (hit && toEl?.animate){ toEl.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.15)' }, { transform: 'scale(1)' }], { duration: 180, easing: 'ease-out' }); }
      dot.style.opacity = '0';
      setTimeout(() => { dot.remove(); resolve(); }, 120);
    }
  });
}
function injectStyles(){
  if (injected || typeof document === 'undefined') return;
  injected = true;
  const style = document.createElement('style');
  style.id = 'ci-fx-styles';
  style.textContent = `
  .fx-layer{position:relative}
  .fx-boom{position:absolute; width:16px; height:16px; border-radius:50%; background: radial-gradient(circle, #ffffff, var(--accent-2)); box-shadow:0 0 16px var(--accent-2); opacity:0; animation: fx-boom 320ms var(--ease) forwards}
  @keyframes fx-boom{0%{transform:scale(0.4); opacity:.2} 50%{transform:scale(1.3); opacity:.95} 100%{transform:scale(0.8); opacity:0}}
  .fx-pop{position:absolute; color:var(--text); font: 12px/1 var(--font-mono); text-shadow: 0 1px 2px #000; opacity:0; animation: fx-pop 600ms var(--ease) forwards}
  @keyframes fx-pop{0%{transform:translateY(0); opacity:0} 20%{opacity:1} 100%{transform:translateY(-16px); opacity:0}}
  .fx-flash{position:fixed; inset:0; background:rgba(255,82,82,0.15); pointer-events:none; animation: fx-flash 180ms var(--ease) forwards}
  @keyframes fx-flash{0%{opacity:.6} 100%{opacity:0}}
  .fx-shake{animation: fx-shake 250ms ease-in-out}
  @keyframes fx-shake{0%,100%{transform:translateX(0)} 25%{transform:translateX(-2px)} 75%{transform:translateX(2px)}}
  .fx-fade{position:fixed; inset:0; background:#000; opacity:0; pointer-events:none; animation: fx-fade 400ms var(--ease)}
  @keyframes fx-fade{0%{opacity:0} 50%{opacity:.35} 100%{opacity:0}}
  .fx-icon{margin-left:4px}
  `;
  document.head.appendChild(style);
}

function ensureLayer(root){
  injectStyles();
  if (!root) root = document.body;
  let layer = document.getElementById('fx-layer');
  if (!layer){ layer = document.createElement('div'); layer.id = 'fx-layer'; layer.className = 'fx-layer'; root.appendChild(layer); }
  return layer;
}

export function showHitEffect({ rootEl, anchorEl, text = '+100' }){
  const layer = ensureLayer(rootEl);
  const rect = anchorEl?.getBoundingClientRect?.() || { left: 0, top: 0, width: 0, height: 0 };
  const boom = document.createElement('div'); boom.className = 'fx-boom'; boom.style.left = `${rect.left + rect.width/2}px`; boom.style.top = `${rect.top + rect.height/2}px`;
  const pop = document.createElement('div'); pop.className = 'fx-pop'; pop.textContent = `${text}`; pop.style.left = `${rect.left + rect.width/2}px`; pop.style.top = `${(rect.top + rect.height/2) - 8}px`;
  layer.appendChild(boom); layer.appendChild(pop);
  setTimeout(() => { boom.remove(); pop.remove(); }, 700);
}

export function showMissEffect({ rootEl }){
  injectStyles();
  const flash = document.createElement('div'); flash.className = 'fx-flash';
  document.body.appendChild(flash);
  document.body.classList.add('fx-shake');
  setTimeout(() => { flash.remove(); document.body.classList.remove('fx-shake'); }, 260);
}

export function fadeTransition(){
  injectStyles();
  const f = document.createElement('div'); f.className = 'fx-fade';
  document.body.appendChild(f);
  setTimeout(() => { f.remove(); }, 420);
}


