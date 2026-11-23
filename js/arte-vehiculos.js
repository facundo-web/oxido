'use strict';
// Óxido · Arte de los vehículos de cada misión (va después de grillo.js y fusion.js)
// Un vehículo por misión, con 3 niveles de fusión cada vez más rudos: II suma placas remachadas, soldaduras, un caño
// más grande, púas chicas y una luz roja; III, púas grandes, caño con freno de boca, humo, luces rojas que titilan y
// ojos de jefe. Solo dibujo: la mecánica es de Código.
// Formato (acordado con Código):
//   AV_TAM[i]   = {w,h,jinete:{x,y},boca:{x,y},vuela} — caja de nivel 1 mirando a la derecha (i = misión 0–9)
//   AV_NOMBRE[i]
//   AV_dibujar(i, v, op) — v: {x,y,w,h,face,rot?}; op: {nivel:1–3, pose:'quieto'|'mover'|'atacar'|'danado', base (M10),
//                         t:cuadro, flash, jinete:jugador|null, jet}. Dibuja dentro de la caja v (espeja con face<0,
//                         se estira si la caja de v es más grande que AV_TAM, como hace fusion.js con la CHATARRA).
//   v.aim       = ángulo del tiro en radianes (0 = adelante, + = abajo, relativo a hacia dónde mira); sin aim, caño fijo
//   AV_boca(i, nivel, aim) = punta del caño (relativa a la caja mirando a la derecha): de ahí sale la bala
//   Pose 'danado' (armadura < 30 %), 'atacar' (~8 cuadros mientras sale el tiro) y op.flash los manda Código.
//   M1 CHATARRA: la dibuja grillo.js; acá solo se le suma encima lo rudo de II y III (envuelve drawMech).
// Técnica: cada cuerpo se arma con formas simples rasterizadas a 1 px por unidad (sin bordes borrosos) en un lienzo
// chico con contorno de tinta automático, y se guarda (uno por vehículo, nivel, cuadro de aleteo y destello). Lo que
// se mueve todo el tiempo (hélices, llamas, luz, humo) se dibuja encima en cada cuadro.
// Prefijo AV_.
const AV_TINTA='#120c18';
const AV_NOMBRE=['CHATARRA','GAVIOTA','LIBÉLULA','PLANEADOR','FAROL','TABLA','IMÁN','PTERO','CAMPANA','MONTACARGAS'];
// ---------- rasterizado propio ----------
// ops: ['r',col,x,y,w,h] · ['e',col,cx,cy,rx,ry] · ['p',col,[[x,y],…]] · ['l',col,x0,y0,x1,y1] · ['d',col,[[x,y],…]] puntos
function AV_ras(w,h,ops,blanco){
  const P=3,W2=w+2*P,H2=h+2*P,px=new Array(W2*H2).fill(null);
  const set=(x,y,c)=>{x=Math.floor(x)+P;y=Math.floor(y)+P;if(x>=0&&y>=0&&x<W2&&y<H2)px[y*W2+x]=c;};
  for(const o of ops){const c=o[1];
    if(o[0]==='r'){for(let y=o[3];y<o[3]+o[5];y++)for(let x=o[2];x<o[2]+o[4];x++)set(x,y,c);}
    else if(o[0]==='e'){const[,,cx,cy,rx,ry]=o;for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++)
      if(((x+0.5-cx)/rx)**2+((y+0.5-cy)/ry)**2<=1)set(x,y,c);}
    else if(o[0]==='p'){const pts=o[2];let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const[a,b]of pts){x0=Math.min(x0,a);x1=Math.max(x1,a);y0=Math.min(y0,b);y1=Math.max(y1,b);}
      for(let y=Math.floor(y0);y<=y1;y++)for(let x=Math.floor(x0);x<=x1;x++){const X=x+0.5,Y=y+0.5;let ins=false;
        for(let i=0,j=pts.length-1;i<pts.length;j=i++){const[xi,yi]=pts[i],[xj,yj]=pts[j];if((yi>Y)!==(yj>Y)&&X<(xj-xi)*(Y-yi)/(yj-yi)+xi)ins=!ins;}
        if(ins)set(x,y,c);}}
    else if(o[0]==='l'){let[,,x0,y0,x1,y1]=o;const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))||1;for(let i=0;i<=n;i++)set(x0+(x1-x0)*i/n,y0+(y1-y0)*i/n,c);}
    else if(o[0]==='d'){for(const[x,y]of o[2])set(x,y,c);}}
  const cv=document.createElement('canvas');cv.width=W2;cv.height=H2;const g=cv.getContext('2d');
  for(let y=0;y<H2;y++)for(let x=0;x<W2;x++){const c=px[y*W2+x];
    if(c){g.fillStyle=blanco&&c!==AV_TINTA?'#ffffff':c;g.fillRect(x,y,1,1);}
    else if((x>0&&px[y*W2+x-1])||(x<W2-1&&px[y*W2+x+1])||(y>0&&px[(y-1)*W2+x])||(y<H2-1&&px[(y+1)*W2+x])){g.fillStyle=AV_TINTA;g.fillRect(x,y,1,1);}}
  return cv;
}
// ---------- lo rudo de cada nivel, igual para todos ----------
// partes: placas [[x,y,w,h]], puas [[x,y,dir]] (dir 'u' arriba, 'd' abajo, 'f' adelante, 'b' atrás), cano {x,y,l,g},
// sold [[x0,y0,x1,y1]], luces [[x,y]], ojos [[x,y]], escape [x,y]
function AV_rudo(pt,n){
  // "Hondo": más fuerza = piezas más grandes y luces, no más puntos. Nada de patrones de 1 px alternados.
  // II: placas lisas (la mitad) con una sola línea de luz arriba. III: todas las placas, más oscuras, una soldadura
  // lisa, púas grandes y espaciadas, y ojos de jefe. (El caño se dibuja aparte, en AV_cano.)
  const o=[];if(n<2)return o;
  const pl=n>=3?pt.placas:pt.placas.slice(0,Math.ceil(pt.placas.length/2));
  for(const[x,y,w,h]of pl){o.push(['r',n>=3?'#3a3e48':'#545a66',x,y,w,Math.max(2,h)],['r',n>=3?'#6a707c':'#8a909c',x,y,w,1]);}
  if(n>=3&&pt.sold[0]){const[x0,y0,x1,y1]=pt.sold[0];o.push(['l','#b8703a',x0,y0,x1,y1]);}
  if(n>=3)pt.puas.filter((_,i)=>i%2===0).forEach(([x,y,d])=>{const c='#9a9ea8',s=4;
    if(d==='u')o.push(['p',c,[[x-2,y+0.5],[x+2,y+0.5],[x,y-s]]]);
    else if(d==='d')o.push(['p',c,[[x-2,y-0.5],[x+2,y-0.5],[x,y+s]]]);
    else if(d==='f')o.push(['p',c,[[x-0.5,y-2],[x-0.5,y+2],[x+s,y]]]);
    else o.push(['p',c,[[x+0.5,y-2],[x+0.5,y+2],[x-s,y]]]);});
  if(n>=3&&pt.ojos)for(const[x,y]of pt.ojos)o.push(['r','#2a0c10',x-1,y,4,2]);
  return o;
}
// cabeza del que maneja (casco del personaje, cara, ojo) en (x, y) = arriba a la izquierda de la cabeza
function AV_cabeza(rd,x,y){
  let casco='#4f6a2c';try{casco=playerHelmet(rd);}catch(e){}
  let cuello='#d93a2b';try{cuello=CHARS[rd.ci].pal.r;}catch(e){}
  ctx.fillStyle=AV_TINTA;ctx.fillRect(x-1,y-1,6,7);
  ctx.fillStyle=casco;ctx.fillRect(x,y,4,2);ctx.fillStyle='#efb88d';ctx.fillRect(x,y+2,4,2);
  ctx.fillStyle='#1a1a1a';ctx.fillRect(x+2.5,y+2.5,1,1);ctx.fillStyle=cuello;ctx.fillRect(x,y+4,4,1);
}
// humo que sube del escape (sin estado: sale de t)
function AV_humo(x,y,t,k){
  for(let i=0;i<k;i++){const f=((t+i*13)%42)/42,yy=y-f*14,xx=x-f*5+Math.sin((t+i*7)/6)*1.2,s=1+f*2.5;
    ctx.fillStyle=`rgba(${f<0.2?'70,64,72':'110,104,112'},${(0.75*(1-f)).toFixed(2)})`;ctx.fillRect(xx-s/2,yy-s/2,s,s);}
}
// cono de luz de un foco (suma luz: se ve como luz sobre cualquier fondo)
function AV_cono(x,y,l,a,t){
  const k=0.13+0.04*Math.sin(t/8);ctx.save();ctx.globalCompositeOperation='lighter';
  ctx.fillStyle=`rgba(255,220,120,${k.toFixed(2)})`;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+l,y-a);ctx.lineTo(x+l,y+a);ctx.closePath();ctx.fill();
  ctx.fillStyle=`rgba(255,240,180,${(k*0.8).toFixed(2)})`;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+l*0.6,y-a*0.35);ctx.lineTo(x+l*0.6,y+a*0.35);ctx.closePath();ctx.fill();
  ctx.restore();
}
// caño: largo y grosor según el nivel (II +3/+1, III +5/+2 y freno de boca). Gira con aim (radianes, 0 = adelante,
// positivo = hacia abajo, relativo a hacia dónde mira el vehículo). Sin aim, queda fijo para adelante.
const AV_canoMed=(c,n)=>({G:c.g+(n>=3?2:n>=2?1:0),L:c.l+(n>=3?5:n>=2?3:0)});
function AV_cano(c,n,aim,rec){
  if(!c)return;const{G,L}=AV_canoMed(c,n),y0=-G/2;
  ctx.save();ctx.translate(c.x,c.y+c.g/2);if(aim)ctx.rotate(aim);ctx.translate(rec||0,0);
  ctx.fillStyle=AV_TINTA;ctx.fillRect(-1,y0-1,L+2,G+2);if(n>=3)ctx.fillRect(L-3,y0-2,4,G+4);
  ctx.fillStyle='#2a2a30';ctx.fillRect(0,y0,L,G);ctx.fillStyle='#45454e';ctx.fillRect(0,y0,L,Math.min(1,G));
  if(n>=3){ctx.fillStyle='#1a1a20';ctx.fillRect(L-2,y0-1,2,G+2);ctx.fillStyle='#3a3a42';ctx.fillRect(L-6,y0,1,G);}
  ctx.fillStyle=AV_TINTA;ctx.fillRect(-2,-2,4,4);ctx.fillStyle='#3a3a42';ctx.fillRect(-1.5,-1.5,3,3);
  ctx.restore();
}
// punta del caño (de donde sale el tiro), relativa a la caja mirando a la derecha: para que Código ponga la bala
function AV_boca(i,nivel,aim){
  const d=AV_DEF[i];if(!d)return AV_TAM[i]?AV_TAM[i].boca:{x:0,y:0};const c=d.partes.cano;if(!c)return d.boca;
  const{L}=AV_canoMed(c,Math.max(1,Math.min(3,nivel||1))),a=aim||0;
  return{x:c.x+Math.cos(a)*L,y:c.y+c.g/2+Math.sin(a)*L};
}
function AV_fogonazo(x,y,t){
  if((t>>1)%3===2)return;ctx.fillStyle='#fff6c8';ctx.fillRect(x,y-1,3,2);ctx.fillStyle='#ffd25a';ctx.fillRect(x+2,y-2,3,4);
  ctx.fillStyle='rgba(255,138,42,0.8)';ctx.fillRect(x+4,y-1,3,2);
}
// ---------- los vehículos (mirando a la derecha) ----------
const AV_DEF=[];
// M2 · GAVIOTA: hidroavión chico, blanco con puntas grises, nariz naranja, flotadores
AV_DEF[1]={w:30,h:15,jinete:{x:15,y:1},boca:{x:29,y:10},vuela:true,
  base:(n,f)=>[
    ['p','#c8ced8',[[0,2],[4,2],[8,7],[2,8]]],                                  // cola
    ['e',n>=3?'#b8bec8':'#e8ecf0',15,7,12,3.5],['r','#9aa4b2',5,8,20,2],          // fuselaje y panza
    ['r','#c8ced8',8,4,15,2],['r','#5a6470',8,4,3,2],['r','#5a6470',20,4,3,2],    // ala con puntas grises
    ['r','#9ad0ff',14,4,4,2],                                                     // parabrisas
    ['p','#e0a02c',[[26,5],[29,7],[26,9]]],                                       // nariz
    ['l','#5a6470',10,10,9,12],['l','#5a6470',20,10,21,12],['r','#5a6470',6,12,19,2],['r','#3a4450',6,13,19,1]],
  partes:{placas:[[6,6,5,3],[19,7,5,2],[11,9,7,2]],puas:[[9,4,'u'],[13,4,'u'],[20,4,'u'],[24,4,'u'],[7,14,'d'],[24,14,'d']],
    cano:{x:22,y:10,l:6,g:1},sold:[[6,10,24,10],[3,4,7,8]],luces:[[2,3],[24,6]],ojos:[[23,6]],escape:[3,6]},
  din:(op,t,n)=>{const r=(t>>1)%2?6:3;ctx.fillStyle='rgba(225,225,235,0.75)';ctx.fillRect(29.5,7-r,1,r*2);ctx.fillStyle=AV_TINTA;ctx.fillRect(29,6,1.5,2);}};
