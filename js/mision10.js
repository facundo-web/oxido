'use strict';
// Óxido · Misión 10: Templo perdido (la final). Selva que entra en un templo de piedra que se pone cada vez más dorado.
// Todo lo de este archivo usa el prefijo M10_ para no chocar con otros nombres globales.
// La acción de la misión: LA ROCA. Tiembla el templo, cae polvo del techo, la roca asoma por un hueco y cae.
// Rueda detrás tuyo, la cámara avanza sola y hay que correr a la derecha saltando bloques, pozos con pinchos,
// dardos y piso que se hunde. Termina en un abismo: lo saltás y la roca se estrella adentro y lo tapa.
// Trampas de templo: cabezas que escupen dardos, pinchos que salen del piso, piso que se hunde. Criatura: la víbora.

// ================== datos de la misión ==================
const M10_GATE=640;          // donde termina la selva y empieza el templo (techo de piedra desde acá)
const M10_CEIL=12;           // alto del techo de piedra
const M10_LVL={name:'MISIÓN 10 · TEMPLO PERDIDO',short:'10 · TEMPLO PERDIDO',theme:'templo',end:3700,music:'l10',
  platforms:[
    // selva: tronco caído, losas y una rama alta
    {x:150,y:132,w:46,k:'tronco'},{x:250,y:118,w:40},{x:330,y:66,w:46,hi:'rama'},{x:420,y:128,w:50,k:'tronco'},{x:500,y:110,w:40},
    // salón de la entrada (emboscada)
    {x:700,y:128,w:44},{x:790,y:106,w:40},{x:840,y:64,w:44,hi:'cornisa'},{x:920,y:124,w:40},
    // patio del jefe chico
    {x:1310,y:126,w:40},{x:1400,y:106,w:36},
    // antes de la roca
    {x:1630,y:122,w:46},{x:1680,y:66,w:44,hi:'cornisa'},
    // salones dorados
    {x:2730,y:124,w:50},{x:2810,y:104,w:44},{x:2850,y:62,w:40,hi:'cornisa'},{x:3160,y:120,w:46},{x:3230,y:100,w:40},{x:3270,y:62,w:40,hi:'cornisa'},
    // escalones en la arena del villano (la derecha queda libre para él)
    {x:3410,y:128,w:34,step:1},{x:3476,y:108,w:34,step:1}],
  // el pasillo de las trampas (el techo es plataforma)
  tunnels:[{x:1040,w:150,y:116,k:'pasillo'}],
  // los escalones del altar
  pyramids:[{x:2980,w:156,n:4,dy:24,inset:16,mats:['#6a6252','#7a705c','#8a7c60','#9a8a62']}],
  covers:[{x:230,w:22,h:14,k:'bloque',hp:12},{x:470,w:18,h:15,k:'vasija',hp:8},{x:742,w:20,h:15,k:'columna',hp:12},
    {x:960,w:22,h:14,k:'bloque',hp:12},{x:1612,w:18,h:15,k:'vasija',hp:8},{x:2792,w:20,h:15,k:'columna',hp:12},
    {x:2906,w:22,h:14,k:'bloque',hp:12},{x:3186,w:18,h:15,k:'vasija',hp:8},{x:3440,w:22,h:15,k:'bloque',hp:16}],
  crates:[{x:200,drop:'H'},{x:440,drop:'G'},{x:770,drop:'R'},{x:1010,drop:'E'},{x:1226,drop:'+'},{x:1650,drop:'F'},
    {x:2760,drop:'S'},{x:2900,drop:'G'},{x:3060,drop:'+'},{x:3250,drop:'R'},{x:3330,drop:'E'}],
  extraCrates:[{x:560,p:0.45},{x:852,y:64,p:0.6},{x:1694,y:66,p:0.6},{x:2862,y:62,p:0.6},{x:3282,y:62,p:0.5}],
  turrets:[2950,3240],mechs:[2700],
  prisoners:[{x:300,k:'ally'},{x:352,y:66,k:'item'},{x:870,y:64,k:'item'},{x:1120,k:'item'},{x:1680,k:'item'},
    {x:2780,k:'ally'},{x:3040,y:60,k:'item'},{x:3300,k:'ally'}],
  extraPrisoners:[{x:2840,p:0.5,k:'ally'},{x:3180,p:0.4,k:'item'}],
  decor:[{x:30,k:'helecho'},{x:96,k:'monolito'},{x:176,k:'helecho'},{x:250,k:'arbusto'},{x:290,k:'cabezota'},{x:390,k:'helecho'},
    {x:452,k:'monolito'},{x:510,k:'arbusto'},{x:546,k:'helecho'},{x:590,k:'portal'},
    {x:690,k:'antorcha'},{x:722,k:'raices'},{x:812,k:'estatua'},{x:880,k:'antorcha'},{x:940,k:'raices'},{x:1000,k:'vasijas'},
    // pasillo de las trampas: pinchos al medio y una cabeza que escupe dardos a la altura de la cabeza (agachate)
    {x:1070,k:'pinchos',w:30,per:130,ph:0},{x:1180,k:'cabeza',dir:-1,hy:GROUND-16,per:120,ph:40,zona:'pasillo'},
    {x:1250,k:'antorcha'},{x:1300,k:'estatua'},{x:1460,k:'raices'},{x:1540,k:'estatua'},{x:1590,k:'antorcha'},
    {x:1700,k:'arbusto'},{x:1740,k:'vasijas'},
    // la persecución (ver M10_CHASE): una cabeza que tira dardos bajos (saltalos) y dos tiras de pinchos
    {x:2120,k:'pinchos',w:30,per:120,ph:30,zona:'roca'},{x:2230,k:'cabeza',dir:-1,hy:GROUND-6,per:96,ph:0,zona:'roca'},
    {x:2360,k:'hunde',w:30},{x:2530,k:'pinchos',w:30,per:120,ph:80,zona:'roca'},
    {x:2706,k:'brasero'},{x:2800,k:'arbusto'},{x:2830,k:'estatua'},{x:2920,k:'antorcha'},{x:2960,k:'arbusto'},
    {x:3146,k:'brasero'},{x:3200,k:'raices'},{x:3300,k:'arbusto'},{x:3350,k:'estatua'},
    {x:3392,k:'brasero'},{x:3622,k:'sol'},{x:3560,k:'escombros'},{x:3684,k:'brasero'}],
  events:[
    {at:20,spawn:[{t:'soldier',x:'R',d:70}]},
    {at:110,spawn:[{t:'m10Vibora',x:258}]},
    {at:180,spawn:[{t:'grenadier',x:'R'},{t:'soldier',x:'R',d:50},{t:'drone',x:'R',d:120}]},
    {at:300,spawn:[{t:'m10Vibora',x:'R'},{t:'soldier',x:345,y:48,d:20}]},
    {at:400,spawn:[{t:'shield',x:'R'},{t:'m10Vibora',x:518},{t:'soldier',x:'R',d:80}]},
    {at:520,spawn:[{t:'drone',x:'R'},{t:'soldier',x:'R',d:40},{t:'m10Vibora',x:'L',d:60}]},
    // cofre blindado adentro del pasillo de las trampas: al acercarte viene una oleada grande
    {at:980,spawn:[{t:'shield',x:'R'},{t:'soldier',x:'L',d:30},{t:'grenadier',x:'R',d:60},{t:'drone',x:'L',d:90},{t:'m10Vibora',x:'R',d:110},{t:'soldier',x:'R',d:130},{t:'soldier',x:'L',d:170}]},
    {at:1090,spawn:[{t:'soldier',x:'R'},{t:'m10Vibora',x:'R',d:40}]},
    {at:1606,spawn:[{t:'m10Vibora',x:1708},{t:'soldier',x:'R',d:30},{t:'soldier',x:1694,y:48,d:40}]},
    {at:1650,spawn:[{t:'grenadier',x:'R'},{t:'drone',x:'R',d:40}]},
    {at:2720,spawn:[{t:'soldier',x:'R'},{t:'m10Vibora',x:2808},{t:'drone',x:'R',d:60}]},
    {at:2800,spawn:[{t:'shield',x:'R'},{t:'grenadier',x:2866,y:44,d:20},{t:'soldier',x:'R',d:50}]},
    {at:2900,spawn:[{t:'soldier',x:3050,y:42},{t:'m10Vibora',x:2968,d:30},{t:'soldier',x:'R',d:70},{t:'shield',x:'R',d:120}]},
    {at:3000,spawn:[{t:'drone',x:'R'},{t:'soldier',x:'R',d:30},{t:'m10Vibora',x:'L',d:40}]},
    {at:3120,spawn:[{t:'m10Vibora',x:'R'},{t:'soldier',x:3280,y:44,d:30},{t:'grenadier',x:'R',d:90}]},
    {at:3220,spawn:[{t:'shield',x:'R'},{t:'m10Vibora',x:3308},{t:'drone',x:'R',d:80}]}],
  arenas:[
    // jefe chico; después la roca y una emboscada en los salones dorados; el villano al final (nunca seguidos)
    {at:1280,mini:true},
    {at:2760,waves:[
      [{t:'soldier',x:'R'},{t:'m10Vibora',x:'L',d:30},{t:'soldier',x:'L',d:60}],
      [{t:'drone',x:'R'},{t:'m10Vibora',x:'R',d:20},{t:'grenadier',x:'R',d:60},{t:'soldier',x:'L',d:80}],
      [{t:'shield',x:'R'},{t:'m10Vibora',x:'R',d:30},{t:'soldier',x:'L',d:50},{t:'drone',x:'R',d:110}]]},
    {at:3380,boss:true}],
  vaults:[{x:1150}]};
for(const t of M10_LVL.tunnels)M10_LVL.platforms.push({x:t.x,y:t.y,w:t.w,roof:t});
for(const p of M10_LVL.pyramids)for(let i=0;i<p.n;i++)
  M10_LVL.platforms.push({x:p.x+i*p.inset,y:GROUND-(i+1)*p.dy,w:p.w-2*i*p.inset,pyr:p,tier:i,mat:p.mats[i%p.mats.length]});
M10_LVL.events.sort((a,b)=>a.at-b.at);
const M10_IDX=LEVELS.push(M10_LVL)-1;
NV_COSTO.m10Vibora=0.75;
COB_COL.bloque=['#6a6252','#8a8070'];COB_COL.columna=['#8a8270','#a89e88'];COB_COL.vasija=['#8a4a2a','#b06a3a'];
KILL_NAMES.push(['m10Vibora','víboras']);

// ================== la persecución (datos) ==================
// at: cuando la cámara llega acá empieza el aviso. drop: donde cae la roca (centro). Bloques: se saltan (son
// sólidos de costado y se puede parar arriba; la roca los pisa y los rompe). Pozos: si caés, los pinchos te
// pegan y te tiran para adelante. El abismo del final: la roca se cae adentro y lo tapa.
const M10_R=28;
const M10_CHASE={at:1760,drop:1822,hole:[1794,1850],
  blocks:[{x:1960,w:14,h:10},{x:2290,w:16,h:16},{x:2580,w:64,h:12}],
  pits:[{x:2040,w:26,k:'pozo'},{x:2450,w:28,k:'pozo'},{x:2644,w:36,k:'abismo'}]};

// ================== utilidades ==================
const M10_sfx=(n,...a)=>{if(typeof SFX!=='undefined'&&SFX[n])SFX[n](...a);};
const M10_ease=t=>t<0?0:t>1?1:t*t*(3-2*t);
const M10_gold=x=>clamp((x-1500)/1700,0,1);   // cuánto oro hay en las paredes según el lugar
const M10_here=()=>L===M10_LVL;
function M10_pc(p){p=p||P;return p.ride?{x:p.ride.x+p.ride.w/2,y:p.ride.y+p.ride.h/2}:{x:p.x+4,y:p.y+9};}
function M10_dustFall(x,n){for(let i=0;i<n;i++)parts.push({k:'p',x:x+rand(-3,3),y:M10_CEIL+1,vx:rand(-0.15,0.15),vy:rand(0.2,0.6),g:0.04,life:rand(40,70),maxl:70,size:1,col:i%2?'#b8a888':'#8a7c66'});}
function M10_chips(x,y,n,cols){for(let i=0;i<n;i++)parts.push({k:'p',x:x+rand(-3,3),y,vx:rand(-1.6,1.6),vy:rand(-2.6,-0.6),g:0.17,life:rand(24,40),maxl:40,size:i%3?1:2,col:pick(cols||['#6a6252','#8a8070','#4a4438'])});}

