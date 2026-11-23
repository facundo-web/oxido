'use strict';
// Óxido · Economía de armas: las armas las dan los rescatados, la munición la sueltan los enemigos
// (Segundo programador. Va después de rescate.js, cumplida.js y fin.js, antes de juego.js.)
//
// 1 · ARMAS: solo te las da un prisionero al liberarlo (con su munición). Ya no salen de cajas, enemigos ni jefes.
// 2 · CAJAS: dan munición (de un arma que tengas), granadas, corazones o puntos. Ni armas, ni escudo, ni avión.
// 3 · ENEMIGOS: sueltan munición. Solo se junta la de un arma que tengas: la de un arma que no tenés se ve apagada con
//     un candado gris y no se junta; si la tocás, sale un globo "NECESITÁS LA ESCOPETA".
// 4 · RESCATADOS: cada uno da algo DISTINTO en la misión, sin repetir: arma, aliado, corazón, granadas, avión gratis y
//     escudo (si hay más prisioneros, más armas distintas; si no quedan, puntos). Lo que da se ve en un íconito dentro
//     del globo ¡AYUDA! antes de liberarlo. Al liberarlo, se lo da directo al que pasó (vuela al HUD como siempre).
// El primero de la izquierda siempre da el arma: así nadie se queda mucho con la pistola sola.
//
// Ganchos (todos envolviendo funciones globales; no cambia ningún archivo existente):
//   dmgCrate / kill / bossDone  marcan de dónde salió cada premio (k.ea: 'caja' | 'enemigo' | 'jefe')
//   collect                     convierte, bloquea la munición ajena y resuelve 'M' (munición) y '$' (puntos)
//   drawPickup                  dibuja 'M', '$' y la munición con candado
//   freePris                    da el premio del rescatado (va encima del gesto de rescate.js)
//   drawPrisoner + globo        el íconito dentro del ¡AYUDA!
//   ON_START                    reparte los premios de los prisioneros de la misión
// Lo lee el bot: EA (contadores de la misión). window.EA_OFF = true juega como antes (para comparar).
// Prefijo EA_.

// ---------- números para ajustar (si el bot no gana: se toca la munición, no el daño) ----------
const EA_MUN={heavy:60,shotgun:8,flame:54,rocket:5};   // munición que suelta un enemigo (igual que armados.js)
const EA_CAJA={heavy:100,shotgun:12,flame:90,rocket:8}; // munición que da una caja (la mitad de una caja de arma de antes)
const EA_PROB_SOLDADO=0.14;  // un soldado común suelta munición (además de los armados, que siempre sueltan la suya)
const EA_PROB_TUYA=0.65;     // de esas, cuántas son de un arma que alguien tiene
const EA_PUNTOS_CAJA=250,EA_PUNTOS_SOBRA=1000;
const EA_ON=()=>!window.EA_OFF;
// contadores de la misión (los lee el bot)
const EA={armas:0,mun:0,bloqueos:0,cajas:{},premios:[]};
ON_START.push(()=>{EA.armas=0;EA.mun=0;EA.bloqueos=0;EA.cajas={};EA.premios=[];});

const EA_LETRA={heavy:'H',shotgun:'S',flame:'F',rocket:'R'};
// armas que pueden aparecer en la misión (como los soldados armados: en la 1, ametralladora y escopeta; desde la 2,
// lanzamisiles; desde la 3, todas)
function EA_pool(){return typeof ARM_pool==='function'?ARM_pool():['heavy','shotgun','flame','rocket'];}
const EA_tiene=(p,w)=>!!(p&&p.weapons&&p.weapons[w]>0);
const EA_alguien=w=>players.some(p=>!p.dead&&!p.out&&EA_tiene(p,w));
const EA_suyas=p=>WORDER.filter(w=>EA_LETRA[w]&&EA_tiene(p,w)); // solo las 4 armas con munición de caja (ni pistola ni arpón)
const EA_NOMBRE={heavy:'LA AMETRALLADORA',shotgun:'LA ESCOPETA',flame:'EL LANZALLAMAS',rocket:'EL LANZAMISILES'};

