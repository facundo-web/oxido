'use strict';
// Óxido · Misión 4: Arenas del Rey (desierto, tumbas, arena movediza, momias, escarabajos y la tormenta con cara)
// Todo lo de este archivo usa el prefijo M4_ para no chocar con otros nombres globales.

// ================== datos de la misión ==================
const M4_LVL={name:'MISIÓN 4 · ARENAS DEL REY',short:'4 · ARENAS DEL REY',theme:'desert',end:3400,music:'l4',
  platforms:[{x:250,y:130,w:50},{x:330,y:122,w:56},{x:440,y:110,w:50},{x:700,y:124,w:70},{x:830,y:100,w:56},{x:960,y:124,w:60},
    {x:1150,y:126,w:50},{x:1330,y:110,w:50},{x:1690,y:122,w:60},{x:1790,y:102,w:50},
    {x:2220,y:124,w:56},{x:2380,y:108,w:50},{x:2620,y:122,w:70},{x:2760,y:104,w:60},{x:2830,y:126,w:56},{x:2990,y:118,w:50},
    // altas: capitel de una columna rota y el andamio de una excavación
    {x:872,y:62,w:40,hi:'columna'},{x:1836,y:64,w:44,hi:'andamio'},{x:2800,y:62,w:40,hi:'columna'},
    // bloques en la arena del villano (el lado derecho queda libre para su sarcófago)
    {x:3120,y:128,w:34,step:1},{x:3196,y:110,w:34,step:1}],
  // entrada a una tumba (el techo es plataforma)
  tunnels:[{x:1480,w:126,y:116,k:'tumba'}],
  // pirámide escalonada de bloques de arenisca
  pyramids:[{x:1940,w:150,n:4,dy:24,inset:14,mats:['base','base','glifos','cima']}],
  // arena movediza: frena al que camina adentro (tiene estaca de aviso a la izquierda)
  quick:[{x:540,w:64},{x:1222,w:64},{x:2436,w:70},{x:2880,w:60}],
  covers:[{x:680,w:24,h:15,k:'bloque',hp:14},{x:1112,w:26,h:15,k:'carro',hp:10},{x:1390,w:22,h:14,k:'anforas',hp:6},
    {x:1850,w:24,h:15,k:'bloque',hp:14},{x:2186,w:26,h:15,k:'carro',hp:10},{x:2520,w:22,h:14,k:'anforas',hp:6},
    {x:3030,w:26,h:15,k:'carro',hp:10},{x:3160,w:24,h:15,k:'bloque',hp:16}],
  crates:[{x:200,drop:'H'},{x:400,drop:'G'},{x:640,drop:'R'},{x:1010,drop:'E'},{x:1190,drop:'+'},{x:1420,drop:'F'},{x:1800,drop:'S'},
    {x:2300,drop:'G'},{x:2640,drop:'+'},{x:2975,drop:'R'},{x:3060,drop:'E'}],
  extraCrates:[{x:500,p:0.45},{x:884,y:62,p:0.7},{x:1848,y:64,p:0.6},{x:2812,y:62,p:0.6}],
  turrets:[1890,2720],mechs:[1740],
  prisoners:[{x:290,k:'ally'},{x:845,y:100,k:'item'},{x:1530,k:'item'},{x:1800,y:102,k:'ally'},{x:2010,y:60,k:'item'},
    {x:2300,k:'item'},{x:2775,y:104,k:'item'},{x:3010,k:'ally'}],
  extraPrisoners:[{x:1850,y:64,p:0.75,k:'ally'},{x:2580,p:0.4,k:'item'}],
  decor:[{x:30,k:'palmera'},{x:120,k:'obelisco'},{x:186,k:'huesos'},{x:300,k:'vasija'},{x:526,k:'estaca'},{x:636,k:'columnaR'},
    {x:760,k:'sarco'},{x:930,k:'palmera'},{x:1046,k:'cabeza'},{x:1208,k:'estaca'},{x:1300,k:'columnaR'},{x:1446,k:'antorcha'},
    {x:1512,k:'sarco'},{x:1618,k:'antorcha'},{x:1666,k:'vasija'},{x:2112,k:'sarco'},{x:2236,k:'obelisco'},{x:2422,k:'estaca'},
    {x:2566,k:'sarco'},{x:2700,k:'palmera'},{x:2866,k:'estaca'},{x:2958,k:'sarco'},{x:3090,k:'columnaR'},{x:3250,k:'obelisco'}],
  events:[
    {at:20,spawn:[{t:'soldier',x:'R',d:70},{t:'escarabajo',x:380,d:110},{t:'escarabajo',x:380,d:126}]},
    {at:110,spawn:[{t:'soldier',x:450,y:92}]},
    {at:240,spawn:[{t:'grenadier',x:'R'},{t:'soldier',x:'R',d:50},{t:'drone',x:'R',d:120}]},
    {at:400,spawn:[{t:'momia',x:'R'},{t:'soldier',x:'R',d:70}]},
    {at:560,spawn:[{t:'soldier',x:845,y:82},{t:'drone',x:'R',d:30},{t:'escarabajo',x:'R',d:80},{t:'escarabajo',x:'R',d:92},{t:'escarabajo',x:'R',d:106}]},
    {at:700,spawn:[{t:'shield',x:'R'},{t:'grenadier',x:'R',d:60},{t:'momia',x:'R',d:110}]},
    {at:1200,spawn:[{t:'soldier',x:1700,y:104},{t:'momia',x:'R',d:40}]},
    {at:1320,spawn:[{t:'grenadier',x:1800,y:84},{t:'drone',x:'R',d:40}]},
    // cofre blindado en la tumba: al acercarte viene una oleada grande
    {at:1380,spawn:[{t:'shield',x:'R'},{t:'soldier',x:'L',d:30},{t:'grenadier',x:'R',d:60},{t:'drone',x:'L',d:90},{t:'momia',x:'R',d:110},{t:'soldier',x:'R',d:130},{t:'soldier',x:'L',d:170}]},
    {at:1460,spawn:[{t:'shield',x:'R'},{t:'soldier',x:'R',d:40},{t:'drone',x:'R',d:90}]},
    {at:1820,spawn:[{t:'drone',x:'R'},{t:'soldier',x:2000,y:42,d:20},{t:'momia',x:'R',d:40},{t:'soldier',x:'R',d:70},{t:'shield',x:'R',d:120}]},
    {at:2260,spawn:[{t:'escarabajo',x:2580},{t:'escarabajo',x:2580,d:14},{t:'escarabajo',x:2580,d:30},{t:'soldier',x:2640,y:104},{t:'shield',x:'R',d:30}]},
    {at:2380,spawn:[{t:'soldier',x:2780,y:86},{t:'soldier',x:'R',d:20},{t:'drone',x:'R',d:80}]},
    // la tormenta con cara arranca en 2560 (M4_LVL.upd): durante la tormenta vienen pocos y de a pie
    {at:2520,spawn:[{t:'momia',x:'R'},{t:'soldier',x:'R',d:60}]},
    {at:2740,spawn:[{t:'momia',x:'R',d:20},{t:'grenadier',x:'R',d:70}]},
    {at:2860,spawn:[{t:'shield',x:'R'},{t:'escarabajo',x:2930,d:30},{t:'escarabajo',x:2930,d:44},{t:'drone',x:'R',d:90}]}],
  arenas:[
    // jefe chico a un tercio; después juego normal y una emboscada; el villano al final (nunca seguidos)
    {at:1100,mini:true},
    {at:2160,waves:[
      [{t:'soldier',x:'R'},{t:'momia',x:'L',d:30},{t:'soldier',x:'L',d:60}],
      [{t:'drone',x:'R'},{t:'escarabajo',x:'R',d:20},{t:'escarabajo',x:'R',d:32},{t:'escarabajo',x:'R',d:46},{t:'grenadier',x:'R',d:60}],
      [{t:'shield',x:'R'},{t:'momia',x:'R',d:30},{t:'soldier',x:'L',d:50},{t:'drone',x:'R',d:110}]]},
    {at:3080,boss:true}],
  vaults:[{x:1572}],
  stormAt:2560};
for(const t of M4_LVL.tunnels)M4_LVL.platforms.push({x:t.x,y:t.y,w:t.w,roof:t});
for(const p of M4_LVL.pyramids)for(let i=0;i<p.n;i++)
  M4_LVL.platforms.push({x:p.x+i*p.inset,y:GROUND-(i+1)*p.dy,w:p.w-2*i*p.inset,pyr:p,tier:i,mat:p.mats[i%p.mats.length]});
M4_LVL.events.sort((a,b)=>a.at-b.at);
const M4_IDX=LEVELS.push(M4_LVL)-1;
// costo al sortear tipos entre partidas (ver variarPartida)
NV_COSTO.momia=1.4;NV_COSTO.escarabajo=0.7;
COB_COL.bloque=['#a8844e','#c8a46a'];COB_COL.anforas=['#9a5a32','#c07a44'];COB_COL.carro=['#6a4a2a','#8a6a3a'];
KILL_NAMES.push(['momia','momias'],['escarabajo','escarabajos']);

// ================== utilidades ==================
const M4_sfx=n=>{if(typeof SFX!=='undefined'&&SFX[n])SFX[n]();};
function M4_quickAt(x){for(const p of M4_LVL.quick)if(x>=p.x&&x<=p.x+p.w)return p;return null;}
const M4_inQuick=o=>o&&o.onGround&&!o.plat&&!!M4_quickAt(o.x+(o.w||8)/2);
function M4_sand(x,y,n,col){
  for(let i=0;i<n;i++)parts.push({k:'p',x:x+rand(-2,2),y:y-1,vx:rand(-1.1,1.1),vy:rand(-1.9,-0.4),g:0.14,life:rand(14,26),maxl:26,size:rand(1,1.6),col:col||(i%2?'#e0b070':'#b8844a')});
}
const M4_ease=t=>t<0?0:t>1?1:t*t*(3-2*t);
function M4_pc(p){p=p||P;return p.ride?{x:p.ride.x+p.ride.w/2,y:p.ride.y+p.ride.h/2}:{x:p.x+4,y:p.y+9};}
// jeroglífico inventado de 4×5 (trazos simples, ninguno copiado); usa el color que esté puesto
function M4_glyph(x,y,id){
  switch(Math.floor(hash(id*7+3)*1000)%10){
  case 0:ctx.fillRect(x,y+1,4,1);ctx.fillRect(x+1.5,y,1,5);ctx.fillRect(x,y+4,1,1);break;
  case 1:ctx.fillRect(x,y+4,4,1);ctx.fillRect(x+1.5,y,1,4);ctx.fillRect(x,y,2,1);break;
  case 2:ctx.fillRect(x,y+1,1,3);ctx.fillRect(x+3,y+1,1,3);ctx.fillRect(x+1,y,2,1);ctx.fillRect(x+1,y+4,2,1);ctx.fillRect(x+1.5,y+2,1,1);break;
  case 3:for(let i=0;i<4;i++)ctx.fillRect(x+i,y+(i%2?1:2),1,1);ctx.fillRect(x,y+4,4,0.8);break;
  case 4:ctx.fillRect(x+1,y,2,1);ctx.fillRect(x,y+1,4,2);ctx.fillRect(x+1,y+3,1,2);ctx.fillRect(x+3,y+1,1,1);break;
  case 5:ctx.fillRect(x,y+2,4,1);ctx.fillRect(x+1,y+1,2,3);break;
  case 6:ctx.fillRect(x+1.5,y,1,5);ctx.fillRect(x,y+1,1,1);ctx.fillRect(x+3,y+1,1,1);ctx.fillRect(x,y+3,1,1);ctx.fillRect(x+3,y+3,1,1);break;
  case 7:ctx.fillRect(x,y,4,1);ctx.fillRect(x+3,y,1,3);ctx.fillRect(x+1,y+2,3,1);ctx.fillRect(x+1,y+2,1,3);break;
  case 8:ctx.fillRect(x,y+4,4,1);ctx.fillRect(x+0.5,y+3,3,1);ctx.fillRect(x+1,y+2,2,1);ctx.fillRect(x+1.5,y+1,1,1);break;
  default:ctx.fillRect(x+1,y,1,5);ctx.fillRect(x+2,y+1,2,1);ctx.fillRect(x+2,y+3,1,1);
  }
}

