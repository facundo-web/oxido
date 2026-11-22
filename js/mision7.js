'use strict';
// Óxido · Misión 7: Nave a la deriva (pasillos de una nave abandonada, ductos en el techo y los raspadores)
// Todo lo de este archivo usa el prefijo M7_ para no chocar con otros nombres globales.
// La acción de la misión: los raspadores viajan ADENTRO del ducto del techo (se ve el bulto que avanza, cae polvo,
// suena el metal que se arrastra), se paran sobre una rejilla que vibra y marca el piso, y recién ahí caen.

// ================== datos de la misión ==================
const M7_LVL={name:'MISIÓN 7 · NAVE A LA DERIVA',short:'7 · NAVE A LA DERIVA',theme:'nave',end:3400,music:'l7',
  platforms:[{x:250,y:130,w:50},{x:330,y:122,w:56},{x:440,y:110,w:50},{x:700,y:124,w:70},{x:830,y:100,w:56},{x:960,y:124,w:60},
    {x:1150,y:126,w:50},{x:1330,y:110,w:50},{x:1690,y:122,w:60},{x:1790,y:102,w:50},
    {x:2220,y:124,w:56},{x:2380,y:108,w:50},{x:2620,y:122,w:70},{x:2760,y:104,w:60},{x:2830,y:126,w:56},{x:2990,y:118,w:50},
    // altas: pasarela colgada del techo y el brazo de una grúa de carga
    {x:872,y:62,w:40,hi:'pasarela'},{x:1836,y:64,w:44,hi:'grua'},{x:2800,y:62,w:40,hi:'pasarela'},
    // escalones en la arena del villano (el lado derecho queda libre para el reactor)
    {x:3120,y:128,w:34,step:1},{x:3196,y:110,w:34,step:1}],
  // ducto grande de ventilación que cruza el pasillo (el techo es plataforma)
  tunnels:[{x:1480,w:126,y:116,k:'ducto'}],
  // escalones de contenedores de carga
  pyramids:[{x:1940,w:150,n:4,dy:24,inset:14,mats:['#8c3b2a','#2f6a8a','#b07a2a','#5a6270']}],
  covers:[{x:680,w:24,h:15,k:'consola',hp:12},{x:1112,w:22,h:15,k:'tanques',hp:8},{x:1390,w:24,h:14,k:'cajon',hp:10},
    {x:1850,w:24,h:15,k:'consola',hp:12},{x:2186,w:22,h:15,k:'tanques',hp:8},{x:2520,w:24,h:14,k:'cajon',hp:10},
    {x:3030,w:22,h:15,k:'tanques',hp:8},{x:3160,w:24,h:15,k:'consola',hp:16}],
  crates:[{x:200,drop:'H'},{x:400,drop:'G'},{x:640,drop:'R'},{x:1010,drop:'E'},{x:1190,drop:'+'},{x:1420,drop:'F'},{x:1800,drop:'S'},
    {x:2300,drop:'G'},{x:2640,drop:'+'},{x:2975,drop:'R'},{x:3060,drop:'E'}],
  extraCrates:[{x:500,p:0.45},{x:884,y:62,p:0.7},{x:1848,y:64,p:0.6},{x:2812,y:62,p:0.6}],
  turrets:[1890,2720],mechs:[1740],
  prisoners:[{x:290,k:'ally'},{x:845,y:100,k:'item'},{x:1530,k:'item'},{x:1800,y:102,k:'ally'},{x:2010,y:60,k:'item'},
    {x:2300,k:'item'},{x:2775,y:104,k:'item'},{x:3010,k:'ally'}],
  extraPrisoners:[{x:1850,y:64,p:0.75,k:'ally'},{x:2580,p:0.4,k:'item'}],
  decor:[{x:30,k:'casillero'},{x:110,k:'vapor'},{x:186,k:'cables'},{x:300,k:'cartel'},{x:366,k:'rejaP'},{x:520,k:'tubo'},
    {x:620,k:'casillero'},{x:760,k:'bulbo'},{x:930,k:'vapor'},{x:1046,k:'cables'},{x:1130,k:'rejaP'},{x:1290,k:'bulbo'},
    {x:1446,k:'tubo'},{x:1650,k:'rejaP'},{x:2112,k:'casillero'},{x:2236,k:'cartel'},{x:2330,k:'rejaP'},
    {x:2540,k:'bulbo'},{x:2600,k:'bulbo'},{x:2626,k:'cables'},{x:2668,k:'bulbo'},{x:2730,k:'bulbo'},{x:2770,k:'vapor'},
    {x:2930,k:'rejaP'},{x:2966,k:'tubo'},{x:3090,k:'cartel'},{x:3250,k:'vapor'}],
  events:[
    {at:20,spawn:[{t:'soldier',x:'R',d:70}]},
    {at:110,spawn:[{t:'soldier',x:450,y:92}]},
    {at:170,spawn:[{t:'m7Bicho',x:'R',d:20}]},
    {at:240,spawn:[{t:'grenadier',x:'R'},{t:'soldier',x:'R',d:50},{t:'drone',x:'R',d:120}]},
    {at:400,spawn:[{t:'m7Bicho',x:'R'},{t:'soldier',x:'R',d:70}]},
    {at:560,spawn:[{t:'soldier',x:845,y:82},{t:'drone',x:'R',d:30},{t:'m7Bicho',x:'L',d:60}]},
    {at:700,spawn:[{t:'shield',x:'R'},{t:'grenadier',x:'R',d:60},{t:'m7Bicho',x:'R',d:110}]},
    {at:1200,spawn:[{t:'soldier',x:1700,y:104},{t:'m7Bicho',x:1650,d:30}]},
    {at:1320,spawn:[{t:'grenadier',x:1800,y:84},{t:'drone',x:'R',d:40}]},
    // cofre blindado adentro del ducto grande: al acercarte viene una oleada grande
    {at:1380,spawn:[{t:'shield',x:'R'},{t:'soldier',x:'L',d:30},{t:'grenadier',x:'R',d:60},{t:'drone',x:'L',d:90},{t:'m7Bicho',x:'R',d:110},{t:'soldier',x:'R',d:130},{t:'soldier',x:'L',d:170}]},
    {at:1460,spawn:[{t:'shield',x:'R'},{t:'soldier',x:'R',d:40},{t:'drone',x:'R',d:90}]},
    {at:1820,spawn:[{t:'drone',x:'R'},{t:'soldier',x:2000,y:42,d:20},{t:'m7Bicho',x:'R',d:40},{t:'soldier',x:'R',d:70},{t:'shield',x:'R',d:120}]},
    {at:2260,spawn:[{t:'m7Bicho',x:2330},{t:'m7Bicho',x:'R',d:30},{t:'soldier',x:2640,y:104},{t:'shield',x:'R',d:30}]},
    {at:2380,spawn:[{t:'soldier',x:2780,y:86},{t:'soldier',x:'R',d:20},{t:'drone',x:'R',d:80}]},
    {at:2520,spawn:[{t:'m7Bicho',x:'R'},{t:'soldier',x:'R',d:60}]},
    {at:2740,spawn:[{t:'m7Bicho',x:'L',d:20},{t:'grenadier',x:'R',d:70}]},
    {at:2860,spawn:[{t:'shield',x:'R'},{t:'m7Bicho',x:2930,d:30},{t:'drone',x:'R',d:90}]}],
  arenas:[
    // jefe chico a un tercio; después juego normal y una emboscada; el villano al final (nunca seguidos)
    {at:1100,mini:true},
    {at:2160,waves:[
      [{t:'soldier',x:'R'},{t:'m7Bicho',x:'L',d:30},{t:'soldier',x:'L',d:60}],
      [{t:'drone',x:'R'},{t:'m7Bicho',x:'R',d:20},{t:'m7Bicho',x:'R',d:60},{t:'grenadier',x:'R',d:60}],
      [{t:'shield',x:'R'},{t:'m7Bicho',x:'R',d:30},{t:'soldier',x:'L',d:50},{t:'drone',x:'R',d:110}]]},
    {at:3080,boss:true}],
  vaults:[{x:1572}]};
for(const t of M7_LVL.tunnels)M7_LVL.platforms.push({x:t.x,y:t.y,w:t.w,roof:t});
for(const p of M7_LVL.pyramids)for(let i=0;i<p.n;i++)
  M7_LVL.platforms.push({x:p.x+i*p.inset,y:GROUND-(i+1)*p.dy,w:p.w-2*i*p.inset,pyr:p,tier:i,mat:p.mats[i%p.mats.length]});