// ================== de dónde sale cada premio ==================
// lo que se suma a pickups mientras corre fn queda marcado con su origen
function EA_marcar(origen,fn,self,args){const n0=pickups.length;try{return fn.apply(self,args);}
  finally{for(let i=n0;i<pickups.length;i++){const k=pickups[i];if(k&&k.ea===undefined)k.ea=origen;}}}
{const dc0=dmgCrate;dmgCrate=function(...a){return EA_marcar('caja',dc0,this,a);};}
{const k0=kill;kill=function(e,...a){
  const n0=pickups.length,r=EA_marcar(isBoss(e)?'jefe':'enemigo',k0,this,[e,...a]);
  // un soldado común (sin arma) a veces suelta munición; los armados ya sueltan la suya (armados.js)
  if(EA_ON()&&!isBoss(e)&&!e.arma&&e.gone&&state==='play'&&(e.type==='soldier'||e.type==='grenadier'||e.type==='shield')
     &&pickups.length===n0&&Math.random()<EA_PROB_SOLDADO){
    const pool=EA_pool(),mias=pool.filter(EA_alguien),w=mias.length&&Math.random()<EA_PROB_TUYA?pick(mias):pick(pool);
    EA_soltarMun(w,e.x+e.w/2-5,Math.min(e.y+4,GROUND-12));}
  return r;};}
{const bd0=bossDone;bossDone=function(...a){return EA_marcar('jefe',bd0,this,a);};}
// una cajita de munición en el piso, como las de los soldados armados (armados.js)
function EA_soltarMun(w,x,y){
  let n=pickups.filter(k=>!k.gone).length;const tope=typeof ARM_TOPE==='number'?ARM_TOPE:7;
  while(n>=tope){const k=pickups.find(o=>o.mun&&!o.gone);if(!k)return;k.gone=true;if(typeof ARM_poof==='function')ARM_poof(k);n--;}
  pickups.push({kind:EA_LETRA[w],arma:w,mun:1,amt:EA_MUN[w],x,y,w:10,h:10,vy:-2.4,life:typeof ARM_VIDA==='number'?ARM_VIDA:450,
    ph:(Math.random()*60)|0,ea:'enemigo',eaOk:1,draw:EA_dibMun});
}

// ================== conversión ==================
// k.ea: 'caja' | 'enemigo' | 'jefe' | 'rescate'. Una vez convertido queda k.eaOk.
function EA_convertir(k){
  if(!k||k.eaOk||!EA_ON())return;k.eaOk=1;
  if(k.ea==='rescate')return;
  const w=DROPMAP[k.kind];
  if(k.mun){k.draw=EA_dibMun;return;}            // munición de un soldado armado: igual, pero con candado si no la tenés
  if(k.ea==='caja'||k.ea==='jefe'){
    if(w)k.kind='M';                            // un arma en la caja: munición de un arma que tengas (o granadas o puntos)
    else if(k.kind==='E')k.kind='C';            // el escudo ahora lo dan los rescatados
    else if(k.kind==='A')k.kind='$';            // el avión gratis, también
    EA.cajas[k.kind]=(EA.cajas[k.kind]||0)+1;return;}
  // enemigos y todo lo demás que suelte un arma: munición de esa arma
  if(w){k.arma=w;k.mun=1;k.amt=EA_MUN[w];k.life=Math.min(k.life||450,typeof ARM_VIDA==='number'?ARM_VIDA:450);k.ph=(Math.random()*60)|0;k.draw=EA_dibMun;return;}
  if(k.kind==='E')k.kind='C';
  else if(k.kind==='A')k.kind='$';
}
ON_STEP.push(()=>{for(const k of pickups)EA_convertir(k);});
{const dp0=drawPickup;drawPickup=function(k){EA_convertir(k);
  if(k.kind==='M'||k.kind==='$'){if(k.life<150&&(T>>2)%2)return;EA_dibPremio(k);return;}
  return dp0(k);};}

