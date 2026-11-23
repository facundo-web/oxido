'use strict';
// Óxido · Misión 3: Pantano tóxico (escenario, barro, criaturas)
// Todo lo de este archivo usa el prefijo M3_ (o swamp) para no chocar con otros nombres globales.

// ================== datos de la misión ==================
const M3_LVL={name:'MISIÓN 3 · PANTANO TÓXICO',short:'3 · PANTANO TÓXICO',theme:'swamp',end:3400,music:'l3',
  platforms:[{x:250,y:130,w:50},{x:330,y:126,w:56},{x:440,y:110,w:50},{x:700,y:124,w:70},{x:830,y:100,w:56},{x:960,y:124,w:60},
    {x:1150,y:126,w:50},{x:1330,y:110,w:50},{x:1690,y:122,w:60},{x:1790,y:102,w:50},
    {x:2220,y:124,w:56},{x:2380,y:108,w:50},{x:2620,y:122,w:70},{x:2760,y:104,w:60},{x:2830,y:126,w:56},{x:2990,y:118,w:50},
    // altas: mirador de caza sobre pilotes y la rama de un árbol muerto
    {x:872,y:62,w:40,hi:'lookout'},{x:1836,y:64,w:44,hi:'lookout'},{x:2800,y:62,w:40,hi:'branch'},
    // tocones en la arena del villano (el lado derecho queda libre para la planta)
    {x:3120,y:128,w:34,step:1},{x:3196,y:110,w:34,step:1}],
  // pasaje bajo el canal de desagüe de la planta química (el techo es plataforma)
  tunnels:[{x:1480,w:126,y:116,k:'canal'}],
  // pirámide de troncos, tambores, tablones y bolsas
  pyramids:[{x:1940,w:150,n:4,dy:24,inset:14,mats:['log','drum','plank','sack']}],
  // charcos de barro: frenan al que camina adentro y de ahí salen las criaturas
  pools:[{x:326,w:62},{x:686,w:78},{x:1232,w:70},{x:1630,w:56},{x:2410,w:64},{x:2540,w:70},{x:2900,w:64}],
  covers:[{x:600,w:26,h:14,k:'logs',hp:8},{x:1112,w:24,h:15,k:'drums',hp:10},{x:1390,w:20,h:14,k:'sacks',hp:8},
    {x:1850,w:26,h:14,k:'logs',hp:8},{x:2186,w:22,h:15,k:'drums',hp:10},{x:2500,w:24,h:14,k:'sacks',hp:8},
    {x:3030,w:22,h:15,k:'drums',hp:10},{x:3160,w:24,h:15,k:'logs',hp:14}],
  crates:[{x:200,drop:'H'},{x:400,drop:'G'},{x:640,drop:'R'},{x:1010,drop:'E'},{x:1200,drop:'+'},{x:1420,drop:'F'},{x:1800,drop:'S'},
    {x:2300,drop:'G'},{x:2640,drop:'+'},{x:2975,drop:'R'},{x:3050,drop:'E'}],
  extraCrates:[{x:520,p:0.45},{x:884,y:62,p:0.7},{x:1848,y:64,p:0.6},{x:2812,y:62,p:0.6}],
  turrets:[1890,2720],mechs:[1740],
  prisoners:[{x:290,k:'ally'},{x:845,y:100,k:'item'},{x:1530,k:'item'},{x:1800,y:102,k:'ally'},{x:2010,y:60,k:'item'},
    {x:2300,k:'item'},{x:2775,y:104,k:'item'},{x:3010,k:'ally'}],
  extraPrisoners:[{x:1850,y:64,p:0.75,k:'ally'},{x:2580,p:0.4,k:'item'}],
  decor:[{x:40,k:'tree'},{x:120,k:'reeds'},{x:176,k:'warn'},{x:480,k:'tdrum'},{x:556,k:'stump'},{x:650,k:'reeds'},{x:784,k:'tree'},
    {x:922,k:'boat'},{x:1058,k:'warn'},{x:1186,k:'reeds'},{x:1310,k:'tdrum'},{x:1440,k:'outfall'},{x:1616,k:'reeds'},
    {x:2118,k:'tree'},{x:2200,k:'warn'},{x:2352,k:'tdrum'},{x:2480,k:'reeds'},{x:2690,k:'stump'},{x:2862,k:'tree'},
    {x:2978,k:'reeds'},{x:3070,k:'warn'},{x:3250,k:'outfall'},{x:3310,k:'tree'},{x:3380,k:'reeds'}],
  events:[
    {at:20,spawn:[{t:'soldier',x:'R',d:70},{t:'mudling',x:340,d:120}]},
    {at:110,spawn:[{t:'soldier',x:450,y:92}]},
    {at:240,spawn:[{t:'grenadier',x:'R'},{t:'soldier',x:'R',d:50},{t:'drone',x:'R',d:120}]},
    {at:400,spawn:[{t:'mudling',x:700},{t:'mudling',x:744,d:70},{t:'soldier',x:'R',d:40}]},
    {at:560,spawn:[{t:'soldier',x:845,y:82},{t:'drone',x:'R',d:30},{t:'soldier',x:'R',d:90}]},
    {at:700,spawn:[{t:'shield',x:'R'},{t:'grenadier',x:'R',d:60},{t:'mudling',x:'R',d:100}]},
    {at:1200,spawn:[{t:'soldier',x:1700,y:104},{t:'mudling',x:1650,d:30}]},
    {at:1320,spawn:[{t:'grenadier',x:1800,y:84},{t:'drone',x:'R',d:40}]},
    // cofre blindado en el canal: al acercarte viene una oleada grande
    {at:1380,spawn:[{t:'shield',x:'R'},{t:'soldier',x:'L',d:30},{t:'grenadier',x:'R',d:60},{t:'drone',x:'L',d:90},{t:'mudling',x:1650,d:110},{t:'soldier',x:'R',d:130},{t:'soldier',x:'L',d:170}]},
    {at:1460,spawn:[{t:'shield',x:'R'},{t:'soldier',x:'R',d:40},{t:'drone',x:'R',d:90}]},
    {at:1820,spawn:[{t:'drone',x:'R'},{t:'soldier',x:2000,y:42,d:20},{t:'drone',x:'R',d:40},{t:'soldier',x:'R',d:70},{t:'shield',x:'R',d:120}]},
    {at:2260,spawn:[{t:'mudling',x:2560},{t:'soldier',x:2640,y:104},{t:'shield',x:'R',d:30}]},
    {at:2380,spawn:[{t:'soldier',x:2780,y:86},{t:'soldier',x:'R',d:20},{t:'drone',x:'R',d:80}]},
    {at:2520,spawn:[{t:'shield',x:'R'},{t:'mudling',x:2580,d:20},{t:'grenadier',x:'R',d:70},{t:'drone',x:'R',d:110}]},
    {at:2700,spawn:[{t:'drone',x:'R'},{t:'mudling',x:2920,d:30},{t:'mudling',x:2944,d:90}]},
    {at:2840,spawn:[{t:'shield',x:'R'},{t:'grenadier',x:'R',d:40},{t:'soldier',x:'R',d:90}]}],
  arenas:[
    // jefe chico a un tercio; después juego normal y una emboscada; el villano al final (nunca seguidos)
    {at:1100,mini:true},
    {at:2160,waves:[
      [{t:'soldier',x:'R'},{t:'mudling',x:1260,d:30},{t:'soldier',x:'L',d:60}],
      [{t:'drone',x:'R'},{t:'mudling',x:1244,d:20},{t:'mudling',x:1290,d:80},{t:'grenadier',x:'R',d:60}],
      [{t:'shield',x:'R'},{t:'soldier',x:'L',d:30},{t:'mudling',x:1270,d:50},{t:'drone',x:'R',d:110}]]},
    {at:3080,boss:true}],
  vaults:[{x:1572}],
  m3Built:true};
