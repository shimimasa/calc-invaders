// src/core/questionBank.js
import { generate as genAdd } from './generators/addition.js';
import { generate as genSub } from './generators/subtraction.js';
import { generate as genMul } from './generators/multiplication.js';
import { generate as genDiv } from './generators/division.js';

// ---- In-memory cache (by stageId#count) ----
// 事前確定や再プレイの再生成を避けるため、直近の生成結果を保持
// キーは `${stageId}#${count}`。count が未指定（endless 等）の場合は `${stageId}#auto`
const stageCache = new Map(); // key -> { questions: Array }

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

function callGenerator(operation, rank, count, constraints){
  switch (operation) {
    case 'addition':       return genAdd(rank, count, constraints);
    case 'subtraction':    return genSub(rank, count, constraints);
    case 'multiplication': return genMul(rank, count, constraints);
    case 'division':       return genDiv(rank, count, constraints);
    default: throw new Error('Unknown operation: ' + operation);
  }
}

// 直近ウィンドウ重複回避付き pre-generate
export function preGenerate(stageJson, forcedCount){
  const { operation, rank, enemySet = {}, generator = {} } = stageJson || {};
  const constraints = generator?.constraints || {};
  const rows = Number.isFinite(enemySet.rows) ? enemySet.rows : 2;
  const cols = Number.isFinite(enemySet.cols) ? enemySet.cols : 5;

  let need = Number.isFinite(forcedCount) && forcedCount > 0
    ? forcedCount
    : (rows * cols);

  if (!Number.isFinite(need) || need <= 0) need = 10;

  const WINDOW_SIZE = 50;
  const MAX_ATTEMPTS = 20;
  const windowSet = new Set();
  const windowQueue = [];
  const out = [];

  while (out.length < need) {
    let accepted = null; let last = null;
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++){
      const cand = callGenerator(operation, rank, 1, constraints)[0];
      if (!cand) continue;
      last = cand;
      if (!windowSet.has(cand.formula)) { accepted = cand; break; }
    }
    accepted = accepted || last || callGenerator(operation, rank, 1, constraints)[0];
    if (!accepted) break;
    out.push(accepted);
    windowQueue.push(accepted.formula);
    windowSet.add(accepted.formula);
    if (windowQueue.length > WINDOW_SIZE){
      const old = windowQueue.shift();
      windowSet.delete(old);
    }
  }
  return out;
}

/**
 * ステージの問題を読み込む。count が指定されていれば、その数ちょうどを優先。
 * - preGenerated が十分あればそれを利用
 * - 事前に stageCache に入っていれば即返
 * - それ以外は生成してキャッシュ
 */
export function loadStage(stageJson, count){
  const { operation, rank, enemySet = {}, preGenerated, stageId, shuffle } = stageJson;
  const constraints = stageJson?.generator?.constraints || {};

  // 安全なデフォルト
  const rows = Number.isFinite(enemySet.rows) ? enemySet.rows : 2;
  const cols = Number.isFinite(enemySet.cols) ? enemySet.cols : 5;
  let need = Number.isFinite(count) && count > 0 ? count : rows * cols;
  if (!Number.isFinite(need) || need <= 0) need = 10;

  // 制約キー検証（未知キーは警告して継続）
  validateConstraints(stageJson);
  warnUnusedConstraintKeys(operation, constraints);

  const cacheKey = stageId ? `${stageId}#${Number.isFinite(count) && count > 0 ? need : 'auto'}` : null;

  // preGenerated 優先（count が来ていたら count 件ちょうどで切る）
  if (Array.isArray(preGenerated) && preGenerated.length >= need) {
    const sliced = preGenerated.slice(0, need);
    if (cacheKey) stageCache.set(cacheKey, { questions: sliced });
    return shuffle === true ? fisherYatesShuffleCopy(sliced) : sliced;
  }

  // キャッシュ命中
  if (cacheKey && stageCache.has(cacheKey)){
    const cached = stageCache.get(cacheKey).questions;
    return shuffle === true ? fisherYatesShuffleCopy(cached) : cached;
  }
  
  // 生成（重複抑制付き）
  const qs = preGenerate(stageJson, need);
  if (cacheKey) stageCache.set(cacheKey, { questions: qs });
  return shuffle === true ? fisherYatesShuffleCopy(qs) : qs;
}

/**
 * ステージIDと count を指定して事前確定しておく（UI 遷移前に呼ぶ）
 * - fetch して JSON を取得
 * - loadStage(json, count) を呼び、キャッシュへ確定保存
 */
export async function preloadStageById(stageId, count){
  const res = await fetch(`data/stages/${stageId}.json`);
  if (!res.ok) throw new Error(`stage not found: ${stageId}`);
  const json = await res.json();
  // stageId を JSON に確実に含める
  const withId = { ...json, stageId };
  // ここで生成＆キャッシュ。戻り値は使わなくてもOK
  loadStage(withId, count);
}
