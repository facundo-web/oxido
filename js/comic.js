'use strict';
// Óxido · Capa de efectos (antes: lenguaje de CÓMIC impreso)
// 23 nov: a Facu no le gustó la capa de cómic. Apagados por pedido de Dirección de Arte: la trama de puntos
// (COMIC_trama no dibuja nada), el color corrido y las onomatopeyas (COMIC.efecto ignora los tipos 'corrido' y
// 'onomato', vengan de donde vengan), la animación "de a dos" y la página de historieta del jefe (pagina.js ya no se
// carga: vuelve el cartel simple de dibujito.js). Siguen las líneas de velocidad. El registro queda para efectos nuevos.
// Reparto: el DIBUJITO manda en el MOVIMIENTO (rebote, remolino, mareo, pop de los globos); el CÓMIC en el COLOR y los
// IMPACTOS. Solo lo general del cómic impreso (tramas de puntos, color corrido de imprenta, onomatopeyas, líneas de
// velocidad, viñetas): nada de personajes, máscaras, logos ni efectos de alguna película en particular.
//
// Para sumar un efecto nuevo: COMIC.registrar(nombre, {tipo, dur, crear(o), upd(e), draw(e), capa}) y dispararlo con
// COMIC.efecto(nombre, {x, y, ...}). Capas: 'mundo' (debajo del jugador y las balas: se dibuja en ON_DRAW) y
// 'pantalla' (sobre el mundo, debajo del HUD: COMIC_post, la llama renderMain). Tipos con tope:
//   'onomato' → como mucho 2 a la vez (la nueva reemplaza a la más vieja)
//   'corrido' → uno solo a la vez (si hay uno, el nuevo no entra)
// Los efectos que hay están en ARCHIVOS.md, tabla "Efectos de cómic".
const COMIC=(()=>{
  const tipos={},vivos=[];
  const TOPE={onomato:2,corrido:1};
  function registrar(n,d){tipos[n]={dur:30,capa:'mundo',...d};}
  function efecto(n,o={}){
    const d=tipos[n];if(!d||state!=='play')return null;
    if(d.tipo==='corrido'||d.tipo==='onomato')return null; // apagados (23 nov)
    const mismos=vivos.filter(e=>e.d.tipo&&e.d.tipo===d.tipo);
    if(d.tipo==='corrido'&&mismos.length)return null;                       // el color corrido no se superpone
    if(d.tipo==='corrido'&&(MOV_reducido()||!FL_puede()))return null;      // es un destello de pantalla: no en movimiento reducido, ≤ 3/s
    if(d.tipo&&TOPE[d.tipo]&&mismos.length>=TOPE[d.tipo])vivos.splice(vivos.indexOf(mismos[0]),1); // sale la más vieja
    const e={n,d,t:0,dur:o.dur||d.dur,...o};if(d.crear)d.crear(e);vivos.push(e);return e;
  }
  function paso(){for(const e of vivos){e.t++;if(e.d.upd)e.d.upd(e);}for(let i=vivos.length;i--;)if(vivos[i].t>=vivos[i].dur||vivos[i].fin)vivos.splice(i,1);}
  function dibujar(capa){for(const e of vivos)if(e.d.capa===capa&&e.d.draw)e.d.draw(e);}
  const hay=n=>vivos.some(e=>e.n===n);
  return{registrar,efecto,paso,dibujar,hay,vivos,limpiar:()=>{vivos.length=0;}};
})();
ON_START.push(()=>COMIC.limpiar());
ON_STEP.push(()=>COMIC.paso());
ON_DRAW.push(()=>COMIC.dibujar('mundo'));
const COMIC_liviano=()=>typeof DIB_LIVIANO_==='function'&&DIB_LIVIANO_();

// ---------- 1. trama de puntos en las sombras del fondo ----------
// Un patrón chico precalculado (un punto cada 3 unidades, en filas corridas) que se pinta en modo "overlay" sobre la
// mitad de abajo del fondo, donde están los edificios y montañas oscuras: oscurece más las sombras que lo claro.
// Lo llama renderMain después del fondo y antes del mundo (balas y enemigos quedan siempre por encima).
const COMIC_PUNTOS=(()=>{const c=document.createElement('canvas');c.width=c.height=6;const g=c.getContext('2d');
  g.fillStyle='#1a0e1e';g.fillRect(1,1,1,1);g.fillRect(4,4,1,1);return c;})();
