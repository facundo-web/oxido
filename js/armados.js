'use strict';
// Óxido · Soldados armados: algunos soldados enemigos llevan un arma como las nuestras
// (ametralladora, escopeta, lanzallamas o lanzamisiles) y al morir sueltan su munición.
// Va antes de recolectar.js. Ganchos chicos en otros archivos:
//   combate.js  spawn(): ARM_armar(e) · kill(): ARM_soltar(e) · collect(kind,x,y,k): k.amt es la munición que suelta
//               drawPickup(k): si el premio trae k.draw, lo dibuja él
//   enemigos.js updEnemy(): ARM_puede(e,d) (¿está a tiro?), ARM_apunta(e) (aviso), ARM_tira(e,d) (dispara;
//               true = sigue apuntando), ARM_W[arma].aim y .cd · drawSoldier(): ARM_dibArma(e,cx,y,gy)
//   juego.js    collect(k.kind,k.x,k.y,k)
// e.arma: 'heavy' | 'shotgun' | 'flame' | 'rocket' (las mismas claves que WEAPONS del jugador).

// aim: cuadros que apunta (el lanzallamas avisa ~36) · cd: cuánto más tarda en volver a tirar · rango: a qué
// distancia se para · alcance: hasta dónde tira · suelta: munición que deja al morir (una caja da WEAPONS[w].ammo)
const ARM_W={
  heavy:  {aim:24,cd:1.4,rango:[80,150],alcance:999,suelta:60},
  shotgun:{aim:26,cd:1.3,rango:[44,62], alcance:78, suelta:8},
  flame:  {aim:36,cd:1.6,rango:[26,34], alcance:44, suelta:54},
  rocket: {aim:34,cd:1.8,rango:[100,150],alcance:999,suelta:5}
};
const ARM_TOPE=7;          // nunca más de 7 cosas sueltas en el piso: si se pasa, se va la munición más vieja
const ARM_VIDA=450;        // la munición dura 7,5 s en el piso; parpadea los últimos 2,5 s (más rápido el último segundo)
const ARM_MAXVIVOS=2;      // como mucho 2 armados a la vez en pantalla (y uno solo con lanzallamas o lanzamisiles)
// qué armas pueden salir según la misión: en la 1, ametralladora y escopeta; desde la 2, lanzamisiles; desde la 3, todas
function ARM_pool(){return levelIdx<1?['heavy','shotgun']:levelIdx<2?['heavy','shotgun','rocket']:['heavy','shotgun','flame','rocket'];}
// cuántos soldados salen armados: 1 de cada 5 en la misión 1, ~1 de cada 3,3 en la 10 (los escuderos, la mitad)
const ARM_prob=()=>0.2+Math.min(levelIdx,9)*0.012;

// ================== a quién le toca un arma ==================
function ARM_armar(e){
  if(e.type!=='soldier'&&e.type!=='shield')return;
  const vivos=enemies.filter(o=>o.arma&&!o.gone);
  if(vivos.length>=ARM_MAXVIVOS)return;
  if(Math.random()>=(e.type==='shield'?ARM_prob()*0.5:ARM_prob()))return;
  // el escudero solo lleva armas de una mano; lanzallamas y lanzamisiles, de a uno
  const pool=(e.type==='shield'?['shotgun','heavy']:ARM_pool()).filter(w=>!((w==='flame'||w==='rocket')&&vivos.some(o=>o.arma===w)));
  if(!pool.length)return;
  const w=pick(pool),a=ARM_W[w];
  e.arma=w;e.raf=0;e.range=rand(a.rango[0],a.rango[1]);e.score+=50;
}
const ARM_puede=(e,d)=>d<=ARM_W[e.arma].alcance;