M7_LVL.events.sort((a,b)=>a.at-b.at);
const M7_IDX=LEVELS.push(M7_LVL)-1;
NV_COSTO.m7Bicho=0.8;
COB_COL.consola=['#3a4250','#5a6474'];COB_COL.tanques=['#6a7a5a','#8a9a6a'];COB_COL.cajon=['#4a4e58','#d9a43a'];
KILL_NAMES.push(['m7Bicho','raspadores']);

// ================== utilidades ==================
const M7_sfx=(n,...a)=>{if(typeof SFX!=='undefined'&&SFX[n])SFX[n](...a);};
function M7_pc(p){p=p||P;return p.ride?{x:p.ride.x+p.ride.w/2,y:p.ride.y+p.ride.h/2}:{x:p.x+4,y:p.y+9};}
const M7_ease=t=>t<0?0:t>1?1:t*t*(3-2*t);
// techo: losa hasta y=22, ducto de 22 a 33 con rejillas cada 72 px
const M7_CEIL=22,M7_DUCT=33,M7_GSTEP=72,M7_G0=40,M7_HIDE=GROUND+70;
const M7_gratesIn=(a,b)=>{const out=[];for(let g=Math.ceil((a-M7_G0)/M7_GSTEP)*M7_GSTEP+M7_G0;g<=b;g+=M7_GSTEP)out.push(g);return out;};
function M7_spark(x,y,n,col){for(let i=0;i<n;i++)parts.push({k:'p',x:x+rand(-2,2),y,vx:rand(-0.6,0.6),vy:rand(0,0.8),g:0.12,life:rand(18,30),maxl:30,size:1,col:col||(i%2?'#ffd27a':'#fff3c0')});}
function M7_dust(x,y,n){for(let i=0;i<n;i++)parts.push({k:'p',x:x+rand(-4,4),y,vx:rand(-0.2,0.2),vy:rand(0.1,0.5),g:0.05,life:rand(30,46),maxl:46,size:1,col:i%2?'#8a8e9a':'#5a5e6a'});}

// ================== estado que se reinicia en cada partida ==================
const M7={open:new Map(),shk:new Map(),vents:new Map(),bulbs:new Map(),told:0,flick:0,rasp:0};
function M7_reset(){
  M7.open=new Map();M7.shk=new Map();M7.vents=new Map();M7.bulbs=new Map();M7.told=0;M7.flick=0;M7.rasp=0;
  if(L!==M7_LVL)return;
  const list=M7_LVL.decor.filter(d=>d.k==='bulbo');let n=0;
  for(const d of list){const op=Math.random()<0.65;if(op)n++;M7.bulbs.set(d,{st:op?'closed':'dud',t:0,k:0,ph:rand(0,6)});}
  for(const d of list){if(n>=3)break;const s=M7.bulbs.get(d);if(s.st==='dud'){s.st='closed';n++;}}
  for(const d of M7_LVL.decor)if(d.k==='rejaP')M7.vents.set(d,{shk:0,open:0,busy:false});
}
ON_START.push(M7_reset);

