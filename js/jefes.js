'use strict';
// Óxido · Jefes de cada misión
// Jefes chicos (mitad de misión). Entran desde la derecha de la arena, llenan la barra y pelean.
// Escarabajo: patrulla entre lo y hi (sin pisar el andamio de la izquierda ni el concreto de la derecha).
function mkBoss(A){return{type:'boss',isBoss:true,A,x:A+W+10,y:GROUND-46,w:60,h:46,hp:80,max:80,state:'enter',t:0,dir:-1,face:-1,cd:40,burst:0,bt:0,flash:0,score:3000,seq:0,
  stop:A+196,lo:A+140,hi:A+222};}
function mkBoss2(A){return{type:'boss2',isBoss:true,air:true,A,x:A+W+30,y:30,baseY:30,w:56,h:20,hp:90,max:90,state:'enter',noPush:true,mode:'hover',t:0,mt:0,face:-1,cd:50,flash:0,score:3500,seq:0,dir:1,drops:0,vy:0,rot:0};}
// El tanque aplasta las cajas comunes que tiene encima (sueltan su premio).
function bossCrush(b){for(const c of crates)if(!c.gone&&!c.armored&&c.x>=b.A&&c.x+c.w<=b.A+W&&overlap(b,c)){dmgCrate(c,99);shake=Math.max(shake,2);}}
function isBoss(e){return !!e.isBoss;}
// el cuerpo del jefe le pega a cualquier jugador que lo toque
function bossContact(b){eachPlayer(()=>bossTouch(b));}
function bossTouch(b){
  const hb=hurtbox();
  if(!P.dead&&overlap(hb,b)){
    hurtPlayer(b.touch||2);
    if(b.noPush)return;const c=b.x+b.w/2;
    if(P.ride){const m=P.ride;m.x=clamp((m.x+11<c)?b.x-m.w-1:b.x+b.w+1,camX+2,camX+VW-24);}
    else{P.x=clamp((P.x+4<c)?b.x-9:b.x+b.w+1,camX+2,camX+VW-10);}
  }
}
function bossDeathTick(b){
  if(b.t%6===0)explodeFx(b.x+rand(0,b.w),b.y+rand(0,b.h),rand(8,16));
}
function updBoss(b){
  b.t++;if(b.flash>0)b.flash--;const A=b.A;
  if(b.state==='enter'){ // entra rodando, retumba y aplasta lo que encuentra
    b.x-=1.1;b.dir=-1;b.face=-1;bossCrush(b);
    if(T%3===0)dust(b.x+b.w-4,GROUND,1);
    if(b.t%18===0){tone('sawtooth',70,52,0.2,0.06);shake=Math.max(shake,1.2);}
    if(b.x<=b.stop){b.x=b.stop;b.state='intro';b.t=0;b.hp=0;}
    return;}
  if(b.state==='intro'){
    bossIntro(b,50);b.face=(P.x+4<b.x+30)?-1:1;
    if(b.t%5===0)parts.push({k:'smoke',x:b.x+(b.face<0?50:10),y:b.y+2,vx:rand(-0.2,0.2),vy:rand(-1.2,-0.6),life:40,maxl:40,size:rand(2,3.5)});
    if(b.state==='fight')b.cd=45;
    return;}
  if(b.state==='dying'){bossDeathTick(b);if(b.t>=130)bossDone(b);return;}
  const ph2=b.hp<b.max*0.5;
  if(ph2&&b.t%7===0)parts.push({k:'smoke',x:b.x+rand(20,44),y:b.y+4,vx:rand(-0.2,0.2),vy:rand(-0.8,-0.4),life:50,maxl:50,size:rand(2,4)});
  if(b.burst<=0){b.x+=b.dir*(ph2?0.75:0.45);if(b.x<b.lo){b.x=b.lo;b.dir=1;}if(b.x>b.hi){b.x=b.hi;b.dir=-1;}bossCrush(b);}
  b.face=(P.x+4<b.x+30)?-1:1;
  if(b.burst>0){
    if(--b.bt<=0){const sx=b.face<0?b.x-3:b.x+b.w+3;
      eproj.push({kind:'bullet',x:sx,y:GROUND-17,vx:b.face*2.8,vy:0,g:0,r:1.6,t:0});SFX.eshoot();
      parts.push({k:'flash',x:sx,y:GROUND-17,life:3,maxl:3,size:4});b.burst--;b.bt=ph2?4:6;}
  }else if(--b.cd<=0){
    const atks=ph2?['shell','mg','shell','mg']:['shell','mg','shell']; // jefe chico: sin drones
    const a=atks[b.seq++%atks.length];
    if(a==='shell'){const n=ph2?3:1;
      for(let i=0;i<n;i++){const cx=b.face<0?b.x-2:b.x+b.w+2,cy=b.y+9,tx=P.x+4+(i-(n-1)/2)*30;
        eproj.push({kind:'shell',x:cx,y:cy,vx:(tx-cx)/74,vy:-4,g:0.12,r:3,blast:22,t:0});}
      noise(0.3,0.25,600);shake=Math.max(shake,2);b.cd=ph2?80:110;}
    else if(a==='mg'){b.burst=ph2?14:10;b.bt=24;b.cd=ph2?70:100;}
    else{enemies.push(mkDrone(camX+VW+10,40),mkDrone(camX-20,55));b.cd=90;}
  }
  bossContact(b);
}
// Jefe 2: LIBÉLULA DE HIERRO — cañonera voladora. Dispara en abanico, tira minas y hace pasadas rasantes (agachate).
function updBoss2(b){
  b.t++;b.mt++;if(b.flash>0)b.flash--;const A=b.A,ph2=b.hp<b.max*0.5;
  if(b.state==='enter'){b.x-=1.3;b.face=-1;b.y=b.baseY+Math.sin(b.t/20)*4;
    if(b.t%10===0)tone('sawtooth',180,150,0.12,0.03);
    if(b.x<=A+200){b.state='intro';b.t=0;b.hp=0;}return;}
  if(b.state==='intro'){bossIntro(b,50);b.face=P.x+4<b.x+b.w/2?-1:1;b.y=b.baseY+Math.sin(b.t/25)*6;
    if(b.state==='fight'){b.mt=0;b.cd=45;}return;}
  if(b.state==='dying'){
    bossDeathTick(b);b.vy+=0.05;b.y+=b.vy;b.x+=b.face*0.5;b.rot+=0.03*-b.face;
    if(b.y>=GROUND-b.h||b.t>=160)bossDone(b);return;
  }
  if(ph2&&b.t%9===0)parts.push({k:'smoke',x:b.x+rand(10,40),y:b.y+4,vx:rand(-0.2,0.2),vy:rand(-0.6,-0.2),life:45,maxl:45,size:rand(2,3.5)});
  const cxp=P.x+4,bcx=b.x+b.w/2;
  switch(b.mode){
  case 'hover':{
    b.face=cxp<bcx?-1:1;
    const tx=A+160+Math.sin(b.t/90)*110-b.w/2;b.x+=clamp(tx-b.x,-1.2,1.2);b.y=b.baseY+Math.sin(b.t/25)*6;
    if(--b.cd<=0){
      const atks=ph2?['spread','dive','mines','spread','dive']:['spread','dive','spread','mines']; // jefe chico: sin drones
      const a=atks[b.seq++%atks.length];
      if(a==='spread'){const n=ph2?7:5,base=Math.atan2(P.y+9-(b.y+b.h),cxp-bcx);
        for(let i=0;i<n;i++){const ang=base+(i-(n-1)/2)*0.16;eproj.push({kind:'bullet',x:bcx,y:b.y+b.h,vx:Math.cos(ang)*2.1,vy:Math.sin(ang)*2.1,g:0,r:1.6,t:0});}
        SFX.eshoot();parts.push({k:'flash',x:bcx,y:b.y+b.h,life:4,maxl:4,size:5});b.cd=ph2?70:95;}
      else if(a==='dive'){b.mode='tele';b.mt=0;SFX.alarm();}
      else if(a==='mines'){b.mode='mines';b.mt=0;b.drops=0;b.dir=bcx<A+160?1:-1;}
      else{enemies.push(mkDrone(camX+VW+10,45),mkDrone(camX-20,60));b.cd=90;}
    }
    break;}
  case 'tele':b.x+=Math.sin(b.mt)*0.6;if(b.mt>=45){b.mode='dive';b.dir=bcx<A+160?1:-1;b.face=b.dir;}break;
  case 'dive':{
    const low=GROUND-34;
    if(b.y<low)b.y=Math.min(low,b.y+2.4);
    else{b.x+=b.dir*(ph2?3.2:2.6);if(T%3===0)parts.push({k:'smoke',col:'170,190,210',x:b.x+b.w/2,y:GROUND-2,vx:-b.dir*rand(0.5,1.5),vy:rand(-0.4,-0.1),life:20,maxl:20,size:rand(1.5,2.5)});}
    if((b.dir>0&&b.x>=A+W-b.w-6)||(b.dir<0&&b.x<=A+6)){b.mode='rise';}
    break;}
  case 'rise':b.y-=1.4;if(b.y<=b.baseY){b.y=b.baseY;b.mode='hover';b.cd=60;}break;
  case 'mines':
    b.x+=b.dir*1.8;b.face=b.dir;b.y=b.baseY+Math.sin(b.t/25)*3;
    if(b.mt%16===0&&b.drops<(ph2?6:4)){b.drops++;eproj.push({kind:'bomb',x:bcx,y:b.y+b.h,vx:b.dir*0.4,vy:0.4,g:0.1,r:2.5,blast:16,t:0});SFX.toss();}
    if((b.dir>0&&b.x>=A+W-b.w-10)||(b.dir<0&&b.x<=A+10)||b.drops>=(ph2?6:4)&&b.mt>100){b.mode='hover';b.cd=50;}
    break;
  }
  bossContact(b);
}
function blastFx(b){explodeFx(b.x+b.w/2,b.y+b.h/2,40);for(let i=0;i<20;i++)parts.push({k:'p',x:b.x+b.w/2,y:b.y+b.h/2,vx:rand(-3,3),vy:rand(-4,-1),g:0.15,life:rand(40,70),maxl:70,size:rand(1.5,3),col:i%2?'#8c3b2a':'#2a2a30'});}

