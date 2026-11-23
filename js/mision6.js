'use strict';
// Óxido · Misión 6: Ciudad de datos (escenario, vigías holográficos, anillos de datos y REFLEJOS: la cámara lenta)
// Un mundo "adentro de la computadora": edificios de bloques de datos, grillas que brillan y fallas de imagen.
// Paleta propia: violeta de fondo, cian en los bordes, ámbar en los avisos. Prefijo M6_ en todo lo global.
// La acción que identifica la misión: al saltar entre balas el tiempo se frena (REFLEJOS) y se ven las estelas.
// Necesita el gancho genérico L.timeScale() de juego.js (cámara lenta por acumulador de cuadros).

// ================== datos de la misión ==================
const M6_LVL={name:'MISIÓN 6 · CIUDAD DE DATOS',short:'6 · CIUDAD DE DATOS',theme:'datos',end:3380,music:'l6',
  platforms:[{x:240,y:128,w:54},{x:340,y:112,w:50},{x:470,y:124,w:60},{x:690,y:122,w:64},{x:810,y:102,w:56},{x:950,y:124,w:60},
    {x:1150,y:126,w:50},{x:1320,y:110,w:52},{x:1700,y:122,w:60},{x:1800,y:102,w:50},
    {x:2230,y:124,w:56},{x:2380,y:108,w:50},{x:2600,y:122,w:66},{x:2750,y:104,w:60},{x:2840,y:126,w:56},{x:2990,y:118,w:50},
    // altas: torre de enlace y pantalla gigante sobre patas
    {x:856,y:62,w:42,hi:'torre'},{x:1830,y:64,w:44,hi:'pantalla'},{x:2790,y:62,w:40,hi:'torre'},
    // bloques de la arena del villano (el lado derecho queda libre para el monolito)
    {x:3110,y:128,w:34,step:1},{x:3186,y:110,w:34,step:1}],
  // túnel: pasaje de datos (cable troncal); el techo es plataforma
  tunnels:[{x:1480,w:126,y:116,k:'troncal'}],
  // pirámide: andamio de servidores
  pyramids:[{x:1940,w:150,n:4,dy:24,inset:14,mats:['rack','rack','rack','andamio']}],
  covers:[{x:600,w:20,h:16,k:'cubo',hp:10},{x:1112,w:26,h:14,k:'barra',hp:10},{x:1390,w:24,h:15,k:'cubo',hp:12},
    {x:1850,w:22,h:16,k:'pilar',hp:12},{x:2186,w:22,h:15,k:'cubo',hp:10},{x:2500,w:26,h:14,k:'barra',hp:10},
    {x:3030,w:22,h:16,k:'pilar',hp:12},{x:3160,w:24,h:15,k:'cubo',hp:16}],
  crates:[{x:200,drop:'H'},{x:400,drop:'G'},{x:640,drop:'R'},{x:1010,drop:'E'},{x:1200,drop:'+'},{x:1420,drop:'F'},{x:1800,drop:'S'},
    {x:2300,drop:'G'},{x:2640,drop:'+'},{x:2975,drop:'R'},{x:3050,drop:'E'}],
  extraCrates:[{x:520,p:0.45},{x:870,y:62,p:0.7},{x:1848,y:64,p:0.6},{x:2804,y:62,p:0.6}],
  turrets:[1890,2720],mechs:[1740],
  prisoners:[{x:290,k:'ally'},{x:830,y:102,k:'item'},{x:1530,k:'item'},{x:1810,y:102,k:'ally'},{x:2010,y:60,k:'item'},
    {x:2330,k:'item'},{x:2770,y:104,k:'item'},{x:3010,k:'ally'}],
  extraPrisoners:[{x:1850,y:64,p:0.75,k:'ally'},{x:2580,p:0.4,k:'item'}],
  // anillos de datos (k:'anillo'): se cargan cuando te acercás; tocalos y te llenan los REFLEJOS
  decor:[{x:30,k:'farol'},{x:120,k:'poste'},{x:176,k:'farol'},{x:430,k:'terminal'},{x:556,k:'antena'},{x:660,k:'farol'},
    {x:780,k:'cartel'},{x:930,k:'terminal'},{x:1060,k:'farol'},{x:1250,k:'anillo'},{x:1300,k:'poste'},{x:1440,k:'farol'},
    {x:1640,k:'terminal'},{x:2120,k:'farol'},{x:2200,k:'antena'},{x:2352,k:'terminal'},{x:2470,k:'anillo'},{x:2560,k:'farol'},
    {x:2690,k:'poste'},{x:2930,k:'anillo'},{x:2980,k:'farol'},{x:3070,k:'antena'},{x:3250,k:'terminal'},{x:3330,k:'farol'}],
  events:[
    {at:20,spawn:[{t:'soldier',x:'R',d:70},{t:'vigia',x:'R',d:150}]},
    {at:110,spawn:[{t:'soldier',x:350,y:92}]},
    {at:240,spawn:[{t:'grenadier',x:'R'},{t:'vigia',x:'R',d:50},{t:'drone',x:'R',d:120}]},
    {at:400,spawn:[{t:'soldier',x:'R'},{t:'vigia',x:'R',d:70},{t:'soldier',x:'L',d:40}]},
    {at:560,spawn:[{t:'soldier',x:830,y:82},{t:'drone',x:'R',d:30},{t:'vigia',x:'R',d:90}]},
    {at:700,spawn:[{t:'shield',x:'R'},{t:'grenadier',x:'R',d:60},{t:'vigia',x:'R',d:100}]},
    {at:1200,spawn:[{t:'soldier',x:1710,y:104},{t:'vigia',x:'R',d:30}]},
    {at:1320,spawn:[{t:'grenadier',x:1810,y:84},{t:'drone',x:'R',d:40}]},
    // cofre blindado a la salida del pasaje: al acercarte viene una oleada grande
    {at:1380,spawn:[{t:'shield',x:'R'},{t:'soldier',x:'L',d:30},{t:'grenadier',x:'R',d:60},{t:'drone',x:'L',d:90},{t:'vigia',x:'R',d:110},{t:'soldier',x:'R',d:130},{t:'soldier',x:'L',d:170}]},
    {at:1460,spawn:[{t:'shield',x:'R'},{t:'soldier',x:'R',d:40},{t:'drone',x:'R',d:90}]},
    {at:1820,spawn:[{t:'drone',x:'R'},{t:'soldier',x:2000,y:42,d:20},{t:'drone',x:'R',d:40},{t:'vigia',x:'R',d:70},{t:'shield',x:'R',d:120}]},
    {at:2260,spawn:[{t:'vigia',x:'R'},{t:'soldier',x:2620,y:104},{t:'shield',x:'R',d:30}]},
    {at:2380,spawn:[{t:'soldier',x:2780,y:86},{t:'soldier',x:'R',d:20},{t:'drone',x:'R',d:80}]},
    {at:2520,spawn:[{t:'shield',x:'R'},{t:'vigia',x:'R',d:20},{t:'grenadier',x:'R',d:70},{t:'drone',x:'R',d:110}]},
    {at:2700,spawn:[{t:'drone',x:'R'},{t:'vigia',x:'R',d:30},{t:'vigia',x:'L',d:90}]},
    {at:2620,spawn:[{t:'soldier',x:'R'},{t:'vigia',x:'R',d:40},{t:'grenadier',x:'L',d:80}]},
    {at:2840,spawn:[{t:'shield',x:'R'},{t:'grenadier',x:'R',d:40},{t:'soldier',x:'R',d:90}]},
    {at:2960,spawn:[{t:'drone',x:'R'},{t:'vigia',x:'R',d:30},{t:'shield',x:'R',d:70},{t:'soldier',x:'L',d:110}]}],
  arenas:[
    // jefe chico a un tercio; después juego normal y una emboscada; el villano al final (nunca seguidos)
    {at:1100,mini:true},
    {at:2160,waves:[
      [{t:'soldier',x:'R'},{t:'vigia',x:'R',d:30},{t:'soldier',x:'L',d:60}],
      [{t:'drone',x:'R'},{t:'vigia',x:'L',d:20},{t:'vigia',x:'R',d:80},{t:'grenadier',x:'R',d:60}],
      [{t:'shield',x:'R'},{t:'soldier',x:'L',d:30},{t:'vigia',x:'R',d:50},{t:'drone',x:'R',d:110}]]},
    {at:3060,boss:true}],
  vaults:[{x:1572}]};
