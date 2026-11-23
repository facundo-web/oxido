'use strict';
// Óxido · Misión 4: jefe chico (CHACAL DE BRONCE) y villano (REY POLVO)
// Todo con prefijo J4_. Usa lo de mision4.js (M4_, tormenta, escarabajos).

const J4_sfx=n=>{if(typeof SFX!=='undefined'&&SFX[n])SFX[n]();};

// =====================================================================
// JEFE CHICO · CHACAL DE BRONCE — perro guardián mecánico de la tumba
// Bronce remachado, orejas altas, engranajes a la vista y ojos turquesa.
// Salto (aviso: se agacha, ojos rojos y gruñido; al caer levanta dos ondas de arena que hay que saltar),
// soplido de arena caliente en abanico (aviso: abre la mandíbula y le brilla la garganta)
// y aullido que llama escarabajos (salen de grietas con su aviso). Rabia al 50 %: más rápido y salta dos veces.
// =====================================================================
function J4_mkChacal(A){return{type:'j4Chacal',isBoss:true,A,x:A+W+30,y:GROUND-24,w:40,h:24,hp:120,max:120,state:'enter',t:0,mt:0,face:-1,flash:0,score:3500,
  mode:'walk',cd:60,seq:0,vx:0,vy:0,anim:0,crouch:0,jaw:0,howl:0,tilt:0,rage:false,jumps:0,touch:1,noPush:true,upd:J4_updChacal,draw:J4_drawChacal};}
