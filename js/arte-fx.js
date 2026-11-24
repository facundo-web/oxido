'use strict';
// Óxido · Efectos "Hondo" (notas/arte/guia.md §6) — va después de arte-luz.js, antes de juego.js
// Todo en píxeles enteros, sin círculos lisos ni rotate; las luces suaves van con LUZ_halo (arte-luz.js).
// · Fogonazo: cruz de 3 × 3 (#fff0c0 al centro, #ffe08a alrededor) + halo de radio 9.
// · Balas del jugador: 5 × 1 con estela de 2 px al 50 % y halo de radio 5. Balas enemigas: 2 × 2 #ff3b30 con estela de
//   3 × 1 y halo rojo chico (se ven primero que nada).
// · Explosión: núcleo claro de 3 px con halo fuerte, fuego en 3 tonos que crece (radio 9 → 12), chispas de 1–2 px, humo
//   de 2 tonos que sube y se apaga, y el halo ilumina el piso 4 cuadros. Nada de disco blanco ni anillo.
// · Caída de enemigos: 4 cuadros dibujados de vuelta (de pie, inclinado, de costado, en el piso), no rotate.
// · Estirar y aplastar del jugador: 1 cuadro estirado al subir (1 px más alto y 1 más angosto) y 1 aplastado al caer.
// Cómo: las partículas de siempre ('fire', 'smoke', 'ring', 'flash', 'spr') se pasan a las nuevas al dibujar el primer
// plano (antes de que juego.js las dibuje, así no salen dos veces) y se dibujan acá; explodeFx suma el núcleo y el
// humo con la paleta de la misión. Las balas usan b.draw (las enemigas ya lo tienen; las del jugador necesitan una
// línea de Código en el bucle de pbul: if(b.draw){b.draw(b);continue;}).
// Prefijo FX_.
const FX_HUMO={dusk:['#3c3e6c','#7a7aa8'],port:['#1e2a44','#4a5a80'],swamp:['#1e3424','#6a8a6a'],desert:['#b0704a','#e8b880'],noche:['#16162a','#2e2e4a'],
  datos:['#241a5a','#4a3a8a'],nave:['#3a3a46','#4a4a5a'],selva:['#3a5034','#9ab0a0'],embrujada:['#3a2a34','#6a5a7a'],templo:['#5a6a4a','#d8c890']}; // medio y lejos de cada misión
// humo: oscuro y apagado (base) con el borde de arriba un poco más claro. M1 lo dio Dirección de Arte; el resto sale
// del color "medio" de cada misión, oscurecido
const FX_mezcla=(a,b,k)=>{const h=x=>[1,3,5].map(i=>parseInt(x.slice(i,i+2),16)),A=h(a),B=h(b);return '#'+A.map((v,i)=>Math.round(v*(1-k)+B[i]*k).toString(16).padStart(2,'0')).join('');};
const FX_HUMO_M1=['#24223e','#2c2a48'];
const FX_humoCol=()=>{const t=(typeof L!=='undefined'&&L&&L.theme)||'dusk';if(t==='dusk')return FX_HUMO_M1;const m=(FX_HUMO[t]||FX_HUMO.dusk)[0];
  return[FX_mezcla(m,'#0c0a14',0.35),FX_mezcla(m,'#0c0a14',0.15)];};
const FX_red=()=>typeof MOV_reducido==='function'&&MOV_reducido();
const FX_r=Math.round;
// "disco" pixelado de radio r (filas enteras, sin arc)
function FX_disco(cx,cy,r,col){cx=FX_r(cx);cy=FX_r(cy);r=Math.max(0,FX_r(r));ctx.fillStyle=col;
  if(r<=1){ctx.fillRect(cx-r,cy-r,2*r+1,2*r+1);return;}
  for(let dy=-r;dy<=r;dy++){const w=Math.floor(Math.sqrt(r*r-dy*dy+r*0.6));ctx.fillRect(cx-w,cy+dy,2*w+1,1);}}
