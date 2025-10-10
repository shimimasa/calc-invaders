// src/systems/StageTimer.js
export class StageTimer {
    constructor() {
      this._elapsed = 0;
      this._running = false;
      this._raf = null;
      this._onTick = null; // (ms)=>void
      this._onStop = null; // (ms)=>void
      this._last = 0;
      this._vis = this._onVisibility.bind(this);
      this._loop = this._loop.bind(this);
    }
    onTick(fn){ this._onTick = fn; return this; }
    onStop(fn){ this._onStop = fn; return this; }
  
    start(){
      if (this._running) return;
      this._running = true;
      this._last = performance.now();
      document.addEventListener('visibilitychange', this._vis);
      this._raf = requestAnimationFrame(this._loop);
    }
  
    _loop(){
      if (!this._running) return;
      const now = performance.now();
      this._elapsed += (now - this._last);
      this._last = now;
      this._onTick?.(this._elapsed);
      this._raf = requestAnimationFrame(this._loop);
    }
  
    pause(){
      if (!this._running) return;
      this._running = false;
      cancelAnimationFrame(this._raf);
    }
  
    resume(){
      if (this._running) return;
      this._running = true;
      this._last = performance.now();
      this._raf = requestAnimationFrame(this._loop);
    }
  
    stop(){
      if (!this._running) return;
      this._running = false;
      cancelAnimationFrame(this._raf);
      document.removeEventListener('visibilitychange', this._vis);
      this._onStop?.(this._elapsed);
    }
  
    reset(){
      this._elapsed = 0;
      this._running = false;
      if (this._raf) cancelAnimationFrame(this._raf);
      document.removeEventListener('visibilitychange', this._vis);
    }
  
    _onVisibility(){
      if (document.hidden) this.pause(); else this.resume();
    }
    get elapsed(){ return this._elapsed; }
  }
  
  export function formatTime(ms){
    const m = Math.floor(ms/60000);
    const s = Math.floor((ms%60000)/1000);
    const cs = Math.floor((ms%1000)/10);
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(cs).padStart(2,'0')}`;
  }
  