// ================== raspadores (la criatura de la misión) ==================
// Bicho chato de muchas patas, violeta con pintas naranjas que brillan. Viaja por adentro del ducto del techo.
// Aviso: bulto que avanza por el ducto + polvo que cae + raspado metálico (y una flechita en el borde si viene de afuera).
// Después se para en una rejilla: la rejilla vibra, caen chispas, sale luz violeta y el piso se marca abajo. Recién ahí cae.
// En el piso corre rápido y muerde; de cerca se agacha (brilla naranja y chilla) y salta en arco: se esquiva saltando o yéndose.
// También salen de las rejillas de las paredes (la rejilla tiembla y se ven ojitos antes) y de los capullos de cables.
// Escondido, su caja se corre lejos (x=-9999). La caja de balas es más alta que el dibujo (10 px) para pegarle parado.
const M7_MAX=6;
function M7_nBichos(){let n=0;for(const e of enemies)if(e.type==='m7Bicho'&&!e.gone)n++;return n;}
function M7_newBicho(o){
  if(M7_nBichos()>=M7_MAX)return null;
  const sm=!!o.small;
  return Object.assign({type:'m7Bicho',x:-9999,y:M7_HIDE,w:sm?9:12,h:10,hp:sm?1:2,face:-1,flash:0,score:sm?60:150,cd:rand(40,90),st:'duct',t:0,
    hx:0,gx:null,spd:sm?2:1.7,small:sm,anim:rand(0,99),life:0,dlife:0,vx:0,vy:0,back:0,bite:0,hitL:false,vent:null,
    upd:M7_updBicho,draw:M7_drawBicho,onKill:M7_killBicho},o);
}
function M7_dummy(){return{type:'m7Bicho',gone:true,x:-9999,y:M7_HIDE,w:1,h:1,hp:1,cd:0,score:0};}
function M7_mkBicho(x){
  const fromR=Math.abs(x-(camX+W+12))<0.5,fromL=Math.abs(x-(camX-20))<0.5;
  let e=null;
  if(fromR||fromL)e=M7_newBicho({st:'duct',hx:fromR?camX+W+30:camX-30,face:fromR?-1:1});
  else{
    // al lado de una rejilla de pared libre: sale por la pared; si no, ya está en el ducto
    let v=null;for(const [d,s] of M7.vents)if(!s.busy&&Math.abs(d.x+7-x)<50){v=d;break;}
    if(v){e=M7_newBicho({st:'wait',vent:v,hx:v.x+7});if(e)M7.vents.get(v).busy=true;}
    else e=M7_newBicho({st:'duct',hx:x});
  }
  if(e&&e.st==='duct'&&!M7.told){M7.told=1;setBanner('¡ALGO SE MUEVE EN LOS DUCTOS!',110);}
  return e||M7_dummy();
}
// raspador que entra al ducto desde un punto (lo usan los jefes)
function M7_ductBicho(hx,small){const e=M7_newBicho({st:'duct',hx,small,face:hx>camX+W/2?-1:1});if(e){e.hp=Math.max(1,Math.round(e.hp*DIFF().ehp));enemies.push(e);}return e;}
// rejilla del techo hacia donde va: un poco antes del jugador más cercano, del lado de donde viene
function M7_pickGrate(e){
  const p=nearestPlayer?nearestPlayer(e.hx,30):P,pc=M7_pc(p),side=Math.sign(e.hx-pc.x)||1;
  const want=clamp(pc.x+side*rand(24,56),camX+18,camX+W-18);
  const gs=M7_gratesIn(camX+12,camX+W-12);if(!gs.length)return null;
  let best=gs[0],bd=1e9;for(const g of gs){let d=Math.abs(g-want);
    for(const o of enemies)if(o!==e&&o.type==='m7Bicho'&&o.gx===g&&(o.st==='duct'||o.st==='grate'))d+=60;
    if(d<bd){bd=d;best=g;}}
  return best;
}
function M7_hidden(e){e.x=-9999;e.y=M7_HIDE;}
function M7_updBicho(e){
  if(e.flash>0)e.flash--;e.anim++;
  const pc=P.dead?null:M7_pc();
  switch(e.st){
  case 'duct':{
    M7_hidden(e);e.dlife++;
    if(e.hx<camX-120&&!lock){e.gone=true;return;}
    if(e.gx===null||(e.dlife%40===0&&Math.abs(e.hx-e.gx)>40))e.gx=M7_pickGrate(e);
    if(e.gx===null)return;
    const d=e.gx-e.hx,sp=e.dlife>600?3:e.spd;
    e.face=d<0?-1:1;e.hx+=clamp(d,-sp,sp);
    const vis=e.hx>camX-10&&e.hx<camX+W+10;
    if(vis&&e.anim%6===0)M7_dust(e.hx+rand(-5,5),M7_DUCT+1,1);
    if(e.hx>camX-90&&e.hx<camX+W+90&&e.anim%13===0){const dd=pc?Math.abs(pc.x-e.hx):200;M7_sfx('m7Raspa',clamp(1-dd/260,0.2,1));}
    if(Math.abs(e.gx-e.hx)<0.5){e.hx=e.gx;e.st='grate';e.t=e.small?40:52;
      if(M7.told<2){M7.told=2;setBanner('¡CUIDADO ARRIBA!',80);}}
    return;}
  case 'grate':
    M7_hidden(e);M7.shk.set(e.gx,Math.max(M7.shk.get(e.gx)||0,e.t));
    if(e.t%4===0)M7_spark(e.gx+rand(-6,6),M7_DUCT+1,1);
    if(e.t%9===0)M7_sfx('m7Reja');
    if(--e.t<=0){e.st='drop';e.x=e.gx-e.w/2;e.y=M7_DUCT-6;e.vy=0.4;e.vx=0;e.hx=e.x;M7.open.set(e.gx,300);M7_sfx('m7Cae');M7_sfx('m7Chillido');
      for(let i=0;i<5;i++)parts.push({k:'p',x:e.gx+rand(-7,7),y:M7_DUCT+1,vx:rand(-1,1),vy:rand(0,1.2),g:0.16,life:rand(20,36),maxl:36,size:rand(1,1.6),col:i%2?'#7a7e8a':'#4a4e5a'});}
    return;
  case 'wait':
    M7_hidden(e);
    {const v=e.vent;if(v.x<camX-30){e.gone=true;M7.vents.get(v).busy=false;return;}
     if(v.x>camX+12&&v.x<camX+W-20&&players.some(p=>!p.dead&&Math.abs(M7_pc(p).x-v.x)<220)){e.st='wallT';e.t=46;}}
    return;
  case 'wallT':{
    M7_hidden(e);const v=e.vent,s=M7.vents.get(v);s.shk=Math.max(s.shk,e.t);
    if(e.t%5===0)M7_spark(v.x+rand(1,13),GROUND-12,1);
    if(e.t%9===0)M7_sfx('m7Reja');
    if(--e.t<=0){s.open=1;s.busy=false;e.st='stun';e.t=12;e.x=v.x+1;e.y=GROUND-e.h;e.hx=e.x;e.face=pc&&pc.x<e.x?-1:1;M7_sfx('m7Cae');M7_sfx('m7Chillido');
      for(let i=0;i<6;i++)parts.push({k:'p',x:v.x+7,y:GROUND-8,vx:rand(-1.2,1.2),vy:rand(-1.6,-0.4),g:0.15,life:rand(18,30),maxl:30,size:1,col:i%2?'#7a7e8a':'#c8ccd8'});}
    return;}
  case 'drop':
    e.vy=Math.min(e.vy+0.25,6);e.y+=e.vy;e.hx=e.x;
    if(e.y+e.h>=GROUND){e.y=GROUND-e.h;e.st='stun';e.t=14;M7_sfx('m7Golpe');dust(e.x+e.w/2,GROUND,4);}
    return;
  case 'stun':if(--e.t<=0)e.st='run';e.y=GROUND-e.h;return;
  case 'leapT':
    e.y=GROUND-e.h;if(pc)e.face=pc.x<e.x+e.w/2?-1:1;
    if(--e.t<=0){const tx=pc?pc.x:e.x+e.face*40;e.vx=clamp((tx-(e.x+e.w/2))/28,-2.6,2.6);e.vy=-3.3;e.st='leap';e.hitL=false;M7_sfx('m7Salto');}
    return;
  case 'leap':
    e.vy+=0.235;e.x+=e.vx;e.y+=e.vy;e.x=clamp(e.x,camX+2,camX+W-e.w-2);e.hx=e.x;
    if(!e.hitL)for(const p of players)if(!p.dead&&overlap(hurtbox(p),e)){withP(p,()=>hurtPlayer(1));e.hitL=true;break;}
    if(e.y+e.h>=GROUND&&e.vy>0){e.y=GROUND-e.h;e.st='rec';e.t=30;e.cd=rand(110,170)*DIFF().fire;dust(e.x+e.w/2,GROUND,3);}
    return;
  case 'rec':if(--e.t<=0)e.st='run';return;
  case 'flee':
    e.vy+=0.235;e.x+=e.vx;e.y+=e.vy;e.hx=e.x;
    if(e.vy>=0||e.y<=M7_DUCT){M7.shk.set(e.gx,20);M7.open.set(e.gx,200);e.gone=true;}
    return;
  }
  // corre
  e.life++;if(e.bite>0)e.bite--;
  const cx=e.x+e.w/2;
  if(e.back>0){e.back--;e.x+=-e.face*1.6;}
  else if(pc){const dx=pc.x-cx;if(Math.abs(dx)>3)e.face=dx<0?-1:1;e.x+=Math.abs(dx)>3?e.face*(e.small?1.35:1.15):Math.sin(e.anim/4)*0.6;
    if(onScreen(e,-6))e.cd--;
    if(!e.small&&e.cd<=0&&Math.abs(dx)<72&&Math.abs(dx)>16){e.st='leapT';e.t=24;M7_sfx('m7Chillido');}}
  e.x=clamp(e.x,camX+2,camX+W-e.w-2);e.y=GROUND-e.h;e.hx=e.x;
  if(e.bite<=0)for(const p of players)if(!p.dead&&overlap(hurtbox(p),{x:e.x+1,y:GROUND-5,w:e.w-2,h:5})){withP(p,()=>hurtPlayer(1));e.back=24;e.bite=60;M7_sfx('m7Chillido');break;}
  // si no te alcanza en 14 s, vuelve al ducto de un salto (sin puntos)
  if(e.life>840){const gs=M7_gratesIn(camX+12,camX+W-12);if(gs.length){let g=gs[0];for(const k of gs)if(Math.abs(k-cx)<Math.abs(g-cx))g=k;
    e.gx=g;e.st='flee';e.vy=-7.4;e.vx=clamp((g-cx)/31,-3,3);M7_sfx('m7Salto');}}
}
function M7_killBicho(e){
  if(e.x<-1000)return;
  M7_sfx('m7Muere');
  const cx=e.x+e.w/2,cy=e.y+e.h-3;
  for(let i=0;i<8;i++)parts.push({k:'p',x:cx,y:cy,vx:rand(-1.5,1.5),vy:rand(-2.4,-0.6),g:0.15,life:rand(18,30),maxl:30,size:i%3?1:1.5,col:i%3===0?'#ffa040':i%3===1?'#5a2a7a':'#2a1438'});
  parts.push({k:'ring',x:cx,y:cy,r:2,max:9,life:10,maxl:10,col:'255,160,64'});
}
function M7_drawBicho(e){
  if(e.st==='duct'||e.st==='grate'||e.st==='wait'||e.st==='wallT')return;   // escondido: se dibuja en el ducto o la rejilla
  const fl=e.flash>0,C=c=>fl?'#fff':c,sc=e.small?0.72:1,air=e.st==='leap'||e.st==='drop'||e.st==='flee';
  const tele=e.st==='leapT',run=e.st==='run'&&!e.back?e.anim:0,bx=e.x+e.w/2,by=e.y+e.h;
  ctx.fillStyle='rgba(0,0,0,0.35)';if(!air)ctx.fillRect(q(e.x),GROUND-0.6,e.w,0.8);
  ctx.save();ctx.translate(q(bx),q(by));ctx.scale(sc,sc);if(e.face<0)ctx.scale(-1,1);
  if(e.st==='drop')ctx.rotate(Math.sin(e.anim/3)*0.25);
  if(tele)ctx.rotate(-0.22);
  // patas: cinco pares finitos, en zigzag
  ctx.strokeStyle=C('#1e0e28');ctx.lineWidth=0.7;ctx.beginPath();
  for(let i=0;i<5;i++){const lx=-5+i*2.4,ph=((run>>1)+i)%2,up=air?-1.2:0;
    ctx.moveTo(lx,-2.4);ctx.lineTo(lx-1.2+ph*0.8,-3.6+up);ctx.lineTo(lx-1.8+ph*1.2+(air?-1:0),0+up*0.4);}
  ctx.stroke();
  // cuerpo: segmentos achatados
  const seg=['#58287a','#6a3290','#7a3aa4','#8a44b8'];
  for(let i=0;i<4;i++){ctx.fillStyle=C(seg[i]);ctx.beginPath();ctx.ellipse(-4.5+i*2.6,-3,2.4,2.1-(i===0?0.4:0),0,0,7);ctx.fill();}
  if(!fl){ctx.fillStyle='#c080f0';for(let i=0;i<4;i++)ctx.fillRect(-5.4+i*2.6,-4.8,1.6,0.6);
    // pintas que brillan (más fuerte cuando se agacha para saltar)
    const g=tele?((T>>1)%2?1:0.6):0.55+0.35*Math.sin(T/9+e.anim*0.01);
    ctx.fillStyle=`rgba(255,160,64,${g})`;for(let i=0;i<4;i++)ctx.fillRect(-4.9+i*2.6,-3.8,0.9,0.9);
    if(tele){ctx.fillStyle='rgba(255,160,64,0.3)';circle(0,-3,6);}}
  // cabeza: chata, con tres ojitos y dos palpos cortos
  ctx.fillStyle=C('#3e1a56');ctx.beginPath();ctx.ellipse(5.4,-2.6,2.2,1.8,0,0,7);ctx.fill();
  if(!fl){ctx.fillStyle=tele?'#fff3c0':'#ffb050';ctx.fillRect(5.6,-3.6,0.8,0.8);ctx.fillRect(6.6,-3,0.8,0.8);ctx.fillRect(5.8,-2.2,0.7,0.7);}
  ctx.strokeStyle=C('#6a3290');ctx.lineWidth=0.5;const pw=Math.sin(e.anim/5)*0.5;ctx.beginPath();
  ctx.moveTo(7,-2);ctx.quadraticCurveTo(8.6,-2.6+pw,9.2,-1+pw);ctx.moveTo(7,-1.4);ctx.quadraticCurveTo(8.2,-0.6-pw,8.6,0.2);ctx.stroke();
  ctx.restore();
}
ENEMY_MAKERS.m7Bicho=M7_mkBicho;

