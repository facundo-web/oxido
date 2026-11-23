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
  const causa=CONS_en||(CONS_pr&&(CONS_pr.de||CONS_pr))||null;h0(n);
  if(vivo&&p.dead){p.causa=causa;CONS_ultima={causa,mision:levelIdx,jefe:bossRef&&!bossRef.gone?bossRef.name:null};}};}
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
