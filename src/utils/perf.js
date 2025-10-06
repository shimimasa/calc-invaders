// Lightweight perf helpers

export function now(){
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') return performance.now();
  return Date.now();
}

export class FpsSampler{
  constructor(windowSize = 20){
    this.windowSize = windowSize;
    this.samples = [];
    this.last = null;
  }
  sample(t = now()){
    if (this.last != null){
      const dt = t - this.last;
      if (dt > 0 && dt < 1000) {
        this.samples.push(1000 / dt);
        if (this.samples.length > this.windowSize) this.samples.shift();
      }
    }
    this.last = t;
    return this.getFps();
  }
  getFps(){
    if (this.samples.length === 0) return 0;
    const avg = this.samples.reduce((a,b)=>a+b,0) / this.samples.length;
    return avg;
  }
}

export function logOnceOnDrop(threshold = 30){
  let warned = false;
  return function(fps){
    if (!warned && typeof fps === 'number' && fps > 0 && fps < threshold){
      warned = true;
      try { console.warn(`[perf] FPS dropped below ${threshold}: ${fps.toFixed ? fps.toFixed(1) : fps}`); } catch(_e){}
    }
  };
}

export function mountFpsBadge(){
  try {
    if (!(import.meta?.env?.DEV)) return null;
  } catch (_e) { return null; }
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed; right:6px; bottom:6px; background:#0008; color:#fff; font:12px/1.6 monospace; padding:2px 4px; border-radius:3px; z-index:9999;';
  el.textContent = 'FPS';
  document.body.appendChild(el);
  return {
    update(fps){ if (Number.isFinite(fps)) el.textContent = `${Math.round(fps)} FPS`; },
    destroy(){ try { el.remove(); } catch(_e){} }
  };
}

// Optional EnemyPool skeleton for reusing DOM nodes
export class EnemyPool{
  constructor(createFn){ this.createFn = createFn; this.free = []; }
  acquire(){ return this.free.pop() || (this.createFn ? this.createFn() : null); }
  release(node){ if (!node) return; node.removeAttribute('style'); node.classList.remove('lock'); this.free.push(node); }
  stats(){ return { free: this.free.length }; }
}


