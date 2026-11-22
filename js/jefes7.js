'use strict';
// Óxido · Misión 7: jefe chico (EL REMENDÓN) y villano (LA MARAÑA)
// Todo con prefijo J7_. Usa lo de mision7.js (M7_, ducto, raspadores).

const J7_sfx=(n,...a)=>{if(typeof SFX!=='undefined'&&SFX[n])SFX[n](...a);};

// =====================================================================
// JEFE CHICO · EL REMENDÓN — dron de mantenimiento que se volvió loco
// Caja amarilla con franjas, dos hélices, un ojo-cámara, soplete a un lado y pinza al otro.
// · Soldadura: baja el soplete, marca un punto azul en el piso y la llama corre por el piso (saltala).
// · Remaches: la remachadora gira y brilla, y tira un abanico de remaches.
// · Golpe al ducto: sube la pinza al techo, la rejilla tiembla y despierta raspadores que vienen por el ducto.
// Rabia al 50 %: más rápido, la soldadura va y vuelve y tira más remaches.
// =====================================================================
function J7_mkDron(A){return{type:'j7Dron',isBoss:true,air:true,A,x:A+W+30,y:58,w:28,h:16,hp:120,max:120,state:'enter',t:0,mt:0,face:-1,flash:0,score:3500,
  mode:'hover',cd:60,seq:0,arm:0,claw:0,gun:0,rage:false,beam:null,passes:0,tilt:0,vy:0,noPush:true,touch:1,upd:J7_updDron,draw:J7_drawDron};}
