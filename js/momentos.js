'use strict';
// Óxido · MOMENTOS de los guiños de las misiones 1, 2 y 3 (uno por misión, de 4 a 8 s, que se entienden sin texto)
// Los guiños de siempre siguen en guinos.js; acá va el momento grande que se ve sí o sí, como en las misiones 4 a 10.
// Sin nombres, logos, personajes, frases ni música de películas: solo el lenguaje general.
//   M1 · del fuego sale un robot esqueleto GRANDE (2 veces un soldado), el ojo se prende fuerte, pisa una chapa
//        al avanzar, aguanta muchos tiros y al morir se arrastra con el torso antes de apagarse.
//   M2 · la aleta viene al muelle en primer plano (golpe grave que sube de volumen, burbujas, el muelle tiembla),
//        salta con una mandíbula de chapa y se lleva un pedazo: queda un hueco para saltar. Nadie se lastima en el
//        mordiscón; caer al hueco cuesta 1 corazón y te deja del otro lado.
//   M3 · la primera vez que aparece el cazador, tres puntitos rojos se juntan sobre el jugador (un triángulo que se
//        cierra); el cazador se ve entero un momento con un brillo, mira y vuelve a desaparecer.
// Ganchos: MO_frena (juego.js: la cámara no avanza mientras es > 0) y MO_enPozo (mundo.js: land() sin piso en el hueco).
// Prefijo MO_.
let MO_frena=0,MO_pozos=[];
const MO={m1:null,m2:null,m3:null,hecho:{}};
ON_START.push(()=>{MO_frena=0;MO_pozos=[];MO.m1=MO.m2=MO.m3=null;MO.hecho={};MO_restos.length=0;MO_fila.length=0;});
// ¿el objeto está sobre un hueco del muelle? (jugadores, el Grillo y los enemigos; los amigos y premios no caen)
function MO_enPozo(o){
  if(!MO_pozos.length)return false;
  if(!(players.includes(o)||mechs.includes(o)||(enemies.includes(o)&&!isBoss(o))))return false;
  const cx=o.x+(o.w||8)/2;
  for(const z of MO_pozos)if(cx>z.x0+1&&cx<z.x1-1)return true;
  return false;
}
// ¿hay un momento en pantalla? (M1 hasta que el robot terminó de salir del fuego; M2 y M3 enteros; o el cartel de jefe)
const MO_activo=()=>!!((MO.m1&&MO.m1.t<200)||MO.m2||MO.m3||(typeof DIB_jefe!=='undefined'&&DIB_jefe&&DIB_jefe.t<150)); // y el cartel de jefe (dibujito.js)
// carteles y avisos que llegan durante un momento: esperan en fila y salen de a uno cuando termina
const MO_fila=[];
function MO_guarda(k,a,b,c){if(!MO_activo()||MO_soltando)return false;MO_fila.push([k,a,b,c]);if(MO_fila.length>4)MO_fila.shift();return true;}
let MO_soltando=false;
function MO_soltar(){
  if(MO_activo()||!MO_fila.length)return;
  if(MO_fila[0][0]==='b'&&banner&&banner.t>0)return;
  const [k,a,b]=MO_fila.shift();if(k==='b'){MO_soltando=true;try{setBanner(a,b);}finally{MO_soltando=false;}}else toasts.push(a); // 't': el aviso ya armado
}
// al empezar un momento, el cartel que estaba a la vista se guarda con lo que le quedaba
function MO_guardaVisible(){if(banner&&banner.t>20){MO_fila.unshift(['b',banner.s,banner.t]);banner=null;}}
const MO_ruido=(d,v,f)=>{try{noise(d,v,f);}catch(e){}};
const MO_tono=(t,a,b,d,v)=>{try{tone(t,a,b,d,v);}catch(e){}};

