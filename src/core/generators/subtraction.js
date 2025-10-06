import { randInt, countBorrowsSub, digitCount } from "../../utils/random.js";

// 借位の発生位置を下位桁から順に真偽で返す（例: [ones, tens, hundreds, ...]）
function borrowMaskByPlace(a, b) {
  const maxW = Math.max(digitCount(a), digitCount(b));
  let borrow = 0;
  const mask = [];
  for (let pos = 0; pos < maxW; pos++) {
    const da = Math.floor(a / Math.pow(10, pos)) % 10;
    const db = Math.floor(b / Math.pow(10, pos)) % 10;
    const top = da - borrow;
    if (top < db) { mask[pos] = true; borrow = 1; } else { mask[pos] = false; borrow = 0; }
  }
  return mask;
}

function pushResult(arr, operands) {
  const ans = operands.reduce((acc, v, i) => (i === 0 ? v : acc - v), 0);
  arr.push({ formula: operands.join(" - "), answer: ans, operands });
}

export function generateSubtraction(rank, constraints = {}) {
  const count = Number.isFinite(constraints.count) ? constraints.count : 10;
  const maxAttempts = Math.max(1000, count * 1000);
  const out = [];
  let attempts = 0;

  while (out.length < count && attempts < maxAttempts) {
    attempts++;

    if (rank === 1) {
      const a = randInt(1, 9); const b = randInt(0, a);
      if (countBorrowsSub(a, b) === 0) pushResult(out, [a, b]);
      continue;
    }

    if (rank === 2) {
      // 1桁借位相当（十からの借り）: 実現可能な範囲として 2桁-1桁で1回の借位
      const a = randInt(10, 18); const b = randInt(1, 9);
      const m = borrowMaskByPlace(a, b);
      if (a - b >= 0 && m[0] === true && (m[1] || false) === false) pushResult(out, [a, b]);
      continue;
    }

    if (rank === 3) {
      const a = randInt(10, 99); const b = randInt(0, a);
      if (countBorrowsSub(a, b) === 0) pushResult(out, [a, b]);
      continue;
    }

    if (rank === 4) {
      // 二桁・一の位のみ借り
      const a = randInt(10, 99); const b = randInt(10, 99);
      if (a < b) continue;
      const m = borrowMaskByPlace(a, b);
      if (m[0] === true && (m[1] || false) === false) pushResult(out, [a, b]);
      continue;
    }

    if (rank === 5) {
      // 十の位のみ借り（現実的には百から借りる必要があるため、3桁-2桁で実現）
      const a = randInt(100, 199); const b = randInt(10, 99);
      if (a < b) continue;
      const m = borrowMaskByPlace(a, b);
      if ((m[0] || false) === false && (m[1] || false) === true && (m.slice(2).some(Boolean) === false)) pushResult(out, [a, b]);
      continue;
    }

    if (rank === 6) {
      // 二重借り（1の位と10の位）: 3桁-2桁で安定生成
      const a = randInt(100, 299); const b = randInt(10, 99);
      if (a < b) continue;
      const m = borrowMaskByPlace(a, b);
      if ((m[0] || false) === true && (m[1] || false) === true) pushResult(out, [a, b]);
      continue;
    }

    if (rank === 7) {
      const a = randInt(100, 999); const b = randInt(0, a);
      if (countBorrowsSub(a, b) === 0) pushResult(out, [a, b]);
      continue;
    }

    if (rank === 8) {
      const a = randInt(100, 999); const b = randInt(0, a);
      if (countBorrowsSub(a, b) === 1) pushResult(out, [a, b]);
      continue;
    }

    if (rank === 9) {
      const a = randInt(100, 999); const b = randInt(0, a);
      if (countBorrowsSub(a, b) >= 2) pushResult(out, [a, b]);
      continue;
    }

    if (rank === 10) {
      const a = randInt(1000, 9999); const b = randInt(0, a);
      if (countBorrowsSub(a, b) === 0) pushResult(out, [a, b]);
      continue;
    }

    if (rank === 11) {
      const a = randInt(1000, 9999); const b = randInt(0, a);
      if (countBorrowsSub(a, b) >= 1) pushResult(out, [a, b]);
      continue;
    }

    if (rank === 12) {
      // a - b - c >= 0
      const a = randInt(50, 999);
      const b = randInt(0, Math.floor(a / 2));
      const c = randInt(0, a - b);
      const ans = a - b - c;
      if (ans >= 0) pushResult(out, [a, b, c]);
      continue;
    }

    if (rank === 13) {
      // a - b - c - d >= 0（安定化のため上限を抑制）
      const a = randInt(100, 9999);
      const b = randInt(0, Math.floor(a / 3));
      const c = randInt(0, Math.floor((a - b) / 2));
      const d = randInt(0, a - b - c);
      const ans = a - b - c - d;
      if (ans >= 0) pushResult(out, [a, b, c, d]);
      continue;
    }

    break;
  }

  // 不足分は最後の問題を複製して穴埋め（無限ループ回避のため）
  while (out.length < count && out.length > 0) out.push(out[out.length - 1]);
  return out;
}

// 既存の呼び出し互換（QuestionBank が利用）
export function generate(rank, count) {
  return generateSubtraction(rank, { count });
}

