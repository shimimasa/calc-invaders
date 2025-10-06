// scripts/buildStages.js
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const REPO_ROOT  = path.resolve(__dirname, "..");
const OUT_DIR    = path.join(REPO_ROOT, "public", "data", "stages");

// ---- safety: log & watchdog ----
const start = Date.now();
console.log("[prebuild] start");
console.log("[prebuild] node:", process.version);
console.log("[prebuild] cwd:", process.cwd());
console.log("[prebuild] __dirname:", __dirname);
console.log("[prebuild] OUT_DIR:", OUT_DIR);

// 90秒経っても終わらなければ強制終了してログを出す
const watchdog = setTimeout(() => {
  console.error("[prebuild] TIMEOUT (90s) — something is blocking/hanging");
  process.exit(1);
}, 90_000);

// ---- helpers ----
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function pad2(n) { return String(n).padStart(2, "0"); }
function symbolForMark(mark){ return mark === "heart" ? "♡" : mark === "spade" ? "♠" : mark === "club" ? "♣" : "♦"; }
function operationForMark(mark){ return mark === "heart" ? "addition" : mark === "spade" ? "subtraction" : mark === "club" ? "multiplication" : "division"; }
function grade(mark, rank){ return (rank <= 6) ? ((mark === "heart" || mark === "spade") ? "lower" : "middle") : "upper"; }

function enemySetFor(rank){
  return { rows: 2, cols: 5, spawnIntervalSec: clamp(2.8 - rank*0.1, 1.2, 3.0), descendSpeed: 1.0 + rank*0.08 };
}
function rulesFor(rank){
  return { timeLimitSec: 60 + rank*3, lives: 3, scorePerHit: 100 + 5*rank, comboBonus: true };
}

function additionConstraints(rank){
  if (rank === 1) return { pattern: "1桁+1桁", constraints: { aDigits: 1, bDigits: 1, minA:1, maxA:9, minB:1, maxB:9, noCarry: true } };
  if (rank === 2) return { pattern: "1桁+1桁", constraints: { aDigits: 1, bDigits: 1, minA:1, maxA:9, minB:1, maxB:9, forceCarry: true } };
  if (rank === 3) return { pattern: "2桁+2桁", constraints: { aDigits: 2, bDigits: 2, noCarry: true } };
  if (rank === 4) return { pattern: "2桁+2桁 (1の位のみ繰上)", constraints: { aDigits: 2, bDigits: 2, forceCarry: true, carryPositions: ["ones"], tensNoCarryWithIncoming: true } };
  if (rank === 5) return { pattern: "2桁+2桁 (10の位のみ繰上)", constraints: { aDigits: 2, bDigits: 2, forceCarry: true, carryPositions: ["tens"], onesNoCarry: true } };
  if (rank === 6) return { pattern: "2桁+2桁 (二段の繰上)", constraints: { aDigits: 2, bDigits: 2, forceCarry: true, minCarryCount: 2 } };
  if (rank === 7) return { pattern: "3桁+3桁 (繰上なし)", constraints: { aDigits: 3, bDigits: 3, noCarry: true } };
  if (rank === 8) return { pattern: "3桁+3桁 (単一繰上)", constraints: { aDigits: 3, bDigits: 3, forceCarry: true, maxCarryCount: 1 } };
  if (rank === 9) return { pattern: "3桁+3桁 (複数繰上)", constraints: { aDigits: 3, bDigits: 3, forceCarry: true, minCarryCount: 2 } };
  if (rank === 10) return { pattern: "4桁+4桁 (繰上なし)", constraints: { aDigits: 4, bDigits: 4, noCarry: true } };
  if (rank === 11) return { pattern: "4桁+4桁 (繰上あり)", constraints: { aDigits: 4, bDigits: 4, forceCarry: true } };
  if (rank === 12) return { pattern: "三項加算", constraints: { operands: 3, aDigits: 2 } };
  if (rank === 13) return { pattern: "四項加算", constraints: { operands: 4, aDigits: 2 } };
}

