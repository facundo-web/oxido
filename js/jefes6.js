'use strict';
// Óxido · Misión 6: jefe chico (MOSCARDÓN) y villano (PLACA MADRE). Prefijo J6_ en todo lo global.
// Usa de mision6.js: M6_C (paleta), M6_drawBala (balas con estela), M6_mkVigia, M6 (falla de imagen).

function J6_sfx(n){if(typeof SFX!=='undefined'&&SFX[n])SFX[n]();}
function J6_pc(p){p=p||P;return p.ride?{x:p.ride.x+p.ride.w/2,y:p.ride.y+p.ride.h/2}:{x:p.x+4,y:p.y+9};}
const J6_vivos=()=>players.filter(p=>p&&!p.dead);
function J6_hurtBox(box,n){eachPlayer(p=>{if(!p.dead&&overlap(hurtbox(),box))hurtPlayer(n||1);});for(const a of allies)if(!a.gone&&overlap(a,box))killAlly(a);}
function J6_surf(x,y){let s=GROUND;for(const pl of platforms)if(x>pl.x+1&&x<pl.x+pl.w-1&&pl.y>=y-1&&pl.y<s)s=pl.y;return s;}
// paquete de datos: bala común (la frena la cobertura, no se revienta a tiros) con aspecto propio y estela
function J6_paquete(x,y,ang,sp){eproj.push({kind:'bullet',x,y,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,g:0,r:2,t:0,m6pkt:true,draw:M6_drawBala});}

// =====================================================================
// JEFE CHICO · MOSCARDÓN — dron de seguridad de la red
// Cuerpo hexagonal con cuatro hélices, un ojo-escáner ámbar y un emisor abajo.
// Mira láser y ráfaga (aviso: la línea de la mira), suelta cápsulas que se abren en vigías (aviso: la cápsula cae)
// y tira paquetes en arco a puntos marcados en el piso (aviso: marcas que titilan). Rabia al 50 %.
// =====================================================================
function J6_mkDron(A){return{type:'j6Dron',isBoss:true,air:true,A,x:A+W+40,y:30,w:50,h:20,hp:95,max:95,state:'enter',t:0,mt:0,face:-1,flash:0,score:3500,
  mode:'patrol',cd:50,seq:0,vx:0,tx:A+200,rot:0,hel:0,shots:0,aim:null,drops:0,noPush:true,touch:1,upd:J6_updDron,draw:J6_drawDron};}
