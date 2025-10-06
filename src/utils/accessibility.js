// Accessibility helpers

export function formulaToAriaLabel({ a, b, op }){
  const opWord = op === '+' ? 'plus' : op === '-' ? 'minus' : op === '×' || op === 'x' || op === '*' ? 'times' : op === '÷' || op === '/' ? 'divided by' : 'unknown';
  return `${a} ${opWord} ${b} equals`;
}

export function formulaStringToAriaLabel(formula){
  if (typeof formula !== 'string') return '';
  const m = formula.match(/\s*(\d+)\s*([+\-×x*÷\/])\s*(\d+)\s*/);
  if (!m) return `${String(formula)} equals`;
  return formulaToAriaLabel({ a: Number(m[1]), op: m[2], b: Number(m[3]) });
}


