'use strict';
// Óxido · Misión 8: Valle del Trueno (selva, charcos que tiemblan, garras que cazan de a dos y el gigante)
// Selva en capas, volcán lejano, cascadas, cuellos largos que pastan y ruinas tomadas por raíces.
// Prefijo M8_ en todo lo global.
// La acción que identifica la misión (el único guiño): el gigante se anuncia antes de aparecer. Temblores rítmicos
// que levantan polvo y piedritas, hacen caer hojas, espantan a los pájaros y mueven la cámara, cada vez más fuertes,
// hasta que asoma (los charcos son decoración: no marcan nada). A mitad de la misión cruza la selva: hay que meterse en
// el tronco hueco; el gigante PASA DE LARGO por encima (el tronco tiembla y suelta aserrín), sin pararse a olfatear.
// Al final vuelve como villano (PISATRUENO, ver jefes8.js). Las garras atacan POR TURNOS (una salta y la otra espera,
// con otro ritmo), sin repartirse "una distrae y la otra flanquea". Los cuellos largos del fondo son máquinas de pastar.

// ================== datos de la misión ==================
const M8_LVL={name:'MISIÓN 8 · VALLE DEL TRUENO',short:'8 · VALLE DEL TRUENO',theme:'selva',end:3380,music:'l8',
  platforms:[{x:240,y:128,w:54},{x:340,y:112,w:50},{x:470,y:124,w:60},{x:690,y:122,w:64},{x:810,y:102,w:56},{x:950,y:124,w:60},
    {x:1150,y:126,w:50},{x:1320,y:110,w:52},{x:1700,y:122,w:60},{x:1800,y:102,w:50},
    {x:2230,y:124,w:56},{x:2380,y:108,w:50},{x:2600,y:122,w:66},{x:2750,y:104,w:60},{x:2840,y:126,w:56},{x:2990,y:118,w:50},
    // altas: rama de un árbol gigante y la punta de un risco
    {x:856,y:62,w:42,hi:'arbol'},{x:1830,y:64,w:44,hi:'risco'},{x:2790,y:62,w:40,hi:'arbol'},
    // escalones de roca en la arena del villano (el lado derecho queda libre para el gigante)
    {x:3110,y:128,w:34,step:1},{x:3186,y:110,w:34,step:1}],
  // túnel: tronco caído gigante, hueco; el lomo es plataforma
  tunnels:[{x:1480,w:126,y:116,k:'tronco'}],
  // pirámide: escalones de un templo en ruinas tomado por raíces
  pyramids:[{x:1940,w:150,n:4,dy:24,inset:14,mats:['ruina','raiz','ruina','altar']}],
  covers:[{x:600,w:20,h:14,k:'piedra',hp:12},{x:1112,w:18,h:15,k:'tocon',hp:10},{x:1390,w:22,h:14,k:'piedra',hp:12},
    {x:1850,w:24,h:15,k:'raices',hp:8},{x:2186,w:18,h:15,k:'tocon',hp:10},{x:2500,w:22,h:14,k:'piedra',hp:12},
    {x:3030,w:24,h:15,k:'raices',hp:9},{x:3160,w:22,h:16,k:'piedra',hp:16}],
  crates:[{x:200,drop:'H'},{x:400,drop:'G'},{x:640,drop:'R'},{x:1010,drop:'E'},{x:1200,drop:'+'},{x:1420,drop:'F'},{x:1800,drop:'S'},
    {x:2300,drop:'G'},{x:2640,drop:'+'},{x:2975,drop:'R'},{x:3050,drop:'E'}],
  extraCrates:[{x:520,p:0.45},{x:870,y:62,p:0.7},{x:1848,y:64,p:0.6},{x:2804,y:62,p:0.6}],
  turrets:[1890,2720],mechs:[1740],
  prisoners:[{x:290,k:'ally'},{x:830,y:102,k:'item'},{x:1530,k:'item'},{x:1810,y:102,k:'ally'},{x:2010,y:60,k:'item'},
    {x:2330,k:'item'},{x:2770,y:104,k:'item'},{x:3010,k:'ally'}],
  extraPrisoners:[{x:1850,y:64,p:0.75,k:'ally'},{x:2580,p:0.4,k:'item'}],
  // charcos (k:'charco'): decoración (agua que refleja el cielo).
  decor:[{x:30,k:'helecho'},{x:120,k:'huesos'},{x:186,k:'helecho'},{x:300,k:'charco'},{x:430,k:'hongo'},{x:556,k:'nido'},
    {x:640,k:'charco'},{x:672,k:'helecho'},{x:780,k:'huesos'},{x:930,k:'hongo'},{x:990,k:'charco'},{x:1060,k:'helecho'},
    {x:1250,k:'charco'},{x:1296,k:'helecho'},{x:1418,k:'charco'},{x:1446,k:'hongo'},{x:1640,k:'charco'},{x:1668,k:'helecho'},
    {x:2120,k:'helecho'},{x:2200,k:'charco'},{x:2352,k:'hongo'},{x:2470,k:'nido'},{x:2690,k:'helecho'},{x:2930,k:'charco'},
    {x:2980,k:'helecho'},{x:3082,k:'charco'},{x:3236,k:'charco'},{x:3300,k:'helecho'}],
  events:[
    {at:20,spawn:[{t:'soldier',x:'R',d:70},{t:'soldier',x:'R',d:150}]},
    {at:110,spawn:[{t:'soldier',x:350,y:92}]},
    {at:240,spawn:[{t:'grenadier',x:'R'},{t:'garra',x:'R',d:50},{t:'garra',x:'L',d:80}]},
    {at:400,spawn:[{t:'soldier',x:'R'},{t:'drone',x:'R',d:70},{t:'soldier',x:'L',d:40}]},
    {at:560,spawn:[{t:'soldier',x:830,y:82},{t:'drone',x:'R',d:30}]},
    {at:700,spawn:[{t:'shield',x:'R'},{t:'garra',x:'R',d:60},{t:'garra',x:'L',d:90}]},
    {at:880,spawn:[{t:'grenadier',x:'R'},{t:'soldier',x:'R',d:50}]},
    {at:1180,spawn:[{t:'soldier',x:'R'},{t:'soldier',x:1340,y:92,d:20}]},
    // 1240–1640: el gigante cruza (M8_pasoUpd). En ese tramo no aparece nadie nuevo.
    {at:1640,spawn:[{t:'garra',x:'R'},{t:'garra',x:'L',d:40},{t:'drone',x:'R',d:90}]},
    {at:1820,spawn:[{t:'drone',x:'R'},{t:'soldier',x:2000,y:42,d:20},{t:'garra',x:'R',d:50},{t:'shield',x:'R',d:120}]},
    {at:2260,spawn:[{t:'garra',x:'R'},{t:'soldier',x:2620,y:104},{t:'shield',x:'R',d:30}]},
    {at:2380,spawn:[{t:'soldier',x:2780,y:86},{t:'soldier',x:'R',d:20},{t:'drone',x:'R',d:80}]},
    // cofre blindado entre los nidos: al acercarte viene una oleada grande
    {at:2440,spawn:[{t:'shield',x:'R'},{t:'soldier',x:'L',d:30},{t:'grenadier',x:'R',d:60},{t:'drone',x:'L',d:90},{t:'garra',x:'R',d:110},{t:'garra',x:'L',d:130},{t:'soldier',x:'R',d:170}]},
    {at:2620,spawn:[{t:'soldier',x:'R'},{t:'grenadier',x:'L',d:80}]},
    {at:2700,spawn:[{t:'drone',x:'R'},{t:'garra',x:'R',d:30},{t:'garra',x:'L',d:70}]},
    {at:2840,spawn:[{t:'shield',x:'R'},{t:'grenadier',x:'R',d:40},{t:'soldier',x:'R',d:90}]},
    {at:2960,spawn:[{t:'drone',x:'R'},{t:'soldier',x:'R',d:30},{t:'garra',x:'R',d:70},{t:'garra',x:'L',d:100}]}],
  arenas:[
    // jefe chico a un tercio; después juego normal y una emboscada; el villano al final (nunca seguidos)
    {at:1100,mini:true},
    {at:2160,waves:[
      [{t:'soldier',x:'R'},{t:'garra',x:'R',d:30},{t:'garra',x:'L',d:60}],
      [{t:'drone',x:'R'},{t:'grenadier',x:'R',d:40},{t:'soldier',x:'L',d:70}],
      [{t:'shield',x:'R'},{t:'garra',x:'L',d:30},{t:'garra',x:'R',d:50},{t:'drone',x:'R',d:110}]]},
    {at:3060,boss:true}],
  vaults:[{x:2560}]};
// niveles.js ya agregó techos y escalones de las misiones viejas antes de que cargue este archivo: acá van los de la 8
for(const t of M8_LVL.tunnels)M8_LVL.platforms.push({x:t.x,y:t.y,w:t.w,roof:t});
for(const p of M8_LVL.pyramids)for(let i=0;i<p.n;i++)
  M8_LVL.platforms.push({x:p.x+i*p.inset,y:GROUND-(i+1)*p.dy,w:p.w-2*i*p.inset,pyr:p,tier:i,mat:p.mats[i%p.mats.length]});
M8_LVL.events.sort((a,b)=>a.at-b.at);
// la garra cuesta como un dron al sortear tipos (ver variarPartida)
NV_COSTO.garra=1.3;
COB_COL.piedra=['#4a5444','#6a7a5a'];COB_COL.tocon=['#5a3a22','#8a6040'];COB_COL.raices=['#4a3220','#6a4a2c'];
if(typeof KILL_NAMES!=='undefined')KILL_NAMES.push(['garra','garras']);

// ================== utilidades y paleta ==================
const M8_sfx=(n,...a)=>{if(typeof SFX!=='undefined'&&SFX[n])SFX[n](...a);};
const M8_C={musgo:'#4a7a2a',musgoC:'#7aa83a',musgoO:'#2a4a1a',hoja:'#2e5a2a',tierra:'#2a1e14',corteza:'#5a3a22',cortezaC:'#8a6040',
  piedra:'#5a6252',piedraC:'#8a9478',piedraO:'#465044',agua:'#2e5258', /* más claros a la altura del cuerpo (contraste, Dirección de Arte) */aguaC:'#9ad0c8',pluma:'#ff6a2a',plumaC:'#ffc040',
  garra:'#54406a',garraO:'#3a2a4c',panza:'#c9b48e',ojo:'#ffe04a'};
const M8_TUN=M8_LVL.tunnels[0];
function M8_pc(p){p=p||P;return p.ride?{x:p.ride.x+p.ride.w/2,y:p.ride.y+p.ride.h/2}:{x:p.x+4,y:p.y+9};}
// ¿el jugador está adentro del tronco hueco? (todo el cuerpo debajo del lomo)
function M8_oculto(p){const t=M8_TUN,hb=hurtbox(p);return hb.x>=t.x+3&&hb.x+hb.w<=t.x+t.w-3&&hb.y>=t.y+8;}
const M8_SOLDADOS={soldier:1,grenadier:1,shield:1};

// estado que se reinicia en cada partida
const M8={ev:null,th:[],trem:0,alert:0,birds:[],pre:0,preT:0,paso:{st:'off',t:0,hit:false,g:null},gHint:false,
  nidos:new Map()};
function M8_reset(){
  Object.assign(M8,{ev:levelEvents,th:[],trem:0,alert:0,birds:[],pre:0,preT:0,paso:{st:'off',t:0,hit:false,g:null},gHint:false,nidos:new Map()});
}
ON_START.push(()=>{if(L===M8_LVL)M8_reset();});