function drawBoss(b){
  const fl=b.flash>0,C=c=>fl?'#fff':c;
  ctx.save();ctx.translate(q(b.x),q(b.y));if(b.face>0){ctx.translate(b.w,0);ctx.scale(-1,1);}
  ctx.fillStyle=C('#24232a');ctx.fillRect(2,34,56,12);
  ctx.fillStyle=C('#15141a');const o=(b.t>>2)%4;for(let i=0;i<14;i++){ctx.fillRect(3+i*4+(b.dir<0?-o:o)%4+2,34,1.5,1.5);ctx.fillRect(3+i*4+(b.dir<0?o:-o)%4+2,44.5,1.5,1.5);}
  ctx.fillStyle=C('#3d3c46');for(let i=0;i<6;i++)circle(8+i*9,40,3.5);
  ctx.fillStyle=C('#1d1c22');for(let i=0;i<6;i++)circle(8+i*9,40,1.2);
  ctx.fillStyle=C('#8c3b2a');ctx.beginPath();ctx.moveTo(0,34);ctx.lineTo(6,16);ctx.lineTo(56,16);ctx.lineTo(60,34);ctx.closePath();ctx.fill();
  ctx.fillStyle=C('#b3543a');ctx.fillRect(7,17,48,2);
  ctx.fillStyle=C('#5e2419');for(let i=0;i<5;i++){ctx.fillRect(12+i*9,22,1,1);ctx.fillRect(12+i*9,30,1,1);}
  for(let i=0;i<8;i++){ctx.fillStyle=fl?'#fff':i%2?'#1d1a1c':'#d9a43a';ctx.fillRect(18+i*4,25,4,3);}
  ctx.fillStyle=C('#222');ctx.fillRect(-3,27,7,4);
  ctx.fillStyle=b.burst>0&&b.bt>6&&(T>>1)%2?'#ffef9a':C('#ff5a3c');ctx.fillRect(-3,28,2,2);
  ctx.fillStyle=C('#6e2e22');ctx.fillRect(18,4,26,13);ctx.fillStyle=C('#8c3b2a');ctx.fillRect(18,4,26,2);
  ctx.fillStyle=C('#2a2a30');ctx.fillRect(-2,8,22,4);ctx.fillStyle=C('#1c1c22');ctx.fillRect(-5,7,4,6);
  ctx.fillStyle=(b.burst>0&&(T>>2)%2)?'#fff':'#ff3b30';ctx.fillRect(22,8,4,3);
  ctx.strokeStyle=C('#2a2a30');ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(40,4);ctx.lineTo(43,-6);ctx.stroke();
  ctx.fillStyle=(T>>4)%2?'#ff3b30':'#5a1a14';ctx.fillRect(42.5,-7,1.5,1.5);
  ctx.restore();
}
function drawBoss2(b){
  const fl=b.flash>0,C=c=>fl?'#fff':c,tele=b.mode==='tele';
  if(b.state!=='dying'){ // reflector hacia el suelo
    ctx.fillStyle='rgba(255,240,190,0.07)';ctx.beginPath();ctx.moveTo(b.x+b.w/2-3,b.y+b.h);ctx.lineTo(b.x+b.w/2-22,GROUND);ctx.lineTo(b.x+b.w/2+22,GROUND);ctx.lineTo(b.x+b.w/2+3,b.y+b.h);ctx.fill();
    ctx.fillStyle='rgba(255,240,190,0.12)';ctx.beginPath();ctx.ellipse(b.x+b.w/2,GROUND+1,22,2.5,0,0,7);ctx.fill();}
  ctx.save();ctx.translate(q(b.x+b.w/2),q(b.y+b.h/2));ctx.rotate(b.rot);ctx.translate(-b.w/2,-b.h/2);
  if(b.face>0){ctx.translate(b.w,0);ctx.scale(-1,1);}
  // cola segmentada
  for(let i=0;i<6;i++){ctx.fillStyle=C(i%2?'#2a3542':'#3a4a5a');const h=5-i*0.55;ctx.fillRect(28+i*4.6,8.5-h/2+Math.sin(b.t/10+i)*0.4,5,h);}
  ctx.fillStyle=C('#ff5a3c');ctx.fillRect(55,7.5,2,2);
  // alas (rotores) batiendo
  const fl1=Math.abs(Math.sin(b.t*0.9)),fl2=Math.abs(Math.cos(b.t*0.9));
  ctx.fillStyle='rgba(180,220,240,0.32)';ctx.strokeStyle='rgba(200,235,255,0.5)';ctx.lineWidth=0.5;
  for(const [x,a] of [[14,fl1],[28,fl2]]){ctx.beginPath();ctx.ellipse(x,1,14,0.8+a*2.6,0,0,7);ctx.fill();ctx.stroke();}
  // cuerpo
  ctx.fillStyle=C('#4a5a6a');ctx.beginPath();ctx.ellipse(18,10,16,7,0,0,7);ctx.fill();
  ctx.fillStyle=C('#6a7e92');ctx.fillRect(8,4.5,20,1.5);
  ctx.fillStyle=C('#2e3a46');ctx.fillRect(10,13,18,3);
  for(let i=0;i<4;i++){ctx.fillStyle=fl?'#fff':i%2?'#1d1a1c':'#d9a43a';ctx.fillRect(14+i*3,11,3,1.6);}
  // cañones
  ctx.fillStyle=C('#1d222a');ctx.fillRect(12,16,8,3);ctx.fillRect(6,17,7,1.4);
  // ojo/cabina
  ctx.fillStyle='#120c18';circle(5,9,5.6);
  ctx.fillStyle=tele&&(T>>1)%2?'#ffffff':C('#ff5a3c');circle(5,9,4.8);
  ctx.fillStyle='rgba(255,255,255,0.6)';ctx.fillRect(3,6,2,1.4);
  ctx.restore();
}


// ================== villanos: pelean solos en la arena final de cada misión ==================
// Plataformas de la arena (las lee en vivo de `platforms`; si no hay, pelean en el suelo).
function arenaPlats(A){return platforms.filter(pl=>pl.x+pl.w>A+10&&pl.x<A+W-10&&pl.y<GROUND-8);}
// Nivel donde está parado el jugador: la plataforma, null si es el suelo, undefined si está en el aire.
function playerLvl(){const o=P.ride||P;return o.onGround?(o.plat||null):undefined;}
// Premio por cada jefe derrotado: +1 vida y salud llena, con cartel y sonido.
function bossReward(b){
  const rcV=lives,rcH=players.map(p=>p.hp); // recolectar.js: la vida y la salud vuelan al HUD
  const got=gainLife(),o=P.ride||P;let heal=false;
  eachPlayer(p=>{if(!p.dead){p.hp=maxHp;heal=true;}}); // salud llena para todos los que siguen vivos
  toast(got?'¡+1 VIDA!':'¡+1000!','Venciste a '+b.name+(heal?' · salud llena':''),'#7dff9a');
  parts.push({k:'txt',s:got?'¡+1 VIDA!':'+1000',x:o.x+o.w/2,y:o.y-10,life:90,maxl:90});
  later(250,SFX.medal);
  RC_jefe(rcV,rcH,o);
}
// Fin de la animación de muerte. Jefe chico: suelta un arma y se abre la arena. Villano: misión cumplida.
function bossDone(b){
  b.gone=true;blastFx(b);eproj.length=0;
  if(bossRef===b)bossRef=null;
  bossReward(b);
  if(b.mini){
    const A=b.A;pickups.push({kind:pick(['H','S','F','R']),x:clamp(b.x+b.w/2-5,A+20,A+W-30),y:Math.min(b.y+b.h/2,GROUND-20),w:10,h:10,vy:-2.5,life:900});
    arenaClear();playMusic(L.music);return;}
  winT=1;
}
// Intro común: la barra se llena (no se le puede pegar todavía) y arranca la pelea.
function bossIntro(b,dur){
  if(b.t===1){setBanner(b.name,120);playMusic('boss');shake=Math.max(shake,5);}
  b.hp=Math.min(b.max,b.max*b.t/dur);
  if(b.t%4===0&&b.hp<b.max)tone('square',300+b.hp/b.max*500,300+b.hp/b.max*500,0.03,0.02);
  if(b.t>=dur){b.hp=b.max;b.state='fight';b.mt=0;}
}