// ================== estado que se reinicia en cada partida ==================
const M4={feet:new Map(),sar:new Map(),cracks:[],piles:[],tf:null,stormDone:false};
function M4_tfOff(){return{st:'off',t:0,k:0,adv:0,mouth:0,wind:0,boss:false,n:0,gap:50,tel:36,left:0,next:0,warns:[],row:0};}
M4.tf=M4_tfOff();
function M4_reset(){
  M4.feet=new Map();M4.cracks=[];M4.piles=[];M4.tf=M4_tfOff();M4.stormDone=false;M4.sar=new Map();
  if(L!==M4_LVL)return;
  const list=M4_LVL.decor.filter(d=>d.k==='sarco');let n=0;
  for(const d of list){const op=Math.random()<0.72;if(op)n++;M4.sar.set(d,{st:op?'closed':'dud',t:0,lid:0,bugs:Math.random()<0.25});}
  for(const d of list){if(n>=3)break;const s=M4.sar.get(d);if(s.st==='dud'){s.st='closed';n++;}}   // al menos tres se abren
}
ON_START.push(M4_reset);

// ================== escarabajos ==================
// Salen de una grieta del suelo. Aviso: la grieta tiembla, salta arenilla y suena un chasquido. Corren por el piso,
// mueren de un tiro y muerden de cerca (después rebotan para atrás). Escondidos, su caja se corre lejos (x=-9999).
// La caja para recibir balas es más alta que el dibujo (10 px) para que se les pueda pegar parado.
const M4_HIDE=GROUND+70,M4_MAXBUGS=6;
function M4_nBugs(){let n=0;for(const e of enemies)if(e.type==='escarabajo'&&!e.gone)n++;return n;}
function M4_crack(x){
  for(const c of M4.cracks)if(Math.abs(c.x-x)<26&&c.t<240)return c;
  const c={x,t:0,warn:0,w:10+Math.round(rand(0,6))};M4.cracks.push(c);if(M4.cracks.length>8)M4.cracks.shift();return c;
}
function M4_newBug(x,st,t){
  if(M4_nBugs()>=M4_MAXBUGS)return null;
  const c=M4_crack(x);
  return{type:'escarabajo',x:-9999,hx:c.x+rand(-3,3),y:M4_HIDE,w:8,h:10,hp:1,face:-1,flash:0,score:60,cd:0,spd:rand(0.95,1.15),crack:c,home:{x:c.x-8,w:16},
    st,t,back:0,bite:0,life:0,anim:rand(0,99),upd:M4_updBug,draw:M4_drawBug,onKill:M4_killBug};
}
function M4_mkBug(x){
  const fromR=Math.abs(x-(camX+VW+12))<0.5,fromL=Math.abs(x-(camX-20))<0.5,edge=fromR||fromL;
  const x0=edge?(fromR?camX+VW-44-rand(0,30):camX+34+rand(0,30)):x;
  return M4_newBug(x0,edge?'warn':'wait',edge?38:0)||{type:'escarabajo',gone:true,x:-9999,y:M4_HIDE,w:1,h:1,hp:1,cd:0,score:0};
}
// escarabajo que cae del cielo (lo tira el rey) o sale de un sarcófago: ya está a la vista
function M4_bugAt(x,stun){const e=M4_newBug(x,'stun',stun||14);if(!e)return null;e.x=e.hx;e.y=GROUND-e.h;enemies.push(e);return e;}
function M4_updBug(e){
  if(e.flash>0)e.flash--;e.anim++;
  const c=e.crack,pc=P.dead?null:M4_pc();
  if(c.x+20<camX-40&&e.st!=='run'){e.gone=true;return;}
  switch(e.st){
  case 'wait':
    e.x=-9999;e.y=M4_HIDE;
    if(c.x>camX+10&&c.x<camX+VW-10&&players.some(p=>!p.dead&&Math.abs(M4_pc(p).x-c.x)<200)){e.st='warn';e.t=38;}
    return;
  case 'warn':
    e.x=-9999;e.y=M4_HIDE;c.warn=Math.max(c.warn,e.t);
    if(e.t%9===0)M4_sfx('m4Bicho');
    if(e.t%5===0)parts.push({k:'p',x:c.x+rand(-c.w/2,c.w/2),y:GROUND-1,vx:rand(-0.4,0.4),vy:rand(-1.4,-0.6),g:0.12,life:12,maxl:12,size:1,col:'#e0b070'});
    if(--e.t<=0){e.st='run';e.x=e.hx;e.y=GROUND-e.h;M4_sand(e.x+4,GROUND,4);}
    return;
  case 'stun':e.x=e.hx;e.y=GROUND-e.h;if(--e.t<=0)e.st='run';return;
  case 'dig':
    e.y=GROUND-e.h;if(e.t%3===0)M4_sand(e.x+4,GROUND,1);
    if(--e.t<=0){e.gone=true;}
    if(e.t<8){e.x=-9999;e.y=M4_HIDE;}
    return;
  }
  // corre
  e.life++;if(e.bite>0)e.bite--;
  const cx=e.x+4;
  if(e.back>0){e.back--;e.x+=-e.face*1.5;}
  else if(pc){const dx=pc.x-cx;if(Math.abs(dx)>3)e.face=dx<0?-1:1;e.x+=Math.abs(dx)>3?e.face*e.spd:Math.sin(e.anim/4)*0.6;}
  e.x=clamp(e.x,camX+2,camX+VW-10);e.y=GROUND-e.h;e.hx=e.x;
  if(e.bite<=0)for(const p of players)if(!p.dead&&overlap(hurtbox(p),{x:e.x,y:GROUND-4,w:8,h:4})){withP(p,()=>hurtPlayer(1));e.back=26;e.bite=60;M4_sfx('m4Bicho');break;}
  if(e.life>720){e.st='dig';e.t=20;}   // si no te alcanza en 12 s, se entierra (sin puntos)
}
function M4_killBug(e){
  M4_sfx('m4Crack');
  for(let i=0;i<6;i++)parts.push({k:'p',x:e.x+4,y:GROUND-3,vx:rand(-1.4,1.4),vy:rand(-2.2,-0.6),g:0.15,life:rand(16,26),maxl:26,size:1,col:i%3?'#1e3a3a':'#5ad0b0'});
}
function M4_drawBug(e){
  if(e.st==='wait'||e.st==='warn')return;   // el aviso se dibuja en la grieta (drawGround)
  const fl=e.flash>0,x=q(e.x),y=GROUND-4,f=e.face,run=e.st==='run'&&!e.back?((e.anim>>1)%2):0;
  const sink=e.st==='dig'?(20-e.t)/20*4:0;
  ctx.save();ctx.beginPath();ctx.rect(x-3,y-4,14,8-sink);ctx.clip();ctx.translate(0,sink);
  ctx.fillStyle='rgba(60,30,10,0.35)';ctx.fillRect(x,GROUND-0.6,8,0.8);
  // patas
  ctx.fillStyle='#120c10';for(let i=0;i<3;i++)ctx.fillRect(x+1.5+i*2.2,y+3+((i+run)%2?0:0.5),0.8,1);
  // caparazón
  ctx.fillStyle=fl?'#fff':'#1e3a3a';ctx.beginPath();ctx.ellipse(x+4,y+2,4,2.4,0,Math.PI,0);ctx.fill();ctx.fillRect(x,y+2,8,1.2);
  if(!fl){ctx.fillStyle='#3a8a7a';ctx.fillRect(x+1.5,y+0.4,2,0.8);ctx.fillStyle='#5ad0b0';ctx.fillRect(x+2,y+0.4,1,0.6);
    ctx.fillStyle='#0e1e1e';ctx.fillRect(x+3.9,y,0.4,3);}
  // cabeza y pinzas
  ctx.fillStyle=fl?'#fff':'#14221e';const hx=f>0?x+7.5:x-1.5;ctx.fillRect(hx,y+1.2,2,1.6);
  ctx.fillStyle='#c8a040';const op=(e.anim>>2)%2;ctx.fillRect(f>0?hx+2:hx-1,y+1-op*0.4,1,0.7);ctx.fillRect(f>0?hx+2:hx-1,y+2.6+op*0.4,1,0.7);
  ctx.restore();
}
ENEMY_MAKERS.escarabajo=M4_mkBug;

