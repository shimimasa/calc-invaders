/* @vitest-environment jsdom */
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { renderCardTower } from '../ui/cardTower.js';
import { saveState, resetState } from '../core/gameState.js';

describe('Card Tower', () => {
  beforeEach(() => { localStorage.clear(); resetState(); });

  test('renders locked/unlocked/flipped states', () => {
    saveState({ unlockedSuits: { heart: true, spade: false, club: false, diamond: false }, flippedCards: ['heart_01'] });
    const root = document.createElement('div');
    renderCardTower({ rootEl: root, onSelectStage(){} });
    const heart1 = root.querySelector('[data-stage-id="heart_01"]');
    const spade1 = root.querySelector('[data-stage-id="spade_01"]');
    expect(heart1.classList.contains('unlocked')).toBe(true);
    expect(heart1.classList.contains('flipped')).toBe(true);
    expect(spade1.classList.contains('locked')).toBe(true);
  });

  test('click unlocked card triggers selection callback', () => {
    saveState({ unlockedSuits: { heart: true, spade: false, club: false, diamond: false } });
    const root = document.createElement('div');
    const onSelect = vi.fn();
    renderCardTower({ rootEl: root, onSelectStage: onSelect });
    const heart1 = root.querySelector('[data-stage-id="heart_01"]');
    heart1.click();
    expect(onSelect).toHaveBeenCalledWith('heart_01');
  });
});
