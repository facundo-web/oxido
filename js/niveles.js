'use strict';
// Óxido · Datos de las misiones y fondos procedurales
// ================== niveles ==================
const LEVELS=[
 {name:'MISIÓN 1 · ZONA ÓXIDO',short:'1 · ZONA ÓXIDO',theme:'dusk',end:3300,music:'l1',
  platforms:[{x:300,y:124,w:56},{x:420,y:108,w:56},{x:700,y:120,w:80},{x:820,y:98,w:60},{x:960,y:122,w:70},{x:1110,y:124,w:56},{x:1230,y:106,w:50},
    {x:1440,y:120,w:80},{x:1560,y:100,w:60},{x:1820,y:122,w:90},{x:2080,y:122,w:60},{x:2200,y:104,w:56},
    {x:2380,y:118,w:70},{x:2500,y:98,w:60},{x:2640,y:122,w:80},{x:3000,y:118,w:46},
    // altas: cartel oxidado (encadenando saltos) y uno solo para el Grillo
    {x:862,y:60,w:40,hi:'sign'},{x:1622,y:62,w:44,hi:'sign'},{x:2900,y:84,w:44,hi:'sign'},
    // escalones de la arena del jefe
    {x:3110,y:130,w:34,step:1},{x:3176,y:104,w:30,step:1},{x:3236,y:124,w:38,step:1}],
  // paso bajo la autopista caída (el techo es plataforma)
  tunnels:[{x:1696,w:118,y:116,k:'overpass'}],
  // pirámide de chatarra: 4 escalones de 24 px (se suben saltando), punta en y=60
  pyramids:[{x:2716,w:150,n:4,dy:24,inset:14,mats:['plank','sheet','drum','sheet']}],
  // coberturas que frenan balas enemigas (k: tipo, h: alto, hp: aguante a explosiones)
  covers:[{x:645,w:26,h:14,k:'sandbags',hp:8},{x:1096,w:24,h:15,k:'concrete',hp:14},{x:1286,w:16,h:14,k:'tires',hp:8},
    {x:1596,w:24,h:14,k:'sandbags',hp:8},{x:2028,w:32,h:16,k:'container',hp:12},{x:2290,w:24,h:15,k:'concrete',hp:14},
    {x:2572,w:16,h:14,k:'tires',hp:8},{x:3016,w:24,h:18,k:'concrete',hp:16}],
  crates:[{x:250,drop:'S'},{x:470,drop:'G'},{x:610,drop:'E'},{x:900,drop:'H'},{x:1250,drop:'+'},{x:1330,drop:'F'},{x:1500,drop:'R'},
    {x:1960,drop:'G'},{x:2260,drop:'E'},{x:2340,drop:'+'},{x:2450,drop:'S'},{x:2690,drop:'F'},{x:2940,drop:'R'}],
  // cajas que aparecen o no (p: probabilidad; y: arriba de una plataforma)
  extraCrates:[{x:874,y:60,p:0.7},{x:1520,p:0.45},{x:2160,p:0.4},{x:2924,y:84,p:0.6}],
  turrets:[1660,2610],mechs:[1400,2870],
  prisoners:[{x:560,k:'item'},{x:835,y:98,k:'item'},{x:1200,k:'ally'},{x:1950,k:'item'},{x:2515,y:98,k:'ally'},{x:2786,y:60,k:'item'}],
  extraPrisoners:[{x:1640,y:62,p:0.75,k:'item'},{x:2906,y:84,p:0.7,k:'ally'},{x:420,p:0.35,k:'item'}],
  decor:[{x:120,k:'sign'},{x:206,k:'barrel'},{x:216,k:'barrel'},{x:520,k:'car'},{x:900,k:'pylon'},{x:1010,k:'barrel'},
    {x:1180,k:'tire'},{x:1380,k:'car'},{x:1900,k:'pylon'},{x:2150,k:'barrel'},{x:2300,k:'sign'},{x:2515,k:'car'},
    {x:2900,k:'sign'},{x:3120,k:'pylon'},{x:3260,k:'tire'}],
  events:[
    {at:20,spawn:[{t:'soldier',x:'R',d:70},{t:'soldier',x:'R',d:170}]},
    {at:110,spawn:[{t:'soldier',x:440,y:90}]},
    {at:240,spawn:[{t:'soldier',x:'R'},{t:'grenadier',x:'R',d:70},{t:'soldier',x:'R',d:150}]},
    {at:400,spawn:[{t:'soldier',x:730,y:102},{t:'drone',x:'R',d:40}]},
    {at:500,spawn:[{t:'soldier',x:840,y:80},{t:'soldier',x:'R',d:30}]},
    {at:620,spawn:[{t:'drone',x:'R'},{t:'drone',x:'R',d:60},{t:'soldier',x:985,y:104,d:20}]},
    {at:780,spawn:[{t:'grenadier',x:'R'},{t:'soldier',x:'R',d:50},{t:'soldier',x:'R',d:110}]},
    {at:1120,spawn:[{t:'soldier',x:1465,y:102},{t:'soldier',x:'R',d:20}]},
    {at:1240,spawn:[{t:'grenadier',x:1580,y:82},{t:'drone',x:'R',d:40}]},
    {at:1400,spawn:[{t:'soldier',x:'R'},{t:'soldier',x:'R',d:40},{t:'drone',x:'R',d:100}]},
    {at:1520,spawn:[{t:'soldier',x:1850,y:104},{t:'grenadier',x:'R',d:40}]},
    {at:1720,spawn:[{t:'drone',x:'R'},{t:'drone',x:'R',d:45},{t:'soldier',x:'R',d:70},{t:'soldier',x:'R',d:120}]},
    {at:2060,spawn:[{t:'soldier',x:2400,y:100},{t:'grenadier',x:'R',d:30}]},
    {at:2180,spawn:[{t:'soldier',x:2520,y:80},{t:'soldier',x:'R',d:20},{t:'drone',x:'R',d:80}]},
    {at:2360,spawn:[{t:'soldier',x:'R'},{t:'soldier',x:'R',d:30},{t:'grenadier',x:'R',d:70},{t:'drone',x:'R',d:110}]},
    {at:2540,spawn:[{t:'drone',x:'R'},{t:'drone',x:'R',d:30},{t:'drone',x:'R',d:60}]},
    {at:2700,spawn:[{t:'soldier',x:'R'},{t:'soldier',x:2780,y:66,d:10},{t:'grenadier',x:'R',d:40},{t:'soldier',x:'R',d:90}]}],
  arenas:[
    // jefe chico a un tercio; después juego normal y una emboscada; el villano al final (nunca seguidos)
    {at:1040,mini:true},
    {at:2000,waves:[
      [{t:'soldier',x:'R'},{t:'soldier',x:'L',d:30},{t:'soldier',x:'R',d:80}],
      [{t:'drone',x:'R'},{t:'grenadier',x:'R',d:30},{t:'drone',x:'L',d:60}],
      [{t:'soldier',x:'R'},{t:'soldier',x:'L',d:25},{t:'grenadier',x:'R',d:60},{t:'soldier',x:'R',d:110}]]},
    {at:2980,boss:true}]},
 {name:'MISIÓN 2 · PUERTO CENIZA',short:'2 · PUERTO CENIZA',theme:'port',end:3400,music:'l2',
  platforms:[{x:260,y:130,w:56,box:'#8c3b2a'},{x:420,y:114,w:50,box:'#2f6a8a'},{x:470,y:130,w:56,box:'#b07a2a'},{x:720,y:126,w:70,box:'#3a7a4a'},
    {x:880,y:104,w:44,box:'#8c3b2a'},{x:924,y:126,w:60,box:'#2f6a8a'},{x:1150,y:126,w:50,box:'#b07a2a'},{x:1320,y:110,w:50,box:'#3a7a4a'},
    {x:1560,y:120,w:70,box:'#2f6a8a'},{x:1672,y:100,w:50,box:'#8c3b2a'},{x:1750,y:124,w:60,box:'#b07a2a'},
    {x:2220,y:124,w:56,box:'#3a7a4a'},{x:2380,y:108,w:50,box:'#2f6a8a'},
    {x:2650,y:122,w:70,box:'#8c3b2a'},{x:2800,y:104,w:60,box:'#b07a2a'},{x:2860,y:126,w:56,box:'#3a7a4a'},
    {x:3140,y:112,w:44},{x:3300,y:112,w:44},
    // altas: pasarelas colgadas de las grúas
    {x:1630,y:64,w:44,hi:'crane'},{x:2296,y:68,w:44,hi:'crane'},{x:2880,y:62,w:40,hi:'crane'},
    // escalones de la arena del jefe
    {x:3214,y:130,w:34,step:1},{x:3350,y:128,w:32,step:1}],
  // pasaje bajo el muelle elevado
  tunnels:[{x:2466,w:126,y:116,k:'pier'}],
  // pirámide de contenedores y tarimas
  pyramids:[{x:1940,w:150,n:4,dy:24,inset:14,mats:['box:#8c3b2a','pallet','box:#2f6a8a','box:#b07a2a']}],
  covers:[{x:596,w:12,h:15,k:'bollard',hp:0},{x:1112,w:26,h:15,k:'lowbox',hp:12},{x:1372,w:20,h:14,k:'pallets',hp:7},
    {x:1818,w:22,h:14,k:'pallets',hp:7},{x:2186,w:12,h:15,k:'bollard',hp:0},{x:2436,w:24,h:15,k:'lowbox',hp:12},
    {x:2612,w:12,h:15,k:'bollard',hp:0},{x:3110,w:22,h:15,k:'pallets',hp:9},{x:3268,w:26,h:16,k:'lowbox',hp:14}],
  crates:[{x:200,drop:'H'},{x:380,drop:'G'},{x:640,drop:'R'},{x:1050,drop:'E'},{x:1250,drop:'+'},{x:1460,drop:'F'},{x:1922,drop:'S'},
    {x:2300,drop:'G'},{x:2560,drop:'+'},{x:2940,drop:'R'},{x:3020,drop:'E'}],
  extraCrates:[{x:760,p:0.45},{x:2310,y:68,p:0.7},{x:2892,y:62,p:0.6},{x:1520,p:0.4}],
  turrets:[1880,2730],mechs:[1480],
  prisoners:[{x:330,k:'ally'},{x:890,y:104,k:'item'},{x:1260,k:'item'},{x:1715,y:100,k:'ally'},{x:2300,k:'item'},{x:2820,y:104,k:'item'},{x:3010,k:'ally'},{x:2010,y:60,k:'item'}],
  extraPrisoners:[{x:1648,y:64,p:0.75,k:'ally'},{x:2530,p:0.4,k:'item'}],
  decor:[{x:90,k:'lamp'},{x:150,k:'bollard'},{x:340,k:'coil'},{x:560,k:'lamp'},{x:820,k:'barrel'},{x:1010,k:'lamp'},
    {x:1100,k:'coil'},{x:1400,k:'bollard'},{x:1500,k:'lamp'},{x:1660,k:'barrel'},{x:1906,k:'lamp'},{x:2100,k:'bollard'},{x:2330,k:'coil'},
    {x:2350,k:'lamp'},{x:2626,k:'barrel'},{x:2960,k:'lamp'},{x:3060,k:'bollard'},{x:3240,k:'lamp'},{x:3370,k:'coil'}],
  events:[
    {at:20,spawn:[{t:'soldier',x:'R',d:60},{t:'shield',x:'R',d:150}]},
    {at:110,spawn:[{t:'soldier',x:440,y:96}]},
    {at:260,spawn:[{t:'grenadier',x:'R'},{t:'soldier',x:'R',d:50},{t:'drone',x:'R',d:120}]},
    {at:400,spawn:[{t:'soldier',x:740,y:108},{t:'shield',x:'R',d:40}]},
    {at:560,spawn:[{t:'soldier',x:895,y:86},{t:'drone',x:'R',d:30},{t:'soldier',x:'R',d:90}]},
    {at:700,spawn:[{t:'shield',x:'R'},{t:'grenadier',x:'R',d:60},{t:'soldier',x:'R',d:120}]},
    {at:1200,spawn:[{t:'soldier',x:1580,y:102},{t:'soldier',x:'R',d:30}]},
    {at:1320,spawn:[{t:'grenadier',x:1715,y:82},{t:'drone',x:'R',d:40}]},
    {at:1430,spawn:[{t:'soldier',x:1770,y:106},{t:'grenadier',x:'R',d:40},{t:'shield',x:'R',d:100}]},
    {at:1460,spawn:[{t:'shield',x:'R'},{t:'soldier',x:'R',d:40},{t:'drone',x:'R',d:90}]},
    {at:1820,spawn:[{t:'drone',x:'R'},{t:'soldier',x:2000,y:66,d:20},{t:'drone',x:'R',d:40},{t:'soldier',x:'R',d:70},{t:'shield',x:'R',d:120}]},
    {at:2260,spawn:[{t:'soldier',x:2670,y:104},{t:'shield',x:'R',d:30}]},
    {at:2380,spawn:[{t:'soldier',x:2820,y:86},{t:'soldier',x:'R',d:20},{t:'drone',x:'R',d:80}]},
    {at:2520,spawn:[{t:'shield',x:'R'},{t:'soldier',x:'R',d:30},{t:'grenadier',x:'R',d:70},{t:'drone',x:'R',d:110}]},
    {at:2700,spawn:[{t:'drone',x:'R'},{t:'drone',x:'R',d:30},{t:'drone',x:'R',d:60}]},
    {at:2840,spawn:[{t:'shield',x:'R'},{t:'grenadier',x:'R',d:40},{t:'soldier',x:'R',d:90}]}],
  arenas:[
    {at:1100,mini:true},
    {at:2160,waves:[
      [{t:'shield',x:'R'},{t:'soldier',x:'L',d:30},{t:'soldier',x:'R',d:70}],
      [{t:'drone',x:'R'},{t:'drone',x:'L',d:30},{t:'grenadier',x:'R',d:60}],
      [{t:'shield',x:'R'},{t:'shield',x:'L',d:40},{t:'soldier',x:'R',d:80},{t:'drone',x:'R',d:120}]]},
    {at:3080,boss:true}]}
];
let levelIdx=0,L=LEVELS[0],platforms=L.platforms,LEVEL_END=L.end,unlocked=+(store.get('oxido-nivel')||0),selLevel=0;