// ---------- MISIÓN 1 · DON BULÓN, el papá del Grillo ----------
// Robot de chatarra rojo óxido, el doble que el Grillo. Pisotón con onda (saltala), cañonazos en arco,
// y vuelo corto (10 s de combustible, 30 s para recargar) para subirse a un nivel o caer aplastando.
function mkBulon(A){return{type:'bulon',isBoss:true,A,x:A+190,y:-80,w:44,h:56,hp:0,max:300,state:'enter',t:0,mt:0,face:-1,flash:0,score:8000,
  mode:'walk',cd:60,seq:0,fuel:600,fmax:600,vx:0,vy:0,onGround:false,plat:null,noPlat:false,anim:0,sq:0,lift:0,raise:0,perch:null,waveT:0,stay:0,
  air:false,upd:updBulon,draw:drawBulon};}
function bulonWave(x,dir,sp,A){
  eproj.push({kind:'onda',x,y:GROUND,dir,sp,A,t:0,upd:updWave,draw:drawWave});
}
function updWave(o,hb){
  o.t++;o.x+=o.dir*o.sp;
  if(o.x<o.A-12||o.x>o.A+W+12||o.t>220){o.gone=true;return;}
  if(coverBlocks({x:o.x,y:GROUND-3,vx:o.dir*o.sp,vy:0,r:3,kind:'onda'})){o.gone=true;dust(o.x,GROUND,6);return;}
  if(o.t%3===0){dust(o.x,GROUND,1);if(Math.random()<0.4)parts.push({k:'p',x:o.x,y:GROUND-2,vx:rand(-0.6,0.6),vy:rand(-1.8,-0.6),g:0.15,life:18,maxl:18,size:1,col:'#7a5a40'});}
  if(hb&&hb.y+hb.h>GROUND-7&&hb.x<o.x+4&&hb.x+hb.w>o.x-4)hurtPlayer(1);
}
function drawWave(o){
  const x=q(o.x),d=o.dir,pul=(T>>1)%2,h=9;
  ctx.fillStyle='rgba(255,170,80,0.3)';ctx.beginPath();ctx.ellipse(x,GROUND,11,3,0,0,7);ctx.fill();
  ctx.fillStyle='#5a3a28';ctx.beginPath();ctx.moveTo(x-9*d,GROUND);ctx.lineTo(x-5*d,GROUND-4);ctx.lineTo(x-2*d,GROUND-3);ctx.lineTo(x+1*d,GROUND-h);ctx.lineTo(x+3*d,GROUND-6);ctx.lineTo(x+5*d,GROUND-7);ctx.lineTo(x+8*d,GROUND);ctx.closePath();ctx.fill();
  ctx.fillStyle='#8a5a3a';ctx.beginPath();ctx.moveTo(x-2*d,GROUND);ctx.lineTo(x+1*d,GROUND-h+2);ctx.lineTo(x+5*d,GROUND-5);ctx.lineTo(x+7*d,GROUND);ctx.closePath();ctx.fill();
  ctx.fillStyle=pul?'#ffe0a0':'#ff9a3c';ctx.fillRect(x+d-1,GROUND-h,2,1.5);ctx.fillRect(x+5*d-1,GROUND-7,1.5,1);ctx.fillRect(x-5*d-1,GROUND-4,1.5,1);
}
function bulonMuzzle(b){const lx=55,ly=23+b.sq-b.raise*6;return{x:b.face>0?b.x+lx:b.x+b.w-lx,y:b.y+ly};}
function bulonChimney(b){return{x:b.face>0?b.x+5:b.x+b.w-5,y:b.y-8+b.sq};}
// Golpe al caer: temblor, polvo y, si cae en el suelo, ondas para los dos lados.
function bulonImpact(b,big){
  shake=Math.max(shake,big?7:5);noise(0.5,0.4,300);tone('sine',70,30,0.5,0.2);
  for(let i=0;i<16;i++)parts.push({k:'smoke',col:'200,160,120',x:b.x+rand(0,b.w),y:b.y+b.h-1,vx:(i%2?1:-1)*rand(0.4,1.8),vy:rand(-0.5,-0.1),life:rand(18,32),maxl:32,size:rand(1.5,3.5)});
  if(!b.plat){const sp=b.hp<b.max*0.5?2.5:2.1;bulonWave(b.x+2,-1,sp,b.A);bulonWave(b.x+b.w-2,1,sp,b.A);}
  for(const a of allies)if(!a.gone&&overlap(a,b))killAlly(a);
}
function updBulon(b){
  b.t++;b.mt++;if(b.flash>0)b.flash--;const A=b.A,ph2=b.hp<b.max*0.5;
  const cx=b.x+b.w/2,pcx=(P.ride?P.ride.x+11:P.x+4),ch=bulonChimney(b);
  if(b.state==='enter'){
    if(b.t===1){setBanner('¡ALGO GRANDE SE ACERCA!',100);SFX.alarm();}
    if(b.t<60){shake=Math.max(shake,1.2);if(b.t%16===0)tone('sine',55,40,0.3,0.12);return;}
    b.vy=b.y+b.h>GROUND-40?Math.max(1.1,b.vy*0.92):Math.min(b.vy+0.1,2.6);b.y+=b.vy;b.air=true;
    if(T%2===0)dust(cx+rand(-14,14),GROUND,1);
    if(b.y+b.h>=GROUND){b.y=GROUND-b.h;b.vy=0;b.onGround=true;b.air=false;bulonImpact(b,true);eproj.length=0;b.state='intro';b.t=0;}
    return;
  }
  if(b.state==='intro'){
    bossIntro(b,70);b.face=pcx<cx?-1:1;b.sq=Math.max(0,b.sq-0.3);
    if(b.t%5===0)parts.push({k:'smoke',x:ch.x,y:ch.y,vx:rand(-0.2,0.2),vy:rand(-1.4,-0.8),life:50,maxl:50,size:rand(2,4)});
    if(b.t===20){tone('sawtooth',90,50,0.7,0.12);noise(0.6,0.15,400);}
    if(b.state==='fight'){b.mode='walk';b.cd=45;}
    return;
  }
  if(b.state==='dying'){
    b.vy=Math.min(b.vy+0.3,6);const pb=b.y+b.h;b.y+=b.vy;land(b,pb,true);
    bossDeathTick(b);if(b.t%3===0)spark(b.x+rand(4,40),b.y+rand(4,40));
    if(b.t%4===0)parts.push({k:'fire',x:ch.x,y:ch.y,vx:rand(-0.3,0.3),vy:rand(-1.5,-0.6),life:20,maxl:28,size:rand(2,4)});
    if(b.onGround)b.sq=Math.min(9,b.sq+0.08);
    if(b.t===90){shake=6;noise(0.6,0.3,500);}
    if(b.t>=150){for(let i=0;i<4;i++)explodeFx(b.x+rand(4,40),b.y+rand(6,50),rand(14,22));bossDone(b);}
    return;
  }
  // combustible: se gasta volando, se recarga en el piso (30 s de vacío a lleno)
  const flying=b.mode==='rise'||b.mode==='hover'||b.mode==='lock'||b.mode==='descend';
  if(flying){b.fuel=Math.max(0,b.fuel-1);if(T%2===0)parts.push({k:'fire',x:b.x+rand(10,34),y:b.y+b.h+1,vx:rand(-0.3,0.3),vy:rand(0.6,1.4),life:12,maxl:14,size:rand(1.5,3)});}
  else b.fuel=Math.min(b.fmax,b.fuel+b.fmax/1800);
  if(flying&&b.fuel<=0&&b.mode!=='descend'){b.mode='slam';b.mt=0;b.vy=1;setBanner('¡SE QUEDÓ SIN COMBUSTIBLE!',60);tone('square',300,80,0.4,0.06);}
  b.air=b.y+b.h<GROUND-14&&!b.onGround;
  if(T%(ph2?4:9)===0)parts.push({k:'smoke',col:ph2?'40,32,36':undefined,x:ch.x,y:ch.y,vx:rand(-0.2,0.3),vy:rand(-1.1,-0.5),life:45,maxl:45,size:rand(1.5,3)});
  if(ph2&&T%11===0)spark(b.x+rand(6,38),b.y+rand(10,36),'#ffb43a');
  const pl=arenaPlats(A),lv=playerLvl(),edgeL=A+4,edgeR=A+W-b.w-4;
  const ground=()=>{const pb=b.y+b.h,was=b.onGround,fall=b.vy;b.vy=Math.min(b.vy+0.35,8);b.y+=b.vy;land(b,pb,!b.noPlat);
    if(b.onGround&&!was){b.noPlat=false;if(fall>3)bulonImpact(b,fall>5);}};
  b.lift=Math.max(0,b.lift-0.8);b.raise=Math.max(0,b.raise-0.06);
  switch(b.mode){
  case 'walk':{
    b.sq=Math.max(0,b.sq-0.4);b.face=pcx<cx?-1:1;
    const d=pcx-cx,want=Math.abs(d)>56?Math.sign(d)*(ph2?0.5:0.35):Math.abs(d)<30?-Math.sign(d)*0.3:0;
    if(b.onGround&&want){b.x+=want;b.anim++;if(b.anim%26===0){SFX.step();shake=Math.max(shake,1.2);dust(b.x+(b.anim%52?10:34),GROUND,3);}}
    if(b.plat)b.x=clamp(b.x,b.plat.x-b.w/2+8,b.plat.x+b.plat.w-b.w/2-8);
    b.x=clamp(b.x,edgeL,edgeR);ground();
    if(b.onGround&&--b.cd<=0){
      let a;
      if(b.plat){a=(++b.stay>=2||lv===null&&Math.random()<0.5)?'drop':'shells';}
      else{const atks=ph2?['stomp','fly','shells','stomp','shells','fly']:['stomp','shells','fly','shells'];a=atks[b.seq++%atks.length];
        if(a==='fly'&&b.fuel<200)a=ph2?'stomp':'shells';}
      if(a==='stomp'){b.mode='stompT';b.mt=0;tone('square',660,660,0.08,0.05);}
      else if(a==='shells'){b.mode='shellsT';b.mt=0;b.shots=0;}
      else if(a==='drop'){b.mode='dropT';b.mt=0;b.stay=0;tone('square',500,500,0.08,0.05);}
      else{b.mode='flyT';b.mt=0;tone('sawtooth',120,420,0.6,0.05);
        // si hay niveles en la arena, a veces se sube a uno; si el jugador está arriba, cae sobre él
        const free=pl.filter(p=>p.w>=24&&p!==lv);
        b.perch=(lv===null||lv===undefined)&&free.length&&Math.random()<0.45?pick(free):null;}
    }
    break;}
  case 'stompT':{const n=ph2?28:40;b.sq=Math.min(4,b.sq+0.3);b.lift=Math.min(12,b.mt*0.5);
    if(b.mt%10===0)tone('square',660,660,0.06,0.04);ground();
    if(b.mt>=n){b.mode='stomp';b.mt=0;b.lift=0;bulonImpact(b,false);b.waveT=ph2?26:0;}
    break;}
  case 'stomp':ground();b.sq=Math.max(0,b.sq-0.2);
    if(b.waveT&&b.mt===b.waveT){bulonImpact(b,false);b.waveT=0;}
    if(b.mt>=(ph2?50:36)){b.mode='walk';b.cd=ph2?50:75;}break;
  case 'shellsT':{ground();b.raise=Math.min(1,b.raise+0.08);const n=ph2?3:2,gap=14;
    if(b.mt>=30&&(b.mt-30)%gap===0&&b.shots<n){
      const m=bulonMuzzle(b),tx=pcx+(b.shots-(n-1)/2)*34;
      eproj.push({kind:'shell',x:m.x,y:m.y,vx:clamp((tx-m.x)/74,-3.2,3.2),vy:-4,g:0.12,r:3,blast:22,t:0});
      parts.push({k:'flash',x:m.x,y:m.y,life:4,maxl:4,size:6});noise(0.3,0.25,600);shake=Math.max(shake,2);b.x-=b.face*1.5;b.shots++;}
    if(b.shots>=n&&b.mt>=30+n*gap+10){b.mode='walk';b.cd=ph2?55:80;}
    b.x=clamp(b.x,edgeL,edgeR);break;}
  case 'flyT':ground();b.sq=Math.min(6,b.sq+0.3);
    if(b.mt%6===0)parts.push({k:'smoke',col:'30,24,28',x:ch.x,y:ch.y,vx:rand(-0.3,0.3),vy:rand(-1.6,-1),life:40,maxl:40,size:rand(2.5,4)});
    if(b.mt%3===0)parts.push({k:'fire',x:b.x+rand(8,36),y:GROUND-1,vx:rand(-0.6,0.6),vy:rand(-0.3,0),life:8,maxl:12,size:rand(1,2.5)});
    if(b.mt>=36){b.mode='rise';b.mt=0;b.vy=-2.4;b.onGround=false;b.plat=null;noise(0.4,0.2,1200);dust(cx,GROUND,10);}
    break;
  case 'rise':{b.sq=Math.max(0,b.sq-0.5);const top=Math.max(6,b.perch?b.perch.y-b.h-34:GROUND-b.h-62);
    b.y+=b.vy;b.vy=Math.min(-0.8,b.vy+0.03);if(b.y<=top){b.y=top;b.mode='hover';b.mt=0;}break;}
  case 'hover':{
    const tgt=b.perch?b.perch.x+b.perch.w/2:pcx,lvY=lv?lv.y:GROUND;
    b.face=pcx<cx?-1:1;b.x=clamp(b.x+clamp(tgt-cx,-1.4,1.4),edgeL,edgeR);
    const top=Math.max(6,b.perch?b.perch.y-b.h-34:Math.min(GROUND,lvY)-b.h-60);b.y+=clamp(top-b.y,-1,1)+Math.sin(b.t/8)*0.3;
    if(b.perch){if(Math.abs(tgt-cx)<2||b.mt>140){b.mode='descend';b.mt=0;}}
    else if(b.mt>=(ph2?55:75)){b.mode='lock';b.mt=0;SFX.alarm();}
    break;}
  case 'descend':b.vy=1;const pb0=b.y+b.h;b.y+=b.vy;land(b,pb0,true);
    if(b.onGround){b.mode='walk';b.cd=40;b.stay=0;shake=Math.max(shake,3);dust(cx,b.y+b.h,8);noise(0.25,0.2,500);}
    else if(b.y+b.h>=GROUND-1){b.mode='walk';b.cd=40;}
    break;
  case 'lock':b.x+=Math.sin(b.mt*1.3)*0.5;if(b.mt>=(ph2?24:32)){b.mode='slam';b.mt=0;b.vy=2;tone('sawtooth',600,90,0.4,0.06);}break;
  case 'slam':{const pb=b.y+b.h;b.vy=Math.min(b.vy+0.6,8);b.y+=b.vy;land(b,pb,true);
    if(b.onGround){bulonImpact(b,true);b.mode='recover';b.mt=0;b.sq=7;}break;}
  case 'dropT':ground();b.sq=Math.min(5,b.sq+0.4);if(b.mt>=26){b.mode='drop';b.mt=0;b.vy=-3.6;b.noPlat=true;b.onGround=false;b.vx=clamp((pcx-cx)/40,-1.6,1.6);}break;
  case 'drop':b.x=clamp(b.x+b.vx,edgeL,edgeR);ground();if(b.onGround){b.mode='recover';b.mt=0;b.sq=7;}break;
  case 'recover':ground();b.sq=Math.max(0,b.sq-0.2);
    if(b.mt%8===0)parts.push({k:'smoke',col:'230,230,235',x:b.x+rand(6,38),y:b.y+rand(20,34),vx:rand(-0.4,0.4),vy:rand(-0.8,-0.3),life:25,maxl:25,size:rand(1.5,2.5)});
    if(b.mt>=(ph2?30:45)){b.mode='walk';b.cd=ph2?40:60;}break;
  }
  bossContact(b);
}
function drawBulon(b){
  const fl=b.flash>0||(b.state==='dying'&&(T>>2)%2),C=c=>fl?'#fff':c,dead=b.state==='dying';
  const tele=b.mode==='stompT'||b.mode==='shellsT'||b.mode==='flyT'||b.mode==='dropT'||b.mode==='lock';
  const jets=!dead&&(b.mode==='rise'||b.mode==='hover'||b.mode==='lock'||b.mode==='descend'||(b.state==='enter'&&b.t>=60));
  // sombra en el suelo mientras vuela, y marca roja cuando está por caer
  if(!dead&&b.y+b.h<GROUND-6&&b.y>-60){const cx=b.x+b.w/2,s=clamp(1-(GROUND-b.y-b.h)/150,0.35,1);
    ctx.fillStyle=`rgba(18,12,24,${0.4*s})`;ctx.beginPath();ctx.ellipse(cx,GROUND+0.5,14+10*s,2.2,0,0,7);ctx.fill();
    if(b.mode==='lock'||b.mode==='slam'||(b.state==='enter'&&b.t>=60)){const on=(T>>2)%2;ctx.fillStyle=on?'#ff3b30':'#8a1a14';
      ctx.fillRect(q(b.x),GROUND-4,7,2);ctx.fillRect(q(b.x),GROUND-4,2,4);ctx.fillRect(q(b.x+b.w-7),GROUND-4,7,2);ctx.fillRect(q(b.x+b.w-2),GROUND-4,2,4);
      if(on){ctx.fillRect(q(cx-1),GROUND-8,2,3);ctx.fillRect(q(cx-0.5),GROUND-4,1,1);}}}
  ctx.save();ctx.translate(q(b.x),q(b.y));if(b.face<0){ctx.translate(b.w,0);ctx.scale(-1,1);}
  const sq=b.sq,walkPh=b.anim*0.24,mv=b.mode==='walk'&&b.onGround&&b.anim%2===0;
  ctx.lineCap='round';
  // patas: rodilla hacia adelante (el Grillo las tiene hacia atrás)
  const legs=[[15,13,'#4a2a22','#6a3e30'],[29,31,'#6e3a2c','#94573e']];
  legs.forEach(([hx,fx0,c1,c2],i)=>{
    const hy=30+sq;let fx=fx0,fy=56;
    if(jets||(!b.onGround&&b.state==='fight')){fy=50;fx=fx0+(i?2:-2);}
    else{const s=Math.sin(walkPh+(i?Math.PI:0));if(b.mode==='walk'){fx+=s*4;fy-=Math.max(0,Math.cos(walkPh+(i?Math.PI:0)))*2*(b.anim>0?1:0);}
      if(i===1&&b.lift>0){fy=56-b.lift;fx+=b.lift*0.3;}}
    const dx=fx-hx,dy=fy-hy,l=Math.hypot(dx,dy)||1,seg=15,bend=Math.sqrt(Math.max(0,seg*seg-l*l/4));
    const kx=(hx+fx)/2+dy/l*bend,ky=(hy+fy)/2-dx/l*bend;
    ctx.strokeStyle=C('#1d1418');ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(kx,ky);ctx.lineTo(fx,fy-5);ctx.stroke();
    ctx.strokeStyle=C(c1);ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(kx,ky);ctx.stroke();
    ctx.strokeStyle=C(c2);ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(kx,ky);ctx.lineTo(fx,fy-4);ctx.stroke();
    ctx.strokeStyle=C('#d9a43a');ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(hx-3,hy+3);ctx.lineTo(fx-3,fy-5);ctx.stroke(); // pistón
    ctx.fillStyle=C(i?'#a8402a':'#7a2a1c');circle(kx,ky,3.4);ctx.fillStyle=C('#e8c040');circle(kx,ky,1.2);
    ctx.fillStyle=C('#24181a');ctx.fillRect(fx-8,fy-4,16,4);ctx.fillStyle=C('#5a3a30');ctx.fillRect(fx-7,fy-4,14,1);ctx.fillStyle=C('#3a2a24');ctx.fillRect(fx+7,fy-3,3,3);ctx.fillRect(fx-10,fy-2,2,2);
    if(jets){const f=rand(5,10);ctx.fillStyle='#ff8a2a';ctx.beginPath();ctx.moveTo(fx-4,fy);ctx.lineTo(fx+4,fy);ctx.lineTo(fx,fy+f);ctx.fill();
      ctx.fillStyle='#fff3b0';ctx.beginPath();ctx.moveTo(fx-2,fy);ctx.lineTo(fx+2,fy);ctx.lineTo(fx,fy+f*0.55);ctx.fill();}
  });
  // brazo de atrás: pinza
  const pin=Math.abs(Math.sin(b.t/12))*2;
  ctx.strokeStyle=C('#4a2a22');ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(7,15+sq);ctx.lineTo(2,25+sq);ctx.lineTo(4,32+sq);ctx.stroke();
  ctx.strokeStyle=C('#6a6a72');ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(4,32+sq);ctx.lineTo(0-pin,37+sq);ctx.lineTo(2,40+sq);ctx.moveTo(4,32+sq);ctx.lineTo(8+pin,37+sq);ctx.lineTo(6,40+sq);ctx.stroke();
  ctx.lineCap='butt';
  // chimenea
  ctx.fillStyle=C('#2a2a30');ctx.fillRect(2,-6+sq,6,17);ctx.fillStyle=C('#3a3a44');ctx.fillRect(1,-8+sq,8,2.5);
  ctx.fillStyle=b.mode==='flyT'&&(T>>1)%2?'#ffb43a':'#120c18';ctx.fillRect(2.5,-7.5+sq,5,1);
  // torso
  ctx.fillStyle=C('#a8402a');ctx.beginPath();ctx.moveTo(5,12+sq);ctx.lineTo(37,9+sq);ctx.lineTo(42,17+sq);ctx.lineTo(41,33+sq);ctx.lineTo(9,37+sq);ctx.lineTo(3,24+sq);ctx.closePath();ctx.fill();
  ctx.fillStyle=C('#d0623f');ctx.fillRect(7,11+sq,29,2);
  ctx.fillStyle=C('#6e2418');ctx.fillRect(10,31+sq,29,4);
  ctx.fillStyle=C('#7a3a2a');ctx.fillRect(12,14+sq,3,2);ctx.fillRect(25,33+sq,4,1.5);
  for(let i=0;i<7;i++){ctx.fillStyle=fl?'#fff':i%2?'#1d1a1c':'#e8c040';ctx.fillRect(11+i*4,27+sq,4,3);}
  ctx.fillStyle=C('#5e2419');for(const [rx,ry] of [[7,16],[8,30],[38,14],[38,30],[22,13]])ctx.fillRect(rx,ry+sq,1,1);
  ctx.fillStyle=C('#4a1810');for(let i=0;i<4;i++)ctx.fillRect(12,18+i*2+sq,9,1);
  // lámpara de aviso y medidor de combustible
  ctx.fillStyle=tele&&(T>>2)%2?'#ff3b30':'#5a1a14';circle(26,20+sq,1.8);
  ctx.fillStyle='#120c18';ctx.fillRect(31,17+sq,5,8);const fu=b.fuel/b.fmax;
  ctx.fillStyle=fu<0.34?((T>>3)%2?'#ff5a3c':'#a02a1a'):'#7dff9a';ctx.fillRect(32,18+sq+6*(1-fu),3,6*fu);
  // hombrera de atrás
  ctx.fillStyle=C('#7a2a1c');ctx.fillRect(0,8+sq,11,9);ctx.fillStyle=C('#a8402a');ctx.fillRect(1,8+sq,9,1.5);
  // cabeza con un ojo grande y antena doble
  ctx.fillStyle=C('#8c3b2a');ctx.fillRect(14,0+sq,16,11);ctx.fillStyle=C('#b3543a');ctx.fillRect(14,0+sq,16,2);
  ctx.fillStyle=C('#3a1a12');for(let i=0;i<3;i++)ctx.fillRect(16+i*2.5,8+sq,1.2,2);
  ctx.strokeStyle=C('#2a2a30');ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(17,sq);ctx.lineTo(14,-9+sq);ctx.moveTo(21,sq);ctx.lineTo(23,-8+sq);ctx.stroke();
  const ab=(T>>4)%2;ctx.fillStyle=dead?'#2a5a34':ab?'#7dff9a':'#2a5a34';ctx.fillRect(13.2,-10.5+sq,1.6,1.6);ctx.fillStyle=dead?'#2a5a34':ab?'#2a5a34':'#7dff9a';ctx.fillRect(22.2,-9.5+sq,1.6,1.6);
  ctx.fillStyle='#120c18';circle(26,5.5+sq,4.9);
  const ey=clamp(((P?P.y:GROUND)-(b.y+5))/40,-1.2,1.2);
  ctx.fillStyle=dead?((T>>1)%3?'#3a1a0a':'#ffcf5a'):tele&&(T>>1)%2?'#ffffff':'#ffcf5a';circle(26,5.5+sq,4);
  ctx.fillStyle=dead?'#3a1a0a':'#ff8a2a';circle(26.6,5.5+sq+ey*0.6,2.3);
  ctx.fillStyle='#2a0c06';circle(27.3,5.5+sq+ey,1.2);
  ctx.fillStyle='rgba(255,255,255,0.8)';ctx.fillRect(24,3+sq,1.5,1);
  // brazo de adelante: cañón (se levanta para los cañonazos)
  ctx.save();ctx.translate(38,14+sq);ctx.rotate(-b.raise*0.35);
  ctx.strokeStyle=C('#4a2a22');ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(3,7);ctx.stroke();ctx.lineCap='butt';
  ctx.fillStyle=C('#2a2a30');ctx.fillRect(-3,6,19,7);ctx.fillStyle=C('#c04a30');ctx.fillRect(2,6,2.5,7);
  ctx.fillStyle=C('#1a1a20');ctx.fillRect(14,5,4,9);
  ctx.fillStyle=b.mode==='shellsT'&&(T>>1)%2?'#ffef9a':'#3a1a12';ctx.fillRect(16,7,2,5);
  ctx.restore();
  // hombrera de adelante
  ctx.fillStyle=C('#c04a30');ctx.fillRect(32,7+sq,13,10);ctx.fillStyle=C('#e06a48');ctx.fillRect(33,7+sq,11,2);
  ctx.fillStyle=C('#6e2418');ctx.fillRect(34,15+sq,10,2);ctx.fillStyle=C('#e8c040');ctx.fillRect(35,11+sq,1,1);ctx.fillRect(42,11+sq,1,1);
  ctx.restore();
}