// ================== juntar ==================
let EA_glT=new WeakMap(); // cuándo salió el último globo de "NECESITÁS…" para cada cajita
ON_START.push(()=>{EA_glT=new WeakMap();});
{const c0=collect;collect=function(kind,x,y,k){
  if(!EA_ON()||!k)return c0(kind,x,y,k);
  EA_convertir(k);kind=k.kind;
  // munición de un arma que no tenés: no se junta (si el otro jugador la tiene y la está tocando, se la lleva él)
  if(k.mun&&k.arma&&!EA_tiene(P,k.arma)){
    k.gone=false;
    const otro=players.find(p=>p!==P&&!p.dead&&!p.out&&EA_tiene(p,k.arma)&&overlap(hurtbox(p),k));
    if(otro){k.gone=true;withP(otro,()=>c0(k.kind,x,y,k));EA.mun++;return;}
    EA_necesitas(k);return;}
  if(k.mun){EA.mun++;return c0(kind,x,y,k);}
  if(kind==='M'){
    // la munición de la caja va al arma que tenés en la mano (o a otra tuya); sin armas, puntos
    const mias=EA_suyas(P),w=mias.includes(P.weapon)?P.weapon:mias.length?pick(mias):null;
    if(!w){EA_puntos(x,y,EA_PUNTOS_CAJA,'SIN ARMAS');return;}
    k.kind=EA_LETRA[w];k.arma=w;k.mun=1;k.amt=EA_CAJA[w];EA.mun++;return c0(k.kind,x,y,k);}
  if(kind==='$'){EA_puntos(x,y,EA_PUNTOS_CAJA);return;}
  return c0(kind,x,y,k);};}
// puntos sueltos: el pop de siempre y la chapita
function EA_puntos(x,y,n,pre){
  SFX.pick();addScore(n,x+5,y);if(typeof RC_soltar==='function')RC_soltar(n,x+5,y+5,3);
  parts.push({k:'flash',x:x+5,y:y+5,life:3,maxl:3,size:5});parts.push({k:'ring',x:x+5,y:y+5,r:3,max:12,life:10,maxl:10,col:'255,240,180'});
  setBanner((pre?pre+' · ':'')+'+'+n+' PUNTOS',40);
}
// el globo de "NECESITÁS LA ESCOPETA": sale al tocarla, una vez cada ~1,5 s por cajita
function EA_necesitas(k){
  const t=EA_glT.get(k);if(t!==undefined&&T-t<90)return;EA_glT.set(k,T);EA.bloqueos++;
  const o=P.ride||P;parts.push({k:'txt',g:'habla',s:'NECESITÁS '+EA_NOMBRE[k.arma],x:o.x+(o.w||8)/2,y:o.y-2,life:70,maxl:70});
  try{tone('square',220,160,0.08,0.03);}catch(e){}
  k.sacude=8;
}

