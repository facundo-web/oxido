'use strict';
// Óxido · Historia "EL ENGRANAJE DORADO": piezas de Personajes y efectos (notas/arte/fichas/personajes-y-efectos.md)
// Va después de arte-jefes-m1.js y antes de juego.js. Prefijo HI_.
// · TUERCA apagado en una pila (M1): gris, ojo y foquito apagados, hueco de engranaje en el pecho. Se ve solo si
//   !TU_libre() (tuerca.js). Si ya juntaste algún engranaje dorado y pasás cerca, el foquito parpadea dos veces ("¿BIP?").
// · CHATARRA encadenado (M1): poste, cadena y etiqueta "SE VENDE" hasta que alguien se sube; ahí la cadena se cae.
// · Engranaje de la placa de misión cumplida: HI_engranajeDibujar(cx, cy, n, tNuevo) con n de 10 dientes; el diente
//   nuevo entra con un destello (tNuevo = cuadros desde que llegó; -1 o nada = sin destello). Lo integra Código en la placa.
// · HI_dienteDibujar(x, y): el diente dorado chico (5 × 5) para el que llega volando desde el villano.
// Todo en píxeles enteros, con contorno de tinta de 1 px; nada gira.
const HI_TINTA='#17141f';
const HI_red=()=>typeof MOV_reducido==='function'&&MOV_reducido();
// lienzo a partir de una grilla de colores, con contorno de tinta automático de 1 px
function HI_lienzo(w,h,pinta){
  const W2=w+2,H2=h+2,grid=new Array(W2*H2).fill(null);
  pinta((x,y,c)=>{x=Math.round(x)+1;y=Math.round(y)+1;if(x>=0&&y>=0&&x<W2&&y<H2)grid[y*W2+x]=c;});
  const cv=document.createElement('canvas');cv.width=W2;cv.height=H2;const g=cv.getContext('2d');
  for(let y=0;y<H2;y++)for(let x=0;x<W2;x++){let c=grid[y*W2+x];
    if(!c){for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<W2&&Y<H2&&grid[Y*W2+X]&&grid[Y*W2+X]!==HI_TINTA){c=HI_TINTA;break;}}}
    if(c){g.fillStyle=c;g.fillRect(x,y,1,1);}}
  return cv;
}
const HI_conLuz=cv=>{try{const l=typeof LUZ_luz==='function'&&LUZ_luz();if(l&&typeof LUZ_sprite==='function')return LUZ_sprite(cv,l,{});}catch(e){}return cv;};

// ---------- el diente dorado chico ----------
const HI_DIENTE=['.#.#.','#####','##.##','#####','.#.#.'];
let HI_dienteCv=null;
function HI_dienteDibujar(x,y){
  if(!HI_dienteCv)HI_dienteCv=HI_lienzo(5,5,set=>HI_DIENTE.forEach((r,j)=>{for(let i=0;i<5;i++)if(r[i]==='#')set(i,j,i+j<=2?'#fff0b0':i+j>=6?'#7a5a1a':'#d8a83a');}));
  ctx.drawImage(HI_dienteCv,Math.round(x)-1,Math.round(y)-1);
}