// niveles.js ya agregó techos y escalones de las misiones viejas antes de que cargue este archivo: acá van los de la 6
for(const t of M6_LVL.tunnels)M6_LVL.platforms.push({x:t.x,y:t.y,w:t.w,roof:t});
for(const p of M6_LVL.pyramids)for(let i=0;i<p.n;i++)
  M6_LVL.platforms.push({x:p.x+i*p.inset,y:GROUND-(i+1)*p.dy,w:p.w-2*i*p.inset,pyr:p,tier:i,mat:p.mats[i%p.mats.length]});
M6_LVL.events.sort((a,b)=>a.at-b.at);
// el vigía cuesta como un escudero al sortear tipos (ver variarPartida)
NV_COSTO.vigia=1.6;
COB_COL.cubo=['#2a2058','#3ad8ff'];COB_COL.barra=['#1c1640','#ffb43a'];COB_COL.pilar=['#241a4a','#b06aff'];
if(typeof KILL_NAMES!=='undefined')KILL_NAMES.push(['vigia','vigías']);

// ================== utilidades y paleta ==================
const M6_sfx=n=>{if(typeof SFX!=='undefined'&&SFX[n])SFX[n]();};
const M6_C={cian:'#3ad8ff',cianC:'#aef4ff',cianO:'#1a6a9a',vio:'#b06aff',vioO:'#3a2470',amb:'#ffb43a',ambC:'#ffe0a0',noche:'#0a0620'};
// estado que se reinicia en cada partida
const M6={ev:null,foco:240,lock:false,on:false,k:1,fx:0,minT:0,calm:0,beat:0,ghosts:[],anillos:new Map(),hint:false,ducked:false,glitch:0};
const M6_FOCO=240;   // 4 s de cámara lenta (en cuadros reales) con el tanque lleno; se llena en 22 s
function M6_reset(){
  Object.assign(M6,{ev:levelEvents,foco:M6_FOCO,lock:false,on:false,k:1,fx:0,minT:0,calm:0,beat:0,ghosts:[],hint:false,glitch:0});
  M6.anillos=new Map();for(const d of M6_LVL.decor)if(d.k==='anillo')M6.anillos.set(d.x,{x:d.x,st:'idle',t:0,ch:0});
}
// falla de imagen: corta franjas horizontales de lo que ya está dibujado y las corre de costado (en pantalla, sin cámara)
function M6_glitchBand(y0,y1,n,amt){
  const s=S;
  for(let i=0;i<n;i++){const y=y0+Math.random()*(y1-y0),h=1+Math.random()*3,dx=(Math.random()*2-1)*amt;
    try{ctx.drawImage(cv,0,Math.round(y*s),cv.width,Math.max(1,Math.round(h*s)),dx,y,W,h);}catch(e){}}
}

// ================== REFLEJOS: cámara lenta al saltar entre balas ==================
// Se prende sola cuando un jugador está en el aire y una bala enemiga le pasa cerca. Dura mientras sigas en el aire
// con balas alrededor (mínimo ~0,8 s), gasta el tanque y se recarga sola. Si lo vaciás, queda bloqueada hasta el 35 %.
// juego.js llama L.timeScale() una vez por cuadro real: con menos de 1, step() se saltea cuadros (la música no cambia).
function M6_amenaza(p){
  const c=pCenter(p);
  for(const b of eproj){if(b.gone||b.kind!=='bullet')continue;const dx=c.x-b.x,dy=c.y-b.y;
    if(Math.abs(dx)<50&&Math.abs(dy)<24&&(dx*b.vx>0||Math.abs(dx)<10))return true;}
  return false;
}
const M6_aereos=()=>players.filter(p=>!p.dead&&!p.ride&&!p.onGround);
function M6_slowOn(){M6.on=true;M6.minT=50;M6.calm=0;M6.beat=0;M6_sfx('m6lento');}
function M6_slowOff(vacio){M6.on=false;if(vacio){M6.lock=true;setBanner('REFLEJOS AGOTADOS',50);}M6_sfx('m6rapido');}
function M6_detect(){
  if(M6.on){const any=M6_aereos().some(M6_amenaza);M6.calm=any?0:M6.calm+1;return;}
  if(M6.lock||M6.foco<M6_FOCO*0.15||winT)return;
  for(const p of M6_aereos())if(M6_amenaza(p)){M6_slowOn();return;}
}
M6_LVL.timeScale=function(){
  if(M6.ev!==levelEvents)M6_reset();
  if(M6.on){
    M6.foco=Math.max(0,M6.foco-1);M6.minT--;
    if(++M6.beat%32===1)M6_sfx('m6latido');
    if(M6.foco<=0)M6_slowOff(true);
    else if(M6.minT<=0&&(M6.calm>10||!M6_aereos().length))M6_slowOff(false);
  }else{
    M6.foco=Math.min(M6_FOCO,M6.foco+M6_FOCO/(22*60));
    if(M6.lock&&M6.foco>=M6_FOCO*0.35){M6.lock=false;tone('sine',700,1200,0.12,0.04);}
  }
  M6.k+=((M6.on?0.34:1)-M6.k)*(M6.on?0.3:0.2);if(!M6.on&&M6.k>0.97)M6.k=1;
  M6.fx=clamp((1-M6.k)/0.66,0,1);
  M6_duck();
  return M6.k;
};
// la música baja un poco (no cambia de tono ni de tiempo)
function M6_duck(){
  if(typeof mus==='undefined'||!mus.gain)return;
  if(M6.fx>0){mus.gain.gain.value=0.5*(1-0.45*M6.fx);M6.ducked=true;}
  else if(M6.ducked){mus.gain.gain.value=0.5;M6.ducked=false;}
}
// fracción hacia el próximo cuadro de juego (para que las balas se deslicen suaves en cámara lenta)
const M6_frac=()=>M6.k<1&&typeof tsAcc!=='undefined'?clamp(tsAcc,0,1):0;
// bala enemiga con estela: el mismo aspecto de siempre, y en cámara lenta, estela y una onda en el aire
function M6_drawBala(b){
  const f=M6_frac(),x=b.x+b.vx*f,y=b.y+b.vy*f,s=M6.fx,pk=b.m6pkt;
  if(b.m6t&&b.m6t.length>2){const t=b.m6t,n=t.length/2;
    for(let i=0;i<n;i++){const a=(i+1)/n;ctx.fillStyle=pk?`rgba(255,180,58,${0.45*a*Math.max(s,0.3)})`:`rgba(255,120,90,${0.45*a*Math.max(s,0.3)})`;
      const sz=0.8+a*1.2;ctx.fillRect(t[i*2]-sz/2,t[i*2+1]-sz/2,sz,sz);}
    ctx.strokeStyle=pk?`rgba(255,200,110,${0.35*s})`:`rgba(255,150,120,${0.35*s})`;ctx.lineWidth=0.6;ctx.beginPath();ctx.moveTo(t[0],t[1]);ctx.lineTo(x,y);ctx.stroke();}
  if(s>0.05){const ph=(T%12)/12;ctx.strokeStyle=`rgba(174,244,255,${0.5*s*(1-ph)})`;ctx.lineWidth=0.5;
    ctx.beginPath();ctx.ellipse(x-b.vx*1.5,y,2+ph*4,1+ph*2.5,Math.atan2(b.vy,b.vx),0,7);ctx.stroke();}
  if(pk){ctx.fillStyle='#4a2a08';ctx.fillRect(q(x-2),q(y-2),4,4);ctx.fillStyle=(T>>1)%2?M6_C.amb:M6_C.ambC;ctx.fillRect(q(x-1.5),q(y-1.5),3,3);ctx.fillStyle='#fff';ctx.fillRect(q(x-0.5),q(y-0.5),1,1);}
  else{ctx.fillStyle='#ff5a3c';circle(x,y,b.r);ctx.fillStyle='#ffd9b0';circle(x,y,b.r*0.5);}
}
function M6_balasUpd(){
  for(const b of eproj){
    if(b.kind!=='bullet'||b.gone)continue;
    if(!b.draw)b.draw=M6_drawBala;
    if(b.draw!==M6_drawBala)continue;
    if(M6.fx>0.05){(b.m6t||(b.m6t=[])).push(b.x,b.y);if(b.m6t.length>16)b.m6t.splice(0,2);}
    else if(b.m6t&&b.m6t.length)b.m6t.splice(0,2);
  }
}
// copias del jugador que quedan atrás mientras dura la cámara lenta
function M6_ghostsUpd(){
  for(const g of M6.ghosts)g.life--;
  M6.ghosts=M6.ghosts.filter(g=>g.life>0);
  if(M6.fx<0.3||T%3)return;
  for(const p of players){if(p.dead||p.ride)continue;const set=playerSet(p),f=p.face>0?0:1;
    const img=p.crouch?set.crouch[f]:!p.onGround?set.jump[f]:set.idle[f];
    M6.ghosts.push({x:p.x-3,y:p.crouch?p.y+3:p.y+18-img.height,img,life:15});}
  if(M6.ghosts.length>14)M6.ghosts.splice(0,M6.ghosts.length-14);
}
ON_DRAW.push(()=>{
  if(L!==M6_LVL||!M6.ghosts.length)return;
  for(const g of M6.ghosts){ctx.globalAlpha=0.32*g.life/15;ctx.drawImage(g.img,q(g.x),q(g.y));}
  ctx.globalAlpha=1;
});
// barra de REFLEJOS en el HUD (arriba a la izquierda, debajo de las bajas), como el combustible del Grillo
ON_HUD.push(()=>{
  if(L!==M6_LVL||state==='over'||state==='win')return;
  const x=45,y=27.5,w=30,f=M6.foco/M6_FOCO,low=M6.lock;
  txt('REFLEJOS',24,26.5,4,low?'#ff9a3c':M6.on?'#ffffff':'#9ae8ff','left',false);
  ctx.fillStyle='#120c18';ctx.fillRect(x-1,y-1,w+2,4.5);ctx.fillStyle='#1c1a3a';ctx.fillRect(x,y,w,2.5);
  ctx.fillStyle=low?((T>>3)%2?'#ff5a3c':'#7a2a1a'):M6.on?((T>>1)%2?'#ffffff':M6_C.cian):f<0.2?'#ff9a3c':M6_C.cian;
  ctx.fillRect(x,y,w*f,2.5);
  if(!M6.on&&!low&&f>=1&&(T>>4)%4===0){ctx.fillStyle='rgba(255,255,255,0.7)';ctx.fillRect(x+((T>>1)%16)*w/16,y,2,2.5);}
});
ON_START.push(()=>{
  if(M6.ducked&&typeof mus!=='undefined'&&mus.gain){mus.gain.gain.value=0.5;M6.ducked=false;}
  if(L===M6_LVL)M6_reset();else{M6.on=false;M6.k=1;M6.fx=0;}
});

