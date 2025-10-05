/**
 * [randInt]
 * min〜max の整数を一様ランダムに返します（両端含む）。
 */
export function randInt(min, max) { return Math.floor(Math.random()*(max-min+1))+min }
export function choice(arr) { return arr[Math.floor(Math.random()*arr.length)] }
/**
 * [hasCarry]
 * 1の位の繰上りが発生するかを判定します。
 * 例: 8+5 は (8%10)+(5%10)=13 ≥ 10 なので true。
 * Ranks 1–3 では 1〜2桁+1桁の想定で、1の位のみを評価します。
 */
export function hasCarry(a,b){ return ((a%10)+(b%10))>=10 }
/**
 * [hasBorrow]
 * 1の位で借位が必要かを判定します。
 * 例: 12-9 は (12%10)-(9%10)=3 なので false、8-9 は -1 < 0 なので true。
 * Ranks 1–3 では 1〜2桁−1桁の想定で、1の位のみを評価します。
 */
export function hasBorrow(a,b){ return ((a%10)-(b%10))<0 }
/**
 * [isDivisible]
 * b が 0 でなく、a が b で割り切れるか（余り0か）を判定します。
 * 例: 18 ÷ 3 は true、19 ÷ 3 は false。
 */
export function isDivisible(a,b){ return b!==0 && a%b===0 }