// ---------- engranaje de la placa: 10 dientes, n puestos ----------
const HI_ENG=new Map();
const HI_dientePos=k=>{const a=-Math.PI/2+k*Math.PI*2/10;return[Math.round(12+Math.cos(a)*10),Math.round(12+Math.sin(a)*10),a];};
function HI_engranajeLienzo(n){
  n=Math.max(0,Math.min(10,n|0));let c=HI_ENG.get(n);if(c)return c;
  // cuerpo dorado apagado hasta tener los 10 (así "4 de 10" se lee de un vistazo); completo, rampa brillante
  const lleno=n>=10,oro=s=>s<-6?'#fff0b0':s>5?'#7a5a1a':'#d8a83a',apagado=s=>s<-6?'#8a6a28':s>5?'#5a4210':'#7a5a1a';
  c=HI_lienzo(25,25,set=>{
    for(let y=0;y<25;y++)for(let x=0;x<25;x++){const dx=x-12,dy=y-12,d2=dx*dx+dy*dy;if(d2<=8*8+4)set(x,y,(lleno?oro:apagado)(dx+dy));}
    for(let k=0;k<10;k++){const[cx,cy]=HI_dientePos(k);
      if(k<n){for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)set(cx+i,cy+j,oro((cx+i-12)+(cy+j-12)));} // los dientes que ya están: dorado pleno
      else for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++){if(Math.abs(i)<2&&Math.abs(j)<2)continue; // el lugar vacío: hueco, solo el contorno de tinta
        const X=cx+i,Y=cy+j,d2=(X-12)**2+(Y-12)**2;if(d2>8*8+4)set(X,Y,HI_TINTA);}}
    for(let y=8;y<=16;y++)for(let x=8;x<=16;x++){const d2=(x-12)**2+(y-12)**2;if(d2<=3*3+1)set(x,y,d2<=2*2?'#3a2a10':lleno?'#a07a20':'#5a4210');} // eje
  });
  HI_ENG.set(n,c);return c;
}
function HI_engranajeDibujar(cx,cy,n,tNuevo){
  const c=HI_engranajeLienzo(n),x0=Math.round(cx)-13,y0=Math.round(cy)-13;
  if(n>=10&&typeof LUZ_haloImg==='function'){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=HI_red()?0.35:0.3+0.08*Math.sin(T/30);
    ctx.drawImage(LUZ_haloImg('#ffd860'),Math.round(cx)-24,Math.round(cy)-24,48,48);ctx.restore();} // completo: halo dorado
  ctx.drawImage(c,x0,y0);
  if(!(n>0)||!(tNuevo>=0)||tNuevo>=20)return;
  const[tx,ty]=HI_dientePos(n-1),X=x0+1+tx,Y=y0+1+ty;
  if(tNuevo<8){ctx.fillStyle=tNuevo<4?'#ffffff':'#fff0b0';ctx.fillRect(X-1,Y-1,3,3);}
  if(!HI_red()&&tNuevo<10){const l=1+Math.min(2,tNuevo>>1);ctx.fillStyle='#fff0b0'; // destello: 4 rayos de píxel que crecen
    ctx.fillRect(X,Y-2-l,1,l);ctx.fillRect(X,Y+3,1,l);ctx.fillRect(X-2-l,Y,l,1);ctx.fillRect(X+3,Y,l,1);}
}

