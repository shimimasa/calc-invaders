// 入力正規化・検証ヘルパー

export function toHalfWidthDigits(str){
  if (typeof str !== 'string') return '';
  // 全角数字・読点・コンマ・空白の正規化
  let out = str
    .replace(/[\u3000\s]+/g, ' ') // 全角スペース含む空白を半角1つに
    .replace(/[，、]/g, ',') // 全角コンマ/読点を半角コンマに
    .replace(/[０-９]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0));
  return out;
}

export function normalizeInput(raw){
  const s = toHalfWidthDigits(String(raw ?? ''));
  return s.trim();
}

function isIntegerToken(tok){
  return /^\d+$/.test(tok);
}

// needRemainder=true のときは "q,r" 形式に正規化して返す
// 不正な場合は null を返し、onInputError があれば呼び出す
export function prepareAnswer(raw, { needRemainder = false, onInputError } = {}){
  const s = normalizeInput(raw);
  if (!s) { if (onInputError) onInputError('入力が空です'); return null; }

  if (!needRemainder){
    if (!isIntegerToken(s)) { if (onInputError) onInputError('整数を入力してください'); return null; }
    return s;
  }

  // 余りあり: 区切りは ',' のみになるよう正規化済み
  const parts = s.split(',').map(t => t.trim()).filter(Boolean);
  if (parts.length !== 2) { if (onInputError) onInputError('形式は "商,余り" です'); return null; }
  const [q, r] = parts;
  if (!isIntegerToken(q) || !isIntegerToken(r)) { if (onInputError) onInputError('商と余りは整数で入力'); return null; }
  return `${q},${r}`;
}