// ================== dibujo ==================
// munición: la de siempre (armados.js) o, si nadie tiene esa arma, apagada con un candado gris
function EA_dibMun(k){
  if(!EA_ON()||EA_alguien(k.arma)){if(typeof ARM_dibMun==='function')ARM_dibMun(k);return;}
  if(k.life<150&&(k.life<60?(T>>1)%2:(T>>2)%2))return;
  const sx=k.sacude>0?((k.sacude--)%2?1:-1):0;
  ctx.save();ctx.globalAlpha=0.38;if(sx)ctx.translate(sx,0);if(typeof ARM_dibMun==='function')ARM_dibMun({...k,life:999,ph:0});ctx.restore();
  // candado gris arriba de la caja
  const x=Math.round(k.x)+sx,y=Math.round(k.y)+(k.vy===0?Math.round(Math.sin((T+(k.ph||0))/9)):0);
  ctx.fillStyle='#120c18';ctx.fillRect(x+2,y-2,7,7);
  ctx.fillStyle='#9aa0a8';ctx.fillRect(x+3,y+1,5,3);ctx.fillStyle='#6a707a';ctx.fillRect(x+3,y+3,5,1);
  ctx.fillStyle='#120c18';ctx.fillRect(x+5,y+2,1,1);
  ctx.strokeStyle='#9aa0a8';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+4.5,y+1);ctx.lineTo(x+4.5,y-0.5);ctx.lineTo(x+6.5,y-0.5);ctx.lineTo(x+6.5,y+1);ctx.stroke();
}
// 'M' munición de caja (cajón con balas) y '$' puntos (tres tuercas de óxido)
function EA_dibPremio(k){
  const bob=k.vy===0?Math.sin(T/8):0,x=Math.round(k.x),y=Math.round(k.y+bob);
  ctx.fillStyle='#120c18';ctx.fillRect(x-0.5,y-0.5,11,11);
  if(k.kind==='M'){
    ctx.fillStyle='#4d5a34';ctx.fillRect(x,y+3,10,7);ctx.fillStyle='#6a7444';ctx.fillRect(x,y+3,10,1);ctx.fillStyle='#3a4428';ctx.fillRect(x,y+9,10,1);
    for(let i=0;i<4;i++){ctx.fillStyle='#e8c25a';ctx.fillRect(x+1+i*2.4,y,1.6,3);ctx.fillStyle='#b8862a';ctx.fillRect(x+1+i*2.4,y+2,1.6,1);}
    ctx.fillStyle='#ffe08a';ctx.fillRect(x+4,y+5,2,3);ctx.fillRect(x+3,y+6,4,1);
  }else{
    ctx.fillStyle='#3a2a20';ctx.fillRect(x,y,10,10);
    for(const[cx,cy]of[[3,6.5],[7,6.5],[5,3]]){ctx.fillStyle='#120c18';circle(x+cx,y+cy,2.6);ctx.fillStyle='#d9a43a';circle(x+cx,y+cy,2);ctx.fillStyle='#3a2a20';circle(x+cx,y+cy,0.8);}
    if((T>>3)%2){ctx.fillStyle='#fff';ctx.fillRect(x+8,y+1,1,1);}
  }
}

