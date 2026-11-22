'use strict';
// Óxido · Misión 8: jefe chico (TOPADOR) y villano (PISATRUENO). Prefijo J8_ en todo lo global.
// Usa de mision8.js: M8_thump (temblor y charcos), M8_mkGig / M8_drawGigante / M8_gigHead / M8_gigWalk (el gigante), M8_pc.

const J8_sfx=(n,...a)=>{if(typeof SFX!=='undefined'&&SFX[n])SFX[n](...a);};
const J8_pc=p=>M8_pc(p);
function J8_surf(x,y){let s=GROUND;for(const pl of platforms)if(x>pl.x+1&&x<pl.x+pl.w-1&&pl.y>=y-1&&pl.y<s)s=pl.y;return s;}
function J8_hurtRect(r){eachPlayer(p=>{if(!p.dead&&overlap(hurtbox(),r))hurtPlayer(1);});}

// ---------- proyectiles comunes ----------
// piedra que cae de arriba: la sombra en el piso avisa dónde (se puede reventar a tiros)
function J8_roca(x,delay,placa){eproj.push({kind:'j8Roca',x,y:-14,vy:0,t:-(delay||0),r:3,placa:!!placa,rot:rand(0,6),upd:J8_rocaUpd,draw:J8_rocaDraw});}
function J8_rocaUpd(o,hb){
  o.t++;if(o.t<0)return;
  o.vy=Math.min(o.vy+0.06,2.6);o.y+=o.vy;o.rot+=0.08;
  if(o.y<0)return;
  if(coverBlocks(o)){o.gone=true;J8_polvo(o.x,o.y,5);return;}
  if(hb&&overlapPt(hb,o.x,o.y,o.r)){o.gone=true;hurtPlayer(1);J8_polvo(o.x,o.y,6);return;}
  const s=J8_surf(o.x,o.y-o.vy);if(o.y>=s-2){o.gone=true;J8_polvo(o.x,s-1,7);dust(o.x,s,3);J8_sfx(o.placa?'m8placa':'m8piedra');}
}
function J8_polvo(x,y,n){for(let i=0;i<n;i++)parts.push({k:'p',x,y,vx:rand(-1.3,1.3),vy:rand(-1.8,-0.3),g:0.12,life:rand(14,24),maxl:24,size:1,col:pick(['#6a6a58','#8a7a5a','#4a4034'])});}
function J8_rocaDraw(o){
  const s=J8_surf(o.x,Math.max(0,o.y)),d=s-Math.max(o.y,-14),k=clamp(1-d/170,0.15,1),on=(T>>2)%2;
  ctx.fillStyle=`rgba(20,14,8,${0.25+0.35*k})`;ctx.beginPath();ctx.ellipse(o.x,s,3+4*k,1+0.6*k,0,0,7);ctx.fill();
  if(on){ctx.fillStyle=`rgba(255,120,60,${0.35+0.4*k})`;ctx.fillRect(o.x-0.5,s-2.5,1,2);}
  if(o.y<-6)return;
  ctx.save();ctx.translate(q(o.x),q(o.y));ctx.rotate(o.rot);
  if(o.placa){ctx.fillStyle='#5a2814';ctx.fillRect(-4.5,-2.5,9,5);ctx.fillStyle='#9c4a22';ctx.fillRect(-4,-2,8,4);ctx.fillStyle='#d8742a';ctx.fillRect(-4,-2,8,0.8);ctx.fillStyle='#9aa0a8';ctx.fillRect(-2.5,-0.5,1,1);ctx.fillRect(1.5,-0.5,1,1);}
  else{ctx.fillStyle='#333a30';ctx.beginPath();ctx.moveTo(-3.5,-1);ctx.lineTo(-1,-3.5);ctx.lineTo(3,-2.5);ctx.lineTo(3.6,1.5);ctx.lineTo(0,3.4);ctx.lineTo(-3,2);ctx.fill();
    ctx.fillStyle='#6a7262';ctx.fillRect(-2,-2.4,3,1.2);ctx.fillStyle='rgba(74,122,42,0.8)';ctx.fillRect(0,-3,2,0.8);}
  ctx.restore();
}
// onda de tierra a ras del piso: hay que saltarla
function J8_onda(x,dir,sp,A){eproj.push({kind:'j8Onda',x,y:GROUND,dir,sp,A,t:0,upd:J8_ondaUpd,draw:J8_ondaDraw});}
function J8_ondaUpd(o,hb){
  o.t++;o.x+=o.dir*o.sp;
  if(o.t%3===0)parts.push({k:'p',x:o.x,y:GROUND-2,vx:-o.dir*rand(0.2,0.8),vy:rand(-1.8,-0.8),g:0.14,life:14,maxl:14,size:1,col:pick(['#6a6a58','#3a4a22','#8a6a44'])});
  if(hb&&hb.y+hb.h>GROUND-6&&o.x>hb.x-2&&o.x<hb.x+hb.w+2){hurtPlayer(1);o.gone=true;return;}
  if(o.x<o.A+2||o.x>o.A+W-2)o.gone=true;
}
function J8_ondaDraw(o){
  const x=q(o.x),d=o.dir;ctx.fillStyle='rgba(30,20,10,0.45)';ctx.fillRect(x-7,GROUND-1,14,1.2);
  ctx.fillStyle='#4a4034';ctx.beginPath();ctx.moveTo(x-7*d,GROUND);ctx.quadraticCurveTo(x-1*d,GROUND-8,x+4*d,GROUND);ctx.fill();
  ctx.fillStyle='#3a5a22';ctx.beginPath();ctx.moveTo(x-5*d,GROUND-1);ctx.quadraticCurveTo(x-1*d,GROUND-7,x+2*d,GROUND-2);ctx.lineTo(x,GROUND-1);ctx.fill();
  ctx.fillStyle='#8a9478';ctx.fillRect(x-1,GROUND-6,1.5,1);ctx.fillRect(x+2*d,GROUND-4,1,1);
}
// proyectil en arco hacia una marca del piso (piedra del TOPADOR o tornillo del PISATRUENO); se puede reventar a tiros
function J8_arco(x,y,tx,metal){
  const Tt=52,g=0.12,ty=J8_surf(tx,0);
  eproj.push({kind:'j8Arco',x,y,tx,ty,vx:(tx-x)/Tt,vy:(ty-y-0.5*g*Tt*Tt)/Tt,g,r:2.6,t:0,metal:!!metal,rot:0,upd:J8_arcoUpd,draw:J8_arcoDraw});
}
function J8_arcoUpd(o,hb){
  o.t++;o.vy+=o.g;o.x+=o.vx;o.y+=o.vy;o.rot+=0.2;
  if(coverBlocks(o)){o.gone=true;J8_polvo(o.x,o.y,5);return;}
  if(hb&&overlapPt(hb,o.x,o.y,o.r)){o.gone=true;hurtPlayer(1);J8_polvo(o.x,o.y,6);return;}
  if(o.y>=o.ty-2&&o.vy>0){o.gone=true;
    if(o.metal)explodeFx(o.x,o.ty-3,11);else{J8_polvo(o.x,o.ty-1,9);dust(o.x,o.ty,4);J8_sfx('m8piedra');}
    eachPlayer(p=>{if(p.dead)return;const h=hurtbox();if(Math.abs(h.x+h.w/2-o.x)<(o.metal?12:9)&&h.y+h.h>o.ty-14)hurtPlayer(1);});}
  if(o.t>220)o.gone=true;
}
function J8_marca(x,y,on,metal){
  ctx.strokeStyle=on?(metal?'#ff7a3a':'#ffd070'):'rgba(255,170,80,0.45)';ctx.lineWidth=0.8;ctx.beginPath();ctx.ellipse(x,y,7,1.6,0,0,7);ctx.stroke();
  ctx.fillStyle=on?(metal?'#ff7a3a':'#ffd070'):'rgba(255,170,80,0.45)';ctx.fillRect(x-0.5,y-4,1,3);
}
function J8_arcoDraw(o){
  J8_marca(o.tx,o.ty,(T>>2)%2,o.metal);
  ctx.save();ctx.translate(q(o.x),q(o.y));ctx.rotate(o.rot);
  if(o.metal){ctx.fillStyle='#2a2c32';ctx.fillRect(-3,-1.6,6,3.2);ctx.fillStyle='#9aa0a8';ctx.fillRect(-2.6,-1.2,5.2,2.4);ctx.fillStyle='#5a5e66';ctx.fillRect(-3,-2.4,2,4.8);
    ctx.fillStyle=(T>>1)%2?'#ff9a3a':'#ffd060';ctx.fillRect(1.4,-0.5,1,1);}
  else{ctx.fillStyle='#333a30';ctx.beginPath();ctx.moveTo(-3,-1);ctx.lineTo(-1,-3);ctx.lineTo(3,-2);ctx.lineTo(3,1.4);ctx.lineTo(0,3);ctx.lineTo(-2.6,1.8);ctx.fill();ctx.fillStyle='#6a7262';ctx.fillRect(-1.6,-2,2.6,1);}
  ctx.restore();
}
function J8_marcas(px,n,A,gap){const out=[],o=rand(-8,8);for(let i=0;i<n;i++)out.push(clamp(px+o+(i-(n-1)/2)*(gap||28)+rand(-4,4),A+10,A+W-12));return out;}

