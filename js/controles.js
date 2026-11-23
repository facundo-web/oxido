'use strict';
// Óxido · Controles dibujados (la tarjeta de CONTROLES de la pausa y de CÓMO JUGAR)
// CTRL_dibujar(x,y,w,h,op) dibuja en pixel art el control con el que se está jugando, con cada tecla o botón que se
// usa resaltado en el color de su acción, la acción escrita al lado y una línea que los une; lo que no se usa queda en
// gris tenue. Detecta el control solo (último que se tocó: onTouch, kb2On, onPad y controlesSimples de input.js):
//   · TECLADO completo (flechas, Z X C, S o TAB, 1–6, ESC o P) · TECLADO SIMPLES de 1 jugador (simple.js)
//   · TECLADO DE A 2 (cada jugador en su color, P_COL) · JOYSTICK genérico, sin logos, con los símbolos de su marca
//     (PAD_LBL según la marca que resuelve input.js) · PANTALLA TÁCTIL: con los controles a la vista, la tarjeta se
//     vuelve transparente y señala los botones reales (window.OXIDO_TACTIL_POS de tactil.js o, si no está, el DOM de
//     #tactil); si no se ven, dibuja un celular acostado con sus controles.
// Abajo, "MOSTRANDO: TECLADO" con ◀ ▶ para ver los otros: CTRL_cambiar(±1), o CTRL_teclas() lee ← → (devuelve true si
// las usó); el mouse también (raton.js). Si cambia el control con la tarjeta abierta, vuelve a mostrar el que se usa.
// op: {vista:'teclado'|'simples'|'dos'|'pad'|'tactil'} fija una · {flechas:false} sin la fila de abajo
//     · {fondo:false} sin el recuadro. Tamaño cómodo: 260 × 92 (si el lugar es más chico, se achica entero).
// Prefijo CTRL_ (lo que se usa de afuera) y CT_ (lo de adentro).
const CT_TINTA='#120c18';
const CT_COL={mov:'#8cc0ff',sal:'#7dff9a',dis:'#ff8a7a',gra:'#ffb36b',arm:'#ffe08a',pau:'#d4c4ff',neu:'#e8e0d0'};
const CT_SUB='#b9adc8'; // texto secundario ("mantener: rueda")
const CT_VISTAS={teclado:'TECLADO',flechas:'TECLADO · FLECHAS',simples:'TECLADO · SIMPLES',dos:'TECLADO · DE A 2',pad:'JOYSTICK',tactil:'PANTALLA TÁCTIL'};
// ---------- teclado de dos esquemas: WASD + J K L (el principal) y flechas + Z X C, activos a la vez ----------
// Mientras el juego tenga WASD en KEYMAP, 'teclado' es el dibujo WASD y 'flechas' el de flechas. Muestra el último
// esquema que se tocó: lo anota este keydown (las teclas de los dos, como ESPACIO, 1–6, ESC y P, no lo cambian).
const CT_wasd=()=>typeof KEYMAP!=='undefined'&&KEYMAP.KeyW==='up'&&KEYMAP.KeyJ==='shoot';
let CT_esquema='wasd';
const CT_ESQ_W=new Set(['KeyW','KeyA','KeyS','KeyD','KeyJ','KeyK','KeyL','KeyQ','KeyE']),CT_ESQ_F=new Set(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyZ','KeyX','KeyC','Tab']);
addEventListener('keydown',e=>{if(CT_ESQ_W.has(e.code))CT_esquema='wasd';else if(CT_ESQ_F.has(e.code))CT_esquema='flechas';},true);
const CT_nombreVista=v=>v==='teclado'&&CT_wasd()?'TECLADO · WASD':CT_VISTAS[v];
let CTRL_man=null,CTRL_det=null,CTRL_t=0;
// ---------- qué control se está usando ----------
function CTRL_detectar(){
  try{
    if(typeof onTouch==='function'&&onTouch())return 'tactil';
    if(typeof kb2On==='function'&&kb2On())return 'dos';
    if(typeof onPad==='function'&&onPad())return 'pad';
    if(typeof controlesSimples!=='undefined'&&controlesSimples)return 'simples';
    if(CT_wasd()&&CT_esquema==='flechas')return 'flechas';
  }catch(e){}
  return 'teclado';
}
function CT_lista(){const l=CT_wasd()?['teclado','flechas','simples','dos','pad']:['teclado','simples','dos','pad'];if(window.OXIDO_TACTIL||CTRL_det==='tactil')l.push('tactil');return l;}
function CTRL_cambiar(d){
  const l=CT_lista(),cur=CTRL_man||CTRL_det||'teclado',i=Math.max(0,l.indexOf(cur));
  const nv=l[(i+d+l.length)%l.length];CTRL_man=nv===CTRL_det?null:nv;
  try{SFX.swap();}catch(e){}
}
function CTRL_teclas(){
  if(pressed.left){CTRL_cambiar(-1);return true;}
  if(pressed.right){CTRL_cambiar(1);return true;}
  return false;
}
// marca del joystick que se ve: el último que se tocó, si no cualquiera conectado, si no PlayStation
function CT_marca(){
  try{let d=devOf();if(d<0)d=devOf('pad');if(d>=0&&padInfo[d])return padInfo[d].brand;}catch(e){}
  return 'ps';
}
// ---------- dibujo en pixel ----------
function CT_osc(c){ // un tono más oscuro (para el canto de la tecla)
  const n=parseInt(c.slice(1),16),f=v=>Math.round(v*0.62);
  return '#'+((1<<24)|(f(n>>16&255)<<16)|(f(n>>8&255)<<8)|f(n&255)).toString(16).slice(1);
}
function CT_px(rows,x,y,col){ctx.fillStyle=col;rows.forEach((r,j)=>{for(let i=0;i<r.length;i++)if(r[i]==='#')ctx.fillRect(x+i,y+j,1,1);});}
const CT_FLECHA={up:["..#..",".###.","#####","..#..","..#.."],down:["..#..","..#..","#####",".###.","..#.."],
  left:["..#..",".##..","#####",".##..","..#.."],right:["..#..","..##.","#####","..##.","..#.."]};
// coma y punto, más grandes que los de la fuente (en una tecla chica se confundían)
const CT_SIGNO={',':['..','..','##','.#','#.'],'.':['..','..','..','##','##']};
// tecla: (x,y) arriba a la izquierda, alto 8 (7 de cara + 1 de canto). col = color de la acción o null (sin usar)
function CT_tecla(t){
  const {x,y,w,h,txt,col,fl}=t,on=!!col;
  ctx.fillStyle=CT_TINTA;ctx.fillRect(x-1,y-1,w+2,h+2);
  ctx.fillStyle=on?col:'#2b2535';ctx.fillRect(x,y,w,h);
  ctx.fillStyle=on?CT_osc(col):'#1e1928';ctx.fillRect(x,y+h-1,w,1);
  if(on){ctx.fillStyle='rgba(255,255,255,0.45)';ctx.fillRect(x,y,w,1);}
  const tc=on?CT_TINTA:'#564c66';
  if(fl)CT_px(CT_FLECHA[fl],x+Math.floor((w-5)/2),y+1,tc);
  else if(CT_SIGNO[txt])CT_px(CT_SIGNO[txt],x+Math.floor((w-2)/2),y+1,tc);
  else if(txt)pfTxt(txt,x+w/2,y+Math.floor((h-7)/2),tc,'center');
}
// líneas: tramos rectos de píxel a píxel; primero el contorno de todas, después el color (los cruces no se cortan)
function CT_lineas(ls,sinPunto){
  const tramos=(pts,fn)=>{for(let i=1;i<pts.length;i++){const[a,b]=[pts[i-1],pts[i]];
    fn(Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.abs(a[0]-b[0])+1,Math.abs(a[1]-b[1])+1);}};
  ctx.fillStyle=CT_TINTA;for(const l of ls)tramos(l.pts,(x,y,w,h)=>ctx.fillRect(x-1,y-1,w+2,h+2));
  for(const l of ls){ctx.fillStyle=l.col;tramos(l.pts,(x,y,w,h)=>ctx.fillRect(x,y,w,h));
    if(!sinPunto){const[a0,a1]=l.pts[0];ctx.fillRect(a0-1,a1-1,3,3);}} // puntito en la punta que toca la tecla
}
function CT_textos(ts){for(const t of ts)pfTxt(t.t,t.x,t.y,t.col,t.al||'left',CT_TINTA);}
// medidas de lo que se va a dibujar (para centrarlo y achicarlo si no entra)
function CT_caja(L){
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;const s=(a,b,c,d)=>{x0=Math.min(x0,a);y0=Math.min(y0,b);x1=Math.max(x1,c);y1=Math.max(y1,d);};
  for(const t of L.teclas||[])s(t.x-1,t.y-1,t.x+t.w+1,t.y+t.h+1);
  for(const t of L.textos||[]){const w=pfW(t.t),x=t.al==='center'?t.x-w/2:t.al==='right'?t.x-w:t.x;s(x-1,t.y,x+w+1,t.y+7);}
  for(const l of L.lineas||[])for(const[a,b]of l.pts)s(a-2,b-2,a+2,b+2);
  if(L.caja)s(...L.caja);
  return{x0,y0,x1,y1,w:x1-x0,h:y1-y0};
}
// ---------- teclado ----------
// Esqueleto de teclado (solo la zona que se usa): fila de números, Q…, A…, Z… y la barra; las flechas aparte.
// cols: cuántas teclas de letra por fila. Devuelve las teclas por nombre (R) para colgarles las líneas.
function CT_teclado(cols,ax){
  const R={},add=(id,x,y,w,txt,fl)=>{R[id]={id,x,y,w,h:8,txt,fl,col:null,cx:x+(w>>1),cy:y+3,r:x+w,b:y+8};};
  add('ESC',0,0,11,'ESC');
  '123456'.split('').forEach((c,i)=>add(c,13+i*9,0,8,c));
  add('TAB',0,9,13,'TAB');'QWERTYUIOP'.slice(0,cols[0]).split('').forEach((c,i)=>add(c,15+i*9,9,8,c));
  add('CAPS',0,18,15,'');'ASDFGHJKL'.slice(0,cols[1]).split('').forEach((c,i)=>add(c,17+i*9,18,8,c));
  add('SHIFT',0,27,19,'');['Z','X','C','V','B','N','M','COMMA','PERIOD'].slice(0,cols[2]).forEach((c,i)=>
    add(c,21+i*9,27,8,c==='COMMA'?KB_NOMBRE.Comma:c==='PERIOD'?KB_NOMBRE.Period:c));
  add('SPACE',24,36,40,'ESPACIO');
  add('UP',ax+9,27,8,'','up');add('LEFT',ax,36,8,'','left');add('DOWN',ax+9,36,8,'','down');add('RIGHT',ax+18,36,8,'','right');
  return R;
}
const CT_izq=(R,id,col,t,ty)=>({lineas:[{col,pts:[[R[id].x-2,R[id].cy],[-4,R[id].cy]]}],textos:[{t,x:-6,y:(ty??R[id].cy)-3,col,al:'right'}]});
function CT_juntar(...ps){const L={teclas:[],lineas:[],textos:[]};for(const p of ps){if(!p)continue;for(const k of ['teclas','lineas','textos'])if(p[k])L[k].push(...p[k]);}return L;}
// flechas: ↑ a la derecha, → a la derecha, ↓ por abajo y a la derecha
function CT_flechas(R,ax,col,tUp,tRight,tDown,subUp){
  const lx=ax+31,o={lineas:[],textos:[]};
  // con un texto chico abajo (simples: "mantener: volar"), ↑ sale por arriba para dejarle lugar
  const uy=subUp?R.UP.y-8:R.UP.cy;
  o.lineas.push({col,pts:subUp?[[R.UP.cx,R.UP.y-2],[R.UP.cx,uy],[lx,uy]]:[[R.UP.r+2,uy],[lx,uy]]});o.textos.push({t:tUp,x:lx+2,y:uy-3,col});
  if(subUp)o.textos.push({t:subUp,x:lx+2,y:uy+4,col:CT_SUB});
  o.lineas.push({col,pts:[[R.RIGHT.r+2,R.RIGHT.cy],[lx,R.RIGHT.cy]]});o.textos.push({t:tRight,x:lx+2,y:R.RIGHT.cy-3,col});
  o.lineas.push({col,pts:[[R.DOWN.cx,R.DOWN.b+2],[R.DOWN.cx,R.DOWN.b+6],[lx,R.DOWN.b+6]]});o.textos.push({t:tDown,x:lx+2,y:R.DOWN.b+3,col});
  return o;
}
// ---------- teclado con teclas reasignadas (OPCIONES → CONTROLES → TECLAS, reasignar.js) ----------
// Si las teclas son las de fábrica, va el dibujo armado a mano (CT_layoutTeclado). Si alguien las cambió, se arma
// solo: el teclado crece hasta la tecla más lejana que se use, cada acción en su color, y las etiquetas van a los
// costados (las de la mitad izquierda a la izquierda, las otras a la derecha), ordenadas de arriba abajo.
const CT_KB0={jump:['KeyX','Space'],shoot:['KeyZ'],bomb:['KeyC'],air:['KeyS','Tab'],left:['ArrowLeft'],right:['ArrowRight'],up:['ArrowUp'],down:['ArrowDown']};
const CT_KBACC=[['jump','sal','SALTAR'],['shoot','dis','DISPARAR'],['bomb','gra','GRANADA'],['air','arm','CAMBIAR ARMA','MANTENER: RUEDA'],
  ['armaAnt','arm','ARMA ANTERIOR','MANTENER: RUEDA'],['armaSig','arm','ARMA SIGUIENTE','MANTENER: RUEDA'],
  ['up','mov','APUNTAR ARRIBA'],['left','mov','IZQUIERDA'],['right','mov','DERECHA'],['down','mov','AGACHARSE']];
const CT_teclasDe=a=>Object.keys(KEYMAP).filter(c=>KEYMAP[c]===a);
function CT_kbCambiado(){
  try{
    if(typeof REA_KEYMAP0!=='undefined'){ // las de fábrica que guarda reasignar.js (así sirve aunque cambien las de fábrica)
      for(const[a]of CT_KBACC){const t=CT_teclasDe(a).sort().join(),d=Object.keys(REA_KEYMAP0).filter(c=>REA_KEYMAP0[c]===a).sort().join();if(t!==d)return true;}
      return false;}
    for(const a in CT_KB0){const t=CT_teclasDe(a).sort().join(),d=[...CT_KB0[a]].sort().join();if(t!==d)return true;}
  }catch(e){}
  return false;
}
// filas del teclado por código de tecla
const CT_FILAS=[['Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','Digit8','Digit9','Digit0'],
  ['KeyQ','KeyW','KeyE','KeyR','KeyT','KeyY','KeyU','KeyI','KeyO','KeyP'],
  ['KeyA','KeyS','KeyD','KeyF','KeyG','KeyH','KeyJ','KeyK','KeyL','Semicolon'],
  ['KeyZ','KeyX','KeyC','KeyV','KeyB','KeyN','KeyM','Comma','Period','Slash']];
const CT_PRE=[['Escape','ESC',11],['Tab','TAB',13],['CapsLock','',15],['ShiftLeft','',19]];
const CT_ARR={ArrowUp:'UP',ArrowLeft:'LEFT',ArrowDown:'DOWN',ArrowRight:'RIGHT'};
const CT_nomTecla=c=>typeof REA_nombre==='function'?REA_nombre(c):c.replace(/^Key|^Digit/,'');
function CT_layoutTecladoGen(){
  const C=CT_COL,usados={};
  for(const[a]of CT_KBACC)for(const c of CT_teclasDe(a))usados[c]=a;
  // cuántas teclas por fila (como mínimo las de siempre, hasta la más lejana que se use)
  const cols=CT_FILAS.map((f,r)=>{let n=r===0?6:6;f.forEach((c,i)=>{if(usados[c])n=Math.max(n,i+1);});return n;});
  const R={},add=(id,x,y,w,txt,fl)=>{R[id]={id,x,y,w,h:8,txt,fl,col:null,cx:x+(w>>1),cy:y+3,r:x+w,b:y+8};};
  CT_PRE.forEach(([id,t,w],r)=>add(id,0,r*9,w,t));
  CT_FILAS.forEach((f,r)=>f.slice(0,cols[r]).forEach((c,i)=>add(c,CT_PRE[r][2]+2+i*9,r*9,8,CT_nomTecla(c).slice(0,3))));
  const finFilas=Math.max(...Object.values(R).map(k=>k.r)),ax=Math.max(84,finFilas+10);
  add('Space',24,36,40,'ESPACIO');
  add('ArrowUp',ax+9,27,8,'','up');add('ArrowLeft',ax,36,8,'','left');add('ArrowDown',ax+9,36,8,'','down');add('ArrowRight',ax+18,36,8,'','right');
  // teclas usadas que no están en el dibujo (ENTER del numérico, etc.): al lado de la barra
  let xo=68;for(const c in usados)if(!R[c]){const t=CT_nomTecla(c),w=Math.max(8,pfW(t)+4);add(c,xo,36,w,t);xo+=w+2;}
  // fijas: ESC (pausa) y 1–6 (arma directa)
  R.Escape.col=C.pau;for(let i=1;i<=6;i++)R['Digit'+i].col=C.arm;
  const etiq=[];
  for(const[a,c,t,sub]of CT_KBACC){const ks=CT_teclasDe(a).filter(k=>R[k]);if(!ks.length)continue;
    for(const k of ks)R[k].col=C[c];
    const k0=R[ks[0]];etiq.push({k:k0,t,sub,col:C[c]});}
  const L={teclas:Object.values(R),lineas:[],textos:[],detras:true};
  // ESC y 1–6 como siempre
  const k1=R.Digit1,k6=R.Digit6,mid=(k1.cx+k6.cx)>>1,top=-3;
  L.lineas.push({col:C.arm,pts:[[k1.cx,top],[k6.cx,top]]},{col:C.arm,pts:[[mid,top-1],[mid,top-3]]});
  for(let i=1;i<=6;i++)L.lineas.push({col:C.arm,pts:[[R['Digit'+i].cx,top],[R['Digit'+i].cx,top+1]]});
  L.textos.push({t:'ARMA DIRECTA · 6: AVIÓN',x:mid,y:top-11,col:C.arm,al:'center'});
  // etiquetas a los costados
  const centro=(ax+26)/2,izq=[{k:R.Escape,t:'PAUSA (O P)',col:C.pau}],der=[];
  for(const e of etiq)(e.k.cx<centro?izq:der).push(e);
  // la línea sale de costado si entre la tecla y ese lado no hay otra tecla pintada en la misma fila; si hay, sale por
  // abajo hasta un carril debajo del teclado (uno por línea) y de ahí va al costado: así no tapa otras teclas usadas
  const bajo=Math.max(...Object.values(R).map(k=>k.b))+3;let carril=0;
  const libre=(k,esIzq)=>!Object.values(R).some(o=>o!==k&&o.col&&o.y===k.y&&(esIzq?o.x<k.x:o.x>k.x));
  const lado=(lista,esIzq)=>{
    lista.sort((a,b)=>a.k.cy-b.k.cy||a.k.x-b.k.x);
    const n=lista.length,xl=esIzq?-4-2*n:ax+30+2*n;let yy=-100;
    lista.forEach((e,i)=>{const ty=Math.max(yy,e.k.cy-3),ly=ty+3;yy=ty+(e.sub?13:7);
      const bus=esIzq?-2-2*i:ax+28+2*i,x0=esIzq?e.k.x-2:e.k.r+2;
      if(libre(e.k,esIzq))L.lineas.push({col:e.col,pts:[[x0,e.k.cy],[bus,e.k.cy],[bus,ly],[xl,ly]]});
      else{const cy=bajo+2*carril++;L.lineas.push({col:e.col,pts:[[e.k.cx,e.k.b+2],[e.k.cx,cy],[bus,cy],[bus,ly],[xl,ly]]});}
      L.textos.push({t:e.t,x:esIzq?xl-2:xl+2,y:ty,col:e.col,al:esIzq?'right':'left'});
      if(e.sub)L.textos.push({t:e.sub,x:esIzq?xl-2:xl+2,y:ty+6,col:CT_SUB,al:esIzq?'right':'left'});});
  };
  lado(izq,true);lado(der,false);
  L.textos.push({t:'TECLAS CAMBIADAS EN OPCIONES',x:centro,y:bajo+2*carril+3,col:CT_SUB,al:'center'});
  return L;
}
function CT_layoutTeclado(){
  if(typeof KEYMAP!=='undefined'&&CT_kbCambiado())return CT_layoutTecladoGen();
  const ax=84,R=CT_teclado([6,6,6],ax),C=CT_COL,pinta=(c,...ids)=>ids.forEach(i=>R[i].col=c);
  const conS=typeof KEYMAP==='undefined'||KEYMAP.KeyS==='air'; // con WASD, la S es abajo y ya no cambia de arma
  // Z, X y C: el color y el texto salen de lo que hace cada una en KEYMAP (por si cambian las de fábrica, ej. Z saltar
  // y X disparar); la línea de cada una sale siempre por el mismo lado (Z a la izquierda, X abajo, C a la derecha)
  const ACC={shoot:[C.dis,'DISPARAR'],jump:[C.sal,typeof KEYMAP!=='undefined'&&KEYMAP.Space==='jump'?'SALTAR (O ESPACIO)':'SALTAR'],bomb:[C.gra,'GRANADA']};
  const de=c=>ACC[typeof KEYMAP!=='undefined'?KEYMAP[c]:{KeyZ:'shoot',KeyX:'jump',KeyC:'bomb'}[c]]||[null,null];
  const[cZ,tZ]=de('KeyZ'),[cX,tX]=de('KeyX'),[cC,tC]=de('KeyC');
  pinta(C.pau,'ESC');pinta(C.arm,'1','2','3','4','5','6','TAB');if(conS)pinta(C.arm,'S');R.Z.col=cZ;R.X.col=cX;R.C.col=cC;
  pinta(C.mov,'UP','LEFT','DOWN','RIGHT');
  const k1=R['1'],k6=R['6'],mid=(k1.cx+k6.cx)>>1,top=-3;
  const ticks=['1','2','3','4','5','6'].map(i=>({col:C.arm,pts:[[R[i].cx,top],[R[i].cx,top+1]]}));
  return CT_juntar({teclas:Object.values(R)},
    CT_izq(R,'ESC',C.pau,'PAUSA (O P)'),
    CT_izq(R,'TAB',C.arm,'CAMBIAR ARMA'),
    {textos:[{t:'MANTENER: RUEDA',x:-6,y:R.TAB.cy+4,col:CT_SUB,al:'right'}],
      lineas:conS?[{col:C.arm,pts:[[R.S.x-2,R.S.cy],[-2,R.S.cy],[-2,R.TAB.cy]]}]:[]},
    cZ&&CT_izq(R,'Z',cZ,tZ),
    cX&&{lineas:[{col:cX,pts:[[R.X.cx,R.X.b+2],[R.X.cx,49]]}],textos:[{t:tX,x:R.X.cx,y:50,col:cX,al:'center'}]},
    cC&&{lineas:[{col:cC,pts:[[R.C.r+2,R.C.cy],[ax-7,R.C.cy],[ax-7,55],[ax-5,55]]}],textos:[{t:tC,x:ax-3,y:52,col:cC}]},
    {lineas:[{col:C.arm,pts:[[k1.cx,top],[k6.cx,top]]},{col:C.arm,pts:[[mid,top-1],[mid,top-3]]},...ticks],
      textos:[{t:'ARMA DIRECTA · 6: AVIÓN',x:mid,y:top-11,col:C.arm,al:'center'}]},
    CT_flechas(R,ax,C.mov,'APUNTAR ARRIBA','MOVER','AGACHARSE'));
}
// WASD + J K L: la mano izquierda en W A S D (y Q E para el arma), la derecha en J K L
function CT_layoutWASD(){
  if(CT_kbCambiado())return CT_layoutTecladoGen();
  const R=CT_teclado([10,9,7],300),C=CT_COL,pinta=(c,...ids)=>ids.forEach(i=>R[i].col=c);
  for(const k of ['UP','LEFT','DOWN','RIGHT'])delete R[k]; // las flechas van en su propia vista
  pinta(C.pau,'ESC','P');pinta(C.arm,'1','2','3','4','5','6','Q','E');pinta(C.mov,'W','A','S','D');
  pinta(C.dis,'J');pinta(C.sal,'K','SPACE');pinta(C.gra,'L');
  const k1=R['1'],k6=R['6'],mid=(k1.cx+k6.cx)>>1,top=-3,xr=R.L.r+8,A=R.A,J=R.J,K=R.K,L=R.L;
  const ticks=['1','2','3','4','5','6'].map(i=>({col:C.arm,pts:[[R[i].cx,top],[R[i].cx,top+1]]}));
  return CT_juntar({teclas:Object.values(R)},
    CT_izq(R,'ESC',C.pau,'PAUSA (O P)'),
    CT_izq(R,'Q',C.arm,'Q ANTERIOR · E SIGUIENTE'),{textos:[{t:'MANTENER: RUEDA',x:-6,y:R.Q.cy+4,col:CT_SUB,al:'right'}]},
    // W A S D: la línea sale de A por abajo (a la izquierda de la barra) para no cruzar Q ni la barra
    {lineas:[{col:C.mov,pts:[[A.cx-3,A.b+2],[A.cx-3,47],[-4,47]]}],
      textos:[{t:'MOVER Y APUNTAR',x:-6,y:44,col:C.mov,al:'right'},{t:'W ARRIBA · S AGACHARSE',x:-6,y:50,col:CT_SUB,al:'right'}]},
    {lineas:[{col:C.gra,pts:[[L.r+2,L.cy],[xr-2,L.cy]]}],textos:[{t:'GRANADA',x:xr,y:L.cy-3,col:C.gra}]},
    // K y la barra: las dos saltan (la barra se une a la línea de K)
    {lineas:[{col:C.sal,pts:[[K.cx,K.b+2],[K.cx,47],[xr-2,47]]},{col:C.sal,pts:[[R.SPACE.r+2,R.SPACE.cy],[K.cx,R.SPACE.cy]]}],
      textos:[{t:'SALTAR (O ESPACIO)',x:xr,y:44,col:C.sal}]},
    {lineas:[{col:C.dis,pts:[[J.cx-2,J.b+2],[J.cx-2,55],[xr-2,55]]}],textos:[{t:'DISPARAR',x:xr,y:52,col:C.dis}]},
    {textos:[{t:'MANO IZQUIERDA',x:R.D.r,y:58,col:CT_SUB,al:'right'},{t:'MANO DERECHA',x:J.x-6,y:62,col:CT_SUB,al:'left'}]},
    {lineas:[{col:C.arm,pts:[[k1.cx,top],[k6.cx,top]]},{col:C.arm,pts:[[mid,top-1],[mid,top-3]]},...ticks],
      textos:[{t:'ARMA DIRECTA · 6: AVIÓN',x:mid,y:top-11,col:C.arm,al:'center'}]});
}
function CT_layoutSimples(){
  const ax=84,R=CT_teclado([6,6,6],ax),C=CT_COL,pinta=(c,...ids)=>ids.forEach(i=>R[i].col=c);
  pinta(C.pau,'ESC');pinta(C.dis,'Z');pinta(C.gra,'X');pinta(C.mov,'LEFT','DOWN','RIGHT');pinta(C.sal,'UP');
  const f=CT_flechas(R,ax,C.mov,'SALTAR','MOVER','AGACHARSE · ×2 BAJAR','MANTENER: VOLAR');
  f.lineas[0].col=C.sal;f.textos[0].col=C.sal;
  return CT_juntar({teclas:Object.values(R)},
    CT_izq(R,'ESC',C.pau,'PAUSA (O P)'),
    CT_izq(R,'Z',C.dis,'DISPARAR'),{textos:[{t:'APUNTA SOLO',x:-6,y:R.Z.cy+4,col:CT_SUB,al:'right'}]},
    {lineas:[{col:C.gra,pts:[[R.X.cx,R.X.b+2],[R.X.cx,49]]}],textos:[{t:'GRANADA',x:R.X.cx,y:50,col:C.gra,al:'center'}]},
    f);
}
function CT_layoutDos(){
  const ax=108,R=CT_teclado([8,8,9],ax),c1=P_COL[0],c2=P_COL[1],pinta=(c,...ids)=>ids.forEach(i=>R[i].col=c);
  pinta(c1,'W','A','S','D','F','G');pinta(c2,'UP','LEFT','DOWN','RIGHT','COMMA','PERIOD');pinta(CT_COL.pau,'ESC');
  const lx=ax+31;
  return CT_juntar({teclas:Object.values(R)},
    {textos:[{t:'JUGADOR 1',x:-6,y:-17,col:c1,al:'right'},{t:'JUGADOR 2',x:lx+2,y:-17,col:c2}]},
    CT_izq(R,'ESC',CT_COL.pau,'PAUSA'),
    CT_izq(R,'W',c1,'SALTAR'),
    CT_izq(R,'A',c1,'MOVER (A D)'),
    {lineas:[{col:c1,pts:[[R.S.cx,R.S.b+2],[R.S.cx,53],[-4,53]]}],textos:[{t:'AGACHARSE',x:-6,y:50,col:c1,al:'right'}]},
    {lineas:[{col:c1,pts:[[R.F.cx,R.F.y-2],[R.F.cx,-4],[-4,-4]]}],textos:[{t:'DISPARAR',x:-6,y:-7,col:c1,al:'right'}]},
    {lineas:[{col:c1,pts:[[R.G.cx,R.G.y-2],[R.G.cx,-4],[R.G.cx+12,-4]]}],textos:[{t:'GRANADA',x:R.G.cx+14,y:-7,col:c1}]},
    {lineas:[{col:c2,pts:[[R.COMMA.cx,R.COMMA.b+2],[R.COMMA.cx,47],[71,47]]}],textos:[{t:'GRANADA',x:69,y:44,col:c2,al:'right'}]},
    {lineas:[{col:c2,pts:[[R.PERIOD.cx,R.PERIOD.b+2],[R.PERIOD.cx,54],[71,54]]}],textos:[{t:'DISPARAR',x:69,y:51,col:c2,al:'right'}]},
    CT_flechas(R,ax,c2,'SALTAR','MOVER','AGACHARSE'),
    {textos:[{t:'APUNTAN SOLOS',x:lx+2,y:-8,col:CT_SUB}]});
}
// ---------- joystick genérico ----------
let CT_cuerpo=null;
// cuerpo del joystick: un lienzo de 1 px por unidad (contorno, brillo arriba y sombra abajo), se arma una vez
function CT_cuerpoPad(){
  if(CT_cuerpo)return CT_cuerpo;
  const W0=100,H0=50,c=document.createElement('canvas');c.width=W0;c.height=H0;const g=c.getContext('2d');
  const rr=(x,y,x0,y0,x1,y1,r)=>{const cx=Math.max(x0+r,Math.min(x,x1-r)),cy=Math.max(y0+r,Math.min(y,y1-r));return (x-cx)**2+(y-cy)**2<=r*r;};
  const el=(x,y,cx,cy,rx,ry)=>((x-cx)/rx)**2+((y-cy)/ry)**2<=1;
  const dentro=(x,y)=>{x+=0.5;y+=0.5;return rr(x,y,12,6,85,28,6)||el(x,y,20.5,30,13,15)||el(x,y,76.5,30,13,15);};
  for(let y=0;y<H0;y++)for(let x=0;x<W0;x++){
    if(dentro(x,y)){g.fillStyle=y<9?'#7a7090':y>38?'#3e374a':'#5a5268';g.fillRect(x,y,1,1);}
    else if(dentro(x-1,y)||dentro(x+1,y)||dentro(x,y-1)||dentro(x,y+1)){g.fillStyle=CT_TINTA;g.fillRect(x,y,1,1);}}
  return CT_cuerpo=c;
}
// disco de 7 × 7 con las esquinas recortadas (botones de la cara)
function CT_disco(cx,cy,col){
  ctx.fillStyle=CT_TINTA;ctx.fillRect(cx-2,cy-4,5,9);ctx.fillRect(cx-3,cy-3,7,7);ctx.fillRect(cx-4,cy-2,9,5);
  ctx.fillStyle=col;ctx.fillRect(cx-1,cy-3,3,7);ctx.fillRect(cx-2,cy-2,5,5);ctx.fillRect(cx-3,cy-1,7,3);
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.fillRect(cx-1,cy-3,3,1);
}
const CT_SIMB={'✕':["#...#",".#.#.","..#..",".#.#.","#...#"],'○':[".###.","#...#","#...#","#...#",".###."],
  '□':["#####","#...#","#...#","#...#","#####"],'△':["..#..",".#.#.",".#.#.","#...#","#####"]};
function CT_boton(cx,cy,nom,col){
  CT_disco(cx,cy,col);
  if(CT_SIMB[nom])CT_px(CT_SIMB[nom],cx-2,cy-2,CT_TINTA);else pfTxt(nom,cx+0.5,cy-3,CT_TINTA,'center');
}
function CT_rect(x,y,w,h,col){ctx.fillStyle=CT_TINTA;ctx.fillRect(x-1,y-1,w+2,h+2);ctx.fillStyle=col;ctx.fillRect(x,y,w,h);
  if(col!=='#3a3446'){ctx.fillStyle='rgba(255,255,255,0.4)';ctx.fillRect(x,y,w,1);}}
// qué hace cada botón del joystick (con lo reasignado en OPCIONES → CONTROLES → JOYSTICK, reasignar.js):
// índice del botón → {col, t (acción), sub}. Sin reasignar: ✕ saltar, ○ granada, □ disparar, △ arma (mantener: rueda),
// L1 arma anterior, R1 arma siguiente, R2 disparar, L2 granada, L3 avión (R2 y L2 dejan de disparar o tirar si esa
// acción se mueve a otro botón).
const CT_PADACC={jump:['sal','SALTAR'],shoot:['dis','DISPARAR'],bomb:['gra','GRANADA'],swap:['arm','CAMBIAR ARMA','MANTENER: RUEDA'],air:['arm','AVIÓN'],
  ant:['arm','ARMA ANTERIOR'],sig:['arm','ARMA SIGUIENTE']};
function CT_padMapa(){
  const RB=(a,d)=>typeof REA_boton==='function'?REA_boton(a,d):d,RC=a=>typeof REA_padCambiado==='function'&&REA_padCambiado(a);
  const m={},pon=(i,a)=>{if(m[i])return;const[c,t,sub]=CT_PADACC[a];m[i]={col:CT_COL[c],t,sub};};
  // L1 y R1: arma anterior y siguiente, siempre (input.js: armaAnt/armaSig); el avión, en L3 (botón 10) si no se reasignó
  pon(4,'ant');pon(5,'sig');
  pon(RB('jump',0),'jump');pon(RB('shoot',2),'shoot');pon(RB('bomb',1),'bomb');pon(RB('swap',3),'swap');pon(RB('air',10),'air');
  if(!RC('shoot'))pon(7,'shoot');if(!RC('bomb'))pon(6,'bomb');
  return m;
}
function CT_layoutPad(){
  const n=PAD_LBL[CT_marca()]||PAD_LBL.ps,C=CT_COL,apag='#3a3446',M=CT_padMapa(),col=i=>M[i]?M[i].col:apag;
  // botones de la cara por POSICIÓN (abajo 0, derecha 1, izquierda 2, arriba 3): el símbolo es el del joystick,
  // el color y el texto son de lo que hace ese botón ahora
  const B={0:[74,24],1:[81,17],2:[67,17],3:[74,10]};
  const dib=()=>{
    CT_rect(15,0,13,5,col(6));CT_rect(68,0,13,5,col(7));         // L2 · R2 (atrás)
    CT_rect(12,3,19,5,col(4));CT_rect(65,3,19,5,col(5));         // L1 · R1
    ctx.drawImage(CT_cuerpoPad(),0,0);
    // cruz
    ctx.fillStyle=CT_TINTA;ctx.fillRect(15,14,15,7);ctx.fillRect(19,10,7,15);
    ctx.fillStyle=C.mov;ctx.fillRect(16,15,13,5);ctx.fillRect(20,11,5,13);ctx.fillStyle=CT_osc(C.mov);ctx.fillRect(21,16,3,3);
    // palancas: la izquierda mueve (y si se aprieta y tiene acción, el centro va en ese color); la derecha, solo si tiene
    const pal=(cx,cy,c,c2)=>{ctx.fillStyle=CT_TINTA;ctx.fillRect(cx-3,cy-5,7,11);ctx.fillRect(cx-5,cy-3,11,7);ctx.fillRect(cx-4,cy-4,9,9);
      ctx.fillStyle=c;ctx.fillRect(cx-2,cy-4,5,9);ctx.fillRect(cx-4,cy-2,9,5);ctx.fillRect(cx-3,cy-3,7,7);
      ctx.fillStyle=c2||(c===apag?'#4a4458':CT_osc(c));ctx.fillRect(cx-1,cy-1,3,3);};
    pal(36,31,C.mov,M[10]&&M[10].col);pal(60,31,col(11));
    CT_rect(40,9,4,3,apag);CT_rect(53,9,4,3,C.pau);              // CREATE · OPTIONS (fijos)
    for(const k of [0,1,2,3])CT_boton(...B[k],n[k],col(k));
  };
  const L={dib,caja:[0,0,100,50],teclas:[],lineas:[{col:C.mov,pts:[[14,17],[-4,17]]},{col:C.mov,pts:[[30,31],[-2,31],[-2,17]]},{col:C.pau,pts:[[55,7],[55,-6]]}],
    textos:[{t:'MOVER · APUNTAR',x:-6,y:14,col:C.mov,al:'right'},{t:n[9]+': PAUSA',x:55,y:-13,col:C.pau,al:'center'}]};
  const lin=(c,pts)=>L.lineas.push({col:c,pts}),tx=(t,x,y,c,al)=>L.textos.push({t,x,y,col:c,al});
  // hombros izquierdos
  if(M[4]){lin(M[4].col,[[10,5],[-4,5]]);tx(n[4]+': '+M[4].t,-6,2,M[4].col,'right');}
  if(M[6]){lin(M[6].col,[[13,1],[13,-2],[-4,-2]]);tx(n[6]+': '+M[6].t,-6,-5,M[6].col,'right');}
  // hombros derechos: juntos si hacen lo mismo
  if(M[5]&&M[7]&&M[5].t===M[7].t){const c=M[5].col;lin(c,[[82,1],[88,1]]);lin(c,[[85,5],[88,5],[88,-4],[100,-4]]);tx(n[5]+' '+n[7]+': '+M[5].t,102,-7,c);}
  else{if(M[7]){lin(M[7].col,[[82,1],[90,1],[90,-4],[100,-4]]);tx(n[7]+': '+M[7].t,102,-7,M[7].col);}
    if(M[5]){lin(M[5].col,[[85,5],[95,5],[95,-11],[100,-11]]);tx(n[5]+': '+M[5].t,102,-14,M[5].col);}}
  // botones de la cara
  if(M[3]){lin(M[3].col,[[79,10],[100,10]]);tx(M[3].t,102,7,M[3].col);if(M[3].sub)tx(M[3].sub,102,13,CT_SUB);}
  if(M[1]){lin(M[1].col,[[86,17],[95,17],[95,22],[100,22]]);tx(M[1].t,102,19,M[1].col);}
  if(M[0]){lin(M[0].col,[[79,24],[93,24],[93,29],[100,29]]);tx(M[0].t,102,26,M[0].col);}
  if(M[2]){lin(M[2].col,[[67,22],[67,52]]);tx(M[2].t,67,53,M[2].col,'center');}
  // palancas apretadas (L3 y R3), solo si tienen una acción
  if(M[10]){lin(M[10].col,[[36,37],[36,44],[-4,44]]);tx('APRETAR: '+M[10].t,-6,41,M[10].col,'right');}
  if(M[11]){lin(M[11].col,[[56,36],[56,46],[40,46]]);tx('APRETAR: '+M[11].t,38,43,M[11].col,'right');}
  return L;
}
// ---------- pantalla táctil ----------
// colores de los botones reales de tactil.js (✕ azul, ○ rojo, □ rosa, △ verde)
const CT_TCOL={x:'#8cc0ff',o:'#ff7a7a',c:'#ffaae4',t:'#60eec0'};
// △ depende de la opción RUEDA (accesible.js): MANTENER = tocar cambia de arma y mantener abre la rueda; TOCAR = tocar
// abre o cierra la rueda y deslizar el dedo a un costado cambia de arma (se dibujan flechitas ◀ ▶ junto al botón)
const CT_ruedaTocar=()=>typeof ACC!=='undefined'&&ACC&&ACC.rueda==='tocar';
const CT_TACC={x:['✕','SALTAR'],o:['○','GRANADA'],c:['□','DISPARAR'],
  get t(){return CT_ruedaTocar()?['△','TOCAR: RUEDA · DESLIZAR: ARMA']:['△','ARMA · MANTENER: RUEDA'];}};
// flechitas de deslizar a los costados, que se abren y cierran (cx, cy = centro)
function CT_deslizar(cx,cy,col){
  const t=typeof T==='number'?T:0,d=(t>>3)%3;
  CT_px(["..#",".##","###",".##","..#"],Math.round(cx-6-d),Math.round(cy-2),col);
  CT_px(["#..","##.","###","##.","#.."],Math.round(cx+4+d),Math.round(cy-2),col);
  ctx.fillStyle=col;ctx.fillRect(Math.round(cx-2),Math.round(cy),5,1);
}
// posiciones de los botones en pantalla, en coordenadas del juego: {x,o,c,t,pausa,palanca} con {x,y,r} cada uno
function CTRL_tactilPos(){
  try{
    const p=window.OXIDO_TACTIL_POS;if(p)return typeof p==='function'?p():p;
    const raiz=document.getElementById('tactil');if(!raiz||!raiz.classList.contains('on'))return null;
    const r=cv.getBoundingClientRect(),k=r.width/W;if(!k)return null;
    const de=el=>{if(!el)return null;const b=el.getBoundingClientRect();if(!b.width)return null;
      return{x:(b.left+b.width/2-r.left)/k,y:(b.top+b.height/2-r.top)/k,r:b.width/2/k,cx:b.left+b.width/2};};
    const o={};for(const t of ['x','o','c','t'])o[t]=de(raiz.querySelector('.b.ps.'+t));
    if(!o.x||!o.o||!o.c||!o.t)return null;
    o.pausa=de(raiz.querySelector('.b.pausa'));
    o.palanca=de(raiz.querySelector('.base'));
    if(!o.palanca){ // en la pausa la palanca está escondida: queda en espejo del rombo, a la misma altura
      const cxR=(o.c.cx+o.o.cx)/2,cy=o.o.y,rad=o.x.r*1.6;o.palanca={x:(innerWidth-cxR-r.left)/k,y:cy,r:rad};}
    return o;
  }catch(e){return null;}
}
// con los controles a la vista: etiquetas dentro de la tarjeta y líneas hasta los botones de verdad (fuera del
// lienzo, en las barras negras: la línea llega al borde con una flechita)
// botones en las barras negras, fuera del lienzo (iPad, pantallas anchas): etiquetas en la tarjeta y líneas que
// llegan al borde con una flechita
function CT_tactilBarras(x,y,w,h,pos){
  const HCv=typeof HC==='number'?HC:H,lab=[],cxm=x+w/2;
  for(const k of ['x','o','c','t'])if(pos[k])lab.push({k,p:pos[k],t:CT_TACC[k][1],sim:CT_TACC[k][0],col:CT_TCOL[k]});
  if(pos.palanca)lab.push({k:'pal',p:pos.palanca,t:'MOVER · APUNTAR',col:CT_COL.mov});
  if(pos.pausa&&state==='play')lab.push({k:'pau',p:pos.pausa,t:'PAUSA',col:CT_COL.pau}); // el II solo se ve jugando
  const orden=(a,b)=>Math.round(a.p.y-b.p.y)||a.p.x-b.p.x; // misma altura: primero el de más adentro
  const lados={der:lab.filter(l=>l.p.x>=cxm).sort(orden),izq:lab.filter(l=>l.p.x<cxm).sort(orden)};
  const ls=[],ts=[],flechas=[];
  for(const lado of ['der','izq']){const L=lados[lado];let yy=y+12;
    L.forEach((l,i)=>{
      // sin pasarse del borde de abajo de la tarjeta: las de más abajo se apilan hacia arriba
      const tope=y+h-9-(L.length-1-i)*10;
      const ty=Math.max(yy,Math.min(tope,Math.round(l.p.y)-3));yy=ty+10;
      const tw=pfW(l.t)+(l.sim?7:0),der=lado==='der';
      const tx=der?x+w-8:x+8,ly=ty+3,x0=der?tx+3:tx-3;
      const bx=Math.round(Math.max(2,Math.min(W-3,l.p.x))),by=Math.round(Math.max(2,Math.min(HCv-3,l.p.y)));
      const bus=der?Math.max(x0+3,Math.min(W-6-i*3,bx)):Math.min(x0-3,Math.max(5+i*3,bx));
      ls.push({col:l.col,pts:[[x0,ly],[bus,ly],[bus,by],[bx,by]]});
      ts.push({t:(l.sim?l.sim+' ':'')+l.t,x:tx,y:ty,col:l.col,al:der?'right':'left',sim:l.sim});
      if(l.p.x>W-3)flechas.push([W-3,by,'right',l.col]);else if(l.p.x<2)flechas.push([2,by,'left',l.col]);
      else if(l.p.y>HCv-3)flechas.push([bx,HCv-3,'down',l.col]);
      else flechas.push(['aro',l.p,l.col]);});}
  CT_lineas(ls,true);
  for(const f of flechas){
    if(f[0]==='aro'){const p=f[1];ctx.strokeStyle=CT_TINTA;ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,p.r+2,0,Math.PI*2);ctx.stroke();
      ctx.strokeStyle=f[2];ctx.lineWidth=1;ctx.stroke();continue;}
    const[fx,fy,dir,col]=f,sp=dir==='right'?["#..","##.","###","##.","#.."]:dir==='left'?["..#",".##","###",".##","..#"]:["#####",".###.","..#.."];
    const ox=dir==='down'?fx-2:dir==='right'?fx-1:fx-1,oy=dir==='down'?fy-1:fy-2;
    CT_px(sp,ox,oy,col);}
  for(const t of ts)CT_txtSimb(t);
  pfTxt('EN EL JUEGO',cxm,y+3,CT_SUB,'center',CT_TINTA);
}
// ---------- con los controles a la vista ----------
// Si el rombo está sobre el lienzo (celulares: los botones tapan el borde del juego), cada etiqueta va AFUERA:
// a la izquierda de todo el rombo (con 9 de aire: el aro del botón real es más grueso que r), a la altura de su botón,
// alineada a la derecha, y la línea llega al borde del botón
// (no al centro). ○ (el de la derecha) va por el hueco entre □ y ✕ y entra a su botón por abajo. La palanca, con la
// etiqueta a su derecha. Si los botones están en las barras negras, fuera del lienzo, va CT_tactilBarras.
function CT_tactilReal(x,y,w,h,pos){
  const HCv=typeof HC==='number'?HC:H,R=['x','o','c','t'].map(k=>pos[k]).filter(Boolean);
  const fuera=p=>p.x-p.r>=W-1||p.y-p.r>=HCv-1||p.x+p.r<=1;
  if(R.length<4||R.every(fuera))return CT_tactilBarras(x,y,w,h,pos);
  const{x:X,o:O,c:Cc,t:Tt}=pos,ls=[],ts=[],aros=[],flechas=[];
  const izqRombo=Math.min(Cc.x-Cc.r,X.x-X.r,Tt.x-Tt.r),tr=Math.min(x+w-8,Math.floor(izqRombo)-9),s0=tr+2;
  // las etiquetas no bajan del borde de la tarjeta (abajo puede haber otras cosas de la pantalla, como los botones de
  // la pausa o el texto de CÓMO JUGAR): si el botón está más abajo, la línea baja hasta él
  const ymax=y+h-6,borde=p=>Math.round(p.x-p.r-1),yy=v=>Math.round(Math.max(y+9,Math.min(ymax,v)));
  const pon=(k,ly,pts)=>{ls.push({col:CT_TCOL[k],pts});ts.push({t:CT_TACC[k][0]+' '+CT_TACC[k][1],sim:CT_TACC[k][0],x:tr,y:ly-3,col:CT_TCOL[k],al:'right'});};
  const a=(k,P,ly)=>{const ex=borde(P),py=Math.round(P.y);pon(k,ly,ly===py?[[s0,ly],[ex,ly]]:[[s0,ly],[ex-3,ly],[ex-3,py],[ex,py]]);};
  // de abajo para arriba, cada etiqueta al menos 8 por encima de la de abajo
  const yX=yy(X.y),yC=Math.min(yy(Cc.y),yX-9),yO=Math.min(yy((Tt.y+Cc.y)/2),yC-8),yT=Math.min(yy(Tt.y),yO-8);
  a('t',Tt,yT);
  // ○ (el de la derecha) va por el hueco entre △ y □ y entra a su botón por arriba
  {const ox=Math.round(Math.min(O.x,W-3)),adentro=O.x<=W-3,oy=adentro?Math.round(O.y-O.r-1):Math.round(O.y),hy=Math.round((Tt.y+Cc.y)/2);
    pon('o',yO,yO===hy?[[s0,yO],[ox,yO],[ox,oy]]:[[s0,yO],[s0+2,yO],[s0+2,hy],[ox,hy],[ox,oy]]);if(!adentro)flechas.push([W-3,oy,'right',CT_TCOL.o]);}
  a('c',Cc,yC);
  a('x',X,yX);
  for(const p of R)if(!fuera(p))aros.push(p);
  const desl=CT_ruedaTocar()&&!fuera(Tt);
  // palanca: etiqueta a su derecha (si está fuera del lienzo, a la izquierda de la tarjeta con flechita)
  const P0=pos.palanca;
  if(P0){const ly=yy(P0.y),der=Math.round(P0.x+P0.r);
    if(der>2){const lx=Math.max(x+8,der+6),py=Math.round(P0.y);ls.push({col:CT_COL.mov,pts:ly===py?[[der+1,ly],[lx-2,ly]]:[[der+1,py],[der+3,py],[der+3,ly],[lx-2,ly]]});aros.push(P0);
      ts.push({t:'MOVER · APUNTAR',x:lx,y:ly-3,col:CT_COL.mov,al:'left'});}
    else{const lx=x+8;ls.push({col:CT_COL.mov,pts:[[lx-2,ly],[2,ly]]});flechas.push([2,ly,'left',CT_COL.mov]);
      ts.push({t:'MOVER · APUNTAR',x:lx,y:ly-3,col:CT_COL.mov,al:'left'});}}
  CT_lineas(ls,true);
  for(const p of aros){ctx.strokeStyle=CT_TINTA;ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,p.r+1.5,0,Math.PI*2);ctx.stroke();}
  for(const[fx,fy,dir,col]of flechas)CT_px(dir==='right'?["#..","##.","###","##.","#.."]:["..#",".##","###",".##","..#"],fx-1,fy-2,col);
  if(desl)CT_deslizar(Tt.x,Tt.y-Tt.r-5,CT_TCOL.t); // arriba de △: deslizar cambia de arma
  for(const t of ts)CT_txtSimb(t);
  pfTxt('EN EL JUEGO',x+w/2,y+3,CT_SUB,'center',CT_TINTA);
}
// texto que empieza con un símbolo ✕ ○ □ △: el símbolo en pixel y después las letras
function CT_txtSimb(t){
  if(!t.sim){pfTxt(t.t,t.x,t.y,t.col,t.al,CT_TINTA);return;}
  const resto=t.t.slice(2),w=pfW(resto)+7,x0=t.al==='right'?t.x-w:t.al==='center'?t.x-w/2:t.x;
  ctx.fillStyle=CT_TINTA;ctx.fillRect(Math.round(x0)-1,t.y,7,7);CT_px(CT_SIMB[t.sim],Math.round(x0),t.y+1,t.col);
  pfTxt(resto,x0+7,t.y,t.col,'left',CT_TINTA);
}
// sin los controles a la vista (o mirándolo desde la compu): un celular acostado con sus controles
function CT_layoutCelu(){
  const T2=CT_TCOL,C=CT_COL;
  const B={t:[131,37],o:[140,46],x:[131,55],c:[122,46]};
  const dib=()=>{
    ctx.fillStyle=CT_TINTA;ctx.fillRect(-1,2,148,71);ctx.fillRect(2,-1,142,77);
    ctx.fillStyle='#3a3446';ctx.fillRect(0,3,146,69);ctx.fillRect(3,0,140,75);
    ctx.fillStyle='#0b0a10';ctx.fillRect(5,4,136,67);
    // el juego en el medio (16:9) con un cielo y un piso de mentira; los botones se pegan al borde, como en un celular
    ctx.fillStyle='#2a2440';ctx.fillRect(14,4,117,67);ctx.fillStyle='#3e3456';ctx.fillRect(14,44,117,27);
    ctx.fillStyle='#5a4a3a';ctx.fillRect(14,60,117,11);
    // palanca
    ctx.fillStyle=CT_TINTA;ctx.fillRect(8,38,17,17);ctx.fillStyle='rgba(255,224,138,0.35)';ctx.fillRect(9,39,15,15);
    ctx.fillStyle=CT_TINTA;ctx.fillRect(12,42,9,9);ctx.fillStyle='#ffe08a';ctx.fillRect(13,43,7,7);
    // pausa
    ctx.fillStyle=CT_TINTA;ctx.fillRect(9,8,9,9);ctx.fillStyle='#3a3446';ctx.fillRect(10,9,7,7);
    ctx.fillStyle=C.pau;ctx.fillRect(11,10,2,5);ctx.fillRect(14,10,2,5);
    for(const k of ['t','o','x','c'])CT_boton(...B[k],CT_TACC[k][0],T2[k]);
    if(CT_ruedaTocar())CT_deslizar(B.t[0]-15,B.t[1],T2.t);
  };
  return {dib,caja:[-1,-1,147,76],teclas:[],
    lineas:[
      {col:T2.t,pts:[[131,32],[131,28],[150,28]]},
      {col:T2.o,pts:[[145,46],[150,46]]},
      {col:T2.x,pts:[[131,60],[131,64],[150,64]]},
      {col:T2.c,pts:[[122,51],[122,72],[150,72]]},
      {col:C.mov,pts:[[7,46],[-4,46]]},
      {col:C.pau,pts:[[8,12],[-4,12]]}],
    textos:[
      ...(CT_ruedaTocar()?[{t:'TOCAR: RUEDA',x:152,y:25,col:T2.t},{t:'DESLIZAR: ARMA',x:152,y:31,col:CT_SUB}]
        :[{t:'ARMA',x:152,y:25,col:T2.t},{t:'MANTENER: RUEDA',x:152,y:31,col:CT_SUB}]),
      {t:'GRANADA',x:152,y:43,col:T2.o},
      {t:'SALTAR',x:152,y:61,col:T2.x},
      {t:'DISPARAR',x:152,y:69,col:T2.c},
      {t:'MOVER',x:-6,y:43,col:C.mov,al:'right'},{t:'Y APUNTAR',x:-6,y:49,col:CT_SUB,al:'right'},
      {t:'PAUSA',x:-6,y:9,col:C.pau,al:'right'}]};
}
// ---------- la tarjeta ----------
function CTRL_vista(op){
  const now=performance.now();if(now-CTRL_t>400)CTRL_man=null; // se abrió otra vez: vuelve al control que se usa
  CTRL_t=now;const det=CTRL_detectar();if(det!==CTRL_det){CTRL_det=det;CTRL_man=null;}
  return (op&&op.vista)||CTRL_man||det;
}
function CTRL_dibujar(x,y,w,h,op){
  op=op||{};const vista=CTRL_vista(op);
  // con el dedo no hay ← → ni mouse para cambiar de vista: sin la fila de abajo
  const flechas=op.flechas!==false&&CTRL_det!=='tactil',pie=flechas?11:0;
  ctx.save();
  try{
    // táctil con los controles a la vista: tarjeta transparente que señala los botones reales
    const pos=vista==='tactil'&&CTRL_det==='tactil'?CTRL_tactilPos():null;
    if(op.fondo!==false){ctx.fillStyle=pos?'rgba(18,12,24,0.45)':'rgba(18,12,24,0.82)';ctx.fillRect(x,y,w,h);
      ctx.fillStyle='rgba(243,201,105,0.35)';ctx.fillRect(x,y,w,1);ctx.fillRect(x,y+h-1,w,1);}
    if(pos)CT_tactilReal(x,y,w,h-pie,pos);
    else{
      const L=vista==='simples'?CT_layoutSimples():vista==='dos'?CT_layoutDos():vista==='pad'?CT_layoutPad():vista==='tactil'?CT_layoutCelu():vista==='teclado'&&CT_wasd()?CT_layoutWASD():CT_layoutTeclado();
      const c=CT_caja(L),aw=w-8,ah=h-pie-6,s=Math.min(1,aw/c.w,ah/c.h);
      const ox=x+(w-c.w*s)/2-c.x0*s,oy=y+3+(ah-c.h*s)/2-c.y0*s;
      ctx.translate(s===1?Math.round(ox):ox,s===1?Math.round(oy):oy);if(s<1)ctx.scale(s,s);
      if(L.dib)L.dib();
      for(const t of L.teclas)CT_tecla(t);CT_lineas(L.lineas);
      // detras: las líneas pasan por encima de las teclas sin usar y por debajo de las usadas (teclado con teclas
      // cambiadas, donde una línea puede cruzar otra tecla pintada): se vuelven a dibujar las pintadas encima
      if(L.detras)for(const t of L.teclas)if(t.col)CT_tecla(t);
      CT_textos(L.textos);
    }
  }finally{ctx.restore();}
  if(flechas)CT_pie(x,y+h-pie,w,vista);
}
// "MOSTRANDO: TECLADO" con ◀ ▶ (teclado, joystick o mouse)
function CT_pie(x,y,w,vista){
  const t='MOSTRANDO: '+CT_nombreVista(vista),tw=pfW(t),cx=Math.round(x+w/2),b=(T>>4)%2,ty=y+2;
  const auto=vista===CTRL_det;
  pfTxt(t,cx,ty,auto?'#ffe08a':'#ddd','center',CT_TINTA);
  const ix=cx-tw/2-8-b,dx=cx+tw/2+5+b;
  CT_px(["..#",".##","###",".##","..#"],Math.round(ix),ty+1,'#ffe08a');CT_px(["#..","##.","###","##.","#.."],Math.round(dx),ty+1,'#ffe08a');
  if(typeof zona==='function'){zona(ix-3,ty-1,9,8,{clic:()=>CTRL_cambiar(-1)});zona(dx-3,ty-1,9,8,{clic:()=>CTRL_cambiar(1)});}
}