// ================== premios de los prisioneros ==================
// ids: 'arma' (con pr.eaArma), 'aliado', 'corazon', 'granadas', 'avion', 'escudo', 'puntos'
const EA_ORDEN=['aliado','corazon','granadas','avion','escudo'];
function EA_repartir(){
  if(!EA_ON())return;
  const lista=prisoners.filter(pr=>pr.state==='tied').sort((a,b)=>a.x-b.x);if(!lista.length)return;
  const p1=players[0],pool=EA_pool(),nuevas=pool.filter(w=>!EA_tiene(p1,w));
  const armas=[...(nuevas.length?nvMezclarEA(nuevas):[]),...nvMezclarEA(pool.filter(w=>!nuevas.includes(w)))];
  const amigos=typeof MAX_ALLIES==='number'?allies.length<MAX_ALLIES:true;
  const resto=nvMezclarEA(EA_ORDEN.filter(id=>id!=='aliado'||amigos));
  const premios=['arma',...resto];
  // más prisioneros que premios: más armas distintas; si no quedan, puntos
  while(premios.length<lista.length)premios.push(premios.filter(p=>p==='arma').length<armas.length?'arma':'puntos');
  let ia=0;
  lista.forEach((pr,i)=>{const id=premios[i];pr.ea=id;if(id==='arma')pr.eaArma=armas[ia++]||pick(pool);
    pr.kind=id==='aliado'?'ally':'item';});
  EA.premios=lista.map(pr=>pr.ea==='arma'?'arma:'+pr.eaArma:pr.ea);
}
function nvMezclarEA(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
ON_START.push(()=>{EA_repartir();});
// al liberarlo: rescate.js hace el gesto y aliados.js suelta un premio al azar. Acá se saca ese premio y se le da el suyo
// directo al que pasó por delante (vuela al HUD con recolectar.js, como cualquier premio).
{const fp0=freePris;freePris=function(pr){
  if(!EA_ON()||pr.state!=='tied'||!pr.ea)return fp0(pr);
  if(pr.ea==='aliado'&&typeof MAX_ALLIES==='number'&&allies.length+prisoners.filter(o=>o.join&&o.state==='freed').length>=MAX_ALLIES)pr.ea='puntos';
  pr.kind=pr.ea==='aliado'?'ally':'item';
  const n0=pickups.length;fp0(pr);
  if(pr.ea==='aliado'&&pr.join)return;
  pickups.splice(n0); // el premio al azar de aliados.js
  const quien=nearestPlayer(pr.x+5,pr.y+7)||P,x=pr.x,y=pr.y-4;
  withP(quien,()=>EA_dar(pr,x,y));};}
function EA_dar(pr,x,y){
  const id=pr.ea,k={x,y,w:10,h:10,ea:'rescate',eaOk:1,eco:1};
  switch(id){
  case 'arma':{const w=pr.eaArma||'heavy';k.kind=EA_LETRA[w];EA.armas++;collect(k.kind,x,y,k);break;} // collect la pone en la mano
  case 'corazon':k.kind='C';collect('C',x,y,k);break;
  case 'granadas':k.kind='G';collect('G',x,y,k);break;
  case 'avion':k.kind='A';collect('A',x,y,k);break;
  case 'escudo':k.kind='E';collect('E',x,y,k);break;
  case 'aliado': // no entró (ya hay 2 amigos): puntos
  default:EA_puntos(x,y,EA_PUNTOS_SOBRA,'¡GRACIAS!');}
}

// ---------- el íconito dentro del globo ¡AYUDA! ----------
let EA_prDib=null;
{const dpr0=drawPrisoner;drawPrisoner=function(pr){EA_prDib=pr;try{return dpr0(pr);}finally{EA_prDib=null;}};}
const EA_GLOBO='¡AYUDA!',EA_GLOBO_ICO='¡AYUDA!    ';
{const g0=globo;globo=function(s,ax,ay,o){
  const pr=EA_prDib;
  if(!pr||s!==EA_GLOBO||!pr.ea||!EA_ON())return g0(s,ax,ay,o);
  const n=GL_rects.length;g0(EA_GLOBO_ICO,ax,ay,o);const r=GL_rects[n];if(!r)return;
  const t=o&&o.t!==undefined?o.t:99,sc=glEscala(t,o&&o.dur||0);if(sc<0.98)return; // durante el pop, sin ícono
  EA_icono(pr,r.x+3+pfW(EA_GLOBO)+3,r.y+2);};}
// íconos de 5 filas (k tinta, el resto colores); cada uno entra en el lugar de tres espacios del globo
const EA_ICO={
  gun:['..kkkkkkkk','kkcccccccc','kcccdkkkkk','kcdk......','kkk.......'],
  aliado:['.kkk.','kGGGk','kffek','.kfk.','.kkk.'],
  corazon:['kk.kk','krkrk','krrrk','.krk.','..k..'],
  granadas:['.kkk.','kGHGk','kGGGk','kGGGk','.kkk.'],
  avion:['kk..........','kPk..kkkk...','kPPkkPPPPkkk','kpppppppppck','.kkkkpppkkk.','.....kkk....'],
  escudo:['kkkkk','kbcbk','kbbbk','.kbk.','..k..'],
  puntos:['.kkk.','kyyyk','kykyk','kyyyk','.kkk.']};
const EA_ICOPAL={k:'#120c18',G:'#4f8a3a',H:'#8fd65a',f:'#efb88d',e:'#1a1a1a',r:'#e8343a',P:'#5d6e40',p:'#3d4a2c',b:'#7ab8ff',c:'#cfeeff',y:'#e8c25a'};
const EA_GUNCOL={heavy:['#6a7444','#3b3f2a'],shotgun:['#8a5a30','#5a3a20'],flame:['#e06a3a','#8a2a14'],rocket:['#5a7aaa','#2a3a5a']};
function EA_icono(pr,x,y){
  const id=pr.ea==='arma'?'gun':pr.ea,map=EA_ICO[id]||EA_ICO.puntos;
  const pal=id==='gun'?{...EA_ICOPAL,c:EA_GUNCOL[pr.eaArma||'heavy'][0],d:EA_GUNCOL[pr.eaArma||'heavy'][1]}:EA_ICOPAL;
  const ox=Math.round(x+(11-map[0].length)/2),oy=Math.round(y+(map.length>5?-0.5:0));
  for(let j=0;j<map.length;j++)for(let i=0;i<map[j].length;i++){const ch=map[j][i];if(ch==='.')continue;ctx.fillStyle=pal[ch]||'#fff';ctx.fillRect(ox+i,oy+j,1,1);}
}