// =====================================================================
// JEFE CHICO · TOPADOR — bestia acorazada de la selva, con chapas de chatarra abulonadas sobre el musgo
// Cabeza de hueso con dos cuernitos y una maza en la cola.
// Embestida (aviso: rasca el piso, resopla y baja la cabeza; se traba de dirección antes de arrancar) que termina
// contra el borde: se marea y caen piedras con su sombra. Pisotón (aviso: se para en dos patas) que levanta dos
// ondas de tierra que hay que saltar. Piedras en arco a marcas que titilan en el piso. Rabia al 50 %: embiste
// ida y vuelta y pisa dos veces.
// =====================================================================
function J8_mkTopador(A){return{type:'j8Topador',isBoss:true,A,x:A+W+30,y:GROUND-26,w:46,h:26,hp:120,max:120,state:'enter',t:0,mt:0,face:-1,flash:0,score:3500,
  mode:'walk',cd:60,seq:0,vx:0,anim:0,rear:0,head:0,dizzy:0,rage:false,charges:0,second:false,marks:null,thrown:0,tilt:0,touch:1,noPush:true,upd:J8_updTop,draw:J8_drawTop};}
function J8_updTop(b){
  b.t++;b.mt++;b.anim++;if(b.flash>0)b.flash--;
  const A=b.A,ph2=b.hp<b.max*0.5,pc=J8_pc(),cx=b.x+b.w/2,lo=A+4,hi=A+W-b.w-4;
  if(b.state==='enter'){b.x-=1.3;b.vx=-1.3;b.face=-1;if(b.t%17===0)M8_thump(0.18);if(T%4===0)dust(b.x+b.w-4,GROUND,1);
    if(b.x<=A+214){b.x=A+214;b.vx=0;b.state='intro';b.t=0;b.hp=0;J8_sfx('m8resopla');}return;}
  if(b.state==='intro'){bossIntro(b,50);b.face=pc.x<cx?-1:1;b.head=Math.min(0.6,b.t/30);if(b.t%14===0)dust(b.face>0?b.x+4:b.x+b.w-4,GROUND,2);
    if(b.state==='fight'){b.cd=40;b.mode='walk';}return;}
  if(b.state==='dying'){
    b.vx=0;b.rear*=0.9;b.tilt=Math.min(0.3,b.tilt+0.004);b.head=Math.min(1,b.head+0.02);
    if(b.t%9===0)explodeFx(b.x+rand(4,b.w-4),b.y+rand(0,b.h*0.6),rand(7,11));
    if(b.t%5===0)parts.push({k:'p',x:b.x+rand(6,b.w-6),y:b.y+rand(2,8),vx:rand(-1.6,1.6),vy:rand(-3,-1),g:0.16,life:rand(30,50),maxl:50,size:rand(1,2),col:pick(['#9c4a22','#5a5e66','#4a7a2a'])});
    if(b.t%7===0)dust(b.x+rand(0,b.w),GROUND,3);
    if(b.t===100){M8_thump(0.6);J8_sfx('m8piedra');}
    if(b.t>=140)bossDone(b);
    return;}
  if(ph2&&!b.rage){b.rage=true;setBanner('¡EL TOPADOR SE ENFURECE!',80);J8_sfx('m8resopla');shake=Math.max(shake,4);}
  if(ph2&&T%10===0)parts.push({k:'smoke',col:'230,225,210',x:b.face>0?b.x+b.w:b.x,y:b.y+8,vx:b.face*0.4,vy:-0.3,life:22,maxl:22,size:1.6});
  switch(b.mode){
  case 'walk':{
    b.face=pc.x<cx?-1:1;b.rear*=0.85;b.head*=0.85;
    const tx=clamp(pc.x<cx?pc.x+80:pc.x-80-b.w,lo,hi),sp=ph2?1.0:0.7;
    b.vx+=(clamp(tx-b.x,-sp,sp)-b.vx)*0.12;b.x+=b.vx;
    if(--b.cd<=0){
      const s=ph2?['embiste','pisa','embiste','piedras']:['embiste','pisa','piedras','embiste','pisa'];
      const a=s[b.seq++%s.length];b.mt=0;b.vx=0;
      if(a==='embiste'){b.mode='embisteT';b.charges=ph2?2:1;J8_sfx('m8resopla');}
      else if(a==='pisa'){b.mode='pisaT';b.second=false;}
      else{b.mode='piedrasT';b.marks=J8_marcas(pc.x,ph2?5:3,A);b.thrown=0;}
    }
    break;}
  case 'embisteT':{const tel=ph2?30:44;
    if(b.mt<tel-12)b.face=pc.x<cx?-1:1;            // los últimos 12 cuadros ya no cambia de dirección
    b.head=Math.min(1,b.head+0.08);b.x+=Math.sin(b.mt*1.4)*0.25;
    if(b.mt%6===0)dust(b.face>0?b.x+4:b.x+b.w-4,GROUND,2);
    if(b.mt===Math.round(tel/2))J8_sfx('m8resopla');
    if(b.mt>=tel){b.mode='embiste';b.mt=0;b.vx=b.face*(ph2?3.6:3.0);J8_sfx('m8embiste');}
    break;}
  case 'embiste':
    b.x+=b.vx;if(b.mt%3===0)dust(b.face>0?b.x:b.x+b.w,GROUND,2);if(b.mt%10===0)shake=Math.max(shake,1.4);
    if(b.x<=lo||b.x>=hi){b.x=clamp(b.x,lo,hi);b.vx=0;b.mode='choque';b.mt=0;shake=Math.max(shake,7);J8_sfx('m8piedra');M8_thump(0.7);
      const n=ph2?5:3,px=pc.x;for(let i=0;i<n;i++)J8_roca(clamp(px+(i-(n-1)/2)*34+rand(-8,8),A+12,A+W-12),i*12);
      b.charges--;}
    break;
  case 'choque':{b.head=Math.max(0,b.head-0.05);b.dizzy=1;
    const st=b.charges>0?28:(ph2?42:58);
    if(b.mt>=st){b.dizzy=0;if(b.charges>0){b.face=-b.face;b.mode='embisteT';b.mt=ph2?12:20;J8_sfx('m8resopla');}else{b.mode='walk';b.cd=ph2?45:65;}}
    break;}
  case 'pisaT':{const tel=ph2?24:36;b.face=pc.x<cx?-1:1;b.rear=Math.min(1,b.mt/tel);
    if(b.mt%8===0)J8_sfx('m8resopla');
    if(b.mt>=tel){b.mode='pisa';b.mt=0;}break;}
  case 'pisa':
    b.rear=Math.max(0,b.rear-0.3);
    if(b.mt===4){shake=Math.max(shake,5);M8_thump(0.8);const sp=ph2?2.2:1.7,fx=b.face>0?b.x+b.w-6:b.x+6;J8_onda(fx-4,-1,sp,A);J8_onda(fx+4,1,sp,A);}
    if(b.mt>=(ph2?20:36)){if(ph2&&!b.second){b.second=true;b.mode='pisaT';b.mt=10;}else{b.mode='walk';b.cd=ph2?45:60;}}
    break;
  case 'piedrasT':{const tel=ph2?24:32;b.head=Math.min(1,b.head+0.07);
    if(b.mt>=tel&&b.mt%8===0&&b.thrown<b.marks.length){const hx=b.face>0?b.x+b.w:b.x;J8_arco(hx,b.y+6,b.marks[b.thrown++],false);SFX.toss();b.head=0.2;}
    if(b.thrown>=b.marks.length&&b.mt>tel+b.marks.length*8+24){b.mode='walk';b.cd=ph2?45:60;b.marks=null;}
    break;}
  }
  b.x=clamp(b.x,A+2,A+W-b.w-2);
  bossContact(b);
}
function J8_drawTop(b){
  const fl=b.flash>0||(b.state==='dying'&&(T>>2)%2),C=c=>fl?'#fff':c,ph2=b.hp<b.max*0.5||b.state==='dying';
  const moving=Math.abs(b.vx)>0.2,run=moving?b.anim/(b.mode==='embiste'?2.5:5):0;
  const tele=b.mode==='embisteT'||b.mode==='pisaT'||b.mode==='piedrasT';
  // marcas de las piedras en arco antes de tirarlas
  if(b.mode==='piedrasT'&&b.marks)for(let i=b.thrown;i<b.marks.length;i++)J8_marca(b.marks[i],J8_surf(b.marks[i],0),(T>>2)%2,false);
  ctx.fillStyle='rgba(20,14,8,0.4)';ctx.beginPath();ctx.ellipse(b.x+b.w/2,GROUND,26,2,0,0,7);ctx.fill();
  ctx.save();ctx.translate(q(b.x+b.w/2),GROUND);if(b.face<0)ctx.scale(-1,1);
  if(b.tilt)ctx.rotate(b.tilt);
  if(b.rear>0){ctx.translate(-14,-4);ctx.rotate(-b.rear*0.42);ctx.translate(14,4);}
  const leg=(u,ph,col,front)=>{const s=run?Math.sin(run+ph)*3:0,lift=run?Math.max(0,Math.cos(run+ph))*1.6:0,up=front?b.rear*4:0;
    ctx.fillStyle=C(col);ctx.fillRect(u-3+s*0.4,-11-lift-up,7,11);ctx.fillStyle=C('#2a2014');ctx.fillRect(u-3.5+s,-2-lift-up,8,2);
    ctx.fillStyle=C('#d8d0b0');ctx.fillRect(u-3+s,-1.2-lift-up,1.4,1.2);ctx.fillRect(u+0.4+s,-1.2-lift-up,1.4,1.2);ctx.fillRect(u+3.4+s,-1.2-lift-up,1.4,1.2);};
  leg(-12,Math.PI,'#4a3e28',false);leg(12,0,'#4a3e28',true);
  // cola con maza de hueso
  const tw=Math.sin(b.anim/9)*1.5;
  ctx.fillStyle=C('#5a4a30');ctx.beginPath();ctx.moveTo(-18,-18);ctx.quadraticCurveTo(-30,-16+tw,-36,-13+tw);ctx.lineTo(-35,-9+tw);ctx.quadraticCurveTo(-28,-10,-18,-9);ctx.fill();
  ctx.fillStyle=C('#c8b890');ctx.beginPath();ctx.ellipse(-38,-11+tw,4.4,3.6,0,0,7);ctx.fill();ctx.fillStyle=C('#8a7a5a');ctx.fillRect(-41,-12+tw,1.5,1.5);ctx.fillRect(-37,-14.4+tw,1.5,1.5);
  // cuerpo
  ctx.fillStyle=C('#3e3220');ctx.beginPath();ctx.ellipse(0,-14,22,11.5,0,0,7);ctx.fill();
  ctx.fillStyle=C('#6a5a3c');ctx.beginPath();ctx.ellipse(0,-14.5,21,10.5,0,0,7);ctx.fill();
  ctx.fillStyle=C('#a89060');ctx.beginPath();ctx.ellipse(2,-8,17,4,0,0,Math.PI);ctx.fill();
  // chapas de chatarra abulonadas y musgo
  if(!fl)for(const [u,v,a,c] of [[-14,-21,0.5,'#7a4a2a'],[-5,-24.5,0.15,'#5a5e66'],[5,-24.5,-0.12,'#7a4a2a'],[14,-21,-0.45,'#5a5e66']]){
    ctx.save();ctx.translate(u,v);ctx.rotate(a);ctx.fillStyle='#2a2014';ctx.fillRect(-5,-2.6,10,5.4);ctx.fillStyle=c;ctx.fillRect(-4.6,-2.2,9.2,4.4);
    ctx.fillStyle=c==='#7a4a2a'?'#c06a34':'#9aa0a8';ctx.fillRect(-4.6,-2.2,9.2,0.8);ctx.fillStyle='#d8d0b0';ctx.fillRect(-3.4,0,1,1);ctx.fillRect(2.4,0,1,1);ctx.restore();}
  if(!fl){ctx.fillStyle='rgba(90,140,50,0.9)';ctx.fillRect(-10,-25,5,1.6);ctx.fillRect(8,-23,4,1.4);ctx.fillRect(-19,-17,3,1.2);
    ctx.fillStyle='#8a7a5a';for(const [u,v] of [[-16,-12],[-6,-10],[6,-11],[15,-13]])ctx.fillRect(u,v,1.2,1.2);}
  // cabeza: domo de hueso, cuernitos hacia adelante, pico
  ctx.save();ctx.translate(19,-15);ctx.rotate(b.head*0.4);
  ctx.fillStyle=C('#4a3e28');ctx.fillRect(-4,-3,8,8);
  ctx.fillStyle=C('#8a7a5a');ctx.beginPath();ctx.moveTo(4,1);ctx.lineTo(13,3);ctx.lineTo(12,6);ctx.lineTo(3,6);ctx.fill();   // pico
  ctx.fillStyle=C('#c8b890');ctx.beginPath();ctx.ellipse(4,-1,7.5,6.5,0,0,7);ctx.fill();   // domo
  ctx.fillStyle=C('#e0d4b0');ctx.fillRect(0,-6.5,7,1);
  ctx.fillStyle=C('#a89a74');for(const [u,v] of [[-1,-3],[3,-5],[7,-3],[1,1]])ctx.fillRect(u,v,1.4,1.4);
  ctx.fillStyle=C('#e8e0c8');ctx.beginPath();ctx.moveTo(9,-4);ctx.lineTo(15,-6);ctx.lineTo(10,-2);ctx.fill();ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(16,-1);ctx.lineTo(10,2);ctx.fill();
  const eye=b.state==='dying'?'#3a2a1a':(tele||ph2)?((T>>1)%2?'#ffe0c0':'#ff3b30'):'#ffd23a';
  ctx.fillStyle='#1a120c';ctx.fillRect(6,1,2.4,2);ctx.fillStyle=eye;ctx.fillRect(6.6,1.4,1.4,1.2);
  ctx.restore();
  leg(-9,0,'#5a4a30',false);leg(15,Math.PI,'#5a4a30',true);
  ctx.restore();
  // mareado: estrellitas que giran arriba de la cabeza
  if(b.dizzy){const hx=b.x+b.w/2+b.face*18,hy=b.y-6;for(let i=0;i<3;i++){const a=T/8+i*2.1;ctx.fillStyle=i%2?'#ffe08a':'#fff';ctx.fillRect(q(hx+Math.cos(a)*7),q(hy+Math.sin(a)*2),1.4,1.4);}}
  // embestida: líneas de velocidad
  if(b.mode==='embiste'){ctx.fillStyle='rgba(230,220,190,0.5)';for(let i=0;i<4;i++){const yy=b.y+4+i*5,xx=b.face>0?b.x-8-i*3:b.x+b.w+2+i*3;ctx.fillRect(xx,yy,6,0.7);}}
}