// ================== VIGÍA: programa de seguridad holográfico ==================
// Se arma de píxeles (aviso), es rápido, de a ratos se corre de costado en un parpadeo (los tiros lo atraviesan)
// y dispara una ráfaga corta de 3: antes levanta el emisor y la visera se pone ámbar.
const M6_HEAD_V=["..............","....kkkkkk....","...kHHhhhhk...","..khhhhhhhhk..","..khssssseek..","..khsssssssk..","...kkhhhhkk..."];
const M6_TORSO_V=["....kvvvvk....","..kvvVvvVvvk..","..kvVvvvvVvk..","..kvvVvvVvvk..","...kVVVVVVk..."];
const M6_PAL_V={...PAL_E,k:'#0c1640',h:'#2a8ad0',H:'#aef4ff',s:'#0a1030',S:'#0a1030',e:'#ffb43a',r:'#3ad8ff',v:'#2a9ad8',V:'#7ae8ff',p:'#2276b8',P:'#164a86',b:'#aef4ff'};
const M6_PAL_VW=Object.fromEntries(Object.keys(M6_PAL_V).map(k=>[k,'#ffffff']));
const M6_VG=build(M6_PAL_V,M6_HEAD_V,M6_TORSO_V),M6_VGW=build(M6_PAL_VW,M6_HEAD_V,M6_TORSO_V);
function M6_mkVigia(x,y){
  // si viene de un borde (x:'R' o 'L') se arma adentro de la pantalla, cerca de ese borde
  const edge=Math.abs(x-(camX+VW+12))<0.5||Math.abs(x-(camX-20))<0.5;
  const hx=edge?clamp(x,camX+26,camX+VW-36):x,hy=y??GROUND-18;
  const e=mkSoldier(hx,hy,'soldier');
  Object.assign(e,{type:'vigia',hp:4,score:300,spd:1.05,range:rand(55,115),st:'mat',matT:40,hx,hy,x:-9999,
    dcd:rand(40,90),dodge:0,ddir:1,burst:0,bt:0,upd:M6_updVigia,draw:M6_drawVigia,onKill:M6_killVigia});
  return e;
}
ENEMY_MAKERS.vigia=M6_mkVigia;
function M6_updVigia(e){
  if(e.flash>0)e.flash--;
  if(e.st==='mat'){                                                    // se arma de píxeles: todavía no se le puede pegar
    e.x=-9999;
    const vis=e.hx>camX-4&&e.hx<camX+VW-4;
    if(vis&&!e.matS){e.matS=1;M6_sfx('m6arma');}
    if(vis&&--e.matT<=0){e.st='walk';e.x=e.hx;e.y=e.hy;e.vy=0;}
    if(e.hx<camX-60)e.gone=true;
    return;
  }
  if(e.st==='dodge'){                                                  // paso al costado: un parpadeo donde no está
    e.dodge--;e.hx=clamp(e.hx+e.ddir*0.75,camX+4,camX+VW-12);
    e.x=e.dodge>3&&e.dodge<15?-9999:e.hx;
    if(e.dodge<=0){e.st='walk';e.x=e.hx;}
    return;
  }
  const px=P.x+4,ex=e.x+e.w/2,wasAir=!e.onGround;
  if(!e.air&&e.state!=='burst')e.face=px<ex?-1:1;
  const d=Math.abs(px-ex);
  if(e.jcd>0)e.jcd--;
  if(e.dcd>0)e.dcd--;
  else if(e.onGround&&e.state==='walk'){
    for(const b of pbul){if(b.gone||b.k==='flame')continue;const dx=(e.x+4)-b.x;
      if(Math.abs(dx)<34&&dx*b.vx>0&&Math.abs(b.y-(e.y+9))<11){
        if(Math.random()<0.6){e.st='dodge';e.dodge=18;e.ddir=Math.sign(b.vx)||1;e.dcd=rand(170,260);e.vx=0;e.hx=e.x;M6_sfx('m6paso');return;}
        e.dcd=40;break;}}
  }
  if(e.air&&!e.onGround){/* conserva el impulso del salto */}
  else if(e.state==='walk'){
    // se acerca hasta su distancia; ahí no se queda quieto: se mueve de a ratos
    e.vx=d>e.range?e.face*e.spd:d<40?-e.face*e.spd:(Math.sin((T+e.ph)/36)>0.55?e.face*e.spd*0.6:0);
    if(e.onGround)e.air=false;
    chaseStep(e,px,ex);
    if(e.x<camX+6)e.vx=0.9;else if(e.x>camX+VW-14)e.vx=-0.9;
    if(!P.dead&&onScreen(e,-6))e.cd--;
    if(e.cd<=0&&e.onGround&&!e.air){e.state='aim';e.t=30;M6_sfx('m6carga');}
  }else if(e.state==='aim'){e.vx=0;if(--e.t<=0){e.state='burst';e.burst=3;e.bt=0;}}
  else if(e.state==='burst'){e.vx=0;
    if(--e.bt<=0){
      const sx=ex+e.face*8,sy=e.y+9,dy=(P.y+(P.crouch?11:8))-sy,sp=2.5,tt=Math.max(1,d/sp);
      eproj.push({kind:'bullet',x:sx,y:sy,vx:e.face*sp,vy:clamp(dy/tt,-0.9,0.9),g:0,r:1.6,t:0});SFX.eshoot();
      parts.push({k:'flash',x:sx,y:sy,life:3,maxl:3,size:3});e.rec=1.3;e.burst--;e.bt=7;
      if(e.burst<=0){e.state='walk';e.post=10;e.cd=rand(110,170)*DIFF().fire;}
    }}
  if(e.state==='aim'||e.state==='burst')e.raise=Math.min(1,e.raise+0.28);else if(e.post>0)e.post--;else e.raise=Math.max(0,e.raise-0.25);
  if(e.vx)e.anim++;
  if(e.kbx){e.x+=e.kbx;e.kbx*=0.5;if(Math.abs(e.kbx)<0.15)e.kbx=0;}
  e.x+=e.vx*(L.speedMul?L.speedMul(e):1);const pb=e.y+e.h;e.vy=Math.min(e.vy+0.32,6);e.y+=e.vy;const vyA=e.vy;land(e,pb,true);
  if(wasAir&&e.onGround&&e.air){
    e.air=false;e.jcd=(e.jcd|0)+rand(16,26)|0;
    if(e.jy!==undefined){if(e.y+e.h>=e.jy-2&&++e.jfail>=2){e.jfail=0;e.jcd=150;}else if(e.y+e.h<e.jy-2)e.jfail=0;e.jy=undefined;}
  }
  if(e.plat&&!e.drop)e.x=clamp(e.x,e.plat.x,e.plat.x+e.plat.w-e.w);
  animStep(e,wasAir,vyA);
  e.hx=e.x;e.hy=e.y;
  if(e.x<camX-60)e.gone=true;
}
// se arma: píxeles que caen y se juntan en la silueta, con un anillo ámbar en el piso
function M6_drawMat(e){
  if(e.hx<camX-20||e.hx>camX+VW+4)return;
  const k=1-e.matT/40,x=e.hx,y=e.hy,on=(T>>1)%2;
  ctx.strokeStyle=`rgba(255,180,58,${0.4+0.5*k})`;ctx.lineWidth=0.8;ctx.beginPath();ctx.ellipse(x+4,y+18,6+k*2,1.4,0,0,7);ctx.stroke();
  ctx.fillStyle=`rgba(58,216,255,${0.10+0.2*k})`;ctx.fillRect(x-1,y+18-k*20,10,k*20);
  for(let i=0;i<10;i++){const hh=hash(i*17+(e.ph|0)),tx=x+hh*8,ty=y+((i*5)%18),sy=ty-(1-k)*(30+hh*30);
    ctx.fillStyle=i%3?M6_C.cian:M6_C.cianC;ctx.fillRect(q(tx),q(sy),1,1);}
  if(k>0.55){ctx.globalAlpha=(k-0.55)/0.45*(on?0.8:0.5);M6_rig(e,x,y,M6_VG);ctx.globalAlpha=1;}
}
function M6_rig(e,x,y,set){const pose=rigPose(e,e.ph);drawRig(set,pose,e.face>0?0:1,x-3,y);return pose;}
function M6_drawVigia(e){
  if(e.st==='mat'){M6_drawMat(e);return;}
  const dodging=e.st==='dodge',x=dodging?e.hx:e.x,y0=e.y;
  if(dodging){ // estela de copias que se corren
    for(let k=3;k>=1;k--){ctx.globalAlpha=0.16*k;M6_rig(e,x-e.ddir*k*3,y0,M6_VG);}
    ctx.globalAlpha=(T>>1)%2?0.35:0.6;
  }else ctx.globalAlpha=0.86+0.14*Math.sin((T+e.ph)/5);
  // a veces parpadea: se corre una franja
  const glitch=!dodging&&hash(((T>>2)+(e.ph|0))|0)<0.08;
  const pose=M6_rig(e,x+(glitch?rand(-1.5,1.5):0),y0,e.flash?M6_VGW:M6_VG);
  ctx.globalAlpha=1;
  const cx=x+4+pose.ux,y=y0+pose.uy,fc=e.face;
  // líneas de barrido sobre el cuerpo
  ctx.fillStyle='rgba(10,6,32,0.35)';for(let i=1;i<18;i+=3)ctx.fillRect(q(x-1),q(y0+i+((T>>2)%3)),9,0.6);
  if(glitch){ctx.fillStyle='rgba(176,106,255,0.6)';ctx.fillRect(q(x-3+rand(-2,2)),q(y0+rand(2,14)),12,1);}
  // emisor de luz en la mano
  const gy=11-Math.round(e.raise*2),bx=(fc>0?cx+1:cx-7)-fc*(e.rec||0);
  ctx.fillStyle='#1a1440';ctx.fillRect(q(bx),q(y+gy),6,2);
  ctx.fillStyle=e.state==='aim'||e.state==='burst'?((T>>1)%2?M6_C.ambC:M6_C.amb):M6_C.cian;ctx.fillRect(q(fc>0?bx+5:bx-0.5),q(y+gy+0.3),1.5,1.4);
  // aviso: la visera se pone ámbar y titila; al final, punto ámbar en la boca del emisor
  if(e.state==='aim'){
    if((T>>1)%2){ctx.fillStyle=M6_C.ambC;ctx.fillRect(q(fc>0?cx+1:cx-6),q(y+4),5,1);}
    if(e.t<12){ctx.fillStyle='rgba(255,180,58,0.5)';circle(fc>0?bx+7:bx-1.5,y+gy+1,2.6);ctx.fillStyle='#fff';ctx.fillRect(q(fc>0?bx+6.5:bx-2),q(y+gy+0.5),1,1);}
  }
}
function M6_killVigia(e){
  const x=e.hx??e.x,y=e.y;
  for(let i=0;i<18;i++)parts.push({k:'p',x:x+rand(-1,9),y:y+rand(0,18),vx:rand(-0.8,0.8),vy:rand(-1.4,-0.2),g:-0.015,life:rand(18,36),maxl:36,size:i%3?1:1.5,col:pick([M6_C.cian,M6_C.cianC,M6_C.vio,'#ffffff'])});
  parts.push({k:'ring',x:x+4,y:y+9,r:2,max:13,life:12,maxl:12,col:'58,216,255'});
  M6.glitch=Math.max(M6.glitch,5);M6_sfx('m6falla');SFX.down();
  if(Math.random()<0.1)pickups.push({kind:pick(['H','S','F','R','G','E','+']),x,y,w:10,h:10,vy:-2.5,life:700});
}