// ================== TEMBLOR: la pisada que se siente antes de ver ==================
// Cada pisada queda anotada (M8.th). k va de 0 (lejos) a 1 (al lado).
function M8_thump(k){
  k=clamp(k,0.05,1);
  M8.th.push({t:T,k});if(M8.th.length>8)M8.th.shift();
  M8.trem=Math.max(M8.trem,k);if(k>0.3)M8.alert=Math.max(M8.alert,1);
  shake=Math.max(shake,0.5+k*3.2);
  M8_sfx('m8paso',k);
  // polvo que se levanta del piso con cada pisada (el aviso se ve en el polvo, las hojas, los pájaros y la cámara)
  for(let i=0;i<Math.round(1+k*4);i++)parts.push({k:'smoke',col:'150,140,110',x:camX+rand(4,W-4),y:GROUND-1,vx:rand(-0.3,0.3),vy:-rand(0.1,0.4),life:rand(20,34),maxl:34,size:rand(1.5,2.5+k*2)});
  // piedritas que saltan del piso
  const n=Math.round(2+k*7);
  for(let i=0;i<n;i++)parts.push({k:'p',x:camX+rand(4,W-4),y:GROUND-1,vx:rand(-0.3,0.3),vy:-rand(0.6,1.1+k*1.6),g:0.16,life:rand(16,26),maxl:26,size:Math.random()<0.3?1.5:1,col:i%2?'#6a6a58':'#4a4034'});
  // hojas que caen de arriba
  if(k>0.4)for(let i=0;i<Math.round(k*4);i++)parts.push({k:'p',x:camX+rand(0,W),y:rand(-4,6),vx:rand(-0.35,0.35),vy:rand(0.25,0.5),g:0.002,life:rand(110,150),maxl:150,size:1.5,col:pick(['#4a7a2a','#6a9a3a','#3a5a22'])});
  // aserrín que cae del lomo del tronco hueco
  const t=M8_TUN;if(k>0.3&&t.x<camX+VW&&t.x+t.w>camX)for(let i=0;i<Math.round(k*5);i++)parts.push({k:'p',x:t.x+rand(6,t.w-6),y:t.y+10,vx:0,vy:rand(0.2,0.5),g:0.05,life:rand(28,40),maxl:40,size:1,col:'#8a6a44'});
  // pájaros que salen volando
  if(k>0.2&&M8.birds.length<14)M8_bandada(k);
}
// bandada: salen de la copa de los árboles y se van (en pantalla, sin cámara)
function M8_bandada(k){
  const x0=rand(30,290),y0=rand(58,84),dir=Math.random()<0.5?-1:1,n=3+Math.round(k*4);
  for(let i=0;i<n;i++)M8.birds.push({x:x0+rand(-14,14),y:y0+rand(-6,6),vx:dir*rand(0.7,1.3),vy:-rand(0.6,1.1),f:rand(0,6),s:Math.random()<0.3?1.4:1});
  M8_sfx('m8pajaros');
}
function M8_birdsUpd(){
  for(const b of M8.birds){b.x+=b.vx;b.y+=b.vy;b.vy*=0.992;b.f+=0.45;}
  M8.birds=M8.birds.filter(b=>b.y>-10&&b.x>-12&&b.x<W+12);
}

// ================== EL PASO DEL GIGANTE (mitad de la misión) ==================
// 8 s de temblores que crecen (charcos, helechos, piedritas, pájaros, cámara), aviso de esconderse y el cruce.
// El gigante entra por la derecha caminando hacia la izquierda y PASA DE LARGO por encima del tronco (que tiembla y
// suelta aserrín), sin pararse. Adentro del tronco no te ve. Afuera, su cuerpo y su cabeza pegan (1 golpe y te empuja).
const M8_PRE_AT=560,M8_PASO_AT=1240;
const M8_GOLPES=[[0,0.14],[80,0.22],[150,0.3],[215,0.4],[272,0.5],[324,0.6],[372,0.7],[414,0.8],[452,0.9]];
function M8_mkGig(x){return{x,face:-1,anim:0,st:'walk',t:0,head:0,jaw:0,lift:0,bite:0,biteU:0,biteY:0,eyeRed:0,plates:1,flash:0,sniffed:false,step:0,tilt:0,sink:0,steam:0};}
// geometría del gigante (adelante = +u). La usan el dibujo y las cajas de golpe.
function M8_gigHead(g){
  let u,y;
  if(g.head>=0){u=52+g.head*10;y=GROUND-74+g.head*62;}else{u=52+g.head*14;y=GROUND-74+g.head*30;}
  if(g.bite>0){u+=g.bite*g.biteU;y+=(g.biteY-y)*Math.min(1,g.bite*3);}
  return{u,y,x:g.x+g.face*u};
}
function M8_gigCajas(g){
  const h=M8_gigHead(g);
  return[{x:g.x-44,y:GROUND-74,w:88,h:74},{x:h.x-13,y:h.y-7,w:26,h:14}];
}
function M8_aplasta(e){
  e.gone=true;dust(e.x+e.w/2,GROUND,6);
  if(M8_SOLDADOS[e.type])corpse(e.type==='grenadier'?SPR.g:e.type==='shield'?SPR.sh:SPR.e,e.x,e.y,e.face,{vx:rand(-1.5,1.5),vy:-3.6,vr:0.25});
  else for(let i=0;i<8;i++)parts.push({k:'p',x:e.x+e.w/2,y:e.y+e.h/2,vx:rand(-1.4,1.4),vy:rand(-2.4,-0.6),g:0.12,life:rand(20,34),maxl:34,size:1.5,col:i%2?M8_C.pluma:M8_C.garra});
}
// pisada: polvo bajo el pie y aplasta a los enemigos de a pie que estén debajo
function M8_pisada(g){
  const u=g.step++%2?30:-14,x=g.x+g.face*u;
  dust(x,GROUND,7);
  for(const e of enemies){if(e.gone||isBoss(e)||e.type==='turret'||e.type==='drone')continue;
    if(e.y+e.h>GROUND-34&&e.x+e.w>g.x-44&&e.x<g.x+44)M8_aplasta(e);}
}
function M8_resoplido(g){
  const h=M8_gigHead(g);M8_sfx('m8resopla');
  for(let i=0;i<7;i++)parts.push({k:'smoke',col:'200,210,190',x:h.x+g.face*12,y:h.y+3,vx:g.face*rand(0.4,1.2),vy:rand(-0.2,0.1),life:rand(18,30),maxl:30,size:rand(1.5,2.5)});
  for(let i=0;i<3;i++)parts.push({k:'p',x:h.x+g.face*14,y:GROUND-2,vx:g.face*rand(0.8,1.6),vy:-rand(0.4,1),g:0.04,life:40,maxl:40,size:1.5,col:pick(['#4a7a2a','#8a6a44'])});
}
function M8_gigWalk(g,sp,kPaso){
  g.x+=g.face*sp;g.anim++;
  if(g.anim%34===0){M8_thump(kPaso);M8_pisada(g);}
}
function M8_empuja(p,g){
  const dir=(p.ride?p.ride.x+11:p.x+4)<g.x?-1:1;
  if(p.ride){p.ride.x=clamp(p.ride.x+dir*16,camX+2,camX+VW-(p.ride.w||22)-2);return;} // el ancho de cada vehículo (RESORTE mide 40)
  p.x=clamp(p.x+dir*18,camX+2,camX+VW-10);if(p.onGround){p.vy=-2.2;p.onGround=false;p.plat=null;}
}
// golpe del gigante a los jugadores que no estén escondidos. Devuelve true si le pegó a alguno.
function M8_gigDanio(g,extra){
  const cajas=extra?[...M8_gigCajas(g),...extra]:M8_gigCajas(g);let pego=false;
  for(const p of players){if(p.dead||M8_oculto(p))continue;const hb=hurtbox(p);
    if(!cajas.some(r=>overlap(hb,r)))continue;
    withP(p,()=>{const o=p.ride||p,i0=o.inv;hurtPlayer(1);if((p.ride||p).inv>i0){pego=true;M8_empuja(p,g);}});}
  return pego;
}
function M8_gigUpd(g,s){
  g.t++;if(g.flash>0)g.flash--;
  if(g.st==='walk'){
    M8_gigWalk(g,1.15,1);g.head+=(0-g.head)*0.08;g.jaw*=0.9;
    // pasa por encima del tronco: tiembla y suelta aserrín (no se para)
    const t=M8_TUN;if(g.x<t.x+t.w+30&&g.x>t.x-60){if(g.t%10===0){shake=Math.max(shake,1.6);for(let i=0;i<4;i++)parts.push({k:'p',x:t.x+rand(6,t.w-6),y:t.y+10,vx:rand(-0.2,0.2),vy:rand(0.2,0.6),g:0.06,life:rand(26,40),maxl:40,size:1,col:'#8a6a44'});}}
    if(!g.sniffed&&g.x<t.x-60)g.sniffed=true; // ya pasó (el nombre quedó del gesto viejo)
  }else if(g.st==='sniff'){
    g.head=g.t<84?Math.min(1,g.head+0.035):Math.max(0,g.head-0.06);
    if(g.t%28===14&&g.t<84)M8_resoplido(g);
    if(g.t>=112){g.st='roar';g.t=0;M8_sfx('m8rugido');shake=Math.max(shake,5);M8.alert=1;}
  }else if(g.st==='roar'){
    g.jaw=Math.min(1,g.jaw+0.12);g.head=Math.max(-0.45,g.head-0.06);
    if(g.t%6===0)parts.push({k:'smoke',col:'220,220,210',x:M8_gigHead(g).x+g.face*14,y:M8_gigHead(g).y+2,vx:g.face*rand(0.6,1.4),vy:rand(-0.3,0.1),life:22,maxl:22,size:2});
    if(g.t>=58){g.st='walk';g.t=0;}
  }
  if(M8_gigDanio(g))s.hit=true;
}
function M8_pasoUpd(){
  const s=M8.paso;
  if(s.st==='off'){if(!lock&&camX>=M8_PASO_AT){s.st='temblor';s.t=0;}return;}
  if(s.st==='done')return;
  s.t++;
  if(s.st==='temblor'){
    for(const [f,k] of M8_GOLPES)if(s.t===f+1)M8_thump(k);
    if(s.t===120)setBanner('¡ALGO GRANDE SE ACERCA!',100);
    if(s.t===240)setBanner('¡ESCONDETE EN EL TRONCO!',150);
    if(s.t>=490){s.st='cruce';s.t=0;s.g=M8_mkGig(camX+VW+82);}
  }else if(s.st==='cruce'){
    M8_gigUpd(s.g,s);
    if(s.g.x<camX-125){s.st='aleja';s.t=0;}
  }else if(s.st==='aleja'){
    if(s.t===30)M8_thump(0.55);if(s.t===80)M8_thump(0.35);if(s.t===130)M8_thump(0.16);
    if(s.t===40){if(!s.hit){toast('¡NO TE VIO!','+1000 por esconderte','#c8e070');addScore(1000,camX+VW/2,70);}else setBanner('SE ALEJA…',90);}
    if(s.t>=160)s.st='done';
  }
}
// aviso: flechas sobre la entrada del tronco mientras hay que esconderse
ON_DRAW.push(()=>{
  if(L!==M8_LVL)return;const s=M8.paso;
  const show=(s.st==='temblor'&&s.t>=240)||(s.st==='cruce'&&!s.g.sniffed);
  if(!show)return;const t=M8_TUN;if(t.x+t.w<camX||t.x>camX+VW)return;
  const on=(T>>3)%2,bob=Math.sin(T/6)*1.5;
  for(const ax of [t.x+16,t.x+t.w-16]){const y=t.y-14+bob;
    ctx.fillStyle='#120c18';ctx.beginPath();ctx.moveTo(ax-5,y-1);ctx.lineTo(ax+5,y-1);ctx.lineTo(ax,y+6);ctx.closePath();ctx.fill();
    ctx.fillStyle=on?'#fff3c0':'#c8e070';ctx.beginPath();ctx.moveTo(ax-3.5,y);ctx.lineTo(ax+3.5,y);ctx.lineTo(ax,y+4.5);ctx.closePath();ctx.fill();
    ctx.fillRect(ax-1,y-5,2,5);}
  // adentro se ilumina apenas: ahí estás a salvo
  ctx.fillStyle=`rgba(200,224,112,${on?0.10:0.05})`;ctx.fillRect(t.x+4,t.y+10,t.w-8,GROUND-t.y-10);
});

