'use strict';
// Óxido · Misión 3: jefe chico (CHAPALEADOR) y villano (MADRE YUYO)
// Todo con prefijo PL_ para no pisar nombres globales de otros archivos.

// ---------- utilidades ----------
function PL_sfx(n){if(typeof SFX!=='undefined'&&SFX[n])SFX[n]();}
function PL_near(x,y){return typeof nearestPlayer==='function'&&typeof players!=='undefined'&&players.length>1?nearestPlayer(x,y):P;}
function PL_pc(p){p=p||P;return p.ride?{x:p.ride.x+p.ride.w/2,y:p.ride.y+p.ride.h/2}:{x:p.x+4,y:p.y+9};}
function PL_alive(){return (typeof players!=='undefined'&&players.length?players:[P]).filter(p=>p&&!p.dead);}
// le pega a todos los jugadores (y amigos) que tocan la caja
function PL_hurtBox(box,n){
  eachPlayer(p=>{if(!p.dead&&overlap(hurtbox(),box))hurtPlayer(n||1);});
  for(const a of allies)if(!a.gone&&overlap(a,box))killAlly(a);
}
function PL_hurtCirc(x,y,r,n){
  eachPlayer(p=>{if(p.dead)return;const hb=hurtbox();if(x+r>hb.x&&x-r<hb.x+hb.w&&y+r>hb.y&&y-r<hb.y+hb.h)hurtPlayer(n||1);});
  for(const a of allies)if(!a.gone&&overlapPt(a,x,y,r))killAlly(a);
}
// superficie (plataforma o suelo) debajo de un punto
function PL_surf(x,y){let s=GROUND;for(const pl of platforms)if(x>pl.x+1&&x<pl.x+pl.w-1&&pl.y>=y-1&&pl.y<s)s=pl.y;return s;}
function PL_hex(c){return[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];}
function PL_mix(a,b,t){if(t<=0)return a;if(t>=1)return b;const A=PL_hex(a),B=PL_hex(b);
  return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('');}
const PL_ease=t=>t<0?0:t>1?1:t*t*(3-2*t);

// =====================================================================
// JEFE CHICO · CHAPALEADOR — aerodeslizador del pantano
// Casco bajo sobre colchón de goma, hélice enjaulada atrás, cañón al frente.
// Ráfaga (aviso: luz del cañón), minas flotantes que se pueden reventar a tiros (agachate)
// y embestida rasante de punta a punta (aviso: se va a un costado y acelera la hélice; saltala).
// =====================================================================
function PL_mkHover(A){return{type:'plHover',isBoss:true,A,x:A+W+40,y:GROUND-14,w:50,h:14,hp:95,max:95,state:'enter',t:0,mt:0,face:-1,flash:0,score:3500,
  mode:'patrol',cd:50,seq:0,dir:-1,vx:0,shots:0,drops:0,fan:0,fanSp:0.3,tilt:0,sink:0,trail:[],noPush:true,touch:1,upd:PL_updHover,draw:PL_drawHover};}
