'use strict';
// Óxido · Misión 9: Ciudad embrujada (una calle de ladrillo de los años 40, de noche, con niebla y luna grande)
// Todo lo de este archivo usa el prefijo M9_ para no chocar con otros nombres globales.
// La acción de la misión: los fantasmas ATRAVIESAN las paredes y el piso. Salen de adentro de los edificios,
// suben desde las baldosas, cruzan las plataformas, se meten adentro de las coberturas y salen de golpe.
// Son translúcidos y flotan: las balas los atraviesan. Antes de atacar se ponen SÓLIDOS y brillan
// (campanita de vidrio + halo celeste): recién ahí se les puede pegar.

// ================== datos de la misión ==================
const M9_LVL={name:'MISIÓN 9 · CIUDAD EMBRUJADA',short:'9 · CIUDAD EMBRUJADA',theme:'embrujada',end:3400,music:'l9',
  // bajas: descansos de escalera de incendio colgados de la pared
  platforms:[{x:250,y:130,w:50},{x:330,y:122,w:56},{x:440,y:110,w:50},{x:700,y:124,w:70},{x:830,y:100,w:56},{x:960,y:124,w:60},
    {x:1150,y:126,w:50},{x:1330,y:110,w:50},{x:1690,y:122,w:60},{x:1790,y:102,w:50},
    {x:2220,y:124,w:56},{x:2380,y:108,w:50},{x:2620,y:122,w:70},{x:2760,y:104,w:60},{x:2830,y:126,w:56},{x:2990,y:118,w:50},
    // altas: la marquesina de un teatro, un cartelón con lamparitas y un balcón de piedra
    {x:872,y:62,w:40,hi:'marquesina'},{x:1836,y:64,w:44,hi:'cartelon'},{x:2800,y:62,w:40,hi:'balcon'},
    // escalones en la arena del villano: cómodas viejas que se movieron solas
    {x:3120,y:128,w:34,step:1},{x:3196,y:110,w:34,step:1}],
  // pasaje techado: la boca de un subte abandonado (el techo es plataforma)
  tunnels:[{x:1480,w:126,y:116,k:'pasaje'}],
  // pilas de baúles viejos
  pyramids:[{x:1940,w:150,n:4,dy:24,inset:14,mats:['#5a3424','#34405a','#4e2a44','#6a5226']}],
  covers:[{x:680,w:24,h:15,k:'kiosco',hp:12},{x:1112,w:22,h:15,k:'tachos',hp:8},{x:1390,w:24,h:14,k:'valijas',hp:10},
    {x:1850,w:24,h:15,k:'kiosco',hp:12},{x:2186,w:22,h:15,k:'tachos',hp:8},{x:2520,w:24,h:14,k:'valijas',hp:10},
    {x:3030,w:22,h:15,k:'tachos',hp:8},{x:3160,w:24,h:15,k:'kiosco',hp:16}],
  crates:[{x:200,drop:'H'},{x:400,drop:'G'},{x:640,drop:'R'},{x:1010,drop:'E'},{x:1190,drop:'+'},{x:1420,drop:'F'},{x:1800,drop:'S'},
    {x:2300,drop:'G'},{x:2640,drop:'+'},{x:2975,drop:'R'},{x:3060,drop:'E'}],
  extraCrates:[{x:500,p:0.45},{x:884,y:62,p:0.7},{x:1848,y:64,p:0.6},{x:2812,y:62,p:0.6}],
  turrets:[1890,2720],mechs:[1740],
  prisoners:[{x:290,k:'ally'},{x:845,y:100,k:'item'},{x:1530,k:'item'},{x:1800,y:102,k:'ally'},{x:2010,y:60,k:'item'},
    {x:2300,k:'item'},{x:2775,y:104,k:'item'},{x:3010,k:'ally'}],
  extraPrisoners:[{x:1850,y:64,p:0.75,k:'ally'},{x:2580,p:0.4,k:'item'}],
  decor:[{x:30,k:'farol'},{x:118,k:'hidrante'},{x:186,k:'cartel'},{x:300,k:'persiana'},{x:380,k:'farol'},{x:520,k:'reloj'},
    {x:600,k:'persiana'},{x:760,k:'farol'},{x:920,k:'cartel'},{x:1046,k:'hidrante'},{x:1130,k:'farol'},{x:1290,k:'persiana'},
    {x:1446,k:'farol'},{x:1650,k:'cartel'},{x:2112,k:'farol'},{x:2236,k:'persiana'},{x:2330,k:'reloj'},{x:2540,k:'farol'},
    {x:2600,k:'cartel'},{x:2690,k:'persiana'},{x:2770,k:'farol'},{x:2930,k:'hidrante'},{x:2966,k:'farol'},{x:3090,k:'reloj'},{x:3250,k:'farol'}],
  events:[
    {at:20,spawn:[{t:'soldier',x:'R',d:70}]},
    {at:110,spawn:[{t:'soldier',x:450,y:92}]},
    {at:170,spawn:[{t:'m9Sabana',x:'R',d:20}]},
    {at:240,spawn:[{t:'grenadier',x:'R'},{t:'soldier',x:'R',d:50},{t:'m9Farol',x:'R',d:120}]},
    {at:400,spawn:[{t:'m9Sabana',x:'R'},{t:'soldier',x:'R',d:70}]},
    {at:560,spawn:[{t:'soldier',x:845,y:82},{t:'drone',x:'R',d:30},{t:'m9Sabana',x:'L',d:60}]},
    {at:700,spawn:[{t:'shield',x:'R'},{t:'grenadier',x:'R',d:60},{t:'m9Farol',x:'R',d:110}]},
    {at:1200,spawn:[{t:'soldier',x:1700,y:104},{t:'m9Sabana',x:1650,d:30}]},
    {at:1320,spawn:[{t:'grenadier',x:1800,y:84},{t:'m9Farol',x:'R',d:40}]},
    // cofre blindado adentro del pasaje: al acercarte viene una oleada grande
    {at:1380,spawn:[{t:'shield',x:'R'},{t:'soldier',x:'L',d:30},{t:'grenadier',x:'R',d:60},{t:'drone',x:'L',d:90},{t:'m9Sabana',x:'R',d:110},{t:'soldier',x:'R',d:130},{t:'soldier',x:'L',d:170}]},
    {at:1460,spawn:[{t:'shield',x:'R'},{t:'soldier',x:'R',d:40},{t:'drone',x:'R',d:90}]},
    {at:1820,spawn:[{t:'drone',x:'R'},{t:'soldier',x:2000,y:42,d:20},{t:'m9Sabana',x:'R',d:40},{t:'soldier',x:'R',d:70},{t:'shield',x:'R',d:120}]},
    {at:2260,spawn:[{t:'m9Sabana',x:2330},{t:'m9Farol',x:'R',d:30},{t:'soldier',x:2640,y:104},{t:'shield',x:'R',d:30}]},
    {at:2380,spawn:[{t:'soldier',x:2780,y:86},{t:'soldier',x:'R',d:20},{t:'drone',x:'R',d:80}]},
    {at:2520,spawn:[{t:'m9Sabana',x:'R'},{t:'soldier',x:'R',d:60}]},
    {at:2740,spawn:[{t:'m9Farol',x:'L',d:20},{t:'grenadier',x:'R',d:70}]},
    {at:2860,spawn:[{t:'shield',x:'R'},{t:'m9Sabana',x:2930,d:30},{t:'drone',x:'R',d:90}]}],
  arenas:[
    // jefe chico a un tercio; después juego normal y una emboscada; el villano al final (nunca seguidos)
    {at:1100,mini:true},
    {at:2160,waves:[
      [{t:'soldier',x:'R'},{t:'m9Sabana',x:'L',d:30},{t:'soldier',x:'L',d:60}],
      [{t:'drone',x:'R'},{t:'m9Sabana',x:'R',d:20},{t:'m9Farol',x:'R',d:60},{t:'grenadier',x:'R',d:60}],
      [{t:'shield',x:'R'},{t:'m9Sabana',x:'R',d:30},{t:'soldier',x:'L',d:50},{t:'drone',x:'R',d:110}]]},
    {at:3080,boss:true}],
  vaults:[{x:1572}]};
for(const t of M9_LVL.tunnels)M9_LVL.platforms.push({x:t.x,y:t.y,w:t.w,roof:t});
for(const p of M9_LVL.pyramids)for(let i=0;i<p.n;i++)
  M9_LVL.platforms.push({x:p.x+i*p.inset,y:GROUND-(i+1)*p.dy,w:p.w-2*i*p.inset,pyr:p,tier:i,mat:p.mats[i%p.mats.length]});
M9_LVL.events.sort((a,b)=>a.at-b.at);
const M9_IDX=LEVELS.push(M9_LVL)-1;
NV_COSTO.m9Sabana=1.2;NV_COSTO.m9Farol=1.3;
COB_COL.kiosco=['#2e3a34','#5a6a52'];COB_COL.tachos=['#44444e','#6a6a76'];COB_COL.valijas=['#5a3424','#8a5a3a'];
KILL_NAMES.push(['m9Sabana','sábanas'],['m9Farol','faroles']);

// ================== utilidades ==================
const M9_sfx=(n,...a)=>{if(typeof SFX!=='undefined'&&SFX[n])SFX[n](...a);};
function M9_pc(p){p=p||P;return p.ride?{x:p.ride.x+p.ride.w/2,y:p.ride.y+p.ride.h/2}:{x:p.x+4,y:p.y+9};}
const M9_ease=t=>t<0?0:t>1?1:t*t*(3-2*t);
const M9_HIDE=GROUND+70;
// colores propios: hueso, lila, celeste
const M9_HUESO='#efe6d2',M9_LILA='#b9a3d8',M9_CEL='#9fe3ff';
function M9_mist(x,y,n,col){for(let i=0;i<n;i++)parts.push({k:'smoke',col:col||(i%2?'200,190,230':'170,220,240'),x:x+rand(-4,4),y:y+rand(-3,3),vx:rand(-0.3,0.3),vy:rand(-0.4,-0.1),life:rand(22,34),maxl:34,size:rand(1.2,2.2),rise:1});}
function M9_glint(x,y,n){for(let i=0;i<n;i++)parts.push({k:'p',x:x+rand(-6,6),y:y+rand(-6,6),vx:rand(-0.3,0.3),vy:rand(-0.6,-0.1),g:0,life:rand(10,18),maxl:18,size:1,col:i%2?'#fff':M9_CEL});}
// las chapitas de puntos de un fantasma que muere escondido (x=-9999) salen de donde se lo ve
function M9_fixCoins(e){
  if(typeof RC_chapas==='undefined')return;
  for(const c of RC_chapas)if(c.x<-1000){c.x=e.gx+e.w/2+rand(-3,3);c.y=Math.min(GROUND-4,e.gy+e.h/2);}
}

// ================== estado que se reinicia en cada partida ==================
const M9={hid:new Map(),told:0,flick:0,tram:null,tramCd:600,mansion:0,shut:new Map(),hush:0};
function M9_reset(){M9.hid=new Map();M9.told=0;M9.flick=0;M9.tram=null;M9.tramCd=420;M9.mansion=0;M9.shut=new Map();M9.hush=0;
  // fondos y frentes se arman una sola vez al entrar a la misión (así no hay tirones al avanzar)
  if(L===M9_LVL){const cs=[M9_skyCanvas(),M9_farCanvas(),M9_midCanvas(),M9_streetCanvas(),...M9_BLD.map(M9_bldCanvas)];
    // se dibujan una vez en un rincón (el cuadro siguiente lo tapa) para que el navegador ya los tenga listos
    ctx.save();ctx.setTransform(1,0,0,1,0,0);for(const c of cs)ctx.drawImage(c,0,0,1,1);ctx.restore();}}
ON_START.push(M9_reset);

