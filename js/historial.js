'use strict';
// Óxido · Historial: guardado, logros, récords y sus pantallas
// Todo queda en el localStorage de esta compu, en un solo objeto con versión: clave 'oxido-historial'.
// Escucha los eventos del juego (ON_EVENT) y no toca nada de otros archivos.
//
// Estados propios (variable global `state`):
//   'logros'  · grilla de logros          (se abre con histOpen('logros'))
//   'records' · top 10 y totales           (se abre con histOpen('records'))
//   'nombre'  · ¡NUEVO RÉCORD! escribir el nombre (lo abre histGameEnd)
// API para el núcleo:
//   histOpen(cual, alVolver?)  abre 'logros' o 'records'; ESC vuelve al estado anterior (o llama alVolver)
//   histUpdate()               true si el estado es uno de estos y ya lo manejó (va al principio de update())
//   histDraw()                 dibuja la pantalla (después del fondo de menú, en lugar del HUD)
//   histIsScreen()             true si el estado actual es una de estas pantallas
//   histGameEnd(resumen, onDone?)  registra la partida; si entra en el top 10 abre 'nombre' y devuelve true;
//                              al confirmar muestra el ranking y después llama onDone (o vuelve al título)
//   histBest()                 mejor puntaje del ranking (para el "RÉCORD" del título)
//   histDrawPops()             avisos de logro nuevo (ya se dibujan solos con ON_HUD y en histDraw)
// ================== guardado ==================
const HIST_KEY='oxido-historial',HIST_VER=1,HIST_MAX=10,HIST_NLEN=8;
const HIST_ABC='ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
const HIST_STATES=['logros','records','nombre'];
function HIST_blank(){return{version:HIST_VER,migrated:false,lastName:'',logros:{},records:[],
  totals:{games:0,kills:0,rescued:0,secs:0,bosses:0,bestLoop:0,wins:0,airCalls:0,vaults:0,chars:[]}};}