function PL_hoverWake(b,big){
  const back=b.face>0?b.x+2:b.x+b.w-2,d=-b.face;
  if(T%(big?2:5)===0)parts.push({k:'p',x:back,y:GROUND-3,vx:d*rand(0.6,big?2.4:1.4),vy:rand(-1.6,-0.4),g:0.12,life:rand(14,24),maxl:24,size:rand(1,2),col:Math.random()<0.5?'#4a3a24':'#5e6a2a'});
  if(T%5===0&&Math.abs(b.vx)>0.2)b.trail.push({x:back,t:0});
}
function PL_mine(x,ph2){eproj.push({kind:'plMina',x,y:GROUND-3,r:3,t:0,fuse:-1,life:ph2?400:340,upd:PL_updMine,draw:PL_drawMine});SFX.toss();}
function PL_updMine(o,hb){
  o.t++;
  if(o.fuse<0){
    if(o.t>36){const near=PL_alive().some(p=>{const h=hurtbox(p);return Math.abs(h.x+h.w/2-o.x)<18&&h.y+h.h>GROUND-24;});if(near||o.t>o.life)o.fuse=0;}
  }else{
    if(o.fuse%5===0)tone('square',1300,1300,0.03,0.03);
    if(++o.fuse>=22){o.gone=true;explodeFx(o.x,GROUND-5,18);PL_hurtCirc(o.x,GROUND-6,15,1);
      for(let i=0;i<8;i++)parts.push({k:'p',x:o.x,y:GROUND-3,vx:rand(-1.5,1.5),vy:rand(-3,-1),g:0.15,life:rand(20,30),maxl:30,size:rand(1,2),col:'#4a3a24'});}
  }
}
function PL_drawMine(o){
  const bob=Math.sin(o.t/10+o.x)*0.8,x=q(o.x),y=q(o.y+bob),arm=o.t>36;
  ctx.fillStyle='rgba(40,32,20,0.6)';ctx.beginPath();ctx.ellipse(x,GROUND,5,1.2,0,0,7);ctx.fill();
  ctx.fillStyle='#2a2a30';circle(x,y,3);ctx.fillStyle='#3e3e48';circle(x-0.8,y-0.8,1.6);
  ctx.fillStyle='#1a1a20';ctx.fillRect(x-4,y-0.5,8,1);ctx.fillRect(x-0.5,y-4,1,2);
  const on=o.fuse>=0?(T>>1)%2:arm?(T>>4)%2:0;
  ctx.fillStyle=on?'#ff3b30':'#5a1a14';ctx.fillRect(x-0.75,y-4.8,1.5,1.5);
  if(o.fuse>=0){ctx.strokeStyle=`rgba(255,80,60,${0.3+0.3*((T>>1)%2)})`;ctx.lineWidth=0.8;ctx.beginPath();ctx.arc(x,y,8+o.fuse*0.3,0,7);ctx.stroke();}
}
function PL_updHover(b){
  b.t++;b.mt++;if(b.flash>0)b.flash--;const A=b.A,ph2=b.hp<b.max*0.5,cx=b.x+b.w/2,pc=PL_pc(),lo=A+10,hi=A+W-b.w-10;
  b.fan+=b.fanSp;
  for(const s of b.trail)s.t++;if(b.trail.length&&b.trail[0].t>110)b.trail.shift();
  if(b.state!=='dying'&&b.t%13===0)PL_sfx('hover');
  if(b.state==='enter'){b.vx=-1.6;b.x+=b.vx;b.face=-1;b.fanSp=0.7;PL_hoverWake(b,true);
    if(b.x<=A+222){b.state='intro';b.t=0;b.hp=0;b.vx=0;}return;}
  if(b.state==='intro'){bossIntro(b,50);b.face=pc.x<cx?-1:1;b.fanSp=0.35;PL_hoverWake(b,false);
    if(b.state==='fight'){b.cd=40;b.mode='patrol';}return;}
  if(b.state==='dying'){
    b.fanSp*=0.97;b.tilt+=0.006*b.face;b.sink=Math.min(14,b.sink+(b.t>50?0.16:0.03));
    if(b.t%7===0)explodeFx(b.x+rand(4,b.w-4),b.y+rand(-6,b.h)+b.sink,rand(8,14));
    if(b.t%3===0)parts.push({k:'smoke',col:'40,34,30',x:b.x+rand(8,b.w-8),y:b.y-4+b.sink,vx:rand(-0.2,0.2),vy:rand(-1,-0.5),life:40,maxl:40,size:rand(2,3.5)});
    if(b.t%4===0)parts.push({k:'p',x:b.x+rand(0,b.w),y:GROUND-2,vx:rand(-1.2,1.2),vy:rand(-2.4,-0.8),g:0.14,life:22,maxl:22,size:rand(1,2),col:'#4a3a24'});
    if(b.t>=140)bossDone(b);
    return;}
  const sp=ph2?0.9:0.62;
  if(ph2&&T%8===0)parts.push({k:'smoke',x:b.x+rand(10,40),y:b.y,vx:rand(-0.2,0.2),vy:rand(-0.8,-0.4),life:45,maxl:45,size:rand(2,3.5)});
  switch(b.mode){
  case 'patrol':{
    b.face=pc.x<cx?-1:1;b.fanSp+=(0.35-b.fanSp)*0.1;
    const tx=b.dir>0?hi:lo;b.vx+=(Math.sign(tx-b.x)*sp-b.vx)*0.08;b.x+=b.vx;
    if(b.dir>0&&b.x>=hi-2||b.dir<0&&b.x<=lo+2)b.dir*=-1;
    if(--b.cd<=0){
      const atks=ph2?['burst','ram','mines','burst','ram']:['burst','mines','burst','ram'];
      const a=atks[b.seq++%atks.length];b.mt=0;b.shots=0;b.drops=0;
      if(a==='burst'){b.mode='burstT';tone('square',880,880,0.06,0.04);}
      else if(a==='mines'){b.mode='mines';b.dir=cx<A+W/2?1:-1;}
      else{b.mode='ramGo';b.dir=pc.x<A+W/2?1:-1;} // se va al costado contrario al jugador
    }
    break;}
  case 'burstT':b.vx*=0.85;b.x+=b.vx;b.face=pc.x<cx?-1:1;
    if(b.mt%8===0)tone('square',880,880,0.04,0.035);
    if(b.mt>=(ph2?22:30)){b.mode='burst';b.mt=0;}
    break;
  case 'burst':{b.vx*=0.85;b.x+=b.vx;const n=ph2?12:8;
    if(b.mt%5===0&&b.shots<n){
      const sx=b.face>0?b.x+b.w+5:b.x-5,sy=b.y+1,d=Math.max(20,Math.abs(pc.x-sx)),spd=2.6;
      eproj.push({kind:'bullet',x:sx,y:sy,vx:b.face*spd,vy:clamp((pc.y-sy)/(d/spd),-0.8,0.8),g:0,r:1.6,t:0});SFX.eshoot();
      parts.push({k:'flash',x:sx,y:sy,life:3,maxl:3,size:4});b.x-=b.face*0.4;b.shots++;}
    if(b.shots>=n&&b.mt>n*5+10){b.mode='patrol';b.cd=ph2?55:80;}
    break;}
  case 'mines':{const n=ph2?4:3;b.face=b.dir;b.vx+=(b.dir*1.5-b.vx)*0.1;b.x+=b.vx;b.fanSp+=(0.6-b.fanSp)*0.1;
    if(b.mt>20&&b.mt%22===0&&b.drops<n){b.drops++;PL_mine(b.face>0?b.x+2:b.x+b.w-2,ph2);}
    if(b.dir>0&&b.x>=hi||b.dir<0&&b.x<=lo||b.drops>=n&&b.mt>n*22+40){b.x=clamp(b.x,lo,hi);b.mode='patrol';b.cd=ph2?50:70;b.dir*=-1;}
    break;}
  case 'ramGo':{const tx=b.dir>0?hi:lo;b.face=-b.dir;b.vx+=(Math.sign(tx-b.x)*1.8-b.vx)*0.1;b.x+=b.vx;
    if(Math.abs(tx-b.x)<3||b.mt>150){b.x=clamp(b.x,lo,hi);b.vx=0;b.mode='ramT';b.mt=0;SFX.alarm();}
    break;}
  case 'ramT':b.face=-b.dir;b.fanSp=Math.min(1.3,b.fanSp+0.03);b.x+=Math.sin(b.mt*1.7)*0.4;PL_hoverWake(b,true);
    if(b.mt%10===0)tone('sawtooth',160+b.mt*6,200+b.mt*6,0.1,0.04);
    if(b.mt>=(ph2?38:52)){b.mode='ram';b.mt=0;noise(0.4,0.2,900);}
    break;
  case 'ram':{const v=ph2?4.2:3.6;b.vx=b.face*v;b.x+=b.vx;b.tilt=-0.05;PL_hoverWake(b,true);
    if(T%2===0)parts.push({k:'smoke',col:'90,80,50',x:b.face>0?b.x:b.x+b.w,y:GROUND-3,vx:-b.face*rand(0.5,1.5),vy:rand(-0.5,-0.1),life:20,maxl:20,size:rand(1.5,3)});
    if(b.face>0&&b.x>=hi||b.face<0&&b.x<=lo){b.x=clamp(b.x,lo,hi);b.vx=0;b.tilt=0;b.mode='patrol';b.cd=ph2?45:60;b.dir=-b.face;shake=Math.max(shake,2);}
    break;}
  }
  b.x=clamp(b.x,A+2,A+W-b.w-2);
  if(b.mode!=='ram')b.tilt*=0.9;
  if(Math.abs(b.vx)>0.2)PL_hoverWake(b,false);
  bossContact(b);
}
function PL_drawHover(b){
  const fl=b.flash>0||(b.state==='dying'&&(T>>2)%2),C=c=>fl?'#fff':c,ph2=b.hp<b.max*0.5;
  // aviso de embestida: flechas rojas en el barro hacia donde va a salir
  if(b.mode==='ramT'&&b.state==='fight'&&(T>>2)%2){const d=-b.dir,x0=d>0?b.x+b.w+6:b.x-6;ctx.fillStyle='#ff3b30';
    for(let i=0;i<4;i++){const x=q(x0+d*i*14);ctx.fillRect(x,GROUND-5,1,1);ctx.fillRect(x+d,GROUND-4,1,1);ctx.fillRect(x+2*d,GROUND-3,1,1);ctx.fillRect(x+d,GROUND-2,1,1);ctx.fillRect(x,GROUND-1,1,1);}}
  // estela de barro sobre el pantano
  for(const s of b.trail){const a=1-s.t/110;ctx.fillStyle=`rgba(52,40,24,${0.55*a})`;ctx.beginPath();ctx.ellipse(s.x,GROUND+0.5,6+s.t*0.06,1.3,0,0,7);ctx.fill();}
  ctx.save();
  if(b.sink>0){ctx.beginPath();ctx.rect(b.x-40,-40,b.w+80,GROUND+1+40);ctx.clip();}
  const bob=b.state==='dying'?0:Math.sin(b.t/9)*0.8;
  ctx.translate(q(b.x+b.w/2),q(b.y+bob+b.sink+b.h/2));ctx.rotate(b.tilt);ctx.translate(-b.w/2,-b.h/2);
  if(b.face<0){ctx.translate(b.w,0);ctx.scale(-1,1);}
  // sombra/rocío bajo el colchón
  ctx.fillStyle='rgba(90,110,60,0.35)';ctx.beginPath();ctx.ellipse(25,14,27,2,0,0,7);ctx.fill();
  // soporte y jaula de la hélice (atrás)
  ctx.fillStyle=C('#2a2a30');ctx.fillRect(3,-2,3,6);ctx.fillRect(10,-1,2,4);
  ctx.fillStyle=C('#3a3a44');circle(5,-11,12);ctx.fillStyle='#14121a';circle(5,-11,10.3);
  const a=b.fan;ctx.fillStyle=fl?'#fff':'rgba(150,160,150,0.5)';
  for(let i=0;i<3;i++){const an=a+i*2.094;ctx.save();ctx.translate(5,-11);ctx.rotate(an);ctx.beginPath();ctx.ellipse(5,0,5,1.6,0,0,7);ctx.fill();ctx.restore();}
  if(b.fanSp>0.6){ctx.fillStyle='rgba(200,210,200,0.15)';circle(5,-11,10);}
  ctx.fillStyle=C('#6a6a72');circle(5,-11,1.6);
  ctx.strokeStyle=C('#4a4a54');ctx.lineWidth=0.6;ctx.beginPath();ctx.moveTo(5,-21);ctx.lineTo(5,-1);ctx.moveTo(-5,-11);ctx.lineTo(15,-11);ctx.stroke();
  ctx.fillStyle=C('#8c3b2a');ctx.fillRect(-7,-14,2.5,9); // timón
  ctx.fillStyle=(b.mode==='ramT'||b.mode==='ram')&&(T>>1)%2?'#ff3b30':'#5a1a14';ctx.fillRect(4,-24,2,2);
  // colchón de goma
  ctx.fillStyle=C('#1c1a1e');ctx.beginPath();ctx.moveTo(0,9);ctx.lineTo(50,9);ctx.quadraticCurveTo(52,14,46,14);ctx.lineTo(4,14);ctx.quadraticCurveTo(-2,14,0,9);ctx.fill();
  ctx.fillStyle=C('#2e2a30');ctx.fillRect(3,10,44,1);
  // casco
  ctx.fillStyle=C('#7a4a2a');ctx.beginPath();ctx.moveTo(0,10);ctx.lineTo(3,2);ctx.lineTo(42,2);ctx.lineTo(51,7);ctx.lineTo(49,10);ctx.closePath();ctx.fill();
  ctx.fillStyle=C('#a8643a');ctx.fillRect(4,2,37,1.5);
  ctx.fillStyle=C('#4e2c18');ctx.fillRect(2,8,46,2);
  for(let i=0;i<6;i++){ctx.fillStyle=fl?'#fff':i%2?'#1d1a1c':'#d9a43a';ctx.fillRect(9+i*3,5,3,2);}
  ctx.fillStyle=C('#3a2418');for(const rx of[6,30,38,45])ctx.fillRect(rx,4,1,1);
  // cabina
  ctx.fillStyle=C('#4e2c18');ctx.fillRect(24,-1,13,4);
  ctx.fillStyle=C('#22323c');ctx.beginPath();ctx.ellipse(31,-1,6,4.5,0,Math.PI,0);ctx.fill();
  ctx.fillStyle='rgba(180,230,220,0.5)';ctx.fillRect(28,-4,2,1);
  ctx.fillStyle=b.state==='dying'?'#3a1a0a':'#ff5a3c';ctx.fillRect(33,-2.5,2,1);
  // cañón
  ctx.fillStyle=C('#2a2a30');ctx.fillRect(38,-2,14,3.5);ctx.fillStyle=C('#1a1a20');ctx.fillRect(51,-3,3.5,5.5);
  ctx.fillStyle=C('#3e3e48');ctx.fillRect(38,-2,14,0.8);
  ctx.fillStyle=b.mode==='burstT'&&(T>>1)%2?'#ffef9a':b.mode==='burst'?'#ff9a3c':'#3a1a12';ctx.fillRect(53,-2,1.5,3.5);
  if(b.mode==='burstT'&&(T>>1)%2){ctx.fillStyle='rgba(255,239,154,0.55)';circle(56,-0.3,3.2);ctx.fillStyle='#fff';circle(56,-0.3,1.2);}
  if(ph2){ctx.fillStyle='#120c18';ctx.fillRect(14,3,2,2);ctx.fillRect(40,6,2,1);}
  ctx.restore();
}

