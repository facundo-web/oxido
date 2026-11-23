'use strict';
// Óxido · Ayudas para que se entienda el juego sin leer nada aparte
// · Cartel de objetivo al arrancar cada misión (una línea: avanzar, rescatar y a quién vencer).
// · Flecha → que titila si al principio nadie avanza.
// · CÓMO JUGAR, desde el título: la tarjeta de controles (la misma de la pausa). Ya no sale sola antes de la primera partida.
// (los carteles del piso de la misión 1 se sacaron: los reemplaza la introducción jugable, intro.js)
// ---------- objetivo y flecha ----------
let AY_x0=0;
ON_START.push(()=>{AY_x0=players.length?players[0].x:0;});
// un solo cartel al arrancar (reemplaza al nombre grande de la misión): se lee en 2 segundos
const AY_OBJ_T=150;
function ayObjetivo(){const b=BOSSES[levelIdx]||BOSSES[0];return 'AVANZÁ → Y VENCÉ A '+(b&&b.villain?b.villain.name:'AL JEFE');}
ON_HUD.push(()=>{
  if(state!=='play'||!players.length)return;
  if(T<AY_OBJ_T&&!(typeof PC_cartel!=='undefined'&&PC_cartel)&&!(banner&&banner.t>0&&banner.prio>=4)&&!(typeof VIN_activo==='function'&&VIN_activo())){ /* ni sobre la página de jefe (pagina.js) */ /* un aviso de ataque tiene prioridad sobre el objetivo */const a=Math.min(1,T/10,(AY_OBJ_T-T)/16);ctx.globalAlpha=a; /* arriba y chico, como los demás avisos (guía de arte §7) */
    if(!(banner&&banner.t>0))avTira([[L.name,'#f3c969'],[ayObjetivo(),'#fff']],false,AV_ARRIBA,'#f3c969');ctx.globalAlpha=1;}
  // nadie avanzó: flecha que titila a la derecha
  const moved=players.some(p=>(p.ride?p.ride.x:p.x)-AY_x0>16);
  if(T>90&&T<900&&!moved&&!lock&&(T>>4)%2===0){const x=W-26,lb=typeof tactilLibre==='function'?tactilLibre():null,y=lb?Math.min(HC/2,lb.y0-24):HC/2; /* en táctil, arriba del rombo (Pruebas) */
    {const g=typeof HUD_escala==='function'&&HUD_escala()>1;pxTxt('→',x-(g?4:0),y-(g?10:6),'#ffe08a','center',g?3:2);pxTxt('AVANZÁ',x-(g?4:0),y+(g?8:7),'#ffe08a','center',g?2:1);}}
});
// ---------- CÓMO JUGAR (desde el título) ----------
// La tarjeta de controles (la misma de la pausa), según el control: teclado, joystick o pantalla. Ya no sale sola en la
// primera partida: la misión 1 enseña con los carteles del piso.
// Dos páginas (← →): los controles del aparato que estás usando, y CONTROLES SIMPLES de a 2 con un teclado.
let ayudaT=0,ayudaPag=0;
function ayudaAbrir(){ayudaT=0;ayudaPag=0;state='ayuda';}
function updAyuda(){
  T++;ayudaT++;camX=(T*0.5)%2400;
  if(CTRL_teclas()){} // ← → cambian la vista del control dibujado (controles.js)
  else if(ayudaT>8&&pressed.bomb&&typeof IN_practicar==='function'){SFX.pick();IN_practicar();} // PRACTICAR (intro.js)
  else if(ayudaT>8&&(pressed.back||pressed.start||pressed.jump||pressed.shoot)){state='title';SFX.swap();}
}
function drawAyuda(){
  dim(0.72);
  txt('CÓMO JUGAR',W/2,16,13,'#ffe08a','center');
  if(typeof IN_practicar==='function'){const s='PRACTICAR: '+btn('bomb'),w=hudTW(s,5)+10;ctx.fillStyle='rgba(243,201,105,0.16)';ctx.fillRect(W-8-w,28,w,9);ctx.strokeStyle='#f3c969';ctx.lineWidth=0.6;ctx.strokeRect(W-8-w+0.5,28.5,w-1,8);
    txt(s,W-8-w/2,29.5,5,'#ffe08a','center',false);zona(W-8-w,28,w,9,{clic:()=>{SFX.pick();IN_practicar();}});}
  zona(W/2-60,145,120,10,{clic:RA_volver});
  // el control dibujado (controles.js, de Arte): de a 2 con un teclado ahora es una vista de la misma tarjeta (◀ ▶)
  CTRL_dibujar(28,42,264,98);
  {const s=padFree()?'De a 2: en el otro joystick, '+btn('jump','free')+' al elegir personaje.':'De a 2: conectá un joystick y apretá saltar al elegir personaje.';
   const lb=tactilLibre(),x0=lb?Math.max(8,lb.x0+4):8,x1=lb?Math.min(W-8,lb.x1-4):W-8;   // en táctil, entre la palanca y el rombo
   const ls=lb?wrapTxt(s,5,x1-x0):[s];
   if(lb)ls.forEach((l,i)=>txt(l,(x0+x1)/2,140+i*7,5,'#ddd','center',false));
   else txt(s,W/2,142,5,'#ddd','center',false);
   txt(btn('ok')+' o '+btn('back')+': volver',lb?(x0+x1)/2:W/2,lb?141+ls.length*7:148,5,'#aaa','center',false);}
}
