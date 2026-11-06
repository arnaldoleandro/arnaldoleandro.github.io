/** Local screenshot reader; no network, OCR, credentials, or external libraries.
 * All rectangles use ORIGINAL image pixels. Board is row-major, 8 × 8.
 * Colors: 0 empty, 1 green, 2 gold, 3 cyan, 4 pink, 5 plain.
 * Pieces contain [rowOffset, columnOffset, color] triples.
 * parseScreenshot(image) -> { board, pieces, bounds, pieceBounds, confidence, warnings }
 * parseBoard(image, bounds) -> board; parsePieces(image, pieceBounds) -> pieces.
 * Detection is a heuristic for portrait game screenshots, not verified OCR.
 * Always show the extracted state for correction before using a suggestion.
 */

const SIZE_LIMIT = 12000;

function raster(image) {
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  if (!width || !height || width < 16 || height < 16 || width > SIZE_LIMIT || height > SIZE_LIMIT || width * height > 50000000)
    throw new Error('Imagem inválida ou grande demais (máximo 50 megapixels / 12000 px).');
  // Preserve the tiny line-art gems in the three trays (often only 12px wide).
  const scale = Math.min(1, 1600 / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return { width: canvas.width, height: canvas.height,
    sx: canvas.width / width, sy: canvas.height / height,
    data: ctx.getImageData(0, 0, canvas.width, canvas.height).data };
}

function rgb(im, x, y) {
  x = Math.max(0, Math.min(im.width - 1, Math.round(x)));
  y = Math.max(0, Math.min(im.height - 1, Math.round(y)));
  const i = (y * im.width + x) * 4;
  return [im.data[i], im.data[i + 1], im.data[i + 2]];
}

export function classifyColor(r, g, b) {
  const hi = Math.max(r, g, b), lo = Math.min(r, g, b), delta = hi - lo;
  if (hi < 80) return 0;
  if (delta < 35 || delta / hi < .22) return lo > 145 ? 5 : 0;
  let hue = hi === r ? ((g - b) / delta) % 6 : hi === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  hue = (hue * 60 + 360) % 360;
  // Ordinary occupied blocks are peach/amber (e.g. 241,187,126), not
  // yellow gems. Their blue content and muted saturation distinguish the
  // tile face from saturated yellow/orange gem ink. Hue alone merges both.
  if (hue >= 20 && hue < 58 && r > 125 && b > 45 && delta / hi < .72) return 5;
  if (hue >= 68 && hue < 165) return 1;
  if (hue >= 25 && hue < 68) return 2;
  if (hue >= 165 && hue < 255) return 3;
  if (hue >= 275 || hue < 15) return 4;
  return 0;
}

function rect(im, bounds) {
  if (!bounds || !['x', 'y', 'width', 'height'].every(k => Number.isFinite(bounds[k])))
    throw new Error('Selecione um retângulo válido.');
  const r = { x: bounds.x * im.sx, y: bounds.y * im.sy,
    width: bounds.width * im.sx, height: bounds.height * im.sy };
  if (r.width < 8 || r.height < 8 || r.x < 0 || r.y < 0 ||
      r.x + r.width > im.width + 1 || r.y + r.height > im.height + 1)
    throw new Error('O retângulo precisa ficar dentro da imagem.');
  return r;
}

function original(im, r) {
  return { x: r.x / im.sx, y: r.y / im.sy, width: r.width / im.sx, height: r.height / im.sy };
}

function sample(im, x, y, w, h) {
  const votes = [0, 0, 0, 0, 0, 0];
  // Avoid tile borders, drop shadows, and very small central highlights.
  for (let dy = .22; dy <= .78; dy += .08)
    for (let dx = .22; dx <= .78; dx += .08) {
      votes[classifyColor(...rgb(im, x + dx * w, y + dy * h))]++;
    }
  let best = 0;
  for (let c = 1; c < 6; c++) if (votes[c] > votes[best]) best = c;
  // Gems are icons on top of the same amber tile, so their ink need not
  // occupy a majority of the tile. Require several interior samples to
  // avoid treating a single antialiased pixel/highlight as a gem.
  let gem = 1;
  for (let c = 2; c <= 4; c++) if (votes[c] > votes[gem]) gem = c;
  if (votes[gem] >= 8 && (best === 5 || votes[gem] > votes[best])) best = gem;
  if(best===5 || best===2){
    // Remove smooth illumination with a local second derivative. Plain amber
    // faces have gradients; the orange gem drawing has enclosed interior edges.
    let ink=0, edges=0, tested=0;
    const stride=Math.max(1,Math.floor(Math.min(w,h)/36));
    for(let py=Math.ceil(y+h*.28);py<y+h*.72;py+=stride)for(let px=Math.ceil(x+w*.28);px<x+w*.72;px+=stride){
      const [r,g,b]=rgb(im,px,py), l=rgb(im,px-1,py), rr=rgb(im,px+1,py), u=rgb(im,px,py-1),d=rgb(im,px,py+1);
      const contrast=Math.abs(4*g-l[1]-rr[1]-u[1]-d[1]);
      if(r>145&&r>g*1.42&&g>b*1.3&&g<165&&b<100){ink++;if(contrast>18)edges++;}tested++;
    }
    if(ink>=3&&edges>=3&&edges/tested>.025)best=2;
  }
  return { color: best, confidence: votes[best] / votes.reduce((a, b) => a + b, 0) };
}

// Component extraction from geometry masks, independent of gem color labels.
function regions(im,r,predicate){
  const x0=Math.max(0,Math.floor(r.x)),y0=Math.max(0,Math.floor(r.y)),w=Math.min(im.width-x0,Math.ceil(r.width)),h=Math.min(im.height-y0,Math.ceil(r.height));
  const mask=new Uint8Array(w*h),found=[];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(predicate(...rgb(im,x0+x,y0+y)))mask[y*w+x]=1;
  for(let start=0;start<mask.length;start++)if(mask[start]){
    const q=[start];mask[start]=0;let minx=w,miny=h,maxx=0,maxy=0;
    for(let i=0;i<q.length;i++){const at=q[i],x=at%w,y=Math.floor(at/w);minx=Math.min(minx,x);maxx=Math.max(maxx,x);miny=Math.min(miny,y);maxy=Math.max(maxy,y);
      for(const next of [x?at-1:-1,x<w-1?at+1:-1,y?at-w:-1,y<h-1?at+w:-1])if(next>=0&&mask[next]){mask[next]=0;q.push(next);}}
    if(q.length>=9)found.push({x:x0+minx,y:y0+miny,width:maxx-minx+1,height:maxy-miny+1,area:q.length});
  }return found;
}
function gridByCells(im){
  const cells=regions(im,{x:0,y:0,width:im.width,height:im.height*.92},(r,g,b)=>r>=68&&r<132&&Math.max(r,g,b)-Math.min(r,g,b)<45&&r>=b)
    .filter(c=>c.width>im.width*.055&&c.width<im.width*.145&&Math.abs(c.width-c.height)<4&&c.area>c.width*c.height*.85);
  if(cells.length<8)return null;
  const sizes=cells.map(c=>(c.width+c.height)/2).sort((a,b)=>a-b),tile=sizes[Math.floor(sizes.length/2)];
  const group=cells.filter(c=>Math.abs(c.width-tile)<3&&Math.abs(c.height-tile)<3);
  let best=null;
  for(let gap=1;gap<=4;gap++){const pitch=tile+gap;
    for(const cell of group)for(let row=0;row<8;row++){
      const y=cell.y-gap/2-row*pitch,x=(im.width-8*pitch)/2;
      if(y<0||y+pitch*8>im.height*.96)continue;
      // Horizontal position is refined from the observed cell lattice.
      const col=Math.round((cell.x-x)/pitch),left=cell.x-gap/2-col*pitch;
      const fit=group.filter(c=>{const cr=(c.y-y-gap/2)/pitch,cc=(c.x-left-gap/2)/pitch;return cr>-.05&&cr<7.05&&cc>-.05&&cc<7.05&&Math.abs(cr-Math.round(cr))<.035&&Math.abs(cc-Math.round(cc))<.035;});
      const score=fit.length-Math.abs(left+pitch*4-im.width/2)/im.width;
      if(fit.length>=8&&(!best||score>best.score))best={x:left,y,width:pitch*8,height:pitch*8,score};
    }
  }return best;
}

function boardFrom(im, r) {
  return Array.from({ length: 8 }, (_, row) => Array.from({ length: 8 }, (_, col) =>
    sample(im, r.x + col * r.width / 8, r.y + row * r.height / 8, r.width / 8, r.height / 8).color));
}

export async function parseBoard(image, bounds) {
  const im = raster(image);
  return boardFrom(im, rect(im, bounds));
}

function detectBoard(im) {
  const lattice=gridByCells(im);if(lattice)return lattice;
  // The board has eight equal dark tile interiors. Seek the square with the
  // strongest regularly spaced borders in the central portrait game area.
  const fallbackSide = Math.min(im.width * .86, im.height * .64);
  let best = { score: -Infinity, x: (im.width - fallbackSide) / 2, y: im.height * .2,
    width: fallbackSide, height: fallbackSide };
  const brightness = (x, y) => { const p = rgb(im, x, y); return (p[0] + p[1] + p[2]) / 3; };
  const score = (x, y, side) => {
    const step = side / 8;
    let edges = 0, dark = 0, interior = 0;
    for (let row = 0; row < 8; row++) for (let col = 0; col < 8; col++) {
      const cx = x + (col + .5) * step, cy = y + (row + .5) * step;
      const center = brightness(cx, cy);
      interior += center;
      dark += center < 105 ? 1 : 0;
      edges += Math.abs(brightness(x + col * step, cy) - brightness(x + (col + .15) * step, cy));
      edges += Math.abs(brightness(cx, y + row * step) - brightness(cx, y + (row + .15) * step));
    }
    // Uniform empty backgrounds cannot obtain a high score from darkness alone.
    return edges / 128 + dark / 64 * 2 - Math.abs(x + side / 2 - im.width / 2) / im.width * 8
      - (interior / 64 > 190 ? 10 : 0);
  };
  for (let side = im.width * .70; side <= im.width * .97; side += Math.max(2, im.width * .015)) {
    for (let x = Math.max(0, (im.width - side) / 2 - im.width * .035); x <= (im.width - side) / 2 + im.width * .035; x += Math.max(2, im.width * .012)) {
      for (let y = im.height * .16; y < Math.min(im.height * .62, im.height - side - 10); y += Math.max(2, im.height * .008)) {
        const s = score(x, y, side);
        if (s > best.score) best = { x, y, width: side, height: side, score: s };
      }
    }
  }
  const coarse = { ...best };
  for (let ds = -4; ds <= 4; ds++) for (let dx = -4; dx <= 4; dx++) for (let dy = -5; dy <= 5; dy++) {
    const x = coarse.x + dx, y = coarse.y + dy, side = coarse.width + ds;
    if (x < 0 || y < 0 || x + side > im.width || y + side > im.height) continue;
    const s = score(x, y, side);
    if (s > best.score) best = { x, y, width: side, height: side, score: s };
  }
  return best;
}

// Find gem interiors as components. Adjacent colors remain separate components;
// isolated text, buttons and highlights are rejected by size and shape.
function components(im, r) {
  const x0 = Math.max(0, Math.floor(r.x)), y0 = Math.max(0, Math.floor(r.y));
  const w = Math.min(im.width - x0, Math.ceil(r.width)), h = Math.min(im.height - y0, Math.ceil(r.height));
  const labels = new Uint8Array(w * h), seen = new Uint8Array(w * h), result = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) labels[y * w + x] = classifyColor(...rgb(im, x0 + x, y0 + y));
  for (let start = 0; start < labels.length; start++) {
    if (seen[start] || !labels[start]) continue;
    const color = labels[start], queue = [start]; seen[start] = 1;
    let minx = w, miny = h, maxx = 0, maxy = 0;
    for (let q = 0; q < queue.length; q++) {
      const i = queue[q], x = i % w, y = Math.floor(i / w);
      minx = Math.min(minx, x); maxx = Math.max(maxx, x); miny = Math.min(miny, y); maxy = Math.max(maxy, y);
      for (const next of [x ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y ? i - w : -1, y < h - 1 ? i + w : -1])
        if (next >= 0 && !seen[next] && labels[next] === color) { seen[next] = 1; queue.push(next); }
    }
    if (queue.length >= 12 && maxx - minx >= 3 && maxy - miny >= 3)
      result.push({ x: x0 + minx, y: y0 + miny, width: maxx - minx + 1, height: maxy - miny + 1, color, area: queue.length });
  }
  return result;
}

