'use strict';
// Óxido · Entradas: cada personaje aparece (al empezar la misión o al revivir) con una gracia que sale de su pasatiempo
// de espera (espera.js), y esa gracia despeja el lugar para que no te maten apenas volvés.
//   LAUTI (fútbol): cae, festeja deslizándose de rodillas con los brazos abiertos, se acomoda la pelota y la patea como un
//     misil. La pelota atraviesa al primero, le pega, rebota y puede tocar a dos más. Al primer golpe: "¡gol!" de tribuna.
//   JOSÉ (tablet): se arma de píxeles de abajo para arriba con una barrita de carga, levanta la tablet y saca una foto:
//     el flash congela 1,5 s a los enemigos cerca (quedan quietos, con un marco de color). No les hace daño.
//   FACU (compu): baja "descargándose" (líneas de datos, barrita y %), tipea en un teclado que flota y aprieta Enter:
//     las máquinas cerca (drones, torretas, robots, vigías) fallan 2 s: no disparan y se ven con fallas. Soldados: nada.
// Reglas: dura como mucho 1,5 s. Sos invencible, dentro de la invencibilidad que ya da el revivir (no se suma).
// El efecto sale solo si hay enemigos cerca. A jefes y villanos solo los frena 0,5 s; la pelota les hace poco daño.
// Cualquier botón saltea lo decorativo: el efecto sale en ese momento y el botón se usa en el mismo cuadro.
// Se mete en el juego envolviendo updPlayer, drawPlayer, respawnPlayer y updEnemy. Prefijo EN_.
let EN_off=false;                                     // para pruebas: sin entradas
const EN_MAX=88;                                      // tope de cuadros (< 1,5 s)
const EN_GRACIA=20;                                   // un botón que ya venías apretando saltea recién después de esto
const EN_ACC=['left','right','up','down','jump','shoot','bomb','swap','air'];
const EN_stats={entradas:0,saltadas:0,pelotaGolpes:0,congelados:0,hackeados:0,jefesFrenados:0};
const EN_balls=[],EN_fx=[];
const EN_PIEL=['#efb88d','#c98a5e','#f0b48a'],EN_CELESTE='#74bde8',EN_VERDE='92,255,154',EN_ROSA='255,122,217';
const EN_snd=f=>{if(typeof tone!=='function')return;try{f();}catch(e){}};

// ---------- dónde cae: simula la caída desde donde está (piso o plataforma) ----------
function EN_suelo(p){
  const o={x:p.x,y:p.y,w:p.w,h:p.h,vy:Math.max(0,p.vy||0),onGround:false,plat:null};
  for(let i=0;i<400;i++){const pb=o.y+o.h;o.vy=Math.min(o.vy+0.32,6);o.y+=o.vy;land(o,pb,true);if(o.onGround)break;}
  return{y:o.onGround?o.y:GROUND-p.h,plat:o.plat};
}
const EN_centro=e=>({x:e.x+e.w/2,y:e.y+e.h/2});
// enemigos que el efecto puede tocar: en pantalla, a tiro y cerca del jugador
function EN_cerca(p,r){
  const cx=p.x+4,cy=p.y+9,out=[];
  for(const e of enemies){if(!hittable(e)||!onScreen(e,0))continue;const c=EN_centro(e);if(Math.hypot(c.x-cx,c.y-cy)<r)out.push(e);}
  return out;
}
const EN_MAQ=new Set(['drone','turret','vigia']);
const EN_maquina=e=>EN_MAQ.has(e.type)||!!e.endo||/dron|robot|torret/i.test(e.type);

// ---------- empezar y terminar ----------
function EN_empezar(p,why){
  if(EN_off||p.dead||p.ride)return;
  const g=EN_suelo(p),en={t:0,ft:0,ci:p.ci,why,fase:'',fx:false,hold:{},gy:g.y,gpl:g.plat};
  for(const a of EN_ACC)en.hold[a]=held(a);
  p.vx=0;p.crouch=false;
  if(p.ci===0){en.fase='baja';p.y=g.y-26;p.vy=0;p.onGround=false;p.plat=null;}
  else if(p.ci===1){en.fase='arma';p.y=g.y;p.vy=0;p.onGround=true;p.plat=g.plat;EN_snd(()=>tone('square',392,392,0.03,0.012));}
  else{en.fase='cae';p.y=Math.min(-24,g.y-40);p.vy=4;p.onGround=false;p.plat=null;}
  en.lx=p.x;en.ly=p.y;
  p.en=en;EN_stats.entradas++;
}
function EN_fin(p,cancel){
  const en=p.en;if(!en)return;p.en=null;
  if(!cancel&&!en.fx)EN_efecto(p,en,true);
  p.crouch=false;p.vx=0;p.lean=0;
  if(!p.onGround&&en.ci===0)p.vy=0;
}
// ¿el jugador quiere jugar? un botón nuevo saltea al toque; uno que venía apretado, después de la gracia
function EN_quiere(en){
  for(const a of EN_ACC){
    if(tapped(a))return true;
    const h=held(a);
    if(!h)en.hold[a]=false;
    else if(!en.hold[a]||en.t>EN_GRACIA)return true;
  }
  return false;
}
function EN_efecto(p,en,salteo){
  en.fx=true;
  if(en.ci===0)EN_hackear(p);else if(en.ci===1)EN_foto(p);else EN_patear(p,en,salteo);
}