// borde de arriba del disco (1 o 2 filas) en otro color: el humo se aclara arriba, no en el medio
function FX_tapa(cx,cy,r,col){cx=FX_r(cx);cy=FX_r(cy);r=Math.max(0,FX_r(r));ctx.fillStyle=col;if(r<=1){ctx.fillRect(cx-r,cy-r,2*r+1,1);return;}
  for(let dy=-r;dy<=-r+(r>3?1:0);dy++){const w=Math.floor(Math.sqrt(r*r-dy*dy+r*0.6));ctx.fillRect(cx-w,cy+dy,2*w+1,1);}}
// ---------- fogonazo ----------
function FX_fogonazo(x,y){x=FX_r(x);y=FX_r(y);ctx.fillStyle='#ffe08a';ctx.fillRect(x-1,y,3,1);ctx.fillRect(x,y-1,1,3);ctx.fillStyle='#fff0c0';ctx.fillRect(x,y,1,1);
  if(typeof LUZ_halo==='function')LUZ_halo(x+0.5,y+0.5,9,'#ffd890',0.55);}
// ---------- balas ----------
function FX_dir(b){return Math.abs(b.vx)>=Math.abs(b.vy)?[Math.sign(b.vx)||1,0]:[0,Math.sign(b.vy)||1];}
function FX_balaJug(b){
  const[dx,dy]=FX_dir(b),x=FX_r(b.x),y=FX_r(b.y),l=b.pellet?2:b.heavy?6:5,col=b.ally?'#9fe8a0':b.heavy?'#ffb050':'#ffe08a';
  ctx.globalAlpha=0.5;ctx.fillStyle=col;if(dx)ctx.fillRect(dx>0?x-l-2:x+1,y,2,1);else ctx.fillRect(x,dy>0?y-l-2:y+1,1,2);ctx.globalAlpha=1; // estela
  ctx.fillStyle=col;if(dx)ctx.fillRect(dx>0?x-l+1:x,y,l,1);else ctx.fillRect(x,dy>0?y-l+1:y,1,l);
  ctx.fillStyle='#fff6d8';if(dx)ctx.fillRect(dx>0?x:x,y,1,1);else ctx.fillRect(x,y,1,1);
  if(typeof LUZ_halo==='function')LUZ_halo(x,y+0.5,5,b.ally?'#9fe8a0':'#ffd070',0.35);
}
// bola del lanzallamas del jugador: disco de píxeles en 3 tonos según la edad (claro, naranja, rojo) y al final una
// brasa oscura chica que se apaga; un halo chico solo en las más nuevas (no gastan los 24 halos del cuadro)
function FX_llamaJug(b){
  const a=b.life/b.maxl,x=FX_r(b.x),y=FX_r(b.y),r=Math.max(1,FX_r(b.r));
  if(a<=0.2){if(a>0.1||(T>>1)%2)FX_disco(x,y,Math.max(1,r-1),'#5a2a22');return;}
  const t=a>0.7?['#ffae3a','#fff0a0','#ffffff']:a>0.45?['#ff5a2a','#ffae3a','#fff0a0']:['#a8321e','#ff5a2a','#ffae3a'];
  FX_disco(x,y,r,t[0]);if(r>1)FX_disco(x,y,r-1,t[1]);if(r>2)ctx.fillStyle=t[2],ctx.fillRect(x,y,1,1);
  if(a>0.75&&typeof LUZ_halo==='function'&&((b.x|0)%3===0))LUZ_halo(x,y,8,'#ffc07a',0.25);
}
function FX_balaEnemiga(b){
  const[dx,dy]=FX_dir(b),x=FX_r(b.x)-1,y=FX_r(b.y)-1;
  ctx.globalAlpha=0.55;ctx.fillStyle='#ff3b30';if(dx)ctx.fillRect(dx>0?x-3:x+2,y+1,3,1);else ctx.fillRect(x+1,dy>0?y-3:y+2,1,3);ctx.globalAlpha=1;
  ctx.fillStyle='#120c18';ctx.fillRect(x-1,y-1,4,4);ctx.fillStyle='#ff3b30';ctx.fillRect(x,y,2,2);ctx.fillStyle='#ffb0a0';ctx.fillRect(x,y,1,1);
  if(typeof LUZ_halo==='function')LUZ_halo(x+1,y+1,5,'#ff3b30',0.45);
}
ON_STEP.push(()=>{
  if(typeof pbul!=='undefined')for(const b of pbul){if(b.draw)continue;if(!b.k)b.draw=FX_balaJug;else if(b.k==='flame')b.draw=FX_llamaJug;}  // rocket y demás quedan como están
  if(typeof eproj!=='undefined')for(const b of eproj)if(!b.draw&&b.kind==='bullet')b.draw=FX_balaEnemiga;
});
// ---------- partículas nuevas ----------
const FX_FUEGO=['#fff0c0','#ffc060','#ff7a2a','#b8321e'];
function FX_dibujarParte(p){
  const a=p.life/p.maxl;
  switch(p.k){
  case 'axfuego':{const s=Math.max(1,FX_r(p.size*(0.5+a*0.6))),c=a>0.75?FX_FUEGO[0]:a>0.5?FX_FUEGO[1]:a>0.3?FX_FUEGO[2]:FX_FUEGO[3];
    ctx.fillStyle=c;ctx.fillRect(FX_r(p.x-s/2),FX_r(p.y-s/2),s,s);break;}
  case 'axhumo':{const[c1,c2]=p.cols||FX_humoCol(),r=Math.max(1,FX_r(p.size*(1.2-a*0.4)));ctx.globalAlpha=Math.min(1,a*0.85);
    FX_disco(p.x,p.y,r,c1);FX_tapa(p.x,p.y,r,c2);ctx.globalAlpha=1;break;}
  case 'axdestello':{ // chico: fogonazo; grande: núcleo de 3 px con halo fuerte
    if(p.size<5){if(p.life===p.maxl||p.life>=2)FX_fogonazo(p.x,p.y);break;}
    const x=FX_r(p.x),y=FX_r(p.y);ctx.fillStyle='#fff0c0';ctx.fillRect(x-1,y-1,3,3);ctx.fillStyle='#ffc060';ctx.fillRect(x-2,y,1,1);ctx.fillRect(x+2,y,1,1);ctx.fillRect(x,y-2,1,1);ctx.fillRect(x,y+2,1,1);
    if(typeof LUZ_halo==='function'&&!FX_red())LUZ_halo(x,y,Math.min(30,p.size*3),'#ffb060',0.9);break;}
  case 'axluz':{ // el halo de la explosión ilumina el piso unos cuadros (sin halo fuerte con MOVIMIENTO REDUCIDO)
    if(typeof LUZ_halo==='function')LUZ_halo(p.x,p.y,p.max>=24?30:18,'#ff9a50',(FX_red()?0.25:0.6)*a);break;}
  case 'axcae':{if(p.life<20&&(p.life>>1)%2)break;let img=FX_caida(p.img,p.dir,p.cuadro);
    // el borde de luz se calcula sobre el cuadro ya girado: sigue POR DENTRO (un soldado que cae no vuela)
    const luz=typeof LUZ_luz==='function'&&LUZ_luz();if(luz&&typeof LUZ_sprite==='function')img=LUZ_sprite(img,luz);
    ctx.drawImage(img,FX_r(p.x+7-img.width/2),FX_r(p.y+18-img.height));break;}
  }
}
// cuadros de la caída (Dirección de Arte): solo corrimientos y giros de 90° exactos, guardados
//   0 de pie · 1 inclinado: el sprite corrido 1 px por cada 3 filas hacia donde cae · 2 de costado: girado 90° exacto
//   (en el aire) · 3 en el piso: el cuerpo acostado, apoyado
const FX_CAE=new WeakMap();
function FX_caida(img,dir,n){
  let m=FX_CAE.get(img);if(!m){m={};FX_CAE.set(img,m);}const k=dir+'|'+n;if(m[k])return m[k];
  const w=img.width,h=img.height,src=document.createElement('canvas');src.width=w;src.height=h;src.getContext('2d').drawImage(img,0,0);
  let out;
  try{const sd=src.getContext('2d').getImageData(0,0,w,h).data;
    if(n===0)out=src;
    else if(n===1){const em=Math.ceil(h/3);out=document.createElement('canvas');out.width=w+em;out.height=h;const g=out.getContext('2d'),od=g.createImageData(w+em,h);
      for(let y=0;y<h;y++){const sh=Math.floor((h-1-y)/3),dx=dir>0?sh:em-sh;for(let x=0;x<w;x++){const i=(y*w+x)*4;if(sd[i+3]<128)continue;const j=(y*(w+em)+x+dx)*4;od.data.set(sd.subarray(i,i+4),j);}}
      g.putImageData(od,0,0);}
    else{out=document.createElement('canvas');out.width=h;out.height=w+(n===2?3:0);const g=out.getContext('2d'),od=g.createImageData(h,out.height);
      for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(sd[i+3]<128)continue;
        // 90° exacto: cae hacia la derecha → la cabeza queda a la derecha
        const nx=dir>0?h-1-y:y,ny=dir>0?x:w-1-x;od.data.set(sd.subarray(i,i+4),(ny*h+nx)*4);}
      g.putImageData(od,0,0);}
  }catch(e){return img;}
  m[k]=out;return out;
}
// pasar las partículas de siempre a las nuevas (una vez cada una)
function FX_convertir(){
  if(typeof parts==='undefined')return;
  for(const p of parts){
    switch(p.k){
    case 'fire':p.k='axfuego';break;
    case 'smoke':p.k='axhumo';if(!p.cols&&p.col){const v=String(p.col).split(',').map(Number);if(v.length>=3&&Math.min(v[0],v[1],v[2])>=215){const h=k=>'#'+v.slice(0,3).map(n=>Math.max(0,Math.min(255,Math.round(n*k))).toString(16).padStart(2,'0')).join('');p.cols=[h(0.82),h(1)];}}break; /* el VAPOR blanco (color propio casi blanco: M5, entradas, jefes) conserva su color; el resto del humo va en los 2 tonos de la misión */
    case 'ring':p.k='axluz';break;
    case 'flash':p.k='axdestello';break;
    case 'spr':{p.k='axcae';p.dir=Math.sign(p.vr||1);p.cuadro=0;break;}}
    if(p.k==='axcae'){const t=1-p.life/(p.maxl||55);p.cuadro=t<0.12?0:t<0.28?1:t<0.48?2:3;} // de pie → inclinado → de costado → en el piso
  }
}
function FX_dibujarTodo(){if(typeof parts==='undefined')return;FX_convertir();for(const p of parts)if(p.k&&p.k.charCodeAt(0)===97&&p.k[1]==='x')try{FX_dibujarParte(p);}catch(e){}}
// ---------- explosión ----------
if(typeof explodeFx==='function'){const FX_exp0=explodeFx;explodeFx=function(x,y,r){
  const r0=FX_exp0.apply(this,arguments);
  try{const hc=FX_humoCol();
    // humo de 2 tonos de la misión (además del que ya suma la explosión, que pasa a pixelado)
    for(let i=0;i<3+r/8;i++)parts.push({k:'axhumo',cols:hc,x:x+rand(-r/4,r/4),y:y+rand(-r/4,0),vx:rand(-0.25,0.25),vy:rand(-0.55,-0.2),life:rand(40,70),maxl:70,size:rand(2,4)});
    // chispas que salen
    for(let i=0;i<6+r/4;i++){const a=rand(-Math.PI,0),s=rand(1.2,2.6)*r/14;parts.push({k:'p',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,g:0.08,life:rand(12,24),maxl:24,size:i%3?1:2,col:i%2?'#ffc060':'#fff0c0'});}
  }catch(e){}
  return r0;};}