// niveles.js ya agregó los techos y escalones de las misiones 1 y 2 antes de que cargue este archivo: acá van los de la 3
for(const t of M3_LVL.tunnels)M3_LVL.platforms.push({x:t.x,y:t.y,w:t.w,roof:t});
for(const p of M3_LVL.pyramids)for(let i=0;i<p.n;i++)
  M3_LVL.platforms.push({x:p.x+i*p.inset,y:GROUND-(i+1)*p.dy,w:p.w-2*i*p.inset,pyr:p,tier:i,mat:p.mats[i%p.mats.length]});
M3_LVL.events.sort((a,b)=>a.at-b.at);
LEVELS.push(M3_LVL);
// la criatura del barro cuesta un poco más que un soldado al sortear tipos (ver variarPartida)
NV_COSTO.mudling=1.1;
COB_COL.logs=['#4a3824','#6e5434'];COB_COL.drums=['#8a8a2a','#c2b23a'];COB_COL.sacks=['#5e6034','#7e7c48'];

// ================== utilidades ==================
const M3_sfx=n=>{if(typeof SFX!=='undefined'&&SFX[n])SFX[n]();};
function M3_poolAt(x){for(const p of M3_LVL.pools)if(x>=p.x&&x<=p.x+p.w)return p;return null;}
function M3_nearPool(x,max){let b=null,bd=max;for(const p of M3_LVL.pools){const d=Math.abs(clamp(x,p.x+8,p.x+p.w-8)-x);if(d<bd){bd=d;b=p;}}return b;}
const M3_inMud=o=>o&&o.onGround&&!o.plat&&!!M3_poolAt(o.x+(o.w||8)/2);
function M3_splat(x,y,n){
  for(let i=0;i<n;i++)parts.push({k:'p',x:x+rand(-2,2),y:y-1,vx:rand(-1.3,1.3),vy:rand(-2.2,-0.6),g:0.16,life:rand(16,28),maxl:28,size:rand(1,2),col:i%3?'#5a4620':'#8fc23a'});
}
// estado que se reinicia en cada partida
const M3={ev:null,feet:new Map(),own:[]};
function M3_reset(){M3.ev=levelEvents;M3.feet=new Map();M3.own=[];}

