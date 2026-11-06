// Presentation-only localization. Game state, input values and technical output stay untouched.
export const LANGUAGE_STORAGE = 'gold-coach-language-v1';
const phrases = [
  ['Gold Coach · seu próximo encaixe','Gold Coach · your next placement'],
  ['Tudo no seu navegador','Everything in your browser'],
  ['GOLD PROSPECTING · ASSISTENTE DO TIME','GOLD PROSPECTING · TEAM ASSISTANT'],
  ['Veja o próximo','See your next'],['encaixe.','placement.'],
  ['Traga o print. Confira as peças. Coloque no jogo exatamente onde o tabuleiro mostrar.','Upload a screenshot. Check the pieces. Place them in the game exactly where the board shows.'],
  ['Seu print','Your screenshot'],['Ver exemplo','View example'],['Solte ou escolha uma imagem','Drop or choose an image'],['Você também pode colar com Ctrl + V','You can also paste with Ctrl + V'],
  ['Print importado; clique para ajustar a área','Imported screenshot; click to adjust the area'],['Ajustar área do grid','Adjust grid area'],['Remover print','Remove screenshot'],
  ['A imagem fica neste dispositivo. A leitura é assistida e pode precisar de correção.','The image stays on this device. Assisted reading may need corrections.'],
  ['Confira as metas','Check the targets'],['Passos já feitos','Moves already made'],['Confira os contadores do print aqui. A meta de 10 pode ser de qualquer cor.','Check the screenshot counters here. The target of 10 can be any color.'],
  ['Corrigir tabuleiro e peças','Correct board and pieces'],['Escolha uma cor e toque nas células. Nas peças, toque em “Editar” para desenhar a forma recebida.','Choose a color and tap the cells. Tap “Edit” on a piece to draw its shape.'],
  ['Ativar edição do grid','Enable grid editing'],['Concluir edição do grid','Finish grid editing'],['Editar peça','Edit piece'],['Concluir peça','Finish piece'],['Limpar peça','Clear piece'],['Editar','Edit'],['Sem peça','No piece'],
  ['Conferi o grid, as peças e os contadores.','I checked the grid, pieces and counters.'],['Mostrar próximo encaixe','Show next placement'],['Calculando…','Calculating…'],['Importe um print ou abra o exemplo para começar.','Import a screenshot or open the example to start.'],
  ['Seu tabuleiro','Your board'],['Tabuleiro 8 por 8, linhas e colunas começam em 1','8 by 8 board, rows and columns start at 1'],['Peças disponíveis','Available pieces'],['Mesma ordem do jogo','Same order as in the game'],
  ['PRÓXIMA COLOCAÇÃO','NEXT PLACEMENT'],['CAMINHO VENCEDOR VERIFICADO','VERIFIED WINNING PATH'],['Já coloquei no jogo','I placed it in the game'],['Ocultar destaque','Hide highlight'],
  ['Confirme só depois de colocar a peça no jogo real. Se algo ficou diferente, importe o novo print e confira.','Confirm only after placing the piece in the real game. If anything differs, import a new screenshot and check.'],
  ['Desfazer confirmação','Undo confirmation'],['Salvar partida','Save game'],['Novo jogo','New game'],['Como a sugestão foi calculada?','How was the suggestion calculated?'],
  ['DQN com busca de duas colocações e finalizador certificado. Usa só o grid e as peças visíveis. A primeira análise baixa o motor; as seguintes reutilizam o carregamento. É uma sugestão, sem garantia de mínimo global.','DQN with a two-placement search and certified finisher. Uses only the grid and visible pieces. The first analysis downloads the engine; later analyses reuse it. This is a suggestion, with no guarantee of a global minimum.'],
  ['Feito para jogar junto.','Made to play together.'],['Print local · Sem conta · Sem cobrança por análise','Local screenshots · No account · No per-analysis fees'],
  ['Nenhuma análise ainda.','No analysis yet.'],
  ['Exemplo carregado. Confira o estado e marque a confirmação para analisar.','Example loaded. Check the state and tick the confirmation to analyze.'],
  ['Não foi possível carregar o motor. Confira a conexão e tente novamente.','Could not load the engine. Check your connection and try again.'],
  ['O estado foi editado. Confira e peça uma nova sugestão.','The state was edited. Check it and request a new suggestion.'],
  ['Encaixe destacado. Confira as coordenadas antes de arrastar no jogo.','Placement highlighted. Check the coordinates before dragging in the game.'],
  ['Preparando análise. O primeiro carregamento pode levar alguns segundos…','Preparing analysis. The first load may take a few seconds…'],
  ['As células iluminadas são a posição da peça. Linhas contam de cima para baixo; colunas, da esquerda para a direita.','The highlighted cells show the piece position. Rows run from top to bottom; columns from left to right.'],
  ['Esta colocação conclui as metas no simulador.','This placement completes the targets in the simulator.'],['Nenhuma linha ou coluna será limpa agora.','No row or column will be cleared now.'],
  ['Metas concluídas no simulador! Confira a tela de vitória no jogo.','Targets completed in the simulator! Check the victory screen in the game.'],
  ['Estado atualizado. Confira no jogo e peça a próxima posição.','State updated. Check it in the game and request the next position.'],['Mão concluída. Importe o print com as três peças novas.','Hand completed. Import a screenshot with the three new pieces.'],
  ['Última confirmação desfeita. Confira o tabuleiro.','Last confirmation undone. Check the board.'],['Começar outro jogo e limpar o tabuleiro atual?','Start another game and clear the current board?'],['Novo jogo. Importe o print ou desenhe as peças.','New game. Import a screenshot or draw the pieces.'],
  ['Escolha um arquivo de imagem.','Choose an image file.'],['Use uma imagem de até 20 MB.','Use an image up to 20 MB.'],['Não foi possível abrir a imagem.','Could not open the image.'],['Lendo o tabuleiro e as peças no dispositivo…','Reading the board and pieces on this device…'],
  ['Leitura assistida: confira todas as células, peças e contadores.','Assisted reading: check all cells, pieces and counters.'],['Print lido. Confira as metas, passos e células; corrija se necessário antes de calcular.','Screenshot read. Check targets, moves and cells; correct them if needed before calculating.'],
  ['Use “Ajustar área do grid” ou corrija as células manualmente.','Use “Adjust grid area” or correct the cells manually.'],['A leitura automática não foi concluída. A imagem continua disponível para ajustar a área do grid.','Automatic reading was not completed. The image remains available to adjust the grid area.'],
  ['No print, toque no canto superior esquerdo das 64 células e depois no canto inferior direito, sem incluir a moldura.','On the screenshot, tap the top left corner of the 64 cells, then the bottom right corner, excluding the frame.'],['Agora toque no canto inferior direito das 64 células.','Now tap the bottom right corner of the 64 cells.'],['Área ajustada. Confira a leitura do tabuleiro e das peças.','Area adjusted. Check the board and piece readings.'],
  ['O tabuleiro precisa ter 8 × 8 células.','The board must have 8 × 8 cells.'],['Escolha três cores diferentes nas metas.','Choose three different target colors.'],['Confira os contadores de gemas.','Check the gem counters.'],['Use uma meta de 10 e duas de 5.','Use one target of 10 and two of 5.'],['Inclua pelo menos uma peça disponível.','Include at least one available piece.'],['Confira o número de passos.','Check the number of moves.'],['Peça inválida: confira tamanho e células.','Invalid piece: check its size and cells.'],['As três metas já foram concluídas.','All three targets have already been completed.'],
  ['Imagem inválida ou grande demais (máximo 50 megapixels / 12000 px).','Invalid or oversized image (maximum 50 megapixels / 12000 px).'],['Selecione um retângulo válido.','Select a valid rectangle.'],['O retângulo precisa ficar dentro da imagem.','The rectangle must be inside the image.'],['Selecione os três retângulos das peças.','Select the three piece rectangles.'],
  ['Leitura local aproximada: confira as 64 casas, as peças e os contadores antes de calcular.','Approximate local reading: check all 64 cells, pieces and counters before calculating.'],['Grade não identificada com segurança. Ajuste o retângulo do tabuleiro.','Grid not confidently identified. Adjust the board rectangle.'],['Uma ou mais peças precisam de correção manual ou de outro recorte.','One or more pieces need manual correction or a different crop.'],
  ['Carregando motor Python…','Loading Python engine…'],['Carregando NumPy e pesos originais…','Loading NumPy and original weights…'],['Analisando apenas o tabuleiro e as peças visíveis…','Analyzing only the board and visible pieces…'],['Solicitação desconhecida','Unknown request'],
  ['Metas','Targets'],['Passos','Moves'],['Escolher formato','Choose shape'],['Formato da peça','Piece shape'],['Escolha um formato e toque nos blocos para mudar a cor.','Choose a shape and tap its blocks to change the color.'],['Girar','Rotate'],['Espelhar','Mirror'],['Desenho livre','Free drawing'],['Usar formato','Use shape'],['Todos os formatos','All shapes'],
  ['Formatos prontos','Ready-made shapes'],['Cor dos blocos','Block color'],['Fechar','Close'],['Remover peça','Remove piece'],['Importe ou cole um print','Import or paste a screenshot'],['Conferir leitura','Check reading'],['Ajustes manuais','Manual adjustments'],['Selecione um formato primeiro.','Select a shape first.'],['Escolha uma cor e toque nos blocos da peça.','Choose a color and tap the piece blocks.'],['O dourado pode precisar de correção manual.','Gold may need manual correction.'],['Linha e coluna começam em 1.','Row and column start at 1.'],
  ['Bloco único','Single block'],['Palito de 2','Bar of 2'],['Palito de 3','Bar of 3'],['Palito de 4','Bar of 4'],['Palito de 5','Bar of 5'],['Quadrado 2×2','Square 2×2'],['Retângulo 2×3','Rectangle 2×3'],['L pequeno','Small L'],['L de 4 blocos','4-block L'],['T pequeno','Small T'],['Zigue-zague','Zigzag'],['Diagonal de 2','Diagonal of 2'],['Diagonal de 3','Diagonal of 3'],['L de 5 blocos','5-block L'],
  ['Vazio','Empty'],['Verde','Green'],['Dourada','Gold'],['Azul','Blue'],['Rosa','Pink'],['Comum','Plain'],
  ['Tabuleiro deve ter oito linhas de oito células','Board must have eight rows of eight cells'],['Forneça de uma a três peças visíveis','Provide one to three visible pieces'],['A peça precisa ter de uma a nove células','Piece needs one to nine cells'],['Células da peça devem ser [row, col, color]','Piece cells must be [row, col, color]'],['A coleta deve ter três contadores','Collected must have three counters'],['O jogo já terminou','The game is already finished'],['Todas as metas já foram alcançadas','All targets have already been reached'],['Campos inesperados nos pesos de inferência','Unexpected inference weight fields'],
];
const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const maps = [new Map(phrases), new Map(phrases.map(([pt,en])=>[en,pt]))];
const expressions = maps.map(map=>new RegExp(`(?<![\\p{L}])(?:${[...map.keys()].sort((a,b)=>b.length-a.length).map(escape).join('|')})(?![\\p{L}])`,'gu'));
// Full-message templates keep variable values intact and never rewrite arbitrary JSON.
const templates = [
  [/^Peça (\d+)(.*)$/u, /^Piece (\d+)(.*)$/u, (n,s)=>`Piece ${n}${s}`, (n,s)=>`Peça ${n}${s}`],
  [/^Editar peça (\d+)$/u, /^Edit piece (\d+)$/u, n=>`Edit piece ${n}`,n=>`Editar peça ${n}`],
  [/^(\d+) passo(s?)$/u,/^(\d+) move(s?)$/u,(n,s)=>`${n} move${s}`,(n,s)=>`${n} passo${s}`],
  [/^Cor da meta de (\d+)$/u,/^Color for target of (\d+)$/u,n=>`Color for target of ${n}`,n=>`Cor da meta de ${n}`],
  [/^Gemas coletadas da meta (\d+)$/u,/^Gems collected for target (\d+)$/u,n=>`Gems collected for target ${n}`,n=>`Gemas coletadas da meta ${n}`],
  [/^Falha ao carregar (.+): HTTP (\d+)$/u,/^Failed to load (.+): HTTP (\d+)$/u,(f,n)=>`Failed to load ${f}: HTTP ${n}`,(f,n)=>`Falha ao carregar ${f}: HTTP ${n}`],
  [/^Integridade inválida: (.+)$/u,/^Invalid integrity: (.+)$/u,s=>`Invalid integrity: ${s==='pesos'?'weights':s==='motor'?'engine':s}`,s=>`Integridade inválida: ${s==='weights'?'pesos':s==='engine'?'motor':s}`],
  [/^A cor (.+) não está nas metas\. Confira a leitura\.$/u,/^Color (.+) is not in the targets\. Check the reading\.$/u,s=>`Color ${s} is not in the targets. Check the reading.`,s=>`A cor ${s} não está nas metas. Confira a leitura.`],
  [/^(Célula do tabuleiro|Linha da peça|Coluna da peça|Cor da peça|Coleta|Passos): esperado um inteiro de (\d+) a (\d+)$/u,/^(Board cell|Piece row|Piece column|Piece color|Collected|Moves): expected an integer from (\d+) to (\d+)$/u,
    (s,a,b)=>`${({'Célula do tabuleiro':'Board cell','Linha da peça':'Piece row','Coluna da peça':'Piece column','Cor da peça':'Piece color','Coleta':'Collected','Passos':'Moves'})[s]}: expected an integer from ${a} to ${b}`,
    (s,a,b)=>`${({'Board cell':'Célula do tabuleiro','Piece row':'Linha da peça','Piece column':'Coluna da peça','Piece color':'Cor da peça','Collected':'Coleta','Moves':'Passos'})[s]}: esperado um inteiro de ${a} a ${b}`],
];

