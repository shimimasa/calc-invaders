import { generate as genDiv } from "../core/generators/division.js";
import { describe, test, expect } from "vitest";
describe("Generators - DIAMOND (division)", () => {
  test("DIAMOND 1: 100件、a%b===0、remainder未定義", () => {
    const qs = genDiv(1, 100);
    expect(qs).toHaveLength(100);
    for (const q of qs) {
      const [a, b] = q.formula.split(" ÷ ").map(Number);
      expect(a % b).toBe(0);
      expect(q.remainder).toBeUndefined();
    }
  });

  test("DIAMOND 2: 100件、a%b!==0、remainder>0 && remainder<b", () => {
    const qs = genDiv(2, 100);
    expect(qs).toHaveLength(100);
    for (const q of qs) {
      const [a, b] = q.formula.split(" ÷ ").map(Number);
      expect(a % b).not.toBe(0);
      expect(q.remainder).toBeGreaterThan(0);
      expect(q.remainder).toBeLessThan(b);
    }
  });

  test("DIAMOND 3: 100件、a%b===0", () => {
    const qs = genDiv(3, 100);
    expect(qs).toHaveLength(100);
    for (const q of qs) {
      const [a, b] = q.formula.split(" ÷ ").map(Number);
      expect(a % b).toBe(0);
    }
  });
});