// ================== criatura del barro (mudling) ==================
// Vive en un charco. Avisa con burbujas, sale, se arrastra hacia vos, escupe barro y se vuelve a hundir.
// Solo se le puede pegar cuando está afuera. Hundida, su caja se corre lejos (x=-9999): no la ven las balas,
// los cohetes, los amigos ni el bot. La posición real vive en e.hx.
const M3_HIDE=GROUND+70;
function M3_mkMudling(x){
  // si viene de un borde de la pantalla (x:'R' o 'L'), brota adentro de la vista; si trae x fija, espera en ese lugar
  const edge=Math.abs(x-(camX+VW+12))<0.5||Math.abs(x-(camX-20))<0.5;
  const x0=edge?clamp(x,camX+40,camX+VW-40):x;
  const pool=M3_nearPool(x0,140);
  let home;
  if(pool)home={x:pool.x+5,w:pool.w-18};
  else{home={x:clamp(x0,camX+20,camX+VW-40)-10,w:22,own:true};M3.own.push(home);}
  const sx=clamp(x0,home.x,home.x+home.w)+rand(-6,6);
  const hx=clamp(sx,home.x,home.x+home.w);
  return{type:'mudling',x:-9999,hx,y:M3_HIDE,w:13,h:12,hp:4,face:-1,flash:0,score:150,cd:0,
    home,st:'under',t:rand(10,40)|0,rise:0,spits:0,anim:rand(0,99),upd:M3_updMudling,draw:M3_drawMudling,onKill:M3_killMudling};
}
function M3_updMudling(e){
  if(e.flash>0)e.flash--;
  e.t--;e.anim++;e.x=e.hx;
  const h=e.home,pc=P.dead?null:pCenter(P);
  // el charco quedó atrás: se va sin dar puntos
  if(h.x+h.w<camX-50){e.gone=true;M3_freeOwn(e);return;}
  const vis=h.x+h.w>camX&&h.x<camX+VW;
  switch(e.st){
  case 'under':
    e.y=M3_HIDE;
    if(e.t<=0){
      if(!vis||!pc||Math.abs(pc.x-(h.x+h.w/2))>230){e.t=30;break;}       // espera a que estés cerca
      e.x=clamp(pc.x-6+rand(-14,14),h.x,h.x+h.w);
      for(const o of enemies)if(o!==e&&o.type==='mudling'&&o.st!=='under'&&Math.abs(o.hx-e.x)<12)e.x=clamp(e.x+(e.x<o.hx?-14:14),h.x,h.x+h.w);
      e.st='bubble';e.t=52;M3_sfx('bubble');
    }
    break;
  case 'bubble':                                                          // aviso: burbujas verdes donde va a salir
    e.y=M3_HIDE;
    if(e.t%9===0)parts.push({k:'p',x:e.x+6+rand(-4,4),y:GROUND-1,vx:rand(-0.3,0.3),vy:rand(-1.2,-0.5),g:0.06,life:14,maxl:14,size:1,col:'#a8e04a'});
    if(e.t<=0){e.st='rise';e.t=16;M3_sfx('emerge');M3_splat(e.x+6,GROUND,6);}
    break;
  case 'rise':
    e.y=GROUND-e.h;e.rise=1-e.t/16;
    if(e.t<=0){e.st='out';e.t=130;e.spits=0;e.rise=1;}
    break;
  case 'out':{
    e.y=GROUND-e.h;
    const tx=pc?pc.x-6:e.x,dx=tx-e.x;
    if(Math.abs(dx)>2)e.face=dx<0?-1:1;
    const rear=e.rearT>0;
    if(!rear&&Math.abs(dx)>14)e.x=clamp(e.x+Math.sign(dx)*0.38,h.x-10,h.x+h.w+10);
    // escupe: se para 18 cuadros antes (la boca se ilumina) y tira un pegote en arco
    if(rear){if(--e.rearT===0&&pc&&e.x+e.w>camX+2&&e.x<camX+VW-2){M3_spit(e.x+6+e.face*5,GROUND-9,e.face,Math.abs(pc.x-(e.x+6)));e.spits++;}}
    else if(pc&&e.cd<=0&&(e.t===100||e.t===40)&&Math.abs(dx)<190&&Math.abs(dx)>18){e.rearT=18;}
    if(e.cd>0)e.cd--;
    // tocarla lastima
    for(const p of players)if(!p.dead&&overlap(hurtbox(p),{x:e.x+1,y:e.y+2,w:e.w-2,h:e.h-2}))withP(p,()=>hurtPlayer(1));
    if(e.t<=0&&!(e.rearT>0)){e.st='dive';e.t=14;}
    break;}
  case 'dive':
    e.rise=e.t/14;
    e.y=e.t>8?GROUND-e.h:M3_HIDE;                                          // en los últimos cuadros ya no se le puede pegar
    if(e.t===13)M3_splat(e.x+6,GROUND,4);
    if(e.t<=0){e.st='under';e.t=rand(70,120)|0;e.rise=0;}
    break;
  }
  e.hx=e.x;
  if(!M3_vuln(e)){e.x=-9999;e.y=M3_HIDE;}
}
const M3_vuln=e=>e.st==='rise'||e.st==='out'||(e.st==='dive'&&e.t>8);
// aviso de que va a salir: el barro se hincha, burbujas verdes y, al final, dos ojos que se asoman
function M3_drawWarn(e){
  const k=1-e.t/52,bx=e.hx+e.w/2,g=GROUND-2.2;
  ctx.fillStyle=`rgba(190,255,90,${0.10+0.12*k})`;ctx.beginPath();ctx.ellipse(bx,g,9+k*4,2.5+k*1.5,0,0,7);ctx.fill();
  ctx.fillStyle='#5a4420';ctx.beginPath();ctx.ellipse(bx,g+0.4,3+k*5,1+k*2.6,0,Math.PI,0);ctx.fill();
  ctx.fillStyle='#7a5e2c';ctx.fillRect(bx-2-k*2,g-k*2.2,3+k*2,0.8);
  ctx.strokeStyle=`rgba(190,255,90,${0.55+k*0.45})`;ctx.lineWidth=0.8;
  for(let i=0;i<3;i++){const ph=((T+i*9)%24)/24,r=0.8+ph*(1.4+k*1.6);ctx.beginPath();ctx.arc(bx-5+i*5,g-ph*2,r,0,7);ctx.stroke();}
  if(k>0.55&&(T>>2)%2){ctx.fillStyle='#e8ff6a';ctx.fillRect(bx-2,g-1-k*2,1.2,1.2);ctx.fillRect(bx+1.5,g-1-k*2,1.2,1.2);}
}
function M3_freeOwn(e){if(e.home.own){const i=M3.own.indexOf(e.home);if(i>=0)M3.own.splice(i,1);}}
function M3_killMudling(e){
  M3_sfx('squelch');M3_splat(e.hx+6,GROUND-4,14);
  parts.push({k:'smoke',col:'120,170,60',x:e.hx+6,y:GROUND-5,vx:0,vy:-0.3,life:40,maxl:40,size:4});
  M3_freeOwn(e);
  if(Math.random()<0.1)pickups.push({kind:pick(['H','S','F','R','G','E','+']),x:e.hx,y:GROUND-14,w:10,h:10,vy:-2.5,life:700});
}
function M3_drawMudling(e){
  const bx=e.hx,g=GROUND;
  if(e.st==='under'){return;}
  if(e.st==='bubble')return;   // el aviso se dibuja encima del barro, en drawFx (M3_drawWarn)
  const rise=e.st==='out'?1:e.rise,hh=e.h*rise,top=g-hh,fl=e.flash>0,f=e.face;
  ctx.save();ctx.beginPath();ctx.rect(bx-6,g-e.h-8,e.w+12,e.h+8);ctx.clip();
  ctx.translate(0,e.h-hh);
  const y=g-e.h,sway=Math.sin(e.anim/7)*0.6,rear=e.rearT>0?Math.min(1,(18-e.rearT)/6):0;
  // brazos de barro que arrastran
  ctx.fillStyle=fl?'#fff':'#3a2c14';
  const arm=Math.sin(e.anim/6)*1.5;
  ctx.fillRect(bx+(f>0?9:-2)+arm*f,y+6,4,2);ctx.fillRect(bx+(f>0?12:-3)+arm*f,y+7,1.5,3);
  // cuerpo: montículo con forma de gota caída
  const body=o=>{ctx.beginPath();ctx.moveTo(bx-1-o,y+e.h);ctx.quadraticCurveTo(bx-1-o,y+3-rear*2-o,bx+5+sway,y-rear*3-o);ctx.quadraticCurveTo(bx+13+o,y+2-rear*2-o,bx+13+o,y+e.h);ctx.closePath();ctx.fill();};
  ctx.fillStyle='#160f06';body(0.9);
  ctx.fillStyle=fl?'#fff':'#5e4820';body(0);
  if(!fl){
    ctx.fillStyle='#6e5a2a';ctx.beginPath();ctx.ellipse(bx+4+sway,y+3-rear*2,2.5,1.2,-0.4,0,7);ctx.fill();    // brillo húmedo
    ctx.fillStyle='#8fc23a';for(let i=0;i<3;i++){const dx=bx+2+i*4,len=2+((e.anim/5+i*3)%4);ctx.fillRect(dx,y+4+i,1,len);}  // baba tóxica
    // ojos (se encienden más cuando va a escupir)
    const ex=bx+(f>0?7:2),ey=y+3-rear*2;
    ctx.fillStyle=rear?'#fff6a0':'#e8ff6a';ctx.fillRect(ex,ey,1.5,1.5);ctx.fillRect(ex+3,ey+0.5,1.5,1.5);
    // boca
    ctx.fillStyle=rear?'#b8ff4a':'#1a1208';ctx.fillRect(bx+(f>0?8:1),y+6-rear,3,1+rear*1.5);
    if(rear&&(T>>1)%2){ctx.fillStyle='rgba(190,255,90,0.35)';circle(bx+(f>0?10:2),y+6,3);}
  }
  ctx.restore();
}
// pegote de barro: vuela en arco, lo frenan las coberturas y se puede derribar a tiros
function M3_spit(x,y,dir,d){
  M3_sfx('spit');
  eproj.push({kind:'mud',x,y,vx:dir*clamp(d/48,0.7,2.4),vy:-2.4,g:0.11,r:2.5,t:0,upd:M3_spitUpd,draw:M3_spitDraw});
}
function M3_spitUpd(b,hb){
  b.t++;b.vy+=b.g;b.x+=b.vx;b.y+=b.vy;
  if(coverBlocks(b)){M3_splat(b.x,b.y,5);b.gone=true;return;}
  if(hb&&b.x+b.r>hb.x&&b.x-b.r<hb.x+hb.w&&b.y+b.r>hb.y&&b.y-b.r<hb.y+hb.h){hurtPlayer(1);M3_splat(b.x,b.y,6);b.gone=true;return;}
  for(const a of allies)if(!a.gone&&overlapPt(a,b.x,b.y,b.r)){killAlly(a);M3_splat(b.x,b.y,5);b.gone=true;return;}
  if(b.y>=GROUND-1){M3_splat(b.x,GROUND-1,6);M3_sfx('splash');b.gone=true;return;}
  for(const pl of platforms)if(b.vy>0&&b.x>pl.x&&b.x<pl.x+pl.w&&b.y>=pl.y&&b.y-b.vy<pl.y){M3_splat(b.x,pl.y,5);b.gone=true;return;}
  if(b.x<camX-20||b.x>camX+VW+20||b.t>300)b.gone=true;
}
function M3_spitDraw(b){
  ctx.fillStyle='#3a2c12';circle(b.x,b.y,b.r+0.6);
  ctx.fillStyle='#6a5224';circle(b.x,b.y,b.r);
  ctx.fillStyle='#a8e04a';ctx.fillRect(q(b.x-1),q(b.y-1.5),1.5,1);
  ctx.fillStyle='rgba(90,70,30,0.6)';ctx.fillRect(q(b.x-b.vx*1.5),q(b.y-b.vy*1.5),1.5,1.5);
}
ENEMY_MAKERS.mudling=M3_mkMudling;

// ================== ganchos por cuadro ==================
M3_LVL.speedMul=function(o){
  if(!M3_inMud(o))return 1;
  return o.armor!==undefined?0.72:o.ci!==undefined?0.55:0.6;   // Grillo · jugador · soldados
};
M3_LVL.upd=function(){
  if(M3.ev!==levelEvents)M3_reset();
  // chapoteos al caminar o caer en el barro
  const walkers=[...players.filter(p=>!p.dead&&!p.ride),...mechs,...allies,...enemies.filter(e=>e.type==='soldier'||e.type==='grenadier'||e.type==='shield')];
  for(const o of walkers){
    const was=M3.feet.get(o),now=M3_inMud(o);
    if(now&&was===false){M3_splat(o.x+(o.w||8)/2,GROUND,o.armor!==undefined?10:6);if(o.ci!==undefined||o.armor!==undefined)M3_sfx('splash');}
    else if(now&&Math.abs(o.vx||0)>0.2&&(T+((o.x|0)&7))%9===0){
      parts.push({k:'p',x:o.x+(o.w||8)/2-Math.sign(o.vx)*3,y:GROUND-1,vx:-Math.sign(o.vx)*rand(0.2,0.8),vy:rand(-1.4,-0.6),g:0.14,life:14,maxl:14,size:1,col:'#5a4620'});
      if(o.ci!==undefined&&T%18===0)M3_sfx('splash');
    }
    M3.feet.set(o,now);
  }
  if(M3.feet.size>80)M3.feet=new Map();
  // vapor que sale de los charcos
  if(Math.random()<0.05){const p=pick(M3_LVL.pools);if(p.x<camX+VW&&p.x+p.w>camX)
    parts.push({k:'smoke',col:'140,180,80',x:p.x+rand(6,p.w-6),y:GROUND-2,vx:rand(-0.1,0.1),vy:rand(-0.35,-0.15),life:50,maxl:50,size:rand(1.5,3)});}
};