const J7_rivet=b=>{ctx.fillStyle='rgba(255,220,150,0.4)';circle(b.x,b.y,b.r+1);ctx.fillStyle='#c8ccd8';circle(b.x,b.y,b.r);ctx.fillStyle='#4a4e5a';ctx.fillRect(q(b.x-0.5),q(b.y-0.5),1,1);};
function J7_torch(b){return{x:b.face>0?b.x+b.w+2:b.x-2,y:b.y+b.h+6};}
function J7_updDron(b){
  b.t++;b.mt++;if(b.flash>0)b.flash--;
  const A=b.A,ph2=b.hp<b.max*0.5,pc=M7_pc(),cx=b.x+b.w/2;
  if(b.state==='enter'){b.x-=2.2;b.face=-1;if(b.t%12===0)J7_sfx('m7Zumbido');
    if(b.x<=A+200){b.x=A+200;b.state='intro';b.t=0;b.hp=0;J7_sfx('m7Laser');}return;}
  if(b.state==='intro'){bossIntro(b,50);b.face=pc.x<cx?-1:1;if(b.state==='fight'){b.cd=40;b.mode='hover';}return;}
  if(b.state==='dying'){
    b.vy=Math.min(b.vy+0.12,3);b.y=Math.min(GROUND-b.h,b.y+b.vy);b.tilt+=0.06;b.arm=0.6;b.claw*=0.9;
    if(b.t%7===0)explodeFx(b.x+rand(2,b.w-2),b.y+rand(0,b.h),rand(7,12));
    if(b.t%4===0)M7_spark(b.x+rand(0,b.w),b.y+b.h,2,'#bfe6ff');
    if(b.t%15===0)J7_sfx('m7Golpe');
    if(b.t>=120)bossDone(b);
    return;}
  if(ph2&&!b.rage){b.rage=true;setBanner('¡EL REMENDÓN SE DESCONTROLA!',80);J7_sfx('m7Laser');shake=Math.max(shake,4);}
  if(ph2&&T%7===0)parts.push({k:'smoke',col:'70,70,80',x:b.x+rand(4,b.w-4),y:b.y+2,vx:rand(-0.2,0.2),vy:rand(-0.7,-0.3),life:30,maxl:30,size:rand(1.4,2.4)});
  if(T%20===0)J7_sfx('m7Zumbido');
  const hoverY=58+Math.sin(b.t/22)*4;
  switch(b.mode){
  case 'hover':{
    b.face=pc.x<cx?-1:1;b.arm*=0.85;b.claw*=0.85;b.gun*=0.85;
    const tx=clamp(pc.x<A+W/2?pc.x+56:pc.x-56-b.w,A+10,A+W-b.w-10),sp=ph2?1.4:1;
    b.x+=clamp(tx-b.x,-sp,sp);b.y+=(hoverY-b.y)*0.08;
    if(--b.cd<=0){
      const s=ph2?['sweep','rivets','sweep','grate','rivets']:['sweep','rivets','grate','rivets','sweep'];
      let a=s[b.seq++%s.length];if(a==='grate'&&M7_nBichos()>=4)a='rivets';
      b.mt=0;
      if(a==='sweep'){b.mode='sweepT';b.passes=ph2?2:1;const t=J7_torch(b);b.beam={x:clamp(t.x,A+6,A+W-6),dir:Math.sign(pc.x-t.x)||b.face};J7_sfx('m7Laser');}
      else if(a==='rivets'){b.mode='rivetT';J7_sfx('m7Zumbido');}
      else{b.mode='grateT';}
    }
    break;}
  case 'sweepT':{const tel=ph2?28:40;b.arm=Math.min(1,b.mt/14);b.y+=(hoverY-b.y)*0.08;
    if(b.mt%6===0)M7_spark(b.beam.x,GROUND-1,1,'#9ad0ff');
    if(b.mt>=tel){b.mode='sweep';b.mt=0;J7_sfx('m7Soplete');}
    break;}
  case 'sweep':{
    const bm=b.beam,sp=ph2?2.1:1.5;bm.x+=bm.dir*sp;b.x+=bm.dir*sp*0.35;b.x=clamp(b.x,A+6,A+W-b.w-6);
    if(b.mt%2===0)parts.push({k:'p',x:bm.x,y:GROUND-1,vx:rand(-1.2,1.2),vy:rand(-1.8,-0.6),g:0.15,life:rand(10,18),maxl:18,size:1,col:pick(['#fff','#9ad0ff','#ffd27a'])});
    if(b.mt%10===0)J7_sfx('m7Soplete');
    const box={x:bm.x-3,y:GROUND-7,w:6,h:7};
    for(const p of players)if(!p.dead&&overlap(hurtbox(p),box))withP(p,()=>hurtPlayer(1));
    if(bm.x<A+4||bm.x>A+W-4||b.mt>200){
      if(--b.passes>0){b.mode='sweepT';b.mt=14;bm.dir=-bm.dir;bm.x=clamp(bm.x,A+6,A+W-6);}
      else{b.beam=null;b.mode='rec';b.mt=0;}}
    break;}
  case 'rivetT':{const tel=ph2?18:28;b.face=pc.x<cx?-1:1;b.gun=Math.min(1,b.mt/tel);b.y+=(hoverY-b.y)*0.08;
    if(b.mt>=tel){const n=ph2?5:3,mx=cx,my=b.y+b.h+2,base=Math.atan2(pc.y-my,pc.x-mx);
      for(let i=0;i<n;i++){const a=base+(i-(n-1)/2)*0.22,sp=2;eproj.push({kind:'bullet',x:mx,y:my,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,g:0,r:1.6,t:0,draw:J7_rivet});}
      J7_sfx('m7Remache');b.mode='rec';b.mt=10;}
    break;}
  case 'grateT':{
    b.y+=(42-b.y)*0.1;b.claw=Math.min(1,b.mt/16);
    const gs=M7_gratesIn(b.x-30,b.x+b.w+30);const g=gs.length?gs[0]:null;
    if(g!==null)M7.shk.set(g,Math.max(M7.shk.get(g)||0,8));
    if(b.mt%10===0)J7_sfx('m7Golpe');
    if(b.mt===40){const n=ph2?3:2;
      for(let i=0;i<n;i++)M7_ductBicho(i%2?A-30:A+W+30,false);
      setBanner('¡VIENEN POR EL DUCTO!',70);J7_sfx('m7Chillido');}
    if(b.mt>=56){b.mode='rec';b.mt=0;}
    break;}
  case 'rec':b.arm*=0.9;b.claw*=0.9;b.gun*=0.9;b.y+=(hoverY-b.y)*0.08;
    if(b.mt>=(ph2?24:38)){b.mode='hover';b.cd=ph2?36:56;}break;
  }
  b.x=clamp(b.x,A+2,A+W-b.w-2);
  bossContact(b);
}
function J7_drawDron(b){
  const fl=b.flash>0||(b.state==='dying'&&(T>>2)%2),C=c=>fl?'#fff':c,ph2=b.hp<b.max*0.5||b.state==='dying';
  const x=q(b.x),y=q(b.y),tele=b.mode==='sweepT'||b.mode==='rivetT'||b.mode==='grateT';
  // rayo de soldadura y su punto en el piso
  if(b.beam&&(b.mode==='sweep'||b.mode==='sweepT')){const t=J7_torch(b),bx=b.beam.x;
    if(b.mode==='sweep'){ctx.strokeStyle='rgba(150,210,255,0.7)';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(t.x,t.y);ctx.lineTo(bx,GROUND-1);ctx.stroke();
      ctx.strokeStyle='#fff';ctx.lineWidth=0.6;ctx.beginPath();ctx.moveTo(t.x,t.y);ctx.lineTo(bx,GROUND-1);ctx.stroke();
      ctx.fillStyle='rgba(150,210,255,0.4)';circle(bx,GROUND-2,5);ctx.fillStyle='#fff';circle(bx,GROUND-2,2);
      ctx.fillStyle='rgba(255,140,60,0.5)';ctx.fillRect(bx-b.beam.dir*16,GROUND-1,16*b.beam.dir,1);}
    else{const on=(T>>2)%2;ctx.strokeStyle=`rgba(150,210,255,${0.25+0.25*on})`;ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(t.x,t.y);ctx.lineTo(bx,GROUND-1);ctx.stroke();
      ctx.fillStyle=on?'#e0f4ff':'#5aa8ff';circle(bx,GROUND-1,1.6);ctx.strokeStyle='rgba(150,210,255,0.7)';ctx.lineWidth=0.6;ctx.beginPath();ctx.ellipse(bx,GROUND-1,6-((T%20)/20)*4,1.6,0,0,7);ctx.stroke();
      // flecha de hacia dónde va a correr
      ctx.fillStyle='#9ad0ff';const d=b.beam.dir;ctx.beginPath();ctx.moveTo(bx+d*12,GROUND-6);ctx.lineTo(bx+d*7,GROUND-8.5);ctx.lineTo(bx+d*7,GROUND-3.5);ctx.closePath();ctx.fill();ctx.fillRect(d>0?bx+3:bx-7,GROUND-6.6,4,1.2);}}
  ctx.fillStyle='rgba(0,0,0,0.3)';ctx.beginPath();ctx.ellipse(b.x+b.w/2,GROUND,12,1.4,0,0,7);ctx.fill();
  ctx.save();ctx.translate(x+b.w/2,y+b.h/2);if(b.tilt)ctx.rotate(b.tilt);if(b.face<0)ctx.scale(-1,1);ctx.translate(-b.w/2,-b.h/2);
  // hélices
  for(const hx of[5,23]){ctx.fillStyle=C('#2a2e38');ctx.fillRect(hx-0.6,-4,1.2,4);
    const s=Math.abs(Math.sin(T*0.9+hx));ctx.fillStyle='rgba(200,210,230,0.55)';ctx.fillRect(hx-6*s,-5,12*s,1);}
  // cuerpo
  ctx.fillStyle=C('#2a2e38');ctx.fillRect(-0.5,-0.5,29,17);
  ctx.fillStyle=C('#c8a040');ctx.fillRect(0,0,28,16);
  if(!fl){ctx.fillStyle='#e0c060';ctx.fillRect(0,0,28,1.2);ctx.fillStyle='#8a6a20';ctx.fillRect(0,14.5,28,1.5);
    ctx.save();ctx.beginPath();ctx.rect(1,10,18,4);ctx.clip();for(let i=-4;i<20;i+=4){ctx.fillStyle='#1a1a20';ctx.beginPath();ctx.moveTo(1+i,14);ctx.lineTo(3+i,10);ctx.lineTo(5+i,10);ctx.lineTo(3+i,14);ctx.fill();}ctx.restore();
    ctx.fillStyle='#6a5020';for(const[rx,ry]of[[2,2],[26,2],[2,8],[26,8]])ctx.fillRect(rx,ry,0.8,0.8);
    if(ph2){ctx.fillStyle='#4a3a18';ctx.fillRect(6,3,5,3);ctx.fillStyle='#1a1a20';ctx.fillRect(7,4,3,1);if((T>>2)%3===0){ctx.fillStyle='#bfe6ff';ctx.fillRect(9,2,1,1);}}}
  // ojo-cámara
  ctx.fillStyle=C('#1a1a20');circle(21,7,4.2);
  const eye=b.state==='dying'?'#333':(tele||ph2)?((T>>1)%2?'#ffe0d0':'#ff4030'):'#5af0c0';
  ctx.fillStyle=eye;circle(21,7,2.2);if(!fl){ctx.fillStyle='rgba(255,255,255,0.7)';ctx.fillRect(20,5.6,1,1);}
  // brazo del soplete (adelante, abajo)
  ctx.save();ctx.translate(24,16);ctx.rotate(0.9-b.arm*0.5);
  ctx.fillStyle=C('#4a4e5a');ctx.fillRect(0,-1,7,2);ctx.fillStyle=C('#2a2e38');ctx.fillRect(6,-1.5,3,3);
  if(b.arm>0.3&&b.state!=='dying'){ctx.fillStyle=(T>>1)%2?'#e0f4ff':'#5aa8ff';ctx.beginPath();ctx.moveTo(9,-1);ctx.lineTo(12+Math.random()*2,0);ctx.lineTo(9,1);ctx.fill();}
  ctx.restore();
  // pinza (atrás) que sube al techo
  ctx.save();ctx.translate(4,0);ctx.rotate(-Math.PI/2*b.claw-0.4*(1-b.claw)+Math.PI*0.5*(1-b.claw));
  ctx.fillStyle=C('#4a4e5a');ctx.fillRect(0,-1,8+b.claw*6,2);const op=b.claw>0.5?Math.sin(T/3)*0.4:0.2;
  ctx.fillStyle=C('#6a7080');ctx.save();ctx.translate(8+b.claw*6,0);ctx.rotate(-0.5-op);ctx.fillRect(0,-0.6,4,1.2);ctx.restore();
  ctx.save();ctx.translate(8+b.claw*6,0);ctx.rotate(0.5+op);ctx.fillRect(0,-0.6,4,1.2);ctx.restore();
  ctx.restore();
  // remachadora en la panza
  ctx.save();ctx.translate(14,16);ctx.fillStyle=C('#2a2e38');ctx.fillRect(-3,0,6,3);
  ctx.rotate(b.gun*T*0.4);ctx.fillStyle=C('#6a7080');for(let i=0;i<3;i++){ctx.rotate(Math.PI*2/3);ctx.fillRect(-0.5,1,1,2.5);}
  ctx.restore();
  if(b.gun>0.5&&(T>>1)%2){ctx.fillStyle='rgba(255,220,150,0.6)';circle(14,20,2.4);}
  ctx.restore();
}

