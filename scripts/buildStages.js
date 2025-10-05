import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const OUT_DIR = join("public", "data", "stages");

function pad2(n) { return String(n).padStart(2, "0"); }

function baseStage(stageId, mark, operation, rank, generator) {
  return {
    stageId,
    mark,
    operation,
    rank,
    deckLabel: `${mark.toUpperCase()} ${pad2(rank)}`,
    targetGrade: mark === "heart" || mark === "spade" ? "lower" : "middle",
    enemySet: { rows: 2, cols: 5, spawnIntervalSec: 2.6, descendSpeed: 1.1 },
    rules: { timeLimitSec: 60, lives: 3, scorePerHit: 100, comboBonus: true },
    generator,
    preGenerated: []
  };
}

function buildAll() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  const stages = [];

  // HEART (addition)
  stages.push(baseStage("heart_01", "heart", "addition", 1, {
    pattern: "1桁+1桁",
    constraints: { minA: 1, maxA: 8, minB: 1, maxB: 8, noCarry: true }
  }));
  stages.push(baseStage("heart_02", "heart", "addition", 2, {
    pattern: "1桁+1桁",
    constraints: { minA: 5, maxA: 9, minB: 5, maxB: 9, forceCarry: true }
  }));
  stages.push(baseStage("heart_03", "heart", "addition", 3, {
    pattern: "2桁+1桁",
    constraints: { minA: 10, maxA: 99, minB: 1, maxB: 9, noCarry: true }
  }));

  // SPADE (subtraction)
  stages.push(baseStage("spade_01", "spade", "subtraction", 1, {
    pattern: "1桁-1桁",
    constraints: { aRange: [1, 9], bLeA: true, noBorrow: true }
  }));
  stages.push(baseStage("spade_02", "spade", "subtraction", 2, {
    pattern: "1桁-1桁",
    constraints: { minA: 10, maxA: 18, minB: 1, maxB: 9, forceBorrow: true }
  }));
  stages.push(baseStage("spade_03", "spade", "subtraction", 3, {
    pattern: "2桁-1桁",
    constraints: { minA: 10, maxA: 99, minB: 0, maxB: 9, noBorrow: true, bLeOnes: true }
  }));

  // CLUB (multiplication)
  stages.push(baseStage("club_01", "club", "multiplication", 1, {
    pattern: "九九 1-3段",
    constraints: { aRange: [1, 3], bRange: [1, 9] }
  }));
  stages.push(baseStage("club_02", "club", "multiplication", 2, {
    pattern: "九九 4-6段",
    constraints: { aRange: [4, 6], bRange: [1, 9] }
  }));
  stages.push(baseStage("club_03", "club", "multiplication", 3, {
    pattern: "九九 7-9段",
    constraints: { aRange: [7, 9], bRange: [1, 9] }
  }));

  // DIAMOND (division)
  stages.push(baseStage("diamond_01", "diamond", "division", 1, {
    pattern: "九九逆算 余りなし",
    constraints: { divisibleOnly: true, bRange: [2, 9] }
  }));
  stages.push(baseStage("diamond_02", "diamond", "division", 2, {
    pattern: "九九範囲 余りあり",
    constraints: { allowRemainder: true, aRange: [10, 99], bRange: [2, 9] }
  }));
  stages.push(baseStage("diamond_03", "diamond", "division", 3, {
    pattern: "2桁÷1桁 余りなし",
    constraints: { divisibleOnly: true, aRange: [10, 99], bRange: [2, 9] }
  }));

  for (const s of stages) {
    const file = join(OUT_DIR, `${s.stageId}.json`);
    writeFileSync(file, JSON.stringify(s, null, 2), "utf-8");
  }
}

buildAll();