// =====================================================================
// VILLANO · MADRE YUYO — planta carnívora gigante
// Bulbo acorazado medio hundido en el barro; cabezas-vaina con espinas sobre tallos que se estiran.
// Empieza con 2 cabezas; al bajar de 66% y de 33% le sale otra y crece. Las cabezas se pueden cortar
// (vuelven a crecer); si no le queda ninguna, el bulbo se abre y recibe más daño.
// =====================================================================
const PL_HEADS=[{rx:-60,ry:-70,ax:-10},{rx:-30,ry:-100,ax:2},{rx:52,ry:-84,ax:13},{rx:-96,ry:-48,ax:-18}];
const PL_BIG=1e6; // vida "infinita" de la caja de cada cabeza: el daño se pasa a la planta
function PL_mkPlanta(A){const cx=A+232;return{type:'plPlanta',isBoss:true,A,cx,x:cx-22,y:GROUND-30,w:44,h:30,hp:0,max:340,state:'enter',t:0,mt:0,face:-1,flash:0,score:12000,
  sc:1,scT:1,rise:0,sink:0,wilt:0,phase:0,cd:60,seq:0,heads:[],fallen:[],bub:[],lastHp:0,exposed:false,grow:0,shud:0,puff:0,touch:1,noPush:false,
  upd:PL_updPlanta,draw:PL_drawPlanta};}
function PL_newHead(b,i){const d=PL_HEADS[i];return{i,rx:d.rx,ry:d.ry,ax:d.ax,x:b.cx,y:GROUND-20,len:0,mode:'wait',mt:0,open:0,ang:-Math.PI/2,dmg:0,cutT:0,box:null,flash:0,lx:0,ly:0,kind:'',swell:0,tgt:null};}
function PL_bodyH(b){return 30*b.sc*b.rise*(1-b.sink);}
function PL_body(b){const w=Math.round(44*b.sc),h=Math.max(1,Math.round(PL_bodyH(b)));b.w=w;b.h=h;b.x=b.cx-w/2;b.y=GROUND-h;}
function PL_anchor(b,h){return{x:b.cx+h.ax*b.sc,y:GROUND-PL_bodyH(b)+4+Math.abs(h.ax)*0.25};}
function PL_rest(b,h){const k=1+0.07*b.phase;
  return{x:b.cx+h.rx*k+Math.sin(b.t/40+h.i*1.7)*6,y:GROUND+h.ry*(1+0.05*b.phase)+Math.cos(b.t/33+h.i*2.3)*4};}
function PL_headBox(b,h){
  const e={type:'plCabeza',x:h.x-7,y:h.y-6,w:14,h:12,hp:PL_BIG,flash:0,score:250,face:-1,plant:b,head:h,upd:PL_updHeadBox,draw:PL_noop,onKill:PL_headBoxKilled};
  h.box=e;enemies.push(e);return e;}
function PL_noop(){}
function PL_headBoxKilled(e){for(let i=0;i<6;i++)parts.push({k:'p',x:e.x+7,y:e.y+6,vx:rand(-1.4,1.4),vy:rand(-2,-0.4),g:0.12,life:24,maxl:24,size:1.5,col:i%2?'#5e8a2c':'#6a2a5a'});}
// el daño que recibe la caja de la cabeza pasa a la planta y suma para "cortarla"
function PL_updHeadBox(e){
  const b=e.plant,h=e.head;
  if(b.gone||b.state!=='fight'||h.box!==e){e.gone=true;return;}
  const d=PL_BIG-e.hp;if(d<=0)return;
  e.hp=PL_BIG;h.flash=4;h.dmg+=d;b.hp-=d;b.lastHp-=d;
  if(b.hp<=0){b.hp=0;kill(b);return;}
  if(h.dmg>=h.cutMax)PL_cutHead(b,h);
}
function PL_cutHead(b,h){
  if(h.box){h.box.gone=true;h.box=null;}
  const ph=b.phase;h.mode='cut';h.mt=0;h.cutT=[480,400,330][ph];h.dmg=0;h.open=0;
  b.fallen.push({x:h.x,y:h.y,vx:rand(-0.8,0.8),vy:-1.8,rot:h.ang,vr:rand(-0.15,0.15),t:0,k:1+0.08*b.phase,flip:Math.cos(h.ang)<0});
  PL_sfx('squelch');addScore(500,h.x,h.y-8);shake=Math.max(shake,3);
  for(let i=0;i<14;i++)parts.push({k:'p',x:h.x,y:h.y,vx:rand(-2,2),vy:rand(-2.5,0.5),g:0.14,life:rand(20,36),maxl:36,size:rand(1,2.2),col:i%3?'#9ad040':'#d8f060'});
  if(!b.heads.some(o=>o.mode!=='cut')&&!b.exposed){b.exposed=true;setBanner('¡EL BULBO QUEDÓ ABIERTO!',70);PL_sfx('roar');}
}
// rugido + crecimiento al pasar de fase: le sale otra cabeza y vuelven las cortadas
function PL_grow(b){
  b.phase++;b.grow=90;b.scT=1+0.14*b.phase;
  setBanner(b.phase===1?'¡LE CRECE OTRA CABEZA!':'¡ESTÁ FURIOSA!',90);PL_sfx('roar');shake=Math.max(shake,6);
  for(const h of b.heads){if(h.mode==='cut'){h.mode='emerge';h.len=0;h.cutT=0;}else if(h.mode!=='emerge'){h.mode='roar';h.mt=0;}}
  const nh=PL_newHead(b,b.heads.length);nh.mode='wait';nh.mt=-30;b.heads.push(nh);
  eproj.length=0;
}
function PL_free(b){return b.heads.filter(h=>h.mode==='idle'&&h.len>=1);}
function PL_brotes(){return enemies.filter(e=>e.type==='brote'&&!e.gone).length;}