// ================== estado que se reinicia en cada partida ==================
const M10={clk:0,bush:new Map(),heads:new Map(),crumble:new Map(),pits:[],blocks:[],told:0,chase:null,fest:null,fw:[],motes:[],hurtRun:false,roca:null};
// L.chase: el bot (pruebas/bot.mjs) lo lee para correr a la derecha y saltar lo que viene (obs: [{x,w}])
M10_LVL.chase={on:false,obs:[]};
function M10_reset(){
  M10.clk=0;M10.bush=new Map();M10.heads=new Map();M10.crumble=new Map();M10.told=0;M10.fest=null;M10.fw=[];M10.hurtRun=false;
  // bloques de la persecución como plataformas (se rearman en cada partida)
  for(let i=M10_LVL.platforms.length-1;i>=0;i--)if(M10_LVL.platforms[i].m10blk)M10_LVL.platforms.splice(i,1);
  M10.blocks=M10_CHASE.blocks.map(b=>{const pl={x:b.x,y:GROUND-b.h,w:b.w,h:b.h,k:'bloque',m10blk:true};M10_LVL.platforms.push(pl);return pl;});
  M10.pits=M10_CHASE.pits.map(p=>({...p,open:true,fill:0}));
  for(const d of M10_LVL.decor){
    if(d.k==='arbusto')M10.bush.set(d,{busy:false,shk:0});
    if(d.k==='cabeza')M10.heads.set(d,{t:d.ph||0,glow:0});
    if(d.k==='hunde')M10.crumble.set(d,{st:'ok',t:0});
  }
  M10.roca={st:'idle',x:M10_CHASE.drop,y:-M10_R-4,vy:0,rot:0,t:0,v:1.2,crack:0};
  M10.chase=M10_LVL.chase;M10.chase.on=false;M10.chase.st='idle';M10.chase.obs=[];M10.chase.cam=0;M10.chase.t2=0;
  if(!M10.motes.length)for(let i=0;i<34;i++)M10.motes.push({x:Math.random()*W,y:Math.random()*GROUND,ph:Math.random()*6,s:0.1+Math.random()*0.25});
}
ON_START.push(M10_reset);
ON_EVENT.push(t=>{if(t==='hurt'&&M10_here()&&M10.chase&&M10.chase.on)M10.hurtRun=true;});

// ================== víboras (la criatura de la misión) ==================
// Verde con bandas amarillas. Se esconde en los arbustos (el arbusto se sacude y se ven dos ojitos antes de salir)
// o llega reptando. Repta hacia vos, a corta distancia se para, levanta la cabeza y sisea (aviso) y se lanza
// adelante. Se esquiva saltándola o yéndose. Es bajita: la caja de balas es más alta que el dibujo.
const M10_MAXV=6;
function M10_nVib(){let n=0;for(const e of enemies)if(e.type==='m10Vibora'&&!e.gone)n++;return n;}
function M10_newVib(o){
  return Object.assign({type:'m10Vibora',x:0,y:GROUND-10,w:16,h:10,hp:2,face:-1,flash:0,score:140,cd:rand(40,80),st:'run',t:0,
    anim:rand(0,99),spd:0.8,bite:0,life:0,rise:0,hx:null,bush:null,hitL:false,upd:M10_updVib,draw:M10_drawVib,onKill:M10_killVib},o);
}
function M10_mkVib(x){
  const fromR=Math.abs(x-(camX+W+12))<0.5,fromL=Math.abs(x-(camX-20))<0.5;
  if(M10_nVib()>=M10_MAXV)return{type:'m10Vibora',gone:true,x:-9999,y:GROUND,w:1,h:1,hp:1,cd:0,score:0};
  if(!fromR&&!fromL){
    let b=null;for(const [d,s] of M10.bush)if(!s.busy&&Math.abs(d.x+9-x)<60){b=d;break;}
    if(b){M10.bush.get(b).busy=true;return M10_newVib({st:'hide',bush:b,x:-9999,hx:b.x+2});}
    return M10_newVib({x,st:'run'});
  }
  return M10_newVib({x:fromR?camX+W+2:camX-18,face:fromL?1:-1});
}
function M10_updVib(e){
  if(e.flash>0)e.flash--;e.anim++;
  const pc=P.dead?null:M10_pc();
  switch(e.st){
  case 'hide':{const b=e.bush,s=M10.bush.get(b);e.x=-9999;
    if(b.x<camX-30){e.gone=true;s.busy=false;return;}
    if(b.x>camX+10&&b.x<camX+W-20&&players.some(p=>!p.dead&&Math.abs(M10_pc(p).x-b.x)<170)){e.st='rustle';e.t=44;M10_sfx('m10Siseo');}
    return;}
  case 'rustle':{const s=M10.bush.get(e.bush);s.shk=Math.max(s.shk,e.t);e.x=-9999;
    if(e.t%8===0)M10_chips(e.bush.x+9,GROUND-10,1,['#3f7a3a','#5a9a4a']);
    if(--e.t<=0){s.busy=false;e.st='rec';e.t=14;e.x=e.bush.x+2;e.face=pc&&pc.x<e.x?-1:1;e.hx=null;M10_sfx('m10Siseo');
      for(let i=0;i<6;i++)parts.push({k:'p',x:e.bush.x+9,y:GROUND-8,vx:rand(-1.2,1.2),vy:rand(-1.8,-0.5),g:0.14,life:rand(18,30),maxl:30,size:1,col:i%2?'#3f7a3a':'#7aaa5a'});}
    return;}
  case 'rear':
    e.rise=Math.min(1,e.rise+0.12);if(pc)e.face=pc.x<e.x+e.w/2?-1:1;
    if(e.t%10===0)M10_sfx('m10Siseo');
    if(--e.t<=0){e.st='lunge';e.t=15;e.hitL=false;M10_sfx('m10Mordida');}
    break;
  case 'lunge':e.x+=e.face*3.1;e.rise=Math.max(0.4,e.rise-0.04);
    if(!e.hitL)for(const p of players)if(!p.dead&&overlap(hurtbox(p),{x:e.x,y:GROUND-12,w:e.w,h:12})){withP(p,()=>hurtPlayer(1));e.hitL=true;break;}
    if(--e.t<=0){e.st='rec';e.t=36;e.cd=rand(90,140)*DIFF().fire;}
    break;
  case 'rec':e.rise=Math.max(0,e.rise-0.08);if(--e.t<=0)e.st='run';break;
  default:{ // repta
    e.life++;e.rise=Math.max(0,e.rise-0.08);if(e.bite>0)e.bite--;
    if(pc){const dx=pc.x-(e.x+e.w/2);if(Math.abs(dx)>4)e.face=dx<0?-1:1;
      e.x+=Math.abs(dx)>4?e.face*e.spd:0;
      if(onScreen(e,-6))e.cd--;
      if(e.cd<=0&&Math.abs(dx)<54&&Math.abs(dx)>10&&Math.abs(pc.y-(GROUND-9))<14){e.st='rear';e.t=28;}}
    if(e.bite<=0)for(const p of players)if(!p.dead&&overlap(hurtbox(p),{x:e.x+2,y:GROUND-5,w:e.w-4,h:5})){withP(p,()=>hurtPlayer(1));e.bite=70;e.x-=e.face*8;M10_sfx('m10Mordida');break;}
    if(e.life>1500&&!onScreen(e,20))e.gone=true;
  }}
  if(e.x>-1000){e.x=clamp(e.x,camX+2-(e.st==='run'&&e.life<200?40:0),camX+W-e.w-2+(e.st==='run'&&e.life<200?40:0));e.y=GROUND-e.h;}
}
function M10_killVib(e){
  if(e.x<-1000)return;
  M10_sfx('m10VibMuere');
  const cx=e.x+e.w/2;
  for(let i=0;i<9;i++)parts.push({k:'p',x:cx+rand(-6,6),y:GROUND-3,vx:rand(-1.4,1.4),vy:rand(-2.2,-0.6),g:0.15,life:rand(18,30),maxl:30,size:i%3?1:1.5,col:i%3===0?'#c8b040':i%3===1?'#3f7a3a':'#23401f'});
}
function M10_drawVib(e){
  if(e.x<-1000)return;   // escondida en el arbusto: se dibuja en el arbusto
  const fl=e.flash>0,C=c=>fl?'#fff':c,bx=e.x+e.w/2,run=e.st==='run'||e.st==='lunge';
  ctx.fillStyle='rgba(0,0,0,0.3)';ctx.fillRect(q(e.x+1),GROUND-0.6,e.w-2,0.8);
  ctx.save();ctx.translate(q(bx),GROUND);if(e.face<0)ctx.scale(-1,1);
  const r=e.rise,n=9;
  // cuerpo: segmentos que ondulan; los de adelante se levantan cuando se para
  let hx=0,hy=0;
  for(let k=n-1;k>=0;k--){
    const lx=6-k*1.9,w=Math.sin(e.anim/(run?3.4:7)+k*0.9)*(run?1.1:0.5),up=k<4?(4-k)*3.4*r:0;
    const ly=-2+w*(k>=4||r<0.3?1:0.3)-up;
    ctx.fillStyle=C(k%3===1?'#c8b040':k%2?'#2f6a2c':'#3f7a3a');ctx.fillRect(lx-1.2,ly-1.3,2.6,2.6);
    if(!fl&&k%3!==1){ctx.fillStyle='#5a9a4a';ctx.fillRect(lx-1,ly-1.3,1.8,0.6);}
    if(k===0){hx=lx;hy=ly;}
  }
  // cabeza
  ctx.fillStyle=C('#2f6a2c');ctx.beginPath();ctx.ellipse(hx+2,hy-0.6,2.6,1.8,r*-0.3,0,7);ctx.fill();
  if(!fl){const tele=e.st==='rear';ctx.fillStyle=tele&&(T>>2)%2?'#fff3a0':'#ffd23a';ctx.fillRect(hx+2.6,hy-1.8,0.9,0.9);
    if(tele||(e.anim%40)<8){ctx.strokeStyle='#d02a2a';ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(hx+4.4,hy-0.4);ctx.lineTo(hx+6.4,hy-0.2);ctx.lineTo(hx+7,hy-1);ctx.moveTo(hx+6.4,hy-0.2);ctx.lineTo(hx+7,hy+0.5);ctx.stroke();}
    if(tele){ctx.fillStyle='rgba(255,220,80,0.22)';circle(hx+2,hy-1,5);}}
  ctx.restore();
}
ENEMY_MAKERS.m10Vibora=M10_mkVib;

