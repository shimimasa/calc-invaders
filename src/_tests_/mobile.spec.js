/* @vitest-environment jsdom */
import { describe, test, expect } from 'vitest';
import { setNumericInputAttributes } from '../ui/inputHandler.js';

describe('Mobile touch support', () => {
  test('numeric input attributes present', () => {
    const input = document.createElement('input');
    setNumericInputAttributes(input);
    expect(input.getAttribute('inputmode')).toBe('numeric');
    expect(input.getAttribute('pattern')).toBe('[0-9 ]*,?[0-9 ]*');
  });
});