// ================== fondo ==================
const M3_R=mulberry32(33);
// línea de cipreses lejanos: picos altos y bajos alternados
const M3_FAR=Array.from({length:64},(_,i)=>{const k=M3_R();return k<0.22?18+M3_R()*18:k<0.5?9+M3_R()*6:4+M3_R()*4;});
// planta química lejana: tanques, torres y chimeneas con humo verde
const M3_PLANT=[];{let x=0;while(x<700){const k=M3_R();M3_PLANT.push({x,w:k<0.5?18+M3_R()*14:6+M3_R()*4,h:k<0.5?12+M3_R()*14:30+M3_R()*20,tank:k<0.5,smoke:k>=0.5&&M3_R()<0.8,s:(M3_R()*999)|0});x+=k<0.5?36+M3_R()*40:22+M3_R()*30;}}
// árboles muertos del medio
const M3_MID=[];{let x=10;while(x<900){M3_MID.push({x,h:44+M3_R()*46,s:(M3_R()*999)|0});x+=60+M3_R()*90;}}
const M3_FLIES=Array.from({length:20},()=>({x:M3_R()*W,y:60+M3_R()*90,ph:M3_R()*6.28,v:0.5+M3_R()}));
const M3_SPORES=Array.from({length:28},()=>({x:M3_R(),y:M3_R(),v:0.4+M3_R(),s:M3_R()}));

// árbol muerto: tronco con raíces abiertas, ramas torcidas y barba de musgo colgando
function M3_tree(x,g,h,s,col,moss){
  const r=k=>hash(s*31+k),lean=(r(1)-0.5)*10;
  ctx.save();ctx.lineCap='round';
  ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x-8,g);ctx.quadraticCurveTo(x-3,g-4,x-2.5,g-14);ctx.lineTo(x-1.2+lean,g-h);
  ctx.lineTo(x+1.2+lean,g-h);ctx.lineTo(x+2.5,g-14);ctx.quadraticCurveTo(x+3,g-4,x+8,g);ctx.closePath();ctx.fill();
  ctx.strokeStyle=col;
  for(let i=0;i<4;i++){
    const t=0.38+i*0.16,by=g-h*t,bx=x+lean*t,dir=(i+(s&1))%2?1:-1,len=7+r(i+3)*h*0.28;
    const ex=bx+dir*len,ey=by-len*(0.25+r(i+9)*0.5);
    ctx.lineWidth=Math.max(0.7,2.2-i*0.4);ctx.beginPath();ctx.moveTo(bx,by);ctx.quadraticCurveTo(bx+dir*len*0.55,by-1,ex,ey);ctx.stroke();
    ctx.lineWidth=0.6;ctx.beginPath();ctx.moveTo(bx+dir*len*0.6,by-len*0.2);ctx.lineTo(bx+dir*len*0.72,by-len*0.55);ctx.stroke();
    if(moss){ctx.strokeStyle=moss;ctx.lineWidth=0.8;ctx.beginPath();
      for(let m=0;m<3;m++){const k=0.35+m*0.25,mx=bx+(ex-bx)*k,my=by+(ey-by)*k*0.8,l=3+r(i*7+m)*9,sw=Math.sin(T/45+s+m)*0.8;
        ctx.moveTo(mx,my);ctx.lineTo(mx+sw,my+l);}
      ctx.stroke();ctx.strokeStyle=col;}
  }
  ctx.restore();
}
M3_LVL.drawBG=function(){
  const HZ=128;
  const g=ctx.createLinearGradient(0,0,0,HZ);
  g.addColorStop(0,'#070f0b');g.addColorStop(0.5,'#14261b');g.addColorStop(0.85,'#3a5630');g.addColorStop(1,'#7c9640');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  // sol enfermo detrás de la bruma
  ctx.fillStyle='rgba(200,230,120,0.08)';circle(96,62,30);ctx.fillStyle='rgba(210,236,140,0.16)';circle(96,62,18);
  ctx.fillStyle='#d6e89a';circle(96,62,10);
  ctx.fillStyle='rgba(40,64,40,0.5)';
  for(let i=0;i<5;i++){const x=((i*140-T*0.08-camX*0.03)%560+560)%560-120;ctx.beginPath();ctx.ellipse(x,44+i*9,60,2.2,0,0,7);ctx.fill();}
  // planta química lejana
  const off=((camX*0.07)%700+700)%700;
  for(const rep of [0,700])for(const b of M3_PLANT){
    const x=b.x-off+rep;if(x>W+20||x+b.w<-20)continue;const top=HZ-b.h;
    ctx.fillStyle='#2a3e2c';
    if(b.tank){ctx.fillRect(x,top,b.w,b.h);ctx.beginPath();ctx.ellipse(x+b.w/2,top,b.w/2,3,0,Math.PI,0);ctx.fill();
      ctx.fillStyle='#34503a';ctx.fillRect(x,top+3,b.w,1);ctx.fillRect(x,top+b.h*0.6,b.w,0.8);}
    else{ctx.fillRect(x,top,b.w,b.h);ctx.fillRect(x-1,top,b.w+2,2);ctx.fillStyle='#34503a';for(let y=top+6;y<HZ;y+=7)ctx.fillRect(x,y,b.w,0.8);}
    if((T>>5)%3!==(b.s%3)){ctx.fillStyle='#b8ff5a';ctx.fillRect(x+b.w/2-0.5,top-(b.tank?3:1),1,1);}
    if(b.smoke)for(let k=0;k<6;k++){const a=((T*0.25+k*11+b.s)%66),al=0.22*(1-a/66);
      ctx.fillStyle=`rgba(150,195,90,${al})`;circle(x+b.w/2+a*0.45,top-2-a*0.55,1.5+a*0.09);}
  }
  // cipreses lejanos y agua del pantano
  ridge(M3_FAR,5,0.13,HZ+2,'#1c2e20');
  ctx.fillStyle='#10201a';ctx.fillRect(0,HZ,W,GROUND-HZ+1);
  ctx.fillStyle='rgba(214,232,154,0.22)';for(let i=0;i<6;i++)ctx.fillRect(88+Math.sin(T/24+i)*3,HZ+3+i*4,16-i*2,0.8);   // reflejo del sol
  for(let i=0;i<14;i++){const y=HZ+3+(i*1.9)%(GROUND-HZ-5),x=((i*71-camX*0.22+Math.sin(T/40+i)*3)%W+W)%W;
    ctx.fillStyle=i%3?'rgba(120,170,90,0.12)':'rgba(150,200,80,0.2)';ctx.fillRect(x,y,6+hash(i+5)*12,0.7);}
  // árboles muertos del medio, con los pies en el agua
  const mo=((camX*0.3)%900+900)%900;
  for(const rep of [0,900])for(const t of M3_MID){const x=t.x-mo+rep;if(x>W+40||x<-40)continue;
    M3_tree(x,GROUND-3,t.h,t.s,'#0d1a12','#1d3a1e');
    ctx.fillStyle='rgba(30,60,36,0.5)';ctx.fillRect(x-10,GROUND-3,20,0.8);}
  // luciérnagas tóxicas
  for(const f of M3_FLIES){const a=Math.sin(T/18*f.v+f.ph);if(a<0.1)continue;
    const x=((f.x-camX*0.55+Math.sin(T/60+f.ph)*10)%W+W)%W,y=f.y+Math.sin(T/40+f.ph*2)*5;
    ctx.fillStyle=`rgba(190,255,100,${0.18*a})`;circle(x,y,2.2);ctx.fillStyle=`rgba(225,255,140,${0.9*a})`;ctx.fillRect(x-0.5,y-0.5,1,1);}
};

