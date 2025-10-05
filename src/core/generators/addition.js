import { randInt, countCarriesAdd, genTwoDigitNoCarry, genTwoDigitOnesCarryOnly, genTwoDigitTensCarryOnly, genTwoDigitDoubleCarry, digitCount, toDigitsLE, fromDigitsLE } from "../../utils/random.js";

function buildNoCarry(width){
  const aDigits = new Array(width).fill(0);
  const bDigits = new Array(width).fill(0);
  for (let pos=0; pos<width; pos++){
    const aMax = pos === width-1 ? 9 : 9; // allow 0 at lower positions
    const aMin = pos === width-1 ? 1 : 0;
    const a = randInt(aMin, aMax);
    const b = randInt(0, 9 - a);
    aDigits[pos] = a; bDigits[pos] = b;
  }
  return [fromDigitsLE(aDigits), fromDigitsLE(bDigits)];
}

function buildSingleCarry3(){
  // choose carry location 0..2 (0:ones,1:tens,2:hundreds)
  const k = randInt(0,2);
  const a = [0,0,0], b = [0,0,0];
  if (k===0){
    // ones carry, tens safe with +1, hundreds safe
    const o = randInt(1,9); a[0]=o; b[0]=randInt(10-o,9);
    const t = randInt(0,8); a[1]=t; b[1]=randInt(0,8-t); // +1 still ≤9
    const h = randInt(1,9); a[2]=h; b[2]=randInt(0,9-h);
  } else if (k===1){
    // tens carry, ones no carry, hundreds safe with +1
    const o = randInt(0,9); a[0]=o; b[0]=randInt(0,9-o);
    const t = randInt(1,9); a[1]=t; b[1]=randInt(10-t,9);
    const h = randInt(1,8); a[2]=h; b[2]=randInt(0,8-h); // +1 ≤9
  } else {
    // hundreds carry, others no carry
    const o = randInt(0,9); a[0]=o; b[0]=randInt(0,9-o);
    const t = randInt(0,9); a[1]=t; b[1]=randInt(0,9-t);
    const h = randInt(1,9); a[2]=h; b[2]=randInt(10-h,9);
  }
  return [fromDigitsLE(a), fromDigitsLE(b)];
}

function buildMultiCarry3(){
  // ensure carries in at least two positions (ones and tens)
  const a = [0,0,0], b = [0,0,0];
  const o = randInt(1,9); a[0]=o; b[0]=randInt(10-o,9); // ones carry
  const t = randInt(1,9); a[1]=t; b[1]=randInt(Math.max(10 - (t+1), 0), 9); // tens with +1 carry
  const h = randInt(1,9);
  // choose maybe third carry or not
  const wantThird = Math.random() < 0.5;
  a[2]=h; b[2]= wantThird ? randInt(10-h-1<0?0:10-h-1, 9) : randInt(0,Math.max(9-(h+1),0));
  return [fromDigitsLE(a), fromDigitsLE(b)];
}

function buildNoCarryN(width){
  const a = new Array(width).fill(0), b = new Array(width).fill(0);
  for (let i=0;i<width;i++){
    const aMin = i===width-1 ? 1 : 0;
    const av = randInt(aMin, 9);
    const bv = randInt(0, 9 - av);
    a[i]=av; b[i]=bv;
  }
  return [fromDigitsLE(a), fromDigitsLE(b)];
}

function buildAtLeastOneCarryN(width){
  // ensure at least one carry; easiest: ones carry but no subsequent carry
  if (width===2) return genTwoDigitOnesCarryOnly();
  const a = new Array(width).fill(0), b = new Array(width).fill(0);
  // ones carry
  const o = randInt(1,9); a[0]=o; b[0]=randInt(10-o,9);
  // tens no carry even with +1
  const tMax = 8; const at = randInt(0,tMax); const bt = randInt(0, tMax - at);
  a[1]=at; b[1]=bt;
  for (let i=2;i<width;i++){
    const av = randInt(i===width-1?1:0, 9);
    const bv = randInt(0, 9 - av);
    a[i]=av; b[i]=bv;
  }
  return [fromDigitsLE(a), fromDigitsLE(b)];
}

function sumFormula(nums){ return nums.join(" + "); }

export function generate(rank, count) {
  const results = [];
  while (results.length < count) {
    if (rank === 1) {
      const a = randInt(1, 9), b = randInt(1, 9);
      if (a + b <= 9) results.push({ formula: `${a} + ${b}`, answer: a + b });
    } else if (rank === 2) {
      const a = randInt(1, 9), b = randInt(1, 9);
      if (a + b >= 10) results.push({ formula: `${a} + ${b}`, answer: a + b });
    } else if (rank === 3) {
      const [a,b] = genTwoDigitNoCarry();
      results.push({ formula: `${a} + ${b}`, answer: a + b });
    } else if (rank === 4) {
      const [a,b] = genTwoDigitOnesCarryOnly();
      results.push({ formula: `${a} + ${b}`, answer: a + b });
    } else if (rank === 5) {
      const [a,b] = genTwoDigitTensCarryOnly();
      results.push({ formula: `${a} + ${b}`, answer: a + b });
    } else if (rank === 6) {
      const [a,b] = genTwoDigitDoubleCarry();
      results.push({ formula: `${a} + ${b}`, answer: a + b });
    } else if (rank === 7) {
      const [a,b] = buildNoCarryN(3);
      results.push({ formula: `${a} + ${b}`, answer: a + b });
    } else if (rank === 8) {
      const [a,b] = buildSingleCarry3();
      if (countCarriesAdd([a,b]) === 1) results.push({ formula: `${a} + ${b}`, answer: a + b });
    } else if (rank === 9) {
      const [a,b] = buildMultiCarry3();
      if (countCarriesAdd([a,b]) >= 2) results.push({ formula: `${a} + ${b}`, answer: a + b });
    } else if (rank === 10) {
      const [a,b] = buildNoCarryN(4);
      results.push({ formula: `${a} + ${b}`, answer: a + b });
    } else if (rank === 11) {
      const [a,b] = buildAtLeastOneCarryN(4);
      results.push({ formula: `${a} + ${b}`, answer: a + b });
    } else if (rank === 12) {
      const a = randInt(10,99), b = randInt(10,99), c = randInt(10,99);
      results.push({ formula: sumFormula([a,b,c]), answer: a+b+c });
    } else if (rank === 13) {
      const a = randInt(10,99), b = randInt(10,99), c = randInt(10,99), d = randInt(10,99);
      results.push({ formula: sumFormula([a,b,c,d]), answer: a+b+c+d });
    } else {
      break;
    }
  }
  return results;
}


