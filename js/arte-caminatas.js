'use strict';
// Óxido · Caminatas de misión cumplida: los villanos sin su diente (guion codigo-m2/m4/m5.md, punto I). Estilo
// "Hondo": píxeles enteros, contorno de tinta automático, nada gira (solo 90° exactos o cuadros corridos 1 px cada 3
// columnas). Donde estaba el diente queda un hueco apagado (la forma del engranaje, oscura). Va después de
// arte-tasador.js. Prefijo CAM_.
// · CAM_ceniza(x, yPiso, {mascara, cara}): SARGENTO CENIZA sentado en una bita del muelle, sin fuego, con o sin su
//   máscara de soldar. CAM_toser(x, y): suelta 2 o 3 anillos de humo de píxel que suben y se apagan (se dibujan solos).
// · CAM_rey(x, y, {cara, z}): REY POLVO chico y dormido (flota: x, y = centro); z:false saca la "z" de píxel. CAM_sarcofago(x, yPiso, cuadro): su
//   sarcófago con la tapa cerrándose en 3 cuadros (0 abierto, la tapa acostada al lado · 1 cayendo, en escalón ·
//   2 cerrado; con el polvo del golpe suave).
// · CAM_niebla(x, y): DON NIEBLA colgado de SU dirigible desinflado, chico y en colores de lejos (capa de atrás).
// · CAM_gaviota(x, y, {mascara, cara}): la gaviota mecánica de M2 llevándose la máscara de CENIZA (caminata de M2).
// · CAM_corredor(x, yPiso, {t, cara, i}) y CAM_soltarPala(x, y, vx): los tres de la banda que huyen de la tumba en M4
//   (momento "ALGO LOS ASUSTÓ"), personas vestidas de nómada, cada uno distinto; la pala cae y se va sola.
const CAM_HUECO=['.#.#.','#####','##.##','#####','.#.#.'];
// grilla → lienzo con tinta (como J2_lienzo, pero con el color de tinta que se pida)
function CAM_lienzo(w,h,pinta,tinta){
  tinta=tinta||'#17141f';const grid=new Array(w*h).fill(null);
  pinta((x,y,c)=>{x=Math.round(x);y=Math.round(y);if(x>=0&&y>=0&&x<w&&y<h&&c)grid[y*w+x]=c;});
  const cv=document.createElement('canvas');cv.width=w;cv.height=h;const g=cv.getContext('2d');
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){let c=grid[y*w+x];
    if(!c)for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<w&&Y<h&&grid[Y*w+X]&&grid[Y*w+X]!==tinta){c=tinta;break;}}
    if(c){g.fillStyle=c;g.fillRect(x,y,1,1);}}
  return cv;
}
const CAM_espejo=src=>{const c=document.createElement('canvas');c.width=src.width;c.height=src.height;const g=c.getContext('2d');g.translate(src.width,0);g.scale(-1,1);g.drawImage(src,0,0);return c;};
const CAM_CACHE=new Map();
function CAM_guardado(k,fn){let c=CAM_CACHE.get(k);if(!c){c=fn();if(CAM_CACHE.size>60)CAM_CACHE.clear();CAM_CACHE.set(k,c);}return c;}
const CAM_red=()=>typeof MOV_reducido==='function'&&MOV_reducido();
const CAM_pon=(c,x,yPiso)=>ctx.drawImage(c,Math.round(x-c.width/2),Math.round(yPiso-c.height+1));