// ================== GARRAS: cazadoras que se turnan ==================
// Plumas violeta oscuro, cresta y cola naranja. De a dos se TURNAN: la que tiene el turno se acerca, se AGAZAPA (cresta
// que titila, cola arriba) y SALTA a donde estabas al terminar el aviso; la otra espera más lejos, de su mismo lado,
// con otro ritmo, y después le toca a ella. No se reparten papeles (nada de "una distrae y la otra flanquea") ni te
// rodean por la espalda. Mueren con 3 tiros. Una sola, sin pareja, ataca por su cuenta.
function M8_mkGarra(x,y){
  const fromL=Math.abs(x-(camX-20))<0.5;
  const yy=y===undefined?GROUND-12:Math.min(GROUND-12,y+6);
  const e={type:'garra',x,y:yy,w:14,h:12,vx:0,vy:0,hp:3,face:fromL?1:-1,flash:0,score:250,cd:rand(60,100),ccd:rand(80,140),
    st:'corre',t:0,anim:rand(0,99),onGround:false,plat:null,crouch:0,head:0,mouth:0,partner:null,role:'solo',hitD:false,spd:rand(1.45,1.65),
    upd:M8_updGarra,draw:M8_drawGarra,onKill:M8_killGarra};
  const p=enemies.find(o=>o.type==='garra'&&!o.gone&&!o.partner);
  // de a dos entran por el MISMO lado, una detrás de la otra: la segunda espera afuera de la pantalla hasta que la
  // primera saltó y volvió (Investigación, revisión de la 2ª ronda: nada de una a cada lado, que se lee como pinza)
  if(p){p.partner=e;e.partner=p;p.role='turno';e.role='espera';e.dormida=true;e.cd=rand(70,100);
    const der=p.x>camX+VW/2;e.x=der?Math.max(e.x,camX+VW+20):Math.min(e.x,camX-34);e.face=der?-1:1;}
  return e;
}
ENEMY_MAKERS.garra=M8_mkGarra;
function M8_turnoFin(e){
  const o=e.partner;
  if(o&&!o.gone){e.role='espera';o.role='turno';o.cd=rand(80,130)*DIFF().fire;} // le toca a la otra, con su ritmo
  else{e.role='solo';e.cd=rand(90,140)*DIFF().fire;}
}
function M8_updGarra(e){
  if(e.dormida){const o=e.partner;if(!o||o.gone||((o.saltos||0)>0&&o.st==='corre')){e.dormida=false;e.role=o&&!o.gone?'turno':'solo';if(o&&!o.gone)o.role='espera';}
    else{e.vx=0;e.vy=0;return;}}
  if(e.flash>0)e.flash--;e.anim++;
  if(e.partner&&e.partner.gone){e.partner=null;e.role='solo';if(e.cd>200)e.cd=rand(60,100);}
  const pc=P.dead?null:M8_pc(),ex=e.x+e.w/2,dx=pc?pc.x-ex:0,ad=Math.abs(dx);
  const pfy=P.ride?P.ride.y+P.ride.h:P.y+P.h,efy=e.y+e.h,wasAir=!e.onGround;
  const g=e.st==='salta'?0.22:0.3;
  switch(e.st){
  case 'corre':{
    e.crouch*=0.8;e.head*=0.85;e.mouth*=0.8;
    if(!pc){e.vx*=0.8;break;}
    if(e.onGround)e.face=dx<0?-1:1;
    // cada una se queda de su lado; la que espera, más lejos
    const mine=Math.sign(ex-pc.x)||1,side=mine;
    const want=e.role==='espera'?84:56;
    const tx=clamp(pc.x+side*want,camX+12,camX+VW-12);
    const d=tx-ex,sp=e.spd*(Math.abs(d)<10?0.3:1);
    e.vx+=(clamp(d*0.08,-sp,sp)-e.vx)*0.25;
    if(!onScreen(e,-8)){e.vx=e.x<camX?Math.max(e.vx,1.4):Math.min(e.vx,-1.4);break;}
    // la que espera, de vez en cuando chilla en su lugar (no amaga ni se mete)
    if(e.role==='espera'&&--e.ccd<=0&&e.onGround&&ad<140){e.st='chilla';e.t=30;M8_sfx('m8chillido');break;}
    // la del turno se agazapa
    const reach=efy-pfy<56;
    if(e.role!=='espera'&&e.onGround&&ad<130&&reach&&--e.cd<=0){e.st='agazapa';e.t=34;e.vx=0;M8_sfx('m8agazape');}
    break;}
  case 'chilla':
    e.vx*=0.7;e.head=Math.min(1,e.head+0.15);e.mouth=e.t>8?1:e.mouth*0.7;if(pc)e.face=dx<0?-1:1;
    if(--e.t<=0){e.st='corre';e.ccd=rand(90,150);}
    break;
  case 'agazapa':
    e.vx=0;e.crouch=Math.min(1,e.crouch+0.12);e.head=0;if(pc)e.face=dx<0?-1:1;
    if(e.t===12)M8_sfx('m8agazape');
    if(--e.t<=0&&pc){
      // salta a donde estaba el jugador al terminar el aviso
      const under=o=>o>M8_TUN.x-6&&o<M8_TUN.x+M8_TUN.w+6;
      let vy=-3.7;const dh=efy-pfy;
      if(dh>8)vy=-Math.min(5.4,Math.sqrt(2*0.22*(dh+12)));
      if(under(pc.x)||under(ex))vy=-2.3;
      const n=Math.max(16,2*Math.abs(vy)/0.22);
      e.saltos=(e.saltos||0)+1;e.vx=clamp(dx/n,-3.2,3.2);e.vy=vy;e.st='salta';e.hitD=false;e.onGround=false;e.plat=null;e.crouch=0;M8_sfx('m8salto');
    }else if(!pc&&e.t<=0){e.st='corre';}
    break;
  case 'salta':case 'rodeo':
    if(e.st==='salta'&&!e.hitD){const box={x:e.x+1,y:e.y,w:e.w-2,h:e.h};
      for(const p of players)if(!p.dead&&overlap(hurtbox(p),box)){withP(p,()=>hurtPlayer(1));e.hitD=true;M8_sfx('m8mordida');break;}}
    break;
  case 'rec':
    e.vx*=0.75;e.crouch=Math.max(0,e.crouch-0.05);
    if(--e.t<=0){e.st='corre';M8_turnoFin(e);}
    break;
  }
  if(e.kbx){e.x+=e.kbx*0.5;e.kbx*=0.5;if(Math.abs(e.kbx)<0.15)e.kbx=0;}
  e.x+=e.vx*(L.speedMul?L.speedMul(e):1);
  const pb=e.y+e.h;e.vy=Math.min(e.vy+g,6);e.y+=e.vy;land(e,pb,true);
  if(wasAir&&e.onGround){
    if(e.st==='salta'){e.st='rec';e.t=36;e.vx*=0.3;e.crouch=0.6;dust(e.x+7,e.y+e.h,4);}
    else if(e.st==='rodeo'){e.st='corre';e.cd=Math.max(e.cd,30);dust(e.x+7,e.y+e.h,2);}
  }
  if(e.plat&&e.st==='corre'){/* camina hasta el borde y cae solo */}
  if(e.x<camX-60||e.x>camX+VW+80&&e.st!=='corre')e.gone=true;
}
function M8_killGarra(e){
  M8_sfx('m8chillido');
  for(let i=0;i<14;i++)parts.push({k:'p',x:e.x+rand(1,13),y:e.y+rand(0,10),vx:rand(-1.4,1.4),vy:rand(-2.4,-0.4),g:0.06,life:rand(26,44),maxl:44,size:i%4?1:1.5,col:pick([M8_C.pluma,M8_C.plumaC,M8_C.garra,M8_C.garraO])});
  parts.push({k:'smoke',col:'90,70,110',x:e.x+7,y:e.y+6,vx:0,vy:-0.3,life:24,maxl:24,size:3});
  SFX.down();
  if(Math.random()<0.12)pickups.push({kind:pick(['H','S','F','R','G','E','+']),x:e.x,y:e.y-4,w:10,h:10,vy:-2.5,life:700});
}
// dibujo (mirando a +x; el origen es el medio de las patas, en el piso)
function M8_drawGarra(e){
  const fl=e.flash>0,C=c=>fl?'#fff':c,air=e.st==='salta'||e.st==='rodeo',tele=e.st==='agazapa';
  const run=e.onGround&&Math.abs(e.vx)>0.25?e.anim/3:0,cr=e.crouch;
  const sy=e.onGround?e.y+e.h:(e.y+e.h<=GROUND?GROUND:e.y+e.h);
  ctx.fillStyle='rgba(10,22,10,0.35)';ctx.beginPath();ctx.ellipse(e.x+7,sy,6,1,0,0,7);ctx.fill();
  ctx.save();ctx.translate(q(e.x+7),q(e.y+e.h));if(e.face<0)ctx.scale(-1,1);
  const bob=run?-Math.abs(Math.sin(run))*0.8:Math.sin((T+e.anim)/14)*0.3;
  const by=-7.5+cr*2.6+bob,tilt=air?-0.22:tele?0.12:0;
  // patas (la de atrás más oscura)
  const leg=(ph,col)=>{
    const s=run?Math.sin(run+ph)*3.2:0,lift=run?Math.max(0,Math.cos(run+ph))*1.6:0;
    ctx.strokeStyle=C(col);ctx.lineWidth=1.5;ctx.lineCap='round';ctx.beginPath();
    if(air){ctx.moveTo(-1,by+2);ctx.lineTo(2+ph*0.3,by+4.5);ctx.lineTo(4.5+ph*0.4,by+6.5);}
    else{ctx.moveTo(-1,by+2);ctx.lineTo(1.6+s*0.4,by+4.6-cr*0.4);ctx.lineTo(-0.6+s,-lift-0.6);}
    ctx.stroke();ctx.lineCap='butt';
    const fx=air?4.5+ph*0.4:-0.6+s,fy=air?by+6.5:-lift-0.6;
    ctx.fillStyle=C('#2a1e30');ctx.fillRect(fx-1,fy-0.4,3.4,1);ctx.fillStyle=C('#efe6d0');ctx.fillRect(fx+0.6,fy-1.6,0.8,1.2);};
  leg(Math.PI,M8_C.garraO);
  ctx.save();ctx.translate(0,by);ctx.rotate(tilt);
  // cola: abanico de plumas con punta naranja (sube cuando se agazapa)
  const tu=tele?-2.5:air?-1:Math.sin((T+e.anim)/10)*0.6;
  ctx.fillStyle=C(M8_C.garraO);ctx.beginPath();ctx.moveTo(-3,-1.5);ctx.lineTo(-12,-2.5+tu);ctx.lineTo(-13,-0.5+tu);ctx.lineTo(-3,1.5);ctx.fill();
  ctx.fillStyle=C(M8_C.pluma);ctx.beginPath();ctx.moveTo(-10,-3.2+tu);ctx.lineTo(-15,-2.6+tu);ctx.lineTo(-15.5,0+tu);ctx.lineTo(-11,0.4+tu);ctx.fill();
  ctx.fillStyle=C(M8_C.plumaC);ctx.fillRect(-15.5,-2+tu,1.4,1);ctx.fillRect(-15,-0.6+tu,1.2,0.8);
  // cuerpo
  ctx.fillStyle=C(M8_C.garra);ctx.beginPath();ctx.ellipse(0,0,6,3.4,0,0,7);ctx.fill();
  ctx.fillStyle=C(M8_C.garraO);ctx.beginPath();ctx.ellipse(-0.5,-1.4,5.4,1.8,0,0,7);ctx.fill();
  ctx.fillStyle=C(M8_C.panza);ctx.beginPath();ctx.ellipse(1,1.8,4.2,1.3,0,0,7);ctx.fill();
  if(!fl){ctx.fillStyle='#8f7aa8';ctx.fillRect(-3,-2.2,1,0.8);ctx.fillRect(-0.5,-2.6,1,0.8);ctx.fillRect(2,-2,1,0.8);}
  // bracito con plumas
  ctx.fillStyle=C(M8_C.pluma);ctx.fillRect(2.5,0.4,2.6,1.1);ctx.fillStyle=C('#efe6d0');ctx.fillRect(air?5.4:4.8,air?0.6:1.4,0.8,0.9);
  // cuello y cabeza (se levanta para chillar)
  const hu=e.head;ctx.save();ctx.translate(4.5,-1.5);ctx.rotate(-0.5-hu*0.55+(tele?0.45:0));
  ctx.fillStyle=C(M8_C.garra);ctx.fillRect(0,-1.2,4,2.4);
  ctx.translate(4,0);ctx.rotate(0.5+hu*0.2-(tele?0.35:0));
  ctx.fillStyle=C(M8_C.garra);ctx.beginPath();ctx.moveTo(-1.2,-1.8);ctx.lineTo(4.8,-0.9);ctx.lineTo(5.2,0.2);ctx.lineTo(-1,1.4);ctx.fill();
  // mandíbula (se abre al chillar)
  ctx.fillStyle=C(M8_C.garraO);ctx.save();ctx.translate(-0.6,0.6);ctx.rotate(e.mouth*0.45);ctx.fillRect(0,0,5,0.9);ctx.restore();
  if(e.mouth>0.3){ctx.fillStyle='#e85a4a';ctx.fillRect(0.4,0.4,3.2,0.6);}
  // ojo
  ctx.fillStyle=tele?((T>>1)%2?'#fff':'#ff5a2a'):M8_C.ojo;ctx.fillRect(1,-1.1,1.1,0.9);
  // cresta de plumas: se paran y titilan en el aviso
  const up=tele||e.st==='chilla'?1:0.35;
  for(let i=0;i<3;i++){ctx.fillStyle=C(tele&&(T>>1)%2?'#fff3c0':i%2?M8_C.plumaC:M8_C.pluma);
    ctx.beginPath();ctx.moveTo(-1-i*1.2,-1.4);ctx.lineTo(-2.6-i*1.4,-1.6-up*(2.6-i*0.4));ctx.lineTo(-0.4-i*1.2,-1.6);ctx.fill();}
  ctx.restore();
  ctx.restore();
  leg(0,M8_C.garra);
  ctx.restore();
  // chillido: arcos que salen de la boca · agazapada: chispitas de aviso sobre la cabeza
  if(e.st==='chilla'&&e.t>8){const hx=e.x+7+e.face*10,hy=e.y+e.h-15;ctx.strokeStyle=`rgba(255,200,120,${0.6})`;ctx.lineWidth=0.6;
    for(let i=0;i<2;i++){const r=3+((44-e.t)*0.5+i*5)%10;ctx.beginPath();ctx.arc(hx,hy,r,e.face>0?-0.8:Math.PI-0.8,e.face>0?0.8:Math.PI+0.8);ctx.stroke();}}
  if(tele&&(T>>2)%2){const hx=e.x+7+e.face*7,hy=e.y-2;ctx.fillStyle='#ffe08a';ctx.fillRect(hx-3,hy-1,1,2);ctx.fillRect(hx,hy-3,1,2.5);ctx.fillRect(hx+3,hy-1,1,2);}
}