// ================== M1 · el robot esqueleto grande ==================
const MO_restos=[];
function MO_m1Start(){
  const x=Math.round(camX+VW-52);
  MO_guardaVisible();MO.m1={t:0,fx:x,chapa:{x:x-38,rota:false}};MO.hecho.m1=true;MO_frena=150;
  const e={type:'endoG',x:x+4,y:GROUND-36,w:14,h:36,hp:30,max:30,face:-1,flash:0,score:1500,st:'fuego',t:0,ph:0,dist:0,vx:0,
    onGround:true,lean:0,rec:0,cd:120,stepT:0,upd:MO_updRobot,draw:MO_drawRobot,onKill:MO_killRobot};
  e.hp=e.max=Math.max(12,Math.round(30*DIFF().ehp));
  enemies.push(e);MO.m1.e=e;
  MO_ruido(0.6,0.25,900);MO_tono('sawtooth',90,40,0.5,0.05); // fogonazo
}
function MO_updRobot(e){
  e.t++;const m=MO.m1;
  if(e.st==='fuego'){if(e.t===70){MO_tono('square',880,1320,0.25,0.06);MO_tono('sine',110,60,0.4,0.12);shake=Math.max(shake,3);}
    if(e.t>=100){e.st='camina';e.t=0;}return;}
  const p=GU_near(e.x+7,e.y+18),pc=p&&!p.dead?pCenter(p):null;
  if(pc)e.face=pc.x<e.x+7?-1:1;
  const lejos=pc?Math.abs(pc.x-(e.x+7))>14:false;
  e.vx=lejos?e.face*0.24:0;e.x+=e.vx;e.x=Math.max(e.x,camX-10);
  if(e.vx){e.dist+=Math.abs(e.vx)*0.5;if(++e.stepT%34===0){MO_ruido(0.09,0.12,300);MO_tono('square',70,50,0.06,0.04);shake=Math.max(shake,1.2);dust(e.x+7,GROUND,3);}}
  // pisa la chapa: crujido de metal, chispas y un temblor
  if(m&&m.chapa&&!m.chapa.rota&&Math.abs(e.x+7-(m.chapa.x+8))<5){m.chapa.rota=true;MO_ruido(0.3,0.3,2200);MO_tono('square',300,90,0.2,0.05);shake=Math.max(shake,3);
    for(let i=0;i<10;i++)parts.push({k:'p',x:m.chapa.x+8,y:GROUND-2,vx:rand(-1.6,1.6),vy:rand(-2.6,-0.8),g:0.18,life:rand(18,30),maxl:30,size:1,col:i%2?'#ffd25a':'#c9d2dc'});}
  // tiro: tres balas lentas desde el ojo
  if(pc&&--e.cd<=0){const n=e.burst=(e.burst||0)+1;const ex=e.x+7+e.face*5,ey=e.y+7,a=Math.atan2(pc.y-ey,pc.x-ex);
    eproj.push({kind:'bullet',x:ex,y:ey,vx:Math.cos(a)*1.9,vy:Math.sin(a)*1.9,r:1.8});SFX.shoot&&SFX.shoot();
    if(n<3)e.cd=10;else{e.burst=0;e.cd=Math.round(rand(110,150)*DIFF().fire);}}
  // de cerca, empuja y lastima
  for(const q of players)if(!q.dead&&!q.ride&&overlap(hurtbox(q),{x:e.x+2,y:e.y+4,w:e.w-4,h:e.h-4}))withP(q,()=>hurtPlayer(1));
}
function MO_eyeXY(e){return{x:e.x+7+(e.face>0?5:-7),y:e.y+7};}
function MO_drawRobot(e){
  const fx=e.x+7,fy=e.y+36,set=e.flash?SPR.w:GU_ENDO,f=e.face>0?0:1;
  let a=1;if(e.st==='fuego')a=clamp((e.t-15)/50,0,1);
  ctx.save();ctx.globalAlpha=a;
  if(e.st==='fuego'&&e.t<70)ctx.filter='brightness(0.25)'; // en las llamas: solo la silueta oscura
  ctx.translate(fx,fy);ctx.scale(2,2);
  const pose=e.st==='fuego'?{leg:'idle',ux:0,uy:0}:rigPose({...e,onGround:true,vx:e.vx},e.ph);
  drawRig(set,pose,f,-7,-18);ctx.restore();ctx.filter='none';
  // ojo: se prende fuerte a los 70 cuadros y queda latiendo
  const on=e.st!=='fuego'||e.t>=70,ey=MO_eyeXY(e);
  if(on){const k=e.st==='fuego'?clamp((e.t-70)/6,0,1):0.75+0.25*Math.sin(T/6);
    ctx.fillStyle=`rgba(255,50,30,${0.35*k})`;circle(ey.x+1,ey.y,6*k+2);
    ctx.fillStyle=`rgba(255,90,60,${0.8*k})`;circle(ey.x+1,ey.y,2.4);ctx.fillStyle='#fff4e0';circle(ey.x+1,ey.y,0.9);}
}
function MO_killRobot(e){
  MO_restos.push({x:e.x,face:e.face,t:0});
  explodeFx(e.x+7,e.y+24,12);SFX.down();shake=Math.max(shake,4);
  for(let i=0;i<14;i++)parts.push({k:'p',x:e.x+7,y:e.y+14,vx:rand(-2,2),vy:rand(-3.4,-1),g:0.18,life:rand(26,44),maxl:44,size:i%3?1:2,col:i%2?'#c9d2dc':'#ffb040'});
  pickups.push({kind:pick(['H','R','+']),x:e.x+2,y:e.y+10,w:10,h:10,vy:-2.5,life:700});
}
// el torso que se arrastra: avanza a tirones con un brazo y se apaga
function MO_updRestos(){
  for(const r of MO_restos){r.t++;
    if(r.t<150){const p=GU_near(r.x,GROUND),dir=p&&!p.dead&&p.x<r.x?-1:1;r.face=dir;
      if(r.t%24<12){r.x+=dir*0.35;if(r.t%24===1)MO_ruido(0.06,0.06,500);}}
    if(r.t===150){MO_tono('square',220,40,0.5,0.05);for(let i=0;i<6;i++)spark(r.x+7,GROUND-4,'#ff6a4a');}}
  for(let i=MO_restos.length;i--;)if(MO_restos[i].t>200)MO_restos.splice(i,1);
}
function MO_drawRestos(){
  for(const r of MO_restos){
    const fc=r.face,set=GU_ENDO,x=r.x+7,g=GROUND;
    // piernas tiradas donde cayó
    // torso y cabeza acostados en el piso (el sprite de arriba, girado), un brazo que tira hacia adelante
    ctx.save();ctx.translate(x,g-4);ctx.rotate(fc>0?Math.PI/2:-Math.PI/2);ctx.scale(1.6,1.6);
    ctx.drawImage(set.up[0],-7,-6);ctx.restore();
    const reach=r.t%24<12?(r.t%24)/12:1-(r.t%24-12)/12;
    ctx.fillStyle='#8e98a4';ctx.fillRect(q(x+fc*(10+reach*4)),q(g-3),fc>0?-8:8,1.6);ctx.fillStyle='#3c434e';ctx.fillRect(q(x+fc*(12+reach*4)),q(g-3.5),1.6,2.6);
    // ojo: titila y se apaga
    const ex=x+fc*13,on=r.t<150?(r.t>110?(T>>2)%2:1):0;
    if(on){ctx.fillStyle='rgba(255,50,30,0.4)';circle(ex,g-6,3.4);ctx.fillStyle='#ff5a3a';circle(ex,g-6,1.2);}
    else if(r.t<170){ctx.fillStyle='rgba(120,120,120,0.5)';circle(ex,g-6,1);}
  }
}
// fuego del piso (dibujo y chispas) y la chapa
function MO_drawM1(){
  const m=MO.m1;if(!m)return;
  const k=m.t<20?m.t/20:m.t>520?Math.max(0,1-(m.t-520)/60):1;
  if(k>0){const x0=m.fx-6,w=34;
    for(let i=0;i<9;i++){const h=(10+hash(i*7+(T>>2))*14)*k,x=x0+i*w/9+Math.sin(T/5+i)*1.2;
      ctx.fillStyle=i%2?'rgba(255,120,30,0.85)':'rgba(255,190,60,0.85)';
      ctx.beginPath();ctx.moveTo(x,GROUND);ctx.lineTo(x+2+Math.sin(T/3+i)*1.5,GROUND-h);ctx.lineTo(x+5,GROUND);ctx.fill();}
    ctx.fillStyle=`rgba(255,240,170,${0.7*k})`;ctx.fillRect(x0,GROUND-3,w,3);
    if(m.t%3===0)parts.push({k:'fire',x:x0+rand(0,w),y:GROUND-rand(2,10),vx:rand(-0.2,0.2),vy:rand(-1,-0.4),life:rand(14,24),maxl:24,size:rand(1.5,3)});}
  const c=m.chapa;if(c){ctx.fillStyle='#120c18';ctx.fillRect(c.x-0.5,GROUND-(c.rota?1.5:4)-0.5,17,(c.rota?1.5:4)+0.5);
    ctx.fillStyle=c.rota?'#7d8794':'#9aa4ae';if(c.rota)ctx.fillRect(c.x,GROUND-1.5,16,1.5);
    else{ctx.beginPath();ctx.moveTo(c.x,GROUND);ctx.lineTo(c.x+3,GROUND-4);ctx.lineTo(c.x+13,GROUND-3);ctx.lineTo(c.x+16,GROUND);ctx.fill();ctx.fillStyle='#c9d2dc';ctx.fillRect(c.x+4,GROUND-3.5,8,0.8);}}
}