// M3 · LIBÉLULA mecánica: cola larga en segmentos, ojos grandes, cuatro alas de vidrio
AV_DEF[2]={w:32,h:14,jinete:{x:17,y:0},boca:{x:30,y:9},vuela:true,
  base:(n,f)=>{const g=n>=3?'#2e5a1c':'#4a8a2a',G=n>=3?'#4a7a2a':'#7ad040',o=[];
    for(let i=0;i<5;i++)o.push(['r',i%2?g:G,1+i*3,6,3,2]);
    o.push(['e',g,20,7,6,3.5],['r',G,16,5,8,1],['e','#e0a02c',26,6.5,2.5,2.5],['r','#ffe066',26,5,1,1],
      ['l','#2a3a1a',18,10,16,13],['l','#2a3a1a',21,10,21,13],['l','#2a3a1a',23,10,25,13]);return o;},
  partes:{placas:[[16,6,4,3],[21,6,3,3],[8,6,3,2]],puas:[[18,3,'u'],[22,3,'u'],[4,6,'u'],[10,6,'u'],[14,6,'u']],
    cano:{x:24,y:9,l:5,g:1},sold:[[15,8,25,8],[1,8,15,8]],luces:[[1,7],[20,5]],ojos:[[25,6]],escape:[2,7]},
  din:(op,t,n)=>{const a=(t>>1)%2,c=op.flash?'rgba(255,255,255,0.8)':'rgba(200,255,220,0.5)';ctx.fillStyle=c;
    ctx.fillRect(12,3-a*2,8,2);ctx.fillRect(20,3-a*2,8,2);ctx.fillRect(13,4+a,6,1.5);ctx.fillRect(21,4+a,6,1.5);
    ctx.fillStyle='rgba(18,12,24,0.5)';ctx.fillRect(16,3-a*2,1,2);ctx.fillRect(23,3-a*2,1,2);}};