// ================== trampas: dardos, pinchos y piso que se hunde ==================
function M10_dart(x,y,dir){
  eproj.push({kind:'m10Dardo',x,y,vx:dir*2.4,vy:0,r:1,t:0,
    upd(o){o.t++;o.x+=o.vx;
      if(o.x<camX-20||o.x>camX+W+20||o.t>260){o.gone=true;return;}
      if(coverBlocks({x:o.x,y:o.y,vx:o.vx,vy:0,r:1,kind:'bullet'})){o.gone=true;spark(o.x,o.y,'#d9c8a0');return;}
      const R=M10.roca;if(R&&(R.st==='run'||R.st==='drop')&&Math.hypot(o.x-R.x,o.y-R.y)<M10_R){o.gone=true;spark(o.x,o.y,'#d9c8a0');return;}
      for(const p of players)if(!p.dead&&overlapPt(hurtbox(p),o.x,o.y,1)){withP(p,()=>hurtPlayer(1));o.gone=true;return;}},
    draw(o){const d=Math.sign(o.vx);ctx.fillStyle='#3a2a1a';ctx.fillRect(q(o.x-(d>0?5:0)),q(o.y-0.4),5,0.9);
      ctx.fillStyle='#c8c0b0';ctx.fillRect(q(d>0?o.x:o.x-1.5),q(o.y-0.6),1.5,1.2);
      ctx.fillStyle='#c83a2a';ctx.fillRect(q(d>0?o.x-5:o.x+4),q(o.y-1),1.2,2);}});
}
// zona en la que las trampas están vivas: el pasillo, o la persecución en curso
function M10_trapOn(d){
  if(d.zona==='roca')return M10.chase.on&&M10.roca.st==='run';
  if(d.zona==='pasillo')return players.some(p=>!p.dead&&p.x>1020&&p.x<1200);
  return true;
}
function M10_spikeState(d){const ph=(M10.clk+(d.ph||0))%(d.per||130);return ph<50?'down':ph<80?'warn':ph<114?'up':'back';}
function M10_trapsUpd(){
  for(const d of M10_LVL.decor){
    if(d.x<camX-40||d.x>camX+W+40)continue;
    if(d.k==='cabeza'){const s=M10.heads.get(d);if(!s)continue;
      if(!M10_trapOn(d)||d.x>camX+W-4){s.glow=0;continue;}
      s.t++;const ph=s.t%d.per;s.glow=ph>d.per-34?(ph-(d.per-34))/34:0;
      if(ph===d.per-34)M10_sfx('m10Click');
      if(ph===0){M10_dart(d.x+(d.dir<0?-1:13),d.hy,d.dir);M10_sfx('m10Dardo');}}
    else if(d.k==='pinchos'){
      const st=M10_spikeState(d),on=M10_trapOn(d)||d.zona!=='roca';
      if(!on)continue;
      const ph=(M10.clk+(d.ph||0))%(d.per||130);
      if(ph===50&&onScreen({x:d.x,w:d.w},0))M10_sfx('m10Rumor');
      if(ph===80&&onScreen({x:d.x,w:d.w},0))M10_sfx('m10Pinchos');
      if(st==='warn'&&ph%6===0)dust(d.x+rand(2,d.w-2),GROUND,1);
      if(st==='up')for(const p of players)if(!p.dead&&overlap(hurtbox(p),{x:d.x+2,y:GROUND-7,w:d.w-4,h:7}))withP(p,()=>hurtPlayer(1));}
    else if(d.k==='hunde'){const s=M10.crumble.get(d);if(!s)continue;
      if(s.st==='ok'){if(players.some(p=>!p.dead&&!p.ride&&p.onGround&&!p.plat&&p.x+6>d.x&&p.x+2<d.x+d.w)){s.st='crack';s.t=26;M10_sfx('m10Cruje');}}
      else if(s.st==='crack'){if(s.t%5===0){dust(d.x+rand(2,d.w-2),GROUND,1);M10_chips(d.x+rand(4,d.w-4),GROUND,1);}
        if(--s.t<=0){s.st='fall';s.t=0;M10_sfx('m10Derrumbe');for(let i=0;i<6;i++)M10_chips(d.x+4+i*4,GROUND,1);
          if(!M10.pits.some(p=>p.x===d.x))M10.pits.push({x:d.x,w:d.w,k:'hunde',open:true,fill:0});}}
      else s.t++;}
  }
}
// pozos: si alguien pisa el fondo, los pinchos le pegan y lo tiran para arriba y adelante (o al borde más cerca)
function M10_pitsUpd(){
  for(const p of players){
    if(p.dead||p.ride)continue;
    if(p.m10b&&p.m10b.t>0){p.m10b.t--;p.x=clamp(p.x+p.m10b.dir*1.7,camX+2,camX+W-10);}
    if(!p.onGround||p.plat)continue;
    const cx=p.x+4;
    for(const pit of M10.pits){if(!pit.open||cx<pit.x+2||cx>pit.x+pit.w-2)continue;
      const dir=M10.chase.on||pit.k==='abismo'?1:(cx-pit.x<pit.w/2?-1:1);
      withP(p,()=>hurtPlayer(1));
      p.y=GROUND-p.h+8;p.vy=-6.6;p.onGround=false;p.m10b={dir,t:26};
      M10_sfx('m10Pinchos');dust(cx,GROUND,4);
      for(let i=0;i<4;i++)parts.push({k:'p',x:cx+rand(-3,3),y:GROUND+4,vx:rand(-0.8,0.8),vy:rand(-2,-0.8),g:0.15,life:20,maxl:20,size:1,col:'#c8c0b0'});
      break;}
  }
  // amigos y gatito: saltan los pozos y los bloques solos
  const hop=o=>{if(!o||!o.onGround)return;const cx=o.x+(o.w||8)/2;
    for(const pit of M10.pits)if(pit.open&&cx>pit.x-10&&cx<pit.x+pit.w){o.vy=-5.6;o.onGround=false;o.plat=null;return;}
    for(const b of M10.blocks)if(o.x+(o.w||8)>b.x-8&&o.x<b.x&&!o.plat){o.vy=-5.6;o.onGround=false;return;}};
  if(M10.chase.on){for(const a of allies)hop(a);if(typeof gato!=='undefined'&&gato)hop(gato);}
}
// bloques de la persecución: sólidos de costado
function M10_blocksUpd(){
  for(const p of players){if(p.dead||p.ride)continue;
    for(const b of M10.blocks){if(p.y+p.h<=b.y+2||p.x+8<=b.x||p.x>=b.x+b.w)continue;
      if(p.x+4<b.x+b.w/2)p.x=b.x-8.01;else p.x=b.x+b.w+0.01;}}
}

// ================== la roca ==================
// estados: idle → (aviso) peek → drop → run → fall → done
let M10_ROCK=null,M10_SHADE=null;
function M10_rockSprites(){
  if(M10_ROCK)return;
  const s=64,c=document.createElement('canvas');c.width=c.height=s;const x=c.getContext('2d'),R=M10_R,o=32,rnd=mulberry32(1010);
  x.fillStyle='#7a6e5c';x.beginPath();x.arc(o,o,R,0,7);x.fill();
  x.save();x.beginPath();x.arc(o,o,R,0,7);x.clip();
  for(let i=0;i<40;i++){x.fillStyle=rnd()<0.5?'#6a604e':'#8a7e6a';const a=rnd()*7,d=rnd()*R;x.fillRect(o+Math.cos(a)*d,o+Math.sin(a)*d,1+rnd()*3,1+rnd()*2);}
  // franja tallada que da la vuelta (se ve girar)
  x.strokeStyle='#5a5040';x.lineWidth=5;x.beginPath();x.arc(o,o,R*0.62,0,7);x.stroke();
  x.strokeStyle='#9a8e78';x.lineWidth=1;x.beginPath();x.arc(o,o,R*0.62+2.6,0,7);x.stroke();
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;x.save();x.translate(o+Math.cos(a)*R*0.62,o+Math.sin(a)*R*0.62);x.rotate(a);
    x.fillStyle='#3e3628';x.fillRect(-1.5,-2,3,1.2);x.fillRect(-0.6,-2,1.2,4);x.restore();}
  // musgo y grietas
  x.fillStyle='rgba(70,110,50,0.75)';for(let i=0;i<5;i++){const a=rnd()*7;x.beginPath();x.ellipse(o+Math.cos(a)*R*0.85,o+Math.sin(a)*R*0.85,3+rnd()*3,2,a,0,7);x.fill();}
  x.strokeStyle='#3a3226';x.lineWidth=0.8;x.beginPath();x.moveTo(o-6,o-20);x.lineTo(o-2,o-12);x.lineTo(o-7,o-4);x.moveTo(o+12,o+6);x.lineTo(o+18,o+12);x.lineTo(o+16,o+20);x.stroke();
  x.fillStyle='#2e281e';x.beginPath();x.arc(o,o,4,0,7);x.fill();x.fillStyle='#5a5040';x.beginPath();x.arc(o,o,2,0,7);x.fill();
  x.restore();
  M10_ROCK=c;
  const h=document.createElement('canvas');h.width=h.height=s;const y=h.getContext('2d');
  const g=y.createRadialGradient(o-10,o-12,4,o,o,R+1);g.addColorStop(0,'rgba(255,236,190,0.28)');g.addColorStop(0.55,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(10,6,4,0.62)');
  y.fillStyle=g;y.beginPath();y.arc(o,o,R+0.5,0,7);y.fill();
  y.strokeStyle='rgba(20,14,8,0.8)';y.lineWidth=1;y.beginPath();y.arc(o,o,R,0,7);y.stroke();
  M10_SHADE=h;
}
function M10_drawRock(){
  const R=M10.roca;if(R.st==='idle'||R.st==='done')return;
  M10_rockSprites();
  if(R.st==='run'){ctx.fillStyle='rgba(0,0,0,0.35)';ctx.beginPath();ctx.ellipse(R.x,GROUND,M10_R*0.9,2,0,0,7);ctx.fill();}
  const ab=(R.st==='fall'||R.st==='crash')?M10.pits.find(p=>p.k==='abismo'):null;
  if(ab){ctx.save();ctx.beginPath();ctx.rect(camX-60,-60,W+120,GROUND+60);ctx.rect(ab.x,GROUND,ab.w,H);ctx.clip();}
  ctx.save();ctx.translate(q(R.x),q(R.y));ctx.rotate(R.rot);ctx.drawImage(M10_ROCK,-32,-32);ctx.restore();
  ctx.drawImage(M10_SHADE,q(R.x-32),q(R.y-32));
  if(R.crack>0){ctx.strokeStyle='#1e1812';ctx.lineWidth=1.2;ctx.beginPath();const k=R.crack;
    ctx.moveTo(R.x-2,R.y-M10_R);ctx.lineTo(R.x+3,R.y-M10_R+10*k);ctx.lineTo(R.x-1,R.y-M10_R+20*k);ctx.lineTo(R.x+4,R.y-M10_R+34*k);
    ctx.moveTo(R.x+3,R.y-M10_R+10*k);ctx.lineTo(R.x+14*k,R.y-M10_R+14*k);ctx.stroke();}
  if(ab)ctx.restore();
}
// aplastar: una caja (jugador) contra el círculo de la roca
function M10_hitsRock(b,pad){const R=M10.roca,cx=clamp(R.x,b.x,b.x+b.w),cy=clamp(R.y,b.y,b.y+b.h);return Math.hypot(cx-R.x,cy-R.y)<M10_R-(pad||0);}
// la roca te alcanza: un golpe, y aparecés adelante de la roca (cerca del otro jugador si hay dos)
function M10_crush(p){
  const R=M10.roca;
  withP(p,()=>hurtPlayer(1));
  let nx=R.x+M10_R+22;
  if(twoP()){const o=players.find(q=>q!==p&&!q.dead);if(o)nx=Math.max(nx,(o.ride?o.ride.x:o.x)-16);}
  for(const pit of M10.pits)if(pit.open&&nx+4>pit.x-2&&nx+4<pit.x+pit.w+2)nx=pit.x+pit.w+4;   // nunca adentro de un pozo
  p.x=clamp(nx,camX+2,camX+W-12);p.y=GROUND-70;p.vy=0;p.onGround=false;p.plat=null;p.m10b=null;
  if(p.inv<60)p.inv=60;
  shake=Math.max(shake,5);M10_sfx('m10Aplasta');dust(p.x+4,GROUND,6);
  setBanner(twoP()?'¡LA ROCA ALCANZÓ AL JUGADOR '+(p.slot+1)+'!':'¡TE ALCANZÓ LA ROCA!',60);
}
function M10_chaseUpd(){
  const C=M10.chase,R=M10.roca;
  if(C.st==='idle'){
    if(camX>M10_CHASE.at+200){C.st='done';C.on=false;R.st='done';return;}
    if(camX>=M10_CHASE.at&&!lock){C.st='warn';C.on=true;C.t=0;C.cam=camX;R.st='peek';R.t=0;M10.hurtRun=false;
      setBanner('¡TIEMBLA EL TEMPLO!',100);M10_sfx('m10Temblor');playMusic('m10Roca');
      C.obs=[...M10.blocks.map(b=>({x:b.x,w:b.w})),...M10.pits.map(p=>({x:p.x,w:p.w})),
        ...M10_LVL.decor.filter(d=>d.k==='pinchos'&&d.zona==='roca'||d.k==='hunde').map(d=>({x:d.x,w:d.w}))].sort((a,b)=>a.x-b.x);
      // los enemigos que quedaron atrás o lejos se van (no traban la carrera)
      for(const e of enemies)if(!isBoss(e)&&e.type!=='turret'&&!onScreen(e,0))e.gone=true;}
    return;}
  if(C.st==='done'){if(C.t2>0){C.t2--;camX=Math.min(camX,C.camPrev+2.4);C.camPrev=camX;}return;}
  C.t++;
  if(C.st==='warn'){
    camX=C.cam;   // la cámara espera: el temblor avisa
    shake=Math.max(shake,0.8+C.t/60);
    if(C.t%3===0)M10_dustFall(camX+rand(10,W-10),1);
    if(C.t%4===0)M10_dustFall(rand(M10_CHASE.hole[0],M10_CHASE.hole[1]),1);
    if(C.t%30===0)M10_sfx('m10Temblor');
    if(C.t%9===0&&C.t>30)M10_chips(rand(M10_CHASE.hole[0]+6,M10_CHASE.hole[1]-6),M10_CEIL+2,1);
    // la roca asoma por el hueco del techo
    R.y=-M10_R-4+M10_ease(clamp((C.t-30)/70,0,1))*(M10_R+22);R.rot=Math.sin(C.t/7)*0.05;
    if(C.t===80)setBanner('¡UNA ROCA! ¡CORRÉ ▶!',110);
    if(C.t>=118){C.st='run';R.st='drop';R.vy=1;M10_sfx('m10Cae');}
    return;}
  // la roca cae y después rueda
  const vmin=Math.min(...players.filter(p=>!p.dead).map(p=>CHARS[p.ci].speed).concat([9]));
  R.v=(vmin<9?vmin:1.4)*([0.86,0.92,0.96][difficulty]||0.92)*(vuelta>1?Math.min(1.06,1+0.02*(vuelta-1)):1);
  if(R.st==='drop'){R.vy=Math.min(R.vy+0.4,7);R.y+=R.vy;
    if(R.y>=GROUND-M10_R){R.y=GROUND-M10_R;R.st='run';shake=Math.max(shake,7);M10_sfx('m10Golpe');dust(R.x,GROUND,10);
      for(let i=0;i<8;i++)M10_chips(R.x+rand(-20,20),GROUND-2,1);}
    camX=Math.max(camX,C.cam);}
  else if(R.st==='run'){
    // la roca nunca queda fuera de cuadro y la cámara avanza sola con ella; antes del abismo la cámara se frena
    // para que se vea cómo se estrella
    R.x=Math.max(R.x+R.v,camX+14);R.rot+=R.v/M10_R;R.t++;
    camX=Math.min(Math.max(camX,R.x-14),M10.pits.find(p=>p.k==='abismo').x-60);
    shake=Math.max(shake,1.1);
    if(R.t%14===0)M10_sfx('m10Rueda');
    if(R.t%3===0)parts.push({k:'smoke',col:'170,150,120',x:R.x-M10_R*0.6+rand(-4,4),y:GROUND-2,vx:rand(-0.6,-0.1),vy:rand(-0.4,-0.1),life:rand(18,30),maxl:30,size:rand(1.5,3)});
    if(R.t%7===0)M10_dustFall(camX+rand(20,W-20),1);
    // rompe los bloques que pisa
    for(const b of M10.blocks)if(!b.gone&&R.x+M10_R*0.7>b.x){b.gone=true;const i=M10_LVL.platforms.indexOf(b);if(i>=0)M10_LVL.platforms.splice(i,1);
      M10_sfx('m10Piedra');M10_chips(b.x+b.w/2,b.y,8);dust(b.x+b.w/2,GROUND,6);}
    M10.blocks=M10.blocks.filter(b=>!b.gone);
    // aplasta enemigos, amigos y gatito (estos dos salen despedidos para adelante)
    for(const e of enemies)if(!e.gone&&!isBoss(e)&&e.x>-1000&&M10_hitsRock(e,2)){const hk=hitFrom;hitFrom={dir:1,pow:2,fl:2,up:true};dmg(e,99);hitFrom=hk;}
    for(const a of allies)if(!a.gone&&M10_hitsRock(a,2)){a.x=Math.min(R.x+M10_R+18,camX+W-12);a.y=GROUND-50;a.vy=-1;a.onGround=false;}
    if(typeof gato!=='undefined'&&gato&&gato.x!==undefined&&M10_hitsRock({x:gato.x,y:gato.y,w:gato.w||10,h:gato.h||8},2)){gato.x=Math.min(R.x+M10_R+16,camX+W-14);gato.y=GROUND-46;gato.vy=-1;gato.onGround=false;}
    for(const p of players)if(!p.dead&&!p.ride&&M10_hitsRock(hurtbox(p),3))M10_crush(p);
    // el abismo: la roca se cae adentro y se estrella
    const ab=M10.pits.find(p=>p.k==='abismo');
    if(ab&&R.x>=ab.x+ab.w/2){R.st='fall';R.vy=0.5;R.x=ab.x+ab.w/2;M10_sfx('m10Cae');}
  }else if(R.st==='fall'){
    camX=Math.min(camX,M10.pits.find(p=>p.k==='abismo').x-60);
    R.vy=Math.min(R.vy+0.35,6);R.y+=R.vy;R.rot+=0.02;
    const ab=M10.pits.find(p=>p.k==='abismo'),rest=GROUND+Math.sqrt(M10_R*M10_R-(ab.w/2)*(ab.w/2))-4;
    for(const p of players)if(!p.dead&&!p.ride&&M10_hitsRock(hurtbox(p),3))M10_crush(p);
    if(R.y>=rest){R.y=rest;R.st='crash';R.t=0;ab.fill=1;ab.open=false;
      shake=11;freeze(5);M10_sfx('m10Crash');parts.push({k:'ring',x:R.x,y:GROUND-4,r:4,max:40,life:16,maxl:16,col:'220,200,160'});
      for(let i=0;i<24;i++)M10_chips(R.x+rand(-20,20),GROUND-rand(0,20),1);
      for(let i=0;i<16;i++)parts.push({k:'smoke',col:'190,170,130',rise:1,x:R.x+rand(-30,30),y:GROUND-rand(0,30),vx:rand(-1,1),vy:rand(-0.8,-0.2),life:rand(40,70),maxl:70,size:rand(3,6)});}
  }else if(R.st==='crash'){
    camX=Math.min(camX,M10.pits.find(p=>p.k==='abismo').x-60);
    R.t++;R.crack=Math.min(1,R.t/20);if(R.t>14)R.y+=0.45;if(R.t%6===0)M10_chips(R.x+rand(-14,14),GROUND,1);
    if(R.t===40){C.st='done';C.on=false;R.st='done';playMusic(L.music);C.t2=240;C.camPrev=camX;
      if(!M10.hurtRun){setBanner('¡CARRERA LIMPIA! +1500',110);addScore(1500,leadP().x,leadP().y-10);later(200,SFX.medal);}
      else setBanner('¡LA ROCA QUEDÓ ATRÁS!',100);}
  }
}

