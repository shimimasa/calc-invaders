import { describe, test, expect } from 'vitest';
/* @vitest-environment jsdom */
import { FpsSampler, logOnceOnDrop, now } from '../utils/perf.js';
// renderer.js は廃止。パフォーマンスユーティリティの検査のみ残す。

describe('perf smoke', () => {
  test('fps sampler produces reasonable average', () => {
    const s = new FpsSampler(5);
    const t0 = now();
    for (let i=1;i<=5;i++) s.sample(t0 + i*16.7); // ~60fps
    const fps = s.getFps();
    expect(fps).toBeGreaterThan(40);
    expect(fps).toBeLessThan(90);
  });

  test('logOnceOnDrop triggers once', () => {
    let count = 0; const orig = console.warn; console.warn = () => { count++; };
    const guard = logOnceOnDrop(30);
    guard(25); guard(20); guard(10);
    console.warn = orig;
    expect(count).toBe(1);
  });

  test('dummy DOM manip smoke', () => {
    const root = document.createElement('div');
    for (let i=0;i<25;i++){ const el = document.createElement('div'); el.textContent = String(i); root.appendChild(el); }
    const t0 = now();
    for (let k=0;k<50;k++){
      for (let i=0;i<root.children.length;i++){
        const el = root.children[i]; el.style.transform = `translateY(${k}px)`;
      }
    }
    const dt = now() - t0;
    expect(dt).toBeLessThan(50);
  });
});