// ================== sonidos propios ==================
const ARM_SFX={
  piloto:()=>{tone('triangle',160,480,0.28,0.03);noise(0.32,0.025,3200);},              // se enciende el piloto (aviso)
  bip:()=>{tone('square',980,980,0.05,0.02);later(110,()=>tone('square',980,980,0.05,0.02));}, // el lanzamisiles fija
  escopeta:()=>{const v=vary(0.05);tone('square',260*v,90,0.1,0.035);noise(0.12,0.06,1100*v);},
  cohete:()=>{const v=vary(0.05);tone('sawtooth',140*v,520*v,0.3,0.03);noise(0.3,0.05,1200);}
};
// empieza a apuntar: cada arma avisa a su modo
function ARM_apunta(e){
  if(!onScreen(e,0))return;
  if(e.arma==='flame')ARM_SFX.piloto();
  else if(e.arma==='rocket')ARM_SFX.bip();
}

// ================== disparo ==================
// devuelve true mientras sigue tirando (ráfaga de la ametralladora, chorro del lanzallamas)
function ARM_tira(e,d){
  const w=e.arma,fc=e.face,ex=e.x+e.w/2,sx=ex+fc*(w==='rocket'?12:w==='heavy'?13:11),sy=e.y+(w==='rocket'?7:9);
  const ty=P.y+(P.crouch?11:8);
  switch(w){
  case 'heavy':{ // ráfaga de 3, un poco más rápida que la bala común
    if(!e.raf)e.raf=3;
    const sp=2.4,tt=Math.max(1,d/sp);
    eproj.push({kind:'bullet',x:sx,y:sy,vx:fc*sp,vy:clamp((ty-sy)/tt,-0.9,0.9)+rand(-0.05,0.05),g:0,r:1.5,t:0});
    SFX.eshoot();parts.push({k:'flash',x:sx,y:sy,life:3,maxl:3,size:3});e.rec=1;
    parts.push({k:'shell',x:ex,y:e.y+9,vx:-fc*rand(0.5,1.1),vy:rand(-2,-1.1),g:0.18,life:rand(40,55),maxl:55,col:'#e8c25a'});
    if(--e.raf>0){e.t=6;return true;}
    return false;}
  case 'shotgun':{ // abanico de 3 perdigones que se apagan enseguida (poco alcance)
    const a0=Math.atan2(clamp(ty-sy,-20,20),fc*Math.max(20,d));
    for(const da of[-0.24,0,0.24]){const a=a0+da,sp=rand(2.5,2.8);
      eproj.push({kind:'perdigon',x:sx,y:sy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,rad:1.1,life:26,t:0,upd:ARM_updPerdigon,draw:ARM_dibPerdigon});}
    ARM_SFX.escopeta();e.rec=2.2;
    parts.push({k:'flash',x:sx,y:sy,life:3,maxl:3,size:4.5});
    for(let i=0;i<3;i++)parts.push({k:'smoke',col:'200,195,190',x:sx+fc*i*2,y:sy,vx:fc*rand(0.2,0.5),vy:rand(-0.35,-0.15),life:rand(22,34),maxl:34,size:rand(1.2,2)});
    return false;}
  case 'flame':{ // chorro corto: 12 bocanadas en ~24 cuadros, llegan a unos 40 px
    if(!e.raf)e.raf=12;
    eproj.push({kind:'fuego',x:sx,y:sy,vx:fc*rand(2.8,3.2),vy:rand(-0.18,0.08),rad:1.2,rmax:3.2,drag:0.92,rise:-0.012,life:22,maxl:22,t:0,upd:updFlame,draw:drawFlame});
    if(e.raf%2===0)SFX.flame();
    if(--e.raf>0){e.t=2;return true;}
    return false;}
  case 'rocket':{ // cohete lento que acelera: se esquiva saltando y se puede derribar a tiros
    const vy=clamp((ty-sy)/Math.max(60,d),-0.3,0.3);
    eproj.push({kind:'ecohete',x:sx,y:sy,vx:fc*0.6,vy,r:2.5,blast:14,t:0,upd:ARM_updCohete,draw:ARM_dibCohete});
    ARM_SFX.cohete();e.rec=2.5;
    parts.push({k:'flash',x:ex-fc*8,y:sy,life:3,maxl:3,size:3});
    for(let i=0;i<4;i++)parts.push({k:'smoke',col:'190,185,180',x:ex-fc*(7+i*2),y:sy+rand(-1,1),vx:-fc*rand(0.3,0.8),vy:rand(-0.35,-0.1),life:rand(20,32),maxl:32,size:rand(1.5,2.5)});
    return false;}
  }
  return false;
}
// proyectiles propios (combate.js: updProjectiles llama upd(b,hb) con P = el jugador vivo más cercano)
function ARM_updPerdigon(b,hb){
  b.t++;b.vx*=0.985;b.vy*=0.985;b.x+=b.vx;b.y+=b.vy;
  if(--b.life<=0||b.y>GROUND){b.gone=true;if(b.y>GROUND-3)dust(b.x,GROUND,1);return;}
  if(coverBlocks({x:b.x,y:b.y,vx:b.vx,vy:b.vy,r:b.rad,kind:'bullet'})){b.gone=true;spark(b.x,b.y,'#d9c8a0');return;}
  if(hb&&overlapPt(hb,b.x,b.y,b.rad)){b.gone=true;hurtPlayer(1);return;}
  for(const a of allies)if(!a.gone&&overlapPt(a,b.x,b.y,b.rad)){killAlly(a);b.gone=true;return;}
}
function ARM_dibPerdigon(b){const a=b.life/26;ctx.fillStyle=a>0.35?'#ff9a4a':'rgba(255,150,90,0.55)';ctx.fillRect(q(b.x-1.5),q(b.y-1),3,2);
  if(a>0.35){ctx.fillStyle='#fff0c0';ctx.fillRect(q(b.x-0.5),q(b.y-0.5),1,1);}}