// ================== fantasmas: lo común ==================
// Cada fantasma lleva su lugar a la vista en gx,gy. Mientras es translúcido, su caja se corre lejos (x=-9999):
// así las balas, las granadas, el gatito y la puntería lo atraviesan. Sólido: la caja vuelve a gx,gy.
const M9_isGhost=e=>e&&(e.type==='m9Sabana'||e.type==='m9Farol');
function M9_tang(e,on){if(on){e.x=e.gx;e.y=e.gy;}else{e.x=-9999;e.y=M9_HIDE;}e.hx=e.gx;e.solid=on;}
function M9_n(t){let n=0;for(const e of enemies)if(e.type===t&&!e.gone)n++;return n;}
function M9_dummy(t){return{type:t,gone:true,x:-9999,y:M9_HIDE,w:1,h:1,hp:1,cd:0,score:0};}
function M9_go(e,st,t){e.st=st;e.t=t||0;}
function M9_onX(e,m){return e.gx>camX+(m||0)&&e.gx+e.w<camX+W-(m||0);}
// cobertura libre en pantalla para esconderse
function M9_freeCover(near){
  if(typeof coberturas==='undefined')return null;
  let best=null,bd=1e9;
  for(const c of coberturas){if(c.vida<=0||M9.hid.has(c)||c.x<camX+16||c.x+c.w>camX+W-16)continue;
    const d=Math.abs(c.x+c.w/2-near);if(d<bd){bd=d;best=c;}}
  return best;
}
// primer aviso de la misión
function M9_tell(n){
  if(n===1&&M9.told<1){M9.told=1;setBanner('¡FANTASMAS EN LA CALLE!',110);}
  if(n===2&&M9.told<2){M9.told=2;setBanner('¡PEGALES CUANDO BRILLAN!',110);}
}