function J6_capsula(x,y){eproj.push({kind:'j6Cap',x,y,vx:0,vy:0.5,r:3,t:0,upd:J6_updCap,draw:J6_drawCap});J6_sfx('m6paso');}
function J6_updCap(o,hb){
  o.t++;o.vy=Math.min(o.vy+0.12,3);o.y+=o.vy;
  if(hb&&overlapPt(hb,o.x,o.y,o.r)){hurtPlayer(1);}
  const s=J6_surf(o.x,o.y-o.vy);
  if(o.y>=s-3){o.gone=true;const v=M6_mkVigia(clamp(o.x-4,camX+8,camX+VW-16),s-18);v.matT=18;v.matS=1;enemies.push(v);
    J6_sfx('m6arma');for(let i=0;i<8;i++)parts.push({k:'p',x:o.x,y:s-2,vx:rand(-1.4,1.4),vy:rand(-1.8,-0.4),g:0.1,life:18,maxl:18,size:1,col:i%2?M6_C.cian:M6_C.amb});}
}
function J6_drawCap(o){
  const s=J6_surf(o.x,o.y);ctx.fillStyle=`rgba(255,180,58,${(T>>2)%2?0.5:0.25})`;ctx.beginPath();ctx.ellipse(o.x,s,6,1.4,0,0,7);ctx.fill();
  ctx.fillStyle='#120c2e';ctx.fillRect(q(o.x-3.5),q(o.y-3.5),7,7);ctx.fillStyle=M6_C.cian;ctx.fillRect(q(o.x-3),q(o.y-3),6,6);
  ctx.fillStyle='#1a1040';ctx.fillRect(q(o.x-2),q(o.y-2),4,4);ctx.fillStyle=(T>>1)%2?M6_C.amb:M6_C.ambC;ctx.fillRect(q(o.x-0.5),q(o.y-0.5),1,1);
}
// paquete en arco hacia una marca del piso; explota al llegar (se puede reventar a tiros)
function J6_arco(x,y,tx){
  const Tt=50,g=0.12,ty=J6_surf(tx,0);
  eproj.push({kind:'j6Arco',x,y,tx,ty,vx:(tx-x)/Tt,vy:(ty-y-0.5*g*Tt*Tt)/Tt,g,r:2.5,t:0,upd:J6_updArco,draw:J6_drawArco});
}
function J6_updArco(o,hb){
  o.t++;o.vy+=o.g;o.x+=o.vx;o.y+=o.vy;
  if(coverBlocks(o)){o.gone=true;explodeFx(o.x,o.y,9);return;}
  if(hb&&overlapPt(hb,o.x,o.y,o.r)){o.gone=true;hurtPlayer(1);explodeFx(o.x,o.y,10);return;}
  if(o.y>=o.ty-2&&o.vy>0){o.gone=true;explodeFx(o.x,o.ty-3,12);
    eachPlayer(p=>{if(p.dead)return;const h=hurtbox();if(Math.abs(h.x+h.w/2-o.x)<12&&h.y+h.h>o.ty-16)hurtPlayer(1);});}
  if(o.t>200)o.gone=true;
}
function J6_drawArco(o){
  const on=(T>>2)%2;ctx.strokeStyle=on?M6_C.amb:'#7a4a10';ctx.lineWidth=0.8;ctx.beginPath();ctx.ellipse(o.tx,o.ty,7,1.6,0,0,7);ctx.stroke();
  ctx.fillStyle=on?M6_C.amb:'#7a4a10';ctx.fillRect(o.tx-0.5,o.ty-4,1,3);
  ctx.fillStyle='#4a2a08';circle(o.x,o.y,2.8);ctx.fillStyle=M6_C.amb;circle(o.x,o.y,2);ctx.fillStyle='#fff';ctx.fillRect(q(o.x-0.5),q(o.y-0.5),1,1);
}
function J6_updDron(b){
  b.t++;b.mt++;if(b.flash>0)b.flash--;const A=b.A,ph2=b.hp<b.max*0.5,cx=b.x+b.w/2,pc=J6_pc();
  b.hel+=0.9;
  if(b.state!=='dying'&&b.t%14===0)J6_sfx('m6zumbido');
  if(b.state==='enter'){b.x-=1.5;b.face=-1;b.y=30+Math.sin(b.t/12)*2;if(b.x<=A+200){b.state='intro';b.t=0;b.hp=0;}return;}
  if(b.state==='intro'){bossIntro(b,50);b.y=30+Math.sin(b.t/12)*2;if(b.state==='fight'){b.cd=40;b.mode='patrol';}return;}
  if(b.state==='dying'){
    b.rot+=0.02*(b.t<60?1:2);b.x+=0.5;b.y=Math.min(GROUND-b.h,b.y+(b.t>40?1.4:0.3));
    if(b.t%6===0)explodeFx(b.x+rand(4,b.w-4),b.y+rand(0,b.h),rand(7,13));
    if(b.t%3===0)parts.push({k:'smoke',col:'40,30,70',x:b.x+rand(10,40),y:b.y,vx:rand(-0.2,0.2),vy:rand(-1,-0.4),life:40,maxl:40,size:rand(2,3.5)});
    if(b.t%10===0)M6.glitch=Math.max(M6.glitch,4);
    if(b.y>=GROUND-b.h-0.5&&!b.boom){b.boom=1;explodeFx(cx,GROUND-6,30);shake=8;}
    if(b.t>=140)bossDone(b);
    return;}
  if(ph2&&T%8===0)parts.push({k:'smoke',col:'50,36,90',x:b.x+rand(10,40),y:b.y+2,vx:rand(-0.2,0.2),vy:rand(-0.8,-0.4),life:40,maxl:40,size:rand(2,3)});
  const lo=A+30,hi=A+W-b.w-30,sp=ph2?1.2:0.9;
  const hover=(tx,ty)=>{b.vx+=(clamp((tx-b.x)*0.04,-sp,sp)-b.vx)*0.1;b.x+=b.vx;b.y+=(ty-b.y)*0.05;b.rot+=((-b.vx*0.08)-b.rot)*0.1;};
  switch(b.mode){
  case 'patrol':{
    // se queda en diagonal al jugador, alto
    if(b.mt%90===0)b.tx=clamp(pc.x+(pc.x<A+W/2?60:-110)+rand(-20,20),lo,hi);
    hover(b.tx,30+Math.sin(b.t/30)*6);b.face=pc.x<cx?-1:1;
    if(--b.cd<=0){
      const vig=enemies.filter(e=>e.type==='vigia'&&!e.gone).length;
      const atks=ph2?['mira','arco','mira','suelta','arco']:['mira','suelta','mira','arco'];
      let a=atks[b.seq++%atks.length];if(a==='suelta'&&vig>=2)a='mira';
      b.mode=a==='mira'?'miraT':a;b.mt=0;b.shots=0;b.drops=0;
      if(a==='mira')J6_sfx('m6mira');
    }
    break;}
  case 'miraT':{const tel=ph2?28:38;hover(b.x,b.y);
    const ex=cx+b.face*6,ey=b.y+b.h-1;
    if(b.mt<=tel-8||!b.aim){const p=J6_pc(nearestPlayer(cx,b.y));b.aim=Math.atan2(p.y-ey,p.x-ex);}
    if(b.mt>=tel){b.mode='mira';b.mt=0;}
    break;}
  case 'mira':{hover(b.x,b.y);const n=ph2?9:6;
    if(b.mt%4===0&&b.shots<n){const ex=cx+b.face*6,ey=b.y+b.h-1,a=b.aim+rand(-0.05,0.05);
      eproj.push({kind:'bullet',x:ex,y:ey,vx:Math.cos(a)*2.8,vy:Math.sin(a)*2.8,g:0,r:1.6,t:0});SFX.eshoot();
      parts.push({k:'flash',x:ex,y:ey,life:3,maxl:3,size:3});b.shots++;}
    if(b.shots>=n&&b.mt>n*4+8){b.mode='patrol';b.cd=ph2?40:60;b.aim=null;}
    break;}
  case 'suelta':{const tx=clamp(pc.x+(pc.x<A+W/2?50:-50),lo,hi);hover(tx,26);
    if(b.mt===40||(ph2&&b.mt===70)){J6_capsula(cx,b.y+b.h);b.drops++;}
    if(b.mt>(ph2?100:70)){b.mode='patrol';b.cd=ph2?45:65;}
    break;}
  case 'arco':{hover(b.x,b.y-0.2);const n=ph2?4:3;
    if(b.mt>14&&b.mt%12===0&&b.drops<n){const p=J6_pc(nearestPlayer(cx,b.y)),k=b.drops-(n-1)/2;
      J6_arco(cx,b.y+b.h-2,clamp(p.x+k*30+rand(-6,6),A+10,A+W-10));SFX.toss();b.drops++;}
    if(b.drops>=n&&b.mt>n*12+30){b.mode='patrol';b.cd=ph2?45:65;}
    break;}
  }
  b.x=clamp(b.x,A+2,A+W-b.w-2);b.y=clamp(b.y,14,90);
  bossContact(b);
}
function J6_drawDron(b){
  const fl=b.flash>0||(b.state==='dying'&&(T>>2)%2),C=c=>fl?'#fff':c,ph2=b.hp<b.max*0.5,cx=b.x+b.w/2;
  // mira láser: línea que titila hacia donde va a tirar
  if(b.mode==='miraT'&&b.aim!==null&&b.state==='fight'){const ex=cx+b.face*6,ey=b.y+b.h-1,L2=360,on=(T>>1)%2;
    ctx.strokeStyle=on?'rgba(255,90,60,0.95)':'rgba(255,180,58,0.75)';ctx.lineWidth=on?1:0.7;ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(ex+Math.cos(b.aim)*L2,ey+Math.sin(b.aim)*L2);ctx.stroke();}
  ctx.save();ctx.translate(q(cx),q(b.y+b.h/2+Math.sin(b.t/9)*0.8));ctx.rotate(b.rot);
  // brazos y hélices (4: dos adelante, dos atrás más oscuras)
  for(const [dx,dy,back] of [[-22,-7,1],[22,-7,1],[-18,-9,0],[18,-9,0]]){
    ctx.fillStyle=C(back?'#1c1446':'#3a2c7a');ctx.fillRect(dx>0?6:dx,dy+3,Math.abs(dx)-6,2);
    ctx.fillStyle=C(back?'#2a1e5e':'#4a3a9a');ctx.fillRect(dx-3,dy,6,4);ctx.fillStyle=C(M6_C.cian);if(!back)ctx.fillRect(dx-3,dy,6,0.7);
    const rw=(Math.sin(b.hel+dx)>0)?10:4;ctx.fillStyle=fl?'#fff':back?'rgba(174,244,255,0.35)':'rgba(174,244,255,0.7)';ctx.fillRect(dx-rw/2,dy-1.2,rw,0.9);}
  // cuerpo hexagonal
  ctx.fillStyle=C('#2c2068');ctx.beginPath();ctx.moveTo(-16,-6);ctx.lineTo(16,-6);ctx.lineTo(24,2);ctx.lineTo(16,10);ctx.lineTo(-16,10);ctx.lineTo(-24,2);ctx.closePath();ctx.fill();
  ctx.fillStyle=C('#43338e');ctx.beginPath();ctx.moveTo(-15,-5);ctx.lineTo(15,-5);ctx.lineTo(21,1);ctx.lineTo(-21,1);ctx.closePath();ctx.fill();
  ctx.fillStyle=C(M6_C.cian);ctx.fillRect(-15,-6,30,0.8);ctx.fillStyle=C(M6_C.vio);ctx.fillRect(-16,9.2,32,0.8);
  for(let i=-12;i<=12;i+=6){ctx.fillStyle=fl?'#fff':((T>>3)+i)%4===0?M6_C.amb:'#3a2470';ctx.fillRect(i-1,5,2,1.4);}
  // ojo-escáner: lente que mira al jugador; se pone rojo al apuntar
  const f=b.face,ax=f*4;ctx.fillStyle=C('#05031a');circle(ax,1,5);
  const aimC=b.mode==='miraT'||b.mode==='mira';ctx.fillStyle=fl?'#fff':aimC?((T>>1)%2?'#ff5a3c':'#ffd0a0'):M6_C.amb;circle(ax+f*1.5,1,2.6);
  ctx.fillStyle='#fff';ctx.fillRect(ax+f*1.5-1,0,1,1);
  ctx.strokeStyle=C(M6_C.cian);ctx.lineWidth=0.6;ctx.beginPath();ctx.arc(ax,1,5,0,7);ctx.stroke();
  // emisor de abajo
  ctx.fillStyle=C('#120c2e');ctx.fillRect(f*6-2,10,4,3);ctx.fillStyle=aimC&&(T>>1)%2?'#ff5a3c':M6_C.cianO;ctx.fillRect(f*6-1,12,2,1);
  if(ph2){ctx.fillStyle='#05031a';ctx.fillRect(-10,-3,2,2);ctx.fillRect(9,6,2,1);if((T>>2)%3===0){ctx.fillStyle=M6_C.vio;ctx.fillRect(-20,rand(-4,8),40,0.8);}}
  ctx.restore();
}

