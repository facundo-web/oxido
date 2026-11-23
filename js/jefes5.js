'use strict';
// Óxido · Misión 5: jefe chico (LECHUZA BLINDADA) y villano (DON NIEBLA)
// Todo con prefijo J5_. Usa el estado del reflector de mision5.js (M5.sl).

// ---------- utilidades ----------
const J5_sfx=n=>{if(typeof SFX!=='undefined'&&SFX[n])SFX[n]();};
function J5_pc(p){p=p||P;return p.ride?{x:p.ride.x+p.ride.w/2,y:p.ride.y+p.ride.h/2}:{x:p.x+4,y:p.y+9};}
function J5_hurtCirc(x,y,r,n){
  eachPlayer(p=>{if(p.dead)return;const hb=hurtbox();if(x+r>hb.x&&x-r<hb.x+hb.w&&y+r>hb.y&&y-r<hb.y+hb.h)hurtPlayer(n||1);});
  for(const a of allies)if(!a.gone&&overlapPt(a,x,y,r))killAlly(a);
}
function J5_hurtBox(box,n){eachPlayer(p=>{if(!p.dead&&overlap(hurtbox(),box))hurtPlayer(n||1);});for(const a of allies)if(!a.gone&&overlap(a,box))killAlly(a);}
// superficie (plataforma o suelo) debajo de un punto
function J5_surf(x,y){let s=GROUND;for(const pl of platforms)if(x>pl.x+1&&x<pl.x+pl.w-1&&pl.y>=y-1&&pl.y<s)s=pl.y;return s;}
// mira roja en el suelo (aviso de dónde va a caer algo)
function J5_mark(x,y,k){const on=(T>>2)%2,r=4+3*(1-k);
  ctx.strokeStyle=on?'#ff4a3a':'#ffb0a0';ctx.lineWidth=0.8;ctx.beginPath();ctx.ellipse(q(x),y-0.5,r,r*0.32,0,0,7);ctx.stroke();
  ctx.fillStyle=on?'#ff4a3a':'#ffb0a0';ctx.fillRect(q(x-r-2),y-1,2,1);ctx.fillRect(q(x+r),y-1,2,1);ctx.fillRect(q(x-0.5),y-1.5,1,1);}

// =====================================================================
// JEFE CHICO · LECHUZA BLINDADA — helicóptero de la banda con dos focos como ojos de lechuza
// 1) FOCO: el haz te busca por la calle; cuando te encuentra se pone ROJO (pitidos) y al ratito tira una
//    ráfaga a ese punto: salí del círculo rojo.
// 2) COHETES: los lanzacohetes parpadean, aparecen miras rojas en el suelo y caen ahí (se pueden bajar a tiros).
// 3) RASANTE (solo con rabia, debajo de 50 %): se va a un costado, alarma y cruza bajito: AGACHATE.
// =====================================================================
function J5_mkLechuza(A){return{type:'j5Lechuza',isBoss:true,air:true,A,x:A+W+30,y:30,baseY:30,w:52,h:20,hp:95,max:95,state:'enter',t:0,mt:0,face:-1,flash:0,score:3500,
  mode:'hover',cd:50,seq:0,vx:0,tilt:0,rot:0,rotor:0,spot:A+160,lockN:0,lock:null,shots:0,dir:1,ph2:false,said:false,noPush:true,touch:1,upd:J5_updLechuza,draw:J5_drawLechuza};}
