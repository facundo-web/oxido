'use strict';
// Óxido · Interfaz, menús y pantallas finales
// ================== íconos en pixel art ==================
// Cada ícono es una grilla de letras; '.' es transparente. Los colores salen de HUD_PAL (o de un pal propio).
const HUD_PAL={k:'#120c18',g:'#3a3a44',l:'#8c8e98',w:'#8a5a30',W:'#6b4423',G:'#55603a',H:'#7f8c52',y:'#e8c25a',
  r:'#b8401e',R:'#e06a3a',b:'#7ab8ff',m:'#d93a2b',c:'#96dce6',p:'#3d4a2c',P:'#5d6e40'};
const HUD_ICONS={
  pistol:['kkkkkkkkk.','klllllllkk','kgggggggk.','kkgkkkkk..','.kWWk.....','.kWWk.....','.kkkk.....'],
  heavy:['..kkkkk.........','kkkGGGGkkkkkkkkk','kWkGHHGllllllllk','kWkGGGGkkkkkkkkk','kWWkyykk........','.kkkyyk.........','....kk..........'],
  shotgun:['kkkk...kkkkkkkkk','kwwwkkkggggggggk','kWwwwwkgwwwwgggk','kkWWWkgkWWWWkkkk','...kkkk.kkkk....'],
  flame:['.kkk............','kRrrk...........','krrrkkkkkkkkkk..','krrrklllllllllkb','krrrkkgkkkkkkk..','kkkkkgWk........','....kkkk........'],
  rocket:['...kk...........','kkkkgkkkkkkkk...','kgGGGGGGGGGGkkk.','kgHHHHHHHHHHkmmk','kgGGGGGGGGGGkkk.','kkkkkWkkkkkkk...','....kkk.........'],
  grenade:['...kkk.','..kgkk.','.kkkkk.','kGHGGGk','kGGGGGk','kGGGGGk','.kkkkk.'],
  plane:['kk..........','kPk..kkkk...','kPPkkPPPPkkk','kpppppppppck','.kkkkpppkkk.','.....kkk....'],
  heart:['.kk.kk.','krRkrrk','krrrrrk','.krrrk.','..krk..','...k...'],
  shield:['kkkkk','kbcbk','kbbbk','kbbbk','.kbk.','..k..']
};
// dibuja la grilla punto por punto en el contexto g (es lo que hacía hudPix antes de la caché)
function hudPixEn(g,map,x,y,s,pal){
  for(let j=0;j<map.length;j++){const row=map[j];
    for(let i=0;i<row.length;i++){const ch=row[i];if(ch==='.')continue;g.fillStyle=pal[ch]||HUD_PAL[ch];g.fillRect(x+i*s,y+j*s,s,s);}}
}
// Caché: cada ícono se arma una vez como imagen chica, a la resolución de la pantalla y con el mismo corrimiento de
// subpixel, y después se pega entero. Antes era un fillRect por pixel (~600 por cuadro, casi la mitad del dibujo).
// Misma grilla y mismos colores; con escala entera (1280×720, 2880×1800) el resultado es idéntico pixel a pixel.
const HUD_PIXC=new WeakMap(),HUD_CHARS=new WeakMap();
function hudPix(map,x,y,s=1,pal=HUD_PAL){
  const m=ctx.getTransform();
  if(m.b||m.c||m.a<=0||m.d<=0){hudPixEn(ctx,map,x,y,s,pal);return;} // rotado o espejado: como antes
  let chs=HUD_CHARS.get(map);if(!chs){chs=[...new Set(map.join('').replace(/\./g,''))];HUD_CHARS.set(map,chs);}
  const dx=m.a*x+m.e,dy=m.d*y+m.f,ix=Math.floor(dx),iy=Math.floor(dy),fx=Math.round((dx-ix)*8)/8,fy=Math.round((dy-iy)*8)/8;
  let k=s+'|'+m.a+'|'+m.d+'|'+fx+'|'+fy;for(const ch of chs)k+='|'+(pal[ch]||HUD_PAL[ch]);
  let porMapa=HUD_PIXC.get(map);if(!porMapa){porMapa=new Map();HUD_PIXC.set(map,porMapa);}
  let c=porMapa.get(k);
  if(!c){c=document.createElement('canvas');c.width=Math.ceil(map[0].length*s*m.a+fx)+1;c.height=Math.ceil(map.length*s*m.d+fy)+1;
    const g=c.getContext('2d');g.setTransform(m.a,0,0,m.d,fx,fy);hudPixEn(g,map,0,0,s,pal);
    if(porMapa.size>48)porMapa.clear();porMapa.set(k,c);}
  ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(c,ix,iy);ctx.setTransform(m);
}
const hudIW=(map,s=1)=>map[0].length*s,hudIH=(map,s=1)=>map.length*s;
function hudTW(s,size){if(HUD_pxModo&&pxOk(s))return pxW(s);return txtW(s,size);} // mide también los íconos ✕ ○ □ △ (base.js)
// ---------- avisos en letra pixel (guía de arte §7: chicos, arriba o abajo, uno por vez) ----------
// pxTxt: la letra pixel de globos.js con contorno de tinta, a k píxeles por punto (k=2 con TEXTO GRANDE, si entra).
// Si el texto trae algo que esa letra no tiene (✕ ○ □ △ de un joystick), sale con la letra de siempre.
const pxOk=s=>{for(const ch of String(s))if(ch!==' '&&!pfGlifo(ch))return false;return true;};
const pxW=(s,k=1)=>pxOk(s)?pfW(String(s))*k:hudTW(s,5);
function pxTxt(s,x,y,col,align='center',k=1){s=String(s);
  if(!pxOk(s)){txt(s,x,y,5,col,align,true);return;}
  const c=pfLienzo(s,col,GL_TINTA),w=(c.width-2)*k,x0=align==='center'?x-w/2:align==='right'?x-w:x,sm=ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled=false;ctx.drawImage(c,Math.round(x0)-k,Math.round(y)-k,c.width*k,c.height*k);ctx.imageSmoothingEnabled=sm;}
// franja donde puede ir un aviso: en táctil, la de abajo queda entre la palanca y el rombo (tactilLibre)
function avFranja(abajo){const lb=abajo&&typeof tactilLibre==='function'?tactilLibre():null;
  if(lb)return{cx:(lb.x0+lb.x1)/2,max:lb.x1-lb.x0-8};return{cx:W/2,max:W-(onTouch()?60:16)};}
// arriba, en el juego: la franja libre entre el panel del HUD y el puntaje (HUD_centro, la arma drawHUD)
function avFranjaHUD(){const c=HUD_centro;return{cx:(c.x0+c.x1)/2,max:c.x1-c.x0};}
// tira de aviso: fondo oscuro, 1 px de color arriba y una o dos líneas centradas. lineas: [[texto,color],...]
// abajo=true: y es el borde de abajo. Devuelve {x,y,w,h} (por si alguien quiere poner un ícono a la izquierda).
// sub=true: la segunda línea es un detalle (medallas, logros); con TEXTO GRANDE, si la tira pasaría de 2 renglones ×2, se
// saca el detalle (en el iPhone SE ocupaba la cuarta parte de arriba: Pruebas)
function avTira(lineas,abajo,y,col,ico=0,sub=false){lineas=lineas.filter(l=>l[0]);
  let f=avFranja(abajo);const big=typeof ACC!=='undefined'&&ACC.txt==='grande';
  // arriba en el juego: si entra entre el panel y el puntaje va ahí; si no, a lo ancho y debajo del panel (nunca encima)
  const enHUD=!abajo&&state==='play'&&HUD_centro.yb;
  if(enHUD){const fh=avFranjaHUD(),cabe=lineas.every(([t])=>pxW(t,big?2:1)+8+ico<=fh.max);if(cabe)f=fh;else y=Math.max(y,HUD_centro.yb);}
  const lim=f.max-8-ico;
  // lo que no entra se parte en renglones por palabras (nunca se corta: Dirección de Arte)
  // y los renglones quedan parejos (sin una palabra sola abajo): se busca el ancho más chico que da la misma cantidad
  const corta=(t,k,l)=>{const r=[];let cur='';for(const pal of String(t).split(' ')){const pr=cur?cur+' '+pal:pal;
    if(cur&&pxW(pr,k)>l){r.push(cur);cur=pal;}else cur=pr;}if(cur)r.push(cur);return r;};
  const parte=k=>lineas.flatMap(([t,c])=>{if(pxW(t,k)<=lim)return[[t,c]];const r=corta(t,k,lim),n=r.length;
    let l=Math.ceil(pxW(t,k)/n);while(l<lim&&corta(t,k,l).length>n)l+=2*k;return corta(t,k,Math.min(l,lim)).map(x=>[x,c]);});
  // con TEXTO GRANDE va ×2 aunque haya que partir (en el celular casi todo pide más de 260 px: Pruebas, L1);
  // vuelve a ×1 solo si una palabra sola no entra o quedarían más del doble de renglones
  let k=1,ls=parte(1);if(big){let l2=parte(2);if(sub&&l2.length>2&&lineas.length>1){lineas=lineas.slice(0,1);l2=parte(2);ls=parte(1);}
    if(l2.length<=lineas.length*2&&l2.every(l=>pxW(l[0],2)<=lim)){k=2;ls=l2;}}
  const lh=6*k+2,w=Math.min(f.max,Math.max(...ls.map(l=>pxW(l[0],k)))+8+ico),h=ls.length*lh+3;
  const x=Math.round(f.cx-w/2),y0=Math.round(abajo?y-h:y);
  ctx.fillStyle='rgba(12,9,18,0.82)';ctx.fillRect(x,y0,w,h);ctx.fillStyle=col;ctx.fillRect(x,y0,w,1);
  ls.forEach((l,i)=>pxTxt(l[0],x+ico+(w-ico)/2,y0+3+i*lh,l[1],'center',k));return{x,y:y0,w,h,k};}