function ARM_updCohete(b,hb){
  b.t++;const sp=Math.min(1.9,Math.abs(b.vx)*1.025+0.004);b.vx=Math.sign(b.vx)*sp;b.x+=b.vx;b.y+=b.vy;
  if(b.t%3===0)parts.push({k:'smoke',col:'170,165,160',x:b.x-Math.sign(b.vx)*4,y:b.y,vx:0,vy:-0.12,life:24,maxl:24,size:1.3});
  let boom=b.y>=GROUND-2||b.t>280||coverBlocks({x:b.x,y:b.y,vx:b.vx,vy:b.vy,r:b.r,kind:'ecohete'});
  if(!boom&&hb&&overlapPt(hb,b.x,b.y,b.r))boom=true;
  if(!boom)for(const a of allies)if(!a.gone&&overlapPt(a,b.x,b.y,b.r)){boom=true;break;}
  if(!boom){if(b.x<camX-30||b.x>camX+VW+30)b.gone=true;return;}
  b.gone=true;const y=Math.min(b.y,GROUND-2);explodeFx(b.x,y,b.blast);
  for(const a of allies)if(Math.hypot(a.x+4-b.x,a.y+9-y)<b.blast+4)killAlly(a);
  for(const p of players){if(p.dead)continue;const h=hurtbox(p);if(Math.hypot(h.x+h.w/2-b.x,h.y+h.h/2-y)<b.blast+(p.ride?10:5))withP(p,()=>hurtPlayer(1));}
}
function ARM_dibCohete(b){
  const f=Math.sign(b.vx)||1;ctx.save();ctx.translate(q(b.x),q(b.y));ctx.scale(f,1);
  ctx.fillStyle='#120c18';ctx.fillRect(-4.5,-1.5,9,3);
  ctx.fillStyle='#6a7444';ctx.fillRect(-4,-1,7,2);ctx.fillStyle='#d93a2b';ctx.fillRect(3,-1,1.5,2);
  ctx.fillStyle='#2a2a30';ctx.fillRect(-4,-2,1.5,1);ctx.fillRect(-4,1,1.5,1);
  ctx.fillStyle=(T>>1)%2?'#ffd25a':'#ff7a2a';ctx.fillRect(-6.5,-0.7,2,1.4);
  ctx.restore();
}