// ================== anillos de datos ==================
// Al acercarte se encienden y giran; si lo atravesás, te llena los REFLEJOS y suelta un premio (uno por anillo).
function M6_anillosUpd(){
  for(const a of M6.anillos.values()){
    a.t++;
    if(a.st==='done')continue;
    const near=players.some(p=>!p.dead&&Math.abs(pCenter(p).x-(a.x+7))<90);
    if(a.st==='idle'&&near){a.st='on';M6_sfx('m6anillo');}
    if(a.st==='on'){a.ch=Math.min(1,a.ch+0.03);
      if(a.t%40===0&&a.x>camX&&a.x<camX+VW)M6_sfx('m6anillo');
      const box={x:a.x+1,y:GROUND-26,w:12,h:26};
      const p=players.find(p=>!p.dead&&overlap(hurtbox(p),box));
      if(p){a.st='done';a.t=0;M6.foco=M6_FOCO;M6.lock=false;addScore(300,a.x+7,GROUND-30);
        pickups.push({kind:pick(['H','S','F','R','G','E']),x:a.x+2,y:GROUND-30,w:10,h:10,vy:-2.5,life:900});
        setBanner('¡REFLEJOS AL MÁXIMO!',70);M6_sfx('m6carga2');
        parts.push({k:'ring',x:a.x+7,y:GROUND-13,r:3,max:24,life:16,maxl:16,col:'255,180,58'});
        for(let i=0;i<12;i++)parts.push({k:'p',x:a.x+7,y:GROUND-13,vx:rand(-1.6,1.6),vy:rand(-2.4,-0.4),g:0.05,life:rand(18,30),maxl:30,size:1,col:i%2?M6_C.amb:M6_C.cianC});}
    }
  }
}
function M6_drawAnillo(d){
  const a=M6.anillos.get(d.x)||{st:'idle',t:0,ch:0},x=d.x+7,g=GROUND,cy=g-13;
  // base: pedestal de grilla
  ctx.fillStyle='#120c2a';ctx.fillRect(d.x-2,g-3,18,3);ctx.fillStyle=M6_C.vioO;ctx.fillRect(d.x-2,g-3,18,0.8);
  const on=a.st==='on',done=a.st==='done',k=on?a.ch:done?0:0.15;
  // aro de datos: elipse que gira (dos arcos) con marcas
  const rot=a.t*(on?0.12:0.02);
  ctx.lineWidth=1.4;ctx.strokeStyle=done?'#2a2050':on?M6_C.amb:'#4a3a8a';
  ctx.beginPath();ctx.ellipse(x,cy,6,11,0,rot,rot+2.4);ctx.stroke();ctx.beginPath();ctx.ellipse(x,cy,6,11,0,rot+Math.PI,rot+Math.PI+2.4);ctx.stroke();
  ctx.lineWidth=0.7;ctx.strokeStyle=done?'#1c1640':M6_C.cian;ctx.beginPath();ctx.ellipse(x,cy,4,8,0,-rot,-rot+4);ctx.stroke();
  if(!done){for(let i=0;i<6;i++){const an=rot*1.5+i*1.047,px=x+Math.cos(an)*6,py=cy+Math.sin(an)*11;ctx.fillStyle=i%2?M6_C.ambC:M6_C.cianC;ctx.fillRect(q(px-0.5),q(py-0.5),1,1);}}
  if(on){ctx.fillStyle=`rgba(255,180,58,${0.10+0.15*k+0.08*Math.sin(a.t/4)})`;ctx.beginPath();ctx.ellipse(x,cy,5,10,0,0,7);ctx.fill();
    if((a.t>>3)%2){ctx.fillStyle=M6_C.ambC;ctx.fillRect(x-0.5,g-31,1,3);ctx.fillRect(x-2,g-30,4,1);}}
  else if(done){ctx.fillStyle='rgba(58,216,255,0.06)';ctx.beginPath();ctx.ellipse(x,cy,5,10,0,0,7);ctx.fill();}
}