// alturas: arriba, debajo de la fila del HUD (con TEXTO GRANDE el HUD es más alto); abajo, sobre el borde de la pantalla.
// Abajo va solo la tarjeta de tramo (una línea, 2 s): ahí la tira roza los pies de los que están en el centro.
let AV_ARRIBA=23;const AV_ABAJO=()=>HC-2;
// con barra de jefe, debajo de su nombre y del cronómetro de reloj.js (y = 14 + letra; alto letra + 3), 6 px más abajo
ON_STEP.push(()=>{const gr=typeof ACC!=='undefined'&&ACC.txt==='grande';
  if(typeof bossShown==='function'&&bossShown()){const ta=TXT_aj(5);AV_ARRIBA=Math.ceil(14+ta+ta+2+6);}else AV_ARRIBA=gr?27:23;});
// tecla dibujada como una tecla chiquita ("S", "△", "L1", "LB"…). Se ensancha si el nombre es largo.
// el anillo del escudo en el color de cada jugador (P_COL), claro y oscuro: con el celeste fijo, el 1 parecía el 2
const ESCUDO_TONOS=[['#ffe08a','#b89a40'],['#7ad8ff','#3a9ac8']];
const escudoTono=p=>{const t=ESCUDO_TONOS[p&&p.slot===1?1:0];return typeof MOV_reducido==='function'&&MOV_reducido()?t[0]:(T>>4)%2?t[0]:t[1];};
// anillo de píxeles de 1 px (sin bordes lisos): se calcula una vez por tamaño y se pinta con fillRect enteros
const ARO_CACHE=new Map();
function aroPix(cx,cy,rx,ry,col){const k=rx+'|'+ry;let pts=ARO_CACHE.get(k);
  if(!pts){const st=new Set();pts=[];const n=Math.ceil(8*Math.max(rx,ry));for(let i=0;i<n;i++){const a=i/n*Math.PI*2,x=Math.round(Math.cos(a)*rx),y=Math.round(Math.sin(a)*ry),kk=x+','+y;if(!st.has(kk)){st.add(kk);pts.push([x,y]);}}ARO_CACHE.set(k,pts);}
  const x0=Math.round(cx),y0=Math.round(cy);ctx.fillStyle=col;for(const[x,y]of pts)ctx.fillRect(x0+x,y0+y,1,1);}
const keycapW=ch=>Math.max(7,(pxOk(ch)?pxW(ch)+4:Math.ceil(hudTW(ch,5))+3));
function keycap(ch,x,y,col='#ddd'){const w=keycapW(ch);ctx.fillStyle='#120c18';ctx.fillRect(x,y,w,7);ctx.fillStyle='#2a1f30';ctx.fillRect(x+0.5,y+0.5,w-1,6);
  ctx.fillStyle='#5a4a60';ctx.fillRect(x+0.5,y+6,w-1,0.5);if(pxOk(ch))pfTxt(ch,x+w/2,y+0.5,col,'center');else txt(ch,x+w/2,y+1,5,col,'center',false);return w;} // letra pixel
// ---------- HUD Hondo: piezas ----------
let HUD_reloj={x:60,y:31,k:1},HUD_centro={x0:100,x1:262}; // dónde va el reloj de la misión (reloj.js), al lado de las bajas
const HUD_escala=()=>typeof ACC!=='undefined'&&ACC.txt==='grande'?1.5:1;
const MOV_quieto=()=>typeof MOV_reducido==='function'&&MOV_reducido();
// corazón 7×6 con tinta (lleno rojo, vacío apagado)
const HUD_COR=['0110110','1111111','1111111','0111110','0011100','0001000'];
function hudBits(rows,x,y,col,ink){x=Math.round(x);y=Math.round(y);
  if(ink){ctx.fillStyle=ink;rows.forEach((r,j)=>{for(let i=0;i<r.length;i++)if(r[i]==='1')ctx.fillRect(x+i-1,y+j-1,3,3);});}
  ctx.fillStyle=col;rows.forEach((r,j)=>{for(let i=0;i<r.length;i++)if(r[i]==='1')ctx.fillRect(x+i,y+j,1,1);});}
function hudCorazon(x,y,on){hudBits(HUD_COR,x,y,on?'#ff5a5a':'#3a2a34','#120c18');if(on){ctx.fillStyle='#ffb0a0';ctx.fillRect(Math.round(x)+1,Math.round(y)+1,1,1);}}
// dígitos 5×7 con tinta (de pintar.js, Dirección de Arte): alineados a la derecha en xr, 6 px por dígito
const HUD_DIG={'0':'01110100011001110101110011000101110','1':'00100011000010000100001000010001110','2':'01110100010000100110010001000011111','3':'11110000010000101110000010000111110','4':'00010001100101010010111110001000010','5':'11111100001111000001000011000101110','6':'00110010001000011110100011000101110','7':'11111000010001000100010000100001000','8':'01110100011000101110100011000101110','9':'01110100011000101111000010001001100'};
const HUD_DIGR={};for(const d in HUD_DIG)HUD_DIGR[d]=HUD_DIG[d].match(/.{5}/g);
function hudNum(s,xr,y,col){let x=Math.round(xr-s.length*6+1);y=Math.round(y);
  for(const ch of s)if(HUD_DIGR[ch]){hudBits(HUD_DIGR[ch],x,y,col,'#120c18');x+=6;}}
// el panel de la CHATARRA (drawMechHUD de grillo.js, con lo que le suman fusion.js y vehiculos.js) en letra pixel: mientras
// se dibuja, txt escribe en pixel y los renglones se separan (la letra pixel con tinta pide 7 px; antes iban cada 5–6)
const HUD_MECH_Y=[[16.5,16],[22.5,23],[28.5,30],[33.5,37]];
let HUD_pxModo=false; // lo leen txt (base.js) y hudTW: con él prendido escriben y miden en letra pixel
function HUD_pxTxt(s,x,y,col,align){
  let yy=y;if(y>=12){let b=HUD_MECH_Y[0];for(const r of HUD_MECH_Y)if(Math.abs(r[0]-y)<Math.abs(b[0]-y))b=r;yy=b[1]+(y-b[0]>1.5?y-b[0]:0);}
  pxTxt(s,x,yy,col,align);}
function HUD_enPixel(fn){HUD_pxModo=true;try{fn();}finally{HUD_pxModo=false;}}
// ancho del chip del avión (drawAirChip), para que el panel lo abarque
function HUD_airW(){if(typeof simpleDe==='function'&&simpleDe(P.slot))return 0;
  const fv=RC_ver('fl',flares),s=fv>0?'×'+fv:'−1♥',k=airKey();return pxW(s)+2+(k?keycapW(k):7)+14;}
function heart(x,y,on){hudPix(HUD_ICONS.heart,x,y,1,on?{r:'#ff4d4d',R:'#ffb0a0'}:{r:'#4a2730',R:'#5a3340'});}
// cabecita del personaje elegido (sale del mismo sprite del juego)
function hudHead(x,y){const img=(P?playerSet(P):charSet(charIdx,p1Col[charIdx])).idle[0];ctx.drawImage(img,0,0,14,8,x,y,14,8);}
// ================== insignia de medalla (una sola, sube de nivel) ==================
function hudStar(cx,cy,ro,ri,col){ctx.fillStyle=col;ctx.beginPath();
  for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?ri:ro;ctx.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);}ctx.fill();}
