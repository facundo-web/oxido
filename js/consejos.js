'use strict';
// Óxido · Consejo al morir y una meta próxima en el final
// · Se anota qué le pegó al jugador (el enemigo que se está moviendo, o el dueño del proyectil): CONS_en / CONS_pr.
//   Al morir queda en p.causa. En la pantalla de fin, una línea corta con un consejo para ese jefe o enemigo.
// · Meta próxima (pantalla de fin de partida): una sola, la más cercana de cumplir de las que se pueden calcular con el
//   historial (récord, logros con progreso, el jefe donde caíste). Si no hay ninguna, no se muestra nada.
// Prefijo CONS_.
let CONS_en=null,CONS_pr=null;
// el que se está moviendo: lo que tire queda con su dueño
{const upd0=updEnemy;updEnemy=function(e){const np=eproj.length;CONS_en=e;try{upd0(e);}finally{CONS_en=null;}
  for(let i=np;i<eproj.length;i++)if(eproj[i]&&!eproj[i].de)eproj[i].de=e;};}
{const h0=hurtPlayer;hurtPlayer=function(n){const p=P,vivo=!p.dead;
  const causa=CONS_en||(CONS_pr&&(CONS_pr.de||CONS_pr))||null,bala=CONS_pr||null;
  const antes=p.hp*100+p.shield+(p.ride?p.ride.armor*1000:0);h0(n);
  if(p.hp*100+p.shield+(p.ride?p.ride.armor*1000:0)<antes)CONS_golpe(p,causa,bala); // recibió daño de verdad
  if(vivo&&p.dead){p.causa=causa;CONS_ultima={causa,mision:levelIdx,jefe:bossRef&&!bossRef.gone?bossRef.name:null,quien:CONS_quien(causa),foto:CONS_foto(causa)};}};}
// ---------- de dónde vino el golpe (prueba con personas: "no se entendió qué le sacó la vida") ----------
// borde rojo del lado del golpe (izquierda, derecha o arriba) y un destello con esquinas rojas en el que te pegó
let CONS_g=null;ON_START.push(()=>{CONS_g=null;});
function CONS_golpe(p,causa,bala){
  const o=p.ride||p,cx=o.x+(o.w||8)/2,cy=o.y+(o.h||18)/2,e=causa&&causa.x!=null&&causa.w?causa:null;
  let sx=null,sy=null;
  if(e&&!e.gone&&e.x+e.w>camX-20&&e.x<camX+VW+20){sx=e.x+e.w/2;sy=e.y+(e.h||16)/2;}
  else if(bala){sx=bala.x-(bala.vx||0)*12;sy=bala.y-(bala.vy||0)*12;} // la bala: de donde venía
  const lado=sx==null?0:(sy<cy-30&&Math.abs(sx-cx)<34)?2:sx<cx?-1:1;
  CONS_g={t:T,lado,e:e&&e!==p?e:null};
}
ON_DRAW.push(()=>{const g=CONS_g;if(!g||!g.e||g.e.gone||T-g.t>40)return;const e=g.e,k=1-(T-g.t)/40;
  const x0=Math.round(e.x)-3,y0=Math.round(e.y)-3,x1=Math.round(e.x+e.w)+3,y1=Math.round(e.y+(e.h||16))+3,L=4;
  if(typeof LUZ_halo==='function')LUZ_halo((x0+x1)/2,(y0+y1)/2,Math.max(10,(x1-x0)/2+6),'#ff3b30',0.55*k);
  ctx.globalAlpha=Math.min(1,k*1.4);ctx.fillStyle='#ff3b30';
  for(const[x,y,sx,sy]of[[x0,y0,1,1],[x1,y0,-1,1],[x0,y1,1,-1],[x1,y1,-1,-1]]){ctx.fillRect(sx>0?x:x-L+1,y,L,1);ctx.fillRect(x,sy>0?y:y-L+1,1,L);} // esquinas rojas
  ctx.globalAlpha=1;});
ON_HUD.push(()=>{const g=CONS_g;if(!g||g.lado===0||T-g.t>36||state!=='play')return;const k=1-(T-g.t)/36,w=10;
  for(let i=0;i<w;i++){ctx.fillStyle=`rgba(255,40,30,${(0.55*k*(1-i/w)).toFixed(3)})`;
    if(g.lado===-1)ctx.fillRect(i,0,1,HC);else if(g.lado===1)ctx.fillRect(W-1-i,0,1,HC);else ctx.fillRect(0,i,W,1);}});