// ================== EL GIGANTE (lo usa también el villano, ver jefes8.js) ==================
// Diseño propio: semicuadrúpedo encorvado que camina sobre los nudillos de unos brazos largos, cuero musgoso,
// placas de óxido remachadas en el lomo, dos caños de escape, un solo ojo, mandíbula de hierro con pistón y
// una maza de chatarra en la punta de la cola.
const M8_G={piel:'#3c4a2c',pielC:'#566a38',pielO:'#252e1a',panza:'#7a7650',oxi:'#9c4a22',oxiC:'#d8742a',oxiO:'#5a2814',
  fe:'#5a5e66',feC:'#9aa0a8',feO:'#2a2c32',ojo:'#e8ff5a'};
function M8_drawGigante(g){
  const fl=g.flash>0,C=c=>fl?'#fff':c,h=M8_gigHead(g);
  const ph=g.anim/34*Math.PI,walking=g.st==='walk'||g.st==='shuffle';
  const sw=walking?Math.sin(ph)*7:0,lf=walking?Math.max(0,Math.cos(ph))*3:0,lb=walking?Math.max(0,-Math.cos(ph))*3:0;
  // sombra
  ctx.fillStyle='rgba(10,18,8,0.4)';ctx.beginPath();ctx.ellipse(g.x-g.face*6,GROUND,78,3.4,0,0,7);ctx.fill();
  ctx.save();ctx.translate(q(g.x),GROUND+g.sink);if(g.face<0)ctx.scale(-1,1);
  if(g.tilt)ctx.rotate(g.tilt);
  const hu=h.u,hy=h.y-GROUND;
  // patas de atrás (lado lejano, más oscuras)
  M8_gigPata(-14-sw,lb,C,true);M8_gigBrazo(30+sw,lf*0.8,C,true,0);
  // cola con maza de chatarra
  const cw=Math.sin(T/40)*3;
  ctx.fillStyle=C(M8_G.piel);ctx.beginPath();ctx.moveTo(-26,-66);ctx.quadraticCurveTo(-66,-62+cw*0.4,-92,-40+cw);ctx.lineTo(-90,-34+cw);
  ctx.quadraticCurveTo(-62,-48,-28,-36);ctx.closePath();ctx.fill();
  ctx.fillStyle=C(M8_G.pielO);ctx.beginPath();ctx.moveTo(-30,-40);ctx.quadraticCurveTo(-62,-50,-90,-35+cw);ctx.lineTo(-88,-33+cw);ctx.quadraticCurveTo(-62,-46,-30,-36);ctx.fill();
  ctx.fillStyle=C(M8_G.feO);circle(-96,-37+cw,7);ctx.fillStyle=C(M8_G.oxi);circle(-96,-38+cw,5.6);
  ctx.fillStyle=C(M8_G.oxiC);for(const [a,b] of [[-101,-42],[-92,-43],[-97,-33]])ctx.fillRect(a+0,b+cw,1.5,1.5);
  ctx.fillStyle=C(M8_G.feC);for(let i=0;i<5;i++){const a=i*1.26+0.3;ctx.fillRect(-96+Math.cos(a)*7-1,-37+cw+Math.sin(a)*7-1,2,2);}
  // torso
  ctx.fillStyle=C(M8_G.pielO);ctx.beginPath();ctx.ellipse(0,-49,39,22,-0.08,0,7);ctx.fill();
  ctx.fillStyle=C(M8_G.piel);ctx.beginPath();ctx.ellipse(0,-50,37,20.5,-0.08,0,7);ctx.fill();
  ctx.fillStyle=C(M8_G.panza);ctx.beginPath();ctx.ellipse(6,-36,28,8,-0.1,0,Math.PI);ctx.fill();
  if(!fl){ctx.fillStyle=M8_G.pielC;for(const [a,b,r] of [[-18,-58,2],[-6,-62,1.6],[8,-60,1.8],[-24,-46,1.4],[16,-50,1.5],[-10,-44,1.2]])circle(a,b,r);
    ctx.fillStyle='rgba(90,130,50,0.55)';ctx.beginPath();ctx.ellipse(-12,-66,10,2.4,-0.1,0,7);ctx.fill();}   // musgo del lomo
  // cuello
  ctx.fillStyle=C(M8_G.piel);ctx.beginPath();ctx.moveTo(18,-66);ctx.lineTo(hu-14,hy-8);ctx.lineTo(hu-10,hy+7);ctx.lineTo(30,-38);ctx.closePath();ctx.fill();
  ctx.fillStyle=C(M8_G.panza);ctx.beginPath();ctx.moveTo(30,-40);ctx.lineTo(hu-10,hy+6);ctx.lineTo(hu-12,hy+3);ctx.lineTo(26,-42);ctx.fill();
  // placas de óxido del lomo y del cuello (en la fase 2 se caen: queda la jaula de hierro y el núcleo)
  if(g.plates>0){
    ctx.strokeStyle=C(M8_G.pielO);ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-34,-56);ctx.quadraticCurveTo(-4,-80,24,-62);ctx.stroke();
    const pl=(u,v,a,s)=>{ctx.save();ctx.translate(u,v);ctx.rotate(a);
      ctx.fillStyle=C(M8_G.oxiO);ctx.beginPath();ctx.moveTo(-6*s,1.5);ctx.lineTo(-4*s,-6*s);ctx.lineTo(5*s,-5*s);ctx.lineTo(7*s,1.5);ctx.closePath();ctx.fill();
      ctx.fillStyle=C(M8_G.oxi);ctx.beginPath();ctx.moveTo(-5*s,0.6);ctx.lineTo(-3.4*s,-5*s);ctx.lineTo(4.4*s,-4.2*s);ctx.lineTo(6*s,0.6);ctx.closePath();ctx.fill();
      ctx.fillStyle=C(M8_G.oxiC);ctx.fillRect(-3.4*s,-5*s,7.6*s,0.9);ctx.fillStyle=C(M8_G.feC);ctx.fillRect(-2.5*s,-2*s,1,1);ctx.fillRect(2.5*s,-2*s,1,1);
      ctx.restore();};
    const rat=g.steam>0?Math.sin(T*1.7)*0.08:0;
    pl(-30,-60,0.5+rat,1);pl(-18,-67,0.25-rat,1.15);pl(-4,-70,0.05+rat,1.2);pl(10,-69,-0.12-rat,1.15);pl(21,-65,-0.35+rat,1);
    const nu=(hu-14+18)/2,nv=(hy-8-66)/2;pl(nu,nv-1,-0.5,0.85);
  }else{
    ctx.strokeStyle=C(M8_G.feO);ctx.lineWidth=1.6;for(let i=-24;i<=20;i+=9){ctx.beginPath();ctx.arc(i,-52,15,-2.3,-0.9);ctx.stroke();}
    const k=0.6+0.4*Math.sin(T/5);ctx.fillStyle=`rgba(255,140,50,${0.35*k})`;ctx.beginPath();ctx.ellipse(-2,-60,16,7,0,0,7);ctx.fill();
    ctx.fillStyle=fl?'#fff':(T>>2)%2?'#ffd060':'#ff8a3a';ctx.beginPath();ctx.ellipse(-2,-61,6,3,0,0,7);ctx.fill();
  }
  // caños de escape con humo
  for(const [u,v] of [[-6,-70],[6,-71]]){ctx.fillStyle=C(M8_G.feO);ctx.fillRect(u-2,v-11,4,11);ctx.fillStyle=C(M8_G.fe);ctx.fillRect(u-1.5,v-11,3,10);ctx.fillStyle=C(M8_G.feC);ctx.fillRect(u-2.4,v-12,4.8,1.6);
    if(g.steam>0&&(T>>1)%2){ctx.fillStyle='#ff9a3a';ctx.fillRect(u-1,v-11.5,2,1);}}
  for(let i=0;i<3;i++){const a=((T*0.6+i*22)%66)/66,u=(i%2?6:-6)-a*10,v=-84-a*22;ctx.fillStyle=`rgba(70,70,64,${0.45*(1-a)})`;circle(u,v,1.6+a*4);}
  // cabeza: cráneo de óxido, ojo único, mandíbula de hierro con pistón
  ctx.save();ctx.translate(hu,hy);ctx.rotate(g.head>0?g.head*0.35:g.head*0.4);
  const jw=g.jaw*0.62;
  ctx.save();ctx.translate(-9,3);ctx.rotate(jw);
  ctx.fillStyle=C(M8_G.feO);ctx.beginPath();ctx.moveTo(-2,-1);ctx.lineTo(23,0);ctx.lineTo(22,4);ctx.lineTo(-1,5);ctx.closePath();ctx.fill();
  ctx.fillStyle=C(M8_G.fe);ctx.fillRect(0,0.5,21,2.6);ctx.fillStyle=C(M8_G.feC);ctx.fillRect(0,0.5,21,0.7);
  if(!fl){ctx.fillStyle='#e8e0c8';for(let i=3;i<21;i+=3.2){ctx.beginPath();ctx.moveTo(i,0.5);ctx.lineTo(i+1,-1.8);ctx.lineTo(i+2,0.5);ctx.fill();}}
  ctx.restore();
  if(g.jaw>0.15){ctx.fillStyle='#3a1a12';ctx.beginPath();ctx.moveTo(-8,2);ctx.lineTo(14,1);ctx.lineTo(10,3+g.jaw*10);ctx.lineTo(-8,5);ctx.fill();}
  // pistón de la mandíbula
  ctx.fillStyle=C(M8_G.feO);ctx.fillRect(-13,-2,7,4);ctx.fillStyle=C(M8_G.feC);ctx.fillRect(-12,-1.2,6+g.jaw*4,1.4);
  // cráneo
  ctx.fillStyle=C(M8_G.oxiO);ctx.beginPath();ctx.moveTo(-12,-10);ctx.lineTo(6,-10);ctx.lineTo(16,-5);ctx.lineTo(16,2);ctx.lineTo(-11,3);ctx.closePath();ctx.fill();
  ctx.fillStyle=C(M8_G.oxi);ctx.beginPath();ctx.moveTo(-11,-9);ctx.lineTo(6,-9);ctx.lineTo(15,-4.5);ctx.lineTo(15,1);ctx.lineTo(-10,2);ctx.closePath();ctx.fill();
  ctx.fillStyle=C(M8_G.oxiC);ctx.fillRect(-10,-9,16,1);ctx.fillRect(6,-8,7,0.8);
  if(!fl){ctx.fillStyle=M8_G.feC;for(const u of [-8,-3,2,8])ctx.fillRect(u,-6.5,1,1);ctx.fillStyle='#e8e0c8';for(let i=-6;i<14;i+=3.4){ctx.beginPath();ctx.moveTo(i,2);ctx.lineTo(i+1,4);ctx.lineTo(i+2,2);ctx.fill();}
    ctx.fillStyle='#2a1208';ctx.fillRect(13,-3.5,1.4,1);}   // fosa nasal
  // ojo
  const red=g.eyeRed>0||g.st==='roar';
  ctx.fillStyle='#120c08';circle(-3,-5,3);
  ctx.fillStyle=fl?'#fff':red?((T>>1)%2?'#ffe0d0':'#ff3a2a'):M8_G.ojo;circle(-2.6,-5,1.9);
  if(!fl){ctx.fillStyle=red?'rgba(255,60,40,0.35)':'rgba(232,255,90,0.3)';circle(-2.6,-5,4);ctx.fillStyle='#fff';ctx.fillRect(-2.2,-6,0.9,0.9);}
  ctx.restore();
  // patas del lado cercano
  M8_gigPata(-14+sw,lf,C,false);M8_gigBrazo(30-sw,lb*0.8+(g.lift||0)*30,C,false,g.lift||0);
  ctx.restore();
}
// pata de atrás: columna gruesa con rodilla y tres garras
function M8_gigPata(u,lift,C,far){
  ctx.strokeStyle=C(far?M8_G.pielO:M8_G.piel);ctx.lineCap='round';
  ctx.lineWidth=11;ctx.beginPath();ctx.moveTo(-12,-44);ctx.lineTo(u+6,-24-lift);ctx.stroke();
  ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(u+6,-24-lift);ctx.lineTo(u,-5-lift);ctx.stroke();ctx.lineCap='butt';
  ctx.fillStyle=C(far?'#1c2214':M8_G.pielO);ctx.fillRect(u-6,-6-lift,13,6);
  ctx.fillStyle=C('#d8d0b0');for(const k of [-5,0,5])ctx.fillRect(u+k+1,-1.6-lift,2,1.6);
  if(!far){ctx.fillStyle=C(M8_G.oxi);ctx.fillRect(u+2,-30-lift,6,4);ctx.fillStyle=C(M8_G.feC);ctx.fillRect(u+3,-29-lift,1,1);}  // rodillera
}
// brazo largo: camina sobre los nudillos (lift sube la mano para el pisotón)
function M8_gigBrazo(u,lift,C,far,raise){
  const sx=20,sy=-50,wx=u+raise*8,wy=-6-lift,ex=(sx+wx)/2+6,ey=(sy+wy)/2+2-raise*6;
  ctx.strokeStyle=C(far?M8_G.pielO:M8_G.pielC);ctx.lineCap='round';
  ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(ex,ey);ctx.stroke();
  ctx.lineWidth=6.5;ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(wx,wy);ctx.stroke();ctx.lineCap='butt';
  ctx.fillStyle=C(far?'#1c2214':M8_G.pielO);ctx.fillRect(wx-5,wy,11,6);
  ctx.fillStyle=C('#d8d0b0');for(const k of [-4,0,4])ctx.fillRect(wx+k+0.5,wy+4.4,2,1.6);
  if(!far){ctx.fillStyle=C(M8_G.oxi);ctx.fillRect(ex-3,ey-3,6,5);ctx.fillStyle=C(M8_G.oxiC);ctx.fillRect(ex-3,ey-3,6,0.8);}
}