// ================== suelo y charcos ==================
M3_LVL.drawGround=function(){
  const x0=Math.floor(camX)-10;
  ctx.fillStyle='#1c1f12';ctx.fillRect(x0,GROUND,W+20,H-GROUND);
  ctx.fillStyle='#33391c';ctx.fillRect(x0,GROUND,W+20,2.2);
  ctx.fillStyle='#55622a';ctx.fillRect(x0,GROUND,W+20,0.8);
  for(let t=Math.floor(camX/10)-1;t<(camX+VW)/10+1;t++){
    const h=hash(t+300);
    if(h<0.5){ctx.fillStyle=h<0.15?'#3a3a1c':h<0.3?'#14160c':'#2c2a16';const s=1+Math.floor(h*10)%3;ctx.fillRect(t*10+h*7,GROUND+4+Math.floor(h*977)%17,s,s*0.7);}
    if(h>0.55){ctx.fillStyle=h>0.8?'#6f8a34':'#4a6224';const bx=t*10+h*6;   // matas de pasto
      ctx.fillRect(bx,GROUND-2,0.8,2);ctx.fillRect(bx+1.5,GROUND-3,0.8,3);if(h>0.7)ctx.fillRect(bx+3,GROUND-1.5,0.8,1.5);}
  }
  for(const p of M3_LVL.pools)if(p.x<camX+VW+4&&p.x+p.w>camX-4)M3_drawPool(p.x,p.w,true);
  for(const o of M3.own)if(o.x<camX+VW&&o.x+o.w>camX)M3_drawPool(o.x-6,o.w+24,false);
};
function M3_drawPool(x,w,big){
  // hoyo de barro marrón brillante con espuma tóxica en el borde
  ctx.fillStyle='#2a1f0e';ctx.beginPath();ctx.moveTo(x-3,GROUND);ctx.quadraticCurveTo(x+w/2,GROUND+(big?16:8),x+w+3,GROUND);ctx.closePath();ctx.fill();
  ctx.fillStyle='#4f3c1a';ctx.beginPath();ctx.moveTo(x,GROUND);ctx.quadraticCurveTo(x+w/2,GROUND+(big?13:6),x+w,GROUND);ctx.closePath();ctx.fill();
  ctx.fillStyle='#6e5528';ctx.fillRect(x,GROUND,w,1.4);
  ctx.fillStyle='#9a7c3a';for(let i=4;i<w-4;i+=9){const hh=hash(i+x);ctx.fillRect(x+i+Math.sin(T/30+i)*1.5,GROUND+1.6+hh*2,3+hh*3,0.6);}
  ctx.fillStyle='#8fc23a';for(let i=0;i<w;i+=11){const hh=hash(i*3+x);if(hh<0.5)ctx.fillRect(x+i+hh*6,GROUND,2+hh*3,0.9);}  // espuma
  ctx.fillStyle='#a8d850';ctx.fillRect(x-2,GROUND-0.4,2.5,1);ctx.fillRect(x+w-0.5,GROUND-0.4,2.5,1);
  // burbujas que revientan solas (adorno, no avisan nada)
  ctx.strokeStyle='rgba(150,120,60,0.9)';ctx.lineWidth=0.6;
  for(let i=0;i<Math.max(1,w/16);i++){const hh=hash(x*7+i),ph=(T+hh*300)%150,bx=x+5+hh*(w-10);
    if(ph<22){ctx.beginPath();ctx.arc(bx,GROUND+0.6,0.5+ph*0.09,Math.PI,0);ctx.stroke();}
    else if(ph<28){ctx.fillStyle='rgba(170,140,70,0.8)';ctx.fillRect(bx-2,GROUND-1-(ph-22)*0.4,0.8,0.8);ctx.fillRect(bx+1.5,GROUND-1.2-(ph-22)*0.3,0.8,0.8);}}
}

// ================== capa de arriba: barro que tapa los pies, niebla y esporas ==================
// detrás de los personajes (juego.js, drawWorld): barro de los pozos, ondas y niebla. El barro ya no se pinta sobre los
// pies: aclaraba el contorno de tinta (Dirección de Arte, contraste de M3 de noche)
M3_LVL.drawFxFondo=function(){
  ctx.save();ctx.translate(q(-camX),0);
  const pools=[...M3_LVL.pools,...M3.own.map(o=>({x:o.x-6,w:o.w+24}))];
  for(const p of pools){if(p.x>camX+VW||p.x+p.w<camX)continue;
    ctx.fillStyle='rgba(79,60,26,0.93)';ctx.fillRect(p.x,GROUND-2.4,p.w,2.6);
    ctx.fillStyle='rgba(140,112,56,0.85)';ctx.fillRect(p.x,GROUND-2.4,p.w,0.6);
    ctx.fillStyle='rgba(143,194,58,0.7)';for(let i=3;i<p.w;i+=13){const hh=hash(i+p.x*5);if(hh<0.45)ctx.fillRect(p.x+i,GROUND-2.4,2+hh*4,0.6);}
  }
  // ondas alrededor de lo que se mueve en el barro
  ctx.lineWidth=0.5;
  for(const o of [...players.filter(p=>!p.dead&&!p.ride),...mechs,...enemies.filter(e=>e.type!=='drone'&&!e.isBoss)]){
    if(!M3.feet.get(o)&&!(o.type==='mudling'&&o.st!=='under'))continue;
    const cx=(o.type==='mudling'?o.hx:o.x)+(o.w||8)/2,r=((T+(cx|0))%30)/30;
    ctx.strokeStyle=`rgba(170,140,70,${0.7*(1-r)})`;ctx.beginPath();ctx.ellipse(cx,GROUND-2,(o.w||8)/2+2+r*6,0.8+r*0.8,0,0,7);ctx.stroke();
  }
  ctx.restore();
  // niebla baja que se arrastra y bruma alta
  for(let i=0;i<6;i++){const sp=W+180,x=((i*97-camX*0.6+T*0.18)%sp+sp)%sp-90,y=GROUND-5+Math.sin(T/70+i)*2;
    ctx.fillStyle='rgba(170,210,140,0.075)';ctx.beginPath();ctx.ellipse(x,y,72,8,0,0,7);ctx.fill();}
  for(let i=0;i<3;i++){const sp=W+240,x=((i*190-camX*0.2+T*0.08)%sp+sp)%sp-120,y=96+i*11;
    ctx.fillStyle='rgba(160,200,130,0.05)';ctx.beginPath();ctx.ellipse(x,y,100,10,0,0,7);ctx.fill();}
};
// encima: el aviso del bicho que sube (es de juego) y las esporas de 1 px
M3_LVL.drawFx=function(){
  ctx.save();ctx.translate(q(-camX),0);for(const e of enemies)if(e.type==='mudling'&&e.st==='bubble')M3_drawWarn(e);ctx.restore();
  // esporas que flotan
  for(const s of M3_SPORES){const x=((s.x*W-T*0.2*s.v-camX*0.8)%W+W)%W,y=((s.y*H-T*0.12*s.v+Math.sin(T/30+s.s*6)*3)%H+H)%H;
    ctx.fillStyle=s.s>0.7?'rgba(220,250,140,0.55)':'rgba(190,220,130,0.35)';ctx.fillRect(x,y,s.s>0.85?1.2:0.8,s.s>0.85?1.2:0.8);}
};