// ---------- quién te ganó: nombre y un dibujo chico (para ¡CAÍSTE!) ----------
function CONS_quien(c){
  if(!c)return null;const Q=TX.caiste.quien||{};
  if(c.isBoss||c.mini||c.isVillain)return c.name||null;if(c.name&&!c.kind)return c.name;
  if(c.endo)return Q.endo||null;if(Q[c.type])return Q[c.type];if(c.kind&&Q[c.kind])return Q[c.kind];
  return null;}
// el dibujo del que te pegó, tal como estaba, en un lienzo chico (con su propia función de dibujo)
function CONS_foto(e){
  if(!e||e.x==null||!e.w)return null;const pad=6,w=Math.min(160,Math.ceil(e.w)+pad*2),h=Math.min(160,Math.ceil(e.h||16)+pad*2);
  const cvF=document.createElement('canvas');cvF.width=w;cvF.height=h;const g=cvF.getContext('2d');g.imageSmoothingEnabled=false;
  const c0=ctx;ctx=g;
  try{g.translate(Math.round(-e.x+pad+((w-pad*2)-e.w)/2),Math.round(-e.y+pad));
    if(e.draw)e.draw(e);else if(typeof isBoss==='function'&&isBoss(e))drawBossAny(e);else if(e.type==='drone')drawDrone(e);else if(e.type==='turret')drawTurret(e);else if(!e.kind)drawSoldier(e);else return null;}
  catch(err){return null;}finally{ctx=c0;}
  try{const d=g.getImageData(0,0,w,h).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>0)n++;if(n<12)return null;}catch(err){} // vacío: no se muestra
  return cvF;}
let CONS_ultima=null;
ON_START.push(()=>{if(!(typeof partida!=='undefined'&&partida))CONS_ultima=null;});

// ---------- consejos: uno por jefe chico, villano y enemigo especial; uno genérico por tipo ----------
const CONS_JEFE={
  'ESCARABAJO DE ÓXIDO':'El Escarabajo no sube al andamio de la izquierda: tirale desde ahí.',
  'DON BULÓN':'Cuando Don Bulón pisa fuerte, la onda corre por el piso: saltala.',
  'LIBÉLULA DE HIERRO':'Si la Libélula baja en pasada rasante, agachate.',
  'SARGENTO CENIZA':'Chorro alto: agachate. Chorro bajo: saltalo. No pises el fuego.',
  'CHAPALEADOR':'Si el Chapaleador acelera la hélice a un costado, viene la embestida: saltala.',
  'MADRE YUYO':'Cortale las cabezas a Madre Yuyo: sin ninguna, el bulbo se abre.',
  'CHACAL DE BRONCE':'El Chacal se agacha y gruñe antes de saltar: saltá las dos ondas.',
  'REY POLVO':'Tormenta: fila baja, saltá; fila alta, agachate.',
  'LECHUZA BLINDADA':'Cuando el foco se pone rojo, salí del círculo.',
  'DON NIEBLA':'La garra de Don Niebla cae donde tiembla: alejate y saltá la onda.',
  'MOSCARDÓN':'La línea de la mira avisa la ráfaga: salite de esa línea.',
  'PLACA MADRE':'Barrido bajo: saltá. Alto: agachate. Mirá los guiones ámbar.',
  'EL REMENDÓN':'El punto azul en el piso es el soplete: saltá la llama.',
  'LA MARAÑA':'No te quedes en las franjas naranjas: ahí cae el latigazo.',
  'TOPADOR':'Si el Topador rasca el piso y baja la cabeza, embiste: saltalo.',
  'PISATRUENO':'La línea roja en el piso avisa el pisotón: saltá la onda.',
  'LA LUMBRERA':'Cuando marca un círculo en el piso, salí: la araña cae ahí.',
  'EL CASERO':'Las franjas en el piso avisan el sillazo: salí de ahí.',
  'EL TATÚ CAVADOR':'Flecha en el piso: viene la embestida. Saltala o subite.',
  'EL CUSTODIO':'La sombra en el piso es el puño que cae: alejate y saltá la onda.'};