// =====================================================================
// VILLANO · PISATRUENO — el gigante de la selva, mitad bestia y mitad máquina oxidada
// Entra anunciado: temblores que crecen (charcos, pájaros, piedritas) hasta que aparece caminando.
// Pisotón (aviso: levanta el brazo, ojo rojo, línea roja en el piso hacia vos): onda de tierra que hay que saltar
// y piedras que caen con sombra. Mordida de pistón a ras del piso (saltá) o a media altura (agachate), con la línea
// de aviso a esa altura. Tornillos al rojo en arco desde los caños, a marcas del piso.
// Fase 2 (50 %): ¡se le caen las placas! Queda el núcleo a la vista, va más rápido, pisa dos veces, muerde dos
// veces y suma el rugido: caen piedras por toda la arena dejando huecos para pararse.
// =====================================================================
function J8_mkPisa(A){const g=M8_mkGig(A+W+95);
  return{type:'j8Pisa',isBoss:true,A,g,x:g.x-44,y:GROUND-82,w:84,h:82,hp:0,max:320,state:'enter',t:0,mt:0,face:-1,flash:0,score:12000,
    mode:'idle',cd:70,seq:0,phase:0,casa:A+252,lineY:0,alto:false,dbl:false,marks:null,thrown:0,touch:1,noPush:false,upd:J8_updPisa,draw:J8_drawPisa};}
