'use strict';
// Óxido · Vehículo Grillo
// Jetpack: tanque de 10 s de vuelo (600 cuadros); sin volar se recarga y tarda 30 s de vacío a lleno.
function mkMech(x){return{x,y:GROUND-28,w:22,h:28,vx:0,vy:0,face:1,onGround:true,plat:null,armor:12,max:12,ride:false,aim:0,anim:0,
  fireCd:0,canCd:0,shells:12,cool:0,inv:0,flash:0,dying:0,barrel:0,stepPh:0,announced:false,
  canAng:0,recoil:0,fuel:600,fmax:600,jet:false,jetLock:false};}
// ================== vehículo: CHATARRA (en el código, "grillo" / mech) ==================
// nombre que ve el jugador: CHATARRA, y CHATARRA II / III después de una fusión (fusion.js)
const mechNombre=m=>typeof VH_nombre==='function'&&m&&m.tipo?VH_nombre(m):'CHATARRA'+['',' II',' III'][Math.max(0,Math.min(2,((m&&m.lvl)||1)-1))]; // el vehículo de cada misión (vehiculos.js)
function enterMech(m){P.ride=m;m.ride=true;m.by=P;m.face=P.face;m.aim=0;m.inv=30;setBanner('¡A BORDO DE LA '+mechNombre(m)+'!',70);SFX.pick();}
function ejectMech(m,broken){
  m.ride=false;m.by=null;m.cool=45;m.jet=false;P.ride=null;
  P.x=clamp(m.x+7,camX+2,camX+VW-10);P.y=m.y-6;P.vy=-4.5;P.onGround=false;P.plat=null;P.crouch=false;
  P.inv=Math.max(P.inv,broken?100:40);SFX.jump();
}
function mechBreak(m){m.dying=75;ejectMech(m,true);setBanner('¡LA CHATARRA NO DA MÁS!',80);SFX.alarm();}
function mechFire(m){
  const a=m.aim+rand(-0.06,0.06),px=m.face>0?m.x+18:m.x+4,py=m.y+12;m.barrel^=1;
  const dx=Math.cos(a)*m.face,dy=Math.sin(a),off=m.barrel?-1.2:1.2,nx=-dy,ny=dx;
  const sx=px+dx*10+nx*off,sy=py+dy*10+ny*off;
  tirosDisp++;pbul.push({x:sx,y:sy,vx:dx*6.8,vy:dy*6.8,k:'b',dmg:1,life:70,heavy:true,w:'grillo',sh:1});
  parts.push({k:'flash',x:sx,y:sy,life:3,maxl:3,size:4});
  parts.push({k:'shell',x:px,y:py,vx:-m.face*rand(0.6,1.4),vy:rand(-2,-1),g:0.18,life:40,maxl:40,col:'#e8c25a'});
  SFX.heavy();
}
// Cañón: quieto = mortero (tiro alto que busca al enemigo más cercano adelante); en marcha = tiro recto al costado.
const MECH_MORT_ANG=-1.3; // ángulo del caño en modo mortero (≈75° hacia arriba)
function mechCannonMuzzle(m){
  const a=m.canAng,lx=7+Math.cos(a)*16,ly=8.25+Math.sin(a)*16;
  return{x:m.face>0?m.x+lx:m.x+m.w-lx,y:m.y+ly};
}
function mechCannon(m){kick(-m.face*2,0);
  const mort=m.canAng<MECH_MORT_ANG/2,mz=mechCannonMuzzle(m),sx=mz.x,sy=mz.y;
  m.shells--;m.canCd=mort?42:32;m.recoil=3;
  let vx,vy,g;
  if(mort){
    vy=-6.2;g=0.16;
    let dx=96,ty=GROUND-2,bd=1e9;
    for(const e of enemies){if(!hittable(e))continue;const d=(e.x+e.w/2-sx)*m.face;if(d<24||d>230||d>=bd)continue;bd=d;dx=d;ty=Math.min(GROUND-2,e.y+e.h/2);}
    const tt=(-vy+Math.sqrt(Math.max(0,vy*vy+2*g*(ty-sy))))/g;
    vx=m.face*clamp(dx/tt,0.4,3);
    noise(0.3,0.35,700);tone('sine',130,45,0.25,0.12);dust(m.x+11,m.y+m.h,6);
  }else{
    vx=m.face*5+m.vx*0.5;vy=-1.4;g=0.12;
    m.x-=m.face*2.5;noise(0.25,0.3,900);tone('square',160,60,0.15,0.06);
  }
  grens.push({x:sx,y:sy,vx,vy,g,t:0,rot:Math.atan2(vy,vx),mort,whistle:false,upd:grilloShellUpd,draw:grilloShellDraw});
  shake=Math.max(shake,2.5);
  parts.push({k:'flash',x:sx,y:sy,life:4,maxl:4,size:7});
  for(let i=0;i<4;i++)parts.push({k:'smoke',x:sx,y:sy,vx:vx*0.08+rand(-0.3,0.3),vy:vy*0.08+rand(-0.3,0.1),life:rand(20,34),maxl:34,size:rand(1.5,2.5)});
}
function grilloShellUpd(g){
  g.t++;const py=g.y;g.vy+=g.g;g.x+=g.vx;g.y+=g.vy;g.rot=Math.atan2(g.vy,g.vx);
  if(g.x<camX-40||g.x>camX+VW+40){g.gone=true;return;}
  if(g.t%2===0)parts.push({k:'smoke',x:g.x-g.vx*0.8,y:g.y-g.vy*0.8,vx:0,vy:-0.1,life:16,maxl:16,size:1.2});
  if(g.mort&&!g.whistle&&g.vy>0.5){g.whistle=true;tone('sine',1500,420,0.9,0.025);}
  let hit=g.t>260;
  if(g.y>=GROUND-2){g.y=GROUND-2;hit=true;}
  if(!hit&&g.vy>0)for(const pl of platforms)if(g.x>pl.x&&g.x<pl.x+pl.w&&py<=pl.y&&g.y>=pl.y){g.y=pl.y-1;hit=true;break;}
  if(!hit&&g.t>2)for(const e of enemies)if(hittable(e)&&overlapPt(e,g.x,g.y,3)){hit=true;break;}
  if(!hit)for(const c of crates)if(!c.gone&&overlapPt(c,g.x,g.y,2)){hit=true;break;}
  if(hit){
    g.gone=true;const r=g.mort?46:40,d=(g.mort?9:8)*dmgMul,sh=shake;
    killSrc='grillo';blast(g.x,g.y,r,d,0.6);killSrc=null;
    shake=Math.max(sh,Math.min(shake,6)); // explosión grande sin marear la cámara
    if(g.y>GROUND-8)dust(g.x,GROUND,12);
  }
}
function grilloShellDraw(g){
  if(g.mort&&g.vy>-1.5){ // marca de impacto en el suelo mientras cae
    const t=(-g.vy+Math.sqrt(Math.max(0,g.vy*g.vy+2*g.g*(GROUND-2-g.y))))/g.g,lx=g.x+g.vx*t;
    if((T>>2)%2){ctx.fillStyle='rgba(255,90,60,0.85)';ctx.fillRect(q(lx-6),GROUND+1,3,1);ctx.fillRect(q(lx+3),GROUND+1,3,1);ctx.fillRect(q(lx-0.5),GROUND+2,1,1);}
  }
  ctx.save();ctx.translate(q(g.x),q(g.y));ctx.rotate(g.rot);
  ctx.fillStyle='#1a1a20';ctx.fillRect(-4.5,-2.5,1.5,5);
  ctx.fillStyle='#2a2a30';ctx.fillRect(-3.5,-1.75,6,3.5);
  ctx.fillStyle='#c08a2e';ctx.fillRect(2.5,-1.25,1.5,2.5);
  ctx.fillStyle=(T>>1)%2?'#ffd25a':'#ff7a2a';ctx.fillRect(-6,-0.7,1.5,1.4);
  ctx.restore();
}
function stomp(m){
  const cx=m.x+11,by=m.y+m.h;shake=Math.max(shake,3.5);noise(0.35,0.3,500);
  for(let i=0;i<14;i++)parts.push({k:'smoke',col:'200,160,120',x:cx+rand(-16,16),y:by-1,vx:(i%2?1:-1)*rand(0.5,1.8),vy:rand(-0.4,-0.1),life:rand(18,30),maxl:30,size:rand(1.5,3)});
  for(const e of enemies)if((e.type==='soldier'||e.type==='grenadier'||e.type==='shield')&&!e.gone&&e.onGround&&Math.abs(e.x+4-cx)<32&&Math.abs(e.y+e.h-by)<4){killSrc='grillo';dmg(e,3*dmgMul);killSrc=null;}
  for(const c of crates)if(!c.gone&&Math.abs(c.x+7-cx)<26&&Math.abs(c.y+c.h-by)<4)dmgCrate(c,3);
}
// Jetpack: mantener X en el aire. Devuelve true si está empujando este cuadro.
function mechJet(m,want){
  if(m.jetLock&&m.fuel>=m.fmax*0.15){m.jetLock=false;tone('sine',900,1400,0.1,0.04);}
  const on=want&&!m.jetLock&&m.fuel>0;
  const nx=m.face>0?m.x+4.5:m.x+m.w-4.5,ny=m.y+18;
  if(on){
    m.fuel=Math.max(0,m.fuel-1);
    m.vy=Math.max(m.vy-(m.vy>0?0.75:0.5),-2.6);
    if(!m.jet)tone('sawtooth',90,260,0.18,0.05);
    if(T%5===0)noise(0.09,0.07,700);
    if(m.fuel<m.fmax*0.2&&T%20===0)tone('square',1200,1200,0.04,0.03);
    for(let i=0;i<2;i++)parts.push({k:'fire',x:nx+rand(-1,1),y:ny,vx:rand(-0.3,0.3),vy:rand(1.2,2.4),life:rand(6,11),maxl:11,size:rand(1.5,2.6)});
    if(T%3===0)parts.push({k:'smoke',x:nx,y:ny+3,vx:rand(-0.4,0.4),vy:rand(0.3,0.9),life:rand(24,40),maxl:40,size:rand(1.5,3)});
    if(m.fuel<=0){
      m.jetLock=true;setBanner('¡SIN COMBUSTIBLE!',50);tone('square',300,90,0.25,0.06);noise(0.15,0.1,600);
      for(let i=0;i<6;i++)parts.push({k:'smoke',x:nx,y:ny,vx:rand(-0.8,0.8),vy:rand(-0.4,0.6),life:rand(25,40),maxl:40,size:rand(1.5,3)});
    }
  }else{
    m.fuel=Math.min(m.fmax,m.fuel+m.fmax/1800);
    if(want&&m.jetLock&&T%10===0){tone('square',130,80,0.05,0.03);parts.push({k:'smoke',x:nx,y:ny,vx:rand(-0.3,0.3),vy:rand(0.2,0.6),life:20,maxl:20,size:1.5});}
  }
  m.jet=on;return on;
}
function updMech(m){
  const L_=held('left'),R=held('right'),U=held('up'),D=held('down');
  const mv=(R?1:0)-(L_?1:0);if(mv)m.face=mv;
  if(tapped('jump')&&D){ejectMech(m,false);return;}
  m.vx=mv*(m.onGround?1.15:1.35)*(L.speedMul?L.speedMul(m):1);
  if(tapped('jump')&&m.onGround){m.vy=-6.6;m.onGround=false;m.plat=null;SFX.jump();dust(m.x+11,m.y+m.h,8);}
  // un toque de X es un salto normal; si se mantiene, el jetpack prende cerca de la cima del salto
  mechJet(m,held('jump')&&!D&&!m.onGround&&(m.jet||m.vy>-2.2));
  m.x=clamp(m.x+m.vx,camX+2-(typeof MC_margenIzq==='function'?MC_margenIzq():0),camX+VW-(m.w||22)-2+(typeof MC_margen==='function'?MC_margen():0)); // el ancho de cada vehículo (RESORTE mide 40: con 24 fijo quedaba 16 px afuera, Publicación)
  const pb=m.y+m.h,wasAir=!m.onGround,fall=m.vy;
  m.vy=Math.min(m.vy+0.28,6.5);m.y+=m.vy;
  if(m.y<8){m.y=8;if(m.vy<0)m.vy=0;} // techo de vuelo
  land(m,pb,true);
  if(wasAir&&m.onGround){m.jet=false;if(fall>4.2)stomp(m);else dust(m.x+11,m.y+m.h,6);}
  let ta=0;if(U)ta=mv?-Math.PI/4:-Math.PI/2;else if(D&&!m.onGround)ta=mv?Math.PI/4:Math.PI/2;
  m.aim+=clamp(ta-m.aim,-0.25,0.25);
  m.canAng+=((mv?0:MECH_MORT_ANG)-m.canAng)*0.18;if(m.recoil>0)m.recoil=Math.max(0,m.recoil-0.4);
  if(m.fireCd>0)m.fireCd--;if(m.canCd>0)m.canCd--;
  if(held('shoot')&&m.fireCd<=0){mechFire(m);m.fireCd=5;}
  if(tapped('bomb')&&m.canCd<=0){if(m.shells>0)mechCannon(m);else{setBanner('SIN PROYECTILES',40);m.canCd=30;SFX.hit();}}
  if(m.onGround&&m.vx){m.anim++;const ph=Math.floor(m.anim*0.14/Math.PI);if(ph!==m.stepPh){m.stepPh=ph;SFX.step();dust(m.x+11,m.y+m.h,2);}}
  if(m.armor<m.max/2&&T%8===0)parts.push({k:'smoke',x:m.face>0?m.x+1:m.x+21,y:m.y+6,vx:rand(-0.2,0.2),vy:rand(-0.8,-0.4),life:40,maxl:40,size:rand(1.5,3)});
  if(m.inv>0)m.inv--;if(m.flash>0)m.flash--;
  P.x=m.x+7;P.y=m.y+8;P.vx=m.vx;P.face=m.face;P.onGround=m.onGround;P.crouch=false;
}
function updMechs(){
  for(const m of mechs){
    if(!m.announced&&!m.dying&&onScreen(m,-30)&&!players.some(p=>p.ride)&&!(typeof PC_cartel!=='undefined'&&PC_cartel)&&T>=(typeof AY_OBJ_T!=='undefined'?AY_OBJ_T:0)){ /* después del objetivo y del cartel de continuación (Pruebas, Y) */m.announced=true;setBanner('¡VEHÍCULO A LA VISTA!',80);}
    if(m.dying>0){
      m.dying--;if(T%5===0)parts.push({k:'smoke',x:m.x+rand(4,18),y:m.y+rand(0,10),vx:rand(-0.3,0.3),vy:rand(-0.8,-0.3),life:40,maxl:40,size:rand(2,4)});
      if(T%7===0)spark(m.x+rand(2,20),m.y+rand(2,16));
      if(m.dying%15===0)tone('square',880,880,0.08,0.04);
      if(m.dying<=0){killSrc='grillo';blast(m.x+11,m.y+14,34,8);killSrc=null;m.gone=true;}
    }
    if(m.ride)continue;
    if(m.cool>0)m.cool--;if(m.flash>0)m.flash--;
    m.fuel=Math.min(m.fmax,m.fuel+m.fmax/1800);m.jet=false;m.canAng*=0.85;m.recoil=0;
    const pb=m.y+m.h;m.vy=Math.min(m.vy+0.28,6.5);m.y+=m.vy;land(m,pb,true);
  }
  mechs=mechs.filter(m=>!m.gone);
}
function drawMech(m){
  if(!onScreen(m,30))return;
  const ridden=m.ride,parked=!ridden&&!m.dying;
  const fl=m.flash>0||(m.dying>0&&(T>>2)%2),C=c=>fl?'#fff':c;
  ctx.save();ctx.translate(q(m.x),q(m.y));if(m.face<0){ctx.translate(m.w,0);ctx.scale(-1,1);}
  const sink=parked||m.dying?4:0,bob=ridden&&m.onGround&&m.vx?Math.abs(Math.sin(m.anim*0.14))*1.2:0,by=sink-bob;
  const hx=11,hy=14+by,ph=m.anim*0.14;
  // llama del jetpack (detrás de las patas)
  if(m.jet){
    const fh=5+Math.random()*4;
    ctx.fillStyle='rgba(255,120,40,0.55)';ctx.fillRect(2.5,18+by,4,fh+2);
    ctx.fillStyle='#ffd25a';ctx.fillRect(3,18+by,3,fh);
    ctx.fillStyle='#fff6c8';ctx.fillRect(3.8,18+by,1.4,fh*0.55);
  }
  ctx.lineCap='round';
  for(const side of [1,0]){
    let fx,fy;
    if(!m.onGround){fx=hx+(side?-3:3);fy=hy+10;}
    else if(!ridden){fx=hx+(side?-6:5);fy=28;}
    else if(!m.vx){fx=hx+(side?-4:4);fy=28;}
    else{const s=Math.sin(ph+(side?Math.PI:0));fx=hx+s*6;fy=28-Math.max(0,Math.cos(ph+(side?Math.PI:0)))*3;}
    const mx=(hx+fx)/2,my=(hy+fy)/2,dx=fx-hx,dy=fy-hy,l=Math.hypot(dx,dy)||1,bend=!ridden?9:7;
    const kx=mx-dy/l*bend,ky=my+dx/l*bend-2;
    ctx.strokeStyle=C(side?'#2a251e':'#3a3328');ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(kx,ky);ctx.stroke();
    ctx.strokeStyle=C(side?'#3f382e':'#5c5246');ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(kx,ky);ctx.lineTo(fx,fy);ctx.stroke();
    ctx.fillStyle=C(side?'#8a6420':'#c08a2e');circle(kx,ky,1.8);
    ctx.fillStyle=C('#24201a');ctx.fillRect(fx-3,fy-1.5,7,1.5);
  }
  ctx.lineCap='butt';
  ctx.save();ctx.translate(18,12+by);ctx.rotate(m.aim);ctx.fillStyle=C('#2a2a30');ctx.fillRect(0,-2,10,1.5);ctx.fillRect(0,0.5,10,1.5);
  ctx.fillStyle=C('#1a1a20');ctx.fillRect(-2,-2.5,4,5);ctx.restore();
  ctx.fillStyle=C('#c08a2e');ctx.beginPath();ctx.moveTo(2,4+by);ctx.lineTo(17,3+by);ctx.lineTo(22,8+by);ctx.lineTo(20,15+by);ctx.lineTo(3,16+by);ctx.lineTo(0,10+by);ctx.closePath();ctx.fill();
  ctx.fillStyle=C('#e0b050');ctx.fillRect(3,4+by,13,1);
  ctx.fillStyle=C('#7a5418');ctx.fillRect(3,14+by,17,2);
  for(let i=0;i<4;i++){ctx.fillStyle=fl?'#fff':i%2?'#1d1a1c':'#e8c040';ctx.fillRect(4+i*3,11+by,3,2);}
  // tobera del jetpack, abajo atrás
  ctx.fillStyle=C('#2a2a30');ctx.fillRect(2.5,15.5+by,4,2.5);ctx.fillStyle=C(m.jet?'#ff8a2a':'#1a1a20');ctx.fillRect(3,17.5+by,3,1);
  // cañón: gira suave entre tiro recto (en marcha) y mortero (quieto)
  ctx.save();ctx.translate(7,8.25+by);ctx.rotate(m.canAng);const rc=-m.recoil;
  ctx.fillStyle=C('#2a2a30');ctx.fillRect(rc-1,-1.25,17,2.5);ctx.fillStyle=C('#1a1a20');ctx.fillRect(rc+14,-1.75,3,3.5);
  ctx.fillStyle=C('#3a3328');ctx.fillRect(rc+4,-1.25,1,2.5);
  ctx.fillStyle=C('#1a1a20');ctx.fillRect(-2.5,-2.5,5,5);ctx.restore();
  ctx.fillStyle=C('#3a3328');ctx.fillRect(-2,6+by,3,2);
  if(ridden){
    const rd=m.by||P;ctx.fillStyle=playerHelmet(rd);ctx.fillRect(12,1+by,4,2);ctx.fillStyle='#efb88d';ctx.fillRect(12.5,3+by,3,2);
    ctx.fillStyle='#1a1a1a';ctx.fillRect(14.5,3.5+by,1,1);ctx.fillStyle=CHARS[rd.ci].pal.r;ctx.fillRect(12,5+by,4,1);
    ctx.fillStyle='rgba(140,220,225,0.45)';ctx.beginPath();ctx.arc(14,6+by,5,Math.PI,0);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.7)';ctx.fillRect(15.5,2+by,1.5,1);
  }else{
    ctx.fillStyle='#1a1a20';ctx.fillRect(11,3+by,6,3);
    ctx.save();ctx.translate(9,6+by);ctx.rotate(-0.9);ctx.fillStyle='rgba(140,220,225,0.45)';ctx.beginPath();ctx.arc(5,0,5,Math.PI,0);ctx.fill();ctx.restore();
  }
  ctx.strokeStyle=C('#2a2a30');ctx.lineWidth=0.7;ctx.beginPath();ctx.moveTo(4,4+by);ctx.lineTo(3,-4+by);ctx.stroke();
  ctx.fillStyle=(T>>4)%2?'#7dff9a':'#2a5a34';ctx.fillRect(2.4,-5+by,1.5,1.5);
  ctx.restore();
  if(parked&&m.cool<=0&&players.some(p=>!p.ride&&!p.dead&&Math.abs(p.x+4-(m.x+11))<44))txt(btn('up')+' SUBIR A LA CHATARRA',m.x+11,m.y-10+Math.sin(T/8)*1.5,6,'#ffe08a','center');
}
// HUD del Grillo (arriba a la derecha) mientras vas a bordo
function drawMechHUD(m){
  const bx=W-56,bw=50,f=m.fuel/m.fmax;
  const rs=P?P.slot:0,ar=RC_ver('ar'+rs,m.armor),gj=RC_salto('gri'+rs); // recolectar.js: lo que se junta va a la cabina
  txt(mechNombre(m),W-6,4+gj,5,RC_luz('gri'+rs)?'#fff6c8':'#f3c969','right');RC_ancla('gri'+rs,bx+bw/2,11);
  // blindaje
  ctx.fillStyle='#120c18';ctx.fillRect(bx-1,10,bw+2,6);ctx.fillStyle='#4a2730';ctx.fillRect(bx,11,bw,4);
  ctx.fillStyle=m.armor<=m.max*0.3?((T>>3)%2?'#ff5a3c':'#a02a1a'):'#e8c040';ctx.fillRect(bx,11,bw*Math.max(0,ar)/m.max,4);
  // combustible del jetpack
  ctx.fillStyle='#120c18';ctx.fillRect(bx-1,16.5,bw+2,4.5);ctx.fillStyle='#1c2a38';ctx.fillRect(bx,17.5,bw,2.5);
  ctx.fillStyle=m.jetLock?((T>>3)%2?'#ff5a3c':'#7a2a1a'):f<0.2?'#ff9a3c':'#6fd0ff';ctx.fillRect(bx,17.5,bw*f,2.5);
  txt('VUELO',bx-3,16.5,4,m.jetLock||f<0.2?'#ff9a3c':'#9ad0ff','right',false);
  // cañón: la flecha dice hacia dónde sale el próximo tiro
  const mort=m.canAng<MECH_MORT_ANG/2,sl=P?P.slot:0,J=btn('jump',sl); // botones del control del que maneja (btn en input.js)
  txt('CAÑÓN '+m.shells+(mort?' ↑':' →')+' ('+btn('bomb',sl)+')',W-6,22.5,5,m.shells?'#fff':'#ff6b5b','right');
  if(m.jetLock)txt('JET RECARGANDO',W-6,28.5,4,(T>>3)%2?'#ff9a3c':'#aaa','right',false);
  else txt(J+' EN EL AIRE: VOLAR',W-6,28.5,4,'#aaa','right',false);
  txt('↓+'+J+': BAJAR',W-6,33.5,4,'#aaa','right',false);
}

