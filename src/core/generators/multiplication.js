import { randInt } from "../../utils/random.js";

export function generate(rank, count) {
  const results = [];
  while (results.length < count) {
    if (rank === 1) { // 九九 1-3
      const a = randInt(1,3), b = randInt(1,9);
      results.push({ formula: `${a} × ${b}`, answer: a*b });
    } else if (rank === 2) { // 九九 4-6
      const a = randInt(4,6), b = randInt(1,9);
      results.push({ formula: `${a} × ${b}`, answer: a*b });
    } else if (rank === 3) { // 九九 7-9
      const a = randInt(7,9), b = randInt(1,9);
      results.push({ formula: `${a} × ${b}`, answer: a*b });
    } else if (rank === 4) { // 2桁×1桁 10-19
      const a = randInt(10,19), b = randInt(1,9);
      results.push({ formula: `${a} × ${b}`, answer: a*b });
    } else if (rank === 5) { // 2桁×1桁 20-49
      const a = randInt(20,49), b = randInt(1,9);
      results.push({ formula: `${a} × ${b}`, answer: a*b });
    } else if (rank === 6) { // 2桁×1桁 50-99
      const a = randInt(50,99), b = randInt(1,9);
      results.push({ formula: `${a} × ${b}`, answer: a*b });
    } else if (rank === 7) { // 2桁×2桁 small
      const a = randInt(10,19), b = randInt(10,19);
      results.push({ formula: `${a} × ${b}`, answer: a*b });
    } else if (rank === 8) { // 2桁×2桁 medium
      const a = randInt(10,49), b = randInt(10,49);
      results.push({ formula: `${a} × ${b}`, answer: a*b });
    } else if (rank === 9) { // 2桁×2桁 large
      const a = randInt(10,99), b = randInt(10,99);
      results.push({ formula: `${a} × ${b}`, answer: a*b });
    } else if (rank === 10) { // 3桁×1桁
      const a = randInt(100,999), b = randInt(1,9);
      results.push({ formula: `${a} × ${b}`, answer: a*b });
    } else if (rank === 11) { // 3桁×2桁
      const a = randInt(100,999), b = randInt(10,99);
      results.push({ formula: `${a} × ${b}`, answer: a*b });
    } else if (rank === 12) { // 連鎖 a×b×c (制限:結果<10000)
      let a, b, c, ans;
      do { a = randInt(5,40); b = randInt(2,20); c = randInt(2,10); ans = a*b*c; } while (ans >= 10000);
      results.push({ formula: `${a} × ${b} × ${c}`, answer: ans });
    } else if (rank === 13) { // 複合（4項）
      let a,b,c,d,ans;
      do { a=randInt(2,20); b=randInt(2,20); c=randInt(2,10); d=randInt(2,5); ans=a*b*c*d; } while (ans >= 20000);
      results.push({ formula: `${a} × ${b} × ${c} × ${d}`, answer: ans });
    } else {
      break;
    }
  }
  return results;
}