// ================== decorado ==================
M3_LVL.drawDecor=function(d){
  const x=d.x,g=GROUND;
  switch(d.k){
  case 'tree':ctx.save();ctx.translate(x,g);ctx.scale(1.35,1.35);M3_tree(0,0,58+hash(x)*16,x|0,'#172216','#34522a');ctx.restore();return true;
  case 'reeds':{ // juncos con espigas marrones que se mecen
    ctx.save();ctx.lineCap='round';
    for(let i=0;i<7;i++){const hh=hash(x+i*13),h=10+hh*12,bx=x+i*2.4,sw=Math.sin(T/50+i+x)*1.2;
      ctx.strokeStyle=i%2?'#4a6a2a':'#3a5622';ctx.lineWidth=0.7;ctx.beginPath();ctx.moveTo(bx,g);ctx.quadraticCurveTo(bx,g-h*0.6,bx+sw,g-h);ctx.stroke();
      if(hh>0.45){ctx.fillStyle='#5a3a1e';ctx.fillRect(bx+sw-0.9,g-h-1,1.8,4);}}
    ctx.restore();return true;}
  case 'warn':{ // cartel de peligro: rombo amarillo con una gota que gotea
    ctx.fillStyle='#2a2418';ctx.fillRect(x+5,g-20,2,20);
    ctx.fillStyle='#15140c';ctx.beginPath();ctx.moveTo(x+6,g-33);ctx.lineTo(x+13,g-26);ctx.lineTo(x+6,g-19);ctx.lineTo(x-1,g-26);ctx.closePath();ctx.fill();
    ctx.fillStyle='#d9c23a';ctx.beginPath();ctx.moveTo(x+6,g-32);ctx.lineTo(x+12,g-26);ctx.lineTo(x+6,g-20);ctx.lineTo(x,g-26);ctx.closePath();ctx.fill();
    ctx.fillStyle='#2c3a12';ctx.beginPath();ctx.moveTo(x+6,g-30);ctx.quadraticCurveTo(x+8.5,g-25,x+6,g-23.5);ctx.quadraticCurveTo(x+3.5,g-25,x+6,g-30);ctx.fill();
    ctx.fillStyle='rgba(90,60,20,0.6)';ctx.fillRect(x+8,g-27,1,4);
    const dp=(T+x)%60;if(dp<40){ctx.fillStyle='#8fc23a';ctx.fillRect(x+6,g-20+dp*0.5,0.8,1.2);}
    return true;}
  case 'tdrum':{ // tambor tóxico tirado que pierde un líquido que brilla
    const pu=0.55+Math.sin(T/20+x)*0.2;
    ctx.fillStyle=`rgba(150,230,60,${0.25*pu})`;ctx.beginPath();ctx.ellipse(x+18,g,12,2.4,0,0,7);ctx.fill();
    ctx.fillStyle='#9adf3a';ctx.beginPath();ctx.ellipse(x+17,g-0.2,8,1.2,0,0,7);ctx.fill();
    ctx.fillStyle='#6e6a24';ctx.fillRect(x,g-9,13,9);ctx.fillStyle='#a8a034';ctx.fillRect(x,g-9,13,1);ctx.fillRect(x+4,g-9,1,9);ctx.fillRect(x+9,g-9,1,9);
    ctx.fillStyle='#3a3812';ctx.beginPath();ctx.ellipse(x+13,g-4.5,2,4.5,0,0,7);ctx.fill();
    ctx.fillStyle='#9adf3a';ctx.beginPath();ctx.ellipse(x+13,g-4.5,1.1,3,0,0,7);ctx.fill();
    ctx.fillStyle='rgba(60,40,20,0.6)';ctx.fillRect(x+2,g-6,2,3);
    return true;}
  case 'stump':
    ctx.fillStyle='#2e2416';ctx.beginPath();ctx.moveTo(x-3,g);ctx.lineTo(x+1,g-9);ctx.lineTo(x+4,g-11);ctx.lineTo(x+7,g-8);ctx.lineTo(x+10,g-10);ctx.lineTo(x+12,g-8);ctx.lineTo(x+16,g);ctx.fill();
    ctx.fillStyle='#4a3a22';ctx.fillRect(x+2,g-8,1,7);ctx.fillRect(x+7,g-6,1,5);ctx.fillStyle='#4f6a26';ctx.fillRect(x,g-3,4,1.5);ctx.fillRect(x+11,g-2,3,1.2);
    return true;
  case 'boat':{ // bote de pescador medio hundido
    ctx.save();ctx.translate(x+16,g);ctx.rotate(-0.12);
    ctx.fillStyle='#3e2e1c';ctx.beginPath();ctx.moveTo(-18,-7);ctx.lineTo(16,-9);ctx.lineTo(12,0);ctx.lineTo(-14,1);ctx.closePath();ctx.fill();
    ctx.fillStyle='#5e4a2c';ctx.fillRect(-18,-7.5,34,1.2);ctx.fillStyle='#2a1e12';ctx.fillRect(-6,-7,1.2,7);ctx.fillRect(4,-8,1.2,8);
    ctx.fillStyle='#7a2e22';ctx.fillRect(-14,-5,6,1);
    ctx.strokeStyle='#4a3a22';ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(-2,-8);ctx.lineTo(10,-20);ctx.stroke();   // remo
    ctx.restore();
    ctx.fillStyle='#4f3c1a';ctx.fillRect(x-4,g-1.5,40,1.5);ctx.fillStyle='#8fc23a';ctx.fillRect(x+2,g-1.5,5,0.7);ctx.fillRect(x+22,g-1.5,4,0.7);
    return true;}
  case 'outfall':{ // caño oxidado que escupe líquido tóxico
    ctx.fillStyle='#4a2e1e';ctx.fillRect(x,g-22,5,22);ctx.fillRect(x,g-22,14,5);
    ctx.fillStyle='#7a4a2e';ctx.fillRect(x,g-22,14,1);ctx.fillRect(x,g-22,1,22);
    ctx.fillStyle='#2a1810';ctx.beginPath();ctx.ellipse(x+14,g-19.5,1.4,2.5,0,0,7);ctx.fill();
    for(let i=0;i<6;i++){const ph=((T*0.6+i*4)%18),yy=g-19+ph;ctx.fillStyle=i%2?'#9adf3a':'#c6f070';ctx.fillRect(x+14.5+ph*0.18,yy,1.4,2);}
    const pu=0.6+Math.sin(T/15)*0.2;ctx.fillStyle=`rgba(150,230,60,${0.3*pu})`;ctx.beginPath();ctx.ellipse(x+19,g,9,2,0,0,7);ctx.fill();
    ctx.fillStyle='#9adf3a';ctx.fillRect(x+13,g-0.6,11,0.9);
    return true;}
  }
  return false;
};