// ---------- ataques ----------
// esporas: caen del cielo con marca en el suelo y dejan una nube tóxica un rato
function PL_spores(b,fx,fy){
  const ph=b.phase,n=[5,6,8][ph],pc=PL_pc(),gap=ph===2?26:30;
  const off=rand(-10,10);
  for(let k=0;k<n;k++){const x=clamp(pc.x+off+(k-(n-1)/2)*gap+rand(-5,5),b.A+8,b.A+W-8);
    eproj.push({kind:'plEspora',x,y:-10-k*10-rand(0,8),vx:0,vy:0.2,r:2.5,t:0,ph:rand(0,6),life:[150,170,190][ph],upd:PL_updSpore,draw:PL_drawSpore});}
  for(let i=0;i<12;i++)parts.push({k:'p',x:fx,y:fy,vx:rand(-0.8,0.8),vy:rand(-4.5,-2.5),g:0.04,life:rand(30,45),maxl:45,size:rand(1.5,2.5),col:i%2?'#c8e060':'#8ab040'});
  PL_sfx('spores');
}
function PL_updSpore(o,hb){
  o.t++;o.vy=Math.min(o.vy+0.025,1.35);o.y+=o.vy;o.vx=Math.sin(o.t/12+o.ph)*0.25;o.x+=o.vx;
  if(o.y<0)return;
  if(coverBlocks(o)){o.gone=true;PL_puff(o.x,o.y,6);return;}
  if(hb&&overlapPt(hb,o.x,o.y,o.r)){o.gone=true;hurtPlayer(1);PL_cloud(o.x,PL_surf(o.x,o.y),o.life);return;}
  const s=PL_surf(o.x,o.y-o.vy);
  if(o.y>=s-1){o.gone=true;PL_cloud(o.x,s,o.life);}
}
function PL_drawSpore(o){
  if(o.y>-4){const s=PL_surf(o.x,Math.max(0,o.y)),k=clamp(1-(s-o.y)/170,0.2,1);
    ctx.fillStyle=`rgba(190,240,90,${0.25+0.4*k*((T>>2)%2?1:0.6)})`;ctx.beginPath();ctx.ellipse(o.x,s,3+5*k,1.6,0,0,7);ctx.fill();
    if(k>0.6&&(T>>2)%2){ctx.fillStyle='rgba(225,255,140,0.8)';ctx.fillRect(q(o.x-0.5),s-2,1,1);}}
  const x=o.x,y=o.y;
  ctx.fillStyle='#4a6a1a';circle(x,y,o.r+0.6);ctx.fillStyle='#b8d850';circle(x,y,o.r);
  ctx.fillStyle='#e8f8a0';ctx.fillRect(q(x-1),q(y-1.5),1,1);
  ctx.fillStyle='#4a6a1a';for(let i=0;i<4;i++){const a=o.t*0.08+i*1.57;ctx.fillRect(q(x+Math.cos(a)*3.3-0.5),q(y+Math.sin(a)*3.3-0.5),1,1);}
}
function PL_puff(x,y,n){for(let i=0;i<n;i++)parts.push({k:'smoke',col:'150,200,70',x:x+rand(-3,3),y:y+rand(-3,3),vx:rand(-0.4,0.4),vy:rand(-0.5,-0.1),life:rand(20,34),maxl:34,size:rand(1.5,3)});}
// nube tóxica: no tiene "r" para que no se pueda reventar a tiros
function PL_cloud(x,y,life){eproj.push({kind:'plNube',x,y,rad:9,t:0,life,upd:PL_updCloud,draw:PL_drawCloud});PL_puff(x,y-3,5);}
function PL_updCloud(o,hb){
  o.t++;if(o.t>o.life){o.gone=true;return;}
  if(o.t%9===0)parts.push({k:'smoke',col:'150,200,70',x:o.x+rand(-7,7),y:o.y-rand(2,10),vx:rand(-0.15,0.15),vy:-0.3,life:24,maxl:24,size:rand(1,2)});
  if(o.t>8&&o.t<o.life-20&&hb){const cy=o.y-6,r=o.rad*0.8;if(o.x+r>hb.x&&o.x-r<hb.x+hb.w&&cy+r>hb.y&&cy-r<hb.y+hb.h)hurtPlayer(1);}
}
function PL_drawCloud(o){
  const a=Math.min(1,o.t/8,(o.life-o.t)/30),g=Math.min(1,o.t/10);
  for(let i=0;i<5;i++){const ox=Math.sin(o.t/14+i*1.3)*4+(i-2)*3.2,oy=-5-Math.cos(o.t/11+i)*2-(i%2)*2,r=(4+(i%3))*g;
    ctx.fillStyle=`rgba(${i%2?'120,170,50':'160,210,70'},${0.38*a})`;circle(o.x+ox,o.y+oy,r);}
  ctx.fillStyle=`rgba(210,250,120,${0.5*a})`;for(let i=0;i<3;i++)ctx.fillRect(q(o.x-6+((o.t*0.3+i*5)%12)),q(o.y-3-((o.t*0.4+i*4)%10)),1,1);
}
// raíces: marca en el suelo debajo del jugador y después salen espinosas
function PL_root(x,base,tel,d){eproj.push({kind:'plRaiz',x,y:base,t:-(d||0),tel,hgt:0,upd:PL_updRoot,draw:PL_drawRoot});}
function PL_updRoot(o,hb){
  o.t++;if(o.t<0)return;
  if(o.t<o.tel){if(o.t%6===0)parts.push({k:'p',x:o.x+rand(-5,5),y:o.y-1,vx:rand(-0.3,0.3),vy:rand(-1.2,-0.4),g:0.08,life:14,maxl:14,size:1,col:'#5a4a2a'});if(o.t%12===0)PL_sfx('bubble');return;}
  if(o.t===o.tel){PL_sfx('squelch');shake=Math.max(shake,2);dust(o.x,o.y,5);}
  const e=o.t-o.tel;o.hgt=e<6?28*e/6:e<26?28:Math.max(0,28*(1-(e-26)/10));
  if(e<26&&o.hgt>8)PL_hurtBox({x:o.x-5,y:o.y-o.hgt,w:10,h:o.hgt},1);
  if(e>=36)o.gone=true;
}
function PL_drawRoot(o){
  if(o.t<0)return;
  const x=q(o.x),y=o.y;
  if(o.t<o.tel+4){const on=(T>>2)%2,k=Math.min(1,o.t/o.tel);
    ctx.fillStyle='rgba(30,18,24,0.85)';ctx.beginPath();ctx.ellipse(x,y+0.5,9,2,0,0,7);ctx.fill();
    ctx.fillStyle=on?'#e0ff70':'#9ad040';ctx.fillRect(x-8,y-1,4,1.5);ctx.fillRect(x-2,y-2,3,2);ctx.fillRect(x+4,y-1,4,1.5);ctx.fillRect(x-5,y-0.5,2,1);ctx.fillRect(x+2,y-0.5,2,1);
    const gh=6+18*k;ctx.fillStyle=`rgba(200,240,96,${(on?0.22:0.12)+0.12*k})`;ctx.fillRect(x-6,y-gh,12,gh);
    ctx.fillStyle='rgba(225,255,140,0.7)';for(let i=0;i<3;i++)ctx.fillRect(q(x-5+((o.t*0.7+i*4)%10)),q(y-((o.t*0.9+i*7)%gh)),1,1);}
  if(o.hgt>0){const h=o.hgt;ctx.lineCap='round';
    for(const [dx,s,c] of[[-4,0.75,-1],[4,0.85,1],[0,1,0]]){const tx=x+dx+c*3+Math.sin(o.t/4+dx)*1,ty=y-h*s;
      ctx.strokeStyle='#2a1626';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x+dx,y+1);ctx.quadraticCurveTo(x+dx-c*3,y-h*s*0.5,tx,ty);ctx.stroke();
      ctx.strokeStyle='#6a2a5a';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(x+dx,y+1);ctx.quadraticCurveTo(x+dx-c*3,y-h*s*0.5,tx,ty);ctx.stroke();
      ctx.fillStyle='#e8e0b0';for(let i=1;i<4;i++){const u=i/4,px=x+dx+(tx-x-dx)*u-c*3*2*u*(1-u),py=y-h*s*u;ctx.fillRect(q(px+(i%2?1.5:-2.5)),q(py),1.5,1);}
      ctx.fillStyle='#9ad040';ctx.fillRect(q(tx-1),q(ty-1),2,2);}
    ctx.lineCap='butt';}
}
// semillas: salen en arco, se clavan y se abren en criaturitas (se pueden reventar antes)
function PL_seeds(b,h){
  const ph=b.phase,n=Math.min([2,2,3][ph],4-PL_brotes());if(n<=0)return;
  const pc=PL_pc(PL_near(h.x,h.y));
  for(let k=0;k<n;k++){const side=k%2?1:-1,tx=clamp(pc.x+side*rand(28,70),b.A+10,b.A+W-10),Tt=48,g=0.12;
    eproj.push({kind:'plSemilla',x:h.x,y:h.y,vx:(tx-h.x)/Tt,vy:(GROUND-h.y-0.5*g*Tt*Tt)/Tt,g,r:2,t:0,planted:false,ht:0,upd:PL_updSeed,draw:PL_drawSeed});}
  PL_sfx('spit');
}
function PL_updSeed(o,hb){
  o.t++;
  if(o.planted){if(++o.ht>=44){o.gone=true;enemies.push(PL_mkBrote(o.x,o.y));PL_puff(o.x,o.y-2,4);}return;}
  o.vy+=o.g;o.x+=o.vx;o.y+=o.vy;
  if(coverBlocks(o)){o.gone=true;PL_puff(o.x,o.y,4);return;}
  if(hb&&overlapPt(hb,o.x,o.y,o.r)){o.gone=true;hurtPlayer(1);PL_puff(o.x,o.y,4);return;}
  const s=PL_surf(o.x,o.y-o.vy);
  if(o.y>=s-1&&o.vy>0){o.y=s-1;o.planted=true;o.vx=o.vy=0;PL_sfx('squelch');}
  if(o.t>300)o.gone=true;
}
function PL_drawSeed(o){
  const w=o.planted?Math.sin(o.ht*0.6)*(o.ht/44)*1.2:0,x=q(o.x+w),y=q(o.y);
  ctx.fillStyle='#3a2418';ctx.beginPath();ctx.ellipse(x,y-1,2.4,3,o.planted?0:o.t*0.3,0,7);ctx.fill();
  ctx.fillStyle='#8a5a2a';ctx.fillRect(x-1,y-3,1,2);
  if(o.planted){ctx.fillStyle=(T>>2)%2?'#c8f060':'#6a9a2a';ctx.fillRect(x-0.5,y-4-o.ht/12,1,2+o.ht/12);}
}
// criaturita: brote con dos hojas que salta hacia el jugador
function PL_mkBrote(x,y){const hp=Math.max(1,Math.round(3*DIFF().ehp));
  return{type:'brote',x:x-4,y:y-8,w:8,h:8,vx:0,vy:-2,hp,face:-1,t:0,cd:rand(20,40),flash:0,score:150,onGround:false,plat:null,
    upd:PL_updBrote,draw:PL_drawBrote,onKill:PL_broteMuere};}
