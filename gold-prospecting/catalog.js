import {normalizePiece} from './core.js';
export const geometryKey=cells=>normalizePiece(cells).map(([r,c])=>`${r},${c}`).join(';');
export function rotatePiece(cells){if(!cells.length)return [];const max=Math.max(...cells.map(c=>c[0]));return normalizePiece(cells.map(([r,c,v])=>[c,max-r,v]));}
export function mirrorPiece(cells){if(!cells.length)return [];const max=Math.max(...cells.map(c=>c[1]));return normalizePiece(cells.map(([r,c,v])=>[r,max-c,v]));}
const families=[['Bloco único',[[0,0]],false],...[2,3,4,5].map(n=>[`Palito de ${n}`,Array.from({length:n},(_,c)=>[0,c]),false]),['Quadrado 2×2',[[0,0],[0,1],[1,0],[1,1]],false],['Retângulo 2×3',[[0,0],[0,1],[0,2],[1,0],[1,1],[1,2]],false],['L pequeno',[[0,0],[1,0],[1,1]],false],['L de 4 blocos',[[0,0],[1,0],[2,0],[2,1]],true],['T pequeno',[[0,0],[0,1],[0,2],[1,1]],false],['Zigue-zague',[[0,0],[0,1],[1,1],[1,2]],true],['Diagonal de 2',[[0,0],[1,1]],false],['Diagonal de 3',[[0,0],[1,1],[2,2]],false],['L de 5 blocos',[[0,0],[0,1],[0,2],[1,0],[2,0]],false]];
export const catalog=[];
const seen=new Set();
for(const [name,coords,reflections] of families){let index=0;const original=coords.map(([r,c])=>[r,c,5]);for(const start of reflections?[original,mirrorPiece(original)]:[original]){let cells=start;for(let i=0;i<4;i++){const key=geometryKey(cells);if(!seen.has(key)){seen.add(key);catalog.push({name,label:`${name} · ${++index}`,key,cells});}cells=rotatePiece(cells);}}}
