'use strict';
// Óxido · M10 en estilo "Hondo" (notas/arte/guia.md). Va después de arte-jefes-m7.js, antes de juego.js.
// · EL TATÚ CAVADOR (jefe chico): capturado en píxeles con contorno y borde de luz, conservando los avisos transparentes.
// · EL CUSTODIO (villano final): capturado en píxeles con contorno y borde de luz (sin medios píxeles; los brillos
//   transparentes quedan). La "fase de oro" va en ORO VIEJO MATE (#7a5a24 / #a88438 / #4a3414, sin brillos de 1 px) y
//   el DIENTE DORADO brillante va en el corazón: en la fase de oro, sobre la gema del pecho; en la furia, en el centro del
//   núcleo que flota, con un halo grande que late. Se separa por brillo: es lo único que brilla.
// Usa J6A_conColores (arte-jefes-m6.js) y LUZ_vivo (arte-luz.js). Prefijo J10A_.
const J10A_red=()=>typeof MOV_reducido==='function'&&MOV_reducido();
const J10A_COBRE={'#b88a3a':'#7a5a24','#e8c060':'#a88438','#7a5a22':'#4a3414','#e8b84a':'#a88438','#ffd23a':'#ffb060'}; // oro viejo mate (Dirección de Arte)
const J10A_DIENTE=['.#.#.','#####','##.##','#####','.#.#.'];
function J10A_diente(x,y,fuerte){
  x=Math.round(x);y=Math.round(y);
  ctx.fillStyle='#120c18';J10A_DIENTE.forEach((r,j)=>{for(let i=0;i<5;i++)if(r[i]==='#')ctx.fillRect(x+i-1,y+j-1,3,3);});
  J10A_DIENTE.forEach((r,j)=>{for(let i=0;i<5;i++)if(r[i]==='#'){ctx.fillStyle=i+j<=2?'#fff0b0':i+j>=6?'#7a5a1a':'#d8a83a';ctx.fillRect(x+i,y+j,1,1);}});
  ctx.fillStyle='#3a2a10';ctx.fillRect(x+2,y+2,1,1);
  if(typeof LUZ_halo==='function'){const lat=J10A_red()?0.42:0.34+0.16*Math.sin(T/20);LUZ_halo(x+2.5,y+2.5,fuerte?16:13,'#ffd860',lat*(fuerte?1.15:1));} // halo grande que late: es lo único que brilla
}
const J10A_colores=fn=>typeof J6A_conColores==='function'?J6A_conColores(J10A_COBRE,{},fn):fn();
// EL TASADOR maneja el TATÚ (arte-tasador.js): el saqueador genérico de la cabina y el que escapa se saltean (solo sus
// rectángulos de esos colores) y en su lugar va EL TASADOR, adentro de la captura (así lleva contorno y borde de luz)
const J10A_SAQUEADOR={'#c89a70':1,'#b02a20':1,'#4a3a28':1,'#2a2a30':1,'#7ad8ff':1,'#ffd27a':1};
function J10A_sinSaqueador(dib){
  const fr0=ctx.fillRect;ctx.fillRect=function(){if(J10A_SAQUEADOR[String(ctx.fillStyle).toLowerCase()])return;return fr0.apply(ctx,arguments);};
  try{return dib();}finally{ctx.fillRect=fr0;}
}
function J10A_tasador(b){
  if(typeof TAS_dibujar!=='function'||b.y>=GROUND)return;
  if(b.mode==='bajo'||b.mode==='asomaT'||(b.state==='enter'&&b.t<56))return;
  if(b.state!=='dying'||b.t<60){ // asoma de la cabina
    ctx.save();ctx.translate(Math.round(b.x+b.w/2),Math.round(b.y+b.h));if(b.tilt)ctx.rotate(b.tilt);if(b.face<0)ctx.scale(-1,1);
    TAS_dibujar(1,-26,{pose:'cabina',cara:1});ctx.restore();}
  else{const k=b.t-60,x=b.x+b.w/2-k*2.2,y=GROUND-10-Math.max(0,12-Math.abs(k-6)*2);TAS_dibujar(x+2,y+10,{pose:'corre',cara:-1,t:k});} // salta y corre al templo
}
if(typeof J10_drawTatu==='function'&&typeof LUZ_vivo==='function'){const J10A_tatu0=J10_drawTatu;J10_drawTatu=function(b){
  LUZ_vivo('tatu',Math.floor(b.A)-8,GROUND-90,W+16,98,()=>{
    if(typeof TAS_dibujar!=='function')return J10A_tatu0.call(this,b);
    const r=J10A_sinSaqueador(()=>J10A_tatu0.call(this,b));try{J10A_tasador(b);}catch(e){}return r;},{umbral:'suave'});
};}
if(typeof J10_drawCust==='function'&&typeof LUZ_vivo==='function'){const J10A_cust0=J10_drawCust;J10_drawCust=function(b){
  LUZ_vivo('custodio',Math.floor(b.A)-8,0,W+16,GROUND+10,()=>J10A_colores(()=>J10A_cust0.call(this,b)),{umbral:'suave'});
  try{
    if(b.state==='enter'||b.flash>0&&(T>>1)%2)return;
    const ph=b.phase,dy=b.state==='dying',gold=ph>=1&&!(b.state==='trans'&&ph===1&&b.t<40);
    if(dy&&b.t>150)return;
    if(ph===2||(b.state==='trans'&&ph===2&&b.t>=40)){J10A_diente(b.core.x-2.5,b.core.y-2.5,true);return;} // furia: en el núcleo
    if(gold){const g=J10_gemPos(b);J10A_diente(g.x-2.5,g.y-2.5,false);} // fase de oro: en el corazón del pecho
  }catch(e){}
};}
// el núcleo de la furia: sin el brillo crema (el que brilla es el diente)
if(typeof J10_drawCore==='function'&&typeof J6A_conColores==='function'){const J10A_core0=J10_drawCore;J10_drawCore=function(){const a=arguments;
  return J6A_conColores({'#fff3c0':'#a88438'},{},()=>J10A_core0.apply(this,a));};}