// =====================================================================
// VILLANO · PLACA MADRE — la inteligencia de la red, en un monolito de pantallas
// Fase 1: el monolito (se le pega de frente). Ataques: ráfaga de paquetes en abanico (aviso: la boca se ilumina
// y suena un pitido), barrido de luz bajo (saltalo) o alto (agachate), con aviso de guiones ámbar a esa altura,
// y bloques de datos que caen del cielo con marca en el piso.
// Fase 2 (al 50 %): ¡SE COPIA! La cara sale del monolito en tres pantallas que flotan. Una sola es la real:
// la limpia, de borde cian. Las copias tienen estática violeta y los tiros las atraviesan. Cada tanto se mezclan.
// =====================================================================
const J6_TW=36,J6_TH=72;
function J6_mkPlaca(A){const cx=A+262;return{type:'j6Placa',isBoss:true,A,cx,x:cx-J6_TW/2,y:GROUND-J6_TH,w:J6_TW,h:J6_TH,hp:0,max:330,state:'enter',t:0,mt:0,face:-1,flash:0,score:12000,
  phase:0,cd:60,seq:0,mode:'idle',on:0,mouth:0,heads:[],real:0,mixT:0,mix:0,nextMix:360,beamY:0,fuego:0,touch:1,noPush:false,upd:J6_updPlaca,draw:J6_drawPlaca};}
