'use strict';
// Óxido · OLIVER, el gato de la familia: dibujos de la apertura y del rescate (notas/guion/apertura.md).
// Va después de gatito.js, arte-historia.js y arte-caminatas.js. Estilo "Hondo": píxeles enteros, tinta completa, nada
// gira (cuadros dibujados). Mismos colores que el gato del juego (CAT_COL de gatito.js). Prefijo OLI_. Solo dibujo: la
// escena, la jaula de la arena, la caricia y la placa las arma Código.
// 1. COLLAR ROJO. OLI_collarPuesto(true | false): el gato del juego lleva el collar rojo (era verde) o va sin collar
//    (antes de que se lo devuelvan en M1). Arranca puesto. OLI_collarSuelto(x, yPiso): el collar tirado en el piso.
// 2. OLI_durmiendo(x, yPiso, {orejas, cara}): hecho un bollo sobre el cartel; orejas:true las para y abre un ojo.
// 3. OLI_engranajeGira(cx, cy, t, esc) y OLI_engranajeRompe(cx, cy, t, esc): el engranaje dorado entero girando (2
//    cuadros de dientes + la marca del eje en 4 lugares) y saliéndose de la pared: tiembla y se raja (t 0–10), CLAC
//    con destello (10–14) y los 10 dientes vuelan mientras el cuerpo sin dientes cae (14–70). esc = escala entera.
//    Rompe devuelve false cuando terminó.
// 4. OLI_mano(x, y, {oliver, t, largo}): un brazo de la banda que baja desde arriba (manga y guante) con OLIVER agarrado del
//    lomo, colgando con las patas abiertas. x, y = la mano. Con oliver:false, la mano sola (ya lo soltó).
// 5. OLI_jaula(x, yGancho, {largo, estado:'cerrada'|'abierta', t}): la jaula colgada de un gancho con cadena (largo =
//    px de cadena). Cerrada: OLIVER adentro SIN collar (se le cayó en la apertura; op.collar:true se lo pone), se hamaca 1 px. Abierta: el piso cuelga de la bisagra y no hay nadie.
//    OLI_JAULA = {w, h}: tamaño de la jaula (sin cadena), por si Código quiere bajarla hasta el piso.
// 6. OLI_sentado(x, yPiso, {cola:0|1, cara, ojo:'arriba'|'cerrado'}): sentado, con collar, mirando hacia arriba (placa
//    de misión cumplida); cola:1 es el segundo cuadro, moviendo la cola.
// 7. Gestos del personaje, con el personaje agachado al lado (lo dibuja Código): OLI_gesto(p, gx, gyPiso, {tipo:
//    'collar'|'caricia', t, cara}) dibuja a OLIVER sentado (ronroneando con los ojos cerrados en la caricia) y el brazo
//    del personaje (su manga y su piel) hasta el cuello del gato: en 'collar' lleva el collar en la mano y a los 30
//    cuadros queda puesto (clic chico); en 'caricia' la mano va y viene 2 px y sube un corazón rosa cada 40 cuadros.
const OLI_K='#17141f',OLI_ROJO='#d93a2b',OLI_ROJOL='#f06a50';
const OLI_red=()=>typeof MOV_reducido==='function'&&MOV_reducido();
const OLI_col=()=>typeof CAT_COL!=='undefined'?CAT_COL:{k:OLI_K,g:'#9aa0ad',G:'#5f6472',c:'#f1e4c6',o:'#e08a3c',e:'#a6f05a',n:'#ff8fa8',b:OLI_ROJO,w:'#ffffff'};
// grilla de letras → lienzo con tinta alrededor (R = collar rojo siempre; b = collar según esté puesto)
function OLI_lienzo(filas,extra,pal){
  const P={...OLI_col(),R:OLI_ROJO,L:OLI_ROJOL,...(pal||{})},h=filas.length,w=Math.max(...filas.map(f=>f.length)),g=[];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const ch=filas[y][x];g[y*w+x]=ch&&ch!=='.'&&P[ch]?P[ch]:null;}
  for(const[x,y,ch]of extra||[])if(x>=0&&y>=0&&x<w&&y<h)g[y*w+x]=ch==='.'?null:(P[ch]||null);
  const cv=document.createElement('canvas');cv.width=w+2;cv.height=h+2;const c=cv.getContext('2d');
  const at=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&g[y*w+x];
  for(let y=-1;y<=h;y++)for(let x=-1;x<=w;x++){const v=at(x,y);
    if(v){c.fillStyle=v;c.fillRect(x+1,y+1,1,1);}else if(at(x-1,y)||at(x+1,y)||at(x,y-1)||at(x,y+1)){c.fillStyle=OLI_K;c.fillRect(x+1,y+1,1,1);}}
  return cv;
}
const OLI_espejo=s=>{const c=document.createElement('canvas');c.width=s.width;c.height=s.height;const g=c.getContext('2d');g.translate(s.width,0);g.scale(-1,1);g.drawImage(s,0,0);return c;};
const OLI_CACHE=new Map();
function OLI_cv(clave,fn,cara){const k=clave+'|'+(cara<0?-1:1)+'|'+OLI_col().b;let c=OLI_CACHE.get(k);
  if(!c){c=fn();if(cara<0)c=OLI_espejo(c);if(OLI_CACHE.size>80)OLI_CACHE.clear();OLI_CACHE.set(k,c);}return c;}
