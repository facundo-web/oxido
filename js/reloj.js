'use strict';
// Óxido · Jefes con cronómetro y reloj del juego
// (Segundo programador. Va después de eco-armas.js y antes de juego.js: después de cumplida.js, historial.js y consejos.js.)
//
// 1 · CRONÓMETRO DEL VILLANO (y del guardián de mundo): arranca cuando empieza la pelea (la barra ya llena) y para
//     cuando cae. Se ve chico debajo del nombre, junto a la barra, con la medalla que todavía podés sacar y su límite.
//     Premio al caer: ORO = salud llena (si ya la tenías, todas tus armas con munición al máximo: "ARMA MEJORADA"),
//     PLATA = +2 ♥, BRONCE = +1 ♥; más lento, solo puntos. Va además del premio de siempre por jefe (jefes.js).
//     Los cortes van por villano y dificultad (JT_CORTES), medidos con el bot y con margen para una persona.
//     La medalla sale en la placa de misión cumplida: cumplida.js ya llama a JT_medalla().
// 2 · RELOJ: chico en el HUD, al lado de las bajas: el tiempo de la misión y el total de la partida (sin pausas ni páginas
//     de historieta). Bonus de tiempo al cerrar cada misión: JT_bonusTiempo(segs) (lo usa finishWin, pedido a Código).
// 3 · RÉCORDS: cada partida guarda su tiempo total (r.secs) sin romper el historial: los récords viejos siguen igual y,
//     como historial.js limpia los campos que no conoce al cargar, acá se le devuelve el tiempo a cada uno desde lo guardado.
//     JT_tiempoRec(r) da el texto para la columna TIEMPO (pedida a Código en HIST_drawRecords).
// 4 · LOGROS de tiempo (A TIEMPO, RELOJ DE ORO, CONTRARRELOJ) y la "meta próxima" (consejos.js) los usa solos por el prog.
// Guardado propio: 'oxido-tiempos' (mejores tiempos por villano y dificultad, y cuántas medallas de cada una).
// Prefijo JT_.

// ---------- cortes (segundos de pelea contra el villano) ----------
// base: [ORO, PLATA, BRONCE] en NORMAL, por misión (0–9). En FÁCIL y DIFÍCIL se escalan con la vida del jefe (DIFF().ehp),
// y también por vuelta (la vida sube un 25 % por vuelta). Medido con el bot el 22 nov (6 corridas por misión: 3 con
// ametralladora infinita y 3 con --lento), mediana del tiempo de pelea: M1 42 · M2 62 · M3 118 · M4 63 · M5 18 · M6 98 ·
// M7 47 · M8 37 · M9 85 · M10 66 s. Con margen para una persona (que esquiva y no es invulnerable):
// ORO ≈ bot ×1,4 · PLATA ×2,1 · BRONCE ×3.
const JT_CORTES=[[60,90,125],[85,130,185],[165,245,355],[90,135,190],[25,40,55],[140,205,295],[65,100,140],[50,80,110],[120,180,255],[90,140,195]];
// tiempo par de cada misión (segundos; mediana del bot ×1,6): el bonus de tiempo es (par − tiempo) × 20, nunca negativo
const JT_PAR=[230,250,400,330,220,350,250,260,350,330];
const JT_MED=[{id:'oro',n:'ORO',c:'O',col:'#ffd23a'},{id:'plata',n:'PLATA',c:'P',col:'#d8dee8'},{id:'bronce',n:'BRONCE',c:'B',col:'#d8904a'}];
const JT_PUNTOS=[3000,2000,1000,500]; // oro, plata, bronce, sin medalla

const JT={mis:0,tot:0,jefe:null,jf:0,res:null,log:[]};
function JT_escala(){let k=(DIFFS[difficulty]&&DIFFS[difficulty].ehp)||1;if(typeof PC_hpMul==='function')k*=PC_hpMul();return k;}
function JT_cortes(i){const b=JT_CORTES[i??levelIdx]||JT_CORTES[0],k=JT_escala();return b.map(s=>Math.round(s*k));}
const JT_fmt=s=>{s=Math.max(0,Math.floor(s));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),r=s%60;
  return(h?h+':'+String(m).padStart(2,'0'):m)+':'+String(r).padStart(2,'0');};