// M4 · PLANEADOR de lona y caños, con un motorcito atrás
AV_DEF[3]={w:34,h:17,jinete:{x:16,y:7},boca:{x:27,y:14},vuela:true,
  base:(n,f)=>[
    ['p',n>=3?'#a89870':'#d8c8a0',[[1,6],[29,1],[33,3],[5,8]]],
    ['l',n>=3?'#7a2a2a':'#b84a3a',8,6,30,2],['l','#a89870',4,7,32,3],
    ['l','#5a5a62',12,6,15,14],['l','#5a5a62',24,3,21,14],['r','#5a5a62',13,14,12,1],  // caños y barra
    ['r','#3a3a42',2,8,5,3],['r','#5a5a62',3,9,3,1]],                              // motorcito
  partes:{placas:[[3,7,4,2],[14,13,4,2],[20,13,4,2]],puas:[[10,5,'u'],[16,4,'u'],[22,3,'u'],[28,2,'u'],[32,3,'f']],
    cano:{x:23,y:15,l:4,g:1},sold:[[12,6,15,14],[24,3,21,14]],luces:[[32,4],[2,9]],ojos:[[28,2]],escape:[2,9]},
  din:(op,t,n)=>{const r=(t>>1)%2?4:2;ctx.fillStyle='rgba(225,225,235,0.75)';ctx.fillRect(0,9.5-r,1,r*2);}};