// ================== capullos de cables (bulbos de luz) ==================
// Decorado: un capullo de cables enrollados con una luz naranja adentro que late. Algunos, si te acercás,
// se ponen a chisporrotear y a latir rápido (aviso), los cables se abren de costado y sale un raspador chico.
function M7_bulbUpd(){
  for(const [d,s] of M7.bulbs){
    if(s.st==='closed'){
      if(d.x<camX+24||d.x>camX+W-24)continue;
      if(players.some(p=>{if(p.dead)return false;const x=M7_pc(p).x;return x>d.x-140&&x<d.x+30;})){s.st='swell';s.t=70;M7_sfx('m7Bulbo');}
    }else if(s.st==='swell'){
      if(s.t%6===0)M7_spark(d.x+6+rand(-4,4),GROUND-20,1,'#ffb050');
      if(s.t%12===0)M7_sfx('m7Bulbo');
      if(--s.t<=0){s.st='open';s.k=0;M7_sfx('m7Cae');dust(d.x+6,GROUND,5);
        const e=M7_newBicho({st:'stun',t:16,small:true,x:d.x+2,y:GROUND-10,hx:d.x+2});if(e){e.face=P.x<d.x?-1:1;enemies.push(e);}}
    }else if(s.st==='open'&&s.k<1)s.k=Math.min(1,s.k+0.07);
  }
}
function M7_drawBulbo(d){
  const s=M7.bulbs.get(d)||{st:'dud',k:0,ph:0},x=d.x,g=GROUND,cx=x+6,sw=Math.sin(T/40+x)*0.8;
  const sp=s.st==='swell',op=s.st==='open',k=op?M7_ease(s.k):0;
  // cables que suben al techo
  ctx.strokeStyle='#22202c';ctx.lineWidth=0.9;ctx.beginPath();
  for(let i=0;i<3;i++){const ox=cx-3+i*3;ctx.moveTo(ox,g-22);ctx.quadraticCurveTo(ox+sw*3+(i-1)*4,(g-22+M7_CEIL)/2,ox+(i-1)*6,M7_CEIL);}ctx.stroke();
  // base
  ctx.fillStyle='#2a2d36';ctx.fillRect(x-1,g-3,14,3);ctx.fillStyle='#4a4e5a';ctx.fillRect(x-1,g-3,14,0.8);
  // luz de adentro
  const pulse=sp?(0.6+0.4*((T>>1)%2)):op?0:0.5+0.3*Math.sin(T/22+s.ph);
  if(pulse>0){ctx.fillStyle=`rgba(255,150,60,${0.16*pulse})`;circle(cx,g-12,11+pulse*2);
    ctx.fillStyle=sp?'#fff0b0':'#ffa040';ctx.beginPath();ctx.ellipse(cx,g-12,3.4,6,0,0,7);ctx.fill();
    ctx.fillStyle=`rgba(190,90,220,${0.5*pulse})`;ctx.beginPath();ctx.ellipse(cx,g-12,4.6,7.4,0,0,7);ctx.fill();}
  // dos mitades de cables enrollados (abiertas: se van de costado)
  for(const side of[-1,1]){
    ctx.save();ctx.translate(cx,g-3);ctx.rotate(side*k*0.75+(sp?Math.sin(T*1.7)*0.05:0));
    ctx.fillStyle=op?'#2a2434':'#3a3446';ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(side*8,-6,side*5.5,-15);ctx.quadraticCurveTo(side*2,-21,0,-20);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#14121c';ctx.lineWidth=0.6;ctx.beginPath();
    for(let j=0;j<5;j++){const yy=-3-j*3.4;ctx.moveTo(0,yy);ctx.lineTo(side*(5.4-Math.abs(j-2)*0.9),yy-1.6);}ctx.stroke();
    ctx.fillStyle='#6a6478';ctx.fillRect(side>0?2:-3,-14,1,6);
    ctx.restore();}
  if(!op){const sg=sp?1:0.4+0.3*Math.sin(T/22+s.ph);ctx.fillStyle=sp&&(T>>1)%2?'#fff3c0':`rgba(255,170,80,${sg})`;ctx.beginPath();ctx.ellipse(cx,g-11,sp?1.4:0.9,7,0,0,7);ctx.fill();}
  if(op&&(T+x)%50<3){ctx.fillStyle='#fff3c0';ctx.fillRect(cx-1,g-19,1,1);}
}

// ================== ganchos por cuadro ==================
M7_LVL.upd=function(){
  M7_bulbUpd();
  for(const [g,t] of M7.shk){if(t<=1)M7.shk.delete(g);else M7.shk.set(g,t-1);}
  for(const [g,t] of M7.open){if(t<=1)M7.open.delete(g);else M7.open.set(g,t-1);}
  for(const [,s] of M7.vents)if(s.shk>0)s.shk--;
  // luces que fallan: cada tanto el pasillo parpadea un ratito
  if(M7.flick>0)M7.flick--;else if(Math.random()<0.004)M7.flick=18+((Math.random()*20)|0);
  // vapor de los caños
  if(T%3===0)for(const d of M7_LVL.decor){if(d.k!=='vapor'||d.x<camX-20||d.x>camX+W+20)continue;const ph=(T+((d.x*7)|0))%170;
    if(ph<30){parts.push({k:'smoke',col:'200,206,220',x:d.x+9,y:GROUND-30,vx:rand(0.2,0.7),vy:rand(-0.5,-0.15),life:rand(28,40),maxl:40,size:rand(1.2,2.2),rise:1});
      if(ph===0)M7_sfx('m7Vapor');}}
};