// ---------- TUERCA apagado en una pila (M1) ----------
const HI={tuercaX:null,cerca:false,guino:-999,cadena:null,caidas:[]};
const HI_GRIS={k:HI_TINTA,h:'#8a929c',H:'#b0b8c2',S:'#4a525c',e:'#1e2228',z:'#6a6a60',r:'#4a525c',v:'#6a727c',V:'#525a64',p:'#525a64',P:'#40464e',b:'#2a2a30',s:'#8a929c'};
let HI_tuercaCv=null,HI_FOCO=null;
function HI_tuercaLienzo(){
  if(HI_tuercaCv)return HI_tuercaCv;
  const c=typeof PJ_BOCETOS!=='undefined'&&PJ_BOCETOS[typeof PJ_ELEGIDO==='number'?PJ_ELEGIDO:0];
  const head=c?c.head:[".....k........","....kzk.......","...kkkkkkkk...","..khhhhhhhhk..","..khhhkeeekk..","..khhhkeeek...","...kSSSSSSk..."];
  const torso=c?c.torso:["...krrrrrrrk..","..kvvvvvvvvvk.","..kvzvvVvvvvk.","..kvvvvVvvzvk.","..kVVVVVVVVVk."];
  const W=40,H=21,tx=4,ty=9,hx=tx+1,hy=ty-6; // sentado contra la pila, la cabeza caída 1 px
  HI_tuercaCv=HI_lienzo(W,H,set=>{
    // la pila de chatarra de atrás (oscura, para que TUERCA se lea adelante): loma, una chapa, un caño y una cubierta
    for(let y=9;y<H;y++){const a=Math.round(16-Math.sqrt((y-9)*8)),b=Math.round(21+Math.sqrt((y-9)*16));
      for(let x=Math.max(0,a);x<=Math.min(W-1,b);x++)set(x,y,y<11?'#5a3a34':y>=H-2?'#24161c':'#3a2428');}
    for(let i=0;i<8;i++){set(19+i,10+(i>>2),'#6a4438');set(19+i,11+(i>>2),'#2e1c22');}                              // chapa torcida
    for(let x=24;x<36;x++){set(x,14,'#6a6e7a');set(x,15,'#44485a');set(x,16,'#2e3240');}                          // caño
    for(let y=-4;y<=4;y++)for(let x=-4;x<=4;x++){const d2=x*x+y*y;if(d2<=18)set(34+x,H-5+y,d2<=2?'#3a3448':d2<=6?'#17141f':'#24202e');} // cubierta
    // TUERCA: torso, piernas cortas hacia adelante (pies para arriba), brazo caído y la cabeza encima
    torso.forEach((r,j)=>{for(let i=0;i<14;i++){const ch=r[i];if(ch!=='.')set(tx+i,ty+j,HI_GRIS[ch]||HI_GRIS.v);}});
    for(const[i,j]of[[5,1],[6,1],[7,1],[5,2],[6,2],[7,2],[5,3],[6,3],[7,3]])set(tx+i,ty+j,(i===6||j===2)?'#121016':'#2a2a32'); // hueco del pecho (un engranaje chico)
    for(const lx of[4,8]){for(let i=0;i<5;i++){set(tx+lx+i,ty+5,HI_GRIS.V);set(tx+lx+i,ty+6,HI_GRIS.P);}set(tx+lx+5,ty+4,'#2a2a30');set(tx+lx+5,ty+5,'#2a2a30');set(tx+lx+5,ty+6,'#2a2a30');} // piernas y pies
    for(let j=2;j<=6;j++)set(tx+2,ty+j,HI_GRIS.v);set(tx+2,ty+7,HI_GRIS.S);                                       // brazo caído hasta el piso
    head.forEach((r,j)=>{for(let i=0;i<14;i++){const ch=r[i];if(ch!=='.')set(hx+i,hy+j,HI_GRIS[ch]||HI_GRIS.h);}});
    {const j=head.findIndex(r=>r.includes('e')),i=head[j].indexOf('e');set(hx+i,hy+j,'#4a525c');}                  // reflejo apagado en el ojo
  });
  // dónde quedó el foquito (la 'z' de la cabeza) dentro del lienzo, para el parpadeo
  head.forEach((r,j)=>{const i=r.indexOf('z');if(i>=0&&!HI_FOCO)HI_FOCO=[hx+i+1,hy+j+1];});
  return HI_tuercaCv;
}
// lugar libre en M1 entre la intro y CHATARRA: 50 px sin estructuras, cajas, presos, chapas ni tachos
function HI_buscarLugar(){
  const lv=L,ext=typeof ESC_extras==='function'&&typeof ESC_def==='function'&&ESC_def()?ESC_extras(ESC_def()):[];
  const ocupa=x=>(lv.covers||[]).some(c=>x>c.x-8&&x<c.x+c.w+8)||(lv.crates||[]).some(c=>x>c.x-8&&x<c.x+24)||
    (lv.decor||[]).some(d=>x>d.x-10&&x<d.x+(d.k==='car'?56:d.k==='pylon'?40:20))||(lv.tunnels||[]).some(t=>x>t.x-12&&x<t.x+t.w+12)||
    (lv.pyramids||[]).some(p=>x>p.x-12&&x<p.x+p.w+12)||(lv.prisoners||[]).some(p=>x>p.x-16&&x<p.x+24)||(lv.vaults||[]).some(v=>x>v.x-16&&x<v.x+40)||
    (lv.platforms||[]).some(p=>!p.roof&&(p.y>GROUND-28?(x>p.x-10&&x<p.x+p.w+8):[p.x+4,p.x+p.w-6].some(px=>x>px-10&&x<px+8)))||(lv.mechs||[]).some(m=>x>m-60&&x<m+40)||
    ext.some(o=>x>o.x-10&&x<o.x+(o.k==='chapa'?(o.w||58)+6:o.k==='porton'?96:20));
  for(let x=560;x<1300;x+=4){let ok=true;for(let i=0;i<=50;i+=2)if(ocupa(x+i)){ok=false;break;}if(ok)return x;}
  return null;
}
function HI_tuercaDibujar(){
  if(typeof levelIdx==='undefined'||levelIdx!==0||typeof TU_libre!=='function'||TU_libre())return;
  if(HI.tuercaX===null)HI.tuercaX=HI_buscarLugar()??-1;if(HI.tuercaX<0)return;
  const cv=HI_conLuz(HI_tuercaLienzo()),x=Math.round(HI.tuercaX),y=GROUND-cv.height+1;
  if(x>camX+VW+10||x+cv.width<camX-10)return;
  if(typeof LUZ_sombra==='function')LUZ_sombra(x+cv.width/2,GROUND,cv.width-6,0);
  ctx.drawImage(cv,x,y);
  // ¿BIP?: si ya juntaste algún engranaje dorado, al pasar cerca el foquito parpadea dos veces
  const cerca=typeof players!=='undefined'&&players.some(p=>!p.dead&&Math.abs((p.ride?p.ride.x:p.x)-(x+20))<56);
  if(cerca&&!HI.cerca&&typeof ENG_total==='function'&&ENG_total()>0)HI.guino=T;HI.cerca=cerca;
  const d=T-HI.guino;if(HI_FOCO&&d>=0&&d<30&&(d<6||(d>=14&&d<20))){ctx.fillStyle='#6ff0ff';ctx.fillRect(x+HI_FOCO[0],y+HI_FOCO[1],1,1);
    if(typeof LUZ_halo==='function')LUZ_halo(x+HI_FOCO[0]+0.5,y+HI_FOCO[1]+0.5,4,'#6ff0ff',0.35);}
}