// ---------- M2 · SARGENTO CENIZA sentado en una bita ----------
function CAM_cenizaLienzo(mascara,cara){
  return CAM_guardado('cen|'+mascara+'|'+cara,()=>{
    let c=CAM_lienzo(20,26,set0=>{const set=(x,y,c)=>set0(x+1,y+1,c),R=(x,y,w,h,col)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)set(x+i,y+j,col);};
      // la bita del muelle (hierro con tapa redonda)
      R(5,18,9,5,'#3a3e4a');R(4,17,11,2,'#5a5e6a');R(4,17,11,1,'#8a8e9a');R(5,22,9,1,'#24262e');R(7,19,1,3,'#6a6e7a');
      // el tanque a la espalda (apagado) con su banda ámbar y, arriba, el hueco del diente en la válvula
      R(0,8,4,9,'#8c3b2a');R(0,8,1,9,'#b3543a');R(0,13,4,1,'#8a5a3a');R(0,16,4,1,'#5a2418');
      CAM_HUECO.forEach((r,j)=>{for(let i=0;i<5;i++)if(r[i]==='#')set(-1+i,3+j,j<2&&i<2?'#4a3a2e':'#1e1612');});
      // cuerpo: uniforme negro, chaleco, cinturón (la hebilla ámbar)
      R(3,9,9,9,'#1c1c22');R(4,10,7,6,'#2a2a34');R(4,14,2,2,'#3a3a46');R(8,14,2,2,'#3a3a46');R(3,16,9,1,'#4a3a2a');set(8,16,'#8a5a3a');
      // brazos apoyados en las rodillas; la lanza apagada cruzada adelante
      R(10,11,2,5,'#1c1c22');R(11,15,3,2,'#3a2a20');R(2,11,2,5,'#15151a');
      R(6,17,11,1,'#3a3a40');R(6,17,11,1,'#5a5a64');R(16,16,2,3,'#1a1a20');
      // piernas: sentado, las rodillas adelante y las botas colgando de la bita
      R(4,17,4,2,'#15151a');R(9,17,4,2,'#1c1c22');R(12,19,2,4,'#15151a');R(8,19,2,4,'#15151a');R(7,23,4,2,'#3a2a20');R(11,23,4,2,'#4a3426');
      // cabeza: capucha y, con máscara, el visor; sin máscara, la cara con hollín y cara de pocos amigos
      R(4,0,7,9,'#22222a');R(5,0,5,1,'#3a3a44');
      if(mascara){R(7,1,5,8,'#4a4a52');R(7,1,5,1,'#5e5e68');R(8,3,4,3,'#120c18');R(8,4,4,1,'#1f4a34');set(11,4,'#7fbf9a');R(8,7,3,1,'#2a2a30');}
      else{R(7,2,5,6,'#c8906a');R(7,2,5,1,'#e0a880');R(7,6,5,2,'#a8744a');set(9,4,'#1a1210');set(11,4,'#1a1210');R(9,3,3,1,'#2a1a14');R(9,6,2,1,'#5a2a20');
        set(8,5,'#6a5a50');set(11,6,'#6a5a50');set(12,4,'#c8906a');} // hollín y nariz
    });
    if(cara<0)c=CAM_espejo(c);return c;});
}
function CAM_ceniza(x,yPiso,op){op=op||{};CAM_pon(CAM_cenizaLienzo(op.mascara!==false,op.cara<0?-1:1),x,yPiso);}
// anillos de humo de la tos: arrancan de 3 × 3, crecen a 5 × 5 y 7 × 7 mientras suben, y se apagan en 2 escalones
const CAM_ANILLOS=[];
function CAM_toser(x,y,n){n=Math.max(2,Math.min(3,n||3));for(let i=0;i<n;i++)CAM_ANILLOS.push({x:x+i*2,y,t:-i*14});if(CAM_ANILLOS.length>6)CAM_ANILLOS.splice(0,CAM_ANILLOS.length-6);}
function CAM_aro(cx,cy,r,col){cx=Math.round(cx);cy=Math.round(cy);ctx.fillStyle=col;let x=r,y=0,e=1-r;const p=(a,b)=>ctx.fillRect(cx+a,cy+b,1,1);
  if(r<=1){ctx.fillRect(cx-1,cy-1,3,1);ctx.fillRect(cx-1,cy+1,3,1);ctx.fillRect(cx-1,cy,1,1);ctx.fillRect(cx+1,cy,1,1);return;}
  while(x>=y){p(x,y);p(y,x);p(-y,x);p(-x,y);p(-x,-y);p(-y,-x);p(y,-x);p(x,-y);y++;if(e<0)e+=2*y+1;else{x--;e+=2*(y-x)+1;}}}