// ================== fondo ==================
const M7_R=mulberry32(77);
const M7_STARS=Array.from({length:70},()=>({x:M7_R()*W,y:M7_R()*140,b:M7_R(),s:M7_R()<0.12?1.4:0.8}));
let M7_TILE=null;
// pared del pasillo (se arma una vez): paneles, dos ventanas al espacio, costillas y una franja de peligro
function M7_wallTile(){
  if(M7_TILE)return M7_TILE;
  const c=document.createElement('canvas');c.width=256;c.height=GROUND;const x=c.getContext('2d');
  x.fillStyle='#1c2029';x.fillRect(0,0,256,GROUND);
  for(let i=0;i<256;i+=32){x.fillStyle=(i/32)%2?'#20252f':'#1a1e27';x.fillRect(i,0,32,GROUND);x.fillStyle='#10131a';x.fillRect(i,0,1,GROUND);}
  x.fillStyle='#2a303c';x.fillRect(0,98,256,3);x.fillStyle='#10131a';x.fillRect(0,101,256,1);
  x.fillStyle='#262b36';x.fillRect(0,128,256,GROUND-128);x.fillStyle='#343a48';x.fillRect(0,128,256,1);
  for(let i=4;i<256;i+=16){x.fillStyle='#3a404e';x.fillRect(i,104,1,1);x.fillRect(i,124,1,1);}
  // franja de peligro abajo
  for(let i=-8;i<256;i+=8){x.fillStyle='#b88a2a';x.beginPath();x.moveTo(i,GROUND-6);x.lineTo(i+4,GROUND-6);x.lineTo(i+8,GROUND-2);x.lineTo(i+4,GROUND-2);x.fill();}
  x.fillStyle='#14171e';x.fillRect(0,GROUND-7,256,1);x.fillRect(0,GROUND-2,256,2);
  // ventanas: marco grueso y el hueco transparente (el espacio se ve por detrás)
  for(const wx of[22,150]){
    x.fillStyle='#3a404e';x.fillRect(wx-4,42,92,54);x.fillStyle='#4e5666';x.fillRect(wx-4,42,92,1.5);x.fillStyle='#0c0e14';x.fillRect(wx-4,95,92,1);
    for(const [rx,ry] of[[wx-2,44],[wx+84,44],[wx-2,92],[wx+84,92]]){x.fillStyle='#6a7282';x.fillRect(rx,ry,1,1);}
    x.save();x.globalCompositeOperation='destination-out';x.beginPath();
    const r=6,X=wx+1,Y=47,Wd=82,Hd=44;x.moveTo(X+r,Y);x.lineTo(X+Wd-r,Y);x.quadraticCurveTo(X+Wd,Y,X+Wd,Y+r);x.lineTo(X+Wd,Y+Hd-r);x.quadraticCurveTo(X+Wd,Y+Hd,X+Wd-r,Y+Hd);
    x.lineTo(X+r,Y+Hd);x.quadraticCurveTo(X,Y+Hd,X,Y+Hd-r);x.lineTo(X,Y+r);x.quadraticCurveTo(X,Y,X+r,Y);x.fill();x.restore();
    x.fillStyle='rgba(150,190,255,0.08)';x.fillRect(wx+8,49,2,40);x.fillRect(wx+13,49,1,40);   // reflejo del vidrio
    x.fillStyle='#2a303c';x.fillRect(wx+40,47,3,44);   // parante del medio
  }
  // costilla gruesa entre ventanas, con el soporte de la baliza
  x.fillStyle='#2e3440';x.fillRect(116,0,20,GROUND-7);x.fillStyle='#3e4554';x.fillRect(116,0,2,GROUND-7);x.fillStyle='#14171e';x.fillRect(134,0,2,GROUND-7);
  x.fillStyle='#14171e';x.fillRect(122,58,8,6);
  M7_TILE=c;return c;
}
function M7_planet(px,py){
  ctx.fillStyle='rgba(120,80,200,0.10)';circle(px,py,40);
  ctx.save();ctx.beginPath();ctx.arc(px,py,30,0,7);ctx.clip();
  ctx.fillStyle='#6a3a5a';ctx.fillRect(px-31,py-31,62,62);
  const bands=['#8a4a5a','#b0644a','#7a3a5e','#c07a4e','#6a3456'];
  for(let i=0;i<5;i++){ctx.fillStyle=bands[i];ctx.fillRect(px-31,py-24+i*11+Math.sin(i*1.7)*2,62,5+(i%2)*2);}
  ctx.fillStyle='rgba(10,6,20,0.55)';ctx.beginPath();ctx.arc(px+14,py+8,32,0,7);ctx.fill();   // lado oscuro
  ctx.restore();
  ctx.strokeStyle='rgba(255,200,160,0.35)';ctx.lineWidth=0.8;ctx.beginPath();ctx.arc(px,py,30,Math.PI*0.75,Math.PI*1.6);ctx.stroke();
}
M7_LVL.drawBG=function(){
  // espacio: estrellas, nebulosa y un planeta
  ctx.fillStyle='#05060f';ctx.fillRect(0,0,W,H);
  ctx.fillStyle='rgba(90,40,120,0.18)';ctx.beginPath();ctx.ellipse(110,70,120,30,-0.2,0,7);ctx.fill();
  const so=camX*0.04;
  for(const s of M7_STARS){const x=((s.x-so)%W+W)%W,tw=s.b>0.8?0.5+0.5*Math.sin(T/20+s.x):1;
    ctx.fillStyle=`rgba(230,235,255,${(0.35+0.6*s.b)*tw})`;ctx.fillRect(x,s.y,s.s,s.s);}
  M7_planet(250-((camX*0.02)%420),76);
  // pared del pasillo con ventanas (paralaje 0.5)
  const tile=M7_wallTile(),off=((camX*0.5)%256+256)%256;
  for(let k=0;k<3;k++)ctx.drawImage(tile,q(-off+k*256),0);
  // balizas rojas que giran, una por tramo de pared
  for(let k=0;k<3;k++){const bx=-off+k*256+126,by=61;if(bx<-80||bx>W+80)continue;
    const a=T*0.07+k*1.3+Math.floor((camX*0.5+off)/256)*0.9,fr=Math.cos(a);
    ctx.fillStyle='rgba(255,40,30,0.13)';
    for(const s of[0,Math.PI]){const b=a+s;ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx+Math.cos(b-0.22)*90,by+Math.sin(b-0.22)*60);ctx.lineTo(bx+Math.cos(b+0.22)*90,by+Math.sin(b+0.22)*60);ctx.closePath();ctx.fill();}
    ctx.fillStyle='#3a1010';ctx.fillRect(bx-4,by-2,8,4);ctx.fillStyle=fr>0.3?'#ff5040':'#a02018';ctx.fillRect(bx-3,by-4,6,3);
    if(fr>0.6){ctx.fillStyle=`rgba(255,80,60,${0.35*fr})`;circle(bx,by-2.5,6);}}
  // caños y vigas cercanas (paralaje 0.75)
  const po=((camX*0.75)%140+140)%140;
  ctx.fillStyle='#262b36';ctx.fillRect(0,112,W,4);ctx.fillStyle='#3a404e';ctx.fillRect(0,112,W,1);
  ctx.fillStyle='#1e222b';ctx.fillRect(0,119,W,2.5);
  for(let x=-po;x<W+20;x+=140){ctx.fillStyle='#14171e';ctx.fillRect(x,34,9,GROUND-34);ctx.fillStyle='#2a303c';ctx.fillRect(x+1,34,2,GROUND-34);
    ctx.fillStyle='#3a404e';ctx.fillRect(x-2,110,13,8);
    const on=(T>>3)%5!==0;ctx.fillStyle=on?'#5af07a':'#1a4a24';ctx.fillRect(x+3,80,2,1.5);ctx.fillStyle=(T>>4)%3?'#ffb040':'#4a3010';ctx.fillRect(x+3,84,2,1.5);}
  if(M7.flick>0&&(M7.flick>>1)%2){ctx.fillStyle='rgba(0,0,0,0.35)';ctx.fillRect(0,0,W,GROUND);}
};

