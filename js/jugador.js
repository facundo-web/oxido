'use strict';
// Óxido · Jugador: creación, movimiento y dibujo
// ci = personaje, mhp = corazones máximos, slot = 0 (jugador 1) o 1 (jugador 2), ah = cuadros que lleva mantenida la tecla del avión
function mkPlayer(x,y){const c=CH();return{x,y,w:8,h:18,vx:0,vy:0,face:1,onGround:false,plat:null,crouch:false,aim:'f',
  weapon:'pistol',weapons:{},bombs:c.bombs,hp:maxHp,shield:shieldRegen?3:(c.armor||0),airJ:0,inv:120,fireCd:0,anim:0,dist:0,lean:0,rec:0,landT:0,dead:false,deadT:0,drop:0,ride:null,
  ci:charIdx,col:colDe(charIdx,inSlot),mhp:maxHp,slot:inSlot,ah:0,out:false,back:false};}
// color del jugador (personajes.js): el que eligió para ese personaje; de a 2, nunca igual al del otro
function colDe(ci,slot){if(slot===0)return p1Col[ci];const o=players[0];let c=p2Col[ci];if(o&&o.ci===ci&&o.col===c)c=(c+1)%N_COL;return c;}
// ================== 2 jugadores ==================
// Casi todo el juego lee el global P (y CH(), maxHp, held/tapped). usePlayer(p) los apunta a ese jugador.
// Fuera de step() y render(), P es siempre el jugador 1.
function usePlayer(p){if(P&&P.mhp!==undefined)P.mhp=maxHp;P=p;charIdx=p.ci;maxHp=p.mhp;inSlot=p.slot;}
function withP(p,fn){const k=P;usePlayer(p);try{return fn(p);}finally{usePlayer(k);}}
function eachPlayer(fn){const k=P;for(const p of players){usePlayer(p);fn(p);}usePlayer(k);}
const twoP=()=>players.length>1;
const pCenter=p=>p.ride?{x:p.ride.x+p.ride.w/2,y:p.ride.y+p.ride.h/2}:{x:p.x+4,y:p.y+9};
// el jugador vivo más cercano a (x,y); si no hay ninguno vivo, el jugador 1
function nearestPlayer(x,y){
  let best=null,bd=1e9;
  for(const p of players){if(p.dead)continue;const c=pCenter(p),d=Math.hypot(c.x-x,c.y-y);if(d<bd){bd=d;best=p;}}
  return best||players[0];
}
// el que va más adelante (la cámara lo sigue)
function leadP(){let best=null;for(const p of players)if(!p.dead&&(!best||p.x>best.x))best=p;return best||players[0];}
// algún jugador vivo toca la caja
const touchAny=box=>players.some(p=>!p.dead&&overlap(hurtbox(p),box));
// algún jugador vivo está a menos de d en x
const nearAny=(x,d)=>players.some(p=>!p.dead&&Math.abs(p.x+4-x)<d);
// cada jugador con el color que eligió (personajes.js)
const playerSet=p=>charSet(p.ci,p.col);
const playerHelmet=p=>p.col?colMuestra(p.ci,p.col):CHARS[p.ci].helmet;
const P_COL=['#ffe08a','#7ad8ff']; // color de cada jugador (cartelito sobre la cabeza y HUD)
function respawnPlayer(p){
  const i=players.indexOf(p);let x=camX+xLibre(40);
  if(twoP()){const o=players.find(q=>q!==p&&!q.dead);if(o)x=clamp((o.ride?o.ride.x+8:o.x)+(o.face>0?-14:14),camX+10,camX+VW-30);}
  P=mkPlayer(x,-24);P.mhp=p.mhp;players[i]=P;giveStart();
  setBanner(twoP()?'¡VUELVE EL JUGADOR '+(p.slot+1)+'!':'¡DE NUEVO AL FRENTE!',70);
}
// ================== update ==================
function updPlayer(){
  const p=P;
  if(p.dead){
    // 2 jugadores: el que quedó afuera vuelve si aparece una vida (premio o jefe)
    if(p.out){if(lives>0&&!winT){lives--;p.out=false;respawnPlayer(p);}return;}
    if(--p.deadT<=0){
      if(!twoP()){
        if(lives<0){saveRecord();state='over';overT=0;jingle('over');}
        else respawnPlayer(p);
      }else if(p.back)respawnPlayer(p);
      else if(players.some(o=>o!==p&&(!o.dead||(o.back&&!o.out)))){p.out=true;setBanner('JUGADOR '+(p.slot+1)+': SIN VIDAS',90);}
      else{saveRecord();state='over';overT=0;jingle('over');}
    }
    return;
  }
  updAirCharge();
  if(shieldRegen&&p.shield<3&&T%900===0){const a=p.shield;p.shield++;SFX.shield();RC_sumaJug(p,'sh',a);} // vuela a su lugar (recolectar.js)
  if(p.ride){updMech(p.ride);if(p.inv>0)p.inv--;return;}
  const c=CH();
  const Lk=held('left'),R=held('right'),U=held('up'),D=held('down');
  const mv=(R?1:0)-(Lk?1:0);
  p.crouch=D&&p.onGround;
  if(mv)p.face=mv;
  p.vx=mv*(p.crouch?0.6:c.speed)*(L.speedMul?L.speedMul(p):1); // speedMul: gancho por misión (barro)
  const agua=typeof CA_nada==='function'&&CA_nada(p); // nadando (caminos en capas, caminos.js)
  if(agua){}
  else if(tapped('jump')&&p.onGround){
    if(D&&p.plat){p.y+=3;p.onGround=false;p.plat=null;p.drop=8;p.crouch=false;}
    else{p.vy=-c.jump;p.onGround=false;p.plat=null;p.crouch=false;SFX.jump();dust(p.x+4,p.y+18);}
  }else if(tapped('jump')&&!p.onGround&&p.airJ<(c.airJump||0)&&p.drop<=0){
    p.airJ++;p.vy=-c.jump*0.85;SFX.jump();parts.push({k:'ring',x:p.x+4,y:p.y+18,r:2,max:7,life:10,maxl:10,col:'180,230,255'});
  }
  if(p.onGround)p.airJ=0;
  p.x=clamp(p.x+p.vx,camX+2-(typeof MC_margenIzq==='function'?MC_margenIzq():0),camX+VW-10+(typeof MC_margen==='function'?MC_margen():0)); // al ganar sale caminando (cumplida.js)
  if(typeof CA_paredes==='function')CA_paredes(p); // abajo, el agua tiene paredes y techo (caminos.js)
  const pb=p.y+p.h,wasAir=!p.onGround;
  if(agua)CA_nadar(p,c,D);else{p.vy=Math.min(p.vy+0.32,6);p.y+=p.vy;}
  if(p.drop>0)p.drop--;
  const vyAntes=p.vy;
  land(p,pb,p.drop<=0);
  animStep(p,wasAir,vyAntes);
  if(wasAir&&p.onGround)dust(p.x+4,p.y+18);
  p.aim=U?'up':(D&&!p.onGround?'down':'f');
  // cambiar arma (tocar) y la rueda (mantener): rueda.js, en cada cuadro real
  if(p.fireCd>0)p.fireCd--;
  if(tapped('shoot')&&p.weapon==='pistol'&&p.fireCd<=6)p.fireCd=0;
  if(held('shoot')&&p.fireCd<=0){const w=p.weapon;fire();p.fireCd=Math.max(2,Math.round(WEAPONS[w].cd*fireMul*c.cd));
    if(w==='pistol'&&typeof ACC_auto==='function'&&ACC_auto())p.fireCd=Math.min(p.fireCd,6);} // DISPARO AUTOMÁTICO: mantener = tan seguido como tocando (accesible.js)
  // con 2 jugadores, cada uno puede tener 3 granadas en el aire
  if(tapped('bomb')&&p.bombs>0&&(twoP()?grens.filter(g=>g.own===p.slot).length:grens.length)<3){
    p.bombs--;grens.push({x:p.x+4+p.face*4,y:p.y+4,vx:p.face*2.3+p.vx*0.4,vy:-3.4,t:0,b:0,rot:0,own:p.slot,gr:c.grenadeR||1});SFX.toss();
  }
  if(p.inv>0)p.inv--;
  if(p.onGround&&p.vx)p.anim++;
  const subir=U||(typeof simpleDe==='function'&&simpleDe(p.slot)&&heldRaw('up')); // controles simples: ↑ (que también salta) sube
  for(const m of mechs)if(!m.ride&&!m.dying&&m.cool<=0&&subir&&overlap(hurtbox(),m)){enterMech(m);break;}
}
function drawPlayer(){
  const p=P;if(p.dead||p.ride)return;
  const blink=p.inv>2&&(T>>2)%2;
  const f=p.face>0?0:1,set=playerSet(p);
  const sy=p.crouch?p.y+3:p.y;
  // retroceso: el arma se corre hacia atrás sobre su eje; el cuerpo acompaña un poco
  let gx=0,gy=0;
  if(!blink){
    if(p.crouch){gx=-p.face*(p.rec||0)*0.35;ctx.drawImage(set.crouch[f],q(p.x-3+gx),q(sy));}
    else{
      const pose=rigPose(p);
      if(p.aim==='up'){pose.ux=p.lean;pose.uy+=Math.min(1,Math.round((p.rec||0)*0.4));}
      drawRig(set,pose,f,p.x-3,p.y);gx=pose.ux;gy=pose.uy;
    }
    ctx.save();ctx.translate(q(p.x+4+p.face*2+gx),q(sy+9.5+gy+(p.crouch?0:set.dy||0)));if(p.face<0)ctx.scale(-1,1);
    ctx.rotate(p.aim==='up'?-Math.PI/2:p.aim==='down'?Math.PI/2:0);
    ctx.translate(-q(p.rec||0),0);
    if(!p.sinArma)drawGunShape(p.weapon,p.fireCd<4);ctx.restore(); // sinArma: el gesto del collar de OLIVER (oliver.js), para que el arma no tape el brazo
  }
  if(p.shield>0){
    // anillo de píxeles de 1 px que titila lento entre 2 tonos de celeste (quieto con MOVIMIENTO REDUCIDO): Dirección de Arte
    aroPix(p.x+4,sy+(p.crouch?7:9),11,p.crouch?11:13,escudoTono(p));
  }
}
// 2 jugadores: número arriba de la cabeza (también arriba del Grillo). Se esconde mientras carga el avión.
function drawPlayerTag(){
  const p=P;if(!twoP()||p.dead||p.ah>AIR_TAP)return;
  const top=p.ride?p.ride.y:p.y+(p.crouch?3:0),cx=p.ride?p.ride.x+p.ride.w/2:p.x+4,col=P_COL[p.slot],y=Math.round(top-9);
  ctx.fillStyle='#120c18';ctx.fillRect(cx-3,y-0.5,6,6.5);ctx.fillStyle=col;ctx.fillRect(cx-2.5,y,5,5.5);
  ctx.beginPath();ctx.moveTo(cx-1.5,y+5.5);ctx.lineTo(cx+1.5,y+5.5);ctx.lineTo(cx,y+7);ctx.fill();
  txt(String(p.slot+1),cx,y+0.3,5,'#120c18','center',false);
}