// ================== momia ==================
// Lenta, aguanta más que un soldado, camina con los brazos adelante. De cerca agarra y empuja
// (aviso: levanta los brazos, gime y los ojos se ponen amarillos). De lejos sopla una bola de polvo lenta
// a la altura de la cabeza (aviso: echa la cabeza atrás y la boca brilla): agachate o reventala a tiros.
// Al pegarle se le sueltan vendas.
function M4_mkMomia(x,y){
  const yy=(y===undefined||y<GROUND-80)?GROUND-20:y-2;
  return{type:'momia',x,y:yy,w:10,h:20,vx:0,vy:0,hp:6,face:x>camX+VW/2?-1:1,flash:0,score:300,cd:rand(100,170),gcd:0,st:'walk',t:0,
    anim:rand(0,99),onGround:false,plat:null,spd:0.32,lhp:null,loose:0,raise:0,tilt:0,hitG:false,upd:M4_updMomia,draw:M4_drawMomia,onKill:M4_killMomia};
}
function M4_vendas(e,n){
  e.loose=Math.min(5,e.loose+1);M4_sfx('m4Venda');
  for(let i=0;i<2+Math.min(3,n);i++)parts.push({k:'p',x:e.x+rand(1,e.w-1),y:e.y+rand(3,14),vx:rand(-1.2,1.2),vy:rand(-1.8,-0.4),g:0.08,life:rand(26,40),maxl:40,size:rand(1,2),col:i%2?'#e8dcb4':'#b8a47a'});
  parts.push({k:'smoke',col:'200,180,140',x:e.x+5,y:e.y+8,vx:0,vy:-0.2,life:18,maxl:18,size:2});
}
function M4_push(p,dir){
  if(p.ride){const m=p.ride;m.x=clamp(m.x+dir*10,camX+2,camX+VW-24);return;}
  p.x=clamp(p.x+dir*14,camX+2,camX+VW-10);if(p.onGround){p.vy=-1.6;p.onGround=false;p.plat=null;}
}
function M4_updMomia(e){
  if(e.flash>0)e.flash--;e.anim++;
  if(e.lhp===null)e.lhp=e.hp;
  if(e.hp<e.lhp){M4_vendas(e,e.lhp-e.hp);e.lhp=e.hp;}
  const pc=P.dead?null:M4_pc(),ex=e.x+e.w/2,dx=pc?pc.x-ex:0,ad=Math.abs(dx);
  if(e.gcd>0)e.gcd--;
  switch(e.st){
  case 'rise':e.vx=0;e.raise=1-e.t/40;if(--e.t<=0){e.st='walk';e.raise=0;}break;
  case 'walk':{
    if(pc&&ad>2)e.face=dx<0?-1:1;
    e.vx=pc&&ad>14?e.face*e.spd:0;
    if(e.x<camX+6)e.vx=e.spd*1.6;else if(e.x>camX+VW-16)e.vx=-e.spd*1.6;
    e.raise*=0.8;e.tilt*=0.8;
    if(pc&&onScreen(e,-6)){
      const dy=Math.abs(pc.y-(e.y+10));
      if(ad<22&&dy<18&&e.gcd<=0){e.st='grabT';e.t=24;e.hitG=false;M4_sfx('m4Gemido');}
      else if(--e.cd<=0){if(ad>46&&ad<180&&dy<26){e.st='spitT';e.t=30;}e.cd=rand(150,230)*DIFF().fire;}
    }
    break;}
  case 'grabT':e.vx=0;e.raise=Math.min(1,e.raise+0.09);if(--e.t<=0){e.st='grab';e.t=12;}break;
  case 'grab':{
    e.vx=e.face*1.1;
    const box={x:e.face>0?e.x+e.w-2:e.x-12,y:e.y+3,w:14,h:11};
    if(!e.hitG)for(const p of players)if(!p.dead&&overlap(hurtbox(p),box)){withP(p,()=>{hurtPlayer(1);M4_push(p,e.face);});e.hitG=true;M4_sfx('m4Golpe');}
    for(const a of allies)if(!a.gone&&overlap(a,box))killAlly(a);
    if(--e.t<=0){e.st='rec';e.t=34;e.gcd=70;}
    break;}
  case 'spitT':e.vx=0;e.tilt=Math.min(1,e.tilt+0.08);
    if(--e.t<=0){e.tilt=0;if(pc)e.face=dx<0?-1:1;M4_polvo(e.x+5+e.face*6,e.y+4,e.face);e.st='rec';e.t=22;}break;
  case 'rec':e.vx=0;e.raise=Math.max(0,e.raise-0.05);if(--e.t<=0)e.st='walk';break;
  }
  if(e.kbx){e.x+=e.kbx*0.4;e.kbx*=0.5;if(Math.abs(e.kbx)<0.15)e.kbx=0;}
  e.x+=e.vx*(L.speedMul?L.speedMul(e):1);
  const pb=e.y+e.h;e.vy=Math.min(e.vy+0.3,6);e.y+=e.vy;land(e,pb,true);
  if(e.plat)e.x=clamp(e.x,e.plat.x,e.plat.x+e.plat.w-e.w);
  if(e.x<camX-60)e.gone=true;
}
function M4_killMomia(e){
  M4_sfx('m4Gemido');M4_sand(e.x+5,GROUND,8,'#c8b48a');
  for(let i=0;i<10;i++)parts.push({k:'p',x:e.x+rand(0,e.w),y:e.y+rand(0,e.h),vx:rand(-1.4,1.4),vy:rand(-2.4,-0.6),g:0.1,life:rand(28,44),maxl:44,size:rand(1,2),col:i%2?'#e8dcb4':'#a8946a'});
  parts.push({k:'smoke',col:'200,180,140',x:e.x+5,y:e.y+10,vx:0,vy:-0.3,life:36,maxl:36,size:4});
  if(e.onGround)M4.piles.push({x:e.x+5,y:e.y+e.h,t:0,f:e.face});
  if(Math.random()<0.18)pickups.push({kind:pick(['H','S','F','R','G','E','+']),x:e.x,y:e.y,w:10,h:10,vy:-2.5,life:700});
}
function M4_drawMomia(e){
  const fl=e.flash>0,C=c=>fl?'#fff':c,x=q(e.x),y=q(e.y),walk=e.vx?Math.sin(e.anim/9):0,bob=e.vx?Math.abs(Math.sin(e.anim/9))*0.6:Math.sin(e.anim/30)*0.3;
  const tele=e.st==='grabT'||e.st==='spitT';
  ctx.fillStyle='rgba(60,30,10,0.3)';ctx.fillRect(x,e.y+e.h-0.6,10,0.8);
  ctx.save();ctx.translate(x+5,y);if(e.face<0)ctx.scale(-1,1);
  if(e.st==='rise'){ctx.globalAlpha=Math.min(1,0.3+e.raise);}
  // vendas sueltas que flamean atrás
  ctx.strokeStyle=C('#cfc097');ctx.lineWidth=0.8;
  for(let i=0;i<1+e.loose;i++){const sy=4+i*3,len=3+i*1.2+e.loose*0.6,w=Math.sin(e.anim/6+i)*1.2;
    ctx.beginPath();ctx.moveTo(-4,sy+bob);ctx.quadraticCurveTo(-4-len*0.5,sy+bob+w,-4-len,sy+bob+1+w*0.5);ctx.stroke();}
  // piernas
  ctx.fillStyle=C('#8a7a58');ctx.fillRect(-3-walk,13,3,7);
  ctx.fillStyle=C('#cdbb90');ctx.fillRect(0+walk,13,3,7);
  ctx.fillStyle=C('#a8946a');ctx.fillRect(walk,15,3,0.8);ctx.fillRect(walk,18,3,0.8);
  // brazo de atrás
  const arm=(dy,col)=>{ctx.save();ctx.translate(1,6+bob+dy);ctx.rotate(-e.raise*0.95+Math.sin(e.anim/14)*0.05);
    ctx.fillStyle=C(col);ctx.fillRect(0,-1,8,2.4);ctx.fillStyle=C('#a8946a');ctx.fillRect(3,-1,0.8,2.4);ctx.fillRect(6,-1,0.8,2.4);
    ctx.fillStyle=C('#6a5a3a');ctx.fillRect(7.4,-1,1.2,1);ctx.restore();};
  arm(1.5,'#a8946a');
  // torso con vendas cruzadas
  ctx.fillStyle=C('#bfae84');ctx.fillRect(-4,5+bob,8,9);
  if(!fl){ctx.fillStyle='#e2d4a8';for(let i=0;i<4;i++)ctx.fillRect(-4,6+i*2.2+bob,8,0.8);
    ctx.fillStyle='#8a7a58';ctx.fillRect(-4,7.5+bob,3,0.6);ctx.fillRect(1,11+bob,3,0.6);
    if(e.loose>1){ctx.fillStyle='#3a2a1a';ctx.fillRect(-2,9+bob,2,1.5);}   // hueco donde se soltó la venda
    if(e.loose>3){ctx.fillStyle='#3a2a1a';ctx.fillRect(1,6+bob,2,1.2);}}
  // cabeza (se echa atrás para soplar)
  ctx.save();ctx.translate(0,5+bob);ctx.rotate(-e.tilt*0.45);
  ctx.fillStyle=C('#cdbb90');ctx.fillRect(-3,-5,6,6);
  if(!fl){ctx.fillStyle='#e2d4a8';ctx.fillRect(-3,-4,6,0.7);ctx.fillRect(-3,-1.6,6,0.7);
    ctx.fillStyle='#1a120c';ctx.fillRect(0,-3.4,3,1.5);
    ctx.fillStyle=tele?((T>>1)%2?'#fff6a0':'#ffd23a'):'#b8f05a';ctx.fillRect(1.2,-3.1,1,1);
    if(e.st==='spitT'){ctx.fillStyle='#1a120c';ctx.fillRect(1,-0.8,2,1);if((T>>1)%2){ctx.fillStyle='rgba(240,210,140,0.6)';circle(4,-0.3,1.6+e.tilt);}}}
  ctx.restore();
  // brazo de adelante
  arm(0,'#d8c89c');
  if(e.st==='grabT'&&(T>>2)%2){ctx.fillStyle='rgba(255,230,120,0.7)';ctx.fillRect(9,-1,1,1);ctx.fillRect(11,1,1,1);ctx.fillRect(10,4,1,1);}
  ctx.restore();ctx.globalAlpha=1;
}
// bola de polvo: lenta, a la altura de la cabeza; agachado pasa por arriba. Se puede reventar a tiros.
function M4_polvo(x,y,dir){M4_sfx('m4Soplo');eproj.push({kind:'m4Polvo',x,y,vx:dir*0.95,vy:0,r:2,t:0,upd:M4_polvoUpd,draw:M4_polvoDraw});}
function M4_polvoUpd(b,hb){
  b.t++;b.x+=b.vx;
  if(b.t%4===0)parts.push({k:'smoke',col:'210,180,120',x:b.x-b.vx*3,y:b.y,vx:-b.vx*0.2,vy:-0.05,life:16,maxl:16,size:1.2});
  if(coverBlocks(b)){M4_sand(b.x,b.y+2,5);b.gone=true;return;}
  if(hb&&overlapPt(hb,b.x,b.y,b.r)){hurtPlayer(1);M4_sand(b.x,b.y+2,6);b.gone=true;return;}
  for(const a of allies)if(!a.gone&&overlapPt(a,b.x,b.y,b.r)){killAlly(a);b.gone=true;return;}
  if(b.x<camX-20||b.x>camX+VW+20||b.t>360)b.gone=true;
}
function M4_polvoDraw(b){
  const bob=Math.sin(b.t/6)*0.5,x=b.x,y=b.y+bob;
  ctx.fillStyle='rgba(150,110,60,0.55)';circle(x,y,b.r+1.4);
  ctx.fillStyle='#d8b070';circle(x,y,b.r);
  ctx.fillStyle='#f6dca0';ctx.fillRect(q(x-1),q(y-1.2),1.2,1);
  ctx.fillStyle='rgba(120,80,40,0.8)';for(let i=0;i<3;i++){const a=b.t*0.2+i*2.1;ctx.fillRect(q(x+Math.cos(a)*2.6),q(y+Math.sin(a)*2.6),1,1);}
}
ENEMY_MAKERS.momia=M4_mkMomia;

