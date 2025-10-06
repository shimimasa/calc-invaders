import { describe, it, expect, vi } from 'vitest';
import { toHalfWidthDigits, normalizeInput, prepareAnswer } from '../ui/inputHandler.js';

describe('UI input normalization & validation', () => {
  it('converts Zenkaku digits to Hankaku', () => {
    expect(toHalfWidthDigits('１２３')).toBe('123');
  });

  it('normalize trims spaces', () => {
    expect(normalizeInput('  8 ')).toBe('8');
  });

  it('prepareAnswer rejects empty', () => {
    const onErr = vi.fn();
    const out = prepareAnswer('', { onInputError: onErr });
    expect(out).toBeNull();
    expect(onErr).toHaveBeenCalled();
  });

  it('prepareAnswer rejects NaN', () => {
    const onErr = vi.fn();
    const out = prepareAnswer('abc', { onInputError: onErr });
    expect(out).toBeNull();
    expect(onErr).toHaveBeenCalled();
  });

  it('division remainder normalization: "１２，３" => "12,3"', () => {
    const out = prepareAnswer('１２，３', { needRemainder: true });
    expect(out).toBe('12,3');
  });
});
