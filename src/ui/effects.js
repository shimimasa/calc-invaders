let injected = false;
// src/ui/effects.js
export function shootProjectile({ fromEl, toEl, color = '#3BE3FF', duration = 250, hit = true }) {
  return new Promise((resolve) => {
    const root = document.body;
    const a = fromEl.getBoundingClientRect();
    const b = toEl.getBoundingClientRect();
    const dot = document.createElement('div');
    Object.assign(dot.style, {
      position: 'fixed', left: `${a.left + a.width/2}px`, top: `${a.top + a.height/2}px`,
      width: '8px', height: '8px', borderRadius: '50%', background: color, zIndex: 9999,
      transition: `transform ${duration}ms linear, opacity 120ms ease-out`
    });
    root.appendChild(dot);
    requestAnimationFrame(() => {
      const dx = (b.left + b.width/2) - (a.left + a.width/2);
      const dy = (b.top + b.height/2) - (a.top + a.height/2);
      dot.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    setTimeout(() => {
      if (hit) toEl.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.2)' }, { transform: 'scale(0.8)' }], { duration: 160 });
      dot.style.opacity = '0';
      setTimeout(() => { dot.remove(); resolve(); }, 120);
    }, duration);
  });
}
function injectStyles(){
  if (injected || typeof document === 'undefined') return;
  injected = true;
  const style = document.createElement('style');
  style.id = 'ci-fx-styles';
  style.textContent = `
  .fx-layer{position:relative}
  .fx-boom{position:absolute; width:16px; height:16px; border-radius:50%; background: radial-gradient(circle, #fff, #ff9800); opacity:0; animation: fx-boom 320ms ease-out forwards}
  @keyframes fx-boom{0%{transform:scale(0.3); opacity:.2} 50%{transform:scale(1.2); opacity:.9} 100%{transform:scale(0.6); opacity:0}}
  .fx-pop{position:absolute; color:#fff; font: 12px/1 monospace; text-shadow: 0 1px 2px #000; opacity:0; animation: fx-pop 600ms ease-out forwards}
  @keyframes fx-pop{0%{transform:translateY(0); opacity:0} 20%{opacity:1} 100%{transform:translateY(-16px); opacity:0}}
  .fx-flash{position:fixed; inset:0; background:rgba(255,0,0,0.15); pointer-events:none; animation: fx-flash 180ms ease-out forwards}
  @keyframes fx-flash{0%{opacity:.6} 100%{opacity:0}}
  .fx-shake{animation: fx-shake 250ms ease-in-out}
  @keyframes fx-shake{0%,100%{transform:translateX(0)} 25%{transform:translateX(-2px)} 75%{transform:translateX(2px)}}
  .fx-fade{position:fixed; inset:0; background:#000; opacity:0; pointer-events:none; animation: fx-fade 400ms ease-in-out}
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


