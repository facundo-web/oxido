'use strict';
// Óxido · Personajes elegibles
// ================== personajes (originales) ==================
// desc y perk van en la tarjeta de selección: desc hasta ~28 caracteres, perk hasta ~34.
// Rasgo de juego de cada uno (con los campos que ya usa el juego):
//   FACU: el veterano, arranca con 15 granadas.
//   JOSÉ: la más rápida, salta más alto y dispara más seguido (cd 0.85).
//   LAUTI: el más duro, 4 corazones y arranca con escopeta.
// Campos propuestos, todavía sin usar en el juego (pendientes de integrar en jugador.js / combate.js):
//   grenadeR: multiplicador del radio de explosión de sus granadas.
//   airJump: saltos extra en el aire.
//   armor: golpes que aguanta sin perder corazón al empezar cada vida.
const CHARS=[
  {name:'FACU',desc:'El veterano',perk:'15 granadas · explotan más',hp:3,speed:1.45,jump:6.1,bombs:15,cd:1,start:null,
   grenadeR:1.3,pal:PAL_P,head:HEAD_P,torso:TORSO,helmet:'#4f6a2c'},
  {name:'JOSÉ',desc:'Rápida y ágil',perk:'Doble salto · dispara rápido',hp:3,speed:1.75,jump:6.6,bombs:8,cd:0.85,start:null,
   airJump:1,pal:PAL_T,head:HEAD_T,torso:TORSO_T,helmet:'#2f8a96'},
  {name:'LAUTI',desc:'Chico y duro',perk:'4 ♥ · escopeta · aguanta un golpe',hp:4,speed:1.3,jump:5.9,bombs:10,cd:1.1,start:['shotgun',20],
   armor:1,pal:PAL_B,head:HEAD_B,torso:TORSO_B,helmet:'#d23a2e'}
];
// 4 colores por personaje (casco de FACU, gorra de JOSÉ, vincha de LAUTI). El 0 es el de siempre; el 1 es el que
// usaba el jugador 2 cuando repetía personaje. Se eligen en la pantalla de personaje (hud.js) y se guardan:
// oxido-colores (jugador 1) y oxido-colores2 (jugador 2), un número por personaje. De a 2, mismo personaje y mismo
// color no se puede: colFix() corre el del jugador 2.
const COLORES=[
  [{},{h:'#2f6fc8',H:'#6aa6f0'},{h:'#a8803a',H:'#d8b060'},{h:'#6a3a8a',H:'#9a6ac0'}],
  [{},{c:'#c8503a',C:'#f08a6a'},{c:'#c89a2a',C:'#f0c860'},{c:'#7a4aa8',C:'#a87ad8'}],
  [{},{h:'#2f6fc8',H:'#6aa6f0',u:'#1a3a80'},{h:'#3a8a3a',H:'#6ac06a',u:'#1e5a1e'},{h:'#d89a2a',H:'#f0c860',u:'#8a5a10'}]];
// TUERCA (arte-personaje.js, elegido por Facu el 22 nov): va al final y se destraba con 6 engranajes dorados (tuerca.js)
if(typeof PJ_BOCETOS!=='undefined'){CHARS.push(PJ_BOCETOS[PJ_ELEGIDO]);COLORES.push(PJ_COLORES);}
const N_COL=4;
const colMuestra=(ci,k)=>{const o=COLORES[ci][k];return o.h||o.c||CHARS[ci].helmet;};
// piernas de los jugadores: 0 = como siempre (el pedido de acortarlas se canceló el 22 nov). build() admite 1 o 2
// píxeles menos sin tocar la caja de golpe, por si alguna vez hace falta.
const LEG_CORTE=0;
const SPR={chars:CHARS.map(c=>build(c.pal,c.head,c.torso,LEG_CORTE)),e:build(PAL_E),g:build(PAL_G),sh:build(PAL_SH),a:build(PAL_A,HEAD_A),w:build(PAL_W)};
const SPR_COL=CHARS.map(()=>[]);
// sprites del personaje ci con el color k (se arman la primera vez que se piden)
function charSet(ci,k){k=k|0;if(!k)return SPR.chars[ci];const c=CHARS[ci];return SPR_COL[ci][k]||(SPR_COL[ci][k]=build({...c.pal,...COLORES[ci][k]},c.head,c.torso,LEG_CORTE));}
const colLeer=(key,def)=>{try{const a=JSON.parse(store.get(key)||'null');if(Array.isArray(a))return CHARS.map((_,i)=>clamp(a[i]|0,0,N_COL-1));}catch(e){}return CHARS.map(()=>def);};
let p1Col=colLeer('oxido-colores',0),p2Col=colLeer('oxido-colores2',1);
function colGuardar(){store.set('oxido-colores',JSON.stringify(p1Col));store.set('oxido-colores2',JSON.stringify(p2Col));}
// de a 2 con el mismo personaje: el jugador 2 no puede tener el mismo color que el 1
function colFix(c1,c2){if(c1===c2&&p2Col[c2]===p1Col[c1])p2Col[c2]=(p2Col[c2]+1)%N_COL;}