// ================== ganchos por cuadro ==================
M8_LVL.upd=function(){
  if(M8.ev!==levelEvents)M8_reset();
  M8.trem*=0.95;M8.alert=Math.max(0,M8.alert-0.003);
  // presagio: tres pisadas lejanas, apenas un temblor en los charcos
  if(!M8.pre&&!lock&&camX>=M8_PRE_AT){M8.pre=1;M8.preT=0;}
  if(M8.pre===1){M8.preT++;
    if(M8.preT===1)M8_thump(0.12);if(M8.preT===60)M8_thump(0.16);if(M8.preT===120)M8_thump(0.12);
    if(M8.preT===140)toast('¿ESCUCHASTE ESO?','Algo enorme camina por la selva','#c8e070');
    if(M8.preT>150)M8.pre=2;}
  M8_pasoUpd();M8_birdsUpd();
  if(!M8.gHint&&enemies.some(e=>e.type==='garra'&&!e.gone&&onScreen(e,-10))){M8.gHint=true;toast('GARRAS','Cazan de a dos · si se agachan, saltan','#ffb070');}
  // nidos: los huevos se mueven con los temblores y de a ratos solos
  for(const [x,n] of M8.nidos){if(M8.trem>0.2)n.w=Math.max(n.w,M8.trem);n.w*=0.95;if(Math.random()<0.003)n.w=0.5;}
};

// ================== fondo precalculado ==================
const M8_R=mulberry32(808);
function M8_canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return[c,c.getContext('2d')];}
// franjas de 32 px recortadas desde el primer píxel dibujado (no se copia cielo vacío)
function M8_franjas(c){const g=c.getContext('2d'),d=g.getImageData(0,0,c.width,c.height).data,out=[];
  for(let x=0;x<c.width;x+=32){const w=Math.min(32,c.width-x);let top=c.height;
    for(let y=0;y<c.height&&top===c.height;y++)for(let i=x;i<x+w;i++)if(d[(y*c.width+i)*4+3]){top=y;break;}
    out.push({x,w,top});}
  c.fr=out;return c;}
function M8_capa(c,off,y0){for(const f of c.fr){if(f.top>=c.height)continue;for(const rep of [0,c.width]){const sx=f.x-off+rep;if(sx>W||sx+f.w<0)continue;
  ctx.drawImage(c,f.x,f.top,f.w,c.height-f.top,sx,y0+f.top,f.w,c.height-f.top);}}}
// lejos: riscos de laderas verdes con niebla y dos cascadas (dónde caen: M8_LEJ.cas)
const M8_LEJ=(()=>{const [c,g]=M8_canvas(720,96);const cas=[];
  g.fillStyle='#4f7f78';g.beginPath();g.moveTo(0,96);
  for(let x=0;x<=720;x+=4){const y=40+Math.sin(x/57)*14+Math.sin(x/23+1)*6+Math.sin(x/9)*2;g.lineTo(x,y);}g.lineTo(720,96);g.fill();
  // mesetas de roca con cascada
  for(const mx of [150,470]){const w=60,top=22+M8_R()*8;
    g.fillStyle='#456e68';g.fillRect(mx,top,w,96-top);g.fillStyle='#5f8f86';g.fillRect(mx,top,w,2);
    g.fillStyle='#3c625c';for(let i=0;i<6;i++)g.fillRect(mx+4+i*9,top+4,2,96-top-4);
    cas.push({x:mx+w*0.45,top:top+1});}
  // copas lejanas (verde azulado)
  g.fillStyle='#3e6a5c';for(let x=0;x<720;x+=7+M8_R()*6){const r=4+M8_R()*5;g.beginPath();g.arc(x,70+M8_R()*8,r,0,7);g.fill();}
  g.fillStyle='#365e52';g.fillRect(0,78,720,18);
  c.cas=cas;return M8_franjas(c);})();
// medio: árboles altos de copa redonda, cícadas y lianas (verde oscuro)
const M8_MID=(()=>{const [c,g]=M8_canvas(900,130);let x=0;
  while(x<900){const k=M8_R(),h=60+M8_R()*60,tx=x+8;
    if(k<0.6){ // árbol de copa redonda
      g.fillStyle='#16281c';g.fillRect(tx-2,130-h,5,h);
      for(let i=0;i<7;i++){const a=M8_R()*6.28,r=8+M8_R()*9;g.fillStyle=i%3?'#1c3624':'#24442c';g.beginPath();g.arc(tx+Math.cos(a)*12,130-h+Math.sin(a)*7,r,0,7);g.fill();}
      g.fillStyle='#2e5434';for(let i=0;i<4;i++){g.beginPath();g.arc(tx-8+i*6,130-h-6+M8_R()*4,4,0,7);g.fill();}
      g.strokeStyle='#1a3020';g.lineWidth=0.7;for(let i=0;i<3;i++){const lx=tx-10+M8_R()*20;g.beginPath();g.moveTo(lx,130-h+6);g.quadraticCurveTo(lx+3,130-h+30,lx-1,130-h+30+M8_R()*30);g.stroke();}
    }else{ // cícada: tronco escamado y abanico de hojas
      const hh=h*0.6;g.fillStyle='#1a2c1c';g.fillRect(tx-2,130-hh,4,hh);g.fillStyle='#22381f';for(let y=130-hh;y<130;y+=3)g.fillRect(tx-2,y,4,1);
      g.strokeStyle='#22402a';g.lineWidth=2;for(let i=0;i<7;i++){const a=-Math.PI+0.25+i*0.45;g.beginPath();g.moveTo(tx,130-hh);g.quadraticCurveTo(tx+Math.cos(a)*10,130-hh-8+Math.sin(a)*2,tx+Math.cos(a)*20,130-hh+Math.abs(Math.sin(a))*-4+6);g.stroke();}
    }
    x+=26+M8_R()*34;}
  g.fillStyle='#16281c';g.fillRect(0,118,900,12);
  for(let x2=0;x2<900;x2+=5){g.fillStyle='#1c3624';g.beginPath();g.arc(x2,118,3+M8_R()*4,0,7);g.fill();}
  return M8_franjas(c);})();
// cerca: matas y helechos casi negros pegados al piso
const M8_CER=(()=>{const [c,g]=M8_canvas(760,56);
  for(let x=0;x<760;x+=10+M8_R()*12){const h=14+M8_R()*26;g.strokeStyle=M8_R()<0.5?'#0e1c12':'#122418';g.lineWidth=1.4;
    for(let i=0;i<5;i++){const a=-Math.PI/2+(i-2)*0.42;g.beginPath();g.moveTo(x,56);g.quadraticCurveTo(x+Math.cos(a)*h*0.5,56-h*0.7,x+Math.cos(a)*h*0.9,56-h*Math.abs(Math.sin(a))*0.95);g.stroke();}}
  g.fillStyle='#0e1c12';g.fillRect(0,50,760,6);return M8_franjas(c);})();
