'use strict';
// Óxido · Sprites en pixel art y armado de cuadros
// ================== sprites (pixel art original) ==================
const HEAD=["....kkkkkk....","...kHHhhhhk...","..khhhhhhhhk..","..kkkkkkkkkkk.","...ksssssesk..","...ksssssssk..","....kSSSSSk..."];
// FACU (el mayor): casco verde, canas en la patilla (z), bigote y barba (m) con alguna cana
const HEAD_P=["....kkkkkk....","...kHHhhhhk...","..khhhhhhhhk..","..kkkkkkkkkkk.","...kzssssesk..","...kzssssmmk..","...kmmmmmmmk.."];
// JOSÉ: casco chico, pelo cobrizo que sale del casco en cola de caballo (sigue en TORSO_T), pestaña y labios
const HEAD_T=["....kkkkkk....","...kCCcccck...","..kcccccccckk.",".kYysssssskk..","kyyysssssesk..","kyyksssssssk..",".kyykSSSlSk..."];
// LAUTI (el chico): gorra con visera, sin casco, mechón, cara redonda con cachetes y sin barba
const HEAD_B=["..............","....kkkkkk....","...kHHhhhhk...","..khhhhhhhuuuk","..kysssssesk..","..ksssssslsk..","...kSssssSk..."];
const TORSO=["...krrrrrrrk..","..kvvvvVvvvvk.","..kvvvvVvvvvk.","..kvvvvVvvvvk.","..kVVVVVVVVVk."];
// torsos propios: JOSÉ con la cola de caballo sobre la espalda y cintura apenas más fina;
// LAUTI con camiseta a rayas celeste y blanca
const TORSO_T=["kyykrrrrrrrk..","kykvvvvVvvvvk.",".kkvvvvVvvvvk.","..kvvvvVvvvvk.","...kVVVVVVVk.."];
const TORSO_B=["...kwrwrwrwk..","..krwrwrwrwrk.","..krwrwrwrwrk.","..krwrwrwrwrk.","...kRwRwRwRk.."];
const HIP=["...kpppppppk.."];
const LEGS={
  idle:["...kpppkpppk..","...kpppkpppk..","...kPPPkPPPk..","...kbbbkbbbbk.","...kkkk.kkkkk."],
  jump:["...kpppkpppk..","..kpppk.kpppk.","..kbbk...kbbk.","..kkk.....kkk.",".............."]
};
// piernas generadas: cada pierna es una lista de filas "x0-x1" (pantalón) o "x0-x1b" (bota).
// Se dibuja primero la de atrás (más oscura) y después la de adelante, cada una con su contorno.
function mkLegs(back,front){
  const g=Array.from({length:5},()=>Array(14).fill('.'));
  const put=(rows,isBack)=>{
    const own=new Set();
    rows.forEach((r,j)=>{if(!r)return;const m=/^(\d+)-(\d+)(b?)$/.exec(r);
      for(let i=+m[1];i<=+m[2];i++){g[j][i]=m[3]?'b':(isBack||j>=2)?'P':'p';own.add(j*14+i);}});
    for(const c of own){const j=Math.floor(c/14),i=c%14;
      for(const[dj,di]of[[0,-1],[0,1],[1,0],[-1,0]]){const y=j+dj,x=i+di;
        if(y>=0&&y<5&&x>=0&&x<14&&!own.has(y*14+x))g[y][x]='k';}}
  };
  put(back,true);put(front,false);
  return g.map(r=>r.join(''));
}
// ciclo de carrera de 6 cuadros (contacto, apoyo, paso) x 2 piernas, mirando a la derecha
const RUN_LEGS=[
  [['4-6','3-5','2-4','1-3b'],['6-8','7-9','8-10','9-12b']],
  [['4-6','3-5','1-3b',''],['6-8','7-9','7-9','7-10b']],
  [['5-7','6-9','5-7b',''],['6-8','6-8','6-8','6-9b']],
  [['6-8','7-9','8-10','9-12b'],['4-6','3-5','2-4','1-3b']],
  [['6-8','7-9','7-9','7-10b'],['4-6','3-5','1-3b','']],
  [['6-8','6-8','6-8','6-9b'],['5-7','6-9','5-7b','']]
];
RUN_LEGS.forEach(([b,f],i)=>{LEGS['r'+i]=mkLegs(b,f);});
LEGS.rise=mkLegs(['4-6','4-6','4-6','4-7b'],['6-8','7-10','7-9b','']);
LEGS.fall=mkLegs(['4-6','3-5','3-5','2-5b'],['6-8','7-9','8-10','8-11b']);
LEGS.land=mkLegs(['4-6','3-5','3-5','2-5b'],['7-9','8-10','8-10','8-11b']);
LEGS.run1=LEGS.r0;LEGS.run2=LEGS.r2;
const RUN_BOB=[0,1,0,0,1,0],RUN_STEP=3.6;
const CROUCH=["..kpppppppppk.",".kbbbbk.kbbbbk",".kkkkkk.kkkkkk"];
const PAL_P={k:'#17141f',h:'#4f6a2c',H:'#7f9d47',s:'#efb88d',S:'#bd825a',e:'#1a1a1a',r:'#d93a2b',v:'#8f6c3b',V:'#68502a',p:'#3c4b63',P:'#2a3448',b:'#2b2019',m:'#6a4a34',z:'#c9c3b8'};
const PAL_T={...PAL_P,c:'#2f8a96',C:'#5cc0c8',y:'#a4482a',Y:'#d0703a',l:'#d0505e',s:'#c98a5e',S:'#9a6440',r:'#f0c040',v:'#5b6e7f',V:'#43525f',p:'#6a4b3a',P:'#4e3628'};
const PAL_B={...PAL_P,h:'#d23a2e',H:'#f06a50',u:'#8a2018',y:'#6a4024',s:'#f0b48a',S:'#c88460',l:'#e88a7a',r:'#74bde8',R:'#4f97c8',w:'#f2f0ea',p:'#4a6a9a',P:'#36507a',b:'#d8d2c4'};
const PAL_E={...PAL_P,h:'#5d5f6b',H:'#8d909e',s:'#8b8e99',S:'#666975',e:'#ff4130',r:'#2e2f38',v:'#7b7258',V:'#5a533f',p:'#4d4a42',P:'#38352f'};
const PAL_G={...PAL_E,h:'#6b4a5e',H:'#94708a',v:'#5f5a72',V:'#454157'};
const PAL_SH={...PAL_E,h:'#3a4a6a',H:'#5a6e94',v:'#3d4a5e',V:'#2a3445',p:'#2f3540',P:'#22262e'};
// prisioneros / amigos: sin casco, pelo y vincha verde
const HEAD_A=["....kkkkk.....","...kyyyyyk....","..kyyyyyyyk...","..kgggggggk...","...ksssssesk..","...ksssssssk..","....kSSSSSk..."];
const PAL_A={...PAL_P,y:'#3a2a1a',g:'#4fa84a',s:'#e0a27a',S:'#b07850',r:'#e8e2d6',v:'#c9b98a',V:'#a8986a',p:'#6a5a4a',P:'#4e4236'};
const PAL_W=Object.fromEntries('khHsSercyvVpPbg'.split('').map(k=>[k,'#ffffff']));
function makeSprite(rows,pal){
  const w=14,h=rows.length,c=document.createElement('canvas');c.width=w;c.height=h;
  const x=c.getContext('2d');
  rows.forEach((row,j)=>{for(let i=0;i<Math.min(w,row.length);i++){const ch=row[i];if(ch!=='.'&&pal[ch]){x.fillStyle=pal[ch];x.fillRect(i,j,1,1);}}});
  return c;
}
function flip(c){const f=document.createElement('canvas');f.width=c.width;f.height=c.height;const x=f.getContext('2d');x.translate(c.width,0);x.scale(-1,1);x.drawImage(c,0,0);return f;}
function both(rows,pal){const r=makeSprite(rows,pal);return[r,flip(r)];}
function build(pal,head=HEAD,torso=TORSO){
  const o={lo:{},up:both([...head,...torso],pal)};
  for(const k in LEGS){o[k]=both([...head,...torso,...HIP,...LEGS[k]],pal);o.lo[k]=both([...HIP,...LEGS[k]],pal);}
  o.crouch=both([...head,...torso,...CROUCH],pal);return o;
}
// ================== animación compartida (jugador, soldados, amigos) ==================
// Se llama después de la física. vyAntes = velocidad vertical antes de tocar el piso.
function animStep(o,wasAir,vyAntes){
  const mv=o.onGround&&Math.abs(o.vx)>0.05;
  if(mv)o.dist=(o.dist||0)+Math.abs(o.vx);
  const tgt=Math.abs(o.vx)>0.3?Math.sign(o.vx)*(o.onGround?1:0.5):0;
  o.lean=(o.lean||0)+(tgt-(o.lean||0))*0.18;
  if(wasAir&&o.onGround&&vyAntes>2)o.landT=7;else if(o.landT>0)o.landT--;
  o.rec=o.rec>0.05?o.rec*0.72:0;
  // al darse vuelta: saltito corto y un cuadro de transición (el torso gira antes que las piernas)
  if(o.turnCd>0)o.turnCd--;if(o.turnT>0)o.turnT--;
  if(o.lastFace===undefined)o.lastFace=o.face;
  if(o.face!==o.lastFace){if(o.onGround&&!o.turnCd){o.turnT=8;o.turnCd=18;o.oldFace=o.lastFace;}o.lastFace=o.face;}
}
// pose: qué piernas, y cuánto se corre el torso (ux en el mundo, uy hacia abajo)
function rigPose(o,ph=0){
  let leg='idle',uy=0;
  if(!o.onGround)leg=o.vy<-1.4?'rise':o.vy>1.4?'fall':'jump';
  else if(o.landT>0){leg='land';uy=o.landT>4?2:1;}
  else if(Math.abs(o.vx)>0.05){const n=Math.floor((o.dist||0)/RUN_STEP)%6;leg='r'+n;uy=RUN_BOB[n];}
  else uy=Math.floor((T+ph)/30)%2; // respiración: 1 px, ciclo de ~1 s
  const t=o.turnT||0,hop=t>0?-Math.round(Math.sin((8-t)/8*Math.PI)*1.6):0;
  const lf=t>5&&o.oldFace!==undefined?(o.oldFace>0?0:1):(o.face>0?0:1);
  return{leg,ux:(o.lean||0)-o.face*(o.rec||0)*0.35,uy:uy+hop,hop,lf};
}
// dibuja piernas y torso por separado; lf = hacia dónde miran las piernas (cuadro de transición al girar)
function drawRig(set,pose,f,x,y){
  ctx.drawImage(set.lo[pose.leg][pose.lf??f],q(x),q(y+12+(pose.hop||0)));
  ctx.drawImage(set.up[f],q(x+pose.ux),q(y+pose.uy));
}
