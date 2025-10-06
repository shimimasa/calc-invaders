import { getIncorrectFormulas } from './gameState.js';

// 文字列の式 "A + B" / "A - B" / "A × B" / "A ÷ B" を preGenerated へ復元
function parseFormulaToQA(str){
  const m = String(str).match(/\s*(\d+)\s*([+\-×x*÷\/])\s*(\d+)\s*/);
  if (!m) return null;
  const a = Number(m[1]); const op = m[2]; const b = Number(m[3]);
  if (op === '+') return { formula: `${a} + ${b}`, answer: a + b };
  if (op === '-') return { formula: `${a} - ${b}`, answer: a - b };
  if (op === '×' || op === 'x' || op === '*') return { formula: `${a} × ${b}`, answer: a * b };
  if (op === '÷' || op === '/'){
    const q = Math.floor(a / b); const r = a % b;
    const base = { formula: `${a} ÷ ${b}`, answer: q };
    return r ? { ...base, remainder: r } : base;
  }
  return null;
}

export function buildReviewStage({ stageId = 'review', rows = 2, cols = 5 } = {}){
  const list = getIncorrectFormulas();
  const preGenerated = list.map(parseFormulaToQA).filter(Boolean);
  return {
    stageId,
    operation: 'mixed',
    rank: 0,
    enemySet: { rows, cols },
    preGenerated,
    shuffle: false
  };
}


