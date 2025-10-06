/* @vitest-environment jsdom */
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { applyAudioSettingsFromStorage, setSfxEnabled, setBgmEnabled, getSfxEnabled, getBgmEnabled } from '../audio/index.js';

describe('Audio toggles persistence', () => {
  beforeEach(() => { localStorage.clear(); });

  test('toggle -> persist -> reload', async () => {
    applyAudioSettingsFromStorage();
    setSfxEnabled(false);
    setBgmEnabled(false);
    expect(getSfxEnabled()).toBe(false);
    expect(getBgmEnabled()).toBe(false);
    // reload (reset module cache then import fresh)
    vi.resetModules();
    const fresh = await import('../audio/index.js');
    fresh.applyAudioSettingsFromStorage();
    expect(fresh.getSfxEnabled()).toBe(false);
    expect(fresh.getBgmEnabled()).toBe(false);
  });
});