// ================== ganchos por cuadro ==================
M10_LVL.upd=function(){
  M10.clk++;
  for(const [,s] of M10.bush)if(s.shk>0)s.shk--;
  M10_trapsUpd();M10_chaseUpd();M10_pitsUpd();M10_blocksUpd();
  // antorchas y braseros: alguna chispa que sube
  if(T%5===0)for(const d of M10_LVL.decor){if((d.k!=='antorcha'&&d.k!=='brasero')||d.x<camX-10||d.x>camX+W+10)continue;
    if(Math.random()<0.4){const y=d.k==='antorcha'?GROUND-58:GROUND-30;parts.push({k:'p',x:d.x+5+rand(-1.5,1.5),y,vx:rand(-0.2,0.2),vy:rand(-0.7,-0.3),g:-0.005,life:rand(20,34),maxl:34,size:1,col:Math.random()<0.5?'#ffd27a':'#ff8a2a'});}}
  M10_festUpd();
};
ON_DRAW.push(()=>{if(M10_here()&&M10.roca&&M10.roca.st!=='peek')M10_drawRock();});

// ================== festejo final: ¡TERMINASTE LAS 10 MISIONES! ==================
// Cuando cae el villano (winT de juego.js): fuegos de oro y un cartel grande. Se estira un poco la espera
// antes de la pantalla de misión cumplida y después sigue la VUELTA 2 como siempre (partida.js).
function M10_festUpd(){
  if(!winT){M10.fest=null;return;}
  if(!M10.fest&&winT>=51){M10.fest={t:0};banner=null;M10_sfx('m10Fanfarria');}
  const f=M10.fest;if(!f)return;
  f.t++;
  if(f.t%14===1&&f.t<330){const x=rand(40,W-40),y=rand(24,80);M10_sfx('m10Cohete');
    for(let i=0;i<22;i++){const a=i/22*Math.PI*2+rand(-0.1,0.1),s=rand(0.8,1.7);M10.fw.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:rand(40,60),m:60,c:pick(['#ffe08a','#ffd23a','#fff3c0','#ff9a3a','#7dff9a'])});}}
  for(const p of M10.fw){p.x+=p.vx;p.y+=p.vy;p.vx*=0.97;p.vy=p.vy*0.97+0.03;p.l--;}
  M10.fw=M10.fw.filter(p=>p.l>0);if(M10.fw.length>220)M10.fw.splice(0,M10.fw.length-220);
  // la pantalla de misión cumplida espera a que el cartel se lea
  if(winT===150&&f.t<240)winT=149;
}
function M10_festDraw(){
  const f=M10.fest;if(!f||state!=='play')return;
  for(const p of M10.fw){ctx.globalAlpha=Math.min(1,p.l/20);ctx.fillStyle=p.c;ctx.fillRect(p.x,p.y,1.4,1.4);}
  ctx.globalAlpha=1;
}
// el cartel va encima del HUD y debajo del aviso de tramo (que queda en y 65–94)
ON_HUD.push(()=>{
  const f=M10.fest;if(!f||state!=='play'||!M10_here())return;
  const a=Math.min(1,f.t/18),y=102,pulse=(T>>3)%2;ctx.globalAlpha=a;
  ctx.fillStyle='rgba(18,12,24,0.84)';ctx.fillRect(20,y,W-40,34);ctx.fillStyle='#f3c969';ctx.fillRect(20,y,W-40,1.5);ctx.fillRect(20,y+32.5,W-40,1.5);
  txt(vuelta>1?'¡TERMINASTE LA VUELTA '+vuelta+'!':'¡TERMINASTE LAS 10 MISIONES!',W/2,y+5,11,pulse?'#ffe08a':'#fff3c0','center');
  txt('SIGUE LA VUELTA '+(vuelta+1)+' · TODO MÁS DURO',W/2,y+22,5,'#ddd','center',false);
  ctx.globalAlpha=1;
});