// lvl: 0 = todavía ninguna, 1 = BRONCE … 6 = LEYENDA. La forma se vuelve más vistosa con cada nivel.
function drawBadge(cx,cy,lvl,r=5){
  if(lvl<=0){ctx.fillStyle='rgba(18,12,24,0.7)';circle(cx,cy,r+0.7);aroPix(cx,cy,r-0.5,r-0.5,'#5a4a60');return;} // aro de 1 px continuo (el punteado se veía como trama)
  const col=MEDALS[lvl-1].col;
  // cinta
  ctx.fillStyle='#120c18';ctx.fillRect(cx-3.5,cy-r-4.5,7,4.5);
  ctx.fillStyle='#d93a2b';ctx.fillRect(cx-2.5,cy-r-4,2.5,4);ctx.fillStyle='#2f5fb8';ctx.fillRect(cx,cy-r-4,2.5,4);
  // alas (platino en adelante)
  if(lvl>=4){ctx.fillStyle='#120c18';ctx.fillRect(cx-r-4,cy-2.5,r*2+8,4);ctx.fillStyle=col;ctx.fillRect(cx-r-3.5,cy-2,3,1);ctx.fillRect(cx+r+0.5,cy-2,3,1);
    ctx.fillRect(cx-r-2.5,cy-0.5,2,1);ctx.fillRect(cx+r+0.5,cy-0.5,2,1);}
  // laureles (oro en adelante)
  if(lvl>=3){ctx.fillStyle='#7dbf4a';for(let i=0;i<3;i++){const a=Math.PI*0.65+i*0.38;
    ctx.fillRect(cx+Math.cos(a)*(r+1.6)-0.6,cy+Math.sin(a)*(r+1.6)-0.6,1.3,1.3);ctx.fillRect(cx-Math.cos(a)*(r+1.6)-0.6,cy+Math.sin(a)*(r+1.6)-0.6,1.3,1.3);}}
  if(lvl===5){ // diamante: gema con facetas
    const d=r+1.5;ctx.fillStyle='#120c18';ctx.beginPath();ctx.moveTo(cx,cy-d-0.8);ctx.lineTo(cx+d+0.8,cy);ctx.lineTo(cx,cy+d+0.8);ctx.lineTo(cx-d-0.8,cy);ctx.fill();
    ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(cx,cy-d);ctx.lineTo(cx+d,cy);ctx.lineTo(cx,cy+d);ctx.lineTo(cx-d,cy);ctx.fill();
    ctx.fillStyle='#6fc8e8';ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+d,cy);ctx.lineTo(cx,cy+d);ctx.fill();
    ctx.fillStyle='#fff';ctx.fillRect(cx-d*0.45,cy-d*0.3,1,1);
  }else if(lvl===6){ // leyenda: estrella con destello
    hudStar(cx,cy,r+2.6,r*0.55+0.9,'#120c18');hudStar(cx,cy,r+1.8,r*0.55,col);hudStar(cx,cy,r*0.6,r*0.3,'#ffd0f0');
    if((T>>4)%3===0){ctx.fillStyle='#fff';ctx.fillRect(cx+r,cy-r-1,1,3);ctx.fillRect(cx+r-1,cy-r,3,1);}
  }else{ // medalla redonda
    ctx.fillStyle='#120c18';circle(cx,cy,r+0.7);ctx.fillStyle=col;circle(cx,cy,r);
    if(lvl>=2){ctx.fillStyle='rgba(18,12,24,0.25)';circle(cx,cy,r-1.2);ctx.fillStyle=col;circle(cx,cy,r-1.8);}
    if(lvl>=2)hudStar(cx,cy+0.3,r*0.55,r*0.24,'rgba(18,12,24,0.45)');
    ctx.fillStyle='rgba(255,255,255,0.6)';ctx.fillRect(cx-r*0.55,cy-r*0.6,1,1);
  }
}
const bossShown=()=>bossRef&&!bossRef.gone&&bossRef.state!=='enter';
// ================== HUD en juego ==================
function drawHUD(){
  // HUD Hondo (notas/arte/fichas/codigo.md, D): panel oscuro a la izquierda, puntaje en dígitos 5×7 a la derecha y
  // avance fino al centro. Todo en letra pixel. Con TEXTO GRANDE, el panel y el puntaje van ×1,5 (cada uno desde su esquina).
  const HS=HUD_escala();
  // --- izquierda: panel con corazones, vidas, arma, granadas y avión; debajo, insignia, bajas y reloj (reloj.js) ---
  ctx.save();ctx.scale(HS,HS);const AL=(k,x,y)=>RC_ancla(k,x*HS,y*HS);
  const hk='hp'+P.slot,hv=RC_ver(hk,P.hp),hj=RC_salto(hk),sk0='sh'+P.slot,sv=RC_ver(sk0,P.shield),sj=RC_salto(sk0);
  const lj=RC_salto('lv'),lvs='×'+Math.max(0,RC_ver('lv',lives));
  // ancho: fila 1 (corazones, escudos, cabecita y vidas) y fila 2 (arma, munición, otras armas, granadas y avión)
  const w=P.weapon,ak='am'+P.slot+w,ammo=w==='pistol'?'∞':String(RC_ver(ak,P.weapons[w])),low=w!=='pistol'&&P.weapons[w]<WEAPONS[w].ammo*0.2;
  const map=HUD_ICONS[w],iw=hudIW(map),ih=hudIH(map);
  const others=P.ride?[]:WORDER.filter(k=>k!==w&&(k==='pistol'||P.weapons[k]>0));
  const gk='gr'+P.slot,gv=RC_ver(gk,P.bombs),gs=String(gv);
  const w1=maxHp*9+(sv?sv*5+2:0)+4+14+pxW(lvs);
  let w2=iw+3+pxW(ammo)+others.reduce((n,k)=>n+hudIW(HUD_ICONS[k],0.75)+2,0)+(others.length?keycapW(btn('swap',P.slot))+3:0)+6+6+pxW(gs);
  if(P.ride)w2=0;
  const PX=3,PY=3,PW=Math.max(w1,w2)+8,PH=P.ride?15:25;
  ctx.globalAlpha=0.62;ctx.fillStyle='#0c0912';ctx.fillRect(PX,PY,PW,PH);ctx.globalAlpha=1;ctx.fillStyle='#ffd58a';ctx.fillRect(PX,PY,PW,1);
  // fila 1
  let hx=PX+4;for(let i=0;i<maxHp;i++){hudCorazon(hx,PY+5+(i===hv-1?hj:0),hv>i&&!P.dead);hx+=9;}
  AL(hk,PX+4+9*clamp(hv,0,maxHp-1)+3,PY+8);
  if(sv){hx+=1;AL(sk0,hx+sv*5,PY+8);for(let i=0;i<sv;i++){hudPix(HUD_ICONS.shield,hx,PY+5+(i===sv-1?sj:0));hx+=5;}}
  const lx=PX+PW-4-pxW(lvs)-15;hudHead(lx,PY+4+lj);pxTxt(lvs,PX+PW-4,PY+5+lj,lives>0?'#e8e2d4':'#ff6b5b','right');AL('lv',lx+7,PY+8);
  // fila 2: arma y munición, las otras armas chiquitas (adonde vuela su munición: recolectar.js), granadas y avión
  if(!P.ride){const y2=PY+15,aj=RC_salto('am'+P.slot);let x=PX+4;
    if(RC_luz('am'+P.slot)){ctx.fillStyle='rgba(255,240,180,0.35)';ctx.fillRect(x-1,y2-1+aj,iw+2,8);}
    hudPix(map,x,y2+3-ih/2+aj,1,w==='flame'?{b:'#ff9a3c'}:HUD_PAL);AL('am'+P.slot,x+iw/2,y2+3);x+=iw+3;
    pxTxt(ammo,x,y2+RC_salto(ak),low&&!MOV_quieto()&&(T>>3)%2?'#ff6b5b':low?'#ff9a8a':RC_luz(ak)?'#fff6c8':'#ffe08a','left');x+=pxW(ammo)+3;
    for(const k of others){const m=HUD_ICONS[k],ok='am'+P.slot+k,oj=RC_salto(ok);ctx.globalAlpha=RC_luz(ok)?1:0.55;
      hudPix(m,x,y2+3-hudIH(m,0.75)/2+oj,0.75);AL(ok,x+hudIW(m,0.75)/2,y2+3);x+=hudIW(m,0.75)+2;}
    ctx.globalAlpha=1;
    if(others.length){const sk=btn('swap',P.slot);keycap(sk,x,y2,'#aaa');x+=keycapW(sk)+3;}
    x+=3;const gj=RC_salto(gk);if(!gv)ctx.globalAlpha=0.45;hudPix(HUD_ICONS.grenade,x,y2+gj);ctx.globalAlpha=1;AL(gk,x+3,y2+3);x+=8;
    pxTxt(gs,x,y2+gj,gv?(RC_luz(gk)?'#fff6c8':'#e8e2d4'):'#ff6b5b','left');}
  // debajo del panel: insignia de medalla con su barrita, bajas (y el reloj de reloj.js, en HUD_reloj)
  // en el celular, si el botón II de pausa (publicar/web/tactil.js, OXIDO_TACTIL_POS) cae sobre esta fila, la fila se corre a
  // su derecha (iPhone SE: tapaba la insignia y las bajas, Pruebas)
  const yb=PY+PH+3,mv=RC_ver('md',medals),mj=RC_salto('md');let RX=PX;
  {const tp=onTouch()&&window.OXIDO_TACTIL_POS,pz=tp&&tp.pausa;
    if(pz&&pz.y+pz.r>yb*HS&&pz.y-pz.r<(yb+14)*HS&&pz.x-pz.r<(PX+80)*HS)RX=Math.max(PX,Math.ceil((pz.x+pz.r+3)/HS));}
  AL('md',RX+5,yb+4);
  const fresh=toasts.length&&toasts[0].lvl&&mv>=toasts[0].lvl;
  if(fresh&&!MOV_quieto()&&(T>>2)%2){ctx.fillStyle='rgba(255,255,255,0.35)';circle(RX+5,yb+4+mj,6);}
  drawBadge(RX+5,yb+4+mj,mv,4);
  const prev=mv?MEDALS[mv-1].at:0,next=mv<MEDALS.length?MEDALS[mv]:null,pk=next?clamp((kills-prev)/(next.at-prev),0,1):1;
  ctx.fillStyle='#120c18';ctx.fillRect(RX,yb+10,11,3);ctx.fillStyle='#2a1f30';ctx.fillRect(RX+1,yb+11,9,1);
  ctx.fillStyle=next?next.col:MEDALS[MEDALS.length-1].col;ctx.fillRect(RX+1,yb+11,Math.round(9*pk),1);
  const kb=kills+' BAJAS';ctx.globalAlpha=0.8;pxTxt(kb,RX+13,yb+2,'#e8dcc8','left');ctx.globalAlpha=1;
  HUD_reloj={x:(RX+13+pxW(kb)+5)*HS,y:(yb+2)*HS,k:HS};
  ctx.restore();
  // --- derecha: puntaje en dígitos 5×7 (en la Chatarra, su panel va debajo: drawMechHUD) ---
  ctx.save();ctx.translate(W,0);ctx.scale(HS,HS);ctx.translate(-W,0);
  const sc=String(RC_ver('sc',score)).padStart(7,'0');hudNum(sc,W-5,4+RC_salto('sc'),RC_luz('sc')?'#fff6c8':'#f4eee0');
  RC_ancla('sc',W-(5+21)*HS,8*HS);
  // el avión, debajo del puntaje (RC_ancla dentro de drawAirChip: sin escalar, la diferencia con TEXTO GRANDE es chica)
  if(!P.ride)drawAirChip(W-5,15);
  ctx.restore();
  // lo del centro (avance o barra del jefe) se corre para no quedar debajo del panel ni del puntaje
  HUD_centro={x0:Math.ceil((PX+PW)*HS)+6,x1:Math.floor(W-(5+42)*HS)-6,yb:Math.ceil((yb+13)*HS)+2};
  if(P.ride){ctx.save();ctx.translate(0,Math.round(14*HS));HUD_enPixel(()=>{drawMechHUD(P.ride);drawAirChip(W-6,46);});ctx.restore();}
  // --- arriba al centro: barra del jefe o progreso de la misión ---
  if(bossShown()){
    // cada golpe que le saca vida se ve: la barra tiembla y baja dejando un tramo claro que se vacía de a poco
    const b=bossRef,hp=Math.max(0,b.hp);if(b._barLag===undefined||b._barLag<hp)b._barLag=hp;
    if(b._barHp!==undefined&&hp<b._barHp-0.01)b._barSac=8;b._barHp=hp;
    const w=Math.min(120,HUD_centro.x1-HUD_centro.x0),bx=clamp(100,HUD_centro.x0,HUD_centro.x1-w),sac=b._barSac>0?((b._barSac--)%2?1:-1)*(MOV_quieto()?0:1):0,x=bx+sac;HUD_centro.cx=bx+w/2;
    ctx.fillStyle='#120c18';ctx.fillRect(x-1,5,w+2,6);ctx.fillStyle='#4a2730';ctx.fillRect(x,6,w,4);
    ctx.fillStyle='#fff6c8';ctx.fillRect(x,6,w*b._barLag/b.max,4);if(b._barLag>hp)b._barLag=Math.max(hp,b._barLag-b.max*0.004);
    ctx.fillStyle=b.hp<b.max*0.5&&b.state==='fight'?'#ff5a3c':'#f3a35c';ctx.fillRect(x,6,w*hp/b.max,4);
    pxTxt(bossName(),bx+w/2,12,'#f4eee0','center',HUD_escala()>1?2:1);
  }else{
    // avance fino (64 × 2) con el nombre en letra pixel debajo
    const w=64,cx=clamp(160,HUD_centro.x0+w/2,HUD_centro.x1-w/2),x=Math.round(cx-w/2),pr=clamp(leadP().x/(LEVEL_END-60),0,1);
    ctx.fillStyle='rgba(12,9,18,0.7)';ctx.fillRect(x,7,w,2);ctx.fillStyle='#ffd58a';ctx.fillRect(x,7,Math.round(w*pr),2);
    ctx.fillStyle='#f4eee0';ctx.fillRect(x+Math.round(w*pr)-1,6,2,4);ctx.fillStyle='#ff3b30';ctx.fillRect(x+w-1,5,2,6);
    pxTxt((vuelta>1?'V'+vuelta+' · M':'MISIÓN ')+(levelIdx+1),cx,12,vuelta>1?'#ffe08a':'#c9bfd0','center',HUD_escala()>1?2:1);
  }
  // con el cartel de jefe a la vista (dibujito.js) los avisos esperan en fila (momentos.js)
  // los avisos van arriba, chicos y en letra pixel; los de ataque, con la línea roja (y esperan en fila: momentos.js)
  if(banner&&banner.t>0&&state!=='pause'){ctx.globalAlpha=Math.min(1,banner.t/20,(banner.max-banner.t+1)/8);
    avTira([[banner.s,banner.prio>=4?'#ffb0a0':'#ffe08a']],false,AV_ARRIBA,banner.prio>=4?'#ff6b5b':'#f3c969');ctx.globalAlpha=1;}
  if(goT>0&&(T>>4)%2)pxTxt('¡ADELANTE! ▶',W-8,78,'#fff','right',typeof ACC!=='undefined'&&ACC.txt==='grande'?2:1);
  // medallas y premios: arriba, de a uno (esperan a los avisos de ataque y demás: cartelOcupado en juego.js)
  if(toasts.length&&!cartelOcupado()){const t=toasts[0],a=Math.min(1,t.t/15,(170-t.t+1)/10);ctx.globalAlpha=a;
    const r=avTira([[t.title,t.col],[t.sub||'','#ddd']],false,AV_ARRIBA,t.col,12,true),cy=r.y+r.h/2;
    if(t.lvl)drawBadge(r.x+7,cy+1,t.lvl,5);
    else if(t.ico==='air')hudPix(HUD_ICONS.plane,r.x+2,cy-3);
    else{ctx.fillStyle=t.col;ctx.fillRect(r.x+4,cy-2,5,5);}
    ctx.globalAlpha=1;}
  const flags=[muted?tx(TX.hud.sinSonido,{tecla:btn('mute')||'M'}):null,!muted&&!mus.on?tx(TX.hud.sinMusica,{tecla:btn('music')||'N'}):null].filter(Boolean);
  if(flags.length)pxTxt(flags[0],6,HC-9,'#ccc','left');
  if(twoP())withP(players[1],drawHUD2);
  for(const f of ON_HUD)f();
}
// HUD compacto del jugador 2: abajo a la derecha, sobre el piso (los avisos salen abajo al centro).
// Fila 1: número, cabecita, corazones y escudo. Fila 2: arma y munición, granadas (o el Grillo).
function drawHUD2(){
  // mismo estilo que el panel del jugador 1 (HUD Hondo), con la línea de arriba en su color, abajo a la derecha
  const p=P,col=P_COL[1],HS=HUD_escala(),PW=82,PH=24;ctx.save();ctx.translate(W,HC);ctx.scale(HS,HS);ctx.translate(-W,-HC);
  const x0=W-PW-3,y0=HC-PH-3,AL=(k,x,y)=>RC_ancla(k,W-(W-x)*HS,HC-(HC-y)*HS);
  ctx.globalAlpha=0.62;ctx.fillStyle='#0c0912';ctx.fillRect(x0,y0,PW,PH);ctx.globalAlpha=1;ctx.fillStyle=col;ctx.fillRect(x0,y0,PW,1);
  ctx.fillStyle=col;ctx.fillRect(x0+3,y0+4,7,8);pfTxt('2',x0+7,y0+5,'#120c18','center');
  if(p.dead)ctx.globalAlpha=0.4;hudHead(x0+12,y0+4);ctx.globalAlpha=1;
  const hk='hp'+p.slot,hv=RC_ver(hk,p.hp),hj=RC_salto(hk),sk='sh'+p.slot,sv=RC_ver(sk,p.shield),sj=RC_salto(sk);
  let hx=x0+29;for(let i=0;i<maxHp;i++){hudCorazon(hx,y0+5+(i===hv-1?hj:0),hv>i&&!p.dead);hx+=9;}
  AL(hk,x0+29+9*clamp(hv,0,maxHp-1)+3,y0+8);
  hx+=1;AL(sk,hx+sv*5,y0+8);for(let i=0;i<sv&&!p.dead;i++){hudPix(HUD_ICONS.shield,hx,y0+5+(i===sv-1?sj:0));hx+=5;}
  const y2=y0+15;
  if(p.dead){pxTxt(p.out?'SIN VIDAS':'YA VUELVE',x0+4,y2,p.out?'#ff8a7a':'#ddd','left');ctx.restore();return;}
  if(p.ride){const m=p.ride,ar=RC_ver('ar'+p.slot,m.armor),gj=RC_salto('gri'+p.slot);
    pxTxt(mechNombre(m).slice(0,8),x0+4,y2+gj,RC_luz('gri'+p.slot)?'#fff6c8':'#f3c969','left');AL('gri'+p.slot,x0+13,y2+3);
    ctx.fillStyle='#120c18';ctx.fillRect(x0+38,y2,40,5);ctx.fillStyle='#4a2730';ctx.fillRect(x0+39,y2+1,38,3);
    ctx.fillStyle=m.armor<=m.max*0.3?'#ff5a3c':'#e8c040';ctx.fillRect(x0+39,y2+1,Math.round(38*Math.max(0,ar)/m.max),3);ctx.restore();return;}
  const w=p.weapon,map=HUD_ICONS[w],ak='am'+p.slot+w,ammo=w==='pistol'?'∞':String(RC_ver(ak,p.weapons[w])),low=w!=='pistol'&&p.weapons[w]<WEAPONS[w].ammo*0.2;
  const aj=RC_salto('am'+p.slot);
  hudPix(map,x0+4,y2+3-hudIH(map)/2+aj,1,w==='flame'?{b:'#ff9a3c'}:HUD_PAL);AL('am'+p.slot,x0+4+hudIW(map)/2,y2+3);
  pxTxt(ammo,x0+7+hudIW(map),y2+RC_salto(ak),low?'#ff9a8a':RC_luz(ak)?'#fff6c8':'#ffe08a','left');
  const gk='gr'+p.slot,gv=RC_ver(gk,p.bombs),gs=String(gv),gw=pxW(gs),gj=RC_salto(gk);
  pxTxt(gs,x0+PW-4,y2+gj,gv?(RC_luz(gk)?'#fff6c8':'#e8e2d4'):'#ff6b5b','right');
  if(!gv)ctx.globalAlpha=0.45;hudPix(HUD_ICONS.grenade,x0+PW-4-gw-8,y2+gj);ctx.globalAlpha=1;AL(gk,x0+PW-4-gw-5,y2+3);
  ctx.restore();
}
// avión: ícono + cómo se pide (tecla 6 en el teclado; con joystick o en la pantalla, un iconito de rueda: se elige ahí)
// + cuántos gratis (o lo que cuesta). Devuelve la x donde empieza, para poner algo a la izquierda.
function hudRuedita(x,y,col){ctx.strokeStyle=col;ctx.lineWidth=0.8;ctx.beginPath();ctx.arc(x+3.5,y+3.5,2.8,0,7);ctx.stroke();
  ctx.fillStyle=col;for(let i=0;i<6;i++){const a=-Math.PI/2+i*Math.PI/3;ctx.fillRect(x+3.5+Math.cos(a)*2.8-0.5,y+3.5+Math.sin(a)*2.8-0.5,1,1);}ctx.fillRect(x+3,y+3,1,1);}