// número entero >=0 o el valor por defecto
function HIST_num(v,d){const n=typeof v==='number'?v:typeof v==='string'&&v.trim()!==''?+v:NaN;return Number.isFinite(n)&&n>=0?Math.floor(n):d;}
// mayúsculas sin tildes (la Ñ se queda)
function HIST_plain(s){return String(s==null?'':s).toUpperCase().replace(/Ñ/g,'#').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/#/g,'Ñ');}
function HIST_cleanName(s){return HIST_plain(s).split('').filter(c=>HIST_ABC.includes(c)).join('').slice(0,HIST_NLEN);}
// JOSE va sin acento (es de Josefina): lo guardado con el nombre viejo se lee igual
const HIST_nomChar=c=>c==='JOS\u00c9'?'JOSE':c;
function HIST_cleanChars(a){return Array.isArray(a)?a.filter(c=>typeof c==='string'&&c).slice(0,2).map(c=>HIST_nomChar(c.slice(0,10))):[];}
function HIST_cleanRec(r){
  if(!r||typeof r!=='object')return null;
  const score=HIST_num(r.score,-1);if(score<0)return null;
  const chars=HIST_cleanChars(r.chars),diff=HIST_num(r.diff,null);
  return{name:HIST_cleanName(r.name)||'???',chars,date:HIST_num(r.date,0)||null,loop:HIST_num(r.loop,null),level:HIST_num(r.level,null),
    score,kills:HIST_num(r.kills,null),rescued:HIST_num(r.rescued,null),twoP:!!r.twoP||chars.length>1,diff:diff==null?null:Math.min(2,diff)};
}
const HIST_sort=h=>{h.records.sort((a,b)=>b.score-a.score);if(h.records.length>HIST_MAX)h.records.length=HIST_MAX;};
// arma un historial válido con lo que se pueda rescatar de d (versión vieja, campos faltantes o rotos)
function HIST_sanitize(d){
  const h=HIST_blank();if(!d||typeof d!=='object'||Array.isArray(d))return h;
  h.migrated=d.migrated===true;h.lastName=HIST_cleanName(d.lastName);
  if(d.logros&&typeof d.logros==='object'&&!Array.isArray(d.logros))
    for(const k in d.logros){const t=HIST_num(d.logros[k],-1);if(t>=0)h.logros[k]=t||1;}
  if(Array.isArray(d.records))for(const r of d.records){const c=HIST_cleanRec(r);if(c)h.records.push(c);}
  HIST_sort(h);
  if(Array.isArray(d.recordsAy)){h.recordsAy=[];for(const r of d.recordsAy){const c=HIST_cleanRec(r);if(c){c.ay=true;h.recordsAy.push(c);}}h.recordsAy.sort((a,b)=>b.score-a.score);h.recordsAy.length=Math.min(h.recordsAy.length,HIST_MAX);} // con ayudas
  const t=d.totals&&typeof d.totals==='object'?d.totals:{};
  for(const k in h.totals)if(k!=='chars')h.totals[k]=HIST_num(t[k],0);
  h.totals.chars=Array.isArray(t.chars)?[...new Set(t.chars.filter(c=>typeof c==='string'&&c).map(c=>HIST_nomChar(c.slice(0,10))))].slice(0,12):[];
  return h;
}
function HIST_write(k,v){try{localStorage.setItem(k,v);return true;}catch(e){return false;}}
function HIST_read(k){try{return localStorage.getItem(k);}catch(e){return null;}}
let HIST_dirty=false;
function HIST_save(){HIST_dirty=false;let s;try{s=JSON.stringify(HIST);}catch(e){return false;}return HIST_write(HIST_KEY,s);}
function HIST_load(){
  const raw=HIST_read(HIST_KEY);let d=null,broken=false;
  if(raw!=null){try{d=JSON.parse(raw);}catch(e){broken=true;}
    if(!broken&&(!d||typeof d!=='object'||Array.isArray(d)))broken=true;}
  if(broken){HIST_write('oxido-historial-roto',raw);d=null;} // copia de lo roto, por las dudas
  const h=HIST_sanitize(d);
  // la primera vez: el récord viejo (un número) pasa al ranking como "ANTES", sin fecha
  if(!h.migrated){
    const old=HIST_num(HIST_read('oxido-record'),0);
    if(old>0&&!h.records.some(r=>r.name==='ANTES'&&r.score===old))
      h.records.push({name:'ANTES',chars:[],date:null,loop:null,level:null,score:old,kills:null,rescued:null,twoP:false,diff:null});
    h.migrated=true;HIST_sort(h);HIST_dirty=true;
  }
  if(broken||raw==null||d.version!==HIST_VER)HIST_dirty=true;
  return h;
}
let HIST=HIST_load();
if(HIST_dirty)HIST_save();
addEventListener('pagehide',()=>{if(HIST_dirty)HIST_save();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&HIST_dirty)HIST_save();});
// ================== logros ==================
// g: letra o símbolo del ícono (o ico: un ícono de HUD_ICONS) · col: color · secret: nombre oculto hasta ganarlo
// prog: avance hacia el logro con datos de toda la vida (se muestra en la pantalla de logros)
const HIST_LOGROS=[
  {id:'mini1',n:'PRIMER JEFE CHICO',d:'Vencé a un jefe chico',g:'J',col:'#f3a35c'},
  {id:'villano1',n:'PRIMER VILLANO',d:'Vencé a un villano',g:'V',col:'#ff6b5b'},
  {id:'bulon',n:'DON BULÓN',d:'Vencé al villano de la misión 1',g:'B',col:'#c9824a',secret:true},
  {id:'ceniza',n:'SARGENTO CENIZA',d:'Vencé al villano de la misión 2',g:'C',col:'#aab0bc',secret:true},
  {id:'yuyo',n:'MADRE YUYO',d:'Vencé al villano de la misión 3',g:'Y',col:'#8fd65a',secret:true},
  {id:'intacto',n:'INTOCABLE',d:'Ganá una misión sin recibir daño',ico:'shield',col:'#7ab8ff'},
  {id:'rescate',n:'NADIE SE QUEDA',d:'Rescatá a todos los prisioneros de una misión',g:'R',col:'#9fe8a0'},
  {id:'gatito',n:'MICHI A SALVO',d:'Ganá una misión con OLIVER vivo',g:'M',col:'#ffb0d8'},
  {id:'arsenal',n:'ARSENAL',d:'Usá las 5 armas en una partida',ico:'heavy',col:'#e8c25a'},
  {id:'cien',n:'100 BAJAS',d:'100 bajas en una partida',g:'100',col:'#ffb0a0'},
  {id:'k500',n:'500 EN TOTAL',d:'500 bajas sumando todas las partidas',g:'500',col:'#ff8a6a',prog:t=>[t.kills,500]},
  {id:'k2000',n:'2000 EN TOTAL',d:'2000 bajas sumando todas las partidas',g:'2K',col:'#ff5a3c',prog:t=>[t.kills,2000]},
  {id:'vuelta2',n:'VUELTA 2',d:'Llegá a la vuelta 2',g:'2',col:'#ffe08a'},
  {id:'vuelta3',n:'VUELTA 3',d:'Llegá a la vuelta 3',g:'3',col:'#ffd23a'},
  {id:'dupla',n:'DE A DOS',d:'Ganá una misión de a 2',g:'×2',col:'#6aa6f0'},
  {id:'dificil',n:'SIN MIEDO',d:'Ganá una misión en DIFÍCIL',g:'!',col:'#ff6b5b'},
  {id:'cofre',n:'CAJA FUERTE',d:'Abrí un cofre blindado',g:'$',col:'#e8c25a'},
  {id:'avion10',n:'PIDE PISTA',d:'Pedí el avión 10 veces en total',ico:'plane',col:'#9ad0ff',prog:t=>[t.airCalls,10]},
  {id:'sinavion',n:'A PULMÓN',d:'Ganá una misión sin pedir el avión',g:'∅',col:'#c8b8a0'},
  {id:'oro',n:'MEDALLA DE ORO',d:'Llegá al ORO en una partida',g:'★',col:'#ffd23a'},
  {id:'leyenda',n:'LEYENDA',d:'Llegá a LEYENDA en una partida',g:'★',col:'#ff8ad8'},
  {id:'grillo',n:'CHATARRA FURIOSA',d:'30 bajas a bordo de la Chatarra en una partida',g:'C',col:'#9fb07a'},
  {id:'rescatista',n:'RESCATISTA',d:'50 rescates sumando todas las partidas',ico:'heart',col:'#9fe8a0',prog:t=>[t.rescued,50]},
  {id:'tres',n:'LOS TRES',d:'Jugá con FACU, JOSE y LAUTI',g:'3P',col:'#f3c969',prog:t=>[t.chars.filter(c=>HIST_CHARN().includes(c)).length,HIST_CHARN().length]},
  {id:'veterano',n:'10 PARTIDAS',d:'Jugá 10 partidas',g:'10',col:'#ddd',prog:t=>[t.games,10]}
];
// villanos de la misión 4 en adelante: un logro secreto por villano, armado desde BOSSES (los archivos de misión cargan antes)
const HIST_VILL={BULON:'bulon',CENIZA:'ceniza',YUYO:'yuyo'};
if(typeof BOSSES!=='undefined'){
  const at=HIST_LOGROS.findIndex(a=>a.id==='yuyo')+1,extra=[];
  BOSSES.forEach((b,i)=>{if(i<3||!b||!b.villain)return;const v=b.villain,id='vill'+(i+1);
    HIST_VILL[HIST_plain(v.name)]=id;
    extra.push({id,n:v.name,d:'Vencé al villano de la misión '+(i+1),g:v.g||HIST_plain(v.name).split(' ').filter(w=>!/^(EL|LA|LOS|LAS|DE|DEL)$/.test(w)).slice(0,2).map(w=>w[0]).join(''),col:v.col||'#ff6b5b',secret:true});});
  HIST_LOGROS.splice(at,0,...extra);
}
const HIST_BY={};for(const a of HIST_LOGROS)HIST_BY[a.id]=a;
const HIST_CHARN=()=>typeof CHARS!=='undefined'?CHARS.map(c=>c.name):['FACU','JOSE','LAUTI'];
const HIST_pops=[];
function HIST_chime(){try{[784,1047,1568].forEach((f,i)=>later(i*70,()=>tone('square',f,f*1.01,0.1,0.045)));}catch(e){}}
// logros de desafío: con AYUDAS no cuentan
const HIST_DESAFIO=new Set(['intacto','sinavion','dificil','cien','oro','leyenda','vuelta2','vuelta3','grillo','rescate']);
function HIST_unlock(id){
  const a=HIST_BY[id];if(!a||HIST.logros[id])return false;
  if(typeof partida!=='undefined'&&partida&&partida.ayudas&&HIST_DESAFIO.has(id))return false;
  HIST.logros[id]=Date.now();HIST_pops.push({a,t0:0});HIST_save();HIST_chime();return true;
}
const histHas=id=>!!HIST.logros[id];
const HIST_count=()=>HIST_LOGROS.filter(a=>HIST.logros[a.id]).length;
// ================== partida en curso ==================
let HIST_ses=null,HIST_justDate=0;
function HIST_newSes(d){
  let chars=HIST_cleanChars(d&&d.chars);
  if(!chars.length)try{chars=players.map(p=>CHARS[p.ci].name);}catch(e){}
  return{chars,twoP:!!(d&&d.twoP)||chars.length>1,diff:HIST_diff(d&&d.difficulty),kills:0,mech:0,weap:{},loop:1,level:0,
    resc:0,mHurt:0,mAir:0,fr:0,score:0,ended:false,result:null};
}
const HIST_S=()=>HIST_ses||(HIST_ses=HIST_newSes(null));
// dificultad: acepta el número (0 1 2) o el nombre ('DIFÍCIL')
function HIST_diff(v){
  if(typeof v==='number')return clamp(Math.floor(v),0,2);
  if(typeof v==='string'){const i=typeof DIFFS!=='undefined'?DIFFS.findIndex(x=>x.name===v):-1;if(i>=0)return i;const n=HIST_num(v,null);if(n!=null)return Math.min(2,n);}
  try{return difficulty;}catch(e){return 1;}
}
function HIST_reachLoop(l){
  const tt=HIST.totals;l=HIST_num(l,0);if(!l)return;
  if(l>tt.bestLoop)tt.bestLoop=l;if(HIST_ses&&l>HIST_ses.loop)HIST_ses.loop=l;
  if(l>=2)HIST_unlock('vuelta2');if(l>=3)HIST_unlock('vuelta3');
}
function HIST_bossKey(name){const s=HIST_plain(name);for(const k in HIST_VILL)if(s.includes(k))return HIST_VILL[k];return null;}
function HIST_onEvent(t,d){
  const tt=HIST.totals;d=d||{};
  switch(t){
  case 'gameStart':{
    HIST_ses=HIST_newSes(d);tt.games++;
    for(const c of HIST_ses.chars)if(!tt.chars.includes(c))tt.chars.push(c);
    if(HIST_CHARN().every(c=>tt.chars.includes(c)))HIST_unlock('tres');
    if(tt.games>=10)HIST_unlock('veterano');
    break;}
  case 'missionStart':{if(HIST_ses&&HIST_ses.ended)HIST_ses=HIST_newSes(null);const s=HIST_S();s.level=HIST_num(d.level,s.level);s.mHurt=0;s.mAir=0;HIST_reachLoop(d.loop);break;}
  case 'kill':{
    const s=HIST_S();s.kills++;tt.kills++;if(d.inMech)s.mech++;
    if(d.mini){tt.bosses++;HIST_unlock('mini1');}
    else if(d.boss){tt.bosses++;HIST_unlock('villano1');const k=HIST_bossKey(d.name);if(k)HIST_unlock(k);}
    if(s.kills>=100)HIST_unlock('cien');
    if(tt.kills>=500)HIST_unlock('k500');if(tt.kills>=2000)HIST_unlock('k2000');
    if(s.mech>=30)HIST_unlock('grillo');
    break;}
  case 'rescue':{HIST_S().resc++;tt.rescued++;if(tt.rescued>=50)HIST_unlock('rescatista');break;}
  case 'hurt':HIST_S().mHurt++;break;
  case 'weaponUse':{const s=HIST_S();if(d.w)s.weap[d.w]=1;
    if(Object.keys(s.weap).filter(w=>w!=='harpoon').length>=(typeof WORDER!=='undefined'?WORDER.filter(w=>w!=='harpoon').length:5))HIST_unlock('arsenal');break;}
  case 'airCall':{HIST_S().mAir++;tt.airCalls++;if(tt.airCalls>=10)HIST_unlock('avion10');break;}
  case 'vaultOpen':tt.vaults++;HIST_unlock('cofre');break;
  case 'medal':{const i=typeof MEDALS!=='undefined'?MEDALS.findIndex(m=>m.name===d.name):-1;
    if(i>=2||d.name==='ORO')HIST_unlock('oro');if(i>=5||d.name==='LEYENDA')HIST_unlock('leyenda');break;}
  case 'missionWin':{
    const s=HIST_S();tt.wins++;s.level=HIST_num(d.level,s.level);HIST_reachLoop(d.loop);
    if(d.noDamage??s.mHurt===0)HIST_unlock('intacto');
    if(d.allPrisoners)HIST_unlock('rescate');
    if(d.catAlive)HIST_unlock('gatito');
    if(d.noAir??s.mAir===0)HIST_unlock('sinavion');
    if(d.twoP??s.twoP)HIST_unlock('dupla');
    if(HIST_diff(d.difficulty??s.diff)===2)HIST_unlock('dificil');
    s.mHurt=0;s.mAir=0;
    break;}
  case 'loop':HIST_reachLoop(d.loop);break;
  case 'gameOver':case 'gameQuit':HIST_register(d.summary||d);break;
  default:return;
  }
  HIST_dirty=true;
}
ON_EVENT.push(HIST_onEvent);
// tiempo jugado (solo cuenta mientras se juega) y guardado cada 3 segundos si hubo cambios
ON_STEP.push(()=>{
  const s=HIST_S();s.fr++;try{s.score=score;}catch(e){}
  if(s.fr%60===0){HIST.totals.secs++;HIST_dirty=true;}
  if(s.fr%180===0&&HIST_dirty)HIST_save();
});
// registra la partida una sola vez (el evento gameOver/gameQuit y histGameEnd pueden llegar los dos)
function HIST_register(sum){
  const s=HIST_S();if(s.ended)return s.result;
  sum=sum&&typeof sum==='object'?sum:{};s.ended=true;
  const chars=HIST_cleanChars(sum.chars).length?HIST_cleanChars(sum.chars):s.chars;
  const loop=HIST_num(sum.loop,s.loop),level=HIST_num(sum.level,s.level);
  HIST_reachLoop(loop);
  const e={name:HIST.lastName||HIST_cleanName(chars[0])||'???',chars,date:Date.now(),loop,level,
    score:HIST_num(sum.score,s.score),kills:HIST_num(sum.kills,s.kills),rescued:HIST_num(sum.rescued,s.resc),
    twoP:!!(sum.twoP??s.twoP)||chars.length>1,diff:HIST_diff(sum.difficulty??s.diff)};
  let rank=-1;
  if(sum.ayudas){e.ay=true;HIST.recordsAy=HIST.recordsAy||[];if(e.score>0){HIST.recordsAy.push(e);HIST.recordsAy.sort((a,b)=>b.score-a.score);if(HIST.recordsAy.length>HIST_MAX)HIST.recordsAy.length=HIST_MAX;rank=HIST.recordsAy.indexOf(e);}HIST_tabAy=true;} // con ayudas: tabla aparte
  else if(e.score>0){HIST.records.push(e);HIST_sort(HIST);rank=HIST.records.indexOf(e);HIST_tabAy=false;}
  s.result={entry:e,rank,named:false};HIST_justDate=rank>=0?e.date:0;
  HIST_save();return s.result;
}
const histBest=()=>HIST.records.length?HIST.records[0].score:0;
let HIST_tabAy=false; // RÉCORDS: la tabla de partidas con ayudas (← → cambia, si hay)
// ================== pantallas: abrir, actualizar ==================
let HIST_view={from:'title',done:null,t:0},HIST_cur=0,HIST_nm=null;
const histIsScreen=()=>HIST_STATES.includes(state);
function histOpen(which,onBack){
  if(which!=='logros'&&which!=='records')return;
  HIST_view={from:histIsScreen()?'title':state,done:typeof onBack==='function'?onBack:null,t:0};
  state=which;try{SFX.swap();}catch(e){}
}
function HIST_leave(){
  const v=HIST_view;HIST_view={from:'title',done:null,t:0};HIST_justDate=0;
  if(v.done){state='title';v.done();}else{state=v.from||'title';if(state==='title')T=0;}
}
function histGameEnd(summary,onDone){
  const r=HIST_register(summary);
  if(!r||r.rank<0||r.named)return false; // no entra en el top 10: no hace nada, sigue el núcleo
  const prop=HIST_cleanName(r.entry.name);
  HIST_nm={r,s:prop.split(''),c:Math.min(prop.length,HIST_NLEN-1),fresh:prop.length>0,warn:0,t:0,age:0,rep:0};
  HIST_view={from:'title',done:typeof onDone==='function'?onDone:null,t:0};
  clearKeys();state='nombre';return true;
}
// --- edición del nombre (teclado y joystick usan lo mismo) ---
function HIST_nType(ch){const n=HIST_nm;if(n.fresh){n.s=[];n.c=0;n.fresh=false;}
  if(n.c<n.s.length)n.s[n.c]=ch;else if(n.s.length<HIST_NLEN)n.s.push(ch);
  n.c=Math.min(n.c+1,n.s.length,HIST_NLEN-1);n.t=0;try{SFX.swap();}catch(e){}}
