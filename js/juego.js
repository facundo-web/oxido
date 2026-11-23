'use strict';
// Óxido · Estado, misión, cámara, arenas, bucle principal y render
// ================== estado ==================
let state='title',T=0,camX=0,shake=0,score=0,lives=2,kills=0,timeF=0,record=+(store.get('oxido-record')||0),newRecord=false,stats=null,charIdx=0,selT=0,lightning=0;
let P=null,players=[],p2Ci=2,enemies=[],pbul=[],eproj=[],grens=[],parts=[],pickups=[],crates=[],spawnQ=[],mechs=[],airBombs=[],air=null;
let prisoners=[],allies=[],rescued=0,prisHint=false;
const MAX_ALLIES=2;
let MUNDO_tf=null,quitArm=0,levelEvents=[],evIdx=0,arenaIdx=0,lock=null,banner=null,goT=0,bossRef=null,winT=0,overT=0,toasts=[],killsBy={};
const CH=()=>CHARS[charIdx];
// ON_START, ON_STEP, ON_DRAW, ON_HUD: ganchos declarados en base.js (así gatito.js y otros pueden sumarse antes de juego.js)
// dificultad: se elige en la pantalla de personaje
const DIFFS=[{name:'FÁCIL',desc:'4 vidas · enemigos disparan menos',lives:4,maxLives:7,fire:1.5,ehp:0.75},
  {name:'NORMAL',desc:'2 vidas',lives:2,maxLives:5,fire:1,ehp:1},
  {name:'DIFÍCIL',desc:'1 vida · enemigos más duros',lives:1,maxLives:2,fire:0.75,ehp:1.35}];
let difficulty=clamp(+(store.get('oxido-dificultad')??1)||0,0,2);
// desde la vuelta 2 (partida.js) la misma dificultad con más vida y cadencia enemiga
const DIFF=()=>vuelta>1?difVuelta():DIFFS[difficulty];
// suma una vida respetando el tope de la dificultad; si ya está al tope, da puntos. Devuelve true si sumó.
function gainLife(){if(lives<DIFF().maxLives){lives++;if(typeof ECO!=='undefined')ECO.vidas++;return true;}score+=1000;return false;}
function startLevel(i,carry){
  // con carry, cada jugador sigue con sus armas, granadas, escudo y corazones (el que quedó afuera vuelve nuevo)
  if(P&&P.mhp!==undefined)P.mhp=maxHp;
  const old=carry?players.slice():[];
  const keepOf=p=>p&&!p.out?{weapons:{...p.weapons},weapon:p.weapon,bombs:p.bombs,shield:p.shield,hp:Math.max(1,p.hp)}:null;
  levelIdx=i;L=LEVELS[i];platforms=L.platforms;LEVEL_END=L.end;
  const nAllies=carry?allies.length:0;
  if(!carry){score=0;lives=DIFF().lives;kills=0;killsBy={soldier:0,grenadier:0,shield:0,drone:0,turret:0};fireMul=1;dmgMul=1;maxHp=CH().hp;medals=0;flares=0;shieldRegen=false;rescued=0;}
  prisoners=L.prisoners.map(mkPris);allies=[];for(let i=0;i<nAllies;i++)allies.push(mkAlly(20-i*14,GROUND-18));
  timeF=0;T=0;camX=0;shake=0;newRecord=false;stats=null;lightning=0;
  enemies=L.turrets.map(x=>mkTurret(x));pbul=[];eproj=[];grens=[];parts=[];pickups=[];spawnQ=[];airBombs=[];air=null;toasts=[];
  crates=L.crates.map(c=>({...c,y:GROUND-14,w:14,h:14,hp:3,flash:0}));
  mechs=L.mechs.map(x=>mkMech(x));
  evIdx=0;arenaIdx=0;lock=null;goT=0;bossRef=null;winT=0;overT=0;
  // jugadores: el 1 siempre; el 2 si se sumó con su joystick en la pantalla de personaje
  const p1ci=charIdx,n=p2Pad>=0?2:1;players=[];P=null;
  // en táctil, xLibre (camara.js) corre el arranque para que nadie aparezca debajo de la palanca
  for(let s=0;s<n;s++){
    const o=old[s],keep=keepOf(o);
    charIdx=s?p2Ci:p1ci;inSlot=s;maxHp=o?o.mhp:carry?maxHp:CH().hp;
    P=mkPlayer(xLibre(40,1)-(s?18:0),GROUND-18);if(keep)Object.assign(P,keep);else giveStart();
    players.push(P);
  }
  usePlayer(players[0]);
  levelEvents=L.events;variarPartida();
  for(const v of (L.vaults||[]))crates.push({x:v.x,y:GROUND-16,w:16,h:16,hp:24,max:24,armored:true,drop:'V',flash:0});
  banner=null;state='play';playMusic(L.music); // el nombre de la misión va en el cartel de objetivo (ayuda.js)
  for(const f of ON_START)f(carry);
}
function giveStart(){const s=CH().start;if(s){P.weapons[s[0]]=s[1];P.weapon=s[0];}}
// durante un MOMENTO de las misiones 1–3 (momentos.js) los carteles esperan y salen cuando termina
// prioridad: aviso de ataque 4 > entrada de jefe 3 (cartel de dibujito.js) > objetivo 2 > ayudas 1 > logros (esperan
// a que no haya pelea, historial.js). Uno solo a la vez en el centro: el de menos prioridad espera en fila (momentos.js).
const prioCartel=s=>/PELIGRO|EMBOSCADA|CUIDADO|ESCOND|¡FASE|SE ACERCA|AGACH|SALT[AÁ]|CORR[EÉ]|SALÍ|SUBITE|ALERTA/i.test(s)?4:1;
function setBanner(s,t){const pr=prioCartel(s);
  if(typeof DIB_jefeRef!=='undefined'&&DIB_jefeRef&&s===DIB_jefeRef.name)return; // el nombre del jefe ya está en su cartel (dibujito.js)
  if(banner&&banner.t>0&&(banner.prio||1)>pr&&typeof MO_fila!=='undefined'){MO_fila.push(['b',s,t]);return;} // espera al aviso de ataque
  if(pr<4&&typeof MO_guarda==='function'&&MO_guarda('b',s,t))return;
  banner={s,t,max:t,prio:pr};}
