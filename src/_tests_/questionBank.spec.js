import { describe, test, expect, vi, beforeEach } from "vitest";
import { loadStage } from "../core/questionBank.js";
import { preGenerate } from "../core/questionBank.js";

function makeStage({
  stageId = "tmp_1",
  operation = "addition",
  rank = 3,
  rows = 2,
  cols = 5,
  preGenerated = [],
  shuffle = false,
  extraConstraints = {}
} = {}){
  return {
    stageId,
    operation,
    rank,
    enemySet: { rows, cols },
    generator: { constraints: { ...extraConstraints } },
    preGenerated,
    shuffle
  };
}

describe("questionBank - cache & precedence & warnings", () => {
  beforeEach(() => {
    // reset console warn spy each test
    vi.restoreAllMocks();
  });

  test("キャッシュ: 同一stage内で同じ長さ・構造（参照同一性までは要求しない）", () => {
    const stage = makeStage({ stageId: "cache_1", operation: "addition", rank: 3, rows: 2, cols: 5 });
    const a = loadStage(stage);
    const b = loadStage(stage); // 直後の再読込でキャッシュ利用
    expect(Array.isArray(a)).toBe(true);
    expect(Array.isArray(b)).toBe(true);
    expect(a.length).toBe(stage.enemySet.rows * stage.enemySet.cols);
    expect(b.length).toBe(stage.enemySet.rows * stage.enemySet.cols);
    // 構造: formulaとanswerを持つ
    expect(a[0]).toHaveProperty("formula");
    expect(a[0]).toHaveProperty("answer");
    expect(b[0]).toHaveProperty("formula");
    expect(b[0]).toHaveProperty("answer");
  });

  test("preGenerated が最優先で使われる", () => {
    const pre = Array.from({ length: 10 }, (_, i) => ({ formula: `1+${i}`, answer: 1 + i }));
    const stage = makeStage({ stageId: "pre_1", preGenerated: pre, rows: 2, cols: 5 });
    const qs = loadStage(stage);
    expect(qs).toHaveLength(10);
    expect(qs[0].formula).toBe("1+0");
    expect(qs[0].answer).toBe(1);
  });

  test("未知のconstraintキーは1度だけwarnされる", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const stage = makeStage({ stageId: "warn_1", extraConstraints: { aDigits: 2, unknownX: true } });
    loadStage(stage);
    loadStage(stage); // 二度目以降は同じキーでwarnしない
    const msgs = spy.mock.calls.map(args => String(args[0]));
    const count = msgs.filter(m => m.includes("Unknown constraint key: unknownX")).length;
    expect(count).toBe(1);
  });

  test("未使用constraintキーは warn される（operation別）", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const stage = makeStage({ stageId: "warn_unused", operation: "addition", extraConstraints: { qRange: [1,9] } });
    loadStage(stage);
    const msgs = spy.mock.calls.map(args => String(args[0])).join("\n");
    expect(msgs).toMatch(/Unused constraint key for addition: qRange/);
  });

  test("shuffle=true なら順序が変わり得る（長さは等しい）", () => {
    const stageBase = makeStage({ stageId: "shuffle_1", rows: 2, cols: 5 });
    const first = loadStage(stageBase);
    const shuffled = loadStage({ ...stageBase, shuffle: true });
    expect(shuffled).toHaveLength(first.length);
    // 順序が変わる可能性を緩く検証（全一致でないことを許容）
    const sameOrder = first.every((q, i) => q.formula === shuffled[i].formula && q.answer === shuffled[i].answer);
    // ほとんどのケースでfalseになるが、乱数で稀にtrueになることも許容
    // ここでは配列自体が新規インスタンスであることだけは保障
    expect(shuffled).not.toBe(first);
  });
});

describe("questionBank - constraints passthrough (division allowRemainder)", () => {
  test("allowRemainder:true で余り>0の問題が出る（rank 5/7/9/11/13 は余りありランク）", () => {
    const ranks = [5,7,9,11,13];
    for (const r of ranks){
      const stage = makeStage({ stageId: `div_rem_${r}`, operation: "division", rank: r, rows: 2, cols: 5, extraConstraints: { allowRemainder: true } });
      const qs = loadStage(stage);
      expect(qs.length).toBe(stage.enemySet.rows * stage.enemySet.cols);
      // 余り>0 の問題が少なくとも1つ含まれる（ジェネレーター全体は任意分布のため緩く検証）
      const someHasRemainder = qs.some(q => typeof q.remainder === 'number' && q.remainder > 0);
      expect(someHasRemainder).toBe(true);
    }
  });
});

describe("questionBank - sliding window uniqueness", () => {
  test("recent window reduces duplicates (heuristic)", () => {
    const stage = makeStage({ stageId: "uniq_1", operation: "addition", rank: 6, rows: 10, cols: 5 }); // 50問
    const qs = preGenerate(stage);
    const seen = new Set();
    let dup = 0;
    for (const q of qs){
      const key = q.formula;
      if (seen.has(key)) dup += 1;
      seen.add(key);
    }
    // ランダム性があるため緩い上限（全50中、重複は < 5 を期待）
    expect(dup).toBeLessThan(5);
  });
});