if(typeof ON_STEP!=='undefined')ON_STEP.push(()=>{for(const a of CAM_ANILLOS)a.t++;for(let i=CAM_ANILLOS.length-1;i>=0;i--)if(CAM_ANILLOS[i].t>60)CAM_ANILLOS.splice(i,1);});
if(typeof ON_DRAW!=='undefined')ON_DRAW.push(()=>{for(const a of CAM_ANILLOS){if(a.t<0)continue;const k=a.t/60,r=k<0.3?1:k<0.65?2:3;
  CAM_aro(a.x+(CAM_red()?0:Math.round(Math.sin(a.t/8))),a.y-Math.round(a.t*0.4),r,k<0.6?'#b8b8c0':'#7a7a84');}});
if(typeof ON_START!=='undefined')ON_START.push(()=>{CAM_ANILLOS.length=0;});

// ---------- M4 · REY POLVO chico y dormido, y la tapa del sarcófago ----------
function CAM_reyLienzo(cara){
  return CAM_guardado('rey|'+cara,()=>{
    let c=CAM_lienzo(16,22,set0=>{const set=(x,y,c)=>set0(x+1,y+1,c),R=(x,y,w,h,col)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)set(x+i,y+j,col);};
      // corona de bronce viejo con la grieta vacía (el hueco del diente)
      R(3,1,8,2,'#8a6a3a');R(4,0,6,1,'#5a4426');set(3,0,'#8a6a3a');set(10,0,'#8a6a3a');set(7,-1,'#8a6a3a');
      R(6,0,2,3,'#1e1410');set(7,1,'#120c08');
      // cabeza vendada, dormida: los ojos cerrados (dos rayitas)
      R(4,3,6,6,'#cdbb90');R(4,4,6,1,'#e2d4a8');R(4,7,6,1,'#e2d4a8');R(5,5,2,1,'#5a4a30');R(8,5,2,1,'#5a4a30');R(6,7,2,1,'#8a7a58');
      // collar y manto azul, con la orla de bronce
      R(3,9,8,2,'#2a8a8a');R(3,9,8,1,'#8a6a3a');R(3,11,8,6,'#2a3050');R(3,16,8,1,'#8a6a3a');R(9,12,1,4,'#3a4270');
      // brazos cruzados, dormido
      R(4,12,6,2,'#cdbb90');R(4,12,6,1,'#e2d4a8');
      // el remolino de arena de abajo (flota), en escalones
      R(4,17,6,1,'#e6b878');R(3,18,8,1,'#c8965a');R(5,19,4,1,'#e6b878');R(6,20,2,1,'#c8965a');
    });
    if(cara<0)c=CAM_espejo(c);return c;});
}
function CAM_rey(x,y,op){op=op||{};const c=CAM_reyLienzo(op.cara<0?-1:1);ctx.drawImage(c,Math.round(x-c.width/2),Math.round(y-c.height/2));
  if(!CAM_red()&&op.z!==false){const f=(T>>4)%3;ctx.fillStyle='#e8e0c8';const zx=Math.round(x+5),zy=Math.round(y-c.height/2-2-f*2); // "z" de píxel que sube
    ctx.fillRect(zx,zy,3,1);ctx.fillRect(zx+1,zy+1,1,1);ctx.fillRect(zx,zy+2,3,1);}}
