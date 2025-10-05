export function randInt(min, max) { return Math.floor(Math.random()*(max-min+1))+min }
export function choice(arr) { return arr[Math.floor(Math.random()*arr.length)] }
export function hasCarry(a,b){ return ((a%10)+(b%10))>=10 }
export function hasBorrow(a,b){ return ((a%10)-(b%10))<0 }
export function isDivisible(a,b){ return b!==0 && a%b===0 }