// ================== dibujo del arma en las manos ==================
// cx: centro del torso · y: arriba del soldado · gy: altura del arma (sube al apuntar). Se dibuja mirando a e.face.
function ARM_dibArma(e,cx,y,gy){
  const fc=e.face,gx=(fc>0?cx+1:cx-1)-fc*(e.rec||0),wh=e.flash>0,yy=y+gy;
  const R=(x0,y0,w,h,col)=>{ctx.fillStyle=wh?'#fff':col;ctx.fillRect(q(fc>0?gx+x0:gx-x0-w),q(yy+y0),w,h);};
  const aiming=e.state==='aim',k=aiming?clamp(1-e.t/ARM_W[e.arma].aim,0,1):0;
  switch(e.arma){
  case 'heavy': // larga y verde oliva, con caja de cinta y franja naranja
    R(-1,-0.5,13,3,'#3b3f2a');R(0,-0.5,11,1,'#6a7444');R(11,0,2,2,'#1d1d22');R(7,-0.5,2,1,'#e07a2c');
    R(2,2.5,3,2.5,'#6b5a2a');R(2.5,5,1,1,'#e8c25a');R(1,5.5,1,1,'#e8c25a');
    if(aiming&&e.t<10&&!e.raf&&(T>>1)%2)R(14,0,1.5,1.5,'#ff4130');
    break;
  case 'shotgun': // culata de madera, caño corto y gordo; cartuchera roja cruzada en el pecho
    R(-4,0,4,2,'#6b4423');R(0,-0.5,11,2,'#2b2b33');R(0,-0.5,11,0.8,'#4a4a56');R(4,1.5,4,1.3,'#8a5a30');
    ctx.fillStyle=wh?'#fff':'#d93a2b';for(let i=0;i<3;i++)ctx.fillRect(q(cx-fc*(2-i*1.5)),q(y+7.5+i),1,1);
    if(aiming&&e.t<10&&(T>>1)%2)R(11.5,0,1.5,1.5,'#ff4130');
    break;
  case 'flame':{ // tanque rojo en la espalda, manguera y boquilla con piloto
    R(-10,-7,3,8,'#b8401e');R(-10,-7,1,8,'#e06a3a');R(-10,-3,3,1,'#6a2a18');R(-9.5,-8,2,1,'#2a2a30');R(-8,1,8,1,'#2a2a30');
    R(0,-0.5,10,2,'#4a4a52');R(9,-1,2,3,'#2a2a30');
    const nx=fc>0?gx+11.5:gx-11.5,ny=yy+0.5;
    if(e.raf>0){ctx.fillStyle='rgba(255,150,60,0.5)';circle(nx,ny,2.5);} // está tirando
    else if(aiming){ // aviso: el piloto crece de azul a naranja y chisporrotea
      ctx.fillStyle=`rgba(255,${Math.round(190-k*90)},60,${0.25+k*0.35})`;circle(nx,ny,1.2+k*2.6);
      ctx.fillStyle=k<0.5?'#7ab8ff':(T>>1)%2?'#ffd25a':'#ff7a2a';circle(nx,ny,0.8+k*1.2);
      if(T%5===0)parts.push({k:'p',x:nx,y:ny,vx:fc*rand(0.2,0.9),vy:rand(-1.2,-0.3),g:0.05,life:rand(8,14),maxl:14,size:1,col:k<0.5?'#bfe0ff':'#ffd25a'});
    }else if((T>>2)%2){ctx.fillStyle='#7ab8ff';ctx.fillRect(q(nx-0.5),q(ny-0.5),1,1);}
    break;}
  case 'rocket':{ // tubo al hombro, más largo que todo; la punta roja se ve cuando está cargado
    R(-6,-4,16,4,'#55603a');R(-5,-4,14,1,'#7f8c52');R(-6,-4,1,4,'#2a2a30');R(9,-4,1,4,'#2a2a30');R(2,-5.5,2,1.5,'#1d1d22');
    if(aiming||e.cd<40)R(10,-3.5,2,3,aiming&&(T>>2)%2?'#ff8a6a':'#d93a2b');
    break;}
  }
}

