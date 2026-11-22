'use strict';
// Óxido · Remolino del gato (solo dibujo y sonido: el daño y la lógica de 'scratch' siguen en gatito.js)
// Recurso general de los dibujitos: gira tan rápido que se vuelve un trompo que avanza. Con la identidad del gato de
// Óxido (pelaje gris con crema, ojos verdes, nariz rosa); nada de bestias famosas ni sus sonidos.
// · Mientras araña (st 'scratch'), en vez del gato se ve un trompo del color del pelaje: 4 franjas curvas que giran,
//   ancho arriba y angosto abajo, con polvo en la base. A ratos asoman las orejas, la cola y tres rayitas de garras
//   hacia el enemigo; saltan mechones y alguna estrellita. Se hamaca de lado a lado sobre el enemigo.
// · Al terminar, el gato queda mareado un instante (ojitos en espiral, 0,4 s).
// · El ángel, cuando va a arañar un dron, es un remolino blanco y celeste con la aureola girando arriba.
// · Sonido: zumbido de giro (ruido filtrado que sube y baja); los rasguños de siempre quedan encima, más bajos.
// Prefijo REM_.
const REM_COL={pelo:'#9aa0ad',sombra:'#5f6472',crema:'#f1e4c6',tinta:'#17141f'};
const REM_ANGEL={pelo:'#ffffff',sombra:'#9fd6ff',crema:'#dff1ff',tinta:'#4a6a8a'};
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
    if(T%3===0){const cx=g.x+6+REM_vaiven(),cy=g.y+3;parts.push({k:'p',x:cx+rand(-5,5),y:cy+rand(-3,4),vx:rand(-1.6,1.6),vy:rand(-1.8,-0.4),g:0.1,life:rand(10,18),maxl:18,size:1,col:Math.random()<0.15?'#ffe066':Math.random()<0.5?REM_COL.pelo:REM_COL.crema});}
    if(T%4===0)parts.push({k:'smoke',col:'200,180,150',x:g.x+6+REM_vaiven()+rand(-3,3),y:g.y+10,vx:rand(-0.6,0.6),vy:rand(-0.3,-0.1),life:rand(12,18),maxl:18,size:rand(1,1.8)});}
  if(REM_ant==='scratch'&&g.st!=='scratch')REM_mareoT=24;
  if(REM_mareoT>0)REM_mareoT--;
  REM_ant=g.st;
});
const REM_vaiven=()=>Math.round(Math.sin(T*0.28)*3);
// el trompo: silueta de embudo y franjas curvas que corren de un lado al otro (parece que gira)
function REM_trompo(cx,base,alto,col,fase){
  const top=base-alto,ancho=y=>{const k=(y-top)/alto;return 8.5-6*k*k;}; // mitad del ancho a cada altura
  ctx.fillStyle=col.tinta;ctx.beginPath();
  for(let y=top;y<=base;y+=1)ctx.lineTo(cx-ancho(y)-0.8,y);for(let y=base;y>=top;y-=1)ctx.lineTo(cx+ancho(y)+0.8,y);ctx.fill();
  ctx.fillStyle=col.pelo;ctx.beginPath();
  for(let y=top;y<=base;y+=1)ctx.lineTo(cx-ancho(y),y);for(let y=base;y>=top;y-=1)ctx.lineTo(cx+ancho(y),y);ctx.fill();
  // 4 franjas: cada una es una curva en S que se corre con la fase
  for(let i=0;i<4;i++){
    ctx.strokeStyle=i%2?col.sombra:col.crema;ctx.lineWidth=1.3;ctx.beginPath();
    for(let y=top+0.5;y<=base-0.5;y+=0.75){const w=ancho(y),s=Math.sin(fase+i*Math.PI/2+(y-top)*0.32);
      if(Math.cos(fase+i*Math.PI/2+(y-top)*0.32)<-0.2){ctx.moveTo(cx+s*w,y);continue;} // la parte de atrás no se ve
      ctx.lineTo(cx+s*w,y);}
    ctx.stroke();}
  // brillo arriba
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.fillRect(q(cx-ancho(top+1)+1),q(top+1),ancho(top+1)*2-2,0.8);
}
// dibuja el remolino si el gato está arañando; devuelve true si lo dibujó (entonces no se dibuja el gato)
function REM_dibuja(g){
  if(g.st!=='scratch')return false;
  const cx=g.x+6+REM_vaiven(),base=g.y+10,alto=15,fase=T*0.9,f=g.face||1;
  // asoman cosas de a ratos (orejas, cola, garras)
  const ciclo=T%18;
  if(ciclo<4){ctx.fillStyle=REM_COL.tinta;for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(cx+s*2.5-1.6,base-alto+0.5);ctx.lineTo(cx+s*3.4,base-alto-3.5);ctx.lineTo(cx+s*4.2+1,base-alto+0.5);ctx.fill();}
    ctx.fillStyle=REM_COL.pelo;for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(cx+s*2.5-0.8,base-alto+0.5);ctx.lineTo(cx+s*3.4,base-alto-2.6);ctx.lineTo(cx+s*4.2,base-alto+0.5);ctx.fill();}
    ctx.fillStyle='#ff8fa8';ctx.fillRect(q(cx-3.6),q(base-alto-1),1,1);ctx.fillRect(q(cx+3),q(base-alto-1),1,1);}
  if(ciclo>=8&&ciclo<12){ctx.strokeStyle=REM_COL.tinta;ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(cx-f*6,base-6);ctx.quadraticCurveTo(cx-f*11,base-8,cx-f*10,base-13);ctx.stroke();
    ctx.strokeStyle=REM_COL.pelo;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(cx-f*6,base-6);ctx.quadraticCurveTo(cx-f*11,base-8,cx-f*10,base-13);ctx.stroke();}
  REM_trompo(cx,base,alto,REM_COL,fase);
  if((T>>1)%3!==0){ctx.strokeStyle='#ffffff';ctx.lineWidth=0.9;
    for(let i=0;i<3;i++){const y=base-alto*0.62+i*2.6,x0=cx+f*7;ctx.beginPath();ctx.moveTo(x0,y);ctx.lineTo(x0+f*5,y-2.2);ctx.stroke();}}
  // estrellita que gira alrededor de vez en cuando
  if(T%30<10){const a=T*0.4,sx=cx+Math.cos(a)*10,sy=base-alto*0.5+Math.sin(a)*3;ctx.fillStyle='#ffe066';ctx.fillRect(q(sx-1.5),q(sy-0.5),3,1);ctx.fillRect(q(sx-0.5),q(sy-1.5),1,3);}
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
// ángel: cuando va a arañar un dron, remolino blanco y celeste con la aureola girando arriba
function REM_angel(g){
  if(g.st!=='angel'||!g.tgt)return false;
  const cx=g.x+6,base=g.y+10,alto=13;
  ctx.fillStyle='rgba(255,246,200,0.22)';circle(cx,base-7,11);
  REM_trompo(cx,base,alto,REM_ANGEL,T*1.0);
  const a=T*0.35,hx=cx+Math.sin(a)*1.2;ctx.strokeStyle='#ffd84a';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(hx,base-alto-3,4.5,1.2+Math.abs(Math.sin(a))*0.4,0,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle='#fff6c8';ctx.fillRect(q(hx+Math.cos(a*2)*4.5-0.5),q(base-alto-3.5),1,1);
  return true;
}
