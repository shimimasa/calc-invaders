// src/core/questionBank.js
import { generate as genAdd } from './generators/addition.js';
import { generate as genSub } from './generators/subtraction.js';
import { generate as genMul } from './generators/multiplication.js';
import { generate as genDiv } from './generators/division.js';

export function loadStage(stageJson){
  const { operation, rank, enemySet = {}, preGenerated } = stageJson;

  // 安全なデフォルト
  const rows = Number.isFinite(enemySet.rows) ? enemySet.rows : 2;
  const cols = Number.isFinite(enemySet.cols) ? enemySet.cols : 5;
  let need = rows * cols;
  if (!Number.isFinite(need) || need <= 0) need = 10;

  if (Array.isArray(preGenerated) && preGenerated.length >= need) {
    return preGenerated.slice(0, need);
  }

  switch (operation) {
    case 'addition':       return genAdd(rank, need);
    case 'subtraction':    return genSub(rank, need);
    case 'multiplication': return genMul(rank, need);
    case 'division':       return genDiv(rank, need);
    default: throw new Error('Unknown operation: ' + operation);
  }
}