// ---------- update del jugador durante la entrada ----------
const EN_updPlayer0=updPlayer;
updPlayer=function(){
  const p=P;
  if(p.enPend){const w=p.enPend;p.enPend=null;EN_empezar(p,w);}
  const en=p.en;
  if(!en)return EN_updPlayer0();
  if(p.dead||p.ride||winT){EN_fin(p,true);return EN_updPlayer0();}
  en.t++;
  // si otro código lo movió (p. ej. la roca de la misión 10), la entrada termina y el juego sigue normal
  const movido=Math.abs(p.x-en.lx)>8||Math.abs(p.y-en.ly)>8;
  if(EN_quiere(en)||movido||en.t>=EN_MAX){if(en.t<EN_MAX&&!movido)EN_stats.saltadas++;EN_fin(p);return EN_updPlayer0();}
  // lo mínimo que hace updPlayer cuando no hay entrada (sin leer botones)
  if(shieldRegen&&p.shield<3&&T%900===0){const a=p.shield;p.shield++;SFX.shield();if(typeof RC_sumaJug==='function')RC_sumaJug(p,'sh',a);}
  if(p.fireCd>0)p.fireCd--;
  if(p.inv>0)p.inv--;
  p.inv=Math.max(p.inv,1);
  const wasAir=!p.onGround,vy0=p.vy;
  if(en.ci===0)EN_pasoFacu(p,en);else if(en.ci===1)EN_pasoJose(p,en);else EN_pasoLauti(p,en);
  if(!p.en)return;                                   // terminó en este cuadro
  p.x=clamp(p.x,camX+2,camX+VW-10);
  animStep(p,wasAir,vy0);
  en.lx=p.x;en.ly=p.y;
};
function EN_fase(en,f){en.fase=f;en.ft=0;}
// FACU: baja flotando 26 px mientras se descarga (0–40), tipea (44–70), Enter (70), guarda el teclado y listo (82)
function EN_pasoFacu(p,en){
  p.vx=0;en.fase=en.t<=40?'baja':en.t<70?'tipea':'enter';
  if(en.t<=40){const k=en.t/40,e=1-(1-k)*(1-k);p.y=en.gy-26*(1-e);p.vy=0;p.onGround=false;p.plat=null;}
  else{p.y=en.gy;p.vy=0;p.onGround=true;p.plat=en.gpl;}
  if(en.t<=40&&en.t%10===0&&en.t>0)EN_snd(()=>tone('square',500+en.t*12,500+en.t*12,0.025,0.01));   // avance de la descarga
  if(en.t>46&&en.t<68&&en.t%3===0&&Math.random()<0.85)EN_snd(()=>tone('square',1800+Math.random()*600,1500,0.012,0.008)); // tecleo
  if(en.t===70)EN_efecto(p,en,false);
  if(en.t>=82)EN_fin(p);
}
// JOSÉ: se arma (0–34), levanta la tablet (34–46), foto (50), baja la tablet y listo (80)
function EN_pasoJose(p,en){
  p.vx=0;en.fase=en.t<=34?'arma':en.t<50?'tablet':'foto';p.y=en.gy;p.vy=0;p.onGround=true;p.plat=en.gpl;
  if(en.t<=34&&en.t%9===0&&en.t>0)EN_snd(()=>{const f=392*Math.pow(1.26,en.t/9);tone('square',f,f,0.03,0.012);});
  if(en.t===50)EN_efecto(p,en,false);
  if(en.t>=80)EN_fin(p);
}
// LAUTI: cae, desliza de rodillas, se levanta acomodándose la pelota, la levanta y la patea
function EN_pasoLauti(p,en){
  en.ft++;
  switch(en.fase){
  case 'cae':
    p.vx=0;p.vy=Math.min(p.vy+0.32,6);p.y+=p.vy;
    if(p.y>=en.gy){p.y=en.gy;p.vy=0;p.onGround=true;p.plat=en.gpl;
      const t=EN_blanco(p);if(t)p.face=t.x+t.w/2>p.x+4?1:-1;
      dust(p.x+4,p.y+18,6);EN_snd(()=>tone('sine',120,70,0.06,0.06));
      EN_fase(en,'desliza');en.sv=2.1;en.ang=0;}
    break;
  case 'desliza':
    en.sv*=0.9;p.x+=p.face*en.sv;p.vx=0;en.ang+=en.sv*0.45;
    if(p.plat)p.x=clamp(p.x,p.plat.x-3,p.plat.x+p.plat.w-5);
    if(en.ft%2===0)parts.push({k:'smoke',col:'200,170,120',x:p.x+4-p.face*4,y:p.y+17,vx:-p.face*rand(0.3,0.8),vy:rand(-0.5,-0.1),life:rand(10,16),maxl:16,size:rand(0.8,1.6)});
    if(en.ft>=18){EN_fase(en,'arriba');p.landT=6;en.bx0=ES_fx(p,8);}
    break;
  case 'arriba':                                      // se para y se acomoda la pelota con la suela
    p.vx=0;if(en.ft>=8){EN_fase(en,'toque');EN_snd(()=>tone('sine',180,120,0.05,0.03));}
    break;
  case 'toque':                                       // la levanta un poquito y, cuando baja, volea
    p.vx=0;if(en.ft>=12){EN_fase(en,'patea');EN_efecto(p,en,false);}
    break;
  case 'patea':p.vx=0;if(en.ft>=10)EN_fin(p);break;
  }
}

