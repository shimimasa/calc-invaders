import { randInt, hasBorrow } from "../../utils/random.js";

export function generate(rank, count) {
  const results = [];
  while (results.length < count) {
    if (rank === 1) {
      // 1桁−1桁, 結果≥0, 1の位で借位なし
      const a = randInt(0, 9);
      const b = randInt(0, a); // 結果≥0
      if (!hasBorrow(a, b)) {
        results.push({ formula: `${a} - ${b}`, answer: a - b });
      }
    } else if (rank === 2) {
      // 1桁−1桁, 結果≥0, 1の位で必ず借位
      const a = randInt(1, 9); // 0では借位が発生しないので1-9
      const b = randInt(0, 9);
      if (a - b >= 0 && hasBorrow(a, b)) {
        results.push({ formula: `${a} - ${b}`, answer: a - b });
      }
    } else if (rank === 3) {
      // 2桁−1桁, 結果≥0, 1の位で借位なし
      const a = randInt(10, 99);
      const b = randInt(0, Math.min(9, a));
      const ones = a % 10;
      if (a - b >= 0 && b <= ones && !hasBorrow(a, b)) {
        results.push({ formula: `${a} - ${b}`, answer: a - b });
      }
    } else {
      break;
    }
  }
  return results;
}


