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
// jugador 2 con el mismo personaje que el 1: casco (o gorra) de otro color para distinguirlos
const ALT2=[{helmet:'#2f6fc8',pal:{h:'#2f6fc8',H:'#6aa6f0'}},{helmet:'#c8503a',pal:{c:'#c8503a',C:'#f08a6a'}},{helmet:'#2f6fc8',pal:{h:'#2f6fc8',H:'#6aa6f0',u:'#1a3a80'}}];
const SPR={chars:CHARS.map(c=>build(c.pal,c.head,c.torso)),chars2:CHARS.map((c,i)=>build({...c.pal,...ALT2[i].pal},c.head,c.torso)),e:build(PAL_E),g:build(PAL_G),sh:build(PAL_SH),a:build(PAL_A,HEAD_A),w:build(PAL_W)};
