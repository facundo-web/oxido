'use strict';
// Óxido · M8 en estilo "Hondo" (notas/arte/guia.md). Va después de arte-jefes-m4.js, antes de juego.js.
// · TOPADOR (jefe chico): capturado en píxeles con contorno y borde de luz, conservando los avisos transparentes.
// · PISATRUENO (villano): el gigante capturado en píxeles con contorno y borde de luz (sin medios píxeles; los brillos y
//   avisos transparentes quedan). El DIENTE DORADO va en la frente del cráneo y sigue la cabeza (cuello, mordida,
//   rugido, inclinación). El núcleo amarillo de la fase 2 pasa a naranja claro y el ojo verde lima pierde el halo (su
//   brillo queda en 1 px): el diente es lo único dorado y lo más brillante de la cabeza.
// Usa J6A_conColores (arte-jefes-m6.js) y LUZ_vivo (arte-luz.js). Prefijo J8A_.
const J8A_red=()=>typeof MOV_reducido==='function'&&MOV_reducido();
const J8A_COL={'#ffd060':'#ffb070','rgba(232,255,90,0.3)':'rgba(0,0,0,0)','#e8ff5a':'#8ab03a'}; // y el ojo sin el halo verde: el brillo queda en 1 px
const J8A_DIENTE=['.#.#.','#####','##.##','#####','.#.#.'];
function J8A_diente(x,y){
  x=Math.round(x);y=Math.round(y);
  ctx.fillStyle='#120c18';J8A_DIENTE.forEach((r,j)=>{for(let i=0;i<5;i++)if(r[i]==='#')ctx.fillRect(x+i-1,y+j-1,3,3);});
  J8A_DIENTE.forEach((r,j)=>{for(let i=0;i<5;i++)if(r[i]==='#'){ctx.fillStyle=i+j<=2?'#fff0b0':i+j>=6?'#7a5a1a':'#d8a83a';ctx.fillRect(x+i,y+j,1,1);}});
  ctx.fillStyle='#3a2a10';ctx.fillRect(x+2,y+2,1,1);
  if(typeof LUZ_halo==='function'){const lat=J8A_red()?0.36:0.3+0.1*Math.sin(T/40);LUZ_halo(x+2.5,y+2.5,9,'#ffd860',lat);}
}
const J8A_col=fn=>typeof J6A_conColores==='function'?J6A_conColores(J8A_COL,{},fn):fn();
if(typeof J8_drawTop==='function'&&typeof LUZ_vivo==='function'){const J8A_top0=J8_drawTop;J8_drawTop=function(b){
  LUZ_vivo('topador',Math.floor(b.A)-8,GROUND-110,W+16,118,()=>J8A_top0.call(this,b),{umbral:'suave'});
};}
// la frente del cráneo en el mundo: misma cadena de transformaciones que M8_drawGigante (mision8.js)
function J8A_frente(g){
  const h=M8_gigHead(g),hu=h.u,hy=h.y-GROUND,ha=g.head>0?g.head*0.35:g.head*0.4;
  let x=5,y=-8;{const c=Math.cos(ha),s=Math.sin(ha);[x,y]=[x*c-y*s+hu,x*s+y*c+hy];}
  if(g.tilt){const c=Math.cos(g.tilt),s=Math.sin(g.tilt);[x,y]=[x*c-y*s,x*s+y*c];}
  return{x:g.x+(g.face<0?-x:x),y:GROUND+(g.sink||0)+y};
}
if(typeof J8_drawPisa==='function'&&typeof LUZ_vivo==='function'){const J8A_pisa0=J8_drawPisa;J8_drawPisa=function(b){
  LUZ_vivo('pisatrueno',Math.floor(b.A)-110,0,W+220,GROUND+10,()=>J8A_col(()=>J8A_pisa0.call(this,b)),{umbral:'suave'});
  try{
    if(b.state==='enter'&&b.t<20)return;if(b.flash>0&&(T>>1)%2)return;if(b.state==='dying'&&b.t>120)return;
    const p=J8A_frente(b.g);J8A_diente(p.x-2.5,p.y-2.5); // en la frente
  }catch(e){}
};}