const J6_SLOTS=[[70,46],[150,30],[230,46]];
function J6_headPos(b,i){const h=b.heads[i],s=J6_SLOTS[h.slot],bob=Math.sin(b.t/24+i*2)*3;
  if(b.mix>0&&h.from!==undefined){const f=J6_SLOTS[h.from],k=1-b.mix/40,e=k*k*(3-2*k);
    return{x:b.A+f[0]+(s[0]-f[0])*e,y:f[1]+(s[1]-f[1])*e-Math.sin(e*Math.PI)*18+bob};}
  return{x:b.A+s[0],y:s[1]+bob};}
// barrido de luz: guiones ámbar de aviso y después el haz a esa altura, de punta a punta de la arena
function J6_barrido(b,y,tel){eproj.push({kind:'j6Haz',x:b.cx,y,A:b.A,t:-tel,tel,ext:0,upd:J6_updHaz,draw:J6_drawHaz});}
function J6_updHaz(o,hb){
  o.t++;if(o.t<0){if(o.t%10===0)tone('square',1500,1500,0.03,0.02);return;}
  if(o.t===0)J6_sfx('m6haz');
  o.ext=Math.min(W,o.ext+22);
  if(o.t>2&&o.t<24){const x0=Math.max(o.A,o.x-o.ext),x1=Math.min(o.A+W,o.x+o.ext);
    eachPlayer(p=>{if(p.dead)return;const h=hurtbox();if(h.x+h.w>x0&&h.x<x1&&h.y<o.y+1.5&&h.y+h.h>o.y-1.5)hurtPlayer(1);});
    for(const a of allies)if(!a.gone&&a.y<o.y+1.5&&a.y+a.h>o.y-1.5)killAlly(a);}
  if(o.t>=30)o.gone=true;
}
function J6_drawHaz(o){
  if(o.t<0){const k=1+o.t/o.tel,on=(T>>2)%2;
    ctx.fillStyle=on?M6_C.amb:'rgba(255,180,58,0.4)';for(let x=o.A+4;x<o.A+W;x+=10)ctx.fillRect(x+((T>>1)%10)*0.3,o.y-0.5,5,1);
    ctx.fillStyle=`rgba(255,180,58,${0.08+0.12*k})`;ctx.fillRect(o.A,o.y-3,W,6);
    if(on){ctx.fillStyle=M6_C.ambC;for(const ax of [o.A+20,o.A+W-20]){ctx.fillRect(ax,o.y-4,1,8);ctx.fillRect(ax-2,o.y-1,5,2);}}
    return;}
  const a=o.t<24?1:1-(o.t-24)/6,x0=Math.max(o.A,o.x-o.ext),x1=Math.min(o.A+W,o.x+o.ext);
  ctx.fillStyle=`rgba(58,216,255,${0.25*a})`;ctx.fillRect(x0,o.y-4,x1-x0,8);
  ctx.fillStyle=`rgba(174,244,255,${0.85*a})`;ctx.fillRect(x0,o.y-1.5,x1-x0,3);
  ctx.fillStyle=`rgba(255,255,255,${a})`;ctx.fillRect(x0,o.y-0.5,x1-x0,1);
  for(let i=0;i<8;i++){const x=x0+hash(i*13+o.t)*(x1-x0);ctx.fillStyle=`rgba(255,180,58,${a})`;ctx.fillRect(x,o.y-2-hash(i+o.t)*3,1,1);}
}
// bloques de datos que caen del cielo (con marca en el piso; se pueden reventar a tiros)
function J6_lluvia(b){
  const ph=b.phase,n=ph?7:5,pc=J6_pc(),gap=ph?26:30,off=rand(-10,10);
  for(let k=0;k<n;k++){const x=clamp(pc.x+off+(k-(n-1)/2)*gap+rand(-4,4),b.A+8,b.A+W-8);
    eproj.push({kind:'j6Bloque',x,y:-10-k*12-rand(0,8),vy:0.3,r:3,t:0,upd:J6_updBloque,draw:J6_drawBloque});}
  J6_sfx('m6prende');
}
function J6_updBloque(o,hb){
  o.t++;o.vy=Math.min(o.vy+0.035,2.2);o.y+=o.vy;if(o.y<0)return;
  if(coverBlocks(o)){o.gone=true;J6_chispas(o.x,o.y,5);return;}
  if(hb&&overlapPt(hb,o.x,o.y,o.r)){o.gone=true;hurtPlayer(1);J6_chispas(o.x,o.y,6);return;}
  const s=J6_surf(o.x,o.y-o.vy);if(o.y>=s-2){o.gone=true;J6_chispas(o.x,s-1,7);dust(o.x,s,3);}
}
function J6_chispas(x,y,n){for(let i=0;i<n;i++)parts.push({k:'p',x,y,vx:rand(-1.4,1.4),vy:rand(-2,-0.3),g:0.1,life:rand(14,24),maxl:24,size:1,col:pick([M6_C.cian,M6_C.amb,'#ffffff'])});}
function J6_drawBloque(o){
  if(o.y>-6){const s=J6_surf(o.x,Math.max(0,o.y)),k=clamp(1-(s-o.y)/160,0.2,1);
    ctx.fillStyle=`rgba(255,180,58,${0.2+0.4*k*((T>>2)%2?1:0.6)})`;ctx.fillRect(o.x-3-3*k,s-1,6+6*k,1.5);}
  const x=q(o.x),y=q(o.y);ctx.fillStyle='#120c2e';ctx.fillRect(x-3.5,y-3.5,7,7);
  ctx.fillStyle=M6_C.vio;ctx.fillRect(x-3,y-3,6,6);ctx.fillStyle='#3a2470';ctx.fillRect(x-2,y-2,4,4);
  ctx.fillStyle=M6_C.cianC;ctx.fillRect(x-3,y-3,6,0.8);ctx.fillStyle=(T>>2)%2?M6_C.amb:M6_C.cian;ctx.fillRect(x-0.5,y-0.5,1,1);
}
function J6_rafaga(b,x,y,n,spread){
  const p=J6_pc(nearestPlayer(x,y)),a0=Math.atan2(p.y-y,p.x-x);
  for(let i=0;i<n;i++){const k=n>1?i/(n-1)-0.5:0;J6_paquete(x,y,a0+k*spread*2,2.2);}
  SFX.eshoot();parts.push({k:'flash',x,y,life:3,maxl:3,size:4});
}
// cara de la PLACA MADRE (dos ojos ámbar con cursor y una boca de onda). fake = copia con estática
function J6_cara(x,y,w,h,carga,fake,fl,b){
  ctx.fillStyle=fl?'#fff':'#05031a';ctx.fillRect(x,y,w,h);if(fl)return;
  if(fake){ctx.fillStyle='rgba(176,106,255,0.16)';ctx.fillRect(x,y,w,h);}
  ctx.fillStyle='rgba(58,216,255,0.08)';for(let i=y+1;i<y+h;i+=2)ctx.fillRect(x,i,w,0.6);
  const ew=Math.max(2,w*0.2),eh=Math.max(1.5,h*0.16),ey=y+h*0.3,blink=(T+((b&&b.t)||0))%140<6;
  const ec=fake?'#c08aff':carga?((T>>1)%2?'#ffffff':M6_C.ambC):M6_C.amb;
  for(const exx of [x+w*0.18,x+w*0.82-ew]){ctx.fillStyle=ec;ctx.fillRect(exx,ey+(blink?eh*0.4:0),ew,blink?eh*0.25:eh);
    if(!blink&&(T>>4)%2){ctx.fillStyle='#05031a';ctx.fillRect(exx+ew*0.6,ey+eh*0.2,ew*0.25,eh*0.6);}}
  // boca: onda que se abre cuando carga
  const my=y+h*0.7,amp=carga?h*0.14:h*0.05;
  ctx.strokeStyle=fake?'#a070e0':M6_C.cian;ctx.lineWidth=Math.max(0.6,h*0.05);ctx.beginPath();
  for(let i=0;i<=w*0.7;i+=1){const xx=x+w*0.15+i,yy=my+Math.sin(i*0.9+T*0.4)*amp*Math.sin(i/(w*0.7)*Math.PI);if(i)ctx.lineTo(xx,yy);else ctx.moveTo(xx,yy);}ctx.stroke();
  if(fake&&(T>>1)%5<2){ctx.fillStyle='rgba(176,106,255,0.8)';const ty=y+hash((T>>1)+x)*h;ctx.fillRect(x-1,ty,w+2,1);}
}
function J6_updPlaca(b){
  b.t++;b.mt++;if(b.flash>0)b.flash--;const A=b.A;
  if(b.state==='enter'){
    if(b.t===1){setBanner('¡SE PRENDE EL SISTEMA!',100);playMusic(typeof SONGS!=='undefined'&&SONGS.placa?'placa':'boss');}
    b.on=Math.min(8,Math.floor(b.t/10));if(b.t%10===0&&b.on<8)J6_sfx('m6prende');
    if(b.t%20===0)shake=Math.max(shake,1.5);
    if(b.t>=90){b.state='intro';b.t=0;b.hp=0;}
    return;}
  if(b.state==='intro'){const dur=80;if(b.t===1){setBanner(b.name,130);shake=Math.max(shake,4);}
    b.hp=Math.min(b.max,b.max*b.t/dur);if(b.t%4===0&&b.hp<b.max)tone('square',300+b.hp/b.max*500,300+b.hp/b.max*500,0.03,0.02);
    if(b.t>=dur){b.hp=b.max;b.state='fight';b.mt=0;b.cd=50;}
    return;}
  if(b.state==='dying'){
    if(b.t===1){setBanner('¡SISTEMA CAÍDO!',110);J6_sfx('m6copia');}
    if(b.t%5===0)explodeFx(b.cx+rand(-16,16),GROUND-rand(6,66),rand(7,14));
    if(b.t%8===0){M6.glitch=Math.max(M6.glitch,6);J6_chispas(b.cx+rand(-18,18),GROUND-rand(10,70),5);}
    for(const h of b.heads){h.vy=(h.vy||0)+0.12;h.dy=(h.dy||0)+h.vy;}
    if(b.t===150){shake=9;SFX.bigboom();for(let i=0;i<4;i++)parts.push({k:'ring',col:'58,216,255',x:b.cx,y:GROUND-36,r:3,max:30+i*16,life:22+i*6,maxl:22+i*6});
      for(let i=0;i<40;i++)parts.push({k:'p',x:b.cx+rand(-16,16),y:GROUND-rand(4,70),vx:rand(-3,3),vy:rand(-4,-0.5),g:0.1,life:rand(30,60),maxl:60,size:rand(1,2.2),col:pick([M6_C.cian,M6_C.vio,M6_C.amb,'#ffffff'])});}
    if(b.t>=190)bossDone(b);
    return;}
  if(b.state==='split'){ // se copia: la cara sale en tres pantallas (no se le puede pegar)
    if(b.t===1){setBanner('¡SE COPIÓ! UNA SOLA ES LA REAL',120);J6_sfx('m6copia');eproj.length=0;M6.glitch=12;
      b.heads=[0,1,2].map(i=>({slot:i,from:undefined,hitT:0}));b.real=(Math.random()*3)|0;}
    if(b.t%6===0)J6_chispas(b.cx,GROUND-50,3);
    if(b.t>=100){b.state='fight';b.phase=1;b.mt=0;b.cd=60;b.nextMix=330;J6_box(b);}
    return;}
  // --- pelea ---
  if(b.phase===0&&b.hp<=b.max*0.5){b.state='split';b.t=0;b.mode='idle';return;}
  if(b.mouth>0)b.mouth--;
  if(b.phase===1){
    for(const h of b.heads)if(h.hitT>0)h.hitT--;
    // los tiros atraviesan a las copias (y les hacen saltar estática)
    for(const bu of pbul){if(bu.gone)continue;for(let i=0;i<3;i++){if(i===b.real)continue;const p=J6_headPos(b,i);
      if(Math.abs(bu.x-p.x)<11&&Math.abs(bu.y-p.y)<9&&!b.heads[i].hitT){b.heads[i].hitT=10;spark(bu.x,bu.y,M6_C.vio);}}}
    // se mezclan: aviso (todas titilan blanco) y cambian de lugar
    if(b.mix>0){b.mix--;if(b.mix===0)for(const h of b.heads)h.from=undefined;}
    else if(--b.nextMix<=0){
      if(b.nextMix===-1){J6_sfx('m6falla');}
      if(b.nextMix<=-30){const order=[0,1,2].sort(()=>Math.random()-0.5);if(order.every((s,i)=>s===b.heads[i].slot))order.push(order.shift());
        b.heads.forEach((h,i)=>{h.from=h.slot;h.slot=order[i];});b.mix=40;b.nextMix=b.hp<b.max*0.25?260:330;}
    }
    J6_box(b);
  }
  if(b.mode==='idle'){if(--b.cd<=0)J6_ataque(b);}
  else if(b.mode==='rafT'){b.mouth=4;if(b.mt%8===0)tone('square',700+b.mt*20,700+b.mt*20,0.04,0.025);
    if(b.mt>=(b.phase?24:30)){b.mode='raf';b.mt=0;b.fuego=0;}}
  else if(b.mode==='raf'){
    if(b.mt%16===1&&b.fuego<2){b.fuego++;
      if(b.phase===0)J6_rafaga(b,b.cx-6,GROUND-52,5,0.36);
      else b.heads.forEach((h,i)=>{const p=J6_headPos(b,i);J6_rafaga(b,p.x,p.y+4,i===b.real?3:1,0.25);});}
    if(b.fuego>=2&&b.mt>40){b.mode='idle';b.cd=b.phase?55:70;}}
  if(b.phase===0)bossContact(b);
  else{const near=J6_vivos().some(p=>{const c=J6_pc(p);return c.y<b.y+b.h+12;});if(near)bossContact(b);}
}
// en la fase 2 la caja del jefe es la pantalla real
function J6_box(b){const p=J6_headPos(b,b.real);b.x=p.x-11;b.y=p.y-9;b.w=22;b.h=18;}
function J6_ataque(b){
  const s=b.phase?['raf','barrido','lluvia','raf','barrido']:['raf','barrido','lluvia','raf','barrido','barrido'];
  const a=s[b.seq++%s.length];b.mt=0;
  if(a==='raf'){b.mode='rafT';J6_sfx('m6carga');}
  else if(a==='barrido'){const alto=Math.random()<0.45;J6_barrido(b,alto?GROUND-16:GROUND-4,b.phase?36:46);J6_sfx('m6mira');
    if(b.phase&&b.hp<b.max*0.3)J6_barrido(b,alto?GROUND-4:GROUND-16,80);
    b.cd=b.phase?85:100;}
  else{J6_lluvia(b);b.cd=b.phase?95:110;}
}
function J6_drawPlaca(b){
  const fl=b.flash>0&&b.phase===0,x0=b.cx-J6_TW/2,top=GROUND-J6_TH,dead=b.state==='dying';
  // cables al piso
  ctx.strokeStyle='#22185a';ctx.lineWidth=1.4;ctx.beginPath();
  for(const [dx,ex] of [[-14,-40],[-6,-26],[10,30],[16,44]]){ctx.moveTo(b.cx+dx,GROUND-6);ctx.quadraticCurveTo(b.cx+dx+ex*0.4,GROUND-1,b.cx+dx+ex,GROUND);}ctx.stroke();
  for(let i=0;i<3;i++){const ph=((T*0.02+i/3)%1);ctx.fillStyle=M6_C.cianC;ctx.fillRect(b.cx-14-40*ph,GROUND-6+5*ph,1.2,1);}
  // monolito
  const sh=dead&&b.t>150?Math.min(1,(b.t-150)/40):0;
  ctx.save();if(sh>0){ctx.beginPath();ctx.rect(x0-10,top+J6_TH*sh,J6_TW+20,J6_TH);ctx.clip();}
  ctx.fillStyle=fl?'#fff':'#120c2e';ctx.fillRect(x0-2,top-2,J6_TW+4,J6_TH+2);
  ctx.fillStyle=fl?'#fff':'#1a1040';ctx.fillRect(x0,top,J6_TW,J6_TH);
  ctx.fillStyle=M6_C.cian;ctx.fillRect(x0-2,top-2,J6_TW+4,0.8);ctx.fillStyle=M6_C.vio;ctx.fillRect(x0-2,top-2,0.8,J6_TH+2);
  // pantallas: la grande de arriba (la cara) y una grilla de chicas abajo
  const enter=b.state==='enter',on=enter?b.on:8,faceOut=b.phase===1||b.state==='split';
  if(faceOut){ctx.fillStyle='#05031a';ctx.fillRect(x0+3,top+3,J6_TW-6,26);
    if((T>>2)%2){ctx.fillStyle='rgba(176,106,255,0.3)';for(let i=0;i<5;i++)ctx.fillRect(x0+3,top+4+hash(i+(T>>2))*24,J6_TW-6,0.8);}}
  else if(on>=1)J6_cara(x0+3,top+3,J6_TW-6,26,b.mode==='rafT'||b.mode==='raf',false,fl,b);
  else{ctx.fillStyle='#05031a';ctx.fillRect(x0+3,top+3,J6_TW-6,26);}
  for(let r=0;r<3;r++)for(let c=0;c<2;c++){const i=r*2+c,sx=x0+3+c*16,sy=top+33+r*12;
    ctx.fillStyle='#05031a';ctx.fillRect(sx,sy,14,10);
    if(i+2>on)continue;
    // gráficos que se mueven (sin letras)
    if((i+r)%3===0){ctx.fillStyle=M6_C.cianO;for(let k=0;k<5;k++){const hh=2+Math.abs(Math.sin(T/12+k+i))*6;ctx.fillRect(sx+1+k*2.6,sy+9-hh,1.6,hh);}}
    else if((i+r)%3===1){ctx.strokeStyle=M6_C.amb;ctx.lineWidth=0.6;ctx.beginPath();for(let k=0;k<=14;k++){const yy=sy+5+Math.sin(k*0.8+T/8+i)*3;if(k)ctx.lineTo(sx+k,yy);else ctx.moveTo(sx+k,yy);}ctx.stroke();}
    else{ctx.fillStyle=M6_C.vio;for(let k=0;k<4;k++)if(hash(k+i*5+((T>>4)|0))<0.6)ctx.fillRect(sx+1+(k%2)*6,sy+1+Math.floor(k/2)*4,5,3);}
    if(b.state==='split'||dead){if((T+i)%7<3){ctx.fillStyle='rgba(176,106,255,0.5)';ctx.fillRect(sx,sy+hash(i+T)*9,14,1);}}}
  // luces del costado
  for(let k=0;k<8;k++){ctx.fillStyle=hash(k+((T>>3)|0))<0.4?M6_C.amb:'#3a2470';ctx.fillRect(x0+J6_TW-2.5,top+34+k*4.5,1.5,1.5);}
  ctx.restore();
  // pantallas flotantes (fase 2)
  if(b.heads.length){
    if(b.state==='split'){const k=Math.min(1,b.t/60);
      b.heads.forEach((h,i)=>{const s=J6_SLOTS[h.slot],x=b.cx+(b.A+s[0]-b.cx)*k,y=GROUND-56+(s[1]-(GROUND-56))*k;J6_pantallaFlota(x,y,i!==b.real,false,b,0);});return;}
    b.heads.forEach((h,i)=>{const p=J6_headPos(b,i),warn=b.phase===1&&b.mix===0&&b.nextMix<=0;
      const yy=dead?p.y+(h.dy||0):p.y;if(dead&&yy>GROUND)return;
      J6_pantallaFlota(p.x,yy,i!==b.real,warn,b,h.hitT,i===b.real&&b.flash>0);});
  }
}
function J6_pantallaFlota(x,y,fake,warn,b,hitT,fl){
  // haz que la une al monolito
  ctx.strokeStyle=fake?'rgba(176,106,255,0.18)':'rgba(58,216,255,0.25)';ctx.lineWidth=0.6;ctx.beginPath();ctx.moveTo(x,y+9);ctx.lineTo(b.cx,GROUND-J6_TH);ctx.stroke();
  const jx=fake&&(T>>2)%6===0?rand(-1.5,1.5):0;
  ctx.fillStyle=warn&&(T>>1)%2?'#ffffff':fake?'#2a1c5a':'#1a1040';ctx.fillRect(x-12+jx,y-10,24,20);
  ctx.fillStyle=warn&&(T>>1)%2?'#ffffff':fake?M6_C.vio:M6_C.cian;ctx.fillRect(x-12+jx,y-10,24,0.9);ctx.fillRect(x-12+jx,y+9.1,24,0.9);
  if(!fake){ctx.fillRect(x-12,y-10,0.9,20);ctx.fillRect(x+11.1,y-10,0.9,20);}
  J6_cara(x-10+jx,y-8,20,15,b.mode==='rafT'||b.mode==='raf',fake,fl,b);
  // antenitas y luz de abajo
  ctx.fillStyle=fake?'#3a2470':M6_C.cianO;ctx.fillRect(x-6+jx,y+10,2,2);ctx.fillRect(x+4+jx,y+10,2,2);
  if(hitT>0){ctx.fillStyle=`rgba(176,106,255,${hitT/10})`;ctx.fillRect(x-14,y-11,28,22);txt('✕',x,y-18,5,'#c08aff','center',false);}
}

// ===== registro en BOSSES (sin índice fijo: el de esta misión) =====
{const idx=LEVELS.push(M6_LVL)-1;BOSSES[idx]={mini:{name:'MOSCARDÓN',make:J6_mkDron},villain:{name:'PLACA MADRE',make:J6_mkPlaca,g:'P',col:'#3ad8ff'}};}