// qué medalla da un tiempo (índice en JT_MED, o 3 = sin medalla)
function JT_tier(secs,i){const c=JT_cortes(i);return secs<=c[0]?0:secs<=c[1]?1:secs<=c[2]?2:3;}

// ---------- contar ----------
// ON_STEP corre solo cuando el juego avanza: la pausa, la página de historieta y la cámara lenta de la rueda no suman de más
ON_EVENT.push((t)=>{if(t==='gameStart'){JT.tot=0;JT.log=[];}});
ON_START.push(()=>{JT.mis=0;JT.jefe=null;JT.jf=0;JT.res=null;});
ON_STEP.push(()=>{
  if(state!=='play'||(typeof IN!=='undefined'&&IN.activa))return; // la intro de M1 (intro.js) no cuenta
  if(!winT){JT.mis++;JT.tot++;}
  const b=bossRef;
  if(b&&b.isVillain&&!b._jtFin&&b!==JT.jefe&&b.state==='fight'){JT.jefe=b;JT.jf=0;}
  const j=JT.jefe;if(!j||j._jtFin)return;
  if(j.state==='dying'||j.gone){JT_fin(j);return;}
  JT.jf++;
});
// el villano cayó: medalla, premio y lo que se guarda
function JT_fin(b){
  b._jtFin=1;const secs=JT.jf/60,tr=JT_tier(secs),i=levelIdx;
  JT.res={secs,tier:tr,name:b.name||'',lvl:i,dif:difficulty};JT.log.push({mision:i+1,segs:+secs.toFixed(1),medalla:tr<3?JT_MED[tr].n:'-',dif:difficulty});
  const pts=JT_PUNTOS[tr],o=P.ride||P;addScore(pts,o.x+(o.w||8)/2,o.y-14);if(typeof RC_soltar==='function')RC_soltar(pts,o.x+(o.w||8)/2,o.y,tr<3?6:2);
  let sub='';
  if(tr===0){
    let llena=true;eachPlayer(p=>{if(!p.dead&&p.hp<maxHp){llena=false;}});
    if(!llena){eachPlayer(p=>{if(!p.dead){const a=p.hp;p.hp=maxHp;if(typeof RC_sumaJug==='function')RC_sumaJug(p,'hp',a);}});sub='SALUD LLENA';}
    else{eachPlayer(p=>{if(p.dead)return;for(const w of Object.keys(p.weapons))if(w!=='harpoon'&&WEAPONS[w]&&WEAPONS[w].max)p.weapons[w]=WEAPONS[w].max;p.bombs=Math.max(p.bombs,Math.min(40,p.bombs+5));});sub='ARMA MEJORADA · MUNICIÓN AL MÁXIMO';}
  }else if(tr<3){const n=tr===1?2:1;eachPlayer(p=>{if(!p.dead){const a=p.hp;p.hp=Math.min(maxHp,p.hp+n);if(typeof RC_sumaJug==='function')RC_sumaJug(p,'hp',a);}});sub='+'+n+' ♥';}
  else sub='+'+pts+' PUNTOS';
  const m=JT_MED[tr];
  toast(tr<3?'¡'+m.n+'! '+JT_fmt(secs):'TIEMPO '+JT_fmt(secs),(tr<3?sub+' · ':'')+'contra '+(b.name||'el jefe'),tr<3?m.col:'#b9adc8');
  if(tr<3)later(300,()=>{try{[660,880,1320].slice(0,3-tr).forEach((f,k)=>later(k*90,()=>tone('square',f,f,0.09,0.04)));}catch(e){}});
  JT_anotar(JT.res);
}
// lo que muestra la placa de misión cumplida (cumplida.js): la medalla del villano de esta misión
function JT_medalla(){
  const r=JT.res;if(!r||r.lvl!==levelIdx||r.tier>=3)return null;const m=JT_MED[r.tier];
  return{col:m.col,n:m.c,nombre:m.n,secs:r.secs};
}
// la línea de tiempo de la placa (cumplida.js, debajo de los puntos): misión y villano
function JT_lineaPlaca(){
  const r=JT.res&&JT.res.lvl===levelIdx?JT.res:null,m=r&&r.tier<3?JT_MED[r.tier]:null;
  return r?tx(TX.cumplida.tiempos,{mision:JT_fmt(JT.mis/60),villano:JT_fmt(r.secs)})+(m?' · '+m.n:''):'MISIÓN EN '+JT_fmt(JT.mis/60); // (Textos: falta la clave de solo la misión)
}
// bonus de tiempo al cerrar la misión (lo usa finishWin en vez del 240 fijo)
function JT_bonusTiempo(secs){return Math.max(0,Math.round((JT_PAR[levelIdx]||240)-secs))*20;}