// máquinas de pastar con cuello de grúa a lo lejos (posiciones en un lienzo de 760, se dibujan en vivo)
const M8_CUELLOS=[{x:90,s:1,ph:0},{x:150,s:0.8,ph:2.2},{x:430,s:1.1,ph:4.1},{x:620,s:0.9,ph:1.3}];
const M8_POLEN=Array.from({length:22},()=>({x:M8_R(),y:M8_R(),v:0.2+M8_R()*0.4,s:M8_R()}));
let M8_SKY=null;
function M8_cielo(){
  if(!M8_SKY||M8_SKY.width!==cv.width||M8_SKY.height!==cv.height){
    const [c,g]=M8_canvas(cv.width,cv.height);g.scale(cv.width/W,cv.height/H);
    const gr=g.createLinearGradient(0,0,0,GROUND);
    gr.addColorStop(0,'#142c34');gr.addColorStop(0.45,'#2c5652');gr.addColorStop(0.8,'#7a9a74');gr.addColorStop(1,'#c4c08a');
    g.fillStyle=gr;g.fillRect(0,0,W,H);
    const disco=(r,col)=>{g.fillStyle=col;g.beginPath();g.arc(84,58,r,0,7);g.fill();};
    disco(44,'rgba(255,240,190,0.07)');disco(26,'rgba(255,240,190,0.12)');disco(11,'rgba(255,246,214,0.45)');disco(7,'rgba(255,250,230,0.5)');
    M8_SKY=c;}
  GN_cubre(M8_SKY); // el cielo cubre lo que se ve, también en el lienzo chico (base.js)
}
function M8_volcan(){
  const vx=236-camX*0.02,top=GROUND-104;
  ctx.fillStyle='#2a4446';ctx.beginPath();ctx.moveTo(vx-70,GROUND-40);ctx.lineTo(vx-12,top);ctx.lineTo(vx+10,top);ctx.lineTo(vx+74,GROUND-40);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,120,60,0.3)';ctx.beginPath();ctx.moveTo(vx-5,top+1);ctx.lineTo(vx-12,top+12);ctx.lineTo(vx-11,top+12.5);ctx.lineTo(vx-3.5,top+1);ctx.fill();
  ctx.fillStyle='#223a3c';ctx.beginPath();ctx.moveTo(vx+2,top);ctx.lineTo(vx+10,top);ctx.lineTo(vx+74,GROUND-40);ctx.lineTo(vx+30,GROUND-40);ctx.closePath();ctx.fill();
  ctx.fillStyle=`rgba(255,130,60,${0.55+0.25*Math.sin(T/20)})`;ctx.fillRect(vx-9,top-1,18,1.5);
  ctx.fillStyle='rgba(255,140,70,0.10)';ctx.beginPath();ctx.ellipse(vx,top-2,10,3,0,0,7);ctx.fill();
  // humo: bocanadas que suben y se tuercen con el viento
  for(let i=0;i<8;i++){const a=((T*0.22+i*27)%216)/216,x=vx+a*a*40+Math.sin(a*6+i)*3,y=top-4-a*62,r=3+a*9;
    ctx.fillStyle=`rgba(${110+i%2*14},${120+i%2*10},${116},${0.38*(1-a)})`;circle(x,y,r);}
}
function M8_cascadas(off,y0){
  for(const k of M8_LEJ.cas)for(const rep of [0,720]){const x=k.x-off+rep;if(x<-10||x>W+10)continue;
    const top=y0+k.top,bot=y0+80;
    ctx.fillStyle='rgba(190,230,226,0.55)';ctx.fillRect(x,top,4,bot-top);
    ctx.fillStyle='rgba(240,255,250,0.7)';for(let i=0;i<4;i++){const yy=top+((T*0.9+i*13)%(bot-top));ctx.fillRect(x+(i%2)*2,yy,1.4,4);}
    ctx.fillStyle='rgba(220,240,236,0.25)';ctx.beginPath();ctx.ellipse(x+2,bot,9+Math.sin(T/12)*1.5,3,0,0,7);ctx.fill();}
}
// máquinas de pastar (mitad máquina): chasis con remaches sobre cuatro patas articuladas, cuello de grúa en dos
// tramos rectos con bisagras y un cable tenso, y la cabeza es una pala con un foquito. Bajan la pala para "pastar";
// si se asustan (temblores) levantan el brazo y el foquito se prende.
function M8_cuello(c,x,base){
  const s=c.s,graze=(Math.sin(T/150+c.ph)+1)/2,up=Math.max(M8.alert,0);
  const a=-0.15-up*0.9+graze*(1-up)*0.95;   // ángulo del brazo: arriba si se asustan, abajo si pastan
  const col='#3a625a',osc='#2c4e48',bx=x,by=base-10*s;
  ctx.fillStyle=col;
  // patas articuladas (muslo y caña en ángulo, con pie plano)
  for(const dx of [-10,-4,5,11]){const kx=bx+dx*s,ky=by+5*s,fx=kx+(dx<0?-2:2)*s;
    ctx.strokeStyle=col;ctx.lineWidth=2*s;ctx.beginPath();ctx.moveTo(kx,by+2*s);ctx.lineTo(fx,ky);ctx.lineTo(kx,by+10*s);ctx.stroke();
    ctx.fillRect(kx-2*s,by+10*s,4*s,1.2*s);}
  // chasis: caja con techo inclinado, remaches y un caño de escape atrás
  ctx.beginPath();ctx.moveTo(bx-14*s,by+3*s);ctx.lineTo(bx-14*s,by-4*s);ctx.lineTo(bx-6*s,by-7*s);ctx.lineTo(bx+13*s,by-7*s);ctx.lineTo(bx+14*s,by+3*s);ctx.closePath();ctx.fill();
  ctx.fillStyle=osc;ctx.fillRect(bx-12*s,by-1*s,24*s,1.2*s);
  for(let i=0;i<5;i++)ctx.fillRect(bx-10*s+i*5*s,by+1*s,1*s,1*s);
  ctx.fillStyle=col;ctx.fillRect(bx-12*s,by-12*s,2*s,6*s);
  if(T%40<20){ctx.fillStyle='rgba(150,170,160,0.25)';circle(bx-11*s,by-14*s-(T%20)*0.2*s,1.6*s);}
  // brazo de grúa: dos tramos rectos con bisagras
  const nx=bx+11*s,ny=by-6*s,L1=15*s,L2=14*s;
  const a1=-1.25+a*0.5,ex1=nx+Math.cos(a1)*L1,ey1=ny+Math.sin(a1)*L1;
  const a2=-0.35+a*1.2,ex2=ex1+Math.cos(a2)*L2,ey2=ey1+Math.sin(a2)*L2;
  ctx.strokeStyle=col;ctx.lineWidth=2.6*s;ctx.beginPath();ctx.moveTo(nx,ny);ctx.lineTo(ex1,ey1);ctx.lineTo(ex2,ey2);ctx.stroke();
  ctx.strokeStyle=osc;ctx.lineWidth=0.6*s;ctx.beginPath();ctx.moveTo(nx-3*s,ny+1*s);ctx.lineTo(ex1,ey1-1.5*s);ctx.lineTo(ex2,ey2);ctx.stroke(); // cable
  ctx.fillStyle=osc;circle(nx,ny,1.6*s);circle(ex1,ey1,1.6*s);
  // cabeza: pala con dientes y foquito
  ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(ex2-1*s,ey2-2.5*s);ctx.lineTo(ex2+5*s,ey2-1.5*s);ctx.lineTo(ex2+5*s,ey2+2.5*s);ctx.lineTo(ex2-1*s,ey2+2*s);ctx.closePath();ctx.fill();
  for(let i=0;i<3;i++)ctx.fillRect(ex2+i*2*s,ey2+2.5*s,1*s,1.2*s);
  ctx.fillStyle=up>0.2?`rgba(255,200,110,${0.5+0.4*up})`:'rgba(190,200,170,0.35)';ctx.fillRect(ex2+3.6*s,ey2-1.2*s,1.4*s,1.4*s);
}
M8_LVL.drawBG=function(){
  M8_cielo();
  M8_volcan();
  const lo=((camX*0.08)%720+720)%720;M8_capa(M8_LEJ,lo,GROUND-118);M8_cascadas(lo,GROUND-118);
  // máquinas de cuello largo en el claro del fondo
  const co=((camX*0.15)%760+760)%760;
  for(const c of M8_CUELLOS)for(const rep of [0,760]){const x=c.x-co+rep;if(x<-50||x>W+50)continue;M8_cuello(c,x,GROUND-34);}
  // niebla baja entre capas
  const nb=ctx.createLinearGradient(0,GROUND-60,0,GROUND-22);nb.addColorStop(0,'rgba(200,220,200,0)');nb.addColorStop(1,'rgba(200,220,200,0.35)');
  ctx.fillStyle=nb;ctx.fillRect(0,GROUND-60,W,38);
  const mo=((camX*0.3)%900+900)%900;M8_capa(M8_MID,mo,GROUND-130);
  // pájaros
  ctx.strokeStyle='#14201a';ctx.lineWidth=0.7;
  for(const b of M8.birds){const w=Math.sin(b.f)*1.6*b.s;ctx.beginPath();ctx.moveTo(b.x-2.4*b.s,b.y-w);ctx.lineTo(b.x,b.y);ctx.lineTo(b.x+2.4*b.s,b.y-w);ctx.stroke();}
  const no=((camX*0.6)%760+760)%760;M8_capa(M8_CER,no,GROUND-56);
  // bruma al ras del piso
  const hz=ctx.createLinearGradient(0,GROUND-26,0,GROUND);hz.addColorStop(0,'rgba(170,200,170,0)');hz.addColorStop(1,'rgba(170,200,170,0.28)');
  ctx.fillStyle=hz;ctx.fillRect(0,GROUND-26,W,26);
};

// ================== suelo: tierra húmeda con musgo ==================
M8_LVL.drawGround=function(){
  const x0=Math.floor(camX)-10;
  ctx.fillStyle=M8_C.tierra;ctx.fillRect(x0,GROUND,W+20,H-GROUND);
  ctx.fillStyle='#3a4a22';ctx.fillRect(x0,GROUND,W+20,3);
  ctx.fillStyle=M8_C.musgo;ctx.fillRect(x0,GROUND,W+20,1.2);ctx.fillStyle=M8_C.musgoC;ctx.fillRect(x0,GROUND,W+20,0.5);
  for(let t=Math.floor(camX/10)-1;t<(camX+VW)/10+1;t++){
    const h=hash(t*7+3);
    if(h<0.5){ctx.fillStyle=h<0.2?'#4a7a2a':'#3a6022';const s=Math.sin(T/30+t)*0.4+M8.trem*Math.sin(T*0.8+t)*0.8;   // matitas de pasto
      ctx.fillRect(t*10+h*6,GROUND-2,0.8,2);ctx.fillRect(t*10+h*6+1.4+s*0.4,GROUND-3,0.8,3);ctx.fillRect(t*10+h*6+2.8,GROUND-1.6,0.8,1.6);}
    const h2=hash(t*13+11);
    if(h2<0.45){ctx.fillStyle=h2<0.15?'#4a4034':'#1a120c';const s=1+Math.floor(h2*10)%3;ctx.fillRect(t*10+h2*8,GROUND+5+Math.floor(h2*977)%14,s,s*0.7);}
    if(h2>0.92){ctx.strokeStyle='#3a2616';ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(t*10,GROUND+3);ctx.quadraticCurveTo(t*10+6,GROUND+9,t*10+14,GROUND+7);ctx.stroke();}   // raíz
  }
  // el gigante del cruce va detrás de todo lo que está en el plano de juego: pasa por encima del tronco
  const s=M8.paso;if(s.g&&s.st==='cruce'&&state!=='title'&&state!=='select')M8_drawGigante(s.g);
};

// ================== capa de arriba: rayos de luz, hojas que cuelgan y polen ==================
// rayos de luz entre las copas: detrás de los personajes (juego.js, drawWorld)
M8_LVL.drawFxFondo=function(){
  for(let i=0;i<3;i++){const x=40+i*110-((camX*0.05)%110),a=0.05+0.025*Math.sin(T/70+i*2);
    ctx.fillStyle=`rgba(255,246,200,${a})`;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+16,0);ctx.lineTo(x+56,GROUND);ctx.lineTo(x+26,GROUND);ctx.closePath();ctx.fill();}
};
M8_LVL.drawFx=function(){
  // polen y bichitos de luz
  for(const m of M8_POLEN){const x=((m.x*W-camX*0.8+Math.sin(T/50+m.s*9)*6)%W+W)%W,y=((m.y*H-T*0.12*m.v)%H+H)%H;
    ctx.fillStyle=m.s>0.85?'rgba(230,255,140,0.7)':'rgba(255,250,220,0.35)';ctx.fillRect(x,y,m.s>0.85?1.2:0.8,m.s>0.85?1.2:0.8);}
  // hojas que cuelgan arriba en las esquinas (se sacuden con el temblor)
  const sh=M8.trem*Math.sin(T*0.9)*2.5;
  for(const [x0,dir] of [[0,1],[W,-1]]){
    for(let i=0;i<5;i++){const x=x0+dir*(4+i*11),len=10+((i*7)%9),sw=Math.sin(T/55+i)*1.2+sh*(i%2?1:-1);
      ctx.strokeStyle='#0c1a10';ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(x,0);ctx.quadraticCurveTo(x+sw,len*0.6,x+sw*1.4,len);ctx.stroke();
      ctx.fillStyle=i%2?'#12281a':'#0e2014';ctx.beginPath();ctx.ellipse(x+sw*1.4,len+2,2.4,4,sw*0.1,0,7);ctx.fill();}
    ctx.fillStyle='#0c1a10';ctx.beginPath();ctx.ellipse(x0,-4,60,12,0,0,7);ctx.fill();
  }
};