// ---------- efectos ----------
// LAUTI: el enemigo al que va la pelota (el más cercano en pantalla; prefiere los que tiene adelante)
function EN_blanco(p){
  let best=null,bd=1e9;const cx=p.x+4;
  for(const e of enemies){if(!hittable(e)||!onScreen(e,-2))continue;const d=Math.abs(e.x+e.w/2-cx)+(Math.sign(e.x+e.w/2-cx)!==p.face?40:0);if(d<bd){bd=d;best=e;}}
  return best;
}
function EN_patear(p,en,salteo){
  const t=EN_blanco(p);
  if(t)p.face=t.x+t.w/2>p.x+4?1:-1;
  const bx=ES_fx(p,6),by=p.y+13;
  if(t){
    const c=EN_centro(t),d=Math.max(20,Math.abs(c.x-bx));
    EN_balls.push({m:'misil',x:bx,y:by,vx:p.face*5.2,vy:clamp((c.y-by)/(d/5.2),-1.6,1.6),g:0,ang:0,life:90,hits:new Set(),n:0,tr:[],slot:p.slot});
    EN_snd(()=>{tone('sine',160,55,0.09,0.12);noise(0.05,0.05,1800);});
    kick(p.face*1.2,0);
  }else if(!salteo){                                  // sin nadie cerca: la manda al cielo, de festejo
    EN_balls.push({m:'cielo',x:bx,y:by,vx:p.face*1.1,vy:-5.6,g:0.05,ang:0,life:80,hits:new Set(),n:0,tr:[]});
    EN_snd(()=>tone('sine',150,70,0.07,0.07));
  }else EN_balls.push({m:'suelta',x:ES_fx(p,5),y:p.y+15.4,vx:p.face*0.9,vy:0,g:0,ang:0,life:60,hits:new Set(),n:0,tr:[]});
}
function EN_foto(p){
  const tx=ES_fx(p,7),ty=p.y+6;
  EN_fx.push({k:'flash',x:tx,y:ty,t:0});
  EN_snd(()=>{noise(0.025,0.09,7000);later(55,()=>{try{noise(0.03,0.06,5000);}catch(e){}});tone('sine',2600,1900,0.05,0.018);});
  for(const e of EN_cerca(p,120)){
    if(isBoss(e)){e.enFrz=Math.max(e.enFrz||0,30);EN_stats.jefesFrenados++;}
    else{e.enFrz=Math.max(e.enFrz||0,90);e.enFrzMax=90;EN_stats.congelados++;}
  }
}
function EN_hackear(p){
  EN_fx.push({k:'hack',x:p.x+4,y:p.y+9,t:0});
  EN_snd(()=>{tone('square',880,880,0.04,0.025);later(50,()=>{try{tone('square',1320,1320,0.05,0.022);}catch(e){}});});
  let n=0;
  for(const e of EN_cerca(p,140)){
    if(isBoss(e)){e.enFrz=Math.max(e.enFrz||0,30);EN_stats.jefesFrenados++;n++;}
    else if(EN_maquina(e)){e.enHack=Math.max(e.enHack||0,120);EN_stats.hackeados++;n++;}
  }
  if(n)EN_snd(()=>{later(90,()=>{try{noise(0.12,0.035,4000);tone('sawtooth',1100,180,0.14,0.018);}catch(e){}});});
}
// "¡gol!" de tribuna: ruido filtrado que crece y se apaga, con dos voces abiertas encima (corto y bajito)
function EN_tribuna(){
  if(!actx||muted||!noiseBuf)return;const t=actx.currentTime;
  const s=actx.createBufferSource();s.buffer=noiseBuf;s.loop=true;
  const f=actx.createBiquadFilter();f.type='bandpass';f.frequency.setValueAtTime(650,t);f.frequency.linearRampToValueAtTime(1050,t+0.25);f.Q.value=0.8;
  const g=actx.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.08,t+0.07);g.gain.exponentialRampToValueAtTime(0.001,t+0.7);
  s.connect(f).connect(g).connect(actx.destination);s.start(t,Math.random()*0.3);s.stop(t+0.72);
  for(const [f0,d] of [[294,0],[370,0.025]]){
    const o=actx.createOscillator(),lp=actx.createBiquadFilter(),gg=actx.createGain();o.type='sawtooth';
    o.frequency.setValueAtTime(f0*0.88,t+d);o.frequency.linearRampToValueAtTime(f0,t+d+0.09);o.frequency.linearRampToValueAtTime(f0*0.84,t+d+0.55);
    lp.type='lowpass';lp.frequency.value=850;
    gg.gain.setValueAtTime(0.0001,t+d);gg.gain.exponentialRampToValueAtTime(0.022,t+d+0.06);gg.gain.exponentialRampToValueAtTime(0.001,t+d+0.55);
    o.connect(lp).connect(gg).connect(actx.destination);o.start(t+d);o.stop(t+d+0.6);
  }
}