function legacyPieceFrom(im, r) {
  const candidates = components(im, r).filter(c => c.width / c.height > .35 && c.width / c.height < 2.8
    && c.area < r.width * r.height * .55);
  if (!candidates.length) return [];
  // A gem's saturated face is smaller than its tile. Estimate pitch from
  // neighboring faces when possible, otherwise use its visible dimensions.
  const sizes = candidates.map(c => Math.min(c.width, c.height)).sort((a, b) => a - b);
  let pitch = sizes[Math.floor(sizes.length / 2)] * 1.15;
  const distances = [];
  for (const a of candidates) for (const b of candidates) {
    const dx = Math.abs(a.x + a.width / 2 - b.x - b.width / 2), dy = Math.abs(a.y + a.height / 2 - b.y - b.height / 2);
    if (dx > pitch * .7 && dx < pitch * 1.5 && dy < pitch * .25) distances.push(dx);
    if (dy > pitch * .7 && dy < pitch * 1.5 && dx < pitch * .25) distances.push(dy);
  }
  if (distances.length) pitch = distances.sort((a, b) => a - b)[Math.floor(distances.length / 2)];
  const minx = Math.min(...candidates.map(c => c.x + c.width / 2));
  const miny = Math.min(...candidates.map(c => c.y + c.height / 2));
  const cells = new Map();
  for (const c of candidates) {
    const row = Math.round((c.y + c.height / 2 - miny) / pitch), col = Math.round((c.x + c.width / 2 - minx) / pitch);
    if (row > 4 || col > 4) continue;
    const key = `${row},${col}`;
    const previous = cells.get(key);
    if (!previous || (previous.color === 5 && c.color !== 5) ||
        (previous.color !== 5 && c.color !== 5 && previous.area < c.area) ||
        (previous.color === 5 && c.color === 5 && previous.area < c.area))
      cells.set(key, { row, col, color: c.color, area: c.area });
  }
  return [...cells.values()].sort((a, b) => a.row - b.row || a.col - b.col).map(c => [c.row, c.col, c.color]);
}

