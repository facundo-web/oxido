'use strict';
// Óxido · Ayudas para que se entienda el juego sin leer nada aparte
// · Carteles en el piso de la misión 1 (agacharse, disparar arriba sin frenar, disparar abajo en el aire, granada).
//   Los botones salen del último control que se usó (btn en input.js): teclado, joystick o pantalla.
// · Cartel de objetivo al arrancar cada misión (una línea: avanzar, rescatar y a quién vencer).
// · Flecha → que titila si al principio nadie avanza.
// · CÓMO JUGAR, desde el título: la tarjeta de controles (la misma de la pausa). Ya no sale sola antes de la primera partida.
// ---------- carteles del piso (misión 1) ----------
const AY_CARTELES=[
  {x:96,s:()=>(onTouch()?'PALANCA ':'')+btn('down',0)+'  AGACHARSE'},
  {x:178,s:()=>simpleDe(0)?btn('up',0)+'  SALTÁ · APUNTA SOLO':(onTouch()?'PALANCA ':'')+'↑  DISPARÁ ARRIBA SIN FRENAR'},
  {x:292,s:()=>simpleDe(0)?'EN EL AIRE APUNTA SOLO ABAJO':'EN EL AIRE: '+(onTouch()?'PALANCA ':'')+'↓  DISPARÁ ABAJO'},
  {x:398,s:()=>btn('bomb',0)+'  GRANADA'}];
function ayCartel(x,s){
  const w=Math.ceil(hudTW(s,4))+8,y=GROUND-21;
  ctx.fillStyle='#3a2618';ctx.fillRect(q(x-1),y+9,2,12);                     // poste
  ctx.fillStyle='#120c18';ctx.fillRect(q(x-w/2-0.5),y-0.5,w+1,10);
  ctx.fillStyle='#6b4423';ctx.fillRect(q(x-w/2),y,w,9);ctx.fillStyle='#8a5a30';ctx.fillRect(q(x-w/2),y,w,1.5);
  txt(s,x,y+2.4,4,'#ffe8b0','center',false);
}
ON_DRAW.push(()=>{if(levelIdx!==0||state==='title'||state==='select')return;
  for(const c of AY_CARTELES)if(c.x>camX-80&&c.x<camX+VW+80)ayCartel(c.x,c.s());});
// ---------- objetivo y flecha ----------
let AY_x0=0;
ON_START.push(()=>{AY_x0=players.length?players[0].x:0;});
// un solo cartel al arrancar (reemplaza al nombre grande de la misión): se lee en 2 segundos
const AY_OBJ_T=150;
function ayObjetivo(){const b=BOSSES[levelIdx]||BOSSES[0];return 'AVANZÁ → Y VENCÉ A '+(b&&b.villain?b.villain.name:'AL JEFE');}
ON_HUD.push(()=>{
  if(state!=='play'||!players.length)return;
  if(T<AY_OBJ_T){const a=Math.min(1,T/10,(AY_OBJ_T-T)/16),s=ayObjetivo(),w=Math.max(hudTW(s,8),hudTW(L.name,5))+20,y=52;
    ctx.globalAlpha=a;ctx.fillStyle='rgba(18,12,24,0.85)';ctx.fillRect(W/2-w/2,y,w,23);ctx.fillStyle='#f3c969';ctx.fillRect(W/2-w/2,y,w,1);
    txt(L.name,W/2,y+3,5,'#f3c969','center',false);
    txt(s,W/2,y+10,8,'#fff','center');ctx.globalAlpha=1;}
  // nadie avanzó: flecha que titila a la derecha
  const moved=players.some(p=>(p.ride?p.ride.x:p.x)-AY_x0>16);
  if(T>90&&T<900&&!moved&&!lock&&(T>>4)%2===0){const x=W-26,y=HC/2;
    txt('→',x,y-8,16,'#ffe08a','center');txt('AVANZÁ',x,y+9,5,'#ffe08a','center');}
});
// ---------- CÓMO JUGAR (desde el título) ----------
// La tarjeta de controles (la misma de la pausa), según el control: teclado, joystick o pantalla. Ya no sale sola en la
// primera partida: la misión 1 enseña con los carteles del piso.
// Dos páginas (← →): los controles del aparato que estás usando, y CONTROLES SIMPLES de a 2 con un teclado.
let ayudaT=0,ayudaPag=0;
function ayudaAbrir(){ayudaT=0;ayudaPag=0;state='ayuda';}
function updAyuda(){
  T++;ayudaT++;camX=(T*0.5)%2400;
  if(pressed.left||pressed.right){ayudaPag^=1;SFX.swap();}
  else if(ayudaT>8&&(pressed.back||pressed.start||pressed.jump||pressed.shoot)){state='title';SFX.swap();}
}
function drawAyuda(){
  dim(0.72);
  txt('CÓMO JUGAR',W/2,16,13,'#ffe08a','center');
  // flechas de página más abajo y más adentro: en táctil, arriba a la izquierda está el botón ‹ VOLVER de tactil.js
  const b=(T>>4)%2?1:0;txt('◀',64-b,33,7,'#ffe08a','right',false);txt('▶',256+b,33,7,'#ffe08a','left',false);
  if(ayudaPag===1){txt('de a 2 con un teclado · controles simples',W/2,35,5,'#aaa','center',false);drawSimples2(46,true);
    txt(btn('ok')+' o '+btn('back')+': volver · ← → otra página',W/2,148,5,'#aaa','center',false);return;}
  txt((onTouch()?'en pantalla':onPad()?'con joystick':controlesSimples?'con teclado · controles simples':'con teclado')+' · ← → otra página',W/2,35,5,'#aaa','center',false);
  drawControls(46);
  txt('La rueda de armas va en cámara lenta: elegí y soltá.',W/2,112,5,'#ddd','center',false);
  txt(padFree()?'De a 2: en el otro joystick, '+btn('jump','free')+' al elegir personaje.':'De a 2: conectá un joystick y apretá saltar al elegir personaje.',W/2,121,5,'#ddd','center',false);
  txt(btn('ok')+' o '+btn('back')+': volver',W/2,148,5,'#aaa','center',false);
}