// ================== techo con ducto, piso y avisos de caída (en el mundo) ==================
function M7_drawCeiling(){
  const x0=Math.floor(camX)-10,x1=camX+W+10;
  ctx.fillStyle='#14161e';ctx.fillRect(x0,0,W+20,M7_CEIL);
  for(let t=Math.floor(camX/48)-1;t<x1/48;t++){ctx.fillStyle='#0c0e14';ctx.fillRect(t*48,0,1,M7_CEIL);ctx.fillStyle='#2a2e3a';ctx.fillRect(t*48+3,M7_CEIL-3,1,1);ctx.fillRect(t*48+44,M7_CEIL-3,1,1);}
  ctx.fillStyle='#22262f';ctx.fillRect(x0,M7_CEIL-2,W+20,2);
  // cuerpo del ducto
  ctx.fillStyle='#454a56';ctx.fillRect(x0,M7_CEIL,W+20,M7_DUCT-M7_CEIL);
  ctx.fillStyle='#5e6472';ctx.fillRect(x0,M7_CEIL+1,W+20,2);ctx.fillStyle='#2e323c';ctx.fillRect(x0,M7_DUCT-2,W+20,2);
  for(let t=Math.floor(camX/36)-1;t<x1/36;t++){const fx=t*36+18;ctx.fillStyle='#2e323c';ctx.fillRect(fx,M7_CEIL,1.2,M7_DUCT-M7_CEIL);ctx.fillStyle='#6a7080';ctx.fillRect(fx+1.2,M7_CEIL+1,0.6,M7_DUCT-M7_CEIL-2);}
  // bultos: los raspadores que viajan adentro
  for(const e of enemies){if(e.type!=='m7Bicho'||(e.st!=='duct'&&e.st!=='grate'))continue;const bx=e.hx;if(bx<camX-20||bx>x1+10)continue;
    const j=e.st==='grate'?Math.sin(T*2.3)*0.5:Math.sin(e.anim/2)*0.4,sc=e.small?0.7:1;
    ctx.fillStyle='rgba(180,90,230,0.16)';ctx.beginPath();ctx.ellipse(bx,M7_DUCT+3,12*sc,4,0,0,7);ctx.fill();
    ctx.fillStyle='#1e2128';ctx.beginPath();ctx.ellipse(bx,M7_DUCT-0.6+j,8.6*sc,4.2*sc,0,0,Math.PI);ctx.fill();
    ctx.fillStyle='#565c6a';ctx.beginPath();ctx.ellipse(bx,M7_DUCT-1+j,8*sc,3.6*sc,0,0,Math.PI);ctx.fill();
    ctx.fillStyle='#6e7484';ctx.beginPath();ctx.ellipse(bx-1,M7_DUCT-0.5+j,5*sc,1.8*sc,0,0,Math.PI);ctx.fill();
    ctx.fillStyle='#2a2e38';ctx.beginPath();ctx.ellipse(bx,M7_CEIL+5,7*sc,1.2,0,0,7);ctx.fill();
    // patitas que se marcan contra la chapa
    ctx.fillStyle='#363a46';for(let i=-2;i<=2;i++)ctx.fillRect(bx+i*3+((e.anim>>2)%2),M7_DUCT+1.5*sc+j,0.8,0.8);}
  // rejillas
  for(const g of M7_gratesIn(camX-20,x1)){
    const sh=M7.shk.get(g)||0,op=M7.open.get(g)||0,j=sh?Math.sin(T*2.1)*0.8:0;
    ctx.fillStyle='#0a0b10';ctx.fillRect(g-8,M7_DUCT-3,16,3);
    if(sh){const k=Math.min(1,(52-sh)/52+0.3);ctx.fillStyle=`rgba(190,90,230,${0.35+0.35*((T>>2)%2)})`;ctx.fillRect(g-7,M7_DUCT-2.6,14,2);
      if((T>>3)%2){ctx.fillStyle='#ffb050';ctx.fillRect(g-2,M7_DUCT-2,0.9,0.9);ctx.fillRect(g+1,M7_DUCT-2,0.9,0.9);}
      ctx.fillStyle=`rgba(255,160,64,${0.12*k})`;ctx.fillRect(g-8,M7_DUCT,16,GROUND-M7_DUCT);}
    if(op){ // tapa colgando de una bisagra
      ctx.save();ctx.translate(g-8,M7_DUCT);ctx.rotate(1.2+Math.sin(T/12)*0.08*Math.min(1,op/60));
      ctx.fillStyle='#5e6472';ctx.fillRect(0,-0.5,16,2);ctx.fillStyle='#2a2e38';for(let i=2;i<16;i+=3)ctx.fillRect(i,-0.3,1,1.6);ctx.restore();}
    else{ctx.fillStyle='#6a7080';ctx.fillRect(g-8+j,M7_DUCT-0.6,16,1.6);ctx.fillStyle='#1a1d24';for(let i=1;i<16;i+=3)ctx.fillRect(g-8+i+j,M7_DUCT-0.4,1.4,1.2);
      ctx.fillStyle='#8a90a0';ctx.fillRect(g-8+j,M7_DUCT-0.6,0.8,0.8);ctx.fillRect(g+7+j,M7_DUCT-0.6,0.8,0.8);}
  }
  // lámparas entre rejillas (algunas fallan)
  for(const g of M7_gratesIn(camX-60,x1+40)){const lx=g+36,h=hash(lx|0),bad=h<0.3,on=!M7.flick&&(!bad||((T+((h*999)|0))%97)>8&&((T+((h*777)|0))%41)>2);
    ctx.fillStyle='#22262f';ctx.fillRect(lx-5,M7_DUCT,10,2);ctx.fillStyle=on?'#e8f0ff':'#3a3e48';ctx.fillRect(lx-4,M7_DUCT+2,8,1);
    if(on){ctx.fillStyle='rgba(200,220,255,0.06)';ctx.beginPath();ctx.moveTo(lx-4,M7_DUCT+3);ctx.lineTo(lx-22,GROUND);ctx.lineTo(lx+22,GROUND);ctx.lineTo(lx+4,M7_DUCT+3);ctx.fill();}}
}
M7_LVL.drawGround=function(){
  const x0=Math.floor(camX)-10;
  ctx.fillStyle='#2a2d36';ctx.fillRect(x0,GROUND,W+20,H-GROUND);
  ctx.fillStyle='#4a505e';ctx.fillRect(x0,GROUND,W+20,1.5);ctx.fillStyle='#6a7282';ctx.fillRect(x0,GROUND,W+20,0.6);
  for(let t=Math.floor(camX/24)-1;t<(camX+W)/24+1;t++){const h=hash(t+900),x=t*24;
    ctx.fillStyle='#1a1d24';ctx.fillRect(x,GROUND+1.5,0.8,H-GROUND);
    ctx.fillStyle='#22252e';for(let r=GROUND+4;r<H;r+=3)ctx.fillRect(x+3,r,18,1);
    if(h<0.15){ctx.fillStyle='rgba(20,22,30,0.7)';ctx.beginPath();ctx.ellipse(x+12,GROUND+6,7,1.4,0,0,7);ctx.fill();}   // mancha de aceite
    ctx.fillStyle='#5a606e';ctx.fillRect(x+1,GROUND+2.5,0.8,0.8);ctx.fillRect(x+22,GROUND+2.5,0.8,0.8);}
  M7_drawCeiling();
  // marcas en el piso donde va a caer un raspador
  for(const e of enemies){if(e.type!=='m7Bicho'||e.st!=='grate')continue;const g=e.gx,tot=e.small?40:52,k=1-e.t/tot,on=(T>>2)%2;
    ctx.fillStyle=`rgba(255,150,60,${0.15+0.25*k+(on?0.1:0)})`;ctx.beginPath();ctx.ellipse(g,GROUND,6+k*6,1.8,0,0,7);ctx.fill();
    ctx.strokeStyle=`rgba(255,200,120,${0.4+0.4*k})`;ctx.lineWidth=0.6;ctx.beginPath();ctx.ellipse(g,GROUND,12-k*5,2.4,0,0,7);ctx.stroke();
    ctx.fillStyle=`rgba(255,170,80,${0.25*k})`;for(let y=M7_DUCT+4;y<GROUND-4;y+=7)ctx.fillRect(g-0.4,y,0.8,3);}
};

// ================== capa de arriba: pulso rojo y flechitas en el borde ==================
M7_LVL.drawFx=function(){
  const a=Math.max(0,Math.sin(T*0.07));
  ctx.fillStyle=`rgba(255,30,20,${0.025+0.04*a})`;ctx.fillRect(0,0,W,H);
  // un raspador que viene por el ducto desde afuera de la pantalla: flechita violeta en el borde, a la altura del techo
  for(const e of enemies){if(e.type!=='m7Bicho'||e.st!=='duct')continue;
    const sx=e.hx-camX;if(sx>=-4&&sx<=W+4)continue;
    const left=sx<0,d=left?-sx:sx-W;if(d>220)continue;
    const x=left?3:W-3,y=M7_DUCT+5,on=(T>>2)%2,s=left?1:-1;
    ctx.fillStyle='#120c18';ctx.beginPath();ctx.moveTo(x-s*1,y);ctx.lineTo(x+s*8,y-5);ctx.lineTo(x+s*8,y+5);ctx.closePath();ctx.fill();
    ctx.fillStyle=on?'#f0c0ff':'#b45ae0';ctx.beginPath();ctx.moveTo(x+s*0.5,y);ctx.lineTo(x+s*7,y-3.6);ctx.lineTo(x+s*7,y+3.6);ctx.closePath();ctx.fill();}
};

