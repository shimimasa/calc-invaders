import { describe, test, expect } from 'vitest';
/* @vitest-environment jsdom */
import { FpsSampler, logOnceOnDrop, now } from '../utils/perf.js';
import { renderEnemies, applyRowTransformsBatch } from '../ui/renderer.js';

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

  test('batched transforms for 25 enemies is fast enough (smoke)', () => {
    const root = document.createElement('div');
    const questions = Array.from({ length: 25 }, (_, i) => ({ formula: `${i}+${i}`, answer: i + i }));
    renderEnemies({ rootEl: root, questions });
    const rowOffsetPx = [0,0,0,0,0];
    const t0 = now();
    for (let k=0;k<50;k++){ rowOffsetPx[0]+=1; applyRowTransformsBatch({ rootEl: root, cols: 5, rowOffsetPx }); }
    const dt = now() - t0;
    expect(dt).toBeLessThan(30); // 緩いしきい値
  });
});