// ---------- CHATARRA encadenado con "SE VENDE" (M1) ----------
const HI_texto=()=>{try{return TX.historia.carteles.seVende;}catch(e){return 'SE VENDE';}};
let HI_cartelCv=null;
function HI_cartel(){ // etiqueta de cartón con hilo: "SE VENDE" y el signo $ chico al costado
  if(HI_cartelCv)return HI_cartelCv;
  const t=typeof pfLienzo==='function'?pfLienzo(HI_texto(),'#3a2a1a'):null,tw=t?t.width:30,w=tw+12,h=9;
  const base=HI_lienzo(w,h+3,set=>{set(Math.floor(w/2),0,'#17141f');set(Math.floor(w/2),1,'#17141f');
    for(let y=3;y<h+3;y++)for(let x=0;x<w;x++)set(x,y,y===3?'#fff4d0':y===h+2?'#c8b488':'#e8d8b0');
    for(const[a,b]of[[3,4],[2,5],[3,5],[2,6],[2,7],[3,7],[3,8],[2,9],[3,9],[2,10]])set(w-5+a-2,b,'#3a2a1a');}); // el $ (letra de 2 px)
  const g=base.getContext('2d');if(t)g.drawImage(t,4,6);
  HI_cartelCv=base;return base;
}
const HI_eslabon=(x,y,i,ink)=>{x=Math.round(x);y=Math.round(y);const w=i%2?1:2,h=i%2?2:1; // eslabones alternados de 2 px
  if(ink){ctx.fillStyle=HI_TINTA;ctx.fillRect(x-1,y-1,w+2,h+2);}else{ctx.fillStyle=i%2?'#6a6e7a':'#9aa0aa';ctx.fillRect(x,y,w,h);}};
function HI_cadenaPuntos(x0,y0,x1,y1,comba){const n=Math.max(2,Math.round(Math.hypot(x1-x0,y1-y0)/2)),pts=[];
  for(let i=0;i<=n;i++){const t=i/n;pts.push([x0+(x1-x0)*t,y0+(y1-y0)*t+Math.sin(Math.PI*t)*comba]);}return pts;}
