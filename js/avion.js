'use strict';
// Óxido · Apoyo aéreo
// ================== apoyo aéreo ==================
function callAir(){
  if(air||winT||P.dead)return;
  if(flares>0){flares--;setBanner('¡APOYO AÉREO EN CAMINO!',80);}
  else{
    if(P.hp<2){setBanner('NECESITÁS 2 CORAZONES',60);SFX.hit();return;}
    P.hp--;setBanner('¡APOYO AÉREO! · −1 CORAZÓN',90);SFX.hurt();
    parts.push({k:'txt',s:'−1 ♥',x:P.x+4,y:P.y-6,life:50,maxl:50});
  }
  SFX.radio();air={x:camX-90,y:22,t:0,drops:0};emit('airCall',{});
}
function updAir(){
  if(air){
    air.t++;air.x+=3.4;
    if(air.t>25&&air.t%5===0&&air.x>camX+6&&air.x<camX+VW-6&&air.drops<14){air.drops++;airBombs.push({x:air.x,y:air.y+6,vx:1.4,vy:0.6});}
    if(air.t%8===0){const d=enemies.find(e=>hittable(e)&&(e.type==='drone'||e.air)&&onScreen(e,0));
      if(d){killSrc='air';dmg(d,isBoss(d)?0.5:3);killSrc=null;parts.push({k:'tracer',x:air.x+6,y:air.y+5,x2:d.x+d.w/2,y2:d.y+d.h/2,life:5,maxl:5});SFX.heavy();}}
    if(air.x>camX+VW+100)air=null;
  }
  for(const b of airBombs){b.vy+=0.22;b.x+=b.vx;b.y+=b.vy;if(b.y>=GROUND-3){b.gone=true;killSrc='air';blast(b.x,GROUND-4,26,8*dmgMul,0.2);killSrc=null;}}
  airBombs=airBombs.filter(b=>!b.gone);
}
function drawPlane(a){
  const x=a.x,y=a.y;
  ctx.fillStyle='rgba(20,10,20,0.25)';ctx.beginPath();ctx.ellipse(x+4,GROUND+2,22,2,0,0,7);ctx.fill();
  ctx.fillStyle='#2f3a24';ctx.fillRect(x-22,y+1,10,2);ctx.beginPath();ctx.moveTo(x-24,y-6);ctx.lineTo(x-18,y+2);ctx.lineTo(x-24,y+2);ctx.fill();
  ctx.fillStyle='#3d4a2c';ctx.beginPath();ctx.ellipse(x,y+2,20,4.5,0,0,7);ctx.fill();
  ctx.fillStyle='#55663c';ctx.fillRect(x-16,y-1,30,1.2);
  ctx.fillStyle='#2a3320';ctx.fillRect(x-8,y+2,14,2.5);
  ctx.fillStyle='#e07a2c';ctx.fillRect(x-4,y,3,4);
  ctx.fillStyle='rgba(150,220,230,0.8)';ctx.fillRect(x+13,y-0.5,4,2);
  ctx.fillStyle='#1d2416';ctx.fillRect(x-4,y+4,3,4);ctx.fillRect(x+4,y+4,3,4);
  const pw=(T>>1)%2?5:2;ctx.fillStyle='rgba(230,230,230,0.7)';ctx.fillRect(x+20,y+2-pw,1,pw*2);
}
// El avión se pide desde la rueda de armas (rueda.js: mantener S, △ o L1, o la tecla 6).
// Lo paga el que lo pide (o un avión gratis compartido). P.ah ya no se usa (queda en 0: la barrita no aparece).
const AIR_HOLD=36,AIR_TAP=12;
// tecla del avión para los carteles: la del control que usa ese jugador (S, L1, LB o L; btn en input.js)
const airKey=()=>btn('air',P?P.slot:undefined);
function airReady(){return !air&&!winT&&!P.dead&&(flares>0||P.hp>=2);}
function updAirCharge(){P.ah=0;}
// barrita de carga sobre la cabeza mientras se mantiene S
function drawAirCharge(){
  const airHold=P.ah;
  if(airHold<=AIR_TAP||airHold>AIR_HOLD+8||P.dead||(air&&airHold<AIR_HOLD))return;
  const done=airHold>=AIR_HOLD,k=Math.min(1,(airHold-AIR_TAP)/(AIR_HOLD-AIR_TAP)),ok=done||airReady();
  const top=P.ride?P.ride.y:P.y+(P.crouch?3:0),cx=(P.ride?P.ride.x+11:P.x+4),x=Math.round(cx-10),y=Math.round(top-9);
  ctx.fillStyle='#120c18';ctx.fillRect(x-1,y-1,22,5);ctx.fillStyle='#2a1f30';ctx.fillRect(x,y,20,3);
  ctx.fillStyle=!ok?'#ff5a3c':done&&(T>>1)%2?'#ffffff':'#9ad0ff';ctx.fillRect(x,y,20*k,3);
  txt(!ok?'NECESITÁS 2 ♥':done?'¡AVIÓN!':'AVIÓN',cx,y-7,4,!ok?'#ff8a7a':'#9ad0ff','center');
}