// ---------- MISIÓN 2 · SARGENTO CENIZA ----------
// Traje militar negro, máscara de soldador con visor de vidrio y tanque a la espalda.
// Chorro alto (agachate), chorro bajo (saltalo), bidones que dejan charcos de fuego, y salta entre niveles para perseguirte.
function mkCeniza(A){return{type:'ceniza',isBoss:true,A,x:A+250,y:-50,w:14,h:26,hp:0,max:180,state:'enter',t:0,mt:0,face:-1,flash:0,score:8000,
  mode:'walk',cd:50,seq:0,vx:0,vy:0,onGround:false,plat:null,noPlat:false,anim:0,kneel:0,ang:0,lvlT:0,pLvl:null,aim:0,shots:0,touch:1,noPush:true,
  air:false,upd:updCeniza,draw:drawCeniza};}
function cenNozzle(b){const lx=8+Math.cos(b.ang)*12.5,ly=13+b.kneel+Math.sin(b.ang)*12.5;return{x:b.face>0?b.x+lx:b.x+b.w-lx,y:b.y+ly};}
function cenFlame(x,y,vx,vy,o){eproj.push({kind:'fuego',x,y,vx,vy,rad:1.4,rmax:o.rmax||3.6,drag:o.drag||0.97,rise:o.rise||0,life:o.life||46,maxl:o.life||46,t:0,upd:updFlame,draw:drawFlame});}
function updFlame(f,hb){
  f.t++;f.vx*=f.drag;f.vy+=f.rise;f.x+=f.vx;f.y+=f.vy;f.rad+=(f.rmax-f.rad)*0.08;
  if(--f.life<=0){f.gone=true;if(Math.random()<0.5)parts.push({k:'smoke',x:f.x,y:f.y,vx:0,vy:-0.4,life:20,maxl:20,size:f.rad});return;}
  if(f.y>GROUND-f.rad){f.y=GROUND-f.rad;f.vy=0;}
  if(coverBlocks({x:f.x,y:f.y,vx:f.vx,vy:f.vy,r:f.rad,kind:'fuego'})){f.gone=true;parts.push({k:'smoke',x:f.x,y:f.y,vx:-f.vx*0.1,vy:-0.5,life:22,maxl:22,size:f.rad+1});return;}
  const r=f.rad*0.8;
  if(hb&&f.x+r>hb.x&&f.x-r<hb.x+hb.w&&f.y+r>hb.y&&f.y-r<hb.y+hb.h)hurtPlayer(1);
  for(const a of allies)if(!a.gone&&overlapPt(a,f.x,f.y,r))killAlly(a);
}
function drawFlame(f){
  const a=f.life/f.maxl,w=Math.sin(f.t*0.9+f.x)*0.5;
  ctx.fillStyle=a>0.75?'#fff3b0':a>0.5?'#ffb43a':a>0.25?'#ff6a2a':'rgba(140,50,40,0.6)';circle(f.x,f.y+w,f.rad);
  if(a>0.3){ctx.fillStyle=a>0.6?'#ffffff':'#ffe08a';circle(f.x-f.vx*0.3,f.y+w,f.rad*0.45);}
}
function cenPuddle(x,y,A,life){x=clamp(x,A+10,A+W-10);eproj.push({kind:'charco',x,y,w:20,t:0,life,upd:updPuddle,draw:drawPuddle});noise(0.3,0.12,900);}
function updPuddle(o,hb){
  o.t++;if(o.t>o.life){o.gone=true;return;}
  const hot=o.t>24&&o.t<o.life-15;
  if(hot&&o.t%3===0)parts.push({k:'fire',x:o.x+rand(-o.w/2+2,o.w/2-2),y:o.y-1,vx:rand(-0.15,0.15),vy:rand(-0.9,-0.4),life:rand(10,18),maxl:18,size:rand(1.2,2.4)});
  if(!hot&&o.t%6===0)parts.push({k:'smoke',x:o.x+rand(-6,6),y:o.y-2,vx:0,vy:-0.4,life:20,maxl:20,size:rand(1,2)});
  if(hot&&hb&&hb.x+hb.w>o.x-o.w/2+2&&hb.x<o.x+o.w/2-2&&hb.y+hb.h>=o.y-3&&hb.y+hb.h<=o.y+3)hurtPlayer(1);
}
function drawPuddle(o){
  const g=Math.min(1,o.t/24),fade=Math.min(1,(o.life-o.t)/30),hw=o.w/2;
  ctx.fillStyle=`rgba(30,18,16,${0.7*fade})`;ctx.beginPath();ctx.ellipse(o.x,o.y,hw*(0.5+g*0.5),1.6,0,0,7);ctx.fill();
  if(o.t<=24){if((T>>2)%2){ctx.fillStyle='#ff5a3c';ctx.fillRect(q(o.x-hw*0.5),o.y-1,hw,1);}return;}
  ctx.fillStyle=`rgba(255,140,60,${0.25*fade})`;ctx.beginPath();ctx.ellipse(o.x,o.y-2,hw+2,4,0,0,7);ctx.fill();
  for(let i=0;i<6;i++){const fx=o.x-hw+2+i*(o.w-4)/5,h=(3+Math.sin(T/4+i*1.7)*2+(i%2?1.5:0))*fade;
    ctx.fillStyle=i%2?'#ff6a2a':'#ffb43a';ctx.beginPath();ctx.moveTo(fx-2,o.y);ctx.lineTo(fx+2,o.y);ctx.lineTo(fx+Math.sin(T/5+i)*0.8,o.y-h-1);ctx.fill();
    ctx.fillStyle='#fff3b0';ctx.fillRect(q(fx-0.5),o.y-1.5,1,1.5);}
}
function cenCan(b,tx,ty){
  const n=cenNozzle(b),T0=46,g=0.15;
  eproj.push({kind:'bidon',x:b.x+b.w/2,y:b.y+8,vx:(tx-(b.x+b.w/2))/T0,vy:(ty-(b.y+8)-0.5*g*T0*T0)/T0,g,r:2,t:0,rot:0,A:b.A,ph2:b.hp<b.max*0.5,upd:updCan,draw:drawCan});
  SFX.toss();
}
function updCan(o,hb){
  o.t++;o.vy+=o.g;o.x+=o.vx;o.y+=o.vy;o.rot+=0.3;
  if(o.t%2===0)parts.push({k:'fire',x:o.x,y:o.y-2,vx:0,vy:-0.3,life:8,maxl:10,size:1.5});
  if(coverBlocks(o)){o.gone=true;explodeFx(o.x,o.y,8);return;}
  if(o.x<o.A-20||o.x>o.A+W+20||o.t>300){o.gone=true;return;}
  if(hb&&overlapPt(hb,o.x,o.y,o.r)){o.gone=true;hurtPlayer(1);for(let i=0;i<8;i++)parts.push({k:'fire',x:o.x,y:o.y,vx:rand(-1,1),vy:rand(-1.2,0),life:16,maxl:18,size:rand(1.5,3)});return;}
  const life=o.ph2?330:270;
  if(o.vy>0)for(const pl of platforms)if(o.x>pl.x+2&&o.x<pl.x+pl.w-2&&o.y>=pl.y&&o.y-o.vy<pl.y){o.gone=true;cenPuddle(clamp(o.x,pl.x+10,pl.x+pl.w-10),pl.y,o.A,life);return;}
  if(o.y>=GROUND-1){o.gone=true;cenPuddle(o.x,GROUND,o.A,life);}
}
function drawCan(o){
  ctx.save();ctx.translate(q(o.x),q(o.y));ctx.rotate(o.rot);
  ctx.fillStyle='#b8401e';ctx.fillRect(-1.5,-2,3,4.5);ctx.fillStyle='#e8e2d6';ctx.fillRect(-1.5,-0.3,3,1);
  ctx.fillStyle=(T>>1)%2?'#ffd25a':'#ff7a2a';ctx.fillRect(-0.8,-3.5,1.6,1.6);ctx.restore();
}
// salto con tiempo fijo hasta un punto (tx = centro, ty = superficie)
function cenJump(b,tx,ty,toPlat){
  const Tj=34,g=0.3,cx=b.x+b.w/2;b.vx=(tx-cx)/Tj;b.vy=(ty-(b.y+b.h)-0.5*g*Tj*Tj)/Tj;
  b.noPlat=!toPlat;b.onGround=false;b.plat=null;b.mode='jump';b.mt=0;tone('square',220,520,0.12,0.04);dust(cx,b.y+b.h,5);
}
function updCeniza(b){
  b.t++;b.mt++;if(b.flash>0)b.flash--;const A=b.A,ph2=b.hp<b.max*0.5;
  const cx=b.x+b.w/2,pcx=(P.ride?P.ride.x+11:P.x+4),pl=arenaPlats(A);
  const phys=(allow)=>{const pb=b.y+b.h,was=b.onGround,fall=b.vy;b.vy=Math.min(b.vy+0.3,7);b.y+=b.vy;land(b,pb,allow);
    if(b.onGround&&!was){b.noPlat=false;b.vx=0;dust(cx,b.y+b.h,fall>3?6:3);if(fall>3){shake=Math.max(shake,2);SFX.step();}}};
  if(b.state==='enter'){
    if(b.t===1){setBanner('¡OLOR A QUEMADO!',90);SFX.alarm();}
    if(b.t<70){if(b.t%9===0)noise(0.15,0.06,2500);if(b.t%3===0)parts.push({k:'fire',x:A+W-rand(0,40),y:rand(-4,10),vx:rand(-0.6,0),vy:rand(0.6,1.4),life:22,maxl:24,size:rand(1.5,3)});return;}
    b.face=-1;phys(false);b.air=true;
    if(b.onGround){b.air=false;shake=Math.max(shake,4);dust(cx,GROUND,10);noise(0.35,0.25,500);b.state='intro';b.t=0;b.kneel=5;}
    return;
  }
  if(b.state==='intro'){
    bossIntro(b,64);b.face=pcx<cx?-1:1;b.kneel=Math.max(0,b.kneel-0.25);b.ang=-1.1;
    if(b.t>18&&b.t<50){const n=cenNozzle(b);parts.push({k:'fire',x:n.x,y:n.y,vx:b.face*rand(0.2,0.8),vy:rand(-2.6,-1.6),life:rand(14,22),maxl:22,size:rand(2,3.5)});if(b.t%6===0)SFX.flame();}
    if(b.state==='fight'){b.mode='walk';b.cd=40;b.ang=0;}
    return;
  }
  if(b.state==='dying'){
    phys(true);b.kneel=Math.min(6,b.kneel+0.15);b.ang=Math.min(0.7,b.ang+0.04);
    if(b.t%3===0)parts.push({k:'fire',x:b.face>0?b.x+2:b.x+b.w-2,y:b.y+10+b.kneel,vx:rand(-0.3,0.3),vy:rand(-1.4,-0.5),life:18,maxl:22,size:rand(1.5,3)});
    if(b.t%5===0)spark(b.x+rand(0,14),b.y+rand(4,20),'#ffb43a');
    if(b.t%14===0)tone('square',900-b.t*4,700-b.t*4,0.06,0.04);
    if(b.t>=110){explodeFx(b.x+b.w/2,b.y+12,30);bossDone(b);}
    return;
  }
  // a qué nivel está el jugador (solo cuando está parado)
  const lv=playerLvl();if(lv!==undefined)b.pLvl=lv;
  const same=b.pLvl===b.plat;
  if(b.onGround&&!same&&(b.pLvl===null||pl.includes(b.pLvl)))b.lvlT++;else b.lvlT=0;
  b.air=!b.onGround;
  const keepIn=()=>{b.x=clamp(b.x,A+4,A+W-b.w-4);if(b.plat&&b.onGround)b.x=clamp(b.x,b.plat.x,b.plat.x+b.plat.w-b.w);};
  const nozzleFx=()=>{if(T%2===0){const n=cenNozzle(b);parts.push({k:'fire',x:n.x,y:n.y,vx:b.face*0.2,vy:-0.3,life:6,maxl:8,size:(T>>2)%2?2.2:1.2});}if(b.mt%8===0)noise(0.08,0.03,3000);};
  switch(b.mode){
  case 'walk':{
    b.face=pcx<cx?-1:1;b.kneel=Math.max(0,b.kneel-0.5);b.ang+=(0-b.ang)*0.2;
    const d=Math.abs(pcx-cx),sp=ph2?0.8:0.6;
    b.vx=!same?0:d>95?b.face*sp:d<50?-b.face*sp*0.8:0;
    if(b.onGround&&b.vx){b.x+=b.vx;b.anim++;}
    phys(!b.noPlat);keepIn();
    if(!b.onGround)break;
    // persigue al jugador entre niveles
    if(b.lvlT>(ph2?40:60)){b.lvlT=0;
      if(b.pLvl){cenJump(b,clamp(pcx,b.pLvl.x+8,b.pLvl.x+b.pLvl.w-8),b.pLvl.y,true);}
      else{const tx=clamp(pcx+(cx<pcx?-60:60),A+14,A+W-14);cenJump(b,tx,GROUND,false);}
      break;}
    if(--b.cd<=0){
      let a;const above=b.plat&&b.pLvl!==b.plat&&(b.pLvl===null||b.pLvl.y>b.plat.y);
      if(above)a=b.seq++%3===2?'cans':'angled';
      else if(!same)a='cans';
      else{const atks=ph2?['high','low','cans','low','high','hop']:['high','low','hop','cans','high','low'];a=atks[b.seq++%atks.length];}
      if(a==='hop'){const up=pl.filter(p=>p.w>=20);if(!b.plat&&up.length){const t=pick(up);cenJump(b,t.x+t.w/2,t.y,true);b.cd=30;break;}a='high';}
      b.mode=a;b.mt=0;b.shots=0;
    }
    break;}
  case 'jump':b.x+=b.vx;b.ang=-0.3;phys(!b.noPlat||b.y+b.h>GROUND-2);keepIn();
    if(b.onGround){b.mode='walk';b.cd=Math.max(b.cd,ph2?20:35);}break;
  case 'high':case 'low':case 'angled':{
    phys(true);const tel=ph2?22:30,low=b.mode==='low';
    if(b.mt<=tel){
      if(low){b.kneel=Math.min(5,b.kneel+0.5);b.ang+=(0.33-b.ang)*0.3;}
      else if(b.mode==='high'){b.kneel=0;b.ang+=(-0.5-b.ang)*0.3;}
      else{if(b.mt<tel-8){b.face=pcx<cx?-1:1;const n=cenNozzle(b),py=(P.ride?P.ride.y+14:P.y+9);
          b.aim=clamp(Math.atan2(py-n.y,Math.abs(pcx-n.x)),-0.2,1.2);}
        b.ang+=(b.aim-b.ang)*0.3;}
      nozzleFx();if(b.mt===tel)SFX.flame();break;}
    const dur=low?(ph2?16:12):b.mode==='angled'?36:(ph2?60:50),e=b.mt-tel;
    if(e%2===0){const n=cenNozzle(b);
      if(b.mode==='high')cenFlame(n.x,b.y+b.h-19,b.face*rand(2.9,3.2),0,{rise:-0.006,life:ph2?54:46});
      else if(low)cenFlame(n.x,b.y+b.h-4,b.face*rand(2.6,2.8),0,{drag:0.995,life:70,rmax:3.4});
      else cenFlame(n.x,n.y,b.face*Math.cos(b.ang)*3.1,Math.sin(b.ang)*3.1,{drag:0.99,life:56,rmax:3.2});
      if(e%8===0)SFX.flame();}
    b.x-=b.face*0.05;keepIn();
    if(e>=dur){
      if(low&&ph2&&b.shots<1){b.shots++;b.mt=tel-10;break;} // segunda ola baja
      b.mode='walk';b.cd=ph2?45:65;}
    break;}
  case 'cans':{
    phys(true);b.kneel=Math.max(0,b.kneel-0.5);b.ang+=(-0.9-b.ang)*0.2;const n=ph2?4:3;
    if(b.mt>=20&&(b.mt-20)%10===0&&b.shots<n){
      const lvY=b.pLvl?b.pLvl.y:GROUND,off=(b.shots-(n-1)/2)*26;let tx=pcx+off;
      if(b.pLvl)tx=clamp(tx,b.pLvl.x+4,b.pLvl.x+b.pLvl.w-4);
      cenCan(b,clamp(tx,A+12,A+W-12),lvY);b.shots++;}
    if(b.shots>=n&&b.mt>=20+n*10+8){b.mode='walk';b.cd=ph2?40:60;}
    break;}
  }
  bossContact(b);
}
function drawCeniza(b){
  const fl=b.flash>0||(b.state==='dying'&&(T>>2)%2),C=c=>fl?'#fff':c,k=b.kneel;
  const tele=(b.mode==='high'||b.mode==='low'||b.mode==='angled')&&b.state==='fight';
  // aviso del chorro en diagonal: línea punteada hacia donde va a tirar
  if(b.mode==='angled'&&b.state==='fight'&&b.mt<=(b.hp<b.max*0.5?22:30)&&(T>>2)%2){const n=cenNozzle(b),dx=b.face*Math.cos(b.ang),dy=Math.sin(b.ang);
    ctx.fillStyle='rgba(255,90,60,0.7)';for(let i=4;i<70;i+=5)ctx.fillRect(q(n.x+dx*i),q(n.y+dy*i),1,1);}
  ctx.save();ctx.translate(q(b.x),q(b.y));if(b.face<0){ctx.translate(b.w,0);ctx.scale(-1,1);}
  const air=!b.onGround&&b.state!=='intro',a=b.mode==='walk'&&b.vx?Math.sin(b.anim*0.25)*2:0;
  // piernas y botas
  if(air){ctx.fillStyle=C('#15151a');ctx.fillRect(3,18,3,5);ctx.fillRect(8,17,3,5);ctx.fillStyle=C('#3a2a20');ctx.fillRect(2,22,5,3);ctx.fillRect(8,21,5,3);}
  else if(k>2){ctx.fillStyle=C('#15151a');ctx.fillRect(2,18+k-2,4,6-k+2);ctx.fillRect(7,22,6,3);ctx.fillStyle=C('#3a2a20');ctx.fillRect(1,23,5,3);ctx.fillRect(11,23,3,3);}
  else{ctx.fillStyle=C('#15151a');ctx.fillRect(4-a*0.5,18+k,3,6-k);ctx.fillStyle=C('#1c1c22');ctx.fillRect(8+a*0.5,18+k,3,6-k);
    ctx.fillStyle=C('#3a2a20');ctx.fillRect(3-a*0.5,23,5,3);ctx.fillStyle=C('#4a3426');ctx.fillRect(8+a*0.5,23,5,3);}
  // tanque a la espalda
  ctx.fillStyle=C('#8c3b2a');ctx.fillRect(0,8+k,4,11);ctx.fillStyle=C('#b3543a');ctx.fillRect(0.5,8+k,1,11);
  ctx.fillStyle=fl?'#fff':'#1d1a1c';ctx.fillRect(0,12+k,4,1.2);ctx.fillStyle=C('#d9a43a');ctx.fillRect(0,14+k,4,1);
  ctx.fillStyle=C('#9a9aa0');ctx.fillRect(1,6.5+k,2,1.5);
  // torso: uniforme negro, chaleco, cinturón
  ctx.fillStyle=C('#1c1c22');ctx.fillRect(3,9+k,8,10);ctx.fillStyle=C('#2a2a34');ctx.fillRect(4,10+k,7,7);
  ctx.fillStyle=C('#3a3a46');ctx.fillRect(4,15+k,2,2);ctx.fillRect(8,15+k,2,2);
  ctx.fillStyle=C('#4a3a2a');ctx.fillRect(3,18+k,8,1.2);ctx.fillStyle=C('#d9a43a');ctx.fillRect(7,18+k,1.5,1.2);
  ctx.fillStyle=C('#8c3b2a');ctx.fillRect(5,9+k,4,1.2);
  // manguera
  ctx.strokeStyle=C('#3a3a30');ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(2,19+k);ctx.quadraticCurveTo(4,23+k,8,14+k);ctx.stroke();
  // cabeza: capucha y máscara de soldador con visor
  ctx.fillStyle=C('#22222a');ctx.fillRect(4,0+k,6,9);
  ctx.fillStyle=C('#4a4a52');ctx.beginPath();ctx.moveTo(7,0.5+k);ctx.lineTo(11,1.5+k);ctx.lineTo(12.2,5.5+k);ctx.lineTo(11.2,9+k);ctx.lineTo(7,9+k);ctx.closePath();ctx.fill();
  ctx.fillStyle=C('#5e5e68');ctx.fillRect(7.5,1+k,3,0.8);
  ctx.fillStyle='#120c18';ctx.fillRect(7.6,3.1+k,4.4,2.8);
  ctx.fillStyle=b.state==='dying'&&b.t>40?'#5a2a1a':'#1f4a34';ctx.fillRect(8,3.5+k,3.8,2);
  ctx.fillStyle=tele||b.mode==='cans'?((T>>1)%2?'#ffb43a':'#ff6a2a'):'#7fbf9a';ctx.fillRect(10.4,3.7+k,1,0.8);
  ctx.fillStyle=C('#9a9aa0');circle(5.5,4.5+k,0.8);
  ctx.fillStyle=C('#2a2a30');ctx.fillRect(8,7.4+k,3,0.6);
  // lanza de fuego
  ctx.save();ctx.translate(8,13+k);ctx.rotate(b.ang);
  ctx.fillStyle=C('#3a2a20');ctx.fillRect(-2,-1.5,3,3);ctx.fillRect(4,-0.5,2.5,2.5);
  ctx.fillStyle=C('#3a3a40');ctx.fillRect(0,-1,10,2);ctx.fillStyle=C('#5a5a64');ctx.fillRect(0,-1,10,0.6);
  ctx.fillStyle=C('#1a1a20');ctx.fillRect(9,-1.5,3,3);
  if(b.state!=='dying'){ctx.fillStyle=tele?((T>>1)%2?'#ffd25a':'#ff6a2a'):((T>>3)%2?'#7ab8ff':'#4a7ad0');circle(12.6,0,tele?1.3:0.7);}
  ctx.restore();
  ctx.restore();
}

