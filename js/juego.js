'use strict';
// Óxido · Estado, misión, cámara, arenas, bucle principal y render
// ================== estado ==================
let state='title',T=0,camX=0,shake=0,score=0,lives=2,kills=0,timeF=0,record=+(store.get('oxido-record')||0),newRecord=false,stats=null,charIdx=0,selT=0,lightning=0;
let P=null,players=[],p2Ci=2,enemies=[],pbul=[],eproj=[],grens=[],parts=[],pickups=[],crates=[],spawnQ=[],mechs=[],airBombs=[],air=null;
let prisoners=[],allies=[],rescued=0,prisHint=false;
const MAX_ALLIES=2;
let quitArm=0,levelEvents=[],evIdx=0,arenaIdx=0,lock=null,banner=null,goT=0,bossRef=null,winT=0,overT=0,toasts=[],killsBy={};
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
function gainLife(){if(lives<DIFF().maxLives){lives++;return true;}score+=1000;return false;}
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
  setBanner(L.name,150);state='play';playMusic(L.music);
  for(const f of ON_START)f(carry);
}
function giveStart(){const s=CH().start;if(s){P.weapons[s[0]]=s[1];P.weapon=s[0];}}
function setBanner(s,t){banner={s,t,max:t};}
function toast(title,sub,col){toasts.push({title,sub,col,t:170});}
function saveRecord(){if(score>record){record=score;newRecord=true;store.set('oxido-record',record);}}
function addScore(n,x,y){score+=n;parts.push({k:'txt',s:'+'+n,x,y,life:40,maxl:40});}
function updCam(){
  if(lock)camX=lock.a.at;
  else{
    const target=Math.min(leadP().x-VW*0.34,LEVEL_END-VW);
    if(target>camX)camX=target;
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
    k.vy=Math.min(k.vy+0.2,4);k.y+=k.vy;if(k.y+k.h>=GROUND){k.y=GROUND-k.h;k.vy=0;}
    if(--k.life<=0||k.x<camX-30)k.gone=true;
    if(!k.gone)for(const p of players)if(!p.dead&&overlap(hurtbox(p),k)){k.gone=true;withP(p,()=>collect(k.kind,k.x,k.y,k));break;}
  }
  updParts();
  enemies=enemies.filter(e=>!e.gone);pbul=pbul.filter(b=>!b.gone);eproj=eproj.filter(b=>!b.gone);
  grens=grens.filter(g=>!g.gone);parts=parts.filter(p=>!p.gone);pickups=pickups.filter(p=>!p.gone);crates=crates.filter(c=>!c.gone);
  if(parts.length>700)parts.splice(0,parts.length-700);
  if(goT>0)goT--;if(banner&&banner.t>0)banner.t--;
  if(toasts.length&&--toasts[0].t<=0)toasts.shift();
  shake*=0.85;if(shake<0.2)shake=0;
  if(L.theme==='port'){if(lightning>0)lightning--;else if(Math.random()<0.0025){lightning=12;later(rand(250,900),SFX.thunder);}}
  if(winT){
    winT++;for(const p of players)p.inv=Math.max(p.inv,2);
    if(winT===50){setBanner('¡MISIÓN CUMPLIDA!',140);jingle('win');}
    if(winT>200)finishWin();
  }
}
function finishWin(){
  const secs=Math.round(timeF/60);
  const tb=Math.max(0,240-secs)*20,lb=Math.max(0,lives)*1000+players.reduce((s,p)=>s+Math.max(0,p.hp),0)*200,mb=medals*500,rb=rescued*300+allies.length*500+(typeof gato!=='undefined'&&gato&&gato.st!=='flee'?gato.lives*300:0);
  score+=tb+lb+mb+rb;stats={secs,tb,lb,mb,rb,tram:PC_mis?PC_mis.tramos.reduce((s,t)=>s+t.bonus,0):0};saveRecord();state='win';overT=0;
  PC_misionGanada(secs);
  if(levelIdx+1>unlocked&&levelIdx+1<LEVELS.length){unlocked=levelIdx+1;store.set('oxido-nivel',unlocked);}
}
const lastLevel=()=>levelIdx>=LEVELS.length-1;
// cámara lenta genérica: si la misión trae L.timeScale() (0–1, se llama una vez por cuadro real), step() corre solo
// cuando el acumulador llega a 1. En los cuadros salteados update() devuelve 'hold' y no se borran los botones tocados.
let tsAcc=0;
function slowTick(){const k=clamp(L.timeScale(),0.05,1);if(k>=1){tsAcc=0;return true;}tsAcc+=k;if(tsAcc>=1){tsAcc-=1;return true;}return false;}
function update(){
  if(pressed.mute)muted=!muted;
  if(pressed.music){mus.on=!mus.on;store.set('oxido-musica',mus.on?'1':'0');setBanner(mus.on?'MÚSICA: SÍ':'MÚSICA: NO',50);}
  mus.paused=state==='pause';
  if(histOk()&&histUpdate())return; // pantallas del historial: logros, récords y nombre
  switch(state){
  case 'title':T++;camX=(T*0.5)%2400;playMusic('title');updTitulo();break;
  case 'select':T++;selT++;camX=(T*0.5)%2400;playMusic('title');updSelect();break;
  case 'play':if(pressed.pause||pressed.back){state='pause';break;}if(hitStop>0){hitStop--;break;}if(L.timeScale&&!slowTick())return 'hold';step();break;
  case 'pause':if(quitArm>0)quitArm--;
    if(pressed.quit||((pressed.swap||pressed2.swap)&&quitArm>0)){quitArm=0;terminarPartida('gameQuit');}
    else if(pressed.swap||pressed2.swap){quitArm=120;SFX.swap();}
    else if(pressed.pause||pressed.back||pressed.start){state='play';quitArm=0;padLost=0;}break;
  // fin del juego: ENTER continúa (si quedan continuaciones) · ESC termina la partida
  case 'over':overT++;
    if(overT>45&&(pressed.start||pressed.shoot)){if(contQuedan()>0)continuar();else terminarPartida('gameOver');}
    else if(overT>45&&(pressed.back||pressed.quit))terminarPartida('gameOver');break;
  // misión cumplida: ENTER sigue (después de la última misión, a la vuelta siguiente) · ESC termina la partida
  case 'win':overT++;
    if(overT>45&&(pressed.start||pressed.shoot)){if(lastLevel())siguienteVuelta();else startLevel(levelIdx+1,true);}
    else if(overT>45&&(pressed.back||pressed.quit))terminarPartida('gameQuit');
    break;
  }
}
function drawWorld(){
  drawGround();
  for(const d of L.decor)if(d.x>camX-60&&d.x<camX+VW+10)drawDecor(d);
  drawPlatforms();drawCover();
  for(const c of crates)if(onScreen(c,10))drawCrate(c);
  for(const k of pickups)drawPickup(k);
  for(const e of enemies)if(e.type==='turret')drawTurret(e);
  for(const e of enemies){if(e.draw)e.draw(e);else if(isBoss(e))drawBossAny(e);else if(e.type==='drone')drawDrone(e);else if(e.type!=='turret')drawSoldier(e);}
  for(const pr of prisoners)drawPrisoner(pr);
  for(const a of allies)drawAlly(a);
  for(const f of ON_DRAW)f();
  for(const m of mechs)drawMech(m);
  if(P){eachPlayer(drawPlayer);eachPlayer(drawPlayerTag);}
  drawForeground();
  for(const g of grens){
    if(g.draw){g.draw(g);continue;}
    if(g.can){ctx.fillStyle='#2a2a30';ctx.fillRect(q(g.x-2.5),q(g.y-1.5),5,3);ctx.fillStyle='#ffcf5a';ctx.fillRect(q(g.x-g.vx*0.6-1),q(g.y-0.5),1.5,1);}
    else{ctx.fillStyle='#4a5a34';circle(g.x,g.y,2.2);ctx.fillStyle='#9fb07a';ctx.fillRect(q(g.x-0.5+Math.cos(g.rot)),q(g.y-0.5+Math.sin(g.rot)),1,1);}
  }
  for(const b of pbul){
    if(b.k==='flame'){const a=b.life/b.maxl;ctx.fillStyle=a>0.7?'#fff3b0':a>0.45?'#ffb43a':a>0.2?'#ff6a2a':'rgba(120,50,40,0.6)';circle(b.x,b.y,b.r);continue;}
    if(b.k==='rocket'){const a=Math.atan2(b.vy,b.vx);ctx.save();ctx.translate(b.x,b.y);ctx.rotate(a);ctx.fillStyle='#cfd2d8';ctx.fillRect(-3,-1,6,2);
      ctx.fillStyle='#d93a2b';ctx.fillRect(3,-1,1.5,2);ctx.fillStyle=(T>>1)%2?'#ffd25a':'#ff7a2a';ctx.fillRect(-5,-0.7,2,1.4);ctx.restore();continue;}
    ctx.fillStyle=b.ally?'#9fe8a0':b.heavy?'#ff9a3c':b.pellet?'#ffd0a0':'#ffe066';const l=b.pellet?2:b.heavy?5:4;
    if(Math.abs(b.vx)>Math.abs(b.vy))ctx.fillRect(q(b.x-l/2),q(b.y-0.75),l,1.5);else ctx.fillRect(q(b.x-0.75),q(b.y-l/2),1.5,l);
  }
  for(const b of eproj){
    if(b.draw){b.draw(b);continue;}
    if(b.kind==='bullet'){ctx.fillStyle='#ff5a3c';circle(b.x,b.y,b.r);ctx.fillStyle='#ffd9b0';circle(b.x,b.y,b.r*0.5);}
    else if(b.kind==='shell'){if((T>>2)%2){ctx.fillStyle='rgba(255,59,48,0.8)';const lx=shellLanding(b);ctx.fillRect(lx-4,GROUND-1,8,1.5);}
      ctx.fillStyle='#2a2a30';circle(b.x,b.y,3);ctx.fillStyle='#ff7a30';circle(b.x-b.vx,b.y-b.vy,1.5);}
    else if(b.kind==='bomb'){ctx.fillStyle='#22232a';ctx.fillRect(q(b.x-2),q(b.y-3),4,6);ctx.fillStyle='#ff4130';ctx.fillRect(q(b.x-1),q(b.y-1),2,1);}
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
    case 'txt':ctx.globalAlpha=Math.min(1,a*2);txt(p.s,p.x,p.y,5,'#ffe08a','center');ctx.globalAlpha=1;break;
    }
  }
  if(air)drawPlane(air);
  if(P)eachPlayer(drawAirCharge);
}
// render(): el juego y, encima de todo, el aviso de control no reconocido (input.js)
function render(){renderMain();drawPadNote();}
function renderMain(){
  ctx.setTransform(S,0,0,S,0,0);ctx.imageSmoothingEnabled=false;
  if(document.body.dataset.s!==state)document.body.dataset.s=state;
  const sx=(shake?rand(-shake,shake):0)+kickX,sy=(shake?rand(-shake,shake):0)+kickY;
  const hs=histOk()&&histIsScreen(),menu=state==='title'||state==='select'||hs;
  if(menu&&L!==LEVELS[0]){L=LEVELS[0];platforms=L.platforms;LEVEL_END=L.end;}
  if(menu&&(ZOOM!==1||camY)){setZoom(1);camY=0;} // los menús se ven como siempre
  // fondo, mundo y efectos van con zoom (camara.js); el HUD, sin zoom
  // si el mundo no llena el alto (camOY), barras negras arriba y abajo y el mundo recortado entre ellas
  const oy=Math.round(camOY()*S);
  if(oy>0){ctx.fillStyle='#000';cubrir();ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.beginPath();ctx.rect(0,oy,cv.width,cv.height-2*oy);ctx.clip();}
  SQ=S*ZOOM;ctx.setTransform(SQ,0,0,SQ,0,oy);ctx.translate(0,-q(camY));
  if(L.drawBG)L.drawBG();else if(L.theme==='port')drawBGPort();else drawBGDusk();
  ctx.save();ctx.translate(q(-camX+sx),q(sy));
  if(menu){drawGround();for(const d of L.decor)if(d.x>camX-60&&d.x<camX+VW+10)drawDecor(d);drawPlatforms();}
  else drawWorld();
  ctx.restore();
  if(L.drawFx)L.drawFx();else if(L.theme==='port')drawRain();
  if(oy>0)ctx.restore();
  // el HUD del juego va pegado arriba y abajo del lienzo; los menús y pantallas, en un marco de 320×180 centrado
  SQ=S;ctx.setTransform(S,0,0,S,0,0);
  const marco=()=>ctx.setTransform(S,0,0,S,0,Math.round((HC-H)/2*S));
  if(hs){marco();histDraw();return;}
  if(state==='title'){marco();drawTitle();return;}
  if(state==='select'){marco();drawSelect();return;}
  drawHUD();
  if(state==='pause'){marco();drawPause();}
  if(state==='over'||state==='win'){marco();drawEnd();}
}
// pausa: los botones salen del último control que se tocó (btn en input.js)
function drawPause(){
  const pad=onPad();
  dim(0.6);txt('PAUSA',W/2,30,16,'#fff','center');
  txt(onTouch()?'II o ✕: seguir  ·  △ dos veces: salir al menú':pad?btn('opt')+': seguir  ·  '+btn('quit')+': salir al menú':'ESC o P: seguir  ·  Q: salir al menú',W/2,52,6,'#ddd','center');
  drawControls(66);drawWho(132);
  if(padLost){const p2=Math.abs(padLost)===2,back=padLost<0;ctx.fillStyle='rgba(18,12,24,0.92)';ctx.fillRect(30,150,260,22);ctx.fillStyle=back?'#7dff9a':'#ff6b5b';ctx.fillRect(30,150,260,1);
    txt(back?'JOYSTICK CONECTADO OTRA VEZ':(p2?'JOYSTICK DEL JUGADOR 2 DESCONECTADO':'JOYSTICK DESCONECTADO'),W/2,153,6,back?'#7dff9a':'#ff8a7a','center');
    txt(back?'Apretá '+btn('opt',{i:padLostIdx})+' o P para seguir':(p2?'Reconectalo para que siga jugando':'Reconectalo o seguí con el teclado'),W/2,162,5,'#ddd','center',false);}
  // △ (o Y, o X) dos veces sale al menú: el aviso nombra el botón del joystick que lo apretó
  if(quitArm>0&&(T>>3)%2===0)txt('¿SALIR AL MENÚ? '+btn('quit',pad||onTouch()?undefined:'pad')+' OTRA VEZ',W/2,padLost?141:150,7,'#ff8a7a','center');
}

// ================== loop ==================
let last=performance.now(),acc=0;
const STEP=1000/60;
function frame(now){
  acc+=Math.min(100,now-last);last=now;
  padState=pollPad();
  let ran=false;
  while(acc>=STEP){const r=update();acc-=STEP;if(!ran&&r!=='hold'){clearPressed();ran=true;}}
  render();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