// ================== ganchos por cuadro ==================
M6_LVL.upd=function(){
  if(M6.ev!==levelEvents)M6_reset();
  if(!M6.hint&&T>=200){M6.hint=true;toast('REFLEJOS','Saltá entre las balas: el tiempo se frena','#9ae8ff');}
  M6_detect();M6_balasUpd();M6_ghostsUpd();M6_anillosUpd();
  if(M6.glitch>0)M6.glitch--;
};

// ================== fondo precalculado ==================
const M6_R=mulberry32(606);
function M6_canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return[c,c.getContext('2d')];}
// edificio de bloques de datos: torre escalonada con bordes que brillan y una grilla de celdas encendidas
function M6_torre(g,x,base,w,h,lejos){
  const pisos=lejos?3:4,R=M6_R;
  let y=base,ww=w,xx=x;
  for(let s=0;s<pisos&&y>base-h;s++){
    const sh=Math.min(y-(base-h),h/pisos+R()*h*0.15),top=y-sh;
    g.fillStyle=lejos?'#130c30':'#1a1040';g.fillRect(xx,top,ww,sh);
    // celdas: grilla de "datos" con algunas encendidas (cian, violeta, ámbar)
    const cw=lejos?3:4,ch=lejos?3:4;
    for(let cy=top+3;cy<y-2;cy+=ch)for(let cx=xx+2;cx<xx+ww-2;cx+=cw){const r=R();
      if(r<(lejos?0.16:0.26)){g.fillStyle=r<0.02?'#ffb43a':r<0.07?(lejos?'#5a3aa0':'#8a5ad8'):(lejos?'#1e4a7a':'#2a7ab0');g.fillRect(cx,cy,cw-1,1);}
      else if(!lejos&&r<0.4){g.fillStyle='#22185a';g.fillRect(cx,cy,cw-1,1);}}
    g.fillStyle=lejos?'#2a2a7a':'#3a8ad0';g.fillRect(xx,top,ww,1);g.fillRect(xx,top,1,sh);     // bordes que brillan
    g.fillStyle=lejos?'#0c0824':'#100a2c';g.fillRect(xx+ww-2,top,2,sh);
    y=top;const nw=ww*(0.62+R()*0.25);xx+=(ww-nw)*(0.2+R()*0.6);ww=Math.max(6,nw);
  }
  if(!lejos&&R()<0.6){g.fillStyle='#3a8ad0';g.fillRect(xx+ww/2,y-10,1,10);}                 // antena
}
const M6_FAR=(()=>{const [c,g]=M6_canvas(640,110);let x=0;while(x<640){const w=14+M6_R()*26;M6_torre(g,x,110,w,30+M6_R()*70,true);x+=w+2+M6_R()*10;}return c;})();
const M6_MID=(()=>{const [c,g]=M6_canvas(900,150);let x=0;const tops=[];while(x<900){const w=30+M6_R()*40,h=60+M6_R()*80;M6_torre(g,x,150,w,h,false);tops.push([x,w,h]);x+=w+8+M6_R()*26;}c.tops=tops;return c;})();
// franjas de 32 px de cada capa, recortadas desde el primer píxel dibujado: así no se mezcla cielo vacío
function M6_franjas(c){const g=c.getContext('2d'),d=g.getImageData(0,0,c.width,c.height).data,out=[];
  for(let x=0;x<c.width;x+=32){const w=Math.min(32,c.width-x);let top=c.height;
    for(let y=0;y<c.height&&top===c.height;y++)for(let i=x;i<x+w;i++)if(d[(y*c.width+i)*4+3]){top=y;break;}
    out.push({x,w,top});}
  c.fr=out;return c;}
M6_franjas(M6_FAR);M6_franjas(M6_MID);
function M6_capa(c,off,y0){for(const f of c.fr){if(f.top>=c.height)continue;for(const rep of [0,c.width]){const sx=f.x-off+rep;if(sx>W||sx+f.w<0)continue;
  ctx.drawImage(c,f.x,f.top,f.w,c.height-f.top,sx,y0+f.top,f.w,c.height-f.top);}}}
// velo de la cámara lenta (tinte frío, líneas de barrido, bordes oscuros), precalculado una vez
const M6_VELO=(()=>{const [c,g]=M6_canvas(W*2,H*2);g.scale(2,2);
  g.fillStyle='rgba(80,200,255,0.07)';g.fillRect(0,0,W,H);
  g.fillStyle='rgba(10,4,30,0.14)';for(let y=0;y<H;y+=3)g.fillRect(0,y,W,0.7);
  const v=g.createRadialGradient(W/2,H/2,H*0.45,W/2,H/2,H*1.05);v.addColorStop(0,'rgba(5,3,26,0)');v.addColorStop(1,'rgba(5,3,26,0.7)');
  g.fillStyle=v;g.fillRect(0,0,W,H);g.fillStyle='rgba(174,244,255,0.5)';g.fillRect(0,0,W,0.8);g.fillRect(0,H-0.8,W,0.8);return c;})();
// luces que parpadean sobre las torres del medio (coordenadas del lienzo M6_MID)
const M6_BLINK=Array.from({length:26},()=>{const t=pick(M6_MID.tops);return{x:t[0]+3+M6_R()*(t[1]-6),y:150-M6_R()*t[2]*0.8,s:(M6_R()*999)|0};});
// cubos de datos que flotan en el cielo
const M6_CUBOS=Array.from({length:9},()=>({x:M6_R()*700,y:14+M6_R()*50,s:2+M6_R()*3,ph:M6_R()*6.28,v:0.3+M6_R()*0.5}));
// motas de luz que suben (adelante del todo, muy pocas)
const M6_MOTAS=Array.from({length:22},()=>({x:M6_R(),y:M6_R(),v:0.3+M6_R()*0.7,s:M6_R()}));