// M5 · FAROL: globo dirigible con barquilla y un foco grande adelante
AV_DEF[4]={w:32,h:19,jinete:{x:14,y:10},boca:{x:26,y:16},vuela:true,
  base:(n,f)=>{const b=n>=3?'#4a2030':'#6a3a4a',B=n>=3?'#6a3040':'#8a5060';return[
    ['e',b,16,6,14,5.5],['r',B,4,3,24,1],['l','#3a1e28',8,2,8,10],['l','#3a1e28',16,1,16,11],['l','#3a1e28',24,2,24,10],
    ['p',b,[[1,4],[4,6],[1,8]]],                                                     // timón
    ['l','#5a4a3a',10,11,12,13],['l','#5a4a3a',22,11,20,13],
    ['r','#7a5a3a',10,13,13,4],['r','#5a3e28',10,16,13,1],['r','#9a7a4a',10,13,13,1],
    ['r','#3a3a42',23,13,3,3],['r','#ffe066',25,13,1,3]];},
  partes:{placas:[[5,4,5,3],[12,6,6,3],[20,4,6,3],[11,14,4,2]],puas:[[8,1,'u'],[14,0,'u'],[20,0,'u'],[26,2,'u'],[12,17,'d'],[20,17,'d']],
    cano:{x:19,y:16,l:5,g:1},sold:[[3,6,29,6],[10,15,22,15]],luces:[[4,9],[28,8]],ojos:[[26,5]],escape:[11,13]},
  din:(op,t,n)=>AV_cono(26,14.5,18,6.5,t)};
// M6 · TABLA de luz: el que maneja va parado arriba (jinete = sus pies)
AV_DEF[5]={w:26,h:9,jinete:{x:13,y:2},boca:{x:25,y:5},vuela:true,
  base:(n,f)=>[
    ['p',n>=3?'#164a86':'#2276b8',[[1,3],[23,3],[25,5],[23,6],[2,6]]],['r','#aef4ff',3,3,18,1],
    ['r',n>=3?'#ff3b30':'#3ad8ff',4,5,16,1],['r','#0c1640',6,6,4,2],['r','#0c1640',15,6,4,2]],
  partes:{placas:[[3,4,5,2],[16,4,5,2],[10,4,4,2]],puas:[[3,3,'u'],[22,3,'u'],[7,7,'d'],[18,7,'d'],[25,4,'f']],
    cano:{x:20,y:5,l:4,g:1},sold:[[2,6,23,6]],luces:[[2,4],[23,4]],ojos:[[21,4]],escape:[1,5]},
  din:(op,t,n)=>{const a=0.35+0.2*Math.sin(t/5),c=n>=3?'255,90,60':'58,216,255';
    ctx.fillStyle=`rgba(${c},${a.toFixed(2)})`;ctx.fillRect(5,8,16,1);ctx.fillStyle=`rgba(${c},${(a*0.5).toFixed(2)})`;ctx.fillRect(7,9,12,1.5);}};
// M7 · IMÁN: caminante chico con mochila imán y patas con pies magnéticos (camina por techos y paredes: v.rot)
AV_DEF[6]={w:20,h:20,jinete:{x:8,y:0},boca:{x:19,y:8},vuela:false,
  base:(n,f)=>{const r=n>=3?'#6a1e1a':'#a83a2a',o=[
    ['r',r,4,5,11,8],['r','#c8ccd4',4,5,11,1],
    ['p','#c8ccd4',[[5,1],[8,1],[8,4],[11,4],[11,1],[14,1],[14,5],[5,5]]],['r','#d93a2b',5,1,3,2],['r','#d93a2b',11,1,3,2], // herradura
    ['r','#2a2a30',14,7,3,2]];
    const pa=f?[[6,13,4,17],[12,13,14,17]]:[[6,13,7,17],[12,13,11,17]];
    for(const[x0,y0,x1,y1]of pa)o.push(['l','#3a3328',x0,y0,x1,y1],['r','#5c5f70',x1-2,y1+1,5,2],['r','#d93a2b',x1-2,y1+2,5,1]);
    return o;},
  partes:{placas:[[5,7,4,3],[10,7,4,3],[6,11,7,2]],puas:[[4,6,'b'],[4,10,'b'],[15,11,'f'],[9,5,'u']],
    cano:{x:15,y:8,l:3,g:1},sold:[[4,12,15,12],[9,5,9,12]],luces:[[6,6],[13,6]],ojos:[[12,9]],escape:[4,7]},
  din:(op,t,n)=>{if((t>>3)%2){ctx.fillStyle='rgba(120,200,255,0.6)';ctx.fillRect(5,-1,3,1);ctx.fillRect(11,-1,3,1);}}};