function HIST_nSpin(dir){const n=HIST_nm;n.fresh=false;
  const cur=n.s[n.c],i=cur?HIST_ABC.indexOf(cur):-1;
  const ch=HIST_ABC[i<0?(dir>0?0:HIST_ABC.length-1):(i+dir+HIST_ABC.length)%HIST_ABC.length];
  if(n.c<n.s.length)n.s[n.c]=ch;else n.s.push(ch);n.t=0;try{SFX.swap();}catch(e){}}
function HIST_nMove(dir){const n=HIST_nm;n.fresh=false;n.c=clamp(n.c+dir,0,Math.min(n.s.length,HIST_NLEN-1));n.t=0;}
function HIST_nDel(){const n=HIST_nm;
  if(n.fresh){n.s=[];n.c=0;n.fresh=false;}
  else if(n.c<n.s.length&&n.c===n.s.length-1)n.s.pop();            // parado sobre la última letra: la borra
  else if(n.c>0){n.s.splice(n.c-1,1);n.c--;}                        // si no, borra la de la izquierda
  else if(n.s.length)n.s.splice(0,1);
  n.c=Math.min(n.c,n.s.length,HIST_NLEN-1);n.t=0;try{SFX.hit();}catch(e){}}
function HIST_nOk(){
  const n=HIST_nm,name=n.s.join('');
  if(!name){n.warn=90;try{SFX.hit();}catch(e){}return;}
  n.r.entry.name=name;n.r.named=true;HIST.lastName=name;HIST_save();
  try{SFX.pick();}catch(e){}
  HIST_nm=null;HIST_justDate=n.r.entry.date;
  // después del nombre: el ranking con tu fila marcada; al salir sigue lo que pidió el núcleo
  HIST_view={from:'title',done:HIST_view.done,t:0,after:true};state='records';
}
// letras del teclado: solo mientras se escribe el nombre (las letras no pasan al juego: M, N, F, etc.)
addEventListener('keydown',e=>{
  if(state!=='nombre'||!HIST_nm||e.metaKey||e.ctrlKey||e.altKey)return;
  e.stopImmediatePropagation();
  const k=e.key;let ok=true;
  if(k==='Enter')HIST_nOk();
  else if(k==='Escape'){if(!HIST_nm.s.length){HIST_nm.s=HIST_cleanName(HIST_nm.r.entry.name).split('');}HIST_nOk();}
  else if(k==='Backspace'||k==='Delete')HIST_nDel();
  else if(k==='ArrowUp')HIST_nSpin(1);else if(k==='ArrowDown')HIST_nSpin(-1);
  else if(k==='ArrowLeft')HIST_nMove(-1);else if(k==='ArrowRight')HIST_nMove(1);
  else if(k.length===1&&HIST_ABC.includes(HIST_plain(k)))HIST_nType(HIST_plain(k));
  else ok=false;
  if(ok)e.preventDefault();
},true);
const HIST_tap=a=>!!(pressed[a]||pressed2[a]);
function histUpdate(){
  if(!histIsScreen())return false;
  T++;camX=(T*0.5)%2400;try{playMusic('title');}catch(e){}
  const v=HIST_view;v.t++;
  if(state==='nombre'){
    const n=HIST_nm;if(!n){state='title';return true;}
    n.t++;n.age++;if(n.warn>0)n.warn--;
    // joystick (el teclado llega por el addEventListener de arriba)
    if(HIST_tap('up'))HIST_nSpin(1);else if(HIST_tap('down'))HIST_nSpin(-1);
    if(HIST_tap('left'))HIST_nMove(-1);else if(HIST_tap('right'))HIST_nMove(1);
    // mantener ↑ ↓ en el joystick: las letras pasan solas
    const hu=padState.up||padSt2.up,hd=padState.down||padSt2.down;
    if(hu||hd){if(++n.rep>20&&n.rep%5===0)HIST_nSpin(hu?1:-1);}else n.rep=0;
    if(HIST_tap('bomb'))HIST_nDel();
    else if(n.age>10&&(HIST_tap('jump')||HIST_tap('start')))HIST_nOk();
    return true;
  }
  if(state==='records'&&HIST.recordsAy&&HIST.recordsAy.length&&(HIST_tap('left')||HIST_tap('right'))){HIST_tabAy=!HIST_tabAy;try{SFX.swap();}catch(e){}}
  if(state==='logros'){
    const N=HIST_LOGROS.length;
    const o=HIST_cur;
    if(HIST_tap('left')&&HIST_cur>0)HIST_cur--;
    if(HIST_tap('right')&&HIST_cur<N-1)HIST_cur++;
    if(HIST_tap('up')&&HIST_cur>=HIST_COLS)HIST_cur-=HIST_COLS;
    if(HIST_tap('down')&&HIST_cur+HIST_COLS<N)HIST_cur+=HIST_COLS;
    if(HIST_cur!==o)try{SFX.swap();}catch(e){}
  }
  if(v.t>3&&(HIST_tap('back')||HIST_tap('bomb')||(v.after&&(HIST_tap('start')||HIST_tap('shoot')||HIST_tap('jump'))))){HIST_leave();}
  return true;
}
// ================== dibujo ==================
const HIST_COLS=5,HIST_ROWS=5;let HIST_top=0;
function HIST_tw(s,size){return txtW(s,size);} // mide también los íconos ✕ ○ □ △ (base.js)
// volver: ESC con teclado; con joystick, el botón de granada (○, B o A), que acá también vuelve
const HIST_back=()=>onTouch()?'○':onPad()?btn('bomb'):'ESC/⌫';
function HIST_wrap(s,size,maxW){const out=[];let line='';
  for(const w of s.split(' ')){const t=line?line+' '+w:w;if(line&&HIST_tw(t,size)>maxW){out.push(line);line=w;}else line=t;}
  if(line)out.push(line);return out;}
