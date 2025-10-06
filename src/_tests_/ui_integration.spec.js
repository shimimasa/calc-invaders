/* @vitest-environment jsdom */
import { describe, test, expect } from 'vitest';
import { spawnController } from '../core/spawnController.js';
import { prepareAnswer } from '../ui/inputHandler.js';

function setupDom(){
  const root = document.createElement('div');
  root.id = 'grid';
  const answer = document.createElement('input');
  answer.id = 'answer';
  const fire = document.createElement('button');
  fire.id = 'fire';
  const score = document.createElement('span');
  score.id = 'score'; score.textContent = '0';
  document.body.appendChild(root);
  document.body.appendChild(answer);
  document.body.appendChild(fire);
  document.body.appendChild(score);
  return { root, answer, fire, score };
}

describe('UI integration flow', () => {
  test('click -> type -> submit (addition)', () => {
    const { root, answer, score } = setupDom();
    const questions = [{ formula: '3 + 4', answer: 7 }];
    const ctrl = spawnController({ rootEl: root, questions, onCorrect(){ score.textContent = String(Number(score.textContent||'0') + 100); }, onWrong(){} });
    const enemy = root.querySelector('.enemy');
    enemy.click();
    answer.value = '  7  ';
    const normalized = prepareAnswer(answer.value, { needRemainder: false });
    const ok = ctrl.submit(normalized);
    if (ok) answer.value = '';
    expect(ok).toBe(true);
    expect(root.children.length).toBe(0);
    expect(score.textContent).toBe('100');
    expect(answer.value).toBe('');
    ctrl.stop();
  });

  test('division with remainder using space format', () => {
    const { root, answer } = setupDom();
    const questions = [{ formula: '19 ÷ 4', answer: 4, remainder: 3 }];
    const ctrl = spawnController({ rootEl: root, questions, onCorrect(){}, onWrong(){} });
    const enemy = root.querySelector('.enemy');
    enemy.click();
    answer.value = '4 3';
    const normalized = prepareAnswer(answer.value, { needRemainder: true });
    const ok = ctrl.submit(normalized);
    expect(ok).toBe(true);
    expect(root.children.length).toBe(0);
    ctrl.stop();
  });
});