const CONS_TIPO={
  soldier:'Los soldados levantan el arma antes de tirar: agachate o saltá la bala.',
  grenadier:'La granada tarda en explotar: alejate de donde cae.',
  shield:'Al del escudo: granada por arriba o pegale por la espalda.',
  drone:'Los drones tiran desde arriba: mantené ↑ para apuntarles.',
  turret:'La torreta gira despacio: pasale por abajo del caño.',
  endoG:'El robot grande aguanta mucho: granadas y no te le pegues.',
  stalker:'Si ves un destello amarillo entre las hojas, el cazador va a tirar: el dardo es lento, movete.'};
// textos de textos.js (TX.consejos, Textos ficha 6): el jefe por su id (el de TX.jefes, buscado por el nombre que se ve);
// el enemigo por su type. Las tablas de arriba quedan de reserva si falta una clave.
const CONS_jefeId=n=>{try{return Object.keys(TX.jefes).find(k=>TX.jefes[k].nombre===n)||null;}catch(e){return null;}};
const CONS_deJefe=n=>{const id=CONS_jefeId(n);try{if(id&&TX.consejos.jefes[id])return TX.consejos.jefes[id];}catch(e){}return CONS_JEFE[n]||null;};
const CONS_deTipo=t=>{try{if(TX.consejos.general[t])return TX.consejos.general[t];}catch(e){}return CONS_TIPO[t]||null;};
function consejo(){
  const u=CONS_ultima;if(!u)return null;const c=u.causa;
  if(c&&c.isBoss){const s=CONS_deJefe(c.name);if(s)return s;}
  if(u.jefe&&!c){const s=CONS_deJefe(u.jefe);if(s)return s;}
  if(c){if(c.endo)return CONS_deTipo('endo')||'Los robots de chatarra aguantan más: mantené el fuego.';
    const s=CONS_deTipo(c.type);if(s)return s;
    if(c.kind==='egren')return CONS_deTipo('grenadier');if(c.kind==='bomb')return CONS_deTipo('drone');if(c.kind==='bullet')return CONS_deTipo('soldier');}
  return CONS_deTipo('piso')||'Mirá el piso: las marcas y las sombras avisan antes de que pase algo.';
}

// ---------- meta próxima ----------
// candidatas: récord (cuánto falta), logros con progreso (lo que falta), el jefe donde caíste. Gana la más cercana.
function metaProxima(){
  const c=[];
  const rec=typeof tituloRecord==='function'?tituloRecord():record;
  const M=TX.consejos.metas; // textos.js (Textos ficha 7)
  if(rec>0&&score<rec){const f=rec-score;c.push({k:f/rec,s:tx(M.record,{n:f})});}
  if(typeof HIST!=='undefined'&&HIST&&HIST.totals&&typeof HIST_LOGROS!=='undefined'){
    for(const a of HIST_LOGROS){if(HIST.logros[a.id]||!a.prog)continue;
      try{const[cur,m]=a.prog(HIST.totals);const f=m-cur;if(!(f>0&&m>0))continue;
        // nombre, qué hacer y la unidad [una, varias] salen de TX.logros.lista[id] (sin adivinar la unidad desde el texto)
        const L=TX.logros&&TX.logros.lista&&TX.logros.lista[a.id],nom=L?L[0]:a.n,que=(L?L[1]:a.d).replace(/\.$/,''),uni=L&&L[2]||['',''];
        c.push({k:f/m,s:tx(f===1?M.logro1:M.logro,{nombre:nom,que,n:f,unidad:f===1?uni[0]:uni[1]})});}catch(e){}}}
  const u=CONS_ultima;if(u&&u.jefe)c.push({k:0.15,s:tx(M.ganale,{donde:u.jefe})});
  // engranajes dorados (arpon.js): solo si ya encontró alguno (si no, todavía no sabe que existen)
  if(typeof ENG_meta==='function'&&ENG_total()>0){const m=ENG_meta();if(m)c.push({k:m.faltan/10,s:tx(m.faltan===1?M.engranaje1:M.engranajes,{n:m.faltan,premio:m.premio==='TUERCA'?M.premioTuerca:tx(M.premioOtro,{premio:m.premio})})});}
  if(!c.length)return null;c.sort((a,b)=>a.k-b.k);return c[0].s;
}
