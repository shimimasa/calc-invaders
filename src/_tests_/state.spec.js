/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from 'vitest';
import { STORAGE_KEY, getDefaultState, loadState, saveState, resetState, updateState, logIncorrectFormula, flipCard, setLastStageId, setAudioSettings } from '../core/gameState.js';

describe('GameState persistence', () => {
  beforeEach(() => { localStorage.clear(); });

  it('default state on empty storage and on parse error', () => {
    const a = loadState();
    expect(a).toEqual(getDefaultState());
    localStorage.setItem(STORAGE_KEY, '{ invalid json');
    const b = loadState();
    expect(b).toEqual(getDefaultState());
  });

  it('round-trip save and load', () => {
    const src = {
      lastStageId: 'heart_03',
      score: 12345,
      lives: 2,
      flippedCards: ['H1','H2'],
      incorrectFormulas: ['8+9','12-5'],
      audioSettings: { bgm: false, se: true, volume: 0.5 }
    };
    saveState(src);
    const got = loadState();
    expect(got).toEqual({ ...getDefaultState(), ...src });
  });

  it('helpers update as expected', () => {
    resetState();
    setLastStageId('spade_02');
    flipCard('H1');
    logIncorrectFormula('3×4');
    setAudioSettings({ bgm: false });
    const s = loadState();
    expect(s.lastStageId).toBe('spade_02');
    expect(s.flippedCards.includes('H1')).toBe(true);
    expect(s.incorrectFormulas.length).toBe(1);
    expect(s.audioSettings.bgm).toBe(false);
  });
});