export function translateText(value, language='pt-BR') {
  const en = language === 'en', direction = en ? 0 : 1;
  let text=String(value);
  // Templates are applied before phrase/color substitution.
  for (const template of templates) {
    const match=text.match(template[direction]);
    if(match){text=template[direction+2](...match.slice(1));break;}
  }
  text=text.replace(expressions[direction], match=>maps[direction].get(match));
  // Restricted grammatical fragments occur only in UI messages/accessible labels.
  const fragments = en ? [
    [/^(Piece \d+) · (\d+) blocos$/u,'$1 · $2 blocks'],
    [/\blinha (\d+)/gu,'row $1'],[/\bLinha (\d+)/gu,'Row $1'],[/\bcoluna (\d+)/gu,'column $1'],
    [/^Peça: /u,'Piece: '],
    [/Sequência vencedora em (\d+) colocações a partir deste estado\./gu,'Winning sequence in $1 placements from this state.'],[/Limpa: /gu,'Clears: '],
  ] : [
    [/^(Peça \d+) · (\d+) blocks$/u,'$1 · $2 blocos'],
    [/\brow (\d+)/gu,'linha $1'],[/\bRow (\d+)/gu,'Linha $1'],[/\bcolumn (\d+)/gu,'coluna $1'],
    [/^Piece: /u,'Peça: '],
    [/Winning sequence in (\d+) placements from this state\./gu,'Sequência vencedora em $1 colocações a partir deste estado.'],[/Clears: /gu,'Limpa: '],
  ];
  for(const [pattern,replacement] of fragments)text=text.replace(pattern,replacement);
  return text;
}

