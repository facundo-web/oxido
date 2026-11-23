'use strict';
// Óxido · Bola de pelea del gato (solo dibujo y sonido: la lógica de 'scratch' sigue en gatito.js; el gato no hace daño)
// Recurso general de los dibujitos: gira tan rápido que se vuelve un trompo que avanza. Con la identidad del gato de
// Óxido (pelaje gris con crema, ojos verdes, nariz rosa); nada de bestias famosas ni sus sonidos.
// · Mientras araña (st 'scratch'), en vez del gato se ve una BOLA de pelea: nube redonda del color del pelaje que gira
//   (bollos alrededor y rayas de giro), del tamaño del enemigo, sobre su parte de arriba. A ratos asoman las orejas, la
//   cola o una patita con uñas, cada vez de otro lado; polvo, mechones y estrellitas alrededor. Animada "de a dos".
// · Al terminar, el gato queda mareado un instante (ojitos en espiral, 0,4 s).
// · Sonido: zumbido de giro (ruido filtrado que sube y baja); los rasguños de siempre quedan encima, más bajos.
// Prefijo REM_.
const REM_COL={pelo:'#9aa0ad',sombra:'#5f6472',crema:'#f1e4c6',tinta:'#17141f'};
let REM_ant=null,REM_mareoT=0,REM_zumbaT=0;
function REM_zumbido(){
  if(typeof actx==='undefined'||!actx||muted)return;
  try{const t=actx.currentTime,s=actx.createBufferSource();s.buffer=noiseBuf;
    const f=actx.createBiquadFilter();f.type='bandpass';f.Q.value=3;
    f.frequency.setValueAtTime(420,t);f.frequency.exponentialRampToValueAtTime(1700,t+0.16);f.frequency.exponentialRampToValueAtTime(520,t+0.36);
    const g=actx.createGain();g.gain.setValueAtTime(0.001,t);g.gain.exponentialRampToValueAtTime(0.05,t+0.05);g.gain.exponentialRampToValueAtTime(0.001,t+0.38);
    s.connect(f).connect(g).connect(actx.destination);s.start(t);s.stop(t+0.4);}catch(e){}
}
// cambios de estado del gato: empieza el remolino (zumbido) y termina (mareo)
ON_STEP.push(()=>{
  const g=gato;if(!g){REM_ant=null;return;}
  if(g.st==='scratch'){if(REM_ant!=='scratch'||++REM_zumbaT%22===0){REM_zumbido();if(REM_ant!=='scratch')REM_zumbaT=0;}
    // mechones de pelo y alguna estrellita (solo adorno)
    if(T%3===0){const{cx,cy}=REM_bolaCentro(g);parts.push({k:'p',x:cx+rand(-5,5),y:cy+rand(-3,4),vx:rand(-1.6,1.6),vy:rand(-1.8,-0.4),g:0.1,life:rand(10,18),maxl:18,size:1,col:Math.random()<0.15?'#ffe066':Math.random()<0.5?REM_COL.pelo:REM_COL.crema});}
    if(T%4===0)parts.push({k:'smoke',col:'200,180,150',x:REM_bolaCentro(g).cx+rand(-9,9),y:REM_bolaCentro(g).cy+rand(4,9),vx:rand(-0.6,0.6),vy:rand(-0.3,-0.1),life:rand(12,18),maxl:18,size:rand(1,1.8)});}
  if(REM_ant==='scratch'&&g.st!=='scratch')REM_mareoT=24;
  if(REM_mareoT>0)REM_mareoT--;
  REM_ant=g.st;
});
const REM_vaiven=()=>Math.round(Math.sin(T*0.28)*3);
// la BOLA de pelea: una nube redonda que gira (bollos alrededor), del tamaño del enemigo, sobre su parte de arriba
function REM_bolaCentro(g){const e=g.tgt;
  if(e&&!e.gone)return{cx:e.x+e.w/2+REM_vaiven()*0.5,cy:e.y+Math.min(e.h*0.38,14),R:clamp(Math.max(e.w,Math.min(e.h,26))*0.45,7,13)};
  return{cx:g.x+6+REM_vaiven(),cy:g.y+3,R:8};}
