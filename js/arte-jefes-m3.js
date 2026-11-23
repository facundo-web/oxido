'use strict';
// Óxido · Jefes de M3 en estilo "Hondo" (notas/arte/guia.md). Va después de arte-jefes-m2.js, antes de juego.js.
// · MADRE YUYO (villana): el bulbo, redibujado en píxeles (rampa de luz arriba y sombra abajo, placas de corteza con
//   tinta, venas de 1 px y pústulas que laten en 4 escalones). El DIENTE DORADO va en el centro del bulbo: con el bulbo
//   cerrado asoma en un hueco de la corteza; abierto, queda en el medio del núcleo que late. Es lo único dorado.
//   Cabezas: 16 direcciones guardadas (excepción de la guía para lo que apunta). Tallos: captura en píxeles con borde.
// · CHAPALEADOR (jefe chico): capturado en píxeles con contorno y borde de luz.
// Prefijo J3_.
const J3_TINTA='#17141f';
const J3_red=()=>typeof MOV_reducido==='function'&&MOV_reducido();
const J3_DIENTE=['.#.#.','#####','##.##','#####','.#.#.'];
function J3_diente(x,y,fuerte){
  x=Math.round(x);y=Math.round(y);
  ctx.fillStyle='#120c18';J3_DIENTE.forEach((r,j)=>{for(let i=0;i<5;i++)if(r[i]==='#')ctx.fillRect(x+i-1,y+j-1,3,3);});
  J3_DIENTE.forEach((r,j)=>{for(let i=0;i<5;i++)if(r[i]==='#'){ctx.fillStyle=i+j<=2?'#fff0b0':i+j>=6?'#7a5a1a':'#d8a83a';ctx.fillRect(x+i,y+j,1,1);}});
  ctx.fillStyle='#3a2a10';ctx.fillRect(x+2,y+2,1,1);
  if(typeof LUZ_halo==='function'){const lat=(J3_red()?0.36:0.3+0.1*Math.sin(T/40))*(fuerte?1.3:1);LUZ_halo(x+2.5,y+2.5,fuerte?10:7,'#ffd860',lat);}
}
// media elipse en píxeles (de la base para arriba): fila por fila
function J3_media(cx,base,rx,ry,col){if(rx<1||ry<1)return;ctx.fillStyle=col;
  for(let dy=0;dy<ry;dy++){const t=(dy+0.5)/ry,w=Math.round(rx*Math.sqrt(Math.max(0,1-t*t)));if(w>0)ctx.fillRect(cx-w,base-1-dy,2*w,1);}}
function J3_elipse(cx,cy,rx,ry,col){if(rx<1||ry<1)return;ctx.fillStyle=col;
  for(let dy=-ry;dy<ry;dy++){const t=(dy+0.5)/ry,w=Math.round(rx*Math.sqrt(Math.max(0,1-t*t)));if(w>0)ctx.fillRect(cx-w,cy+dy,2*w,1);}}