// hay un cartel importante en el centro (aviso de ataque o entrada de jefe): lo demás espera
// uno por vez (guía de arte §7): las medallas esperan también a cualquier aviso de arriba y a la tarjeta de tramo
const cartelOcupado=()=>!!((banner&&banner.t>0)||(typeof PC_aviso!=='undefined'&&PC_aviso)||(typeof PC_cartel!=='undefined'&&PC_cartel)||(state==='play'&&typeof AY_OBJ_T!=='undefined'&&T<AY_OBJ_T)||(typeof DIB_jefe!=='undefined'&&DIB_jefe&&DIB_jefe.t<150)||(typeof HIST_pops!=='undefined'&&HIST_pops.length&&HIST_pops[0].t0)||(typeof HIS!=='undefined'&&HIS.sueltos.length>0)); // y al logro que se está mostrando; y a la frase suelta de un personaje (el villano al caer: Guion)
// devuelve el aviso (aunque espere en la fila), así quien lo llama puede sumarle datos (medallas.js: lvl, ico)
function toast(title,sub,col){const o={title,sub,col,t:170};if(typeof MO_guarda==='function'&&MO_guarda('t',o))return o;toasts.push(o);return o;}
function saveRecord(){
  if(typeof partida!=='undefined'&&partida&&partida.ayudas){const r=+(store.get('oxido-record-ayudas')||0);if(score>r){store.set('oxido-record-ayudas',score);newRecord=true;}return;} // con ayudas: récord aparte
  if(score>record){record=score;newRecord=true;store.set('oxido-record',record);}}