// fondos procedurales
const R1=mulberry32(11);
const MOUNT_FAR=Array.from({length:32},()=>18+R1()*30);
const MOUNT_NEAR=Array.from({length:24},()=>10+R1()*22);
const CLOUDS=Array.from({length:6},(_,i)=>({x:i*110+R1()*60,y:18+R1()*40,w:40+R1()*50}));
const RUINS=[];
{let x=0;while(x<900){const w=24+R1()*40,h=26+R1()*56;const win=[];for(let i=0;i<6;i++)if(R1()<0.5)win.push([3+R1()*(w-8),10+R1()*(h-16)]);
  RUINS.push({x,w,h,cut:R1()<0.5?R1()*12:0,win,crane:R1()<0.15});x+=w+8+R1()*40;}}
const CITY=[];{let x=0;while(x<600){const w=10+R1()*22,h=10+R1()*34;CITY.push({x,w,h,s:Math.floor(R1()*1000)});x+=w+R1()*4;}}
const CRANES=[{x:40,h:96},{x:300,h:108},{x:560,h:88}];

// ===== estructuras fijas: techos de túneles y escalones de pirámides =====
// Se agregan una sola vez a platforms al cargar (no cambian entre partidas).
for(const l of LEVELS){
  for(const t of l.tunnels||[])l.platforms.push({x:t.x,y:t.y,w:t.w,roof:t});
  for(const p of l.pyramids||[])for(let i=0;i<p.n;i++)
    l.platforms.push({x:p.x+i*p.inset,y:GROUND-(i+1)*p.dy,w:p.w-2*i*p.inset,pyr:p,tier:i,mat:p.mats[i%p.mats.length]});
}