// ---------- MADRE YUYO · el bulbo ----------
function J3_bulbo(b,wl,fl){
  const s=b.sc,cx=Math.round(b.cx),bh=Math.round(PL_bodyH(b)),rw=Math.round(24*s);if(bh<1)return;
  const M=(a,d)=>fl?'#ffffff':PL_mix(a,d,wl),open=!!b.exposed,G=GROUND;
  // cuerpo: tinta, después la rampa por filas (luz arriba, sombra abajo)
  J3_media(cx,G,rw+1,bh+1,J3_TINTA);
  const c=[M('#2a1626','#2a2016'),M('#3a2036','#3a2c1e'),M('#4a2a44','#4a3a28'),M('#5e3656','#5a4a30'),M('#7a4a6e','#6a5a3a')];
  for(let dy=0;dy<bh;dy++){const t=(dy+0.5)/bh,w=Math.round(rw*Math.sqrt(Math.max(0,1-t*t)));if(w<=0)continue;
    ctx.fillStyle=c[t<0.14?0:t<0.3?1:t<0.72?2:t<0.88?3:4];ctx.fillRect(cx-w,G-1-dy,2*w,1);}
  // placas de corteza (media elipse con borde oscuro y una fila de luz)
  const plates=[[-0.62,0.42],[-0.28,0.7],[0.08,0.78],[0.42,0.6],[0.7,0.34],[-0.45,0.18],[0.2,0.3],[0.55,0.12],[-0.15,0.38]];
  const prx=Math.max(3,Math.round(6*s)),pry=Math.max(2,Math.round(4.2*s));
  for(const[px,py]of plates){if(open&&Math.abs(px)<0.36&&py>0.2)continue;const x=Math.round(cx+px*rw),y=Math.round(G-py*bh);
    if(y-pry<G-bh+2)continue;
    J3_media(x,y+1,prx+1,pry+1,c[0]);J3_media(x,y,prx,pry,M('#5e3656','#5a4a30'));ctx.fillStyle=M('#8a5a7e','#6a5a3a');ctx.fillRect(x-prx+2,y-pry,Math.max(2,prx),1);}
  // venas de 1 px
  ctx.fillStyle=wl>0.5?'#5a4a2a':fl?'#ffffff':'#8ac040';
  for(const vx of[-0.5,-0.1,0.3,0.65]){if(open&&Math.abs(vx)<0.4)continue;const x0=cx+vx*rw,x1=cx+vx*rw*0.6,x2=cx+vx*rw*0.25,y1=G-bh*0.5,y2=G-bh*0.92,n=Math.max(4,bh);
    for(let i=0;i<=n;i++){const u=i/n,v=1-u;ctx.fillRect(Math.round(v*v*x0+2*v*u*x1+u*u*x2),Math.round(v*v*G+2*v*u*y1+u*u*y2),1,1);}}
  // pústulas que laten en 4 escalones (quietas con MOVIMIENTO REDUCIDO)
  const PUS=['#6a9a2a','#8ac040','#c0e060','#e8ff80'],ps=s>1.2?3:2;
  for(const[px,py,ph]of[[-0.35,0.55,0],[0.3,0.48,2],[0.05,0.22,4],[0.58,0.25,1]]){if(open&&Math.abs(px)<0.4)continue;
    const x=Math.round(cx+px*rw),y=Math.round(G-py*bh),lv=J3_red()?1:((T>>3)+ph)%4,col=wl>0.5?'#6a5a30':fl?'#ffffff':PUS[lv];
    ctx.fillStyle=c[0];ctx.fillRect(x-1,y-1,ps+2,ps+2);ctx.fillStyle=col;ctx.fillRect(x,y,ps,ps);}
  const ty=Math.round(G-bh*0.5);
  if(open){ // se abre: núcleo que late en escalones y el diente en el medio
    const lv=J3_red()?1:(T>>2)%4,rx=Math.round(rw*0.45),ry=Math.max(3,Math.round(bh*0.42));
    J3_elipse(cx,ty,rx,ry,'#1a0c14');
    J3_elipse(cx,ty,Math.round(rx*0.7),Math.max(2,Math.round(ry*0.7)),fl?'#ffffff':['#c83a3a','#ff6a5a','#ff9a7a','#ff6a5a'][lv]);
    J3_elipse(cx,ty,Math.round(rx*0.42),Math.max(2,Math.round(ry*0.42)),fl?'#ffffff':['#ff6a5a','#ff9a7a','#ffd0a0','#ff9a7a'][lv]);
  }else if(bh>10){J3_elipse(cx,ty,5,4,'#1a0c14');J3_elipse(cx,ty,4,3,'#2a1422');} // con el bulbo cerrado: un hueco en la corteza
  if(bh>10&&!fl)J3_diente(cx-2,ty-2,open);
  // escudo (shud): el contorno titila verde claro
  if(b.shud>0&&(T>>2)%2){ctx.fillStyle='#c8f060';for(let dy=0;dy<=bh+1;dy++){const t=(dy+0.5)/(bh+1),w=Math.round((rw+1)*Math.sqrt(Math.max(0,1-t*t)));ctx.fillRect(cx-w-1,G-1-dy,1,1);ctx.fillRect(cx+w,G-1-dy,1,1);}}
}
if(typeof PL_drawBulb==='function'){const J3_bulb0=PL_drawBulb;PL_drawBulb=function(b,wl,fl){
  try{J3_bulbo(b,wl,fl);}catch(e){return J3_bulb0.apply(this,arguments);}};}
// cabezas y tallos: captura en píxeles enteros con contorno y borde de luz
if(typeof PL_drawStalk==='function'){const J3_tallo0=PL_drawStalk;PL_drawStalk=function(b,h,an){
  if(typeof LUZ_vivo!=='function')return J3_tallo0.apply(this,arguments);
  const args=arguments,x0=Math.floor(Math.min(an.x,h.x))-26,y0=Math.floor(Math.min(an.y,h.y))-34,w=Math.abs(h.x-an.x)+52,hh=Math.abs(h.y-an.y)+48;let r;
  LUZ_vivo('yuyoT',x0,y0,w,hh,()=>{r=J3_tallo0.apply(this,args);});return r;};}