function CAM_tapaLienzo(){
  return CAM_guardado('tapa',()=>CAM_lienzo(28,48,set0=>{const set=(x,y,c)=>set0(x+1,y+1,c),R=(x,y,w,h,col)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)set(x+i,y+j,col);};
    const w=26,h=46;R(0,3,w,h-3,'#a07a48');R(2,0,w-4,3,'#a07a48');R(0,3,1,h-4,'#c89a5a');R(w-1,3,1,h-3,'#7a5a30');
    for(let i=0;i<5;i++){R(1,3+Math.round(i*2.6),4,1,'#4a5a72');R(w-5,3+Math.round(i*2.6),4,1,'#4a5a72');}
    R(7,3,w-14,9,'#d89a5a');R(8,6,3,1,'#1a120c');R(w-11,6,3,1,'#1a120c');R(12,9,2,1,'#1a120c');R(11,11,5,1,'#1a120c');R(12,12,2,4,'#8a3a1e');
    R(1,17,w-2,2,'#2a4a8a');R(1,19,w-2,1,'#a0503a');R(1,20,w-2,2,'#2a4a8a');R(3,24,w-6,3,'#2a4a8a');R(3,25,w-6,1,'#7a5a32');
    R(10,29,6,h-31,'#5a3a16');for(let i=0;i<3;i++){R(11,30+i*5,4,1,'#7a5a32');R(12,31+i*5,2,2,'#7a5a32');}}));
}
function CAM_sarcofago(x,yPiso,cuadro){
  x=Math.round(x);const g=Math.round(yPiso),w=26,h=46,top=g-4-h;cuadro=Math.max(0,Math.min(2,cuadro|0));
  // la base y la caja (abierta: adentro oscuro)
  ctx.fillStyle='#17141f';ctx.fillRect(x-5,g-5,w+10,6);ctx.fillRect(x-1,top-3,w+2,h+4);
  ctx.fillStyle='#5a3a1e';ctx.fillRect(x-4,g-4,w+8,4);ctx.fillStyle='#8a6a3a';ctx.fillRect(x-4,g-4,w+8,1);
  ctx.fillStyle='#3a2410';ctx.fillRect(x,top,w,h);ctx.fillRect(x+2,top-2,w-4,2);ctx.fillStyle='#0e0604';ctx.fillRect(x+3,top+2,w-6,h-3);
  const L=CAM_tapaLienzo();
  if(cuadro===2){ctx.drawImage(L,x-1,top-3); // cerrado
    if(!CAM_red()){ctx.fillStyle='#c8a878';for(const dx of[-6,-3,w+2,w+5])ctx.fillRect(x+dx,g-2-((T>>2)%2),2,1);}return;}
  if(cuadro===1){const inc=CAM_guardado('tapa|i',()=>typeof J2_inclinar==='function'?J2_inclinar(L,1):L);ctx.drawImage(inc,x+5,top+4);return;} // cayendo, en escalón
  const acost=CAM_guardado('tapa|90',()=>typeof J2_cuarto==='function'?J2_cuarto(L,1):L);ctx.drawImage(acost,x+w+2,g-acost.height+1); // abierto: la tapa acostada al lado (90° exactos)
}

// ---------- M5 · DON NIEBLA colgado de su dirigible desinflado (chico, capa de atrás) ----------
function CAM_nieblaLienzo(){
  return CAM_guardado('niebla',()=>CAM_lienzo(30,24,set0=>{const set=(x,y,c)=>set0(x+1,y+1,c),R=(x,y,w,h,col)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)set(x+i,y+j,col);};
    // el globo desinflado: una bolsa caída y arrugada, con su parche (colores de lejos, apagados)
    for(let y=0;y<9;y++){const a=Math.round(3+Math.abs(y-3)*0.6+(y>5?(y-5)*1.5:0)),b=Math.round(25-Math.abs(y-2)*0.5-(y>5?(y-5)*1.8:0));R(a,y,b-a,1,y<2?'#6a5a74':y>6?'#3a3046':'#504260');}
    for(const x of[8,13,18,22])R(x,2,1,5,'#3a3046');R(16,1,3,2,'#2a2234');set(26,3,'#504260');set(27,4,'#504260'); // arrugas, parche y la punta caída
    // las sogas hasta las manos
    for(let i=0;i<6;i++){set(11+Math.round(i*0.3),9+i,'#5a5262');set(17-Math.round(i*0.3),9+i,'#5a5262');}
    // DON NIEBLA colgado: manos arriba, pelado, bigote, el puro con la brasa, traje oscuro; en el pecho, el hueco del diente
    R(12,15,1,2,'#c8a888');R(16,15,1,2,'#c8a888');R(13,16,3,3,'#c8a888');set(14,17,'#3a2a20');set(15,17,'#3a2a20');set(16,17,'#ff9a5a');
    R(12,19,5,4,'#2a2632');R(13,19,3,1,'#3a3644');set(14,20,'#141018');R(13,23,1,1,'#1a1820');R(15,23,1,1,'#1a1820');
  },'#241e30'));
}
function CAM_niebla(x,y){const c=CAM_nieblaLienzo();ctx.drawImage(c,Math.round(x-c.width/2),Math.round(y-c.height/2));}