function PL_updBrote(e){
  e.t++;const pc=PL_pc(),cx=e.x+4;e.face=pc.x<cx?-1:1;
  if(e.onGround){e.vx=e.face*0.5;if(--e.cd<=0&&!P.dead){e.vy=-3.2;e.vx=e.face*1.4;e.onGround=false;e.cd=rand(45,75);tone('triangle',500,900,0.06,0.025);}}
  e.x+=e.vx*(L.speedMul?L.speedMul(e):1);const pb=e.y+e.h;e.vy=Math.min(e.vy+0.25,5);e.y+=e.vy;land(e,pb,true);
  e.x=clamp(e.x,camX+2,camX+VW-10);
  if(touchAny(e)){PL_hurtBox(e,1);e.vx=-e.face*1.5;e.vy=-2;e.onGround=false;e.x-=e.face*3;}
}
function PL_drawBrote(e){
  const fl=e.flash>0,C=c=>fl?'#fff':c,x=q(e.x),y=q(e.y),sq=e.onGround?Math.abs(Math.sin(e.t/5))*0.8:0,f=e.face;
  ctx.fillStyle='rgba(30,24,16,0.4)';ctx.beginPath();ctx.ellipse(x+4,GROUND>e.y+9?e.y+8.5:GROUND,4,1,0,0,7);ctx.fill();
  ctx.fillStyle=C('#3e6a24');ctx.beginPath();ctx.ellipse(x+4,y+5+sq,4,3.4-sq,0,0,7);ctx.fill();
  ctx.fillStyle=C('#6a2a5a');ctx.fillRect(x+1,y+6+sq,6,1);
  const fl2=Math.sin(e.t/4)*1.5;
  ctx.fillStyle=C('#7aa83a');ctx.beginPath();ctx.moveTo(x+3,y+2);ctx.lineTo(x-1,y-2+fl2);ctx.lineTo(x+1,y+3);ctx.fill();
  ctx.beginPath();ctx.moveTo(x+5,y+2);ctx.lineTo(x+9,y-2-fl2);ctx.lineTo(x+7,y+3);ctx.fill();
  const mx=f>0?x+6:x+2;ctx.fillStyle='#2a0c14';ctx.fillRect(mx-1.5,y+4+sq,3,2);
  ctx.fillStyle='#e8e0b0';ctx.fillRect(mx-1.5,y+4+sq,1,0.8);ctx.fillRect(mx+0.5,y+4+sq,1,0.8);
  ctx.fillStyle='#d8f060';ctx.fillRect(f>0?x+4.5:x+2.5,y+3+sq,1,1);
}
function PL_broteMuere(e){PL_puff(e.x+4,e.y+4,5);for(let i=0;i<6;i++)parts.push({k:'p',x:e.x+4,y:e.y+4,vx:rand(-1.4,1.4),vy:rand(-2,-0.5),g:0.14,life:22,maxl:22,size:1.5,col:i%2?'#3e6a24':'#9ad040'});PL_sfx('squelch');}