function addScore(n,x,y){score+=n;parts.push({k:'txt',s:'+'+n,x,y,life:40,maxl:40});}
function updCam(){
  if(lock)camX=lock.a.at;
  else{
    const lp=typeof CA_on==='function'&&CA_on()&&players[0]&&!players[0].dead?players[0]:leadP(); // caminos en capas: sigue al J1
    const target=Math.min(lp.x-VW*0.34,LEVEL_END-VW,typeof CA_camLimite==='function'?CA_camLimite():1e9); // pantalla partida: no deja atrás a nadie (caminos.js)
    if(target>camX&&!(typeof MO_frena!=='undefined'&&MO_frena>0))camX=target; // momentos.js frena la cámara un instante
    const a=L.arenas[arenaIdx];
    if(a&&camX>=a.at){
      camX=a.at;lock={a,wave:0,t:0,spawned:false};
      for(const e of enemies)if(!isBoss(e)&&e.type!=='turret'&&enemySpan(e)[1]<a.at+4)e.gone=true; // los que quedaron atrás no traban la arena
      setBanner(a.boss||a.mini?'¡PELIGRO!':'¡EMBOSCADA!',a.boss||a.mini?120:90);SFX.alarm();
      if(a.boss||a.mini)playMusic('boss');
    }
  }
  camZoomStep(); // camara.js: zoom, seguimiento vertical y arenas de jefe
  while(evIdx<levelEvents.length&&camX>=levelEvents[evIdx].at){for(const it of levelEvents[evIdx].spawn)spawnQ.push({...it,d:it.d||0});evIdx++;}
}
function updArena(){
  if(!lock)return;const a=lock.a;
  if(a.boss){if(!lock.spawned&&++lock.t>=100){bossRef=spawnBoss(a.at);enemies.push(bossRef);lock.spawned=true;}return;}
  if(a.mini){if(!lock.spawned&&++lock.t>=80){bossRef=spawnMiniBoss(a.at);enemies.push(bossRef);lock.spawned=true;}return;}
  for(const e of enemies){const [x0,x1]=enemySpan(e);if(x1<camX+4||x0>camX+VW-4)e.offT=(e.offT||0)+1;else e.offT=0;if(e.offT>300&&!isBoss(e)&&e.type!=='turret')e.gone=true;}
  const alive=enemies.some(e=>!e.gone&&e.type!=='turret');
  if(spawnQ.length||alive){lock.t=0;return;}
  if(++lock.t<40)return;
  if(lock.wave<a.waves.length){for(const it of a.waves[lock.wave])spawnQ.push({...it,d:it.d||0});lock.wave++;lock.t=0;}
  else arenaClear();
}
// tramo en x que ocupa un enemigo (las criaturas del barro escondidas cuentan por su charco)
function enemySpan(e){if(e.home)return[e.home.x,e.home.x+e.home.w];const x=e.hx??e.x;return[x,x+e.w];}
// cierra la arena actual (oleadas terminadas o jefe chico derrotado)
function arenaClear(){lock=null;arenaIdx++;goT=220;SFX.pick();setBanner('¡ZONA DESPEJADA!',80);bossRef=null;tramoCerrar();}
function step(){
  T++;if(!winT)timeF++;
  for(const it of spawnQ)if(--it.d<=0){spawn(it);it.done=true;}
  spawnQ=spawnQ.filter(i=>!i.done);
  for(let i=0;i<players.length;i++){usePlayer(players[i]);updPlayer();if(state!=='play'){usePlayer(players[0]);return;}}
  usePlayer(players[0]);
  updMechs();updCam();
  // 2 jugadores: nadie se queda fuera de cuadro cuando la cámara avanza con el que va adelante
  if(players.length>1)for(const p of players){if(p.dead)continue;
    if(p.ride)p.ride.x=clamp(p.ride.x,camX+2,camX+VW-24);else p.x=clamp(p.x,camX+2,camX+VW-10);}
  updArena();updPrisoners();
  // los amigos siguen al jugador 1 (o al otro si el 1 está caído)
  usePlayer(players[0].dead?leadP():players[0]);updAllies();usePlayer(players[0]);
  for(const f of ON_STEP)f();
  // cada enemigo, jefe, dron y torreta apunta al jugador vivo más cercano
  for(const e of enemies)if(!e.gone){if(players.length>1)usePlayer(nearestPlayer(e.x+e.w/2,e.y+e.h/2));updEnemy(e);}
  usePlayer(players[0]);
  if(L.upd)L.upd(); // gancho por misión (p. ej. misión 3), una vez por cuadro
  for(const c of crates)if(c.flash>0)c.flash--;
  updProjectiles();updAir();
  for(const k of pickups){
    const kp=k.piso??(typeof CA_piso==='function'?CA_piso(k.x+5,k.y+k.h):GROUND); // caminos en capas: premios arriba y abajo
    k.vy=Math.min(k.vy+0.2,4);k.y+=k.vy;if(k.y+k.h>=kp){k.y=kp-k.h;k.vy=0;}
    if(--k.life<=0||k.x<camX-30)k.gone=true;
    if(!k.gone)for(const p of players)if(!p.dead&&overlap(hurtbox(p),k)){k.gone=true;withP(p,()=>collect(k.kind,k.x,k.y,k));break;}
  }
  updParts();
  enemies=enemies.filter(e=>!e.gone);pbul=pbul.filter(b=>!b.gone);eproj=eproj.filter(b=>!b.gone);
  grens=grens.filter(g=>!g.gone);parts=parts.filter(p=>!p.gone);pickups=pickups.filter(p=>!p.gone);crates=crates.filter(c=>!c.gone);
  if(parts.length>700)parts.splice(0,parts.length-700);
  if(goT>0)goT--;if(banner&&banner.t>0)banner.t--;
  if(toasts.length&&!cartelOcupado()&&--toasts[0].t<=0)toasts.shift(); // los avisos de arriba esperan a los carteles importantes
  shake*=0.85;if(shake<0.2)shake=0;
  if(L.theme==='port'){if(lightning>0)lightning--;else if(Math.random()<0.0025){if(FL_puede())lightning=12;later(rand(250,900),SFX.thunder);}}
  if(winT){
    winT++;for(const p of players)p.inv=Math.max(p.inv,2);
    if(!(typeof MC_paso==='function'&&MC_paso())){ // placa chica y sigue solo (cumplida.js); la misión 10, como siempre
      if(winT===50){setBanner('¡MISIÓN CUMPLIDA!',140);jingle('win');}
      if(winT>200)finishWin();}
  }
}
function finishWin(sigue){ // sigue: la placa de cumplida.js sigue sola (no pasa a la pantalla de misión cumplida)
  const secs=Math.round(timeF/60);
  const tb=typeof JT_bonusTiempo==='function'?JT_bonusTiempo(secs):Math.max(0,240-secs)*20, /* reloj.js: tiempo par por misión */lb=Math.max(0,lives)*1000+players.reduce((s,p)=>s+Math.max(0,p.hp),0)*200,mb=medals*500,rb=rescued*300+allies.length*500+(typeof gato!=='undefined'&&gato&&gato.st!=='flee'?gato.lives*300:0);
  score+=tb+lb+mb+rb;stats={secs,tb,lb,mb,rb,tram:PC_mis?PC_mis.tramos.reduce((s,t)=>s+t.bonus,0):0};saveRecord();if(!sigue){state='win';overT=0;}
  PC_misionGanada(secs);
  if(levelIdx+1>unlocked&&levelIdx+1<LEVELS.length){unlocked=levelIdx+1;store.set('oxido-nivel',unlocked);}
}
const lastLevel=()=>levelIdx>=LEVELS.length-1;
// cámara lenta genérica: si la misión trae L.timeScale() (0–1, se llama una vez por cuadro real), step() corre solo
// cuando el acumulador llega a 1. En los cuadros salteados update() devuelve 'hold' y no se borran los botones tocados.
let tsAcc=0;
function slowTick(k0){const k=clamp(k0,0.05,1);if(k>=1){tsAcc=0;return true;}tsAcc+=k;if(tsAcc>=1){tsAcc-=1;return true;}return false;}
function update(){
  if(pressed.mute)muted=!muted;
  if(pressed.music){mus.on=!mus.on;store.set('oxido-musica',mus.on?'1':'0');setBanner(mus.on?'MÚSICA: SÍ':'MÚSICA: NO',50);}
  mus.paused=state==='pause';
  if(histOk()&&histUpdate())return; // pantallas del historial: logros, récords y nombre
  switch(state){
  case 'title':T++;camX=(T*0.5)%2400;playMusic('title');updTitulo();break;
  case 'select':T++;selT++;camX=(T*0.5)%2400;playMusic('title');updSelect();break;
  case 'ayuda':playMusic('title');updAyuda();break; // CÓMO JUGAR: la tarjeta de controles (ayuda.js)
  case 'opciones':updOpciones();break; // OPCIONES (partida.js)
  case 'reasignar':REA_upd();break; // OPCIONES → CONTROLES → TECLAS / JOYSTICK (reasignar.js)
  case 'play':if(pressed.pause||pressed.back){state='pause';ruCerrar();break;}
    ruedaFrame(); // rueda de armas: cada cuadro real, aunque el juego vaya lento
    if(typeof MC!=='undefined'&&MC&&MC.ir){MC_siguiente();break;} // misión cumplida: pasa sola a la siguiente (cumplida.js)
    if(typeof VIN_paso==='function'&&VIN_paso())break; // página de historieta de un jefe: el juego espera (pagina.js)
    if(hitStop>0){hitStop--;break;}
    {const k=(L.timeScale?L.timeScale():1)*(ruAbierta()?RU_LENTO:1)*(typeof ACC!=='undefined'&&ACC.ayLento?0.75:1);if(!slowTick(k))return 'hold';} // AYUDAS: más lento
    step();break;
  case 'pause':ruCerrar();if(quitArm>0)quitArm--; // la rueda se cierra sin elegir (una pausa por foco suelta las teclas)
    if(pressed.quit||((pressed.swap||pressed2.swap)&&quitArm>0)){quitArm=0;terminarPartida('gameQuit');}
    else if(pressed.swap||pressed2.swap){quitArm=120;SFX.swap();}
    else if(pressed.pause||pressed.back||pressed.start){state='play';quitArm=0;padLost=0;}
    else if(pressed.bomb&&typeof IN_activa==='function'&&IN_activa()){state='play';quitArm=0;IN_omitir();} // introducción: OMITIR (intro.js)
    else if(!PAU_teclas())CTRL_teclas();break; // ↑ ↓ eligen en la franja de dificultad y ayudas; si no, ← → cambian la vista del control
  // caíste (fin.js): CONTINUAR o TERMINAR · fin del juego: OTRA VEZ, MENÚ o VER DETALLE
  case 'over':FIN_updCaiste();break;
  case 'fin':FIN_updFin();break;
  // misión cumplida: ENTER sigue (después de la última misión, a la vuelta siguiente) · ESC termina la partida
  case 'win':overT++;
    if(overT>45&&(pressed.start||pressed.shoot)){if(lastLevel())siguienteVuelta();else startLevel(levelIdx+1,true);}
    else if(overT>45&&(pressed.back||pressed.quit))terminarPartida('gameQuit');
    break;
  }
}
function drawWorld(){
  GL_reset(); // globos: cada cuadro se acomodan de nuevo para no encimarse (globos.js)
  drawGround();
  if(typeof GN_chico==='function'&&GN_chico())GN_componerSiHay(); // grilla nítida: las luces del piso, detrás del decorado (Escenarios)
  for(const d of L.decor)if(d.x>camX-60&&d.x<camX+VW+10)drawDecor(d);
  drawPlatforms();drawCover();
  for(const c of crates)if(onScreen(c,10))drawCrate(c);
  // niebla, barro y rayos de luz de cada misión: DETRÁS de la capa de juego (Dirección de Arte: encima aclaraban la tinta
  // del contorno y nadie llegaba a 3:1). Encima (drawFx) quedan solo lluvia, partículas, brasas y avisos.
  if(L.drawFxFondo&&MUNDO_tf){ctx.save();ctx.setTransform(MUNDO_tf);try{L.drawFxFondo();}finally{ctx.restore();}}
  if(typeof GN_chico==='function'&&GN_chico())GN_componerSiHay(); // grilla nítida: las luces del decorado (encima de su pieza), antes que los personajes
  for(const k of pickups)drawPickup(k);
  for(const e of enemies)if(e.type==='turret')drawTurret(e);
  // estilo dibujito: tinta que tiembla detrás de jefes y soldados (dibujito.js)
  const tin=typeof DIB_tinta==='function';
  for(const e of enemies){if(tin&&e.type!=='turret')DIB_tinta(isBoss(e)?2:0);const mo=e.molesto>0&&typeof CAT_molestoAntes==='function';if(mo)CAT_molestoAntes(e); // molestado por el gato: se sacude (gatito.js)
    try{if(e.draw)e.draw(e);else if(isBoss(e))drawBossAny(e);else if(e.type==='drone')drawDrone(e);else if(e.type!=='turret')drawSoldier(e);}finally{if(mo)CAT_molestoDespues(e);}}
  if(tin)DIB_sinTinta();
  for(const pr of prisoners)drawPrisoner(pr);
  for(const a of allies)drawAlly(a);
  for(const f of ON_DRAW)f();
  for(const m of mechs)drawMech(m);
  if(P){if(tin)DIB_tinta(1);eachPlayer(drawPlayer);if(tin)DIB_sinTinta();eachPlayer(drawPlayerTag);}
  drawForeground();
  for(const g of grens){
    if(g.draw){g.draw(g);continue;}
    if(g.can){ctx.fillStyle='#2a2a30';ctx.fillRect(q(g.x-2.5),q(g.y-1.5),5,3);ctx.fillStyle='#ffcf5a';ctx.fillRect(q(g.x-g.vx*0.6-1),q(g.y-0.5),1.5,1);}
    else{ctx.fillStyle='#4a5a34';circle(g.x,g.y,2.2);ctx.fillStyle='#9fb07a';ctx.fillRect(q(g.x-0.5+Math.cos(g.rot)),q(g.y-0.5+Math.sin(g.rot)),1,1);}
  }
  for(const b of pbul){
    if(b.draw){b.draw(b);continue;} // balas con dibujo propio (arte-fx.js)
    if(b.k==='flame'){const a=b.life/b.maxl;ctx.fillStyle=a>0.7?'#fff3b0':a>0.45?'#ffb43a':a>0.2?'#ff6a2a':'rgba(120,50,40,0.6)';circle(b.x,b.y,b.r);continue;}
    if(b.k==='rocket'){const a=Math.atan2(b.vy,b.vx);ctx.save();ctx.translate(b.x,b.y);ctx.rotate(a);ctx.fillStyle='#cfd2d8';ctx.fillRect(-3,-1,6,2);
      ctx.fillStyle='#d93a2b';ctx.fillRect(3,-1,1.5,2);ctx.fillStyle=(T>>1)%2?'#ffd25a':'#ff7a2a';ctx.fillRect(-5,-0.7,2,1.4);ctx.restore();continue;}
    // la de la ametralladora propia: larga, con estela y centro blanco (no se confunde con la enemiga, que es redonda)
    if(b.heavy){const a=Math.atan2(b.vy,b.vx);ctx.save();ctx.translate(b.x,b.y);ctx.rotate(a);
      ctx.fillStyle='rgba(255,170,70,0.35)';ctx.fillRect(-11,-0.6,6,1.2);ctx.fillStyle='rgba(255,190,90,0.65)';ctx.fillRect(-6,-0.75,3,1.5);
      ctx.fillStyle='#ff9a3c';ctx.fillRect(-3.5,-1,7,2);ctx.fillStyle='#fff6d8';ctx.fillRect(-1.5,-0.4,4.5,0.8);ctx.restore();continue;}
    ctx.fillStyle=b.ally?'#9fe8a0':b.pellet?'#ffd0a0':'#ffe066';const l=b.pellet?2:4;
    if(Math.abs(b.vx)>Math.abs(b.vy))ctx.fillRect(q(b.x-l/2),q(b.y-0.75),l,1.5);else ctx.fillRect(q(b.x-0.75),q(b.y-l/2),1.5,l);
  }
  const alto=typeof ACC!=='undefined'&&ACC.contraste; // BALAS ENEMIGAS: ALTO CONTRASTE (accesible.js): borde blanco y forma de rombo
  for(const b of eproj){
    if(b.draw){b.draw(b);if(alto&&typeof b.x==='number'&&typeof b.y==='number'&&(b.r||b.rad)){ctx.strokeStyle='#ffffff';ctx.lineWidth=0.9;ctx.beginPath();ctx.arc(b.x,b.y,(b.r||b.rad)+1.2,0,Math.PI*2);ctx.stroke();}continue;}
    if(b.kind==='bullet'&&alto){const r=b.r+0.6;ctx.fillStyle='#ffffff';ctx.beginPath();ctx.moveTo(b.x,b.y-r-1.2);ctx.lineTo(b.x+r+1.2,b.y);ctx.lineTo(b.x,b.y+r+1.2);ctx.lineTo(b.x-r-1.2,b.y);ctx.fill();
      ctx.fillStyle='#d1001f';ctx.beginPath();ctx.moveTo(b.x,b.y-r);ctx.lineTo(b.x+r,b.y);ctx.lineTo(b.x,b.y+r);ctx.lineTo(b.x-r,b.y);ctx.fill();ctx.fillStyle='#120c18';ctx.fillRect(q(b.x-0.5),q(b.y-0.5),1,1);}
    else if(b.kind==='bullet'){ctx.fillStyle='#ff5a3c';circle(b.x,b.y,b.r);ctx.fillStyle='#ffd9b0';circle(b.x,b.y,b.r*0.5);}
    else if(b.kind==='shell'){if((T>>2)%2){ctx.fillStyle='rgba(255,59,48,0.8)';const lx=shellLanding(b);ctx.fillRect(lx-4,GROUND-1,8,1.5);}
      if(alto){ctx.fillStyle='#ffffff';circle(b.x,b.y,4.2);}ctx.fillStyle='#2a2a30';circle(b.x,b.y,3);ctx.fillStyle='#ff7a30';circle(b.x-b.vx,b.y-b.vy,1.5);}
    else if(b.kind==='bomb'){if(alto){ctx.fillStyle='#ffffff';ctx.fillRect(q(b.x-3),q(b.y-4),6,8);}ctx.fillStyle='#22232a';ctx.fillRect(q(b.x-2),q(b.y-3),4,6);ctx.fillStyle='#ff4130';ctx.fillRect(q(b.x-1),q(b.y-1),2,1);}
    else{ctx.fillStyle='#4a5a34';circle(b.x,b.y,2.2);}
  }
  for(const b of airBombs){ctx.fillStyle='#22262a';ctx.beginPath();ctx.ellipse(b.x,b.y,1.8,3.2,-0.3,0,7);ctx.fill();ctx.fillStyle='#e07a2c';ctx.fillRect(q(b.x-1),q(b.y-4),2,1.2);}
  for(const p of parts){const a=p.life/p.maxl;
    switch(p.k){
    case 'fire':{ctx.fillStyle=a>0.75?'#fff6c8':a>0.5?'#ffd25a':a>0.3?'#ff8a2a':'#b8321e';const s=p.size*(0.5+a*0.6);ctx.fillRect(p.x-s/2,p.y-s/2,s,s);break;}
    case 'smoke':ctx.fillStyle=`rgba(${p.col||'60,48,58'},${a*0.55})`;circle(p.x,p.y,p.size);break;
    case 'ring':ctx.strokeStyle=`rgba(${p.col||'255,230,170'},${a})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.stroke();break;
    case 'p':ctx.fillStyle=p.col;ctx.fillRect(q(p.x),q(p.y),p.size,p.size);break;
    case 'shell':ctx.fillStyle=p.col||'#e8c25a';ctx.fillRect(q(p.x),q(p.y),1,1.5);break;
    case 'flash':ctx.fillStyle='#fff3b0';circle(p.x,p.y,p.size*a);ctx.fillStyle='#fff';circle(p.x,p.y,p.size*a*0.5);break;
    case 'tracer':ctx.strokeStyle=`rgba(255,230,120,${a})`;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x2,p.y2);ctx.stroke();break;
    case 'spr':if(p.life<20&&(p.life>>1)%2)break;ctx.save();ctx.translate(q(p.x+7),q(p.y+9));ctx.rotate(p.rot);ctx.drawImage(p.img,-7,-9);ctx.restore();break;
    // globos de diálogo y textos que flotan, con la fuente pixel (globos.js)
    case 'txt':if(p.g)globo(p.s,p.x,p.y,{grito:p.g==='grito',t:p.maxl-p.life,dur:p.maxl});else pfFlota(p.s,p.x,p.y,p.col,Math.min(1,a*2));break;
    }
  }
  if(air)drawPlane(air);
  if(P)eachPlayer(drawAirCharge);
}
// render(): el juego y, encima de todo, el aviso de control no reconocido (input.js)
function render(){if(typeof COMIC_deADos==='function'&&COMIC_deADos()&&(T&1))return;renderMain();drawPadNote();} // "de a dos" en momentos especiales (comic.js)
function renderMain(){
  RA_reset(); // zonas clickeables del mouse: cada menú las vuelve a anotar al dibujarse (raton.js)
  ctx.setTransform(S,0,0,S,0,0);ctx.imageSmoothingEnabled=false;
  if(document.body.dataset.s!==state)document.body.dataset.s=state;
  const sk=typeof MOV_reducido==='function'&&MOV_reducido()?1/3:1; // movimiento reducido: sacudida a un tercio
  const sx=((shake?rand(-shake,shake):0)+kickX)*sk,sy=((shake?rand(-shake,shake):0)+kickY)*sk;
  const hs=histOk()&&histIsScreen(),menu=state==='title'||state==='select'||state==='ayuda'||state==='opciones'||state==='reasignar'||hs;
  if(menu&&L!==LEVELS[0]){L=LEVELS[0];platforms=L.platforms;LEVEL_END=L.end;}
  if(menu&&(ZOOM!==1||camY)){setZoom(1);camY=0;} // los menús se ven como siempre
  // fondo, mundo y efectos van con zoom (camara.js); el HUD, sin zoom
  // si el mundo no llena el alto (camOY), barras negras arriba y abajo y el mundo recortado entre ellas
  // pantalla partida (caminos.js): dos franjas, una por jugador, con el mismo avance y cada una con su altura de cámara
  const vistas=!menu&&typeof CA_vistas==='function'?CA_vistas():null;
  const mundo=(oyv,cy)=>{
    if(GN.on&&!menu){GN_mundo(oyv,cy);return;} // también en táctil (Coordinación, 23 nov: Pruebas midió 58,4–60 fps en celular, M9 incluida)
    GN.zEf=null;
    SQ=S*ZOOM;ctx.setTransform(SQ,0,0,SQ,0,oyv);ctx.translate(0,-q(cy));
    if(L.drawBG)L.drawBG();else if(L.theme==='port')drawBGPort();else drawBGDusk();
    if(typeof COMIC_trama==='function')COMIC_trama(); // cómic: trama de puntos en las sombras del fondo (comic.js)
    MUNDO_tf=ctx.getTransform(); // el marco de drawFx: drawFxFondo se dibuja con este mismo, pero antes de los personajes
    ctx.save();ctx.translate(q(-camX+sx),q(sy));
    if(menu){drawGround();for(const d of L.decor)if(d.x>camX-60&&d.x<camX+VW+10)drawDecor(d);drawPlatforms();}
    else drawWorld();
    ctx.restore();
    if(L.drawFx)L.drawFx();else if(L.theme==='port')drawRain();
    if(typeof GL_vaciar==='function')GL_vaciar(); // globos encima de todo el mundo (globos.js)
  };
  if(!vistas){
    const oy=Math.round(camOY()*S);
    if(oy>0){ctx.fillStyle='#000';cubrir();ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.beginPath();ctx.rect(0,oy,cv.width,cv.height-2*oy);ctx.clip();}
    mundo(oy,camY);
    if(oy>0)ctx.restore();
  }else{
    const cy0=camY,vh0=VH;
    vistas.forEach((v,i)=>{const y0=Math.round(v.y0*S);
      ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.beginPath();ctx.rect(0,y0,cv.width,Math.round(v.h*S));ctx.clip();
      camY=v.camY;VH=v.h/ZOOM;CA_dibujando=i+1;
      try{mundo(y0,v.camY);}finally{camY=cy0;VH=vh0;CA_dibujando=0;}
      ctx.restore();CA_dibujarFranja(v);});
    CA_dibujarCorte();
  }
  if(!vistas&&typeof CA_lim!=='undefined'&&CA_lim)CA_dibujarFranja(null); // aviso de distancia sin pantalla partida
  if(typeof COMIC_post==='function')COMIC_post(); // cómic: líneas de velocidad, color corrido, viñeta de jefe (comic.js)
  if(typeof DIB_pelicula==='function')DIB_pelicula(); // estilo dibujito: grano, viñeta, rayas (dibujito.js); el HUD va limpio encima
  // el HUD del juego va pegado arriba y abajo del lienzo; los menús y pantallas, en un marco de 320×180 centrado
  SQ=S;ctx.setTransform(S,0,0,S,0,0);
  const marco=()=>ctx.setTransform(S,0,0,S,0,Math.round((HC-H)/2*S));
  if(hs){marco();histDraw();return;}
  if(state==='title'){marco();drawTitle();return;}
  if(state==='select'){marco();drawSelect();return;}
  if(state==='ayuda'){marco();drawAyuda();return;}
  if(state==='opciones'){marco();drawOpciones();return;}
  if(state==='reasignar'){marco();REA_dibujar();return;}
  drawHUD();
  if(state==='pause'){marco();drawPause();}
  if(state==='over'||state==='win'){marco();drawEnd();}
  if(state==='fin'){marco();FIN_fin();}
}
// grilla nítida (base.js, GN): el mundo en el lienzo chico GN.c, con 1 px de margen y la cámara en píxel entero; se agranda
// sin suavizar a N = la escala entera más grande que entra (GN.big) y de ahí a la pantalla con un último paso suave (de N a
// S×ZOOM), corrido la fracción de la cámara. Después, a resolución de pantalla, las luces anotadas con GN_luz.
function GN_mundo(oyv,cy){
  const sk=typeof MOV_reducido==='function'&&MOV_reducido()?1/3:1;
  const sx=Math.round(((shake?rand(-shake,shake):0)+kickX)*sk),sy=Math.round(((shake?rand(-shake,shake):0)+kickY)*sk);
  const K=S*ZOOM,wpx=cv.width,hpx=Math.round(VH*K);
  // ENTERO (Dirección de Arte): N = escala entera, vecino más cercano hasta la pantalla y el lienzo chico crece para llenarla
  // (se ve un poco más de mundo según la pantalla). Si N da 1 o mostraría más de un 15 % de mundo de más, N+1 recortado.
  // ?nitida=suave: la variante anterior (N = la escala entera más grande que entra y un paso bilineal hasta S×ZOOM).
  let N=Math.max(1,Math.floor(K+1e-6));if(!GN.suave&&(N<2||K/N-1>0.15))N++;
  const E=GN.suave?K:N,lw=Math.ceil(wpx/E)+2,lh=Math.ceil(hpx/E)+2;
  // el lienzo chico solo crece: cambiarle el tamaño lo borra y realoca su textura (tirones al cambiar el zoom en las arenas)
  if(GN.c.width<lw||GN.c.height<lh){GN.c.width=Math.max(GN.c.width,lw);GN.c.height=Math.max(GN.c.height,lh);}
  const cx0=Math.floor(camX),cy0=Math.floor(cy),fx=camX-cx0,fy=cy-cy0,camR=camX,sqR=SQ,vwR=VW,vhR=VH;
  const ox=GN.suave?(-1-fx)*K:-N-Math.round(fx*N),oy=GN.suave?(-1-fy)*K:-N-Math.round(fy*N); // la fracción de la cámara, en px enteros de pantalla
  GN.mat=new DOMMatrix([E,0,0,E,ox,oyv+oy]);GN.luces.length=0;GN.paso={lw,lh,K,N,E,ox,oy,oyv};
  camX=cx0;SQ=1;ctx=GN.g;VW=lw-2;VH=lh-2; // lo que se ve en el lienzo chico (dibujos que recortan con VW/VH)
  try{
    ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.filter='none';ctx.clearRect(0,0,lw,lh);ctx.imageSmoothingEnabled=false;
    ctx.setTransform(1,0,0,1,1,1);ctx.translate(0,-cy0);
    if(L.drawBG)L.drawBG();else if(L.theme==='port')drawBGPort();else drawBGDusk();
    if(typeof COMIC_trama==='function')COMIC_trama();
    GN_componerSiHay(); // las luces de las capas de fondo, detrás de todo lo que viene (Escenarios)
    MUNDO_tf=ctx.getTransform();
    ctx.save();ctx.translate(-camX+sx,sy);drawWorld();ctx.restore(); // drawWorld compone después del piso y antes de los personajes
    if(L.drawFx)L.drawFx();else if(L.theme==='port')drawRain();
    if(typeof GL_vaciar==='function')GL_vaciar(); // globos encima de todo el mundo (globos.js)
  }finally{ctx=CTX0;camX=camR;SQ=sqR;VW=vwR;VH=vhR;}
  GN_componer();GN.paso=null;GN.zEf=E/S; // la escala que se ve (HX/HY, camara.js)
  SQ=S*ZOOM;ctx.setTransform(SQ,0,0,SQ,0,oyv);ctx.translate(0,-q(cy)); // lo que se dibuje después (efectos de pantalla) sigue con la escala de siempre
}
const GN_componerSiHay=()=>{if(GN.paso&&GN.luces.length)GN_componer();};
// pasa lo que hay en el lienzo chico a la pantalla (agrandado a N sin suavizar y de N a S×ZOOM con un paso bilineal), dibuja
// las luces anotadas a resolución de pantalla y deja el lienzo chico vacío. Se llama dos veces por cuadro: antes de los
// personajes (fondo, piso, plataformas y sus luces quedan detrás) y al final (personajes y efectos, encima de todo eso).
function GN_componer(){
  const p=GN.paso;if(!p)return;const{lw,lh,K,N,E,ox,oy,oyv}=p,c0=ctx;
  ctx=CTX0;
  try{
    ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
    if(GN.suave){ // agrandado a N sin suavizar y de N a S×ZOOM con un paso bilineal
      if(GN.big.width!==lw*N||GN.big.height!==lh*N){GN.big.width=lw*N;GN.big.height=lh*N;}
      GN.bg.imageSmoothingEnabled=false;GN.bg.clearRect(0,0,GN.big.width,GN.big.height);GN.bg.drawImage(GN.c,0,0,lw,lh,0,0,lw*N,lh*N);
      ctx.imageSmoothingEnabled=N!==K;ctx.imageSmoothingQuality='low';ctx.drawImage(GN.big,ox,oyv+oy,lw*K,lh*K);}
    else{ctx.imageSmoothingEnabled=false;ctx.drawImage(GN.c,0,0,lw,lh,ox,oyv+oy,lw*N,lh*N);} // entero puro: vecino más cercano, sin paso suave (solo la parte que se usa)
    ctx.restore();ctx.imageSmoothingEnabled=false;
    for(const[m,fn,op]of GN.luces){ctx.save();try{ctx.setTransform(GN.mat.multiply(m));ctx.globalCompositeOperation=op||'source-over';ctx.imageSmoothingEnabled=true;fn();}catch(e){}ctx.restore();}
    GN.luces.length=0;
  }finally{ctx=c0;}
  GN.g.save();GN.g.setTransform(1,0,0,1,0,0);GN.g.clearRect(0,0,lw,lh);GN.g.restore();
}
// pausa: los botones salen del último control que se tocó (btn en input.js)
function drawPause(){
  const pad=onPad();
  dim(0.6);txt(TX.pausa.titulo,W/2,30,16,'#fff','center');
  zona(W/2-110,50,108,11,{clic:()=>{pressed.pause=true;}});zona(W/2+2,50,108,11,{clic:()=>{pressed.quit=true;}}); // mouse: seguir · salir
  if(!onTouch())txt(TX.pausa.controles,34,61,4,'#f3c969','left',false);
  txt(onTouch()?tx(TX.pausa.pieTactil,{ok:btn('ok')}):tx(TX.pausa.pie,{seguir:btn('opt'),salir:btn('quit')}),W/2,52,6,'#ddd','center'); // una sola plantilla (textos.js), con los botones del control que se usa
  {const G=PAU_geo(),h=Math.min(90,G.y0-3-67-(typeof AYUDAS_on==='function'&&AYUDAS_on()?8:0)); // la tarjeta termina arriba de la franja (y del aviso de ayudas)
   if(G.lb){ctx.fillStyle='rgba(18,12,24,0.85)';ctx.fillRect(26,64,268,h+5);} // en táctil la tarjeta es transparente: que no se vean los carteles del piso
   CTRL_dibujar(28,67,264,h);} // el control dibujado (controles.js, de Arte)
  PAU_franja(); // dificultad y ayudas, para cambiar durante la partida (abajo)
  if(padLost){const p2=Math.abs(padLost)===2,back=padLost<0;ctx.fillStyle='rgba(18,12,24,0.92)';ctx.fillRect(30,150,260,22);ctx.fillStyle=back?'#7dff9a':'#ff6b5b';ctx.fillRect(30,150,260,1);
    txt(back?TX.pausa.joyVolvio:(p2?TX.pausa.joy2Fuera:TX.pausa.joyFuera),W/2,153,6,back?'#7dff9a':'#ff8a7a','center');
    txt(back?tx(TX.pausa.joyVolvioSub,{seguir:btn('opt',{i:padLostIdx})}):(p2?TX.pausa.joy2FueraSub:TX.pausa.joyFueraSub),W/2,162,5,'#ddd','center',false);}
  // introducción jugable: OMITIR (con el joystick es la única forma)
  // (en táctil no: Publicación tiene su propio botón OMITIR INTRO, y ○ en la pausa es seguir). Arriba del título PAUSA.
  if(typeof IN_activa==='function'&&IN_activa()&&!onTouch()){const s='OMITIR INTRODUCCIÓN: '+btn('bomb'),h=TXT_aj(6)+5,w=hudTW(s,6)+12,y=Math.max(2,28-h);ctx.fillStyle='rgba(18,12,24,0.92)';ctx.fillRect(W/2-w/2,y,w,h);ctx.fillStyle='#f3c969';ctx.fillRect(W/2-w/2,y,w,1);
    txt(s,W/2,y+2.5,6,'#ffe08a','center',false);zona(W/2-w/2,y,w,h,{clic:()=>{state='play';IN_omitir();}});}
  // △ (o Y, o X) dos veces sale al menú: el aviso nombra el botón del joystick que lo apretó
  if(quitArm>0&&!onTouch()&&(T>>3)%2===0)txt(tx(TX.pausa.confirmarSalir,{salir:btn('quit',pad||onTouch()?undefined:'pad')}),W/2,padLost?141:150,7,'#ff8a7a','center');
}

// ================== loop ==================
let last=performance.now(),acc=0,lienzoW=0,lienzoH=0;
const STEP=1000/60;
function frame(now){
  acc+=Math.min(100,now-last);last=now;
  padState=pollPad();
  let ran=false,pasos=0;
  while(acc>=STEP){const r=update();acc-=STEP;pasos++;if(!ran&&r!=='hold'){clearPressed();ran=true;}}
  // en pantallas de 120 Hz (Mac ProMotion, iPad Pro) la mitad de los cuadros no trae ningún paso nuevo: dibujar de
  // nuevo daría la misma imagen y costaría el doble. Se saltea, salvo que el lienzo haya cambiado de tamaño (fit() lo vacía).
  if(pasos||cv.width!==lienzoW||cv.height!==lienzoH){lienzoW=cv.width;lienzoH=cv.height;render();}
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
// ---------- pausa: dificultad y ayudas, para cambiar durante la partida ----------
// Una franja abajo con 4 botones: DIFICULTAD (◀ ▶ cambia), VIDAS INFINITAS, MENOS DAÑO y MÁS LENTO (se prenden y se
// apagan). ↓ entra a la franja y pasa de un botón al otro; ↑ vuelve a la tarjeta de controles. ← → o ✕ cambian el elegido.
// Con alguna ayuda, la partida queda marcada (récord aparte y sin logros de desafío: partida.js, historial.js).
let PAU_sel=0; // 0 = la tarjeta de controles · 1..4 = los botones de la franja
const PAU_ITEMS=()=>[
  [TX.pausa.dificultad,DIFF().name,d=>{difficulty=(difficulty+(d||1)+DIFFS.length)%DIFFS.length;}],
  [TX.opciones.vidasInfCorto,ACC.ayVidas?TX.palabras.si:TX.palabras.no,()=>ACC_poner('ayVidas',!ACC.ayVidas)],
  [TX.opciones.menosDano,ACC.ayDano?TX.palabras.si:TX.palabras.no,()=>ACC_poner('ayDano',!ACC.ayDano)],
  [TX.opciones.masLento,ACC.ayLento?TX.palabras.si:TX.palabras.no,()=>ACC_poner('ayLento',!ACC.ayLento)]];
function PAU_teclas(){
  const n=PAU_ITEMS().length;
  if(pressed.down){PAU_sel=(PAU_sel+1)%(n+1);SFX.swap();return true;}
  if(pressed.up){PAU_sel=(PAU_sel+n)%(n+1);SFX.swap();return true;}
  if(PAU_sel>0&&(pressed.left||pressed.right||pressed.jump||pressed.shoot)){PAU_ITEMS()[PAU_sel-1][2](pressed.left?-1:1);SFX.swap();return true;}
  return PAU_sel>0;
}
// dónde va la franja: en táctil, entre la palanca y el rombo (2 × 2 si es angosta); el alto sale del tamaño de letra
function PAU_geo(){
  const n=PAU_ITEMS().length,gap=4,lb=typeof tactilLibre==='function'?tactilLibre():null;
  const X0=lb?Math.max(8,lb.x0+4):28,X1=lb?Math.min(W-8,lb.x1-4):292,dos=X1-X0<220,porFila=dos?2:n;
  const w=(X1-X0-gap*(porFila-1))/porFila,ch=TXT_aj(4)+TXT_aj(5)+4,filas=Math.ceil(n/porFila),alto=filas*ch+(filas-1)*2;
  return{lb,X0,X1,porFila,w,ch,gap,y0:176-alto,alto};
}
function PAU_franja(){
  const it=PAU_ITEMS(),G=PAU_geo(),{X0,X1,porFila,w,ch,gap,y0,alto,lb}=G;
  ctx.fillStyle='rgba(18,12,24,0.92)';ctx.fillRect(X0-2,y0-2,X1-X0+4,alto+4); // fondo parejo: no se ven los carteles del piso entre los botones
  it.forEach(([nm,v,fn],i)=>{const x=X0+(i%porFila)*(w+gap),y=y0+Math.floor(i/porFila)*(ch+2),on=PAU_sel===i+1,act=v==='SÍ';
    ctx.fillStyle=on?'rgba(243,201,105,0.22)':'rgba(18,12,24,0.88)';ctx.fillRect(x,y,w,ch);
    ctx.strokeStyle=on?'#f3c969':act?'#9ad0ff':'#4a3f52';ctx.lineWidth=1;ctx.strokeRect(x+0.5,y+0.5,w-1,ch-1);
    let sn=4,sv=5;while(sn>2&&txtW(nm,sn)>w-4)sn--;while(sv>3&&txtW(v,sv)>w-4)sv--; // si no entra, la letra se achica (TEXTO GRANDE)
    txt(nm,x+w/2,y+1.5,sn,on?'#ffe08a':'#aaa','center',false);txt(v,x+w/2,y+2.5+TXT_aj(4),sv,act?'#9ad0ff':'#fff','center',false);
    zona(x,y,w,ch,{sobre:()=>{PAU_sel=i+1;},clic:()=>{PAU_sel=i+1;fn(1);SFX.swap();}});});
  // con ayudas, siempre se avisa: la línea larga o, si no entra (celular), la corta (Pruebas, T2)
  if(typeof AYUDAS_on==='function'&&AYUDAS_on()){const lg=TX.opciones.conAyudas,ct=TX.opciones.conAyudasCorto;
    const s2=!lb&&txtW(lg,4)<=X1-X0+8?lg:ct;let sz=4;while(sz>2&&txtW(s2,sz)>X1-X0)sz--;txt(s2,(X0+X1)/2,y0-6,sz,'#9ad0ff','center',false);}
}