function HI_cadenaMech(){
  if(typeof levelIdx==='undefined'||levelIdx!==0||typeof mechs==='undefined')return null;
  let m=null;for(const k of mechs)if(!k.tipo&&(!m||k.x<m.x))m=k; // solo el primer CHATARRA de la misión
  return m;
}
function HI_cadenaDibujar(){
  const m=HI_cadenaMech();if(!m)return;
  if(HI.cadena!==m){HI.cadena=m;m.HI_poste=Math.round(m.x)-36;m.HI_suelto=!!m.ride;}
  const px=m.HI_poste;if(px>camX+VW+30||px<camX-80)return;
  // poste de madera con capuchón
  ctx.fillStyle=HI_TINTA;ctx.fillRect(px-1,GROUND-25,6,26);ctx.fillStyle='#4a2e2a';ctx.fillRect(px,GROUND-24,4,24);
  ctx.fillStyle='#7a4a3a';ctx.fillRect(px,GROUND-24,1,24);ctx.fillStyle='#2e1a22';ctx.fillRect(px+3,GROUND-24,1,24);
  ctx.fillStyle=HI_TINTA;ctx.fillRect(px-2,GROUND-27,8,4);ctx.fillStyle='#5a5e6a';ctx.fillRect(px-1,GROUND-26,6,2);
  if(typeof LUZ_sombra==='function')LUZ_sombra(px+2,GROUND,10,0);
  const ax=px+5,ay=GROUND-21;
  if(!m.HI_suelto&&(m.ride||m.dying>0||m.armor<=0)){m.HI_suelto=true; // al subirse (o si lo rompen), la cadena se cae
    const pts=HI_cadenaPuntos(ax,ay,m.x+4,m.y+13,3);
    for(let i=2;i<pts.length;i+=3)HI.caidas.push({x:pts[i][0],y:pts[i][1],vx:(Math.random()-0.5)*0.6,vy:-0.6-Math.random(),i,t:0,k:'e'});
    HI.caidas.push({x:px+1-Math.floor(HI_cartel().width/2),y:GROUND-24,vx:-0.3,vy:-0.8,t:0,k:'c'});}
  if(!m.HI_suelto){
    const pts=HI_cadenaPuntos(ax,ay,m.x+4,m.y+13,3);
    for(const ink of[true,false])pts.forEach(([x,y],i)=>HI_eslabon(x,y,i,ink));
    // la etiqueta cuelga de un clavo del poste, adelante; con viento se mueve 1 px (sin girar)
    const cv=HI_cartel(),sw=HI_red()?0:Math.round(Math.sin(T/45)*0.8);
    ctx.fillStyle='#9aa0aa';ctx.fillRect(px+1,GROUND-23,1,1);
    ctx.drawImage(cv,px+1-Math.floor(cv.width/2)+sw,GROUND-24);
  }else{ // suelto: quedan 3 eslabones colgando del poste
    for(const ink of[true,false])for(let i=0;i<3;i++)HI_eslabon(ax+(i%2),ay+i*2,i,ink);}
}
function HI_caidasDibujar(){
  for(const c of HI.caidas){c.t++;
    if(c.y<GROUND-2){c.vy+=0.18;c.x+=c.vx;c.y=Math.min(GROUND-2,c.y+c.vy);}else{c.vx=0;c.vy=0;}
    const fin=c.t>200,parp=c.t>170&&(c.t>>2)%2;if(fin||parp)continue;
    if(c.k==='e')for(const ink of[true,false])HI_eslabon(c.x,c.y,c.i,ink);
    else{const cv=HI_cartel();ctx.drawImage(cv,Math.round(c.x),Math.min(Math.round(c.y),GROUND-cv.height+1));}}
  HI.caidas=HI.caidas.filter(c=>c.t<=200);
}

// ---------- ganchos: detrás de las plataformas y de los personajes, encima del piso y la decoración ----------
ON_START.push(()=>{HI.tuercaX=null;HI.cerca=false;HI.guino=-999;HI.cadena=null;HI.caidas=[];});
if(typeof drawPlatforms==='function'){const HI_plat0=drawPlatforms;drawPlatforms=function(){
  try{if(typeof state==='undefined'||state==='play'){HI_tuercaDibujar();HI_cadenaDibujar();HI_caidasDibujar();}}catch(e){}
  return HI_plat0.apply(this,arguments);};}