// ---------- vehículo estacionado: invitación a subirse (feedback de 2 jugadores, 25 nov) ----------
// Arriba de cada vehículo libre: una flecha que rebota y la tecla REAL de subir (la del control que se está usando).
// Vale para CHATARRA, RESORTE y VENTARRÓN. No sale si ya hay alguien arriba de ese vehículo, ni en la intro.
ON_HUD.push(()=>{
  if(state!=='play'||(typeof IN!=='undefined'&&IN.activa))return;
  for(const m of mechs){if(m.ride||m.dying||m.gone||m.cool>0||!onScreen(m,-6))continue;
    if(!players.some(p=>!p.dead&&!p.ride))continue; // todos montados: nadie puede subir
    const cerca=players.some(p=>!p.dead&&!p.ride&&Math.abs(p.x+4-(m.x+m.w/2))<m.w/2+26);
    const red=typeof MOV_reducido==='function'&&MOV_reducido(),bob=red?0:Math.round(Math.abs(Math.sin(T/(cerca?6:10)))*4);
    const x=Math.round(HX(m.x+m.w/2)),y=Math.round(HY(m.y)-10-bob),k=onTouch()?'↑':btn('up',0),kw=keycapW(k);
    if(y<26)continue; // nunca encima del HUD
    // flecha hacia abajo (7 × 6), con tinta
    ctx.fillStyle='#120c18';ctx.fillRect(x-2,y-7,5,5);ctx.fillRect(x-4,y-3,9,3);ctx.fillRect(x-3,y,7,1);ctx.fillRect(x-2,y+1,5,1);ctx.fillRect(x-1,y+2,3,1);
    ctx.fillStyle=cerca?'#fff0b0':'#ffe08a';ctx.fillRect(x-1,y-6,3,4);ctx.fillRect(x-3,y-2,7,1);ctx.fillRect(x-2,y-1,5,1);ctx.fillRect(x-1,y,3,1);ctx.fillRect(x,y+1,1,1);
    keycap(k,x-Math.round(kw/2),y-16,cerca?'#fff0b0':'#ffe08a'); // la tecla real, arriba de la flecha
  }
});