let COMIC_patron=null;
function COMIC_trama(){
  return; // apagada (23 nov): clima.js se cuelga de esta función, por eso sigue existiendo
  if(!COMIC_patron)COMIC_patron=ctx.createPattern(COMIC_PUNTOS,'repeat');
  const y0=Math.max(camY,GROUND-VH*0.62),k=COMIC_liviano()?0.14:0.26;
  ctx.save();ctx.globalCompositeOperation='overlay';ctx.globalAlpha=k;ctx.fillStyle=COMIC_patron;
  ctx.translate(0,0);ctx.fillRect(0,y0,W,GROUND-y0);ctx.restore();
}
// ---------- 2. color corrido de imprenta ----------
// En explosiones grandes, golpes al jugador y la muerte de un jefe: unos cuadros el color se separa (rojo para un lado,
// cian para el otro). Se hace copiando la pantalla a un lienzo aparte, teñido, y sumándolo corrido.
let COMIC_copia=null;
function COMIC_corrido(k){
  const w=cv.width,h=cv.height;
  if(!COMIC_copia||COMIC_copia.width!==w||COMIC_copia.height!==h){COMIC_copia=document.createElement('canvas');COMIC_copia.width=w;COMIC_copia.height=h;}
  const g=COMIC_copia.getContext('2d'),u=Math.max(1,Math.round(S*0.8*k));
  for(const[col,dx]of[['#ff2a2a',-u],['#2ae0ff',u]]){
    g.globalCompositeOperation='copy';g.drawImage(cv,0,0);
    g.globalCompositeOperation='multiply';g.fillStyle=col;g.fillRect(0,0,w,h);
    ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=0.32*k;ctx.drawImage(COMIC_copia,dx,0);ctx.restore();
  }
}
COMIC.registrar('corrido',{tipo:'corrido',capa:'pantalla',dur:8,draw:e=>COMIC_corrido(1-e.t/e.dur)});

// ---------- 3. onomatopeyas ----------
// Con la fuente pixel de los globos (globos.js), a escala 2, con borde y sombra, inclinadas; entran con un pop y se van.
// Se corren para arriba si tapan al jugador. Van en la capa del mundo: el jugador y las balas quedan por encima.
const COMIC_ONO={pum:{s:'¡PUM!',col:'#ffd25a'},crash:{s:'¡CRASH!',col:'#ffb04a'},zas:{s:'¡ZAS!',col:'#ffffff'},boom:{s:'¡BOOM!',col:'#ff6a4a',esc:2.2}};
for(const n in COMIC_ONO){const o=COMIC_ONO[n];
  COMIC.registrar(n,{tipo:'onomato',dur:o.esc?50:34,
    crear:e=>{e.ang=(Math.random()<0.5?-1:1)*rand(0.1,0.18);e.esc=e.escala||o.esc||1.5; // escala: se puede pedir más chica
      // arriba del impacto; si tapa a un jugador, un enemigo, un número que flota u otra onomatopeya, sube hasta que no
      const w=pfW(o.s)*e.esc+4,h=6*e.esc+4;e.y-=10;
      const cajas=()=>{const r=[];for(const p of players)if(!p.dead){const b=hurtbox(p);r.push([b.x,b.y,b.w,b.h]);}
        for(const en of enemies)if(!en.gone&&onScreen(en,0))r.push([en.x,en.y,en.w,en.h]);
        for(const pa of parts)if(pa.k==='txt'){const tw=pfW(pa.s)+2;r.push([pa.x-tw/2,pa.y-18,tw,27]);} // los números suben: se reserva su camino
        for(const o2 of COMIC.vivos)if(o2!==e&&o2.d.tipo==='onomato'&&o2.w!==undefined)r.push([o2.x-o2.w/2,o2.y-o2.h/2,o2.w,o2.h]);return r;};
      const rs=cajas();
      for(let k=0;k<8;k++){const c=rs.find(([x,y,bw,bh])=>e.x+w/2>x&&e.x-w/2<x+bw&&e.y+h/2>y&&e.y-h/2<y+bh);if(!c)break;e.y=c[1]-h/2-2;}
      e.x=clamp(e.x,camX+w/2+2,camX+VW-w/2-2);e.y=Math.max(e.y,camY+28/ZOOM+h/2);e.w=w;e.h=h;},
    draw:e=>{const k=e.t<3?1.3*e.t/3:e.t<6?1.3-0.3*(e.t-3)/3:e.t>e.dur-6?Math.max(0,(e.dur-e.t)/6):1;if(k<=0.02)return;
      const w=pfW(o.s),c1=pfLienzo(o.s,'#120c18'),c2=pfLienzo(o.s,o.col,'#120c18');
      ctx.save();ctx.translate(Math.round(e.x),Math.round(e.y));ctx.rotate(e.ang);ctx.scale(e.esc*k,e.esc*k);
      ctx.drawImage(c1,-w/2+1,-3+1);ctx.drawImage(c1,-w/2-1+1,-3-1+1);ctx.drawImage(c2,-w/2-1,-3-1);ctx.restore();}});}

