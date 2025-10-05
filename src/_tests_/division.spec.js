import { generate as genDiv } from "../core/generators/division.js";
import { describe, test, expect } from "vitest";

describe("Generators - DIAMOND (division)", () => {
  test("♦1 (1-3) remainder 0", () => {
    const qs = genDiv(1, 100);
    expect(qs).toHaveLength(100);
    for (const q of qs) {
      const [a, b] = q.formula.split(" ÷ ").map(Number);
      expect(a % b).toBe(0);
      expect(q.remainder).toBeUndefined();
    }
  });

  test("♦3 (7-9) remainder 0", () => {
    const qs = genDiv(3, 100);
    for (const q of qs) {
      const [a,b] = q.formula.split(" ÷ ").map(Number);
      expect(a % b).toBe(0);
      expect(q.remainder).toBeUndefined();
    }
  });

  test("♦5 (2桁/1桁) remainder > 0", () => {
    const qs = genDiv(5, 100);
    for (const q of qs) {
      const [a,b] = q.formula.split(" ÷ ").map(Number);
      expect(a).toBeGreaterThanOrEqual(10); expect(a).toBeLessThanOrEqual(99);
      expect(b).toBeGreaterThanOrEqual(1); expect(b).toBeLessThanOrEqual(9);
      expect(a % b).not.toBe(0);
      expect(q.remainder).toBeGreaterThan(0);
      expect(q.remainder).toBeLessThan(b);
    }
  });

  test("♦7 (3桁/1桁) remainder > 0", () => {
    const qs = genDiv(7, 100);
    for (const q of qs) {
      const [a,b] = q.formula.split(" ÷ ").map(Number);
      expect(a).toBeGreaterThanOrEqual(100); expect(a).toBeLessThanOrEqual(999);
      expect(b).toBeGreaterThanOrEqual(1); expect(b).toBeLessThanOrEqual(9);
      expect(a % b).not.toBe(0);
    }
  });

  test("♦9 (2桁/2桁) remainder > 0", () => {
    const qs = genDiv(9, 100);
    for (const q of qs) {
      const [a,b] = q.formula.split(" ÷ ").map(Number);
      expect(a).toBeGreaterThanOrEqual(10); expect(a).toBeLessThanOrEqual(99);
      expect(b).toBeGreaterThanOrEqual(10); expect(b).toBeLessThanOrEqual(99);
      expect(a % b).not.toBe(0);
    }
  });

  test("♦11 (3桁/2桁) remainder > 0", () => {
    const qs = genDiv(11, 100);
    for (const q of qs) {
      const [a,b] = q.formula.split(" ÷ ").map(Number);
      expect(a).toBeGreaterThanOrEqual(100); expect(a).toBeLessThanOrEqual(999);
      expect(b).toBeGreaterThanOrEqual(10); expect(b).toBeLessThanOrEqual(99);
      expect(a % b).not.toBe(0);
    }
  });

  test("♦13 (4桁/2桁) remainder > 0", () => {
    const qs = genDiv(13, 100);
    for (const q of qs) {
      const [a,b] = q.formula.split(" ÷ ").map(Number);
      expect(a).toBeGreaterThanOrEqual(1000); expect(a).toBeLessThanOrEqual(9999);
      expect(b).toBeGreaterThanOrEqual(10); expect(b).toBeLessThanOrEqual(99);
      expect(a % b).not.toBe(0);
    }
  });
});