// ===== gancho: variedad entre partidas =====
// Se llama al final de startLevel. El recorrido es el mismo; cambian con azar los enemigos de cada evento y
// de cada oleada (menos la del jefe), las demoras, qué suelta cada caja, qué prisioneros son amigos y
// algunas cajas y prisioneros que aparecen o no. Siempre se arma desde una copia intacta de la misión.
const NV_BASE=[];
const NV_COSTO={soldier:1,grenadier:1.2,drone:1.3,shield:1.5};
function nvMezclar(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
// cambia el tipo por otro de costo parecido (los que nacen sobre una plataforma siguen siendo de a pie)
function nvTipo(it,pool){
  if(Math.random()>0.35)return it.t;
  const c=NV_COSTO[it.t]||1,fijo=typeof it.x==='number';
  const ops=pool.filter(t=>t!==it.t&&Math.abs((NV_COSTO[t]||1)-c)<=0.35&&!(fijo&&t==='drone'));
  return ops.length?pick(ops):it.t;
}
function nvSpawn(it,pool,lado){
  const o={...it,t:nvTipo(it,pool)};
  if(o.d)o.d=Math.round(o.d*rand(0.75,1.3));
  if(lado&&typeof o.x!=='number'&&Math.random()<0.25)o.x=o.x==='R'?'L':'R';
  if(o.t==='drone'&&it.t!=='drone'){delete o.y;if(typeof o.x==='number')o.x='R';}
  return o;
}
function variarPartida(){
  const i=levelIdx;
  if(!NV_BASE[i])NV_BASE[i]=structuredClone({events:L.events,arenas:L.arenas,crates:L.crates,prisoners:L.prisoners,
    extraCrates:L.extraCrates||[],extraPrisoners:L.extraPrisoners||[]});
  const B=structuredClone(NV_BASE[i]);
  const pool=[...new Set([...B.events,...B.arenas.flatMap(a=>a.waves||[]).map(w=>({spawn:w}))].flatMap(e=>e.spawn.map(s=>s.t)))];
  // eventos: tipos parecidos, demoras, a veces uno más o uno menos, y el disparo corrido unos píxeles
  const ev=B.events.map(e=>{
    let sp=e.spawn.map(s=>nvSpawn(s,pool,false));
    const libres=sp.filter(s=>typeof s.x!=='number');
    if(libres.length>=3&&Math.random()<0.2)sp.splice(sp.indexOf(pick(libres)),1);
    else if(Math.random()<0.25)sp.push({t:pick(['soldier','soldier',pick(pool)]),x:'R',d:Math.max(0,...sp.map(s=>s.d||0))+rand(30,60)|0});
    return{at:Math.max(10,e.at+Math.round(rand(-15,15))),spawn:sp};
  }).sort((a,b)=>a.at-b.at);
  levelEvents=ev;
  // oleadas: misma cantidad de enemigos, tipos de costo parecido, lados y demoras al azar; la del jefe no se toca
  L.arenas=B.arenas.map(a=>a.boss||a.mini?a:{...a,waves:a.waves.map(w=>w.map(s=>nvSpawn(s,pool,true)))});
  // cajas: se reparten los premios (las curas siguen siendo las mismas: una por mitad de la misión)
  const drops=nvMezclar(B.crates.map(c=>c.drop));
  if(Math.random()<0.35){const k=drops.findIndex(d=>'SHFR'.includes(d));if(k>=0)drops[k]=pick(['S','H','F','R'].filter(d=>d!==drops[k]));}
  const base=crates.slice(0,B.crates.length);
  base.forEach((c,k)=>c.drop=drops[k]);
  const mitad=L.end/2,cura=c=>c.drop==='+';
  for(const enMitad of [c=>c.x<mitad,c=>c.x>=mitad]){
    if(base.some(c=>enMitad(c)&&cura(c)))continue;
    const otra=base.filter(c=>!enMitad(c)&&cura(c)),dest=base.filter(c=>enMitad(c));
    if(otra.length>1&&dest.length){const d=pick(dest);otra[0].drop=d.drop;d.drop='+';}
  }
  for(const c of B.extraCrates)if(Math.random()<c.p)
    crates.push({x:c.x,drop:pick(['G','E','S','H','+','F','R','A']),y:(c.y??GROUND)-14,w:14,h:14,hp:3,flash:0});
  // prisioneros: algunos aparecen o no, y se sortea quiénes se suman como amigos (al menos uno en el suelo)
  const pr=[...B.prisoners,...B.extraPrisoners.filter(p=>Math.random()<p.p)];
  const nAm=clamp(B.prisoners.filter(p=>p.k==='ally').length+pick([-1,0,0,1]),1,pr.length);
  const orden=nvMezclar([...pr.keys()]);
  const suelo=orden.find(k=>pr[k].y===undefined);
  if(suelo!==undefined){orden.splice(orden.indexOf(suelo),1);orden.unshift(suelo);}
  pr.forEach(p=>p.k='item');for(let k=0;k<nAm;k++)pr[orden[k]].k='ally';
  prisoners=pr.map(mkPris);
  if(typeof armarCoberturas==='function')armarCoberturas();
}

// ===== cofres blindados: hay que pegarles mucho; adentro, una vida extra. Al acercarte, viene una oleada grande =====
LEVELS[0].vaults=[{x:2500}];
LEVELS[1].vaults=[{x:1530}];
LEVELS[0].events.push({at:2330,spawn:[{t:'soldier',x:'R'},{t:'grenadier',x:'R',d:30},{t:'soldier',x:'L',d:50},{t:'drone',x:'R',d:80},{t:'soldier',x:'R',d:120},{t:'soldier',x:'L',d:160}]});
LEVELS[1].events.push({at:1350,spawn:[{t:'shield',x:'R'},{t:'soldier',x:'L',d:30},{t:'grenadier',x:'R',d:60},{t:'drone',x:'L',d:90},{t:'soldier',x:'R',d:130},{t:'soldier',x:'L',d:170}]});
for(const lv of LEVELS)lv.events.sort((a,b)=>a.at-b.at);
