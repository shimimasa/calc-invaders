/* @vitest-environment jsdom */
import { describe, test, expect } from 'vitest';
import { spawnController } from '../core/spawnController.js';
import { prepareAnswer } from '../ui/inputHandler.js';

function setup(){
  const grid = document.createElement('div'); grid.id = 'grid';
  const answer = document.createElement('input'); answer.id = 'answer';
  const fire = document.createElement('button'); fire.id = 'fire';
  const score = document.createElement('span'); score.id = 'score'; score.textContent = '0';
  const life = document.createElement('span'); life.id = 'life'; life.textContent = '3';
  const selected = document.createElement('div'); selected.id = 'selected';
  const tower = document.createElement('div'); tower.id = 'tower';
  const msg = document.createElement('div'); msg.id = 'message';
  document.body.append(grid, answer, fire, score, life, selected, tower, msg);
  return { grid, answer, fire, score, life, selected };
}

describe('E2E play (short stage)', () => {
  test('solve all enemies', () => {
    const { grid, answer, score } = setup();
    const qs = [
      { formula: '1 + 2', answer: 3 },
      { formula: '9 ÷ 4', answer: 2, remainder: 1 },
    ];
    const ctrl = spawnController({ rootEl: grid, questions: qs, onCorrect(){ score.textContent = String(Number(score.textContent||'0') + 100); }, onWrong(){}, cols: 2, descendSpeed: 100, spawnIntervalSec: 0.05 });

    // First: addition
    let enemy = grid.querySelector('.enemy');
    enemy.click();
    answer.value = '3';
    ctrl.submit(prepareAnswer(answer.value, { needRemainder: false }));
    expect(grid.children.length).toBe(1);

    // Second: division with remainder
    enemy = grid.querySelector('.enemy');
    enemy.click();
    answer.value = '2 1';
    ctrl.submit(prepareAnswer(answer.value, { needRemainder: true }));
    expect(grid.children.length).toBe(0);
    ctrl.stop();
  });
});