function tilePixel(r,g,b){
  const c=classifyColor(r,g,b);
  return ((c===1||c===3||c===4)&&Math.max(r,g,b)>150) || (r>195&&g>148&&b>20&&r>g&&g>b);
}
function pieceFrom(im,r){
  // Segment bright tile faces, not icons: plain neighbours must remain cells.
  const parts=regions(im,r,tilePixel).filter(c=>c.area>=10&&c.width>=Math.max(3,r.width*.065)&&c.height>=Math.max(3,r.width*.065)&&c.area>c.width*c.height*.35&&c.width/c.height>.15&&c.width/c.height<6);
  if(!parts.length)return [];
  const x=Math.min(...parts.map(c=>c.x)),y=Math.min(...parts.map(c=>c.y));
  const width=Math.max(...parts.map(c=>c.x+c.width))-x,height=Math.max(...parts.map(c=>c.y+c.height))-y;
  const sizes=parts.map(c=>Math.min(c.width,c.height)).sort((a,b)=>a-b),typical=sizes[Math.floor(sizes.length/2)];
  let best=null;
  for(let rows=1;rows<=5;rows++)for(let cols=1;cols<=5;cols++){
    const pw=width/cols,ph=height/rows,pitch=(pw+ph)/2;
    if(pitch<Math.max(5,r.width*.09)||pitch>r.width*.28||Math.abs(pw-ph)>Math.max(2,pitch*.16))continue;
    const cells=[];let error=0,ambiguous=0;
    for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
      let yes=0,n=0;
      for(let dy=.15;dy<.9;dy+=.1)for(let dx=.15;dx<.9;dx+=.1){if(tilePixel(...rgb(im,x+(col+dx)*pw,y+(row+dy)*ph)))yes++;n++;}
      const fill=yes/n;if(fill>.30){cells.push([row,col,sample(im,x+col*pw,y+row*ph,pw,ph).color||5]);error+=1-fill;if(fill<.6)ambiguous++;}else error+=fill;
    }
    if(!cells.length||cells.length>6)continue;
    // Prefer complete square faces over subdividing a tile or joining a row.
    const score=error/(rows*cols)+Math.abs(pw-ph)/pitch+ambiguous*.2+Math.abs(pitch-typical)/typical*.3;
    if(!best||score<best.score)best={cells,score};
  }
  if(!best)return legacyPieceFrom(im,r);
  const minr=Math.min(...best.cells.map(c=>c[0])),minc=Math.min(...best.cells.map(c=>c[1]));
  return best.cells.map(([row,col,color])=>[row-minr,col-minc,color]);
}