// ================== plataformas: pasarelas, miradores, pirámide, canal y tocones ==================
M3_LVL.drawPlat=function(pl){
  if(pl.roof){M3_canalBack(pl);return true;}
  if(pl.pyr){M3_tier(pl);return true;}
  if(pl.hi==='lookout'){M3_lookout(pl);return true;}
  if(pl.hi==='branch'){M3_branch(pl);return true;}
  if(pl.step){M3_stump(pl);return true;}
  M3_boardwalk(pl);return true;
};
function M3_moss(x,y,w,s){
  ctx.fillStyle='#3f5a22';
  for(let i=1;i<w-1;i+=3){const hh=hash(i+s);if(hh<0.45)continue;ctx.fillRect(x+i,y,1,1+hh*5);}
}
// pasarela de tablones sobre pilotes
function M3_boardwalk(pl){
  const x=pl.x,y=pl.y,w=pl.w;
  ctx.fillStyle='#2b2014';ctx.fillRect(x+3,y+3,3,GROUND-y-3);ctx.fillRect(x+w-6,y+3,3,GROUND-y-3);
  ctx.strokeStyle='#3a2e1c';ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(x+5,y+5);ctx.lineTo(x+w-5,GROUND-3);ctx.stroke();
  ctx.fillStyle='#4f3c1a';ctx.fillRect(x+2,GROUND-1.5,5,1.5);ctx.fillRect(x+w-7,GROUND-1.5,5,1.5);
  ctx.fillStyle='#6b5634';ctx.fillRect(x,y,w,3.5);
  ctx.fillStyle='#9a8050';ctx.fillRect(x,y,w,0.9);
  ctx.fillStyle='#3a2c18';for(let i=7;i<w;i+=8)ctx.fillRect(x+i,y+0.9,0.7,2.6);
  ctx.fillStyle='#22180c';ctx.fillRect(x,y+3.5,w,1);
  M3_moss(x,y+4.5,w,x);
}
// mirador de caza: pilotes altos, baranda y un trapo verde
function M3_lookout(pl){
  const x=pl.x,y=pl.y,w=pl.w;
  ctx.strokeStyle='#241c10';ctx.lineWidth=1.6;ctx.beginPath();
  ctx.moveTo(x+4,y+3);ctx.lineTo(x+1,GROUND);ctx.moveTo(x+w-4,y+3);ctx.lineTo(x+w-1,GROUND);ctx.stroke();
  ctx.lineWidth=0.7;ctx.beginPath();
  for(let k=0;k<3;k++){const a=y+8+k*((GROUND-y-10)/3),b=a+(GROUND-y-10)/3;ctx.moveTo(x+4,a);ctx.lineTo(x+w-3,b);ctx.moveTo(x+w-4,a);ctx.lineTo(x+3,b);}
  ctx.stroke();
  ctx.fillStyle='#241c10';ctx.fillRect(x+1,y-8,1.4,8);ctx.fillRect(x+w-2.4,y-8,1.4,8);ctx.fillRect(x+1,y-8,w-2,1);   // baranda
  ctx.fillRect(x+w-3,y-22,1,14);const fl=Math.sin(T/12)*1.5;ctx.fillStyle='#5a7a2a';
  ctx.beginPath();ctx.moveTo(x+w-2,y-22);ctx.lineTo(x+w+7,y-20+fl);ctx.lineTo(x+w-2,y-17);ctx.fill();
  ctx.fillStyle='#6b5634';ctx.fillRect(x-1,y,w+2,3.5);ctx.fillStyle='#9a8050';ctx.fillRect(x-1,y,w+2,0.9);
  ctx.fillStyle='#3a2c18';for(let i=6;i<w;i+=7)ctx.fillRect(x+i,y+0.9,0.7,2.6);
  ctx.fillStyle='#22180c';ctx.fillRect(x-1,y+3.5,w+2,1);
  M3_moss(x,y+4.5,w,x+5);
  ctx.fillStyle=(T>>4)%5?'#d8ff6a':'#5a7a2a';ctx.fillRect(x+3,y-6,1.5,1.5);      // farolito
}
// rama gruesa de un árbol muerto (se camina por arriba)
function M3_branch(pl){
  const x=pl.x,y=pl.y,w=pl.w,tx=x+w+2;
  ctx.fillStyle='#1d2416';ctx.beginPath();ctx.moveTo(tx-6,GROUND);ctx.quadraticCurveTo(tx-2,GROUND-8,tx-2,GROUND-20);ctx.lineTo(tx,y-28);
  ctx.lineTo(tx+5,y-28);ctx.lineTo(tx+6,GROUND-20);ctx.quadraticCurveTo(tx+6,GROUND-8,tx+12,GROUND);ctx.closePath();ctx.fill();
  ctx.fillStyle='#2e3a22';ctx.fillRect(tx-1,y-20,1,GROUND-y);
  ctx.strokeStyle='#1d2416';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(tx+2,y-26);ctx.lineTo(tx+10,y-40);ctx.moveTo(tx+3,y-14);ctx.lineTo(tx+14,y-22);ctx.stroke();
  ctx.fillStyle='#2a2a18';ctx.beginPath();ctx.moveTo(x-2,y+1);ctx.lineTo(tx+1,y-1);ctx.lineTo(tx+1,y+6);ctx.lineTo(x+4,y+4);ctx.closePath();ctx.fill();
  ctx.fillStyle='#5a5a32';ctx.fillRect(x-1,y,w+2,1.6);ctx.fillStyle='#7a9a3a';for(let i=2;i<w;i+=6)ctx.fillRect(x+i,y-0.6,2.5,1);
  M3_moss(x,y+3,w,x+9);
}
// tocón ancho (escalones de la arena final)
function M3_stump(pl){
  const x=pl.x,y=pl.y,w=pl.w;
  ctx.fillStyle='#2e2416';ctx.beginPath();ctx.moveTo(x-4,GROUND);ctx.quadraticCurveTo(x+1,GROUND-3,x+1,y+3);ctx.lineTo(x+w-1,y+3);ctx.quadraticCurveTo(x+w-1,GROUND-3,x+w+4,GROUND);ctx.closePath();ctx.fill();
  ctx.fillStyle='#3e3220';for(let i=4;i<w-2;i+=5)ctx.fillRect(x+i,y+5,1,GROUND-y-7);
  ctx.fillStyle='#8a7048';ctx.fillRect(x,y,w,3);ctx.strokeStyle='#5a4628';ctx.lineWidth=0.6;
  ctx.beginPath();ctx.ellipse(x+w/2,y+1.5,w*0.3,0.9,0,0,7);ctx.stroke();
  ctx.fillStyle='#b09a68';ctx.fillRect(x,y,w,0.7);ctx.fillStyle='#4f6a26';ctx.fillRect(x+2,y+3,4,1.5);ctx.fillRect(x+w-7,y+3,3,2);
}
// escalones de la pirámide
function M3_tier(pl){
  const x=pl.x,y=pl.y,w=pl.w,h=pl.pyr.dy,m=pl.mat;
  if(m==='log'){
    ctx.fillStyle='#1e160c';ctx.fillRect(x,y,w,h);
    for(let r=0;r<3;r++){const ly=y+r*8;ctx.fillStyle=r%2?'#4a3824':'#56422a';ctx.fillRect(x,ly,w,7.5);
      ctx.fillStyle='#2e2216';for(let i=3;i<w-6;i+=7)ctx.fillRect(x+i+(r*3)%5,ly+2+((i>>2)&1)*2,4,0.6);
      ctx.fillStyle='#9a7a4a';circle(x+3.5,ly+3.8,3.4);circle(x+w-3.5,ly+3.8,3.4);
      ctx.fillStyle='#6a5232';circle(x+3.5,ly+3.8,1.8);circle(x+w-3.5,ly+3.8,1.8);}
    ctx.fillStyle='#5f7a2a';for(let i=4;i<w-4;i+=9)ctx.fillRect(x+i,y,4,1);
  }else if(m==='drum'){
    ctx.fillStyle='#14140a';ctx.fillRect(x,y,w,h);
    for(let i=x+1,k=0;i<x+w-9;i+=11,k++){const c=k%3===1?'#4a5a2a':'#8a8a2a';ctx.fillStyle=c;ctx.fillRect(i,y+1,10,h-1);
      ctx.fillStyle='rgba(255,255,200,0.25)';ctx.fillRect(i,y+1,10,1);ctx.fillRect(i,y+h*0.5,10,1);
      ctx.fillStyle='rgba(0,0,0,0.35)';ctx.fillRect(i+8,y+1,2,h-1);
      ctx.fillStyle='#1a1a0a';ctx.beginPath();ctx.moveTo(i+5,y+6);ctx.quadraticCurveTo(i+7.5,y+10,i+5,y+11.5);ctx.quadraticCurveTo(i+2.5,y+10,i+5,y+6);ctx.fill();
      if(hash(i)>0.5){ctx.fillStyle='#9adf3a';ctx.fillRect(i+2,y+h*0.5+1,1,4+hash(i+1)*6);}}
    ctx.fillStyle='#6e6a24';ctx.fillRect(x,y,w,2);ctx.fillStyle='#c2b23a';ctx.fillRect(x,y,w,0.7);
  }else if(m==='sack'){
    ctx.fillStyle='#1e1e10';ctx.fillRect(x,y,w,h);
    for(let r=0;r<4;r++){const n=Math.floor(w/9);for(let i=0;i<n;i++){ctx.fillStyle=(i+r)%2?'#5e6034':'#7e7c48';ctx.beginPath();ctx.ellipse(x+4.5+i*9+(r%2)*2,y+3+r*6,4.8,3,0,0,7);ctx.fill();}}
    ctx.fillStyle='#4f6a26';for(let i=3;i<w;i+=13)ctx.fillRect(x+i,y+h-3,3,3);
  }else{ // tablones con musgo
    ctx.fillStyle='#4e3c22';ctx.fillRect(x,y,w,h);
    ctx.fillStyle='#33270f';for(let r=4;r<h;r+=4)ctx.fillRect(x,y+r,w,0.8);
    for(let r=0;r<h;r+=4){const o=(r*7)%19;for(let i=x+o;i<x+w-2;i+=19)ctx.fillRect(i,y+r,0.8,4);}
    ctx.fillStyle='#8a7048';ctx.fillRect(x,y,w,1.2);M3_moss(x,y+1.2,w,x*3);
  }
  ctx.fillStyle='rgba(0,0,0,0.3)';ctx.fillRect(x+w-3,y,3,h);
  ctx.fillStyle='rgba(0,0,0,0.35)';ctx.fillRect(x,y+h-1,w,1);
}
// canal de desagüe elevado: por arriba corre el líquido de la planta; por abajo se pasa a oscuras
function M3_canalBack(pl){
  const x=pl.x,y=pl.y,w=pl.w,iy=y+9,ih=GROUND-iy;
  const g=ctx.createLinearGradient(0,iy,0,GROUND);g.addColorStop(0,'rgba(6,12,8,0.94)');g.addColorStop(1,'rgba(20,40,20,0.82)');
  ctx.fillStyle=g;ctx.fillRect(x+3,iy,w-6,ih);
  ctx.fillStyle='rgba(150,230,60,0.10)';ctx.fillRect(x+3,GROUND-5,w-6,5);                 // charco que brilla abajo
  ctx.fillStyle='rgba(150,230,60,0.25)';ctx.fillRect(x+20,GROUND-1,30,1);ctx.fillRect(x+w-46,GROUND-1,22,1);
  ctx.fillStyle='#1e2a20';for(let i=10;i<w-10;i+=12)ctx.fillRect(x+i,iy,1,6+hash(i+x)*8);  // raíces que cuelgan del techo
  for(const px of [x+2,x+w/2-4,x+w-12]){ctx.fillStyle='#4a5848';ctx.fillRect(px,iy,10,ih);ctx.fillStyle='#6a7a66';ctx.fillRect(px,iy,2,ih);
    ctx.fillStyle='#303c30';ctx.fillRect(px+8,iy,2,ih);ctx.fillRect(px-1,iy,12,2);
    ctx.fillStyle='rgba(143,194,58,0.5)';ctx.fillRect(px+3,iy+2,1,ih*0.4);ctx.fillStyle='#3f5a22';ctx.fillRect(px,GROUND-5,10,5);}
  // pared de atrás del canal y el líquido (atrás del jugador que camina arriba)
  ctx.fillStyle='#4a5848';ctx.fillRect(x,y-6,w,2);ctx.fillStyle='#6a7a66';ctx.fillRect(x,y-6,w,0.7);
  ctx.fillStyle='#7fc23a';ctx.fillRect(x+1,y-4,w-2,4);
  ctx.fillStyle='#b8f060';for(let i=0;i<w;i+=9){const o=((T*0.4+i*3)%w);ctx.fillRect(x+1+o*0.98,y-3,3,0.7);}
  M3_slab(x,y,w);
}
function M3_slab(x,y,w){
  ctx.fillStyle='#5c6a5a';ctx.fillRect(x,y,w,9);
  ctx.fillStyle='#8a9a84';ctx.fillRect(x,y,w,1.2);
  ctx.fillStyle='#3a463a';ctx.fillRect(x,y+6.5,w,2.5);
  ctx.fillStyle='#46523f';for(let i=14;i<w;i+=26)ctx.fillRect(x+i,y+1.2,0.8,5.3);
  ctx.fillStyle='#8fc23a';for(let i=2;i<w;i+=7){const hh=hash(i+x*3);if(hh<0.4)continue;ctx.fillRect(x+i,y+1,1.2,1+hh*6);}   // rebalse verde
  ctx.fillStyle='rgba(30,40,20,0.5)';ctx.fillRect(x+30,y+3,10,2);ctx.fillRect(x+w-34,y+2,6,3);
}
M3_LVL.drawTunnelFront=function(t){
  if(t.k!=='canal')return false;
  const iy=t.y+9;
  ctx.fillStyle='rgba(4,14,6,0.32)';ctx.fillRect(t.x,iy,t.w,GROUND-iy);
  const g=ctx.createLinearGradient(0,iy,0,iy+12);g.addColorStop(0,'rgba(0,10,0,0.5)');g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g;ctx.fillRect(t.x,iy,t.w,12);
  // gotas verdes que caen del canal
  for(let i=0;i<5;i++){const dx=t.x+14+i*24+hash(i+7)*8,ph=(T+i*41)%70,yy=iy+ph*0.45;
    if(yy<GROUND-1){ctx.fillStyle='#a8e04a';ctx.fillRect(dx,yy,0.9,1.8);}
    else{ctx.fillStyle='rgba(168,224,74,0.5)';ctx.fillRect(dx-1.5,GROUND-1,4,0.8);}}
  M3_slab(t.x,t.y,t.w);
  return true;
};

