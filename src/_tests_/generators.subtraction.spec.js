import { describe, it, expect } from 'vitest';
import { generateSubtraction } from '../core/generators/subtraction.js';
import { digitCount, countBorrowsSub } from '../utils/random.js';

function borrowMaskByPlace(a, b) {
  const maxW = Math.max(digitCount(a), digitCount(b));
  let borrow = 0; const mask = [];
  for (let pos = 0; pos < maxW; pos++) {
    const da = Math.floor(a / Math.pow(10, pos)) % 10;
    const db = Math.floor(b / Math.pow(10, pos)) % 10;
    const top = da - borrow;
    if (top < db) { mask[pos] = true; borrow = 1; } else { mask[pos] = false; borrow = 0; }
  }
  return mask;
}

describe('SPADE subtraction generator', () => {
  it('rank1: 1桁/借りなし', () => {
    const qs = generateSubtraction(1, { count: 100 });
    expect(qs.length).toBe(100);
    for (const q of qs) {
      const [a, b] = q.operands;
      expect(a).toBeGreaterThanOrEqual(1); expect(a).toBeLessThanOrEqual(9);
      expect(b).toBeGreaterThanOrEqual(0); expect(b).toBeLessThanOrEqual(9);
      expect(a - b).toBeGreaterThanOrEqual(0);
      expect(countBorrowsSub(a, b)).toBe(0);
    }
  });

  it('rank4: 2桁/一の位のみ借り', () => {
    const qs = generateSubtraction(4, { count: 100 });
    for (const q of qs) {
      const [a, b] = q.operands;
      expect(digitCount(a)).toBeGreaterThanOrEqual(2);
      expect(a - b).toBeGreaterThanOrEqual(0);
      const m = borrowMaskByPlace(a, b);
      expect(m[0]).toBe(true);
      expect((m[1] || false)).toBe(false);
    }
  });

  it('rank5: 2桁/十の位のみ借り（実装は3桁-2桁で再現）', () => {
    const qs = generateSubtraction(5, { count: 100 });
    for (const q of qs) {
      const [a, b] = q.operands;
      expect(a - b).toBeGreaterThanOrEqual(0);
      const m = borrowMaskByPlace(a, b);
      expect((m[0] || false)).toBe(false);
      expect((m[1] || false)).toBe(true);
    }
  });

  it('rank6: 2桁/二重借り（1の位・10の位）', () => {
    const qs = generateSubtraction(6, { count: 100 });
    for (const q of qs) {
      const [a, b] = q.operands;
      const m = borrowMaskByPlace(a, b);
      expect((m[0] || false)).toBe(true);
      expect((m[1] || false)).toBe(true);
    }
  });

  it('rank8: 3桁/単一借り', () => {
    const qs = generateSubtraction(8, { count: 100 });
    for (const q of qs) {
      const [a, b] = q.operands;
      expect(a - b).toBeGreaterThanOrEqual(0);
      expect(countBorrowsSub(a, b)).toBe(1);
    }
  });

  it('rank9: 3桁/複数借り', () => {
    const qs = generateSubtraction(9, { count: 100 });
    for (const q of qs) {
      const [a, b] = q.operands;
      expect(a - b).toBeGreaterThanOrEqual(0);
      expect(countBorrowsSub(a, b)).toBeGreaterThanOrEqual(2);
    }
  });

  it('rank12: 鎖引き算 a-b-c >= 0', () => {
    const qs = generateSubtraction(12, { count: 100 });
    for (const q of qs) {
      const [a, b, c] = q.operands;
      const ans = a - b - c;
      expect(ans).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBe(ans);
    }
  });

  it('performance: generate 500 mixed SPADE questions < 500ms', () => {
    const start = Date.now();
    let total = 0;
    for (let r = 1; r <= 13; r++) {
      total += generateSubtraction(r, { count: 40 }).length; // 13*40=520
    }
    const ms = Date.now() - start;
    expect(total).toBeGreaterThanOrEqual(500);
    expect(ms).toBeLessThan(500);
  });
});