// ================== sarcófagos ==================
// Decorado parado. Algunos se abren al acercarte: aviso = la tapa tiembla y cae polvo; después la tapa cae
// al costado y sale una momia (a veces, escarabajos).
function M4_sarUpd(){
  for(const [d,s] of M4.sar){
    if(s.st==='closed'){
      if(d.x<camX+24||d.x>camX+VW-24)continue;
      if(players.some(p=>{if(p.dead)return false;const x=M4_pc(p).x;return x>d.x-150&&x<d.x+30;})){s.st='shake';s.t=70;M4_sfx('m4Tapa');}
    }else if(s.st==='shake'){
      if(s.t%5===0)parts.push({k:'p',x:d.x+rand(0,14),y:GROUND-26,vx:rand(-0.3,0.3),vy:rand(0,0.4),g:0.08,life:24,maxl:24,size:1,col:'#d8b070'});
      if(s.t%14===0)M4_sfx('m4Tapa');
      if(--s.t<=0){s.st='open';s.lid=0;M4_sfx('m4Golpe');dust(d.x+20,GROUND,6);shake=Math.max(shake,1.5);
        if(s.bugs){for(let i=0;i<3;i++)M4_bugAt(d.x+4+i*3,8+i*12);}
        else{spawn({t:'momia',x:d.x+2,y:GROUND-18,d:0});const e=enemies[enemies.length-1];if(e&&e.type==='momia'){e.st='rise';e.t=40;e.y=GROUND-20;}}}
    }else if(s.st==='open'&&s.lid<1)s.lid=Math.min(1,s.lid+0.06);
  }
}
function M4_sarLid(x,top,w,h,shk){
  // tapa con rostro genérico, tocado a rayas, collar y una banda de signos
  ctx.fillStyle='#2a1a0e';ctx.fillRect(x-0.5,top-0.5,w+1,h+1);
  ctx.fillStyle='#c89838';ctx.fillRect(x,top+2,w,h-2);ctx.fillRect(x+1,top,w-2,2);
  ctx.fillStyle='#2a4a8a';for(let i=0;i<3;i++){ctx.fillRect(x+1,top+2+i*2.2,2,1.1);ctx.fillRect(x+w-3,top+2+i*2.2,2,1.1);}
  ctx.fillStyle='#d89a5a';ctx.fillRect(x+4,top+2,w-8,5);
  ctx.fillStyle='#1a120c';ctx.fillRect(x+4.5,top+3.5,1.6,0.8);ctx.fillRect(x+w-6.1,top+3.5,1.6,0.8);ctx.fillRect(x+w/2-0.5,top+5.4,1,0.6);
  ctx.fillStyle='#2a4a8a';ctx.fillRect(x+1,top+8,w-2,1.2);ctx.fillStyle='#b8402a';ctx.fillRect(x+1,top+9.2,w-2,0.8);ctx.fillStyle='#2a4a8a';ctx.fillRect(x+1,top+10,w-2,1.2);
  ctx.fillStyle='#2a4a8a';ctx.fillRect(x+2,top+12,w-4,2);
  ctx.fillStyle='#5a3a16';ctx.fillRect(x+w/2-2,top+15,4,h-17);
  ctx.fillStyle='#e8c860';for(let i=0;i<2;i++)M4_glyph(x+w/2-2,top+15.5+i*5,x+i);
  ctx.fillStyle='rgba(255,240,180,0.35)';ctx.fillRect(x+1,top+2,1,h-3);
  if(shk>0){ctx.fillStyle='#1a0e08';ctx.fillRect(x-0.6,top+3,0.6,h-4);ctx.fillRect(x+w,top+5,0.6,h-7);}
}
function M4_drawSarco(d){
  const s=M4.sar.get(d),x=d.x,g=GROUND,w=14,h=24,top=g-3-h;
  ctx.fillStyle='rgba(60,30,10,0.35)';ctx.fillRect(x-4,g-1,w+8,1.2);
  ctx.fillStyle='#6a4a2a';ctx.fillRect(x-2,g-3,w+4,3);ctx.fillStyle='#8a6a3a';ctx.fillRect(x-2,g-3,w+4,0.8);
  ctx.fillStyle='#4a3018';ctx.fillRect(x,top,w,h);ctx.fillRect(x+1,top-1,w-2,1);   // caja
  if(!s||s.st==='closed'||s.st==='dud'){M4_sarLid(x,top,w,h,0);return;}
  if(s.st==='shake'){const j=Math.sin(T*1.9)*0.8;M4_sarLid(x+j,top-Math.abs(j)*0.5,w,h,1);return;}
  // abierto: hueco oscuro con telas de araña y la tapa caída al costado
  ctx.fillStyle='#140a06';ctx.fillRect(x+2,top+1,w-4,h-2);
  ctx.strokeStyle='rgba(220,210,190,0.35)';ctx.lineWidth=0.4;ctx.beginPath();ctx.moveTo(x+2,top+4);ctx.lineTo(x+6,top+1);ctx.moveTo(x+2,top+7);ctx.lineTo(x+9,top+1);ctx.stroke();
  ctx.fillStyle='#a8946a';ctx.fillRect(x+4,top+h-4,5,1);ctx.fillRect(x+6,top+h-6,1,3);   // vendas que quedaron
  const a=M4_ease(s.lid);
  ctx.save();ctx.translate(x+w,g-3);ctx.rotate(a*Math.PI/2);M4_sarLid(-w,-h,w,h,0);ctx.restore();
}

// ================== tormenta de arena con cara (la acción de la misión) ==================
// Se arma una pared de arena al fondo que va tomando forma de cara gigante (ojos y boca oscuros).
// Aviso: viento, arenilla y la pantalla se oscurece (solo el fondo: las balas y los enemigos se siguen viendo).
// Después la cara avanza y sopla ráfagas por la boca (a los amigos no les hacen nada): cada ráfaga avisa con flechas en el borde de la pantalla
// en la fila por donde va a pasar (fila baja: saltá; fila alta: agachate). El viento empuja para atrás.
// Las coberturas frenan la ráfaga baja. La usa la misión a mitad de camino y el villano en su arena.
// o: {boss, n (ráfagas), gap (cuadros entre ráfagas), tel (aviso de cada ráfaga)}
function M4_stormStart(o){
  const tf=M4_tfOff();Object.assign(tf,o||{});tf.st='brew';tf.t=0;tf.left=tf.n;tf.next=0;tf.row=Math.random()<0.5?0:1;M4.tf=tf;
  if(!tf.boss){setBanner('¡SE LEVANTA UNA TORMENTA!',110);}
  M4_sfx('m4Viento');
}
const M4_stormOn=()=>M4.tf.st!=='off';
function M4_stormUpd(){
  const tf=M4.tf;if(tf.st==='off')return;
  tf.t++;
  const brew=tf.boss?80:150,face=tf.boss?40:70;
  if(tf.st==='brew'){tf.k=Math.min(1,tf.t/brew);tf.wind=tf.k*0.5;if(tf.t%45===0)M4_sfx('m4Viento');
    if(tf.t>=brew){tf.st='face';tf.t=0;M4_sfx('m4Rugido');shake=Math.max(shake,3);}}
  else if(tf.st==='face'){tf.mouth=Math.min(1,tf.t/face);tf.wind=0.6;
    if(tf.t>=face){tf.st='blow';tf.t=0;if(!tf.boss)setBanner('¡ABAJO SALTÁ · ARRIBA AGACHATE!',110);}}
  else if(tf.st==='blow'){
    tf.wind=0.9;tf.adv=Math.min(1,tf.adv+1/(tf.n*tf.gap+tf.tel+60));tf.mouth=0.75+0.25*Math.sin(tf.t/6);
    if(tf.t%50===0)M4_sfx('m4Viento');
    tf.next--;
    if(tf.left>0&&tf.next<=0){
      // filas: alterna, con algo de azar; en la segunda mitad a veces dos seguidas iguales
      tf.row=Math.random()<0.75?1-tf.row:tf.row;tf.warns.push({row:tf.row,t:tf.tel,max:tf.tel});tf.left--;tf.next=tf.gap;M4_sfx('m4Aviso');}
    for(const w of tf.warns)if(--w.t<=0){w.gone=true;M4_gust(w.row);}
    tf.warns=tf.warns.filter(w=>!w.gone);
    if(tf.left<=0&&!tf.warns.length&&tf.next<-40){tf.st='fade';tf.t=0;}
  }
  else if(tf.st==='fade'){tf.k=Math.max(0,1-tf.t/90);tf.wind=0.9*tf.k;tf.mouth*=0.95;if(tf.t>=90){M4.tf=M4_tfOff();return;}}
  // viento: empuja para atrás (hacia la izquierda) a los jugadores
  if(tf.wind>0.05)for(const p of players){if(p.dead)continue;
    if(p.ride){const m=p.ride;m.x=Math.max(camX+2,m.x-0.4*tf.wind);}else p.x=Math.max(camX+2,p.x-0.6*tf.wind);}
  // arenilla que vuela (pocas partículas)
  if(tf.wind>0.2&&T%3===0)parts.push({k:'p',x:camX+VW+4,y:rand(40,GROUND-2),vx:-rand(2.4,3.6),vy:rand(-0.2,0.3),g:0,life:110,maxl:110,size:1,col:Math.random()<0.5?'#e8c07a':'#c89858'});
}
// ráfaga: fila baja (GROUND-4) o alta (GROUND-17). No tiene "r": las balas no la deshacen, hay que esquivarla.
function M4_gust(row){
  const y=row===0?GROUND-4:GROUND-17;
  eproj.push({kind:'m4Rafaga',x:camX+VW+16,y,vx:-2.6,row,hr:row===0?2.5:2,t:0,upd:M4_gustUpd,draw:M4_gustDraw});
  M4_sfx('m4Rafaga');
}
function M4_gustUpd(b,hb){
  b.t++;b.x+=b.vx;
  if(b.t%3===0)parts.push({k:'p',x:b.x+rand(0,14),y:b.y+rand(-2,2),vx:-rand(0.6,1.4),vy:rand(-0.3,0.3),g:0,life:14,maxl:14,size:1,col:'#e8c07a'});
  if(b.row===0&&coverBlocks(b)){M4_sand(b.x,b.y,8);b.gone=true;return;}
  const box={x:b.x-2,y:b.y-b.hr,w:16,h:2*b.hr};
  if(hb&&overlap(hb,box)){hurtPlayer(1);M4_push(P,-1);M4_sand(b.x,b.y,6);b.gone=true;return;}
  if(b.x<camX-30)b.gone=true;   // a los amigos la arena los atraviesa (no pueden esquivar)
}
function M4_gustDraw(b){
  const x=b.x,y=b.y,h=b.hr;
  ctx.fillStyle='rgba(120,80,40,0.45)';ctx.beginPath();ctx.ellipse(x+8,y,11,h+1.6,0,0,7);ctx.fill();
  ctx.fillStyle='#d8a860';ctx.beginPath();ctx.moveTo(x-3,y);ctx.quadraticCurveTo(x+4,y-h-1,x+18,y-h*0.6);ctx.lineTo(x+18,y+h*0.6);ctx.quadraticCurveTo(x+4,y+h+1,x-3,y);ctx.fill();
  ctx.fillStyle='#f6dca0';for(let i=0;i<3;i++){const o=(b.t*1.3+i*6)%18;ctx.fillRect(q(x+o),q(y-h*0.5+i*h*0.5),3,0.8);}
  ctx.fillStyle='#8a5a2c';ctx.fillRect(q(x-1),q(y-0.4),2,0.8);
}
// aviso de ráfaga: flechas que titilan en el borde derecho, en la fila, y una línea punteada que se va completando
function M4_drawWarns(){
  const tf=M4.tf;if(!tf.warns.length)return;
  for(const w of tf.warns){const y=w.row===0?GROUND-4:GROUND-17,hr=w.row===0?2.5:2,k=1-w.t/w.max,on=(T>>2)%2,col=w.row?'255,190,70':'255,120,60';
    // franja de la fila que se va llenando desde la derecha
    ctx.fillStyle=`rgba(${col},${0.10+0.14*k+(on?0.06:0)})`;ctx.fillRect(VW-k*VW,y-hr-1,k*VW,2*hr+2);
    ctx.fillStyle=`rgba(${col},${0.5+0.3*k})`;for(let x=VW-6;x>VW-6-k*VW;x-=9)ctx.fillRect(x-4,y-0.5,5,1);
    // flecha grande en el borde (de dónde viene)
    ctx.fillStyle='#120c18';ctx.beginPath();ctx.moveTo(VW-12,y);ctx.lineTo(VW-3,y-6);ctx.lineTo(VW-3,y+6);ctx.closePath();ctx.fill();
    ctx.fillStyle=on?'#fff3c0':`rgb(${col})`;ctx.beginPath();ctx.moveTo(VW-10.5,y);ctx.lineTo(VW-4,y-4.5);ctx.lineTo(VW-4,y+4.5);ctx.closePath();ctx.fill();
    // qué hacer: fila baja = flecha arriba (saltá) · fila alta = flecha abajo (agachate)
    const ix=VW-22,up=w.row===0,iy=up?y-16:y+5;
    ctx.fillStyle='#120c18';ctx.fillRect(ix-3.5,iy-0.5,8,9);
    ctx.fillStyle=on?'#fff3c0':`rgb(${col})`;
    if(up){ctx.fillRect(ix,iy,1,1);ctx.fillRect(ix-1,iy+1,3,1);ctx.fillRect(ix-2,iy+2,5,1);ctx.fillRect(ix-3,iy+3,7,1);ctx.fillRect(ix-0.5,iy+4,2,4);}
    else{ctx.fillRect(ix-0.5,iy,2,4);ctx.fillRect(ix-3,iy+4,7,1);ctx.fillRect(ix-2,iy+5,5,1);ctx.fillRect(ix-1,iy+6,3,1);ctx.fillRect(ix,iy+7,1,1);}
  }
}
// cara en la pared de arena (genérica: cuencas, ceño, nariz chata y boca abierta)
function M4_drawFace(){
  const tf=M4.tf;if(tf.st==='off'||tf.k<=0.01)return;
  const k=tf.k,adv=tf.adv,form=tf.st==='brew'?Math.max(0,(tf.t/(tf.boss?80:150)-0.35)/0.65):1;
  const sc=1+adv*0.45,cx=230-adv*60+Math.sin(T/60)*3,cy=74+adv*10;
  ctx.save();ctx.globalAlpha=k;
  // pared de arena: masas que se arremolinan
  for(let i=0;i<9;i++){const a=T/90+i*0.7,rx=(48+i*6)*sc,ry=(30+((i*13)%17))*sc;
    ctx.fillStyle=i%3===0?'rgba(150,90,48,0.55)':i%3===1?'rgba(176,112,60,0.5)':'rgba(120,70,40,0.5)';
    ctx.beginPath();ctx.ellipse(cx+Math.cos(a)*16*sc-i*9,cy+Math.sin(a*1.3)*8+i*4,rx,ry,0,0,7);ctx.fill();}
  ctx.fillStyle='rgba(140,84,44,0.75)';ctx.fillRect(0,cy+30*sc,W,GROUND-(cy+30*sc));
  // remolinos claros
  ctx.strokeStyle='rgba(240,200,140,0.25)';ctx.lineWidth=1;
  for(let i=0;i<5;i++){ctx.beginPath();ctx.arc(cx-40+i*22,cy-10+((i*7)%13),(10+i*3)*sc,T/40+i,T/40+i+2.2);ctx.stroke();}
  // rasgos (aparecen de a poco)
  if(form>0){ctx.globalAlpha=k*form;
    const ex=20*sc,ey=cy-8*sc,m=tf.mouth;
    ctx.fillStyle='rgba(30,14,8,0.85)';
    for(const s of[-1,1]){ctx.beginPath();ctx.ellipse(cx+s*ex,ey,9*sc,6*sc,s*0.25,0,7);ctx.fill();}
    ctx.fillStyle='rgba(70,36,20,0.8)';   // ceño
    for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(cx+s*4*sc,ey-8*sc);ctx.lineTo(cx+s*32*sc,ey-12*sc);ctx.lineTo(cx+s*30*sc,ey-6*sc);ctx.lineTo(cx+s*6*sc,ey-3*sc);ctx.closePath();ctx.fill();}
    ctx.fillStyle='rgba(60,30,16,0.6)';ctx.beginPath();ctx.moveTo(cx,ey+1*sc);ctx.lineTo(cx-5*sc,ey+14*sc);ctx.lineTo(cx+5*sc,ey+14*sc);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(24,10,6,0.9)';ctx.beginPath();ctx.ellipse(cx,ey+25*sc,(13+m*5)*sc,(3+m*9)*sc,0,0,7);ctx.fill();
    // brillo tenue en el fondo de los ojos cuando sopla
    if(tf.st==='blow'&&(T>>3)%2){ctx.fillStyle='rgba(255,180,90,0.35)';for(const s of[-1,1])circle(cx+s*ex,ey,1.6*sc);}
    // arena que se cae de los bordes de la boca
    ctx.fillStyle='rgba(230,180,110,0.6)';for(let i=0;i<4;i++){const ph=(T*0.8+i*9)%26;ctx.fillRect(q(cx-10*sc+i*7*sc),q(ey+25*sc+(3+m*9)*sc*0.6+ph),1,2);}
  }
  ctx.restore();
}