// ---------- 4. líneas de velocidad ----------
// En el mundo: detrás del gato cuando corre a atacar y de la CHATARRA con el jetpack. En pantalla: al abrir la rueda de
// armas (líneas hacia el centro) y en la persecución de la roca de la misión 10.
function COMIC_lineas(x,y,dir,n,largo,col){ctx.strokeStyle=col;ctx.lineWidth=0.8;
  for(let i=0;i<n;i++){const yy=y+(hash(i*13+(T>>1))-0.5)*12,l=largo*(0.5+hash(i*7+T)*0.6),x0=x-dir*(4+hash(i*3+(T>>2))*6);
    ctx.beginPath();ctx.moveTo(x0,yy);ctx.lineTo(x0-dir*l,yy);ctx.stroke();}}
ON_DRAW.push(()=>{
  if(state!=='play')return;
  if(typeof gato!=='undefined'&&gato&&gato.st==='dash')COMIC_lineas(gato.x+6,gato.y+5,Math.sign(gato.vx)||gato.face||1,5,14,'rgba(255,255,255,0.7)');
  for(const m of mechs)if(m.ride&&m.jet){ctx.strokeStyle='rgba(255,255,255,0.65)';ctx.lineWidth=0.8;
    for(let i=0;i<5;i++){const x=m.x+3+hash(i*11+(T>>1))*(m.w-6),l=10+hash(i*5+T)*10;ctx.beginPath();ctx.moveTo(x,m.y+m.h+2);ctx.lineTo(x,m.y+m.h+2+l);ctx.stroke();}}
});
function COMIC_lineasPantalla(){
  if(typeof MOV_reducido==='function'&&MOV_reducido())return; // movimiento reducido: sin líneas de velocidad de pantalla
  const u=cv.width/W,cw=cv.width,ch=cv.height;
  // rueda de armas: los primeros cuadros, líneas que van hacia el centro
  const ru=typeof RU!=='undefined'&&RU.find(r=>r.open&&r.o<1);
  if(ru){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.strokeStyle=`rgba(255,250,230,${0.5*(1-ru.o)})`;ctx.lineWidth=Math.max(1,u*0.5);
    for(let i=0;i<22;i++){const a=i/22*Math.PI*2+hash(i)*0.2,r0=Math.max(cw,ch)*0.75,r1=r0*(0.55+hash(i*9)*0.15);
      ctx.beginPath();ctx.moveTo(cw/2+Math.cos(a)*r0,ch/2+Math.sin(a)*r0);ctx.lineTo(cw/2+Math.cos(a)*r1,ch/2+Math.sin(a)*r1);ctx.stroke();}ctx.restore();}
  // persecución de la roca (misión 10): rayas horizontales en los bordes
  if(L&&L.chase&&L.chase.on){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.strokeStyle='rgba(255,240,210,0.28)';ctx.lineWidth=Math.max(1,u*0.5);
    for(let i=0;i<10;i++){const y=(hash(i*17+(T>>1))*0.8+0.1)*ch,l=cw*(0.12+hash(i*5+T)*0.12),x=((T*u*6+i*cw*0.37)%(cw+l))-l;
      if(y>ch*0.3&&y<ch*0.7)continue;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+l,y);ctx.stroke();}ctx.restore();}
}

// ---------- 5. animación "de a dos" ----------
// Solo en momentos especiales (la entrada de un jefe y la fusión de la CHATARRA): el dibujo se actualiza cada 2 cuadros,
// así se siente dibujado a mano. El juego sigue a 60 por dentro; renderMain se saltea uno de cada dos.
function COMIC_deADos(){
  return false; // apagada (23 nov)
  if(state!=='play'||(typeof MOV_reducido==='function'&&MOV_reducido()))return false; // movimiento reducido: sin "de a dos"
  // con la página de historieta (pagina.js) el juego está quieto y T no cambia: si T quedó impar, render() no dibujaría
  // nada en toda la página. La página ya anima "de a dos" por su cuenta (v.t&~1).
  if(typeof VIN_activo==='function'&&VIN_activo())return false;
  if(bossRef&&!bossRef.dying&&bossRef.state&&bossRef.state!=='fight'&&bossRef.state!=='dying')return true;
  return mechs.some(m=>m.ride&&m.fus>0);
}

