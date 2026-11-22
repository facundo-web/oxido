'use strict';
// Óxido · Guiños de película en las misiones 1, 2 y 3 (homenaje, sin nombres ni personajes de películas)
//   M1 Zona Óxido  → robots esqueleto de metal (ENDO): caminan como soldados, aguantan más, ojos rojos.
//   M2 Puerto Ceniza → una aleta de chapa que ronda el agua del fondo y a veces salta.
//   M3 Pantano     → el ACECHADOR: cazador con traje de hojas, casi invisible; se ve al moverse, al apuntar y al recibir tiros.
// Prefijo GU_ en todo lo global. Carga después de mision3/planta/musica3 y antes de las misiones nuevas.
const GU_sfx=n=>{if(typeof SFX!=='undefined'&&SFX[n])SFX[n]();};
const GU_near=(x,y)=>typeof nearestPlayer==='function'&&players.length>1?nearestPlayer(x,y):P;

// ================== M1 · ENDO, robot esqueleto ==================
// Mismo cuerpo y animación que un soldado (sprites.js), con calavera de metal, costillas y pistones.
const GU_HEAD_ENDO=["....kkkkkk....","...kHHHHhhk...","..kHhhhhhhhk..","..khhhhhkeek..","...khhhhhhhk..","...kSkSkSkSk..","....kSSSSSk..."];
const GU_TORSO_ENDO=["...kvvvvvvvk..","..kvkvkvkvkvk.","..kvvvvVvvvvk.","..kvkvkvkvkvk.","...kVVVVVVVk.."];
const GU_PAL_ENDO={...PAL_E,h:'#8e98a4',H:'#d4dce4',s:'#8e98a4',S:'#5e6672',e:'#ff2a1a',v:'#a7b0ba',V:'#6e7782',r:'#3a3f48',p:'#58606c',P:'#3c434e',b:'#24282f'};
const GU_ENDO=build(GU_PAL_ENDO,GU_HEAD_ENDO,GU_TORSO_ENDO);
function GU_mkEndo(x,y){
  const e=mkSoldier(x,y??GROUND-18,'soldier');
  e.endo=true;e.hp=4;e.score=180;e.spd=0.5;e.range=rand(50,120);e.draw=GU_drawEndo;e.onKill=GU_killEndo;return e;
}
function GU_drawEndo(e){
  const set=e.flash?SPR.w:GU_ENDO,f=e.face>0?0:1;
  const pose=rigPose(e,e.ph);drawRig(set,pose,f,e.x-3,e.y);
  const cx=e.x+4+pose.ux,y=e.y+pose.uy,fc=e.face;
  // brillo del ojo: late suave y se prende fuerte al apuntar
  const aim=e.state==='aim';
  ctx.fillStyle=aim?'rgba(255,60,40,0.55)':`rgba(255,60,40,${0.18+0.12*Math.sin((T+e.ph)/9)})`;
  ctx.fillRect(q(fc>0?cx+3:cx-6),q(y+2.5),4,2.5);
  // brazo cañón: el mismo gesto de levantar el arma que los soldados
  const gy=11-Math.round(e.raise*2),bx=(fc>0?cx+1:cx-9)-fc*(e.rec||0);
  ctx.fillStyle='#2b3038';ctx.fillRect(q(bx),q(y+gy),8,2);
  ctx.fillStyle=e.flash?'#fff':'#b8c2cc';ctx.fillRect(q(bx+(fc>0?0:6)),q(y+gy),2,2);
  if(aim&&e.t<10&&(T>>1)%2){ctx.fillStyle='#ff4130';ctx.fillRect(q(fc>0?cx+9:cx-10),q(y+gy),1.5,1.5);}
}
function GU_killEndo(e){
  const h=hitFrom,dir=h?h.dir:-e.face;
  corpse(GU_ENDO,e.x,e.y,e.face,{vx:dir*1.3,vy:-2.8,vr:dir*0.14});
  for(let i=0;i<8;i++)parts.push({k:'p',x:e.x+4,y:e.y+6,vx:rand(-1.6,1.6),vy:rand(-3,-1),g:0.18,life:rand(24,40),maxl:40,size:i%3?1:1.5,col:i%2?'#c9d2dc':'#ffb040'});
  spark(e.x+4,e.y+4,'#ff6a4a');SFX.down();
  if(Math.random()<0.1)pickups.push({kind:pick(['H','S','F','R','G','E','+']),x:e.x,y:e.y,w:10,h:10,vy:-2.5,life:700});
}
ENEMY_MAKERS.endo=GU_mkEndo;
NV_COSTO.endo=1.3;
// en la misión 1, algunos soldados pasan a ser robots esqueleto (no todos)
{
  const L1=LEVELS[0],cambiar=ats=>{for(const ev of L1.events)if(ats.includes(ev.at)){const s=ev.spawn.find(s=>s.t==='soldier'&&typeof s.x!=='number');if(s)s.t='endo';}};
  cambiar([240,780,1400,1720,2360,2700]);
  const w=L1.arenas.find(a=>a.waves).waves;w[0][2].t='endo';w[2][3].t='endo';
}
if(typeof KILL_NAMES!=='undefined')KILL_NAMES.push(['endo','robots']);

