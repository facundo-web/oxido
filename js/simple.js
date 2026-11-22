'use strict';
// Óxido · CONTROLES SIMPLES (las teclas las arma input.js)
// Cada jugador: 4 direcciones + DISPARAR + GRANADA. Se usa:
//   · de a 2 con un solo teclado (el jugador 2 entra con . en la elección de personaje): para los dos;
//   · con 1 jugador, si en OPCIONES está CONTROLES: SIMPLES y se juega con el teclado.
// Cómo se juega:
//   ↑ salta (en el aire, el doble salto de quien lo tenga) · ↓ agacharse; ↓ dos veces rápido baja de la plataforma.
//   Apunta solo: si el enemigo más cercano a la vista está arriba (en un cono), dispara arriba; en el aire, si está
//   abajo, dispara abajo; si no, de frente. Una flechita del color del jugador muestra para dónde apunta.
//   Armas: la nueva se equipa sola; sin munición vuelve a la última que tenga (y al final a la pistola). Sin rueda ni avión.
//   CHATARRA: ↑ salta y mantenido vuela; DISPARAR tira con la ametralladora y el mortero; GRANADA, el mortero.
//   ↓ dos veces: bajarse.
// Se mete en held()/tapped() de input.js (simHeld/simTapped) para el jugador de turno; el resto del juego no cambia.
const simpleDe=s=>typeof kb2On==='function'&&(kb2On()||(s===0&&controlesSimples&&!onPad(0)&&!onTouch()));
const SIM={baja:[-99,-99],cache:[{t:-1,v:'f'},{t:-1,v:'f'}]};
const tappedRaw=a=>inSlot?!!pressed2[a]:!!pressed[a];
// para dónde apunta solo el jugador de turno (P): 'up', 'down' o 'f'
function simApunta(){
  const s=inSlot,c=SIM.cache[s];if(c.t===T&&c.p===P)return c.v;
  const p=P,o=p.ride||p,cx=o.x+(o.w||8)/2,cy=o.y+(p.ride?8:9);let best=null,bd=1e9;
  for(const e of enemies){if(!hittable(e)||!onScreen(e,-6))continue;const dx=e.x+e.w/2-cx,dy=e.y+e.h/2-cy,d=dx*dx+dy*dy;if(d<bd){bd=d;best={dx,dy};}}
  let v='f';
  if(best){const{dx,dy}=best;if(dy<-12&&Math.abs(dx)<-dy*0.9)v='up';else if(!o.onGround&&dy>10&&Math.abs(dx)<dy*0.9)v='down';}
  c.t=T;c.p=P;c.v=v;return v;
}
// ↓ dos veces rápido (sobre una plataforma o en la CHATARRA): cuenta como "↓ + saltar" del juego de siempre
function simBaja(){
  const s=inSlot;if(!tappedRaw('down'))return false;
  const ok=T-SIM.baja[s]<=16&&T-SIM.baja[s]>0&&(P.ride||(P.onGround&&P.plat));
  return ok;
}
function simHeld(a){
  if(a==='jump')return heldRaw('up');
  if(a==='up')return simApunta()==='up';
  if(a==='down')return heldRaw('down')||(!P.ride&&simApunta()==='down');
  if(a==='air'||a==='swap')return false;
  return heldRaw(a);
}
function simTapped(a){
  if(a==='jump')return (tappedRaw('up')&&!(P.onGround&&P.plat&&heldRaw('down')))||simBaja();
  if(a==='bomb')return tappedRaw('bomb')||!!(P.ride&&heldRaw('shoot')&&P.ride.canCd<=0&&P.ride.shells>0);
  if(a==='air'||a==='swap')return false;
  return tappedRaw(a);
}
// se anota cuándo se tocó ↓ (para el doble toque) y el historial de armas de cada uno
ON_STEP.push(()=>{
  for(const p of players){const s=p.slot;if(!simpleDe(s))continue;
    if(s===0?pressed.down:pressed2.down)SIM.baja[s]=T;
    if(p.lastW!==p.weapon){if(p.lastW)(p.hist||(p.hist=[])).push(p.lastW);if(p.hist&&p.hist.length>8)p.hist.shift();p.lastW=p.weapon;}}
});
ON_START.push(()=>{SIM.baja=[-99,-99];});
// sin munición: vuelve a la última que tenga (y al final a la pistola). La llama fire() en armas.js.
function simVolverArma(p){
  const h=p.hist||[];while(h.length){const w=h.pop();if(w!==p.weapon&&w!=='pistol'&&p.weapons[w]>0){p.weapon=w;p.lastW=w;return;}}
  p.weapon='pistol';p.lastW='pistol';
}
// flechita del color del jugador: para dónde apunta solo
ON_DRAW.push(()=>{
  if(state!=='play')return;
  for(const p of players){if(p.dead||p.ride||!simpleDe(p.slot)||p.aim==='f')continue;
    const x=p.x+4,col=P_COL[p.slot],up=p.aim==='up',y=up?p.y-6:p.y+21;
    ctx.fillStyle='#120c18';ctx.fillRect(q(x-2.5),q(up?y-0.5:y-1.5),5,3);
    ctx.fillStyle=col;if(up){ctx.fillRect(q(x-0.5),q(y),1,1);ctx.fillRect(q(x-1.5),q(y+1),3,1);}else{ctx.fillRect(q(x-1.5),q(y-1),3,1);ctx.fillRect(q(x-0.5),q(y),1,1);}}
});
