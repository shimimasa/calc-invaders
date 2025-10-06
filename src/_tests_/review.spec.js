/* @vitest-environment jsdom */
import { describe, test, expect, beforeEach } from 'vitest';
import { saveState, resetState, getIncorrectFormulas, clearIncorrectFormula } from '../core/gameState.js';
import { buildReviewStage } from '../core/reviewStage.js';

describe('Review Mode', () => {
  beforeEach(() => { localStorage.clear(); resetState(); });

  test('buildReviewStage uses incorrect formulas as preGenerated', () => {
    saveState({ incorrectFormulas: ['1 + 2','7 × 8','19 ÷ 4','12 - 5','3 + 6'] });
    const stage = buildReviewStage({ rows: 1, cols: 10 });
    expect(stage.preGenerated.length).toBe(5);
    expect(stage.preGenerated[0]).toHaveProperty('formula');
  });

  test('clearIncorrectFormula removes only on correct (simulated)', () => {
    saveState({ incorrectFormulas: ['1 + 2','9 ÷ 4'] });
    const before = getIncorrectFormulas();
    expect(before.length).toBe(2);
    clearIncorrectFormula(0);
    const after = getIncorrectFormulas();
    expect(after).toEqual(['9 ÷ 4']);
  });
});