function J5_eyes(b){const f=b.face;return{x:f>0?b.x+b.w-3:b.x+3,y:b.y+11};}
function J5_rocket(b,tx,d){const s=J5_surf(tx,0);eproj.push({kind:'j5cohete',x:-9999,y:-9999,tx,ty:s,t:-d,d,r:2,boss:b,upd:J5_updRocket,draw:J5_drawRocket});}
function J5_updRocket(o,hb){
  o.t++;
  if(o.t<0)return;
  if(o.t===0){const b=o.boss;o.x=b.x+b.w/2;o.y=b.y+b.h-2;const Tt=40,g=0.12;o.vx=(o.tx-o.x)/Tt;o.vy=(o.ty-o.y-0.5*g*Tt*Tt)/Tt;o.g=g;J5_sfx('cohete');}
  o.vy+=o.g;o.x+=o.vx;o.y+=o.vy;
  if(o.t%2===0)parts.push({k:'smoke',col:'120,120,140',x:o.x,y:o.y,vx:0,vy:-0.1,life:16,maxl:16,size:1.2});
  if(coverBlocks(o)){o.gone=true;explodeFx(o.x,o.y,10);return;}
  if(hb&&overlapPt(hb,o.x,o.y,o.r)){o.gone=true;explodeFx(o.x,o.y,12);hurtPlayer(1);return;}
  if(o.y>=o.ty-1&&o.vy>0){o.gone=true;explodeFx(o.x,o.ty-3,14);J5_hurtCirc(o.x,o.ty-5,13,1);}
  if(o.t>200)o.gone=true;
}
function J5_drawRocket(o){
  const k=o.t<0?Math.min(1,(o.t+o.d)/o.d):1;J5_mark(o.tx,o.ty,k);
  if(o.t<0)return;
  const a=Math.atan2(o.vy,o.vx);ctx.save();ctx.translate(q(o.x),q(o.y));ctx.rotate(a);
  ctx.fillStyle='#c8ccd4';ctx.fillRect(-3,-1,6,2);ctx.fillStyle='#d93a2b';ctx.fillRect(3,-1,1.5,2);ctx.fillStyle=(T>>1)%2?'#ffd25a':'#ff7a2a';ctx.fillRect(-5,-0.7,2,1.4);
  ctx.restore();
}
function J5_updLechuza(b){
  b.t++;b.mt++;if(b.flash>0)b.flash--;const A=b.A,ph2=b.hp<b.max*0.5,pc=J5_pc(),cx=b.x+b.w/2;
  b.rotor+=b.state==='dying'?Math.max(0.05,0.6-b.t*0.004):0.6;
  if(b.state!=='dying'&&b.t%9===0)J5_sfx('rotor');
  if(b.state==='enter'){b.x-=1.4;b.face=-1;b.y=b.baseY+Math.sin(b.t/18)*3;b.tilt=-0.08;
    if(b.x<=A+196){b.state='intro';b.t=0;b.hp=0;b.tilt=0;}return;}
  if(b.state==='intro'){bossIntro(b,50);b.face=pc.x<cx?-1:1;b.y=b.baseY+Math.sin(b.t/22)*4;b.spot=pc.x+60*b.face*-1;
    if(b.state==='fight'){b.mt=0;b.cd=40;}return;}
  if(b.state==='dying'){
    b.rot+=0.06*b.face;b.x+=b.face*0.6;b.y+=Math.min(2.4,0.3+b.t*0.02);
    if(b.t%6===0)explodeFx(b.x+rand(4,b.w-4),b.y+rand(0,b.h),rand(8,14));
    if(b.t%2===0)parts.push({k:'smoke',col:'40,36,44',x:b.x+b.w/2,y:b.y+4,vx:rand(-0.3,0.3),vy:rand(-1,-0.4),life:40,maxl:40,size:rand(2,3.5)});
    if(b.y+b.h>=GROUND||b.t>=150){if(b.y+b.h>=GROUND){shake=Math.max(shake,6);for(let i=0;i<12;i++)parts.push({k:'p',x:b.x+rand(0,b.w),y:GROUND-3,vx:rand(-2,2),vy:rand(-3,-1),g:0.15,life:rand(30,50),maxl:50,size:rand(1,2),col:i%2?'#2c3038':'#8c3b2a'});}bossDone(b);}
    return;}
  if(ph2&&!b.ph2){b.ph2=true;setBanner('¡LA LECHUZA ECHA HUMO!',80);SFX.alarm();}
  if(ph2&&T%8===0)parts.push({k:'smoke',x:b.x+rand(10,40),y:b.y+2,vx:rand(-0.2,0.2),vy:rand(-0.8,-0.4),life:45,maxl:45,size:rand(2,3.5)});
  const lo=A+6,hi=A+W-b.w-6;
  const hoverTo=(tx,k)=>{b.vx+=(clamp((tx-b.x)*0.03,-1.3,1.3)-b.vx)*k;b.x+=b.vx;b.tilt+=(b.vx*0.06-b.tilt)*0.1;};
  switch(b.mode){
  case 'hover':{
    b.face=pc.x<cx?-1:1;hoverTo(clamp(pc.x-b.w/2-b.face*50,lo,hi),0.08);
    b.y+=(b.baseY+Math.sin(b.t/22)*4-b.y)*0.1;b.spot+=(pc.x-b.spot)*0.02;
    if(--b.cd<=0){
      const atks=ph2?['foco','rasante','cohetes','foco','cohetes','rasante']:['foco','cohetes','foco','cohetes'];
      const a=atks[b.seq++%atks.length];b.mt=0;
      if(a==='foco'){b.mode='foco';b.lockN=0;b.spot=b.x+b.w/2;}
      else if(a==='cohetes'){b.mode='cohetesT';const n=ph2?4:3;
        for(let k=0;k<n;k++)J5_rocket(b,clamp(pc.x+(k-(n-1)/2)*34+rand(-6,6),A+10,A+W-10),30+k*9);tone('square',660,660,0.06,0.04);}
      else{b.mode='rasT';b.dir=pc.x<A+W/2?1:-1;}   // se va al costado contrario al jugador
    }
    break;}
  case 'foco':{ // el haz busca al jugador
    b.face=pc.x<cx?-1:1;hoverTo(clamp(pc.x-b.w/2-b.face*40,lo,hi),0.05);b.y+=(b.baseY-b.y)*0.1;
    const sp=ph2?1.5:1.05;b.spot+=clamp(pc.x-b.spot,-sp,sp);
    if(Math.abs(b.spot-pc.x)<7)b.lockN++;else b.lockN=Math.max(0,b.lockN-1);
    if(b.lockN>=16||b.mt>150){b.mode='focoLock';b.mt=0;b.lock={x:b.spot,y:J5_surf(b.spot,pc.y-10)};J5_sfx('fija');}
    break;}
  case 'focoLock':b.vx*=0.85;b.x+=b.vx;if(b.mt%6===0)tone('square',1180,1180,0.04,0.035);
    if(b.mt>=(ph2?28:32)){b.mode='rafaga';b.mt=0;b.shots=0;} // aviso (mira roja fija) de 0,45 s o más (accesibilidad)
    break;
  case 'rafaga':{b.vx*=0.85;b.x+=b.vx;const n=ph2?10:7;
    if(b.mt%4===0&&b.shots<n){const e=J5_eyes(b),tx=b.lock.x+rand(-4,4),ty=b.lock.y-rand(3,12),d=Math.hypot(tx-e.x,ty-e.y)||1,sp=3;
      eproj.push({kind:'bullet',x:e.x,y:e.y,vx:(tx-e.x)/d*sp,vy:(ty-e.y)/d*sp,g:0,r:1.6,t:0});SFX.eshoot();parts.push({k:'flash',x:e.x,y:e.y,life:3,maxl:3,size:4});b.shots++;}
    if(b.shots>=n&&b.mt>n*4+12){b.mode='hover';b.cd=ph2?45:65;b.lock=null;}
    break;}
  case 'cohetesT':hoverTo(b.x,0.1);b.y+=(b.baseY-b.y)*0.1;
    if(b.mt>=(ph2?4:3)*9+40){b.mode='hover';b.cd=ph2?40:60;}
    break;
  case 'rasT':{const tx=b.dir>0?hi:lo;b.face=-b.dir;hoverTo(tx,0.1);b.y+=(b.baseY-10-b.y)*0.08;
    if(b.mt%10===0)tone('sawtooth',200+b.mt*5,240+b.mt*5,0.1,0.04);
    if(b.mt===1){SFX.alarm();if(!b.said){b.said=true;setBanner('¡AGACHATE!',70);}}
    if(b.mt>=46){b.mode='ras';b.mt=0;b.face=-b.dir;}
    break;}
  case 'ras':{const low=GROUND-16-b.h;b.y+=(low-b.y)*0.18;b.x+=b.face*3;b.tilt=b.face*0.12;
    if(T%2===0)parts.push({k:'p',x:b.x+b.w/2+rand(-20,20),y:GROUND-1,vx:rand(-1.5,1.5),vy:rand(-1.6,-0.6),g:0.12,life:16,maxl:16,size:1,col:'#9ab0d8'});
    if(b.face>0&&b.x>=hi||b.face<0&&b.x<=lo){b.mode='rise';b.mt=0;}
    break;}
  case 'rise':b.y+=(b.baseY-b.y)*0.06;b.tilt*=0.9;if(Math.abs(b.y-b.baseY)<1.5){b.mode='hover';b.cd=ph2?40:60;}break;
  }
  b.x=clamp(b.x,A+2,A+W-b.w-2);if(b.mode!=='ras')b.tilt*=0.92;
  bossContact(b);
}
function J5_drawLechuza(b){
  const fl=b.flash>0||(b.state==='dying'&&(T>>2)%2),C=c=>fl?'#fff':c,fight=b.state==='fight';
  // haz del foco (detrás del cuerpo)
  if(fight&&(b.mode==='foco'||b.mode==='focoLock'||b.mode==='rafaga')||b.state==='intro'){
    const e=J5_eyes(b),sx=b.mode==='foco'||b.state==='intro'?b.spot:b.lock?b.lock.x:b.spot,red=b.mode==='focoLock'||b.mode==='rafaga',sy=b.lock&&red?b.lock.y:GROUND;
    const col=red?((T>>1)%2?'255,70,60':'255,140,120'):'255,240,190';
    ctx.fillStyle=`rgba(${col},${red?0.16:0.09})`;ctx.beginPath();ctx.moveTo(e.x-2,e.y);ctx.lineTo(sx-14,sy);ctx.lineTo(sx+14,sy);ctx.lineTo(e.x+2,e.y);ctx.fill();
    ctx.fillStyle=`rgba(${col},${red?0.45:0.25})`;ctx.beginPath();ctx.ellipse(sx,sy,14,2.4,0,0,7);ctx.fill();
    if(red){ctx.strokeStyle=`rgba(${col},0.9)`;ctx.lineWidth=0.8;ctx.beginPath();ctx.ellipse(sx,sy,14,2.4,0,0,7);ctx.stroke();}}
  if(fight&&b.mode==='ras'){ctx.fillStyle='rgba(20,20,30,0.35)';ctx.beginPath();ctx.ellipse(b.x+b.w/2,GROUND,30,2,0,0,7);ctx.fill();}
  if(fight&&b.mode==='rasT'&&(T>>2)%2){const d=-b.dir,x0=d>0?b.x+b.w+6:b.x-6,y0=GROUND-12;ctx.fillStyle='#ff3b30';
    for(let i=0;i<4;i++){const x=q(x0+d*i*14);ctx.fillRect(x,y0-2,1,1);ctx.fillRect(x+d,y0-1,1,1);ctx.fillRect(x+2*d,y0,1,1);ctx.fillRect(x+d,y0+1,1,1);ctx.fillRect(x,y0+2,1,1);}}
  ctx.save();ctx.translate(q(b.x+b.w/2),q(b.y+b.h/2));ctx.rotate(b.tilt+b.rot);ctx.translate(-b.w/2,-b.h/2);
  if(b.face<0){ctx.translate(b.w,0);ctx.scale(-1,1);}
  // rotor principal y cola (atrás = izquierda en este dibujo)
  const rw=Math.abs(Math.sin(b.rotor))*28+4;
  ctx.fillStyle='rgba(200,210,230,0.35)';ctx.fillRect(26-rw,-1.5,rw*2,1.2);ctx.fillStyle='rgba(200,210,230,0.12)';ctx.fillRect(-4,-2,60,2);
  ctx.fillStyle=C('#22252c');ctx.fillRect(24,-1,4,4);
  ctx.fillStyle=C('#2c3038');ctx.fillRect(-12,6,20,3.5);ctx.fillStyle=C('#3a404a');ctx.fillRect(-12,6,20,0.8);
  ctx.fillStyle=C('#2c3038');ctx.beginPath();ctx.moveTo(-14,9.5);ctx.lineTo(-10,0);ctx.lineTo(-7,6);ctx.closePath();ctx.fill();
  const tr=Math.abs(Math.cos(b.rotor*1.7))*5+1;ctx.fillStyle='rgba(200,210,230,0.4)';ctx.fillRect(-12-tr/2,2,tr,1);
  ctx.fillStyle=C('#8c3b2a');ctx.fillRect(-12,6,3,3.5);
  // fuselaje blindado
  ctx.fillStyle=C('#2c3038');ctx.beginPath();ctx.moveTo(6,4);ctx.lineTo(36,2);ctx.quadraticCurveTo(50,3,52,11);ctx.quadraticCurveTo(50,17,40,17);ctx.lineTo(10,17);ctx.quadraticCurveTo(4,14,6,4);ctx.fill();
  ctx.fillStyle=C('#4a525e');ctx.fillRect(10,3.5,24,1.2);
  ctx.fillStyle=C('#22252c');ctx.fillRect(14,9,1,7);ctx.fillRect(24,9,1,7);
  for(let i=0;i<5;i++){ctx.fillStyle=fl?'#fff':i%2?'#1d1a1c':'#d9a43a';ctx.fillRect(12+i*3,14,3,1.6);}
  // cabina
  ctx.fillStyle=C('#1a2430');ctx.beginPath();ctx.moveTo(32,4);ctx.quadraticCurveTo(44,4,46,9);ctx.lineTo(34,9);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(160,200,220,0.4)';ctx.fillRect(37,5,3,1);
  ctx.fillStyle='#0a0c10';ctx.fillRect(35,6,2,3);
  // cara de lechuza: cejas de chapa, penachos y los dos focos
  ctx.fillStyle=C('#3a404a');ctx.beginPath();ctx.moveTo(40,7);ctx.lineTo(46,9.5);ctx.lineTo(52,7.5);ctx.lineTo(51,9.5);ctx.lineTo(46,11);ctx.lineTo(40,9);ctx.closePath();ctx.fill();
  ctx.fillStyle=C('#2c3038');ctx.beginPath();ctx.moveTo(38,3);ctx.lineTo(39,-2);ctx.lineTo(41,3);ctx.fill();ctx.beginPath();ctx.moveTo(43,3.5);ctx.lineTo(45,-1);ctx.lineTo(46,4);ctx.fill();
  const red=fight&&(b.mode==='focoLock'||b.mode==='rafaga'),eye=b.state==='dying'?'#3a2a1a':red?((T>>1)%2?'#ff4a3a':'#ffd0c0'):'#ffd27a';
  ctx.fillStyle='#120c18';circle(45,12.5,3.2);circle(50.5,12,2.6);
  ctx.fillStyle=eye;circle(45,12.5,2.4);circle(50.5,12,1.9);ctx.fillStyle='rgba(255,255,255,0.7)';ctx.fillRect(44,11.3,1,1);
  // patines
  ctx.fillStyle=C('#1a1c22');ctx.fillRect(14,17,1,3);ctx.fillRect(34,17,1,3);ctx.fillRect(10,19.5,30,1.2);ctx.fillRect(40,18.5,2,1.2);
  // lanzacohetes
  const pod=fight&&b.mode==='cohetesT'&&(T>>2)%2;ctx.fillStyle=C('#22252c');ctx.fillRect(20,15.5,12,3);ctx.fillStyle=pod?'#ff4a3a':'#5a1a14';ctx.fillRect(31,15.5,1.5,3);
  if(b.ph2){ctx.fillStyle='#120c18';ctx.fillRect(18,6,2,2);ctx.fillRect(30,12,2,1);}
  ctx.restore();
}

