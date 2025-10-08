/* @vitest-environment jsdom */
import { describe, test, expect } from 'vitest';
import { formulaToAriaLabel, formulaStringToAriaLabel, ensureLiveRegion } from '../utils/accessibility.js';
import { spawnController } from '../core/spawnController.js';

describe('a11y helpers', () => {
  test('formulaToAriaLabel basic', () => {
    expect(formulaToAriaLabel({ a: 3, b: 5, op: '+' })).toBe('3 plus 5 equals');
    expect(formulaStringToAriaLabel('7 × 8')).toBe('7 times 8 equals');
    expect(formulaStringToAriaLabel('9 ÷ 3')).toBe('9 divided by 3 equals');
  });
});

describe('enemies focusable with tabindex', () => {
  test('spawned enemies have role and tabindex', () => {
    const root = document.createElement('div');
    const questions = [{ formula: '3 + 4', answer: 7 }];
    const ctrl = spawnController({ rootEl: root, questions, onCorrect(){}, onWrong(){} });
    const btn = root.querySelector('.enemy');
    expect(btn.getAttribute('role')).toBe('button');
    expect(btn.getAttribute('tabindex')).toBe('0');
    expect(btn.getAttribute('aria-label')).toContain('のこたえは');
    ctrl.stop();
  });

  test('live region exists', () => {
    const el = ensureLiveRegion(document.body);
    expect(el).not.toBeNull();
    expect(el.getAttribute('aria-live')).toBe('polite');
  });
});