// cabezas: 16 direcciones (cada 22,5°), cada una dibujada UNA vez, pasada a píxel entero, limpiada (sin píxeles sueltos de
// 1 px en el borde) y guardada; después, contorno de tinta completo y borde de luz. En cada cuadro se usa la más cercana
// al ángulo real (la mordida y el escupitajo siguen usando el ángulo exacto: solo el dibujo se redondea). Así el borde no
// titila de un cuadro al otro.
const J3_CAB=new Map();
function J3_limpiar(src){
  const w=src.width,h=src.height,c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.drawImage(src,0,0);
  try{const d=g.getImageData(0,0,w,h),a=d.data,op=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&a[(y*w+x)*4+3]>0;
    for(let pasada=0;pasada<2;pasada++){const borrar=[];
      for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(!op(x,y))continue;const n=(op(x+1,y)?1:0)+(op(x-1,y)?1:0)+(op(x,y+1)?1:0)+(op(x,y-1)?1:0);if(n<=1)borrar.push((y*w+x)*4+3);}
      for(const i of borrar)a[i]=0;if(!borrar.length)break;}
    g.putImageData(d,0,0);}catch(e){}
  return c;
}
function J3_cabezaGuardada(orig,args,R){
  const[,,ang,open,k,fl,wl,glow,swell,flip]=args,paso=Math.PI/8,q=((Math.round(ang/paso)%16)+16)%16;
  const kk=Math.round((k||1)*10)/10,oo=Math.round((open||0)*4)/4,ww=Math.round((wl||0)*2)/2,ss=Math.round((swell||0)*2)/2;
  const brillo=glow?((T>>1)%2):'n',ojo=ww>0.5?'n':(T>>4)%2;
  const clave=[q,kk,oo,ww,ss,fl?1:0,brillo,ojo,flip?1:0].join('|');let c=J3_CAB.get(clave);
  if(!c){const on=LUZ.on;LUZ.on=false;let crudo;
    try{crudo=LUZ_capturar('yuyoC|'+clave,-R,-R,2*R,2*R,()=>orig(0,0,q*paso,oo,kk,fl,ww,glow,ss,flip));}finally{LUZ.on=on;}
    c=J3_limpiar(crudo);if(J3_CAB.size>700)J3_CAB.clear();J3_CAB.set(clave,c);}
  const lu=!fl&&LUZ.on&&typeof LUZ_luz==='function'&&LUZ_luz();return lu?LUZ_sprite(c,lu,{}):c;
}
if(typeof PL_drawHead==='function'){const J3_cabeza0=PL_drawHead;PL_drawHead=function(x,y,ang,open,k){
  if(typeof LUZ_capturar!=='function'||typeof LUZ==='undefined')return J3_cabeza0.apply(this,arguments);
  try{const R=Math.ceil(24*(k||1)*1.25),img=J3_cabezaGuardada(J3_cabeza0,arguments,R);ctx.drawImage(img,Math.round(x)-R,Math.round(y)-R);}
  catch(e){return J3_cabeza0.apply(this,arguments);}};}
// tallos cortados: en píxeles (3 px con tinta), con la punta clara que gotea. Se dibujan antes que el resto de la planta
// (detrás del bulbo); a la planta original se le pasan como 'wait' por un momento para que no los repita lisos.
function J3_cortado(b,h){
  const an=PL_anchor(b,h),cx=an.x,cy=h.y-4,n=Math.max(6,Math.round(Math.hypot(h.x-an.x,h.y-an.y)/1.5)),g=Math.max(2,Math.round(3*b.sc)),o=g>>1;
  const col=PL_mix('#3e6a24','#6a5a30',0.4);
  for(const tinta of[true,false]){ctx.fillStyle=tinta?J3_TINTA:col;
    for(let i=0;i<=n;i++){const u=i/n,v=1-u,x=Math.round(v*v*an.x+2*v*u*cx+u*u*h.x)-o,y=Math.round(v*v*an.y+2*v*u*cy+u*u*h.y)-o;
      if(tinta)ctx.fillRect(x-1,y-1,g+2,g+2);else ctx.fillRect(x,y,g,g);}}
  const X=Math.round(h.x),Y=Math.round(h.y);ctx.fillStyle=J3_TINTA;ctx.fillRect(X-2,Y-2,5,5);ctx.fillStyle='#d8f060';ctx.fillRect(X-1,Y-1,3,3);ctx.fillStyle='#f4ffb0';ctx.fillRect(X-1,Y-1,1,1);
  ctx.fillStyle='#9ad040';ctx.fillRect(X,Y+2+(J3_red()?0:(T>>3)%3),1,2);
}
if(typeof PL_drawPlanta==='function'){const J3_planta0=PL_drawPlanta;PL_drawPlanta=function(b){
  const cortadas=(b.heads||[]).filter(h=>h.mode==='cut');
  if(!cortadas.length)return J3_planta0.call(this,b);
  try{for(const h of cortadas)J3_cortado(b,h);}catch(e){}
  for(const h of cortadas)h.mode='wait';
  try{return J3_planta0.call(this,b);}finally{for(const h of cortadas)h.mode='cut';}
};}
// ---------- CHAPALEADOR ----------
if(typeof PL_drawHover==='function'){const J3_hover0=PL_drawHover;PL_drawHover=function(b){
  if(typeof LUZ_vivo!=='function')return J3_hover0.call(this,b);
  const X=Math.floor(b.x),Y=Math.floor(b.y);
  LUZ_vivo('chapaleador',X-70,Y-34,b.w+140,GROUND-Y+38,()=>J3_hover0.call(this,b));};}