function J4_wave(x,dir,sp,A){eproj.push({kind:'j4Onda',x,y:GROUND,dir,sp,A,t:0,upd:J4_waveUpd,draw:J4_waveDraw});}
function J4_waveUpd(o,hb){
  o.t++;o.x+=o.dir*o.sp;
  if(o.t%3===0)parts.push({k:'p',x:o.x,y:GROUND-2,vx:-o.dir*rand(0.2,0.8),vy:rand(-1.8,-0.8),g:0.14,life:14,maxl:14,size:1,col:'#e0b070'});
  if(hb&&hb.y+hb.h>GROUND-6&&o.x>hb.x-2&&o.x<hb.x+hb.w+2){hurtPlayer(1);o.gone=true;return;}
  if(o.x<o.A+2||o.x>o.A+W-2)o.gone=true;
}
function J4_waveDraw(o){
  const x=q(o.x);ctx.fillStyle='rgba(120,70,30,0.45)';ctx.fillRect(x-6,GROUND-1,12,1);
  ctx.fillStyle='#d8a860';ctx.beginPath();ctx.moveTo(x-6*o.dir,GROUND);ctx.quadraticCurveTo(x-1*o.dir,GROUND-7,x+3*o.dir,GROUND);ctx.fill();
  ctx.fillStyle='#f6dca0';ctx.fillRect(x-1,GROUND-5,1.5,1);
}
const J4_pellet=b=>{ctx.fillStyle='rgba(255,170,80,0.45)';circle(b.x,b.y,b.r+1.2);ctx.fillStyle='#ffd27a';circle(b.x,b.y,b.r);ctx.fillStyle='#fff6c8';ctx.fillRect(q(b.x-0.5),q(b.y-0.5),1,1);};
function J4_updChacal(b){
  b.t++;b.mt++;b.anim++;if(b.flash>0)b.flash--;
  const A=b.A,ph2=b.hp<b.max*0.5,pc=M4_pc(),cx=b.x+b.w/2,lo=A+8,hi=A+W-b.w-8;
  if(b.state==='enter'){b.x-=2;b.vx=-2;b.face=-1;if(T%4===0)M4_sand(b.x+b.w-4,GROUND,2);if(b.t%10===0)J4_sfx('m4Metal');
    if(b.x<=A+210){b.x=A+210;b.vx=0;b.state='intro';b.t=0;b.hp=0;J4_sfx('m4Aullido');}return;}
  if(b.state==='intro'){bossIntro(b,50);b.face=pc.x<cx?-1:1;b.howl=Math.min(1,b.t/14);b.vx=0;
    if(b.state==='fight'){b.cd=40;b.mode='walk';b.howl=0;}return;}
  if(b.state==='dying'){
    b.vx=0;b.tilt=Math.min(0.35,b.tilt+0.004);b.crouch=Math.min(1,b.crouch+0.02);b.jaw=0.6;
    if(b.y<GROUND-b.h){b.vy+=0.25;b.y=Math.min(GROUND-b.h,b.y+b.vy);}
    if(b.t%8===0)explodeFx(b.x+rand(4,b.w-4),b.y+rand(0,b.h),rand(8,13));
    if(b.t%5===0)for(let i=0;i<2;i++)parts.push({k:'p',x:b.x+rand(6,b.w-6),y:b.y+rand(2,12),vx:rand(-1.6,1.6),vy:rand(-3,-1),g:0.16,life:rand(30,50),maxl:50,size:rand(1,2),col:pick(['#e0a85a','#b07a3a','#5af0e0'])});
    if(b.t%12===0)J4_sfx('m4Metal');
    if(b.t>=140)bossDone(b);
    return;}
  if(ph2&&!b.rage){b.rage=true;setBanner('¡EL CHACAL SE RECALIENTA!',80);J4_sfx('m4Aullido');shake=Math.max(shake,4);}
  if(ph2&&T%8===0)parts.push({k:'smoke',col:'230,220,210',x:b.x+rand(6,b.w-8),y:b.y+4,vx:rand(-0.2,0.2),vy:rand(-0.8,-0.4),life:30,maxl:30,size:rand(1.5,2.5)});
  switch(b.mode){
  case 'walk':{
    b.face=pc.x<cx?-1:1;b.crouch*=0.85;b.jaw*=0.8;b.howl*=0.8;
    const tx=clamp(pc.x<cx?pc.x+64:pc.x-64-b.w,lo,hi),sp=ph2?1.3:0.9;
    b.vx+=(clamp(tx-b.x,-sp,sp)-b.vx)*0.15;b.x+=b.vx;
    if(--b.cd<=0){
      const s=ph2?['pounce','breath','pounce','howl','pounce','breath']:['pounce','breath','howl','pounce','breath'];
      let a=s[b.seq++%s.length];if(a==='howl'&&M4_nBugs()>=4)a='breath';
      b.mt=0;b.vx=0;
      if(a==='pounce'){b.mode='pounceT';b.jumps=ph2?2:1;J4_sfx('m4Gruñido');}
      else if(a==='breath'){b.mode='breathT';tone('sawtooth',220,520,0.4,0.03);}
      else{b.mode='howl';J4_sfx('m4Aullido');}
    }
    break;}
  case 'pounceT':{const tel=ph2?22:34;b.face=pc.x<cx?-1:1;b.crouch=Math.min(1,b.crouch+0.12);b.x+=Math.sin(b.mt*1.3)*0.3;
    if(b.mt%3===0)M4_sand(b.face>0?b.x+4:b.x+b.w-4,GROUND,1);
    if(b.mt>=tel){const tx=clamp(pc.x-b.w/2,lo,hi);b.vx=(tx-b.x)/40;b.vy=-5;b.mode='pounce';b.mt=0;b.crouch=0;b.air=true;noise(0.25,0.12,900);J4_sfx('m4Metal');}
    break;}
  case 'pounce':
    b.vy+=0.25;b.x+=b.vx;b.y+=b.vy;b.x=clamp(b.x,lo,hi);
    if(b.y>=GROUND-b.h&&b.vy>0){b.y=GROUND-b.h;b.vy=0;b.air=false;shake=Math.max(shake,4);J4_sfx('m4Golpe');M4_sand(cx,GROUND,10);
      const sp=ph2?2.2:1.6;J4_wave(b.x-2,-1,sp,A);J4_wave(b.x+b.w+2,1,sp,A);
      if(--b.jumps>0){b.mode='pounceT';b.mt=10;}else{b.mode='rec';b.mt=0;}}
    break;
  case 'rec':b.crouch=Math.max(0,b.crouch-0.05);if(b.mt%10===0)parts.push({k:'smoke',col:'230,220,210',x:b.face>0?b.x+b.w:b.x,y:b.y+2,vx:b.face*0.3,vy:-0.4,life:20,maxl:20,size:1.5});
    if(b.mt>=(ph2?26:40)){b.mode='walk';b.cd=ph2?40:60;}break;
  case 'breathT':{const tel=ph2?22:30;b.face=pc.x<cx?-1:1;b.jaw=Math.min(1,b.mt/tel);
    if(b.mt>=tel){
      const n=ph2?5:3,mx=b.face>0?b.x+b.w+6:b.x-6,my=b.y-2,base=Math.atan2(pc.y-my,pc.x-mx);
      for(let i=0;i<n;i++){const a=base+(i-(n-1)/2)*0.2,sp=1.9;eproj.push({kind:'bullet',x:mx,y:my,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,g:0,r:1.8,t:0,draw:J4_pellet});}
      J4_sfx('m4Soplo');noise(0.3,0.12,1400);b.mode='rec';b.mt=10;}
    break;}
  case 'howl':b.howl=Math.min(1,b.howl+0.1);b.jaw=0.7;
    if(b.mt===20){const n=ph2?3:2;for(let i=0;i<n;i++){const x=clamp(pc.x+(i-(n-1)/2)*44+rand(-8,8),A+20,A+W-20);const e=M4_newBug(x,'warn',38+i*8);if(e)enemies.push(e);}}
    if(b.mt>=60){b.mode='walk';b.cd=ph2?40:55;}break;
  }
  b.x=clamp(b.x,A+2,A+W-b.w-2);
  bossContact(b);
}
function J4_drawChacal(b){
  const fl=b.flash>0||(b.state==='dying'&&(T>>2)%2),C=c=>fl?'#fff':c,ph2=b.hp<b.max*0.5||b.state==='dying';
  const run=Math.abs(b.vx)>0.2&&b.mode!=='pounce'?b.anim/4:0,cr=b.crouch*4,air=b.mode==='pounce';
  const tele=b.mode==='pounceT'||b.mode==='breathT';
  ctx.fillStyle='rgba(60,30,10,0.35)';ctx.beginPath();ctx.ellipse(b.x+b.w/2,GROUND,18,1.6,0,0,7);ctx.fill();
  ctx.save();ctx.translate(q(b.x+b.w/2),q(b.y));if(b.face<0)ctx.scale(-1,1);ctx.translate(-20,0);
  if(b.tilt){ctx.translate(20,24);ctx.rotate(b.tilt);ctx.translate(-20,-24);}
  // patas: [x de la cadera, fase]
  const leg=(hx,ph,col,back)=>{
    const s=run?Math.sin(run+ph)*3:0,ext=air?(back?-4:4):0,hy=15+cr*0.5;
    ctx.strokeStyle=C(col);ctx.lineWidth=2.4;ctx.lineCap='round';ctx.beginPath();
    ctx.moveTo(hx,hy);ctx.lineTo(hx+s*0.6+ext*0.6+(back?-1:1),hy+4.5-cr*0.2);ctx.lineTo(hx+s+ext,24-(air?3:0));ctx.stroke();
    ctx.fillStyle=C('#5a3a18');ctx.fillRect(hx+s+ext-1.5,22.6-(air?3:0),3.5,1.4);ctx.lineCap='butt';};
  leg(9,Math.PI,'#7a5226',true);leg(29,0,'#7a5226',false);
  // cola
  ctx.strokeStyle=C('#8a5a2a');ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(5,9+cr);ctx.quadraticCurveTo(-2,8+cr+Math.sin(b.anim/8)*1.5,-4,3+cr);ctx.stroke();
  // cuerpo
  ctx.fillStyle=C('#6a4420');ctx.beginPath();ctx.ellipse(18.5,11+cr,14.5,6.4,0,0,7);ctx.fill();
  ctx.fillStyle=C('#b07a3a');ctx.beginPath();ctx.ellipse(18.5,10.4+cr,14,5.6,0,0,7);ctx.fill();
  if(!fl){ctx.fillStyle='#e0a85a';ctx.fillRect(8,5.6+cr,20,1);
    ctx.fillStyle='#6a4420';for(const px of[12,19,26])ctx.fillRect(px,6.5+cr,0.6,8);
    ctx.fillStyle='#3a2410';for(const[rx,ry]of[[10,8],[16,7],[23,7],[29,9],[14,13],[24,13]])ctx.fillRect(rx,ry+cr,0.8,0.8);
    // engranaje de la cadera
    ctx.save();ctx.translate(10,11+cr);ctx.rotate(b.anim*(b.vx?0.12:0.03));ctx.fillStyle='#d8a040';
    for(let i=0;i<6;i++){ctx.rotate(Math.PI/3);ctx.fillRect(-0.6,-3.6,1.2,1.4);}
    ctx.beginPath();ctx.arc(0,0,2.8,0,7);ctx.fill();ctx.fillStyle=ph2?'#ff7a3a':'#5af0e0';circle(0,0,1.1);ctx.restore();}
  leg(12,0,'#a06c30',true);leg(32,Math.PI,'#a06c30',false);
  // cuello, collar y cabeza
  const hy=-1+cr*0.8-b.howl*3,ha=-b.howl*0.5;
  ctx.fillStyle=C('#9a6830');ctx.beginPath();ctx.moveTo(26,6+cr);ctx.lineTo(31,hy+2);ctx.lineTo(36,hy+4);ctx.lineTo(32,11+cr);ctx.fill();
  ctx.fillStyle=C('#2a6a8a');ctx.fillRect(28.5,4+cr*0.9,4,1.4);ctx.fillStyle=C('#e8c050');ctx.fillRect(28.5,5.4+cr*0.9,4,0.8);
  ctx.save();ctx.translate(34,hy+2);ctx.rotate(ha);
  ctx.fillStyle=C('#8a5a2a');ctx.beginPath();ctx.moveTo(-2,-3);ctx.lineTo(-1,-12);ctx.lineTo(1.6,-3);ctx.fill();   // orejas
  ctx.fillStyle=C('#b07a3a');ctx.beginPath();ctx.moveTo(1,-3);ctx.lineTo(3,-11);ctx.lineTo(4.4,-2.6);ctx.fill();
  ctx.fillStyle=C('#3a2410');ctx.fillRect(2.4,-8,0.8,4);
  ctx.fillStyle=C('#b07a3a');ctx.beginPath();ctx.moveTo(-3,-3);ctx.lineTo(5,-3.4);ctx.lineTo(12,-0.6);ctx.lineTo(12,0.8);ctx.lineTo(-1,2.4);ctx.closePath();ctx.fill();   // hocico
  ctx.fillStyle=C('#e0a85a');ctx.fillRect(0,-3.2,9,0.8);
  ctx.fillStyle=C('#1a120c');ctx.fillRect(11.4,-1,1,1);
  // mandíbula de abajo (se abre para soplar)
  ctx.save();ctx.translate(1,1.6);ctx.rotate(b.jaw*0.5);
  if(b.jaw>0.1){ctx.fillStyle=tele&&(T>>1)%2?'#fff6c8':'#ff9a3a';ctx.fillRect(1,-1.2,8,1.6);}
  ctx.fillStyle=C('#8a5a2a');ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(10,0.2);ctx.lineTo(9,1.8);ctx.lineTo(0,2);ctx.fill();
  ctx.fillStyle='#e8dcc0';for(let i=2;i<9;i+=2.4)ctx.fillRect(i,-0.6,0.8,0.8);
  ctx.restore();
  // ojo
  const eye=b.state==='dying'?'#3a2a1a':(tele||ph2)?((T>>1)%2?'#ffd0c0':'#ff3b30'):'#5af0e0';
  ctx.fillStyle=eye;ctx.fillRect(3.4,-2.4,2,1.2);if(!fl&&b.state!=='dying'){ctx.fillStyle=ph2||tele?'rgba(255,60,40,0.35)':'rgba(90,240,224,0.3)';circle(4.4,-1.8,2.4);}
  ctx.restore();
  // aullido: anillos que salen de la boca
  if(b.mode==='howl'&&b.mt<50){ctx.strokeStyle=`rgba(255,230,170,${0.6-b.mt/90})`;ctx.lineWidth=0.7;for(let i=0;i<2;i++){ctx.beginPath();ctx.arc(46,hy-4,4+((b.mt*0.6+i*8)%16),-1.2,0.2);ctx.stroke();}}
  ctx.restore();
}

