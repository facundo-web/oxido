'use strict';
// Óxido · Medallas por bajas
// ================== medallas ==================
let fireMul=1,dmgMul=1,maxHp=3,medals=0,flares=0,shieldRegen=false;
const MEDALS=[
  {at:10,name:'BRONCE',col:'#c9824a',desc:'Disparo más rápido',apply:()=>{fireMul*=0.8;}},
  {at:25,name:'PLATA',col:'#cfd6e0',desc:'+1 corazón máximo',each:()=>{maxHp++;P.hp=maxHp;}},
  {at:45,name:'ORO',col:'#ffd23a',desc:'Escudo y +10 granadas',each:()=>{P.shield=3;P.bombs+=10;}},
  {at:70,name:'PLATINO',col:'#9fe8ff',desc:'Daño ×1.5 en todas las armas',apply:()=>{dmgMul=1.5;}},
  {at:100,name:'DIAMANTE',col:'#b9f3ff',desc:'+1 corazón máximo',each:()=>{maxHp++;P.hp=maxHp;}},
  {at:140,name:'LEYENDA',col:'#ff8ad8',desc:'El escudo se recarga solo',apply:()=>{shieldRegen=true;},each:()=>{P.shield=3;}}
];
const AIR_EVERY=30; // cada 30 bajas, un apoyo aéreo gratis
// e: la baja que la ganó (de ahí sale volando la medalla, como todo lo que suma: recolectar.js)
function checkMedals(e){
  const aca=e?{x:HX(e.x+e.w/2),y:HY(e.y+4)}:null;
  while(medals<MEDALS.length&&kills>=MEDALS[medals].at){
    const m=MEDALS[medals],antes=RC_fotos();medals++;emit('medal',{name:m.name});if(m.apply)m.apply();if(m.each)eachPlayer(m.each); // each: a cada jugador
    // una sola insignia que sube de nivel: el aviso dice a qué nivel llegaste y qué ganaste
    toast(m.name==='LEYENDA'?'¡AHORA SOS UNA LEYENDA!':'¡AHORA SOS DE '+m.name+'!',m.desc,m.col).lvl=medals;SFX.medal();
    RC_medalla(medals,aca,antes);
  }
  if(kills%AIR_EVERY===0){const f0=flares;flares++;toast('¡AVIÓN GRATIS!',AIR_EVERY+' bajas · '+airPide().toLowerCase(),'#9ad0ff').ico='air';RC_avion(aca,f0);}
}