function drawAirChip(right,y){
  if(typeof simpleDe==='function'&&simpleDe(P.slot))return right; // controles simples: sin avión
  const fv=RC_ver('fl',flares),fj=RC_salto('fl'),free=fv>0,s=free?'×'+fv:'−1♥',sw=pxW(s),ready=airReady(),k=airKey();
  pxTxt(s,right,y+2+fj,free?(RC_luz('fl')?'#fff6c8':'#9ad0ff'):'#aaa','right');
  const kx=right-sw-2-(k?keycapW(k):7);if(k)keycap(k,kx,y,free?'#9ad0ff':'#aaa');else hudRuedita(kx,y,free?'#9ad0ff':'#aaa');
  const px=kx-14;ctx.globalAlpha=air?((T>>3)%2?1:0.4):ready?1:0.45;hudPix(HUD_ICONS.plane,px,y+fj);ctx.globalAlpha=1;RC_ancla('fl',px+6,y+3);
  return px;
}
function dim(a){ctx.fillStyle=`rgba(12,8,18,${a})`;cubrir();}
// teclado (de reserva si no está el control dibujado de Arte): los dos esquemas, WASD primero
const CONTROLS_L_KB=[['A D · ← →','mover'],['W · ↑','apuntar arriba sin frenar'],['S · ↓','agacharse · aire: abajo'],['J · X','disparar'],['ESPACIO K · Z','saltar · Chatarra: volar'],['L · C','granada / cañón'],['S + ESPACIO','bajar de la Chatarra']];
const CONTROLS_R_KB=[['Q E · TAB','cambiar arma'],['mantenelas','rueda de armas y avión'],['1 … 6','arma directa · 6 avión'],['ESC/⌫ · P','pausa · volver'],['Q','salir (en pausa)'],['M · N','sonido · música'],['F','pantalla completa']];
// la misma tabla con los botones del joystick que se tocó último (btn en input.js)
function ctlRows(){const b=a=>btn(a);
  return[[['← →','mover'],['↑','apuntar arriba sin frenar'],['↓','agacharse · aire: abajo'],[b('shoot')+' '+b('r1')+' '+b('r2'),'disparar'],[b('jump'),'saltar · Chatarra: volar'],[b('bomb')+' '+b('l2'),'granada / cañón'],['↓ + '+b('jump'),'bajar de la Chatarra']],
    [[b('swap')+' tocar','cambiar arma'],[b('swap')+' mantener','rueda de armas y avión'],[b('air'),'igual que '+b('swap')],[b('opt')+' · '+b('back'),'pausa · volver'],[b('quit')+' dos veces','salir (en pausa)'],['teclado M · N','sonido · música'],['teclado F','pantalla completa']]];}
