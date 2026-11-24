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
// uno por vez: la tarjeta de tramo espera a un aviso de arriba, a un logro que ya se está mostrando, a VUELTA y al objetivo
const PC_espera=()=>!!((banner&&banner.t>0)||(typeof HIST_pops!=='undefined'&&HIST_pops.length&&HIST_pops[0].t0)||PC_cartel||(typeof AY_OBJ_T!=='undefined'&&T<AY_OBJ_T));
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
  if(PC_aviso&&!PC_espera()&&--PC_aviso.t<=0)PC_aviso=null; // espera a que se vaya el aviso de arriba (uno por vez)
  if(PC_cartel&&banner&&banner.t>0)PC_cartel.t++; // VUELTA / CONTINUACIÓN se esconde bajo un aviso y sigue después
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
function PC_nueva(){return{ayudas:typeof AYUDAS_on==='function'&&AYUDAS_on(),frames:0,resc:0,bosses:0,wins:0,cont:0,armas:{},d0:tirosDisp,p0:tirosPeg,ended:false};}
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
  PC_aviso={t:120,max:120,tr:t};if(t.bonus)later(380,SFX.medal);
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
  const hechos=PC_mis?PC_mis.tramos.slice():[];   // los tramos ya cerrados: se vuelve después del último
  const mitad=PC_mis&&!hechos.length?PC_mis.mitad:null; // o a la mitad del tramo 1, si ya pasaste por ahí
  PC_cont=true;try{startLevel(levelIdx,true);}finally{PC_cont=false;}
  if(hechos.length&&hechos.length<L.arenas.length)PC_alTramo(hechos);
  else if(mitad)PC_alMitad(mitad);
  lives=DIFF().lives;score=half;PC_mis.score0=score;newRecord=false;
  PC_cartel={s:'CONTINUACIÓN '+partida.cont+' DE '+PC_MAX_CONT,sub:'MITAD DE LOS PUNTOS · VIDAS ×'+lives,col:'#7dff9a',t:200,max:200};
  SFX.pick();
}
// después de una continuación: arranca pasando la arena del último tramo cerrado (no se repite lo que ya se ganó).
// Lo de antes (enemigos, eventos, prisioneros) queda atrás; los tramos cerrados se conservan en el resumen.
function PC_alTramo(hechos){
  const a=L.arenas[hechos.length-1],x0=a.at+Math.round(VW*0.6);
  arenaIdx=hechos.length;camX=Math.min(x0,LEVEL_END-VW);lock=null;
  while(evIdx<levelEvents.length&&levelEvents[evIdx].at<=camX)evIdx++;
  for(const e of enemies)if(!isBoss(e)&&e.x<camX+VW*0.7)e.gone=true;spawnQ.length=0;
  players.forEach((p,j)=>{const o=p.ride||p;o.x=camX+40-j*18;o.y=GROUND-(o.h||18);if(p.ride)P.x=o.x+7;});
  for(const al of allies)al.x=camX+20;if(typeof gato!=='undefined'&&gato)gato.x=camX+26;
  PC_mis.tramos=hechos;PC_abrirTramo();
}
// ---------- punto de vuelta a la mitad del tramo 1 (pedido de Coordinación tras la prueba con personas) ----------
// El tramo 1 es el más largo sin red. Se anota el lugar cuando el jugador 1 pasa la mitad del camino a la primera arena,
// parado en el piso de abajo (no en el agua ni en una plataforma) y sin amenaza cerca (AV_amenaza, juego.js); si en la
// mitad justo hay pelea, se anota apenas se calma, siempre lejos de la arena. Así es un lugar por el que ya se pasó,
// tranquilo y sin huecos. CONTINUAR vuelve ahí con las mismas reglas de puntos que al volver a un tramo.
ON_STEP.push(()=>{
  const m=PC_mis,a=L&&L.arenas&&L.arenas[0];
  if(state!=='play'||!m||m.mitad||m.tramos.length||!a||(typeof IN!=='undefined'&&IN.activa))return;
  const p=players[0];if(!p||p.dead||p.ride)return;
  const hasta=Math.max(a.at*0.5+40,a.at-VW*0.7);
  if(p.x>hasta&&m.mitadProv){m.mitad=m.mitadProv;return;} // no hubo calma: vale el primer lugar firme pasada la mitad (al volver se limpian los enemigos)
  if(p.x<a.at*0.5||p.x>hasta||!p.onGround||Math.abs(p.y+(p.h||18)-GROUND)>2||lock)return;
  if((typeof CA_nada==='function'&&CA_nada(p))||(typeof TR_en==='function'&&TR_en(p)))return; // ni en el agua ni sobre una cinta (terreno.js)
  const c={x:Math.round(p.x),cam:Math.round(camX)};if(!m.mitadProv)m.mitadProv=c;
  if(!(typeof AV_amenaza==='function'&&AV_amenaza()))m.mitad=c;
});
function PC_alMitad(c){
  camX=Math.max(0,Math.min(c.cam,LEVEL_END-VW));arenaIdx=0;lock=null;
  while(evIdx<levelEvents.length&&levelEvents[evIdx].at<=camX)evIdx++;
  for(const e of enemies)if(!isBoss(e)&&e.type!=='turret'&&e.x<camX+VW+40)e.gone=true;spawnQ.length=0; // sin enemigos encima al volver
  players.forEach((p,j)=>{const o=p.ride||p;o.x=c.x-j*18;o.y=GROUND-(o.h||18);if(p.ride)P.x=o.x+7;});
  for(const al of allies)al.x=c.x-20;if(typeof gato!=='undefined'&&gato)gato.x=c.x+8;
  PC_mis.mitad=c; // si volvés a caer antes de la primera arena, se vuelve acá de nuevo
}
// ---------- fin de partida ----------
function resumenPartida(){
  return{score,chars:players.map(p=>CHARS[p.ci].name),twoP:players.length>1,loop:vuelta,level:levelIdx,kills,
    rescued:partida?partida.resc:rescued,time:partida?Math.round(partida.frames/60):0,bosses:partida?partida.bosses:0,
    difficulty,continues:partida?partida.cont:0,ayudas:!!(partida&&partida.ayudas)};
}
// kind: 'gameOver' (fin del juego sin continuar) o 'gameQuit' (salir desde la pausa o al terminar una misión)
function terminarPartida(kind){
  // salir al menú en medio de la introducción (intro.js): se cierra sin darla por vista (vuelve la próxima vez)
  if(typeof IN_cancelar==='function')IN_cancelar();else if(typeof IN!=='undefined'&&IN&&IN.activa){IN.activa=false;IN.o=null;IN.practica=false;}
  const sum=resumenPartida();saveRecord();
  if(partida&&!partida.ended){partida.ended=true;emit(kind,{summary:sum});}
  const salir=()=>{state='title';T=0;};
  if(typeof histGameEnd==='function'){let r=false;try{r=histGameEnd(sum,salir);}catch(e){console.error('histGameEnd',e);}if(r)return;}
  salir();
}
// ---------- historial (historial.js): conexión con guardas ----------
const histOk=()=>typeof histOpen==='function'&&typeof histUpdate==='function'&&typeof histDraw==='function'&&typeof histIsScreen==='function';
// TAMAÑO: GRANDE (mundo con zoom) / NORMAL (como antes); se guarda en el store (camara.js)
const tamanoTxt=()=>'TAMAÑO: '+(tamano==='grande'?'GRANDE':'NORMAL');
// título limpio: logo y un menú corto. Las instrucciones van en CÓMO JUGAR (la tarjeta de controles, ayuda.js) y lo
// que se configura en OPCIONES (tamaño, música, sonido y CONTROLES: COMPLETOS / SIMPLES; la dificultad va en la
// elección de personaje).
// la lógica compara ids (textos.js: TX.menu); tituloOps da lo que se ve (las pruebas la usan)
const tituloIds=()=>['jugar','comoJugar','opciones'].concat(histOk()?['logros','records']:[]);
const tituloOps=()=>tituloIds().map(k=>TX.menu[k]);
function updTitulo(){
  const ops=tituloOps();tituloSel=clamp(tituloSel,0,ops.length-1);
  if(pressed.up){tituloSel=(tituloSel+ops.length-1)%ops.length;SFX.swap();}
  else if(pressed.down){tituloSel=(tituloSel+1)%ops.length;SFX.swap();}
  else if(pressed.start||pressed.shoot||pressed.jump){
    audioInit();const o=tituloIds()[tituloSel];SFX.swap();
    if(o==='jugar'){state='select';selT=0;selLevel=Math.min(selLevel,unlocked);}
    else if(o==='comoJugar')ayudaAbrir();
    else if(o==='opciones'){state='opciones';opcSel=0;opcT=0;opcPag='main';}
    else histOpen(o);
  }
}
// ---------- OPCIONES ----------
let opcSel=0,opcT=0,opcPag='main';
// OPCIONES tiene páginas: la principal y tres submenús (CONTROLES, ACCESIBILIDAD, AYUDAS). Cada fila: [nombre, valor,
// acción, ayuda]. Valor '▸' = entra a un submenú. VOLVER (sin acción) sale al título o vuelve a la principal.
const opcEntrar=p=>()=>{opcPag=p;opcSel=0;};
const OPC_DISP={normal:'NORMAL',auto:'AUTOMÁTICO',alternado:'ALTERNADO'},OPC_DISP_SIG={normal:'auto',auto:'alternado',alternado:'normal'};
const opcFilas=()=>{
  // textos de textos.js (TX.opciones)
  const O=TX.opciones,Pw=TX.palabras,si=b=>b?Pw.si:Pw.no,VOLVER=[Pw.volver,null,null];
  if(opcPag==='controles')return[
    [O.tipo,controlesSimples?O.simples:O.completos,()=>setControles(controlesSimples?'completos':'simples'),controlesSimples?O.simplesAyuda:O.completosAyuda],
    [O.disparo,{normal:O.disparoNormal,auto:O.disparoAuto,alternado:O.disparoAlternado}[ACC.disparo],()=>ACC_poner('disparo',OPC_DISP_SIG[ACC.disparo]),{normal:O.disparoNormalAyuda,auto:O.disparoAutoAyuda,alternado:O.disparoAlternadoAyuda}[ACC.disparo]],
    [O.rueda,ACC.rueda==='tocar'?O.ruedaTocar:O.ruedaMantener,()=>ACC_poner('rueda',ACC.rueda==='tocar'?'mantener':'tocar'),ACC.rueda==='tocar'?O.ruedaTocarAyuda:O.ruedaMantenerAyuda],
    [O.teclas,'▸',()=>{if(typeof REA_abrir==='function')REA_abrir('teclado');},O.teclasAyuda],
    [O.joystick,'▸',()=>{if(typeof REA_abrir==='function')REA_abrir('pad');},O.joystickAyuda],
    ...(typeof IN_practicar==='function'?[[O.practicar,'▸',()=>IN_practicar(),O.practicarAyuda]]:[]),
    ...(onTouch()&&typeof window.OXIDO_TACTIL_EDITAR==='function'?[[O.botones,O.acomodar,()=>window.OXIDO_TACTIL_EDITAR(),O.botonesAyuda]]:[]),
    VOLVER];
  if(opcPag==='acces')return[
    [O.movimiento,ACC.mov==='reducido'?O.reducido:Pw.normal,()=>ACC_poner('mov',ACC.mov==='reducido'?'normal':'reducido'),O.movimientoAyuda],
    [O.texto,ACC.txt==='grande'?Pw.grande:Pw.normal,()=>ACC_poner('txt',ACC.txt==='grande'?'normal':'grande'),O.textoAyuda],
    [O.balas,ACC.contraste?O.altoContraste:Pw.normal,()=>ACC_poner('contraste',!ACC.contraste),O.balasAyuda],
    VOLVER];
  if(opcPag==='ayudas')return[
    [O.vidasInf,si(ACC.ayVidas),()=>ACC_poner('ayVidas',!ACC.ayVidas),O.vidasInfAyuda],
    [O.menosDano,si(ACC.ayDano),()=>ACC_poner('ayDano',!ACC.ayDano),O.menosDanoAyuda],
    [O.masLento,si(ACC.ayLento),()=>ACC_poner('ayLento',!ACC.ayLento),O.masLentoAyuda],
    VOLVER];
  return[
    [O.tamano,tamano==='grande'?Pw.grande:Pw.normal,()=>setTamano(tamano==='grande'?'normal':'grande'),O.tamanoAyuda],
    [O.musica,si(mus.on),()=>{mus.on=!mus.on;store.set('oxido-musica',mus.on?'1':'0');}],
    [O.sonido,si(!muted),()=>{muted=!muted;}],
    ...(typeof CLI_valor==='function'?[[O.clima,CLI_valor(),CLI_ciclar,CLI_desc()],
      ...(CLI.fuente==='real'?[[O.climaDatos,CLI_movilValor(),CLI_movilCiclar,CLI_movilDesc()]]:[])]:[]),
    [O.controles,'▸',opcEntrar('controles'),O.controlesAyuda],
    [O.accesibilidad,'▸',opcEntrar('acces'),O.accesibilidadAyuda],
    [O.ayudas,AYUDAS_on()?O.ayudasActivadas:'▸',opcEntrar('ayudas'),O.ayudasAyuda],
    VOLVER];
};
const opcTitulo=()=>({controles:TX.opciones.controles,acces:TX.opciones.accesibilidad,ayudas:TX.opciones.ayudas})[opcPag]||TX.opciones.titulo;
const opcVolver=()=>{if(opcPag!=='main'){const n=opcTitulo();opcPag='main';opcSel=Math.max(0,opcFilas().findIndex(f=>f[0]===n));}else state='title';SFX.swap();}; // vuelve a la fila del submenú
function updOpciones(){
  T++;opcT++;camX=(T*0.5)%2400;playMusic('title');
  const f=opcFilas();opcSel=clamp(opcSel,0,f.length-1);
  if(pressed.up){opcSel=(opcSel+f.length-1)%f.length;SFX.swap();}
  else if(pressed.down){opcSel=(opcSel+1)%f.length;SFX.swap();}
  else if(opcT>6&&pressed.back)opcVolver();
  else if(pressed.left&&opcPag!=='main'&&(f[opcSel][1]==='▸'||!f[opcSel][2]))opcVolver(); // ← en una fila ▸ (o VOLVER) de un submenú: vuelve
  else if(pressed.left||pressed.right||pressed.start||pressed.shoot||pressed.jump){
    audioInit();const r=f[opcSel];if(!r[2]){if(pressed.start||pressed.shoot||pressed.jump)opcVolver();}
    else{r[2]();SFX.swap();}}
}
const tituloRecord=()=>Math.max(record,typeof histBest==='function'?(histBest()||0):0);
// ---------- dibujo: aviso de tramo y cartel de vuelta (sobre el HUD) ----------
ON_HUD.push(()=>{
  if(state!=='play')return;
  // VUELTA / CONTINUACIÓN: arriba, como los demás avisos
  if(PC_cartel){if(banner&&banner.t>0)return;const c=PC_cartel,a=Math.min(1,c.t/20,(c.max-c.t+1)/10);ctx.globalAlpha=a;
    avTira([[c.s,c.col],[c.sub,'#ddd']],false,AV_ARRIBA,c.col);ctx.globalAlpha=1;}
  // tarjeta de tramo: angosta, abajo, 2 s (guía de arte §7). Con la placa de cumplida.js, el último tramo lo resume la placa
  else if(PC_aviso&&!PC_espera()&&!(typeof MC!=='undefined'&&MC&&MC.ganada)){const v=PC_aviso,t=v.tr,a=Math.min(1,v.t/12,(v.max-v.t+1)/8);ctx.globalAlpha=a;
    const tot=t.items.reduce((n,i)=>n+i[1],0);
    avTira([['TRAMO '+t.n+' · '+PC_mmss(t.secs)+(tot?' · +'+tot:''),tot?'#ffe08a':'#ccc']],true,AV_ABAJO(),'#f3c969');
    ctx.globalAlpha=1;}
});
// con alguna AYUDA activada en algún momento, la partida queda marcada (récord aparte y sin logros de desafío)
ON_STEP.push(()=>{if(partida&&!partida.ayudas&&typeof AYUDAS_on==='function'&&AYUDAS_on())partida.ayudas=true;});
