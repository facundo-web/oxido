'use strict';
// Óxido · Mundos y dificultad que crece
// Las 10 misiones van en mundos: 1 (misiones 1–3), 2 (4–6), 3 (7–9) y el final (10). Cada mundo suma COMPORTAMIENTO,
// no solo números (en soldados, granaderos y escudos; los drones y las torretas no cambian):
//   Mundo 1: tiran derecho y avisan mucho antes (apuntan un 35 % más de tiempo). La misión 1 sigue siendo la que enseña:
//            con esto queda igual o más fácil, nunca más difícil.
//   Mundo 2: ráfagas de 3 tiros, apuntan arriba si estás en una plataforma, y la mitad se esconde detrás de la cobertura
//            más cercana (las coberturas frenan las balas).
//   Mundo 3: te rodean (un tercio entra por la izquierda), saltan más entre plataformas y atacan en grupo (cuando uno
//            apunta, los que estaban por tirar tiran con él).
//   Final:   todo junto.
// Además, por misión: vida ×(1 + 4 % por misión) y cadencia ×(1 − 2,5 % por misión), multiplicado con la dificultad.
// Guardianes: el villano de las misiones 3, 6 y 9 es el guardián de su mundo: más grande, 50 % más de vida, tres fases
// (en cada una se apura y llama refuerzos) y al vencerlo se abre el mundo siguiente.
// Prefijo MU_.
const mundoDe=i=>i<3?1:i<6?2:i<9?3:4;
const MU_NOMBRE=['','MUNDO 1','MUNDO 2','MUNDO 3','FINAL'];
const MU_GUARDIAN={2:1,5:2,8:3}; // índice de misión → mundo que cuida
const MU_COMUNES={soldier:1,grenadier:1,shield:1};
const MU_vida=()=>1+0.04*levelIdx,MU_cad=()=>1-0.025*levelIdx;
const MU_tiene=(n)=>{const m=mundoDe(levelIdx);return m===n||m===4;};

// ---------- al aparecer: vida por misión, cobertura (mundo 2) y por la izquierda (mundo 3) ----------
{const spawn0=spawn;spawn=function(it){
  const n=enemies.length;const r=spawn0(it);
  for(let i=n;i<enemies.length;i++){const e=enemies[i];if(!e||isBoss(e))continue;
    if(levelIdx>0&&e.hp)e.hp=Math.round(e.hp*MU_vida()*10)/10;
    if(!MU_COMUNES[e.type])continue;
    if(MU_tiene(2)&&e.type!=='grenadier'&&Math.random()<0.5){const c=MU_cobertura(e);if(c)e.cubre=c;}
    if(MU_tiene(3)&&e.type!=='shield'&&Math.random()<0.33&&!it.y&&typeof it.x!=='number'){e.x=camX-12;e.face=1;e.flanco=true;}
    if(MU_tiene(3))e.saltarin=true;}
  return r;};}
