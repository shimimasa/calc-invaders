import { generate as genAdd } from "../core/generators/addition.js";
import { generate as genSub } from "../core/generators/subtraction.js";
import { generate as genMul } from "../core/generators/multiplication.js";
import { hasCarry, hasBorrow } from "../utils/random.js";

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

  test("HEART 2: 100件、和≥10 & hasCarry=true", () => {
    const qs = genAdd(2, 100);
    expect(qs).toHaveLength(100);
    for (const q of qs) {
      const [a, b] = q.formula.split(" + ").map(Number);
      expect(a + b).toBeGreaterThanOrEqual(10);
      expect(hasCarry(a, b)).toBe(true);
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

  test("SPADE 2: 100件、結果≥0 & must borrow(ones)", () => {
    const qs = genSub(2, 100);
    expect(qs).toHaveLength(100);
    for (const q of qs) {
      const [a, b] = q.formula.split(" - ").map(Number);
      expect(a - b).toBeGreaterThanOrEqual(0);
      expect(hasBorrow(a, b)).toBe(true);
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
});


