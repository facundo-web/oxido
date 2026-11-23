'use strict';
// Óxido · EL TASADOR (notas/guion/biblia.md §5): flaco, saco largo lleno de etiquetas colgando, lupa de joyero en un ojo
// (un píxel de brillo) y su diente, el número 10, colgado del cuello (lo único dorado). Estilo "Hondo": píxeles enteros,
// contorno de tinta automático. Va después de arte-jefes-m8.js. Prefijo TAS_.
// · TAS_dibujar(x, yPiso, {pose, cara, t}): x = centro, yPiso = donde apoyan los pies. pose: 'parado' | 'corre' |
//   'atado' (con las sogas de los prisioneros, se mueve de a 1 px) | 'cabina' (cabeza y hombros, para la cabina del
//   TATÚ). cara: 1 mira a la derecha, -1 a la izquierda.
// · TAS_sogas(x, yPiso, sinCartel): las sogas vacías en el piso con su etiqueta "VUELVO EN / 5 MINUTOS" (post-créditos).
// · TAS_etiqueta(x, yPiso, cara): la etiqueta "NO SE VENDE" que cuelga de su diente (texto de textos.js).
// En el TATÚ CAVADOR (M10) lo usa arte-jefes-m10.js: asoma de la cabina y, al perder, salta y corre hacia el templo.
// colores: piel con sombra, pelo peinado hacia atrás, lupa (aro oscuro y lente blanca), saco ciruela con rampa
// (luz arriba, sombra abajo), camisa clara, etiquetas crema con su hilo, el diente dorado, piernas finas
const TAS_C={h:'#1e1418',H:'#3e2a34',s:'#d8a878',S:'#a8744a',m:'#5a2a2a',O:'#1a1a22',l:'#ffffff',w:'#e8e0d0',
  C:'#6a3a5a',c:'#4a2442',d:'#2e1428',t:'#e8d8b0',y:'#5a4a3a',G:'#fff0b0',g:'#d8a83a',Y:'#7a5a1a',p:'#2a2228',f:'#141014',r:'#b08a4a',R:'#7a5a30'};
