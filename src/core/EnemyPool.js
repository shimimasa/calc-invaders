// Simple DOM node pool for enemies

export class EnemyPool {
  constructor(createFn){ this.createFn = createFn; this.free = []; }
  acquire(){ return this.free.pop() || (this.createFn ? this.createFn() : null); }
  release(node){ if (!node) return; try { node.removeAttribute('style'); node.classList.remove('lock'); } catch(_e){} this.free.push(node); }
  size(){ return this.free.length; }
}


