/**
 * [randInt]
 * min〜max の整数を一様ランダムに返します（両端含む）。
 */
export function randInt(min, max) { return Math.floor(Math.random()*(max-min+1))+min }
export function choice(arr) { return arr[Math.floor(Math.random()*arr.length)] }
/**
 * [hasCarry]
 * 1の位の繰上りが発生するかを判定します。
 * 例: 8+5 は (8%10)+(5%10)=13 ≥ 10 なので true。
 * Ranks 1–3 では 1〜2桁+1桁の想定で、1の位のみを評価します。
 */
export function hasCarry(a, b){
    const sa = String(a).split('').reverse();
    const sb = String(b).split('').reverse();
    const len = Math.max(sa.length, sb.length);
    for (let i = 0; i < len; i++){
      const da = (sa[i] ? sa[i].charCodeAt(0) - 48 : 0);
      const db = (sb[i] ? sb[i].charCodeAt(0) - 48 : 0);
      if (da + db >= 10) return true;
    }
    return false;
  }
/**
 * [hasBorrow]
 * 1の位で借位が必要かを判定します。
 * 例: 12-9 は (12%10)-(9%10)=3 なので false、8-9 は -1 < 0 なので true。
 * Ranks 1–3 では 1〜2桁−1桁の想定で、1の位のみを評価します。
 */
export function hasBorrow(a, b){
    return ((a % 10) - (b % 10)) < 0;
  }
/**
 * [isDivisible]
 * b が 0 でなく、a が b で割り切れるか（余り0か）を判定します。
 * 例: 18 ÷ 3 は true、19 ÷ 3 は false。
 */
export function isDivisible(a,b){ return b!==0 && a%b===0 }

// ---- Helpers for generators (multi-digit) ----
export function digitCount(n){ return Math.max(1, Math.floor(Math.log10(Math.max(1, Math.abs(n)))) + 1); }
export function toDigitsLE(n, width){
  const ds = [];
  let x = Math.abs(n);
  for (let i=0;i<width;i++){ ds.push(x%10); x = Math.floor(x/10); }
  return ds;
}
export function fromDigitsLE(ds){
  let v = 0, mul = 1;
  for (let i=0;i<ds.length;i++){ v += ds[i]*mul; mul *= 10; }
  return v;
}
export function countCarriesAdd(addends){
  let carry = 0, totalCarries = 0;
  const maxW = Math.max(...addends.map(digitCount));
  for (let pos=0; pos<maxW; pos++){
    let s = carry;
    for (const a of addends){ s += Math.floor(a/Math.pow(10,pos)) % 10; }
    if (s >= 10) { totalCarries += 1; carry = Math.floor(s/10); } else { carry = 0; }
  }
  return totalCarries;
}
export function countBorrowsSub(a,b){
  let borrow = 0, total = 0;
  const maxW = Math.max(digitCount(a), digitCount(b));
  for (let pos=0; pos<maxW; pos++){
    const da = Math.floor(a/Math.pow(10,pos)) % 10;
    const db = Math.floor(b/Math.pow(10,pos)) % 10;
    const top = da - borrow;
    if (top < db) { total += 1; borrow = 1; } else { borrow = 0; }
  }
  return total;
}
export function genTwoDigitNoCarry(){
  // returns [a,b] in 10..99 with no carries
  const aT = randInt(1,9); const bT = randInt(0, 9 - aT);
  const aO = randInt(0,9); const bO = randInt(0, 9 - aO);
  const a = aT*10 + aO; const b = bT*10 + bO;
  return [a,b];
}
export function genTwoDigitOnesCarryOnly(){
  // ones carry, tens no carry even with +1
  const aO = randInt(1,9); const bO = randInt(10 - aO, 9);
  const aT = randInt(1,8); // ensure room
  const bT = randInt(0, 8 - aT); // aT + bT + 1 <= 9 => bT <= 8 - aT
  const a = aT*10 + aO; const b = bT*10 + bO;
  return [a,b];
}
export function genTwoDigitTensCarryOnly(){
  // ones no carry, tens carry
  const aO = randInt(0,9); const bO = randInt(0, 9 - aO);
  const aT = randInt(1,9); const bT = randInt(10 - aT, 9);
  const a = aT*10 + aO; const b = bT*10 + bO;
  return [a,b];
}
export function genTwoDigitDoubleCarry(){
  // ones carry, tens carry considering +1
  const aO = randInt(1,9); const bO = randInt(10 - aO, 9);
  const aT = randInt(1,9); const bT = randInt(Math.max(0, 9 - aT), 9); // ensure aT + bT + 1 >= 10
  const a = aT*10 + aO; const b = bT*10 + bO;
  if ( ((aO+bO)>=10) && ((aT+bT+1)>=10) ) return [a,b];
  return genTwoDigitDoubleCarry();
}