// ================== fondo ==================
const M10_RN=mulberry32(1010);
let M10_JFAR=null,M10_JNEAR=null,M10_WSTONE=null,M10_WGOLD=null;
// selva lejos: cielo cálido, copas oscuras y árboles finitos (se arma una vez)
function M10_jungleTiles(){
  if(M10_JFAR)return;
  const r=mulberry32(77),a=document.createElement('canvas');a.width=384;a.height=GROUND;const x=a.getContext('2d');
  const g=x.createLinearGradient(0,0,0,GROUND);g.addColorStop(0,'#e8d48a');g.addColorStop(0.35,'#9ab872');g.addColorStop(1,'#2e4a2c');
  x.fillStyle=g;x.fillRect(0,0,384,GROUND);
  // árboles lejanos, troncos claros entre la bruma
  for(let i=0;i<14;i++){const tx=r()*384,tw=2+r()*3;x.fillStyle='rgba(70,90,60,0.55)';x.fillRect(tx,30,tw,GROUND-30);}
  // copas: manchas redondas en capas
  for(const [y0,col,n] of[[22,'#5a7a48',26],[40,'#46663a',22],[62,'#355430',18]])
    for(let i=0;i<n;i++){const cx=r()*384,cy=y0+r()*14,rr=10+r()*16;x.fillStyle=col;
      for(const dx of[-384,0,384]){x.beginPath();x.ellipse(cx+dx,cy,rr,rr*0.7,0,0,7);x.fill();}}
  x.fillStyle='#2a4226';x.fillRect(0,GROUND-34,384,34);
  for(let i=0;i<30;i++){const cx=r()*384;x.fillStyle=r()<0.5?'#2e4a2a':'#253d22';for(const dx of[-384,0,384]){x.beginPath();x.ellipse(cx+dx,GROUND-34,12+r()*10,8+r()*6,0,0,7);x.fill();}}
  M10_JFAR=a;
  // selva cerca: troncos gruesos con lianas (fondo transparente)
  const b=document.createElement('canvas');b.width=320;b.height=GROUND;const y=b.getContext('2d');
  for(const tx of[30,150,250]){const tw=12+r()*8;
    y.fillStyle='#3a2e22';y.fillRect(tx,0,tw,GROUND);y.fillStyle='#4e3e2c';y.fillRect(tx+2,0,2,GROUND);y.fillStyle='#2a2118';y.fillRect(tx+tw-2,0,2,GROUND);
    for(let k=0;k<6;k++){y.fillStyle='#2a2118';y.fillRect(tx+2+r()*(tw-4),r()*GROUND,1,4+r()*6);}
    // raíces de contrafuerte
    y.fillStyle='#3a2e22';y.beginPath();y.moveTo(tx-10,GROUND);y.quadraticCurveTo(tx,GROUND-20,tx+2,GROUND-34);y.lineTo(tx+tw-2,GROUND-34);y.quadraticCurveTo(tx+tw,GROUND-20,tx+tw+10,GROUND);y.fill();
    y.fillStyle='rgba(70,110,50,0.7)';for(let k=0;k<4;k++){y.beginPath();y.ellipse(tx+r()*tw,40+r()*90,3,2+r()*3,0,0,7);y.fill();}}
  y.strokeStyle='#2f4a26';y.lineWidth=1.2;
  for(let i=0;i<7;i++){const x0=r()*320,x1=x0+20+r()*50;y.beginPath();y.moveTo(x0,0);y.quadraticCurveTo((x0+x1)/2,30+r()*50,x1,0);y.stroke();}
  M10_JNEAR=b;
}
// pared del templo: bloques de piedra, friso tallado, columnas y nichos. La versión de oro tiene el mismo dibujo con oro.
function M10_wallTile(gold){
  const c=document.createElement('canvas');c.width=256;c.height=GROUND;const x=c.getContext('2d'),r=mulberry32(gold?21:21);
  x.fillStyle=gold?'#6a5a3a':'#4e4a3c';x.fillRect(0,0,256,GROUND);
  for(let row=0;row*10<GROUND;row++){const off=(row%2)*8;
    for(let i=-1;i<17;i++){const bx=i*16+off,v=r();x.fillStyle=gold?(v<0.3?'#7a6840':v<0.7?'#6e5e3a':'#665634'):(v<0.3?'#58533f':v<0.7?'#504b3d':'#4a4537');x.fillRect(bx+0.5,row*10+0.5,15,9);}
    x.fillStyle=gold?'#3e321e':'#34302a';x.fillRect(0,row*10,256,0.6);}
  // musgo (en la de piedra)
  if(!gold){x.fillStyle='rgba(70,100,50,0.55)';for(let i=0;i<18;i++){x.beginPath();x.ellipse(r()*256,60+r()*90,3+r()*6,1.5+r()*2,0,0,7);x.fill();}}
  // friso con dibujos propios: escalones y espirales
  x.fillStyle=gold?'#2e2414':'#2a2620';x.fillRect(0,38,256,16);
  const fc=gold?'#e8b84a':'#7a705c';x.fillStyle=fc;x.fillRect(0,38,256,1);x.fillRect(0,53,256,1);
  for(let i=0;i<256;i+=16){x.fillStyle=fc;x.fillRect(i+2,49,4,2);x.fillRect(i+4,46,4,3);x.fillRect(i+6,43,4,3);
    x.strokeStyle=fc;x.lineWidth=1;x.beginPath();x.arc(i+12,46,3,0,Math.PI*1.6);x.stroke();x.fillRect(i+11.5,45.5,1,1);}
  // columnas con capitel
  for(const cx of[0,128]){x.fillStyle=gold?'#7a6a46':'#5e584a';x.fillRect(cx,0,16,GROUND);x.fillStyle=gold?'#9a8656':'#6e6858';x.fillRect(cx+2,0,2,GROUND);
    x.fillStyle='rgba(0,0,0,0.3)';x.fillRect(cx+13,0,3,GROUND);for(let k=cx+5;k<cx+12;k+=3){x.fillStyle='rgba(0,0,0,0.18)';x.fillRect(k,60,1,GROUND-70);}
    x.fillStyle=gold?'#e8b84a':'#7a7262';x.fillRect(cx-3,56,22,5);x.fillRect(cx-3,GROUND-12,22,5);
    if(gold){x.fillStyle='#ffe08a';x.fillRect(cx-3,56,22,1);}}
  // nichos con figuritas (propias: un búho de piedra chiquito y una vasija)
  for(const nx of[52,184]){x.fillStyle='#1e1a14';x.fillRect(nx,74,22,30);x.beginPath();x.arc(nx+11,74,11,Math.PI,0);x.fill();
    x.fillStyle=gold?'#c8963a':'#6a6252';x.fillRect(nx+6,90,10,14);x.beginPath();x.arc(nx+11,88,5,0,7);x.fill();
    x.fillStyle=gold?'#ffe08a':'#2a2620';x.fillRect(nx+8.5,86,1.5,1.5);x.fillRect(nx+12,86,1.5,1.5);
    x.fillStyle=gold?'#8a6a2a':'#4a4438';x.fillRect(nx-2,104,26,3);}
  // grietas
  x.strokeStyle='rgba(0,0,0,0.35)';x.lineWidth=0.7;for(let i=0;i<5;i++){const sx=r()*256,sy=r()*GROUND;x.beginPath();x.moveTo(sx,sy);x.lineTo(sx+4,sy+8);x.lineTo(sx+1,sy+16);x.stroke();}
  return c;
}
M10_LVL.drawBG=function(){
  M10_jungleTiles();if(!M10_WSTONE){M10_WSTONE=M10_wallTile(false);M10_WGOLD=M10_wallTile(true);}
  const k=M10_ease((camX-360)/280),gk=M10_gold(camX+W/2);
  if(k<1){
    ctx.globalAlpha=1;const fo=((camX*0.25)%384+384)%384;
    for(let i=0;i<2;i++)ctx.drawImage(M10_JFAR,q(-fo+i*384),0);
    // rayos de sol entre las copas
    for(let i=0;i<4;i++){const sx=((i*97-camX*0.35)%420+420)%420-50,a=0.07+0.03*Math.sin(T/60+i);
      ctx.fillStyle=`rgba(255,240,180,${a})`;ctx.beginPath();ctx.moveTo(sx,0);ctx.lineTo(sx+14,0);ctx.lineTo(sx+60,GROUND);ctx.lineTo(sx+30,GROUND);ctx.fill();}
    const no=((camX*0.55)%320+320)%320;
    for(let i=0;i<2;i++)ctx.drawImage(M10_JNEAR,q(-no+i*320),0);
  }
  if(k>0){
    ctx.globalAlpha=k;const wo=((camX*0.5)%256+256)%256;
    for(let i=0;i<3;i++)ctx.drawImage(M10_WSTONE,q(-wo+i*256),0);
    if(gk>0){ctx.globalAlpha=k*gk;for(let i=0;i<3;i++)ctx.drawImage(M10_WGOLD,q(-wo+i*256),0);}
    ctx.globalAlpha=k;
    // antorchas de la pared (en cada columna)
    for(let i=0;i<3;i++){const tx=-wo+i*256+8;for(const ox of[0,128]){const x=tx+ox;if(x<-20||x>W+20)continue;
      const fl=Math.sin(T/3+x)*0.6+Math.sin(T/5.3+x*2)*0.4;
      ctx.fillStyle=`rgba(255,170,70,${0.10+0.03*fl})`;circle(x,26,12+fl);
      ctx.fillStyle='#3a2a18';ctx.fillRect(x-1.5,28,3,6);ctx.fillStyle='#ff9a3a';ctx.beginPath();ctx.ellipse(x,26,2.2,3.4+fl*0.4,0,0,7);ctx.fill();
      ctx.fillStyle='#fff0b0';ctx.beginPath();ctx.ellipse(x,27,1,1.8,0,0,7);ctx.fill();}}
    // brillo dorado que crece hacia el final
    if(gk>0){ctx.fillStyle=`rgba(255,190,80,${0.10*gk})`;ctx.fillRect(0,0,W,GROUND);}
    ctx.globalAlpha=1;
  }
};