export async function parsePieces(image, pieceBounds) {
  if (!Array.isArray(pieceBounds) || pieceBounds.length !== 3) throw new Error('Selecione os três retângulos das peças.');
  const im = raster(image);
  return pieceBounds.map(r => pieceFrom(im, rect(im, r)));
}

export async function parseScreenshot(image) {
  const im = raster(image), found = detectBoard(im);
  const bounds = original(im, found);
  const trayTop = Math.min(im.height - 8, found.y + found.height + found.width * .15);
  const trayHeight = Math.max(8, Math.min(found.width * .33, im.height * .90 - trayTop));
  const tray = Array.from({ length: 3 }, (_, i) => ({
    x: Math.max(0,found.x+found.width*(-.02+i*.35)), y: trayTop,
    width: Math.min(found.width*.34,im.width-Math.max(0,found.x+found.width*(-.02+i*.35))), height: trayHeight,
  }));
  const pieces = tray.map(r => pieceFrom(im, r));
  const warnings = ['Leitura local aproximada: confira as 64 casas, as peças e os contadores antes de calcular.'];
  if (found.score < 10) warnings.push('Grade não identificada com segurança. Ajuste o retângulo do tabuleiro.');
  if (pieces.some(p => !p.length || p.length > 6)) warnings.push('Uma ou mais peças precisam de correção manual ou de outro recorte.');
  return { board: boardFrom(im, found), pieces, bounds, pieceBounds: tray.map(r => original(im, r)),
    confidence: Math.max(.05, Math.min(.7, found.score / 50)), warnings };
}