function HIST_dim(a){ctx.fillStyle=`rgba(12,8,18,${a})`;cubrir();}
function HIST_date(ms){if(!ms)return'—';const d=new Date(ms);return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+String(d.getFullYear()%100).padStart(2,'0');}
function HIST_time(secs){const h=Math.floor(secs/3600),m=Math.floor(secs%3600/60);return h?h+' h '+String(m).padStart(2,'0')+' min':m?m+' min':secs+' s';}
const HIST_where=r=>r.loop==null&&r.level==null?'—':'V'+(r.loop||1)+' · M'+((r.level||0)+1);
const HIST_who=r=>r.chars.length?r.chars.join('+'):'—';
// ícono de un logro: cuadradito con borde de color y letra o dibujo; apagado si no lo ganaste
function HIST_icon(a,x,y,s,on){
  ctx.fillStyle='#120c18';ctx.fillRect(x-0.5,y-0.5,s+1,s+1);
  ctx.fillStyle=on?'#2a1f30':'#18121d';ctx.fillRect(x,y,s,s);
  ctx.strokeStyle=on?a.col:'#3a2f40';ctx.lineWidth=1;ctx.strokeRect(x+0.5,y+0.5,s-1,s-1);
  if(!on){txt('?',x+s/2,y+s/2-s*0.27,Math.round(s*0.55),'#4a3f52','center',false);return;}
  const m=a.ico&&typeof HUD_ICONS!=='undefined'&&HUD_ICONS[a.ico];
  if(m){const k=Math.min(3,Math.floor((s-1)/m[0].length),Math.floor((s-1)/m.length)),w=m[0].length*k,h=m.length*k;
    if(k>=1){hudPix(m,Math.round(x+(s-w)/2),Math.round(y+(s-h)/2),k);return;}}
  if(a.g==='★'&&typeof hudStar==='function'){hudStar(x+s/2,y+s/2+0.5,s*0.4,s*0.18,a.col);return;}
  const g=a.g||a.n[0],fs=Math.round(s*(g.length>2?0.36:g.length>1?0.45:0.6));
  txt(g,x+s/2,y+s/2-fs*0.48,fs,a.col,'center',false);
}
// aviso de logro nuevo: arriba al centro, baja deslizando y se va (uno por vez, con "+N" si hay más)
function histDrawPops(top=20,below=false,bot=false){ // bot: top es el borde de abajo
  if(!HIST_pops.length)return;
  if(state==='play'&&toasts.length&&!HIST_pops[0].t0)return; // espera a que termine el aviso de medalla para no encimarse
  if(state==='play'&&typeof DIB_jefe!=='undefined'&&DIB_jefe&&!HIST_pops[0].t0)return; // y al cartel de jefe (dibujito.js)
  if(state==='play'&&typeof MO_activo==='function'&&MO_activo()&&!HIST_pops[0].t0)return; // y a los momentos (momentos.js)
  if(state==='play'&&(lock||(bossRef&&!bossRef.gone))&&!HIST_pops[0].t0)return; // y a que termine la pelea
  if(state==='play'&&((banner&&banner.t>0)||(typeof PC_aviso!=='undefined'&&PC_aviso)||(typeof PC_cartel!=='undefined'&&PC_cartel)||(typeof AY_OBJ_T!=='undefined'&&T<AY_OBJ_T))&&!HIST_pops[0].t0)return; // uno por vez: espera al aviso de arriba y a la tarjeta de tramo
  const p=HIST_pops[0],now=performance.now();
  // en la pausa no se dibuja (se pisaba con el título) y el reloj del aviso queda quieto: sale al seguir
  // con un aviso de arriba encima, igual (uno por vez): se esconde y sigue cuando se va
  // (también bajo el cartel de VUELTA / CONTINUACIÓN, que descuenta solo: Pruebas vio 66 cuadros con los dos a la vez en M6.
  // NO bajo el cartel de tramo (PC_aviso): ese ya espera a un logro arrancado (PC_espera, partida.js) y se trababan los dos)
  if(state==='pause'||(state==='play'&&((banner&&banner.t>0)||(typeof PC_cartel!=='undefined'&&PC_cartel)))){if(p.t0)p.t0+=now-(p.lp||now);p.lp=now;return;}
  p.lp=now;if(!p.t0)p.t0=now;
  const e=(now-p.t0)/1000,DUR=3.4;if(e>DUR){HIST_pops.shift();return;}
  // en letra pixel, en el lugar de los avisos (below: entra desde abajo, en las pantallas de logros y récords)
  const k=Math.min(1,e/0.2,(DUR-e)/0.3),a=p.a,y=Math.round(top+(below?30:-6)*(1-Math.min(1,e/0.2)));
  ctx.globalAlpha=Math.max(0,Math.min(1,k*1.5));
  const mas=HIST_pops.length>1?' +'+(HIST_pops.length-1):'';
  const r=avTira([['¡LOGRO! '+a.n+mas,'#ffe08a'],[a.d,'#ccc']],bot,y,a.col,15,true);
  HIST_icon(a,r.x+2,r.y+Math.round((r.h-12)/2),12,true);
  ctx.globalAlpha=1;
}
ON_HUD.push(()=>histDrawPops(AV_ARRIBA)); // arriba, en el mismo lugar que las medallas (de a uno)
function histDraw(){
  if(!histIsScreen())return;
  HIST_dim(state==='nombre'?0.7:0.75);
  if(state==='logros')HIST_drawLogros();else if(state==='records')HIST_drawRecords();else HIST_drawName();
  // en estas pantallas el aviso sale abajo (tapa solo la ayuda); mientras escribís el nombre espera
  if(state!=='nombre')histDrawPops(H-22,true);
}
function HIST_drawLogros(){
  const N=HIST_LOGROS.length,have=HIST_count();
  txt('LOGROS',W/2,3,9,'#ffe08a','center');
  txt(have+' de '+N,W-8,6,5,have===N?'#7dff9a':'#f3c969','right',false);
  const cw=60,ch=19,gx=2,gy=2,x0=Math.round((W-(cw*HIST_COLS+gx*(HIST_COLS-1)))/2),y0=16;
  // se ven HIST_ROWS filas; la grilla se corre para que el elegido quede a la vista
  const rows=Math.ceil(N/HIST_COLS),cr=Math.floor(HIST_cur/HIST_COLS);
  HIST_top=clamp(HIST_top,Math.max(0,cr-HIST_ROWS+1),Math.min(cr,Math.max(0,rows-HIST_ROWS)));
  HIST_LOGROS.forEach((a,i)=>{
    const r=Math.floor(i/HIST_COLS)-HIST_top;if(r<0||r>=HIST_ROWS)return;
    const on=!!HIST.logros[a.id],sel=i===HIST_cur,x=x0+(i%HIST_COLS)*(cw+gx),y=y0+r*(ch+gy);
    if(typeof zona==='function')zona(x,y,cw,ch,{sobre:()=>{HIST_cur=i;}});
    ctx.fillStyle=sel?'rgba(243,201,105,0.2)':on?'rgba(42,31,48,0.85)':'rgba(18,12,24,0.75)';ctx.fillRect(x,y,cw,ch);
    if(sel){ctx.strokeStyle='#f3c969';ctx.lineWidth=1;ctx.strokeRect(x+0.5,y+0.5,cw-1,ch-1);}
    HIST_icon(a,x+2,y+2,15,on);
    const name=on||!a.secret?a.n:'???',ls=HIST_wrap(name,4,cw-22).slice(0,2);
    ls.forEach((l,j)=>txt(l,x+20,y+(ls.length>1?4+j*5.5:7),4,on?'#fff':'#6a5f72','left',false));
  });
  // detalle del elegido
  if(rows>HIST_ROWS){const b=(T>>4)%2,cx=3;
    if(HIST_top>0)txt('▲',cx,y0-1-b,5,'#ffe08a','center',false);
    if(HIST_top+HIST_ROWS<rows)txt('▼',cx,y0+HIST_ROWS*(ch+gy)-7+b,5,'#ffe08a','center',false);}
  const a=HIST_LOGROS[HIST_cur],on=!!HIST.logros[a.id],y=y0+Math.min(rows,HIST_ROWS)*(ch+gy)+2;
  ctx.fillStyle='rgba(18,12,24,0.85)';ctx.fillRect(x0,y,W-x0*2,26);ctx.fillStyle=on?a.col:'#3a2f40';ctx.fillRect(x0,y,W-x0*2,1);
  HIST_icon(a,x0+3,y+3,20,on);
  txt(on||!a.secret?a.n:'???',x0+28,y+3,6,on?a.col:'#aaa','left',false);
  txt(a.d,x0+28,y+11,5,'#ddd','left',false);
  if(on)txt('Lo ganaste el '+HIST_date(HIST.logros[a.id]),x0+28,y+18.5,4,'#7dff9a','left',false);
  else if(a.prog){const[c,m]=a.prog(HIST.totals),v=Math.min(c,m),bx=x0+28,bw=70;
    ctx.fillStyle='#2a1f30';ctx.fillRect(bx,y+19.5,bw,3);ctx.fillStyle='#f3c969';ctx.fillRect(bx,y+19.5,bw*v/m,3);
    txt(v+' / '+m,bx+bw+4,y+18.5,4,'#f3c969','left',false);}
  else txt('Todavía no',x0+28,y+18.5,4,'#8a7f92','left',false);
  txt('← → ↑ ↓ mirar  ·  '+HIST_back()+' volver',W/2,H-7,4,'#aaa','center',false);
  if(typeof zona==='function')zona(W/2-70,H-9,140,8,{clic:RA_volver});
}
function HIST_drawRecords(){
  const after=!!HIST_view.after;
  const ay=HIST_tabAy&&HIST.recordsAy&&HIST.recordsAy.length,lista=ay?HIST.recordsAy:HIST.records;
  txt((after?'TU LUGAR EN EL RANKING':'RÉCORDS')+(ay?' · CON AYUDAS':''),W/2,3,9,ay?'#9ad0ff':'#ffe08a','center');
  if(HIST.recordsAy&&HIST.recordsAy.length)txt('← → '+(ay?'récords sin ayudas':'récords con ayudas'),W-10,5,4,'#aaa','right',false);
  const cols=[[16,'#','right'],[22,'NOMBRE','left'],[60,'PERSONAJE','left'],[104,'HASTA','left'],[134,'DIFICULTAD','left'],[212,'PUNTOS','right'],[238,'BAJAS','right'],[262,'RESC.','right'],[284,'TIEMPO','right'],[W-12,'FECHA','right']];
  const lbT=typeof tactilLibre==='function'?tactilLibre():null,y0=lbT?24:16,dy=lbT?8.5:9; // táctil: debajo de ‹ VOLVER
  ctx.fillStyle='rgba(18,12,24,0.8)';ctx.fillRect(8,y0-1,W-16,lbT?94:102);
  // títulos de columna: con TEXTO GRANDE no entran todos; cada uno se achica hasta el lugar que tiene (y si no, se abrevia)
  const ABREV={'PERSONAJE':'PJ','DIFICULTAD':'DIF.','PUNTOS':'PTS','BAJAS':'B.','RESC.':'R.','TIEMPO':'T.','FECHA':'DÍA','NOMBRE':'NOM.'};
  cols.forEach(([x,s,al],i)=>{const sig=cols[i+1],ant=cols[i-1],lugar=al==='right'?(ant?x-ant[0]-(ant[2]==='right'?0:24)-2:x):(sig?sig[0]-x-(sig[2]==='right'?24:0)-2:W-x);
    let t=s,sz=4;while(sz>2&&txtW(t,sz)>Math.max(8,lugar))sz--;if(txtW(t,sz)>Math.max(8,lugar)&&ABREV[s]){t=ABREV[s];sz=4;while(sz>2&&txtW(t,sz)>Math.max(8,lugar))sz--;}
    txt(t,x,y0+1,sz,'#aaa',al,false);});
  for(let i=0;i<HIST_MAX;i++){
    const r=lista[i],y=y0+8+i*dy;
    if(i%2===0){ctx.fillStyle='rgba(255,255,255,0.03)';ctx.fillRect(9,y-1,W-18,9);}
    if(!r){txt(String(i+1),16,y+1,5,'#4a3f52','right',false);txt('—',22,y+1,5,'#4a3f52','left',false);continue;}
    const me=HIST_justDate&&r.date===HIST_justDate,top=i===0;
    if(me){ctx.fillStyle=(T>>4)%2?'rgba(125,255,154,0.22)':'rgba(125,255,154,0.12)';ctx.fillRect(9,y-1,W-18,9);}
    const c=me?'#7dff9a':top?'#ffd23a':'#fff',c2=me?'#c8ffd4':'#ccc';
    txt(String(i+1),16,y+1,5,c,'right',false);
    txt(r.name,22,y+1,5,c,'left',false);
    txt(HIST_who(r),60,y+1.5,4,c2,'left',false);
    txt(HIST_where(r),104,y+1.5,4,c2,'left',false);
    const dn=r.diff==null||typeof DIFFS==='undefined'?null:DIFFS[r.diff];
    txt(dn?dn.name:'—',134,y+1.5,4,dn&&typeof DIFF_COL!=='undefined'?DIFF_COL[r.diff]:c2,'left',false);
    txt(String(r.score).padStart(7,'0'),212,y+1,5,c,'right',false);
    txt(r.kills==null?'—':String(r.kills),238,y+1.5,4,c2,'right',false);
    txt(r.rescued==null?'—':String(r.rescued),262,y+1.5,4,c2,'right',false);
    txt(typeof JT_tiempoRec==='function'?JT_tiempoRec(r):'—',284,y+1.5,4,c2,'right',false); // tiempo de la partida (reloj.js)
    txt(HIST_date(r.date),W-12,y+1.5,4,c2,'right',false);
  }
  // totales de toda la vida
  const t=HIST.totals,ty=122;
  if(lbT){ // táctil: los totales en una o dos líneas, dentro de la franja que dejan libre la palanca y el rombo
    const x0=Math.max(8,lbT.x0+4),x1=Math.min(W-8,lbT.x1-4),s='EN TOTAL: '+t.games+' partidas · '+t.kills+' bajas · '+t.rescued+' rescates · '+HIST_time(t.secs)+' · '+t.bosses+' jefes · logros '+HIST_count()+' de '+HIST_LOGROS.length;
    const ls=wrapTxt(s,4,x1-x0-6).slice(0,4),lh=TXT_aj(4)+1; // renglones según el tamaño real de la letra
    ctx.fillStyle='rgba(18,12,24,0.8)';ctx.fillRect(x0,ty,x1-x0,4+ls.length*lh);ctx.fillStyle='#f3c969';ctx.fillRect(x0,ty,x1-x0,1);
    ls.forEach((l,i)=>txt(l,(x0+x1)/2,ty+3+i*lh,4,'#ddd','center',false));
    txt(after?btn('ok')+': seguir':HIST_back()+': volver',(x0+x1)/2,H-15,5,after&&(T>>5)%2?'#ffe08a':'#ddd','center',false);
    if(typeof zona==='function')zona((x0+x1)/2-50,H-17,100,9,{clic:after?RA_enter:RA_volver});
    return;}
  ctx.fillStyle='rgba(18,12,24,0.8)';ctx.fillRect(8,ty,W-16,34);ctx.fillStyle='#f3c969';ctx.fillRect(8,ty,W-16,1);
  txt('EN TOTAL, EN ESTA COMPU',W/2,ty+3,4,'#f3c969','center',false);
  const cells=[['PARTIDAS',t.games],['BAJAS',t.kills],['RESCATES',t.rescued],['TIEMPO',HIST_time(t.secs)],['JEFES',t.bosses],['MEJOR VUELTA',t.bestLoop||'—'],['LOGROS',HIST_count()+' de '+HIST_LOGROS.length]];
  const row1=cells.slice(0,4),row2=cells.slice(4);
  [row1,row2].forEach((row,j)=>{const cw=(W-16)/row.length;
    row.forEach(([k,v],i)=>{const cx=8+cw*i+cw/2,yy=ty+10+j*12;txt(k,cx,yy,4,'#aaa','center',false);txt(String(v),cx,yy+5,5,'#fff','center',false);});});
  txt(after?btn('ok')+': seguir':HIST_back()+': volver',W/2,H-15,5,after&&(T>>5)%2?'#ffe08a':'#ddd','center',false);
  if(typeof zona==='function')zona(W/2-50,H-17,100,9,{clic:after?RA_enter:RA_volver});
}
function HIST_drawName(){
  const n=HIST_nm;if(!n)return;const e=n.r.entry;
  const g=ctx.createLinearGradient(0,8,0,26);g.addColorStop(0,'#c8ffd4');g.addColorStop(1,'#3ad06a');
  ctx.font='bold 16px ui-monospace,Menlo,Consolas,monospace';ctx.textAlign='center';ctx.textBaseline='top';
  ctx.lineJoin='round';ctx.lineWidth=3.5;ctx.strokeStyle='#120c18';ctx.strokeText('¡NUEVO RÉCORD!',W/2,8);ctx.fillStyle=g;ctx.fillText('¡NUEVO RÉCORD!',W/2,8);
  txt('PUESTO '+(n.r.rank+1)+' DE '+HIST_MAX+'  ·  '+String(e.score).padStart(7,'0')+' PUNTOS',W/2,29,6,'#fff','center');
  txt(HIST_who(e)+'  ·  '+(e.loop||e.level!=null?'VUELTA '+(e.loop||1)+' · MISIÓN '+((e.level||0)+1):''),W/2,39,5,'#ccc','center',false);
  txt('ESCRIBÍ TU NOMBRE',W/2,53,6,'#ffe08a','center');
  // 8 casilleros
  const bw=16,bh=20,gap=3,x0=Math.round((W-(bw*HIST_NLEN+gap*(HIST_NLEN-1)))/2),y=64,blink=(n.t>>4)%2===0;
  if(n.fresh&&n.s.length){ctx.fillStyle='rgba(122,184,255,0.25)';ctx.fillRect(x0-2,y-2,n.s.length*(bw+gap)-gap+4,bh+4);}
  for(let i=0;i<HIST_NLEN;i++){
    const x=x0+i*(bw+gap),cur=i===n.c,ch=n.s[i];
    if(typeof zona==='function')zona(x,y,bw,bh,{clic:()=>{n.c=Math.min(i,n.s.length);}});
    ctx.fillStyle=cur?'rgba(243,201,105,0.2)':'rgba(18,12,24,0.85)';ctx.fillRect(x,y,bw,bh);
    ctx.strokeStyle=cur?'#f3c969':ch?'#5a4a60':'#3a2f40';ctx.lineWidth=1;ctx.strokeRect(x+0.5,y+0.5,bw-1,bh-1);
    if(ch)txt(ch,x+bw/2,y+5,11,cur?'#ffe08a':'#fff','center');
    if(cur){
      if(!ch&&blink){ctx.fillStyle='#ffe08a';ctx.fillRect(x+4,y+bh-5,bw-8,1.5);}
      txt('▲',x+bw/2,y-6,4,'#f3c969','center',false);txt('▼',x+bw/2,y+bh+1.5,4,'#f3c969','center',false);
    }
  }
  if(n.warn>0)txt('Escribí al menos una letra',W/2,y+bh+8,5,'#ff6b5b','center',false);
  else if(n.fresh&&n.s.length)txt('Es tu último nombre · escribí otro o '+btn('ok'),W/2,y+bh+8,5,'#9ad0ff','center',false);
  // ayuda, corta: teclado y joystick (con los botones del último joystick). Se resalta el control que se usa.
  const pad=onPad(),kbL='TECLADO: letras · ⌫ borrar · ENTER listo';
  ctx.fillStyle='rgba(18,12,24,0.75)';ctx.fillRect(40,104,240,21);
  if(typeof zona==='function')zona(40,104,240,21,{clic:RA_enter}); // mouse: listo
  if(onTouch())txt('ESCRIBIR: teclado del celular · flechas: letra · ○ borrar · ✕ listo',W/2,111,5,'#ffe08a','center',false);
  else if(!padsOn)txt(kbL,W/2,111,5,'#ffe08a','center',false);
  else{txt(kbL,W/2,107,5,pad?'#aaa':'#ffe08a','center',false);
    txt('JOYSTICK: ↑ ↓ letra · ← → mover · '+btn('bomb','pad')+' borrar · '+btn('ok','pad')+' listo',W/2,115,5,pad?'#ffe08a':'#aaa','center',false);}
  // tu fila entre la de arriba y la de abajo, con el nombre que vas escribiendo
  const list=HIST.records,r0=Math.max(0,Math.min(n.r.rank-1,list.length-3)),nr=Math.min(3,list.length);
  ctx.fillStyle='rgba(18,12,24,0.8)';ctx.fillRect(66,129,188,nr*10+3);
  for(let k=0;k<3;k++){
    const i=r0+k,r=list[i];if(!r)break;const yy=132+k*10,me=r===e;
    if(me){ctx.fillStyle='rgba(125,255,154,0.18)';ctx.fillRect(70,yy-1.5,180,10);}
    const c=me?'#7dff9a':'#bbb',name=me?(n.s.join('')||'·'):r.name;
    txt(String(i+1),86,yy,5,c,'right',false);txt(name,92,yy,5,c,'left',false);
    txt(String(r.score).padStart(7,'0'),244,yy,5,c,'right',false);
  }
}