const CONTROLS_L_TOUCH=[['palanca','mover · apuntar'],['palanca ↑','apuntar arriba sin frenar'],['palanca ↓','agacharse · aire: abajo'],['□','disparar (mantener)'],['✕','saltar · Chatarra: volar'],['○','granada / cañón']];
const CONTROLS_R_TOUCH=[['△ tocar','cambiar arma'],['△ mantener','rueda de armas y avión'],['↓ + ✕','bajar de la Chatarra'],['II','pausa']];
// franja libre de los controles en pantalla (publicar/web/tactil.js): {x0,x1,y0} en coordenadas del juego.
// Debajo de y0 la palanca ocupa x<x0 y el rombo x>x1; arriba de y0 está todo libre. null si no hay controles.
const tactilLibre=()=>onTouch()&&window.OXIDO_TACTIL_LIBRE||null;
// CONTROLES SIMPLES (simple.js): 1 jugador con flechas, Z y X; y de a 2 con un teclado, una columna cada uno
const CONTROLS_L_S1=[['← →','mover'],['↑','saltar · mantener: volar'],['↓','agacharse · ×2: bajar'],['Z','disparar (apunta solo)'],['X','granada']];
const CONTROLS_R_S1=[['ESC/⌫ · P','pausa · volver'],['Q','salir (en pausa)'],['M · N','sonido · música'],['F','pantalla completa']];
function drawSimples2(y,nota){
  const J=[[P_COL[0],'JUGADOR 1',[['A D','mover'],['W','saltar'],['S','agacharse · ×2 bajar'],['F','disparar'],['G','granada']]],
    [P_COL[1],'JUGADOR 2',[['← →','mover'],['↑','saltar'],['↓','agacharse · ×2 bajar'],[KB_NOMBRE.Period,'disparar'],[KB_NOMBRE.Comma,'granada']]]];
  ctx.fillStyle='rgba(18,12,24,0.8)';ctx.fillRect(30,y,260,58);
  J.forEach(([col,t,rows],i)=>{const x=34+i*130;ctx.fillStyle=col;ctx.fillRect(x,y+3,122,1);txt(t,x+61,y+5,6,col,'center',false);
    rows.forEach(([k,v],j)=>{txt(k,x+28,y+15+j*8,6,col,'right',false);txt(v,x+33,y+15.5+j*8,5,'#ddd','left',false);});});
  txt('Apuntan solos · ESC/⌫ o P: pausa',W/2,y+60,5,'#aaa','center',false);
  if(nota)txt('Algunos teclados no registran muchas teclas a la vez: si una no anda, soltá las otras.',W/2,y+68,4,'#8a7f92','center',false);
}
function drawControls(y){
  if(!onTouch()&&kb2On()){drawSimples2(y);return;}
  const s1=!onTouch()&&!onPad()&&controlesSimples;
  const [colL,colR]=onTouch()?[CONTROLS_L_TOUCH,CONTROLS_R_TOUCH]:onPad()?ctlRows():s1?[CONTROLS_L_S1,CONTROLS_R_S1]:[CONTROLS_L_KB,CONTROLS_R_KB];
  const lb=tactilLibre();
  if(!lb||y+60<=lb.y0){
    ctx.fillStyle='rgba(18,12,24,0.75)';ctx.fillRect(30,y,260,60);
    colL.forEach(([k,v],i)=>{txt(k,74,y+4+i*7.8,5,'#ffe08a','right',false);txt(v,79,y+4+i*7.8,5,'#ddd','left',false);});
    colR.forEach(([k,v],i)=>{txt(k,196,y+4+i*7.8,5,'#ffe08a','right',false);txt(v,201,y+4+i*7.8,5,'#ddd','left',false);});
    return;}
  // con controles en pantalla que tapan los costados: las dos columnas se juntan (y achican si hace falta) entre x0+4 y x1-4
  const x0=Math.max(30,lb.x0+4),x1=Math.min(290,lb.x1-4);
  const mk=c=>Math.max(...c.map(r=>hudTW(r[0],5))),mv=c=>Math.max(...c.map(r=>hudTW(r[1],5)));
  const wL=mk(colL)+4+mv(colL),wR=mk(colR)+4+mv(colR),gap=10,f=Math.min(1,(x1-x0-8)/(wL+gap+wR)),sz=5*f,dy=7.8*Math.max(0.85,f);
  const rows=Math.max(colL.length,colR.length),h=rows*dy+6;
  ctx.fillStyle='rgba(18,12,24,0.75)';ctx.fillRect(x0,y,x1-x0,h);
  const pad=(x1-x0-(wL+gap+wR)*f)/2,kL=x0+pad+mk(colL)*f,kR=x0+pad+(wL+gap)*f+mk(colR)*f;
  colL.forEach(([k,v],i)=>{txt(k,kL,y+4+i*dy,sz,'#ffe08a','right',false);txt(v,kL+4*f,y+4+i*dy,sz,'#ddd','left',false);});
  colR.forEach(([k,v],i)=>{txt(k,kR,y+4+i*dy,sz,'#ffe08a','right',false);txt(v,kR+4*f,y+4+i*dy,sz,'#ddd','left',false);});
}
function drawTitle(){
  dim(0.45);
  const g=ctx.createLinearGradient(0,24,0,62);g.addColorStop(0,'#ffe08a');g.addColorStop(1,'#e0582c');
  ctx.font='bold 38px ui-monospace,Menlo,Consolas,monospace';ctx.textAlign='center';ctx.textBaseline='top';
  ctx.lineJoin='round';ctx.lineWidth=5;ctx.strokeStyle='#120c18';ctx.strokeText(TX.menu.titulo,W/2,22);ctx.fillStyle=g;ctx.fillText(TX.menu.titulo,W/2,22);
  // menú vertical corto: ↑ ↓ elegir · ENTER o ✕ entrar
  const ops=tituloOps(),st=11,y0=78;
  ops.forEach((o,i)=>{const y=y0+i*st,on=i===tituloSel;zona(W/2-hudTW(o,8)/2-18,y-1.5,hudTW(o,8)+36,st-0.5,{sobre:()=>{if(tituloSel!==i){tituloSel=i;SFX.swap();}},clic:RA_enter});
    // resaltado: la flecha va a la izquierda del texto y el recuadro abraza a los dos con el mismo margen
    if(on){const tw=hudTW(o,8),ax=W/2-tw/2-11,x0=ax-6,x1=W/2+tw/2+6;ctx.fillStyle='rgba(243,201,105,0.18)';ctx.fillRect(x0,y-1.5,x1-x0,st-0.5);
      txt('▶',ax+((T>>4)%2),y,8,'#ffe08a','left',false);}
    txt(o,W/2,y,8,on?'#ffe08a':'#aaa','center');});
  // una sola línea chica abajo, con los botones del control que se usó último (en táctil, entre la palanca y el rombo)
  const pie=tx(onTouch()?TX.menu.pieTactil:TX.menu.pie,{ok:btn('ok')});
  const lb=tactilLibre(),pw=lb&&H-12>=lb.y0?Math.min(290,lb.x1-4)-Math.max(30,lb.x0+4):999;
  txt(pie,lb&&pw<999?(Math.max(30,lb.x0+4)+Math.min(290,lb.x1-4))/2:W/2,H-12,Math.min(5,5*pw/hudTW(pie,5)),'#aaa','center');
  const rec=tituloRecord();if(rec)txt(tx(TX.menu.record,{n:String(rec).padStart(7,'0')}),W-6,4,5,'#f3c969','right');
}
// OPCIONES: tamaño, música, sonido y controles (partida.js)
function drawOpciones(){
  dim(0.6);
  txt(opcTitulo(),W/2,16,13,'#ffe08a','center');
  const f=opcFilas(),n=f.length,st=n>8?12:n>6?13:14,y0=44,x0=58,w=204,xv=200,wv=110;
  f.forEach(([nm,v],i)=>{const y=y0+i*st,on=i===opcSel;zona(x0,y-2,w,12,{sobre:()=>{if(opcSel!==i){opcSel=i;SFX.swap();}},clic:RA_enter});
    ctx.fillStyle=on?'rgba(243,201,105,0.16)':'rgba(18,12,24,0.6)';ctx.fillRect(x0,y-2,w,12);
    if(on){ctx.strokeStyle='#f3c969';ctx.lineWidth=1;ctx.strokeRect(x0+0.5,y-1.5,w-1,11);}
    if(v===null){txt(nm,W/2,y,7,on?'#ffe08a':'#aaa','center');return;}
    let sn=6;while(sn>4&&hudTW(nm,sn)>xv-wv/2-x0-10)sn--;
    txt(nm,x0+7,y+0.5,sn,on?'#ffe08a':'#aaa','left');
    let sv=7;while(sv>4&&hudTW(v,sv)>wv-16)sv--;
    txt(v,xv+wv/2-28,y,sv,v==='▸'?'#ffe08a':'#fff','center');
    if(on&&v!=='▸'){const b=(T>>4)%2?1:0,cx=xv+wv/2-28;txt('◀',cx-hudTW(v,sv)/2-4-b,y,sv,'#ffe08a','right',false);txt('▶',cx+hudTW(v,sv)/2+4+b,y,sv,'#ffe08a','left',false);}});
  // qué hace la opción elegida, en una línea
  const r=f[opcSel];if(r&&r[3])txt(r[3],W/2,y0+n*st+3,5,'#ddd','center',false);
  // crédito del clima real (licencia CC BY 4.0 de Open-Meteo, clima.js)
  if(opcPag==='main'&&typeof CLI_credito==='function'){const cr=CLI_credito();if(cr)txt(cr,W/2,H-19,4,'#8a7f92','center',false);}
  const pie=tx(TX.opciones.pie,{ok:btn('ok'),volver:btn('back')});
  const lb=tactilLibre(),pw=lb&&H-12>=lb.y0?Math.min(290,lb.x1-4)-Math.max(30,lb.x0+4):999;
  if(lb&&pw<999){const ls=wrapTxt(pie,5,pw).slice(0,3),cx=(Math.max(30,lb.x0+4)+Math.min(290,lb.x1-4))/2,lh=TXT_aj(5)+1; // en táctil: en renglones, sin achicar la letra
    ls.forEach((l,i)=>txt(l,cx,H-4-(ls.length-i)*lh,5,'#aaa','center'));}
  else txt(pie,W/2,H-12,Math.min(5,5*Math.min(pw,300)/hudTW(pie,5)),'#aaa','center');
}
// ================== elegir personaje, misión y dificultad ==================
const DIFF_COL=['#7dff9a','#ffe08a','#ff6b5b'];
let selRow=0; // 0 = personaje · 3 = color · 1 = misión · 2 = dificultad (en pantalla van en ese orden)
const selRows=()=>[0,3,1,2];
const selLocked=i=>i>unlocked;
// candadito al lado del nombre de una misión bloqueada
function drawLock(x,y,col){ctx.fillStyle=col;ctx.fillRect(x,y+3,6,5);ctx.fillRect(x+1,y,1,3);ctx.fillRect(x+4,y,1,3);ctx.fillRect(x+2,y,2,1);ctx.fillStyle='#120c18';ctx.fillRect(x+2.5,y+4.5,1,2);}
let selNo=0; // temblor al querer entrar a una misión bloqueada
// parte un texto en renglones que entren en un ancho
function wrapTxt(s,size,maxW){const out=[];let line='';
  for(const w of s.split(' ')){const t=line?line+' '+w:w;if(line&&hudTW(t,size)>maxW){out.push(line);line=w;}else line=t;}
  if(line)out.push(line);return out;}