// ---------- M1 · DON BULÓN chico y sentado (sin su diente vuelve a su tamaño; guion codigo-m1.md, punto J) ----------
// HI_bulonChico(x, yPiso, {pose, cara}): x = centro, yPiso = el piso. Más o menos del tamaño de CHATARRA, sentado en un
// montón de chatarra. pose 'sentado' (ojo de metal abierto) o 'choque' (CHATARRA le choca la cabeza: la cabeza baja 1 px
// y el ojo se cierra). En el pecho, el hueco apagado del diente (la forma del engranaje, oscura). Sin rotate; píxeles
// enteros con contorno de tinta automático. cara: 1 mira a la derecha, -1 a la izquierda.
const HI_BCH=new Map();
function HI_bulonChicoLienzo(pose,cara){
  const k=pose+'|'+cara;let c=HI_BCH.get(k);if(c)return c;
  const W=26,H=26,ch=pose==='choque'?1:0;
  c=HI_lienzo(W,H,set=>{
    const R=(x,y,w,h,col)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)set(x+i,y+j,col);};
    // el montón de chatarra donde está sentado (atrás y abajo)
    for(let y=20;y<H;y++){const a=Math.round(5-Math.sqrt((y-20)*5)),b=Math.round(20+Math.sqrt((y-20)*5));for(let x=Math.max(0,a);x<=Math.min(W-1,b);x++)set(x,y,y<21?'#8a7a6a':y>=H-2?'#3a3028':'#5e5246');}
    R(2,23,6,1,'#9aa0aa');R(2,24,6,1,'#5a5e6a');R(19,22,4,2,'#8a5a44');set(13,24,'#c0b0a0');set(7,21,'#6a4438'); // chapas, un caño y tuercas
    // chimenea y antenas (las luces apagadas)
    R(3,1+ch,3,6,'#2a2a30');R(2,0+ch,5,1,'#3a3a44');
    R(9,0+ch,1,3,'#2a2a30');set(9,0+ch,'#2a5a34');R(14,0+ch,1,3,'#2a2a30');set(14,0+ch,'#2a5a34');
    // cabeza con rampa
    for(let y=3;y<=9;y++)R(7,y+ch,10,1,y<=4?'#c06040':y>=8?'#5a2418':'#8c3b2a');
    // el ojo: lente de metal con iris ámbar apagado; en el choque, cerrado
    if(pose==='choque'){R(12,6+ch,5,1,'#3a2a24');R(12,5+ch,1,1,'#3a2a24');R(16,5+ch,1,1,'#3a2a24');}
    else{R(13,4+ch,3,1,'#3a2a24');R(12,5+ch,5,3,'#3a2a24');R(13,8+ch,3,1,'#3a2a24');R(13,5+ch,3,3,'#c0b0a0');R(14,6+ch,2,1,'#8a5a3a');set(13,5+ch,'#ffffff');} // lente redonda
    // hombros y torso con rampa (luz arriba, sombra abajo) y manchas de óxido
    R(5,10,16,2,'#7a2a1c');R(5,10,16,1,'#a8402a');
    for(let y=12;y<=18;y++)R(5,y,16,1,y===12?'#e0905e':y===13?'#c86a48':y>=17?'#5a2418':'#a8503a');
    set(7,14,'#6a3a2a');set(8,14,'#6a3a2a');set(18,13,'#8a4a32');
    for(let i=0;i<8;i++)R(5+i*2,16,2,1,i%2?'#1d1a1c':'#d9a43a'); // franja de peligro
    // el hueco del diente: la forma del engranaje, oscura y apagada
    ['.#.#.','#####','##.##','#####','.#.#.'].forEach((r,j)=>{for(let i=0;i<5;i++)if(r[i]==='#')set(10+i,11+j,j<2&&i<2?'#4a2e22':'#24140e');});
    // brazos: pinza atrás, cañoncito adelante, apoyados
    R(3,13,2,6,'#4a2a22');R(2,19,3,1,'#6a6a72');R(21,13,2,5,'#4a2a22');R(21,17,4,2,'#2a2a30');R(24,17,1,2,'#1a1a20');
    // piernas dobladas hacia adelante, rodillas de metal y pies planos
    R(7,19,6,2,'#7a3a2c');R(14,19,6,2,'#a0573e');R(12,19,2,2,'#8a5a3a');R(19,19,2,2,'#8a5a3a');
    R(10,21,5,2,'#24181a');R(18,21,6,2,'#24181a');R(10,21,5,1,'#5a3a30');R(18,21,6,1,'#5a3a30');
  });
  if(cara<0){const m=document.createElement('canvas');m.width=c.width;m.height=c.height;const g=m.getContext('2d');g.translate(c.width,0);g.scale(-1,1);g.drawImage(c,0,0);c=m;}
  HI_BCH.set(k,c);return c;
}
function HI_bulonChico(x,yPiso,op){
  op=op||{};const c=HI_bulonChicoLienzo(op.pose==='choque'?'choque':'sentado',op.cara<0?-1:1);
  ctx.drawImage(c,Math.round(x-c.width/2),Math.round(yPiso-c.height+1));
}