// ---------- estirar y aplastar del jugador (cuadros, no escala) ----------
const FX_SQ=new WeakMap();
function FX_deformar(img,modo){ // 'e' estirado: 1 más angosto y 1 más alto · 'a' aplastado: 1 más ancho y 1 más bajo
  let m=FX_SQ.get(img);if(!m){m={};FX_SQ.set(img,m);}if(m[modo])return m[modo];
  const c=document.createElement('canvas');c.width=img.width;c.height=img.height+1;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  if(modo==='e')g.drawImage(img,0,0,img.width,img.height,0.5,0,img.width-1,img.height+1);else g.drawImage(img,0,0,img.width,img.height,-0.5,2,img.width+1,img.height-1);
  // sin medios píxeles: se pasa a un lienzo entero por umbral de alfa
  try{const d=g.getImageData(0,0,c.width,c.height);for(let i=3;i<d.data.length;i+=4)d.data[i]=d.data[i]>=128?255:0;g.putImageData(d,0,0);}catch(e){}
  m[modo]=c;return c;
}
let FX_jug=null;
if(typeof drawPlayer==='function'){const FX_dp0=drawPlayer;drawPlayer=function(){FX_jug=typeof P!=='undefined'?P:null;try{return FX_dp0.apply(this,arguments);}finally{FX_jug=null;}};}
if(typeof drawRig==='function'){const FX_rig0=drawRig;drawRig=function(set,pose,f,x,y){
  const p=FX_jug;let modo=null;
  if(p&&!p.crouch){if(!p.onGround&&p.vy<-1.6)modo='e';else if(p.landT>4)modo='a';}
  if(!modo)return FX_rig0.call(this,set,pose,f,x,y);
  const up=set.up.map(c=>FX_deformar(c,modo));
  return FX_rig0.call(this,{...set,up,__luz:true},{...pose,uy:(pose.uy||0)-1},f,x,y);
};}
// ---------- fuego que queda en el piso: llamas en píxeles (como el fuego de los tachos de escenarios) ----------
// Lenguas de hasta 5 px de ancho en 3 tonos (borde rojo, cuerpo naranja, centro claro abajo). Cambian de forma de a
// cuadros (cada 8) y la punta se corre 1 px; con MOVIMIENTO REDUCIDO quedan quietas. Brasa de base y un halo chico.
const FX_LLAMA=['#ff5a2a','#ffae3a','#fff0a0'];
function FX_llamas(x0,y,w,k,sem){
  if(!(k>0))return;x0=Math.round(x0);y=Math.round(y);w=Math.max(4,Math.round(w));sem=sem|0;
  const red=FX_red(),f=red?0:(T>>3),n=Math.max(1,Math.floor((w-1)/4));
  for(let i=0;i<n;i++){
    const H=Math.max(2,Math.round((6+FX_hash(i*13+sem+f*7)*6+(i%2?0:2))*Math.min(1,k))),cx=x0+2+i*4+(w-1-n*4>>1);
    const off=red?0:((f+i)%3===1?1:(f+i)%3===2?-1:0);
    for(let r=0;r<H;r++){const t=r/H,ww=Math.max(1,Math.round(5*(1-t*0.85))),dx=r>H/2?off:0,xa=cx-(ww>>1)+dx,yy=y-1-r;
      ctx.fillStyle=FX_LLAMA[0];ctx.fillRect(xa,yy,ww,1);
      if(t<0.7&&ww>2){ctx.fillStyle=FX_LLAMA[1];ctx.fillRect(xa+1,yy,ww-2,1);}
      if(t<0.35&&ww>3){ctx.fillStyle=FX_LLAMA[2];ctx.fillRect(xa+2,yy,Math.max(1,ww-4),1);}}
  }
  ctx.fillStyle=FX_LLAMA[1];ctx.fillRect(x0,y-1,w,1);ctx.fillStyle=FX_LLAMA[2];ctx.fillRect(x0+1,y-2,w-2,1); // brasa de base
  if(typeof LUZ_halo==='function')LUZ_halo(x0+w/2,y-5,Math.max(18,w*0.9),'#ffc07a',0.3*Math.min(1,k));
}
const FX_hash=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
// rectángulo con tinta de 1 px (dos pasadas); 'alza' sube 1 px una mitad (en vez de girar)
function FX_chapa(x,y,w,h,c,alza){x=Math.round(x);y=Math.round(y);const m=w>>1,izq=alza<0?1:0,der=alza>0?1:0;
  ctx.fillStyle='#120c18';ctx.fillRect(x-1,y-1-izq,m+1,h+2);ctx.fillRect(x+m,y-1-der,w-m+1,h+2);
  ctx.fillStyle=c;ctx.fillRect(x,y-izq,m,h);ctx.fillRect(x+m,y-der,w-m,h);ctx.fillStyle='#c0b0a0';ctx.fillRect(x+1,y+1-izq,1,1);}