// ---------- cabezas ----------
function PL_updHeads(b){
  const ph=b.phase,fight=b.state==='fight';
  for(const h of b.heads){
    if(h.flash>0)h.flash--;h.mt++;
    const an=PL_anchor(b,h),r=PL_rest(b,h);
    const ease=(tx,ty,k)=>{h.x+=(tx-h.x)*k;h.y+=(ty-h.y)*k;};
    const tgt=h.tgt||PL_pc(PL_near(h.x,h.y));
    let look=Math.atan2(tgt.y-h.y,tgt.x-h.x);
    switch(h.mode){
    case 'wait':h.x=an.x;h.y=an.y;h.len=0;if(h.mt>=0){h.mode='emerge';PL_sfx('emerge');}break;
    case 'emerge':{h.len=Math.min(1,h.len+0.025);const e=PL_ease(h.len);h.x=an.x+(r.x-an.x)*e;h.y=an.y+(r.y-an.y)*e;h.open=0.2+0.6*Math.sin(h.len*Math.PI);
      look=-Math.PI/2+(look+Math.PI/2)*e;
      if(h.len>=1){h.mode='idle';h.mt=0;h.dmg=0;if(fight&&!h.box)PL_headBox(b,h);if(b.exposed){b.exposed=false;}}
      if(h.len<0.1&&h.mt%3===0)parts.push({k:'p',x:an.x+rand(-3,3),y:an.y,vx:rand(-1,1),vy:rand(-2,-0.5),g:0.12,life:18,maxl:18,size:1.5,col:'#4a3a24'});
      break;}
    case 'idle':ease(r.x,r.y,0.08);h.open+=(0.18+Math.sin(b.t/20+h.i)*0.08-h.open)*0.2;h.tgt=null;break;
    case 'roar':h.len=Math.min(1,h.len+0.03);ease(r.x+(r.x<an.x?-6:6),r.y-12,0.1);h.open+=(1-h.open)*0.3;h.x+=rand(-0.8,0.8);look=-Math.PI/2+(r.x<an.x?-0.5:0.5);
      if(h.mt>=60){h.mode='idle';h.mt=0;}break;
    case 'biteT':{const tel=[40,34,28][ph];
      if(h.mt<0){ease(r.x,r.y,0.08);break;}
      if(h.mt===0)tone('sawtooth',200,320,0.2,0.04);
      if(h.mt===tel-6){const p=PL_pc(PL_near(h.x,h.y));h.tgt={x:p.x,y:Math.min(p.y,GROUND-5)};}
      const dx=Math.cos(look),dy=Math.sin(look);
      ease(r.x-dx*12,r.y-dy*6-5,0.15);h.x+=rand(-0.7,0.7);h.open+=(1-h.open)*0.25;
      if(h.mt>=tel){h.mode='bite';h.mt=0;h.lx=h.tgt?h.tgt.x:tgt.x;h.ly=h.tgt?h.tgt.y:tgt.y;noise(0.15,0.08,700);}
      break;}
    case 'bite':{const sp=[4.2,4.8,5.4][ph],dx=h.lx-h.x,dy=h.ly-h.y,d=Math.hypot(dx,dy);
      look=Math.atan2(dy,dx);h.open=1;
      if(d>sp){h.x+=dx/d*sp;h.y+=dy/d*sp;}
      const ax=h.x-an.x,ay=h.y-an.y,ad=Math.hypot(ax,ay),R=175;let stop=d<=sp||h.mt>45;
      if(ad>R){h.x=an.x+ax/ad*R;h.y=an.y+ay/ad*R;stop=true;}
      if(h.y>GROUND-5){h.y=GROUND-5;}
      if(stop){h.mode='chomp';h.mt=0;PL_sfx('bite');}
      break;}
    case 'chomp':h.open+=(0-h.open)*0.5;look=h.ang;if(h.mt===3){shake=Math.max(shake,1.5);for(let i=0;i<4;i++)parts.push({k:'p',x:h.x,y:h.y,vx:rand(-1,1),vy:rand(-1.5,0),g:0.1,life:14,maxl:14,size:1,col:'#d8f060'});}
      if(h.mt>=14){h.mode='ret';h.mt=0;}break;
    case 'ret':ease(r.x,r.y,0.07);h.open+=(0.3-h.open)*0.1;h.tgt=null;if(h.mt>=34){h.mode='idle';h.mt=0;}break;
    case 'spitT':{const tel=34;ease(r.x,r.y-16,0.1);h.open+=(1-h.open)*0.2;h.swell=Math.min(1,h.mt/tel);look=-Math.PI/2+(tgt.x<h.x?-0.35:0.35);
      if(h.mt%4===0)parts.push({k:'p',x:h.x+rand(-4,4),y:h.y+rand(-4,4),vx:0,vy:-0.2,g:0,life:10,maxl:10,size:1,col:h.kind==='spores'?'#c8e060':'#8a5a2a'});
      if(h.mt>=tel){h.mode='spit';h.mt=0;h.swell=0;if(h.kind==='spores')PL_spores(b,h.x,h.y);else PL_seeds(b,h);h.y+=6;}
      break;}
    case 'spit':ease(r.x,r.y,0.08);h.open+=(0.2-h.open)*0.15;look=-Math.PI/2+(tgt.x<h.x?-0.35:0.35);if(h.mt>=20){h.mode='idle';h.mt=0;}break;
    case 'cut':h.x=an.x+(r.x-an.x)*0.12;h.y=an.y-10;if(--h.cutT<=0){h.mode='emerge';h.len=0;h.mt=0;PL_sfx('emerge');}
      if(h.mt%10===0)parts.push({k:'p',x:h.x,y:h.y,vx:rand(-0.2,0.2),vy:0.2,g:0.1,life:16,maxl:16,size:1,col:'#9ad040'});
      break;
    case 'die':{const k=Math.min(1,b.t/120),gx=an.x+(r.x-an.x)*(0.8+k*0.3),gy=an.y+(r.y-an.y)*(1-k)+(GROUND-6-an.y)*k*0.9;
      ease(gx,Math.min(GROUND-5,gy),0.05);h.open+=(0.45-h.open)*0.05;look=h.ang+(Math.PI/2-h.ang)*0.03;break;}
    }
    h.ang=h.mode==='cut'?-Math.PI/2:look;
    if(h.box){h.box.x=h.x-7;h.box.y=h.y-6;}
    if(fight&&(h.mode==='bite'||h.mode==='chomp'&&h.mt<6))PL_hurtBox({x:h.x-6,y:h.y-5,w:12,h:10},1);
  }
}
function PL_attack(b){
  const ph=b.phase,seqs=[['bite','spores','bite','roots','seeds'],['bite','roots','spores','bite','seeds','bite'],['bite','spores','roots','bite','seeds','bite','roots']];
  const s=seqs[ph];let a=s[b.seq++%s.length];const free=PL_free(b),pc=PL_pc();
  if(!free.length)a='roots';
  if(a==='seeds'&&PL_brotes()>=3)a='bite';
  if(a==='bite'){
    free.sort((p,q2)=>Math.hypot(p.x-pc.x,p.y-pc.y)-Math.hypot(q2.x-pc.x,q2.y-pc.y));
    free[0].mode='biteT';free[0].mt=0;
    if(ph>=1&&free[1]){free[1].mode='biteT';free[1].mt=ph===2?-14:-22;}
    b.cd=[95,80,66][ph];
  }else if(a==='spores'||a==='seeds'){
    const h=a==='spores'?free.reduce((m,o)=>o.y<m.y?o:m,free[0]):free[free.length-1];
    h.mode='spitT';h.mt=0;h.kind=a;b.cd=a==='spores'?[120,100,88][ph]:[95,85,75][ph];
  }else{
    const tel=[46,40,34][ph];b.shud=tel;PL_sfx('bubble');
    for(const p of PL_alive()){const c=PL_pc(p),base=(!p.ride&&p.onGround&&p.plat)?p.plat.y:GROUND;
      PL_root(clamp(c.x,b.A+8,b.A+W-8),base,tel,0);
      if(ph>=1){PL_root(clamp(c.x-26,b.A+8,b.A+W-8),base===GROUND?GROUND:PL_surf(c.x-26,base),tel,16);}
      if(ph>=2){PL_root(clamp(c.x+26,b.A+8,b.A+W-8),base===GROUND?GROUND:PL_surf(c.x+26,base),tel,32);}}
    b.cd=[100,85,72][ph];
  }
}
function PL_updFallen(b){
  for(const f of b.fallen){f.t++;if(f.y<GROUND-4){f.vy+=0.2;f.y+=f.vy;f.x+=f.vx;f.rot+=f.vr;}else{f.y=GROUND-4;f.vx=0;f.vr*=0.8;}}
  if(b.fallen.length&&b.fallen[0].t>170)b.fallen.shift();
}
function PL_updPlanta(b){
  b.t++;b.mt++;if(b.flash>0)b.flash--;const A=b.A;
  b.sc+=(b.scT-b.sc)*0.04;PL_body(b);PL_updFallen(b);
  for(const u of b.bub)u.t++;b.bub=b.bub.filter(u=>u.t<u.life);
  if(b.state==='enter'){
    if(b.t===1){setBanner('¡EL BARRO BURBUJEA!',100);if(typeof SONGS!=='undefined'&&SONGS.plant)playMusic('plant');for(let i=0;i<2;i++)b.heads.push(PL_newHead(b,i));}
    if(b.t<100){shake=Math.max(shake,0.4+b.t/60);
      if(b.t%3===0)b.bub.push({x:b.cx+rand(-60,60)*(0.4+b.t/170),r:rand(1.5,4),t:0,life:rand(16,30)});
      if(b.t%14===0)PL_sfx('bubble');if(b.t%25===0)tone('sine',50,38,0.4,0.12);return;}
    if(b.t===100){PL_sfx('emerge');shake=7;noise(0.6,0.35,400);
      for(let i=0;i<30;i++)parts.push({k:'p',x:b.cx+rand(-24,24),y:GROUND-2,vx:rand(-2.5,2.5),vy:rand(-4.5,-1.5),g:0.16,life:rand(30,50),maxl:50,size:rand(1.5,3),col:i%3?'#4a3a24':'#5e7a2a'});}
    b.rise=PL_ease((b.t-100)/45);
    if(b.t===118)for(const h of b.heads){h.mode='emerge';h.len=0;h.mt=0;}
    PL_updHeads(b);
    if(b.t>=150){b.rise=1;b.state='intro';b.t=0;b.hp=0;PL_sfx('roar');for(const h of b.heads){h.mode='roar';h.mt=0;}}
    return;}
  if(b.state==='intro'){ // como bossIntro, pero con la música de la planta
    const dur=80;
    if(b.t===1){setBanner(b.name,130);if(typeof SONGS!=='undefined'&&SONGS.plant)playMusic('plant');else playMusic('boss');shake=Math.max(shake,5);}
    b.hp=Math.min(b.max,b.max*b.t/dur);
    if(b.t%4===0&&b.hp<b.max)tone('square',300+b.hp/b.max*500,300+b.hp/b.max*500,0.03,0.02);
    PL_updHeads(b);
    if(b.t>=dur){b.hp=b.max;b.lastHp=b.hp;b.state='fight';b.mt=0;b.cd=50;
      for(const h of b.heads){h.cutMax=Math.round(34*DIFF().ehp);if(h.mode==='wait'||h.mode==='emerge')continue;h.len=1;if(!h.box)PL_headBox(b,h);}}
    return;}
  if(b.state==='dying'){
    b.wilt=Math.min(1,b.t/100);
    if(b.t===1){for(const h of b.heads){if(h.box){h.box.gone=true;h.box=null;}if(h.mode!=='cut')h.mode='die';}setBanner('¡SE ESTÁ MARCHITANDO!',100);PL_sfx('roar');}
    PL_updHeads(b);
    if(b.t%6===0)PL_puff(b.cx+rand(-20,20)*b.sc,GROUND-rand(4,24)*b.sc,3);
    if(b.t%20===0){tone('sine',80-b.t*0.2,40,0.4,0.12);shake=Math.max(shake,2);}
    if(b.t%9===0){const h=pick(b.heads);if(h)PL_puff(h.x,h.y,4);}
    if(b.t>110)b.sink=Math.min(0.55,(b.t-110)/90*0.55);
    if(b.t===160){shake=9;SFX.bigboom();PL_sfx('spores');
      for(let i=0;i<4;i++)parts.push({k:'ring',col:'170,230,90',x:b.cx,y:GROUND-14,r:3,max:30+i*16,life:22+i*6,maxl:22+i*6});
      for(let i=0;i<50;i++){const a=rand(Math.PI,Math.PI*2),s=rand(0.8,3.5);parts.push({k:'smoke',col:pick(['150,200,70','120,170,50','200,230,110']),x:b.cx+rand(-14,14),y:GROUND-14,vx:Math.cos(a)*s,vy:Math.sin(a)*s*0.8,life:rand(40,80),maxl:80,size:rand(2,5)});}
      for(let i=0;i<24;i++)parts.push({k:'p',x:b.cx,y:GROUND-16,vx:rand(-3,3),vy:rand(-4.5,-1),g:0.12,life:rand(40,70),maxl:70,size:rand(1.5,2.5),col:pick(['#d8f060','#9ad040','#6a2a5a'])});
      b.heads.length=0;}
    if(b.t>=200)bossDone(b);
    return;}
  // --- pelea ---
  // el bulbo acorazado recibe menos daño (más si quedó abierto)
  if(b.hp<b.lastHp){const d=b.lastHp-b.hp;b.hp=b.lastHp-d*(b.exposed?1.5:0.6);if(b.hp<=0){b.hp=0;b.lastHp=0;kill(b);return;}}
  b.lastHp=b.hp;
  if(b.phase===0&&b.hp<b.max*0.66||b.phase===1&&b.hp<b.max*0.33)PL_grow(b);
  for(const h of b.heads)if(!h.cutMax)h.cutMax=Math.round(34*DIFF().ehp);
  if(b.grow>0){b.grow--;shake=Math.max(shake,b.grow>60?2.5:0.5);if(b.grow===0)b.cd=40;}
  else if(--b.cd<=0)PL_attack(b);
  if(b.shud>0)b.shud--;
  if(b.phase>0&&T%(b.phase===2?7:12)===0)PL_puff(b.cx+rand(-18,18)*b.sc,GROUND-rand(14,26)*b.sc,1);
  if(T%40===0&&Math.random()<0.5)b.bub.push({x:b.cx+rand(-40,40),r:rand(1.5,3),t:0,life:20});
  PL_updHeads(b);
  bossContact(b);
}