// ================== M2 · la aleta del puerto ==================
// Vive en el mar del fondo (parallax 0,3). Ronda, y cada tanto se hunde, avisa con un golpe grave y burbujas, y salta.
const GU_SEA=118;
const GU_fin={x:200,dir:-1,st:'swim',t:0,next:900,seen:false};
function GU_finReset(){Object.assign(GU_fin,{x:camX*0.3+230,dir:-1,st:'swim',t:0,next:600+rand(0,400)|0});}
function GU_thump(){try{tone('sine',70,42,0.22,0.16);}catch(e){}}
LEVELS[1].upd=function(){
  const f=GU_fin,base=camX*0.3;
  if(f.ev!==levelEvents){f.ev=levelEvents;GU_finReset();}
  f.t++;
  switch(f.st){
  case 'swim':{
    const lo=base+40,hi=base+W-40;
    if(f.x<lo-40)f.x=lo-40;if(f.x>hi+40)f.x=hi+40;        // la cámara avanza: la aleta no se queda atrás
    if(f.x<lo)f.dir=1;else if(f.x>hi)f.dir=-1;
    f.x+=f.dir*0.32;
    if(--f.next<=0&&state==='play'){f.st='dive';f.t=0;}
    break;}
  case 'dive':                                               // se hunde y suena el aviso
    f.x+=f.dir*0.5;
    if(f.t===1)GU_thump();if(f.t%8===4&&f.t<40)GU_sfx('bubble'); // un golpe grave y burbujas (nada de motivos de películas)
    if(f.t>=50){f.st='leap';f.t=0;GU_sfx('splash');}
    break;
  case 'leap':
    f.x+=f.dir*1.1;
    if(f.t===44)GU_sfx('splash');
    if(f.t>=46){f.st='swim';f.t=0;f.next=1300+rand(0,700)|0;}
    break;
  }
};
// dibujo: después del fondo del puerto, sobre el mar
LEVELS[1].drawBG=function(){
  drawBGPort();
  const f=GU_fin,sx=f.x-camX*0.3;if(sx<-30||sx>W+30)return;
  const wy=GU_SEA+16; // línea de agua donde nada
  if(f.st==='swim'||f.st==='dive'){
    const sink=f.st==='dive'?Math.min(6,f.t/6):0,bob=Math.sin(T/14)*0.6,h=6-sink;
    if(h>0.5){
      // aleta de chapa remachada, inclinada hacia donde va
      ctx.fillStyle='#3a4656';ctx.beginPath();
      ctx.moveTo(sx-f.dir*4,wy+bob);ctx.lineTo(sx+f.dir*2,wy-h+bob);ctx.lineTo(sx+f.dir*4,wy+bob);ctx.fill();
      ctx.fillStyle='#8a5a3a';ctx.fillRect(q(sx-f.dir*1.5),q(wy-h*0.4+bob),1,1); // óxido
      ctx.fillStyle='rgba(160,190,220,0.5)';ctx.fillRect(q(sx+f.dir*1.5),q(wy-h*0.7+bob),0.8,0.8);
    }
    // estela
    ctx.fillStyle='rgba(190,215,240,0.35)';
    for(let i=1;i<4;i++)ctx.fillRect(q(sx-f.dir*(4+i*4)),q(wy+0.5),3-i*0.6,0.7);
  }else{
    // salto: el cuerpo entero en arco, de cola a hocico, con agua que cae
    const k=f.t/46,ay=wy-Math.sin(k*Math.PI)*30,rot=(k-0.5)*1.6*f.dir;
    ctx.save();ctx.translate(sx,ay);ctx.rotate(rot);ctx.scale(f.dir,1);
    ctx.fillStyle='#2c3644';ctx.beginPath();ctx.ellipse(0,0,11,3.6,0,0,7);ctx.fill();            // cuerpo
    ctx.fillStyle='#4a5868';ctx.beginPath();ctx.ellipse(1,-1,9,2,0,0,7);ctx.fill();              // lomo
    ctx.fillStyle='#d8dde2';ctx.fillRect(2,1,8,1.5);                                             // panza
    ctx.fillStyle='#3a4656';ctx.beginPath();ctx.moveTo(-2,-3);ctx.lineTo(1,-8);ctx.lineTo(3,-3);ctx.fill(); // aleta
    ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(-15,-4);ctx.lineTo(-13,0);ctx.lineTo(-15,4);ctx.fill();   // cola
    ctx.fillStyle='#f2f2f2';for(let i=0;i<4;i++)ctx.fillRect(6+i*1.3,0.6,0.8,0.8);                 // dientes
    ctx.fillStyle='#ff4a3a';ctx.fillRect(7,-1.6,1,1);                                             // ojo
    ctx.fillStyle='#8a5a3a';ctx.fillRect(-4,-2,2,1);ctx.fillRect(3,-2.4,1,1);                     // óxido
    ctx.restore();
    // salpicadura al salir y al entrar
    for(const[t0,x0]of[[0,sx-f.dir*14],[44,sx+f.dir*8]]){const dt=f.t-t0;if(dt<0||dt>16)continue;
      ctx.fillStyle=`rgba(220,235,250,${0.7-dt/24})`;
      for(let i=0;i<5;i++)ctx.fillRect(q(x0+(i-2)*2.2),q(wy-dt*0.6*(1+Math.abs(i-2)*0.3)+dt*dt*0.05),1,1);
      ctx.fillRect(q(x0-4-dt*0.3),q(wy),8+dt*0.6,0.8);}
    if(f.t<44&&f.t%3===0)ctx.fillStyle='rgba(220,235,250,0.6)',ctx.fillRect(q(sx-f.dir*10),q(ay+4),0.8,1.5);
  }
};

