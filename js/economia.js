'use strict';
// Óxido · Economía de vidas y corazones
// Contadores para medir (los lee el bot): vidas y corazones que se juntaron en la misión.
const ECO={vidas:0,corazones:0,premios:{}};
let ECO_hp=new Map();
ON_START.push(()=>{ECO.vidas=0;ECO.corazones=0;ECO.premios={};ECO_hp=new Map();});
ON_STEP.push(()=>{for(const p of players){const h=ECO_hp.get(p);if(h!==undefined&&!p.dead&&p.hp>h)ECO.corazones+=p.hp-h;ECO_hp.set(p,p.hp);}});
// ---------- NORMAL y DIFÍCIL: la dificultad viene del daño, no de cuántas vidas juntás ----------
// FÁCIL queda generoso como siempre. En NORMAL y DIFÍCIL:
//   · el botiquín '+' (salud llena, el paquete de 3–4 ♥) pasa a ser raro: 3 de cada 4 salen como un corazón suelto 'C' (+1 ♥);
//   · la vida extra 'V' del cofre blindado solo aparece en las misiones 3, 6 y 9; en las otras el cofre da salud llena;
//   · el premio del jefe da +2 ♥ (hasta el máximo) en vez de una vida y salud llena (jefes.js, bossReward).
const ecoGeneroso=()=>difficulty===0||!!window.ECO_OFF; // ECO_OFF: el bot mide cómo era antes
const ecoVidaToca=()=>levelIdx%3===2;
function ecoConvertir(k){
  if(!k||k.eco)return;k.eco=1;if(ecoGeneroso())return;
  if(k.kind==='V'){if(!ecoVidaToca())k.kind='+';}
  else if(k.kind==='+'&&Math.random()<0.75)k.kind='C';
}
ON_STEP.push(()=>{for(const k of pickups)ecoConvertir(k);});
