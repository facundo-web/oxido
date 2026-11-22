'use strict';
// Óxido · Ayudas para que se entienda el juego sin leer nada aparte
// · Carteles en el piso de la misión 1 (agacharse, disparar arriba sin frenar, disparar abajo en el aire, granada).
//   Los botones salen del último control que se usó (btn en input.js): teclado, joystick o pantalla.
// · Cartel de objetivo al arrancar cada misión (una línea: avanzar, rescatar y a quién vencer).
// · Flecha → que titila si al principio nadie avanza.
// · Tarjeta de CONTROLES antes de la primera partida (una sola vez, guardado en oxido-ayuda). En la pausa ya están.
// ---------- carteles del piso (misión 1) ----------
const AY_CARTELES=[
  {x:96,s:()=>(onTouch()?'PALANCA ':'')+'↓  AGACHARSE'},
  {x:178,s:()=>(onTouch()?'PALANCA ':'')+'↑  DISPARÁ ARRIBA SIN FRENAR'},
  {x:292,s:()=>'EN EL AIRE: '+(onTouch()?'PALANCA ':'')+'↓  DISPARÁ ABAJO'},
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
// ---------- tarjeta de controles (primera partida) ----------
let ayudaT=0,ayudaNivel=0;
const ayudaVista=()=>!!store.get('oxido-ayuda');
// la llama updSelect (hud.js) en vez de startLevel la primera vez
function ayudaAbrir(nivel){ayudaNivel=nivel;ayudaT=0;state='ayuda';}
function updAyuda(){
  T++;ayudaT++;camX=(T*0.5)%2400;
  if(ayudaT>20&&(pressed.start||pressed.jump||pressed.shoot)){store.set('oxido-ayuda','1');SFX.pick();startLevel(ayudaNivel,false);}
  else if(ayudaT>10&&pressed.back)state='select';
}
function drawAyuda(){
  dim(0.72);
  txt('CONTROLES',W/2,18,14,'#ffe08a','center');
  txt(onTouch()?'en pantalla':onPad()?'con joystick':'con teclado',W/2,38,5,'#aaa','center',false);
  drawControls(50);
  txt('La rueda de armas va en cámara lenta: elegí y soltá.',W/2,116,5,'#ddd','center',false);
  if(ayudaT>20&&(T>>4)%2===0)txt(btn('ok')+': ¡A JUGAR!',W/2,134,8,'#fff','center');
  txt(btn('back')+': volver · los ves también en la pausa',W/2,152,4,'#aaa','center',false);
}
