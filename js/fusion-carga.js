'use strict';
// Óxido · Fusión cargada
// (Segundo programador. Va después de fusion.js y arte-vehiculos.js; con los otros archivos nuevos, antes de juego.js.)
//
// Antes, la fusión pasaba sola al tocar con el vehículo a otro estacionado (fusion.js). Ahora se CARGA:
//   · te parás delante del otro vehículo (mirándolo, a menos de ~10 px) y MANTENÉS ↓;
//     con DISPARO ALTERNADO: tocás ↓ para empezar y otra vez para cancelar.
//   · se llena un círculo de ~2 s arriba del vehículo. Mientras tanto no podés disparar (ni ametralladora ni cañón) y te
//     pueden pegar; los aliados y el otro jugador sí disparan.
//   · si soltás ↓, te bajás, te alejás o te rompen el vehículo, se corta (el círculo se vacía rápido).
//   · al completarse: destello, "¡FUSIÓN!" grande de cómic, la animación "de a dos" de fusion.js/comic.js (sin golpes ni
//     sacudida con MOVIMIENTO REDUCIDO) y el vehículo pasa al nivel siguiente, con el arte de arte-vehiculos.js.
// Con CONTROLES SIMPLES es igual: ↓ mantenido (dos toques rápidos de ↓ siguen siendo "bajarse").
// Ganchos: envuelve FU_fusionar (fusion.js: solo deja fusionar cuando se completa la carga), updMech, mechFire,
// mechCannon y ejectMech; dibuja en ON_DRAW (círculo y aviso) y ON_HUD (destello). window.FC_OFF = como antes.
// Prefijo FC_.
const FC_T=120;            // cuadros de carga (~2 s)
const FC_DIST=10;          // cuánto puede haber entre los dos vehículos
let FC_ok=false,FC_destello=0;
const FC_ON=()=>!window.FC_OFF;
const FC_alternado=()=>typeof ACC!=='undefined'&&ACC.disparo==='alternado';
// fusion.js fusiona al tocarse: ahora solo cuando la carga se completa
{const f0=FU_fusionar;FU_fusionar=function(m,o){if(FC_ON()&&!FC_ok)return;FC_ok=false;
  f0(m,o);FC_efecto(m);};}
// el otro vehículo al que mira, estacionado y a tiro de fusión (o null)
function FC_otro(m){
  if(!m||(m.lvl||1)>=3)return null;let best=null,bd=1e9;
  for(const o of mechs){if(o===m||o.ride||o.dying||o.gone)continue;
    const dx=(o.x+o.w/2)-(m.x+m.w/2),gap=Math.abs(dx)-(m.w+o.w)/2;
    if(gap>FC_DIST||Math.abs((o.y+o.h)-(m.y+m.h))>14)continue;
    if(gap>-4&&Math.sign(dx)!==m.face)continue; // de espaldas no (salvo que estén encimados)
    if(gap<bd){bd=gap;best=o;}}
  return best;
}
// ---------- la carga ----------
{const u0=updMech;updMech=function(m){
  if(!FC_ON())return u0(m);
  const o=FC_otro(m),D=held('down');
  if(FC_alternado()){if(tapped('down'))m.fcOn=!m.fcOn;if(!o)m.fcOn=false;}
  const quiere=FC_alternado()?!!m.fcOn:D;
  const cargando=!!(o&&quiere&&m.onGround&&!m.fus&&!m.dying);
  if(cargando){
    if(m.fcO!==o){m.fcO=o;m.fc=0;}
    m.fc=(m.fc||0)+1;
    m.fireCd=Math.max(m.fireCd,2);m.canCd=Math.max(m.canCd,2); // no dispara mientras carga
    if(m.fc%10===1)tone('square',220+m.fc*6,240+m.fc*6,0.05,0.025);
    if(m.fc%4===0){const ax=m.x+m.w/2,bx=o.x+o.w/2,k=Math.random();parts.push({k:'p',x:ax+(bx-ax)*k,y:Math.min(m.y,o.y)+8+rand(-4,4),vx:rand(-0.3,0.3),vy:rand(-0.8,-0.2),g:0,life:12,maxl:12,size:1,col:k<0.5?'#9ad0ff':'#fff6c8'});}
  }else if(m.fc>0){m.fc=Math.max(0,m.fc-4);if(!o)m.fcO=null;if(m.fc===0)m.fcOn=false;}
  u0(m);
  if(cargando&&m.fc>=FC_T&&m.ride&&!m.dying&&!o.gone&&!o.ride){m.fc=0;m.fcOn=false;m.fcO=null;FC_ok=true;FU_fusionar(m,o);FC_ok=false;}
};}
// mientras carga no tira (por si algún otro archivo dispara directo)
{const f0=mechFire;mechFire=function(m){if(FC_ON()&&m&&m.fc>0&&m.fcO)return;return f0(m);};}
{const c0=mechCannon;mechCannon=function(m){if(FC_ON()&&m&&m.fc>0&&m.fcO)return;return c0(m);};}
// bajarse (o que lo rompan) corta la carga
{const e0=ejectMech;ejectMech=function(m,broken){if(m){m.fc=0;m.fcOn=false;m.fcO=null;}return e0(m,broken);};}
// ---------- la fusión: destello, ¡FUSIÓN! y sin golpes con movimiento reducido ----------
COMIC.registrar('fusion',{tipo:'onomato',dur:60,
  crear:e=>{e.ang=-0.08;},
  draw:e=>{const red=typeof MOV_reducido==='function'&&MOV_reducido(),s='¡FUSIÓN!',w=pfW(s);
    let k=red?Math.min(1,e.t/8):e.t<4?1.5*e.t/4:e.t<8?1.5-0.5*(e.t-4)/4:1;if(e.t>e.dur-10)k*=Math.max(0,(e.dur-e.t)/10);if(k<=0.02)return;
    ctx.save();ctx.translate(Math.round(e.x),Math.round(e.y-(red?0:e.t*0.15)));if(!red)ctx.rotate(e.ang);ctx.scale(2*k,2*k);
    ctx.drawImage(pfLienzo(s,'#ffd25a','#120c18'),-w/2-1,-4);ctx.restore();}});