// ================== techo, piso, pozos y rayos de luz (en el mundo) ==================
function M10_drawCeil(){
  const x0=Math.max(M10_GATE,Math.floor(camX)-10),x1=camX+W+10;if(x1<=x0)return;
  const [h0,h1]=M10_CHASE.hole,R=M10.roca;
  // la roca asoma por el hueco (atrás de la losa)
  if(R&&R.st==='peek')M10_drawRockPeek();
  const gk=M10_gold(camX+W/2);
  for(let t=Math.floor(x0/24);t*24<x1;t++){const x=t*24;if(x+24<=x0)continue;
    if(x+24>h0&&x<h1)continue;   // hueco de la roca
    const h=hash(t+400);ctx.fillStyle=h<0.5?'#3e3a30':'#46412f';ctx.fillRect(x,0,24,M10_CEIL);
    ctx.fillStyle='#2a2620';ctx.fillRect(x,0,0.8,M10_CEIL);ctx.fillStyle=gk>0.5?'#c8963a':'#5e584a';ctx.fillRect(x,M10_CEIL-1.2,24,1.2);
    // raíces que cuelgan de las juntas
    if(h>0.62){ctx.strokeStyle='#3a2e1e';ctx.lineWidth=0.9;ctx.beginPath();const sw=Math.sin(T/50+t)*1.5;ctx.moveTo(x+6,M10_CEIL);ctx.quadraticCurveTo(x+4+sw,M10_CEIL+8,x+7+sw,M10_CEIL+14+h*10);ctx.stroke();}}
  // bordes del hueco
  if(h1>x0&&h0<x1){ctx.fillStyle='#14110c';ctx.fillRect(h0,0,h1-h0,2);ctx.fillStyle='#6a6252';ctx.fillRect(h0-2,M10_CEIL-3,3,3);ctx.fillRect(h1-1,M10_CEIL-3,3,3);}
}
function M10_drawRockPeek(){
  M10_rockSprites();const R=M10.roca,[h0,h1]=M10_CHASE.hole;
  ctx.save();ctx.translate(q(R.x),q(R.y));ctx.rotate(R.rot);ctx.drawImage(M10_ROCK,-32,-32);ctx.restore();ctx.drawImage(M10_SHADE,q(R.x-32),q(R.y-32));
}
function M10_drawPit(p){
  const x=p.x,w=p.w,g=GROUND;
  if(p.fill){ // la roca quedó trabada adentro, partida: es piso otra vez
    ctx.fillStyle='#5a5244';ctx.fillRect(x,g,w,H-g);ctx.fillStyle='#7a6e5c';ctx.fillRect(x,g,w,1.5);
    ctx.strokeStyle='#2a241c';ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(x+w*0.3,g);ctx.lineTo(x+w*0.4,g+8);ctx.lineTo(x+w*0.35,H);ctx.moveTo(x+w*0.7,g);ctx.lineTo(x+w*0.62,g+10);ctx.stroke();
    ctx.fillStyle='rgba(70,110,50,0.6)';ctx.fillRect(x+4,g,5,1);return;}
  ctx.fillStyle='#0c0806';ctx.fillRect(x,g-0.5,w,H-g+1);
  const gr=ctx.createLinearGradient(0,g,0,H);gr.addColorStop(0,'rgba(60,50,40,0.6)');gr.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gr;ctx.fillRect(x,g,w,6);
  // pinchos en el fondo
  ctx.fillStyle='#8a8478';for(let i=x+2;i<x+w-2;i+=4){ctx.beginPath();ctx.moveTo(i,H);ctx.lineTo(i+2,H-8);ctx.lineTo(i+4,H);ctx.fill();}
  ctx.fillStyle='#c8c0b0';for(let i=x+2;i<x+w-2;i+=4)ctx.fillRect(i+1.6,H-8,0.8,1.6);
  // bordes rotos
  ctx.fillStyle='#6a6252';ctx.fillRect(x-2,g,3,4);ctx.fillRect(x+w-1,g,3,5);ctx.fillStyle='#8a8070';ctx.fillRect(x-2,g,3,1);ctx.fillRect(x+w-1,g,3,1);
  if(p.k==='abismo'){ctx.fillStyle='rgba(255,200,120,0.5)';for(let i=0;i<3;i++)ctx.fillRect(x-6-i*5,g-1,2,1);}
}
M10_LVL.drawGround=function(){
  const x0=Math.floor(camX)-10,gk=M10_gold(camX+W/2);
  for(let t=Math.floor(camX/24)-1;t<(camX+W)/24+1;t++){const x=t*24,h=hash(t+900);
    if(x+24<=M10_GATE){ // selva: tierra y pasto
      ctx.fillStyle='#4a3524';ctx.fillRect(x,GROUND,24,H-GROUND);ctx.fillStyle='#5a8a3a';ctx.fillRect(x,GROUND,24,1.6);ctx.fillStyle='#7aaa4a';ctx.fillRect(x,GROUND,24,0.6);
      ctx.fillStyle='#3a2a1c';for(let k=0;k<4;k++)ctx.fillRect(x+hash(t*7+k)*22,GROUND+4+hash(t*3+k)*16,2,1.2);
      ctx.fillStyle='#5a8a3a';for(let k=0;k<3;k++){const gx=x+3+k*8+h*3,sw=Math.sin(T/40+gx)*0.6;ctx.fillRect(gx+sw,GROUND-2,0.8,2);ctx.fillRect(gx+1.5+sw,GROUND-3,0.8,3);}}
    else{ // templo: baldosas de piedra, con oro hacia el final
      const g=M10_gold(x);
      ctx.fillStyle=g>0.6?'#6e6248':'#5e584a';ctx.fillRect(x,GROUND,24,H-GROUND);
      ctx.fillStyle=g>0.6?'#a8945e':'#7e7664';ctx.fillRect(x,GROUND,24,1.5);
      ctx.fillStyle='#3a362c';ctx.fillRect(x,GROUND+1.5,0.8,H-GROUND);ctx.fillRect(x+12,GROUND+11,0.8,H-GROUND);ctx.fillRect(x,GROUND+10,24,0.8);
      if(g>0.2&&h<g){ctx.fillStyle='#e8b84a';ctx.fillRect(x+4,GROUND+4,4,1);ctx.fillRect(x+16,GROUND+14,4,1);}
      if(h<0.12){ctx.fillStyle='rgba(70,110,50,0.6)';ctx.fillRect(x+3,GROUND,6,1);}}
  }
  for(const p of M10.pits)if(p.x+p.w>camX-4&&p.x<camX+W+4)M10_drawPit(p);
  // aviso de la roca: sombra que crece en el piso debajo del hueco
  if(M10.chase&&M10.chase.st==='warn'){const k=clamp(M10.chase.t/118,0,1),x=M10_CHASE.drop;
    ctx.fillStyle=`rgba(0,0,0,${0.15+0.3*k})`;ctx.beginPath();ctx.ellipse(x,GROUND,8+k*20,1.5+k*1.5,0,0,7);ctx.fill();
    if((T>>2)%2){ctx.strokeStyle='rgba(255,140,50,0.7)';ctx.lineWidth=0.7;ctx.beginPath();ctx.ellipse(x,GROUND,30-k*6,3,0,0,7);ctx.stroke();}
    ctx.fillStyle=`rgba(190,170,130,${0.12+0.1*k})`;ctx.fillRect(M10_CHASE.hole[0]+6,M10_CEIL,M10_CHASE.hole[1]-M10_CHASE.hole[0]-12,GROUND-M10_CEIL);}
  // dosel de la selva arriba
  if(camX<M10_GATE){
    for(let t=Math.floor(camX/20)-1;t*20<Math.min(M10_GATE+30,camX+W+20);t++){const x=t*20,h=hash(t+50);
      ctx.fillStyle=h<0.5?'#2e4a2a':'#355430';ctx.beginPath();ctx.ellipse(x+10,2,14,8+h*5,0,0,7);ctx.fill();
      if(h>0.55){ctx.strokeStyle='#3a5a2a';ctx.lineWidth=1;ctx.beginPath();const sw=Math.sin(T/45+t)*3,ln=24+h*40;ctx.moveTo(x+10,6);ctx.quadraticCurveTo(x+10+sw*0.5,6+ln*0.6,x+10+sw,6+ln);ctx.stroke();
        ctx.fillStyle='#4a7a3a';ctx.fillRect(x+9+sw,5+ln,3,2);}}}
  M10_drawCeil();
  // rayos de sol que entran por las juntas del techo, con polvito
  for(let t=Math.max(Math.floor(M10_GATE/160),Math.floor(camX/160)-1);t*160<camX+W+60;t++){if(hash(t+600)<0.35)continue;
    const sx=t*160+40+hash(t+610)*60,a=0.06+0.025*Math.sin(T/70+t)+0.04*gk;
    ctx.fillStyle=`rgba(255,226,150,${a})`;ctx.beginPath();ctx.moveTo(sx,M10_CEIL);ctx.lineTo(sx+7,M10_CEIL);ctx.lineTo(sx+40,GROUND);ctx.lineTo(sx+22,GROUND);ctx.fill();
    ctx.fillStyle=`rgba(255,226,150,${a*0.9})`;ctx.beginPath();ctx.ellipse(sx+31,GROUND,11,1.6,0,0,7);ctx.fill();}
};

// ================== capa de arriba: polvo que flota, luz de oro y festejo ==================
M10_LVL.drawFx=function(){
  const gk=M10_gold(camX+W/2);
  for(const m of M10.motes){const x=((m.x-camX*m.s*0.6+Math.sin(T/90+m.ph)*6)%W+W)%W,y=(m.y+Math.sin(T/70+m.ph*3)*4+GROUND)%GROUND;
    ctx.fillStyle=`rgba(255,${230-gk*30},${170-gk*60},${0.25+0.2*Math.sin(T/30+m.ph)})`;ctx.fillRect(x,y,1,1);}
  if(gk>0.3&&T%2===0){ctx.fillStyle=`rgba(255,200,90,${0.04*gk})`;ctx.fillRect(0,0,W,H);}
  // aviso de la roca: viñeta oscura que late durante el temblor
  const C=M10.chase;
  if(C&&C.st==='warn'){const a=0.12+0.1*Math.sin(T/5);ctx.fillStyle=`rgba(20,10,4,${a})`;ctx.fillRect(0,0,W,6);ctx.fillRect(0,H-6,W,6);}
  if(C&&C.on&&M10.roca.st==='run'&&(T>>3)%2){ctx.fillStyle='rgba(255,90,40,0.6)';ctx.beginPath();ctx.moveTo(W-12,90);ctx.lineTo(W-5,94);ctx.lineTo(W-12,98);ctx.fill();}
  M10_festDraw();
};

// ================== decorado ==================
function M10_fern(x,g,s){ctx.strokeStyle='#3f7a3a';ctx.lineWidth=1;ctx.beginPath();
  for(let i=0;i<5;i++){const a=-2.6+i*0.55+Math.sin(T/50+x+i)*0.05,l=(10+(i%2)*4)*s;ctx.moveTo(x,g);ctx.quadraticCurveTo(x+Math.cos(a)*l*0.6,g+Math.sin(a)*l*0.9,x+Math.cos(a)*l,g+Math.sin(a)*l*0.5);}ctx.stroke();
  ctx.strokeStyle='#5a9a4a';ctx.lineWidth=0.5;ctx.beginPath();for(let i=0;i<5;i++){const a=-2.6+i*0.55,l=(10+(i%2)*4)*s;ctx.moveTo(x+Math.cos(a)*l*0.3,g+Math.sin(a)*l*0.4);ctx.lineTo(x+Math.cos(a)*l*0.8,g+Math.sin(a)*l*0.55);}ctx.stroke();}