function subtractionConstraints(rank){
  if (rank === 1) return { pattern: "1桁-1桁 (借位なし)", constraints: { aDigits:1, bDigits:1, noBorrow: true } };
  if (rank === 2) return { pattern: "二桁-一桁 (借位必須・1の位)", constraints: { aDigits:2, bDigits:1, forceBorrow: true, borrowPositions:["ones"] } };
  if (rank === 3) return { pattern: "2桁-2桁 (借位なし)", constraints: { aDigits:2, bDigits:2, noBorrow: true } };
  if (rank === 4) return { pattern: "2桁-2桁 (1の位のみ借位)", constraints: { aDigits:2, bDigits:2, forceBorrow: true, borrowPositions:["ones"] } };
  if (rank === 5) return { pattern: "2桁-2桁 (10の位のみ借位)", constraints: { aDigits:2, bDigits:2, forceBorrow: true, borrowPositions:["tens"], onesNoBorrow:true } };
  if (rank === 6) return { pattern: "2桁-2桁 (二段の借位)", constraints: { aDigits:2, bDigits:2, forceBorrow: true, minBorrowCount: 2 } };
  if (rank === 7) return { pattern: "3桁-3桁 (借位なし)", constraints: { aDigits:3, bDigits:3, noBorrow: true } };
  if (rank === 8) return { pattern: "3桁-3桁 (単一借位)", constraints: { aDigits:3, bDigits:3, forceBorrow: true, maxBorrowCount:1 } };
  if (rank === 9) return { pattern: "3桁-3桁 (複数借位)", constraints: { aDigits:3, bDigits:3, forceBorrow: true, minBorrowCount:2 } };
  if (rank === 10) return { pattern: "4桁-4桁 (借位なし)", constraints: { aDigits:4, bDigits:4, noBorrow: true } };
  if (rank === 11) return { pattern: "4桁-4桁 (借位あり)", constraints: { aDigits:4, bDigits:4, forceBorrow: true } };
  if (rank === 12) return { pattern: "減算チェーン (3項)", constraints: { chain: true, operands: 3, resultNonNegative: true } };
  if (rank === 13) return { pattern: "減算チェーン (4項)", constraints: { chain: true, operands: 4, resultNonNegative: true } };
}

function multiplicationConstraints(rank){
  if (rank === 1) return { pattern: "九九 1-3段", constraints: { aRange:[1,3], bRange:[1,9] } };
  if (rank === 2) return { pattern: "九九 4-6段", constraints: { aRange:[4,6], bRange:[1,9] } };
  if (rank === 3) return { pattern: "九九 7-9段", constraints: { aRange:[7,9], bRange:[1,9] } };
  if (rank === 4) return { pattern: "2桁×1桁", constraints: { aRange:[10,19], bRange:[1,9] } };
  if (rank === 5) return { pattern: "2桁×1桁", constraints: { aRange:[20,49], bRange:[1,9] } };
  if (rank === 6) return { pattern: "2桁×1桁", constraints: { aRange:[50,99], bRange:[1,9] } };
  if (rank === 7) return { pattern: "2桁×2桁 (small)", constraints: { aRange:[10,19], bRange:[10,19] } };
  if (rank === 8) return { pattern: "2桁×2桁 (medium)", constraints: { aRange:[10,49], bRange:[10,49] } };
  if (rank === 9) return { pattern: "2桁×2桁 (large)", constraints: { aRange:[10,99], bRange:[10,99] } };
  if (rank === 10) return { pattern: "3桁×1桁", constraints: { aRange:[100,999], bRange:[1,9] } };
  if (rank === 11) return { pattern: "3桁×2桁", constraints: { aRange:[100,999], bRange:[10,99] } };
  if (rank === 12) return { pattern: "乗算チェーン (3項)", constraints: { operands:3, maxResult:10000 } };
  if (rank === 13) return { pattern: "乗算チェーン (4項)", constraints: { operands:4, maxResult:20000 } };
}

