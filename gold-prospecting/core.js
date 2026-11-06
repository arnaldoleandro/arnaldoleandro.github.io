export const colors = [
  {name:'Vazio', cls:'empty'}, {name:'Verde', cls:'green'}, {name:'Dourada', cls:'gold'},
  {name:'Azul', cls:'blue'}, {name:'Rosa', cls:'pink'}, {name:'Comum', cls:'plain'},
];
export const copy = value => JSON.parse(JSON.stringify(value));
export function normalizePiece(cells) {
  if (!cells.length) return [];
  const r = Math.min(...cells.map(c=>c[0])), c = Math.min(...cells.map(c=>c[1]));
  return cells.map(([y,x,v])=>[y-r,x-c,v]).sort((a,b)=>a[0]-b[0] || a[1]-b[1]);
}
export function emptyState() {
  return {board:Array.from({length:8},()=>Array(8).fill(0)),pieces:[[],[],[]],moves:0,
    goals:[{color:1,target:10,count:0},{color:3,target:5,count:0},{color:2,target:5,count:0}]};
}
export function toInternal(data) {
  if (data.board.length!==8 || data.board.some(r=>r.length!==8)) throw Error('O tabuleiro precisa ter 8 × 8 células.');
  if (new Set(data.goals.map(g=>g.color)).size!==3) throw Error('Escolha três cores diferentes nas metas.');
  const mapping={0:0,5:4}, reverse={0:0,4:5};
  const smallColors=data.goals.filter(g=>g.target===5).map(g=>g.color).sort((a,b)=>a-b);
  data.goals.forEach(g=>{
    if (!Number.isInteger(g.count) || g.count<0 || g.count>1000) throw Error('Confira os contadores de gemas.');
    const internal=g.target===10?2:([1,3][smallColors.indexOf(g.color)]);
    mapping[g.color]=internal; reverse[internal]=g.color;
  });
  if (data.goals.filter(g=>g.target===10).length!==1 || smallColors.length!==2) throw Error('Use uma meta de 10 e duas de 5.');
  const convert=v=>{if (!(v in mapping)) throw Error(`A cor ${colors[v]?.name || v} não está nas metas. Confira a leitura.`);return mapping[v];};
  const slots=data.pieces.map((p,i)=>p.length?i:-1).filter(i=>i>=0);
  if (!slots.length) throw Error('Inclua pelo menos uma peça disponível.');
  if (!Number.isInteger(data.moves) || data.moves<0 || data.moves>=199) throw Error('Confira o número de passos.');
  const hand=slots.map(i=>{
    const p=normalizePiece(data.pieces[i]);
    if(p.length>9 || new Set(p.map(c=>`${c[0]},${c[1]}`)).size!==p.length || p.some(c=>c[0]<0||c[1]<0||c[0]>4||c[1]>4)) throw Error('Peça inválida: confira tamanho e células.');
    return p.map(([r,c,v])=>[r,c,convert(v)]);
  });
  const collected=[0,0,0];data.goals.forEach(g=>collected[mapping[g.color]-1]=g.count);
  if(data.goals.every(g=>g.count>=g.target)) throw Error('As três metas já foram concluídas.');
  return {state:{board:data.board.map(r=>r.map(convert)),hand,collected,moves:data.moves,done:false,won:false},slots,mapping,reverse};
}
export function applyResult(data,result,context) {
  const next=copy(data), after=result.expected_after;
  next.board=after.board.map(r=>r.map(v=>context.reverse[v]));next.moves=after.moves;
  next.goals.forEach(g=>g.count=after.collected[context.mapping[g.color]-1]);
  const remaining=context.slots.filter((_,i)=>i!==result.action.piece_index);
  next.pieces=[[],[],[]];
  after.hand.forEach((piece,i)=>{next.pieces[remaining[i]]=(piece.cells || piece).map(([r,c,v])=>[r,c,context.reverse[v]]);});
  return next;
}
export function demoState() {
  const d=emptyState();
  for(const [r,c,v] of [[2,1,5],[2,2,1],[3,4,3],[4,3,2],[5,5,3],[5,6,5]])d.board[r][c]=v;
  d.pieces=[[[0,0,5],[1,0,1],[1,1,2]],[[0,2,1],[1,0,5],[1,1,5],[1,2,5]],[[0,0,5],[0,1,3]]];return d;
}
