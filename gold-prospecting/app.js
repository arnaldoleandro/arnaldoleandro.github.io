import {colors,copy,emptyState,toInternal,applyResult,normalizePiece,demoState} from './core.js';
import {parseScreenshot,parseBoard,parsePieces} from './capture.js';
const $=id=>document.getElementById(id), STORAGE='gold-coach-state-v1';
let data=emptyState(), history=[], result=null, context=null, worker=null, busy=false, request=0;
let paint=1, editBoard=false, editingPiece=-1, image=null, bounds=null, pieceBounds=null, corners=null, calibration=false;
try{const saved=JSON.parse(localStorage.getItem(STORAGE));if(saved?.version===1)data=saved.data;}catch{ /* Private mode may disable storage. */ }
function status(text,error=false){$('status').textContent=text;$('status').classList.toggle('error',error);}
function persist(){try{localStorage.setItem(STORAGE,JSON.stringify({version:1,data}));}catch{ /* State export remains available. */ }}
function invalidate(){request++;result=null;context=null;$('confirmed').checked=false;$('recommendation').hidden=true;persist();render();}
function cell(value,extra=''){const b=document.createElement('button');b.type='button';b.className=`cell ${colors[value]?.cls||'empty'} ${extra}`;if(value>0&&value<5){const gem=document.createElement('span');gem.className='gem';b.append(gem);}return b;}
function render(){
  const board=$('board');board.replaceChildren();board.classList.toggle('edit',editBoard);
  for(let r=-1;r<8;r++)for(let c=-1;c<8;c++){
    if(r===-1||c===-1){const axis=document.createElement('span');axis.className='axis';axis.textContent=r===-1?(c>=0?c+1:''):r+1;board.append(axis);continue;}
    const ghost=result?.placement_cells.find(p=>p[0]===r&&p[1]===c);
    const value=ghost?context.reverse[ghost[2]]:data.board[r][c];
    const b=cell(value,ghost?'ghost':'');b.title=`Linha ${r+1}, coluna ${c+1}: ${colors[value].name}`;b.setAttribute('aria-label',b.title);b.dataset.row=r;b.dataset.col=c;
    if(result&&(result.cleared_rows.includes(r)||result.cleared_cols.includes(c)))b.classList.add('clears');
    b.onclick=()=>{if(editBoard){data.board[r][c]=paint;invalidate();}};board.append(b);
  }
  const pieces=$('pieces');pieces.replaceChildren();
  data.pieces.forEach((p,slot)=>{
    const card=document.createElement('div');card.className='piece-card'+(result&&context.slots[result.action.piece_index]===slot?' chosen':'');
    const title=document.createElement('div');title.className='piece-name';title.append(`Peça ${slot+1}`);const edit=document.createElement('button');edit.className='text-button';edit.textContent='Editar';edit.onclick=()=>openEditor(slot);title.append(edit);card.append(title);
    if(!p.length){const t=document.createElement('div');t.className='piece-empty';t.textContent='Sem peça';card.append(t);}else{
      const grid=document.createElement('div');grid.className='mini-piece';const normalized=normalizePiece(p), rows=Math.max(...normalized.map(c=>c[0]))+1, cols=Math.max(...normalized.map(c=>c[1]))+1;grid.style.gridTemplateColumns=`repeat(${cols},auto)`;
      for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const v=normalized.find(p=>p[0]===r&&p[1]===c)?.[2]||0;const b=cell(v);b.tabIndex=-1;grid.append(b);}card.append(grid);
    }pieces.append(card);
  });
  $('step-badge').textContent=`${data.moves} ${data.moves===1?'passo':'passos'}`;$('moves').value=data.moves;
  $('solve').disabled=busy||!$('confirmed').checked||!data.pieces.some(p=>p.length);
  $('solve').textContent=busy?'Calculando…':'Mostrar próximo encaixe →';$('undo').disabled=!history.length;
}
function goals(){
  $('goals').replaceChildren();data.goals.forEach((goal,index)=>{
    const row=document.createElement('label');row.className='goal';const select=document.createElement('select');select.setAttribute('aria-label',`Cor da meta de ${goal.target}`);
    for(let v=1;v<=4;v++){const o=document.createElement('option');o.value=v;o.textContent=colors[v].name;select.append(o);}select.value=goal.color;
    select.onchange=()=>{data.goals[index].color=Number(select.value);invalidate();};
    const input=document.createElement('input');input.type='number';input.min=0;input.max=1000;input.value=goal.count;input.setAttribute('aria-label',`Gemas coletadas da meta ${index+1}`);input.onchange=()=>{data.goals[index].count=Number(input.value);invalidate();};
    const total=document.createElement('span');total.textContent=`/ ${goal.target}`;row.append(select,input,total);$('goals').append(row);
  });
}
for(let v=0;v<colors.length;v++){const b=document.createElement('button');b.type='button';b.innerHTML=`<span class="swatch ${colors[v].cls}"></span>${colors[v].name}`;b.dataset.color=v;b.classList.toggle('selected',v===paint);b.onclick=()=>{paint=v;document.querySelectorAll('#palette button').forEach(x=>x.classList.toggle('selected',Number(x.dataset.color)===v));};$('palette').append(b);}
function openEditor(slot){editingPiece=slot;$('piece-editor').hidden=false;$('editor-title').textContent=`Editar peça ${slot+1}`;document.querySelector('.editing').open=true;renderEditor();}
function renderEditor(){const grid=$('editor-grid');grid.replaceChildren();for(let r=0;r<5;r++)for(let c=0;c<5;c++){const v=data.pieces[editingPiece].find(p=>p[0]===r&&p[1]===c)?.[2]||0,b=cell(v);b.setAttribute('aria-label',`Peça: linha ${r+1}, coluna ${c+1}, ${colors[v].name}`);b.onclick=()=>{data.pieces[editingPiece]=data.pieces[editingPiece].filter(p=>p[0]!==r||p[1]!==c);if(paint)data.pieces[editingPiece].push([r,c,paint]);invalidate();renderEditor();};grid.append(b);}}
$('editor-clear').onclick=()=>{data.pieces[editingPiece]=[];invalidate();renderEditor();};
$('editor-done').onclick=()=>{data.pieces[editingPiece]=normalizePiece(data.pieces[editingPiece]);$('piece-editor').hidden=true;editingPiece=-1;invalidate();};
$('edit-board').onclick=()=>{editBoard=!editBoard;$('edit-board').textContent=editBoard?'Concluir edição do grid':'Ativar edição do grid';render();};
$('moves').onchange=()=>{data.moves=Number($('moves').value);invalidate();};$('confirmed').onchange=render;
$('demo').onclick=()=>{data=demoState();history=[];invalidate();goals();status('Exemplo carregado. Confira o estado e marque a confirmação para analisar.');};
function startWorker(){if(worker)return;worker=new Worker(new URL('./worker.js',import.meta.url),{type:'module'});
  worker.onerror=()=>{busy=false;status('Não foi possível carregar o motor. Confira a conexão e tente novamente.',true);worker.terminate();worker=null;render();};
  worker.onmessage=({data:message})=>{
    if(message.type==='progress'){if(busy)status(message.message);return;}
    if(message.type==='error'){busy=false;status(message.message,true);render();return;}
    if(message.type!=='result')return;busy=false;
    if(message.id!==request){status('O estado foi editado. Confira e peça uma nova sugestão.');render();return;}
    result=message;renderResult();render();status('Encaixe destacado. Confira as coordenadas antes de arrastar no jogo.');
  };
}
$('solve').onclick=()=>{try{context=toInternal(data);busy=true;request++;startWorker();worker.postMessage({type:'solve',id:request,state:context.state});render();status('Preparando análise. O primeiro carregamento pode levar alguns segundos…');}catch(e){busy=false;status(e.message,true);render();}};
function renderResult(){
  const slot=context.slots[result.action.piece_index], rows=result.placement_cells.map(c=>c[0]+1), cols=result.placement_cells.map(c=>c[1]+1);
  $('recommendation').hidden=false;$('result-title').textContent=`Peça ${slot+1} · linha ${Math.min(...rows)}, coluna ${Math.min(...cols)}`;
  const certified=['certified','queue','immediate'].includes(result.decision.source);
  $('result-kind').textContent=certified?'CAMINHO VENCEDOR VERIFICADO':'PRÓXIMA COLOCAÇÃO';
  let text='As células iluminadas são a posição da peça. Linhas contam de cima para baixo; colunas, da esquerda para a direita.';
  if(result.expected_after.won)text+=' Esta colocação conclui as metas no simulador.';
  else if(result.decision.minimum_moves)text+=` Sequência vencedora em ${result.decision.minimum_moves} colocações a partir deste estado.`;
  const clear=[...result.cleared_rows.map(r=>`linha ${r+1}`),...result.cleared_cols.map(c=>`coluna ${c+1}`)];text+=clear.length?` Limpa: ${clear.join(', ')}.`:' Nenhuma linha ou coluna será limpa agora.';
  $('result-text').textContent=text;$('result-cells').replaceChildren();for(const [r,c,v] of result.placement_cells){const li=document.createElement('li');li.textContent=`${colors[context.reverse[v]].name} → linha ${r+1}, coluna ${c+1}`;$('result-cells').append(li);}
  $('output').textContent=JSON.stringify({decision:result.decision,coordinates:'índices internos começam em zero',gained:result.gained},null,2);
}
$('hide').onclick=()=>{result=null;context=null;$('recommendation').hidden=true;render();};
$('apply').onclick=()=>{
  if(!result)return;history.push({data:copy(data),decision:copy(result)});const won=result.expected_after.won;data=applyResult(data,result,context);invalidate();goals();
  status(won?'Metas concluídas no simulador! Confira a tela de vitória no jogo.':data.pieces.some(p=>p.length)?'Estado atualizado. Confira no jogo e peça a próxima posição.':'Mão concluída. Importe o print com as três peças novas.');
};
$('undo').onclick=()=>{if(!history.length)return;data=history.pop().data;invalidate();goals();status('Última confirmação desfeita. Confira o tabuleiro.');};
$('reset').onclick=()=>{if(!confirm('Começar outro jogo e limpar o tabuleiro atual?'))return;data=emptyState();history=[];invalidate();goals();status('Novo jogo. Importe o print ou desenhe as peças.');};
$('export').onclick=()=>{const blob=new Blob([JSON.stringify({version:1,data,history},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='gold-coach-partida.json';a.click();URL.revokeObjectURL(url);};
async function loadImage(file){
  if(!file?.type.startsWith('image/'))return status('Escolha um arquivo de imagem.',true);
  if(file.size>20*1024*1024)return status('Use uma imagem de até 20 MB.',true);
  invalidate();
  const url=URL.createObjectURL(file),img=new Image();
  try{await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('Não foi possível abrir a imagem.'));img.src=url;});
    image=img;bounds=null;$('capture-panel').hidden=false;drawCapture();
    status('Lendo o tabuleiro e as peças no dispositivo…');const parsed=await parseScreenshot(img);
    image=img;bounds=parsed.bounds;pieceBounds=parsed.pieceBounds;data.board=parsed.board;data.pieces=[0,1,2].map(i=>parsed.pieces[i]||[]);invalidate();goals();$('capture-panel').hidden=false;drawCapture();
    $('capture-note').textContent=parsed.warnings?.join(' ')||'Leitura assistida: confira todas as células, peças e contadores.';
    status('Print lido. Confira as metas, passos e células; corrija se necessário antes de calcular.');
  }catch(e){status(`${e.message} Use “Ajustar área do grid” ou corrija as células manualmente.`,true);$('capture-note').textContent='A leitura automática não foi concluída. A imagem continua disponível para ajustar a área do grid.';}finally{URL.revokeObjectURL(url);}
}
$('file').onchange=e=>loadImage(e.target.files[0]);document.addEventListener('paste',e=>{const item=[...e.clipboardData.items].find(x=>x.type.startsWith('image/'));if(item){e.preventDefault();loadImage(item.getAsFile());}});
const drop=$('dropzone');drop.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('file').click();}};
drop.ondragover=e=>{e.preventDefault();drop.classList.add('drag');};drop.ondragleave=()=>drop.classList.remove('drag');drop.ondrop=e=>{e.preventDefault();drop.classList.remove('drag');loadImage(e.dataTransfer.files[0]);};
function drawCapture(){if(!image)return;const canvas=$('capture'),scale=Math.min(1,700/image.naturalWidth);canvas.width=Math.round(image.naturalWidth*scale);canvas.height=Math.round(image.naturalHeight*scale);const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0,canvas.width,canvas.height);if(bounds){ctx.strokeStyle='#f7ed64';ctx.lineWidth=3;ctx.strokeRect(bounds.x*scale,bounds.y*scale,bounds.width*scale,bounds.height*scale);}if(corners){ctx.fillStyle='#f7ed64';ctx.beginPath();ctx.arc(corners.x*scale,corners.y*scale,5,0,Math.PI*2);ctx.fill();}}
$('calibrate').onclick=()=>{if(!image)return;calibration=true;corners=null;status('No print, toque no canto superior esquerdo das 64 células e depois no canto inferior direito, sem incluir a moldura.');};
$('capture').onclick=async e=>{if(!calibration||!image)return;const rect=e.currentTarget.getBoundingClientRect(),point={x:(e.clientX-rect.left)*image.naturalWidth/rect.width,y:(e.clientY-rect.top)*image.naturalHeight/rect.height};if(!corners){corners=point;drawCapture();status('Agora toque no canto inferior direito das 64 células.');return;}
  const box={x:Math.min(corners.x,point.x),y:Math.min(corners.y,point.y),width:Math.abs(point.x-corners.x),height:Math.abs(point.y-corners.y)};
  try{const parsedBoard=await parseBoard(image,box);const parsedBounds=Array.from({length:3},(_,i)=>({x:box.x+i*box.width/3,y:box.y+box.height+box.width*.12,width:box.width/3,height:Math.min(box.width*.25,image.naturalHeight-box.y-box.height-box.width*.12)}));const parsedPieces=await parsePieces(image,parsedBounds);data.board=parsedBoard;data.pieces=parsedPieces;bounds=box;pieceBounds=parsedBounds;calibration=false;corners=null;invalidate();drawCapture();status('Área ajustada. Confira a leitura do tabuleiro e das peças.');}catch(err){status(err.message,true);corners=null;}
};
$('clear-image').onclick=()=>{image=null;bounds=null;calibration=false;corners=null;$('capture-panel').hidden=true;};
goals();render();