// =====================================================================
// VILLANO · DON NIEBLA — capo de la ciudad en su dirigible acorazado
// Entra entre la niebla y le APAGA EL REFLECTOR a la ciudad. Ataques:
// 1) BIDONES: se abre la escotilla (luz roja) y suelta bidones; la sombra marca dónde caen. Se pueden bajar a tiros.
// 2) CAÑÓN: la góndola apunta con una mira de puntos y dispara una ráfaga a ese punto.
// 3) GARRA: se pone encima tuyo, la garra tiembla (mira roja) y cae de golpe: onda por el piso para los dos lados (saltala).
// RABIA (50 %): se le pincha el globo, baja, apura los ataques y suelta murciélagos de su jaula. Y vuelve el
// REFLECTOR: le apunta al dirigible y, mientras lo ilumina, recibe más daño.
// =====================================================================
function J5_mkNiebla(A){return{type:'j5Niebla',isBoss:true,air:true,A,x:A+W+70,y:18,baseY:18,w:96,h:46,hp:0,max:280,state:'enter',t:0,mt:0,face:-1,flash:0,score:12000,
  mode:'drift',cd:60,seq:0,vx:0,tilt:0,rage:false,slT:0,drops:0,shots:0,aim:null,claw:{y:0,st:'up',x:0,vy:0,t:0},lastHp:0,cage:0,prop:0,touch:1,noPush:true,
  upd:J5_updNiebla,draw:J5_drawNiebla};}