// ---------- dibujo ----------
function PL_drawStalk(b,h,an,wl,fl){
  const hx=h.x,hy=h.y,cx=an.x+(hx-an.x)*0.15,cy=Math.min(an.y,hy)-14-Math.abs(hx-an.x)*0.1;
  const n=12,pts=[];
  for(let i=0;i<=n;i++){const u=i/n,v=1-u;let x=v*v*an.x+2*v*u*cx+u*u*hx,y=v*v*an.y+2*v*u*cy+u*u*hy;
    const tx=2*v*(cx-an.x)+2*u*(hx-cx),ty=2*v*(cy-an.y)+2*u*(hy-cy),tl=Math.hypot(tx,ty)||1,w=Math.sin(u*Math.PI)*Math.sin(b.t/9+h.i*2+u*5)*2.4*(1-wl);
    x+=-ty/tl*w;y+=tx/tl*w;pts.push([x,y,-ty/tl,tx/tl]);}
  const line=(lw,col)=>{ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(const p of pts)ctx.lineTo(p[0],p[1]);ctx.stroke();};
  ctx.lineCap='round';ctx.lineJoin='round';
  const k=b.sc;
  line(5.4*k,fl?'#fff':PL_mix('#1a2a12','#2a2014',wl));line(3.6*k,fl?'#fff':PL_mix('#3e6a24','#6a5a30',wl));
  ctx.lineWidth=1;ctx.strokeStyle=PL_mix('#6a9a3a','#8a7a4a',wl);ctx.beginPath();for(let i=1;i<n;i++){const p=pts[i];ctx.lineTo(p[0]-p[2]*1,p[1]-p[3]*1);}ctx.stroke();
  ctx.fillStyle=PL_mix('#c8c090','#8a7a5a',wl);
  for(let i=2;i<n;i+=2){const p=pts[i],s=i%4?1:-1;ctx.beginPath();ctx.moveTo(p[0]+p[2]*1.6*s,p[1]+p[3]*1.6*s);ctx.lineTo(p[0]+p[2]*4*s,p[1]+p[3]*4*s);ctx.lineTo(p[0]+p[2]*1.6*s+(pts[i+1][0]-p[0])*0.5,p[1]+p[3]*1.6*s+(pts[i+1][1]-p[1])*0.5);ctx.fill();}
  ctx.lineCap='butt';ctx.lineJoin='miter';
  return pts;
}
// cabeza-vaina: dos mandíbulas con espinas, costillas violetas y una cresta de hojas atrás (sin ojos)
function PL_drawHead(x,y,ang,open,k,fl,wl,glow,swell,flip){
  const M=(a,d)=>fl?'#fff':PL_mix(a,d,wl);
  ctx.save();ctx.translate(q(x),q(y));ctx.rotate(ang);if(flip)ctx.scale(1,-1);const s=k*(1+swell*0.22);ctx.scale(s,s);
  // cresta de hojas
  ctx.fillStyle=M('#2f5420','#4a3a22');
  for(const[a,l]of[[-0.9,9],[0,10],[0.9,9]]){ctx.beginPath();ctx.moveTo(-5,-1.5);ctx.lineTo(-5+Math.cos(Math.PI+a)*l,Math.sin(Math.PI+a)*l);ctx.lineTo(-5,1.5);ctx.fill();}
  ctx.fillStyle=M('#4a7a2a','#5a4a2a');ctx.beginPath();ctx.moveTo(-5,-1);ctx.lineTo(-13,-3);ctx.lineTo(-5,1);ctx.fill();
  // garganta
  if(open>0.05){ctx.fillStyle=M('#5a1424','#3a2418');ctx.beginPath();ctx.ellipse(4,0,9,1+open*5.5,0,0,7);ctx.fill();
    ctx.fillStyle=glow?((T>>1)%2?'#ffffff':'#f8ff9a'):M('#d8f060','#6a5a30');circle(0,0,open*2.6);}
  // mandíbula de abajo
  ctx.save();ctx.translate(-4,1);ctx.rotate(open*0.55);
  ctx.fillStyle=M('#4a1f3a','#3a2a1a');ctx.beginPath();ctx.moveTo(0,-0.5);ctx.lineTo(15,0);ctx.lineTo(12,3.6);ctx.lineTo(2,4.6);ctx.closePath();ctx.fill();
  ctx.fillStyle=M('#7a9a34','#6a5a30');ctx.fillRect(1,-0.5,13,1);
  ctx.fillStyle=M('#e8e0b0','#a89a70');for(let i=3;i<14;i+=3){ctx.beginPath();ctx.moveTo(i,-0.4);ctx.lineTo(i+0.8,-2.4);ctx.lineTo(i+1.8,-0.4);ctx.fill();}
  ctx.restore();
  // mandíbula de arriba
  ctx.save();ctx.translate(-4,-1);ctx.rotate(-open*0.6);
  ctx.fillStyle=M('#5e8a2c','#6a5a30');ctx.beginPath();ctx.moveTo(0,1);ctx.lineTo(2,-6);ctx.lineTo(9,-7.2);ctx.lineTo(15,-3.5);ctx.lineTo(17,1.5);ctx.lineTo(15,0.8);ctx.closePath();ctx.fill();
  ctx.fillStyle=M('#86b040','#7a6a40');ctx.fillRect(3,-6,7,1);
  ctx.strokeStyle=M('#6a2a5a','#4a2a2a');ctx.lineWidth=1;ctx.beginPath();for(const rx of[4.5,8,11.5]){ctx.moveTo(rx,-5.8);ctx.lineTo(rx+1.4,0.6);}ctx.stroke();
  ctx.fillStyle=M('#e8e0b0','#a89a70');for(let i=3;i<15;i+=3){ctx.beginPath();ctx.moveTo(i,0.6);ctx.lineTo(i+0.8,2.8);ctx.lineTo(i+1.8,0.6);ctx.fill();}
  ctx.fillStyle=wl>0.5?'#6a5a30':(T>>4)%2?'#d8f060':'#a8c040';ctx.fillRect(6,-4.5,1.2,1.2);ctx.fillRect(12,-3,1,1);
  ctx.restore();
  // collar del tallo
  ctx.fillStyle=M('#24401a','#3a3020');circle(-5,0,3.2);ctx.fillStyle=M('#3e6a24','#5a4a2a');circle(-5,-0.6,2);
  ctx.restore();
}
function PL_drawBulb(b,wl,fl){
  const s=b.sc,cx=b.cx,bh=PL_bodyH(b),rw=24*s,M=(a,d)=>fl?'#fff':PL_mix(a,d,wl);
  if(bh<1)return;
  ctx.save();ctx.beginPath();ctx.rect(cx-rw-20,GROUND-bh-20,rw*2+40,bh+20+1);ctx.clip();
  // cuerpo
  ctx.fillStyle=M('#2a1626','#2a2016');ctx.beginPath();ctx.ellipse(cx,GROUND+2,rw+1,bh+3,0,Math.PI,Math.PI*2);ctx.fill();
  ctx.fillStyle=M('#4a2a44','#4a3a28');ctx.beginPath();ctx.ellipse(cx,GROUND+2,rw,bh+2,0,Math.PI,Math.PI*2);ctx.fill();
  const open=b.exposed?1:0;
  // placas de corteza
  const plates=[[-0.62,0.42],[-0.28,0.7],[0.08,0.78],[0.42,0.6],[0.7,0.34],[-0.45,0.18],[0.2,0.3],[0.55,0.12],[-0.15,0.38]];
  for(const[px,py]of plates){if(open&&Math.abs(px)<0.36&&py>0.2)continue;const x=cx+px*rw,y=GROUND-py*bh;
    ctx.fillStyle=M('#5e3656','#5a4a30');ctx.beginPath();ctx.ellipse(x,y,6*s,4.2*s,0,Math.PI,Math.PI*2);ctx.fill();
    ctx.fillStyle=M('#7a4a6e','#6a5a3a');ctx.fillRect(x-4*s,y-3.6*s,5*s,1);
    ctx.strokeStyle=M('#2a1626','#2a2016');ctx.lineWidth=0.8;ctx.beginPath();ctx.ellipse(x,y,6*s,4.2*s,0,Math.PI,Math.PI*2);ctx.stroke();}
  if(open){ // se abre el bulbo: núcleo que late
    const pu=(Math.sin(b.t/5)+1)/2;
    ctx.fillStyle='#1a0c14';ctx.beginPath();ctx.ellipse(cx,GROUND-bh*0.5,rw*0.45,bh*0.42,0,0,7);ctx.fill();
    ctx.fillStyle=fl?'#fff':PL_mix('#ff6a5a','#ffd0a0',pu);ctx.beginPath();ctx.ellipse(cx,GROUND-bh*0.5,rw*0.3,bh*0.3,0,0,7);ctx.fill();
    ctx.fillStyle='#fff3e0';circle(cx-2,GROUND-bh*0.56,1.5);}
  // venas
  ctx.strokeStyle=wl>0.5?'#5a4a2a':fl?'#fff':'#8ac040';ctx.lineWidth=0.9;ctx.beginPath();
  for(const vx of[-0.5,-0.1,0.3,0.65]){if(open&&Math.abs(vx)<0.4)continue;ctx.moveTo(cx+vx*rw,GROUND);ctx.quadraticCurveTo(cx+vx*rw*0.6,GROUND-bh*0.5,cx+vx*rw*0.25,GROUND-bh*0.92);}ctx.stroke();
  // pústulas
  for(const[px,py,ph]of[[-0.35,0.55,0],[0.3,0.48,2],[0.05,0.22,4],[0.58,0.25,1]]){if(open&&Math.abs(px)<0.4)continue;const on=(Math.sin(b.t/14+ph)+1)/2;
    ctx.fillStyle=wl>0.5?'#6a5a30':fl?'#fff':PL_mix('#6a9a2a','#e8ff80',on);circle(cx+px*rw,GROUND-py*bh,1.6*s);}
  if(b.shud>0&&(T>>2)%2){ctx.fillStyle='rgba(200,240,96,0.25)';ctx.beginPath();ctx.ellipse(cx,GROUND+2,rw,bh+2,0,Math.PI,Math.PI*2);ctx.fill();}
  ctx.restore();
}
function PL_drawPlanta(b){
  const wl=b.wilt,fl=b.flash>0,s=b.sc,cx=b.cx,bh=PL_bodyH(b);
  // burbujas de barro
  for(const u of b.bub){const k=u.t/u.life,r=u.r*(0.4+k);
    if(k<0.85){ctx.strokeStyle='rgba(120,150,70,0.8)';ctx.lineWidth=0.7;ctx.beginPath();ctx.arc(u.x,GROUND-r*0.5,r,Math.PI,Math.PI*2);ctx.stroke();ctx.fillStyle='rgba(200,230,140,0.6)';ctx.fillRect(q(u.x-r*0.4),q(GROUND-r*1.1),1,1);}
    else{ctx.fillStyle='rgba(120,150,70,0.6)';ctx.fillRect(q(u.x-r),GROUND-r*1.2,1,1);ctx.fillRect(q(u.x+r),GROUND-r*1.3,1,1);}}
  if(b.rise<=0&&!b.heads.some(h=>h.mode!=='wait'))return;
  // charco oscuro y hojas tendidas sobre el barro
  ctx.fillStyle='rgba(30,26,16,0.7)';ctx.beginPath();ctx.ellipse(cx,GROUND+1,(34+6*b.rise)*s,3.2,0,0,7);ctx.fill();
  if(b.rise>0.3){const lv=PL_mix('#2f5420','#4a3a22',wl),lv2=PL_mix('#4a7a2a','#5a4a2a',wl);
    for(const[d,l,w]of[[-1,38,6],[1,34,5],[-1,24,4],[1,22,5]]){const x0=cx+d*14*s,x1=x0+d*l*s*b.rise;
      ctx.fillStyle=lv;ctx.beginPath();ctx.moveTo(x0,GROUND);ctx.lineTo((x0+x1)/2,GROUND-w*0.8);ctx.lineTo(x1,GROUND-0.5);ctx.lineTo((x0+x1)/2,GROUND+1.2);ctx.fill();
      ctx.strokeStyle=lv2;ctx.lineWidth=0.7;ctx.beginPath();ctx.moveTo(x0,GROUND-0.3);ctx.lineTo(x1,GROUND-0.4);ctx.stroke();
      ctx.fillStyle=lv;for(let i=1;i<4;i++){const xx=x0+(x1-x0)*i/4;ctx.fillRect(q(xx),GROUND-w*0.6-1,1,1.5);}}}
  // cabezas cortadas tiradas en el barro
  for(const f of b.fallen){const a=f.t>130?1-(f.t-130)/40:1;ctx.globalAlpha=Math.max(0,a);PL_drawHead(f.x,f.y,f.rot,0.35,f.k*0.9,false,Math.min(1,0.4+f.t/80),false,0,f.flip);ctx.globalAlpha=1;}
  // tallos (detrás del bulbo)
  const hk=s*(1+0.04*b.phase);
  for(const h of b.heads){if(h.mode==='wait')continue;const an=PL_anchor(b,h);
    if(h.mode==='cut'){ctx.strokeStyle=PL_mix('#3e6a24','#6a5a30',0.4);ctx.lineWidth=3.6*s;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(an.x,an.y);ctx.quadraticCurveTo(an.x,h.y-4,h.x,h.y);ctx.stroke();ctx.lineCap='butt';
      ctx.fillStyle='#d8f060';circle(h.x,h.y,1.8*s);ctx.fillStyle='#9ad040';ctx.fillRect(q(h.x-0.5),q(h.y+1+(T>>3)%3),1,1.5);continue;}
    PL_drawStalk(b,h,an,wl,h.flash>0&&false);}
  PL_drawBulb(b,wl,fl);
  // lodo al frente: el bulbo parece hundido
  ctx.fillStyle='#2e2818';ctx.beginPath();ctx.ellipse(cx,GROUND+0.5,(25+2)*s,2.4,0,0,7);ctx.fill();
  ctx.fillStyle='rgba(110,130,60,0.6)';for(let i=-3;i<=3;i++)ctx.fillRect(q(cx+i*7*s+Math.sin(b.t/20+i)*1.5),GROUND-1,2,1);
  // cabezas
  for(const h of b.heads){if(h.mode==='wait'||h.mode==='cut')continue;
    const glow=h.mode==='biteT'&&h.mt>=0||h.mode==='spitT';
    PL_drawHead(h.x,h.y,h.ang,h.open,hk*(h.mode==='emerge'?0.6+0.4*h.len:1),h.flash>0,wl,glow,h.swell||0,Math.cos(h.ang)<0);}
  // aviso extra de la mordida: rayitas en la dirección en que va a saltar
  for(const h of b.heads)if(h.mode==='biteT'&&h.mt>=0&&(T>>2)%2){const a=h.ang,ox=Math.cos(a),oy=Math.sin(a);
    ctx.fillStyle='rgba(255,240,150,0.8)';for(let i=0;i<3;i++)ctx.fillRect(q(h.x+ox*(16+i*5)-0.5),q(h.y+oy*(16+i*5)-0.5),1,1);}
}

// ===== registro en BOSSES (misión 3 = índice 2) =====
BOSSES[2]={mini:{name:'CHAPALEADOR',make:PL_mkHover},villain:{name:'MADRE YUYO',make:PL_mkPlanta}};