// cabeza de perfil (mira a la derecha): pelo atrás, frente, lupa sobre el ojo, nariz larga de 1 px, boca
const TAS_CARA=['....hhhH....','...hhhhhss..','..hhhhOOOs..','..hhhsOlOss.','...hhsOOOs..','....ssSms...','.....sss....'];
// ancho del saco por fila (desde la fila 7): hombros angostos y ruedo que se abre
const TAS_SACO=[[4,7],[3,7],[3,7],[3,8],[2,8],[2,8],[2,9],[2,9],[1,9],[1,10],[1,10],[1,10],[1,10]];
const TAS_ETQS=[[3,10],[8,11],[4,15],[8,16]]; // dónde cuelga cada etiqueta (hilo arriba, cartón de 2 × 3)
const TAS_PIERNAS={parado:[[4,7],[4,7],[3,4,7,8]],corre0:[[3,8],[2,9],[1,2,9,10]],corre1:[[5,6],[4,7],[3,4,7,8]]};
const TAS_CACHE=new Map();
function TAS_pintar(set,pose,f){
  const cab=pose==='atado'&&f?1:0;
  TAS_CARA.forEach((r,j)=>{for(let i=0;i<12;i++){const k=r[i];if(k!=='.')set(i+cab,j,TAS_C[k]);}});
  const filas=pose==='cabina'?3:TAS_SACO.length;
  for(let j=0;j<filas;j++){const[a,b]=TAS_SACO[j],y=7+j;
    for(let x=a;x<=b;x++){let col=j<3?'C':j>=10?'d':'c';if(x===a&&j<10)col='C';if(x===b)col=j<3?'c':'d';
      if(j>=11&&x===6)continue; // el saco se abre abajo
      set(x,y,TAS_C[col]);}}
  set(5,7,TAS_C.w);set(6,7,TAS_C.w); // camisa
  // el diente (3 × 3, rampa dorada) sobre el pecho
  [['G','g','g'],['g','g','g'],['g','g','Y']].forEach((r,j)=>r.forEach((k,i)=>set(5+i,8+j,TAS_C[k])));
  if(pose==='cabina')return;
  for(const[x,y]of TAS_ETQS){set(x,y,TAS_C.y);for(let j=1;j<=3;j++){set(x,y+j,TAS_C.t);set(x+1,y+j,TAS_C.t);}set(x+1,y+3,'#c8b488');}
  if(pose==='atado')for(const y of[11,14,17]){const[a,b]=TAS_SACO[y-7];for(let x=a-1;x<=b+1;x++)set(x,y,x===a-1?TAS_C.R:TAS_C.r);}
  const pz=pose==='corre'?TAS_PIERNAS[f?'corre1':'corre0']:TAS_PIERNAS.parado;
  pz[0].forEach(x=>set(x,20,TAS_C.p));pz[1].forEach(x=>set(x,21,TAS_C.p));pz[2].forEach(x=>set(x,22,TAS_C.f));
}
function TAS_sprite(pose,f,cara){
  const k=pose+'|'+f+'|'+cara;let c=TAS_CACHE.get(k);if(c)return c;
  const h=pose==='cabina'?10:23,pinta=set=>TAS_pintar((x,y,col)=>set(x+1,y+1,col),pose,f);
  if(typeof J2_lienzo==='function')c=J2_lienzo(14,h+2,pinta);
  else{c=document.createElement('canvas');c.width=14;c.height=h+2;const g=c.getContext('2d');pinta((x,y,col)=>{g.fillStyle=col;g.fillRect(x,y,1,1);});}
  if(cara<0){const m=document.createElement('canvas');m.width=c.width;m.height=c.height;const g=m.getContext('2d');g.translate(c.width,0);g.scale(-1,1);g.drawImage(c,0,0);c=m;}
  if(TAS_CACHE.size>40)TAS_CACHE.clear();TAS_CACHE.set(k,c);return c;
}
const TAS_red=()=>typeof MOV_reducido==='function'&&MOV_reducido();
function TAS_dibujar(x,yPiso,op){
  op=op||{};const pose=op.pose||'parado',cara=op.cara<0?-1:1,t=op.t!==undefined?op.t:T;
  const f=pose==='corre'?((t>>2)%2):pose==='atado'?(TAS_red()?0:((t>>5)%2)):0;
  const c=TAS_sprite(pose,f,cara);ctx.drawImage(c,Math.round(x-c.width/2),Math.round(yPiso-c.height+1));
  // la lupa de joyero brilla un poco (un píxel)
  if(typeof LUZ_halo==='function'&&pose!=='cabina'&&!TAS_red()&&(t>>3)%5===0){LUZ_halo(Math.round(x-c.width/2)+1+(cara>0?7:4)+0.5,Math.round(yPiso-c.height+1)+4.5,3,'#ffffff',0.3);}
}
function TAS_sogas(x,yPiso,sinCartel){ // tres vueltas de soga vacías en el piso y, colgando, su etiqueta "VUELVO EN / 5 MINUTOS"
  x=Math.round(x);const y=Math.round(yPiso);
  for(const[dx,w]of[[-6,8],[-2,9],[1,7]]){ctx.fillStyle='#17141f';ctx.fillRect(x+dx-1,y-3,w+2,4);ctx.fillStyle='#b08a4a';ctx.fillRect(x+dx,y-2,w,2);ctx.fillStyle='#7a5a30';ctx.fillRect(x+dx,y-1,w,1);}
  if(sinCartel)return;
  if(!TAS_vuelvoCv){let txt='VUELVO EN\n5 MINUTOS';try{txt=TX.historia.carteles.vuelvo;}catch(e){}
    const ls=String(txt).split('\n').slice(0,2),ims=ls.map(l=>typeof pfLienzo==='function'?pfLienzo(l,'#3a2a1a'):null);
    const tw=Math.max(...ims.map(i=>i?i.width:40)),w=tw+6,h=4+ls.length*7,c=document.createElement('canvas');c.width=w+2;c.height=h+2;const g=c.getContext('2d');
    g.fillStyle='#17141f';g.fillRect(0,0,w+2,h+2);g.fillStyle='#e8d8b0';g.fillRect(1,1,w,h);g.fillStyle='#fff4d0';g.fillRect(1,1,w,1);g.fillStyle='#c8b488';g.fillRect(1,h,w,1);
    ims.forEach((im,i)=>{if(im)g.drawImage(im,Math.round((w+2-im.width)/2),3+i*7);});TAS_vuelvoCv=c;}
  // la etiqueta, apoyada torcida sobre las sogas (en escalón, sin girar), con su hilo enganchado en la soga
  const c=TAS_vuelvoCv,ex=x+4,ey=y-3-c.height;ctx.fillStyle='#17141f';ctx.fillRect(ex+2,ey+c.height,1,2);
  const m=Math.floor(c.width/2);ctx.drawImage(c,0,0,m,c.height,ex,ey,m,c.height);ctx.drawImage(c,m,0,c.width-m,c.height,ex+m,ey+1,c.width-m,c.height);
}
let TAS_vuelvoCv=null;
let TAS_etqCv=null;
function TAS_etiqueta(x,yPiso,cara){ // "NO SE VENDE" colgando del diente, del lado de afuera
  if(!TAS_etqCv){let txt='NO SE VENDE';try{txt=TX.historia.carteles.noSeVende;}catch(e){}
    const t=typeof pfLienzo==='function'?pfLienzo(txt,'#3a2a1a'):null,w=(t?t.width:40)+6,h=10,c=document.createElement('canvas');c.width=w+2;c.height=h+2;const g=c.getContext('2d');
    g.fillStyle='#17141f';g.fillRect(0,0,w+2,h+2);g.fillStyle='#e8d8b0';g.fillRect(1,1,w,h);g.fillStyle='#fff4d0';g.fillRect(1,1,w,1);g.fillStyle='#c8b488';g.fillRect(1,h,w,1);
    if(t)g.drawImage(t,4,3);TAS_etqCv=c;}
  const c=TAS_etqCv,cx=Math.round(x),ty=Math.round(yPiso)-16; // el diente queda a ~15 px del piso
  const ex=cara<0?cx-3-c.width:cx+3;ctx.fillStyle='#17141f';ctx.fillRect(cara<0?ex+c.width:cx+1,ty-1,2,1);
  ctx.drawImage(c,ex,ty);
}
// ---------- M10 · la etiqueta $ que tira EL TASADOR y se le pega en el pecho al jugador (guion M10, momento) ----------
// TAS_ETQ.tirar(x0, y0, jugador): vuela en 4 cuadros dibujados (cada uno 3 pasos) desde (x0, y0) al pecho del jugador
//   y queda pegada, torcida 1 px, con el color del jugador detrás. Con MOVIMIENTO REDUCIDO se pega directo.
// TAS_ETQ.soltar(): se despega, cae, gira 90° exactos al tocar el piso y queda tirada; a los 2 s titila y se va.
// Se dibuja sola en el mundo (ON_DRAW); TAS_ETQ.activa() dice si está en pantalla. La usa el momento de Código.
let TAS_etqChica=null,TAS_etqPiso=null;
function TAS_etqSprite(){
  if(TAS_etqChica)return TAS_etqChica;
  const c=document.createElement('canvas');c.width=7;c.height=10;const g=c.getContext('2d');
  g.fillStyle='#17141f';g.fillRect(3,0,1,2);g.fillRect(0,2,7,8);g.fillStyle='#e8d8b0';g.fillRect(1,3,5,6);g.fillStyle='#fff4d0';g.fillRect(1,3,5,1);
  g.fillStyle='#3a2a1a';for(const[a,b]of[[3,3],[2,4],[3,4],[4,4],[2,5],[2,6],[3,6],[4,6],[4,7],[2,8],[3,8],[4,8]])g.fillRect(a,b,1,1);
  TAS_etqChica=c;TAS_etqPiso=typeof J2_cuarto==='function'?J2_cuarto(c,1):c;return c;
}
const TAS_ETQ={st:null,t:0,x0:0,y0:0,p:null,x:0,y:0,vy:0,
  tirar(x0,y0,jugador){TAS_etqSprite();Object.assign(this,{st:TAS_red()?'pegada':'vuela',t:0,x0,y0,p:jugador||(typeof P!=='undefined'?P:null)});},
  soltar(){if(this.st!=='pegada'&&this.st!=='vuela')return;const q=this.pecho();Object.assign(this,{st:'cae',t:0,x:q.x,y:q.y,vy:-0.6});},
  activa(){return !!this.st;},
  pecho(){const p=this.p;return p?{x:Math.round((p.ride?p.ride.x+p.ride.w/2:p.x+4)),y:Math.round((p.ride?p.ride.y+4:p.y+7))}:{x:0,y:0};},
  paso(){if(!this.st)return;this.t++;
    if(this.st==='vuela'&&this.t>=12)this.st='pegada';
    if(this.st==='cae'){if(this.y<GROUND-3){this.vy+=0.18;this.y=Math.min(GROUND-3,this.y+this.vy);}else{this.st='piso';this.t=0;}}
    if(this.st==='piso'&&this.t>150)this.st=null;},
  dibujar(){if(!this.st)return;const s=TAS_etqSprite();
    if(this.st==='vuela'){const k=Math.min(3,this.t/3|0)/3,q=this.pecho(),x=this.x0+(q.x-this.x0)*k,y=this.y0+(q.y-this.y0)*k-Math.sin(k*Math.PI)*10;
      ctx.drawImage(s,Math.round(x)-3,Math.round(y)-5);return;}
    if(this.st==='pegada'){const q=this.pecho(),col=typeof P_COL!=='undefined'&&this.p?P_COL[this.p.slot||0]:'#ffe08a';
      ctx.fillStyle=col;ctx.fillRect(q.x-3,q.y-1,8,8); // el color del jugador detrás
      ctx.drawImage(s,0,0,4,10,q.x-4,q.y-3,4,10);ctx.drawImage(s,4,0,3,10,q.x,q.y-2,3,10);return;} // torcida 1 px (en escalón)
    if(this.st==='cae'){ctx.drawImage(s,Math.round(this.x)-3,Math.round(this.y)-5);return;}
    if(this.st==='piso'&&!(this.t>120&&(this.t>>2)%2)){const r=TAS_etqPiso;ctx.drawImage(r,Math.round(this.x)-(r.width>>1),GROUND-r.height+1);}}
};
if(typeof ON_STEP!=='undefined')ON_STEP.push(()=>{try{TAS_ETQ.paso();}catch(e){}});
if(typeof ON_DRAW!=='undefined')ON_DRAW.push(()=>{try{TAS_ETQ.dibujar();}catch(e){}});
if(typeof ON_START!=='undefined')ON_START.push(()=>{TAS_ETQ.st=null;});
// ---------- etiqueta $ suelta que cae con vaivén (M1, momento del camión; guion codigo-m1.md, punto J) ----------
// TAS_soltarEtiqueta(x, y): una etiqueta cae despacio meciéndose en 3 cuadros dibujados (inclinada a un lado, derecha,
// inclinada al otro: corrimiento de 1 px cada 3 columnas, sin girar), toca el piso y queda acostada (90° exactos);
// a los 2 s titila y se va. Con MOVIMIENTO REDUCIDO cae derecha. Se dibuja sola (ON_DRAW). Solo decorado.
const TAS_SUELTAS=[];let TAS_sueltaCv=null;
function TAS_sueltaCuadros(){
  if(TAS_sueltaCv)return TAS_sueltaCv;const s=TAS_etqSprite();
  // inclinada: se corre solo el cartón con el hilo; el $ va derecho encima, corrido entero 1 px (nunca deformado)
  const PESOS=[[3,3],[2,4],[3,4],[4,4],[2,5],[2,6],[3,6],[4,6],[4,7],[2,8],[3,8],[4,8]];
  const liso=document.createElement('canvas');liso.width=s.width;liso.height=s.height;{const g=liso.getContext('2d');g.drawImage(s,0,0);g.fillStyle='#e8d8b0';for(const[a,b]of PESOS)g.fillRect(a,b,1,1);g.fillStyle='#fff4d0';g.fillRect(1,3,5,1);}
  const inc=d=>{if(typeof J2_inclinar!=='function')return s;const c=J2_inclinar(liso,d),g=c.getContext('2d'),dy=d>0?Math.floor(3/3):Math.floor((s.width-1-3)/3);
    g.fillStyle='#3a2a1a';for(const[a,b]of PESOS)g.fillRect(a,b+dy,1,1);return c;};
  TAS_sueltaCv={izq:inc(-1),recta:s,der:inc(1),piso:TAS_etqPiso||s};return TAS_sueltaCv;
}
function TAS_soltarEtiqueta(x,y){TAS_SUELTAS.push({x,y,t:0,piso:false,pt:0});if(TAS_SUELTAS.length>3)TAS_SUELTAS.shift();}
if(typeof ON_STEP!=='undefined')ON_STEP.push(()=>{for(const e of TAS_SUELTAS){e.t++;
  if(!e.piso){e.y+=0.55;if(!TAS_red())e.x+=[-0.35,0,0.35,0][(e.t/12|0)%4];if(e.y>=GROUND-3){e.y=GROUND-3;e.piso=true;}}else e.pt++;}
  for(let i=TAS_SUELTAS.length-1;i>=0;i--)if(TAS_SUELTAS[i].pt>150)TAS_SUELTAS.splice(i,1);});
if(typeof ON_DRAW!=='undefined')ON_DRAW.push(()=>{if(!TAS_SUELTAS.length)return;const C=TAS_sueltaCuadros();
  for(const e of TAS_SUELTAS){
    if(e.piso){if(e.pt>120&&(e.pt>>2)%2)continue;ctx.drawImage(C.piso,Math.round(e.x)-(C.piso.width>>1),GROUND-C.piso.height+1);continue;}
    const f=TAS_red()?C.recta:[C.izq,C.recta,C.der,C.recta][(e.t/12|0)%4];ctx.drawImage(f,Math.round(e.x)-(f.width>>1),Math.round(e.y)-(f.height>>1));}});
if(typeof ON_START!=='undefined')ON_START.push(()=>{TAS_SUELTAS.length=0;});