function REM_bola(cx,cy,R,col,fase){
  const N=8,bollos=[];for(let i=0;i<N;i++){const a=fase+i*Math.PI*2/N;bollos.push([cx+Math.cos(a)*R*0.66,cy+Math.sin(a)*R*0.56,R*(i%2?0.4:0.47)]);}
  // tinta, pelo y sombra por bollo (de a capas, así el borde queda limpio)
  ctx.fillStyle=col.tinta;circle(cx,cy,R*0.74+0.9);for(const[x,y,r]of bollos)circle(x,y,r+0.9);
  ctx.fillStyle=col.pelo;circle(cx,cy,R*0.74);for(const[x,y,r]of bollos)circle(x,y,r);
  ctx.fillStyle=col.sombra;for(let i=0;i<N;i+=2){const[x,y,r]=bollos[i];if(y>cy)circle(x,y+r*0.25,r*0.6);}
  // rayas de giro: arcos crema que corren alrededor
  ctx.strokeStyle=col.crema;ctx.lineWidth=1;
  for(let i=0;i<3;i++){const a=fase*1.6+i*2.1;ctx.beginPath();ctx.ellipse(cx,cy,R*0.5,R*0.36,0,a,a+1.3);ctx.stroke();}
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.fillRect(q(cx-R*0.35),q(cy-R*0.55),R*0.5,0.8);
}
// dibuja la bola si el gato está arañando; devuelve true si la dibujó (entonces no se dibuja el gato)
function REM_dibuja(g){
  if(g.st!=='scratch')return false;
  const{cx,cy,R}=REM_bolaCentro(g),fase=((T>>1)*0.55),f=g.face||1,ciclo=(T>>1)%12; // "de a dos": cambia cada 2 cuadros
  // asoman cosas de a ratos, cada vez de otro lado: orejas, cola, una patita con uñas
  const lado=((T>>4)%4)*Math.PI/2+0.6,ax=cx+Math.cos(lado)*R*0.95,ay=cy+Math.sin(lado)*R*0.8;
  if(ciclo<3){ctx.fillStyle=REM_COL.tinta;for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(cx+s*3-2,cy-R*0.82+1);ctx.lineTo(cx+s*4,cy-R*0.82-3.5);ctx.lineTo(cx+s*5+1.2,cy-R*0.82+1);ctx.fill();}
    ctx.fillStyle=REM_COL.pelo;for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(cx+s*3-1,cy-R*0.82+1);ctx.lineTo(cx+s*4,cy-R*0.82-2.6);ctx.lineTo(cx+s*5,cy-R*0.82+1);ctx.fill();}
    ctx.fillStyle='#ff8fa8';ctx.fillRect(q(cx-4.2),q(cy-R*0.82-0.5),1,1);ctx.fillRect(q(cx+3.6),q(cy-R*0.82-0.5),1,1);}
  else if(ciclo<6){const tx=cx-f*R*0.9,ty=cy+R*0.2;ctx.strokeStyle=REM_COL.tinta;ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(tx,ty);ctx.quadraticCurveTo(tx-f*6,ty-1,tx-f*5,ty-6);ctx.stroke();
    ctx.strokeStyle=REM_COL.pelo;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(tx,ty);ctx.quadraticCurveTo(tx-f*6,ty-1,tx-f*5,ty-6);ctx.stroke();}
  else if(ciclo<9){ctx.fillStyle=REM_COL.tinta;ctx.fillRect(q(ax-2),q(ay-1.5),4,3);ctx.fillStyle=REM_COL.crema;ctx.fillRect(q(ax-1.5),q(ay-1),3,2);
    ctx.fillStyle='#ffffff';for(let i=0;i<3;i++)ctx.fillRect(q(ax-1.5+i),q(ay+1),0.6,1.2);}
  REM_bola(cx,cy,R,REM_COL,fase);
  // estrellitas y chispas de pelea alrededor
  for(let i=0;i<2;i++){if((T>>2)%3===i)continue;const a=T*0.3+i*3,sx=cx+Math.cos(a)*(R+3),sy=cy+Math.sin(a)*(R*0.7+2);
    ctx.fillStyle='#ffe066';ctx.fillRect(q(sx-1.5),q(sy-0.5),3,1);ctx.fillRect(q(sx-0.5),q(sy-1.5),1,3);}
  return true;
}
// mareo: ojitos en espiral y estrellitas sobre la cabeza (encima del gato normal)
function REM_mareo(g){
  if(REM_mareoT<=0||!g||g.st==='angel'||g.st==='ascend')return;
  const fx=g.face>0?g.x+9:g.x+1,hy=g.y+2,giro=T*0.5;
  for(const dx of[0,2.4]){const ex=fx+dx;ctx.strokeStyle=REM_COL.tinta;ctx.lineWidth=0.5;ctx.beginPath();
    for(let k=0;k<1;k+=0.08){const r=0.2+k*1.1,a=giro+k*9;ctx.lineTo(ex+Math.cos(a)*r,hy+Math.sin(a)*r);}ctx.stroke();}
  for(let i=0;i<3;i++){const a=T*0.25+i*2.1,sx=g.x+6+Math.cos(a)*6,sy=g.y-3+Math.sin(a)*1.6;ctx.fillStyle='#ffe066';ctx.fillRect(q(sx-1),q(sy-0.5),2,1);ctx.fillRect(q(sx-0.5),q(sy-1),1,2);}
}