// estatua de guardián (propia): figura cuadrada con casco plano, ojos redondos y bastón; más oro hacia el final
function M10_statue(x,g){
  const gd=M10_gold(x),st=gd>0.5?'#8a7c5c':'#6e6858',dk=gd>0.5?'#5a4e36':'#4a4638',au='#e8b84a';
  ctx.fillStyle=dk;ctx.fillRect(x-2,g-6,26,6);ctx.fillStyle=st;ctx.fillRect(x-2,g-6,26,1);
  ctx.fillStyle=st;ctx.fillRect(x+4,g-24,6,18);ctx.fillRect(x+12,g-24,6,18);       // piernas
  ctx.fillRect(x+2,g-44,18,21);                                                    // torso
  ctx.fillStyle=dk;ctx.fillRect(x+2,g-34,18,2);ctx.fillRect(x+10,g-44,1,21);
  ctx.fillStyle=st;ctx.fillRect(x+4,g-58,14,14);                                   // cabeza
  ctx.fillStyle=dk;ctx.fillRect(x+1,g-62,20,4);ctx.fillRect(x+4,g-50,14,1);        // casco plano
  ctx.fillStyle=gd>0.3?au:'#2a2620';circle(x+8,g-53,1.6);circle(x+14,g-53,1.6);
  ctx.fillStyle=dk;ctx.fillRect(x+22,g-66,2,60);ctx.fillStyle=gd>0.3?au:st;ctx.fillRect(x+20,g-70,6,5);  // bastón
  if(gd>0.3){ctx.fillStyle=au;ctx.fillRect(x+2,g-44,18,1);ctx.fillRect(x+1,g-62,20,1);}
  else{ctx.fillStyle='rgba(70,110,50,0.7)';ctx.fillRect(x+3,g-44,5,2);ctx.fillRect(x+14,g-26,4,2);ctx.fillRect(x+1,g-62,6,1.5);}
}
const M10_inTun=x=>M10_LVL.tunnels.some(t=>x>=t.x&&x<t.x+t.w);
let M10_tunDraw=false;
M10_LVL.drawDecor=function(d){
  const x=d.x,g=GROUND;
  if((d.k==='cabeza'||d.k==='pinchos')&&!M10_tunDraw&&M10_inTun(x))return true;   // los dibuja el pasillo (encima de su fondo oscuro)
  switch(d.k){
  case 'helecho':M10_fern(x,g,1);M10_fern(x+8,g,0.8);return true;
  case 'arbusto':{const s=M10.bush.get(d)||{shk:0},j=s.shk?Math.sin(T*1.9)*1.2:Math.sin(T/40+x)*0.3;
    const lob=[[2,-6,7,6,'#2f5a2a'],[10,-9,8,8,'#3a6a32'],[17,-5,6,5,'#2f5a2a'],[8,-4,9,4,'#467a3a']];
    for(const [ox,oy,rx,ry,c] of lob){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x+ox+j*(oy<-6?1:0.5),g+oy,rx,ry,0,0,7);ctx.fill();}
    ctx.fillStyle='#6aaa52';for(let i=0;i<5;i++)ctx.fillRect(x+3+i*3.6+j,g-11+((i*7)%5),1.2,0.8);
    if(s.shk&&(T>>3)%2){ctx.fillStyle='#ffd23a';ctx.fillRect(x+8+j,g-5,1,1);ctx.fillRect(x+10.5+j,g-5,1,1);}
    return true;}
  case 'monolito':{ctx.fillStyle='#5e584a';ctx.beginPath();ctx.moveTo(x,g);ctx.lineTo(x+1,g-38);ctx.lineTo(x+7,g-42);ctx.lineTo(x+13,g-38);ctx.lineTo(x+14,g);ctx.fill();
    ctx.fillStyle='#3a362c';for(let i=0;i<4;i++){ctx.fillRect(x+4,g-34+i*8,6,1);ctx.fillRect(x+4+(i%2)*4,g-32+i*8,2,3);}
    ctx.fillStyle='rgba(70,110,50,0.75)';ctx.fillRect(x+1,g-40,6,3);ctx.fillRect(x+9,g-10,5,4);ctx.fillRect(x,g-3,14,3);return true;}
  case 'cabezota':{ // cabeza gigante de piedra medio enterrada (propia), cubierta de musgo
    ctx.fillStyle='#5a5446';ctx.beginPath();ctx.ellipse(x+20,g-6,22,28,0,Math.PI,0);ctx.fill();ctx.fillRect(x-2,g-6,44,6);
    ctx.fillStyle='#4a4438';ctx.fillRect(x+4,g-22,12,3);ctx.fillRect(x+24,g-22,12,3);   // cejas
    ctx.fillStyle='#2a2620';ctx.fillRect(x+7,g-18,7,2);ctx.fillRect(x+26,g-18,7,2);       // ojos cerrados
    ctx.fillStyle='#4a4438';ctx.fillRect(x+17,g-18,6,10);ctx.fillRect(x+12,g-6,16,2);      // nariz y boca
    ctx.fillStyle='rgba(70,110,50,0.8)';ctx.beginPath();ctx.ellipse(x+14,g-32,10,3,0,0,7);ctx.fill();ctx.fillRect(x+34,g-14,6,10);
    ctx.strokeStyle='#3f7a3a';ctx.lineWidth=0.9;ctx.beginPath();ctx.moveTo(x+30,g-32);ctx.quadraticCurveTo(x+40,g-20,x+38,g-4);ctx.stroke();return true;}
  case 'portal':{ // la entrada al templo: dos pilares enormes, dintel con un sol tallado y raíces
    const gx=x;ctx.fillStyle='#4e4a3c';ctx.fillRect(gx,M10_CEIL,90,26);
    for(const px of[gx,gx+72]){ctx.fillStyle='#5e584a';ctx.fillRect(px,M10_CEIL+20,18,g-M10_CEIL-20);ctx.fillStyle='#6e6858';ctx.fillRect(px+2,M10_CEIL+20,2,g-M10_CEIL-20);
      ctx.fillStyle='#3a362c';for(let y=M10_CEIL+30;y<g;y+=12)ctx.fillRect(px,y,18,1);
      ctx.fillStyle='rgba(70,110,50,0.7)';ctx.fillRect(px+1,g-30,6,8);ctx.fillRect(px+10,M10_CEIL+40,7,5);}
    ctx.fillStyle='#5e584a';ctx.fillRect(gx-6,M10_CEIL+14,102,10);ctx.fillStyle='#7a7262';ctx.fillRect(gx-6,M10_CEIL+14,102,1);
    const sx=gx+45,sy=M10_CEIL+10;ctx.fillStyle='#6a6252';circle(sx,sy,9);ctx.fillStyle='#3a362c';
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2+0.2;ctx.fillRect(sx+Math.cos(a)*11-1,sy+Math.sin(a)*11-1,2,2);}
    ctx.fillStyle='#8a8070';circle(sx,sy,5);ctx.fillStyle='#3a362c';ctx.fillRect(sx-3,sy-1,2,1.5);ctx.fillRect(sx+1,sy-1,2,1.5);ctx.fillRect(sx-2,sy+2,4,1);
    ctx.strokeStyle='#3a2e1e';ctx.lineWidth=1.1;ctx.beginPath();
    for(let i=0;i<5;i++){const rx=gx+6+i*19,sw=Math.sin(T/60+i)*1.5,ln=20+((i*13)%18);ctx.moveTo(rx,M10_CEIL+24);ctx.quadraticCurveTo(rx+sw,M10_CEIL+24+ln*0.5,rx+sw*1.5+2,M10_CEIL+24+ln);}ctx.stroke();
    ctx.fillStyle='rgba(10,8,6,0.35)';ctx.fillRect(gx+18,M10_CEIL+24,54,g-M10_CEIL-24);
    return true;}
  case 'antorcha':{const fl=Math.sin(T/3+x)*0.6+Math.sin(T/4.7+x*3)*0.4,y=g-56;
    ctx.fillStyle=`rgba(255,170,70,${0.12+0.04*fl})`;circle(x+5,y,16+fl*2);
    ctx.fillStyle='#3a2a18';ctx.fillRect(x+4,y+2,2,10);ctx.fillRect(x+1,y+9,8,2);ctx.fillStyle='#5a4428';ctx.fillRect(x+3,y,4,3);
    ctx.fillStyle='#ff7a2a';ctx.beginPath();ctx.ellipse(x+5,y-3,2.6,4.6+fl*0.6,0,0,7);ctx.fill();
    ctx.fillStyle='#ffd27a';ctx.beginPath();ctx.ellipse(x+5,y-2,1.4,2.6,0,0,7);ctx.fill();return true;}
  case 'brasero':{const fl=Math.sin(T/3+x)*0.6,y=g-24;
    ctx.fillStyle=`rgba(255,180,80,${0.12+0.04*fl})`;circle(x+5,y-4,14);
    ctx.fillStyle='#8a6a2a';ctx.fillRect(x+3,y+4,4,20);ctx.fillRect(x,g-2,10,2);ctx.fillStyle='#c8963a';ctx.beginPath();ctx.moveTo(x-3,y);ctx.lineTo(x+13,y);ctx.lineTo(x+10,y+5);ctx.lineTo(x,y+5);ctx.fill();
    ctx.fillStyle='#e8b84a';ctx.fillRect(x-3,y,16,1);
    ctx.fillStyle='#ff7a2a';ctx.beginPath();ctx.ellipse(x+5,y-3,4,4+fl,0,0,7);ctx.fill();ctx.fillStyle='#ffd27a';ctx.beginPath();ctx.ellipse(x+5,y-2,2,2.4,0,0,7);ctx.fill();return true;}
  case 'estatua':M10_statue(x,g);return true;
  case 'raices':{ctx.strokeStyle='#3a2e1e';ctx.lineWidth=1.6;ctx.beginPath();
    for(let i=0;i<3;i++){const sw=Math.sin(T/70+x+i)*1.2;ctx.moveTo(x+i*6,M10_CEIL);ctx.bezierCurveTo(x+i*6+8,M10_CEIL+20,x+i*6-6+sw,M10_CEIL+40,x+i*5+sw,M10_CEIL+58+i*10);}ctx.stroke();
    ctx.strokeStyle='#4a3a26';ctx.lineWidth=0.6;ctx.beginPath();for(let i=0;i<3;i++){ctx.moveTo(x+i*6+3,M10_CEIL+16);ctx.lineTo(x+i*6+8,M10_CEIL+24);}ctx.stroke();
    ctx.fillStyle='#3f7a3a';ctx.fillRect(x+2,M10_CEIL+30,3,2);ctx.fillRect(x+10,M10_CEIL+48,3,2);return true;}
  case 'vasijas':for(const [ox,h,c] of[[0,12,'#8a4a2a'],[9,9,'#a85a32'],[16,14,'#7a4026']]){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x+ox+4,g-h/2,4,h/2,0,0,7);ctx.fill();
    ctx.fillRect(x+ox+2.5,g-h-1.5,3,2);ctx.fillStyle='#d9a43a';ctx.fillRect(x+ox+1,g-h*0.6,6,0.8);ctx.fillStyle='rgba(0,0,0,0.25)';ctx.fillRect(x+ox+5.5,g-h+2,1.5,h-3);}return true;
  case 'cabeza':{ // columna con una cabeza tallada que escupe dardos (aviso: los ojos se prenden y hace clic)
    const s=M10.heads.get(d)||{glow:0},gw=s.glow,dir=d.dir,hy=d.hy;
    ctx.fillStyle='#5e584a';ctx.fillRect(x,M10_CEIL,12,g-M10_CEIL);ctx.fillStyle='#6e6858';ctx.fillRect(x+2,M10_CEIL,2,g-M10_CEIL);ctx.fillStyle='#3a362c';ctx.fillRect(x+10,M10_CEIL,2,g-M10_CEIL);
    const fx=dir<0?x-3:x+12,hx=dir<0?x-4:x+4;
    ctx.fillStyle='#6a6252';ctx.fillRect(hx,hy-8,12,12);ctx.fillStyle='#4a4438';ctx.fillRect(hx,hy-9,12,2);
    ctx.fillStyle='#1a1610';ctx.fillRect(dir<0?hx:hx+9,hy-1,3,2.5);   // boca
    ctx.fillStyle=gw>0?((T>>1)%2?'#ffe08a':'#ff7a2a'):'#2a2620';ctx.fillRect(hx+3,hy-6,2,2);ctx.fillRect(hx+7,hy-6,2,2);
    if(gw>0){ctx.fillStyle=`rgba(255,160,60,${0.2+0.3*gw})`;circle(fx+1,hy,3+gw*3);
      ctx.fillStyle=`rgba(255,200,120,${0.25*gw})`;for(let i=1;i<6;i++)ctx.fillRect(fx+dir*i*7,hy-0.3,3,0.6);}
    return true;}
  case 'pinchos':{const st=M10_spikeState(d),ph=(M10.clk+(d.ph||0))%(d.per||130),on=M10_trapOn(d)||d.zona!=='roca';
    ctx.fillStyle='#2a2620';ctx.fillRect(x,g-0.4,d.w,1.4);
    for(let i=x+2;i<x+d.w-2;i+=5){ctx.fillStyle='#14110c';ctx.fillRect(i,g-0.3,3,1.2);}
    let hgt=0;if(on){if(st==='warn')hgt=1+((T>>2)%2);else if(st==='up')hgt=Math.min(8,(ph-80)*1.5);else if(st==='back')hgt=8*(1-(ph-114)/16);}
    if(hgt>0){ctx.fillStyle='#a8a090';for(let i=x+2;i<x+d.w-2;i+=5){ctx.beginPath();ctx.moveTo(i,g);ctx.lineTo(i+1.5,g-hgt);ctx.lineTo(i+3,g);ctx.fill();}
      ctx.fillStyle='#e8e0d0';for(let i=x+2;i<x+d.w-2;i+=5)ctx.fillRect(i+1.2,g-hgt,0.6,Math.min(2,hgt));}
    if(on&&st==='warn'){ctx.fillStyle=`rgba(255,120,50,${0.25+0.2*((T>>2)%2)})`;ctx.fillRect(x,g-1,d.w,1);}
    return true;}
  case 'hunde':{const s=M10.crumble.get(d)||{st:'ok',t:0};if(s.st==='fall')return true;   // ya es pozo (lo dibuja el piso)
    const j=s.st==='crack'?Math.sin(T*2)*0.5:0;
    ctx.fillStyle='#6a6250';ctx.fillRect(x+j,g,d.w,4);ctx.fillStyle='#3a362c';for(let i=x;i<x+d.w;i+=6)ctx.fillRect(i+j,g,0.8,4);
    ctx.strokeStyle='#2a2620';ctx.lineWidth=0.6;ctx.beginPath();ctx.moveTo(x+5,g+0.5);ctx.lineTo(x+9,g+2);ctx.lineTo(x+13,g+1);
    if(s.st==='crack'){const k=1-s.t/26;ctx.moveTo(x+13,g+1);ctx.lineTo(x+13+k*12,g+2.5);ctx.moveTo(x+20,g);ctx.lineTo(x+22,g+3*k);}ctx.stroke();
    return true;}
  case 'sol':{ // disco de oro en la pared del altar (propio): anillos, rayos escalonados y una piedra al medio
    const cy=62,gl=0.6+0.4*Math.sin(T/30);
    ctx.fillStyle=`rgba(255,200,90,${0.10*gl})`;circle(x,cy,44);
    for(let i=0;i<12;i++){const a=i/12*Math.PI*2+T*0.002;ctx.save();ctx.translate(x,cy);ctx.rotate(a);ctx.fillStyle='#a87a2a';ctx.fillRect(26,-3,6,6);ctx.fillRect(31,-1.5,5,3);ctx.restore();}
    ctx.fillStyle='#8a6a2a';circle(x,cy,27);ctx.fillStyle='#c8963a';circle(x,cy,24);ctx.fillStyle='#e8b84a';circle(x,cy,18);
    ctx.strokeStyle='#8a6a2a';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,cy,21,0,7);ctx.stroke();ctx.beginPath();ctx.arc(x,cy,12,0,7);ctx.stroke();
    ctx.fillStyle='#ffe08a';for(let i=0;i<8;i++){const a=i/8*Math.PI*2;ctx.fillRect(x+Math.cos(a)*15-0.8,cy+Math.sin(a)*15-0.8,1.6,1.6);}
    ctx.fillStyle='#7a3a2a';circle(x,cy,5);ctx.fillStyle=`rgba(255,140,90,${0.5+0.3*gl})`;circle(x-1,cy-1,2);
    return true;}
  case 'escombros':{ // los bloques del CUSTODIO tirados en el piso antes de que se arme
    if(typeof J10_drawRubble!=='function'||J10_custodioArmado())return true;
    J10_drawRubble(M10_LVL.arenas.find(a=>a.boss).at);return true;}
  }
  return false;
};

