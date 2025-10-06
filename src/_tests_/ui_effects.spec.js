/* @vitest-environment jsdom */
import { describe, test, expect } from 'vitest';
import { showHitEffect, showMissEffect, fadeTransition } from '../ui/effects.js';

describe('UI effects', () => {
  test('hit effect creates and removes elements', async () => {
    const anchor = document.createElement('div'); document.body.appendChild(anchor);
    const before = document.querySelectorAll('#fx-layer .fx-pop').length;
    showHitEffect({ anchorEl: anchor, text: '+100' });
    const during = document.querySelectorAll('#fx-layer .fx-pop').length;
    expect(during).toBeGreaterThanOrEqual(before);
    await new Promise(r => setTimeout(r, 750));
    const after = document.querySelectorAll('#fx-layer .fx-pop').length;
    expect(after).toBeLessThanOrEqual(during);
  });

  test('miss effect and fade transition create overlays', async () => {
    showMissEffect({});
    const flash = document.querySelector('.fx-flash');
    expect(flash).toBeTruthy();
    fadeTransition();
    const fade = document.querySelector('.fx-fade');
    expect(fade).toBeTruthy();
    await new Promise(r => setTimeout(r, 500));
    expect(document.querySelector('.fx-fade')).toBeFalsy();
  });
});


