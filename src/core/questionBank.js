import { generateAddition } from './generators/addition.js';
import { generateSubtraction } from './generators/subtraction.js';
import { generateMultiplication } from './generators/multiplication.js';
import { generateDivision } from './generators/division.js';

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
    case 'addition':       return generateAddition(rank, need);
    case 'subtraction':    return generateSubtraction(rank, need);
    case 'multiplication': return generateMultiplication(rank, need);
    case 'division':       return generateDivision(rank, need);
    default: throw new Error('Unknown operation: '+operation);
  }
}
