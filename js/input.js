'use strict';
// Óxido · Teclado y joystick
// ================== input: teclado + joystick ==================
const keys={},pressed={};let padState={},padPrev={};
// Acciones: Z disparar · X o ESPACIO saltar · C granada · S o TAB (tocar) cambiar arma · S o TAB (mantener) rueda de armas (rueda.js). Flechas para moverse.
// ESC (o ⌫, o ⌘+. en los teclados de iPad, que no tienen ESC) vuelve o sale de menús · P pausa · Q sale al menú desde la pausa.
// 1–6 eligen arma directo (rueda.js). En la pantalla del nombre, ⌫ borra letras (historial.js se queda con la tecla antes).
const KEYMAP={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',
  KeyZ:'shoot',KeyX:'jump',Space:'jump',KeyC:'bomb',KeyS:'air',Tab:'air',
  KeyN:'music',KeyM:'mute',KeyP:'pause',Escape:'back',Backspace:'back',KeyQ:'quit',Enter:'start'};
// ---------- CONTROLES SIMPLES (simple.js) ----------
// De a 2 con un solo teclado (el jugador 2 entra con . en la elección de personaje): cada uno 4 direcciones + 2 teclas.
//   J1: W A S D · F disparar · G granada.   J2: flechas · . disparar · , granada.   ↑ (W) salta, el apuntado es automático.
// Con 1 jugador y CONTROLES: SIMPLES en OPCIONES: flechas · Z disparar · X granada.
// ESC/⌫, P, Q, ENTER y N son de los dos. Se lee por e.code: anda igual en teclado español o inglés.
const KB2=999; // p2Pad === KB2: el jugador 2 juega con el teclado (no hay joystick con ese índice)
const kb2On=()=>p2Pad===KB2;
const kb2St={};
const KEYS_COMUN={KeyN:'music',KeyP:'pause',Escape:'back',Backspace:'back',KeyQ:'quit',Enter:'start'};
const KEYMAP_S1={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',Space:'up',KeyZ:'shoot',KeyX:'bomb',KeyM:'mute',...KEYS_COMUN};
const KEYMAP_J1={KeyA:'left',KeyD:'right',KeyW:'up',KeyS:'down',KeyF:'shoot',KeyG:'bomb',...KEYS_COMUN};
const KEYMAP_J2={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',Period:'shoot',Comma:'bomb'};
let controlesSimples=store.get('oxido-controles')==='simples';
function setControles(v){controlesSimples=v==='simples';store.set('oxido-controles',controlesSimples?'simples':'completos');clearKeys();}
// qué mapa usa el teclado del jugador 1 ahora
const mapaJ1=()=>kb2On()?KEYMAP_J1:controlesSimples?KEYMAP_S1:KEYMAP;
// nombre real de una tecla (en un teclado español la de / es -): navigator.keyboard si existe; si no, por idioma
const KB_NOMBRE={Comma:',',Period:'.',Slash:'/'};
try{navigator.keyboard&&navigator.keyboard.getLayoutMap&&navigator.keyboard.getLayoutMap().then(m=>{for(const c in KB_NOMBRE){const k=m.get(c);if(k)KB_NOMBRE[c]=k.toUpperCase();}}).catch(()=>{});}catch(e){}
addEventListener('keydown',e=>{
  audioInit();
  if(e.code==='KeyF'&&!kb2On()){toggleFull();return;}
  // ⌘+. (el "escape" de los teclados de Mac y de iPad)
  if(e.metaKey&&(e.key==='.'||e.code==='Period')){e.preventDefault();if(!keys.back)pressed.back=true;keys.back=true;later(120,()=>{keys.back=false;});return;}
  if(e.metaKey||e.ctrlKey)return;
  // jugador 2 por teclado: entra con . en la elección de personaje, si no hay un joystick que ya sea el jugador 2
  if(e.code==='Period'&&state==='select'&&p2Pad<0&&!kb2On()){e.preventDefault();kb2Entrar();return;}
  if(kb2On()){const b=KEYMAP_J2[e.code];if(b){e.preventDefault();if(!kb2St[b])pressed2[b]=true;kb2St[b]=true;return;}}
  const a=mapaJ1()[e.code];if(!a)return;e.preventDefault();
  if(!keys[a])pressed[a]=true;keys[a]=true;
});
function kb2Entrar(){p2Pad=KB2;for(const k in kb2St)kb2St[k]=false;clearKeys();p2Ci=charIdx===2?0:2;if(typeof colFix==='function')colFix(charIdx,p2Ci);
  kb2Tarjeta=180;try{SFX.pick();}catch(e){}}
let kb2Tarjeta=0; // cuadros que le quedan a la tarjeta con las teclas de los dos (hud.js)
// el teclado pasa a ser "el último control" (va en captura: llega aunque historial.js frene la tecla al escribir el nombre)
addEventListener('keydown',e=>{if(e.key!=='Meta'&&e.key!=='Control'&&e.key!=='Alt'&&e.key!=='Shift'){dev1=-1;devAny=-1;}},true);
addEventListener('keyup',e=>{if(kb2On()&&KEYMAP_J2[e.code])kb2St[KEYMAP_J2[e.code]]=false;
  for(const m of [KEYMAP,KEYMAP_S1,KEYMAP_J1]){const a=m[e.code];if(a&&!(kb2On()&&KEYMAP_J2[e.code]))keys[a]=false;}});
addEventListener('pointerdown',audioInit);
function clearKeys(){for(const k in keys)keys[k]=false;for(const k in kb2St)kb2St[k]=false;}
addEventListener('blur',()=>{clearKeys();if(state==='play')state='pause';});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='play')state='pause';});
function toggleFull(){try{if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen();}catch(e){}}
// ---------- joysticks (DualSense u otro con mapeo "standard") ----------
// Jugador 1: teclado + todos los joysticks que no son del jugador 2.
// Jugador 2: un solo joystick (p2Pad = su índice en el Gamepad API; -1 = no hay jugador 2).
// En la pantalla de personaje, ✕ en un joystick libre suma al jugador 2 (lo maneja updSelect en hud.js);
// ✕ en el joystick del jugador 1 (o si hay uno solo y lo usa él) juega.
let p2Pad=-1,p2Join=-1,padSt2={},padsOn=0;
const pressed2={},padOld={};
// joystick que se desconecta en plena partida: se pausa (padLost: 0 nada, 1 el del jugador 1, 2 el del jugador 2; negativo = ya volvió)
let padLost=0,padLostIdx=-1;const padUsed={};let padSeen=new Set();
function padGone(i){
  if(padLost>0)return;
  const isP2=i===p2Pad;if(!isP2&&!padUsed[i])return; // si nadie lo usaba, no pasa nada
  if(state==='play'||state==='pause'){if(state==='play')state='pause';padLost=isP2?2:1;padLostIdx=i;}
}
addEventListener('gamepaddisconnected',e=>{padGone(e.gamepad.index);delete padOld[e.gamepad.index];});
let inSlot=0; // de quién es la entrada que leen held() y tapped(): 0 = jugador 1, 1 = jugador 2
function readPad(gp){
  const b=i=>!!(gp.buttons[i]&&gp.buttons[i].pressed),ax=gp.axes[0]||0,ay=gp.axes[1]||0,st={};
  // palanca por ángulo, con diagonales generosas: correr y apuntar arriba a la vez sale aunque el pulgar vaya casi
  // derecho para arriba (← → hasta ~72° de la horizontal; ↑ desde 30°). En los menús, una dirección por vez.
  const m=Math.hypot(ax,ay),ux=m>0.35?ax/m:0,uy=m>0.35?ay/m:0;
  let sl=ux<-0.3,sr=ux>0.3,su=uy<-0.5,sd=uy>0.6;
  if(typeof state!=='undefined'&&state!=='play'&&(sl||sr)&&(su||sd)){if(Math.abs(ux)>Math.abs(uy))su=sd=false;else sl=sr=false;}
  st.left=b(14)||sl;st.right=b(15)||sr;st.up=b(12)||su;st.down=b(13)||sd;
  st.jump=b(0);st.shoot=b(2)||b(5)||b(7);st.bomb=b(1)||b(6);st.swap=b(3);st.air=b(4);st.pause=b(9);st.back=b(8);st.start=b(9)||b(0);st.opt=b(9);
  return st;
}
function pollPad(){
  const list=navigator.getGamepads?navigator.getGamepads():[];
  const st1={};let n=0,p2found=false;
  const seen=new Set();
  for(const gp of list){
    if(!gp||gp.connected===false)continue;n++;seen.add(gp.index);
    const st=readPad(gp),old=padOld[gp.index]||{};padOld[gp.index]=st;
    const edge=k=>st[k]&&!old[k];
    for(const k in st)if(edge(k)){audioInit();if(state==='play')padUsed[gp.index]=true;break;}
    padLook(gp,st,edge);
    if(gp.index===p2Pad){
      p2found=true;padSt2=st;
      for(const k in st)if(edge(k))pressed2[k]=true;
      // pausa y menús: el jugador 2 también puede pausar y seguir (no en la pantalla de personaje)
      if(state!=='select')for(const k of ['pause','back','start'])if(edge(k))pressed[k]=true;
      continue;
    }
    for(const k in st)if(st[k])st1[k]=true;
    // ✕ de un joystick libre = sumar al jugador 2; en el joystick del jugador 1 (o con uno solo), ✕ juega
    const free=padJoins(gp.index);
    for(const k in st)if(edge(k)){
      if(free&&(k==='jump'||k==='start')){if(k==='jump')p2Join=gp.index;continue;}
      pressed[k]=true;
    }
    if(free&&edge('opt'))pressed.start=true;
  }
  padsOn=n;
  for(const i of padSeen)if(!seen.has(i))padGone(i); // por si el navegador no avisa con el evento
  if(padLost>0&&seen.has(padLostIdx))padLost=-padLost; // volvió: se sigue con pausa, como siempre
  padSeen=seen;
  if(kb2On())padSt2=kb2St; // jugador 2 por teclado
  else if(p2Pad>=0&&!p2found){padSt2={};if(state==='select')p2Pad=-1;}
  padPrev=st1;return st1;
}
// palanca analógica de un jugador (para la rueda de armas: elige por ángulo real, con 6 zonas parejas).
// Devuelve {x,y} si la palanca está inclinada, o null. Jugador 2: su joystick; jugador 1: el que más se incline de los otros.
function palancaDe(slot){
  const list=navigator.getGamepads?navigator.getGamepads():[];let best=null,bm=0.35;
  for(const gp of list){if(!gp||gp.connected===false)continue;if(slot===1?gp.index!==p2Pad:gp.index===p2Pad)continue;
    const x=gp.axes[0]||0,y=gp.axes[1]||0,m=Math.hypot(x,y);if(m>bm){bm=m;best={x,y};}}
  return best;
}
// se llama una vez por cuadro, después del primer update()
function clearPressed(){for(const k in pressed)pressed[k]=false;for(const k in pressed2)pressed2[k]=false;}
// mantener / tocar, según de quién sea el turno (inSlot)
const heldRaw=a=>inSlot?!!padSt2[a]:!!(keys[a]||padState[a]);
// con la rueda de armas abierta (rueda.js), las flechas son de la rueda: el jugador no se mueve ni apunta
const RU_DIRS={left:1,right:1,up:1,down:1};
// con CONTROLES SIMPLES (simple.js) saltar es ↑, el apuntado es automático y no hay rueda ni avión
const held=a=>RU_DIRS[a]&&typeof ruAbiertaDe==='function'&&ruAbiertaDe(inSlot)?false:typeof simpleDe==='function'&&P&&simpleDe(inSlot)?simHeld(a):heldRaw(a);
const tapped=a=>typeof simpleDe==='function'&&P&&simpleDe(inSlot)?simTapped(a):inSlot?!!pressed2[a]:!!pressed[a];
// el joystick i, en la pantalla de personaje, suma al jugador 2 con ✕: no es el del jugador 1 (dev1)
const padJoins=i=>state==='select'&&p2Pad<0&&i!==dev1;
// hay un joystick libre para sumar al jugador 2 (ni el del jugador 2 ni el del jugador 1)
const padFree=()=>{for(const i of padSeen)if(i!==p2Pad&&i!==dev1)return true;return false;};
// ================== marca de cada joystick y nombre de cada botón ==================
// La marca sale de gp.id: PlayStation (054c, DualSense…), Xbox (045e, XInput…), Switch Pro (057e, Nintendo…).
// Desconocido con mapeo 'standard': símbolos de PlayStation. El mapeo por posición (readPad) no cambia:
// abajo (b0) saltar · derecha (b1) granada · izquierda (b2) disparar · arriba (b3) arma · L1 (b4) avión…
// btn(acción, quién) devuelve el nombre del botón según el ÚLTIMO control que se tocó:
//   btn('jump') → 'X' con teclado, '✕' PlayStation, 'A' Xbox, 'B' Switch.
//   quién: nada = el último control de cualquiera (pantallas compartidas) · 0 = jugador 1 · 1 = jugador 2 (p2Pad)
//          'free' = un joystick libre (para sumar al jugador 2) · 'pad' = el último joystick · {i:n} = el joystick n
// Acciones: jump ok bomb shoot swap quit air r1 l2 r2 back opt start. onPad(quién) dice si es un joystick.
const PAD_LBL={ps:['✕','○','□','△','L1','R1','L2','R2','CREATE','OPTIONS'],
  xb:['A','B','X','Y','LB','RB','LT','RT','VISTA','MENÚ'],
  ns:['B','A','Y','X','L','R','ZL','ZR','−','+']};
