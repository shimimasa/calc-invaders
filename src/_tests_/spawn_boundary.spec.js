/* @vitest-environment jsdom */
import { describe, test, expect, vi } from 'vitest';
import { spawnController } from '../core/spawnController.js';

function makeRootWith(n){
  const root = document.createElement('div');
  const questions = Array.from({ length: n }, (_, i) => ({ formula: `${i}+${i}`, answer: i + i }));
  return { root, questions };
}

describe('Spawn bottom boundary', () => {
  test('onBottomReached fires when rows cross bottomY', async () => {
    const { root, questions } = makeRootWith(5);
    const cb = vi.fn();
    const ctrl = spawnController({
      rootEl: root,
      questions,
      cols: 5,
      descendSpeed: 10, // faster
      spawnIntervalSec: 0.2,
      bottomY: 5,
      onCorrect(){},
      onWrong(){},
      onBottomReached: cb
    });
    // 少し待って降下させる
    await new Promise(r => setTimeout(r, 300));
    expect(cb.mock.calls.length).toBeGreaterThanOrEqual(1);
    ctrl.stop();
  });
});