// ================== ganchos por cuadro ==================
M4_LVL.speedMul=function(o){
  if(!M4_inQuick(o))return 1;
  return o.armor!==undefined?0.7:o.ci!==undefined?0.5:0.6;   // Grillo · jugador · soldados y momias
};
M4_LVL.upd=function(){
  // la tormenta grande arranca una vez, cuando la cámara pasa por stormAt
  if(!M4.stormDone&&!lock&&camX>=M4_LVL.stormAt){M4.stormDone=true;M4_stormStart({n:9,gap:56,tel:40});}
  M4_stormUpd();
  // arena movediza: se hunden los pies, arenilla al moverse
  const walkers=[...players.filter(p=>!p.dead&&!p.ride),...mechs,...allies,...enemies.filter(e=>e.type==='soldier'||e.type==='grenadier'||e.type==='shield'||e.type==='momia')];
  for(const o of walkers){
    const was=M4.feet.get(o),now=M4_inQuick(o);
    if(now&&was===false){M4_sand(o.x+(o.w||8)/2,GROUND,o.armor!==undefined?10:6);if(o.ci!==undefined||o.armor!==undefined)M4_sfx('m4Arena');}
    else if(now&&Math.abs(o.vx||0)>0.2&&(T+((o.x|0)&7))%10===0){
      parts.push({k:'p',x:o.x+(o.w||8)/2-Math.sign(o.vx)*3,y:GROUND-1,vx:-Math.sign(o.vx)*rand(0.2,0.7),vy:rand(-1.2,-0.5),g:0.13,life:14,maxl:14,size:1,col:'#a8743c'});
      if(o.ci!==undefined&&T%20===0)M4_sfx('m4Arena');
    }
    M4.feet.set(o,now);
  }
  if(M4.feet.size>80)M4.feet=new Map();
  M4_sarUpd();
  for(const c of M4.cracks){c.t++;if(c.warn>0)c.warn--;}
  if(M4.cracks.length&&M4.cracks[0].t>700)M4.cracks.shift();
  for(const p of M4.piles)p.t++;
  if(M4.piles.length&&M4.piles[0].t>420)M4.piles.shift();
};
// montoncito de vendas donde cayó una momia
ON_DRAW.push(()=>{if(L!==M4_LVL)return;for(const p of M4.piles){if(p.x<camX-20||p.x>camX+VW+20)continue;const a=p.t>360?1-(p.t-360)/60:1;
  ctx.globalAlpha=Math.max(0,a);ctx.fillStyle='#8a7a58';ctx.beginPath();ctx.ellipse(p.x,p.y,6,2.4,0,Math.PI,0);ctx.fill();
  ctx.fillStyle='#cdbb90';ctx.fillRect(p.x-5,p.y-1.6,4,1);ctx.fillRect(p.x+1,p.y-2.4,3,1);ctx.fillStyle='#e2d4a8';ctx.fillRect(p.x-2,p.y-2,3,0.8);
  ctx.fillStyle='#1a120c';ctx.fillRect(p.x+p.f*3,p.y-1.4,1,0.8);ctx.globalAlpha=1;}});

// ================== fondo ==================
const M4_R=mulberry32(44);
// perfil de dunas: suma de senos con múltiplos enteros (se repite sin costura)
function M4_dunes(n,amp,base,k){const ph=[M4_R()*6.28,M4_R()*6.28,M4_R()*6.28];
  return Array.from({length:n},(_,i)=>{const u=i/n*Math.PI*2;return base+amp*(0.6*Math.sin(u*k+ph[0])+0.28*Math.sin(u*k*2+ph[1])+0.12*Math.sin(u*k*5+ph[2]));});}
const M4_DUNE_FAR=M4_dunes(60,6,10,2),M4_DUNE_MID=M4_dunes(56,5,9,3),M4_DUNE_NEAR=M4_dunes(48,3,6,4);
const M4_PYR=[{x:40,w:120,h:58},{x:150,w:80,h:38},{x:420,w:150,h:70},{x:620,w:60,h:28}];
const M4_RUINS=[];{let x=10;while(x<820){const k=M4_R();M4_RUINS.push({x,k:k<0.45?'col':k<0.75?'obe':'arc',h:k<0.45?22+M4_R()*18:k<0.75?28+M4_R()*20:16+M4_R()*8,s:(M4_R()*999)|0});x+=50+M4_R()*80;}}
const M4_DUST=Array.from({length:26},()=>({x:M4_R(),y:M4_R(),v:0.5+M4_R(),l:2+M4_R()*5}));
M4_LVL.drawBG=function(){
  const HZ=124,tf=M4.tf,dk=tf.k||0;
  const g=ctx.createLinearGradient(0,0,0,HZ);
  g.addColorStop(0,'#1e1430');g.addColorStop(0.38,'#5a2a48');g.addColorStop(0.72,'#c8583a');g.addColorStop(1,'#f6b56a');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  // sol bajo con halo
  ctx.fillStyle='rgba(255,214,140,0.16)';circle(236,98,34);ctx.fillStyle='rgba(255,220,150,0.3)';circle(236,98,24);
  ctx.fillStyle='#ffd88a';circle(236,98,17);
  ctx.fillStyle='rgba(200,88,58,0.7)';for(let i=0;i<4;i++)ctx.fillRect(214,100+i*4,44,0.8+i*0.4);
  // nubes finitas
  ctx.fillStyle='rgba(255,190,150,0.22)';
  for(let i=0;i<5;i++){const x=((i*130-camX*0.03-T*0.04)%650+650)%650-80;ctx.beginPath();ctx.ellipse(x,26+i*11,46-i*4,1.6,0,0,7);ctx.fill();}
  // buitres que dan vueltas lejos
  ctx.strokeStyle='rgba(40,20,30,0.7)';ctx.lineWidth=0.7;
  for(let i=0;i<2;i++){const a=T/120+i*3,x=70+i*40+Math.cos(a)*18-((camX*0.02)%40),y=44+i*8+Math.sin(a)*5,fl=Math.sin(T/10+i)*1.2;
    ctx.beginPath();ctx.moveTo(x-3,y-fl);ctx.lineTo(x,y);ctx.lineTo(x+3,y-fl);ctx.stroke();}
  // pirámides lejanas (lado al sol y lado en sombra, con escalones apenas marcados)
  const po=((camX*0.05)%760+760)%760;
  for(const rep of [0,760])for(const p of M4_PYR){const x=p.x-po+rep;if(x>W+10||x+p.w<-10)continue;const b=HZ+3,tx=x+p.w/2;
    ctx.fillStyle='#8e4a46';ctx.beginPath();ctx.moveTo(x,b);ctx.lineTo(tx,b-p.h);ctx.lineTo(tx,b);ctx.fill();
    ctx.fillStyle='#62303e';ctx.beginPath();ctx.moveTo(tx,b-p.h);ctx.lineTo(x+p.w,b);ctx.lineTo(tx,b);ctx.fill();
    ctx.fillStyle='rgba(60,24,40,0.35)';for(let s=6;s<p.h;s+=6){const hw=(p.w/2)*(s/p.h);ctx.fillRect(tx-hw,b-p.h+s,hw*2,0.6);}
    ctx.fillStyle='rgba(255,210,150,0.4)';ctx.fillRect(tx-0.5,b-p.h,1,2);}
  // calor que ondula sobre el horizonte
  for(let i=0;i<5;i++){const y=HZ-4+i*2.2;ctx.fillStyle=`rgba(255,220,160,${0.10-i*0.015})`;
    for(let x=-10;x<W;x+=40)ctx.fillRect(x+Math.sin(T/14+i*1.7+x*0.05)*3,y,24,0.7);}
  ridge(M4_DUNE_FAR,8,0.09,HZ+6,'#9a5444');
  // ruinas del medio: columnas, obeliscos y arcos rotos
  const ro=((camX*0.3)%820+820)%820;ctx.fillStyle='#7a4234';
  for(const rep of [0,820])for(const r of M4_RUINS){const x=r.x-ro+rep;if(x>W+20||x<-30)continue;const b=GROUND-6;
    if(r.k==='col'){ctx.fillRect(x,b-r.h,7,r.h);ctx.fillRect(x-2,b-r.h,11,2);if(r.s%2){ctx.fillRect(x+10,b-3,6,3);}}
    else if(r.k==='obe'){ctx.beginPath();ctx.moveTo(x,b);ctx.lineTo(x+1.5,b-r.h);ctx.lineTo(x+4,b-r.h-4+(r.s%3));ctx.lineTo(x+7,b-r.h+2);ctx.lineTo(x+8.5,b);ctx.fill();}
    else{ctx.fillRect(x,b-r.h,5,r.h);ctx.fillRect(x+20,b-r.h,5,r.h);ctx.fillRect(x-1,b-r.h-3,18,3);}}
  ridge(M4_DUNE_MID,7,0.2,GROUND-4,'#b46a42');
  ridge(M4_DUNE_NEAR,8,0.42,GROUND+1,'#cf8a4e');
  // tormenta: el fondo se oscurece y aparece la pared de arena con cara
  if(dk>0){ctx.fillStyle=`rgba(46,20,14,${0.5*dk})`;ctx.fillRect(0,0,W,GROUND);M4_drawFace();}
};