// ---------- M4 · "ALGO LOS ASUSTÓ": tres de la banda huyen de la tumba (codigo-m4.md D) ----------
// CAM_corredor(x, yPiso, {t, cara, i}): uno de la banda, vestido de nómada, corriendo asustado y sin arma. Son PERSONAS
// (nunca momias): ropa oscura y de color, la cara a la vista con piel y ojos abiertos de susto, la boca abierta, y cada
// uno distinto (i = 0, 1 o 2):
//   0 · túnica índigo y turbante terracota; se agarra el turbante con una mano y bombea la otra.
//   1 · túnica terracota y pañuelo índigo con el nudo atrás; revolea los brazos como molino (nunca los dos arriba).
//   2 · más bajo y más gordo, túnica oliva y turbante ladrillo; corre con los brazos bajos y MIRA HACIA ATRÁS.
// x = centro; t = cuadro del momento (mueve piernas y brazos); cara −1 = mira a la izquierda (por defecto). El cuerpo
// pasa por drawRig (lleva el contorno y el borde de luz de arte-luz.js como los soldados). CAM_soltarPala(x, y, vx): una
// pala cae dando vueltas de a 90°, queda acostada, a los 2,5 s titila y se va (sola). La etiqueta: TAS_soltarEtiqueta.
const CAM_BANDA=[
  {head:["....kkkkkk....","...kTTTTTTk...","..kTttttttTk..","..kttttttttk..","..ktksssswek..","..ktkssssosk..","...kkkSSSSk..."],
   torso:["...kvvvvvvvk..","..kvvvvVvvvvk.","..kvvvvVvvvvk.","..krrrrrrrrrk.","..kVVVVVVVVVk."],
   pal:{t:'#b0502a',T:'#d0703a',v:'#3a3a7a',V:'#28285a',r:'#d0703a',p:'#28285a',P:'#1e1e46',b:'#5a3a22'}},
  {head:["..............","....kkkkkk....","...kTTTTTTk...","..kttttttttk..",".ktksssswesk..","..kkssssosk...","...kkSSSSk...."],
   torso:["...kvvsvvvvk..","..kvvvsVvvvvk.","..kvvvvVvvvvk.","..krrrrrrrrrk.","..kVVVVVVVVVk."],
   pal:{t:'#3a3a7a',T:'#5a5aa0',v:'#9a4a2a',V:'#6a2e18',r:'#3a3a7a',p:'#4a3426',P:'#36261c',b:'#2a1e16'}},
  {head:["..............","....kkkkkk....","...kTTTTTTk...","..kTttttttTk..","..kksssswesk..","..ksssssossk..","...kSSSSSSk..."].map(f=>f.split('').reverse().join('')), // la cara para atrás
   torso:[".kvvvvvvvvvk..",".kvvvvvVvvvvk.","kvvvvvvVvvvvvk","krrrrrrrrrrrrk",".kVVVVVVVVVVk."],
   pal:{t:'#a04a3a',T:'#c86a50',v:'#4a5030',V:'#363a22',r:'#6a4a2a',p:'#363a22',P:'#282a18',b:'#5a3a22'},corte:2}];