// =====================================================================
// VILLANO · LA MARAÑA — una masa viva de cables y carne violeta pegada a la pared del reactor
// Sin cabeza: un bulto enorme lleno de bulbos naranjas que laten y un núcleo de anillos que se hincha.
// · Latigazo: un tentáculo de cables se levanta sobre una zona marcada en el piso (franjas naranjas) y la golpea.
// · Esporas: el núcleo se hincha y escupe bolas de luz en arco (sombra donde caen); se pueden reventar a tiros.
// · Crías: la masa se sacude y manda raspadores por el ducto del techo (con todo su aviso).
// Rabia al 50 %: dos latigazos seguidos, más esporas y más crías.
// =====================================================================
function J7_mkMar(A){return{type:'j7Mar',isBoss:true,A,x:A+262,y:GROUND-56,w:46,h:56,hp:0,max:320,state:'enter',t:0,mt:0,face:-1,flash:0,score:12000,
  mode:'idle',cd:60,seq:0,phase:0,grow:0,swell:0,shud:0,tents:[],dim:0,touch:1,noPush:true,upd:J7_updMar,draw:J7_drawMar};}
const J7_root=b=>({x:b.A+262,y:GROUND-46});
function J7_tent(b,tx,tel){b.tents.push({tx:clamp(tx,b.A+16,b.A+236),st:'rise',t:0,tel,k:0});J7_sfx('m7Tentaculo');}
function J7_updTents(b){
  for(const t of b.tents){t.t++;
    if(t.st==='rise'){t.k=Math.min(1,t.t/14);
      if(t.t>=t.tel){t.st='hit';t.t=0;shake=Math.max(shake,4);J7_sfx('m7Golpe');dust(t.tx,GROUND,6);
        for(let i=0;i<6;i++)parts.push({k:'p',x:t.tx+rand(-8,8),y:GROUND-1,vx:rand(-1.4,1.4),vy:rand(-2,-0.6),g:0.15,life:rand(16,26),maxl:26,size:1,col:pick(['#ffa040','#b45ae0','#fff3c0'])});}}
    else if(t.st==='hit'){
      if(t.t<=8){const box={x:t.tx-11,y:GROUND-20,w:22,h:20};for(const p of players)if(!p.dead&&overlap(hurtbox(p),box))withP(p,()=>hurtPlayer(1));
        for(const a of allies)if(!a.gone&&overlap(a,box))killAlly(a);}
      if(t.t>=22){t.st='back';t.t=0;}}
    else if(t.st==='back'){t.k=Math.max(0,1-t.t/18);if(t.t>=18)t.gone=true;}
  }
  b.tents=b.tents.filter(t=>!t.gone);
}
function J7_spore(b,tx){
  const r=J7_root(b),sx=r.x+14,sy=GROUND-52,Tt=50,g=0.13;
  eproj.push({kind:'j7Espora',x:sx,y:sy,vx:(tx-sx)/Tt,vy:(GROUND-3-sy-0.5*g*Tt*Tt)/Tt,g,r:2.4,t:0,upd:J7_sporeUpd,draw:J7_sporeDraw});
}
function J7_sporeUpd(o,hb){
  o.t++;o.vy+=o.g;o.x+=o.vx;o.y+=o.vy;
  if(o.t%4===0)parts.push({k:'p',x:o.x,y:o.y,vx:0,vy:0,g:0,life:12,maxl:12,size:1,col:'#ffb050'});
  if(hb&&overlapPt(hb,o.x,o.y,o.r)){hurtPlayer(1);o.gone=true;M7_spark(o.x,o.y,5,'#ffb050');return;}
  if(o.y>=GROUND-3){o.gone=true;J7_sfx('m7Bulbo');for(let i=0;i<7;i++)parts.push({k:'p',x:o.x,y:GROUND-2,vx:rand(-1.4,1.4),vy:rand(-2,-0.5),g:0.14,life:rand(14,24),maxl:24,size:1,col:i%2?'#ffa040':'#d080ff'});
    parts.push({k:'ring',x:o.x,y:GROUND-2,r:2,max:10,life:10,maxl:10,col:'255,160,64'});}
  if(o.t>220)o.gone=true;
}
function J7_sporeDraw(o){
  const x=o.x,y=o.y,p=(Math.sin(o.t/3)+1)/2;
  const lx=x+o.vx*Math.max(0,(GROUND-3-y)/Math.max(0.6,o.vy+1));
  ctx.fillStyle=`rgba(255,140,50,${0.15+0.3*Math.min(1,o.t/40)})`;ctx.beginPath();ctx.ellipse(lx,GROUND,4,1.1,0,0,7);ctx.fill();
  ctx.fillStyle=`rgba(200,120,255,${0.25+0.15*p})`;circle(x,y,o.r+2);
  ctx.fillStyle='#ffa040';circle(x,y,o.r);ctx.fillStyle='#fff3c0';circle(x-0.5,y-0.5,o.r*0.45);
}
function J7_updMar(b){
  b.t++;b.mt++;if(b.flash>0)b.flash--;
  const A=b.A,pc=M7_pc(),ph=b.phase;
  J7_updTents(b);
  if(b.state==='enter'){
    if(b.t===1){setBanner('¡ALGO CRECE EN EL REACTOR!',110);J7_sfx('m7Rugido');}
    b.grow=M7_ease(b.t/120);shake=Math.max(shake,0.6+b.grow*1.5);
    if(b.t%10===0){for(const g of M7_gratesIn(camX+10,camX+VW-10))M7.shk.set(g,10);J7_sfx('m7Reja');}
    if(b.t%5===0)M7_dust(A+rand(20,240),M7_DUCT+1,1);
    if(b.t>=120){b.state='intro';b.t=0;b.hp=0;}
    return;}
  if(b.state==='intro'){
    const dur=80;
    if(b.t===1){setBanner(b.name,130);playMusic(SONGS.m7Jefa?'m7Jefa':'boss');shake=Math.max(shake,5);J7_sfx('m7Rugido');}
    b.hp=Math.min(b.max,b.max*b.t/dur);
    if(b.t%4===0&&b.hp<b.max)tone('square',300+b.hp/b.max*500,300+b.hp/b.max*500,0.03,0.02);
    if(b.t>=dur){b.hp=b.max;b.state='fight';b.mt=0;b.cd=50;b.mode='idle';}
    return;}
  if(b.state==='dying'){
    if(b.t===1){setBanner('¡LA MARAÑA SE APAGA!',110);J7_sfx('m7Rugido');b.tents=[];}
    b.dim=Math.min(1,b.t/150);b.shud=1-b.dim;
    if(b.t%8===0)explodeFx(b.x+rand(-6,b.w+4),GROUND-rand(6,90),rand(7,13));
    if(b.t%5===0)M7_spark(b.x+rand(0,b.w),GROUND-rand(10,80),2,pick(['#ffa040','#d080ff']));
    if(b.t%20===0){tone('sine',90-b.t*0.2,40,0.4,0.1);shake=Math.max(shake,2);}
    if(b.t===150){shake=8;SFX.bigboom();for(let i=0;i<30;i++)parts.push({k:'smoke',col:pick(['120,70,150','80,60,90','200,120,60']),x:b.x+rand(-10,b.w),y:GROUND-rand(4,90),vx:rand(-2,1),vy:rand(-1.4,-0.2),life:rand(40,70),maxl:70,size:rand(2,5)});}
    if(b.t>=190)bossDone(b);
    return;}
  // --- pelea ---
  if(!b.phase&&b.hp<b.max*0.5){b.phase=1;b.seq=0;setBanner('¡LA MARAÑA SE DESPIERTA!',90);J7_sfx('m7Rugido');shake=Math.max(shake,6);
    if(b.mode==='idle')b.cd=40;}
  b.swell*=0.92;b.shud*=0.9;
  switch(b.mode){
  case 'idle':
    if(--b.cd<=0){
      const s=ph?['latigo','esporas','latigo','crias','latigo','esporas']:['latigo','esporas','latigo','crias'];
      let a=s[b.seq++%s.length];if(a==='crias'&&M7_nBichos()>=4)a='esporas';
      b.mt=0;
      if(a==='latigo'){const tel=ph?30:42;J7_tent(b,pc.x+rand(-6,6),tel);
        if(ph)J7_tent(b,pc.x+(pc.x>A+140?-56:56),tel+22);
        b.mode='latigo';}
      else if(a==='esporas'){b.mode='esporasT';J7_sfx('m7Rugido');}
      else{b.mode='criasT';J7_sfx('m7Chillido');}
    }
    break;
  case 'latigo':if(!b.tents.length){b.mode='idle';b.cd=ph?36:52;}break;
  case 'esporasT':{const tel=ph?22:32;b.swell=Math.min(1,b.mt/tel);
    if(b.mt%5===0)parts.push({k:'p',x:J7_root(b).x+14+rand(-4,4),y:GROUND-52+rand(-4,4),vx:0,vy:-0.3,g:0,life:12,maxl:12,size:1,col:'#ffb050'});
    if(b.mt>=tel){const n=ph?5:3;J7_sfx('m7Escupe');
      for(let i=0;i<n;i++)J7_spore(b,clamp(pc.x+(i-(n-1)/2)*26+rand(-5,5),A+12,A+246));
      b.mode='idle';b.cd=ph?48:66;}
    break;}
  case 'criasT':b.shud=1;
    if(b.mt%8===0){for(const g of M7_gratesIn(camX+10,camX+VW-10))M7.shk.set(g,6);J7_sfx('m7Reja');}
    if(b.mt===36){const n=ph?3:2;for(let i=0;i<n;i++)M7_ductBicho(i===0?A-30:A+250+i*6,i>0);setBanner('¡CRÍAS EN EL DUCTO!',60);}
    if(b.mt>=50){b.mode='idle';b.cd=ph?40:56;}
    break;
  }
  bossContact(b);
}
// reactor detrás de la masa: cilindro con costillas y una ventana de luz
function J7_reactor(b){
  const x=b.A+268,dim=b.dim;
  ctx.fillStyle='#1a1e27';ctx.fillRect(x,M7_DUCT,56,GROUND-M7_DUCT);
  ctx.fillStyle='#2a303c';for(let y=M7_DUCT+6;y<GROUND;y+=14)ctx.fillRect(x,y,56,3);
  ctx.fillStyle='#3a404e';ctx.fillRect(x,M7_DUCT,3,GROUND-M7_DUCT);
  const on=(1-dim)*(0.6+0.4*Math.sin(T/16));
  ctx.fillStyle=`rgba(90,240,200,${0.25*on})`;ctx.fillRect(x+12,M7_DUCT+20,24,GROUND-M7_DUCT-34);
  ctx.fillStyle='#0c0e14';for(let y=M7_DUCT+22;y<GROUND-16;y+=10)ctx.fillRect(x+12,y,24,2);
  ctx.fillStyle='#d9a43a';for(let y=GROUND-12;y<GROUND;y+=6)ctx.fillRect(x+4,y,48,2);
}
function J7_drawTent(b,t){
  const r=J7_root(b),k=t.k,hit=t.st==='hit';
  // aviso en el piso: franjas naranjas que se encienden
  if(t.st==='rise'){const p=Math.min(1,t.t/t.tel),on=(T>>2)%2;
    ctx.fillStyle=`rgba(255,140,50,${0.12+0.3*p+(on?0.08:0)})`;ctx.fillRect(t.tx-11,GROUND-2,22,2);
    ctx.fillStyle=`rgba(255,200,120,${0.4+0.5*p})`;for(let i=-11;i<11;i+=5)ctx.fillRect(t.tx+i,GROUND-1,2.5,1);
    ctx.fillStyle=`rgba(255,140,50,${0.05+0.12*p})`;ctx.fillRect(t.tx-11,GROUND-26,22,24);}
  const tipX=hit||t.st==='back'?t.tx:t.tx+Math.sin(T/5)*3,tipY=hit?GROUND-2:t.st==='back'?GROUND-2-(1-k)*60:GROUND-58-Math.sin(T/7)*4;
  const ex=r.x+(tipX-r.x)*k,ey=r.y+(tipY-r.y)*k;
  const mx=(r.x+ex)/2,my=Math.min(r.y,ey)-30*k-(hit?0:20);
  // cuerpo: dos trazos (cables + carne) con nudos que brillan
  ctx.strokeStyle='#2a1438';ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(r.x,r.y);ctx.quadraticCurveTo(mx,my,ex,ey);ctx.stroke();
  ctx.strokeStyle='#6a3290';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(r.x,r.y);ctx.quadraticCurveTo(mx,my,ex,ey);ctx.stroke();
  ctx.strokeStyle='#22202c';ctx.lineWidth=0.7;ctx.beginPath();ctx.moveTo(r.x,r.y-1);ctx.quadraticCurveTo(mx,my-1.5,ex,ey-1);ctx.stroke();
  ctx.lineCap='butt';
  for(let i=1;i<5;i++){const u=i/5,px=(1-u)*(1-u)*r.x+2*(1-u)*u*mx+u*u*ex,py=(1-u)*(1-u)*r.y+2*(1-u)*u*my+u*u*ey;
    ctx.fillStyle=(T>>3)%2===i%2?'#ffa040':'#c06a2a';ctx.fillRect(q(px-0.8),q(py-0.8),1.6,1.6);}
  // punta: puño de cables abierto
  ctx.fillStyle='#4e2268';circle(ex,ey,3.2);ctx.fillStyle='#ffa040';circle(ex,ey,1.2);
}
function J7_drawMar(b){
  J7_reactor(b);
  if(b.state==='enter'&&b.t<4)return;
  const fl=b.flash>0,C=c=>fl?'#fff':c,g=b.state==='enter'?b.grow:1,dim=b.dim,ph=b.phase;
  const cx=b.A+286,cy=GROUND-50,sh=b.shud?Math.sin(T*1.7)*1.2*b.shud:0,breathe=Math.sin(T/18)*1.2;
  // venas de cable que suben al techo y corren por el ducto
  ctx.strokeStyle='#2a1438';ctx.lineWidth=1.2;ctx.beginPath();
  for(let i=0;i<5;i++){const ox=cx-20+i*9,sw=Math.sin(T/30+i)*2;ctx.moveTo(ox,cy-30*g);ctx.quadraticCurveTo(ox-10+sw,(cy+M7_DUCT)/2-10,ox-20-i*12*g,M7_DUCT);}
  ctx.stroke();
  ctx.strokeStyle='#4e2268';ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(cx-10,M7_DUCT+1);ctx.lineTo(cx-10-150*g,M7_DUCT+1);ctx.stroke();
  for(const t of b.tents)J7_drawTent(b,t);
  ctx.save();ctx.translate(cx+sh,GROUND);ctx.scale(g,g);ctx.translate(-cx,-GROUND);
  if(dim>0)ctx.globalAlpha=1-dim*0.35;
  // masa: bultos encimados
  const blobs=[[-14,-14,22,15,'#2a1438'],[8,-18,20,18,'#341a48'],[-6,-40,24,20,'#3e1a56'],[14,-60,16,20,'#3e1a56'],[-20,-62,12,16,'#2a1438'],
    [0,-80,14,14,'#341a48'],[-16,-30,14,14,'#4e2268'],[16,-34,14,16,'#4e2268'],[0,-52,18,16,'#5a2a7a']];
  for(const [ox,oy,rx,ry,col] of blobs){ctx.fillStyle=C(col);ctx.beginPath();ctx.ellipse(cx+ox,GROUND+oy+breathe*(oy/-80),rx+breathe*0.3,ry,0,0,7);ctx.fill();}
  if(!fl){
    // cables que la atan
    ctx.strokeStyle='#14121c';ctx.lineWidth=0.9;ctx.beginPath();
    for(let i=0;i<6;i++){const y=GROUND-10-i*13;ctx.moveTo(cx-24,y+4);ctx.quadraticCurveTo(cx,y-6+Math.sin(T/20+i)*2,cx+26,y+2);}
    ctx.stroke();
    ctx.fillStyle='#8a4ab0';ctx.fillRect(cx-8,GROUND-70,10,1);ctx.fillRect(cx+6,GROUND-44,8,1);
    // bulbos naranjas que laten (más rápido en rabia)
    const BUL=[[-18,-20],[12,-12],[-8,-66],[18,-50],[-22,-44],[6,-84],[20,-70],[-4,-24]];
    BUL.forEach(([ox,oy],i)=>{const p=(1-dim)*(0.5+0.5*Math.sin(T/(ph?6:11)+i*1.3));
      ctx.fillStyle=`rgba(255,150,60,${0.18*p})`;circle(cx+ox,GROUND+oy,4.5);ctx.fillStyle=p>0.6?'#ffd27a':'#c06a2a';circle(cx+ox,GROUND+oy,1.8);});
    // núcleo: anillos que se hinchan antes de escupir
    const s=1+b.swell*0.45,ncx=cx-2,ncy=cy+2;
    ctx.fillStyle='#2a1438';ctx.beginPath();ctx.ellipse(ncx,ncy,10*s,12*s,0,0,7);ctx.fill();
    const rings=['#6a3290','#b45ae0','#ff9a3a','#ffd27a'];
    for(let i=0;i<4;i++){const k=1-i*0.22;ctx.fillStyle=dim>0.8?'#2a1438':rings[i];ctx.beginPath();ctx.ellipse(ncx,ncy,8*s*k,10*s*k,0,0,7);ctx.fill();}
    if(b.swell>0.3&&(T>>1)%2){ctx.fillStyle='rgba(255,240,190,0.6)';circle(ncx,ncy,3*s);}
    if(ph&&dim<0.5){ctx.strokeStyle=`rgba(255,160,64,${0.4+0.3*Math.sin(T/4)})`;ctx.lineWidth=0.8;ctx.beginPath();ctx.ellipse(ncx,ncy,12*s,14*s,0,0,7);ctx.stroke();}
    // zarcillos chicos en el piso
    ctx.strokeStyle='#3e1a56';ctx.lineWidth=1.4;ctx.beginPath();
    for(let i=0;i<4;i++){const sw=Math.sin(T/14+i*2)*2;ctx.moveTo(cx-20,GROUND-2-i*2);ctx.quadraticCurveTo(cx-34-i*4,GROUND-6+sw,cx-40-i*8,GROUND-1);}
    ctx.stroke();
  }
  ctx.restore();ctx.globalAlpha=1;
}

// ===== registro en BOSSES (sin índice fijo: el de la misión) =====
BOSSES[M7_IDX]={mini:{name:'EL REMENDÓN',make:J7_mkDron},villain:{name:'LA MARAÑA',make:J7_mkMar,g:'M',col:'#b45ae0'}};