// ================== M3 · ACECHADOR, cazador camuflado ==================
// Casi invisible: se nota un brillo que ondula. Se ve más al moverse, al apuntar (láser con un punto rojo
// sobre el blanco) y, entero, unos instantes después de recibir un tiro. Dispara una bola de plasma lenta
// (esquivable, la frenan las coberturas) y después de dos tiros salta a otra plataforma.
function GU_mkStalker(x,y){
  return{type:'stalker',x,y:y??GROUND-20,w:9,h:20,hp:6,face:-1,flash:0,score:400,st:'hide',t:0,cd:rand(70,110),
    vx:0,vy:0,shots:0,rev:0,vis:0.1,anim:rand(0,99),tx:0,ty:0,upd:GU_updStalker,draw:GU_drawStalker,onKill:GU_killStalker};
}
function GU_land(e){
  if(e.vy<=0)return false;
  const cx=e.x+e.w/2,b=e.y+e.h;
  for(const pl of platforms)if(cx>pl.x&&cx<pl.x+pl.w&&b>=pl.y&&b-e.vy<=pl.y+1){e.y=pl.y-e.h;return true;}
  if(b>=GROUND){e.y=GROUND-e.h;return true;}
  return false;
}
// elige adónde saltar: una plataforma a la vista cerca del jugador (prefiere las altas) o el piso delante
function GU_leapTo(e,p){
  const pc=pCenter(p),ops=[];
  for(const pl of platforms){if(pl.roof||pl.w<24)continue;const x=pl.x+pl.w/2;
    if(x<camX+20||x>camX+W-20||Math.abs(x-(e.x+4))<30)continue;
    const d=Math.abs(x-pc.x);if(d<40||d>170)continue;ops.push({x:x-4,y:pl.y-e.h,s:d*0.5+pl.y});}
  let t;
  if(ops.length){ops.sort((a,b)=>a.s-b.s);t=pick(ops.slice(0,3));}
  else{const side=Math.random()<0.5?-1:1,x=clamp(pc.x+side*rand(70,120),camX+16,camX+W-24);t={x,y:GROUND-e.h};}
  const N=42,g=0.25;
  e.vx=(t.x-e.x)/N;e.vy=(t.y-e.y-0.5*g*N*N)/N;e.st='leap';e.t=0;e.face=e.vx<0?-1:1;GU_sfx('emerge');
}
function GU_updStalker(e){
  e.anim++;
  if(e.flash===4){e.rev=45;for(let i=0;i<5;i++)spark(e.x+rand(0,9),e.y+rand(2,18),i%2?'#9fe8ff':'#ffffff');}
  if(e.flash>0)e.flash--;if(e.rev>0)e.rev--;
  if(e.x+e.w<camX-60){e.gone=true;return;}                    // quedó muy atrás: se va sin dar puntos
  const p=GU_near(e.x,e.y);
  const pc=p&&!p.dead?pCenter(p):null,on=onScreen(e,-4);
  if(e.st==='leap'){
    e.vy+=0.25;e.x+=e.vx;e.y+=e.vy;e.t++;
    if(e.t>4&&GU_land(e)){e.st='hide';e.vx=e.vy=0;e.shots=0;e.cd=rand(40,70);for(let i=0;i<4;i++)parts.push({k:'p',x:e.x+4,y:e.y+e.h,vx:rand(-1,1),vy:rand(-1,-0.3),g:0.1,life:14,maxl:14,size:1,col:'#4a6a2a'});}
    if(e.y>GROUND+40)e.gone=true;
  }else if(e.st==='hide'){
    if(pc)e.face=pc.x<e.x+4?-1:1;
    // si quedó fuera de cuadro adelante, espera; si está a la vista, se prepara para tirar
    if(on&&pc){if(--e.cd<=0){e.st='aim';e.t=56;e.tx=pc.x;e.ty=pc.y;GU_sfx('bubble');}}
  }else if(e.st==='aim'){
    if(pc&&e.t>20){e.tx+=(pc.x-e.tx)*0.25;e.ty+=(pc.y-e.ty)*0.25;e.face=e.tx<e.x+4?-1:1;} // sigue al blanco, y los últimos cuadros queda fijo
    if(--e.t<=0){
      const mx=e.x+4+e.face*5,my=e.y+6,a=Math.atan2(e.ty-my,e.tx-mx),sp=2.6;
      eproj.push({kind:'plasma',x:mx,y:my,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:2.2,t:0,upd:GU_boltUpd,draw:GU_boltDraw});
      GU_sfx('spit');e.shots++;
      if(e.shots>=2&&pc){GU_leapTo(e,p);}
      else{e.st='hide';e.cd=rand(70,110)*DIFF().fire;}
    }
  }
  const moving=e.st==='leap',tgt=e.rev>0||e.flash?1:e.st==='aim'?0.4:moving?0.3:0.16;
  e.vis+=(tgt-e.vis)*0.15;
}
function GU_boltUpd(b,hb){
  b.t++;b.x+=b.vx;b.y+=b.vy;
  if(T%2===0)parts.push({k:'p',x:b.x,y:b.y,vx:0,vy:0,g:0,life:8,maxl:8,size:1,col:'#7ff0ff'});
  if(coverBlocks(b)){spark(b.x,b.y,'#7ff0ff');b.gone=true;return;}
  if(hb&&b.x+b.r>hb.x&&b.x-b.r<hb.x+hb.w&&b.y+b.r>hb.y&&b.y-b.r<hb.y+hb.h){hurtPlayer(1);spark(b.x,b.y,'#7ff0ff');b.gone=true;return;}
  for(const a of allies)if(!a.gone&&overlapPt(a,b.x,b.y,b.r)){killAlly(a);b.gone=true;return;}
  if(b.y>=GROUND-1){spark(b.x,GROUND-2,'#7ff0ff');b.gone=true;return;}
  if(b.x<camX-20||b.x>camX+W+20||b.y<-20||b.t>260)b.gone=true;
}
function GU_boltDraw(b){
  ctx.fillStyle='rgba(120,240,255,0.35)';circle(b.x,b.y,b.r+1.4);
  ctx.fillStyle='#7ff0ff';circle(b.x,b.y,b.r);ctx.fillStyle='#ffffff';circle(b.x,b.y,b.r*0.45);
}
// cuerpo: traje de hojas con capucha, visor ámbar y un lanzador en el hombro (mirando a la derecha, se espeja)
function GU_bodyRects(e){
  const s=e.st==='leap'?0:Math.round(Math.sin(e.anim/18)); // respira
  return[
    ['#1e2a14',1,14,3,6],['#1e2a14',5,14,3,6],                        // piernas
    ['#2f4a1e',0,6+s,9,9],['#3f6226',1,5+s,7,2],['#4f7a2e',2,8+s,2,1],['#4f7a2e',6,10+s,2,1],['#2a3e18',0,13,9,2], // traje
    ['#22341a',1,0+s,7,6],['#3a5a24',2,0+s,5,2],                     // capucha
    ['#ffb030',6,3+s,2,1],                                           // visor
    ['#3a3f48',3,4+s,6,2],['#5a606c',8,4+s,2,1]];                    // lanzador al hombro
}
function GU_drawStalker(e){
  const x=e.x,y=e.y,fc=e.face,R=GU_bodyRects(e);
  const px=(rx,w)=>fc>0?x+rx:x+e.w-rx-w;
  // láser de aviso: línea fina hasta el blanco y un punto rojo encima (titila más rápido al final)
  if(e.st==='aim'){
    const mx=e.x+4+fc*5,my=e.y+6,blink=e.t<20?(T>>1)%2:(T>>2)%2;
    ctx.strokeStyle=`rgba(255,40,30,${e.t<20?0.55:0.3})`;ctx.lineWidth=0.6;ctx.beginPath();ctx.moveTo(mx,my);ctx.lineTo(e.tx,e.ty);ctx.stroke();
    if(blink){ctx.fillStyle='#ff2a1a';ctx.fillRect(q(e.tx-1),q(e.ty-1),2,2);}
    ctx.fillStyle='rgba(255,60,40,0.5)';ctx.fillRect(q(mx-1),q(my-1),2,2);
  }
  const v=e.vis;
  if(v>0.9||e.flash){
    for(const[c,rx,ry,w,h]of R){ctx.fillStyle=e.flash?'#fff':c;ctx.fillRect(q(px(rx,w)),q(y+ry),w,h);}
    return;
  }
  // camuflado: la silueta se dibuja corrida y transparente, con bordes que brillan y ondulan
  ctx.save();ctx.globalAlpha=Math.max(0.05,v*0.8);
  for(const[c,rx,ry,w,h]of R){const wob=Math.sin((e.anim+ry*3)/5)*0.8;ctx.fillStyle=c;ctx.fillRect(q(px(rx,w)+wob),q(y+ry),w,h);}
  ctx.restore();
  ctx.fillStyle=`rgba(200,240,255,${0.25+v*0.5})`;
  for(let i=0;i<5;i++){const k=(e.anim*0.07+i/5)%1,yy=y+k*e.h,side=i%2?e.w:0;
    ctx.fillRect(q(x+side+Math.sin(e.anim/4+i)*0.8-0.5),q(yy),1,1);}
  // el visor siempre se ve un poquito: es lo que delata al cazador
  ctx.fillStyle=`rgba(255,176,48,${0.25+v*0.6})`;ctx.fillRect(q(px(6,2)),q(y+3),2,1);
}
function GU_killStalker(e){
  explodeFx(e.x+4,e.y+10,10);
  for(let i=0;i<12;i++)parts.push({k:'p',x:e.x+4,y:e.y+8,vx:rand(-1.8,1.8),vy:rand(-3,-0.6),g:0.12,life:rand(26,44),maxl:44,size:i%3?1:2,col:i%3?'#3f6226':'#7ff0ff'});
  SFX.down();
}
ENEMY_MAKERS.stalker=GU_mkStalker;
NV_COSTO.stalker=2.4;   // no se cambia por otro tipo al variar la partida
// tres cazadores: miradores y la rama del árbol muerto
LEVELS[2].events.push({at:560,spawn:[{t:'stalker',x:878,y:42,d:40}]},{at:1580,spawn:[{t:'stalker',x:1842,y:44,d:30}]},{at:2560,spawn:[{t:'stalker',x:2806,y:42,d:30}]});
LEVELS[2].events.sort((a,b)=>a.at-b.at);
if(typeof KILL_NAMES!=='undefined')KILL_NAMES.push(['stalker','acechadores']);