function FC_efecto(m){
  const red=typeof MOV_reducido==='function'&&MOV_reducido();
  if(red){shake=0;kickX=0;kickY=0;} // sin golpes ni sacudida
  if(typeof FL_puede!=='function'||FL_puede())FC_destello=10;
  COMIC.efecto('fusion',{x:m.x+m.w/2,y:m.y-12});
  for(let i=0;i<(red?6:16);i++){const a=i/(red?6:16)*Math.PI*2;parts.push({k:'p',x:m.x+m.w/2,y:m.y+m.h/2,vx:Math.cos(a)*(red?0.6:1.8),vy:Math.sin(a)*(red?0.6:1.8),g:0,life:20,maxl:20,size:1.5,col:i%2?'#ffd25a':'#9ad0ff'});}
  if(!red)parts.push({k:'ring',x:m.x+m.w/2,y:m.y+m.h/2,r:4,max:34,life:16,maxl:16,col:'255,240,180'});
}
ON_STEP.push(()=>{if(FC_destello>0)FC_destello--;if(typeof MOV_reducido==='function'&&MOV_reducido()&&mechs.some(m=>m.ride&&m.fus>0)){shake=0;kickX=0;kickY=0;}});
ON_START.push(()=>{FC_destello=0;FC_ok=false;});
ON_HUD.push(()=>{if(FC_destello<=0)return;const k=(typeof FL_k==='function'?FL_k():1)*FC_destello/10;
  ctx.fillStyle=`rgba(255,250,225,${(0.6*k).toFixed(3)})`;cubrir();});
// ---------- dibujo: el círculo que se llena y el aviso ----------
ON_DRAW.push(()=>{
  if(!FC_ON()||state!=='play')return;
  for(const m of mechs){if(!m.ride||m.dying||m.fus)continue;
    const o=FC_otro(m),cx=m.x+m.w/2,cy=m.y-17;
    if(m.fc>0&&m.fcO){
      const f=Math.min(1,m.fc/FC_T),r=5;
      ctx.fillStyle='#120c18';circle(cx,cy,r+1.5);ctx.fillStyle='#3a2a40';circle(cx,cy,r);
      ctx.fillStyle=f>=0.98||(f>0.8&&(T>>2)%2)?'#fff6c8':'#ffd25a';ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,-Math.PI/2,-Math.PI/2+f*Math.PI*2);ctx.closePath();ctx.fill();
      ctx.fillStyle='#120c18';circle(cx,cy,1.6);
      // la línea entre los dos vehículos
      const ox=m.fcO.x+m.fcO.w/2;ctx.fillStyle=`rgba(154,208,255,${(0.35+0.35*f).toFixed(2)})`;
      for(let x=Math.min(cx,ox);x<Math.max(cx,ox);x+=3)ctx.fillRect(q(x),q(m.y+10+Math.sin((x+T)/3)),1.5,1);
    }else if(o){
      const s=FC_alternado()?'TOCÁ ↓ PARA FUSIONAR':'MANTENÉ ↓ PARA FUSIONAR';
      txt(s,cx,cy-3+Math.sin(T/8),5,'#9ad0ff','center');
    }
  }
});