// ================== suelo, arena movediza y grietas ==================
M4_LVL.drawGround=function(){
  const x0=Math.floor(camX)-10;
  ctx.fillStyle='#b87a40';ctx.fillRect(x0,GROUND,W+20,H-GROUND);
  ctx.fillStyle='#d69a58';ctx.fillRect(x0,GROUND,W+20,3);
  ctx.fillStyle='#f0c27a';ctx.fillRect(x0,GROUND,W+20,0.8);
  for(let t=Math.floor(camX/14)-1;t<(camX+VW)/14+1;t++){
    const h=hash(t+500),bx=t*14+h*8,by=GROUND+5+Math.floor(h*977)%15;
    ctx.fillStyle='#a06a36';ctx.fillRect(bx,by,4+h*5,0.7);ctx.fillStyle='#d8a462';ctx.fillRect(bx+1,by-0.7,3+h*3,0.6);   // ondas del viento
    if(h<0.12){ctx.fillStyle='#8a6a4a';ctx.fillRect(t*14+3,GROUND+1.5,2,1);}
    if(h>0.93){ctx.fillStyle='#9a8a6a';ctx.fillRect(t*14,GROUND+0.5,9,2.5);ctx.fillStyle='#bfae88';ctx.fillRect(t*14,GROUND+0.5,9,0.6);}   // laja enterrada
  }
  for(const p of M4_LVL.quick)if(p.x<camX+VW+4&&p.x+p.w>camX-4)M4_drawQuick(p);
  for(const c of M4.cracks)if(c.x>camX-20&&c.x<camX+VW+20)M4_drawCrack(c);
};
function M4_drawQuick(p){
  const x=p.x,w=p.w,cx=x+w/2;
  ctx.fillStyle='#7a4a24';ctx.beginPath();ctx.moveTo(x-3,GROUND);ctx.quadraticCurveTo(cx,GROUND+15,x+w+3,GROUND);ctx.closePath();ctx.fill();
  ctx.fillStyle='#9a6634';ctx.beginPath();ctx.moveTo(x,GROUND);ctx.quadraticCurveTo(cx,GROUND+12,x+w,GROUND);ctx.closePath();ctx.fill();
  ctx.fillStyle='#b07a40';ctx.fillRect(x,GROUND,w,1.2);
  // remolino que gira: avisa que ahí la arena traga
  ctx.strokeStyle='rgba(70,40,18,0.8)';ctx.lineWidth=0.7;
  for(let k=0;k<3;k++){const rx=w/2*(0.3+k*0.3),ry=1+k*0.9,a0=T*0.03*(k%2?1:-1)+k;
    ctx.beginPath();ctx.ellipse(cx,GROUND+3+k*0.6,rx,ry,0,a0,a0+2.2);ctx.stroke();ctx.beginPath();ctx.ellipse(cx,GROUND+3+k*0.6,rx,ry,0,a0+Math.PI,a0+Math.PI+2.2);ctx.stroke();}
  ctx.fillStyle='#4a2a12';ctx.beginPath();ctx.ellipse(cx,GROUND+3.5,3,1,0,0,7);ctx.fill();
}
function M4_drawCrack(c){
  const a=c.t>600?1-(c.t-600)/100:1,on=c.warn>0,j=on?Math.sin(T*2.1)*0.5:0,x=c.x,hw=c.w/2;
  ctx.globalAlpha=Math.max(0,a);
  if(on){ctx.fillStyle=`rgba(90,208,176,${0.18+0.18*((T>>2)%2)})`;ctx.beginPath();ctx.ellipse(x,GROUND,hw+4,2.4,0,0,7);ctx.fill();}
  ctx.fillStyle='#3a1e0c';ctx.beginPath();ctx.moveTo(x-hw,GROUND+0.5);
  for(let i=1;i<=4;i++)ctx.lineTo(x-hw+i*hw/2,GROUND+(i%2?2.2:0.4)+j);
  for(let i=4;i>=0;i--)ctx.lineTo(x-hw+i*hw/2,GROUND+(i%2?0.8:-0.2)+j);
  ctx.closePath();ctx.fill();
  ctx.fillStyle='#e8b878';ctx.fillRect(x-hw,GROUND-0.4,1.5,0.6);ctx.fillRect(x+hw-2,GROUND-0.4,1.5,0.6);
  if(on&&(T>>2)%2){ctx.fillStyle='#5ad0b0';ctx.fillRect(x-1.5,GROUND+0.6,1,0.8);ctx.fillRect(x+1,GROUND+0.8,1,0.8);}   // ojitos en la grieta
  ctx.globalAlpha=1;
}

// ================== capa de arriba: arena que tapa los pies, viento y avisos de la tormenta ==================
M4_LVL.drawFx=function(){
  ctx.save();ctx.translate(q(-camX),0);
  for(const p of M4_LVL.quick){if(p.x>camX+VW||p.x+p.w<camX)continue;
    ctx.fillStyle='rgba(138,90,44,0.96)';ctx.fillRect(p.x,GROUND-3.6,p.w,3.8);
    ctx.fillStyle='rgba(196,146,86,0.9)';ctx.fillRect(p.x,GROUND-3.6,p.w,0.7);
    ctx.fillStyle='rgba(80,46,20,0.8)';for(let i=4;i<p.w-4;i+=9){const hh=hash(i+p.x*5);ctx.fillRect(p.x+i+Math.sin(T/25+i)*1.5,GROUND-2.2,2+hh*3,0.6);}}
  // ondas alrededor de lo que se hunde
  ctx.lineWidth=0.5;
  for(const o of [...players.filter(p=>!p.dead&&!p.ride),...mechs,...enemies.filter(e=>e.type!=='drone'&&!e.isBoss)]){
    if(!M4.feet.get(o))continue;const cx=o.x+(o.w||8)/2,r=((T+(cx|0))%34)/34;
    ctx.strokeStyle=`rgba(90,54,24,${0.7*(1-r)})`;ctx.beginPath();ctx.ellipse(cx,GROUND-2,(o.w||8)/2+2+r*6,0.8+r*0.8,0,0,7);ctx.stroke();}
  ctx.restore();
  // arenilla que corre con el viento (más cuando hay tormenta) y una veladura muy leve para no tapar las balas
  const tf=M4.tf,wn=tf.wind||0,n=8+Math.round(18*wn);
  for(let i=0;i<n;i++){const s=M4_DUST[i],sp=0.6+wn*3.2,x=((s.x*W-T*sp*s.v-camX*0.9)%W+W)%W,y=s.y*(GROUND-20)+20+Math.sin(T/30+i)*2;
    ctx.fillStyle=`rgba(240,200,140,${0.18+0.3*wn})`;ctx.fillRect(x,y,s.l*(0.6+wn),0.7);}
  if(tf.k>0){ctx.fillStyle=`rgba(120,70,30,${0.1*tf.k})`;ctx.fillRect(0,0,W,H);M4_drawWarns();}
};