// ================== munición en el piso ==================
// Al morir suelta una caja de la munición de su arma. Se levanta tocándola (cualquiera de los 2 jugadores),
// como los premios de siempre (juego.js → collect). Dura ARM_VIDA y parpadea antes de irse.
const ARM_LETRA={heavy:'H',shotgun:'S',flame:'F',rocket:'R'};
function ARM_poof(k){for(let i=0;i<4;i++)parts.push({k:'smoke',col:'200,195,190',x:k.x+5+rand(-3,3),y:k.y+6,vx:rand(-0.3,0.3),vy:rand(-0.5,-0.2),life:rand(16,24),maxl:24,size:rand(1.2,2)});}
function ARM_soltar(e){
  const w=e.arma;if(!w||state!=='play')return;
  // tope: si ya hay muchas cosas en el piso, se va la munición más vieja (las vidas y los premios de cajas no)
  let n=pickups.filter(k=>!k.gone).length;
  while(n>=ARM_TOPE){const k=pickups.find(o=>o.mun&&!o.gone);if(!k)return;k.gone=true;ARM_poof(k);n--;}
  pickups.push({kind:ARM_LETRA[w],arma:w,mun:1,amt:ARM_W[w].suelta,x:e.x+e.w/2-5,y:Math.min(e.y+4,GROUND-12),w:10,h:10,vy:-2.4,life:ARM_VIDA,ph:(Math.random()*60)|0,draw:ARM_dibMun});
}
// cajita de munición: una por arma, con su color (el mismo de las letras de las cajas)
function ARM_dibMun(k){
  if(k.life<150&&(k.life<60?(T>>1)%2:(T>>2)%2))return; // parpadea al final
  const bob=k.vy===0?Math.round(Math.sin((T+k.ph)/9)):0,x=Math.round(k.x),y=Math.round(k.y)+bob+2,col=PICKCOL[k.kind];
  // brillo suave para que se lea como algo que se agarra
  if(((T+k.ph)%50)<25){ctx.fillStyle='rgba(255,240,180,0.18)';circle(x+5,y+3.5,7);}
  ctx.fillStyle='#120c18';ctx.fillRect(x-1,y-1,12,9);
  switch(k.arma){
  case 'heavy': // caja verde con la cinta de balas arriba
    ctx.fillStyle='#4d5a34';ctx.fillRect(x,y+2,10,5);ctx.fillStyle='#6a7444';ctx.fillRect(x,y+2,10,1);
    ctx.fillStyle='#e8c25a';for(let i=0;i<5;i++)ctx.fillRect(x+1+i*2,y,1,2);ctx.fillStyle='#8a6a2a';ctx.fillRect(x,y+1,10,1);break;
  case 'shotgun': // tres cartuchos rojos parados
    ctx.fillStyle='#120c18';ctx.fillRect(x,y,10,2);
    for(let i=0;i<3;i++){ctx.fillStyle='#d93a2b';ctx.fillRect(x+1+i*3,y,2,5);ctx.fillStyle='#ff7a6a';ctx.fillRect(x+1+i*3,y,1,5);ctx.fillStyle='#d9a43a';ctx.fillRect(x+1+i*3,y+5,2,2);}break;
  case 'flame': // bidón de combustible con una llamita
    ctx.fillStyle='#b8401e';ctx.fillRect(x+1,y+1,8,6);ctx.fillStyle='#e06a3a';ctx.fillRect(x+1,y+1,1,6);ctx.fillStyle='#2a2a30';ctx.fillRect(x+6,y,2,1);
    ctx.fillStyle=(T>>2)%2?'#ffd25a':'#ff9a3c';ctx.fillRect(x+4,y+3,2,2);ctx.fillRect(x+4.5,y+2,1,1);break;
  case 'rocket': // dos cohetes acostados
    for(let i=0;i<2;i++){const yy=y+1+i*3;ctx.fillStyle='#6a7444';ctx.fillRect(x,yy,8,2);ctx.fillStyle='#d93a2b';ctx.fillRect(x+8,yy,2,2);ctx.fillStyle='#2a2a30';ctx.fillRect(x,yy,1,2);}break;
  }
  ctx.fillStyle=col;ctx.fillRect(x,y+7,10,1); // franja del color de su letra
}
// la munición que se va sola se deshace en humito
ON_STEP.push(()=>{for(const k of pickups)if(k.mun&&!k.gone&&k.life<=1)ARM_poof(k);});
