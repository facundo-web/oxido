'use strict';
// Óxido · Guiños de película en las misiones 1, 2 y 3 (homenaje, sin nombres ni personajes de películas)
//   M1 Zona Óxido  → robots de CHATARRA (ENDO): caños, chapas remachadas, un solo visor ámbar rectangular y mangueras;
//                    caminan como soldados, aguantan más; al caer se desarman en pedazos.
//   M2 Puerto Ceniza → algo acecha bajo el agua: un periscopio con luz ronda el mar del fondo y a veces asoma el lomo
//                    de una ANGUILA de chapa (segmentos remachados), nada de aletas.
//   M3 Pantano     → el ACECHADOR: cazador con traje de hojas (ghillie) que casi no se distingue del pantano; se nota
//                    porque sus hojas se mueven distinto. Tira con arco largo: un dardo lento, y antes de tirar
//                    destella la punta amarilla de la flecha (sin láser, sin puntos rojos, sin chasquidos).
// App Store 5.2: se conserva el guiño (la idea de género), pero ninguna pieza copia la forma de una película.
// Prefijo GU_ en todo lo global. Carga después de mision3/planta/musica3 y antes de las misiones nuevas.
const GU_sfx=n=>{if(typeof SFX!=='undefined'&&SFX[n])SFX[n]();};
const GU_near=(x,y)=>typeof nearestPlayer==='function'&&players.length>1?nearestPlayer(x,y):P;

// ================== M1 · ENDO, robot de chatarra ==================
// Mismo cuerpo y animación que un soldado (sprites.js). Cabeza de lata ancha y baja (encorvada), un visor ámbar
// de rejilla (tres barras ámbar), chapas color óxido y gris acero remachadas, caños y una manguera que baja del hombro.
// Nada de calavera, ni costillas, ni verde, ni visor de franja.
const GU_HEAD_ENDO=["..............","...kkkkkkkk...","..kHHHHHHHhk..","..khhrhhhrhk..","..kkekekekkk..","..kSkhhhhkSk..","...kkmmmmkk..."]; // visor de REJILLA (barras), no una franja
const GU_TORSO_ENDO=[".kkvvvvvvvvkk.",".kVvrvvvvrvVk.",".kvvvmmmvvvvk.","..kVvvmvvVvk..","..kVVrVVrVVk.."];
const GU_PAL_ENDO={...PAL_E,h:'#9a5a32',H:'#c98a52',s:'#9a5a32',S:'#5a3a26',e:'#ffb030',v:'#7c848e',V:'#4e555e',r:'#c9a43a',m:'#2f343c',p:'#4e555e',P:'#34393f',b:'#24282f'}; // óxido (cabeza) y gris acero (cuerpo)
const GU_ENDO=build(GU_PAL_ENDO,GU_HEAD_ENDO,GU_TORSO_ENDO);
function GU_mkEndo(x,y){
  const e=mkSoldier(x,y??GROUND-18,'soldier');
  e.endo=true;e.hp=4;e.score=180;e.spd=0.5;e.range=rand(50,120);e.draw=GU_drawEndo;e.onKill=GU_killEndo;return e;
}
function GU_drawEndo(e){
  const set=e.flash?SPR.w:GU_ENDO,f=e.face>0?0:1;
  const pose=rigPose(e,e.ph);drawRig(set,pose,f,e.x-3,e.y);
  const cx=e.x+4+pose.ux,y=e.y+pose.uy,fc=e.face;
  // el visor ámbar: late suave y se prende fuerte al apuntar
  const aim=e.state==='aim';
  ctx.fillStyle=aim?'rgba(255,190,60,0.6)':`rgba(255,180,50,${0.18+0.12*Math.sin((T+e.ph)/9)})`;
  for(let i=0;i<3;i++)ctx.fillRect(q(cx-3.5+i*2.4),q(y+3.2),1.2,2.4);   // la rejilla que late
  // la manguera que va del hombro al brazo (se hamaca al caminar)
  ctx.strokeStyle='#2f343c';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(cx-fc*3,y+8);ctx.quadraticCurveTo(cx-fc*6,y+12+Math.sin((T+e.ph)/7),cx+fc*1,y+11);ctx.stroke();
  // brazo cañón: el mismo gesto de levantar el arma que los soldados
  const gy=11-Math.round(e.raise*2),bx=(fc>0?cx+1:cx-9)-fc*(e.rec||0);
  ctx.fillStyle='#2b3038';ctx.fillRect(q(bx),q(y+gy),8,2);
  ctx.fillStyle=e.flash?'#fff':'#b8c2cc';ctx.fillRect(q(bx+(fc>0?0:6)),q(y+gy),2,2);
  if(aim&&e.t<10&&(T>>1)%2){ctx.fillStyle='#ffb030';ctx.fillRect(q(fc>0?cx+9:cx-10),q(y+gy),1.5,1.5);}
}
// al caer se DESARMA: chapas, caños, tornillos y la lata de la cabeza salen para todos lados (no queda un cuerpo entero)
function GU_desarmar(x,y,dir,k){
  const cols=['#7a6a58','#5a4c3e','#8a7f72','#b8ab98','#2f343c'];
  for(let i=0;i<10*k;i++)parts.push({k:'p',x:x+rand(-3,3)*k,y:y+rand(0,14)*k,vx:dir*rand(0.2,1.6)+rand(-0.8,0.8),vy:rand(-3.2,-0.8),g:0.2,life:rand(30,55),maxl:55,size:i%4===0?2.5*k:i%2?1.6*k:1,col:cols[i%cols.length]});
  for(let i=0;i<4;i++)parts.push({k:'p',x:x,y:y+4*k,vx:rand(-1,1),vy:rand(-2.5,-1.2),g:0.18,life:rand(20,30),maxl:30,size:1,col:'#c9a43a'}); // tornillos
  parts.push({k:'p',x:x,y:y+2*k,vx:dir*0.9,vy:-2.6,g:0.2,life:60,maxl:60,size:2.5*k,col:'#ffb030'}); // el visor, que se apaga al caer
}
function GU_killEndo(e){
  const h=hitFrom,dir=h?h.dir:-e.face;
  GU_desarmar(e.x+4,e.y,dir,1);
  spark(e.x+4,e.y+4,'#ffb030');SFX.down();noise(0.12,0.08,1400);
  if(Math.random()<0.1)pickups.push({kind:pick(['H','S','F','R','G','E','+']),x:e.x,y:e.y,w:10,h:10,vy:-2.5,life:700});
}
ENEMY_MAKERS.endo=GU_mkEndo;
NV_COSTO.endo=1.3;
// en la misión 1, algunos soldados pasan a ser robots de chatarra (no todos)
{
  const L1=LEVELS[0],cambiar=ats=>{for(const ev of L1.events)if(ats.includes(ev.at)){const s=ev.spawn.find(s=>s.t==='soldier'&&typeof s.x!=='number');if(s)s.t='endo';}};
  cambiar([240,780,1400,1720,2360,2700]);
  const w=L1.arenas.find(a=>a.waves).waves;w[0][2].t='endo';w[2][3].t='endo';
}
if(typeof KILL_NAMES!=='undefined')KILL_NAMES.push(['endo','robots']);

