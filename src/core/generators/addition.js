// src/core/generators/addition.js
import { randInt, hasCarry } from "../../utils/random.js";

/**
 * HEART（加算ジェネレーター）
 * - rank 1〜13に対応
 * - キャリー条件・桁範囲を厳密化
 */
export function generate(rank, count = 10) {
  const results = [];
  let guard = 0;

  while (results.length < count && guard < count * 1000) {
    guard++;

    // ---- 多項加算ランク（12/13） ----
    if (rank === 12 || rank === 13) {
      const n = rank === 12 ? 3 : 4;
      const terms = [];
      for (let i = 0; i < n; i++) terms.push(randInt(10, 99));
      const sum = terms.reduce((a, b) => a + b, 0);
      results.push({ formula: terms.join(" + "), answer: sum });
      continue;
    }

    // ---- ❤️5：二桁 tens carry only（特別処理）----
    // 一の位ノーキャリー & 十の位キャリー（合計は3桁）
    if (rank === 5) {
      const a = randInt(10, 99);
      const b = randInt(10, 99);
      const onesNoCarry = (a % 10) + (b % 10) < 10;
      const tensCarry =
        Math.floor(a / 10) + Math.floor(b / 10) >= 10; // 十の位での繰上り
      if (!onesNoCarry || !tensCarry) continue;

      const sum = a + b; // 100〜198 のはず
      // 念のため合計が3桁かチェック
      if (String(sum).length !== 3) continue;

      results.push({ formula: `${a} + ${b}`, answer: sum });
      continue;
    }

    // ---- 通常ランク ----
    const p = getRankParams(rank);
    const a = randInt(p.aMin, p.aMax);
    const b = randInt(p.bMin, p.bMax);
    const sum = a + b;

    // 桁数制約（no-carry系は合計桁オーバーを除外）
    if (p.sumDigitsMax && String(sum).length > p.sumDigitsMax) continue;

    // キャリー条件
    const carry = hasCarry(a, b);
    if (p.carryRule === "none" && carry) continue;
    if (p.carryRule === "must" && !carry) continue;

    results.push({ formula: `${a} + ${b}`, answer: sum });
  }

  // 念のための補完
  while (results.length < count && results.length > 0) {
    results.push(results[results.length - 1]);
  }
  return results;
}

/**
 * rankごとの桁範囲・キャリールールを返す
 * sumDigitsMax: 合計がこれを超えたらNG（no-carry系）
 * carryRule: 'none' | 'must' | 'any'
 */
function getRankParams(rank) {
  switch (true) {
    // ❤️1: 一桁＋一桁、繰上がりなし
    case rank === 1:
      return { aMin: 1, aMax: 8, bMin: 1, bMax: 8, sumDigitsMax: 1, carryRule: "none" };

    // ❤️2: 一桁＋一桁、繰上がりあり
    case rank === 2:
      return { aMin: 1, aMax: 9, bMin: 1, bMax: 9, sumDigitsMax: 2, carryRule: "must" };

    // ❤️3: 二桁＋二桁、繰上がりなし（合計は二桁のまま）
    case rank === 3:
      return { aMin: 10, aMax: 99, bMin: 10, bMax: 99, sumDigitsMax: 2, carryRule: "none" };

    // ❤️4: 二桁＋二桁、1桁目のみキャリー可（合計は3桁許容）
    case rank === 4:
      return { aMin: 10, aMax: 99, bMin: 10, bMax: 99, sumDigitsMax: 3, carryRule: "must" };

    // ❤️5 は上で特別処理（tens carry only）

    // ❤️6: 二桁＋二桁、キャリー自由（合計3桁許容）
    case rank === 6:
      return { aMin: 10, aMax: 99, bMin: 10, bMax: 99, sumDigitsMax: 3, carryRule: "any" };

    // ❤️7: 三桁＋三桁、繰上がりなし（合計は三桁のまま）
    case rank === 7:
      return { aMin: 100, aMax: 999, bMin: 100, bMax: 999, sumDigitsMax: 3, carryRule: "none" };

    // ❤️8: 三桁＋三桁、キャリーあり（合計4桁許容）
    case rank === 8:
      return { aMin: 100, aMax: 999, bMin: 100, bMax: 999, sumDigitsMax: 4, carryRule: "must" };

    // ❤️9: 三桁＋三桁、キャリー自由（合計4桁許容）
    case rank === 9:
      return { aMin: 100, aMax: 999, bMin: 100, bMax: 999, sumDigitsMax: 4, carryRule: "any" };

    // ❤️10: 四桁＋四桁、繰上がりなし（合計は四桁のまま）
    case rank === 10:
      return { aMin: 1000, aMax: 9999, bMin: 1000, bMax: 9999, sumDigitsMax: 4, carryRule: "none" };

    // ❤️11: 四桁＋四桁、キャリーあり（合計5桁禁止、4桁内で carry must）
    case rank === 11:
      return { aMin: 1000, aMax: 9999, bMin: 1000, bMax: 9999, sumDigitsMax: 4, carryRule: "must" };

    // ❤️12/13 は多項加算なのでここは通らない
    default:
      // デフォルトは安全側
      return { aMin: 1, aMax: 9, bMin: 1, bMax: 9, sumDigitsMax: 2, carryRule: "any" };
  }
}
