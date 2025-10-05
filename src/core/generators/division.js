import { randInt, isDivisible } from "../../utils/random.js";

export function generate(rank, count) {
  const results = [];
  while (results.length < count) {
    if (rank === 1) {
      // 九九逆算 余りなし（a=b*k）
      const b = randInt(1, 9);
      const k = randInt(1, 9);
      const a = b * k;
      results.push({ formula: `${a} ÷ ${b}`, answer: k });
    } else if (rank === 2) {
      // 九九範囲 余りあり（a % b ≠ 0） → remainder を返す
      const b = randInt(1, 9);
      let a = randInt(2, 81); // 1..9*1..9 の範囲程度
      if (isDivisible(a, b)) {
        // 余りありを保証するため、ずらす
        a += 1;
      }
      const answer = Math.floor(a / b);
      const remainder = a % b;
      if (remainder !== 0) {
        results.push({ formula: `${a} ÷ ${b}`, answer, remainder });
      }
    } else if (rank === 3) {
      // 2桁 ÷ 1桁 余りなし
      const b = randInt(1, 9);
      const answer = randInt(2, 9); // 商は1桁
      const a = b * answer;
      if (a >= 10 && a <= 99 && isDivisible(a, b)) {
        results.push({ formula: `${a} ÷ ${b}`, answer });
      }
    } else {
      break;
    }
  }
  return results;
}