// M1 · el fuego del piso del que sale el robot (momentos.js): mismo estado y mismas chispas, dibujo en píxeles
if(typeof MO_drawM1==='function'){const FX_m1_0=MO_drawM1;MO_drawM1=function(){
  try{
    const m=MO.m1;if(!m)return;
    const k=m.t<20?m.t/20:m.t>520?Math.max(0,1-(m.t-520)/60):1;
    if(k>0){const x0=m.fx-6,w=34;FX_llamas(x0,GROUND,w,k,m.fx);
      if(m.t%3===0)parts.push({k:'fire',x:x0+rand(0,w),y:GROUND-rand(2,10),vx:rand(-0.2,0.2),vy:rand(-1,-0.4),life:rand(14,24),maxl:24,size:rand(1.5,3)});
      if(m.t%4===0&&m.t<200)parts.push({k:'smoke',col:'225,225,230',x:x0+rand(0,w),y:GROUND-rand(4,14),vx:rand(-0.3,0.3),vy:rand(-0.9,-0.4),life:rand(26,40),maxl:40,size:rand(2,3.5)});}
    // escombros que se apartan cuando el robot sale: se corren y una punta sube 1 px (sin girar); al final parpadean y se van
    if(m.t<600&&!(m.t>520&&(T>>2)%2)){const ap=clamp((m.t-55)/30,0,1),x0=m.fx+1;
      for(const[dx,w,h,c,sg]of[[-4,9,4,'#5a4c3e',-1],[3,8,6,'#7c848e',-1],[10,10,5,'#9a5a32',1],[17,8,3,'#4e555e',1]])
        FX_chapa(x0+dx+sg*ap*(14+dx*0.3),GROUND-h,w,h,c,ap>0.5?sg:0);}
    const c=m.chapa;if(c){const x=Math.round(c.x);
      if(c.rota){ctx.fillStyle='#120c18';ctx.fillRect(x-1,GROUND-3,18,3);ctx.fillStyle='#7d8794';ctx.fillRect(x,GROUND-2,16,2);}
      else{for(const tinta of[true,false])for(let r=0;r<4;r++){const a=Math.round(r*0.75),xa=x+a,ww=16-2*a;
          ctx.fillStyle=tinta?'#120c18':'#9aa4ae';if(tinta)ctx.fillRect(xa-1,GROUND-2-r,ww+2,3);else ctx.fillRect(xa,GROUND-1-r,ww,1);}
        ctx.fillStyle='#c9d2dc';ctx.fillRect(x+4,GROUND-4,8,1);}}
  }catch(e){return FX_m1_0.apply(this,arguments);}
};}
// M2 · charco de nafta del SARGENTO CENIZA (jefes.js): charco en píxeles, aviso que titila y llamas en píxeles
if(typeof drawPuddle==='function'){const FX_charco0=drawPuddle;drawPuddle=function(o){
  try{
    const g=Math.min(1,o.t/24),fade=Math.min(1,(o.life-o.t)/30),hw=o.w/2,x=Math.round(o.x),y=Math.round(o.y),rw=Math.max(3,Math.round(hw*(0.5+g*0.5)));
    ctx.fillStyle='#1e1210';ctx.fillRect(x-rw+2,y-1,2*rw-4,1);ctx.fillRect(x-rw,y,2*rw,1);ctx.fillRect(x-rw+2,y+1,2*rw-4,1);
    ctx.fillStyle='#4a3a30';ctx.fillRect(x-rw+3,y-1,3,1); // brillo de la nafta
    if(o.t<=24){if((T>>2)%2){ctx.fillStyle='#ff5a3c';ctx.fillRect(Math.round(x-hw*0.5),y-1,Math.round(hw),1);}return;}
    FX_llamas(x-hw+1,y,o.w-2,fade,x);
  }catch(e){return FX_charco0.apply(this,arguments);}
};}
// ---------- gancho: encima del mundo (después del primer plano), antes de granadas, balas y partículas de juego.js ----------
if(typeof drawForeground==='function'){const FX_fg0=drawForeground;drawForeground=function(){const r=FX_fg0.apply(this,arguments);try{FX_dibujarTodo();}catch(e){}return r;};}