// M8 · PTERO: pájaro de chapa remachada, cresta, pico largo y alas que aletean
AV_DEF[7]={w:34,h:17,jinete:{x:13,y:1},boca:{x:33,y:8},vuela:true,
  base:(n,f)=>{const c=n>=3?'#5a544a':'#8a8478',C=n>=3?'#7a7468':'#aaa498',o=[
    ['p',c,[[1,6],[6,4],[22,4],[27,6],[22,10],[6,10]]],['r',C,7,5,14,1],
    ['p',c,[[24,3],[28,2],[30,5],[28,8],[24,8]]],['p','#e0a02c',[[29,5],[34,7],[29,8]]],          // cabeza y pico
    ['p',n>=3?'#a83a2a':'#c8963a',[[23,3],[24,0],[27,2]]],['r','#ffe066',27,4,1,1],                 // cresta y ojo
    ['p',c,[[0,5],[3,7],[0,9]]],
    ['r',C,7,8,14,1]]; // una línea de luz, sin remaches en fila
    o.push(f?['p',C,[[8,6],[18,6],[12,15]]]:['p',C,[[8,5],[18,5],[14,-3]]]);                    // ala
    return o;},
  partes:{placas:[[6,6,5,3],[14,6,5,3],[24,4,3,3]],puas:[[8,4,'u'],[12,4,'u'],[16,4,'u'],[20,4,'u'],[10,10,'d'],[18,10,'d']],
    cano:{x:22,y:9,l:6,g:1},sold:[[2,7,26,7],[24,8,29,6]],luces:[[2,6],[26,3]],ojos:[[26,4]],escape:[1,7]},
  din:()=>{}};
// M9 · CAMPANA voladora: campana de bronce con rotor arriba, ventanita y badajo
AV_DEF[8]={w:22,h:21,jinete:{x:9,y:6},boca:{x:11,y:20},vuela:true,
  base:(n,f)=>{const c=n>=3?'#8a5a1a':'#c8963a',C=n>=3?'#a8762a':'#e8b85a';return[
    ['r','#3a3a42',10,0,2,3],
    ['p',c,[[7,3],[15,3],[17,10],[20,16],[2,16],[5,10]]],['r',C,7,4,8,1],['r',C,2,15,18,1],
    ['r','#2a1e10',8,6,6,5],['r','#9ad0ff',8,6,6,1],                                  // ventanita
    ['r','#5a4a3a',10,16,2,3],['e','#3a3328',11,19.5,1.5,1.5]];},
  partes:{placas:[[5,11,5,3],[12,11,5,3],[8,4,6,2]],puas:[[3,15,'b'],[19,15,'f'],[7,3,'u'],[15,3,'u'],[5,16,'d'],[17,16,'d']],
    cano:{x:16,y:12,l:4,g:1},sold:[[3,14,19,14],[6,8,16,8]],luces:[[4,13],[18,13]],ojos:[[15,7]],escape:[4,10]},
  din:(op,t,n)=>{const r=(t>>1)%2?9:4;ctx.fillStyle='rgba(225,225,235,0.75)';ctx.fillRect(11-r,-0.5,r*2,1);
    if(op.pose==='atacar'){const k=(t%12)/12;ctx.strokeStyle=`rgba(255,224,138,${(0.8*(1-k)).toFixed(2)})`;ctx.lineWidth=1;
      ctx.beginPath();ctx.ellipse(11,17,6+k*10,2+k*4,0,0,Math.PI*2);ctx.stroke();}}};