// ================== decorado ==================
M7_LVL.drawDecor=function(d){
  const x=d.x,g=GROUND;
  switch(d.k){
  case 'bulbo':M7_drawBulbo(d);return true;
  case 'rejaP':{ // rejilla de ventilación en la pared, a ras del piso
    const s=M7.vents.get(d)||{shk:0,open:0},j=s.shk?Math.sin(T*2.2)*0.7:0;
    ctx.fillStyle='#14171e';ctx.fillRect(x-1,g-15,16,14);ctx.fillStyle='#0a0b10';ctx.fillRect(x+1,g-13,12,10);
    if(s.shk){ctx.fillStyle=`rgba(190,90,230,${0.3+0.3*((T>>2)%2)})`;ctx.fillRect(x+1,g-13,12,10);
      if((T>>3)%2){ctx.fillStyle='#ffb050';ctx.fillRect(x+5,g-9,1,1);ctx.fillRect(x+8,g-9,1,1);ctx.fillRect(x+6.5,g-7.5,0.8,0.8);}}
    if(s.open){ctx.save();ctx.translate(x+16,g-1);ctx.rotate(-1.45);ctx.fillStyle='#5e6472';ctx.fillRect(0,-1,12,1.6);ctx.restore();
      ctx.fillStyle='#5e6472';ctx.fillRect(x+15,g-1.5,10,1.5);}
    else{ctx.fillStyle='#5e6472';for(let i=0;i<4;i++)ctx.fillRect(x+1+j,g-12.5+i*2.5,12,1.2);ctx.fillStyle='#8a90a0';ctx.fillRect(x+1+j,g-13,0.8,0.8);ctx.fillRect(x+12+j,g-13,0.8,0.8);}
    return true;}
  case 'vapor':{ // caño con válvula que larga vapor
    ctx.fillStyle='#3a404e';ctx.fillRect(x+2,M7_DUCT,4,g-M7_DUCT);ctx.fillStyle='#5a6070';ctx.fillRect(x+2,M7_DUCT,1,g-M7_DUCT);
    ctx.fillStyle='#3a404e';ctx.fillRect(x+2,g-32,9,4);ctx.fillStyle='#2a2e38';ctx.fillRect(x+10,g-33,2,6);
    ctx.fillStyle='#a02a20';ctx.fillRect(x-1,g-22,10,1.4);ctx.fillRect(x+3.3,g-24,1.4,5);
    ctx.fillStyle='#5a6070';for(let y=M7_DUCT+12;y<g;y+=26)ctx.fillRect(x+1,y,6,2);
    return true;}
  case 'cables':{ // cables colgando del techo que se balancean y a veces chispean
    ctx.strokeStyle='#1a1820';ctx.lineWidth=0.9;
    for(let i=0;i<3;i++){const sw=Math.sin(T/30+i*1.7+x)*3,ln=30+i*12;ctx.beginPath();ctx.moveTo(x+i*4,M7_DUCT);ctx.quadraticCurveTo(x+i*4+sw*0.5,M7_DUCT+ln*0.6,x+i*4+sw,M7_DUCT+ln);ctx.stroke();
      if(i===1&&(T+x)%90<4){ctx.fillStyle='#bfe6ff';ctx.fillRect(x+i*4+sw-1,M7_DUCT+ln,2,2);ctx.fillStyle='rgba(180,220,255,0.3)';circle(x+i*4+sw,M7_DUCT+ln+1,4);}}
    return true;}
  case 'casillero':{ // fila de casilleros, uno con la puerta que se mueve
    ctx.fillStyle='#3a4250';ctx.fillRect(x,g-30,24,30);
    for(let i=0;i<3;i++){ctx.fillStyle='#4a5464';ctx.fillRect(x+1+i*8,g-29,7,28);ctx.fillStyle='#2a303a';for(let k=0;k<3;k++)ctx.fillRect(x+2+i*8,g-26+k*1.6,5,0.7);ctx.fillStyle='#8a90a0';ctx.fillRect(x+6+i*8,g-16,0.8,2);}
    const a=0.3+Math.sin(T/50+x)*0.12;ctx.save();ctx.translate(x+17,g-29);ctx.scale(Math.cos(a),1);ctx.fillStyle='#5a6474';ctx.fillRect(0,0,7,28);ctx.restore();
    ctx.fillStyle='#0c0e14';ctx.fillRect(x+17,g-29,7*(1-Math.cos(a))+0.5,28);
    return true;}
  case 'tubo':{ // caños verticales con medidor
    ctx.fillStyle='#2e3440';ctx.fillRect(x,M7_DUCT,3,g-M7_DUCT);ctx.fillRect(x+5,M7_DUCT,3,g-M7_DUCT);ctx.fillStyle='#4a5260';ctx.fillRect(x,M7_DUCT,1,g-M7_DUCT);ctx.fillRect(x+5,M7_DUCT,1,g-M7_DUCT);
    ctx.fillStyle='#3a404e';ctx.fillRect(x-2,g-40,12,10);ctx.fillStyle='#d8dce6';circle(x+4,g-35,3.2);
    const a=-2.2+Math.sin(T/40+x)*0.9;ctx.strokeStyle='#c02a20';ctx.lineWidth=0.7;ctx.beginPath();ctx.moveTo(x+4,g-35);ctx.lineTo(x+4+Math.cos(a)*2.6,g-35+Math.sin(a)*2.6);ctx.stroke();
    return true;}
  case 'cartel':{ // cartel de peligro (sin texto): triángulo con signo
    ctx.fillStyle='#2a2e38';ctx.fillRect(x,g-56,18,16);ctx.fillStyle='#d9a43a';ctx.beginPath();ctx.moveTo(x+9,g-54);ctx.lineTo(x+16,g-42);ctx.lineTo(x+2,g-42);ctx.closePath();ctx.fill();
    ctx.fillStyle='#120c18';ctx.fillRect(x+8.4,g-51,1.2,5);ctx.fillRect(x+8.4,g-44.8,1.2,1.2);
    ctx.fillStyle='#d9a43a';for(let i=0;i<3;i++)ctx.fillRect(x+1+i*6,g-39,4,1.5);
    return true;}
  }
  return false;
};