// ---------- 6. viñeta de jefe ----------
// Cuando entra un jefe: 1,5 s en los que la pantalla se arma como una página de cómic (papel con trama alrededor, un
// recuadro con borde grueso donde está el jefe) y después el recuadro se abre a pantalla completa. El nombre va en el
// cartel de jefe de dibujito.js, que con esto se dibuja como un recuadro de texto de cómic.
let COMIC_jefeRef=null;
COMIC.registrar('vineta',{capa:'pantalla',dur:90,draw:e=>{
  const b=e.ref;if(!b||b.gone)return;
  const k=e.t<60?0:(e.t-60)/30,ab=k*k*(3-2*k); // 0 = recuadro, 1 = pantalla completa
  // el recuadro: centrado en el jefe (que ya se ve), con papel alrededor. La franja de arriba del HUD queda sin papel.
  const top=26,bx=clamp(HX(b.x+b.w/2),W*0.3,W*0.7),by=clamp(HY(b.y+b.h/2),top+30,HC-30);
  const hw=Math.max(70,HX(b.x+b.w)-HX(b.x)+40),hh=Math.max(52,HY(b.y+b.h)-HY(b.y)+30);
  const px=Math.max(8,bx-hw),qx=Math.min(W-8,bx+hw),py=Math.max(top+4,by-hh),qy=Math.min(HC-8,by+hh);
  const x0=px*(1-ab),y0=py+(top-py)*ab,x1=qx+(W-qx)*ab,y1=qy+(HC-qy)*ab;
  ctx.save();ctx.setTransform(S,0,0,S,0,0);
  // papel con trama alrededor del recuadro (no en la franja del HUD de arriba)
  ctx.beginPath();ctx.rect(0,top,W,HC-top);ctx.rect(x0,y0,x1-x0,y1-y0);ctx.clip('evenodd');
  ctx.fillStyle='#f3e6c4';ctx.fillRect(0,top,W,HC-top);
  ctx.fillStyle='#e0563a';for(let y=top;y<HC;y+=4)for(let x=(y>>2)%2*2;x<W;x+=4)ctx.fillRect(x+1,y+1,1.2,1.2);
  ctx.restore();
  ctx.save();ctx.setTransform(S,0,0,S,0,0);ctx.strokeStyle='#120c18';ctx.lineWidth=3;ctx.strokeRect(x0+1.5,y0+1.5,x1-x0-3,y1-y0-3);ctx.restore();
}});
// (desde la página de historieta de pagina.js, la viñeta de zoom ya no sale: queda registrada por si se quiere volver)
// lo que va en la capa de pantalla, sobre el mundo y debajo del HUD (renderMain)
function COMIC_post(){COMIC_lineasPantalla();COMIC.dibujar('pantalla');if(typeof VIN_dibujar==='function')VIN_dibujar();} // y la página de jefe (pagina.js)

// ---------- disparadores ----------
{const blast0=blast;blast=function(x,y,r,d,bm){const n=blast0(x,y,r,d,bm);
  if(killSrc==='grenade')COMIC.efecto('pum',{x,y:y-r*0.6});
  if(r>=26)COMIC.efecto('corrido');return n;};}
{const crate0=dmgCrate;dmgCrate=function(c,n){const antes=c.gone;crate0(c,n);if(!antes&&c.gone)COMIC.efecto('crash',{x:c.x+c.w/2,y:c.y-6});};}
{const kill0=kill;kill=function(e){const jefe=isBoss(e)&&!e.gone&&e.state!=='dying';kill0(e);
  if(jefe){COMIC.efecto('boom',{x:e.x+e.w/2,y:e.y+e.h*0.3});COMIC.efecto('corrido',{dur:14});}};}
{const hurt0=hurtPlayer;hurtPlayer=function(n){const p=P,hp=p.hp;hurt0(n);if(p.hp<hp)COMIC.efecto('corrido',{dur:6});};}
// el remolino del gato (remolino.js): ¡ZAS! al empezar a arañar
{let antes=null;ON_STEP.push(()=>{const g=typeof gato!=='undefined'?gato:null;const st=g?g.st:null;
  if(st==='scratch'&&antes!=='scratch')COMIC.efecto('zas',{x:g.x+6,y:g.y-10,escala:1});antes=st;});} // ¡ZAS! más chico que los de golpe