// ================== M2 · la aleta se lleva el muelle ==================
const MO_HUECO={x0:1000,x1:1028};
function MO_m2Start(){MO_guardaVisible();MO.m2={t:0,fx:camX+VW+24};MO.hecho.m2=true;MO_frena=380;}
function MO_updM2(){
  const m=MO.m2;if(!m)return;m.t++;const t=m.t,cx=(MO_HUECO.x0+MO_HUECO.x1)/2;
  // 0–200: viene la aleta por delante del muelle; golpe grave (el mismo, cada vez más fuerte); burbujas
  if(t<200){m.fx+=(cx-m.fx)*0.022;if(t%44===8)MO_tono('sine',62,40,0.28,0.05+0.14*t/200);}
  if(t>=110&&t<240&&t%5===0)parts.push({k:'ring',x:cx+rand(-10,10),y:GROUND+3,r:0.5,max:3,life:16,maxl:16,col:'190,220,250'});
  if(t>=150&&t<240&&t%9===0)MO_ruido(0.05,0.05,700); // el muelle cruje
  if(t===230)MO_tono('sine',50,30,0.5,0.22);
  // 245: mordiscón. Se abre el hueco; el que estaba encima salta hacia atrás sin lastimarse
  if(t===245){MO_pozos.push({...MO_HUECO});MO_ruido(0.5,0.35,1400);MO_tono('square',160,50,0.3,0.06);shake=Math.max(shake,6);
    for(const p of players){if(p.dead)continue;const o=p.ride||p,ocx=o.x+(o.w||8)/2;
      if(ocx>MO_HUECO.x0-6&&ocx<MO_HUECO.x1+6){o.x=MO_HUECO.x0-6-(o.w||8);o.vy=-3;o.onGround=false;}}
    for(let i=0;i<16;i++)parts.push({k:'p',x:cx+rand(-14,14),y:GROUND-1,vx:rand(-1.8,1.8),vy:rand(-4,-1.5),g:0.2,life:rand(30,50),maxl:50,size:i%3?1.5:2.5,col:i%2?'#262b33':'#5a616c'});
    GU_sfx('splash');}
  if(t===292)GU_sfx('splash');
  if(t>=380)MO.m2=null;
}
function MO_drawMandibula(x,y,abre,dir){
  // mandíbula de chapa: dos placas remachadas con dientes, se abre "abre" (0–1)
  ctx.save();ctx.translate(x,y);ctx.scale(dir,1);
  const g=abre*0.9;
  for(const s of[-1,1]){ctx.save();ctx.rotate(s*g*0.5);
    ctx.fillStyle='#2c3644';ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(16,s*1);ctx.lineTo(10,s*9);ctx.lineTo(-10,s*8);ctx.fill();
    ctx.fillStyle='#4a5868';ctx.fillRect(-9,s>0?6:-8,16,2);
    ctx.fillStyle='#c9a43a';for(let i=0;i<4;i++)ctx.fillRect(-7+i*5,s>0?7:-7,1,1);               // remaches
    ctx.fillStyle='#f2f2f2';for(let i=0;i<6;i++){ctx.beginPath();const bx=-6+i*3.6;ctx.moveTo(bx,s*1);ctx.lineTo(bx+1.6,s*(-2.6));ctx.lineTo(bx+3.2,s*1);ctx.fill();}
    ctx.fillStyle='#8a5a3a';ctx.fillRect(4,s>0?3:-4,3,1);ctx.restore();}
  ctx.fillStyle='#ff4a3a';ctx.fillRect(9,-9,1.6,1.6);ctx.restore();
}
function MO_drawM2(){
  const m=MO.m2,t=m?m.t:999,cx=(MO_HUECO.x0+MO_HUECO.x1)/2;
  // el hueco (queda para siempre en esta pasada)
  if(MO_pozos.length){const z=MO_pozos[0];
    ctx.fillStyle='#0b1628';ctx.fillRect(z.x0,GROUND,z.x1-z.x0,H-GROUND);
    ctx.fillStyle='rgba(120,160,210,0.35)';for(let i=0;i<4;i++)ctx.fillRect(q(z.x0+2+((T*0.3+i*7)%(z.x1-z.x0-4))),q(GROUND+9+Math.sin(T/9+i)),3,0.7);
    ctx.fillStyle='#262b33';for(let i=0;i<4;i++){const y=GROUND+i*3;ctx.fillRect(z.x0-0.5,y,1.5+hash(i)*2,2);ctx.fillRect(z.x1-1-hash(i+9)*2,y,1.5+hash(i+9)*2,2);}
    // tablones rotos que quedan para arriba en los dos bordes (así el hueco se ve aunque el muelle esté al pie de la pantalla)
    for(const[x,s]of[[z.x0,1],[z.x1,-1]]){ctx.fillStyle='#120c18';ctx.beginPath();ctx.moveTo(x-s*4,GROUND+0.5);ctx.lineTo(x+s*0.5,GROUND-5.5);ctx.lineTo(x+s*1.6,GROUND+0.5);ctx.fill();
      ctx.fillStyle='#5a616c';ctx.beginPath();ctx.moveTo(x-s*3,GROUND);ctx.lineTo(x+s*0.3,GROUND-4.5);ctx.lineTo(x+s*1,GROUND);ctx.fill();
      ctx.fillStyle='#c9a43a';ctx.fillRect(q(x-s*2.4),q(GROUND-1.6),1.2,0.8);}
    // salpica de vez en cuando, para que se note que abajo hay agua
    const sp=T%70;if(sp<14){ctx.fillStyle=`rgba(200,225,250,${0.7-sp/20})`;for(let i=0;i<4;i++)ctx.fillRect(q((z.x0+z.x1)/2+(i-1.5)*4),q(GROUND+4-sp*0.7+sp*sp*0.05),1,1);}}
  if(!m)return;
  // grietas y temblor del muelle donde va a morder
  if(t>=150&&t<245){const sh=(T%4<2?0.5:-0.5)*(t-150)/95;ctx.strokeStyle='rgba(18,12,24,0.8)';ctx.lineWidth=0.6;ctx.beginPath();
    ctx.moveTo(cx-8+sh,GROUND);ctx.lineTo(cx-3+sh,GROUND+3);ctx.lineTo(cx+2,GROUND+1);ctx.moveTo(cx+6-sh,GROUND);ctx.lineTo(cx+9,GROUND+4);ctx.stroke();
    if((T>>3)%2){ctx.fillStyle='rgba(255,90,60,0.25)';ctx.fillRect(MO_HUECO.x0,GROUND,MO_HUECO.x1-MO_HUECO.x0,1.5);}}
  // aleta en primer plano, delante del muelle: crece al acercarse
  if(t<235){const k=0.6+0.7*Math.min(1,t/200),sink=t>200?(t-200)/35:0,h=20*k*(1-sink),x=m.fx,y=GROUND+9,bob=Math.sin(T/10)*0.7;
    if(h>0.5){ctx.fillStyle='#120c18';ctx.beginPath();ctx.moveTo(x+8*k+1,y+bob);ctx.lineTo(x-3*k,y-h-1+bob);ctx.lineTo(x-9*k-1,y+bob);ctx.fill();
      ctx.fillStyle='#2c3644';ctx.beginPath();ctx.moveTo(x+8*k,y+bob);ctx.lineTo(x-3*k,y-h+bob);ctx.lineTo(x-9*k,y+bob);ctx.fill();
      ctx.fillStyle='#4a5868';ctx.beginPath();ctx.moveTo(x-3*k,y-h+bob);ctx.lineTo(x-1*k,y-h*0.4+bob);ctx.lineTo(x-6*k,y-h*0.2+bob);ctx.fill();
      ctx.fillStyle='#8a5a3a';ctx.fillRect(q(x-1),q(y-h*0.45+bob),1.2,1.2);ctx.fillStyle='#c9a43a';ctx.fillRect(q(x+1),q(y-h*0.25+bob),0.9,0.9);}
    ctx.fillStyle='rgba(200,225,250,0.6)';for(let i=1;i<6;i++)ctx.fillRect(q(x+8*k+i*5),q(GROUND-0.5-Math.sin(T/6+i)*0.6),4-i*0.6,1);
    ctx.fillRect(q(x-9*k-2),q(GROUND-1),18*k+4,1);}
  // salto con la mandíbula: sube por el hueco, cierra arriba y vuelve al agua
  if(t>=238&&t<300){const k=(t-238)/62,y=GROUND+14-Math.sin(k*Math.PI)*52,abre=t<256?1:t<262?1-(t-256)/6:0;
    MO_drawMandibula(cx,y,abre,-1);
    if(t>=258){ctx.fillStyle='#262b33';ctx.fillRect(q(cx-6),q(y+5),12,2.5);ctx.fillStyle='#c9a43a';ctx.fillRect(q(cx-3),q(y+5.6),5,0.7);} // se lleva el pedazo
  }
  for(const[t0,x0]of[[238,cx],[292,cx]]){const dt=t-t0;if(dt<0||dt>20)continue;ctx.fillStyle=`rgba(220,235,250,${0.75-dt/28})`;
    for(let i=0;i<7;i++)ctx.fillRect(q(x0+(i-3)*3),q(GROUND-dt*0.9*(1+Math.abs(i-3)*0.25)+dt*dt*0.06),1.2,1.2);}
}
// caer al hueco: 1 corazón y del otro lado (el Grillo también); los enemigos que caen se pierden
function MO_caidas(){
  if(!MO_pozos.length)return;const z=MO_pozos[0];
  for(const p of players){if(p.dead)continue;const o=p.ride||p;
    if(o.y+o.h>GROUND+5){GU_sfx('splash');for(let i=0;i<8;i++)parts.push({k:'p',x:(z.x0+z.x1)/2+rand(-6,6),y:GROUND+2,vx:rand(-1,1),vy:rand(-2.6,-1),g:0.15,life:24,maxl:24,size:1,col:'#cfe2f6'});
      o.x=z.x1+4;o.y=GROUND-o.h;o.vy=0;o.onGround=true;if(p.ride){p.x=o.x+7;p.y=o.y+8;}
      withP(p,()=>{const inv=p.inv;p.inv=0;hurtPlayer(1);if(!p.dead)p.inv=Math.max(p.inv,90,inv);});}}
  for(const e of enemies)if(!e.gone&&e.y>GROUND+10&&!isBoss(e))e.gone=true;
}
// el fondo deja de mostrar la aleta mientras dura el momento (es la misma)
{const bg0=LEVELS[1].drawBG;LEVELS[1].drawBG=function(){if(MO.m2&&MO.m2.t<300){const f=GU_fin,x=f.x;f.x=-9999;try{bg0();}finally{f.x=x;}}else bg0();};}