const CAM_PIEL={k:'#17141f',s:'#c08050',S:'#8a5434',w:'#e8e0d0',e:'#17141f',o:'#3a1a14'};
const CAM_BANDA_SET=[];
function CAM_bandaSet(i){
  if(!CAM_BANDA_SET[i]&&typeof build==='function'){const b=CAM_BANDA[i];CAM_BANDA_SET[i]=build({...CAM_PIEL,...b.pal},b.head,b.torso,b.corte||0);}
  return CAM_BANDA_SET[i];
}
// brazos (en la orientación del dibujo, mirando a la derecha; filas 0–6 cabeza, 7–11 torso). m = cuadro (0/1)
const CAM_BRAZOS=[
  m=>[[[10,8],[11,7],[12,6],[12,5],[12,4],[12,3]],[[11,1],[12,1],[11,2],[12,2]], // se agarra el turbante
      m?[[3,8],[2,8]]:[[3,9],[2,10]],m?[[0,8],[1,8]]:[[1,11],[2,11]]],
  m=>m?[[[10,9],[11,10],[12,11]],[[12,12],[13,12]],[[3,8],[2,7],[1,6],[1,5]],[[0,3],[1,3],[0,4],[1,4]]] // molino
      :[[[10,8],[11,7],[12,6],[13,5]],[[13,3],[14,3],[13,4],[14,4]],[[3,9],[2,10],[1,11]],[[0,12],[1,12]]],
  m=>m?[[[11,10],[11,11]],[[11,12],[12,12]],[[2,10],[3,11]],[[3,12],[4,12]]] // bajos, bombeando
      :[[[12,9],[13,10]],[[13,11],[14,11]],[[1,9],[0,10]],[[-1,11],[0,11]]]];
function CAM_brazosLienzo(i,m,cara){
  return CAM_guardado('bra|'+i+'|'+m+'|'+cara,()=>{const v=CAM_BANDA[i].pal.v,[a,ma,b,mb]=CAM_BRAZOS[i](m);
    const V=CAM_BANDA[i].pal.V,grueso=i===1; // el del molino: brazos de 2 px, lisos, con una sola línea de sombra (sin trama)
    let c=CAM_lienzo(20,18,set0=>{const set=(x,y,col)=>set0(x+3,y+3,col),manga=pts=>{for(const[x,y]of pts){set(x,y,v);if(grueso)set(x,y+1,V);}};
      manga(b);for(const[x,y]of mb)set(x,y,CAM_PIEL.s); // el de atrás primero
      manga(a);for(const[x,y]of ma)set(x,y,CAM_PIEL.s);});
    if(cara<0)c=CAM_espejo(c);return c;});
}
function CAM_corredor(x,yPiso,op){
  op=op||{};const i=((op.i||0)%3+3)%3,set=CAM_bandaSet(i);if(!set||typeof drawRig!=='function')return;
  const t=op.t||0,cara=op.cara>0?1:-1,f=cara>0?0:1,n=Math.floor((t*2.2+i*5)/(typeof RUN_STEP==='number'?RUN_STEP:3.6))%6;
  const bob=typeof RUN_BOB!=='undefined'?RUN_BOB[n]:0,pose={leg:'r'+n,ux:0,uy:bob,hop:0,lf:f};
  const X=Math.round(x),Y=Math.round(yPiso)-18;
  drawRig(set,pose,f,X-7,Y);
  const m=CAM_red()?0:i===1?((t>>3)%2):((t>>2)+i)%2;
  ctx.drawImage(CAM_brazosLienzo(i,m,cara),X-7-3,Y+(set.dy||0)+bob-3);
}
// la pala: mango de madera con el puño en D y la hoja de chapa. 4 cuadros girados de a 90° exactos (nunca rotate)
const CAM_PALA=['k.........mmm','kk........mmm','.kddddddddmmm','kk........mMm','k.........mMm'];
function CAM_palaLienzo(r){
  return CAM_guardado('pala|'+r,()=>{const P={k:'#5a4026',d:'#7a5a32',m:'#8a8e9a',M:'#5a5e6a'},h=CAM_PALA.length,w=CAM_PALA[0].length;
    const s=r%2?h:w,u=r%2?w:h;
    return CAM_lienzo(s+2,u+2,set=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++){const ch=CAM_PALA[j][i];if(ch==='.')continue;
      const[X,Y]=r===0?[i,j]:r===1?[h-1-j,i]:r===2?[w-1-i,h-1-j]:[j,w-1-i];set(X+1,Y+1,P[ch]);}});});
}
const CAM_PALAS=[];
function CAM_soltarPala(x,y,vx){CAM_PALAS.push({x,y,vx:vx??-1.1,vy:-1.6,t:0,piso:false,pt:0});if(CAM_PALAS.length>3)CAM_PALAS.shift();}
if(typeof ON_STEP!=='undefined')ON_STEP.push(()=>{for(const p of CAM_PALAS){p.t++;
  if(!p.piso){p.vy+=0.18;p.x+=p.vx;p.y+=p.vy;if(p.y>=GROUND-2&&p.vy>0){p.y=GROUND-2;p.piso=true;}}else p.pt++;}
  for(let i=CAM_PALAS.length-1;i>=0;i--)if(CAM_PALAS[i].pt>180)CAM_PALAS.splice(i,1);});