// ================== decorado ==================
M4_LVL.drawDecor=function(d){
  const x=d.x,g=GROUND;
  switch(d.k){
  case 'sarco':M4_drawSarco(d);return true;
  case 'palmera':{ // palmera datilera que se mece
    const sw=Math.sin(T/50+x)*1.5,top={x:x+6+sw,y:g-46};
    ctx.strokeStyle='#5a3a22';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,g);ctx.quadraticCurveTo(x+8,g-24,top.x,top.y);ctx.stroke();
    ctx.strokeStyle='#7a5432';ctx.lineWidth=0.7;for(let i=1;i<8;i++){const u=i/8,px=x+(top.x-x)*u+Math.sin(u*3)*3,py=g-46*u;ctx.beginPath();ctx.moveTo(px-1.5,py);ctx.lineTo(px+1.5,py-1);ctx.stroke();}
    ctx.strokeStyle='#3e6a2a';ctx.lineWidth=1.4;ctx.lineCap='round';
    for(let i=0;i<7;i++){const a=-Math.PI/2+(i-3)*0.55+Math.sin(T/40+i+x)*0.06,l=14+(i%2)*4;
      ctx.beginPath();ctx.moveTo(top.x,top.y);ctx.quadraticCurveTo(top.x+Math.cos(a)*l*0.6,top.y+Math.sin(a)*l*0.6-3,top.x+Math.cos(a)*l,top.y+Math.sin(a)*l+6);ctx.stroke();}
    ctx.lineCap='butt';ctx.fillStyle='#8a3a1e';circle(top.x-1.5,top.y+3,1.4);circle(top.x+1.5,top.y+3.5,1.4);
    return true;}
  case 'obelisco':{ // obelisco roto con signos inventados
    ctx.fillStyle='#8a6a44';ctx.beginPath();ctx.moveTo(x,g);ctx.lineTo(x+1.5,g-40);ctx.lineTo(x+5,g-44);ctx.lineTo(x+7,g-41);ctx.lineTo(x+10.5,g-38);ctx.lineTo(x+12,g);ctx.fill();
    ctx.fillStyle='#b08a5a';ctx.fillRect(x+1.5,g-40,2,40);ctx.fillStyle='#5a3e22';
    for(let i=0;i<6;i++)M4_glyph(x+4.5,g-36+i*6,x+i);
    ctx.fillStyle='#d8a860';ctx.fillRect(x-3,g-2,18,2);return true;}
  case 'columnaR':{ // columna rota, con estrías y pedazos caídos
    ctx.fillStyle='#9a7a4e';ctx.fillRect(x,g-22,10,22);ctx.fillStyle='#c09a64';ctx.fillRect(x,g-22,2,22);
    ctx.fillStyle='#7a5a36';for(let i=3;i<10;i+=2.5)ctx.fillRect(x+i,g-21,0.6,20);
    ctx.fillStyle='#9a7a4e';ctx.beginPath();ctx.moveTo(x,g-22);ctx.lineTo(x+3,g-25);ctx.lineTo(x+6,g-23);ctx.lineTo(x+10,g-26);ctx.lineTo(x+10,g-22);ctx.fill();
    ctx.fillStyle='#8a6a44';ctx.fillRect(x+12,g-5,9,5);ctx.fillStyle='#b08a5a';ctx.fillRect(x+12,g-5,9,0.8);ctx.fillRect(x-6,g-3,5,3);
    return true;}
  case 'huesos':{ // cráneo de buey y costillas medio enterrados
    ctx.fillStyle='#e8dcc0';ctx.fillRect(x,g-5,7,4);ctx.fillRect(x+1,g-6,5,1);ctx.fillRect(x+6,g-3,3,2);
    ctx.fillStyle='#2a1a10';ctx.fillRect(x+1.5,g-4,1.2,1.2);ctx.fillRect(x+4,g-4,1.2,1.2);
    ctx.strokeStyle='#e8dcc0';ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(x+1,g-6);ctx.quadraticCurveTo(x-4,g-9,x-3,g-12);ctx.moveTo(x+6,g-6);ctx.quadraticCurveTo(x+11,g-9,x+10,g-12);
    for(let i=0;i<4;i++){ctx.moveTo(x+13+i*3,g);ctx.quadraticCurveTo(x+14+i*3,g-6,x+17+i*3,g-6);}ctx.stroke();
    return true;}
  case 'cabeza':{ // cabeza de piedra caída, medio enterrada
    ctx.fillStyle='#8a6a44';ctx.beginPath();ctx.moveTo(x,g);ctx.lineTo(x+2,g-14);ctx.quadraticCurveTo(x+14,g-24,x+26,g-14);ctx.lineTo(x+28,g);ctx.fill();
    ctx.fillStyle='#2a4a6a';for(let i=0;i<4;i++){ctx.fillRect(x+2+i*1.2,g-13+i*3,2,2);ctx.fillRect(x+24-i*1.2,g-13+i*3,2,2);}
    ctx.fillStyle='#b08a5a';ctx.fillRect(x+8,g-14,12,10);
    ctx.fillStyle='#4a2e18';ctx.fillRect(x+9.5,g-11,3,1);ctx.fillRect(x+15.5,g-11,3,1);ctx.fillRect(x+13,g-9,2,3);ctx.fillRect(x+11,g-5.5,6,0.8);
    ctx.fillStyle='#6a4a2a';ctx.fillRect(x+18,g-17,1,6);ctx.fillRect(x+19,g-12,2,1);   // grieta
    ctx.fillStyle='#d69a58';ctx.beginPath();ctx.ellipse(x+14,g,18,3,0,Math.PI,0);ctx.fill();
    return true;}
  case 'vasija':
    ctx.fillStyle='#8a4a26';ctx.beginPath();ctx.ellipse(x+4,g-5,4,5,0,0,7);ctx.fill();ctx.fillRect(x+2.5,g-12,3,3);
    ctx.fillStyle='#b8683a';ctx.fillRect(x+1,g-8,1,4);ctx.fillStyle='#2a1a10';ctx.fillRect(x+1,g-6,6,0.8);ctx.fillRect(x+2,g-12.5,4,0.8);
    return true;
  case 'antorcha':{ // pie con fuego y halo que titila
    const fl=Math.sin(T/3+x)*0.6+Math.sin(T/7)*0.4;
    ctx.fillStyle=`rgba(255,170,80,${0.12+0.04*fl})`;circle(x+2,g-28,14+fl);
    ctx.fillStyle='#3a2414';ctx.fillRect(x+1,g-24,2,24);ctx.fillRect(x-1,g-25,6,2);ctx.fillRect(x-1,g-2,6,2);
    ctx.fillStyle='#ff8a2a';ctx.beginPath();ctx.moveTo(x-0.5,g-25);ctx.quadraticCurveTo(x+2+fl,g-34,x+4.5,g-25);ctx.fill();
    ctx.fillStyle='#ffe08a';ctx.beginPath();ctx.moveTo(x+0.8,g-25);ctx.quadraticCurveTo(x+2+fl*0.6,g-30,x+3.2,g-25);ctx.fill();
    return true;}
  case 'estaca':{ // aviso de arena movediza: estaca con trapo rojo y calavera
    const fl=Math.sin(T/9+x)*1.4;
    ctx.fillStyle='#4a2e18';ctx.fillRect(x+2,g-22,1.6,22);
    ctx.fillStyle='#c0302a';ctx.beginPath();ctx.moveTo(x+3.6,g-22);ctx.lineTo(x+11,g-20+fl);ctx.lineTo(x+3.6,g-16);ctx.fill();
    ctx.fillStyle='#e8dcc0';ctx.fillRect(x+0.5,g-27,5,4);ctx.fillRect(x+1.5,g-23,3,1);
    ctx.fillStyle='#2a1a10';ctx.fillRect(x+1.2,g-26,1.2,1.2);ctx.fillRect(x+3.4,g-26,1.2,1.2);
    return true;}
  }
  return false;
};