// ================== plataformas: pasarelas, grúa, contenedores y ducto grande ==================
M7_LVL.drawPlat=function(pl){
  if(pl.roof){M7_ductBack(pl);return true;}
  if(pl.pyr){M7_container(pl);return true;}
  if(pl.hi==='pasarela'){M7_hanging(pl);return true;}
  if(pl.hi==='grua'){M7_crane(pl);return true;}
  M7_walk(pl);return true;
};
// tablero de pasarela: chapa con agujeros y baranda
function M7_deck(x,y,w){
  ctx.fillStyle='#4a505e';ctx.fillRect(x,y,w,3.5);ctx.fillStyle='#7a8292';ctx.fillRect(x,y,w,0.8);
  ctx.fillStyle='#22252e';for(let i=x+3;i<x+w-2;i+=4)ctx.fillRect(i,y+1.4,1.6,1.2);
  ctx.fillStyle='#14171e';ctx.fillRect(x,y+3.5,w,0.8);
}
// pasarela baja sobre patas con riostras
function M7_walk(pl){
  const x=pl.x,y=pl.y,w=pl.w,h=GROUND-y;
  ctx.strokeStyle='#2a2e38';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x+4,y+4);ctx.lineTo(x+4,GROUND);ctx.moveTo(x+w-4,y+4);ctx.lineTo(x+w-4,GROUND);ctx.stroke();
  if(h>12){ctx.lineWidth=0.6;ctx.beginPath();ctx.moveTo(x+4,y+5);ctx.lineTo(x+w-4,GROUND-2);ctx.moveTo(x+w-4,y+5);ctx.lineTo(x+4,GROUND-2);ctx.stroke();}
  ctx.fillStyle='#3a404e';ctx.fillRect(x+2,GROUND-2,5,2);ctx.fillRect(x+w-7,GROUND-2,5,2);
  M7_deck(x,y,w);
  ctx.fillStyle='#d9a43a';for(let i=x;i<x+w;i+=8)ctx.fillRect(i,y+3.5,4,0.8);   // borde pintado
}
// pasarela colgada del techo con dos barras y baranda
function M7_hanging(pl){
  const x=pl.x,y=pl.y,w=pl.w;
  ctx.fillStyle='#2a2e38';ctx.fillRect(x+3,M7_DUCT,1.4,y-M7_DUCT);ctx.fillRect(x+w-4.4,M7_DUCT,1.4,y-M7_DUCT);
  ctx.strokeStyle='#5a6070';ctx.lineWidth=0.7;ctx.beginPath();ctx.moveTo(x,y-7);ctx.lineTo(x+w,y-7);ctx.moveTo(x,y-3.5);ctx.lineTo(x+w,y-3.5);ctx.stroke();
  ctx.fillStyle='#5a6070';for(let i=x;i<=x+w;i+=10)ctx.fillRect(i,y-7,0.8,7);
  M7_deck(x,y,w);
  const on=(T>>4)%4!==0;ctx.fillStyle=on?'#ff5040':'#4a1010';ctx.fillRect(x+w/2-1,y+4.3,2,1.2);
}
// grúa de carga: columna con franjas y brazo con gancho; arriba se camina
function M7_crane(pl){
  const x=pl.x,y=pl.y,w=pl.w,cx=x+10;
  ctx.fillStyle='#3a404e';ctx.fillRect(cx-5,y+4,10,GROUND-y-4);ctx.fillStyle='#5a6070';ctx.fillRect(cx-5,y+4,1.5,GROUND-y-4);
  ctx.save();ctx.beginPath();ctx.rect(cx-5,GROUND-20,10,18);ctx.clip();
  for(let i=-10;i<20;i+=5){ctx.fillStyle='#d9a43a';ctx.beginPath();ctx.moveTo(cx-5,GROUND-20+i);ctx.lineTo(cx+5,GROUND-25+i);ctx.lineTo(cx+5,GROUND-22.5+i);ctx.lineTo(cx-5,GROUND-17.5+i);ctx.fill();}
  ctx.restore();
  ctx.fillStyle='#2a2e38';ctx.fillRect(cx-8,GROUND-3,16,3);
  const hy=y+18+Math.sin(T/40)*1.5;ctx.strokeStyle='#14171e';ctx.lineWidth=0.6;ctx.beginPath();ctx.moveTo(x+w-4,y+4);ctx.lineTo(x+w-4,hy);ctx.stroke();
  ctx.strokeStyle='#8a90a0';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x+w-4,hy+2,2,0,Math.PI*1.4);ctx.stroke();
  M7_deck(x,y,w);
  ctx.fillStyle='#d9a43a';ctx.fillRect(x,y+3.5,w,1);
}
// contenedor de carga (escalón de la pirámide): chapa acanalada, número pintado y luz arriba
function M7_container(pl){
  const x=pl.x,y=pl.y,w=pl.w,h=pl.pyr.dy,col=pl.mat;
  ctx.fillStyle=col;ctx.fillRect(x,y,w,h);
  ctx.fillStyle='rgba(0,0,0,0.3)';for(let i=x+3;i<x+w-1;i+=4)ctx.fillRect(i,y+3,1.4,h-5);
  ctx.fillStyle='rgba(255,255,255,0.25)';ctx.fillRect(x,y,w,1);ctx.fillStyle='rgba(0,0,0,0.45)';ctx.fillRect(x,y+h-1.5,w,1.5);
  ctx.fillStyle='#14171e';ctx.fillRect(x,y,1.5,h);ctx.fillRect(x+w-1.5,y,1.5,h);
  ctx.fillStyle='rgba(0,0,0,0.35)';ctx.fillRect(x+w/2-0.5,y+2,1,h-3);
  ctx.fillStyle='rgba(240,240,230,0.75)';const n=String(10+pl.tier*13);txt(n,x+8,y+7,5,'rgba(240,240,230,0.7)','left',false);
  if(pl.tier===pl.pyr.n-1){for(let i=x;i<x+w;i+=8){ctx.fillStyle='#d9a43a';ctx.fillRect(i,y,4,1.5);}
    const on=(Math.sin(T/14)+1)/2;ctx.fillStyle=`rgba(255,80,60,${0.4+0.6*on})`;ctx.fillRect(x+w/2-1.5,y-2,3,2);}
}
// ducto grande: adentro oscuro con costillas redondas y una tira de luz; arriba la chapa (atrás del jugador)
function M7_ductBack(pl){
  const x=pl.x,y=pl.y,w=pl.w,iy=y+9,ih=GROUND-iy;
  const g=ctx.createLinearGradient(0,iy,0,GROUND);g.addColorStop(0,'rgba(6,7,12,0.96)');g.addColorStop(0.5,'rgba(22,24,32,0.92)');g.addColorStop(1,'rgba(10,11,16,0.95)');
  ctx.fillStyle=g;ctx.fillRect(x+3,iy,w-6,ih);
  for(let i=x+10;i<x+w-6;i+=16){ctx.fillStyle='#2a2e38';ctx.fillRect(i,iy,2,ih);ctx.fillStyle='#3a404e';ctx.fillRect(i,iy,0.6,ih);}
  ctx.fillStyle=(T>>5)%7?'rgba(255,200,120,0.5)':'rgba(255,200,120,0.15)';ctx.fillRect(x+6,iy+3,w-12,0.8);
  // ventilador al fondo
  const fx=x+w/2,fy=iy+ih/2;ctx.fillStyle='#14171e';circle(fx,fy,9);ctx.fillStyle='#2a2e38';
  for(let i=0;i<4;i++){const a=T*0.12+i*Math.PI/2;ctx.beginPath();ctx.ellipse(fx+Math.cos(a)*4.5,fy+Math.sin(a)*4.5,4,1.6,a,0,7);ctx.fill();}
  ctx.fillStyle='#4a505e';circle(fx,fy,1.6);
  M7_ductShell(x,y,w);
}
// chapa del ducto grande: remaches, bridas a los lados y una flecha de flujo
function M7_ductShell(x,y,w){
  ctx.fillStyle='#4e5462';ctx.fillRect(x,y,w,9);ctx.fillStyle='#6e7686';ctx.fillRect(x,y,w,1.4);ctx.fillStyle='#2a2e38';ctx.fillRect(x,y+7.6,w,1.4);
  ctx.fillStyle='#8a90a0';for(let i=x+4;i<x+w-2;i+=8)ctx.fillRect(i,y+3,0.8,0.8);
  ctx.fillStyle='#3a404e';ctx.fillRect(x-3,y-1,5,GROUND-y+1);ctx.fillRect(x+w-2,y-1,5,GROUND-y+1);
  ctx.fillStyle='#5e6472';ctx.fillRect(x-3,y-1,5,1);ctx.fillRect(x+w-2,y-1,5,1);
  ctx.fillStyle='#d9a43a';const ax=x+w/2;ctx.fillRect(ax-10,y+4,14,1.4);ctx.beginPath();ctx.moveTo(ax+4,y+2.4);ctx.lineTo(ax+8,y+4.7);ctx.lineTo(ax+4,y+7);ctx.fill();
}
M7_LVL.drawTunnelFront=function(t){
  if(t.k!=='ducto')return false;
  const iy=t.y+9;
  ctx.fillStyle='rgba(6,8,14,0.32)';ctx.fillRect(t.x,iy,t.w,GROUND-iy);
  const g=ctx.createLinearGradient(0,iy,0,iy+12);g.addColorStop(0,'rgba(0,0,0,0.55)');g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g;ctx.fillRect(t.x,iy,t.w,12);
  // gotas de condensación
  for(let i=0;i<3;i++){const dx=t.x+20+i*40+hash(i+31)*10,ph=(T+i*53)%80;if(ph>50)continue;
    ctx.fillStyle='rgba(170,200,230,0.6)';ctx.fillRect(dx,iy+ph*(GROUND-iy)/50,0.8,1.6);}
  M7_ductShell(t.x,t.y,t.w);
  return true;
};

// ================== coberturas propias ==================
M7_LVL.drawCover=function(c){
  if(c.vida<=0)return false;
  const x=c.x,w=c.w,top=c.top,h=c.h;
  switch(c.k){
  case 'consola':{ // consola de control con pantalla que titila
    ctx.fillStyle='#3a4250';ctx.beginPath();ctx.moveTo(x,GROUND);ctx.lineTo(x,top+4);ctx.lineTo(x+4,top);ctx.lineTo(x+w,top);ctx.lineTo(x+w,GROUND);ctx.fill();
    ctx.fillStyle='#5a6474';ctx.fillRect(x+4,top,w-4,1);
    ctx.fillStyle='#0a1a14';ctx.fillRect(x+6,top+2.5,w-9,5);
    const on=(T>>3)%6;ctx.fillStyle='#3af07a';for(let i=0;i<3;i++)if((on+i)%4)ctx.fillRect(x+7,top+3.4+i*1.4,(w-12)*(0.4+0.5*hash(i+x+on)),0.6);
    ctx.fillStyle='#d93a2b';ctx.fillRect(x+3,top+10,2,1.4);ctx.fillStyle='#d9a43a';ctx.fillRect(x+7,top+10,2,1.4);ctx.fillStyle='#4a8ad0';ctx.fillRect(x+11,top+10,2,1.4);
    break;}
  case 'tanques':{ // dos tanques de gas atados
    for(const ox of[1,11]){ctx.fillStyle='#6a7a5a';ctx.fillRect(x+ox,top+2,9,h-2);ctx.beginPath();ctx.ellipse(x+ox+4.5,top+2,4.5,2,0,Math.PI,0);ctx.fill();
      ctx.fillStyle='#8a9a6a';ctx.fillRect(x+ox+1,top+2,1.4,h-3);ctx.fillStyle='#2a2e38';ctx.fillRect(x+ox+3.5,top-1,2,2);
      ctx.fillStyle='#d93a2b';ctx.fillRect(x+ox,top+6,9,1.2);}
    ctx.fillStyle='#3a3020';ctx.fillRect(x,top+9,w,1);break;}
  case 'cajon':{ // cajón de metal con franjas
    ctx.fillStyle='#4a4e58';ctx.fillRect(x,top,w,h);ctx.fillStyle='#6a7080';ctx.fillRect(x,top,w,1);
    ctx.save();ctx.beginPath();ctx.rect(x+2,top+3,w-4,4);ctx.clip();
    for(let i=-4;i<w;i+=6){ctx.fillStyle='#d9a43a';ctx.beginPath();ctx.moveTo(x+i,top+7);ctx.lineTo(x+i+3,top+3);ctx.lineTo(x+i+6,top+3);ctx.lineTo(x+i+3,top+7);ctx.fill();}
    ctx.restore();ctx.fillStyle='#2a2e38';ctx.fillRect(x+2,top+9,w-4,0.8);ctx.fillRect(x+w/2-2,top+10,4,2);break;}
  default:return false;
  }
  if(c.vida<c.max*0.5){ctx.fillStyle='rgba(10,10,16,0.6)';ctx.fillRect(x+w*0.25,top+1,1,h*0.5);ctx.fillRect(x+w*0.7,top,2,2);}
  return true;
};