const OLI_pon=(c,x,yPiso)=>ctx.drawImage(c,Math.round(x-c.width/2),Math.round(yPiso-c.height+1));
// ---------- 1 · el collar ----------
let OLI_conCollar=true;
function OLI_collarPuesto(on){OLI_conCollar=on!==false;if(typeof CAT_COL!=='undefined')CAT_COL.b=OLI_conCollar?OLI_ROJO:CAT_COL.g;}
OLI_collarPuesto(true);
function OLI_collarSuelto(x,yPiso){ // un aro rojo caído, con la hebilla clara
  OLI_pon(OLI_cv('suelto',()=>OLI_lienzo(['.LRR.','R...R','.RcR.'])),x,yPiso);}
// ---------- 2 · durmiendo sobre el cartel ----------
const OLI_DUERME=['............','...ggggg....','..gGgGggGggG','.ggggggbgkgg','.ggggggbcnc.','GGGgccccc...']; // hecho un bollo, la cola por delante
function OLI_durmiendo(x,yPiso,op){op=op||{};const o=!!op.orejas;
  OLI_pon(OLI_cv('duerme'+o,()=>OLI_lienzo(OLI_DUERME,o?[[8,0,'o'],[11,0,'g'],[8,1,'o'],[11,1,'g'],[8,2,'g'],[11,2,'g'],[9,3,'e']]:[]),op.cara),x,yPiso);}
// ---------- 6 · sentado mirando hacia arriba ----------
const OLI_SIENTA=['......o..g.','......gggg.','......gggg.','......gggn.','......gccc.','.....bbb...','..gggggc...','..gGgGgcc..','..gggggcg..','..ggccg.c..'];
function OLI_sentado(x,yPiso,op){op=op||{};const cola=op.cola?1:0,ojo=op.ojo==='cerrado'?'k':'e';
  OLI_pon(OLI_cv('sienta'+cola+ojo,()=>OLI_lienzo(OLI_SIENTA,[[8,2,ojo],...(cola?[[0,5,'G'],[0,6,'g'],[1,7,'g'],[1,8,'g'],[1,9,'g']]:[[0,8,'G'],[0,9,'g'],[1,9,'g']])]),op.cara),x,yPiso);}