// cielo: degradado y núcleo ámbar, precalculados al tamaño real del lienzo (se copian sin escalar)
let M6_SKY=null;
function M6_cielo(){
  if(!M6_SKY||M6_SKY.width!==cv.width||M6_SKY.height!==cv.height){
    const [c,g]=M6_canvas(cv.width,cv.height);g.scale(cv.width/W,cv.height/H);
    const gr=g.createLinearGradient(0,0,0,GROUND);
    gr.addColorStop(0,'#05031a');gr.addColorStop(0.5,'#140a38');gr.addColorStop(0.82,'#2a1258');gr.addColorStop(1,'#46207a');
    g.fillStyle=gr;g.fillRect(0,0,W,H);
    const disco=(r,col)=>{g.fillStyle=col;g.beginPath();g.arc(230,92,r,0,7);g.fill();};
    disco(34,'rgba(255,180,58,0.07)');disco(20,'rgba(255,180,58,0.16)');disco(12,'#ffb43a');
    g.fillStyle='#2a1258';for(let i=0;i<4;i++)g.fillRect(216,92+i*3,28,1+i*0.4);
    M6_SKY=c;}
  GN_cubre(M6_SKY); // el cielo cubre lo que se ve, también en el lienzo chico (base.js)
}
M6_LVL.drawBG=function(){
  const HZ=126;
  M6_cielo();
  // grilla del cielo: líneas finas que se van hacia el fondo
  ctx.fillStyle='rgba(120,90,255,0.08)';
  const go=((camX*0.03)%24+24)%24;for(let x=-go;x<W;x+=24)ctx.fillRect(x,0,0.6,HZ-30);
  for(let y=8;y<HZ-30;y+=y<40?10:14)ctx.fillRect(0,y,W,0.5);
  // cubos flotantes
  for(const c of M6_CUBOS){const x=((c.x-camX*0.04)%700+700)%700-40,y=c.y+Math.sin(T/60*c.v+c.ph)*3;
    ctx.strokeStyle='rgba(58,216,255,0.35)';ctx.lineWidth=0.6;ctx.strokeRect(x,y,c.s,c.s);ctx.strokeRect(x+c.s*0.4,y-c.s*0.4,c.s,c.s);}
  // ciudad lejana y torres del medio (lienzos precalculados)
  const fo=((camX*0.1)%640+640)%640;M6_capa(M6_FAR,fo,HZ-110+14);
  const mo=((camX*0.3)%900+900)%900;M6_capa(M6_MID,mo,GROUND-150);
  for(const b of M6_BLINK){const on=hash(((T>>3)+b.s)|0)<0.35;if(!on)continue;let x=b.x-mo;if(x<-4)x+=900;if(x>W)continue;
    ctx.fillStyle=b.s%5===0?M6_C.amb:M6_C.cianC;ctx.fillRect(x,b.y,2,1);}
  // pulsos de datos que suben por algunas torres
  for(let i=0;i<5;i++){const t=M6_MID.tops[(i*7)%M6_MID.tops.length];let x=t[0]+t[1]/2-mo;if(x<-4)x+=900;if(x>W)continue;
    const yy=GROUND-((T*0.8+i*53)%t[2]);ctx.fillStyle='rgba(174,244,255,0.7)';ctx.fillRect(x,yy,1,3);}
  // bruma violeta al pie de las torres
  const hz=ctx.createLinearGradient(0,GROUND-34,0,GROUND);hz.addColorStop(0,'rgba(70,32,122,0)');hz.addColorStop(1,'rgba(90,50,160,0.55)');
  ctx.fillStyle=hz;ctx.fillRect(0,GROUND-34,W,34);
};

// ================== suelo: avenida de grilla ==================
M6_LVL.drawGround=function(){
  const x0=Math.floor(camX)-10;
  ctx.fillStyle='#0c0820';ctx.fillRect(x0,GROUND,W+20,H-GROUND);
  // vereda con borde que brilla
  ctx.fillStyle='#1a1240';ctx.fillRect(x0,GROUND,W+20,5);
  ctx.fillStyle=M6_C.cian;ctx.fillRect(x0,GROUND,W+20,0.7);ctx.fillStyle='#2a1c5a';ctx.fillRect(x0,GROUND+5,W+20,0.8);
  ctx.fillStyle='#120c2e';for(let t=Math.floor(camX/12)-1;t<(camX+VW)/12+1;t++)ctx.fillRect(t*12,GROUND+0.7,0.6,4.3);
  // calle: grilla en perspectiva (líneas que se abren hacia adelante) y franjas horizontales
  ctx.fillStyle='rgba(176,106,255,0.28)';
  for(const y of [GROUND+8,GROUND+11.5,GROUND+16,GROUND+22])ctx.fillRect(x0,y,W+20,0.6);
  ctx.strokeStyle='rgba(58,216,255,0.22)';ctx.lineWidth=0.6;ctx.beginPath();
  const cx=camX+VW/2;
  for(let t=Math.floor(camX/16)-6;t<(camX+VW)/16+6;t++){const xa=t*16,xb=cx+(xa-cx)*1.9;ctx.moveTo(xa,GROUND+6);ctx.lineTo(xb,H);}
  ctx.stroke();
  // celdas del piso que se encienden de a una
  for(let t=Math.floor(camX/16);t<(camX+VW)/16;t++){const h=hash(t*31+((T>>4)|0));if(h<0.06){ctx.fillStyle=h<0.015?'rgba(255,180,58,0.35)':'rgba(58,216,255,0.25)';ctx.fillRect(t*16+1,GROUND+8.6,14,2.9);}}
  // marcas ámbar en la calle
  ctx.fillStyle='rgba(255,180,58,0.55)';for(let t=Math.floor(camX/48)-1;t<(camX+VW)/48+1;t++)ctx.fillRect(t*48+10,GROUND+13.5,14,0.8);
};

// ================== capa de arriba: efecto de cámara lenta, fallas de imagen y motas ==================
M6_LVL.drawFx=function(){
  // motas de luz
  for(const m of M6_MOTAS){const x=((m.x*W-camX*0.9)%W+W)%W,y=((m.y*H-T*0.25*m.v)%H+H)%H;
    ctx.fillStyle=m.s>0.8?'rgba(255,200,110,0.55)':'rgba(174,244,255,0.35)';ctx.fillRect(x,y,m.s>0.9?1.2:0.8,m.s>0.9?1.2:0.8);}
  // cámara lenta: tinte frío, líneas de barrido y bordes oscuros
  const s=M6.fx;
  if(s>0){ctx.globalAlpha=s;ctx.drawImage(M6_VELO,0,0,W,H);ctx.globalAlpha=1;}
  // falla de imagen cuando cae un vigía (y en los golpes fuertes de los jefes, ver jefes6.js)
  if(M6.glitch>0&&state==='play')M6_glitchBand(20,GROUND,2+M6.glitch%3,4);
  if(state!=='play'&&state!=='pause'&&M6.ducked)M6_duck();
};

// ================== decorado ==================
M6_LVL.drawDecor=function(d){
  const x=d.x,g=GROUND;
  switch(d.k){
  case 'anillo':M6_drawAnillo(d);return true;
  case 'farol':{ // farol de luz fría: poste fino, cabeza cuadrada y cono de luz
    ctx.fillStyle='#1c1440';ctx.fillRect(x+3,g-34,1.6,34);ctx.fillRect(x,g-35,9,2);ctx.fillRect(x+1,g-2,6,2);
    const fl=hash(((T>>2)+x)|0)<0.03?0.3:1;
    ctx.fillStyle=`rgba(174,244,255,${0.9*fl})`;ctx.fillRect(x+5,g-33,4,1);
    ctx.fillStyle=`rgba(58,216,255,${0.07*fl})`;ctx.beginPath();ctx.moveTo(x+5,g-32);ctx.lineTo(x-6,g);ctx.lineTo(x+20,g);ctx.lineTo(x+9,g-32);ctx.fill();
    ctx.fillStyle=`rgba(58,216,255,${0.12*fl})`;ctx.beginPath();ctx.ellipse(x+7,g,12,1.5,0,0,7);ctx.fill();
    return true;}
  case 'poste':{ // poste de grilla con cables que cuelgan y pulsos que corren
    ctx.fillStyle='#1a1240';ctx.fillRect(x,g-46,3,46);ctx.fillStyle=M6_C.vioO;ctx.fillRect(x,g-46,1,46);
    ctx.fillRect(x-6,g-42,15,1.5);
    ctx.strokeStyle='#2a1c5a';ctx.lineWidth=0.6;ctx.beginPath();ctx.moveTo(x-6,g-41);ctx.quadraticCurveTo(x-30,g-30,x-60,g-40);ctx.moveTo(x+9,g-41);ctx.quadraticCurveTo(x+34,g-31,x+64,g-41);ctx.stroke();
    const ph=(T%80)/80;ctx.fillStyle=M6_C.cianC;ctx.fillRect(x+9+ph*52,g-41+Math.sin(ph*Math.PI)*9,1.5,1);
    ctx.fillStyle=(T>>4)%3?M6_C.amb:'#5a3a10';ctx.fillRect(x+0.5,g-48,2,2);
    return true;}
  case 'terminal':{ // terminal pública: pantalla con barras que suben y bajan
    ctx.fillStyle='#160e36';ctx.fillRect(x,g-20,12,20);ctx.fillStyle='#2a1c5a';ctx.fillRect(x,g-20,12,1);
    ctx.fillStyle='#05031a';ctx.fillRect(x+2,g-18,8,7);
    for(let i=0;i<4;i++){const h=1+Math.abs(Math.sin(T/14+i*1.3+x))*5;ctx.fillStyle=i===2?M6_C.amb:M6_C.cian;ctx.fillRect(x+2.5+i*2,g-11.5-h,1.2,h);}
    ctx.fillStyle='#22185a';ctx.fillRect(x+2,g-9,8,1);ctx.fillRect(x+2,g-7,8,1);
    ctx.fillStyle=(T>>5)%2?M6_C.cianC:'#1a6a9a';ctx.fillRect(x+9,g-4,1.5,1.5);
    return true;}
  case 'antena':{ // antena de enlace: mástil con aros y una luz que late
    ctx.strokeStyle='#2a1c5a';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x,g);ctx.lineTo(x+5,g-52);ctx.lineTo(x+10,g);ctx.stroke();
    ctx.lineWidth=0.5;ctx.beginPath();for(let y=g-8;y>g-48;y-=8){const k=(g-y)/52*5;ctx.moveTo(x+k,y);ctx.lineTo(x+10-k,y-8);}ctx.stroke();
    const p=(T%60)/60;ctx.strokeStyle=`rgba(176,106,255,${0.6*(1-p)})`;ctx.lineWidth=0.7;ctx.beginPath();ctx.arc(x+5,g-54,2+p*10,0,7);ctx.stroke();
    ctx.fillStyle=(T>>3)%2?M6_C.vio:'#ffffff';ctx.fillRect(x+4,g-55,2,2);
    return true;}
  case 'cartel':{ // cartel de luz: flechas que corren (sin letras)
    ctx.fillStyle='#120c2e';ctx.fillRect(x+4,g-18,2,18);ctx.fillRect(x+22,g-18,2,18);
    ctx.fillStyle='#05031a';ctx.fillRect(x,g-30,28,12);ctx.strokeStyle=M6_C.vio;ctx.lineWidth=0.6;ctx.strokeRect(x+0.5,g-29.5,27,11);
    for(let i=0;i<4;i++){const ax=x+2+((T*0.4+i*7)%26);if(ax>x+25)continue;ctx.fillStyle=i%2?M6_C.amb:M6_C.cian;
      ctx.fillRect(ax,g-25,1,3);ctx.fillRect(ax+1,g-24.5,1,2);ctx.fillRect(ax+2,g-24,1,1);}
    return true;}
  }
  return false;
};