if(typeof ON_DRAW!=='undefined')ON_DRAW.push(()=>{for(const p of CAM_PALAS){
  if(p.pt>150&&(p.pt>>2)%2)continue; // titila y se va
  const r=p.piso||CAM_red()?0:(p.t/5|0)%4,c=CAM_palaLienzo(r);
  ctx.drawImage(c,Math.round(p.x-c.width/2),p.piso?Math.round(GROUND-c.height+1):Math.round(p.y-c.height/2));}});
if(typeof ON_START!=='undefined')ON_START.push(()=>{CAM_PALAS.length=0;});

// ---------- M2 · la gaviota mecánica se lleva la máscara de CENIZA (codigo-m2.md I) ----------
// CAM_gaviota(x, y, {mascara, cara}): el dron de M2 (cuerpo blanco con la franja gris, alas grises, pico naranja,
// remaches y patitas de motor) en píxeles, aleteando en 2 cuadros (alas arriba / abajo, nunca rotate). Con mascara:true
// lleva colgando del pico, de la correa, LA MISMA máscara de soldar de CAM_ceniza, que se hamaca 1 px. x, y = centro del
// cuerpo; cara 1 = vuela a la derecha (por defecto). El ojo va rojo apagado: acá no es peligro.
function CAM_gaviotaLienzo(ala,mascara,sw,cara){
  return CAM_guardado('gav|'+ala+'|'+mascara+'|'+sw+'|'+cara,()=>{
    let c=CAM_lienzo(26,22,set0=>{const set=(x,y,c)=>set0(x+1,y+1,c),R=(x,y,w,h,col)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)set(x+i,y+j,col);};
      if(ala){R(9,3,4,3,'#6a7684');R(7,1,4,3,'#8a96a4');R(5,0,3,2,'#8a96a4');R(4,0,2,1,'#5a6470');} // alas arriba (la de atrás, más oscura)
      R(3,7,3,2,'#8a96a4');set(2,7,'#5a6470'); // la cola
      R(6,6,10,4,'#e8ecf0');R(6,6,10,1,'#5a6470');R(6,9,10,1,'#b8c0c8');set(8,8,'#8a96a4');set(13,8,'#8a96a4'); // cuerpo con remaches
      R(15,4,4,4,'#e8ecf0');R(15,4,4,1,'#5a6470');set(17,5,'#8a2a22'); // cabeza y ojo
      R(19,6,3,1,'#e0a02c');R(19,7,2,1,'#a87418'); // el pico
      set(9,10,'#3a4450');set(12,10,'#3a4450'); // patitas de motor
      if(!ala){R(7,9,4,2,'#8a96a4');R(5,11,3,2,'#8a96a4');R(4,12,2,1,'#5a6470');} // alas abajo
      if(mascara){const m=17+sw;set(20,8,'#2a2a30');set(20,9,'#2a2a30');set(m+2,10,'#2a2a30'); // la correa, del pico
        R(m,11,5,8,'#4a4a52');R(m,11,5,1,'#5e5e68');R(m+1,13,4,3,'#120c18');R(m+1,14,4,1,'#1f4a34');set(m+4,14,'#7fbf9a');R(m+1,17,3,1,'#2a2a30');} /* igual que en CAM_ceniza */
    });
    if(cara<0)c=CAM_espejo(c);return c;});
}
function CAM_gaviota(x,y,op){op=op||{};const red=CAM_red(),ala=red?(T>>4)%2:(T>>3)%2,sw=red?0:(T>>4)%2;
  const c=CAM_gaviotaLienzo(ala,!!op.mascara,sw,op.cara<0?-1:1);
  ctx.drawImage(c,Math.round(x-c.width/2),Math.round(y-9));} /* y = centro del cuerpo (fila 8 del lienzo) */
