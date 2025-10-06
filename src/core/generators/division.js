import { randInt, isDivisible } from "../../utils/random.js";

export function generate(rank, count) {
  const results = [];
  while (results.length < count) {
    if (rank === 1) { // table inverse 1-3
      const b = randInt(1,3), q = randInt(1,9), a = b*q;
      results.push({ formula: `${a} ÷ ${b}`, answer: q });
    } else if (rank === 2) { // 4-6
      const b = randInt(4,6), q = randInt(1,9), a = b*q;
      results.push({ formula: `${a} ÷ ${b}`, answer: q });
    } else if (rank === 3) { // 7-9
      const b = randInt(7,9), q = randInt(1,9), a = b*q;
      results.push({ formula: `${a} ÷ ${b}`, answer: q });
    } else if (rank === 4) { // 2桁÷1桁 remainder 0
      const b = randInt(1,9); const q = randInt(2,9); const a = b*q; if (a>=10 && a<=99)
        results.push({ formula: `${a} ÷ ${b}`, answer: q });
    } else if (rank === 5) { // 2桁÷1桁 remainder >0
      const b = randInt(1,9);
      let a, r;
      do { a = randInt(10,99); r = a % b; } while (r === 0);
      const q = Math.floor(a/b);
      if (r>0 && r<b)
        results.push({ formula: `${a} ÷ ${b}`, answer: q, remainder: r });
    } else if (rank === 6) { // 3桁÷1桁 remainder 0
      const b = randInt(1,9); const q = randInt(12,111); const a = b*q; if (a>=100 && a<=999)
        results.push({ formula: `${a} ÷ ${b}`, answer: q });
    } else if (rank === 7) { // 3桁÷1桁 remainder >0
      const b = randInt(1,9);
      let a, r;
      do { a = randInt(100,999); r = a % b; } while (r === 0);
      const q = Math.floor(a/b);
      if (r>0 && r<b)
        results.push({ formula: `${a} ÷ ${b}`, answer: q, remainder: r });
    } else if (rank === 8) { // 2桁÷2桁 remainder 0
      const b = randInt(10,99); const q = randInt(1,9); const a = b*q; if (a>=10 && a<=99)
        results.push({ formula: `${a} ÷ ${b}`, answer: q });
    } else if (rank === 9) { // 2桁÷2桁 remainder >0
      const b = randInt(10,99);
      let a, r;
      do { a = randInt(10,99); r = a % b; } while (r === 0);
      const q = Math.floor(a/b);
      if (r>0 && r<b)
        results.push({ formula: `${a} ÷ ${b}`, answer: q, remainder: r });
    } else if (rank === 10) { // 3桁÷2桁 remainder 0
      const b = randInt(10,99); const q = randInt(2,99); const a = b*q; if (a>=100 && a<=999)
        results.push({ formula: `${a} ÷ ${b}`, answer: q });
    } else if (rank === 11) { // 3桁÷2桁 remainder >0
      const b = randInt(10,99);
      let a, r;
      do { a = randInt(100,999); r = a % b; } while (r === 0);
      const q = Math.floor(a/b);
      if (r>0 && r<b)
        results.push({ formula: `${a} ÷ ${b}`, answer: q, remainder: r });
    } else if (rank === 12) { // 4桁÷2桁 remainder 0
      const b = randInt(10,99); const q = randInt(11,99); const a = b*q; if (a>=1000 && a<=9999)
        results.push({ formula: `${a} ÷ ${b}`, answer: q });
    } else if (rank === 13) { // 4桁÷2桁 remainder >0
      const b = randInt(10,99);
      let a, r;
      do { a = randInt(1000,9999); r = a % b; } while (r === 0);
      const q = Math.floor(a/b);
      if (r>0 && r<b)
        results.push({ formula: `${a} ÷ ${b}`, answer: q, remainder: r });
    } else {
      break;
    }
  }
  return results;
}