// ===== ganchos que usa el resto del juego =====
// Por misión (índice = levelIdx): un jefe chico a mitad de camino y el villano en la arena final.
// make(A) recibe el borde izquierdo de la arena. La vida base se multiplica por la dificultad (DIFF().ehp).
const BOSSES=[
  {mini:{name:'ESCARABAJO DE ÓXIDO',make:mkBoss},villain:{name:'DON BULÓN',make:mkBulon}},
  {mini:{name:'LIBÉLULA DE HIERRO',make:mkBoss2},villain:{name:'SARGENTO CENIZA',make:mkCeniza}}];
function bossName(){return (bossRef&&bossRef.name)||(BOSSES[levelIdx]||BOSSES[0]).villain.name;}
// Arena final: sale directo el villano (la barra arranca vacía y se llena en su intro).
function spawnBoss(A){const d=(BOSSES[levelIdx]||BOSSES[0]).villain,v=d.make(A);v.name=d.name;v.isVillain=true;
  v.max=Math.max(1,Math.round(v.max*DIFF().ehp));v.hp=Math.min(v.hp,v.max);return v;}
function updBossAny(e){if(e.upd)e.upd(e);else if(e.type==='boss')updBoss(e);else if(e.type==='boss2')updBoss2(e);}
function drawBossAny(e){if(e.draw)e.draw(e);else if(e.type==='boss')drawBoss(e);else if(e.type==='boss2')drawBoss2(e);}
// Jefe chico a mitad de misión (arena con mini:true): el jefe viejo de la misión. Al caer, cierra la arena.
function spawnMiniBoss(A){const d=(BOSSES[levelIdx]||BOSSES[0]).mini,b=d.make(A);b.name=d.name;b.mini=true;
  b.max=Math.max(1,Math.round(b.max*DIFF().ehp));b.hp=b.max;return b;}