// =====================================================================
// VILLANO · REY POLVO — rey momia de las arenas
// De la cintura para abajo es un remolino de arena; corona de sol partido que pierde arena por la grieta,
// manto índigo con bordes dorados y un báculo con una gema verde.
// · Tormenta: invoca la tormenta del reloj de arena de la misión (avisos de fila: baja saltá, alta agachate).
// · Escarabajos: los tira en arco; caen y corren.
// · Sarcófago: se esconde (no se le puede pegar) y desde adentro tira maldiciones lentas que se pueden reventar.
//   Al salir queda aturdido un rato y recibe mucho más daño. Afuera, su vendaje frena parte del daño.
// Rabia al 50 %: tormentas más largas, más escarabajos y se esconde más seguido.
// =====================================================================
function J4_mkRey(A){const sx=A+266;return{type:'j4Rey',isBoss:true,A,sx,x:sx+2,y:GROUND-40,w:22,h:40,hp:0,max:300,state:'enter',t:0,mt:0,face:-1,flash:0,score:12000,
  mode:'idle',cd:60,seq:0,phase:0,lastHp:0,dazed:0,lid:0,lidShk:0,out:0,bob:0,staff:0,hand:0,hideT:0,told:false,crumb:0,crown:null,touch:1,noPush:true,
  upd:J4_updRey,draw:J4_drawRey};}