// ---------- enemigos congelados y hackeados ----------
const EN_updEnemy0=updEnemy;
updEnemy=function(e){
  if(e.enFrz>0){e.enFrz--;if(e.flash>0)e.flash--;return;}       // congelado (o jefe frenado): no se mueve ni dispara
  if(e.enHack>0){e.enHack--;return EN_updHack(e);}
  return EN_updEnemy0(e);
};
// hackeado: se traba a los tirones y lo que dispare no sale (chispa y humito en el caño)
function EN_updHack(e){
  if(Math.random()<0.35){if(e.flash>0)e.flash--;return;}
  const n=eproj.length,m=muted;muted=true;                      // el disparo que no sale tampoco suena
  try{EN_updEnemy0(e);}finally{muted=m;}
  if(eproj.length>n){
    for(let i=n;i<eproj.length;i++){const b=eproj[i];spark(b.x,b.y,'#9fffc0');parts.push({k:'smoke',x:b.x,y:b.y,vx:0,vy:-0.3,life:16,maxl:16,size:1.5});}
    eproj.length=n;
  }
}

// ---------- pelota ----------
function EN_updBalls(){
  for(const b of EN_balls){
    b.life--;b.tr.push(b.x,b.y);if(b.tr.length>14)b.tr.splice(0,2);
    b.vy+=b.g;b.x+=b.vx;b.y+=b.vy;b.ang+=b.vx*0.35;
    if(b.m==='misil'){
      if(T%2===0)parts.push({k:'smoke',col:'235,235,245',x:b.x-b.vx*0.6,y:b.y,vx:0,vy:-0.05,life:12,maxl:12,size:1});
      if(b.n<3)for(const e of enemies){
        if(!hittable(e)||b.hits.has(e)||!overlapPt(e,b.x,b.y,2.6))continue;
        b.hits.add(e);const jefe=isBoss(e),dir=Math.sign(b.vx)||1;
        hitFrom={dir,pow:1.5,fl:1.4,up:b.n===0};killSrc='pelota';
        try{dmg(e,jefe?2:b.n===0?8:5);}finally{hitFrom=null;killSrc=null;}
        EN_stats.pelotaGolpes++;spark(b.x,b.y,'#ffffff',dir);
        if(b.n===0){
          EN_snd(EN_tribuna);
          parts.push({k:'txt',g:'grito',s:'¡GOL!',x:b.x,y:b.y-9,life:50,maxl:50});kick(dir*1.5,-0.5);
        }
        b.n++;
        // atraviesa y rebota; contra un jefe rebota para atrás
        if(jefe){b.vx=-b.vx*0.5;b.vy=-2.6;b.n=3;}else{b.vx*=0.72;b.vy=-2.8;}
        b.g=0.28;b.life=Math.min(b.life,70);
        break;
      }
    }
    if(b.m!=='cielo'&&b.y>=GROUND-2.6&&b.vy>=0){
      b.y=GROUND-2.6;
      if(b.vy>0.9){b.vy=-b.vy*0.55;b.vx*=0.82;EN_snd(()=>tone('sine',190,120,0.04,0.02));}else{b.vy=0;b.vx*=0.94;}
      if(b.m==='misil'&&b.g===0)b.g=0.28;
    }
    if(b.m==='suelta')b.vx*=0.95;
    if(b.life<=0||b.x<camX-12||b.x>camX+VW+12||b.y<-12)b.gone=true;
  }
  for(let i=EN_balls.length;i--;)if(EN_balls[i].gone)EN_balls.splice(i,1);
}
function EN_drawBalls(){
  for(const b of EN_balls){
    const a=b.life<15?b.life/15:1;ctx.globalAlpha=a;
    // estela: un trazo que se afina y se apaga hacia atrás
    const tr=b.tr;
    for(let i=2;i<tr.length;i+=2){const k=i/tr.length;ctx.strokeStyle=`rgba(${b.m==='misil'?'255,250,235':'230,230,240'},${0.55*k*a})`;ctx.lineWidth=0.6+1.6*k;
      ctx.beginPath();ctx.moveTo(tr[i-2],tr[i-1]);ctx.lineTo(tr[i],tr[i+1]);ctx.stroke();}
    if(b.m==='misil'&&b.n===0&&(T>>1)%2){ctx.fillStyle=`rgba(255,240,180,${0.5*a})`;ctx.fillRect(b.x-b.vx*1.4-1,b.y-0.5,2,1);}
    ES_pelota(b.x,b.y,b.ang);
    ctx.globalAlpha=1;
  }
}

