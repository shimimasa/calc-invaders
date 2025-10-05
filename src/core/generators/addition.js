import { randInt, hasCarry } from "../../utils/random.js";

export function generate(rank, count) {
  const results = [];
  while (results.length < count) {
    if (rank === 1) {
      // 1桁 + 1桁, 合計 ≤ 9, 繰上なし
      const a = randInt(0, 9);
      const b = randInt(0, 9);
      if (a + b <= 9) {
        results.push({ formula: `${a} + ${b}`, answer: a + b });
      }
    } else if (rank === 2) {
      // 1桁 + 1桁, 合計 ≥ 10, 繰上あり
      const a = randInt(0, 9);
      const b = randInt(0, 9);
      if (a + b >= 10 && hasCarry(a, b)) {
        results.push({ formula: `${a} + ${b}`, answer: a + b });
      }
    } else if (rank === 3) {
      // 2桁 + 1桁, 1の位で繰上なし
      const a = randInt(10, 99);
      const maxB = 9 - (a % 10);
      const b = randInt(0, maxB);
      if (!hasCarry(a, b)) {
        results.push({ formula: `${a} + ${b}`, answer: a + b });
      }
    } else {
      break;
    }
  }
  return results;
}