function J4_reyTarget(b){const pc=M4_pc();return clamp(pc.x<b.x+11?pc.x+100:pc.x-110,b.A+40,b.A+226);}
function J4_updRey(b){
  b.t++;b.mt++;if(b.flash>0)b.flash--;
  const A=b.A,pc=M4_pc(),cx=b.x+b.w/2,ph=b.phase;
  b.bob=Math.sin(b.t/18)*1.5;
  if(b.state==='enter'){
    if(b.t===1)setBanner('¡EL SARCÓFAGO SE ESTÁ ABRIENDO!',100);
    if(b.t<90){b.lidShk=1;shake=Math.max(shake,0.3+b.t/90);if(b.t%12===0)J4_sfx('m4Tapa');
      if(b.t%4===0)parts.push({k:'p',x:b.sx+rand(0,26),y:GROUND-50,vx:rand(-0.3,0.3),vy:0.2,g:0.08,life:30,maxl:30,size:1,col:'#d8b070'});return;}
    if(b.t===90){b.lidShk=0;J4_sfx('m4Golpe');J4_sfx('m4Rey');shake=7;M4_sand(b.sx+13,GROUND,16);
      for(let i=0;i<20;i++)parts.push({k:'smoke',col:'210,170,110',x:b.sx+rand(0,26),y:GROUND-rand(4,46),vx:rand(-1,1),vy:rand(-0.6,0),life:rand(30,50),maxl:50,size:rand(2,4)});}
    b.lid=Math.min(1,(b.t-90)/18);
    if(b.t>=104){b.out=Math.min(1,(b.t-104)/30);b.x=b.sx+2+(A+210-b.sx-2)*M4_ease(b.out);b.face=-1;}
    if(b.t>=140){b.state='intro';b.t=0;b.hp=0;}
    return;}
  if(b.state==='intro'){
    const dur=80;
    if(b.t===1){setBanner(b.name,130);playMusic(SONGS.rey?'rey':'boss');shake=Math.max(shake,5);J4_sfx('m4Rey');}
    b.hp=Math.min(b.max,b.max*b.t/dur);b.staff=Math.min(1,b.t/30);b.face=pc.x<cx?-1:1;
    if(b.t%4===0&&b.hp<b.max)tone('square',300+b.hp/b.max*500,300+b.hp/b.max*500,0.03,0.02);
    if(b.t>=dur){b.hp=b.max;b.lastHp=b.hp;b.state='fight';b.mt=0;b.cd=50;b.mode='idle';b.staff=0;}
    return;}
  if(b.state==='dying'){
    if(b.t===1){setBanner('¡SE DESHACE EN ARENA!',110);J4_sfx('m4Rey');if(M4.tf.st!=='off'&&M4.tf.st!=='fade'){M4.tf.st='fade';M4.tf.t=0;M4.tf.warns=[];}
      b.crown={x:cx,y:b.y-4,vy:-2.2,vx:b.face*0.6,rot:0,land:false};}
    b.crumb=Math.min(1,b.t/150);
    if(b.t%3===0)parts.push({k:'p',x:b.x+rand(2,20),y:b.y+40*b.crumb+rand(0,6),vx:rand(-0.6,0.6),vy:rand(0,0.6),g:0.12,life:rand(26,40),maxl:40,size:rand(1,1.8),col:pick(['#e0b070','#c89858','#cdbb90'])});
    if(b.t%20===0){tone('sine',90-b.t*0.2,40,0.4,0.1);shake=Math.max(shake,2);}
    const c=b.crown;if(c&&!c.land){c.vy+=0.18;c.x+=c.vx;c.y+=c.vy;c.rot+=0.12*b.face;if(c.y>=GROUND-5){c.y=GROUND-5;c.land=true;J4_sfx('m4Metal');M4_sand(c.x,GROUND,6);}}
    if(b.t===150){shake=8;SFX.bigboom();for(let i=0;i<40;i++)parts.push({k:'smoke',col:pick(['210,170,110','230,190,130','180,130,80']),x:cx+rand(-10,10),y:GROUND-rand(2,20),vx:rand(-2.5,2.5),vy:rand(-1.6,-0.2),life:rand(40,70),maxl:70,size:rand(2,5)});}
    if(b.t>=160)b.lid=Math.max(0,b.lid-0.08);
    if(b.t===172){J4_sfx('m4Golpe');shake=5;}
    if(b.t>=210)bossDone(b);
    return;}
  // --- escondido en el sarcófago: no recibe daño ---
  if(b.state==='hide'){
    b.hideT--;b.lid=Math.max(0,b.lid-0.08);
    if(b.hideT%55===20&&b.hideT>40)J4_curse(b);
    if(b.hideT===Math.round(b.hideMax*0.6)&&ph){const e=M4_newBug(clamp(pc.x+40,A+20,A+W-40),'warn',38);if(e)enemies.push(e);}
    if(b.hideT<=40){b.lidShk=1;if(b.hideT%8===0)J4_sfx('m4Tapa');}
    if(b.hideT<=0){
      b.lidShk=0;b.lid=1;b.state='fight';b.mode='dazed';b.mt=0;b.out=0;b.dazed=ph?110:140;b.lastHp=b.hp;
      J4_sfx('m4Golpe');shake=6;M4_sand(b.sx+13,GROUND,14);
      for(let i=0;i<8;i++)parts.push({k:'p',x:b.sx+rand(0,26),y:GROUND-rand(10,46),vx:rand(-2.5,0.5),vy:rand(-3,-0.5),g:0.16,life:rand(30,50),maxl:50,size:rand(1.5,2.5),col:pick(['#c89838','#2a4a8a','#8a6a3a'])});
      setBanner(b.told?'¡AHORA!':'¡SALIÓ ATURDIDO: AHORA LE PEGÁS MÁS!',b.told?50:90);b.told=true;}
    return;}
  // --- pelea ---
  // el vendaje frena parte del daño; aturdido recibe mucho más
  if(b.hp<b.lastHp){const d=b.lastHp-b.hp;b.hp=b.lastHp-d*(b.dazed>0?1.8:0.75);if(b.hp<=0){b.hp=0;b.lastHp=0;kill(b);return;}}
  b.lastHp=b.hp;
  if(!b.phase&&b.hp<b.max*0.5){b.phase=1;b.seq=0;setBanner('¡EL REY POLVO SE ENFURECE!',90);J4_sfx('m4Rey');shake=Math.max(shake,6);
    if(b.mode!=='storm'&&b.mode!=='dazed'){b.mode='idle';b.cd=50;}}
  if(b.dazed>0)b.dazed--;
  if(b.phase&&T%10===0)parts.push({k:'p',x:b.x+rand(0,b.w),y:b.y+rand(0,10),vx:rand(-0.3,0.3),vy:rand(0.2,0.6),g:0.05,life:20,maxl:20,size:1,col:'#e0b070'});
  switch(b.mode){
  case 'idle':{
    b.face=pc.x<cx?-1:1;b.staff*=0.9;b.hand*=0.9;
    const tx=J4_reyTarget(b);b.x+=clamp(tx-b.x,-0.6,0.6);
    if(--b.cd<=0){
      const s=ph?['storm','scarabs','hide','storm','scarabs','scarabs','hide']:['scarabs','storm','scarabs','hide'];
      let a=s[b.seq++%s.length];if(a==='scarabs'&&M4_nBugs()>=4){b.cd=30;break;}
      b.mt=0;
      if(a==='storm'){b.mode='storm';M4_stormStart({boss:true,n:ph?5:3,gap:ph?44:56,tel:ph?30:38});J4_sfx('m4Rey');}
      else if(a==='scarabs'){b.mode='scarabT';J4_sfx('m4Bicho');}
      else b.mode='toSarc';
    }
    break;}
  case 'storm':
    b.face=pc.x<cx?-1:1;b.staff=Math.min(1,b.staff+0.08);b.x+=clamp(J4_reyTarget(b)-b.x,-0.3,0.3);
    if(M4.tf.st==='fade'||M4.tf.st==='off'){b.mode='idle';b.cd=ph?40:60;}
    break;
  case 'scarabT':{const tel=ph?24:32;b.face=pc.x<cx?-1:1;b.hand=Math.min(1,b.mt/tel);
    if(b.mt%4===0)parts.push({k:'p',x:cx+b.face*8+rand(-3,3),y:b.y+10+rand(-3,3),vx:0,vy:-0.3,g:0,life:12,maxl:12,size:1,col:'#7affd0'});
    if(b.mt>=tel){const n=ph?3:2;J4_sfx('m4Soplo');
      for(let i=0;i<n;i++){const tx=clamp(pc.x+(i-(n-1)/2)*30+rand(-6,6),A+14,A+W-40),hx=cx+b.face*8,hy=b.y+10,Tt=46,g=0.13;
        eproj.push({kind:'j4Esc',x:hx,y:hy,vx:(tx-hx)/Tt,vy:(GROUND-3-hy-0.5*g*Tt*Tt)/Tt,g,r:2,t:0,upd:J4_escUpd,draw:J4_escDraw});}
      b.mode='idle';b.cd=ph?55:75;}
    break;}
  case 'toSarc':{b.staff*=0.9;b.hand*=0.9;const tx=b.sx+2;b.face=tx<b.x?-1:1;b.x+=clamp(tx-b.x,-(ph?1.8:1.4),ph?1.8:1.4);
    if(Math.abs(tx-b.x)<1.5){b.x=tx;b.mode='enterS';b.mt=0;b.face=-1;}
    if(b.mt>200){b.mode='idle';b.cd=40;}
    break;}
  case 'enterS':b.out=Math.max(0,1-b.mt/18);
    if(b.mt>=18){b.state='hide';b.hideMax=b.hideT=ph?150:190;b.out=0;J4_sfx('m4Tapa');b.mode='hidden';}
    return;
  case 'dazed':{
    b.out=Math.min(1,b.out+0.08);const tx=b.sx-36;b.x+=clamp(tx-b.x,-1.6,1.6);
    if(b.mt%14===0)parts.push({k:'p',x:cx+rand(-6,6),y:b.y-6,vx:0,vy:-0.3,g:0,life:16,maxl:16,size:1,col:'#fff6a0'});
    if(b.dazed<=0){b.mode='idle';b.cd=ph?30:45;}
    break;}
  }
  b.x=clamp(b.x,A+20,A+W-b.w-6);
  if(b.out>0.6)bossContact(b);
}
// maldición: bolita lenta que persigue un poco; se puede reventar a tiros
function J4_curse(b){
  const x=b.sx+13,y=GROUND-36;J4_sfx('m4Soplo');
  eproj.push({kind:'j4Maldicion',x,y,vx:-0.8,vy:0,r:2.5,t:0,upd:J4_curseUpd,draw:J4_curseDraw});
}
function J4_curseUpd(o,hb){
  o.t++;const pc=M4_pc(),a=Math.atan2(pc.y-o.y,pc.x-o.x),cur=Math.atan2(o.vy,o.vx),na=cur+clamp(angDiff(a,cur),-0.025,0.025),sp=0.95;
  o.vx=Math.cos(na)*sp;o.vy=Math.sin(na)*sp;o.x+=o.vx;o.y+=o.vy;
  if(o.t%5===0)parts.push({k:'p',x:o.x,y:o.y,vx:0,vy:0,g:0,life:12,maxl:12,size:1,col:'#7affd0'});
  if(hb&&overlapPt(hb,o.x,o.y,o.r)){hurtPlayer(1);o.gone=true;return;}
  if(o.y>=GROUND-1||o.t>320||o.x<camX-20||o.x>camX+VW+20){o.gone=true;M4_sand(o.x,Math.min(o.y,GROUND),4,'#7affd0');}
}
function J4_curseDraw(o){
  const p=(Math.sin(o.t/4)+1)/2;
  ctx.fillStyle=`rgba(122,255,208,${0.2+0.15*p})`;circle(o.x,o.y,o.r+2);
  ctx.fillStyle='#2a6a5a';circle(o.x,o.y,o.r);ctx.fillStyle='#7affd0';circle(o.x,o.y,o.r*0.55);
  ctx.fillStyle='#1a120c';ctx.fillRect(q(o.x-0.5),q(o.y-1.2),1,2.4);
}
// escarabajo tirado en arco: cae y sale corriendo (en el aire se puede reventar)
function J4_escUpd(o,hb){
  o.t++;o.vy+=o.g;o.x+=o.vx;o.y+=o.vy;
  if(hb&&overlapPt(hb,o.x,o.y,o.r)){hurtPlayer(1);o.gone=true;return;}
  if(o.y>=GROUND-3){o.gone=true;if(!M4_bugAt(o.x-4,14))M4_sand(o.x,GROUND,4);else M4_sand(o.x,GROUND,3);}
  if(o.t>200)o.gone=true;
}
function J4_escDraw(o){
  const x=q(o.x),y=q(o.y);
  ctx.fillStyle='rgba(122,255,208,0.3)';circle(x,y,3.2);
  ctx.fillStyle='#1e3a3a';ctx.beginPath();ctx.ellipse(x,y,2.6,2,o.t*0.3,0,7);ctx.fill();ctx.fillStyle='#5ad0b0';ctx.fillRect(x-1,y-1,1,1);
  // sombra en el suelo donde va a caer
  ctx.fillStyle=`rgba(60,30,10,${0.2+0.25*Math.min(1,o.t/40)})`;ctx.beginPath();ctx.ellipse(x+o.vx*((GROUND-o.y)/Math.max(0.5,o.vy+1)),GROUND,4,1,0,0,7);ctx.fill();
}
// sarcófago grande del rey: rostro genérico, rayas, ojos que brillan cuando está adentro
function J4_bigSarco(b){
  const x=b.sx,w=26,h=46,g=GROUND,top=g-4-h;
  ctx.fillStyle='rgba(60,30,10,0.4)';ctx.fillRect(x-6,g-1,w+12,1.4);
  ctx.fillStyle='#5a3a1e';ctx.fillRect(x-4,g-4,w+8,4);ctx.fillStyle='#8a6a3a';ctx.fillRect(x-4,g-4,w+8,1);
  ctx.fillStyle='#e8c050';for(let i=0;i<5;i++)M4_glyph(x-2+i*6,g-3,i+9);
  ctx.fillStyle='#3a2410';ctx.fillRect(x,top,w,h);ctx.fillRect(x+2,top-2,w-4,2);
  ctx.fillStyle='#0e0604';ctx.fillRect(x+3,top+2,w-6,h-3);
  const glow=b.state==='hide'||b.lidShk;
  const lidAt=(lx,ly)=>{
    ctx.fillStyle='#1a0e08';ctx.fillRect(lx-0.6,ly-0.6,w+1.2,h+1.2);
    // ocre apagado con franjas azul gris (Dirección de Arte): el dorado queda solo para el diente de REY POLVO
    ctx.fillStyle='#a07a48';ctx.fillRect(lx,ly+3,w,h-3);ctx.fillRect(lx+2,ly,w-4,3);
    ctx.fillStyle='#4a5a72';for(let i=0;i<5;i++){ctx.fillRect(lx+1,ly+3+i*2.6,4,1.3);ctx.fillRect(lx+w-5,ly+3+i*2.6,4,1.3);}
    ctx.fillStyle='#d89a5a';ctx.fillRect(lx+7,ly+3,w-14,9);
    ctx.fillStyle=glow?((T>>2)%2?'#7affd0':'#3ac0a0'):'#1a120c';ctx.fillRect(lx+8.5,ly+6,3,1.2);ctx.fillRect(lx+w-11.5,ly+6,3,1.2);
    if(glow){ctx.fillStyle='rgba(122,255,208,0.3)';circle(lx+10,ly+6.6,2.6);circle(lx+w-10,ly+6.6,2.6);}
    ctx.fillStyle='#1a120c';ctx.fillRect(lx+w/2-0.6,ly+9,1.2,1.2);ctx.fillRect(lx+w/2-2.5,ly+11,5,0.8);
    ctx.fillStyle='#8a3a1e';ctx.fillRect(lx+w/2-1,ly+12,2,4);   // barba ceremonial
    ctx.fillStyle='#2a4a8a';ctx.fillRect(lx+1,ly+17,w-2,2);ctx.fillStyle='#b8402a';ctx.fillRect(lx+1,ly+19,w-2,1);ctx.fillStyle='#2a4a8a';ctx.fillRect(lx+1,ly+20,w-2,2);
    ctx.fillStyle='#2a4a8a';ctx.fillRect(lx+3,ly+24,w-6,3);ctx.fillStyle='#e8c050';ctx.fillRect(lx+3,ly+25,w-6,0.8);
    ctx.fillStyle='#5a3a16';ctx.fillRect(lx+w/2-3,ly+29,6,h-31);ctx.fillStyle='#e8c050';for(let i=0;i<3;i++)M4_glyph(lx+w/2-2,ly+30+i*5,i+3);
    ctx.fillStyle='rgba(255,240,180,0.3)';ctx.fillRect(lx+1,ly+3,1,h-4);
    if(b.lidShk){ctx.strokeStyle=(T>>1)%2?'#7affd0':'#2a8a70';ctx.lineWidth=0.7;ctx.beginPath();ctx.moveTo(lx+5,ly+14);ctx.lineTo(lx+9,ly+20);ctx.lineTo(lx+7,ly+27);ctx.moveTo(lx+w-6,ly+10);ctx.lineTo(lx+w-9,ly+18);ctx.stroke();}
  };
  if(b.lid<=0.001){const j=b.lidShk?Math.sin(T*1.9)*0.8:0;lidAt(x+j,top);return;}
  ctx.save();ctx.translate(x+w,g-4);ctx.rotate(M4_ease(b.lid)*Math.PI/2);lidAt(-w,-h);ctx.restore();
}
function J4_drawRey(b){
  J4_bigSarco(b);
  if(b.state==='hide')return;
  if(b.state==='enter'&&b.t<104)return;
  const fl=b.flash>0,C=c=>fl?'#fff':c,cx=b.x+b.w/2,ph=b.phase,dz=b.dazed>0&&b.state==='fight';
  const by=b.y+b.bob,cr=b.crumb||0,out=b.state==='enter'||b.mode==='enterS'||b.mode==='dazed'?b.out:1;
  ctx.save();
  if(out<1){ctx.globalAlpha=0.35+0.65*out;}
  // se deshace: se recorta de arriba hacia abajo
  if(cr>0){ctx.beginPath();ctx.rect(b.x-20,by-20+cr*64,b.w+40,80);ctx.clip();}
  // remolino de arena (en vez de piernas)
  for(let i=0;i<5;i++){const yy=by+26+i*3,rw=4+i*2.2+Math.sin(T/5+i)*0.8,sh=((T*0.4+i*5)%10)-5;
    ctx.fillStyle=i%2?'rgba(200,150,90,0.8)':'rgba(230,184,120,0.85)';ctx.beginPath();ctx.ellipse(cx+sh*0.3,yy,rw,1.6,0,0,7);ctx.fill();}
  ctx.fillStyle='rgba(240,200,140,0.7)';for(let i=0;i<4;i++){const a=T/6+i*1.6;ctx.fillRect(q(cx+Math.cos(a)*(6+i*2)),q(by+30+Math.sin(a)*2+i*2),1,1);}
  ctx.translate(q(cx),q(by));if(b.face<0)ctx.scale(-1,1);
  // capa hecha jirones, atrás
  ctx.fillStyle=C('#1a1e38');ctx.beginPath();ctx.moveTo(-5,11);ctx.lineTo(-12-Math.sin(T/9)*1.5,30);
  for(let i=0;i<4;i++)ctx.lineTo(-10+i*3-Math.sin(T/9+i)*1.2,28+(i%2?3:0));ctx.lineTo(2,26);ctx.closePath();ctx.fill();
  // báculo (mano de atrás)
  const st=b.staff;ctx.save();ctx.translate(-6,14);ctx.rotate(-0.15-st*0.35);
  ctx.fillStyle=C('#5a3a18');ctx.fillRect(-0.8,-22,1.6,40);ctx.fillStyle=C('#e8c050');ctx.fillRect(-1.2,-14,2.4,1);ctx.fillRect(-1.2,4,2.4,1);
  ctx.fillStyle=C('#e8c050');ctx.beginPath();ctx.ellipse(0,-24,3,3.6,0,0,7);ctx.fill();
  ctx.fillStyle=st>0.3&&(T>>1)%2?'#d0ffe8':'#3ac08a';ctx.beginPath();ctx.ellipse(0,-24,1.8,2.6,0,0,7);ctx.fill();
  ctx.fillStyle='#1a120c';ctx.fillRect(-0.3,-26.5,0.6,5);
  if(st>0.3){ctx.fillStyle=`rgba(122,255,208,${0.25*st})`;circle(0,-24,6+Math.sin(T/3)*1.5);}
  ctx.restore();
  ctx.fillStyle=C('#cdbb90');ctx.fillRect(-8,12,3,6);   // brazo de atrás
  // manto
  ctx.fillStyle=C('#2a3050');ctx.beginPath();ctx.moveTo(-6,11);ctx.lineTo(6,11);ctx.lineTo(8,28);ctx.lineTo(-8,28);ctx.closePath();ctx.fill();
  ctx.fillStyle=C('#e0b040');ctx.fillRect(-8,27,16,1.2);ctx.fillRect(-0.6,15,1.2,12);
  if(!fl){ctx.fillStyle='#cdbb90';ctx.fillRect(-3,15,6,1);ctx.fillRect(-4,18,3,0.8);ctx.fillStyle='#3a4270';ctx.fillRect(2,16,3,10);}
  // collar ancho
  const bands=['#e0b040','#2a8a8a','#b8402a','#e0b040'];
  for(let i=0;i<4;i++){ctx.fillStyle=C(bands[i]);ctx.beginPath();ctx.ellipse(0,10.5,8-i*0.6,4.6-i,0,0,Math.PI);ctx.fill();}
  // cabeza vendada
  ctx.save();if(dz)ctx.rotate(Math.sin(T/6)*0.15);
  ctx.fillStyle=C('#cdbb90');ctx.fillRect(-4,2,8,9);
  if(!fl){ctx.fillStyle='#e2d4a8';ctx.fillRect(-4,3.6,8,0.8);ctx.fillRect(-4,7.6,8,0.8);ctx.fillStyle='#8a7a58';ctx.fillRect(-4,5.6,3,0.7);
    ctx.fillStyle='#1a120c';ctx.fillRect(-1,4.8,5,2);
    ctx.fillStyle=dz?((T>>3)%2?'#8a8a8a':'#fff6a0'):ph?'#ffd27a':'#7affd0';ctx.fillRect(1,5.2,1.4,1.2);ctx.fillRect(3,5.2,1,1.2);
    ctx.fillStyle='#1a120c';ctx.fillRect(1,9,3,0.8);}
  // corona de sol partido: aro dorado, medio disco con rayos y una grieta que pierde arena
  ctx.save();ctx.translate(0,2);if(dz)ctx.rotate(-0.3);
  ctx.fillStyle=C('#e0b040');ctx.fillRect(-5,-1.5,10,2);
  ctx.fillStyle=C('#c89030');ctx.beginPath();ctx.arc(0,-1.5,6.5,Math.PI,0);ctx.fill();
  ctx.fillStyle=C('#e8c860');ctx.beginPath();ctx.arc(0,-1.5,4.5,Math.PI,0);ctx.fill();
  ctx.fillStyle=C('#e0b040');for(let i=0;i<5;i++){const a=Math.PI+(i+0.5)/5*Math.PI;ctx.fillRect(q(Math.cos(a)*8-0.6),q(-1.5+Math.sin(a)*8-0.6),1.2,1.6);}
  if(!fl){ctx.fillStyle='#3a2410';ctx.fillRect(1,-7.6,0.8,2.4);ctx.fillRect(0.4,-5.4,0.8,2.2);ctx.fillRect(1.2,-3.4,0.8,1.6);
    ctx.fillStyle='#2a8a8a';circle(-2.4,-3.6,1.1);
    const ph2=(T*0.7)%14;ctx.fillStyle='rgba(240,200,140,0.8)';ctx.fillRect(1,-1+ph2,0.8,1.4);}
  ctx.restore();ctx.restore();
  // brazo de adelante (sube para tirar escarabajos)
  ctx.save();ctx.translate(5,13);ctx.rotate(-b.hand*1.6+Math.sin(T/20)*0.05);
  ctx.fillStyle=C('#cdbb90');ctx.fillRect(0,-1.2,7,2.6);ctx.fillStyle=C('#a8946a');ctx.fillRect(3,-1.2,0.8,2.6);
  if(b.hand>0.3){ctx.fillStyle=`rgba(122,255,208,${0.4*b.hand})`;circle(8,0,3+Math.sin(T/2));}
  ctx.restore();
  // aturdido: estrellitas de arena que giran
  if(dz){ctx.fillStyle='#fff6a0';for(let i=0;i<3;i++){const a=T/8+i*2.09;ctx.fillRect(q(Math.cos(a)*7-0.5),q(-6+Math.sin(a)*2-0.5),1,1);}}
  ctx.restore();
  // la corona cayó
  if(b.crown){const c=b.crown;ctx.save();ctx.translate(q(c.x),q(c.y));ctx.rotate(c.rot);
    ctx.fillStyle='#c89030';ctx.beginPath();ctx.arc(0,0,5,Math.PI,0);ctx.fill();ctx.fillStyle='#e0b040';ctx.fillRect(-4,0,8,1.6);ctx.restore();}
}

// ===== registro en BOSSES (sin índice fijo: el de la misión) =====
BOSSES[M4_IDX]={mini:{name:'CHACAL DE BRONCE',make:J4_mkChacal},villain:{name:'REY POLVO',make:J4_mkRey}};
// la tormenta de la misión no se mezcla con la pelea final: si todavía sopla al llegar a la arena, se calma
ON_STEP.push(()=>{if(L!==M4_LVL||!lock||!lock.a.boss)return;const tf=M4.tf;
  if(tf.st!=='off'&&tf.st!=='fade'&&!tf.boss){tf.st='fade';tf.t=0;tf.warns=[];}});