// ================== decorado ==================
// charco: agua oscura que refleja el cielo (solo decoración)
function M8_drawCharco(d){
  const x=d.x+16,y=GROUND+7,rx=17,ry=3.4;
  ctx.fillStyle='#16241a';ctx.beginPath();ctx.ellipse(x,y+0.6,rx+1.5,ry+1,0,0,7);ctx.fill();
  ctx.fillStyle=M8_C.agua;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,7);ctx.fill();
  const jit=0;
  ctx.fillStyle='rgba(154,208,200,0.35)';ctx.fillRect(x-rx*0.55+jit,y-ry*0.45,rx*0.7,0.7);
  ctx.fillStyle='rgba(255,246,214,0.35)';ctx.fillRect(x+rx*0.25-jit,y-ry*0.2,3,0.6);
  // piedritas y pasto de la orilla
  ctx.fillStyle='#4a4a3a';ctx.fillRect(x-rx-1,y-1,2.4,1.6);ctx.fillRect(x+rx-2,y,2,1.4);
  ctx.fillStyle=M8_C.musgo;ctx.fillRect(x-rx+3,y-ry-0.6,0.8,1.6);ctx.fillRect(x+rx-6,y-ry-0.4,0.8,1.4);
}
function M8_drawHelecho(d){
  const x=d.x+10,g=GROUND,sw=Math.sin(T/60+d.x)*0.05,tr=M8.trem*Math.sin(T*0.85+d.x)*0.3;
  for(let i=0;i<6;i++){const a=-Math.PI/2+(i-2.5)*0.42+sw+tr*(1+i%2),len=16+((i*5)%7)+(i===2||i===3?6:0);
    const ex=x+Math.cos(a)*len,ey=g+Math.sin(a)*len*0.95,cx=x+Math.cos(a)*len*0.5,cy=g-len*0.75;
    ctx.strokeStyle=i%2?'#2e5a2a':'#3a6a30';ctx.lineWidth=0.9;ctx.beginPath();ctx.moveTo(x,g);ctx.quadraticCurveTo(cx,cy,ex,ey);ctx.stroke();
    ctx.fillStyle=i%2?'#3a6a30':'#4a7a34';
    for(let k=0.3;k<0.95;k+=0.16){const t=k,px=(1-t)*(1-t)*x+2*(1-t)*t*cx+t*t*ex,py=(1-t)*(1-t)*g+2*(1-t)*t*cy+t*t*ey,ll=2.6*(1-t)+0.8;
      ctx.fillRect(px-ll,py,ll*2,0.8);}}
}
function M8_drawNido(d){
  const x=d.x,g=GROUND;let n=M8.nidos.get(d.x);if(!n){n={w:0};M8.nidos.set(d.x,n);}
  ctx.fillStyle='#5a4228';ctx.beginPath();ctx.ellipse(x+12,g-2,14,4,0,0,7);ctx.fill();
  ctx.strokeStyle='#7a5a34';ctx.lineWidth=0.6;for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(x+i*4,g-1-(i%2));ctx.lineTo(x+i*4+8,g-4+(i%3));ctx.stroke();}
  for(const [ox,ph] of [[6,0],[12,2],[18,4]]){const w=Math.sin(T*0.6+ph)*n.w*0.35;
    ctx.save();ctx.translate(x+ox,g-3);ctx.rotate(w);
    ctx.fillStyle='#e0d8bc';ctx.beginPath();ctx.ellipse(0,-4,3.2,4.6,0,0,7);ctx.fill();
    ctx.fillStyle='#a89a74';ctx.fillRect(-1.5,-6,1,1);ctx.fillRect(0.8,-3.5,1,1);ctx.fillRect(-0.5,-1.6,1,0.8);
    ctx.fillStyle='rgba(255,255,255,0.4)';ctx.fillRect(-1.6,-7,1,2);ctx.restore();}
  ctx.fillStyle='#6a4e2e';ctx.fillRect(x+1,g-3,22,1.5);
}
M8_LVL.drawDecor=function(d){
  const x=d.x,g=GROUND;
  switch(d.k){
  case 'charco':M8_drawCharco(d);return true;
  case 'helecho':M8_drawHelecho(d);return true;
  case 'nido':M8_drawNido(d);return true;
  case 'hongo':{ // hongos que brillan apenas, con esporas que suben
    for(const [ox,h,r] of [[0,6,3.4],[6,9,4.2],[11,5,2.6]]){ctx.fillStyle='#d8cca8';ctx.fillRect(x+ox+r-0.8,g-h,1.6,h);
      ctx.fillStyle='#b8604a';ctx.beginPath();ctx.ellipse(x+ox+r,g-h,r,r*0.55,0,Math.PI,0);ctx.fill();
      ctx.fillStyle='#f0d8a0';ctx.fillRect(x+ox+r-1,g-h-r*0.4,1,0.8);ctx.fillRect(x+ox+r+1,g-h-r*0.25,0.8,0.8);}
    const s=((T*0.3+x)%40)/40;ctx.fillStyle=`rgba(230,255,160,${0.6*(1-s)})`;ctx.fillRect(x+8+Math.sin(s*6)*2,g-12-s*14,0.8,0.8);
    return true;}
  case 'huesos':{ // costillar enorme a medio enterrar (de un bicho que no tuvo suerte)
    ctx.strokeStyle='#cfc6a8';ctx.lineWidth=1.6;
    for(let i=0;i<5;i++){const bx=x+i*6;ctx.beginPath();ctx.moveTo(bx,g);ctx.quadraticCurveTo(bx+3,g-14+i,bx+9,g-12+i*1.2);ctx.stroke();}
    ctx.fillStyle='#bdb494';ctx.fillRect(x-2,g-2,34,2);ctx.fillStyle='rgba(74,122,42,0.8)';ctx.fillRect(x+4,g-3,6,1);ctx.fillRect(x+18,g-2.6,5,1);
    return true;}
  }
  return false;
};