// M10 · MONTACARGAS DE CHATARRA (contrato con el segundo programador, vehiculos.js): la caja v es LA JAULA (26 × 18, la
// caja de golpe y lo que sube). op.base = píxeles desde abajo de la jaula hasta el piso (0 bajada, hasta ~70 subida).
// Abajo, en ese hueco: dos guías de perfil de acero (no rieles de mina) que nacen de una base con orugas cortas apoyada
// en el piso, y dos cadenas desde arriba de las guías hasta la jaula. La base no se mueve; solo sube la jaula. Las guías
// y las cadenas se dibujan detrás de la jaula (atras) y las orugas debajo (din), en cada cuadro, porque cambian con
// op.base. El gancho que sale disparado lo dibuja vehiculos.js. montacargas:true avisa que este dibujo ya está.
AV_DEF[9]={w:26,h:18,jinete:{x:11,y:4},boca:{x:28,y:9},vuela:false,montacargas:true,
  base:(n,f)=>{const fr=n>=3?'#4a3a2a':'#7a6a4a',dk=n>=3?'#4a3a28':'#6a5a3a',o=[
    ['r',fr,0,0,26,2],['r',fr,0,2,2,12],['r',fr,24,2,2,12],                         // marco y postes
    ['r','#8a8270',6,2,1,11],['r','#8a8270',16,2,1,11],['r','#8a8270',20,2,1,11],     // barrotes
    ['r',dk,0,13,26,3],['r','#9a8a6a',0,13,26,1],['r','#3a3a42',1,16,24,2]];         // piso de la jaula
    for(let x=1;x<25;x+=6)o.push(['r','#e8c040',x,15,3,1],['r','#1d1a1c',x+3,15,3,1]);
    return o;},
  partes:{placas:[[2,5,3,4],[21,5,3,4],[2,13,6,2],[18,13,6,2]],puas:[[5,0,'u'],[10,0,'u'],[15,0,'u'],[20,0,'u'],[26,13,'f'],[0,13,'b']],
    cano:{x:24,y:8,l:4,g:1},sold:[[1,14,25,14],[2,1,24,1]],luces:[[1,1],[24,1]],ojos:[[18,4]],escape:[1,0]},
  // detrás de la jaula: guías (con agujeros, como un perfil de acero) y cadenas
  atras:(op,t,n)=>{
    const b=Math.max(0,op.base||0),piso=18+b,arriba=-6,acero=n>=3?'#3a3e48':'#5c5f70';
    for(const gx of [-3,27]){ctx.fillStyle=AV_TINTA;ctx.fillRect(gx-1,arriba-1,4,piso-arriba+1);
      ctx.fillStyle=acero;ctx.fillRect(gx,arriba,2,piso-arriba);ctx.fillStyle='#8a8e9a';ctx.fillRect(gx,arriba,1,piso-arriba);
      ctx.fillStyle='#2a2a30';for(let y=arriba+2;y<piso-1;y+=4)ctx.fillRect(gx+1,y,1,1);
      ctx.fillStyle=AV_TINTA;ctx.fillRect(gx-1,arriba-2,4,2);}                        // tapa de arriba
    const cad=(x0,y0,x1,y1)=>{const m=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));
      for(let i=0;i<=m;i++){ctx.fillStyle=Math.floor(i/2)%2?'#5a5a62':'#b8bcc8';ctx.fillRect(Math.round(x0+(x1-x0)*i/m),Math.round(y0+(y1-y0)*i/m),1,1);}};
    cad(-2,arriba,1,0);cad(28,arriba,24,0);},
  // debajo: la base con orugas cortas apoyada en el piso
  din:(op,t,n)=>{
    const b=Math.max(0,op.base||0),y0=18+b,mov=op.pose==='mover',f=mov?(t>>2)%2:0;
    ctx.fillStyle=AV_TINTA;ctx.fillRect(-5,y0-1,36,8);ctx.fillRect(-6,y0+1,38,4);
    ctx.fillStyle=n>=3?'#3a2e24':'#5a4a3a';ctx.fillRect(-4,y0,34,2);                    // base
    ctx.fillStyle='#2a2a30';ctx.fillRect(-4,y0+2,34,4);ctx.fillRect(-5,y0+3,36,2);         // orugas
    ctx.fillStyle='#5c5f70';for(const x of [-1,5,11,17,23,28])ctx.fillRect(x,y0+3,2,2);    // ruedas
    ctx.fillStyle='#1a1a20';for(let x=-4+f;x<30;x+=2)ctx.fillRect(x,y0+2,1,1);             // tacos que avanzan
    if(n>=2){ctx.fillStyle=n>=3?'#c8ccd4':'#7a808c';for(const x of [-2,26])ctx.fillRect(x,y0,4,1);}},
  // la etiqueta $ de la banda (guion M10: "tiene etiquetas $"): una sola, colgando del marco de arriba, adentro de la
  // jaula del lado del caño; se mece 1 px cuando anda (quieta con MOVIMIENTO REDUCIDO). El $ nunca sale espejado.
  frente:(op,t,n,v)=>{const red=typeof MOV_reducido==='function'&&MOV_reducido(),sw=red||op.pose!=='mover'?0:((t>>3)%2?1:-1),x=-7+sw,y=1; // colgada del marco, del lado de afuera (no la tapan el caño ni el que maneja)
    ctx.save();if(v&&v.face<0){ctx.translate(x+3.5,0);ctx.scale(-1,1);ctx.translate(-(x+3.5),0);}
    ctx.fillStyle=AV_TINTA;ctx.fillRect(x+3,y,1,3);ctx.fillRect(x,y+3,7,8);ctx.fillStyle='#8a7a5a';ctx.fillRect(x+3,y,1,3);ctx.fillStyle=AV_TINTA;ctx.fillStyle='#e8d8b0';ctx.fillRect(x+1,y+4,5,6);ctx.fillStyle='#fff4d0';ctx.fillRect(x+1,y+4,5,1);
    ctx.fillStyle='#3a2a1a';for(const[a,b]of[[3,4],[2,5],[3,5],[4,5],[2,6],[2,7],[3,7],[4,7],[4,8],[2,9],[3,9],[4,9]])ctx.fillRect(x+a,y+b,1,1); // el $
    ctx.fillStyle=AV_TINTA;ctx.fillRect(x+3,y-1,4,1);
    ctx.restore();}};