function divisionConstraints(rank){
  if (rank === 1) return { pattern: "表逆算 1-3", constraints: { bRange:[1,3], qRange:[1,9], divisibleOnly: true } };
  if (rank === 2) return { pattern: "表逆算 4-6", constraints: { bRange:[4,6], qRange:[1,9], divisibleOnly: true } };
  if (rank === 3) return { pattern: "表逆算 7-9", constraints: { bRange:[7,9], qRange:[1,9], divisibleOnly: true } };
  if (rank === 4) return { pattern: "2桁÷1桁 (余りなし)", constraints: { aDigits:2, bDigits:1, divisibleOnly: true } };
  if (rank === 5) return { pattern: "2桁÷1桁 (余りあり)", constraints: { aDigits:2, bDigits:1, allowRemainder: true } };
  if (rank === 6) return { pattern: "3桁÷1桁 (余りなし)", constraints: { aDigits:3, bDigits:1, divisibleOnly: true } };
  if (rank === 7) return { pattern: "3桁÷1桁 (余りあり)", constraints: { aDigits:3, bDigits:1, allowRemainder: true } };
  if (rank === 8) return { pattern: "2桁÷2桁 (余りなし)", constraints: { aDigits:2, bDigits:2, divisibleOnly: true } };
  if (rank === 9) return { pattern: "2桁÷2桁 (余りあり)", constraints: { aDigits:2, bDigits:2, allowRemainder: true } };
  if (rank === 10) return { pattern: "3桁÷2桁 (余りなし)", constraints: { aDigits:3, bDigits:2, divisibleOnly: true } };
  if (rank === 11) return { pattern: "3桁÷2桁 (余りあり)", constraints: { aDigits:3, bDigits:2, allowRemainder: true } };
  if (rank === 12) return { pattern: "4桁÷2桁 (余りなし)", constraints: { aDigits:4, bDigits:2, divisibleOnly: true } };
  if (rank === 13) return { pattern: "4桁÷2桁 (余りあり)", constraints: { aDigits:4, bDigits:2, allowRemainder: true } };
}

function constraintsFor(mark, rank){
  if (mark === "heart") return additionConstraints(rank);
  if (mark === "spade") return subtractionConstraints(rank);
  if (mark === "club") return multiplicationConstraints(rank);
  return divisionConstraints(rank);
}

// ---- main ----
async function main(){
  await fs.mkdir(OUT_DIR, { recursive: true });
  console.log("[prebuild] mkdir OUT_DIR done");

  const marks = ["heart","spade","club","diamond"];
  const stages = [];

  for (const mark of marks){
    for (let rank=1; rank<=13; rank++){
      const id = `${mark}_${pad2(rank)}`;
      const { pattern, constraints } = constraintsFor(mark, rank);
      if (!pattern || !constraints) throw new Error(`constraintsFor returned empty for ${id}`);

      const stage = {
        stageId: id,
        mark,
        operation: operationForMark(mark),
        rank,
        deckLabel: `${symbolForMark(mark)}${rank}`,
        targetGrade: grade(mark, rank),
        enemySet: enemySetFor(rank),
        rules: rulesFor(rank),
        generator: { pattern, constraints },
        preGenerated: []
      };
      stages.push(stage);
    }
  }

  console.log("[prebuild] writing json files:", stages.length);
  let wrote = 0;
  await Promise.all(stages.map(async (s) => {
    const file = path.join(OUT_DIR, `${s.stageId}.json`);
    await fs.writeFile(file, JSON.stringify(s, null, 2), "utf-8");
    wrote++;
    if (wrote % 10 === 0) console.log(`[prebuild] progress ${wrote}/${stages.length}`);
  }));

  clearTimeout(watchdog);
  console.log("[prebuild] done in", (Date.now() - start), "ms ✅");
}

main().catch((err) => {
  clearTimeout(watchdog);
  console.error("[prebuild] ERROR:", err);
  process.exit(1);
});