// ---------- 4 · la mano de la banda con OLIVER colgando ----------
const OLI_CUELGA=['.o...o.','.ggggg.','.wegew.','.ggngg.','..bbb..','.gGgGg.','.gcccg.','ggcccgg','g.ccc.g','c.g.g.c','..c.c..'];
function OLI_mano(x,y,op){op=op||{};x=Math.round(x);y=Math.round(y);const t=op.t|0,con=op.oliver!==false;
  // antebrazo que baja derecho (manga del chatarrero de la banda: luz a un lado, sombra al otro, un pliegue), después el
  // codo que dobla hacia arriba a la derecha, el puño de la manga y un guante grande
  const M='#7b7258',ML='#9a9072',MD='#5a533f',G='#3a3328',GL='#5c5246',GD='#24201a';
  ctx.fillStyle=OLI_K;ctx.fillRect(x-2,y-15,8,13);const N=Math.max(2,op.largo|0||6);for(let i=0;i<N;i++)ctx.fillRect(x-1+i*2,y-19-i*2,8,5); // tinta (largo = escalones del brazo de arriba, 2 px cada uno; 6 si no se dice)
  for(let i=N-1;i>=0;i--){ctx.fillStyle=M;ctx.fillRect(x+i*2,y-18-i*2,6,3);ctx.fillStyle=MD;ctx.fillRect(x+4+i*2,y-18-i*2,2,3);ctx.fillStyle=ML;ctx.fillRect(x+i*2,y-18-i*2,1,3);} // brazo
  ctx.fillStyle=M;ctx.fillRect(x-1,y-14,6,9);ctx.fillStyle=ML;ctx.fillRect(x-1,y-14,1,9);ctx.fillStyle=MD;ctx.fillRect(x+3,y-14,2,9);ctx.fillRect(x,y-10,3,1); // antebrazo y pliegue
  ctx.fillStyle=OLI_K;ctx.fillRect(x-3,y-6,10,4);ctx.fillStyle=ML;ctx.fillRect(x-2,y-5,8,2);ctx.fillStyle=M;ctx.fillRect(x-2,y-4,8,1); // puño de la manga
  // el guante: palma de 7 × 4 y el pulgar a un costado
  ctx.fillStyle=OLI_K;ctx.fillRect(x-3,y-3,10,6);ctx.fillRect(x+6,y-1,3,5);
  ctx.fillStyle=G;ctx.fillRect(x-2,y-2,8,4);ctx.fillStyle=GL;ctx.fillRect(x-2,y-2,8,1);ctx.fillStyle=G;ctx.fillRect(x+6,y,2,3);ctx.fillStyle=GL;ctx.fillRect(x+6,y,2,1);
  if(con){const pat=OLI_red()?0:(t>>3)%2; // patalea: las patas de abajo se abren y se cierran
    const c=OLI_cv('cuelga'+pat,()=>OLI_lienzo(OLI_CUELGA,pat?[[0,9,'.'],[6,9,'.'],[1,9,'c'],[5,9,'c'],[3,10,'G'],[3,9,'G']]:[[3,9,'G']]));
    ctx.drawImage(c,x-2,y+3);} /* lo agarra de la nuca: la cara queda a la vista, debajo de los dedos */
  // los dedos: tres, de 1 px con un hueco entre cada uno, por delante del lomo (cerrados si lleva a OLIVER)
  const l=2;for(let i=0;i<3;i++){const fx=x-2+i*3;ctx.fillStyle=OLI_K;ctx.fillRect(fx-1,y+2,4,l+1);ctx.fillStyle=G;ctx.fillRect(fx,y+2,2,l);ctx.fillStyle=GD;ctx.fillRect(fx,y+1+l,2,1);}
}
// ---------- 5 · la jaula colgada del gancho ----------
const OLI_JAULA={w:20,h:16};
function OLI_jaula(x,yGancho,op){
  op=op||{};const t=op.t|0,largo=Math.max(4,op.largo|0||14),ab=op.estado==='abierta';
  const sw=ab||OLI_red()?0:[0,1,0,-1][(t>>4)%4],X=Math.round(x)-10+sw,Y=Math.round(yGancho)+largo,cx=Math.round(x);
  // gancho (fijo) y cadena (eslabones de 2 × 3 y 2 × 1; el de abajo acompaña el vaivén)
  ctx.fillStyle=OLI_K;ctx.fillRect(cx-3,yGancho-2,6,5);ctx.fillStyle='#8a8e9a';ctx.fillRect(cx-2,yGancho-1,4,1);ctx.fillRect(cx+1,yGancho,1,2);ctx.fillStyle='#5a5e6a';ctx.fillRect(cx-2,yGancho,1,2);
  for(let y=yGancho+3,i=0;y<Y;y+=4,i++){const dx=y>Y-6?sw:0;ctx.fillStyle=OLI_K;ctx.fillRect(cx-2+dx,y-1,4,5);
    ctx.fillStyle=i%2?'#5a5e6a':'#8a8e9a';ctx.fillRect(cx-1+dx,y,2,3);}
  // techo y argolla
  ctx.fillStyle=OLI_K;ctx.fillRect(X-1,Y-1,22,5);ctx.fillRect(cx-3+sw,Y-3,6,3);
  ctx.fillStyle='#8a8e9a';ctx.fillRect(cx-2+sw,Y-2,4,1);
  ctx.fillStyle='#5a3a22';ctx.fillRect(X,Y,20,3);ctx.fillStyle='#7a5232';ctx.fillRect(X,Y,20,1);
  // adentro: fondo oscuro y OLIVER sentado (el gato del juego), mirando al jugador
  ctx.fillStyle='#241a20';ctx.fillRect(X+1,Y+3,18,10);
  if(!ab&&!op.vacia&&typeof CAT_drawPose==='function'&&typeof CAT_pose==='function'){const b0=CAT_COL.b; /* vacia:true = cerrada y sin nadie (apertura) */if(!op.collar)CAT_COL.b=CAT_COL.g; /* en la jaula va SIN collar (se le cayó en la apertura), salvo op.collar */
    try{CAT_drawPose(CAT_pose({st:'cage',vx:0,onGround:true,x:0,dist:0,t:0}),X+4,Y+5,op.cara>0?1:-1);}catch(e){}finally{CAT_COL.b=b0;}}
  // barrotes de 1 px cada 4, con tinta a los lados (por delante del gato)
  for(let i=1;i<20;i+=4){ctx.fillStyle=OLI_K;ctx.fillRect(X+i-1,Y+3,1,10);ctx.fillStyle='#c0c4cc';ctx.fillRect(X+i,Y+3,1,10);}
  ctx.fillStyle=OLI_K;ctx.fillRect(X-1,Y+3,1,10);ctx.fillRect(X+20,Y+3,1,10);
  if(!ab){ctx.fillStyle=OLI_K;ctx.fillRect(X-1,Y+12,22,5);ctx.fillStyle='#5a3a22';ctx.fillRect(X,Y+13,20,3);ctx.fillStyle='#7a5232';ctx.fillRect(X,Y+13,20,1);
    ctx.fillStyle='#8a8e9a';ctx.fillRect(X+16,Y+13,3,2);ctx.fillStyle=OLI_K;ctx.fillRect(X+17,Y+14,1,1);}      // candado de hierro (nada dorado)
  else{ctx.fillStyle=OLI_K;ctx.fillRect(X-2,Y+12,5,22);ctx.fillStyle='#5a3a22';ctx.fillRect(X-1,Y+13,3,20);ctx.fillStyle='#7a5232';ctx.fillRect(X-1,Y+13,1,20);} // el piso cuelga de la bisagra
}
// ---------- 3 · el engranaje dorado: gira, se sale de la pared y se parte ----------
const OLI_oro=s=>s<-6?'#fff0b0':s>5?'#7a5a1a':'#d8a83a',OLI_opaco=s=>s<-6?'#8a6a28':s>5?'#5a4210':'#7a5a1a';
function OLI_engLienzo(n,medio,eje){ // como el de la placa (arte-historia.js); medio = dientes corridos medio paso
  return OLI_cv('eng'+n+'|'+medio+'|'+eje,()=>{const cv=document.createElement('canvas');cv.width=cv.height=27;const c=cv.getContext('2d'),g=new Array(27*27).fill(null);
    const set=(x,y,v)=>{x+=1;y+=1;if(x>=0&&y>=0&&x<27&&y<27)g[y*27+x]=v;},f=n>=10?OLI_oro:OLI_opaco;
    for(let y=0;y<25;y++)for(let x=0;x<25;x++){const dx=x-12,dy=y-12;if(dx*dx+dy*dy<=68)set(x,y,f(dx+dy));}
    for(let k=0;k<n;k++){const a=-Math.PI/2+(k+(medio?0.5:0))*Math.PI/5,tx=Math.round(12+Math.cos(a)*10),ty=Math.round(12+Math.sin(a)*10);
      for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)set(tx+i,ty+j,OLI_oro(tx+i-12+ty+j-12));}
    for(let y=8;y<=16;y++)for(let x=8;x<=16;x++){const d2=(x-12)**2+(y-12)**2;if(d2<=10)set(x,y,d2<=4?'#3a2a10':n>=10?'#a07a20':'#5a4210');}
    const[ex,ey]=[[0,-5],[5,0],[0,5],[-5,0]][eje&3];set(12+ex,12+ey,'#3a2a10');set(12+ex+(ey?1:0),12+ey+(ex?1:0),'#3a2a10'); // la marca que da la vuelta
    const at=(x,y)=>x>=0&&y>=0&&x<27&&y<27&&g[y*27+x];
    for(let y=0;y<27;y++)for(let x=0;x<27;x++){const v=g[y*27+x];if(v){c.fillStyle=v;c.fillRect(x,y,1,1);}
      else if(at(x-1,y)||at(x+1,y)||at(x,y-1)||at(x,y+1)){c.fillStyle=OLI_K;c.fillRect(x,y,1,1);}}
    return cv;});
}
function OLI_engPon(c,cx,cy,e){const s=ctx.imageSmoothingEnabled;ctx.imageSmoothingEnabled=false;ctx.drawImage(c,Math.round(cx-13.5*e),Math.round(cy-13.5*e),27*e,27*e);ctx.imageSmoothingEnabled=s;}
function OLI_engranajeGira(cx,cy,t,esc){const e=Math.max(1,esc|0),k=OLI_red()?0:Math.floor((t|0)/12);
  if(typeof LUZ_halo==='function')LUZ_halo(cx,cy,22*e,'#ffd860',0.3);
  OLI_engPon(OLI_engLienzo(10,k%2,(k>>1)&3),cx,cy,e);}