const AV_TAM=[{w:22,h:28,jinete:{x:12,y:1},boca:{x:22,y:8},vuela:false}];
for(let i=1;i<10;i++){const d=AV_DEF[i],c=d.partes.cano;AV_TAM[i]={w:d.w,h:d.h,jinete:d.jinete,boca:c?{x:c.x+c.l,y:c.y+c.g/2}:d.boca,vuela:d.vuela};}
const AV_CACHE=new Map();
function AV_cuerpo(i,n,f,bl){
  const k=i+'|'+n+'|'+f+'|'+(bl?1:0);let c=AV_CACHE.get(k);if(c)return c;
  const d=AV_DEF[i];c=AV_ras(d.w,d.h,[...d.base(n,f),...AV_rudo(d.partes,n)],bl);AV_CACHE.set(k,c);return c;
}
// ---------- dibujar un vehículo ----------
function AV_dibujar(i,v,op){
  op=op||{};const d=AV_DEF[i];if(!d)return;
  const n=Math.max(1,Math.min(3,op.nivel||1)),t=op.t??(typeof T==='number'?T:0),pose=op.pose||'quieto';
  const aleteo=pose==='mover'?(t>>2)%2:(t>>4)%2;
  const bob=d.vuela?Math.round(Math.sin(t/(pose==='mover'?6:12))*(pose==='mover'?1.2:0.8)):0;
  const sx=(v.w||d.w)/d.w,sy=(v.h||d.h)/d.h,dan=pose==='danado';
  ctx.save();
  try{
    ctx.translate(q(v.x),q(v.y)+bob);
    if(v.face<0){ctx.translate(v.w||d.w,0);ctx.scale(-1,1);}
    if(sx!==1||sy!==1)ctx.scale(sx,sy);
    if(v.rot){ctx.translate(d.w/2,d.h/2);ctx.rotate(v.rot);ctx.translate(-d.w/2,-d.h/2);}
    if(pose==='mover'&&d.vuela){ctx.translate(d.w/2,d.h/2);ctx.rotate(0.07);ctx.translate(-d.w/2,-d.h/2);}
    // humo atrás (III siempre, II y I solo dañados)
    const e=d.partes.escape;if(n>=3||dan)AV_humo(e[0],e[1],t,dan?6:3);
    if(d.atras)d.atras(op,t,n); // lo que va detrás del cuerpo (guías del MONTACARGAS)
    let cuerpo=AV_cuerpo(i,n,aleteo,!!op.flash);
    // borde de luz "Hondo" (arte-luz.js): cálido del lado de la luz de la misión y frío del otro, guardado por cuadro
    if(!op.flash&&typeof LUZ_sprite==='function'&&typeof LUZ_luz==='function'){const l=LUZ_luz();if(l)cuerpo=LUZ_sprite(cuerpo,l,{fuera:!!d.vuela});} // lo que vuela, por fuera; lo que pisa, por dentro
    ctx.drawImage(cuerpo,-3,-3);
    d.din(op,t,n);
    if(d.frente)d.frente(op,t,n,v); // lo que va delante del cuerpo (la etiqueta $ del MONTACARGAS)
    // el que maneja
    if(op.jinete){const j=d.jinete;if(i===5)AV_piesTabla(op.jinete,j.x,j.y);else AV_cabeza(op.jinete,j.x,j.y);}
    // luces rojas: II una fija, III todas titilando; ojos de jefe en III
    const L=d.partes.luces;
    if(n>=2)L.slice(0,n>=3?L.length:1).forEach(([x,y],k)=>{const on=n<3||((t>>3)+k)%2===0;
      ctx.fillStyle=AV_TINTA;ctx.fillRect(x-1,y-1,3,3);ctx.fillStyle=on?'#ff3b30':'#5a1418';ctx.fillRect(x,y,1,1);
      if(on&&n>=3){ctx.fillStyle='rgba(255,59,48,0.35)';ctx.fillRect(x-1.5,y-1.5,4,4);}});
    if(n>=3&&d.partes.ojos)for(const[x,y]of d.partes.ojos){ctx.fillStyle=(t>>2)%6?'#ff3b30':'#ffb0a0';ctx.fillRect(x,y,2,1);}
    // caño (apunta con v.aim) y, al atacar, retroceso y fogonazo en la punta
    const atk=pose==='atacar';AV_cano(d.partes.cano,n,v.aim,atk&&(t>>1)%2?-1:0);
    if(atk){const c=d.partes.cano;if(c){const{L}=AV_canoMed(c,n);ctx.save();ctx.translate(c.x,c.y+c.g/2);if(v.aim)ctx.rotate(v.aim);AV_fogonazo(L,0,t);ctx.restore();}
      else AV_fogonazo(d.boca.x,d.boca.y,t);}
    // dañado: chispas y un parche que titila
    if(dan){if((t>>2)%3===0){ctx.fillStyle='#ffd25a';const h1=hash(t>>2),h2=hash((t>>2)+7);ctx.fillRect(2+h1*(d.w-4),2+h2*(d.h-4),1.5,1.5);}
      if((t>>3)%2){ctx.fillStyle='rgba(255,90,60,0.35)';ctx.fillRect(d.w*0.3,d.h*0.3,d.w*0.4,d.h*0.3);}}
  }finally{ctx.restore();}
}
// en la tabla el que maneja va parado: botas y piernas que asoman (el cuerpo lo dibuja el juego si quiere)
function AV_piesTabla(rd,x,y){ctx.fillStyle=AV_TINTA;ctx.fillRect(x-4,y-1,9,3);ctx.fillStyle='#2b2019';ctx.fillRect(x-3,y,3,1);ctx.fillRect(x+1,y,3,1);}
// ---------- M1 CHATARRA: lo rudo de II y III encima del dibujo de grillo.js ----------
// (la cabina y la cabeza del que maneja van arriba al medio, x 9–19 y 0–9: ahí no se pone nada)
const AV_CHAT={placas:[[1,8,5,4],[17,9,4,4],[5,13,12,2]],puas:[[3,4,'u'],[7,4,'u'],[22,9,'f'],[21,13,'f'],[0,11,'b'],[1,15,'b']],
  cano:null,sold:[[2,12,20,12],[1,10,8,10]],luces:[[3,7],[20,8]],ojos:[[19,10]],escape:[4,17]};
