'use strict';
// Óxido · Enemigos comunes: soldados, drones y torretas
function mkSoldier(x,y,kind){const g=kind==='grenadier',sh=kind==='shield';
  return{type:kind,x,y,w:8,h:18,vx:0,vy:0,hp:g||sh?3:2,face:-1,state:'walk',t:0,cd:rand(50,110)*(sh?1.3:1),range:sh?rand(40,90):rand(60,150),spd:sh?0.45:0.65,
    flash:0,sflash:0,shp:sh?8:0,onGround:false,plat:null,anim:0,dist:0,lean:0,rec:0,raise:0,post:0,jcd:0,ph:(Math.random()*600)|0,score:g?150:sh?250:100};}
function mkDrone(x,y){return{type:'drone',x,y,baseY:y,w:16,h:9,hp:3,t:rand(0,100),cd:60,flash:0,score:200};}
function mkTurret(x){return{type:'turret',x,y:GROUND-16,w:22,h:16,hp:14,cd:80,burst:0,bt:0,flash:0,score:500,ang:-Math.PI*0.95};}
function updEnemy(e){
  if(e.flash>0)e.flash--;if(e.sflash>0)e.sflash--;
  const px=P.x+4,ex=e.x+e.w/2;
  switch(e.type){
  case 'soldier':case 'grenadier':case 'shield':{
    const wasAir=!e.onGround;
    if(!e.air)e.face=px<ex?-1:1;
    const d=Math.abs(px-ex);
    if(e.jcd>0)e.jcd--;
    if(e.air&&!e.onGround){/* en el aire después de un salto o de bajarse: conserva el impulso */}
    else if(e.state==='walk'){
      // se acerca hasta su distancia de tiro; si el jugador se le pone encima, retrocede
      e.vx=d>e.range?e.face*e.spd:d<30?-e.face*e.spd:0;
      if(e.onGround)e.air=false;
      chaseStep(e,px,ex);
      // nunca se queda fuera de pantalla: primero entra, después pelea
      if(e.x<camX+6)e.vx=0.65;else if(e.x>camX+W-14)e.vx=-0.65;
      if(!P.dead&&onScreen(e,-6))e.cd--;
      // armados (armados.js): la escopeta y el lanzallamas solo tiran de cerca; cada arma apunta su tiempo y avisa
      if(e.cd<=0&&e.onGround&&!e.air&&(!e.arma||ARM_puede(e,d))){e.state='aim';e.t=e.type==='grenadier'?30:e.arma?ARM_W[e.arma].aim:26;if(e.arma)ARM_apunta(e);}
    }else{
      e.vx=0;
      if(--e.t<=0){
        let sigue=false; // ráfaga o chorro de fuego: sigue apuntando hasta terminar
        if(e.type==='grenadier'){eproj.push({kind:'egren',x:ex,y:e.y+4,vx:e.face*clamp(d/45,0.8,2.6),vy:-3.2,g:0.14,r:2.5,blast:16,t:0});SFX.toss();}
        else if(e.arma)sigue=ARM_tira(e,d);
        else{const sx=ex+e.face*8,sy=e.y+9,dy=(P.y+(P.crouch?11:8))-sy,sp=2.1,tt=Math.max(1,d/sp);
          eproj.push({kind:'bullet',x:sx,y:sy,vx:e.face*sp,vy:clamp(dy/tt,-0.9,0.9),g:0,r:1.6,t:0});SFX.eshoot();
          parts.push({k:'flash',x:sx,y:sy,life:3,maxl:3,size:3});e.rec=1.3;}
        if(!sigue){e.state='walk';e.post=e.type==='grenadier'?9:8;e.cd=rand(70,140)*(e.type==='shield'?1.3:1)*DIFF().fire*(e.arma?ARM_W[e.arma].cd:1);}
      }
    }
    // el arma sube en ~4 cuadros al apuntar, se sostiene un instante después del tiro y baja
    if(e.state==='aim')e.raise=Math.min(1,e.raise+0.28);else if(e.post>0)e.post--;else e.raise=Math.max(0,e.raise-0.25);
    if(e.vx)e.anim++;
    if(e.kbx){e.x+=e.kbx;e.kbx*=0.5;if(Math.abs(e.kbx)<0.15)e.kbx=0;} // retroceso al recibir un golpe
    e.x+=e.vx*(L.speedMul?L.speedMul(e):1);const pb=e.y+e.h;e.vy=Math.min(e.vy+0.32,6);e.y+=e.vy;const vyA=e.vy;land(e,pb,true);
    if(wasAir&&e.onGround&&e.air){
      e.air=false;e.jcd=(e.jcd|0)+rand(16,26)|0;
      if(e.jy!==undefined){if(e.y+e.h>=e.jy-2&&++e.jfail>=2){e.jfail=0;e.jcd=150;}else if(e.y+e.h<e.jy-2)e.jfail=0;e.jy=undefined;}
    }
    if(e.plat&&!e.drop)e.x=clamp(e.x,e.plat.x,e.plat.x+e.plat.w-e.w);
    animStep(e,wasAir,vyA);
    if(e.x<camX-60)e.gone=true;
    break;}
  case 'drone':{
    e.t++;const tx=px+Math.sin(e.t/70)*50;
    e.x+=clamp(tx-ex,-1,1)*0.8;
    if(e.kbx){e.x+=e.kbx;e.kby=(e.kby||0)+Math.abs(e.kbx)*0.4;e.kbx*=0.5;if(Math.abs(e.kbx)<0.15)e.kbx=0;}
    if(e.kby){e.kby*=0.7;if(e.kby<0.1)e.kby=0;}
    e.y=e.baseY+Math.sin(e.t/18)*4-(e.kby||0);
    // una vez que entra en pantalla, no se escapa (siempre se le puede disparar)
    if(e.x>camX+4&&e.x<camX+W-20)e.seen=true;
    if(e.seen)e.x=clamp(e.x,camX+4,camX+W-20);
    if(e.cd>0)e.cd--;
    if(Math.abs(px-ex)<16&&e.cd<=0&&onScreen(e,-4)&&!P.dead){eproj.push({kind:'bomb',x:ex,y:e.y+e.h,vx:0,vy:0.6,g:0.09,r:2.5,blast:14,t:0});e.cd=85;SFX.toss();}
    break;}
  case 'turret':{
    if(!onScreen(e,-10)||P.dead)break;
    const cx=e.x+11,cy=e.y+5;let a=Math.atan2(P.y+9-cy,px-cx);
    if(a>0)a=a<Math.PI/2?0:-Math.PI;
    e.ang+=clamp(angDiff(a,e.ang),-0.05,0.05);
    if(e.burst>0){if(--e.bt<=0){
        eproj.push({kind:'bullet',x:cx+Math.cos(e.ang)*10,y:cy+Math.sin(e.ang)*10,vx:Math.cos(e.ang)*2.2,vy:Math.sin(e.ang)*2.2,g:0,r:1.6,t:0});
        SFX.eshoot();e.burst--;e.bt=9;}}
    else if(--e.cd<=0){e.burst=3;e.bt=0;e.cd=110;}
    break;}
  default:if(e.upd)e.upd(e);else if(isBoss(e))updBossAny(e);
  }
}
// Persecución por escalones: si el jugador está más arriba y cerca, va al escalón siguiente y salta
// (de a uno, con una pausa corta entre saltos); si está más abajo, se baja por el borde.
function chaseStep(e,px,ex){
  e.drop=false;
  if(P.dead||!e.onGround||!onScreen(e,-6)){e.chaseT=0;return;}
  if(e.jcd>0){if(e.jcd>10&&e.chased)e.vx=0;return;}
  const pr=P.ride,pfy=pr?pr.y+pr.h:P.y+P.h,efy=e.y+e.h,dx=Math.abs(px-ex);
  e.chased=false;
  if(pfy<efy-8&&dx<120){
    let best=null,bs=1e9;
    for(const pl of platforms){
      const h=efy-pl.y;if(h<6||h>48||pl.y<pfy-4)continue;
      if(pl.x+pl.w<camX+4||pl.x>camX+W-4)continue;
      const lo=pl.x+2,hi=pl.x+pl.w-e.w-2;if(hi<lo)continue;
      const tx=clamp(e.x,lo,hi),gap=Math.abs(tx-e.x);
      if(gap>130||(gap>2&&Math.sign(tx-e.x)!==Math.sign(px-ex)))continue;
      const sc=h+gap*0.6;if(sc<bs){bs=sc;best={pl,tx,h,gap,lo,hi};}
    }
    if(!best){e.chaseT=0;return;}
    const dir=Math.sign(best.tx-e.x),pl=e.plat;
    const atEdge=pl&&((dir>0&&e.x>=pl.x+pl.w-e.w-0.6)||(dir<0&&e.x<=pl.x+0.6));
    e.chased=true;
    if(best.gap<=3||atEdge){
      // salto calculado para caer adentro del escalón
      // impulso justo para pasar el borde con aire (tope el del jugador, 5.8)
      const v=Math.min(5.8,Math.sqrt(0.64*(best.h+14))),t=(v+Math.sqrt(Math.max(0,v*v-0.64*best.h)))/0.32;
      const aim=clamp(best.tx+dir*4,best.lo,best.hi);
      e.vy=-v;e.vx=clamp((aim-e.x)/t,-1.3,1.3);e.onGround=false;e.plat=null;e.air=true;
      e.jy=efy;e.jfail=e.jfail|0;e.chaseT=0;dust(ex,efy,3);
    }else{
      e.vx=dir*Math.max(e.spd,0.6);
      if(++e.chaseT>150){e.chaseT=0;e.jcd=120;}
    }
  }else if(pfy>efy+8&&e.plat&&dx<120){
    // bajarse: camina hacia el borde del lado del jugador y se deja caer
    const pl=e.plat,mid=pl.x+pl.w/2;
    const dir=dx>6?Math.sign(px-ex):(ex<mid?-1:1);
    e.vx=dir*Math.max(e.spd,0.6);e.drop=true;e.chased=true;
    if((dir>0&&e.x+e.vx>pl.x+pl.w-2)||(dir<0&&e.x+e.vx+e.w<pl.x+2))e.air=true;
  }else e.chaseT=0;
}
function drawSoldier(e){
  const set=e.flash?SPR.w:(e.type==='grenadier'?SPR.g:e.type==='shield'?SPR.sh:SPR.e),f=e.face>0?0:1;
  const pose=rigPose(e,e.ph);drawRig(set,pose,f,e.x-3,e.y);
  const cx=e.x+4+pose.ux,y=e.y+pose.uy,fc=e.face;
  if(e.type==='soldier'||e.type==='shield'){
    const gy=11-Math.round(e.raise*2),bx=(fc>0?cx+1:cx-9)-fc*(e.rec||0);
    if(e.arma)ARM_dibArma(e,cx,y,gy); // armados.js: escopeta, ametralladora, lanzallamas o lanzamisiles
    else{ctx.fillStyle='#26262c';ctx.fillRect(q(bx),q(y+gy),8,2);}
    ctx.fillStyle=e.flash?'#fff':PAL_E.s;ctx.fillRect(q(fc>0?cx+1:cx-3),q(y+gy+0.5),2,1.5);
    if(!e.arma&&e.state==='aim'&&e.t<10&&(T>>1)%2){ctx.fillStyle='#ff4130';ctx.fillRect(q(fc>0?cx+9:cx-10),q(y+gy),1.5,1.5);}}
  else{
    // granadero: echa el brazo atrás mientras apunta y lo lleva adelante al tirar
    let hx=null,hy=0,gren=false;
    if(e.state==='aim'){const k=clamp(1-e.t/30,0,1)*1.4;const kk=Math.min(1,k);hx=Math.round(3-kk*7);hy=Math.round(9-kk*8);gren=true;}
    else if(e.post>0){hx=5;hy=6;}
    if(hx!==null){
      const sl=e.flash?'#fff':'#454157';ctx.fillStyle=sl;
      for(let i=1;i<=3;i++)ctx.fillRect(q(cx+fc*hx*i/4-0.5),q(y+8+(hy-8)*i/4-0.5),1.5,1.5);
      if(gren){ctx.fillStyle='#4a5a34';circle(cx+fc*hx,y+hy,2.2);}
    }
  }
  if(e.type==='shield'&&e.shp>0){
    const sx=(e.face>0?e.x+7:e.x-2.5)+pose.ux;
    if(e.shp<=4){ctx.fillStyle='#120c18';ctx.fillRect(q(sx+1),q(y+6),0.8,5);ctx.fillRect(q(sx+1.8),q(y+11),0.8,4);}
    ctx.fillStyle='#120c18';ctx.fillRect(q(sx-0.5),q(y+3.5),4.5,15);
    ctx.fillStyle=e.sflash?'#e8f6ff':'#7d8794';ctx.fillRect(q(sx),q(y+4),3.5,14);
    ctx.fillStyle='#d9a43a';ctx.fillRect(q(sx),q(y+9),3.5,1.2);ctx.fillStyle='rgba(255,255,255,0.4)';ctx.fillRect(q(sx),q(y+4),1,14);
    ctx.fillStyle='rgba(180,220,255,0.6)';ctx.fillRect(q(sx+0.8),q(y+5.5),2,1.5);
  }
}
function drawDrone(e){
  const x=q(e.x),y=q(e.y),w=e.flash>0,wk=e.wreck;
  ctx.fillStyle='#1a1a20';ctx.fillRect(x,y+1,16,1);ctx.fillRect(x+1,y,1,2);ctx.fillRect(x+14,y,1,2);
  if(!wk){const rw=(T>>1)%2?7:3;ctx.fillStyle='rgba(225,225,235,0.75)';ctx.fillRect(x+1.5-rw/2,y-0.5,rw,1);ctx.fillRect(x+14.5-rw/2,y-0.5,rw,1);}
  ctx.fillStyle=w?'#fff':wk?'#22232a':'#2f303a';ctx.fillRect(x+2,y+3,12,4);ctx.fillRect(x+4,y+2,8,7);
  ctx.fillStyle=w?'#fff':wk?'#3a3c48':'#5c5f70';ctx.fillRect(x+4,y+2,8,1);
  if(wk){ctx.fillStyle=(T>>2)%2?'#ff8a2a':'#5a1e18';ctx.fillRect(x+7,y+5,2,2);}
  else{const near=players.some(p=>Math.abs(p.x+4-(e.x+8))<20);ctx.fillStyle=near&&(T>>2)%2?'#ffd0c0':'#ff3b30';ctx.fillRect(x+7,y+5,2,2);}
  ctx.fillStyle='#1a1a20';ctx.fillRect(x+5,y+9,1,1.5);ctx.fillRect(x+10,y+9,1,1.5);
}
function drawTurret(e){
  const x=e.x,y=e.y,w=e.flash>0,cx=x+11,cy=y+5;
  ctx.strokeStyle='#2a2a2e';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(e.ang)*11,cy+Math.sin(e.ang)*11);ctx.stroke();
  ctx.fillStyle=w?'#fff':'#55504b';circle(cx,cy,5.5);
  ctx.fillStyle=w?'#fff':'#6f6a64';ctx.fillRect(x,y+4,22,12);
  ctx.fillStyle=w?'#fff':'#8a847c';ctx.fillRect(x-1,y+3,24,2);
  ctx.fillStyle='#1d1a1c';ctx.fillRect(x+4,y+7,14,2);
  for(let i=0;i<7;i++){ctx.fillStyle=i%2?'#1d1a1c':'#d9a43a';ctx.fillRect(x+i*3+0.5,y+13,3,3);}
  ctx.fillStyle=e.burst>0&&(T>>1)%2?'#fff':'#ff3b30';ctx.fillRect(x+10,y+7.5,2,1);
}
// ================== drones derribados ==================
// el dron no revienta en el aire: chispazo, cae girando con humo y explota contra el suelo (solo efecto, no daña)
const wrecks=[];
function droneDown(e){
  const x=e.x+e.w/2,y=e.y+e.h/2;SFX.hit();SFX.fall();
  parts.push({k:'flash',x,y,life:3,maxl:3,size:6});
  for(let i=0;i<5;i++){const a=rand(0,6.28);parts.push({k:'fire',x,y,vx:Math.cos(a)*0.8,vy:Math.sin(a)*0.8-0.3,life:rand(10,18),maxl:28,size:rand(2,3)});}
  spark(x,y,'#ffd25a');
  wrecks.push({x,y,vx:(e.kbx||0)*0.5+rand(-0.5,0.5),vy:-1.3,rot:0,vr:rand(0.16,0.28)*(Math.random()<0.5?-1:1),t:0});
}
function updWrecks(){
  for(const w of wrecks){
    w.t++;w.vy=Math.min(w.vy+0.16,5);w.x+=w.vx;w.y+=w.vy;w.rot+=w.vr;
    if(w.t%3===0)parts.push({k:'smoke',x:w.x,y:w.y,vx:rand(-0.2,0.2),vy:rand(-0.4,-0.1),life:rand(18,28),maxl:28,size:rand(1.5,2.5)});
    if(w.t%4===0)parts.push({k:'fire',x:w.x+rand(-2,2),y:w.y,vx:0,vy:-0.3,life:10,maxl:28,size:2});
    let gy=GROUND-3,hit=w.y>=gy;
    if(!hit&&w.vy>0)for(const pl of platforms)if(w.x>pl.x&&w.x<pl.x+pl.w&&w.y+3>=pl.y&&w.y+3-w.vy<pl.y){hit=true;gy=pl.y-3;break;}
    if(hit){w.gone=true;explodeFx(w.x,gy,13);if(gy>=GROUND-3)dust(w.x,GROUND,5);
      for(let i=0;i<4;i++)parts.push({k:'p',x:w.x,y:gy,vx:rand(-1.6,1.6),vy:rand(-2.6,-1),g:0.17,life:rand(30,50),maxl:50,size:i%2?2:1,col:i%2?'#2f303a':'#5c5f70'});}
    else if(w.t>240||w.x<camX-40)w.gone=true;
  }
  for(let i=wrecks.length;i--;)if(wrecks[i].gone)wrecks.splice(i,1);
}
function drawWrecks(){for(const w of wrecks){ctx.save();ctx.translate(q(w.x),q(w.y));ctx.rotate(w.rot);drawDrone({x:-8,y:-4.5,flash:0,wreck:true});ctx.restore();}}
ON_STEP.push(updWrecks);ON_DRAW.push(drawWrecks);ON_START.push(()=>{wrecks.length=0;});