// ================== M3 · el cazador se deja ver ==================
function MO_m3Start(e){MO_guardaVisible();const p=GU_near(e.x,e.y);MO.m3={t:0,e,p};MO.hecho.m3=true;e.cd=9999;e.st='hide';}
function MO_updM3(){
  const m=MO.m3;if(!m)return;m.t++;const t=m.t,e=m.e;
  if(e.gone||!m.p||m.p.dead){if(!e.gone)e.cd=60;MO.m3=null;return;}
  e.st=e.st==='leap'?'leap':'hide';e.cd=9999;
  if(t%22===0&&t<110)MO_tono('square',1800,1800,0.02,0.015);       // tic de las miras
  if(t===110)MO_tono('square',2200,2200,0.12,0.03);                  // se cierran
  if(t===130){e.rev=110;for(let i=0;i<10;i++)spark(e.x+rand(0,9),e.y+rand(0,20),i%2?'#9fe8ff':'#ffffff');MO_tono('sine',400,900,0.25,0.04);}
  if(t>=130&&t<240){const pc=pCenter(m.p);e.face=pc.x<e.x+4?-1:1;}
  if(t>=240){e.rev=0;e.cd=Math.round(rand(70,100)*DIFF().fire);MO.m3=null;}
}
function MO_drawM3(){
  const m=MO.m3;if(!m)return;const t=m.t;
  if(t<130){const pc=pCenter(m.p),k=Math.min(1,t/110),r=46*(1-k)+1,rot=t*0.02;
    for(let i=0;i<3;i++){const a=-Math.PI/2+i*Math.PI*2/3+rot,x=pc.x+Math.cos(a)*r,y=pc.y+Math.sin(a)*r;
      ctx.fillStyle='rgba(255,40,30,0.35)';circle(x,y,2.2);ctx.fillStyle='#ff2a1a';ctx.fillRect(q(x-0.9),q(y-0.9),1.8,1.8);}
    if(t>=110&&(T>>1)%2){ctx.strokeStyle='rgba(255,40,30,0.7)';ctx.lineWidth=0.6;ctx.beginPath();ctx.arc(pc.x,pc.y,4,0,7);ctx.stroke();}}
  // el brillo del cazador al hacerse visible
  if(t>=126&&t<150){const e=m.e,a=1-(t-126)/24;ctx.fillStyle=`rgba(220,245,255,${0.6*a})`;circle(e.x+4.5,e.y+10,8+(t-126)*0.8);}
}

// ================== disparadores ==================
ON_STEP.push(()=>{
  if(MO_frena>0)MO_frena--;
  MO_soltar();
  if(levelIdx===0){
    if(!MO.hecho.m1&&!lock&&camX>=900&&state==='play'&&T>200)MO_m1Start();
    if(MO.m1)MO.m1.t++;
    MO_updRestos();
  }else if(levelIdx===1){
    if(!MO.hecho.m2&&!lock&&camX+VW>MO_HUECO.x1+48&&state==='play')MO_m2Start();
    MO_updM2();MO_caidas();
  }else if(levelIdx===2){
    if(!MO.hecho.m3){const e=enemies.find(o=>o.type==='stalker'&&!o.gone&&o.st==='hide'&&onScreen(o,-4));if(e)MO_m3Start(e);}
    MO_updM3();
  }
});
ON_DRAW.push(()=>{if(levelIdx===0){MO_drawM1();MO_drawRestos();}else if(levelIdx===1)MO_drawM2();else if(levelIdx===2)MO_drawM3();});
if(typeof KILL_NAMES!=='undefined')KILL_NAMES.push(['endoG','robots grandes']);