// ================== SÁBANA (la criatura principal) ==================
// Sábana vieja con dos ojos huecos y el ruedo que ondula. Translúcida y lila, flota y atraviesa todo.
// Ciclo: aparece (de una pared, del piso o de una cobertura) → flota hacia un costado del jugador →
// SE PONE SÓLIDA: blanco hueso, halo celeste, ojos que brillan, campanita y una línea de puntos hacia donde va →
// embiste en línea recta (se esquiva saltando o corriéndose) → se queda sólida un momento → se apaga y se mete
// en una cobertura (la cobertura tiembla y se le ven los ojos antes de salir de golpe) o se hunde en el piso
// (se ve la sombra que avanza por abajo) o vuelve a flotar. Después de tres embestidas se va (sin puntos).
const M9_MAXS=5;
function M9_newSab(o){
  if(M9_n('m9Sabana')>=M9_MAXS)return null;
  return Object.assign({type:'m9Sabana',x:-9999,y:M9_HIDE,w:12,h:16,hp:3,face:-1,flash:0,score:200,cd:0,
    st:'drift',t:0,gx:0,gy:0,vx:0,vy:0,alpha:0,anim:rand(0,99),life:0,cyc:0,ax:0,ay:0,dt:rand(60,100),side:1,oy:0,
    cov:null,hitL:false,ty:0,rise:1.4,burst:false,solid:false,
    upd:M9_updSab,draw:M9_drawSab,onKill:M9_killGhost},o);
}
function M9_mkSab(x,y){
  const fromR=Math.abs(x-(camX+W+12))<0.5,fromL=Math.abs(x-(camX-20))<0.5;
  let e=null;M9_tell(1);
  if(fromR||fromL){
    const r=Math.random(),cov=r<0.3?M9_freeCover(fromR?camX+W-60:camX+60):null;
    if(cov){e=M9_newSab({st:'hide',cov,gx:cov.x+cov.w/2-6,gy:cov.top,alpha:0});if(e)M9.hid.set(cov,e);}
    else if(r<0.65){const wx=fromR?camX+W-rand(36,70):camX+rand(30,64);   // sale de la pared del edificio
      e=M9_newSab({st:'wall',t:40,gx:wx,gy:rand(60,104),face:fromR?-1:1});if(e)M9_sfx('m9Aparece');}
    else e=M9_newSab({st:'drift',gx:fromR?camX+W+16:camX-28,gy:rand(70,110),face:fromR?-1:1,alpha:0.4});
  }else{
    const gx=clamp(x,camX+24,camX+W-36);
    if(y!==undefined&&y<GROUND-30){e=M9_newSab({st:'wall',t:40,gx,gy:clamp(y-10,40,110)});if(e)M9_sfx('m9Aparece');}
    else{e=M9_newSab({st:'floor',gx,gy:GROUND+2,ty:GROUND-32,rise:1.2});if(e)M9_sfx('m9Aparece');}
  }
  if(e){e.hx=e.gx;e.side=Math.random()<0.5?-1:1;}
  return e||M9_dummy('m9Sabana');
}
// sábana que sale de un punto (la usan los jefes): de la pared o del piso
function M9_sabAt(x,floor){
  const e=M9_newSab(floor?{st:'floor',gx:x,gy:GROUND+2,ty:GROUND-34,rise:1.6}:{st:'wall',t:34,gx:x,gy:rand(64,100)});
  if(e){e.hx=e.gx;e.side=Math.random()<0.5?-1:1;e.hp=Math.max(1,Math.round(e.hp*DIFF().ehp));enemies.push(e);M9_sfx('m9Aparece');}
  return e;
}
function M9_toDrift(e){M9_go(e,'drift');e.dt=rand(55,95);e.side=-e.side;e.oy=rand(-16,4);}
function M9_updSab(e){
  if(e.flash>0)e.flash--;e.anim++;e.life++;
  if(e.kbx){e.gx+=e.kbx;e.kbx*=0.5;if(Math.abs(e.kbx)<0.15)e.kbx=0;}
  const pl=P.dead?null:M9_pc();
  const hiddenSt=e.st==='hide'||e.st==='rattle'||e.st==='under';
  if(e.st!=='leave'&&!hiddenSt&&(e.life>1600||(e.gx<camX-60&&!lock)))M9_go(e,'leave');
  switch(e.st){
  case 'wall': // sale de adentro del edificio: ondas en la pared y la sábana que se despega
    M9_tang(e,false);e.alpha=Math.min(0.45,e.alpha+0.015);e.gx+=e.face*0.12;
    if(--e.t<=0)M9_toDrift(e);
    return;
  case 'floor': // sube desde las baldosas
    M9_tang(e,false);e.alpha=Math.min(e.burst?0.7:0.45,e.alpha+0.03);e.gy-=e.rise;
    if(e.anim%5===0)M9_mist(e.gx+6,GROUND-1,1);
    if(e.gy<=e.ty){e.gy=e.ty;if(e.burst){M9_go(e,'solid',24);M9_sfx('m9Solido');}else M9_toDrift(e);}
    return;
  case 'drift':{
    M9_tang(e,false);e.alpha+=(0.42-e.alpha)*0.08;
    if(pl){const tx=clamp(pl.x+e.side*48-6,camX+12,camX+W-24),ty=clamp(pl.y-16+e.oy,30,GROUND-34);
      const dx=tx-e.gx,dy=ty-e.gy;
      e.vx=clamp(e.vx+dx*0.004,-0.95,0.95);e.vy=clamp(e.vy+dy*0.005,-0.6,0.6);e.vx*=0.97;e.vy*=0.95;
      e.face=pl.x<e.gx+6?-1:1;}
    e.gx+=e.vx;e.gy+=e.vy+Math.sin(e.anim/14)*0.22;
    if(e.anim%80===40&&M9_onX(e,-20))M9_sfx('m9Lamento',0.5);
    if(++e.t>=e.dt&&M9_onX(e,6)&&pl){M9_go(e,'solid',36);M9_sfx('m9Solido');}
    return;}
  case 'solid':{ // AVISO: se pone sólido y brilla (ya se le puede pegar)
    M9_tang(e,true);M9_tell(2);e.alpha=Math.min(1,e.alpha+0.14);e.vx*=0.8;e.vy*=0.8;
    e.gy+=Math.sin(e.anim/6)*0.15;e.x=e.gx;e.y=e.gy;
    if(pl&&e.t>10){e.ax=pl.x;e.ay=pl.y-2;e.face=pl.x<e.gx+6?-1:1;e.aim=1;}
    if(!e.aim){e.ax=e.gx+6+e.face*40;e.ay=e.gy+8;}
    if(e.t%6===0)M9_glint(e.gx+6,e.gy+7,1);
    M9.flick=Math.max(M9.flick,4);
    if(--e.t<=0){
      const cx=e.gx+6,cy=e.gy+8,dx=e.ax-cx,dy=e.ay-cy,d=Math.hypot(dx,dy)||1,sp=2.7;
      e.vx=dx/d*sp;e.vy=dy/d*sp;e.t=Math.min(50,Math.round((d+30)/sp));e.st='swoop';e.hitL=false;M9_sfx('m9Embiste');}
    return;}
  case 'swoop':
    M9_tang(e,true);e.gx+=e.vx;e.gy=clamp(e.gy+e.vy,22,GROUND-e.h);e.x=e.gx;e.y=e.gy;
    if(e.anim%2===0)parts.push({k:'p',x:e.gx+6+rand(-4,4),y:e.gy+rand(4,16),vx:-e.vx*0.2,vy:rand(-0.2,0.2),g:0,life:14,maxl:14,size:1,col:i9col(e.anim)});
    if(!e.hitL)for(const p of players)if(!p.dead&&overlap(hurtbox(p),{x:e.gx+1,y:e.gy+1,w:e.w-2,h:e.h-1})){withP(p,()=>hurtPlayer(1));e.hitL=true;break;}
    if(--e.t<=0){M9_go(e,'rec',28);}
    return;
  case 'rec':
    M9_tang(e,true);e.vx*=0.85;e.vy*=0.85;e.gx+=e.vx;e.gy=clamp(e.gy+e.vy-0.15,22,GROUND-e.h);e.x=e.gx;e.y=e.gy;
    if(--e.t<=0){M9_go(e,'fade',16);M9_sfx('m9Aparece');}
    return;
  case 'fade':{
    M9_tang(e,false);e.alpha=Math.max(0.4,e.alpha-0.04);
    if(--e.t>0)return;
    e.cyc++;
    if(e.cyc>=3){M9_go(e,'leave');return;}
    const r=Math.random(),cov=r<0.45?M9_freeCover(e.gx):null;
    if(cov){e.cov=cov;M9_go(e,'toCov');M9.hid.set(cov,e);}
    else if(r<0.75&&e.gy>GROUND-60){M9_go(e,'sink');}
    else M9_toDrift(e);
    return;}
  case 'toCov':{ // se mete adentro de la cobertura
    M9_tang(e,false);const c=e.cov;
    if(!c||c.vida<=0){M9.hid.delete(c);M9_toDrift(e);return;}
    const tx=c.x+c.w/2-6,ty=c.top-2,dx=tx-e.gx,dy=ty-e.gy,d=Math.hypot(dx,dy);
    e.gx+=clamp(dx,-1.4,1.4);e.gy+=clamp(dy,-1.2,1.2);
    if(d<14)e.alpha=Math.max(0,e.alpha-0.06);
    if(d<2&&e.alpha<=0.05){M9_go(e,'hide');M9_mist(c.x+c.w/2,c.top+4,3);}
    return;}
  case 'hide':{ // escondido: se le ven los ojitos entre las rendijas
    M9_tang(e,false);e.alpha=0;const c=e.cov;
    if(!c||c.vida<=0){M9.hid.delete(c);M9_burst(e);return;}
    if(c.x+c.w<camX-6){M9.hid.delete(c);e.gone=true;return;}
    e.gx=c.x+c.w/2-6;e.gy=c.top-2;e.t++;
    const near=players.some(p=>!p.dead&&Math.abs(M9_pc(p).x-(c.x+c.w/2))<96);
    if(c.x>camX+8&&c.x+c.w<camX+W-8&&(near||e.t>(lock?220:600))){M9_go(e,'rattle',40);M9_sfx('m9Lamento',1);}
    return;}
  case 'rattle': // AVISO: la cobertura tiembla, larga niebla y los ojos se prenden
    M9_tang(e,false);
    {const c=e.cov;if(!c||c.vida<=0){M9.hid.delete(c);M9_burst(e);return;}
     if(e.t%7===0)M9_mist(c.x+rand(2,c.w-2),c.top+rand(0,4),1);
     if(e.t%10===0)M9_sfx('m9Persiana',0.35);}
    if(--e.t<=0){M9.hid.delete(e.cov);M9_burst(e);}
    return;
  case 'sink': // se hunde en el piso
    M9_tang(e,false);e.gy+=1.3;e.alpha=Math.max(0.3,e.alpha-0.005);
    if(e.gy>=GROUND+2){M9_go(e,'under');e.gy=GROUND+4;}
    return;
  case 'under':{ // viaja por abajo: se ve una sombra con ondas que avanza
    M9_tang(e,false);e.t++;
    if(pl){const dx=pl.x-6-e.gx;e.gx+=clamp(dx,-1.25,1.25);e.face=dx<0?-1:1;
      if((Math.abs(dx)<4&&e.t>30)||e.t>110){e.gx=clamp(e.gx,camX+16,camX+W-28);M9_go(e,'floor');e.ty=Math.max(GROUND-34,pl.y-8);e.rise=1.8;e.burst=true;e.alpha=0.5;M9_sfx('m9Aparece');}}
    else if(e.t>110)M9_go(e,'leave');
    if(e.t%6===0)M9_mist(e.gx+6,GROUND-1,1,'150,130,190');
    return;}
  case 'leave':
    M9_tang(e,false);e.alpha-=0.02;e.gy-=0.5;
    if(e.alpha<=0.02){if(e.cov)M9.hid.delete(e.cov);e.gone=true;}
    return;
  }
}
const i9col=a=>a%3?'rgba(239,230,210,0.8)':'#9fe3ff';
function M9_burst(e){ // sale de golpe de la cobertura, ya sólida
  const c=e.cov;e.cov=null;
  if(c){e.gx=c.x+c.w/2-6;e.gy=c.top-18;dust(c.x+c.w/2,GROUND,4);M9_mist(c.x+c.w/2,c.top,5);
    for(let i=0;i<6;i++)parts.push({k:'p',x:c.x+rand(0,c.w),y:c.top+rand(0,4),vx:rand(-1.4,1.4),vy:rand(-2.2,-0.6),g:0.14,life:rand(16,26),maxl:26,size:1,col:i%2?'#d8ccb0':'#6a6070'});}
  e.alpha=1;M9_go(e,'solid',20);M9_tang(e,true);M9_sfx('m9Solido');M9_sfx('m9Persiana',1);
}
function M9_killGhost(e){
  M9_fixCoins(e);if(e.cov)M9.hid.delete(e.cov);
  M9_sfx('m9Muere');
  const cx=e.gx+e.w/2,cy=e.gy+e.h/2;
  for(let i=0;i<10;i++)parts.push({k:'p',x:cx+rand(-4,4),y:cy+rand(-5,5),vx:rand(-1.2,1.2),vy:rand(-1.8,-0.2),g:-0.01,life:rand(18,32),maxl:32,size:i%3?1:1.5,col:i%3===0?M9_CEL:i%3===1?M9_HUESO:M9_LILA});
  parts.push({k:'ring',x:cx,y:cy,r:2,max:12,life:12,maxl:12,col:'159,227,255'});
  M9_mist(cx,cy,4);
}
// dibujo: sábana con ruedo ondulado; translúcida (lila) o sólida (hueso, con halo)
function M9_sheet(x,y,a,solid,face,anim,glow,fl,mouth){
  ctx.save();ctx.globalAlpha=a;ctx.translate(q(x+6),q(y));if(face<0)ctx.scale(-1,1);
  const w=Math.sin(anim/5),body=fl?'#fff':solid?M9_HUESO:M9_LILA,shade=fl?'#fff':solid?'#c9bfe0':'#8a78b0';
  const path=()=>{ctx.beginPath();ctx.moveTo(-6,10);ctx.quadraticCurveTo(-6.5,0,0,-0.5);ctx.quadraticCurveTo(6.5,0,6,10);
    ctx.lineTo(7.2+w*0.6,16);
    for(let i=0;i<4;i++){const xx=7.2-(i+1)*3.6,yy=16+(i%2?1.6:-0.4)+Math.sin(anim/4+i)*0.9;ctx.quadraticCurveTo(xx+1.8,yy+2.2,xx,yy);}
    ctx.lineTo(-6,10);ctx.closePath();};
  if(solid&&!fl){ctx.fillStyle='#2a1f3a';ctx.save();ctx.translate(0,0);ctx.scale(1.12,1.07);ctx.translate(0,-0.5);path();ctx.fill();ctx.restore();}
  ctx.fillStyle=body;path();ctx.fill();
  if(!fl){ctx.fillStyle=shade;ctx.beginPath();ctx.moveTo(-6,10);ctx.quadraticCurveTo(-6.3,2,-2,0.4);ctx.quadraticCurveTo(-4.4,4,-3.4,15);ctx.lineTo(-6,15);ctx.closePath();ctx.fill();
    // pliegue del brazo
    ctx.strokeStyle=shade;ctx.lineWidth=0.6;ctx.beginPath();ctx.moveTo(2,8);ctx.quadraticCurveTo(5+w*0.5,10,3.6,13);ctx.stroke();
    // ojos huecos
    const ec=glow?((T>>1)%2?'#ffffff':M9_CEL):solid?'#2a1f3a':'#3a2c52';
    ctx.fillStyle=ec;ctx.beginPath();ctx.ellipse(1.2,4.6,1.2,1.9,0,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(4.2,4.4,1.1,1.8,0,0,7);ctx.fill();
    if(mouth){ctx.fillStyle='#2a1f3a';ctx.beginPath();ctx.ellipse(2.8,8.6,1+mouth,1.3+mouth*1.2,0,0,7);ctx.fill();}}
  ctx.restore();
}
function M9_drawSab(e){
  if(e.st==='hide'||e.st==='rattle')return;   // escondida: los ojos se dibujan en la cobertura
  const x=e.gx,y=e.gy;
  if(e.st==='under'){ // sombra que viaja por abajo de las baldosas
    const k=(T>>2)%2;ctx.fillStyle='rgba(30,18,50,0.55)';ctx.beginPath();ctx.ellipse(x+6,GROUND+1,8,1.6,0,0,7);ctx.fill();
    ctx.strokeStyle=`rgba(185,163,216,${0.35+0.25*k})`;ctx.lineWidth=0.6;const r=((T%24)/24);
    ctx.beginPath();ctx.ellipse(x+6,GROUND+0.5,4+r*9,1+r*1.4,0,0,7);ctx.stroke();
    ctx.fillStyle='rgba(159,227,255,0.7)';ctx.fillRect(q(x+4+e.face*2),GROUND-0.6,1,0.8);ctx.fillRect(q(x+7+e.face*2),GROUND-0.6,1,0.8);
    return;}
  const solid=e.st==='solid'||e.st==='swoop'||e.st==='rec',glow=e.st==='solid'||e.st==='swoop';
  if(e.st==='wall'){ // ondas en la pared de ladrillo, como agua
    const k=1-e.t/40;ctx.strokeStyle=`rgba(185,163,216,${0.5*(1-k)+0.1})`;ctx.lineWidth=0.7;
    for(let i=0;i<3;i++){const r=((T/2+i*7)%21)/21;ctx.beginPath();ctx.ellipse(x+6,y+8,3+r*12,4+r*14,0,0,7);ctx.stroke();}}
  if(e.st==='solid'){ // halo que late + línea de puntos hacia donde va a embestir
    const p=0.5+0.5*Math.sin(T/2.5);ctx.fillStyle=`rgba(159,227,255,${0.16+0.16*p})`;circle(x+6,y+8,12+p*2);
    ctx.fillStyle=`rgba(255,255,255,${0.08+0.1*p})`;circle(x+6,y+8,8);
    const cx=x+6,cy=y+8,dx=e.ax-cx,dy=e.ay-cy,d=Math.hypot(dx,dy)||1;
    ctx.fillStyle=e.t<=10?'rgba(255,255,255,0.95)':'rgba(159,227,255,0.8)';
    const ph=(T>>1)%5;for(let s=10+ph;s<Math.min(d+24,130);s+=5)ctx.fillRect(q(cx+dx/d*s-0.7),q(cy+dy/d*s-0.7),1.4,1.4);}
  const clip=e.st==='floor'||e.st==='sink';
  if(clip){ctx.save();ctx.beginPath();ctx.rect(camX-40,-40,W+80,GROUND+40);ctx.clip();
    ctx.strokeStyle='rgba(185,163,216,0.5)';ctx.lineWidth=0.6;const r=((T%20)/20);ctx.beginPath();ctx.ellipse(x+6,GROUND,5+r*8,1+r,0,0,7);ctx.stroke();}
  const bob=solid?0:Math.sin(e.anim/12)*1.2;
  M9_sheet(x,y+bob,e.alpha,solid,e.face,e.anim,glow,e.flash>0,e.st==='swoop'?1:e.st==='solid'?0.4:0);
  if(clip)ctx.restore();
}
ENEMY_MAKERS.m9Sabana=M9_mkSab;

// ================== FAROL CON ALMA ==================
// Un farol de la calle que se soltó del poste y flota, con un alma celeste adentro (llamita con ojos).
// Translúcido, cruza paredes y techos. AVISO: se pone sólido, el vidrio se prende celeste y la llama crece; tira
// un alma lenta que se puede esquivar o reventar a tiros. Queda sólido un momento y vuelve a apagarse.
const M9_MAXF=3;
function M9_newFar(o){
  if(M9_n('m9Farol')>=M9_MAXF)return null;
  return Object.assign({type:'m9Farol',air:true,x:-9999,y:M9_HIDE,w:10,h:13,hp:2,face:-1,flash:0,score:160,cd:0,
    st:'drift',t:0,gx:0,gy:0,vx:0,vy:0,alpha:0,anim:rand(0,99),life:0,cyc:0,dt:rand(70,110),side:1,hy:50,solid:false,
    upd:M9_updFar,draw:M9_drawFar,onKill:M9_killGhost},o);
}
function M9_mkFar(x,y){
  const fromR=Math.abs(x-(camX+W+12))<0.5,fromL=Math.abs(x-(camX-20))<0.5;
  let e=null;M9_tell(1);
  if(fromR||fromL){
    if(Math.random()<0.5){const wx=fromR?camX+W-rand(30,60):camX+rand(24,54);e=M9_newFar({st:'wall',t:36,gx:wx,gy:rand(46,80),face:fromR?-1:1});if(e)M9_sfx('m9Aparece');}
    else e=M9_newFar({st:'drift',gx:fromR?camX+W+14:camX-24,gy:rand(30,60),face:fromR?-1:1,alpha:0.4});
  }else{e=M9_newFar({st:'wall',t:36,gx:clamp(x,camX+24,camX+W-34),gy:y!==undefined?clamp(y-20,30,90):rand(46,80)});if(e)M9_sfx('m9Aparece');}
  if(e){e.hx=e.gx;e.side=Math.random()<0.5?-1:1;e.hy=rand(34,64);}
  return e||M9_dummy('m9Farol');
}
function M9_updFar(e){
  if(e.flash>0)e.flash--;e.anim++;e.life++;
  if(e.kbx){e.gx+=e.kbx;e.kbx*=0.5;if(Math.abs(e.kbx)<0.15)e.kbx=0;}
  const pl=P.dead?null:M9_pc();
  if(e.st!=='leave'&&(e.life>1600||(e.gx<camX-60&&!lock)))M9_go(e,'leave');
  switch(e.st){
  case 'wall':M9_tang(e,false);e.alpha=Math.min(0.45,e.alpha+0.015);if(--e.t<=0){M9_go(e,'drift');}return;
  case 'drift':{
    M9_tang(e,false);e.alpha+=(0.4-e.alpha)*0.08;
    if(pl){const tx=clamp(pl.x+e.side*60-5,camX+10,camX+W-20),ty=e.hy,dx=tx-e.gx,dy=ty-e.gy;
      e.vx=clamp(e.vx+dx*0.004,-0.9,0.9);e.vy=clamp(e.vy+dy*0.006,-0.5,0.5);e.vx*=0.97;e.vy*=0.94;e.face=pl.x<e.gx+5?-1:1;}
    e.gx+=e.vx;e.gy+=e.vy+Math.sin(e.anim/16)*0.2;
    if(++e.t>=e.dt&&M9_onX(e,6)&&pl){M9_go(e,'solid',34);M9_sfx('m9Farol');M9_sfx('m9Solido');}
    return;}
  case 'solid':
    M9_tang(e,true);M9_tell(2);e.alpha=Math.min(1,e.alpha+0.14);if(pl)e.face=pl.x<e.gx+5?-1:1;
    if(e.t%5===0)M9_glint(e.gx+5,e.gy+7,1);M9.flick=Math.max(M9.flick,4);
    if(--e.t<=0){
      if(pl){const sx=e.gx+5,sy=e.gy+8;M9_wisp(sx,sy,pl.x,pl.y,1.35);
        if(vuelta>1||lock)M9_wisp(sx,sy,pl.x+(pl.x>sx?-30:30),pl.y+6,1.2);}
      M9_sfx('m9Llama');M9_go(e,'rec',30);}
    return;
  case 'rec':M9_tang(e,true);e.gy+=Math.sin(e.anim/8)*0.2;e.x=e.gx;e.y=e.gy;if(--e.t<=0){M9_go(e,'fade',14);}return;
  case 'fade':M9_tang(e,false);e.alpha=Math.max(0.4,e.alpha-0.05);
    if(--e.t<=0){e.cyc++;if(e.cyc>=3)M9_go(e,'leave');else{M9_go(e,'drift');e.dt=rand(70,110);e.side=-e.side;e.hy=rand(34,64);}}
    return;
  case 'leave':M9_tang(e,false);e.alpha-=0.02;e.gy-=0.6;if(e.alpha<=0.02)e.gone=true;return;
  }
}
function M9_lantern(x,y,a,solid,glow,fl,anim){
  ctx.save();ctx.globalAlpha=a;ctx.translate(q(x),q(y));
  const iron=fl?'#fff':solid?'#2a2630':'#5a4a7a',glass=fl?'#fff':glow?((T>>1)%2?'#e8fbff':'#bff0ff'):solid?'#8ad0e8':'rgba(159,227,255,0.5)';
  if(glow){ctx.fillStyle=`rgba(159,227,255,${0.18+0.12*Math.sin(T/2.5)})`;circle(5,7,11);}
  // argolla y techito
  ctx.strokeStyle=iron;ctx.lineWidth=0.8;ctx.beginPath();ctx.arc(5,-0.6,1.4,0,7);ctx.stroke();
  ctx.fillStyle=iron;ctx.beginPath();ctx.moveTo(1,3);ctx.lineTo(5,0.6);ctx.lineTo(9,3);ctx.closePath();ctx.fill();ctx.fillRect(0.5,3,9,1.2);
  // vidrio y parantes
  ctx.fillStyle=glass;ctx.fillRect(1.5,4.2,7,6.4);
  ctx.fillStyle=iron;ctx.fillRect(1.2,4.2,0.8,6.4);ctx.fillRect(8,4.2,0.8,6.4);ctx.fillRect(4.6,4.2,0.8,6.4);ctx.fillRect(1,10.6,8,1.4);ctx.fillRect(3.5,12,3,1);
  // el alma: llamita con dos ojos
  if(!fl){const s=glow?1.4:solid?1:0.8,fy=8.6+Math.sin(anim/4)*0.3;
    ctx.fillStyle=glow?'#ffffff':'#d8f6ff';ctx.beginPath();ctx.moveTo(5-1.8*s,fy);ctx.quadraticCurveTo(5-1.2*s,fy-3.4*s,5+Math.sin(anim/3)*0.6,fy-4.4*s);ctx.quadraticCurveTo(5+1.4*s,fy-3*s,5+1.8*s,fy);ctx.closePath();ctx.fill();
    ctx.fillStyle='#2a3a5a';ctx.fillRect(4,fy-2,0.8,0.9);ctx.fillRect(5.6,fy-2,0.8,0.9);}
  ctx.restore();
}
function M9_drawFar(e){
  const x=e.gx,y=e.gy+(e.solid?0:Math.sin(e.anim/14)*1.4),solid=e.st==='solid'||e.st==='rec',glow=e.st==='solid';
  if(e.st==='wall'){const k=1-e.t/36;ctx.strokeStyle=`rgba(159,227,255,${0.45*(1-k)+0.1})`;ctx.lineWidth=0.7;
    for(let i=0;i<3;i++){const r=((T/2+i*7)%21)/21;ctx.beginPath();ctx.ellipse(x+5,y+7,3+r*10,3+r*10,0,0,7);ctx.stroke();}}
  if(solid){ctx.fillStyle='rgba(159,227,255,0.06)';ctx.beginPath();ctx.moveTo(x+2,y+12);ctx.lineTo(x-8,GROUND);ctx.lineTo(x+18,GROUND);ctx.lineTo(x+8,y+12);ctx.fill();}
  M9_lantern(x,y,e.alpha,solid,glow,e.flash>0,e.anim);
}
// el alma que tira: lenta, se esquiva o se revienta a tiros
function M9_wisp(x,y,tx,ty,sp){const d=Math.hypot(tx-x,ty-y)||1;eproj.push({kind:'m9Alma',x,y,vx:(tx-x)/d*sp,vy:(ty-y)/d*sp,r:2.2,t:0,upd:M9_wispUpd,draw:M9_wispDraw});}
function M9_wispUpd(o,hb){
  o.t++;o.x+=o.vx;o.y+=o.vy+Math.sin(o.t/6)*0.25;
  if(o.t%3===0)parts.push({k:'p',x:o.x,y:o.y,vx:-o.vx*0.2,vy:-0.2,g:0,life:12,maxl:12,size:1,col:o.t%2?M9_CEL:'#ffffff'});
  if(hb&&overlapPt(hb,o.x,o.y,o.r)){hurtPlayer(1);o.gone=true;M9_glint(o.x,o.y,5);return;}
  if(o.y>=GROUND-1||o.t>280||o.x<camX-20||o.x>camX+W+20){o.gone=true;M9_mist(o.x,Math.min(o.y,GROUND-2),2,'170,220,240');}
}
function M9_wispDraw(o){
  ctx.fillStyle='rgba(159,227,255,0.28)';circle(o.x,o.y,o.r+2.2);
  ctx.fillStyle=M9_CEL;circle(o.x,o.y,o.r);ctx.fillStyle='#fff';circle(o.x-0.4,o.y-0.6,o.r*0.5);
  ctx.fillStyle='#2a3a5a';ctx.fillRect(q(o.x-1.2),q(o.y-0.6),0.8,0.8);ctx.fillRect(q(o.x+0.4),q(o.y-0.6),0.8,0.8);
}
ENEMY_MAKERS.m9Farol=M9_mkFar;

// ================== ganchos por cuadro ==================
// tranvía de fondo (va solo, sin nadie adentro), persianas que golpean, carteles que chirrían,
// faroles que titilan cuando un fantasma se pone sólido, y las balas que atraviesan a los translúcidos
M9_LVL.upd=function(){
  if(M9.flick>0)M9.flick--;
  // balas que cruzan un fantasma translúcido: brillito y un sonido suave (así se entiende que no le pegan)
  for(const [c,g] of M9.hid)if(g.gone||(g.st!=='hide'&&g.st!=='rattle'&&g.st!=='toCov')||g.cov!==c)M9.hid.delete(c);
  for(const e of enemies){if(!M9_isGhost(e)||e.gone||e.solid||e.alpha<0.2||e.st==='hide'||e.st==='rattle'||e.st==='under')continue;
    for(const b of pbul){if(b.gone||b.m9)continue;
      if(b.x>e.gx-1&&b.x<e.gx+e.w+1&&b.y>e.gy&&b.y<e.gy+e.h){b.m9=1;M9_glint(b.x,b.y,1);M9_sfx('m9Atraviesa');}}}
  // tranvía: cada tanto cruza la avenida del fondo
  if(M9.tram){const t=M9.tram;t.x+=t.v;const sx=t.x-camX*0.5;if(sx<-140||sx>W+140)M9.tram=null;
    else if(t.t++%40===0&&Math.random()<0.4)t.spark=6;if(t.spark>0)t.spark--;}
  else if(--M9.tramCd<=0){const r=Math.random()<0.5;M9.tram={x:camX*0.5+(r?-110:W+110),v:r?0.7:-0.7,t:0,spark:0};M9.tramCd=900+rand(0,500);M9_sfx('m9Tranvia');}
  // persianas: golpean al cerrarse
  for(const d of M9_LVL.decor){if(d.x<camX-30||d.x>camX+W+10)continue;
    if(d.k==='persiana'&&M9_shutP(d)===334)M9_sfx('m9Persiana',0.6);
    if(d.k==='cartel'&&(T+((d.x*13)|0))%260===0)M9_sfx('m9Cartel',0.5);}
};
// persiana: ciclo de abrirse despacio y cerrarse de golpe (0 = el golpe)
function M9_shutP(d){return(T+((hash(d.x|0)*997)|0))%380;}
function M9_shutOpen(d){const p=M9_shutP(d);return p<30?0:p<200?M9_ease((p-30)/170):p<330?1:p<334?1-(p-330)/4:0;}

// ================== fondo (precalculado) ==================
const M9_R=mulberry32(909);
let M9_SKY=null,M9_FAR=null,M9_MID=null,M9_STREET=null;
function M9_skyCanvas(){
  if(M9_SKY)return M9_SKY;
  const c=document.createElement('canvas');c.width=W;c.height=GROUND;const x=c.getContext('2d');
  const g=x.createLinearGradient(0,0,0,GROUND);g.addColorStop(0,'#07061a');g.addColorStop(0.5,'#151232');g.addColorStop(0.85,'#2a2244');g.addColorStop(1,'#3a2e4e');
  x.fillStyle=g;x.fillRect(0,0,W,GROUND);
  for(let i=0;i<60;i++){const sx=M9_R()*W,sy=M9_R()*90,b=M9_R();x.fillStyle=`rgba(230,225,255,${0.25+b*0.55})`;x.fillRect(sx,sy,b>0.9?1.3:0.8,b>0.9?1.3:0.8);}
  // luna grande con halo
  const mx=248,my=44;
  for(let i=5;i>0;i--){x.fillStyle=`rgba(230,220,190,${0.035*i/5+0.015})`;x.beginPath();x.arc(mx,my,26+i*7,0,7);x.fill();}
  x.fillStyle='#efe6cc';x.beginPath();x.arc(mx,my,25,0,7);x.fill();
  x.fillStyle='#ddd2b2';for(const [cx,cy,r] of[[-8,-6,5],[6,4,7],[-4,10,3.5],[10,-10,3],[-14,6,2.5],[2,-14,2]]){x.beginPath();x.arc(mx+cx,my+cy,r,0,7);x.fill();}
  x.fillStyle='rgba(150,130,170,0.25)';x.beginPath();x.arc(mx+7,my+5,24,0,7);x.fill();   // sombra suave del lado de abajo
  M9_SKY=c;return c;
}
// siluetas lejanas: torres escalonadas, agujas y tanques de agua (paralaje 0.12)
function M9_farCanvas(){
  if(M9_FAR)return M9_FAR;
  const c=document.createElement('canvas');c.width=512;c.height=GROUND;const x=c.getContext('2d');const R=mulberry32(31);
  let px=0;
  while(px<512){const w=18+R()*34|0,top=56+R()*44|0;
    x.fillStyle='#17132c';x.fillRect(px,top,w,GROUND-top);
    if(R()<0.4){x.fillRect(px+3,top-8,w-6,8);x.fillRect(px+w/2-3,top-16,6,8);if(R()<0.6){x.fillRect(px+w/2-0.5,top-26,1,10);}}
    else if(R()<0.5){x.fillRect(px+w*0.3,top-7,6,7);x.fillRect(px+w*0.3-1,top-9,8,2);x.fillRect(px+w*0.3+1,top,1,0);}
    x.fillStyle='rgba(255,210,130,0.35)';for(let i=0;i<6;i++)if(R()<0.45)x.fillRect(px+2+R()*(w-4)|0,top+4+R()*(GROUND-top-10)|0,1,1);
    px+=w+(R()<0.3?4:0);}
  M9_FAR=c;return c;
}
// fila del medio: edificios bajos y la avenida donde pasa el tranvía (paralaje 0.45)
function M9_midCanvas(){
  if(M9_MID)return M9_MID;
  const c=document.createElement('canvas');c.width=512;c.height=GROUND;const x=c.getContext('2d');const R=mulberry32(57);
  let px=0;
  while(px<512){const w=30+R()*40|0,top=84+R()*26|0;
    x.fillStyle='#201a32';x.fillRect(px,top,w,GROUND-top);x.fillStyle='#2a2240';x.fillRect(px,top,w,2);
    for(let wy=top+6;wy<GROUND-16;wy+=9)for(let wx=px+4;wx<px+w-5;wx+=7){x.fillStyle=R()<0.18?'rgba(255,200,120,0.55)':'#141024';x.fillRect(wx,wy,3,4);}
    px+=w+2;}
  // vereda y rieles de la avenida
  x.fillStyle='#1a1528';x.fillRect(0,GROUND-6,512,6);x.fillStyle='#3a3050';x.fillRect(0,GROUND-6,512,0.8);
  x.fillStyle='#4a4060';x.fillRect(0,GROUND-2.5,512,0.6);
  M9_MID=c;return c;
}
const M9_CLOUDS=[{x:40,y:30,w:90},{x:200,y:52,w:120},{x:330,y:22,w:70},{x:470,y:44,w:100}];
function M9_drawTram(){
  const t=M9.tram;if(!t)return;
  const sx=t.x-camX*0.5,y=GROUND-30,dir=t.v>0?1:-1;
  // pértiga al cable
  ctx.strokeStyle='#14101e';ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(sx+30,y);ctx.lineTo(sx+30-dir*18,62);ctx.stroke();
  if(t.spark>0){ctx.fillStyle=t.spark%2?'#e8fbff':M9_CEL;ctx.fillRect(sx+29-dir*18,60.5,2,2);ctx.fillStyle='rgba(159,227,255,0.3)';circle(sx+30-dir*18,62,6);}
  // caja
  ctx.fillStyle='#2a3e3c';ctx.fillRect(sx,y,62,22);
  ctx.fillStyle='#3a5250';ctx.fillRect(sx,y,62,2);ctx.fillStyle='#c8bc9a';ctx.fillRect(sx,y+13,62,2);
  ctx.fillStyle='#1c2a28';ctx.fillRect(sx+2,y-2,58,2);
  // ventanas prendidas (que titilan), una con un pasajero translúcido
  for(let i=0;i<6;i++){const wx=sx+4+i*9.6,on=((T>>3)+i*3)%17!==0;
    ctx.fillStyle=on?'rgba(255,214,140,0.85)':'#3a3020';ctx.fillRect(wx,y+4,7,7);
    if(i===3&&on){ctx.fillStyle='rgba(185,163,216,0.7)';ctx.beginPath();ctx.arc(wx+3.5,y+7.5,2.2,Math.PI,0);ctx.lineTo(wx+5.7,y+11);ctx.lineTo(wx+1.3,y+11);ctx.fill();}}
  ctx.fillStyle='#14101e';circle(sx+12,y+22,2.4);circle(sx+50,y+22,2.4);
  ctx.fillStyle='rgba(255,220,150,0.35)';ctx.fillRect(dir>0?sx+62:sx-6,y+15,6,2);
}
M9_LVL.drawBG=function(){
  ctx.drawImage(M9_skyCanvas(),0,0);
  // nubes finitas que pasan por delante de la luna
  for(const c of M9_CLOUDS){const x=((c.x-T*0.06-camX*0.03)%560+560)%560-120;
    ctx.fillStyle='rgba(20,16,40,0.75)';ctx.beginPath();ctx.ellipse(x+c.w/2,c.y,c.w/2,3.2,0,0,7);ctx.fill();
    ctx.fillStyle='rgba(200,190,220,0.12)';ctx.fillRect(x+c.w*0.2,c.y-3,c.w*0.6,0.8);}
  const fo=((camX*0.12)%512+512)%512;ctx.drawImage(M9_farCanvas(),q(-fo),0);ctx.drawImage(M9_FAR,q(-fo+512),0);
  // lucecitas rojas en las agujas
  if((T>>5)%2){ctx.fillStyle='#ff5a4a';for(const ax of[60,190,330,450]){const x=((ax-fo)%512+512)%512;if(x<W)ctx.fillRect(x,58,1,1);}}
  // niebla lejana
  ctx.fillStyle='rgba(120,110,160,0.10)';ctx.fillRect(0,104,W,GROUND-104);
  const mo=((camX*0.45)%512+512)%512;ctx.drawImage(M9_midCanvas(),q(-mo),0);ctx.drawImage(M9_MID,q(-mo+512),0);
  // cable del tranvía con postes
  const po=((camX*0.45)%140+140)%140;ctx.strokeStyle='#100c1c';ctx.lineWidth=0.6;
  ctx.beginPath();for(let x=-po;x<W+140;x+=140){ctx.moveTo(x,60);ctx.quadraticCurveTo(x+70,66,x+140,60);}ctx.stroke();
  for(let x=-po;x<W+10;x+=140){ctx.fillStyle='#100c1c';ctx.fillRect(x-1,58,2,GROUND-64);}
  M9_drawTram();
  ctx.fillStyle='rgba(150,140,190,0.10)';ctx.fillRect(0,128,W,GROUND-128);
};

// ================== frentes de la calle (en el mundo) ==================
// Fila de edificios de ladrillo al ras de la vereda, con callejones entre algunos. Cada uno se dibuja una vez en
// su propio lienzo; encima van las ventanas que se prenden y se apagan solas (y a veces una sombra con sombrero).
const M9_BLD=[];
(function(){
  const R=mulberry32(919),L9=M9_LVL;
  const busy=x=>L9.decor.some(d=>(d.k==='cartel'||d.k==='persiana')&&d.x>x-26&&d.x<x+26)||
    L9.platforms.some(p=>!p.pyr&&!p.roof&&x>p.x-12&&x<p.x+p.w+12)||L9.tunnels.some(t=>x>t.x-24&&x<t.x+t.w+24);
  const free=x=>!busy(x);
  let x=-60;
  while(x<3060){
    let w=64+(R()*72|0);const top=44+(R()*34|0);
    // la medianera cae donde no cuelga nada de la pared, así puede abrirse un callejón
    let e=x+w;while(e<x+150&&e<3060&&!free(e))e+=4;if(!free(e))e=x+w;w=e-x;
    if(x+w>3060)w=3060-x;
    if(w>=24)M9_BLD.push({x,w,top,pad:14,col:R()*5|0,s:(R()*1e6)|0,tank:R()<0.35,chim:R()<0.5,shop:R()<0.55,cv:null,win:[]});
    x+=w;
    let run=0;while(run<90&&x+run<3040&&free(x+run))run+=2;
    if(run>=24&&R()<0.7){const g=Math.min(run-6,18+(R()*52|0));if(g>=16)x+=g;}
  }
  M9_BLD.push({x:3060,w:370,top:44,pad:30,mansion:true,s:777,cv:null,win:[]});
})();
const M9_BRICK=[['#3a2630','#2e1e28'],['#33242e','#281c26'],['#2e2634','#241e2a'],['#3a2a2a','#2c2020'],['#2a2636','#201c2c']];
function M9_bldCanvas(b){
  if(b.cv)return b.cv;
  if(b.mansion)return M9_mansionCanvas(b);
  const R=mulberry32(b.s),hh=GROUND-b.top+14,c=document.createElement('canvas');c.width=b.w;c.height=hh;const x=c.getContext('2d');
  const [bc,mc]=M9_BRICK[b.col],oy=14;
  x.fillStyle=bc;x.fillRect(0,oy,b.w,hh-oy);
  // ladrillos: hilada cada 4 px, juntas cada 8 alternadas
  x.fillStyle=mc;for(let r=oy+3;r<hh;r+=4){x.fillRect(0,r,b.w,0.7);const off=((r/4)|0)%2?4:0;for(let k=off;k<b.w;k+=8)x.fillRect(k,r-3,0.7,3);}
  x.fillStyle='rgba(0,0,0,0.25)';x.fillRect(b.w-2,oy,2,hh-oy);x.fillRect(0,oy,1,hh-oy);
  // cornisa
  x.fillStyle='#4a3e4a';x.fillRect(-1,oy,b.w+2,3);x.fillStyle='#5e5260';x.fillRect(-1,oy,b.w+2,0.8);
  x.fillStyle='#2a2230';for(let k=2;k<b.w;k+=4)x.fillRect(k,oy+3,2,1.2);
  // en el techo: tanque de agua y chimenea
  if(b.tank){const tx=6+R()*(b.w-24)|0;x.fillStyle='#1e1828';x.fillRect(tx+1,oy-5,1,5);x.fillRect(tx+10,oy-5,1,5);x.fillStyle='#2e2434';x.fillRect(tx,oy-13,12,8);
    x.beginPath();x.moveTo(tx-1,oy-13);x.lineTo(tx+6,oy-16);x.lineTo(tx+13,oy-13);x.fill();x.fillStyle='#3a2e40';for(let k=0;k<3;k++)x.fillRect(tx,oy-11+k*2.6,12,0.6);}
  if(b.chim){const cx=b.w-14-R()*10|0;x.fillStyle='#2a1e26';x.fillRect(cx,oy-9,6,9);x.fillStyle='#3a2c34';x.fillRect(cx-1,oy-10,8,2);}
  // ventanas: pisos cada 22 px, columnas cada 18
  const floors=[];for(let wy=oy+9;wy<hh-34;wy+=22)floors.push(wy);
  const cols=[];for(let wx=7;wx+8<=b.w-5;wx+=18)cols.push(wx);
  for(const wy of floors)for(const wx of cols){
    x.fillStyle='#4e424e';x.fillRect(wx-1,wy-1,10,13);x.fillStyle='#141226';x.fillRect(wx,wy,8,11);
    x.fillStyle='#4e424e';x.fillRect(wx+3.6,wy,0.8,11);x.fillRect(wx,wy+5,8,0.8);
    x.fillStyle='#5e5260';x.fillRect(wx-2,wy+12,12,1.4);
    b.win.push({x:b.x+wx,y:b.top-b.pad+wy,i:b.win.length});}
  // planta baja: puerta con arco y vidriera
  const gy=hh-30;x.fillStyle='rgba(0,0,0,0.25)';x.fillRect(0,gy-2,b.w,1.2);
  const dx=b.shop?b.w-16:(b.w/2-5)|0;
  x.fillStyle='#4a3e4a';x.fillRect(dx-2,gy+4,14,26);x.fillStyle='#120e1c';x.fillRect(dx,gy+8,10,22);
  x.beginPath();x.arc(dx+5,gy+8,5,Math.PI,0);x.fill();x.fillStyle='#2a2030';x.fillRect(dx+4.5,gy+10,1,20);
  if(b.shop&&b.w>48){const sw=b.w-30;x.fillStyle='#4a3e4a';x.fillRect(4,gy+6,sw,18);x.fillStyle='#181628';x.fillRect(5,gy+7,sw-2,16);
    x.fillStyle='rgba(200,190,230,0.08)';x.fillRect(8,gy+8,2,14);x.fillRect(12,gy+8,1,14);
    // toldo rayado (hueso y lila gastados)
    for(let k=0;k<sw+2;k+=4){x.fillStyle=(k/4)%2?'#6a5a72':'#a89c8a';x.fillRect(3+k,gy+1,4,4);}
    x.fillStyle='rgba(0,0,0,0.3)';x.fillRect(3,gy+5,sw+2,1);}
  b.cv=c;return c;
}
// mansión del final: piedra oscura, ventanas altas con arco, torre y puerta doble
function M9_mansionCanvas(b){
  const hh=GROUND-b.top+b.pad,c=document.createElement('canvas');c.width=b.w;c.height=hh;const x=c.getContext('2d'),oy=b.pad;
  x.fillStyle='#2a2434';x.fillRect(0,oy+16,b.w,hh-oy-16);
  x.fillStyle='#221c2c';for(let r=oy+20;r<hh;r+=6){x.fillRect(0,r,b.w,0.6);for(let k=((r/6)|0)%2?6:0;k<b.w;k+=12)x.fillRect(k,r-6,0.6,6);}
  // techo de pizarra a dos aguas y buhardilla redonda
  x.fillStyle='#1a1624';x.beginPath();x.moveTo(-2,oy+18);x.lineTo(b.w*0.5,oy-12);x.lineTo(b.w+2,oy+18);x.closePath();x.fill();
  x.fillStyle='#262034';for(let r=0;r<28;r+=3){const k=r/30;x.fillRect(b.w*0.5-(b.w*0.5+2)*(1-k)*0.98,oy+18-r,(b.w+4)*(1-k)*0.98,0.6);}
  x.fillStyle='#3a3248';x.beginPath();x.arc(b.w*0.5,oy+6,6,0,7);x.fill();x.fillStyle='#141020';x.beginPath();x.arc(b.w*0.5,oy+6,4.4,0,7);x.fill();
  b.win.push({x:b.x+b.w*0.5-3,y:b.top-b.pad+oy+3,i:0,round:1});
  // torre a la izquierda con techo en punta
  x.fillStyle='#2e283a';x.fillRect(14,oy-6,30,hh-oy+6);x.fillStyle='#1a1624';x.beginPath();x.moveTo(10,oy-6);x.lineTo(29,oy-14-14);x.lineTo(48,oy-6);x.closePath();x.fill();
  x.fillStyle='#4a4058';x.fillRect(28.5,oy-30,1,4);
  // cornisa con molduras lilas
  x.fillStyle='#4a4058';x.fillRect(0,oy+16,b.w,3);x.fillStyle='#6a5c7a';x.fillRect(0,oy+16,b.w,0.8);
  // ventanas altas con arco, dos pisos
  for(const wy of[oy+28,oy+64])for(let wx=56;wx<b.w-20;wx+=34){if(wx>b.w/2-30&&wx<b.w/2+20&&wy>oy+50)continue;
    x.fillStyle='#4a4058';x.fillRect(wx-2,wy-2,14,24);x.beginPath();x.arc(wx+5,wy-2,7,Math.PI,0);x.fill();
    x.fillStyle='#120e1c';x.fillRect(wx,wy,10,20);x.beginPath();x.arc(wx+5,wy,5,Math.PI,0);x.fill();
    x.fillStyle='#3a3048';x.fillRect(wx+4.6,wy-4,0.8,24);x.fillRect(wx,wy+8,10,0.8);
    b.win.push({x:b.x+wx,y:b.top-b.pad+wy,i:b.win.length,tall:1});}
  for(const wy of[oy+28])for(let wx=19;wx<40;wx+=12){x.fillStyle='#120e1c';x.fillRect(wx,wy,7,14);b.win.push({x:b.x+wx,y:b.top-b.pad+wy,i:b.win.length,tower:1});}
  // puerta doble con escalinata
  const dx=b.w/2-14,dy=hh-40;
  x.fillStyle='#4a4058';x.fillRect(dx-4,dy-4,36,44);x.beginPath();x.arc(dx+14,dy-4,18,Math.PI,0);x.fill();
  x.fillStyle='#1a1018';x.fillRect(dx,dy,28,40);x.beginPath();x.arc(dx+14,dy,14,Math.PI,0);x.fill();
  x.fillStyle='#3a2028';x.fillRect(dx+2,dy+2,11,38);x.fillRect(dx+15,dy+2,11,38);
  x.fillStyle='#c9a040';x.fillRect(dx+11,dy+20,1,2);x.fillRect(dx+16,dy+20,1,2);
  // rejas de la vereda
  x.fillStyle='#14101c';for(let k=0;k<b.w;k+=5)x.fillRect(k,hh-12,1,12);x.fillRect(0,hh-12,b.w,1);
  for(let k=0;k<b.w;k+=5){x.beginPath();x.moveTo(k-1,hh-12);x.lineTo(k+0.5,hh-15);x.lineTo(k+2,hh-12);x.fill();}
  b.cv=c;return c;
}
// ventana prendida (cada una con su ritmo); a veces se prende titilando o se ve una sombra con sombrero
function M9_winOn(b,w){const ph=hash(b.s+w.i*31)*997|0,p=360+((hash(w.i*7+b.s)*900)|0),seg=Math.floor((T+ph)/p);
  const on=hash(b.s+seg*13+w.i)>0.62,k=(T+ph)%p;
  if(on&&k<12)return (k>>1)%2?1:0;
  return on?1:0;}
function M9_drawBuildings(){
  for(const b of M9_BLD){if(b.x+b.w<camX-4||b.x>camX+W+4)continue;
    ctx.drawImage(M9_bldCanvas(b),q(b.x),b.top-b.pad);
    if(b.mansion){M9_mansionLights(b);continue;}
    for(const w of b.win){if(!M9_winOn(b,w))continue;
      ctx.fillStyle='rgba(255,200,120,0.10)';ctx.fillRect(w.x-3,w.y-2,14,15);
      ctx.fillStyle=M9.flick>0&&(T>>1)%2?'#a08050':'#e8c27a';ctx.fillRect(w.x,w.y,8,11);
      ctx.fillStyle='rgba(120,80,40,0.6)';ctx.fillRect(w.x+3.6,w.y,0.8,11);ctx.fillRect(w.x,w.y+5,8,0.8);
      const h=hash(w.i*17+b.s);
      if(h>0.86){ // sombra con sombrero que se asoma
        const sx=w.x+4+Math.sin(T/50+h*9)*1.4;ctx.fillStyle='#2a1a1a';
        ctx.fillRect(sx-1.6,w.y+5,3.2,6);ctx.beginPath();ctx.arc(sx,w.y+4.4,1.6,0,7);ctx.fill();ctx.fillRect(sx-2.6,w.y+2.6,5.2,0.8);ctx.fillRect(sx-1.4,w.y+1,2.8,1.8);}
      else if(h>0.7){ctx.fillStyle='rgba(160,60,60,0.55)';ctx.fillRect(w.x,w.y,2.5+Math.sin(T/40+h*5),11);}}
  }
}
// la mansión: ventanas apagadas con un brillo lila; cuando llega el villano se prenden de a una, frías
function M9_mansionLights(b){
  for(const w of b.win){const lit=w.i<M9.mansion;
    const ww=w.round?6:w.tower?7:10,wh=w.round?6:w.tower?14:20;
    if(lit){ctx.fillStyle='rgba(159,227,255,0.12)';ctx.fillRect(w.x-3,w.y-3,ww+6,wh+6);ctx.fillStyle=(T+w.i*7)%90<3?'#e8fbff':'#9fd6e8';
      if(w.round){circle(w.x+3,w.y+3,3);}else{ctx.fillRect(w.x,w.y,ww,wh);if(w.tall){ctx.beginPath();ctx.arc(w.x+5,w.y,5,Math.PI,0);ctx.fill();}}
      if(w.tall){ctx.fillStyle='#3a3048';ctx.fillRect(w.x+4.6,w.y-4,0.8,24);ctx.fillRect(w.x,w.y+8,10,0.8);}}
    else{const g=0.06+0.05*Math.sin(T/30+w.i);ctx.fillStyle=`rgba(185,163,216,${g})`;ctx.fillRect(w.x,w.y,ww,wh);}}
}

// ================== piso: vereda de baldosas, cordón y adoquines con rieles ==================
function M9_streetCanvas(){
  if(M9_STREET)return M9_STREET;
  const c=document.createElement('canvas');c.width=96;c.height=H-GROUND;const x=c.getContext('2d'),R=mulberry32(5);
  x.fillStyle='#2e2836';x.fillRect(0,0,96,H-GROUND);
  // vereda
  for(let k=0;k<96;k+=8){x.fillStyle=(k/8)%2?'#4a4256':'#443c50';x.fillRect(k,0,8,7);x.fillStyle='#2a2434';x.fillRect(k,0,0.7,7);}
  x.fillStyle='#6a6076';x.fillRect(0,0,96,0.8);x.fillStyle='#5a5066';x.fillRect(0,7,96,1.6);x.fillStyle='#1a1622';x.fillRect(0,8.6,96,1);
  // adoquines
  for(let r=10;r<H-GROUND;r+=3.4){const off=((r/3.4)|0)%2?3:0;for(let k=-3+off;k<96;k+=6){const v=R();x.fillStyle=v<0.3?'#3a3244':v<0.7?'#342e3e':'#2e2838';x.fillRect(k+0.5,r,5,2.6);}}
  // rieles del tranvía
  for(const ry of[14,20]){x.fillStyle='#1a1622';x.fillRect(0,ry,96,1.6);x.fillStyle='#8a8296';x.fillRect(0,ry,96,0.6);}
  M9_STREET=c;return c;
}
M9_LVL.drawGround=function(){
  M9_drawBuildings();
  const st=M9_streetCanvas(),x0=Math.floor(camX/96)*96;
  for(let x=x0;x<camX+W+96;x+=96)ctx.drawImage(st,x,GROUND);
  // charquitos que reflejan la luna
  for(let t=Math.floor(camX/70)-1;t<(camX+W)/70+1;t++){const h=hash(t+400);if(h<0.6)continue;
    ctx.fillStyle='rgba(120,110,170,0.25)';ctx.beginPath();ctx.ellipse(t*70+h*30,GROUND+12+h*6,7+h*6,1.3,0,0,7);ctx.fill();
    ctx.fillStyle='rgba(239,230,204,0.35)';ctx.fillRect(t*70+h*30-2,GROUND+12+h*6-0.4,3,0.8);}
};

// ================== capa de arriba: niebla baja y flechitas de fantasmas que se acercan ==================
M9_LVL.drawFx=function(){
  for(let i=0;i<5;i++){const x=((i*97-T*0.25*(i%2?1:-0.6)-camX*0.6)%460+460)%460-70,y=150+(i%3)*6+Math.sin(T/60+i)*2;
    ctx.fillStyle='rgba(190,180,220,0.07)';ctx.beginPath();ctx.ellipse(x,y,60,6,0,0,7);ctx.fill();}
  ctx.fillStyle='rgba(170,160,210,0.05)';ctx.fillRect(0,GROUND-6,W,H-GROUND+6);
  // viñeta lila apenas
  ctx.fillStyle='rgba(40,20,70,0.10)';ctx.fillRect(0,0,6,H);ctx.fillRect(W-6,0,6,H);
  for(const e of enemies){if(!M9_isGhost(e)||e.gone||e.st==='hide'||e.st==='rattle'||e.st==='under'||e.st==='leave')continue;
    const sx=e.gx+e.w/2-camX;if(sx>=-2&&sx<=W+2)continue;
    const left=sx<0,d=left?-sx:sx-W;if(d>200)continue;
    const x=left?3:W-3,y=clamp(e.gy+e.h/2,24,GROUND-8),on=(T>>2)%2,s=left?1:-1;
    ctx.fillStyle='#120c18';ctx.beginPath();ctx.moveTo(x-s,y);ctx.lineTo(x+s*8,y-5);ctx.lineTo(x+s*8,y+5);ctx.closePath();ctx.fill();
    ctx.fillStyle=on?'#efe6ff':M9_LILA;ctx.beginPath();ctx.moveTo(x+s*0.5,y);ctx.lineTo(x+s*7,y-3.6);ctx.lineTo(x+s*7,y+3.6);ctx.closePath();ctx.fill();}
};

// ================== decorado ==================
M9_LVL.drawDecor=function(d){
  const x=d.x,g=GROUND;
  switch(d.k){
  case 'farol':{ // farol de gas: titila cuando un fantasma se pone sólido cerca
    const bad=M9.flick>0&&hash((x|0)+(T>>1))<0.5,on=!bad;
    if(on){ctx.fillStyle='rgba(255,214,140,0.05)';ctx.beginPath();ctx.moveTo(x+3,g-42);ctx.lineTo(x-14,g);ctx.lineTo(x+20,g);ctx.closePath();ctx.fill();
      ctx.fillStyle='rgba(255,214,140,0.10)';circle(x+3,g-43,10);ctx.fillStyle='rgba(255,214,140,0.10)';ctx.beginPath();ctx.ellipse(x+3,g+1,15,2,0,0,7);ctx.fill();}
    ctx.fillStyle='#16121e';ctx.fillRect(x+2,g-40,2,40);ctx.fillRect(x,g-4,6,4);ctx.fillRect(x+1,g-6,4,2);
    ctx.strokeStyle='#16121e';ctx.lineWidth=0.7;ctx.beginPath();ctx.arc(x+5,g-36,2,Math.PI,Math.PI*1.9);ctx.stroke();
    ctx.fillStyle='#16121e';ctx.beginPath();ctx.moveTo(x-0.5,g-46);ctx.lineTo(x+3,g-49);ctx.lineTo(x+6.5,g-46);ctx.fill();
    ctx.fillStyle=on?'#ffd88a':'#4a3a2a';ctx.fillRect(x+0.5,g-46,5,5);ctx.fillStyle='#16121e';ctx.fillRect(x+2.6,g-46,0.8,5);ctx.fillRect(x,g-41,6,1);
    return true;}
  case 'cartel':{ // cartel colgado de un brazo de hierro que se hamaca solo (dibujos, sin letras)
    const y0=g-66,sw=Math.sin(T/38+x)*0.22+Math.sin(T/13+x*2)*0.05;
    ctx.fillStyle='#16121e';ctx.fillRect(x-2,y0-3,3,7);ctx.fillRect(x,y0,18,1.2);
    ctx.strokeStyle='#16121e';ctx.lineWidth=0.6;ctx.beginPath();ctx.moveTo(x+1,y0+4);ctx.lineTo(x+8,y0+1);ctx.stroke();
    ctx.save();ctx.translate(x+11,y0+1);ctx.rotate(sw);
    ctx.strokeStyle='#2a2430';ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(-5,0);ctx.lineTo(-5,3);ctx.moveTo(5,0);ctx.lineTo(5,3);ctx.stroke();
    ctx.fillStyle='#2a2030';ctx.fillRect(-8,3,16,11);ctx.fillStyle='#6a5444';ctx.fillRect(-7,4,14,9);ctx.fillStyle='#8a7058';ctx.fillRect(-7,4,14,0.8);
    const kind=(hash(x|0)*4)|0;ctx.fillStyle='#d8ccb0';ctx.strokeStyle='#d8ccb0';ctx.lineWidth=0.8;
    if(kind===0){ctx.fillRect(-3,7,5,3.4);ctx.beginPath();ctx.arc(2.6,8.6,1.4,-1.4,1.4);ctx.stroke();ctx.fillRect(-4,10.6,7,0.8);}        // taza
    else if(kind===1){ctx.beginPath();ctx.arc(-2.5,8.5,2,0,7);ctx.stroke();ctx.fillRect(-0.5,8.1,5,0.9);ctx.fillRect(3,8.1,0.9,2.4);ctx.fillRect(1.6,8.1,0.9,1.8);} // llave
    else if(kind===2){ctx.beginPath();ctx.moveTo(-3,6.5);ctx.lineTo(3,10.5);ctx.moveTo(3,6.5);ctx.lineTo(-3,10.5);ctx.stroke();ctx.beginPath();ctx.arc(-3.4,11,1.2,0,7);ctx.arc(3.4,11,1.2,0,7);ctx.stroke();} // tijera
    else{ctx.fillRect(-2,5.6,2.6,4.6);ctx.fillRect(-2,9.6,5.6,2);ctx.fillRect(-2.4,11.4,6.4,0.8);}                                    // bota
    ctx.restore();
    return true;}
  case 'persiana':{ // ventana con persianas de madera que se abren despacio y se cierran de golpe
    const y0=g-74,k=M9_shutOpen(d),p=M9_shutP(d);
    ctx.fillStyle='#4e424e';ctx.fillRect(x-1,y0-1,16,19);ctx.fillStyle='#120e1e';ctx.fillRect(x,y0,14,17);
    if(k>0.2&&hash(x|0)>0.4){ctx.fillStyle=`rgba(255,200,120,${0.5*k})`;ctx.fillRect(x+1,y0+1,12,15);}
    ctx.fillStyle='#5e5260';ctx.fillRect(x-2,y0+17,18,1.6);
    for(const s of[0,1]){const hx=s?x+14:x,wd=7*Math.max(0.12,1-k*0.85),dir=s?-1:1;
      ctx.fillStyle='#3a4a3a';ctx.fillRect(s?hx-wd:hx,y0,wd,17);
      ctx.fillStyle='#2a3628';for(let r=1;r<17;r+=2)ctx.fillRect(s?hx-wd:hx,y0+r,wd,0.7);
      if(k>0.4){ctx.fillStyle='#4a5c48';ctx.fillRect(s?hx-wd-0.6:hx+wd,y0,0.6,17);}}
    if(p>=334&&p<342){ctx.fillStyle='rgba(200,190,170,0.4)';for(let i=0;i<3;i++)ctx.fillRect(x+rand(0,14),y0+18+rand(0,3),1,1);}
    return true;}
  case 'reloj':{ // reloj de vereda: las agujas giran locas cada tanto
    const cy=g-48;ctx.fillStyle='#16121e';ctx.fillRect(x+3,cy+5,2,g-cy-5);ctx.fillRect(x+1,g-4,6,4);
    ctx.fillStyle='#2a2430';circle(x+4,cy,6.4);ctx.fillStyle='#d8ccb0';circle(x+4,cy,5);
    ctx.fillStyle='#5a5060';for(let i=0;i<12;i+=3){const a=i/12*Math.PI*2;ctx.fillRect(x+4+Math.cos(a)*4-0.4,cy+Math.sin(a)*4-0.4,0.8,0.8);}
    const crazy=(T+((x*7)|0))%600<90,a1=crazy?T*0.4:T*0.004+x,a2=crazy?-T*0.13:T*0.0004+x*2;
    ctx.strokeStyle='#1a1420';ctx.lineWidth=0.7;ctx.beginPath();ctx.moveTo(x+4,cy);ctx.lineTo(x+4+Math.cos(a1)*3.8,cy+Math.sin(a1)*3.8);ctx.moveTo(x+4,cy);ctx.lineTo(x+4+Math.cos(a2)*2.6,cy+Math.sin(a2)*2.6);ctx.stroke();
    if(crazy){ctx.fillStyle='rgba(159,227,255,0.18)';circle(x+4,cy,8);}
    return true;}
  case 'hidrante':
    ctx.fillStyle='#5a2a2e';ctx.fillRect(x+1,g-9,6,9);ctx.fillRect(x,g-10,8,2);ctx.fillRect(x+2,g-12,4,2);ctx.fillRect(x-1,g-7,2,2);ctx.fillRect(x+7,g-7,2,2);
    ctx.fillStyle='#7a3a3e';ctx.fillRect(x+1,g-9,1.2,9);return true;
  }
  return false;
};

// ================== plataformas ==================
M9_LVL.drawPlat=function(pl){
  if(pl.roof){M9_pasajeBack(pl);return true;}
  if(pl.pyr){M9_baul(pl);return true;}
  if(pl.hi==='marquesina'){M9_marquee(pl);return true;}
  if(pl.hi==='cartelon'){M9_bigSign(pl);return true;}
  if(pl.hi==='balcon'){M9_balcony(pl);return true;}
  if(pl.step){M9_comoda(pl);return true;}
  M9_fireEscape(pl);return true;
};
// descanso de escalera de incendio: rejilla de hierro, baranda, ménsulas a la pared y escalerita colgando
function M9_fireEscape(pl){
  const x=pl.x,y=pl.y,w=pl.w;
  ctx.strokeStyle='#16121e';ctx.lineWidth=0.9;ctx.beginPath();
  ctx.moveTo(x+3,y+3);ctx.lineTo(x+12,y+12);ctx.moveTo(x+w-3,y+3);ctx.lineTo(x+w-12,y+12);ctx.stroke();
  ctx.lineWidth=0.6;ctx.beginPath();ctx.moveTo(x,y-7);ctx.lineTo(x+w,y-7);ctx.moveTo(x,y-3.5);ctx.lineTo(x+w,y-3.5);ctx.stroke();
  ctx.fillStyle='#16121e';for(let i=x;i<=x+w;i+=8)ctx.fillRect(Math.min(i,x+w-1),y-7,0.8,7);
  ctx.fillStyle='#3a3442';ctx.fillRect(x,y,w,3);ctx.fillStyle='#6a6274';ctx.fillRect(x,y,w,0.8);
  ctx.fillStyle='#16121e';for(let i=x+2;i<x+w-1;i+=3)ctx.fillRect(i,y+1.3,1.3,1.2);
  // escalerita
  const lx=x+w-9,lh=Math.min(18,GROUND-y-6);
  if(lh>6){ctx.fillStyle='#16121e';ctx.fillRect(lx,y+3,0.8,lh);ctx.fillRect(lx+5,y+3,0.8,lh);for(let r=y+6;r<y+3+lh;r+=3.5)ctx.fillRect(lx,r,5.8,0.7);}
}
// marquesina de teatro: lamparitas que corren alrededor (sin letras, con estrellitas)
function M9_marquee(pl){
  const x=pl.x,y=pl.y,w=pl.w;
  ctx.strokeStyle='#16121e';ctx.lineWidth=0.6;ctx.beginPath();ctx.moveTo(x+4,y);ctx.lineTo(x+10,y-26);ctx.moveTo(x+w-4,y);ctx.lineTo(x+w-10,y-26);ctx.stroke();
  ctx.fillStyle='#3a2034';ctx.fillRect(x-1,y,w+2,14);ctx.fillStyle='#5a3450';ctx.fillRect(x-1,y,w+2,1.2);
  ctx.fillStyle='#1a1020';ctx.fillRect(x+3,y+3.5,w-6,7);
  ctx.fillStyle='#d8ccb0';for(let i=0;i<4;i++){const sx=x+8+i*(w-16)/3;ctx.fillRect(sx-0.5,y+6,1,2);ctx.fillRect(sx-1.5,y+6.5,3,1);}
  for(let i=0;i<w;i+=4){const on=((i>>2)+(T>>3))%3===0;ctx.fillStyle=on?'#ffe8a0':'#6a5040';ctx.fillRect(x+i,y+1.6,1.2,1.2);ctx.fillRect(x+i,y+12,1.2,1.2);}
}
// cartelón de lamparitas sobre ménsulas de hierro
function M9_bigSign(pl){
  const x=pl.x,y=pl.y,w=pl.w;
  ctx.strokeStyle='#16121e';ctx.lineWidth=0.9;ctx.beginPath();ctx.moveTo(x+6,y+16);ctx.lineTo(x+16,y+30);ctx.moveTo(x+w-6,y+16);ctx.lineTo(x+w-16,y+30);ctx.stroke();
  ctx.fillStyle='#16121e';ctx.fillRect(x+15,y+30,4,2);ctx.fillRect(x+w-19,y+30,4,2);
  ctx.fillStyle='#2a3a48';ctx.fillRect(x,y,w,16);ctx.fillStyle='#3a5060';ctx.fillRect(x,y,w,1.2);
  ctx.fillStyle='#14101c';ctx.fillRect(x+3,y+3,w-6,10);
  // una luna creciente y una copa, hechas de lamparitas (algunas quemadas)
  const B=(bx,by)=>{const on=hash((bx*7+by*3)|0)>0.15&&!((T>>4)%9===0&&hash(bx|0)>0.7);ctx.fillStyle=on?'#ffe8a0':'#4a3a2a';ctx.fillRect(x+bx,y+by,1,1);};
  for(let a=0;a<9;a++){const t=a/8*Math.PI*1.2+Math.PI*0.4;B(9+Math.cos(t)*4|0,8+Math.sin(t)*4|0);}
  for(let i=0;i<5;i++)B(22+i,5);B(23,6);B(25,6);B(24,7);B(24,8);B(24,9);B(22,10);B(23,10);B(25,10);B(26,10);
  for(let i=2;i<w-2;i+=3){ctx.fillStyle=((i/3|0)+(T>>4))%2?'#ffe8a0':'#7a5a3a';ctx.fillRect(x+i,y+14.4,1,0.9);}
}
// balcón de piedra con balaustres y una maceta seca
function M9_balcony(pl){
  const x=pl.x,y=pl.y,w=pl.w;
  ctx.fillStyle='#4a4250';ctx.fillRect(x,y,w,4);ctx.fillStyle='#6a6274';ctx.fillRect(x,y,w,0.8);ctx.fillStyle='#2a2430';ctx.fillRect(x,y+4,w,1);
  ctx.fillStyle='#3a3442';for(const mx of[x+4,x+w-9]){ctx.beginPath();ctx.moveTo(mx,y+5);ctx.lineTo(mx+5,y+5);ctx.lineTo(mx+3,y+12);ctx.lineTo(mx+2,y+12);ctx.closePath();ctx.fill();}
  ctx.fillStyle='#4a4250';ctx.fillRect(x,y-9,w,1.6);
  for(let i=x+2;i<x+w-2;i+=4){ctx.fillStyle='#3e3848';ctx.fillRect(i,y-7.4,2,7.4);ctx.fillStyle='#544c5e';ctx.fillRect(i,y-5,2,1);}
  ctx.fillStyle='#5a3424';ctx.fillRect(x+w-8,y-13,5,4);ctx.strokeStyle='#3a2a20';ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(x+w-6,y-13);ctx.lineTo(x+w-8,y-17);ctx.moveTo(x+w-5,y-13);ctx.lineTo(x+w-3,y-18);ctx.stroke();
}
// cómoda vieja (escalón de la arena del villano): un cajón se abre y se cierra solo
function M9_comoda(pl){
  const x=pl.x,y=pl.y,w=pl.w,h=GROUND-y;
  ctx.fillStyle='#3a2420';ctx.fillRect(x,y,w,h-3);ctx.fillStyle='#5a3a2e';ctx.fillRect(x-1,y,w+2,2);ctx.fillStyle='#22140f';ctx.fillRect(x+2,GROUND-3,3,3);ctx.fillRect(x+w-5,GROUND-3,3,3);
  const n=Math.max(1,Math.floor((h-6)/8));
  for(let i=0;i<n;i++){const dy=y+3+i*8,open=i===0?Math.max(0,Math.sin(T/50+x))*4:0;
    ctx.fillStyle='#4a2e26';ctx.fillRect(x+2,dy,w-4,6.6);ctx.fillStyle='#22140f';ctx.fillRect(x+2,dy+6.6,w-4,0.8);
    if(open>0.3){ctx.fillStyle='#14100c';ctx.fillRect(x+2,dy,w-4,1.2);ctx.fillStyle='#5a3a2e';ctx.fillRect(x+2,dy+open*0.2,w-4,6.6);}
    ctx.fillStyle='#c9a040';ctx.fillRect(x+w/2-1,dy+3,2,1);}
}
// baúles apilados (la pirámide): tapa curva, correas, esquinas de bronce; el de arriba se abre solo
function M9_baul(pl){
  const x=pl.x,y=pl.y,w=pl.w,h=pl.pyr.dy,col=pl.mat,n=Math.max(1,Math.round(w/52)),tw=w/n;
  for(let i=0;i<n;i++){const bx=x+i*tw,bw=tw-1;
    ctx.fillStyle='#14101c';ctx.fillRect(bx,y,bw,h);
    ctx.fillStyle=col;ctx.fillRect(bx+0.5,y+6,bw-1,h-6.5);
    const top=pl.tier===pl.pyr.n-1&&i===0,lid=top?Math.max(0,Math.sin(T/70))*0.13:0;
    ctx.save();ctx.translate(bx+0.5,y+6);ctx.rotate(-lid);
    if(lid>0.02){ctx.restore();ctx.fillStyle=`rgba(159,227,255,${lid*5})`;ctx.fillRect(bx+2,y+4,bw-4,2);ctx.fillStyle=`rgba(159,227,255,${lid*1.2})`;ctx.fillRect(bx+4,y-6,bw-8,10);ctx.save();ctx.translate(bx+0.5,y+6);ctx.rotate(-lid);}
    ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-3);ctx.quadraticCurveTo((bw-1)/2,-7,bw-1,-3);ctx.lineTo(bw-1,0);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillRect(2,-4.6,bw-5,0.8);ctx.fillStyle='rgba(0,0,0,0.35)';ctx.fillRect(0,-0.6,bw-1,1);
    ctx.restore();
    ctx.fillStyle='rgba(0,0,0,0.25)';for(let k=bx+3;k<bx+bw-2;k+=5)ctx.fillRect(k,y+8,0.7,h-10);
    ctx.fillStyle='#2a1a12';ctx.fillRect(bx+bw*0.22,y+2,3,h-2);ctx.fillRect(bx+bw*0.72,y+2,3,h-2);
    ctx.fillStyle='#c9a040';ctx.fillRect(bx+bw*0.22,y+11,3,2);ctx.fillRect(bx+bw*0.72,y+11,3,2);
    ctx.fillRect(bx+bw/2-2,y+5,4,4);ctx.fillStyle='#14101c';ctx.fillRect(bx+bw/2-0.4,y+6.5,0.8,1.6);
    ctx.fillStyle='#a08040';ctx.fillRect(bx,y+h-3,3,3);ctx.fillRect(bx+bw-3,y+h-3,3,3);ctx.fillRect(bx,y+3,3,3);ctx.fillRect(bx+bw-3,y+3,3,3);}
  ctx.fillStyle='rgba(0,0,0,0.3)';ctx.fillRect(x+w-2,y,2,h);
}
// pasaje techado / boca de subte abandonado: azulejos, una escalera que baja a oscuras y una lamparita
function M9_pasajeBack(pl){
  const x=pl.x,y=pl.y,w=pl.w,iy=y+9,ih=GROUND-iy;
  ctx.fillStyle='#120e1a';ctx.fillRect(x+3,iy,w-6,ih);
  ctx.fillStyle='rgba(216,204,176,0.10)';for(let r=iy+2;r<GROUND-10;r+=3)for(let k=x+6;k<x+w-6;k+=4)ctx.fillRect(k,r,3,2);
  ctx.fillStyle='rgba(60,90,80,0.35)';ctx.fillRect(x+3,iy+12,w-6,1.4);
  // escalera que baja (en el medio): escalones cada vez más oscuros y una luz lila desde abajo
  const sx=x+w/2-14;ctx.fillStyle='#0a0810';ctx.fillRect(sx,iy+10,28,ih-10);
  for(let i=0;i<5;i++){ctx.fillStyle=`rgba(90,80,110,${0.5-i*0.09})`;ctx.fillRect(sx+2+i*1.5,GROUND-4-i*4,24-i*3,1);}
  ctx.fillStyle=`rgba(185,163,216,${0.10+0.06*Math.sin(T/20)})`;ctx.fillRect(sx+4,iy+14,20,ih-14);
  // cartelito con flecha que baja (sin letras)
  ctx.fillStyle='#2a3a48';ctx.fillRect(sx+6,iy+3,16,5);ctx.fillStyle='#d8ccb0';ctx.fillRect(sx+13.5,iy+4,1,2.6);ctx.beginPath();ctx.moveTo(sx+12,iy+5.6);ctx.lineTo(sx+16,iy+5.6);ctx.lineTo(sx+14,iy+7.6);ctx.fill();
  // lamparita colgada que titila
  const lx=x+22,on=(T+13)%140>6&&!(M9.flick>0&&(T>>1)%2);ctx.fillStyle='#16121e';ctx.fillRect(lx,iy,0.7,7);
  ctx.fillStyle=on?'#ffe0a0':'#4a3a2a';ctx.fillRect(lx-1,iy+7,2.6,2);
  if(on){ctx.fillStyle='rgba(255,224,160,0.07)';ctx.beginPath();ctx.moveTo(lx-1,iy+9);ctx.lineTo(lx-16,GROUND);ctx.lineTo(lx+18,GROUND);ctx.lineTo(lx+2,iy+9);ctx.fill();}
  M9_pasajeShell(x,y,w);
}
// frente del pasaje: losa de ladrillo con dovela y pilares con arco
function M9_pasajeShell(x,y,w){
  ctx.fillStyle='#3a2630';ctx.fillRect(x,y,w,9);ctx.fillStyle='#2a1c24';for(let k=x+2;k<x+w;k+=6)ctx.fillRect(k,y+1,0.6,7);ctx.fillRect(x,y+4.5,w,0.6);
  ctx.fillStyle='#5e5260';ctx.fillRect(x-2,y-1,w+4,1.6);ctx.fillStyle='#4a3e4a';ctx.fillRect(x,y+8,w,1.2);
  ctx.fillStyle='#6a5c6a';ctx.fillRect(x+w/2-3,y+1,6,7);
  for(const px of[x-3,x+w-3]){ctx.fillStyle='#3a2630';ctx.fillRect(px,y,6,GROUND-y);ctx.fillStyle='#4e3a44';ctx.fillRect(px,y,1,GROUND-y);ctx.fillStyle='#2a1c24';for(let r=y+4;r<GROUND;r+=4)ctx.fillRect(px,r,6,0.6);}
}
M9_LVL.drawTunnelFront=function(t){
  if(t.k!=='pasaje')return false;
  const iy=t.y+9;
  ctx.fillStyle='rgba(8,6,16,0.32)';ctx.fillRect(t.x,iy,t.w,GROUND-iy);
  const g=ctx.createLinearGradient(0,iy,0,iy+12);g.addColorStop(0,'rgba(0,0,0,0.55)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(t.x,iy,t.w,12);
  // arcos: el borde de abajo de la losa curvado entre pilares
  ctx.fillStyle='#3a2630';for(const ax of[t.x+3,t.x+t.w/2]){const aw=t.w/2-3;ctx.beginPath();ctx.moveTo(ax,iy);ctx.lineTo(ax+aw,iy);ctx.lineTo(ax+aw,iy+5);ctx.quadraticCurveTo(ax+aw/2,iy-1,ax,iy+5);ctx.closePath();ctx.fill();}
  M9_pasajeShell(t.x,t.y,t.w);
  ctx.fillStyle='#3a2630';ctx.fillRect(t.x+t.w/2-2,t.y+9,4,8);
  return true;
};

// ================== coberturas propias (con los ojitos del fantasma escondido) ==================
M9_LVL.drawCover=function(c){
  if(c.vida<=0)return false;
  const g0=M9.hid.get(c),g=g0&&(g0.st==='hide'||g0.st==='rattle')?g0:null,ratt=g&&g.st==='rattle',jx=ratt?Math.sin(T*2.3)*0.9:0;
  ctx.save();ctx.translate(jx,0);
  const x=c.x,w=c.w,top=c.top,h=c.h;
  switch(c.k){
  case 'kiosco':{ // puesto de diarios con techito
    ctx.fillStyle='#2e3a34';ctx.fillRect(x,top+3,w,h-3);ctx.fillStyle='#46564a';ctx.beginPath();ctx.moveTo(x-2,top+4);ctx.lineTo(x+w/2,top-1);ctx.lineTo(x+w+2,top+4);ctx.closePath();ctx.fill();
    ctx.fillStyle='#1a221e';ctx.fillRect(x+2,top+5,w-4,5);
    ctx.fillStyle='#d8ccb0';for(let i=0;i<3;i++){ctx.fillRect(x+3+i*6.5,top+10.5,5,3);ctx.fillStyle='#8a8070';ctx.fillRect(x+3.6+i*6.5,top+11.4,3,0.5);ctx.fillRect(x+3.6+i*6.5,top+12.4,3.6,0.5);ctx.fillStyle='#d8ccb0';}
    break;}
  case 'tachos':{ // dos tachos de basura con tapa (la tapa salta si hay algo adentro)
    for(const [ox,k] of[[1,0],[12,1]]){const lid=ratt&&((T>>2)+k)%2?-1.4:0;
      ctx.fillStyle='#44444e';ctx.fillRect(x+ox,top+3,9,h-3);ctx.fillStyle='#5a5a66';for(let r=top+5;r<GROUND-1;r+=3)ctx.fillRect(x+ox,r,9,0.6);
      ctx.fillStyle='#6a6a76';ctx.fillRect(x+ox-0.5,top+1.6+lid,10,1.8);ctx.fillRect(x+ox+3.5,top+0.4+lid,2,1.2);}
    break;}
  case 'valijas':{ // valijas apiladas
    ctx.fillStyle='#5a3424';ctx.fillRect(x,top+7,w,h-7);ctx.fillStyle='#34405a';ctx.fillRect(x+2,top+2,w-6,5.4);ctx.fillStyle='#6a5226';ctx.fillRect(x+5,top-1,w-12,3.2);
    ctx.fillStyle='#2a1a12';ctx.fillRect(x+w*0.3,top+7,1.4,h-7);ctx.fillRect(x+w*0.7,top+7,1.4,h-7);
    ctx.fillStyle='#c9a040';ctx.fillRect(x+w/2-1.5,top+6,3,1);ctx.fillRect(x+w/2-1,top+1.2,2,0.8);
    break;}
  default:ctx.restore();return false;
  }
  // ojos del fantasma escondido: se ven apenas; temblando se prenden fuerte
  if(g){const p=ratt?1:0.35+0.25*Math.sin(T/14+c.x);const ex=x+w/2+Math.sin(T/40+c.x)*3,ey=top+h*0.55;
    ctx.fillStyle=`rgba(20,10,30,${0.6*p})`;ctx.fillRect(ex-4,ey-1.6,8,3.2);
    ctx.fillStyle=ratt&&(T>>1)%2?'#ffffff':`rgba(159,227,255,${p})`;ctx.fillRect(q(ex-2.6),q(ey-0.6),1.2,1.2);ctx.fillRect(q(ex+1.4),q(ey-0.6),1.2,1.2);
    if(ratt){ctx.fillStyle='rgba(159,227,255,0.18)';circle(x+w/2,top+h/2,w*0.7);}}
  if(c.vida<c.max*0.5){ctx.fillStyle='rgba(10,10,16,0.6)';ctx.fillRect(x+w*0.25,top+1,1,h*0.5);ctx.fillRect(x+w*0.7,top,2,2);}
  ctx.restore();
  return true;
};