// ---------- dibujo de efectos sobre el mundo ----------
function EN_drawEnemy(e){if(e.type==='turret')drawTurret(e);else if(e.draw)e.draw(e);else if(isBoss(e))drawBossAny(e);else if(e.type==='drone')drawDrone(e);else drawSoldier(e);}
function EN_drawMarcas(){
  for(const e of enemies){
    if(e.gone||!onScreen(e,4))continue;
    if(e.enFrz>0&&!isBoss(e)){
      // foto congelada: velo frío y un marco de enfoque rosa en las esquinas; titila cuando está por soltarse
      if(e.enFrz>20||(T>>2)%2){
        const x=q(e.x-2),y=q(e.y-2),w=e.w+4,h=e.h+4,c=3;
        ctx.fillStyle='rgba(170,220,255,0.18)';ctx.fillRect(x+1,y+1,w-2,h-2);
        ctx.fillStyle=`rgb(${EN_ROSA})`;
        ctx.fillRect(x,y,c,1);ctx.fillRect(x,y,1,c);ctx.fillRect(x+w-c,y,c,1);ctx.fillRect(x+w-1,y,1,c);
        ctx.fillRect(x,y+h-1,c,1);ctx.fillRect(x,y+h-c,1,c);ctx.fillRect(x+w-c,y+h-1,c,1);ctx.fillRect(x+w-1,y+h-c,1,c);
        // pausa ‖ arriba
        ctx.fillRect(q(e.x+e.w/2-2),y-4,1,3);ctx.fillRect(q(e.x+e.w/2+1),y-4,1,3);
      }
    }else if(e.enFrz>0){ctx.strokeStyle=`rgba(${EN_ROSA},0.5)`;ctx.lineWidth=1;ctx.strokeRect(q(e.x)-0.5,q(e.y)-0.5,e.w+1,e.h+1);}
    if(e.enHack>0){
      // fallas de imagen: franjas del dibujo corridas, velo verde y píxeles sueltos
      for(let i=0;i<2;i++){if(Math.random()<0.35)continue;const sy=e.y+Math.random()*e.h,sh=1+Math.random()*3;
        ctx.save();ctx.beginPath();ctx.rect(e.x-6,sy,e.w+12,sh);ctx.clip();ctx.translate(Math.round(rand(-3,3)),0);EN_drawEnemy(e);ctx.restore();}
      ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(${EN_VERDE},${0.12+0.1*Math.random()})`;
      ctx.fillRect(q(e.x),q(e.y+((T*3)%Math.max(1,e.h))),e.w,1);ctx.fillRect(q(e.x),q(e.y),e.w,e.h);ctx.restore();
      for(let i=0;i<3;i++){ctx.fillStyle=i%2?`rgb(${EN_VERDE})`:'#ff4fd8';ctx.fillRect(q(e.x+rand(-2,e.w+2)),q(e.y+rand(-2,e.h+2)),1,1);}
      if((T>>3)%2&&e.enHack>12)txt('ERROR',e.x+e.w/2,e.y-7,4,`rgb(${EN_VERDE})`,'center');
    }
  }
  for(const f of EN_fx){
    if(f.k==='flash'){
      const k=f.t/12,r=20+f.t*10,g=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,r);
      g.addColorStop(0,`rgba(255,255,255,${0.85*(1-k)})`);g.addColorStop(0.4,`rgba(255,240,250,${0.35*(1-k)})`);g.addColorStop(1,'rgba(255,240,250,0)');
      ctx.fillStyle=g;ctx.fillRect(f.x-r,f.y-r,r*2,r*2);
    }else if(f.k==='hack'){
      const r=6+f.t*6,a=1-f.t/24;ctx.strokeStyle=`rgba(${EN_VERDE},${0.7*a})`;ctx.lineWidth=1;ctx.setLineDash([2,2]);ctx.lineDashOffset=-f.t;
      ctx.beginPath();ctx.arc(f.x,f.y,r,0,7);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle=`rgba(${EN_VERDE},${a})`;
      for(let i=0;i<10;i++){const an=i*0.628+f.t*0.05;ctx.fillRect(q(f.x+Math.cos(an)*r),q(f.y+Math.sin(an)*r),1,(i+f.t)%3?1:2);}
    }
  }
}
// destello de pantalla de la foto (encima de todo, cortito y suave)
function EN_drawHud(){
  for(const f of EN_fx)if(f.k==='flash'&&f.t<6){ctx.fillStyle=`rgba(255,255,255,${0.28*(1-f.t/6)})`;cubrir();}
}
ON_STEP.push(()=>{
  EN_updBalls();
  for(const f of EN_fx)f.t++;
  for(let i=EN_fx.length;i--;)if(EN_fx[i].t>(EN_fx[i].k==='flash'?12:24))EN_fx.splice(i,1);
});
ON_DRAW.push(()=>{EN_drawMarcas();EN_drawBalls();});
ON_HUD.push(EN_drawHud);
ON_START.push(()=>{EN_balls.length=0;EN_fx.length=0;for(const p of players)if(!p.dead&&!p.out)p.enPend='start';});

// ---------- revivir ----------
const EN_respawn0=respawnPlayer;
respawnPlayer=function(p){EN_respawn0(p);if(P&&P!==p)EN_empezar(P,'revive');};

// ---------- dibujo del jugador durante la entrada ----------
const EN_drawPlayer0=drawPlayer;
drawPlayer=function(){
  const p=P,en=p.en;
  if(!en||p.dead||p.ride)return EN_drawPlayer0();
  const set=playerSet(p),f=p.face>0?0:1;
  let escudo=true;
  if(en.ci===0)escudo=EN_dibFacu(p,en,set,f);else if(en.ci===1)escudo=EN_dibJose(p,en,set,f);else EN_dibLauti(p,en,set,f);
  if(escudo&&p.shield>0){const a=0.45+Math.sin(T/6)*0.2;ctx.strokeStyle=`rgba(120,220,255,${a})`;ctx.lineWidth=1;
    ctx.beginPath();ctx.ellipse(p.x+4,p.y+9,11,13,0,0,7);ctx.stroke();}
};
const EN_r=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(q(x),q(y),w,h);};
function EN_pose(p,leg){const pose=rigPose(p);if(leg){pose.leg=leg;pose.uy=0;pose.hop=0;}return pose;}
// FACU
function EN_dibFacu(p,en,set,f){
  const t=en.t,k=Math.min(1,t/36),cx=p.x+4;
  // líneas de datos que bajan del cielo hasta él (se apagan al terminar la descarga)
  const dl=t<40?1:Math.max(0,1-(t-40)/8);
  if(dl>0){
    const top=0,bot=Math.max(10,p.y+2);
    for(let i=0;i<4;i++){const x=cx+[-7,-3,4,8][i];
      for(let j=0;j<4;j++){const y=top+((t*5+j*17+i*11)%Math.max(8,bot-top));ctx.fillStyle=`rgba(${EN_VERDE},${0.8*dl*(0.4+0.6*(y-top)/(bot-top))})`;ctx.fillRect(q(x),q(y),1,(i+j)%2?3:2);}}
  }
  // cuerpo: fantasma tenue completo y la parte ya descargada, de arriba para abajo, con la línea de lectura
  const pose=EN_pose(p),hR=Math.round(18*k);
  if(k<1){ctx.globalAlpha=0.18;drawRig(set,pose,f,p.x-3,p.y);ctx.globalAlpha=1;}
  if(hR>0){ctx.save();ctx.beginPath();ctx.rect(p.x-6,p.y-4,20,hR+4);ctx.clip();drawRig(set,pose,f,p.x-3,p.y);ctx.restore();}
  if(k<1){ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(${EN_VERDE},0.85)`;ctx.fillRect(q(p.x-2),q(p.y+hR),12,1);ctx.restore();}
  // barrita de progreso y % arriba de la cabeza
  const bk=Math.min(1,t/40);
  if(t<52){
    const bx=Math.round(cx-7),by=Math.round(p.y-6);
    EN_r('#0c1a12',bx-1,by-1,16,4);EN_r('#1e3a28',bx,by,14,2);EN_r(`rgb(${EN_VERDE})`,bx,by,Math.round(14*bk),2);
    if(bk<1||(t>>2)%2)txt(bk<1?Math.floor(bk*100)+'%':'100%',cx,by-7,4,bk<1?'#bfffd6':'#ffffff','center');
  }
  // teclado que flota: aparece, tipea y Enter
  if(t>=44){
    const ap=Math.min(1,(t-44)/4),fade=t>72?Math.max(0,1-(t-72)/10):1,a=ap*fade;
    if(a>0){
      const ky=p.y+12+Math.sin(t/6)*0.5,kw=Math.round(9*ap),kx=ES_fx(p,4,kw);
      ctx.fillStyle=`rgba(${EN_VERDE},${0.22*a})`;ctx.fillRect(q(kx),q(ky),kw,3);
      ctx.fillStyle=`rgba(${EN_VERDE},${0.8*a})`;ctx.fillRect(q(kx),q(ky),kw,0.6);
      for(let i=0;i<kw-2;i+=2)ctx.fillRect(q(kx+1+i),q(ky+1.4),1,0.8);
      const ex=ES_fx(p,4+kw-2,2),enter=t>=70&&t<76;                   // Enter: la tecla de la punta
      ctx.fillStyle=enter?`rgba(255,255,255,${a})`:`rgba(${EN_VERDE},${0.9*a})`;ctx.fillRect(q(ex),q(ky+(enter?1:0.6)),2,enter?2:2.4);
      if(t<70){const h=(t>>1)%2;EN_r(EN_PIEL[0],ES_fx(p,5+h,1),ky-1,1,1);EN_r(EN_PIEL[0],ES_fx(p,7-h,1),ky-1+((t>>2)%2),1,1);}
      else if(t<74)EN_r(EN_PIEL[0],ES_fx(p,4+kw-2,1),ky-0.5,1,1);
      ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(${EN_VERDE},${0.12*a})`;ctx.fillRect(q(ES_fx(p,2,2)),q(p.y+5),2,3);ctx.restore();
    }
  }
  return k>=1;
}
// JOSÉ
function EN_dibJose(p,en,set,f){
  const t=en.t,pose=EN_pose(p),cx=p.x+4;
  if(t<=34){
    const k=t/34,e=1-(1-k)*(1-k),h=Math.round(18*e),line=p.y+18-h;
    // base de aparición en el piso
    ctx.fillStyle=`rgba(${EN_ROSA},${0.25*(1-k*0.5)})`;ctx.beginPath();ctx.ellipse(cx,p.y+18,7,1.5,0,0,7);ctx.fill();
    if(h>0){ctx.save();ctx.beginPath();ctx.rect(p.x-6,line,20,h+1);ctx.clip();drawRig(set,pose,f,p.x-3,p.y);ctx.restore();}
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba(140,230,255,0.9)';ctx.fillRect(q(p.x-1),q(line),10,1);ctx.restore();
    // píxeles que caen a su lugar sobre la línea
    const cols=['#2f8a96','#5cc0c8','#c98a5e','#6a4b3a','#a4482a','#f0c040'];
    for(let i=0;i<6;i++){const ph=(t*0.09+i/6)%1,px=p.x-1+((i*37+Math.floor(t/5)*13)%10),py=line-1-(1-ph)*9;
      ctx.globalAlpha=ph;ctx.fillStyle=cols[i];ctx.fillRect(q(px),q(py),1,1);}
    ctx.globalAlpha=1;
    // barrita de carga arriba de donde va a estar la cabeza
    const bx=Math.round(cx-6),by=Math.round(p.y-5);
    EN_r('#160c1a',bx-1,by-1,14,4);EN_r('#3a2a44',bx,by,12,2);EN_r(`rgb(${EN_ROSA})`,bx,by,Math.round(12*e),2);
    return false;
  }
  drawRig(set,pose,f,p.x-3,p.y);
  // tablet: sube a la altura de la cara (34–46), foto (50), baja (66–76)
  let ty;
  if(t<46)ty=p.y+11-6*((t-34)/12);else if(t<66)ty=p.y+5;else if(t<76)ty=p.y+5+6*((t-66)/10);else return true;
  const flash=t>=50&&t<54,cols='255,140,210';
  EN_r('#22252c',ES_fx(p,5,2),ty,2,6);
  EN_r(flash?'#ffffff':`rgba(${cols},0.9)`,ES_fx(p,5,1),ty+1,1,4);               // pantalla hacia ella
  EN_r(flash?'#ffffff':'#444a55',ES_fx(p,7,1),ty+1,1,1);                         // flash hacia afuera
  EN_r(EN_PIEL[1],ES_fx(p,3,2),ty+4,2,1);
  ES_glow(`rgba(${cols},${flash?0.7:0.35})`,ES_fx(p,2,3),p.y+5,3,4);
  // la fotito que sale y flota
  if(t>=52&&t<80){const s=(t-52)/28,fx=ES_fx(p,8+s*4,4),fy=ty-2-s*10;ctx.globalAlpha=1-s;
    EN_r('#f4f0e6',fx,fy,4,3);EN_r('#6ab0d8',fx+0.5,fy+0.5,3,1.5);ctx.globalAlpha=1;}
  return true;
}
// LAUTI
function EN_dibLauti(p,en,set,f){
  const ft=en.ft,cx=p.x+4;
  // brazo abierto: dos píxeles de camiseta y la mano (lado s: -1 atrás, 1 adelante)
  const brazos=(ox,oy,s)=>{for(let i=0;i<=4;i++){ctx.fillStyle=i<3?EN_CELESTE:EN_PIEL[2];ctx.fillRect(ox+s*(4+i)-(s<0?1:0),oy-i*1.2-(i===4?0.6:0),1.2,i===4?1.6:1.4);}
    ctx.fillStyle='#17141f';ctx.fillRect(ox+s*4-(s<0?1:0),oy+0.8,1,0.6);};
  switch(en.fase){
  case 'cae':{
    drawRig(set,EN_pose(p),f,p.x-3,p.y);brazos(cx,p.y+8,-1);brazos(cx,p.y+8,1);
    ES_pelota(ES_fx(p,8),p.y+3+Math.sin(T/5),T*0.25);
    break;}
  case 'desliza':{
    // de rodillas, tirado para atrás, brazos abiertos
    const img=set.crouch[f],hc=img.height,ang=-p.face*0.3;
    ctx.save();ctx.translate(cx,p.y+18);ctx.rotate(ang);ctx.drawImage(img,-7,-hc+1);
    brazos(0,-hc+9,-1);brazos(0,-hc+9,1);ctx.restore();
    ES_pelota(ES_fx(p,8),p.y+15.4,en.ang);
    break;}
  case 'arriba':{
    const k=ft/8,leg=ft>=2&&ft<6?'r0':null;
    drawRig(set,EN_pose(p,leg),f,p.x-3,p.y);
    ES_pelota(en.bx0+(ES_fx(p,5)-en.bx0)*k,p.y+15.4,en.ang-k*2);
    break;}
  case 'toque':{
    const k=ft/12,foot=p.y+15.4,top=p.y+4,by=foot-(foot-top)*4*k*(1-k);
    drawRig(set,EN_pose(p,ft<3?'r0':null),f,p.x-3,p.y);
    ES_pelota(ES_fx(p,5),by,en.ang+ft*0.3);
    break;}
  case 'patea':drawRig(set,EN_pose(p,ft<6?'r3':null),f,p.x-3,p.y);
    if(ft<3){ctx.fillStyle='rgba(255,255,255,0.7)';ctx.fillRect(q(ES_fx(p,6)),q(p.y+12),1,3);}   // golpe en el empeine
    break;
  }
}