function OLI_engranajeRompe(cx,cy,t,esc){
  const e=Math.max(1,esc|0),red=OLI_red();t=t|0;if(t>=70)return false;
  if(t<10){ // tiembla, se sale 1 px por vez y se raja
    const dx=red?0:(t%2?1:-1)*e,dy=-Math.floor(t/4)*e;OLI_engPon(OLI_engLienzo(10,0,0),cx+dx,cy+dy,e);
    ctx.fillStyle='#3a2a10';const n=Math.min(8,t+1),Z=[[0,-8],[1,-6],[0,-4],[-1,-2],[0,0],[1,2],[0,4],[-1,6]];
    for(let i=0;i<n;i++)ctx.fillRect(Math.round(cx+dx+Z[i][0]*e),Math.round(cy+dy+Z[i][1]*e),e,2*e);
    return true;}
  const u=t-10,cae=Math.round(0.12*u*u*e)-2*e;
  OLI_engPon(OLI_engLienzo(0,0,0),cx,cy+cae,e);                                             // el cuerpo, sin dientes, cae
  for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,v=(2.2+(k%3)*0.5)*e,x=cx+Math.cos(a)*(10*e+v*u),y=cy-2*e+Math.sin(a)*(10*e+v*u)+0.05*u*u*e;
    if(typeof HI_dienteDibujar==='function'&&e===1)HI_dienteDibujar(x-2,y-2);
    else{ctx.fillStyle=OLI_K;ctx.fillRect(Math.round(x-2.5*e),Math.round(y-1.5*e),5*e,3*e);ctx.fillRect(Math.round(x-1.5*e),Math.round(y-2.5*e),3*e,5*e);
      ctx.fillStyle='#d8a83a';ctx.fillRect(Math.round(x-1.5*e),Math.round(y-1.5*e),3*e,3*e);ctx.fillStyle='#fff0b0';ctx.fillRect(Math.round(x-1.5*e),Math.round(y-1.5*e),2*e,e);
      ctx.fillStyle='#7a5a1a';ctx.fillRect(Math.round(x-0.5*e),Math.round(y+0.5*e),2*e,e);}
    if(!red&&u<24&&k%2===0){ctx.fillStyle='#fff0b0';ctx.fillRect(Math.round(x-Math.cos(a)*4*e),Math.round(y-Math.sin(a)*4*e),e,e);}} // estela corta
  if(u<4&&!red){ctx.fillStyle=u<2?'#ffffff':'#fff0b0';const r=(6+u*3)*e; /* sin destello con MOVIMIENTO REDUCIDO */ctx.fillRect(Math.round(cx-r),Math.round(cy-e),2*r,2*e);ctx.fillRect(Math.round(cx-e),Math.round(cy-r),2*e,2*r);
    if(typeof LUZ_halo==='function')LUZ_halo(cx,cy,30*e,'#fff0b0',0.6);}                    // CLAC: destello en cruz
  return true;
}
// ---------- 7 · los gestos del personaje ----------
function OLI_corazon(x,y){x=Math.round(x);y=Math.round(y);ctx.fillStyle=OLI_K;ctx.fillRect(x-1,y-1,7,5);ctx.fillRect(x,y+3,5,2);ctx.fillRect(x+1,y+4,3,2);
  ctx.fillStyle='#ff8fa8';ctx.fillRect(x,y,2,2);ctx.fillRect(x+3,y,2,2);ctx.fillRect(x,y+1,5,2);ctx.fillRect(x+1,y+3,3,1);ctx.fillRect(x+2,y+4,1,1);ctx.fillStyle='#ffd0dc';ctx.fillRect(x,y,1,1);}