// ================== plataformas ==================
M8_LVL.drawPlat=function(pl){
  if(pl.roof){M8_troncoFondo(pl);return true;}
  if(pl.pyr){M8_tier(pl);return true;}
  if(pl.hi==='arbol'){M8_arbol(pl);return true;}
  if(pl.hi==='risco'){M8_risco(pl);return true;}
  if(pl.step){M8_roca(pl.x,pl.y,pl.w,GROUND-pl.y);return true;}
  M8_rama(pl);return true;
};
// tronco caído sobre una piedra musgosa, con lianas que cuelgan
function M8_rama(pl){
  const x=pl.x,y=pl.y,w=pl.w,cx=x+w/2;
  ctx.fillStyle=M8_C.piedraO;ctx.beginPath();ctx.moveTo(cx-9,GROUND);ctx.lineTo(cx-6,y+5);ctx.lineTo(cx+7,y+5);ctx.lineTo(cx+10,GROUND);ctx.fill();
  ctx.fillStyle=M8_C.piedra;ctx.beginPath();ctx.moveTo(cx-7,GROUND);ctx.lineTo(cx-5,y+6);ctx.lineTo(cx+3,y+6);ctx.lineTo(cx+4,GROUND);ctx.fill();
  ctx.fillStyle='rgba(74,122,42,0.6)';ctx.fillRect(cx-5,y+8,4,2);ctx.fillRect(cx-6,GROUND-6,5,2);
  ctx.fillStyle=M8_C.corteza;ctx.fillRect(x,y,w,5);ctx.fillStyle='#3a2414';ctx.fillRect(x,y+4,w,1.2);
  ctx.fillStyle='#6a4628';for(let i=4;i<w-2;i+=7)ctx.fillRect(x+i,y+2,4,0.8);
  ctx.fillStyle='#7a5a3a';ctx.beginPath();ctx.ellipse(x+w,y+2.5,1.6,2.6,0,0,7);ctx.fill();ctx.fillStyle='#a8845a';ctx.fillRect(x+w-0.5,y+2,1,1);
  ctx.fillStyle=M8_C.musgo;ctx.fillRect(x+1,y,w-3,1);ctx.fillStyle=M8_C.musgoC;for(let i=3;i<w-4;i+=9)ctx.fillRect(x+i,y-0.4,3,0.8);
  ctx.strokeStyle='#2e5a2a';ctx.lineWidth=0.7;
  for(const lx of [x+6,x+w-10]){const len=10+hash(lx|0)*10,sw=Math.sin(T/45+lx)*1.4+M8.trem*Math.sin(T*0.9+lx)*2;
    ctx.beginPath();ctx.moveTo(lx,y+5);ctx.quadraticCurveTo(lx+sw*0.5,y+5+len*0.5,lx+sw,y+5+len);ctx.stroke();
    ctx.fillStyle='#3a6a30';ctx.fillRect(lx+sw-1,y+5+len,2,1.4);}
}
// bloque de roca con musgo (escalones de la arena final)
function M8_roca(x,y,w,h){
  ctx.fillStyle=M8_C.piedraO;ctx.fillRect(x,y,w,h);
  ctx.fillStyle=M8_C.piedra;ctx.fillRect(x+1,y+1,w-3,h-1);
  ctx.fillStyle='#4a5244';for(let r=y+5;r<y+h-2;r+=6)ctx.fillRect(x+2+((r*7)%5),r,w-8,1);
  ctx.fillStyle=M8_C.piedraC;ctx.fillRect(x+1,y+1,w-3,0.8);
  ctx.fillStyle=M8_C.musgo;ctx.fillRect(x,y,w,1.6);ctx.fillStyle=M8_C.musgoC;ctx.fillRect(x+2,y-0.4,w*0.4,0.8);
  ctx.fillStyle='rgba(74,122,42,0.7)';ctx.fillRect(x,y+1.6,2,6);ctx.fillRect(x+w-5,y+1.6,3,3);
  ctx.fillStyle='rgba(0,0,0,0.3)';ctx.fillRect(x+w-2,y,2,h);
}
// árbol gigante: tronco desde el piso y una rama ancha arriba (la que se camina)
function M8_arbol(pl){
  const x=pl.x,y=pl.y,w=pl.w,cx=x+w/2;
  ctx.fillStyle='#56402e';ctx.fillRect(cx-6,y+4,12,GROUND-y-4);
  ctx.fillStyle=M8_C.corteza;ctx.fillRect(cx-5,y+4,8,GROUND-y-4);
  ctx.fillStyle='#6a4a30';for(let yy=y+10;yy<GROUND;yy+=9)ctx.fillRect(cx-4+((yy*3)%4),yy,1,6);
  ctx.fillStyle='rgba(74,122,42,0.7)';ctx.fillRect(cx-5,y+20,3,10);ctx.fillRect(cx+1,y+48,2,8);
  // raíces
  ctx.fillStyle='#56402e';ctx.beginPath();ctx.moveTo(cx-14,GROUND);ctx.quadraticCurveTo(cx-7,GROUND-4,cx-5,GROUND-12);ctx.lineTo(cx+5,GROUND-12);ctx.quadraticCurveTo(cx+8,GROUND-4,cx+15,GROUND);ctx.fill();
  // copa por detrás, a los costados (no tapa la rama)
  for(const [ox,oy,r,c] of [[-18,-6,9,'#1e3a22'],[20,-4,10,'#1e3a22'],[-10,-12,8,'#24442a'],[12,-12,8,'#24442a'],[0,-16,7,'#2e5434']]){
    ctx.fillStyle=c;ctx.beginPath();ctx.arc(cx+ox+Math.sin(T/70+ox)*0.6,y+oy,r,0,7);ctx.fill();}
  // rama ancha
  ctx.fillStyle=M8_C.corteza;ctx.fillRect(x-2,y,w+4,5);ctx.fillStyle='#3a2414';ctx.fillRect(x-2,y+4,w+4,1.2);
  ctx.fillStyle=M8_C.musgo;ctx.fillRect(x-2,y,w+4,1.2);ctx.fillStyle=M8_C.musgoC;ctx.fillRect(x+2,y-0.4,8,0.8);ctx.fillRect(x+w-12,y-0.4,6,0.8);
  ctx.strokeStyle='#2e5a2a';ctx.lineWidth=0.7;for(const lx of [x+2,x+w-4]){const sw=Math.sin(T/40+lx)*1.5+M8.trem*2*Math.sin(T+lx);ctx.beginPath();ctx.moveTo(lx,y+5);ctx.quadraticCurveTo(lx+sw,y+16,lx+sw*1.5,y+24);ctx.stroke();}
}
// punta de un risco: columna de roca con la cima plana
function M8_risco(pl){
  const x=pl.x,y=pl.y,w=pl.w;
  ctx.fillStyle=M8_C.piedraO;ctx.beginPath();ctx.moveTo(x+2,y);ctx.lineTo(x+w-2,y);ctx.lineTo(x+w-6,y+30);ctx.lineTo(x+w+2,GROUND);ctx.lineTo(x-2,GROUND);ctx.lineTo(x+6,y+34);ctx.closePath();ctx.fill();
  ctx.fillStyle=M8_C.piedra;ctx.beginPath();ctx.moveTo(x+4,y+1);ctx.lineTo(x+w-6,y+1);ctx.lineTo(x+w-9,y+30);ctx.lineTo(x+w-4,GROUND);ctx.lineTo(x+3,GROUND);ctx.lineTo(x+9,y+34);ctx.closePath();ctx.fill();
  ctx.fillStyle='#4a5244';for(let yy=y+8;yy<GROUND-4;yy+=8)ctx.fillRect(x+8+((yy*5)%6),yy,w-20,1);
  ctx.fillStyle=M8_C.musgo;ctx.fillRect(x+2,y,w-4,2);ctx.fillStyle=M8_C.musgoC;ctx.fillRect(x+6,y-0.4,10,0.8);
  ctx.fillStyle='rgba(74,122,42,0.7)';ctx.fillRect(x+6,y+2,3,8);ctx.fillRect(x+w-10,y+2,4,4);
  ctx.strokeStyle='#2e5a2a';ctx.lineWidth=0.7;const sw=Math.sin(T/50)*1.2;ctx.beginPath();ctx.moveTo(x+w-6,y+2);ctx.quadraticCurveTo(x+w-4+sw,y+18,x+w-5+sw*1.5,y+30);ctx.stroke();
}
// escalones del templo: piedras talladas (dibujos geométricos propios), raíces que las abrazan y el altar arriba
function M8_tier(pl){
  const x=pl.x,y=pl.y,w=pl.w,h=pl.pyr.dy;
  if(pl.mat==='altar'){
    for(const px of [x+3,x+w-11]){ctx.fillStyle=M8_C.piedraO;ctx.fillRect(px,y-14,8,14);ctx.fillStyle='#7a7a62';ctx.fillRect(px+1,y-13,6,13);
      ctx.fillStyle='#9a9a7e';ctx.fillRect(px+1,y-13,6,1);ctx.fillStyle='rgba(74,122,42,0.8)';ctx.fillRect(px+1,y-14,4,1.4);}
    ctx.fillStyle='#6a6a54';ctx.fillRect(x,y,w,h);ctx.fillStyle='#8a8a6c';ctx.fillRect(x,y,w,1.4);
    ctx.fillStyle='#4a4a3a';ctx.fillRect(x+w/2-5,y+5,10,8);ctx.fillStyle='#7a7a62';ctx.fillRect(x+w/2-3,y+7,6,4);
    ctx.fillStyle=M8_C.musgo;ctx.fillRect(x,y,w*0.4,1);
    return;}
  ctx.fillStyle='#4a4a3a';ctx.fillRect(x,y,w,h);
  ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
  for(let r=0;r<h-2;r+=8)for(let c=((r/8)%2)*7;c<w-2;c+=14){
    ctx.fillStyle='#6a6a54';ctx.fillRect(x+c+1,y+r+1,12,6.6);ctx.fillStyle='#7c7c64';ctx.fillRect(x+c+1,y+r+1,12,0.8);
    if(hash((x+c)*3+r)<0.3){ctx.fillStyle='#55553f';ctx.fillRect(x+c+4,y+r+3,6,0.8);ctx.fillRect(x+c+4,y+r+3,0.8,3);ctx.fillRect(x+c+9.2,y+r+3,0.8,3);}}  // tallado
  ctx.restore();
  ctx.fillStyle='#8a8a6c';ctx.fillRect(x,y,w,1.2);
  ctx.fillStyle=M8_C.musgo;ctx.fillRect(x+4,y,w*0.3,1);ctx.fillRect(x+w*0.6,y,w*0.25,1);
  ctx.fillStyle='rgba(74,122,42,0.6)';for(let i=0;i<4;i++)ctx.fillRect(x+hash(x+i)*w,y+1,2,3+hash(i+x)*5);
  if(pl.mat==='raiz'){ctx.strokeStyle='#5a3a22';ctx.lineWidth=1.4;
    for(let i=0;i<4;i++){const rx=x+10+i*(w-20)/3;ctx.beginPath();ctx.moveTo(rx,y);ctx.bezierCurveTo(rx+6,y+6,rx-6,y+14,rx+3,y+h);ctx.stroke();}
    ctx.strokeStyle='#7a5434';ctx.lineWidth=0.6;for(let i=0;i<4;i++){const rx=x+10+i*(w-20)/3;ctx.beginPath();ctx.moveTo(rx+0.5,y);ctx.bezierCurveTo(rx+6.5,y+6,rx-5.5,y+14,rx+3.5,y+h);ctx.stroke();}}
  ctx.fillStyle='rgba(0,0,0,0.3)';ctx.fillRect(x,y+h-1,w,1);
}
// tronco hueco: por dentro madera oscura con anillos y hongos que brillan; el lomo con corteza y musgo
function M8_troncoFondo(pl){
  const x=pl.x,y=pl.y,w=pl.w,iy=y+9;
  ctx.fillStyle='#4a3628';ctx.fillRect(x+2,iy,w-4,GROUND-iy);ctx.fillStyle='#6a5038';ctx.fillRect(x+2,iy,w-4,1); // interior más claro, con borde de arriba claro (contraste)
  ctx.strokeStyle='#5a4230';ctx.lineWidth=0.8;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(x+4,iy+4+i*7);ctx.lineTo(x+w-4,iy+3+i*7+((i%2)?1:-1));ctx.stroke();}
  for(const [ox,h] of [[18,4],[22,6],[70,5],[100,4],[104,6]]){const hx=x+ox;ctx.fillStyle='#c8e070';ctx.fillRect(hx,GROUND-h,1,h);
    ctx.fillStyle=`rgba(200,240,140,${0.5+0.3*Math.sin(T/30+ox)})`;ctx.beginPath();ctx.ellipse(hx+0.5,GROUND-h,2,1,0,Math.PI,0);ctx.fill();}
  ctx.fillStyle='rgba(200,240,140,0.05)';ctx.fillRect(x+12,GROUND-10,100,10);
  M8_lomo(x,y,w);
}
function M8_lomo(x,y,w){
  // casco curvo del tronco (de y-4 a y+9)
  ctx.fillStyle='#3a2414';ctx.beginPath();ctx.moveTo(x,y+9);ctx.lineTo(x,y+2);ctx.quadraticCurveTo(x+w/2,y-5,x+w,y+2);ctx.lineTo(x+w,y+9);ctx.closePath();ctx.fill();
  ctx.fillStyle=M8_C.corteza;ctx.beginPath();ctx.moveTo(x+1,y+7.5);ctx.lineTo(x+1,y+2);ctx.quadraticCurveTo(x+w/2,y-3.6,x+w-1,y+2);ctx.lineTo(x+w-1,y+7.5);ctx.closePath();ctx.fill();
  ctx.fillStyle='#6a4628';for(let i=6;i<w-4;i+=9)ctx.fillRect(x+i,y+3+((i*3)%3),5,0.8);
  ctx.fillStyle=M8_C.musgo;ctx.fillRect(x+4,y-0.2,w-8,1.4);ctx.fillStyle=M8_C.musgoC;for(let i=10;i<w-8;i+=14)ctx.fillRect(x+i,y-0.8,4,0.8);
  // bocas del tronco: anillos de madera en los dos extremos
  for(const ex of [x,x+w]){ctx.fillStyle='#8a6040';ctx.beginPath();ctx.ellipse(ex,(y+GROUND)/2+2,3,(GROUND-y)/2+2,0,0,7);ctx.fill();
    ctx.fillStyle='#1a120c';ctx.beginPath();ctx.ellipse(ex,(y+GROUND)/2+4,1.8,(GROUND-y)/2-6,0,0,7);ctx.fill();
    ctx.strokeStyle='#a8845a';ctx.lineWidth=0.5;ctx.beginPath();ctx.ellipse(ex,(y+GROUND)/2+2,2.4,(GROUND-y)/2,0,0,7);ctx.stroke();}
}
M8_LVL.drawTunnelFront=function(t){
  if(t.k!=='tronco')return false;
  const iy=t.y+9;
  ctx.fillStyle='rgba(10,8,4,0.34)';ctx.fillRect(t.x+3,iy,t.w-6,GROUND-iy);
  const g=ctx.createLinearGradient(0,iy,0,iy+12);g.addColorStop(0,'rgba(10,8,4,0.55)');g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g;ctx.fillRect(t.x+3,iy,t.w-6,12);
  M8_lomo(t.x,t.y,t.w);
  return true;
};

// ================== coberturas propias ==================
M8_LVL.drawCover=function(c){
  if(c.vida<=0)return false;   // los escombros los dibuja mundo.js
  const x=c.x,w=c.w,top=c.top,h=c.h;
  switch(c.k){
  case 'piedra':
    ctx.fillStyle=M8_C.piedraO;ctx.beginPath();ctx.moveTo(x,GROUND);ctx.lineTo(x+1,top+5);ctx.lineTo(x+5,top);ctx.lineTo(x+w-5,top+1);ctx.lineTo(x+w,top+6);ctx.lineTo(x+w,GROUND);ctx.fill();
    ctx.fillStyle=M8_C.piedra;ctx.beginPath();ctx.moveTo(x+2,GROUND);ctx.lineTo(x+2.5,top+5);ctx.lineTo(x+5.5,top+1.2);ctx.lineTo(x+w-6,top+2);ctx.lineTo(x+w-2,top+6);ctx.lineTo(x+w-3,GROUND);ctx.fill();
    ctx.fillStyle=M8_C.piedraC;ctx.fillRect(x+6,top+1.4,w*0.4,0.8);
    ctx.fillStyle=M8_C.musgo;ctx.fillRect(x+4,top+0.4,w*0.5,1.4);ctx.fillStyle='rgba(74,122,42,0.6)';ctx.fillRect(x+2,top+5,2,5);
    break;
  case 'tocon':
    ctx.fillStyle='#3a2414';ctx.fillRect(x,top+2,w,h-2);ctx.fillStyle=M8_C.corteza;ctx.fillRect(x+1,top+2,w-3,h-2);
    ctx.fillStyle='#3a2414';for(let i=x+3;i<x+w-2;i+=4)ctx.fillRect(i,top+4,0.8,h-6);
    ctx.fillStyle='#a8845a';ctx.beginPath();ctx.ellipse(x+w/2,top+2,w/2,2,0,0,7);ctx.fill();
    ctx.strokeStyle='#7a5a3a';ctx.lineWidth=0.5;ctx.beginPath();ctx.ellipse(x+w/2,top+2,w/4,1,0,0,7);ctx.stroke();
    ctx.fillStyle='#24180e';ctx.beginPath();ctx.moveTo(x-3,GROUND);ctx.lineTo(x+2,GROUND-4);ctx.lineTo(x+4,GROUND);ctx.fill();ctx.beginPath();ctx.moveTo(x+w+3,GROUND);ctx.lineTo(x+w-2,GROUND-4);ctx.lineTo(x+w-4,GROUND);ctx.fill();
    break;
  case 'raices':
    ctx.strokeStyle='#3a2616';ctx.lineWidth=2.2;
    for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(x+i*w/4,GROUND);ctx.bezierCurveTo(x+i*w/4+4,top-2,x+i*w/4+10,top+6,x+Math.min(w,i*w/4+14),GROUND);ctx.stroke();}
    ctx.strokeStyle='#6a4a2c';ctx.lineWidth=0.7;
    for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(x+i*w/4,GROUND-1);ctx.bezierCurveTo(x+i*w/4+4,top-1,x+i*w/4+10,top+7,x+Math.min(w,i*w/4+14),GROUND-1);ctx.stroke();}
    ctx.fillStyle=M8_C.musgo;ctx.fillRect(x+4,top+1,5,1);ctx.fillRect(x+w-8,top+3,4,1);
    break;
  default:return false;
  }
  if(c.vida<c.max*0.5){ctx.fillStyle='rgba(10,8,4,0.55)';ctx.fillRect(x+w*0.3,top+2,1,h*0.5);ctx.fillRect(x+w*0.65,top+3,2,1);}
  return true;
};
