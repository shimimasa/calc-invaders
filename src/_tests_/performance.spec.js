import { generate as genAdd } from "../core/generators/addition.js";
import { generate as genSub } from "../core/generators/subtraction.js";
import { generate as genMul } from "../core/generators/multiplication.js";
import { generate as genDiv } from "../core/generators/division.js";
import { describe, test, expect } from "vitest";
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

describe("Performance - mixed generation", () => {
  test("Generate 500 within 500ms", () => {
    const ops = [
      { op: "addition", gen: genAdd },
      { op: "subtraction", gen: genSub },
      { op: "multiplication", gen: genMul },
      { op: "division", gen: genDiv }
    ];
    const t0 = Date.now();
    let total = 0;
    while (total < 500) {
      const { gen } = pick(ops);
      const rank = pick([1, 2, 3]);
      const batch = gen(rank, 5);
      total += batch.length;
    }
    const dt = Date.now() - t0;
    expect(dt).toBeLessThan(500);
  });
});