// ================== plataformas ==================
M6_LVL.drawPlat=function(pl){
  if(pl.roof){M6_troncalBack(pl);return true;}
  if(pl.pyr){M6_tier(pl);return true;}
  if(pl.hi==='torre'){M6_torreEnlace(pl);return true;}
  if(pl.hi==='pantalla'){M6_pantalla(pl);return true;}
  if(pl.step){M6_bloque(pl.x,pl.y,pl.w,GROUND-pl.y);return true;}
  M6_pasarela(pl);return true;
};
// pasarela de luz: losa con borde cian sostenida por un haz
function M6_pasarela(pl){
  const x=pl.x,y=pl.y,w=pl.w;
  ctx.fillStyle='rgba(58,216,255,0.06)';ctx.fillRect(x+w/2-6,y+4,12,GROUND-y-4);
  ctx.fillStyle='rgba(58,216,255,0.25)';ctx.fillRect(x+w/2-0.5,y+4,1,GROUND-y-4);
  for(let i=0;i<3;i++){const yy=y+5+((T*0.5+i*(GROUND-y)/3)%(GROUND-y-6));ctx.fillStyle='rgba(174,244,255,0.5)';ctx.fillRect(x+w/2-2,yy,4,0.7);}
  ctx.fillStyle='#1c1444';ctx.fillRect(x,y,w,4);
  ctx.fillStyle=M6_C.cian;ctx.fillRect(x,y,w,0.9);
  ctx.fillStyle='#2a1c5a';for(let i=6;i<w;i+=8)ctx.fillRect(x+i,y+1,0.7,3);
  ctx.fillStyle='#0a0620';ctx.fillRect(x,y+4,w,1);
  ctx.fillStyle=M6_C.amb;ctx.fillRect(x+1,y+2,1.5,1);ctx.fillRect(x+w-2.5,y+2,1.5,1);
}
// bloque de datos macizo (escalones de la arena final y coberturas)
function M6_bloque(x,y,w,h){
  ctx.fillStyle='#1a1040';ctx.fillRect(x,y,w,h);
  ctx.fillStyle='#22185a';for(let r=y+4;r<y+h-1;r+=4)for(let c=x+2;c<x+w-2;c+=4)if(hash(r*7+c)<0.3)ctx.fillRect(c,r,3,1);
  ctx.fillStyle=M6_C.cian;ctx.fillRect(x,y,w,0.9);ctx.fillStyle='#3a8ad0';ctx.fillRect(x,y,0.8,h);
  ctx.fillStyle='rgba(0,0,0,0.35)';ctx.fillRect(x+w-2,y,2,h);
  if(hash((x|0)+((T>>4)|0))<0.4){ctx.fillStyle=M6_C.amb;ctx.fillRect(x+3,y+2,2,1);}
}
// torre de enlace: plataforma redonda arriba de un mástil reticulado
function M6_torreEnlace(pl){
  const x=pl.x,y=pl.y,w=pl.w,cx=x+w/2;
  ctx.strokeStyle='#22185a';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(cx-8,GROUND);ctx.lineTo(cx-3,y+6);ctx.moveTo(cx+8,GROUND);ctx.lineTo(cx+3,y+6);ctx.stroke();
  ctx.lineWidth=0.6;ctx.beginPath();for(let yy=y+12;yy<GROUND;yy+=10){const k=(GROUND-yy)/(GROUND-y)*5;ctx.moveTo(cx-8+k,yy);ctx.lineTo(cx+8-k,yy+10);ctx.moveTo(cx+8-k,yy);ctx.lineTo(cx-8+k,yy+10);}ctx.stroke();
  // pulso que sube por el mástil
  const yy=GROUND-((T*1.2)%(GROUND-y-6));ctx.fillStyle='rgba(174,244,255,0.8)';ctx.fillRect(cx-1,yy,2,2);
  ctx.fillStyle='#1c1444';ctx.beginPath();ctx.moveTo(x-1,y);ctx.lineTo(x+w+1,y);ctx.lineTo(x+w-5,y+7);ctx.lineTo(x+5,y+7);ctx.closePath();ctx.fill();
  ctx.fillStyle=M6_C.cian;ctx.fillRect(x-1,y,w+2,0.9);ctx.fillStyle=M6_C.vio;ctx.fillRect(x+5,y+6,w-10,0.8);
  for(let i=0;i<4;i++){ctx.fillStyle=((T>>3)+i)%4===0?M6_C.amb:'#3a2470';ctx.fillRect(x+6+i*(w-12)/3-1,y+3,2,1.5);}
}
// pantalla gigante sobre patas: la pasarela de arriba se camina
function M6_pantalla(pl){
  const x=pl.x,y=pl.y,w=pl.w;
  ctx.fillStyle='#120c2e';ctx.fillRect(x+7,y+26,3,GROUND-y-26);ctx.fillRect(x+w-10,y+26,3,GROUND-y-26);
  ctx.strokeStyle='#120c2e';ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(x+9,y+40);ctx.lineTo(x+w-9,y+64);ctx.moveTo(x+w-9,y+40);ctx.lineTo(x+9,y+64);ctx.stroke();
  ctx.fillStyle='#22185a';ctx.fillRect(x-2,y+3,w+4,24);
  ctx.fillStyle='#05031a';ctx.fillRect(x,y+5,w,20);
  // contenido: ondas y una grilla que se desplaza (sin letras)
  ctx.save();ctx.beginPath();ctx.rect(x,y+5,w,20);ctx.clip();
  ctx.fillStyle='rgba(58,216,255,0.18)';for(let i=((T*0.3)%6);i<w;i+=6)ctx.fillRect(x+i,y+5,0.6,20);
  ctx.strokeStyle=M6_C.cian;ctx.lineWidth=0.8;ctx.beginPath();for(let i=0;i<=w;i+=2){const yy=y+15+Math.sin(i/5+T/10)*4*Math.sin(T/40);if(i)ctx.lineTo(x+i,yy);else ctx.moveTo(x+i,yy);}ctx.stroke();
  ctx.strokeStyle=M6_C.amb;ctx.lineWidth=0.6;ctx.beginPath();for(let i=0;i<=w;i+=2){const yy=y+15+Math.cos(i/7-T/14)*3;if(i)ctx.lineTo(x+i,yy);else ctx.moveTo(x+i,yy);}ctx.stroke();
  ctx.restore();
  ctx.fillStyle='#1c1444';ctx.fillRect(x-3,y,w+6,3);ctx.fillStyle=M6_C.cian;ctx.fillRect(x-3,y,w+6,0.8);
  ctx.fillStyle=(T>>4)%2?M6_C.vio:'#3a2470';ctx.fillRect(x-3,y-6,1,6);ctx.fillRect(x+w+2,y-6,1,6);ctx.fillRect(x-3,y-6,w+6,0.8);
}
// escalones de la pirámide: racks de servidores con luces y, arriba, el andamio
function M6_tier(pl){
  const x=pl.x,y=pl.y,w=pl.w,h=pl.pyr.dy;
  if(pl.mat==='andamio'){
    ctx.strokeStyle='#3a2470';ctx.lineWidth=1;ctx.beginPath();
    for(let i=x+2;i<x+w;i+=12){ctx.moveTo(i,y+2);ctx.lineTo(i,y+h);}ctx.moveTo(x,y+h/2);ctx.lineTo(x+w,y+h/2);
    for(let i=x+2;i<x+w-12;i+=12){ctx.moveTo(i,y+2);ctx.lineTo(i+12,y+h/2);}ctx.stroke();
    ctx.fillStyle='#1c1444';ctx.fillRect(x,y,w,3);ctx.fillStyle=M6_C.amb;for(let i=0;i<w;i+=6)ctx.fillRect(x+i,y,3,0.8);
    ctx.fillStyle='#0a0620';ctx.fillRect(x,y+3,w,0.8);
    return;}
  ctx.fillStyle='#0e0a26';ctx.fillRect(x,y,w,h);
  for(let i=x+1;i<x+w-10;i+=12){ctx.fillStyle='#1a1040';ctx.fillRect(i,y+1,11,h-1);
    ctx.fillStyle='#22185a';for(let r=y+3;r<y+h-2;r+=3)ctx.fillRect(i+1,r,9,1.6);
    for(let r=y+3,k=0;r<y+h-2;r+=3,k++){const on=hash(((i*13+k*7)|0)+((T>>3)|0))<0.35;ctx.fillStyle=on?(k%3===1?M6_C.amb:M6_C.cian):'#2a1c5a';ctx.fillRect(i+8,r+0.3,1.2,1);}
    ctx.fillStyle='rgba(0,0,0,0.4)';ctx.fillRect(i+10,y+1,1,h-1);}
  ctx.fillStyle='#2a1c5a';ctx.fillRect(x,y,w,1.6);ctx.fillStyle=M6_C.cian;ctx.fillRect(x,y,w,0.6);
  ctx.fillStyle='rgba(0,0,0,0.35)';ctx.fillRect(x,y+h-1,w,1);
}
// pasaje de datos: por dentro, paredes de celdas y cables que llevan pulsos; arriba, la losa del cable troncal
function M6_troncalBack(pl){
  const x=pl.x,y=pl.y,w=pl.w,iy=y+9,ih=GROUND-iy;
  ctx.fillStyle='#0a0620';ctx.fillRect(x+3,iy,w-6,ih);
  ctx.fillStyle='#160e36';for(let r=iy+2;r<GROUND-2;r+=5)for(let c=x+5;c<x+w-6;c+=7)ctx.fillRect(c,r,6,4);
  for(let k=0;k<3;k++){const yy=iy+6+k*8;ctx.fillStyle='#2a1c5a';ctx.fillRect(x+3,yy,w-6,1);
    const ph=((T*(1.2+k*0.4)+k*40)%(w-6));ctx.fillStyle=k===1?M6_C.amb:M6_C.cian;ctx.fillRect(x+3+ph,yy-0.3,4,1.6);}
  for(const px of [x+2,x+w/2-4,x+w-12]){ctx.fillStyle='#1c1444';ctx.fillRect(px,iy,10,ih);ctx.fillStyle='#3a8ad0';ctx.fillRect(px,iy,1,ih);
    ctx.fillStyle='#0c0824';ctx.fillRect(px+8,iy,2,ih);ctx.fillStyle=(T>>4)%2?M6_C.vio:'#3a2470';ctx.fillRect(px+3,iy+4,4,1);}
  // cable troncal arriba (atrás del que camina por encima)
  ctx.fillStyle='#22185a';ctx.fillRect(x,y-5,w,4);ctx.fillStyle=M6_C.vio;ctx.fillRect(x,y-5,w,0.7);
  for(let i=0;i<w;i+=10){const o=(T*0.6+i*3)%w;ctx.fillStyle=M6_C.cianC;ctx.fillRect(x+o,y-3.5,2,0.8);}
  M6_losa(x,y,w);
}
function M6_losa(x,y,w){
  ctx.fillStyle='#1c1444';ctx.fillRect(x,y,w,9);
  ctx.fillStyle=M6_C.cian;ctx.fillRect(x,y,w,0.9);
  ctx.fillStyle='#0c0824';ctx.fillRect(x,y+6.5,w,2.5);
  ctx.fillStyle='#2a1c5a';for(let i=8;i<w;i+=16)ctx.fillRect(x+i,y+2,10,3);
  ctx.fillStyle=M6_C.amb;for(let i=12;i<w;i+=32)ctx.fillRect(x+i,y+3,2,1);
}
M6_LVL.drawTunnelFront=function(t){
  if(t.k!=='troncal')return false;
  const iy=t.y+9;
  ctx.fillStyle='rgba(5,3,26,0.36)';ctx.fillRect(t.x,iy,t.w,GROUND-iy);
  const g=ctx.createLinearGradient(0,iy,0,iy+12);g.addColorStop(0,'rgba(5,3,26,0.55)');g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g;ctx.fillRect(t.x,iy,t.w,12);
  // tubo de luz que titila en el techo
  const on=hash(((T>>2)+7)|0)>0.05;
  if(on){ctx.fillStyle=M6_C.cianC;ctx.fillRect(t.x+t.w/2-10,iy+1,20,1);
    ctx.fillStyle='rgba(58,216,255,0.06)';ctx.beginPath();ctx.moveTo(t.x+t.w/2-10,iy+2);ctx.lineTo(t.x+t.w/2-30,GROUND);ctx.lineTo(t.x+t.w/2+30,GROUND);ctx.lineTo(t.x+t.w/2+10,iy+2);ctx.fill();}
  M6_losa(t.x,t.y,t.w);
  return true;
};

