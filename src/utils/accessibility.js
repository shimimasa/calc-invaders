// Accessibility helpers

export function formulaToAriaLabel({ a, b, op, remainder }){
  const opWord = op === '+' ? 'plus' : op === '-' ? 'minus' : op === '×' || op === 'x' || op === '*' ? 'times' : op === '÷' || op === '/' ? 'divided by' : 'unknown';
  const base = `${a} ${opWord} ${b} equals`;
  if (opWord === 'divided by' && typeof remainder === 'number' && remainder > 0){
    return `${base}, remainder ${remainder}`;
  }
  return base;
}

export function formulaStringToAriaLabel(formula){
  if (typeof formula !== 'string') return '';
  const m = formula.match(/\s*(\d+)\s*([+\-×x*÷\/])\s*(\d+)\s*/);
  if (!m) return `${String(formula)} equals`;
  return formulaToAriaLabel({ a: Number(m[1]), op: m[2], b: Number(m[3]) });
}

export function injectFocusStyles(){
  if (typeof document === 'undefined') return;
  if (document.getElementById('ci-focus-style')) return;
  const style = document.createElement('style');
  style.id = 'ci-focus-style';
  style.textContent = `.focus-ring:focus-visible{ outline: 2px solid #00aaff; outline-offset: 2px; }`;
  document.head.appendChild(style);
}

export function ensureLiveRegion(root=document.body){
  if (typeof document === 'undefined') return null;
  let el = document.getElementById('live-status');
  if (!el){
    el = document.createElement('div');
    el.id = 'live-status';
    el.setAttribute('aria-live', 'polite');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    el.style.width = '1px';
    el.style.height = '1px';
    (root || document.body).appendChild(el);
  }
  return el;
}