// ================== plataformas: ruinas, columna alta, andamio, pirámide, tumba y bloques ==================
M4_LVL.drawPlat=function(pl){
  if(pl.roof){M4_tombBack(pl);return true;}
  if(pl.pyr){M4_tier(pl);return true;}
  if(pl.hi==='columna'){M4_column(pl);return true;}
  if(pl.hi==='andamio'){M4_scaffold(pl);return true;}
  if(pl.step){M4_ruin(pl);return true;}
  M4_ruin(pl);return true;
};
// bloques de arenisca con juntas corridas
function M4_blocks(x,y,w,h,c1,c2){
  ctx.fillStyle='#6a4626';ctx.fillRect(x,y,w,h);
  for(let r=0,row=0;r<h;r+=6,row++){const o=row%2?6:0;
    for(let i=-o;i<w;i+=12){const bx=Math.max(x,x+i),bw=Math.min(x+w,x+i+11.4)-bx;if(bw<=0)continue;
      ctx.fillStyle=hash(i*3+row*17+x)<0.5?(c1||'#c89458'):(c2||'#b8844a');ctx.fillRect(bx,y+r,bw,Math.min(5.4,h-r));}}
  ctx.fillStyle='#f0c27a';ctx.fillRect(x,y,w,0.9);
  ctx.fillStyle='rgba(0,0,0,0.25)';ctx.fillRect(x+w-2.5,y,2.5,h);
}
// tramo de muro en ruinas: losa sobre dos pilares cortos
function M4_ruin(pl){
  const x=pl.x,y=pl.y,w=pl.w;
  ctx.fillStyle='#8a6440';ctx.fillRect(x+3,y+4,6,GROUND-y-4);ctx.fillRect(x+w-9,y+4,6,GROUND-y-4);
  ctx.fillStyle='#a87c4e';ctx.fillRect(x+3,y+4,1.5,GROUND-y-4);ctx.fillRect(x+w-9,y+4,1.5,GROUND-y-4);
  ctx.fillStyle='#6a4626';for(let yy=y+9;yy<GROUND;yy+=6){ctx.fillRect(x+3,yy,6,0.6);ctx.fillRect(x+w-9,yy,6,0.6);}
  ctx.fillStyle='#b8844a';ctx.fillRect(x,y,w,4.5);ctx.fillStyle='#f0c27a';ctx.fillRect(x,y,w,0.9);
  ctx.fillStyle='#6a4626';ctx.fillRect(x,y+4.5,w,0.8);for(let i=10;i<w;i+=14)ctx.fillRect(x+i,y+0.9,0.6,3.6);
  ctx.fillStyle='#d69a58';ctx.beginPath();ctx.moveTo(x+w*0.55,y);ctx.quadraticCurveTo(x+w*0.75,y-2.5,x+w-2,y);ctx.fill();   // arena acumulada
  ctx.fillStyle='#4a2e18';ctx.fillRect(x+w-1,y+1,1,2);
}
// columna alta: fuste con estrías y capitel abierto arriba (se camina por el ábaco)
function M4_column(pl){
  const x=pl.x,y=pl.y,w=pl.w,cx=x+w/2,sw=12;
  ctx.fillStyle='#9a7a4e';ctx.fillRect(cx-sw/2,y+12,sw,GROUND-y-12);
  ctx.fillStyle='#c09a64';ctx.fillRect(cx-sw/2,y+12,2,GROUND-y-12);ctx.fillStyle='#7a5a36';
  for(let i=3;i<sw;i+=3)ctx.fillRect(cx-sw/2+i,y+13,0.6,GROUND-y-14);
  for(let yy=y+30;yy<GROUND;yy+=22){ctx.fillStyle='#6a4a2a';ctx.fillRect(cx-sw/2,yy,sw,0.8);}
  ctx.fillStyle='rgba(60,30,10,0.4)';ctx.fillRect(cx+sw/2-3,y+12,3,GROUND-y-12);
  ctx.fillStyle='#2a4a6a';ctx.fillRect(cx-sw/2,y+16,sw,1.5);ctx.fillStyle='#b8402a';ctx.fillRect(cx-sw/2,y+17.5,sw,0.8);   // franja pintada gastada
  // capitel abierto (forma de flor) y ábaco
  ctx.fillStyle='#a88458';ctx.beginPath();ctx.moveTo(cx-sw/2,y+12);ctx.quadraticCurveTo(x-1,y+8,x+1,y+4);ctx.lineTo(x+w-1,y+4);ctx.quadraticCurveTo(x+w+1,y+8,cx+sw/2,y+12);ctx.closePath();ctx.fill();
  ctx.fillStyle='#7a5a36';for(let i=0;i<5;i++){const px=x+5+i*(w-10)/4;ctx.fillRect(px,y+5,0.7,4);}
  ctx.fillStyle='#b8844a';ctx.fillRect(x,y,w,4);ctx.fillStyle='#f0c27a';ctx.fillRect(x,y,w,0.9);ctx.fillStyle='#6a4626';ctx.fillRect(x,y+4,w,0.8);
  ctx.fillStyle='#d69a58';ctx.fillRect(x+w*0.3,y-1,w*0.35,1);
}
// andamio de excavación: palos, cruces, tablón, soga y farol
function M4_scaffold(pl){
  const x=pl.x,y=pl.y,w=pl.w;
  ctx.strokeStyle='#4a3018';ctx.lineWidth=1.6;ctx.beginPath();
  ctx.moveTo(x+3,y);ctx.lineTo(x+2,GROUND);ctx.moveTo(x+w-3,y);ctx.lineTo(x+w-2,GROUND);ctx.stroke();
  ctx.lineWidth=0.7;ctx.beginPath();
  for(let k=0;k<3;k++){const a=y+6+k*((GROUND-y-8)/3),b=a+(GROUND-y-8)/3;ctx.moveTo(x+3,a);ctx.lineTo(x+w-3,b);ctx.moveTo(x+w-3,a);ctx.lineTo(x+3,b);}
  ctx.stroke();
  ctx.strokeStyle='#c8b080';ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(x+w-6,y+4);ctx.quadraticCurveTo(x+w-4,y+40,x+w-8,y+60);ctx.stroke();   // soga
  ctx.fillStyle='#4a3018';ctx.fillRect(x+w-9,y+60,3,4);ctx.fillStyle='#7a5a36';ctx.fillRect(x+w-9,y+60,3,0.8);   // balde
  ctx.fillStyle='#3a2414';ctx.fillRect(x+4,y+4,0.6,6);ctx.fillRect(x+2.5,y+10,3.5,3);
  ctx.fillStyle=(T>>4)%7?'#ffd27a':'#a8743c';ctx.fillRect(x+3.3,y+10.8,1.9,1.5);
  ctx.fillStyle=`rgba(255,210,120,0.12)`;circle(x+4.3,y+11.5,6);
  ctx.fillStyle='#8a6a3a';ctx.fillRect(x-1,y,w+2,3.5);ctx.fillStyle='#b8945a';ctx.fillRect(x-1,y,w+2,0.9);
  ctx.fillStyle='#4a3018';for(let i=7;i<w;i+=8)ctx.fillRect(x+i,y+0.9,0.6,2.6);
  ctx.fillStyle='#2a1a0c';ctx.fillRect(x-1,y+3.5,w+2,0.8);
  ctx.fillStyle='#3a2414';ctx.fillRect(x+w-2,y-14,1,14);const fl=Math.sin(T/11)*1.3;   // banderín
  ctx.fillStyle='#e0d0a0';ctx.beginPath();ctx.moveTo(x+w-1,y-14);ctx.lineTo(x+w+6,y-12+fl);ctx.lineTo(x+w-1,y-10);ctx.fill();
}
// escalones de la pirámide
function M4_tier(pl){
  const x=pl.x,y=pl.y,w=pl.w,h=pl.pyr.dy,m=pl.mat;
  M4_blocks(x,y,w,h,m==='cima'?'#d8a460':'#c89458',m==='cima'?'#c89458':'#b8844a');
  if(m==='glifos'){ctx.fillStyle='#8a5a30';ctx.fillRect(x+6,y+8,w-12,8);ctx.fillStyle='#e0b070';ctx.fillRect(x+6,y+8,w-12,0.6);
    ctx.fillStyle='#3a2210';for(let i=x+8;i<x+w-10;i+=6)M4_glyph(i,y+9.5,i);}
  if(m==='cima'){ctx.fillStyle='#e8c050';ctx.fillRect(x,y,w,1.6);ctx.fillStyle='#fff0b0';ctx.fillRect(x,y,w,0.6);
    const on=(Math.sin(T/20)+1)/2;ctx.fillStyle=`rgba(120,230,200,${0.5+0.5*on})`;ctx.fillRect(x+w/2-1.5,y+8,3,3);ctx.fillStyle='#2a1a10';ctx.fillRect(x+w/2-2,y+7.5,4,0.6);}
  ctx.fillStyle='#d69a58';ctx.beginPath();ctx.moveTo(x+w-14,y);ctx.quadraticCurveTo(x+w-6,y-2,x+w,y);ctx.fill();   // arena en el borde
  ctx.fillStyle='rgba(0,0,0,0.3)';ctx.fillRect(x,y+h-1,w,1);
}
// tumba: interior oscuro con un friso pintado, pilares y antorchas; arriba, arena acumulada (atrás del jugador)
function M4_tombBack(pl){
  const x=pl.x,y=pl.y,w=pl.w,iy=y+9,ih=GROUND-iy;
  const g=ctx.createLinearGradient(0,iy,0,GROUND);g.addColorStop(0,'rgba(14,6,4,0.95)');g.addColorStop(1,'rgba(40,20,12,0.85)');
  ctx.fillStyle=g;ctx.fillRect(x+3,iy,w-6,ih);
  ctx.fillStyle='#5a3418';ctx.fillRect(x+3,iy+3,w-6,7);ctx.fillStyle='#8a5a2c';ctx.fillRect(x+3,iy+3,w-6,0.6);ctx.fillRect(x+3,iy+9.4,w-6,0.6);
  ctx.fillStyle='#c8a060';for(let i=x+8;i<x+w-8;i+=7)M4_glyph(i,iy+4.2,i*3);
  ctx.fillStyle='#2a4a6a';for(let i=x+10;i<x+w-10;i+=21)ctx.fillRect(i,iy+11,9,1);
  for(const px of [x+2,x+w/2-4,x+w-12]){ctx.fillStyle='#8a6440';ctx.fillRect(px,iy,10,ih);ctx.fillStyle='#a87c4e';ctx.fillRect(px,iy,2,ih);
    ctx.fillStyle='#5a3a1e';ctx.fillRect(px+8,iy,2,ih);ctx.fillRect(px-1,iy,12,2);ctx.fillRect(px-1,GROUND-3,12,3);}
  for(const tx of [x+30,x+w-34]){const fl=Math.sin(T/3+tx)*0.6;
    ctx.fillStyle=`rgba(255,160,70,${0.14+0.04*fl})`;circle(tx,iy+12,10+fl);
    ctx.fillStyle='#3a2414';ctx.fillRect(tx-1,iy+12,2,6);
    ctx.fillStyle='#ff8a2a';ctx.beginPath();ctx.moveTo(tx-2,iy+12);ctx.quadraticCurveTo(tx+fl,iy+5,tx+2,iy+12);ctx.fill();
    ctx.fillStyle='#ffe08a';ctx.fillRect(tx-0.6,iy+9.5,1.2,2.4);}
  ctx.fillStyle='rgba(255,150,70,0.08)';ctx.fillRect(x+3,GROUND-6,w-6,6);
  ctx.fillStyle='#d69a58';ctx.beginPath();ctx.moveTo(x-4,y);ctx.quadraticCurveTo(x+12,y-7,x+30,y-3);ctx.lineTo(x+30,y);ctx.fill();   // duna sobre el techo
  ctx.beginPath();ctx.moveTo(x+w-40,y);ctx.quadraticCurveTo(x+w-18,y-6,x+w+6,y);ctx.fill();
  M4_lintel(x,y,w);
}
// dintel de piedra con una fila de signos tallados y un disco con rayos en el centro (inventado)
function M4_lintel(x,y,w){
  ctx.fillStyle='#a07a4a';ctx.fillRect(x,y,w,9);
  ctx.fillStyle='#d0a868';ctx.fillRect(x,y,w,1.2);
  ctx.fillStyle='#6a4a2a';ctx.fillRect(x,y+7.6,w,1.4);
  ctx.fillStyle='#5a3a1e';for(let i=x+4;i<x+w-6;i+=7){if(Math.abs(i+2-(x+w/2))<9)continue;M4_glyph(i,y+2,i);}
  const cx=x+w/2;ctx.fillStyle='#e8c050';circle(cx,y+4.5,2.6);ctx.fillStyle='#8a5a20';circle(cx,y+4.5,1.2);
  ctx.fillStyle='#e8c050';for(let i=0;i<6;i++){const a=i/6*Math.PI*2;ctx.fillRect(q(cx+Math.cos(a)*4-0.4),q(y+4.5+Math.sin(a)*3.2-0.4),0.8,0.8);}
  ctx.fillStyle='#4a2e18';ctx.fillRect(x+18,y+3,0.8,4);ctx.fillRect(x+w-26,y+2,0.8,3);   // grietas
}
M4_LVL.drawTunnelFront=function(t){
  if(t.k!=='tumba')return false;
  const iy=t.y+9;
  ctx.fillStyle='rgba(20,8,4,0.3)';ctx.fillRect(t.x,iy,t.w,GROUND-iy);
  const g=ctx.createLinearGradient(0,iy,0,iy+12);g.addColorStop(0,'rgba(10,4,2,0.55)');g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g;ctx.fillRect(t.x,iy,t.w,12);
  // hilos de arena que caen del techo
  for(let i=0;i<4;i++){const dx=t.x+18+i*30+hash(i+11)*8,ph=(T+i*37)%90;if(ph>60)continue;
    ctx.fillStyle='rgba(230,180,110,0.6)';ctx.fillRect(dx,iy,0.7,Math.min(GROUND-iy,ph*0.8));
    if(ph*0.8>=GROUND-iy-1){ctx.fillStyle='rgba(230,180,110,0.5)';ctx.fillRect(dx-1.5,GROUND-1,3.5,0.8);}}
  M4_lintel(t.x,t.y,t.w);
  return true;
};

// ================== coberturas propias ==================
M4_LVL.drawCover=function(c){
  if(c.vida<=0)return false;   // los escombros los dibuja mundo.js
  const x=c.x,w=c.w,top=c.top,h=c.h;
  switch(c.k){
  case 'bloque':
    M4_blocks(x,top,w,h);ctx.fillStyle='#5a3a1e';M4_glyph(x+4,top+5,x);M4_glyph(x+w-9,top+5,x+5);break;
  case 'anforas':{
    for(const [ox,hh,lean] of [[2,h,0],[9,h-2,0]]){ctx.save();ctx.translate(x+ox+3.5,GROUND);ctx.rotate(lean);
      ctx.fillStyle='#9a5a32';ctx.beginPath();ctx.ellipse(0,-hh*0.45,3.6,hh*0.42,0,0,7);ctx.fill();ctx.fillRect(-1.2,-hh,2.4,3);
      ctx.fillStyle='#c07a44';ctx.fillRect(-2.6,-hh*0.7,1,hh*0.4);ctx.fillStyle='#2a1a10';ctx.fillRect(-3.4,-hh*0.5,6.8,0.7);
      ctx.fillStyle='#5a3218';ctx.fillRect(-2,-hh+0.5,4,0.8);ctx.restore();}
    ctx.save();ctx.translate(x+w-4,GROUND-3);ctx.rotate(-1.4);ctx.fillStyle='#8a4e2a';ctx.beginPath();ctx.ellipse(0,0,3,5,0,0,7);ctx.fill();ctx.restore();
    break;}
  case 'carro':{ // carro de guerra roto: caja ladeada y una rueda
    ctx.fillStyle='#6a4a2a';ctx.beginPath();ctx.moveTo(x,GROUND);ctx.lineTo(x+2,top+3);ctx.lineTo(x+w-6,top);ctx.lineTo(x+w-4,GROUND);ctx.fill();
    ctx.fillStyle='#8a6a3a';ctx.fillRect(x+2,top+3,w-8,1);ctx.fillStyle='#b88a40';ctx.fillRect(x+4,top+6,w-12,1);
    ctx.fillStyle='#4a3018';for(let i=x+5;i<x+w-6;i+=4)ctx.fillRect(i,top+4,0.6,h-5);
    const wx=x+w-6,wy=GROUND-6;ctx.strokeStyle='#3a2414';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(wx,wy,5.4,0,7);ctx.stroke();
    ctx.lineWidth=0.6;ctx.beginPath();for(let i=0;i<6;i++){const a=i/6*Math.PI*2+0.3;ctx.moveTo(wx,wy);ctx.lineTo(wx+Math.cos(a)*5,wy+Math.sin(a)*5);}ctx.stroke();
    ctx.fillStyle='#b88a40';circle(wx,wy,1.2);break;}
  default:return false;
  }
  if(c.vida<c.max*0.5){ctx.fillStyle='rgba(30,14,6,0.55)';ctx.fillRect(x+w*0.25,top+1,1,h*0.5);ctx.fillRect(x+w*0.7,top,2,2);}
  return true;
};