export function installI18n({button, initialLanguage}={}) {
  let saved;try{saved=localStorage.getItem(LANGUAGE_STORAGE);}catch{/* Storage is optional. */}
  let language=(initialLanguage || saved)==='en'?'en':'pt-BR';
  const root=document.documentElement;
  const skip=element=>element?.closest('pre,code,script,style,textarea,[data-no-i18n]') || element===button || button?.contains(element);
  const attributes=['aria-label','title','placeholder','alt'];
  const observer=new MutationObserver(refresh);
  function refresh(){
    observer.disconnect();
    root.lang=language;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    while(walker.nextNode()){
      const node=walker.currentNode;
      if(skip(node.nodeType===3?node.parentElement:node))continue;
      if(node.nodeType===3){const translated=translateText(node.data,language);if(translated!==node.data)node.data=translated;}
      else for(const name of attributes)if(node.hasAttribute(name)){
        const original=node.getAttribute(name), translated=translateText(original,language);
        if(original!==translated)node.setAttribute(name,translated);
      }
    }
    if(button){button.textContent=language==='en'?'PT-BR':'EN';button.setAttribute('aria-label',language==='en'?'Mudar idioma para português do Brasil':'Switch language to English');button.title=button.getAttribute('aria-label');}
    observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attributes});
  }
  function setLanguage(value){language=value==='en'?'en':'pt-BR';try{localStorage.setItem(LANGUAGE_STORAGE,language);}catch{/* Storage is optional. */}refresh();}
  if(button)button.addEventListener('click',()=>setLanguage(language==='en'?'pt-BR':'en'));
  refresh();
  return {translate:text=>translateText(text,language),setLanguage,getLanguage:()=>language};
}