// ================== coberturas propias ==================
M6_LVL.drawCover=function(c){
  if(c.vida<=0)return false;   // los escombros los dibuja mundo.js
  const x=c.x,w=c.w,top=c.top,h=c.h;
  switch(c.k){
  case 'cubo':M6_bloque(x,top,w,h);break;
  case 'barra':{ // barrera de luz: marco bajo con franjas ámbar
    ctx.fillStyle='#120c2e';ctx.fillRect(x,top,w,h);
    ctx.save();ctx.beginPath();ctx.rect(x+1,top+2,w-2,h-4);ctx.clip();
    for(let i=-6;i<w;i+=6){ctx.fillStyle=M6_C.amb;ctx.beginPath();ctx.moveTo(x+i,top+h);ctx.lineTo(x+i+4,top);ctx.lineTo(x+i+7,top);ctx.lineTo(x+i+3,top+h);ctx.fill();}
    ctx.restore();ctx.fillStyle='rgba(10,6,32,0.45)';ctx.fillRect(x,top+2,w,h-4);
    ctx.fillStyle=M6_C.ambC;ctx.fillRect(x,top,w,0.8);ctx.fillStyle='#3a2470';ctx.fillRect(x,top+h-2,w,2);break;}
  case 'pilar':{ // pilar de datos: columna con celdas violetas
    ctx.fillStyle='#1a1040';ctx.fillRect(x+2,top,w-4,h);ctx.fillStyle='#22185a';ctx.fillRect(x,top,w,2.5);ctx.fillRect(x,GROUND-2,w,2);
    for(let r=top+4;r<GROUND-3;r+=3){const on=hash(((r*3+x)|0)+((T>>4)|0))<0.4;ctx.fillStyle=on?M6_C.vio:'#3a2470';ctx.fillRect(x+4,r,w-8,1.4);}
    ctx.fillStyle=M6_C.vio;ctx.fillRect(x,top,w,0.8);break;}
  default:return false;
  }
  if(c.vida<c.max*0.5){ctx.fillStyle='rgba(5,3,26,0.6)';ctx.fillRect(x+w*0.25,top+1,1,h*0.5);ctx.fillRect(x+w*0.7,top,2,2);
    if((T>>2)%7===0){ctx.fillStyle='rgba(58,216,255,0.6)';ctx.fillRect(x-1,top+rand(1,h-2),w+2,0.8);}}   // falla de imagen
  return true;
};