// ---------- guardado propio ----------
const JT_KEY='oxido-tiempos';
function JT_leer(){try{const o=JSON.parse(store.get(JT_KEY)||'null');if(o&&typeof o==='object'&&!Array.isArray(o))return{mejor:o.mejor&&typeof o.mejor==='object'?o.mejor:{},
  oros:+o.oros||0,platas:+o.platas||0,bronces:+o.bronces||0,misRapida:+o.misRapida||0};}catch(e){}return{mejor:{},oros:0,platas:0,bronces:0,misRapida:0};}
let JT_G=JT_leer();
function JT_anotar(r){
  const ay=typeof partida!=='undefined'&&partida&&partida.ayudas;
  const k=r.dif+'|'+r.lvl,mej=JT_G.mejor[k];if(!ay&&(!mej||r.secs<mej))JT_G.mejor[k]=+r.secs.toFixed(1);
  if(!ay){if(r.tier===0)JT_G.oros++;else if(r.tier===1)JT_G.platas++;else if(r.tier===2)JT_G.bronces++;}
  store.set(JT_KEY,JSON.stringify(JT_G));
  if(typeof HIST_unlock==='function'){if(r.tier===0)HIST_unlock('jtOro');if(JT_G.oros>=5)HIST_unlock('jtOro5');}
}
// misión ganada en menos de 2 minutos (sin contar la placa)
ON_EVENT.push((t,d)=>{if(t!=='missionWin')return;const s=JT.mis/60;
  if(s<120&&typeof HIST_unlock==='function')HIST_unlock('jtRapida');});

// ---------- logros de tiempo (se suman a los de historial.js) ----------
if(typeof HIST_LOGROS!=='undefined'){
  const nuevos=[
    {id:'jtOro',n:'A TIEMPO',d:'Ganale a un villano con medalla de ORO',g:'T',col:'#ffd23a'},
    {id:'jtOro5',n:'RELOJ DE ORO',d:'Sacá 5 medallas de ORO contra villanos',g:'5',col:'#ffd23a',prog:()=>[JT_G.oros,5]},
    {id:'jtRapida',n:'CONTRARRELOJ',d:'Ganá una misión en menos de 2 minutos',g:'2M',col:'#9ad0ff'}];
  const at=HIST_LOGROS.findIndex(a=>a.id==='sinavion');HIST_LOGROS.splice(at>=0?at+1:HIST_LOGROS.length,0,...nuevos);
  for(const a of nuevos)HIST_BY[a.id]=a;
  if(typeof HIST_DESAFIO!=='undefined')for(const a of nuevos)HIST_DESAFIO.add(a.id);
}

// ---------- récords: el tiempo total de cada partida ----------
if(typeof HIST_register==='function'){const hr0=HIST_register;HIST_register=function(sum){
  const ya=HIST_S().ended,r=hr0(sum);
  if(!ya&&r&&r.entry&&r.entry.secs==null){r.entry.secs=Math.round(JT.tot/60);try{HIST_save();}catch(e){}}
  return r;};}
