import { randInt } from "../../utils/random.js";

export function generate(rank, count) {
  const results = [];
  let tableMin = 1;
  let tableMax = 3;
  if (rank === 2) {
    tableMin = 4; tableMax = 6;
  } else if (rank === 3) {
    tableMin = 7; tableMax = 9;
  }

  while (results.length < count) {
    const a = randInt(tableMin, tableMax);
    const b = randInt(1, 9);
    results.push({ formula: `${a} × ${b}`, answer: a * b });
  }
  return results;
}


