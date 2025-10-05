import { randInt, countBorrowsSub } from "../../utils/random.js";

export function generate(rank, count) {
  const results = [];
  while (results.length < count) {
    if (rank === 1) {
      const a = randInt(1, 9); const b = randInt(0, a);
      if (countBorrowsSub(a,b) === 0) results.push({ formula: `${a} - ${b}`, answer: a - b });
    } else if (rank === 2) {
      const a = randInt(10, 18); const b = randInt(1, 9);
      if (a - b >= 0 && countBorrowsSub(a,b) >= 1) results.push({ formula: `${a} - ${b}`, answer: a - b });
    } else if (rank === 3) {
      const a = randInt(10, 99); const b = randInt(0, a);
      if (countBorrowsSub(a,b) === 0) results.push({ formula: `${a} - ${b}`, answer: a - b });
    } else if (rank === 4) {
      // borrow in ones only
      const a = randInt(10, 99); const b = randInt(1, 9);
      if (a - b >= 0 && ( (a%10) < (b%10) ) && Math.floor(a/10) >= Math.floor(b/10)) results.push({ formula: `${a} - ${b}`, answer: a - b });
    } else if (rank === 5) {
      // tens borrow only: ones no borrow
      let a = randInt(10,99), b = randInt(10,99);
      const onesOk = (a%10) >= (b%10);
      const tensBorrow = ((Math.floor(a/10)) < (Math.floor(b/10)));
      if (a - b >= 0 && onesOk && tensBorrow) results.push({ formula: `${a} - ${b}`, answer: a - b });
    } else if (rank === 6) {
      // double borrow (ones and tens)
      const a = randInt(10,99); const b = randInt(10,99);
      if (a - b >= 0 && countBorrowsSub(a,b) >= 2) results.push({ formula: `${a} - ${b}`, answer: a - b });
    } else if (rank === 7) {
      const a = randInt(100, 999); const b = randInt(0, a);
      if (countBorrowsSub(a,b) === 0) results.push({ formula: `${a} - ${b}`, answer: a - b });
    } else if (rank === 8) {
      const a = randInt(100, 999); const b = randInt(0, a);
      if (countBorrowsSub(a,b) === 1) results.push({ formula: `${a} - ${b}`, answer: a - b });
    } else if (rank === 9) {
      const a = randInt(100, 999); const b = randInt(0, a);
      if (countBorrowsSub(a,b) >= 2) results.push({ formula: `${a} - ${b}`, answer: a - b });
    } else if (rank === 10) {
      const a = randInt(1000, 9999); const b = randInt(0, a);
      if (countBorrowsSub(a,b) === 0) results.push({ formula: `${a} - ${b}`, answer: a - b });
    } else if (rank === 11) {
      const a = randInt(1000, 9999); const b = randInt(0, a);
      if (countBorrowsSub(a,b) >= 1) results.push({ formula: `${a} - ${b}`, answer: a - b });
    } else if (rank === 12) {
      // chains a - b - c with result >= 0
      const a = randInt(50, 999); const b = randInt(0, Math.floor(a/2)); const c = randInt(0, a - b);
      const ans = a - b - c; if (ans >= 0) results.push({ formula: `${a} - ${b} - ${c}`, answer: ans });
    } else if (rank === 13) {
      // chains a - b - c - d with result >= 0
      const a = randInt(100, 9999);
      const b = randInt(0, Math.floor(a/3));
      const c = randInt(0, Math.floor((a-b)/2));
      const d = randInt(0, a - b - c);
      const ans = a - b - c - d; if (ans >= 0) results.push({ formula: `${a} - ${b} - ${c} - ${d}`, answer: ans });
    } else {
      break;
    }
  }
  return results;
}


