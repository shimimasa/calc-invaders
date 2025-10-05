import { generate as genAdd } from "../core/generators/addition.js";
import { generate as genSub } from "../core/generators/subtraction.js";
import { generate as genMul } from "../core/generators/multiplication.js";
import { hasCarry, hasBorrow } from "../utils/random.js";
import { describe, test, expect } from "vitest";

describe("Generators - HEART (addition)", () => {
  test("HEART 1: 100件、和≤9 & no carry", () => {
    const qs = genAdd(1, 100);
    expect(qs).toHaveLength(100);
    for (const q of qs) {
      const [a, b] = q.formula.split(" + ").map(Number);
      expect(a + b).toBeLessThanOrEqual(9);
      expect(hasCarry(a, b)).toBe(false);
    }
  });

  test("HEART 3: 100件、二桁×2 no carry", () => {
    const qs = genAdd(3, 100);
    for (const q of qs) {
      const [a,b] = q.formula.split(" + ").map(Number);
      expect(a).toBeGreaterThanOrEqual(10); expect(a).toBeLessThanOrEqual(99);
      expect(b).toBeGreaterThanOrEqual(10); expect(b).toBeLessThanOrEqual(99);
      expect(hasCarry(a,b)).toBe(false);
    }
  });

  test("HEART 5: 100件、二桁 tens carry only", () => {
    const qs = genAdd(5, 100);
    for (const q of qs) {
      const [a,b] = q.formula.split(" + ").map(Number);
      expect(((a%10)+(b%10))<10).toBe(true);
      const tensCarry = Math.floor((a%100)/10) + Math.floor((b%100)/10) >= 10;
      expect(tensCarry).toBe(true);
    }
  });

  test("HEART 7: 100件、三桁 no carry", () => {
    const qs = genAdd(7, 100);
    for (const q of qs) {
      const [a,b] = q.formula.split(" + ").map(Number);
      expect(a).toBeGreaterThanOrEqual(100); expect(a).toBeLessThanOrEqual(999);
      expect(b).toBeGreaterThanOrEqual(100); expect(b).toBeLessThanOrEqual(999);
      expect(hasCarry(a%100, b%100)).toBe(false); // quick spot for ones
    }
  });

  test("HEART 11: 100件、四桁 with carries", () => {
    const qs = genAdd(11, 100);
    for (const q of qs) {
      const [a,b] = q.formula.split(" + ").map(Number);
      expect(a).toBeGreaterThanOrEqual(1000); expect(b).toBeGreaterThanOrEqual(1000);
    }
  });

  test("HEART 13: 100件、四項加算", () => {
    const qs = genAdd(13, 100);
    for (const q of qs) {
      expect(q.formula.split(" + ").length).toBe(4);
    }
  });
});

describe("Generators - SPADE (subtraction)", () => {
  test("SPADE 1: 100件、結果≥0 & noBorrow(ones)", () => {
    const qs = genSub(1, 100);
    expect(qs).toHaveLength(100);
    for (const q of qs) {
      const [a, b] = q.formula.split(" - ").map(Number);
      expect(a - b).toBeGreaterThanOrEqual(0);
      expect(hasBorrow(a, b)).toBe(false);
    }
  });

  test("SPADE 3: 100件、二桁 no borrow", () => {
    const qs = genSub(3, 100);
    for (const q of qs) {
      const [a,b] = q.formula.split(" - ").map(Number);
      expect(a).toBeGreaterThanOrEqual(10); expect(a).toBeLessThanOrEqual(99);
      expect(a - b).toBeGreaterThanOrEqual(0);
      expect(hasBorrow(a,b)).toBe(false);
    }
  });

  test("SPADE 7: 100件、三桁 no borrow", () => {
    const qs = genSub(7, 100);
    for (const q of qs) {
      const [a,b] = q.formula.split(" - ").map(Number);
      expect(a).toBeGreaterThanOrEqual(100);
      expect(a - b).toBeGreaterThanOrEqual(0);
    }
  });

  test("SPADE 11: 100件、四桁 with borrows allowed", () => {
    const qs = genSub(11, 100);
    for (const q of qs) {
      const [a,b] = q.formula.split(" - ").map(Number);
      expect(a - b).toBeGreaterThanOrEqual(0);
    }
  });

  test("SPADE 13: 100件、減算チェーン", () => {
    const qs = genSub(13, 100);
    for (const q of qs) {
      const ans = eval(q.formula.replace(/ /g, ''));
      expect(ans).toBe(q.answer);
    }
  });
});

describe("Generators - CLUB (multiplication)", () => {
  test("CLUB 2: 100件、a∈{4..6}, b∈{1..9}", () => {
    const qs = genMul(2, 100);
    expect(qs).toHaveLength(100);
    for (const q of qs) {
      const [a, b] = q.formula.split(" × ").map(Number);
      expect(a).toBeGreaterThanOrEqual(4);
      expect(a).toBeLessThanOrEqual(6);
      expect(b).toBeGreaterThanOrEqual(1);
      expect(b).toBeLessThanOrEqual(9);
    }
  });

  test("CLUB 7: 100件、二桁×二桁 small", () => {
    const qs = genMul(7, 100);
    for (const q of qs) {
      const [a,b] = q.formula.split(" × ").map(Number);
      expect(a).toBeGreaterThanOrEqual(10); expect(a).toBeLessThanOrEqual(19);
      expect(b).toBeGreaterThanOrEqual(10); expect(b).toBeLessThanOrEqual(19);
    }
  });

  test("CLUB 11: 100件、三桁×二桁", () => {
    const qs = genMul(11, 100);
    for (const q of qs) {
      const [a,b] = q.formula.split(" × ").map(Number);
      expect(a).toBeGreaterThanOrEqual(100);
      expect(b).toBeGreaterThanOrEqual(10); expect(b).toBeLessThanOrEqual(99);
    }
  });

  test("CLUB 13: 100件、四項以下の連鎖", () => {
    const qs = genMul(13, 100);
    for (const q of qs) {
      expect(q.formula.split(" × ").length).toBeGreaterThanOrEqual(3);
    }
  });
});