// la cobertura más cercana delante del soldado (entre él y donde viene el jugador)
function MU_cobertura(e){
  let best=null,bd=130;for(const c of (L.covers||[])){if(c.hp===0&&c.k!=='bollard')continue;const d=Math.abs(c.x-e.x);if(d<bd&&c.x+c.w<e.x+40){bd=d;best=c;}}
  return best;
}
// ---------- en cada cuadro ----------
{const upd0=updEnemy;updEnemy=function(e){
  if(!MU_COMUNES[e.type]||isBoss(e))return upd0(e);
  const cd0=e.cd,st0=e.state,np=eproj.length,m=mundoDe(levelIdx),p=P;
  // mundo 2: se queda detrás de su cobertura (se acerca hasta ahí y no más)
  if(e.cubre&&!e.cubre.gone&&p){const lado=p.x<e.cubre.x?1:-1,meta=lado>0?e.cubre.x+e.cubre.w+2:e.cubre.x-e.w-2;e.range=Math.max(30,Math.abs(p.x+4-(meta+e.w/2)));}
  upd0(e);
  // cadencia por misión
  if(levelIdx>0&&e.cd>cd0+1)e.cd=cd0+(e.cd-cd0)*MU_cad();
  // empezó a apuntar
  if(e.state==='aim'&&st0!=='aim'){
    if(m===1)e.t=Math.round(e.t*1.35);                                            // avisa más
    if(MU_tiene(3))for(const o of enemies)if(o!==e&&MU_COMUNES[o.type]&&o.state==='walk'&&o.cd<45&&onScreen(o,-6))o.cd=Math.min(o.cd,3+Math.random()*6); // en grupo
  }
  // tiros nuevos de este soldado
  if(eproj.length>np&&p)for(let i=np;i<eproj.length;i++){const b=eproj[i];if(b.kind!=='bullet')continue;
    if(m===1)b.vy=0;                                                                 // derecho
    else{const dy=(p.y+(p.crouch?11:8))-b.y,tt=Math.max(1,Math.abs(p.x+4-b.x)/Math.abs(b.vx||2));b.vy=clamp(dy/tt,-1.8,0.9);} // apunta arriba
    if(MU_tiene(2)&&!b.rafaga&&e.type==='soldier'&&!e.arma){e.rafaga=2;e.rafT=7;}}
  // ráfaga: dos tiros más, separados
  if(e.molesto>0)e.rafaga=0; // el gato lo está molestando (gatito.js): la ráfaga se corta, como todo lo que tira
  if(e.rafaga>0&&--e.rafT<=0&&!e.gone&&p&&!p.dead){e.rafaga--;e.rafT=7;const ex=e.x+e.w/2,sx=ex+e.face*8,sy=e.y+9,dy=(p.y+(p.crouch?11:8))-sy,tt=Math.max(1,Math.abs(p.x+4-sx)/2.1);
    eproj.push({kind:'bullet',x:sx,y:sy,vx:e.face*2.1,vy:clamp(dy/tt,-1.8,0.9),g:0,r:1.6,t:0,rafaga:true});SFX.eshoot();parts.push({k:'flash',x:sx,y:sy,life:3,maxl:3,size:2.5});e.rec=1;}
  // mundo 3: saltan más seguido
  if(e.saltarin&&e.jcd>24)e.jcd=24;
};}

// ---------- guardianes de mundo ----------
{const sb0=spawnBoss;spawnBoss=function(A){
  const v=sb0(A),mu=MU_GUARDIAN[levelIdx];if(!mu)return v;
  v.guardian=mu;v.max=Math.round(v.max*1.5);v.hp=Math.min(v.max,Math.round(v.hp*1.5));v.fase=1;
  // más grande (el dibujo, desde los pies; la caja de golpe es la de siempre)
  if(v.draw){const d0=v.draw;v.draw=function(e){const fx=e.x+e.w/2,fy=e.y+e.h;ctx.save();ctx.translate(fx,fy);ctx.scale(1.15,1.15);ctx.translate(-fx,-fy);
    try{d0(e);}finally{ctx.restore();}
    if(e.fase>1&&e.state!=='dying'){ctx.fillStyle=e.fase===3?'rgba(255,70,40,0.18)':'rgba(255,200,60,0.14)';circle(fx,e.y+e.h/2,Math.max(e.w,e.h)*0.75);}};}
  // tres fases: a 2/3 y a 1/3 de la vida se apura y llama refuerzos
  if(v.upd){const u0=v.upd;v.upd=function(e){u0(e);if(e.state==='dying'||e.gone)return;
    // la vida arranca vacía y se llena en la entrada: las fases cuentan recién cuando pelea con la barra llena
    if(e.state!=='fight')return;if(!e.lleno){if(e.hp>=e.max*0.95)e.lleno=true;else return;}
    const k=e.hp/e.max,f=k>0.66?1:k>0.33?2:3;
    if(f>e.fase){e.fase=f;setBanner('¡FASE '+f+'!',70);shake=Math.max(shake,6);SFX.alarm();
      for(const lado of[-1,1])spawn({t:f===3?'shield':'soldier',x:lado<0?camX+6:camX+VW-14});
      if(typeof COMIC!=='undefined')COMIC.efecto('corrido',{dur:10});}
    if((e.fase===2&&T%3===0)||(e.fase===3&&T%2===0))u0(e);};}
  return v;};}
// al vencer al guardián se abre el mundo siguiente
// (finishWin está en juego.js, que carga después: se engancha en PC_misionGanada de partida.js, que finishWin llama)
{const pg0=PC_misionGanada;PC_misionGanada=function(...a){const r=pg0(...a),g=MU_GUARDIAN[levelIdx];
  if(g&&!(typeof MC!=='undefined'&&MC))toast( /* con la placa de cumplida.js, lo dice la placa */tx(TX.cumplida.mundoAbierto,{mundo:MU_NOMBRE[g+1]}),tx(TX.cumplida.mundoAbiertoSub,{mundo:MU_NOMBRE[g].toLowerCase()}),'#ffe066');return r;};}