const BTN_PAD={jump:0,ok:0,bomb:1,shoot:2,swap:3,quit:3,air:4,r1:5,l2:6,r2:7,back:8,opt:9,start:9};
const BTN_KB={jump:'X',ok:'ENTER',bomb:'C',shoot:'Z',swap:'S',quit:'Q',air:'S',r1:'Z',l2:'C',r2:'Z',back:'ESC/⌫',opt:'P',start:'ENTER',up:'↑',down:'↓',left:'←',right:'→'};
// controles simples: 1 jugador (flechas, Z, X) y de a 2 con un teclado (J1 a la izquierda, J2 a la derecha)
const BTN_KBS={...BTN_KB,jump:'↑',bomb:'X',l2:'X',swap:'—',air:'—'};
const BTN_KB1={...BTN_KB,jump:'W',shoot:'F',r1:'F',r2:'F',bomb:'G',l2:'G',swap:'—',air:'—',up:'W',down:'S',left:'A',right:'D'};
const BTN_KB2={get jump(){return '↑';},get shoot(){return KB_NOMBRE.Period;},get r1(){return KB_NOMBRE.Period;},get r2(){return KB_NOMBRE.Period;},
  get bomb(){return KB_NOMBRE.Comma;},get l2(){return KB_NOMBRE.Comma;},swap:'—',air:'—',ok:'ENTER',quit:'Q',back:'ESC/⌫',opt:'P',start:'ENTER',up:'↑',down:'↓',left:'←',right:'→'};