function OLI_brazo(x0,y0,x1,y1,manga,piel){ // brazo de 2 px en escalones, con tinta, y la mano al final
  x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))||1,pts=[];
  for(let i=0;i<=n;i++)pts.push([Math.round(x0+(x1-x0)*i/n),Math.round(y0+(y1-y0)*i/n)]);
  ctx.fillStyle=OLI_K;for(const[x,y]of pts)ctx.fillRect(x-1,y-1,4,4);
  pts.forEach(([x,y],i)=>{ctx.fillStyle=i>=n-1?piel:manga;ctx.fillRect(x,y,2,2);});
}
function OLI_gesto(p,gx,gyPiso,op){
  op=op||{};const t=op.t|0,tipo=op.tipo==='caricia'?'caricia':'collar',red=OLI_red();
  const cara=op.cara||(p&&p.x+4>gx?1:-1); // OLIVER mira al personaje
  let manga='#8f6c3b',piel='#efb88d';try{const pal=CHARS[p.ci].pal;manga=pal.v||manga;piel=pal.s||piel;}catch(e){}
  const hombroX=p.x+4+(cara>0?-3:3),hombroY=p.y+(op.agachado===false?8:11),cuelloX=gx+(cara>0?2:-3),cuelloY=gyPiso-6;
  if(tipo==='collar'){
    const puesto=t>=30;if(puesto!==OLI_conCollar&&op.aplicar!==false)OLI_collarPuesto(puesto);
    const tiembla=!red&&t>=30&&t<36?(t%2?1:-1):0;
    // sin collar todavía: se dibuja con el cuello del color del cuerpo
    OLI_pon(OLI_cv('sienta0e'+(puesto?'R':'-'),()=>OLI_lienzo(OLI_SIENTA,[[8,2,'e'],[0,8,'G'],[0,9,'g'],[1,9,'g'],...(puesto?[[5,5,'R'],[6,5,'R'],[7,5,'R']]:[[5,5,'g'],[6,5,'g'],[7,5,'g']])]),cara),gx+tiembla,gyPiso);
    const k=Math.min(1,t/24),hx=hombroX+(cuelloX-hombroX)*k,hy=hombroY+(cuelloY-hombroY)*k;
    OLI_brazo(hombroX,hombroY,puesto?cuelloX+(cara>0?3:-3):hx,puesto?cuelloY+2:hy,manga,piel);
    if(!puesto){const X=Math.round(hx),Y=Math.round(hy);ctx.fillStyle=OLI_K;ctx.fillRect(X-2,Y+1,6,4);ctx.fillStyle=OLI_ROJO;ctx.fillRect(X-1,Y+2,4,2);ctx.fillStyle=OLI_ROJOL;ctx.fillRect(X-1,Y+2,4,1);} // el collar, en la mano
    else if(t<38&&!red){ctx.fillStyle='#fff0b0';ctx.fillRect(Math.round(gx)-1,gyPiso-11-(t-30),1,2);ctx.fillRect(Math.round(gx)+3,gyPiso-10-(t-30),1,2);} // clic: dos chispitas
    return;}
  // caricia: OLIVER con los ojos cerrados, vibra 1 px (ronronea); la mano va y viene sobre la cabeza
  const vib=red?0:((t>>1)%2);
  OLI_pon(OLI_cv('sienta'+((t>>4)%2)+'k',()=>OLI_lienzo(OLI_SIENTA,[[8,2,'k'],...(((t>>4)%2)?[[0,5,'G'],[0,6,'g'],[1,7,'g'],[1,8,'g'],[1,9,'g']]:[[0,8,'G'],[0,9,'g'],[1,9,'g']])]),cara),gx,gyPiso+vib);
  const va=red?0:[0,1,2,1][(t>>2)%4];
  OLI_brazo(hombroX,hombroY,gx+(cara>0?4-va:-5+va),gyPiso-11,manga,piel);
  const c=t%40;if(c<26)OLI_corazon(gx-2,gyPiso-17-Math.round(c/3));
}
