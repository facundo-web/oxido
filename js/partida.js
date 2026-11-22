'use strict';
// Óxido · Partida continua: vueltas, tramos y su puntaje, continuar, fin de partida y eventos para el historial
// Va antes de juego.js. Usa ON_START, ON_STEP, ON_HUD y ON_EVENT (base.js).
//
// VUELTAS: al ganar la última misión la partida sigue en la misión 1 de la VUELTA 2, después la 3, etc.
//   Cada vuelta: enemigos y jefes +25 % de vida (tope ×2,5), disparan +12 % más seguido (tope +60 %),
//   soldados +6 % más rápidos (tope +30 %), enemigos extra por evento y +25 % de puntos por baja (igual que la vida).
// TRAMOS: cada misión se parte en tramos; cada uno termina en una arena (emboscada, jefe chico, villano).
//   Al cerrar un tramo: SIN DAÑO, PUNTERÍA y RACHA dan bonus (× número de vuelta). Ver PC_bonus().
// CONTINUAR: hasta 3 por partida. Retoma desde el principio de la misión, vidas iniciales y la mitad de los puntos.

let vuelta=1;                 // 1, 2, 3…
let partida=null;             // datos de toda la partida (se arma en gameStart)
let PC_mis=null;              // misión en curso: tramos cerrados y el tramo abierto
let PC_aviso=null,PC_cartel=null,PC_cont=false;
let tituloSel=0;              // opción elegida en el menú del título
const PC_MAX_CONT=3;
// ---------- escalado por vuelta ----------
const PC_hpMul=()=>Math.min(2.5,1+0.25*(vuelta-1));
const PC_cadMul=()=>Math.min(1.6,1+0.12*(vuelta-1));
const PC_velMul=()=>Math.min(1.3,1+0.06*(vuelta-1));
let PC_dc=null;
// DIFF() de juego.js llama a esto desde la vuelta 2: misma dificultad con más vida y más cadencia
function difVuelta(){
  const b=DIFFS[difficulty];
  if(!PC_dc||PC_dc.b!==b||PC_dc.v!==vuelta)PC_dc={b,v:vuelta,d:{...b,ehp:b.ehp*PC_hpMul(),fire:b.fire/PC_cadMul()}};
  return PC_dc.d;
}
// enemigos nuevos de cada vuelta (spawn() en combate.js): un poco más rápidos y valen más puntos
function PC_escalar(e){if(vuelta<2)return;if(e.spd)e.spd*=PC_velMul();if(e.score)e.score=Math.round(e.score*PC_hpMul());}
// enemigos extra por evento: vuelta 2 → la mitad de los eventos +1 · vuelta 3 → todos +1 · 4 → +1 o +2 · 5 en adelante → +2
// desde la vuelta 3, cada oleada de emboscada suma uno
function PC_extra(){
  if(vuelta<2)return;
  const pool=['soldier','soldier','grenadier','drone'];if(levelIdx>0)pool.push('shield');
  for(const ev of levelEvents){
    let n=Math.floor((vuelta-1)/2);if((vuelta-1)%2&&Math.random()<0.5)n++;n=Math.min(2,n);
    const md=Math.max(0,...ev.spawn.map(s=>s.d||0));
    for(let i=0;i<n;i++)ev.spawn.push({t:pick(pool),x:'R',d:md+30+i*40+(Math.random()*30|0)});
  }
  if(vuelta>=3)L.arenas=L.arenas.map(a=>a.waves?{...a,waves:a.waves.map(w=>[...w,{t:pick(pool),x:pick(['R','L']),d:Math.max(0,...w.map(s=>s.d||0))+40}])}:a);
}
// jefes, drones, torretas y criaturas recargan más rápido (los soldados ya lo hacen por DIFF().fire)
const PC_SOLD={soldier:1,grenadier:1,shield:1};
ON_STEP.push(()=>{
  if(partida&&!winT)partida.frames++;
  if(PC_aviso&&--PC_aviso.t<=0)PC_aviso=null;
  if(PC_cartel&&--PC_cartel.t<=0)PC_cartel=null;
  if(winT&&PC_mis&&PC_mis.cur)tramoCerrar(); // el villano cayó: se cierra el último tramo
  if(vuelta<2)return;
  const k=PC_cadMul()-1;
  for(const e of enemies){
    if(e.gone||PC_SOLD[e.type]||!(e.cd>1)||!onScreen(e,0))continue;
    e.pcAcc=(e.pcAcc||0)+k;if(e.pcAcc>=1){e.pcAcc--;e.cd--;}
  }
});
// ---------- partida y misión ----------
function PC_nueva(){return{frames:0,resc:0,bosses:0,wins:0,cont:0,armas:{},d0:tirosDisp,p0:tirosPeg,ended:false};}
ON_START.push(carry=>{
  if((!carry&&!PC_cont)||!partida){
    vuelta=1;partida=PC_nueva();PC_cartel=null;
    emit('gameStart',{chars:players.map(p=>CHARS[p.ci].name),twoP:players.length>1,difficulty});
  }
  PC_extra();
  PC_mis={level:levelIdx,loop:vuelta,score0:score,hurt:false,air:0,tramos:[],cur:null};
  PC_abrirTramo();PC_aviso=null;
  emit('missionStart',{level:levelIdx,loop:vuelta});
});
// ---------- tramos ----------
const PC_KIND=a=>!a?'TRAMO':a.boss?'VILLANO':a.mini?'JEFE CHICO':'EMBOSCADA';
function PC_abrirTramo(){
  const m=PC_mis,n=m.tramos.length+1;
  m.cur={n,kind:PC_KIND(L.arenas[n-1]),kills:0,by:{},resc:0,cat:0,hurt:false,bosses:0,racha:0,best:0,
    f0:partida.frames,d0:tirosDisp,p0:tirosPeg,secs:0,disp:0,peg:0,pct:null,items:[],bonus:0};
}
// bonus del tramo (× número de vuelta)
function PC_bonus(t){
  const k=vuelta,it=[];
  if(!t.hurt)it.push(['SIN DAÑO',500*k]);
  if(t.disp>=15){
    const pc=Math.round(t.peg*100/t.disp);t.pct=pc;
    const b=pc>=80?600:pc>=65?400:pc>=50?250:pc>=35?100:0;
    if(b)it.push(['PUNTERÍA '+pc+'%',b*k]);
  }
  if(t.best>=8)it.push(['RACHA '+t.best,t.best*25*k]);
  return it;
}
// cierra el tramo abierto (arenaClear en juego.js, o el villano vencido) y avisa los bonus
function tramoCerrar(){
  const m=PC_mis;if(!m||!m.cur)return;const t=m.cur;m.cur=null;
  t.secs=Math.round((partida.frames-t.f0)/60);t.disp=tirosDisp-t.d0;t.peg=tirosPeg-t.p0;
  if(t.disp>0&&t.pct===null)t.pct=Math.round(t.peg*100/t.disp);
  t.items=PC_bonus(t);t.bonus=t.items.reduce((s,i)=>s+i[1],0);score+=t.bonus;
  m.tramos.push(t);
  PC_aviso={t:270,max:270,tr:t};if(t.bonus)later(380,SFX.medal);
  if(m.tramos.length<L.arenas.length)PC_abrirTramo();
}
const PC_mmss=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
// ---------- lo que cuenta la partida (escucha sus propios eventos) ----------
ON_EVENT.push((t,d)=>{
  if(!partida)return;const tr=PC_mis&&PC_mis.cur;
  switch(t){
  case 'kill':if(d.boss||d.mini)partida.bosses++;
    if(tr){tr.kills++;tr.by[d.type]=(tr.by[d.type]||0)+1;if(d.boss||d.mini)tr.bosses++;if(++tr.racha>tr.best)tr.best=tr.racha;}break;
  case 'rescue':partida.resc++;if(tr){if(d.kind==='cat')tr.cat++;else tr.resc++;}break;
  case 'hurt':if(PC_mis)PC_mis.hurt=true;if(tr){tr.hurt=true;tr.racha=0;}break;
  case 'airCall':if(PC_mis)PC_mis.air++;break;
  }
});
// ---------- fin de misión, siguiente vuelta ----------
// la llama finishWin() en juego.js, con los puntos ya sumados
function PC_misionGanada(secs){
  if(!partida)return;partida.wins++;
  emit('missionWin',{level:levelIdx,loop:vuelta,noDamage:!PC_mis.hurt,allPrisoners:!prisoners.some(p=>p.state==='tied'),
    catAlive:typeof CAT_vivo==='function'?CAT_vivo():!!(typeof gato!=='undefined'&&gato),noAir:PC_mis.air===0,twoP:twoP(),difficulty,time:secs,score});
}
function siguienteVuelta(){
  vuelta++;emit('loop',{loop:vuelta});startLevel(0,true);
  PC_cartel={s:'VUELTA '+vuelta,sub:'MÁS DUROS: +'+Math.round((PC_hpMul()-1)*100)+'% VIDA · DISPARAN MÁS SEGUIDO',col:'#ffe08a',t:230,max:230};
  SFX.alarm();
}
// ---------- continuar ----------
const contQuedan=()=>PC_MAX_CONT-(partida?partida.cont:0);
function continuar(){
  partida.cont++;const half=Math.floor(score/2);
  for(const p of players)p.out=true; // todos vuelven nuevos (armas iniciales)
  allies=[];
  PC_cont=true;try{startLevel(levelIdx,true);}finally{PC_cont=false;}
  lives=DIFF().lives;score=half;PC_mis.score0=score;newRecord=false;
  PC_cartel={s:'CONTINUACIÓN '+partida.cont+' DE '+PC_MAX_CONT,sub:'MITAD DE LOS PUNTOS · VIDAS ×'+lives,col:'#7dff9a',t:200,max:200};
  SFX.pick();
}
// ---------- fin de partida ----------
function resumenPartida(){
  return{score,chars:players.map(p=>CHARS[p.ci].name),twoP:players.length>1,loop:vuelta,level:levelIdx,kills,
    rescued:partida?partida.resc:rescued,time:partida?Math.round(partida.frames/60):0,bosses:partida?partida.bosses:0,
    difficulty,continues:partida?partida.cont:0};
}
// kind: 'gameOver' (fin del juego sin continuar) o 'gameQuit' (salir desde la pausa o al terminar una misión)
function terminarPartida(kind){
  const sum=resumenPartida();saveRecord();
  if(partida&&!partida.ended){partida.ended=true;emit(kind,{summary:sum});}
  const salir=()=>{state='title';T=0;};
  if(typeof histGameEnd==='function'){let r=false;try{r=histGameEnd(sum,salir);}catch(e){console.error('histGameEnd',e);}if(r)return;}
  salir();
}
// ---------- historial (historial.js): conexión con guardas ----------
const histOk=()=>typeof histOpen==='function'&&typeof histUpdate==='function'&&typeof histDraw==='function'&&typeof histIsScreen==='function';
const tituloOps=()=>histOk()?['JUGAR','LOGROS','RÉCORDS']:['JUGAR'];
function updTitulo(){
  const ops=tituloOps();tituloSel=clamp(tituloSel,0,ops.length-1);
  if(pressed.up&&tituloSel>0){tituloSel--;SFX.swap();}
  else if(pressed.down&&tituloSel<ops.length-1){tituloSel++;SFX.swap();}
  else if(pressed.start||pressed.shoot||pressed.jump){
    audioInit();const o=ops[tituloSel];
    if(o==='JUGAR'){state='select';selT=0;selLevel=Math.min(selLevel,unlocked);}
    else histOpen(o==='LOGROS'?'logros':'records');
  }
}
const tituloRecord=()=>Math.max(record,typeof histBest==='function'?(histBest()||0):0);
// ---------- dibujo: aviso de tramo y cartel de vuelta (sobre el HUD) ----------
ON_HUD.push(()=>{
  if(state!=='play')return;
  if(PC_cartel){const c=PC_cartel,a=Math.min(1,c.t/20,(c.max-c.t+1)/10);ctx.globalAlpha=a;
    ctx.fillStyle='rgba(18,12,24,0.75)';ctx.fillRect(40,64,240,34);ctx.fillStyle=c.col;ctx.fillRect(40,64,240,1);ctx.fillRect(40,97,240,1);
    txt(c.s,W/2,67,c.s.length>10?12:18,c.col,'center');txt(c.sub,W/2,88,5,'#ddd','center',false);ctx.globalAlpha=1;}
  else if(PC_aviso){const v=PC_aviso,t=v.tr,a=Math.min(1,v.t/20,(v.max-v.t+1)/10);ctx.globalAlpha=a;
    const head='TRAMO '+t.n+' · '+t.kind+' · '+PC_mmss(t.secs);
    const info=t.kills+(t.kills===1?' BAJA':' BAJAS')+(t.resc?' · '+t.resc+(t.resc===1?' RESCATE':' RESCATES'):'')+(t.cat?' · GATITO':'')+(t.pct!==null?' · PUNTERÍA '+t.pct+'%':'');
    const bon=t.items.length?t.items.map(i=>i[0]+' +'+i[1]).join(' · '):'SIN BONUS ESTA VEZ';
    const w=Math.max(150,hudTW(head,6),hudTW(bon,5),hudTW(info,4))+14,x=Math.round(W/2-w/2),y=65;
    ctx.fillStyle='rgba(18,12,24,0.82)';ctx.fillRect(x,y,w,29);ctx.fillStyle='#f3c969';ctx.fillRect(x,y,w,1);
    txt(head,W/2,y+3,6,'#ffe08a','center',false);
    txt(info,W/2,y+11,4,'#ccc','center',false);
    txt(bon,W/2,y+18,5,t.items.length?'#7dff9a':'#aaa','center',false);
    ctx.globalAlpha=1;}
});