function selArrows(cx,y,half,size,canL,canR,on){
  if(!on)return;const b=(T>>4)%2?1:0;
  txt('◀',cx-half-b,y,size,canL?'#ffe08a':'#5a4a60','right',false);txt('▶',cx+half+b,y,size,canR?'#ffe08a':'#5a4a60','left',false);}
function selRowBox(y,h,on){
  ctx.fillStyle=on?'rgba(243,201,105,0.16)':'rgba(18,12,24,0.6)';ctx.fillRect(40,y,240,h);
  if(on){ctx.strokeStyle='#f3c969';ctx.lineWidth=1;ctx.strokeRect(40.5,y+0.5,239,h-1);}}
// tarjetas de personaje: 3 anchas o, con TUERCA, 4 más angostas
function selGeo(n){const cw=n>3?74:92,gap=n>3?4:8;return{cw,gap,x0:(W-(cw*n+gap*(n-1)))/2};}
function drawSelect(){
  dim(0.55);
  const two=p2Pad>=0;
  txt(two?'ELIJAN SUS PERSONAJES':'ELEGÍ TU PERSONAJE',W/2,4,9,'#ffe08a','center');
  const nC=CHARS.length,{cw,gap,x0}=selGeo(nC),y=17,ch=96,rowOn=selRow===0;
  CHARS.forEach((c,i)=>{
    const x=x0+i*(cw+gap),sel=i===charIdx;
    zona(x,y,cw,ch,{sobre:()=>{selRow=0;},clic:()=>{if(charIdx===i){pressed.start=true;return;}charIdx=i;if(p2Pad>=0)colFix(charIdx,p2Ci);SFX.swap();}}); // mouse: elige; otro clic, juega
    ctx.fillStyle=sel?'rgba(243,201,105,0.18)':'rgba(18,12,24,0.75)';ctx.fillRect(x,y,cw,ch);
    ctx.strokeStyle=sel?(rowOn?'#f3c969':'#a08850'):'#3a2a40';ctx.lineWidth=sel?1.5:1;ctx.strokeRect(x+0.5,y+0.5,cw-1,ch-1);
    const k=sel&&((T>>3)&1)?'run1':sel?'run2':'idle';
    if(!(typeof ES_tarjeta==='function'&&ES_tarjeta(i,x+cw/2-21,y+2))){const im=charSet(i,p1Col[i])[k][0];ctx.drawImage(im,q(x+cw/2-21),q(y+2+(18-im.height)*3),42,im.height*3);} // espera.js: animación de espera
    const st=[['VIDA',c.hp/4],['VELOC.',c.speed/1.75],['SALTO',c.jump/6.6]];
    if(typeof ACC!=='undefined'&&ACC.txt==='grande'){
      // TEXTO GRANDE: adentro de la tarjeta, letra pixel de tamaño fijo (con la letra lisa agrandada se pisaban VIDA, VELOC. y
      // SALTO y la descripción se salía de la tarjeta en el iPhone SE: Pruebas). El nombre va ×2.
      pxTxt(c.name,x+cw/2,y+49,sel?'#ffe08a':'#fff','center',pxW(c.name,2)<=cw-6?2:1);
      pxTxt(c.desc,x+cw/2,y+62,'#ddd','center');
      st.forEach(([n,v],j)=>{const yy=y+69+j*5;pfTxt(n,x+5,yy-1,'#aaa','left');ctx.fillStyle='#2a1f30';ctx.fillRect(x+30,yy+1,cw-36,3);ctx.fillStyle=sel?'#f3c969':'#998';ctx.fillRect(x+30,yy+1,Math.round((cw-36)*v),3);});
      const pk=[];let cur='';for(const pal of String(c.perk).split(' ')){const pr=cur?cur+' '+pal:pal;if(cur&&pfW(pr)>cw-6){pk.push(cur);cur=pal;}else cur=pr;}if(cur)pk.push(cur);
      pk.slice(0,2).forEach((l,j)=>pfTxt(l,x+cw/2,y+83+j*6,sel?'#ffe08a':'#998','center'));
    }else{
    txt(c.name,x+cw/2,y+55,8,sel?'#ffe08a':'#fff','center');
    txt(c.desc,x+cw/2,y+64,5,'#ddd','center',false);
    st.forEach(([n,v],j)=>{const yy=y+71+j*5;txt(n,x+6,yy,4,'#aaa','left',false);ctx.fillStyle='#2a1f30';ctx.fillRect(x+34,yy+1,cw-42,3);ctx.fillStyle=sel?'#f3c969':'#998';ctx.fillRect(x+34,yy+1,(cw-42)*v,3);});
    wrapTxt(c.perk,4,cw-8).slice(0,2).forEach((l,j)=>txt(l,x+cw/2,y+86+j*5,4,sel?'#ffe08a':'#998','center',false));}
    // 2 jugadores: el elegido por el jugador 2 tiene marco celeste; cada tarjeta elegida lleva su número
    if(two&&i===p2Ci){ctx.strokeStyle=P_COL[1];ctx.lineWidth=1.5;ctx.strokeRect(x+2,y+2,cw-4,ch-4);
      if(i===charIdx){const im=charSet(i,p2Col[i]).idle[0];ctx.drawImage(im,q(x+cw-20),q(y+30+(18-im.height)*4/3),14,im.height*4/3);}}
    if(two){if(sel)selTag(x+3,y+3,1);if(i===p2Ci)selTag(x+cw-11,y+3,2);}
  });
  // flechas enteras contra los bordes de la pantalla (con 4 tarjetas no queda lugar al costado: se cortaban, Pruebas)
  if(rowOn){const b=(T>>4)%2?1:0;pxTxt('◀',Math.max(1,x0-8)+b,y+ch/2-5,'#ffe08a','left',2);pxTxt('▶',Math.min(W-1,x0+cw*nC+gap*(nC-1)+8)-b,y+ch/2-5,'#ffe08a','right',2);}
  // color del personaje del jugador 1 (el del jugador 2, si repite personaje, va marcado con una rayita celeste)
  let ry=y+ch+3;
  {const on=selRow===3,cx=W/2+16,hw=(N_COL*10-4)/2,xc=cx-hw;selRowBox(ry,9,on);
    txt('COLOR',46,ry+2,5,on?'#ffe08a':'#aaa','left',false);
    zona(40,ry,240,9,{sobre:()=>{selRow=3;}});
    for(let k=0;k<N_COL;k++){const x=xc+k*10;zona(x-1.5,ry+0.5,9,8.5,{clic:()=>{if(!(p2Pad>=0&&p2Ci===charIdx&&p2Col[p2Ci]===k)){p1Col[charIdx]=k;colGuardar();SFX.swap();}}});ctx.fillStyle='#120c18';ctx.fillRect(x-1,ry+1.5,8,6.5);ctx.fillStyle=colMuestra(charIdx,k);ctx.fillRect(x,ry+2,6,5.5);
      if(k===p1Col[charIdx]){ctx.strokeStyle=on?'#fff':'#c8b8a0';ctx.lineWidth=1;ctx.strokeRect(x-1.5,ry+1,9,7.5);}
      if(two&&p2Ci===charIdx&&p2Col[p2Ci]===k){ctx.fillStyle=P_COL[1];ctx.fillRect(x,ry+8,6,1);}}
    selArrows(cx,ry+1.5,hw+4,6,true,true,on);
    ry+=11;}
  // misión
  {const on=selRow===1,lk=selLocked(selLevel),sh=selNo>0?((selNo>>1)%2?2:-2):0;selRowBox(ry,10,on);
    txt('MISIÓN',46,ry+2.5,5,on?'#ffe08a':'#aaa','left',false);
    const s=LEVELS[selLevel].short,cx=W/2+16+sh,hw=hudTW(s,6)/2;
    txt(s,cx,ry+2,6,lk?'#6a5f72':'#fff','center');
    if(lk)drawLock(cx+hw+3,ry+1,selNo>0?'#ff6b5b':'#8a7f92');
    selArrows(W/2+16,ry+2,hw+(lk?12:4),6,selLevel>0,selLevel<LEVELS.length-1,on);
    {const a=hw+(lk?12:4);zona(40,ry,240,10,{sobre:()=>{selRow=1;}});zona(W/2+16-a-12,ry,12,10,{clic:()=>{selRow=1;pressed.left=true;}});zona(W/2+16+a,ry,12,10,{clic:()=>{selRow=1;pressed.right=true;}});}
    {const lb=tactilLibre(); // en táctil, si cae debajo del rombo (□) no va: es un dato de más y no entra al lado del nombre (Pruebas)
    const mu=(typeof mundoDe==='function'?MU_NOMBRE[mundoDe(selLevel)]+' · ':'')+(selLevel+1)+'/'+LEVELS.length,finNombre=W/2+16+hudTW(LEVELS[selLevel].short,6)/2+(selLocked(selLevel)?12:4)+12;
    if(!(lb&&ry+8>lb.y0&&W-46>lb.x1)&&W-46-txtW(mu,4)>finNombre)txt(mu,W-46,ry+2.5,4,'#8a7f92','right',false);} // tampoco si queda pegado al nombre (TEXTO GRANDE, 844×390)
    if(typeof NM_dibujarSelect==='function'&&!lk)NM_dibujarSelect(selLevel,ry); // nota y mejor tiempo de la misión (nota.js)
    ry+=12;
  }
  // dificultad
  {const on=selRow===2,d=DIFF();selRowBox(ry,16,on);
    txt('DIFICULTAD',46,ry+2.5,5,on?'#ffe08a':'#aaa','left',false);
    txt(d.name,W/2+16,ry+2,6,DIFF_COL[difficulty],'center');
    selArrows(W/2+16,ry+2,hudTW(d.name,6)/2+4,6,difficulty>0,difficulty<DIFFS.length-1,on);
    {const a=hudTW(d.name,6)/2+4;zona(40,ry,240,16,{sobre:()=>{selRow=2;}});zona(W/2+16-a-12,ry,12,10,{clic:()=>{selRow=2;pressed.left=true;}});zona(W/2+16+a,ry,12,10,{clic:()=>{selRow=2;pressed.right=true;}});}
    txt(d.desc,W/2+16,ry+9.5,4,'#ddd','center',false);
    ry+=18;}
  // jugador 1: botones de su último control (con su joystick, ✕ u OPTIONS juegan; ✕ en otro joystick suma al jugador 2)
  if(selLocked(selLevel))txt('BLOQUEADA · GANÁ LA MISIÓN '+selLevel+' PARA JUGARLA',W/2,ry+1,5,selNo>0?'#ff6b5b':'#c8b8a0','center');
  // en táctil no hay W S A D: se nombra la palanca, y se juega tocando de nuevo la tarjeta elegida (Pruebas)
  else if(onTouch()){const h=TX.elegir.pieTactil,lb=tactilLibre(),abajo=lb&&ry+8>lb.y0,cx=abajo?(lb.x0+lb.x1)/2:W/2,mx=abajo?lb.x1-lb.x0-6:W-12;
    let sz=5;while(sz>3&&txtW(h,sz)>mx)sz--;if(txtW(h,sz)<=mx)txt(h,cx,ry+1,sz,'#fff','center');else pxTxt(h,cx,ry+1,'#fff','center');} // entre la palanca y el rombo (con TEXTO GRANDE, JUGAR quedaba debajo del ✕)
  else txt(btn('up',0)+' '+btn('down',0)+' ELEGIR FILA · '+btn('left',0)+' '+btn('right',0)+' CAMBIAR · '+btn(onPad(0)?'jump':'start',0)+': JUGAR',W/2,ry+1,5,'#fff','center');
  if(!onTouch())txt(btn('back',0)+': volver',W/2,ry+9,4,'#aaa','center',false);
  zona(40,ry,240,8,{clic:RA_enter});zona(W/2-30,ry+8.5,60,6,{clic:RA_volver}); // mouse: jugar · volver
  // jugador 2: se suma con saltar (✕, A o B) en un joystick libre; sus botones salen de su joystick
  if(two)txt('JUGADOR 2: ← → ELEGIR · ↑ ↓ COLOR · '+btn('bomb',1)+' SALIR',W/2,ry+16,5,P_COL[1],'center');
  else if(padFree()&&(T>>5)%2===0)txt('JUGADOR 2: APRETÁ '+btn('jump','free')+' PARA SUMARTE',W/2,ry+16,5,P_COL[1],'center');
  else if(!padFree()&&!onTouch()&&(T>>5)%2===0)txt('JUGADOR 2 CON EL MISMO TECLADO: APRETÁ '+KB_NOMBRE.Period,W/2,ry+16,5,P_COL[1],'center');
  // recién entró el jugador 2 por teclado: las teclas de los dos (3 s o hasta que alguien apriete)
  if(kb2On()&&kb2Tarjeta>0){ctx.fillStyle='#120c18';cubrir();txt('DE A 2 CON UN TECLADO',W/2,34,10,'#ffe08a','center');txt('controles simples',W/2,47,5,'#aaa','center',false);drawSimples2(58,true);
    ctx.fillStyle='#f3c969';ctx.fillRect(30,136,260*kb2Tarjeta/180,1);}
}
// número de jugador sobre la tarjeta elegida
function selTag(x,y,n){ctx.fillStyle='#120c18';ctx.fillRect(x-0.5,y-0.5,9,9);ctx.fillStyle=P_COL[n-1];ctx.fillRect(x,y,8,8);txt(String(n),x+4,y+1.2,6,'#120c18','center',false);}
// entrada de la pantalla de elegir personaje (la llama update() en juego.js)
function updSelect(){
  if(selT===1){selRow=0;p2Join=-1;}
  // jugador 2: entra con ✕ en un joystick libre, elige con ← →, sale con ○ o Create
  if(p2Join>=0){if(p2Pad<0){p2Pad=p2Join;p2Ci=charIdx===2?0:2;SFX.pick();}p2Join=-1;}
  else if(p2Pad>=0){
    if(kb2Tarjeta>0){kb2Tarjeta--;if(kb2Tarjeta<170&&(Object.values(pressed).some(Boolean)||Object.values(pressed2).some(Boolean))){kb2Tarjeta=0;clearPressed();}return;}
    const d2=pressed2.left?-1:pressed2.right?1:0;
    if(d2){p2Ci=(p2Ci+CHARS.length+d2)%CHARS.length;colFix(charIdx,p2Ci);SFX.swap();}
    // ↑ ↓: su color (salteando el del jugador 1 si repiten personaje)
    const c2=pressed2.up?-1:pressed2.down?1:0;
    if(c2){let c=p2Col[p2Ci];do{c=(c+N_COL+c2)%N_COL;}while(p2Ci===charIdx&&p1Col[charIdx]===c);p2Col[p2Ci]=c;colGuardar();SFX.swap();}
    if(pressed2.bomb||pressed2.back){p2Pad=-1;SFX.hit();}
  }
  const rows=selRows();let ri=rows.indexOf(selRow);if(ri<0){ri=0;selRow=rows[0];}
  if(pressed.up&&ri>0){selRow=rows[ri-1];SFX.swap();}
  else if(pressed.down&&ri<rows.length-1){selRow=rows[ri+1];SFX.swap();}
  const dx=pressed.left?-1:pressed.right?1:0;
  if(dx){
    if(selRow===0){charIdx=(charIdx+CHARS.length+dx)%CHARS.length;if(p2Pad>=0)colFix(charIdx,p2Ci);SFX.swap();}
    else if(selRow===3){let c=p1Col[charIdx];do{c=(c+N_COL+dx)%N_COL;}while(p2Pad>=0&&p2Ci===charIdx&&p2Col[p2Ci]===c);p1Col[charIdx]=c;colGuardar();SFX.swap();}
    else if(selRow===1){const n=clamp(selLevel+dx,0,LEVELS.length-1);if(n!==selLevel){selLevel=n;selNo=0;SFX.swap();}}
    else{const n=clamp(difficulty+dx,0,DIFFS.length-1);if(n!==difficulty){difficulty=n;store.set('oxido-dificultad',difficulty);SFX.swap();}}
  }
  if(selNo>0)selNo--;
  if(selT>8&&(pressed.start||pressed.shoot||pressed.jump)){
    if(selLocked(selLevel)){selNo=16;selRow=1;SFX.hit();}
    else{SFX.pick();if(!(typeof IN_arrancar==='function'&&IN_arrancar(selLevel)))startLevel(selLevel,false);}} // introducción jugable (intro.js)
  else if(pressed.back){state='title';}
}
// ================== fin de juego y misión cumplida ==================
function drawEndBadge(y){
  const s=medals?'MEDALLA DE '+MEDALS[medals-1].name:'SIN MEDALLA TODAVÍA',sw=hudTW(s,5),x=W/2-(sw+16)/2;
  drawBadge(x+6,y+4,medals,5);txt(s,x+16,y+1.5,5,medals?MEDALS[medals-1].col:'#aaa','left');
}
function drawWho(y){const s=(players.length>1?players.map(p=>CHARS[p.ci].name).join(' + '):CH().name)+' · ',w1=hudTW(s,5),w2=hudTW(DIFF().name,5),x=W/2-(w1+w2)/2;
  txt(s,x,y,5,'#ddd','left');txt(DIFF().name,x+w1,y,5,DIFF_COL[difficulty],'left');}