// ================== plataformas ==================
M10_LVL.drawPlat=function(pl){
  if(pl.roof){M10_tunnelBack(pl);return true;}
  if(pl.pyr){M10_altarStep(pl);return true;}
  if(pl.m10blk){M10_block(pl);return true;}
  if(pl.hi==='rama'){M10_branch(pl);return true;}
  if(pl.hi==='cornisa'){M10_ledge(pl);return true;}
  if(pl.step){M10_block({x:pl.x,y:pl.y,w:pl.w,h:GROUND-pl.y});return true;}
  if(pl.k==='tronco'){M10_log(pl);return true;}
  M10_slab(pl);return true;
};
function M10_slab(pl){ // losa de piedra sobre dos pilas de piedras
  const x=pl.x,y=pl.y,w=pl.w,gd=M10_gold(x);
  for(const px of[x+3,x+w-10]){for(let yy=y+5;yy<GROUND;yy+=6){ctx.fillStyle=((yy/6)|0)%2?'#5e584a':'#6a6252';ctx.fillRect(px+((yy/6)|0)%2,yy,7,6);}
    ctx.fillStyle='#3a362c';ctx.fillRect(px+6,y+5,1,GROUND-y-5);}
  ctx.fillStyle='#6e6858';ctx.fillRect(x,y,w,5);ctx.fillStyle=gd>0.5?'#e8b84a':'#8a8270';ctx.fillRect(x,y,w,1);ctx.fillStyle='#3a362c';ctx.fillRect(x,y+5,w,0.8);
  ctx.fillStyle='#4a4438';for(let i=x+4;i<x+w-3;i+=9)ctx.fillRect(i,y+2,2,1);
  if(hash(x|0)<0.5){ctx.fillStyle='rgba(70,110,50,0.7)';ctx.fillRect(x+w*0.6,y-1,6,1.5);}
}
function M10_log(pl){
  const x=pl.x,y=pl.y,w=pl.w;
  ctx.fillStyle='#4a4438';ctx.fillRect(x+4,y+6,8,GROUND-y-6);ctx.fillRect(x+w-12,y+6,8,GROUND-y-6);
  ctx.fillStyle='#5a4028';ctx.fillRect(x,y,w,7);ctx.fillStyle='#7a5a38';ctx.fillRect(x,y,w,1.5);ctx.fillStyle='#3a2a18';ctx.fillRect(x,y+6,w,1);
  ctx.fillStyle='#3a2a18';for(let i=x+5;i<x+w-4;i+=8)ctx.fillRect(i,y+3,5,0.8);
  ctx.fillStyle='#8a6a48';ctx.beginPath();ctx.ellipse(x+w,y+3.5,2.5,3.5,0,0,7);ctx.fill();ctx.fillStyle='#5a4028';circle(x+w,y+3.5,1.2);
  ctx.fillStyle='rgba(70,110,50,0.8)';ctx.fillRect(x+w*0.3,y-1,8,1.5);
}
function M10_branch(pl){ // rama de un árbol: el tronco baja al piso a la izquierda
  const x=pl.x,y=pl.y,w=pl.w;
  ctx.fillStyle='#3a2e22';ctx.fillRect(x-8,0,12,GROUND);ctx.fillStyle='#4e3e2c';ctx.fillRect(x-6,0,2,GROUND);
  ctx.fillStyle='#4a3828';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y+1);ctx.lineTo(x+w,y+5);ctx.lineTo(x,y+8);ctx.fill();
  ctx.fillStyle='#6a5038';ctx.fillRect(x,y,w,1.2);
  ctx.fillStyle='#3f7a3a';for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse(x+6+i*11,y-2+Math.sin(T/40+i)*0.5,5,2.4,0,0,7);ctx.fill();}
}
function M10_ledge(pl){ // cornisa de piedra pegada a la pared, con dos ménsulas talladas
  const x=pl.x,y=pl.y,w=pl.w,gd=M10_gold(x);
  ctx.fillStyle='#4e4a3c';for(const mx of[x+4,x+w-12]){ctx.beginPath();ctx.moveTo(mx,y+5);ctx.lineTo(mx+8,y+5);ctx.lineTo(mx+6,y+18);ctx.lineTo(mx+2,y+18);ctx.fill();
    ctx.fillStyle=gd>0.4?'#c8963a':'#3a362c';ctx.fillRect(mx+3,y+9,2,2);ctx.fillStyle='#4e4a3c';}
  ctx.fillStyle='#6e6858';ctx.fillRect(x,y,w,5);ctx.fillStyle=gd>0.4?'#e8b84a':'#8a8270';ctx.fillRect(x,y,w,1);ctx.fillStyle='#3a362c';ctx.fillRect(x,y+5,w,0.8);
}
function M10_block(b){ // bloque de piedra caído (persecución) o escalón macizo
  const x=b.x,y=b.y,w=b.w,h=b.h||GROUND-b.y;
  ctx.fillStyle='#6a6252';ctx.fillRect(x,y,w,h);ctx.fillStyle='#8a8070';ctx.fillRect(x,y,w,1.2);ctx.fillStyle='#3a362c';ctx.fillRect(x+w-1.2,y,1.2,h);
  ctx.fillStyle='#4a4438';if(w>20)ctx.fillRect(x+w/2,y+2,0.8,h-2);if(h>14)ctx.fillRect(x,y+h/2,w,0.8);
  ctx.fillStyle='rgba(70,110,50,0.6)';ctx.fillRect(x+1,y,Math.min(6,w-2),1.2);
  if(b.m10blk&&M10.chase&&M10.chase.on&&(T>>3)%2){ctx.fillStyle='rgba(255,220,120,0.5)';ctx.fillRect(x,y-1,w,0.8);}
}
function M10_altarStep(pl){ // escalón del altar: piedra tallada; el de arriba con oro
  const x=pl.x,y=pl.y,w=pl.w,h=pl.pyr.dy,top=pl.tier===pl.pyr.n-1;
  ctx.fillStyle=pl.mat;ctx.fillRect(x,y,w,h);
  ctx.fillStyle='rgba(0,0,0,0.25)';for(let i=x+8;i<x+w-4;i+=16)ctx.fillRect(i,y+2,0.8,h-3);ctx.fillRect(x,y+h/2,w,0.8);
  ctx.fillStyle='rgba(255,255,255,0.18)';ctx.fillRect(x,y,w,1);ctx.fillStyle='rgba(0,0,0,0.4)';ctx.fillRect(x,y+h-1.5,w,1.5);
  ctx.fillStyle='#e8b84a';ctx.fillRect(x,y,w,top?1.6:0.8);
  ctx.fillStyle='rgba(232,184,74,0.6)';for(let i=x+12;i<x+w-8;i+=20){ctx.fillRect(i+1,y+5,2,1);ctx.fillRect(i,y+6,4,1);ctx.fillRect(i+1,y+7,2,1);ctx.fillRect(i+5,y+6,1,1);ctx.fillRect(i-2,y+6,1,1);}
  if(top){const gl=0.5+0.5*Math.sin(T/20);ctx.fillStyle=`rgba(255,220,120,${0.3*gl})`;ctx.fillRect(x+w/2-6,y-3,12,3);}
}
// pasillo de las trampas: adentro oscuro con glifos que brillan; arriba el dintel tallado
function M10_tunnelBack(pl){
  const x=pl.x,y=pl.y,w=pl.w,iy=y+9;
  ctx.fillStyle='rgba(16,12,8,0.94)';ctx.fillRect(x+3,iy,w-6,GROUND-iy);
  ctx.fillStyle='#2a241a';for(let i=x+8;i<x+w-6;i+=18){ctx.fillRect(i,iy,1,GROUND-iy);}
  for(let i=x+14;i<x+w-10;i+=26){const a=0.3+0.2*Math.sin(T/25+i);ctx.fillStyle=`rgba(232,184,74,${a})`;ctx.fillRect(i,iy+8,4,1);ctx.fillRect(i+1,iy+10,2,3);ctx.fillRect(i,iy+14,4,1);}
  M10_tunDraw=true;for(const d of M10_LVL.decor)if((d.k==='cabeza'||d.k==='pinchos')&&d.x>=x&&d.x<x+w)M10_LVL.drawDecor(d);M10_tunDraw=false;
  M10_lintel(x,y,w);
}
function M10_lintel(x,y,w){
  ctx.fillStyle='#5e584a';ctx.fillRect(x,y,w,9);ctx.fillStyle='#7e7664';ctx.fillRect(x,y,w,1.2);ctx.fillStyle='#3a362c';ctx.fillRect(x,y+7.8,w,1.2);
  ctx.fillStyle='#3a362c';for(let i=x+4;i<x+w-4;i+=10){ctx.fillRect(i,y+3,6,1);ctx.fillRect(i+2,y+3,1,3);}
  ctx.fillStyle='#4e4a3c';ctx.fillRect(x-3,y-1,6,GROUND-y+1);ctx.fillRect(x+w-3,y-1,6,GROUND-y+1);
  ctx.fillStyle='#6e6858';ctx.fillRect(x-3,y-1,6,1);ctx.fillRect(x+w-3,y-1,6,1);
}
M10_LVL.drawTunnelFront=function(t){
  if(t.k!=='pasillo')return false;
  const iy=t.y+9;
  ctx.fillStyle='rgba(10,6,4,0.3)';ctx.fillRect(t.x,iy,t.w,GROUND-iy);
  const g=ctx.createLinearGradient(0,iy,0,iy+12);g.addColorStop(0,'rgba(0,0,0,0.55)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(t.x,iy,t.w,12);
  M10_lintel(t.x,t.y,t.w);
  return true;
};

// ================== coberturas propias ==================
M10_LVL.drawCover=function(c){
  if(c.vida<=0)return false;
  const x=c.x,w=c.w,top=c.top,h=c.h;
  switch(c.k){
  case 'bloque':ctx.fillStyle='#6a6252';ctx.fillRect(x,top,w,h);ctx.fillStyle='#8a8070';ctx.fillRect(x,top,w,1.2);ctx.fillStyle='#3a362c';ctx.fillRect(x+w/2,top+1,0.8,h-1);ctx.fillRect(x,top+h/2,w,0.8);
    ctx.fillStyle='rgba(232,184,74,0.6)';ctx.fillRect(x+3,top+3,4,1);break;
  case 'columna':ctx.fillStyle='#8a8270';ctx.fillRect(x+2,top+3,w-4,h-3);ctx.fillStyle='#a89e88';ctx.fillRect(x,top,w,3);ctx.fillRect(x,GROUND-2,w,2);
    ctx.fillStyle='rgba(0,0,0,0.2)';for(let i=x+4;i<x+w-3;i+=3)ctx.fillRect(i,top+4,1,h-6);
    ctx.fillStyle='#5a5446';ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x+5,top-2);ctx.lineTo(x+9,top+1);ctx.lineTo(x+14,top-1.5);ctx.lineTo(x+w,top);ctx.fill();break;
  case 'vasija':ctx.fillStyle='#8a4a2a';ctx.beginPath();ctx.ellipse(x+w/2,top+h*0.55,w/2,h*0.48,0,0,7);ctx.fill();ctx.fillRect(x+w/2-3,top,6,3);
    ctx.fillStyle='#d9a43a';ctx.fillRect(x+2,top+h*0.45,w-4,1);ctx.fillStyle='#b06a3a';ctx.fillRect(x+3,top+h*0.3,2,h*0.4);break;
  default:return false;
  }
  if(c.vida<c.max*0.5){ctx.fillStyle='rgba(10,8,6,0.6)';ctx.fillRect(x+w*0.25,top+1,1,h*0.5);ctx.fillRect(x+w*0.7,top,2,2);}
  return true;
};
