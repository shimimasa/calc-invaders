// src/core/questionBank.js
import { generate as genAdd } from './generators/addition.js';
import { generate as genSub } from './generators/subtraction.js';
import { generate as genMul } from './generators/multiplication.js';
import { generate as genDiv } from './generators/division.js';

// ---- In-memory cache (by stageId) ----
// 再プレイでの再生成を避けるため、直近の生成結果を保持
const stageCache = new Map(); // stageId -> { questions: Array }

// 未知キーの警告はキーごとに1回のみ
const warnedConstraintKeys = new Set();
const warnedUnusedConstraintKeys = new Set(); // `${operation}:${key}` 単位で一度だけ警告

const KNOWN_CONSTRAINT_KEYS = new Set([
  // addition / subtraction digits and ranges
  'aDigits', 'bDigits', 'minA', 'maxA', 'minB', 'maxB',
  // carry / borrow flags
  'noCarry', 'forceCarry', 'noBorrow',
  // multiplication / division ranges
  'aRange', 'bRange', 'qRange',
  // division flag
  'divisibleOnly',
  // division remainder handling toggle
  'allowRemainder'
]);

function validateConstraints(stageJson){
  const constraints = stageJson?.generator?.constraints;
  if (!constraints || typeof constraints !== 'object') return;
  for (const k of Object.keys(constraints)){
    if (!KNOWN_CONSTRAINT_KEYS.has(k) && !warnedConstraintKeys.has(k)){
      warnedConstraintKeys.add(k);
      console.warn(`[questionBank] Unknown constraint key: ${k}`);
    }
  }
}

function warnUnusedConstraintKeys(operation, constraints){
  if (!constraints || typeof constraints !== 'object') return;
  const perOpAllowed = {
    addition: new Set(['aDigits','bDigits','minA','maxA','minB','maxB','noCarry','forceCarry']),
    subtraction: new Set(['aDigits','bDigits','minA','maxA','minB','maxB','noBorrow']),
    multiplication: new Set(['aRange','bRange']),
    division: new Set(['aRange','bRange','qRange','divisibleOnly','allowRemainder'])
  };
  const allowed = perOpAllowed[operation] || new Set();
  for (const k of Object.keys(constraints)){
    const key = `${operation}:${k}`;
    if (!allowed.has(k) && !warnedUnusedConstraintKeys.has(key)){
      warnedUnusedConstraintKeys.add(key);
      console.warn(`[questionBank] Unused constraint key for ${operation}: ${k}`);
    }
  }
}

function fisherYatesShuffleCopy(arr){
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = out[i]; out[i] = out[j]; out[j] = tmp;
  }
  return out;
}

export function loadStage(stageJson){
  const { operation, rank, enemySet = {}, preGenerated, stageId, shuffle } = stageJson;
  const constraints = stageJson?.generator?.constraints || {};

  // 安全なデフォルト
  const rows = Number.isFinite(enemySet.rows) ? enemySet.rows : 2;
  const cols = Number.isFinite(enemySet.cols) ? enemySet.cols : 5;
  let need = rows * cols;
  if (!Number.isFinite(need) || need <= 0) need = 10;

  // 制約キー検証（未知キーは警告して継続）
  validateConstraints(stageJson);
  warnUnusedConstraintKeys(operation, constraints);

  // preGenerated 優先
  if (Array.isArray(preGenerated) && preGenerated.length >= need) {
    const sliced = preGenerated.slice(0, need);
    if (stageId) stageCache.set(stageId, { questions: sliced });
    return shuffle === true ? fisherYatesShuffleCopy(sliced) : sliced;
  }

  // キャッシュ命中
  if (stageId && stageCache.has(stageId)){
    const cached = stageCache.get(stageId).questions;
    return shuffle === true ? fisherYatesShuffleCopy(cached) : cached;
  }

  switch (operation) {
    case 'addition':       {
      const qs = genAdd(rank, need, constraints);
      if (stageId) stageCache.set(stageId, { questions: qs });
      return shuffle === true ? fisherYatesShuffleCopy(qs) : qs;
    }
    case 'subtraction':    {
      const qs = genSub(rank, need, constraints);
      if (stageId) stageCache.set(stageId, { questions: qs });
      return shuffle === true ? fisherYatesShuffleCopy(qs) : qs;
    }
    case 'multiplication': {
      const qs = genMul(rank, need, constraints);
      if (stageId) stageCache.set(stageId, { questions: qs });
      return shuffle === true ? fisherYatesShuffleCopy(qs) : qs;
    }
    case 'division':       {
      const qs = genDiv(rank, need, constraints);
      if (stageId) stageCache.set(stageId, { questions: qs });
      return shuffle === true ? fisherYatesShuffleCopy(qs) : qs;
    }
    default: throw new Error('Unknown operation: ' + operation);
  }
}