// historial.js limpia los campos que no conoce al cargar: acá se les devuelve el tiempo a los récords que ya lo tenían
(function JT_rehidratar(){
  if(typeof HIST==='undefined'||!HIST)return;
  let raw=null;try{raw=JSON.parse(localStorage.getItem(HIST_KEY)||'null');}catch(e){return;}if(!raw)return;
  for(const lista of['records','recordsAy']){const a=raw[lista],b=HIST[lista];if(!Array.isArray(a)||!Array.isArray(b))continue;
    for(const r of b){const o=a.find(x=>x&&x.date===r.date&&x.score===r.score);const s=o&&+o.secs;if(Number.isFinite(s)&&s>=0)r.secs=Math.floor(s);}}
})();
if(typeof HIST_cleanRec==='function'){const cr0=HIST_cleanRec;HIST_cleanRec=function(r){const c=cr0(r);if(c&&r){const s=+r.secs;if(Number.isFinite(s)&&s>=0)c.secs=Math.floor(s);}return c;};}
// texto de la columna TIEMPO de RÉCORDS (los récords viejos, sin tiempo: —)
const JT_tiempoRec=r=>r&&r.secs!=null?JT_fmt(r.secs):'—';

// ---------- HUD ----------
// reloj chico al lado de las bajas: tiempo de la misión · total de la partida
function JT_reloj(x,y,col){ // relojito de 5×5
  ctx.fillStyle='#120c18';ctx.fillRect(x,y,5,5);ctx.fillStyle=col;ctx.fillRect(x+1,y,3,1);ctx.fillRect(x+1,y+4,3,1);ctx.fillRect(x,y+1,1,3);ctx.fillRect(x+4,y+1,1,3);
  ctx.fillRect(x+2,y+1,1,2);ctx.fillRect(x+3,y+2,1,1);
}
ON_HUD.push(()=>{
  if(state!=='play'&&state!=='pause')return;if(typeof IN!=='undefined'&&IN.activa)return;if(typeof MC_ganada==='function'&&MC_ganada())return;
  // 1 · reloj de la misión y total, al lado de "N BAJAS"
  // al lado de las bajas, debajo del panel del HUD Hondo (hud.js deja el lugar en HUD_reloj), en letra pixel
  const hr=typeof HUD_reloj!=='undefined'?HUD_reloj:{x:60,y:31,k:1};ctx.save();ctx.translate(hr.x,hr.y);ctx.scale(hr.k,hr.k);
  JT_reloj(0,0,'#b9adc8');
  const sm=JT_fmt(JT.mis/60),st=JT_fmt(JT.tot/60);
  pxTxt(sm,7,0,'#ddd','left');
  if(JT.tot-JT.mis>60)pxTxt('· '+st,7+pxW(sm)+3,0,'#8a7e98','left'); // el total, desde la segunda misión
  ctx.restore();
  // 2 · cronómetro del villano, debajo de su nombre
  const b=bossRef;if(!b||!b.isVillain||b.gone||b.state==='enter'||typeof bossShown==='function'&&!bossShown())return;
  const s=JT.jefe===b?JT.jf/60:0,c=JT_cortes(),tr=JT_tier(s),m=tr<3?JT_MED[tr]:null,ta=typeof TXT_ajuste==='function'?TXT_ajuste(5):5,y=14+ta; // debajo del nombre (más abajo con TEXTO GRANDE)
  const tt=JT_fmt(s),lim=m?m.n+' HASTA '+JT_fmt(c[tr]):'SIN MEDALLA',w1=txtW(tt,5),w2=txtW(lim,4),tot=8+w1+4+w2,x0=160-tot/2;
  ctx.fillStyle='rgba(18,12,24,0.7)';ctx.fillRect(x0-3,y-1,tot+6,ta+3);
  // medalla que todavía se puede sacar (late cuando faltan menos de 5 s para perderla)
  const late=m&&c[tr]-s<5&&(T>>3)%2;
  ctx.fillStyle='#120c18';circle(x0+3,y+3,3.4);ctx.fillStyle=m?(late?'#fff':m.col):'#4a3f52';circle(x0+3,y+3,2.6);
  if(m){ctx.fillStyle='rgba(18,12,24,0.35)';ctx.fillRect(x0+2.5,y+1.5,1,3);}
  txt(tt,x0+8,y-0.5,5,m?'#fff':'#aaa','left',false);
  txt(lim,x0+8+w1+4,y+0.5,4,m?m.col:'#8a7e98','left',false);
});