// ================== M2 · algo acecha bajo el agua: la anguila de chatarra ==================
// Vive en el mar del fondo (parallax 0,3). Lo único que asoma es un PERISCOPIO con una luz que ronda. Cada tanto se
// hunde, avisa con un golpe grave único y burbujas, y asoma el lomo largo de la anguila (segmentos de chapa remachada
// que suben y bajan en onda) antes de volver a hundirse. Nada de aletas ni de saltos de pez.
const GU_SEA=118;
const GU_fin={x:200,dir:-1,st:'swim',t:0,next:900,seen:false}; // (se sigue llamando así por los ganchos: es el periscopio)
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
// el periscopio: un caño fino con una cabeza que gira y una luz que barre (la luz es lo que se ve de lejos)
function GU_periscopio(sx,wy,h,dir,luz){
  if(h<=0.5)return;
  ctx.fillStyle='#2a323c';ctx.fillRect(q(sx-0.6),q(wy-h),1.4,h);                          // caño
  ctx.fillStyle='#3a4656';ctx.fillRect(q(sx-1.6),q(wy-h-1.6),3.4,2);                       // cabeza
  ctx.fillStyle='#8a5a3a';ctx.fillRect(q(sx-1.6),q(wy-h-1.6),1,1);                          // óxido
  const lx=sx+dir*1.8,ly=wy-h-0.6;ctx.fillStyle=`rgba(255,236,150,${0.5+0.5*luz})`;ctx.fillRect(q(lx-0.5),q(ly-0.5),1.2,1.2);
  ctx.fillStyle=`rgba(255,236,150,${0.12*luz})`;ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(lx+dir*16,ly-3);ctx.lineTo(lx+dir*16,ly+3);ctx.fill(); // el haz
}
// el lomo de la anguila: segmentos de chapa en onda, uno detrás del otro (cada uno asoma y se hunde)
function GU_lomo(sx,wy,k,dir){
  for(let i=0;i<8;i++){const ph=k*Math.PI*2.2-i*0.42,up=Math.sin(ph);if(up<=0)continue;
    const x=sx-dir*i*5.5,y=wy-up*7,w=6-i*0.35;
    ctx.fillStyle='#120c18';ctx.fillRect(q(x-w/2-0.5),q(y-0.5),w+1,4);ctx.fillStyle=i%2?'#3a4656':'#2c3644';ctx.fillRect(q(x-w/2),q(y),w,3);
    ctx.fillStyle='#c9a43a';ctx.fillRect(q(x-0.5),q(y+0.6),0.8,0.8);                          // remache
    if(i===0){ctx.fillStyle='#ffec96';ctx.fillRect(q(x+dir*2.4),q(y+0.6),1,1);}}               // el sensor de la cabeza
  // cables que cuelgan entre segmentos
  ctx.strokeStyle='rgba(30,30,36,0.8)';ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(sx-dir*6,wy-2);ctx.quadraticCurveTo(sx-dir*14,wy+2,sx-dir*22,wy-1);ctx.stroke();
}
LEVELS[1].drawBG=function(){drawBGPort();GU_periscopioFondo();};
// el periscopio (o el lomo) que ronda el agua del fondo, sin el fondo del puerto: lo usa también el escenario Hondo de M2
// (escenario-m2.js, desde su capa de agua). Mientras dura el momento del muelle (momentos.js) no se dibuja: es la misma.
function GU_periscopioFondo(){
  if(typeof MO!=='undefined'&&MO.m2&&MO.m2.t<300)return;
  const f=GU_fin,sx=f.x-camX*0.3;if(sx<-40||sx>W+40)return;
  const wy=GU_SEA+16; // línea de agua
  if(f.st==='swim'||f.st==='dive'){
    const sink=f.st==='dive'?Math.min(7,f.t/6):0,bob=Math.sin(T/14)*0.4,gira=Math.sin(T/40);
    GU_periscopio(sx,wy+bob,7-sink,gira>0?1:-1,0.5+0.5*Math.abs(gira));
    ctx.fillStyle='rgba(190,215,240,0.35)';for(let i=1;i<4;i++)ctx.fillRect(q(sx-f.dir*(2+i*4)),q(wy+0.5),3-i*0.6,0.7); // estela chiquita
  }else{
    const k=f.t/46;GU_lomo(sx,wy,k,f.dir);
    for(const[t0,x0]of[[0,sx],[40,sx-f.dir*30]]){const dt=f.t-t0;if(dt<0||dt>14)continue;ctx.fillStyle=`rgba(220,235,250,${0.6-dt/24})`;
      for(let i=0;i<4;i++)ctx.fillRect(q(x0+(i-1.5)*2.2),q(wy-dt*0.4+dt*dt*0.04),1,1);}
  }
};