function J5_gond(b){return{x:b.x+b.w/2,y:b.y+40};}
function J5_barrel(b){
  const g=J5_gond(b);J5_sfx('suelta');
  eproj.push({kind:'j5bidon',x:g.x+b.face*-6,y:g.y+4,vx:b.vx*0.6,vy:0.3,r:3,t:0,A:b.A,upd:J5_updBarrel,draw:J5_drawBarrel});
}
function J5_updBarrel(o,hb){
  o.t++;o.vy=Math.min(o.vy+0.12,4);o.x+=o.vx;o.vx*=0.99;o.y+=o.vy;
  if(coverBlocks(o)){o.gone=true;explodeFx(o.x,o.y,14);J5_hurtCirc(o.x,o.y,12,1);return;}
  if(hb&&overlapPt(hb,o.x,o.y,o.r)){o.gone=true;explodeFx(o.x,o.y,16);hurtPlayer(1);return;}
  const s=J5_surf(o.x,o.y-o.vy);
  if(o.y>=s-3){o.gone=true;explodeFx(o.x,s-4,16);J5_hurtCirc(o.x,s-6,14,1);}
  if(o.t>300)o.gone=true;
}
function J5_drawBarrel(o){
  const s=J5_surf(o.x,o.y),k=clamp(1-(s-o.y)/130,0.15,1);
  ctx.fillStyle=`rgba(255,60,48,${0.25+0.35*k*((T>>2)%2?1:0.5)})`;ctx.beginPath();ctx.ellipse(o.x,s,3+6*k,1.3+0.6*k,0,0,7);ctx.fill();
  ctx.fillStyle='#3a4a2a';ctx.fillRect(q(o.x-3),q(o.y-4),6,8);ctx.fillStyle='#5a6a3a';ctx.fillRect(q(o.x-3),q(o.y-4),6,1);ctx.fillRect(q(o.x-3),q(o.y),6,0.8);
  ctx.fillStyle='#d9a43a';ctx.fillRect(q(o.x-1),q(o.y-2),2,2);
}
function J5_bat(b){
  if(typeof M5_bat1!=='function')return;
  const n=enemies.filter(e=>e.type==='bat'&&!e.gone).length;if(n>=3)return;
  const g=J5_gond(b);
  for(let i=0;i<Math.min(2,3-n);i++){const e=M5_bat1(g.x+(i?10:-10));e.y=g.y;e.baseY=34+i*14;e.seen=true;e.cd=90+i*40;e.st='rise';e.vy=-1;e.vx=i?1:-1;
    const d=DIFF();e.hp=Math.max(1,Math.round(e.hp*d.ehp));e.cd*=d.fire;enemies.push(e);}
  J5_sfx('chillido');
}
function J5_updNiebla(b){
  b.t++;b.mt++;if(b.flash>0)b.flash--;const A=b.A,pc=J5_pc(),sl=typeof M5!=='undefined'?M5.sl:null;
  const cx=b.x+b.w/2,lo=A-6,hi=A+W-b.w+6;b.prop+=0.5;
  const fog=(x,y,n)=>{for(let i=0;i<n;i++)parts.push({k:'smoke',col:'150,156,180',rise:1,x:x+rand(-6,6),y:y+rand(-3,3),vx:rand(-0.4,0.4),vy:rand(-0.3,0),life:rand(40,70),maxl:70,size:rand(2.5,4.5)});};
  if(b.state==='enter'){
    if(b.t===1){setBanner('¡UNA SOMBRA ENTRE LAS NUBES!',100);J5_sfx('bocina');}
    b.x-=1.1;b.face=-1;b.y=b.baseY+Math.sin(b.t/30)*2;if(b.t%6===0)fog(b.x+b.w,b.y+20,1);
    // le apaga el reflector a la ciudad: un tiro desde la góndola
    if(b.x<=A+190&&sl&&sl.mode!=='off'){sl.mode='off';sl.t=0;setBanner('¡DON NIEBLA APAGÓ EL REFLECTOR!',100);SFX.eshoot();J5_sfx('apagon');}
    if(b.x<=A+150){b.state='intro';b.t=0;b.hp=0;}return;}
  if(b.state==='intro'){
    const dur=80;
    if(b.t===1){setBanner(b.name,130);if(typeof SONGS!=='undefined'&&SONGS.niebla)playMusic('niebla');else playMusic('boss');shake=Math.max(shake,4);J5_sfx('bocina');}
    b.hp=Math.min(b.max,b.max*b.t/dur);
    if(b.t%4===0&&b.hp<b.max)tone('square',300+b.hp/b.max*500,300+b.hp/b.max*500,0.03,0.02);
    b.y=b.baseY+Math.sin(b.t/30)*2;b.face=pc.x<cx?-1:1;
    if(b.t>=dur){b.hp=b.max;b.lastHp=b.hp;b.state='fight';b.mt=0;b.cd=50;}
    return;}
  if(b.state==='dying'){
    b.tilt=Math.min(0.32,b.tilt+0.003);b.y+=b.t<60?0.25:0.9;b.x+=b.face*0.3;
    if(b.t%5===0)explodeFx(b.x+rand(10,b.w-10),b.y+rand(4,30),rand(8,16));
    if(b.t%2===0)parts.push({k:'fire',x:b.x+rand(10,b.w-10),y:b.y+rand(2,14),vx:rand(-0.3,0.3),vy:rand(-1,-0.3),life:rand(14,24),maxl:28,size:rand(2,4)});
    if(b.t%3===0)fog(b.x+rand(0,b.w),b.y+10,1);
    if(b.y+b.h>=GROUND-2||b.t>=200){shake=9;SFX.bigboom();for(let i=0;i<24;i++)parts.push({k:'p',x:b.x+rand(0,b.w),y:GROUND-4,vx:rand(-3,3),vy:rand(-4.5,-1),g:0.14,life:rand(40,70),maxl:70,size:rand(1.5,2.5),col:pick(['#3a3046','#5a4a5a','#8c3b2a'])});
      if(sl){sl.mode='sky';sl.t=0;sl.a=1;}bossDone(b);}
    return;}
  // --- pelea ---
  // mientras el reflector lo ilumina, recibe 30 % más de daño
  const lit=sl&&sl.mode==='boss'&&sl.a>0.8;
  if(b.hp<b.lastHp){const d=b.lastHp-b.hp;b.hp=b.lastHp-d*(lit?1.3:1);if(b.hp<=0){b.hp=0;b.lastHp=0;kill(b);return;}}
  b.lastHp=b.hp;
  if(!b.rage&&b.hp<b.max*0.5){b.rage=true;b.baseY+=14;b.cd=70;b.mode='drift';b.claw.st=b.claw.st==='up'?'up':'reel';
    setBanner('¡SE LE PINCHÓ EL GLOBO!',80);J5_sfx('bocina');shake=Math.max(shake,5);
    b.slT=84;}
  // a los ~1,4 s de la rabia vuelve el reflector y lo ilumina
  if(b.slT>0&&--b.slT===0&&sl){sl.mode='boss';sl.t=0;sl.a=0;setBanner('¡VOLVIÓ EL REFLECTOR Y LO MARCA!',110);J5_sfx('reflector');}
  if(sl&&sl.mode==='boss'){sl.tx=b.x+b.w/2;sl.ty=b.y+14;}
  if(b.rage&&T%5===0)fog(b.x+b.w*0.3+rand(-8,8),b.y+6,1);
  const R=b.rage;
  const goTo=(tx,k,mx)=>{b.vx+=(clamp((tx-b.x)*0.02,-mx,mx)-b.vx)*k;b.x+=b.vx;};
  b.y+=(b.baseY+Math.sin(b.t/40)*2-b.y)*0.05;
  const c=b.claw;
  switch(b.mode){
  case 'drift':{
    b.face=pc.x<cx?-1:1;
    const tx=clamp(A+W/2-b.w/2+Math.sin(b.t/(R?80:110))*(W/2-b.w/2-4),lo,hi);goTo(tx,0.05,R?1.1:0.8);
    if(--b.cd<=0){
      const atks=R?['garra','bidones','murcis','canon','garra','bidones','canon']:['canon','bidones','garra','canon','garra','bidones'];
      let a=atks[b.seq++%atks.length];
      if(a==='murcis'&&enemies.filter(e=>e.type==='bat'&&!e.gone).length>=2)a='canon';
      b.mode=a;b.mt=0;b.drops=0;b.shots=0;b.aim=null;
      if(a==='garra'){c.st='aim';c.t=0;c.x=pc.x;}
      if(a==='bidones')b.dir=pc.x<cx?-1:1;
      if(a==='murcis')b.cage=40;
    }
    break;}
  case 'bidones':{ // escotilla roja 26 cuadros y suelta bidones mientras cruza
    goTo(b.dir>0?hi:lo,0.05,R?1.2:0.9);
    if(b.mt===1)tone('square',520,520,0.08,0.04);
    const n=R?5:3;
    if(b.mt>26&&(b.mt-26)%18===0&&b.drops<n){b.drops++;J5_barrel(b);}
    if(b.drops>=n&&b.mt>26+n*18+20){b.mode='drift';b.cd=R?50:70;}
    break;}
  case 'canon':{ // apunta (mira de puntos) y dispara
    b.vx*=0.9;b.x+=b.vx;b.face=pc.x<cx?-1:1;
    const tel=R?30:34;                            // aviso de 0,45 s o más (accesibilidad)
    if(b.mt<tel-14)b.aim={x:pc.x,y:pc.y};          // la mira queda quieta los últimos 14 cuadros
    if(b.mt%8===0&&b.mt<tel)tone('square',900,900,0.04,0.03);
    const n=R?5:3;
    if(b.mt>=tel&&(b.mt-tel)%6===0&&b.shots<n){const g=J5_gond(b),sx=g.x+b.face*16,sy=g.y+4,tx=b.aim.x+(b.shots-(n-1)/2)*10,ty=b.aim.y,d=Math.hypot(tx-sx,ty-sy)||1,sp=2.6;
      eproj.push({kind:'bullet',x:sx,y:sy,vx:(tx-sx)/d*sp,vy:(ty-sy)/d*sp,g:0,r:1.8,t:0});SFX.eshoot();parts.push({k:'flash',x:sx,y:sy,life:3,maxl:3,size:5});b.shots++;}
    if(b.shots>=n&&b.mt>tel+n*6+16){b.mode='drift';b.cd=R?45:65;b.aim=null;}
    break;}
  case 'garra':{
    if(c.st==='aim'){ // se pone encima, la garra tiembla y la mira sigue al jugador hasta 14 cuadros antes de caer
      const tel=R?34:46;
      if(c.t<tel-14)c.x+=clamp(pc.x-c.x,-2.2,2.2);
      goTo(c.x-b.w/2,0.12,1.6);
      if(c.t%7===0)J5_sfx('cadena');
      if(++c.t>=tel){c.st='drop';c.vy=1;c.t=0;c.x=b.x+b.w/2;}
    }else if(c.st==='drop'){b.vx*=0.8;b.x+=b.vx;c.vy=Math.min(c.vy+0.6,8);c.y+=c.vy;
      const top=J5_gond(b).y+4,s=J5_surf(c.x,top+c.y-c.vy);
      J5_hurtBox({x:c.x-6,y:top+c.y-6,w:12,h:10},1);
      if(top+c.y+4>=s){c.y=s-4-top;c.st='slam';c.t=0;shake=Math.max(shake,6);noise(0.5,0.4,300);tone('sine',70,30,0.5,0.2);dust(c.x,s,10);
        if(s>=GROUND){const sp=R?2.5:2.1;bulonWave(c.x-6,-1,sp,A);bulonWave(c.x+6,1,sp,A);}}
    }else if(c.st==='slam'){b.vx*=0.8;b.x+=b.vx;if(++c.t>=(R?22:32)){c.st='reel';}}
    else if(c.st==='reel'){c.y=Math.max(0,c.y-2);if(c.t++%8===0)J5_sfx('cadena');if(c.y<=0){c.st='up';b.mode='drift';b.cd=R?45:60;}}
    else{b.mode='drift';b.cd=40;}
    break;}
  case 'murcis':
    b.vx*=0.9;b.x+=b.vx;if(b.cage>0)b.cage--;
    if(b.mt===40)J5_bat(b);
    if(b.mt>=70){b.mode='drift';b.cd=55;}
    break;
  }
  if(b.mode!=='garra'&&c.st!=='up'){c.y=Math.max(0,c.y-2);if(c.y<=0)c.st='up';}
  b.x=clamp(b.x,lo,hi);b.tilt+=(b.vx*0.03-b.tilt)*0.05;
  if(b.mt%45===0&&Math.random()<0.5)J5_sfx('motor');
  bossContact(b);
}
function J5_drawNiebla(b){
  const fl=b.flash>0||(b.state==='dying'&&(T>>2)%2),C=c=>fl?'#fff':c,c=b.claw,fight=b.state==='fight',g=J5_gond(b);
  // garra: mira roja en el suelo mientras apunta
  if(fight&&b.mode==='garra'&&c.st==='aim'){const s=J5_surf(c.x,g.y+10),k=Math.min(1,c.t/40);J5_mark(c.x,s,k);
    ctx.fillStyle=`rgba(255,60,48,${0.08+0.08*k})`;ctx.fillRect(q(c.x-5),g.y+8,10,s-g.y-8);}
  // mira del cañón
  if(fight&&b.mode==='canon'&&b.aim&&b.shots===0){const sx=g.x+b.face*16,sy=g.y+4,dx=b.aim.x-sx,dy=b.aim.y-sy;ctx.fillStyle=(T>>1)%2?'#ff5a4a':'#ffb0a0';
    for(let i=1;i<9;i++){const k=i/9;ctx.fillRect(q(sx+dx*k-0.5),q(sy+dy*k-0.5),1,1);}J5_mark(b.aim.x,Math.min(GROUND,b.aim.y+9),0.6);}
  // cadena y garra
  if(c.y>0||c.st!=='up'){const top=g.y+4,cy=top+c.y,shk=c.st==='aim'?Math.sin(T*1.7)*1:0,cxw=c.st==='aim'?g.x:c.x;
    ctx.fillStyle='#4a4e58';for(let y=top;y<cy-3;y+=3)ctx.fillRect(q(cxw-0.8+(y%6?0.6:0)),y,1.6,2);
    ctx.save();ctx.translate(q(cxw+shk),q(cy));ctx.fillStyle=C('#5a606c');ctx.fillRect(-4,-4,8,4);ctx.fillStyle=C('#3a3e48');
    const op=c.st==='aim'?0.6:c.st==='drop'?0.2:0;
    for(const s of[-1,1]){ctx.save();ctx.scale(s,1);ctx.rotate(-op);ctx.beginPath();ctx.moveTo(1,0);ctx.lineTo(6,2);ctx.lineTo(5,7);ctx.lineTo(3,4);ctx.closePath();ctx.fill();ctx.restore();}
    ctx.fillStyle=c.st==='aim'&&(T>>1)%2?'#ff4a3a':'#5a1a14';ctx.fillRect(-1,-3.5,2,2);ctx.restore();}
  ctx.save();ctx.translate(q(b.x+b.w/2),q(b.y+20));ctx.rotate(b.tilt*(b.face<0?-1:1)*-1);ctx.translate(-b.w/2,-20);
  if(b.face<0){ctx.translate(b.w,0);ctx.scale(-1,1);}
  // ---- globo (mirando a la derecha en este dibujo) ----
  const env=b.rage?'#3a3046':'#4a3c52',envH=b.rage?'#5a4c62':'#6a5874';
  ctx.fillStyle=C('#2a2032');ctx.beginPath();ctx.moveTo(4,16);ctx.lineTo(-6,4);ctx.lineTo(-4,16);ctx.lineTo(-6,28);ctx.closePath();ctx.fill();   // aletas
  ctx.fillStyle=C(env);ctx.beginPath();ctx.ellipse(48,16,46,16,0,0,7);ctx.fill();
  ctx.fillStyle=C(envH);ctx.beginPath();ctx.ellipse(52,9,36,5,0,0,7);ctx.fill();
  ctx.strokeStyle=fl?'#fff':'#2a2032';ctx.lineWidth=0.7;ctx.beginPath();for(const rx of[18,32,48,64,78]){const hh=16*Math.sqrt(Math.max(0,1-((rx-48)/46)**2));ctx.moveTo(rx,16-hh);ctx.lineTo(rx,16+hh);}ctx.stroke();
  if(!fl){ctx.fillStyle='#7a3a2a';ctx.fillRect(22,18,6,3);ctx.fillRect(60,22,8,2);ctx.fillStyle='#5a2a20';ctx.fillRect(70,6,5,2);
    // emblema de la banda: tres ondas de niebla en un círculo
    ctx.fillStyle='#2a2032';circle(48,17,6);ctx.strokeStyle='#b8b0c8';ctx.lineWidth=0.8;ctx.beginPath();
    for(let i=-1;i<=1;i++){ctx.moveTo(44,17+i*2.4);ctx.quadraticCurveTo(46,15.5+i*2.4,48,17+i*2.4);ctx.quadraticCurveTo(50,18.5+i*2.4,52,17+i*2.4);}ctx.stroke();
    // luces de posición
    ctx.fillStyle=(T>>4)%2?'#ff3a30':'#5a1a14';ctx.fillRect(92,15,2,2);ctx.fillStyle=(T>>4)%2?'#5a1a14':'#3aff8a';ctx.fillRect(2,15,2,2);}
  if(b.rage&&!fl){ctx.fillStyle='#120c18';ctx.beginPath();ctx.moveTo(30,4);ctx.lineTo(36,8);ctx.lineTo(31,10);ctx.closePath();ctx.fill();ctx.fillStyle='#2a1e2c';ctx.fillRect(34,6,6,3);}   // parche y rajadura
  // hélices a los costados de la góndola
  const pw=Math.abs(Math.sin(b.prop))*5+1;ctx.fillStyle=C('#22252c');ctx.fillRect(20,32,8,3);ctx.fillStyle='rgba(200,210,230,0.45)';ctx.fillRect(19,33.5-pw,1,pw*2);
  // ---- góndola acorazada ----
  ctx.strokeStyle='#22252c';ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(34,30);ctx.lineTo(38,34);ctx.moveTo(62,30);ctx.lineTo(58,34);ctx.stroke();
  ctx.fillStyle=C('#2c2a34');ctx.beginPath();ctx.moveTo(30,34);ctx.lineTo(68,34);ctx.lineTo(64,44);ctx.lineTo(34,44);ctx.closePath();ctx.fill();
  ctx.fillStyle=C('#4a4656');ctx.fillRect(30,34,38,1.2);
  for(let i=0;i<6;i++){ctx.fillStyle=fl?'#fff':i%2?'#1d1a1c':'#d9a43a';ctx.fillRect(36+i*4,42,4,1.4);}
  // ventanas: el capo adentro (pelado, bigote y el puro que brilla)
  ctx.fillStyle='#ffd27a';ctx.fillRect(52,36,9,4);ctx.fillStyle='#14101a';ctx.beginPath();ctx.ellipse(56.5,37.6,2,1.8,0,Math.PI,0);ctx.fill();ctx.fillRect(54,37.6,5,2.4);
  ctx.fillStyle='#3a2a20';ctx.fillRect(57,38.2,2.4,0.7);ctx.fillStyle=(T>>3)%3?'#ff8a2a':'#ffd25a';ctx.fillRect(59.6,38.2,0.9,0.9);
  ctx.fillStyle='#ffd27a';ctx.fillRect(40,36,4,3);ctx.fillRect(46,36,4,3);
  // escotilla de los bidones
  const hatch=fight&&b.mode==='bidones';ctx.fillStyle=hatch?((T>>2)%2?'#ff4a3a':'#5a1a14'):'#1a1820';ctx.fillRect(43,44,8,1.5);
  // jaula de los murciélagos (al costado de atrás)
  ctx.fillStyle=C('#1a1820');ctx.fillRect(26,36,5,7);ctx.fillStyle='#4a4e58';for(let i=0;i<3;i++)ctx.fillRect(26.5+i*1.8,36,0.6,7);
  if(b.cage>0){ctx.fillStyle='#ff3a2a';ctx.fillRect(27,38+((T>>2)%2),1,1);ctx.fillRect(29,39,1,1);}
  // cañón de la góndola
  const tel=fight&&b.mode==='canon'&&b.shots===0;ctx.fillStyle=C('#22252c');ctx.fillRect(64,38,10,3);ctx.fillStyle=tel&&(T>>1)%2?'#ffef9a':'#3a1a12';ctx.fillRect(73,38,1.5,3);
  ctx.restore();
}

// ===== registro en BOSSES (sin índice fijo: el de esta misión) =====
{const i=LEVELS.indexOf(M5_LVL);BOSSES[i]={mini:{name:'LECHUZA BLINDADA',make:J5_mkLechuza},villain:{name:'DON NIEBLA',make:J5_mkNiebla}};}