// ================== coberturas propias ==================
M3_LVL.drawCover=function(c){
  if(c.vida<=0)return false;   // los escombros los dibuja mundo.js
  const x=c.x,w=c.w,top=c.top,h=c.h;
  switch(c.k){
  case 'logs':{ // troncos apilados, se ven las puntas
    const n=Math.round(h/4.8);
    for(let r=0;r<n;r++){const ly=GROUND-4.8*(r+1),ox=(r%2)*2;ctx.fillStyle=r%2?'#4a3824':'#56422a';ctx.fillRect(x+ox,ly,w-2,4.6);
      ctx.fillStyle='#2e2216';ctx.fillRect(x+ox+4,ly+2,w*0.4,0.6);ctx.fillStyle='#9a7a4a';circle(x+ox+w-2,ly+2.3,2.3);ctx.fillStyle='#6a5232';circle(x+ox+w-2,ly+2.3,1);}
    ctx.fillStyle='#5f7a2a';ctx.fillRect(x+3,top,6,1);break;}
  case 'drums':{
    for(let i=0;i<2;i++){const dx=x+i*(w/2),dw=w/2-1;ctx.fillStyle=i?'#4a5a2a':'#8a8a2a';ctx.fillRect(dx,top,dw,h);
      ctx.fillStyle='rgba(255,255,200,0.25)';ctx.fillRect(dx,top,dw,1);ctx.fillRect(dx,top+h*0.5,dw,1);ctx.fillStyle='rgba(0,0,0,0.35)';ctx.fillRect(dx+dw-2,top,2,h);
      ctx.fillStyle='#1a1a0a';ctx.beginPath();ctx.moveTo(dx+dw/2,top+3);ctx.quadraticCurveTo(dx+dw/2+2.5,top+7,dx+dw/2,top+8.5);ctx.quadraticCurveTo(dx+dw/2-2.5,top+7,dx+dw/2,top+3);ctx.fill();}
    ctx.fillStyle='#9adf3a';ctx.fillRect(x+3,top+h*0.5+1,1,h*0.4);break;}
  case 'sacks':{
    const rows=Math.round(h/4.6);
    for(let r=0;r<rows;r++){const n=Math.max(1,Math.floor((w-r*3)/8.5)),ox=x+(w-n*8.5)/2+4.25;
      for(let i=0;i<n;i++){ctx.fillStyle=(i+r)%2?'#5e6034':'#7e7c48';ctx.beginPath();ctx.ellipse(ox+i*8.5,GROUND-2.6-r*4.6,4.6,2.8,0,0,7);ctx.fill();}}
    ctx.fillStyle='#4f6a26';ctx.fillRect(x+2,GROUND-2,3,2);break;}
  default:return false;
  }
  if(c.vida<c.max*0.5){ctx.fillStyle='rgba(20,10,10,0.55)';ctx.fillRect(x+w*0.25,top+1,1,h*0.5);ctx.fillRect(x+w*0.7,top,2,2);}
  return true;
};