// ================== M3 · ACECHADOR, cazador de hojas ==================
// Un traje de hojas y ramas del color del pantano: siempre se ve como silueta (sin brillos ni distorsiones), y se
// delata porque sus hojas se mueven distinto que las del resto. Tira con un ARCO LARGO: tensa, la punta de la flecha
// destella en amarillo (ese es el aviso, sin láser ni puntos rojos) y sale un dardo lento que se puede esquivar y que
// frenan las coberturas. Después de dos tiros salta a otra plataforma.
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
    if(x<camX+20||x>camX+VW-20||Math.abs(x-(e.x+4))<30)continue;
    const d=Math.abs(x-pc.x);if(d<40||d>170)continue;ops.push({x:x-4,y:pl.y-e.h,s:d*0.5+pl.y});}
  let t;
  if(ops.length){ops.sort((a,b)=>a.s-b.s);t=pick(ops.slice(0,3));}
  else{const side=Math.random()<0.5?-1:1,x=clamp(pc.x+side*rand(70,120),camX+16,camX+VW-24);t={x,y:GROUND-e.h};}
  const N=42,g=0.25;
  e.vx=(t.x-e.x)/N;e.vy=(t.y-e.y-0.5*g*N*N)/N;e.st='leap';e.t=0;e.face=e.vx<0?-1:1;noise(0.15,0.04,1500); // salto entre hojas
}
function GU_updStalker(e){
  e.anim++;
  if(e.flash===4){e.rev=45;for(let i=0;i<5;i++)parts.push({k:'p',x:e.x+rand(0,9),y:e.y+rand(2,18),vx:rand(-0.8,0.8),vy:rand(-1.2,-0.2),g:0.08,life:20,maxl:20,size:1,col:i%2?'#4f7a2e':'#6a8a3a'});} // le vuelan hojas
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
    if(on&&pc){if(--e.cd<=0){e.st='aim';e.t=56;e.tx=pc.x;e.ty=pc.y;noise(0.12,0.03,1800);}} // tensa el arco: un roce de hojas
  }else if(e.st==='aim'){
    if(pc&&e.t>20){e.tx+=(pc.x-e.tx)*0.25;e.ty+=(pc.y-e.ty)*0.25;e.face=e.tx<e.x+4?-1:1;} // sigue al blanco, y los últimos cuadros queda fijo
    if(--e.t<=0){
      const mx=e.x+4+e.face*7,my=e.y+7,a=Math.atan2(e.ty-my,e.tx-mx),sp=2.3;
      eproj.push({kind:'dardo',x:mx,y:my,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:1.4,t:0,upd:GU_boltUpd,draw:GU_boltDraw});
      tone('triangle',180,90,0.08,0.05);noise(0.05,0.04,2600);e.shots++; // la cuerda del arco
      if(e.shots>=2&&pc){GU_leapTo(e,p);}
      else{e.st='hide';e.cd=rand(70,110)*DIFF().fire;}
    }
  }
  const moving=e.st==='leap',tgt=e.rev>0||e.flash?1:e.st==='aim'?0.4:moving?0.3:0.16;
  e.vis+=(tgt-e.vis)*0.15;
}
function GU_boltUpd(b,hb){
  b.t++;b.x+=b.vx;b.y+=b.vy;
  if(coverBlocks(b)){spark(b.x,b.y,'#c9a43a');b.gone=true;return;}
  if(hb&&b.x+b.r>hb.x&&b.x-b.r<hb.x+hb.w&&b.y+b.r>hb.y&&b.y-b.r<hb.y+hb.h){hurtPlayer(1);spark(b.x,b.y,'#c9a43a');b.gone=true;return;}
  for(const a of allies)if(!a.gone&&overlapPt(a,b.x,b.y,b.r)){killAlly(a);b.gone=true;return;}
  if(b.y>=GROUND-1){dust(b.x,GROUND,2);b.gone=true;return;}
  if(b.x<camX-20||b.x>camX+VW+20||b.y<-20||b.t>260)b.gone=true;
}
// el dardo: un palito con punta y plumas (lento y visible)
function GU_boltDraw(b){
  const a=Math.atan2(b.vy,b.vx);ctx.save();ctx.translate(b.x,b.y);ctx.rotate(a);
  ctx.fillStyle='#120c18';ctx.fillRect(-6,-1,9,2);ctx.fillStyle='#b08a4a';ctx.fillRect(-5.5,-0.5,8,1);
  ctx.fillStyle='#d8dde2';ctx.beginPath();ctx.moveTo(2.5,-1.3);ctx.lineTo(5,0);ctx.lineTo(2.5,1.3);ctx.fill();   // punta
  ctx.fillStyle='#e0563a';ctx.fillRect(-6,-1.6,2,1);ctx.fillRect(-6,0.6,2,1);ctx.restore();               // plumas
}
// cuerpo: traje de hojas y ramas, capucha de hojas y la cara en sombra (mirando a la derecha, se espeja)
function GU_bodyRects(e){
  const s=e.st==='leap'?0:Math.round(Math.sin(e.anim/18)); // respira
  return[
    ['#1e2a14',1,14,3,6],['#1e2a14',5,14,3,6],                        // piernas
    ['#2f4a1e',0,6+s,9,9],['#3f6226',1,5+s,7,2],['#4f7a2e',2,8+s,2,1],['#4f7a2e',6,10+s,2,1],['#2a3e18',0,13,9,2], // traje
    ['#22341a',1,0+s,7,6],['#3a5a24',2,0+s,5,2],                     // capucha
    ['#101a0a',5,3+s,3,2]];                                          // la cara, en sombra
}
// las hojas que cuelgan del traje: se mueven a su ritmo, distinto que el pantano (eso es lo que lo delata)
function GU_hojas(e,px,y){
  const R=[[0,2],[8,4],[-1,9],[9,11],[1,15],[7,16],[3,0],[6,7]],sp=e.st==='aim'?0.3:e.st==='leap'?0.5:0.12;
  R.forEach(([rx,ry],i)=>{const sw=Math.sin(e.anim*sp+i*1.7)*1.2;ctx.fillStyle=i%3?'#4f7a2e':'#6a8a3a';ctx.fillRect(q(px(rx,2)+sw),q(y+ry),2,1);
    ctx.fillStyle='#2a3e18';ctx.fillRect(q(px(rx,1)+sw*0.6),q(y+ry+1),1,1);});
}
// el arco largo: de la mano para arriba y para abajo, con la cuerda; al tensar, la flecha y su punta que destella
function GU_arco(e,x,y,fc){
  const tens=e.st==='aim'?Math.min(1,(56-e.t)/14):0,bx=x+4+fc*6,by=y+8;
  ctx.strokeStyle='#5a3a1e';ctx.lineWidth=1;ctx.beginPath();ctx.arc(bx-fc*3,by,7,fc>0?-1.1:Math.PI-1.1+2.2-2.2,fc>0?1.1:Math.PI+1.1);ctx.stroke();
  const cx=bx-fc*(3+tens*3);ctx.strokeStyle='rgba(230,230,210,0.8)';ctx.lineWidth=0.4;ctx.beginPath();ctx.moveTo(bx+fc*0.3,by-6.3);ctx.lineTo(cx,by);ctx.lineTo(bx+fc*0.3,by+6.3);ctx.stroke();
  if(e.st==='aim'){ctx.fillStyle='#b08a4a';ctx.fillRect(q(Math.min(cx,cx+fc*9)),q(by-0.5),9,1);
    // el aviso: la punta de la flecha destella en amarillo (más seguido al final)
    const tx=cx+fc*9,on=e.t<20?(T>>1)%2:(T>>3)%2;if(on){ctx.fillStyle='rgba(255,232,120,0.55)';circle(tx,by,2.6);ctx.fillStyle='#ffe066';ctx.fillRect(q(tx-1),q(by-1),2,2);}}
}
function GU_drawStalker(e){
  const x=e.x,y=e.y,fc=e.face,R=GU_bodyRects(e);
  const px=(rx,w)=>fc>0?x+rx:x+e.w-rx-w;
  // siempre se ve, como silueta de hojas: un poco apagado cuando se queda quieto (se confunde con el pantano)
  ctx.save();ctx.globalAlpha=e.flash?1:0.55+0.45*Math.min(1,e.vis*1.6);
  for(const[c,rx,ry,w,h]of R){ctx.fillStyle=e.flash?'#fff':c;ctx.fillRect(q(px(rx,w)),q(y+ry),w,h);}
  if(!e.flash)GU_hojas(e,px,y);
  GU_arco(e,x,y,fc);ctx.restore();
}
function GU_killStalker(e){
  explodeFx(e.x+4,e.y+10,10);
  for(let i=0;i<12;i++)parts.push({k:'p',x:e.x+4,y:e.y+8,vx:rand(-1.8,1.8),vy:rand(-3,-0.6),g:0.12,life:rand(26,44),maxl:44,size:i%3?1:2,col:i%3?'#3f6226':'#6a8a3a'}); // hojas y ramas
  SFX.down();
}
ENEMY_MAKERS.stalker=GU_mkStalker;
NV_COSTO.stalker=2.4;   // no se cambia por otro tipo al variar la partida
// tres cazadores: miradores y la rama del árbol muerto
LEVELS[2].events.push({at:560,spawn:[{t:'stalker',x:878,y:42,d:40}]},{at:1580,spawn:[{t:'stalker',x:1842,y:44,d:30}]},{at:2560,spawn:[{t:'stalker',x:2806,y:42,d:30}]});
LEVELS[2].events.sort((a,b)=>a.at-b.at);
if(typeof KILL_NAMES!=='undefined')KILL_NAMES.push(['stalker','acechadores']);
