import { describe, test, expect } from 'vitest';
import { FpsSampler, logOnceOnDrop, now } from '../utils/perf.js';

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
});