function J8_cabezaX(b){return M8_gigHead(b.g).x;}
function J8_updPisa(b){
  b.t++;b.mt++;if(b.flash>0)b.flash--;const A=b.A,g=b.g,ph=b.phase;
  g.t++;g.eyeRed=Math.max(0,g.eyeRed-0.05);g.steam=Math.max(0,g.steam-0.04);
  const sync=()=>{b.x=g.x-44;b.y=GROUND-82+g.sink;};
  if(b.state==='enter'){
    if(b.t===1){setBanner('¡LA TIERRA TIEMBLA!',110);playMusic(typeof SONGS!=='undefined'&&SONGS.trueno?'trueno':'boss');}
    for(const [f,k] of [[1,0.25],[50,0.4],[95,0.55],[135,0.72]])if(b.t===f)M8_thump(k);
    if(b.t>=165){M8_gigWalk(g,1.15,1);if(g.x<=b.casa){g.x=b.casa;b.state='intro';b.t=0;b.hp=0;}}
    sync();return;}
  if(b.state==='intro'){const dur=80;
    if(b.t===1){setBanner(b.name,130);J8_sfx('m8rugido');shake=Math.max(shake,6);M8.alert=1;}
    g.jaw=b.t<60?Math.min(1,g.jaw+0.1):g.jaw*0.85;g.head=b.t<60?Math.max(-0.45,g.head-0.05):g.head*0.9;
    b.hp=Math.min(b.max,b.max*b.t/dur);if(b.t%4===0&&b.hp<b.max)tone('square',220+b.hp/b.max*400,220+b.hp/b.max*400,0.03,0.02);
    if(b.t>=dur){b.hp=b.max;b.state='fight';b.mt=0;b.cd=50;b.mode='idle';}
    sync();return;}
  if(b.state==='dying'){
    if(b.t===1){setBanner('¡CAYÓ EL GIGANTE!',110);J8_sfx('m8rugido');}
    g.jaw=Math.max(0,g.jaw-0.02);g.head=Math.min(1,g.head+0.01);g.bite=Math.max(0,g.bite-0.1);g.lift=0;
    if(b.t>90){g.tilt=Math.min(0.22,g.tilt+0.004);g.sink=Math.min(18,g.sink+0.25);}
    if(b.t%6===0)explodeFx(g.x+rand(-36,30),GROUND-rand(20,74)+g.sink,rand(7,13));
    if(b.t%8===0&&g.plates>0)parts.push({k:'p',x:g.x+rand(-30,20),y:GROUND-66,vx:rand(-2,2),vy:rand(-3.4,-1.4),g:0.16,life:50,maxl:50,size:2.4,col:'#9c4a22'});
    if(b.t===150){shake=10;SFX.bigboom();M8_thump(1);for(let i=0;i<4;i++)parts.push({k:'ring',col:'216,116,42',x:g.x,y:GROUND-30,r:3,max:30+i*18,life:22+i*6,maxl:22+i*6});
      for(let i=0;i<30;i++)parts.push({k:'p',x:g.x+rand(-40,30),y:GROUND-rand(4,70),vx:rand(-3,3),vy:rand(-4,-0.5),g:0.12,life:rand(30,60),maxl:60,size:rand(1,2.4),col:pick(['#9c4a22','#d8742a','#5a5e66','#4a7a2a'])});}
    if(b.t>=190)bossDone(b);
    sync();return;}
  if(b.state==='placas'){
    if(b.t===1){setBanner('¡SE LE CAEN LAS PLACAS!',120);J8_sfx('m8rugido');eproj.length=0;g.bite=0;g.lift=0;shake=Math.max(shake,6);}
    g.jaw=b.t<50?Math.min(1,g.jaw+0.08):g.jaw*0.85;g.head=b.t<50?Math.max(-0.4,g.head-0.04):g.head*0.9;
    if(b.t%10===0&&b.t<60){J8_sfx('m8placa');for(let i=0;i<4;i++)parts.push({k:'p',x:g.x+rand(-30,24),y:GROUND-rand(58,72),vx:rand(-2.4,2.4),vy:rand(-3.6,-1.4),g:0.16,life:rand(40,60),maxl:60,size:rand(2,3),col:pick(['#9c4a22','#d8742a','#5a2814'])});}
    if(b.t===40){g.plates=0;const pc=J8_pc();for(let i=0;i<3;i++)J8_roca(clamp(pc.x+(i-1)*44+rand(-6,6),A+12,A+W-120),i*10,true);}
    if(b.t>=100){b.state='fight';b.phase=1;b.mode='idle';b.cd=40;b.mt=0;}
    bossContact(b);sync();return;}
  // --- pelea ---
  if(ph===0&&b.hp<=b.max*0.5){b.state='placas';b.t=0;b.mode='idle';sync();return;}
  if(ph===1&&T%7===0)parts.push({k:'smoke',col:'255,150,60',x:g.x-2+rand(-6,6),y:GROUND-62,vx:rand(-0.2,0.2),vy:-0.6,life:20,maxl:20,size:1.6});
  const pc=J8_pc(),fast=ph?0.75:1;
  switch(b.mode){
  case 'idle':{
    g.head+=(0-g.head)*0.08;g.jaw*=0.85;g.bite=Math.max(0,g.bite-0.08);g.lift*=0.8;
    // se acomoda un poco (pasos cortos que también hacen temblar)
    const tx=b.casa+Math.sin(b.t/90)*14;if(Math.abs(tx-g.x)>2){g.x+=Math.sign(tx-g.x)*0.5;g.anim++;if(g.anim%34===0)M8_thump(0.45);}
    if(--b.cd<=0){
      const s=ph?['pisa','muerde','rugido','chatarra','muerde','pisa']:['pisa','muerde','chatarra','muerde','pisa','chatarra'];
      const a=s[b.seq++%s.length];b.mt=0;
      if(a==='pisa'){b.mode='pisaT';}
      else if(a==='muerde'){b.alto=Math.random()<0.5;b.dbl=ph===1;J8_muerdeT(b);}
      else if(a==='chatarra'){b.mode='chatarraT';b.marks=J8_marcas(pc.x,ph?5:3,A,26);b.thrown=0;J8_sfx('m8vapor');}
      else{b.mode='rugidoT';}
    }
    break;}
  case 'pisaT':{const tel=Math.round(42*fast);
    g.lift=Math.min(1,g.lift+1/(tel*0.6));g.eyeRed=1;g.head+=(0.15-g.head)*0.1;
    if(b.mt%10===0)J8_sfx('m8vapor');
    if(b.mt>=tel){b.mode='pisa';b.mt=0;}
    break;}
  case 'pisa':
    g.lift=Math.max(0,g.lift-0.25);
    if(b.mt===5){const fx=g.x-46;M8_thump(1);shake=Math.max(shake,7);J8_onda(fx,-1,ph?2.4:1.9,A);J8_sfx('m8piedra');
      const n=ph?4:2,px=pc.x;for(let i=0;i<n;i++)J8_roca(clamp(px+(i-(n-1)/2)*40+rand(-10,10),A+12,A+W-120),12+i*14);}
    if(ph&&b.mt===34){J8_onda(g.x-46,-1,2.0,A);M8_thump(0.8);}
    if(b.mt>=(ph?52:44)){b.mode='idle';b.cd=ph?40:60;}
    break;
  case 'muerdeT':{
    const tel=b.tel,hy=b.lineY;g.eyeRed=1;g.jaw=Math.min(0.85,g.jaw+0.06);
    const want=(hy-(GROUND-74))/62;g.head+=(want-g.head)*0.12;
    if(b.mt>=tel){b.mode='muerde';b.mt=0;g.biteY=hy;g.biteU=Math.max(0,g.x-(A+30)-M8_gigHead({...g,bite:0}).u);}
    break;}
  case 'muerde':{
    const ext=b.mt<=8?b.mt/8:b.mt<=14?1:Math.max(0,1-(b.mt-14)/18);g.bite=ext;
    if(b.mt===8){g.jaw=0;J8_sfx('m8mordida');shake=Math.max(shake,3);}
    if(ext>0.15){const hx=J8_cabezaX(b);J8_hurtRect({x:hx-16,y:b.lineY-3,w:g.x-44-(hx-16),h:6});}
    if(b.mt>=32){g.bite=0;
      if(b.dbl){b.dbl=false;b.alto=!b.alto;J8_muerdeT(b,20);}
      else{b.mode='idle';b.cd=ph?40:55;}}
    break;}
  case 'chatarraT':{const tel=Math.round(34*fast);g.steam=1;
    if(b.mt%5===0)parts.push({k:'smoke',col:'90,86,80',x:g.x+rand(-8,8),y:GROUND-84,vx:rand(-0.3,0.3),vy:-rand(0.6,1),life:26,maxl:26,size:rand(1.6,2.6)});
    if(b.mt>=tel&&b.mt%9===0&&b.thrown<b.marks.length){J8_arco(g.x+(b.thrown%2?6:-6),GROUND-84,b.marks[b.thrown++],true);J8_sfx('m8placa');}
    if(b.thrown>=b.marks.length&&b.mt>tel+b.marks.length*9+30){b.mode='idle';b.cd=ph?40:55;b.marks=null;}
    break;}
  case 'rugidoT':{g.head=Math.max(-0.45,g.head-0.03);g.jaw=Math.min(1,g.jaw+0.04);g.eyeRed=1;
    if(b.mt>=30){b.mode='rugido';b.mt=0;J8_sfx('m8rugido');shake=Math.max(shake,5);M8.alert=1;
      // piedras repartidas por toda la arena (de izquierda a derecha) con huecos para pararse
      const off=rand(-6,6);for(let i=0;i<6;i++)J8_roca(A+18+off+i*34+rand(-3,3),i*6);}
    break;}
  case 'rugido':g.jaw=Math.min(1,g.jaw+0.1);if(b.mt%20===0)M8_thump(0.6);
    if(b.mt%5===0)parts.push({k:'smoke',col:'220,220,210',x:J8_cabezaX(b)-10,y:M8_gigHead(g).y+2,vx:-rand(0.8,1.6),vy:rand(-0.3,0.2),life:24,maxl:24,size:2.2});
    if(b.mt>=60){b.mode='idle';b.cd=45;}
    break;
  }
  sync();
  bossContact(b);
}
function J8_muerdeT(b,tel){
  b.mode='muerdeT';b.mt=0;b.lineY=b.alto?GROUND-17:GROUND-5;b.tel=tel||Math.round(40*(b.phase?0.75:1));J8_sfx('m8vapor');
}
function J8_drawPisa(b){
  const g=b.g,A=b.A;g.flash=b.flash;
  // avisos en el piso / en el aire (debajo del gigante)
  if(b.state==='fight'){
    const on=(T>>2)%2;
    if(b.mode==='pisaT'){const k=Math.min(1,b.mt/30),x1=g.x-46,x0=A+4;
      ctx.fillStyle=`rgba(255,70,40,${0.1+0.15*k})`;ctx.fillRect(x0,GROUND-3,x1-x0,3);
      ctx.fillStyle=on?'#ff5a3c':'rgba(255,90,60,0.5)';for(let x=x1-8;x>x0;x-=10)ctx.fillRect(x-((T>>1)%10)*0.4,GROUND-1.5,5,1.2);}
    if(b.mode==='muerdeT'){const y=b.lineY,hx=J8_cabezaX(b),x0=A+6,k=Math.min(1,b.mt/b.tel);
      ctx.fillStyle=`rgba(255,70,40,${0.08+0.14*k+(on?0.05:0)})`;ctx.fillRect(x0,y-3,hx-x0,6);
      ctx.fillStyle=on?'#ff5a3c':'rgba(255,90,60,0.55)';for(let x=hx-14;x>x0;x-=9)ctx.fillRect(x,y-0.5,5,1);
      // qué hacer: línea baja = flecha arriba (saltá) · línea de media altura = flecha abajo (agachate)
      const ix=x0+6,up=!b.alto,iy=up?y-16:y+5;
      ctx.fillStyle='#120c18';ctx.fillRect(ix-4,iy-1,9,10);ctx.fillStyle=on?'#fff3c0':'#ff8a5a';
      if(up){ctx.fillRect(ix,iy,1,1);ctx.fillRect(ix-1,iy+1,3,1);ctx.fillRect(ix-2,iy+2,5,1);ctx.fillRect(ix-3,iy+3,7,1);ctx.fillRect(ix-0.5,iy+4,2,4);}
      else{ctx.fillRect(ix-0.5,iy,2,4);ctx.fillRect(ix-3,iy+4,7,1);ctx.fillRect(ix-2,iy+5,5,1);ctx.fillRect(ix-1,iy+6,3,1);ctx.fillRect(ix,iy+7,1,1);}}
    if(b.mode==='muerde'&&g.bite>0.15){ctx.fillStyle='rgba(255,220,180,0.25)';const hx=J8_cabezaX(b);ctx.fillRect(hx,b.lineY-2,g.x-44-hx,4);}
    if(b.mode==='chatarraT'&&b.marks)for(let i=b.thrown;i<b.marks.length;i++)J8_marca(b.marks[i],J8_surf(b.marks[i],0),(T>>2)%2,true);
  }
  M8_drawGigante(g);
}

// ===== registro en BOSSES (sin índice fijo: el de esta misión) =====
{const idx=LEVELS.push(M8_LVL)-1;BOSSES[idx]={mini:{name:'TOPADOR',make:J8_mkTopador},villain:{name:'PISATRUENO',make:J8_mkPisa,g:'T',col:'#d8742a'}};}