// tabla de dos columnas de "etiqueta  valor" (fin del juego)
function endPairs(rows,y,dy){rows.forEach(([k,v,col],i)=>{const c=i%2,r=i>>1,x0=c?170:28,x1=c?292:150;
  txt(k,x0,y+r*dy,5,'#aaa','left',false);txt(v,x1,y+r*dy,5,col||'#fff','right',false);});}
const KILL_NAMES=[['soldier','soldados'],['grenadier','granaderos'],['shield','escuderos'],['drone','drones'],['turret','torretas'],['mudling','criaturas']];
function drawEnd(){
  dim(state==="over"?0.74:0.66);
  const pad7=n=>String(n).padStart(7,'0'),pa=partida;
  if(state==='over'){FIN_caiste();return;} // ¡CAÍSTE! (fin.js)
  // misión cumplida: desglose por tramo y bonus de la misión
  const mis=(vuelta>1?'V'+vuelta+' · ':'')+'MISIÓN '+(levelIdx+1);
  txt(lastLevel()?'¡VUELTA '+vuelta+' COMPLETA!':'¡'+mis+' CUMPLIDA!',W/2,5,12,'#ffe08a','center');
  drawWho(20);
  const tr=PC_mis?PC_mis.tramos:[],cols=[['TRAMO',22,'left'],['BAJAS',124,'right'],['RESC.',152,'right'],['TIEMPO',184,'right'],['PUNT.',212,'right'],['RACHA',240,'right'],['SIN DAÑO',266,'center'],['BONUS',300,'right']];
  ctx.fillStyle='rgba(18,12,24,0.7)';ctx.fillRect(16,29,288,9+tr.length*8.5);
  cols.forEach(([k,x,al])=>txt(k,x,31,4,'#aaa',al,false));
  tr.forEach((t,i)=>{const y=39+i*8.5,v=[t.n+' · '+t.kind,String(t.kills),String(t.resc+t.cat),PC_mmss(t.secs),t.pct===null?'—':t.pct+'%',String(t.best),t.hurt?'—':'SÍ','+'+t.bonus];
    cols.forEach(([k,x,al],j)=>txt(v[j],x,y,5,j===6&&!t.hurt?'#7dff9a':j===7&&t.bonus?'#7dff9a':j===0?'#ffe08a':'#fff',al,false));});
  let y=41+tr.length*8.5;
  ctx.fillStyle='#3a2a40';ctx.fillRect(22,y-1,278,0.6);
  const st=stats;
  endPairs([['Bonus tramos','+'+st.tram,'#7dff9a'],['Bonus tiempo ('+PC_mmss(st.secs)+')','+'+st.tb],
    ['Rescates y amigos','+'+st.rb,'#9fe8a0'],['Vidas y salud','+'+st.lb],
    ['Medalla ('+(medals?MEDALS[medals-1].name:'ninguna')+')','+'+st.mb]],y+2,7.5);
  y+=25;
  const by={};for(const t of tr)for(const k in t.by)by[k]=(by[k]||0)+t.by[k];
  const nk=tr.reduce((s,t)=>s+t.kills,0),parts2=KILL_NAMES.filter(([k])=>by[k]).map(([k,n])=>by[k]+' '+n);
  const jefes=tr.reduce((s,t)=>s+t.bosses,0),others=Object.keys(by).filter(k=>!KILL_NAMES.some(([q])=>q===k)).reduce((s,k)=>s+by[k],0)-jefes;
  if(jefes)parts2.push(jefes+(jefes===1?' jefe':' jefes'));if(others>0)parts2.push(others+' otros');
  txt('BAJAS EN LA MISIÓN: '+nk+(parts2.length?' · '+parts2.join(' · '):''),W/2,y,4,'#ffb0a0','center',false);
  y+=8;
  txt('MISIÓN +'+Math.max(0,score-(PC_mis?PC_mis.score0:0)),22,y+1,6,'#ddd','left');
  txt('TOTAL '+pad7(score),300,y,8,'#ffe08a','right');
  drawEndBadge(y+13);
  txt(newRecord?'¡NUEVO RÉCORD!':tx(TX.menu.record,{n:pad7(record)}),W/2,y+25,6,newRecord?'#7dff9a':'#f3c969','center');
  if(overT>45){txt(btn('ok')+': seguir a la '+(lastLevel()?'VUELTA '+(vuelta+1):'MISIÓN '+(levelIdx+2))+'  ·  '+(onTouch()?'mantener ':'')+btn('back')+': terminar',W/2,H-14,6,'#fff','center');
    zona(W/2-130,H-16,128,11,{clic:RA_enter});zona(W/2+2,H-16,128,11,{clic:RA_volver});}
}