const AV_chatCache={};
if(typeof drawMech==='function'){const AV_drawMech0=drawMech;
  drawMech=function(m){
    AV_drawMech0(m);
    const n=(m&&m.lvl)||1;if(n<2||m.dying||m.fus>0||!onScreen(m,30))return;
    try{
      // el mismo desplazamiento vertical que usa drawMech (grillo.js): se hunde 4 estacionada y se hamaca al caminar
      const sink=(!m.ride&&!m.dying)?4:0,bob=m.ride&&m.onGround&&m.vx?Math.abs(Math.sin((m.anim||0)*0.14))*1.2:0;
      const esc=typeof FU_NIV!=='undefined'&&FU_NIV[n]?FU_NIV[n].esc:1,by=sink-bob,t=T;
      const c=AV_chatCache[n]||(AV_chatCache[n]=AV_ras(22,20,AV_rudo(AV_CHAT,n)));
      ctx.save();
      if(esc!==1){const fx=m.x+m.w/2,fy=m.y+m.h;ctx.translate(fx,fy);ctx.scale(esc,esc);ctx.translate(-fx,-fy);}
      ctx.translate(q(m.x),q(m.y));if(m.face<0){ctx.translate(m.w,0);ctx.scale(-1,1);}ctx.translate(0,by);
      if(m.flash>0)ctx.globalAlpha=0.4;
      ctx.drawImage(c,-3,-3);
      if(n>=3)AV_humo(AV_CHAT.escape[0],AV_CHAT.escape[1],t,3);
      AV_CHAT.luces.slice(0,n>=3?9:1).forEach(([x,y],k)=>{const on=n<3||((t>>3)+k)%2===0;
        ctx.fillStyle=AV_TINTA;ctx.fillRect(x-1,y-1,3,3);ctx.fillStyle=on?'#ff3b30':'#5a1418';ctx.fillRect(x,y,1,1);});
      if(n>=3)for(const[x,y]of AV_CHAT.ojos){ctx.fillStyle=(t>>2)%6?'#ff3b30':'#ffb0a0';ctx.fillRect(x,y,2,1);}
      ctx.restore();
    }catch(e){}
  };}
// ---------- gancho de Código: VEH_ARTE[nombre](v, nivel) ----------
// Código llama VEH_ARTE[nombre](v, nivel) con ctx ya trasladado a (v.x, v.y). Acá se registra el arte de cada vehículo
// con su nombre (tal cual, en minúsculas y sin tilde, por las dudas). La pose sale del estado del vehículo; si Código
// pasa v.pose, manda esa.
function AV_pose(v){
  if(v.pose)return v.pose;
  if(v.dying||(v.armor!=null&&v.max&&v.armor/v.max<0.3))return 'danado';
  if((v.recoil||0)>0||(v.firing||0)>0||(v.atk||0)>0)return 'atacar';
  if(Math.abs(v.vx||0)>0.1||Math.abs(v.vy||0)>0.3)return 'mover';
  return 'quieto';
}
function AV_registrar(){
  if(typeof VEH_ARTE==='undefined'||!VEH_ARTE)return false;
  AV_NOMBRE.forEach((nom,i)=>{if(i===0)return; // la CHATARRA la dibuja grillo.js (+ lo rudo de arriba)
    const f=function(v,nivel){AV_dibujar(i,{x:0,y:0,w:v.w||AV_TAM[i].w,h:v.h||AV_TAM[i].h,face:v.face,rot:v.rot,aim:v.aim},
      {nivel:nivel||v.lvl||1,pose:AV_pose(v),t:typeof T==='number'?T:0,flash:(v.flash||0)>0,jinete:v.by||v.jinete||(v.ride&&typeof P!=='undefined'?P:null),jet:v.jet});};
    const llano=nom.normalize('NFD').replace(/[̀-ͯ]/g,'');
    for(const k of new Set([nom,nom.toLowerCase(),llano,llano.toLowerCase()]))VEH_ARTE[k]=f;});
  return true;
}
if(!AV_registrar())ON_START.push(()=>{AV_registrar();}); // si VEH_ARTE se arma después, se registra al empezar la misión