const kbBtns=who=>kb2On()?(who===1?BTN_KB2:BTN_KB1):controlesSimples?BTN_KBS:BTN_KB;
let dev1=-1,devAny=-1,lastPad=-1; // -1 = teclado; si no, el índice del joystick
const padInfo={};
function padBrand(gp){
  const id=String(gp.id||'').toLowerCase();
  if(/\b0?054c\b|\b54c\b/.test(id))return 'ps';
  if(/\b0?045e\b|\b45e\b/.test(id))return 'xb';
  if(/\b0?057e\b|\b57e\b/.test(id))return 'ns';
  if(/xbox|xinput/.test(id))return 'xb';
  if(/nintendo|pro controller|joy-con/.test(id))return 'ns';
  return 'ps'; // PlayStation ("DualSense", "Wireless Controller"…) o desconocido
}
// cada cuadro, por joystick: marca, aviso de control no reconocido y quién tocó último
function padLook(gp,st,edge){
  let inf=padInfo[gp.index];
  if(!inf||inf.id!==gp.id){inf=padInfo[gp.index]={id:gp.id,brand:padBrand(gp),std:gp.mapping==='standard'};
    const key=gp.index+'|'+gp.id;if(!inf.std&&!padNoteSeen.has(key)){padNoteSeen.add(key);padNotes.push({t:0});}}
  let any=false;for(const k in st)if(edge(k)){any=true;break;}
  if(!any)return;
  devAny=gp.index;lastPad=gp.index;
  // ✕ en un joystick libre en la pantalla de personaje suma al jugador 2: no cambia el control del jugador 1
  const joins=padJoins(gp.index)&&edge('jump');
  if(gp.index!==p2Pad&&!joins)dev1=gp.index;
}
const padOn=i=>i>=0&&padSeen.has(i);
function padFreeIdx(){let alt=-1;for(const i of padSeen){if(i===p2Pad)continue;if(i!==dev1)return i;alt=i;}return alt;}
function devOf(who){
  if(who===1)return padOn(p2Pad)?p2Pad:-1;
  if(who==='free')return padFreeIdx();
  if(who==='pad'){if(padOn(lastPad))return lastPad;for(const i of padSeen)return i;return -1;}
  if(who&&typeof who==='object')return who.i;
  const d=who===0?dev1:devAny;return padOn(d)?d:-1;
}
const onPad=who=>devOf(who)>=0;
// pantalla táctil (publicar/web/tactil.js pone window.OXIDO_TOQUE mientras el último control usado sea tocar la pantalla)
function onTouch(){return !!window.OXIDO_TOQUE;}
const BTN_TOUCH={ok:'✕',start:'✕',jump:'✕',shoot:'□',r1:'□',r2:'□',bomb:'○',l2:'○',swap:'△',air:'△',quit:'△',back:'○',opt:'II'};
function btn(a,who){if(onTouch()&&(who===undefined||who===0)&&BTN_TOUCH[a])return BTN_TOUCH[a];
  const d=devOf(who);if(d<0)return kbBtns(who)[a];
  if(a==='up'||a==='down'||a==='left'||a==='right')return BTN_KB[a];
  return PAD_LBL[(padInfo[d]&&padInfo[d].brand)||'ps'][BTN_PAD[a]];}
// joystick con mapeo que no es 'standard': un aviso, una sola vez por joystick (se sigue pudiendo jugar)
const padNotes=[],padNoteSeen=new Set(),PAD_NOTE_T=330;
function drawPadNote(){
  if(!padNotes.length)return;const n=padNotes[0];n.t++;
  if(n.t>PAD_NOTE_T){padNotes.shift();return;}
  ctx.setTransform(S,0,0,S,0,0); // pegado abajo del lienzo (en 16:10 con GRANDE el lienzo es más alto que 180)
  const a=Math.min(1,n.t/12,(PAD_NOTE_T-n.t+1)/20),w=150,x=Math.round(W/2-w/2),y=HC-27;
  ctx.globalAlpha=a;ctx.fillStyle='rgba(18,12,24,0.92)';ctx.fillRect(x,y,w,19);ctx.fillStyle='#ff9a3c';ctx.fillRect(x,y,w,1);
  txt('ESTE CONTROL NO SE RECONOCE',W/2,y+3,6,'#ffb36b','center',false);
  txt('los botones pueden estar cambiados',W/2,y+11,5,'#ddd','center',false);
  ctx.globalAlpha=1;
}
