'use strict';
// Óxido · Terreno propio por misión, con una sola pieza (propuesta A de Investigación, notas/investigacion/propuestas.md)
// (Segundo programador. Va después de las misiones y de vehiculos2.js, antes de juego.js.)
//
// Una ZONA de terreno es un tramo del piso (o de una plataforma) con 4 parámetros:
//   agarre    1 = normal; menos = resbala (tarda en arrancar y frenar)            (M1 aceite, más adelante)
//   empuje    px por cuadro hacia un lado (+ derecha, − izquierda)                 (M6 cintas, M2 corriente)
//   gravedad  1 = normal; menos = flota                                           (M7 sin gravedad, más adelante)
//   velocidad multiplica la velocidad de caminar (se suma al gancho L.speedMul de siempre: barro de M3, arena de M4)
// y un aire opcional (px sobre la zona en los que el efecto también vale: así un vehículo que vuela bajo no la anula).
// Cada misión declara sus zonas en TR_MISION[i]() y su dibujo/sonido en la zona misma (zona.dibujar, zona.upd).
// Reglas (Dirección): un solo terreno nuevo por pantalla, cada zona con una señal visual clara (la dibuja Arte en
// TR_ARTE[tipo] si existe; si no, el dibujo de respaldo de acá), se presenta primero sin peligro (presentar,
// desarrollar, torcer) y no lo anula el vehículo de la misión.
// Lo que empuja: jugadores a pie, vehículos (parados o con alguien), aliados, soldados y lo que haya en el piso.
// Ganchos: L.speedMul (envuelto al empezar la misión), ON_START, ON_STEP, ON_DRAW. Prefijo TR_.
// Lo lee el bot / Pruebas: TR.zonas, TR_en(o), TR.muertes (muertes con el jugador parado en una zona).
const TR={zonas:[],muertes:0};
const TR_MISION=[];
const TR_ON=()=>!window.TR_OFF;
// ¿en qué zona está parado (o flotando bajo encima) o?
function TR_en(o){
  if(!o||!TR.zonas.length)return null;const w=o.w||8,h=o.h||18,pie=o.y+h,cx=o.x+w/2;
  for(const z of TR.zonas){if(z.off||cx<z.x0||cx>z.x1)continue;
    if(z.todo)return z; // zonas de todo el alto (M7 sin gravedad)
    if(o.onGround&&Math.abs(pie-z.y)<2)return z;
    if(z.aire&&pie<=z.y+1&&z.y-pie<z.aire)return z;}
  return null;
}
ON_START.push(()=>{
  TR.zonas=[];TR.muertes=0;
  if(!TR_ON()||!TR_MISION[levelIdx])return;
  TR.zonas=TR_MISION[levelIdx]()||[];
  // velocidad: se multiplica con lo que ya hubiera (barro, arena)
  if(!L.trMul){const s0=L.speedMul;L.speedMul=function(o){const b=s0?s0.call(this,o):1,z=TR_en(o);return z&&z.velocidad!=null?b*z.velocidad:b;};L.trMul=1;}
});
ON_STEP.push(()=>{
  if(!TR.zonas.length||state!=='play')return;
  for(const z of TR.zonas)if(z.upd)z.upd(z);
  const empujar=(o,k)=>{const z=TR_en(o);if(!z||!z.empuje)return;o.x+=z.empuje*(k||1);};
  // muertes en una zona (para Pruebas): el jugador cae mientras estaba parado en el terreno
  for(const p of players){if(!p.dead){p._trz=TR_en(p);p._trM=false;}else if(!p._trM){p._trM=true;if(p._trz)TR.muertes++;}}
  for(const p of players){if(p.dead||p.ride)continue;TR_resbala(p);empujar(p);p.x=clamp(p.x,camX+2,camX+VW-10+(typeof MC_margen==='function'?MC_margen():0));
    TR_flota(p,0.32);}
  // la gravedad baja también para los soldados, lo que cae al piso y las granadas
  for(const e of enemies)if(!e.gone&&!isBoss(e)&&(e.type==='soldier'||e.type==='grenadier'||e.type==='shield'))TR_flota(e,0.32);
  for(const k of pickups)if(!k.gone&&k.vy!==0)TR_flota(k,0.2,true);
  for(const g of grens)if(!g.gone&&!g.upd)TR_flota(g,g.can?0.08:0.18,true);
  for(const m of mechs)if(!m.dying)empujar(m,m.ride?0.8:1);
  for(const a of allies)empujar(a);
  for(const e of enemies)if(!e.gone&&!isBoss(e)&&(e.type==='soldier'||e.type==='grenadier'||e.type==='shield'||e.type==='vigia'))empujar(e,0.9);
  for(const k of pickups)if(!k.gone&&k.vy===0){const z=TR.zonas.find(z=>!z.off&&k.x+5>z.x0&&k.x+5<z.x1&&Math.abs(k.y+k.h-z.y)<2);if(z&&z.empuje)k.x+=z.empuje;}
});
// poco agarre: lo que el jugador quiere moverse (p.vx, ya aplicado por jugador.js) llega de a poco y sigue de largo
function TR_resbala(p){
  const z=TR_en(p);
  if(!z||z.agarre==null||z.agarre>=1){p._trv=p.vx;return;}
  const v=(p._trv??p.vx)+(p.vx-(p._trv??p.vx))*z.agarre;
  p.x+=v-p.vx;p._trv=v;
  if(Math.abs(v)>0.6&&T%4===0)parts.push({k:'p',x:p.x+4-Math.sign(v)*3,y:z.y-1,vx:-Math.sign(v)*0.5,vy:-0.3,g:0.05,life:12,maxl:12,size:1,col:'#3a3a48'});
}
// menos gravedad: se le devuelve parte de la que ya sumó este cuadro; sube como mucho a 4,2 y cae como mucho a 2,2
function TR_flota(o,g0,suelto){
  const z=TR_en(o);if(!z||z.gravedad==null||z.gravedad>=1||(!suelto&&o.onGround))return;
  o.vy-=g0*(1-z.gravedad);if(o.vy<-4.2)o.vy=-4.2;if(o.vy>2.2)o.vy=2.2;if(o.y<10&&o.vy<0)o.vy=0;
}
ON_DRAW.push(()=>{
  for(const z of TR.zonas){if(z.x1<camX-10||z.x0>camX+VW+10)continue;
    const a=typeof TR_ARTE!=='undefined'&&TR_ARTE&&TR_ARTE[z.tipo];if(a)a(z);else if(z.dibujar)z.dibujar(z);}
});

// ================== M6 · ríos de datos: cintas que corren de lado a lado, a veces al revés ==================
// presentar: una cinta corta y lenta al principio, siempre para adelante (te lleva) · desarrollar: una que cambia de
// sentido cada tanto, con aviso (las flechas titilan ámbar y suena un bip 1 s antes) · torcer: una más rápida en la
// emboscada, que cambia más seguido y también arrastra lo que vuela bajo encima (el VOLADOR de la misión no la anula).
TR_MISION[5]=()=>[
  TR_cinta(150,236,GROUND,{v:0.45,fijo:true}),
  TR_cinta(500,640,GROUND,{v:0.7,cada:300}),
  TR_cinta(2200,2380,GROUND,{v:1.0,cada:220,aire:44})];
function TR_cinta(x0,x1,y,o){return{tipo:'cinta',x0,x1,y,dir:1,v:o.v,empuje:o.v,velocidad:1,agarre:1,gravedad:1,aire:o.aire||0,
  fijo:!!o.fijo,cada:o.cada||300,t:0,aviso:0,fase:0,upd:TR_updCinta,dibujar:TR_dibCinta};}
function TR_updCinta(z){
  z.fase+=z.dir*z.v;if(z.fijo)return;
  z.t++;const falta=z.cada-z.t;
  z.aviso=falta<=60?1:0;
  if(falta===60&&TR_cercaDe(z))tone('square',1200,1200,0.05,0.025);
  if(falta===30&&TR_cercaDe(z))tone('square',1200,1200,0.05,0.025);
  if(falta<=0){z.t=0;z.dir*=-1;z.empuje=z.dir*z.v;if(TR_cercaDe(z)){tone('sawtooth',300,600,0.15,0.04);noise(0.1,0.05,2400);}}
}
const TR_cercaDe=z=>z.x1>camX-20&&z.x0<camX+VW+20;
// dibujo de respaldo (hasta el de Arte): una franja de datos que corre, con flechas del lado al que lleva
function TR_dibCinta(z){
  const y=z.y,w=z.x1-z.x0,av=z.aviso&&(T>>3)%2;
  ctx.fillStyle='#120c18';ctx.fillRect(z.x0-1,y-3,w+2,5);
  ctx.fillStyle=av?'#3a2a10':'#14203a';ctx.fillRect(z.x0,y-2,w,3);
  ctx.fillStyle=av?'#ffb43a':'#3ad8ff';
  for(let x=0;x<w;x+=8){const xx=z.x0+((x+z.fase)%w+w)%w;ctx.fillRect(q(xx),y-2,2,1);ctx.fillRect(q((xx+4-z.x0)%w+z.x0),y,1,1);}
  // flechas sobre la cinta, para donde lleva
  ctx.fillStyle=av?'#ffd25a':'rgba(58,216,255,0.75)';
  const des=((z.fase*0.5)%6+6)%6; // los chevrones avanzan con la cinta
  for(let x=z.x0+8;x<z.x1-8;x+=26)for(const k of[0,3]){const cx=x+k+(z.dir>0?des:-des)*0.5,f=z.dir;
    for(const[dx,dy]of[[0,0],[1,1],[2,2],[1,3],[0,4]])ctx.fillRect(q(cx+(f>0?dx:2-dx)),y-9+dy,1,1);}
  if(z.aire){ctx.fillStyle=`rgba(58,216,255,${0.06+0.03*Math.sin(T/10)})`;ctx.fillRect(z.x0,y-z.aire,w,z.aire-3);}
}

// ================== M7 · tramos sin gravedad: la nave perdió la gravedad artificial en algunos pasillos ==================
// presentar: un tramo tranquilo con gravedad baja fija (los saltos son altos y lentos) · desarrollar: otro con enemigos
// (los soldados y las granadas también flotan) · torcer: uno donde la gravedad se prende y se apaga, con aviso (las
// luces del techo titilan ámbar y suena un zumbido 1 s antes). El VENTARRÓN de la misión vuela igual: no lo anula.
TR_MISION[6]=()=>[
  TR_sinGrav(520,690,{g:0.3,fijo:true}),
  TR_sinGrav(1620,1790,{g:0.3,fijo:true}),
  TR_sinGrav(2560,2790,{g:0.25,cada:240})];
function TR_sinGrav(x0,x1,o){return{tipo:'gravedad',x0,x1,y:GROUND,todo:true,g:o.g,gravedad:o.g,empuje:0,velocidad:1,agarre:1,
  fijo:!!o.fijo,cada:o.cada||240,t:0,aviso:0,on:true,upd:TR_updGrav,dibujar:TR_dibGrav};}
function TR_updGrav(z){
  if(z.fijo)return;z.t++;const falta=z.cada-z.t;z.aviso=falta<=60?1:0;
  if(falta===60&&TR_cercaDe(z))tone('sine',180,240,0.5,0.03);
  if(falta<=0){z.t=0;z.on=!z.on;z.gravedad=z.on?z.g:1;if(TR_cercaDe(z)){tone(z.on?'sine':'square',z.on?600:200,z.on?900:120,0.25,0.04);}}
}
// dibujo de respaldo (hasta el de Arte): luces en el techo y motas que flotan; apagado = gravedad normal
function TR_dibGrav(z){
  const on=z.on,av=z.aviso&&(T>>3)%2,w=z.x1-z.x0,top=camY+24/ZOOM+2; // debajo del HUD
  ctx.fillStyle='#120c18';ctx.fillRect(z.x0,top,w,3);
  for(let x=z.x0+4;x<z.x1-4;x+=12){ctx.fillStyle=av?'#ffb43a':on?'#9a7aff':'#3a3048';ctx.fillRect(x,top+0.5,6,2);}
  if(!on&&!av)return;
  ctx.fillStyle=`rgba(154,122,255,${av?0.05:0.08})`;ctx.fillRect(z.x0,top+3,w,GROUND-top-3);
  for(let i=0;i<14;i++){const f=((T*0.4+i*37)%160)/160,x=z.x0+((i*53)%w),y=GROUND-f*(GROUND-top-10);
    ctx.fillStyle=`rgba(200,190,255,${(0.6*(1-f)).toFixed(2)})`;ctx.fillRect(q(x+Math.sin(T/20+i)*2),q(y),1,1);}
}

// ================== M1 · charcos de aceite (solo en la segunda mitad: la primera enseña a jugar) ==================
// presentar: un charco solo, que resbala (cuesta frenar y arrancar) · torcer: uno adentro de la emboscada de 2000, donde
// las granadas de los enemigos lo PRENDEN · y otro más adelante. Se prende con cualquier explosión cerca o con fuego
// (lanzallamas propio o enemigo); arde ~4 s, quema a quien esté encima (jugadores y soldados) y queda quemado: ya no
// resbala. La CHATARRA de la misión no resbala (pesa) pero se quema igual si está arriba cuando arde.
TR_MISION[0]=()=>[TR_aceite(1700,1790),TR_aceite(2120,2210),TR_aceite(2380,2450)];
function TR_aceite(x0,x1){return{tipo:'aceite',x0,x1,y:GROUND,agarre:0.07,empuje:0,velocidad:1,gravedad:1,arde:0,quemado:false,
  t:0,upd:TR_updAceite,dibujar:TR_dibAceite};}
const TR_ARDE=240;
function TR_prender(z){if(z.quemado||z.arde)return;z.arde=TR_ARDE;z.agarre=1;if(TR_cercaDe(z)){noise(0.5,0.15,500);tone('sawtooth',90,240,0.4,0.05);}}
function TR_updAceite(z){
  z.t++;
  if(!z.arde){ // ¿fuego cerca?
    for(const b of pbul)if(!b.gone&&b.k==='flame'&&b.x>z.x0&&b.x<z.x1&&b.y>z.y-8){TR_prender(z);break;}
    if(!z.arde)for(const b of eproj)if(!b.gone&&(b.kind==='fuego')&&b.x>z.x0&&b.x<z.x1&&b.y>z.y-10){TR_prender(z);break;}
    return;}
  z.arde--;
  if(z.arde%3===0)parts.push({k:'fire',x:rand(z.x0,z.x1),y:z.y-1,vx:rand(-0.2,0.2),vy:rand(-1.2,-0.5),life:rand(14,24),maxl:24,size:rand(2,3.5)});
  if(z.arde%7===0)parts.push({k:'smoke',rise:1,x:rand(z.x0,z.x1),y:z.y-6,vx:rand(-0.2,0.2),vy:rand(-0.6,-0.3),life:40,maxl:64,size:rand(2,3)});
  // quema a los que están encima
  for(const p of players){if(p.dead)continue;const o=p.ride||p;if(o.x+(o.w||8)>z.x0&&o.x<z.x1&&o.y+(o.h||18)>=z.y-3)withP(p,()=>hurtPlayer(1));}
  if(z.arde%30===0)for(const e of enemies)if(hittable(e)&&!isBoss(e)&&e.x+e.w>z.x0&&e.x<z.x1&&e.y+e.h>=z.y-3){killSrc='flame';dmg(e,1);killSrc=null;}
  if(z.arde<=0)z.quemado=true;
}
// las explosiones cerca de un charco lo prenden (granadas propias y enemigas, cohetes, morteros, el avión): todas pasan por explodeFx
{const e0=explodeFx;explodeFx=function(x,y,r){e0(x,y,r);
  for(const z of TR.zonas)if(z.tipo==='aceite'&&!z.arde&&!z.quemado&&x+r>z.x0&&x-r<z.x1&&y+r>z.y-6)TR_prender(z);};}
// dibujo de respaldo: charco negro con brillo de colores que se mueve; ardiendo, llamas; quemado, mancha gris
function TR_dibAceite(z){
  const w=z.x1-z.x0,y=z.y;
  if(z.quemado){ctx.fillStyle='rgba(30,26,30,0.7)';ctx.fillRect(z.x0+2,y-1,w-4,2);return;}
  ctx.fillStyle='#120c18';ctx.fillRect(z.x0,y-1.5,w,2.5);ctx.fillStyle='#1d1a22';ctx.fillRect(z.x0+1,y-1,w-2,1.5);
  for(let x=0;x<w;x+=5){const k=(x+z.t*0.3)%20;ctx.fillStyle=k<5?'rgba(120,90,200,0.7)':k<10?'rgba(80,160,140,0.6)':k<15?'rgba(200,160,60,0.5)':'rgba(40,36,50,0.4)';ctx.fillRect(z.x0+x,y-1,3,1);}
  if(z.arde){const k=z.arde/TR_ARDE;ctx.fillStyle=`rgba(255,140,40,${(0.35*k+0.1).toFixed(2)})`;ctx.fillRect(z.x0,y-8,w,7);
    for(let x=z.x0;x<z.x1;x+=4){const h=4+((x*7+T)%6);ctx.fillStyle=(T>>1)%2?'#ffd25a':'#ff7a2a';ctx.fillRect(x,y-h,2,h);}}
}

// ================== M5 · vapor de las alcantarillas: chorros que te lanzan para arriba ==================
// Las rejillas de la calle (L.grates, antes solo decorado) largan vapor de verdad. Ciclo: descanso → AVISO (~0,8 s: la
// rejilla brilla, tiembla, sale vapor chico y retumba) → CHORRO (~0,7 s): todo lo que esté arriba (hasta 100 px) sale
// lanzado para arriba. No hace daño: sirve para llegar alto o para escapar, y revolea a los soldados.
// presentar: 610 (sola) · desarrollar: 1420 (antes del puente) · torcer: 2470 y 2960, con enemigos y desfasadas.
// El RESORTE de la misión también sale lanzado (no la anula).
TR_MISION[4]=()=>[TR_vapor(610,0),TR_vapor(1420,60),TR_vapor(2470,0),TR_vapor(2960,120)];
function TR_vapor(x,fase){return{tipo:'vapor',x0:x-9,x1:x+9,y:GROUND,aire:100,cx:x,empuje:0,velocidad:1,agarre:1,gravedad:1,
  t:fase,est:'quieto',DESC:170,AV:48,CH:40,upd:TR_updVapor,dibujar:TR_dibVapor};}
function TR_updVapor(z){
  z.t++;
  if(z.est==='quieto'&&z.t>=z.DESC){z.est='aviso';z.t=0;}
  else if(z.est==='aviso'){if(z.t%12===1&&TR_cercaDe(z))noise(0.15,0.04,300);
    if(z.t%4===0)parts.push({k:'smoke',col:'220,220,230',x:z.cx+rand(-5,5),y:z.y-1,vx:rand(-0.2,0.2),vy:rand(-0.8,-0.4),life:16,maxl:16,size:rand(1,2)});
    if(z.t>=z.AV){z.est='chorro';z.t=0;if(TR_cercaDe(z)){noise(0.6,0.12,1800);tone('sawtooth',200,500,0.3,0.03);}}}
  else if(z.est==='chorro'){
    for(let i=0;i<3;i++)parts.push({k:'smoke',col:'235,235,245',x:z.cx+rand(-7,7),y:z.y-rand(0,10),vx:rand(-0.4,0.4),vy:rand(-3.5,-2),life:rand(22,32),maxl:32,size:rand(2,3.5)});
    const lanza=(o,k)=>{const w=o.w||8,h=o.h||18;if(o.x+w<z.x0||o.x>z.x1)return;const pie=o.y+h;if(pie>z.y+1||z.y-pie>z.aire)return;
      if(!o._trVap||o._trVap!==z.t0){o._trVap=z.t0;o.vy=Math.min(o.vy||0,-5.2*k);o.onGround=false;o.plat=null;}else if(z.y-pie<70)o.vy-=0.16*k;}; // empuja hasta ~70 px; sube a ~95 (las cornisas)
    if(z.t===1)z.t0=T;
    for(const p of players)if(!p.dead){if(p.ride)lanza(p.ride,0.85);else lanza(p,1);}
    for(const m of mechs)if(!m.ride&&!m.dying)lanza(m,0.7);
    for(const e of enemies)if(!e.gone&&!isBoss(e)&&(e.type==='soldier'||e.type==='grenadier'||e.type==='shield'))lanza(e,0.9);
    if(z.t>=z.CH){z.est='quieto';z.t=0;}}
}
// dibujo de respaldo: la rejilla brilla en el aviso; el chorro es una columna blanca que sube
function TR_dibVapor(z){
  const x=z.cx,y=z.y,av=z.est==='aviso',ch=z.est==='chorro',sx=av?((T>>1)%2?1:-1)*0.5:0;
  ctx.fillStyle='#120c18';ctx.fillRect(x-8+sx,y-2,16,3);ctx.fillStyle=av?((T>>3)%2?'#ffb43a':'#c87a2a'):ch?'#fff0c0':'#3a3a48';
  for(let i=0;i<4;i++)ctx.fillRect(x-7+i*4+sx,y-1.5,2,2);
  if(ch){const k=Math.min(1,z.t/6)*(1-Math.max(0,z.t-z.CH+10)/10);ctx.fillStyle=`rgba(240,240,250,${(0.35*k).toFixed(2)})`;ctx.fillRect(x-7,y-z.aire,14,z.aire);
    ctx.fillStyle=`rgba(255,255,255,${(0.25*k).toFixed(2)})`;ctx.fillRect(x-3,y-z.aire,6,z.aire);}
}

// ================== M9 · plataformas que solo existen con la luz del farol ==================
// Tres faroles de la calle tienen, en su luz, una plataforma fantasma (ectoplasma) que se puede pisar solo mientras el
// farol está prendido. Al apagarse desaparece y lo que estaba arriba cae. Aviso: el farol titila ~1 s antes de apagarse.
// Son atajos (a una cornisa, a un premio), nunca el único camino. presentar: el de 380 siempre prendido · desarrollar:
// 1446 se prende y se apaga · torcer: 2540 con dos plataformas que se turnan, con enemigos.
TR_MISION[8]=()=>{
  const z=[TR_luz(380,[{x:356,y:96,w:40}],{fijo:true}),TR_luz(1446,[{x:1404,y:90,w:44}],{prende:240,apaga:150}),
    TR_luz(2540,[{x:2500,y:98,w:36},{x:2556,y:76,w:36}],{prende:200,apaga:140,turno:true})];
  // las plataformas fantasma se suman a las de la misión (en una lista nueva: no se toca LEVELS)
  platforms=platforms.concat(...z.map(q=>q.plats));
  if(!L.trLuz){const d0=L.drawPlat;L.drawPlat=function(pl){if(pl.trLuz)return true;return d0?d0.call(this,pl):false;};L.trLuz=1;}
  return z;};
function TR_luz(fx,pls,o){const plats=pls.map(p=>({...p,w0:p.w,trLuz:1}));
  return{tipo:'luz',x0:fx-60,x1:fx+60,y:GROUND,fx,plats,on:true,fijo:!!o.fijo,prende:o.prende||240,apaga:o.apaga||150,turno:!!o.turno,
    t:0,aviso:0,cual:0,empuje:0,velocidad:1,agarre:1,gravedad:1,upd:TR_updLuz,dibujar:TR_dibLuz};}
function TR_updLuz(z){
  if(z.fijo)return;z.t++;
  const dur=z.on?z.prende:z.apaga,falta=dur-z.t;z.aviso=z.on&&falta<=60?1:0;
  if(z.on&&falta===60&&TR_cercaDe(z))tone('sine',520,380,0.4,0.02);
  if(falta<=0){z.t=0;z.on=!z.on;if(z.turno&&z.on)z.cual^=1;if(TR_cercaDe(z))tone(z.on?'sine':'triangle',z.on?700:300,z.on?1000:150,0.2,0.03);}
  // sólida solo con luz (en "turno", una plataforma por vez)
  z.plats.forEach((p,i)=>{const ok=z.on&&(!z.turno||i===z.cual);p.w=ok?p.w0:0;});
}
// dibujo de respaldo: la luz del farol (un cono cálido) y la plataforma de ectoplasma verde pálido; apagada, un contorno
// punteado muy tenue (para que se entienda que ahí "hay algo")
function TR_dibLuz(z){
  const av=z.aviso&&(T>>2)%2,luz=z.on&&!av;
  if(luz){ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba(255,220,140,0.10)';
    ctx.beginPath();ctx.moveTo(z.fx-3,GROUND-60);ctx.lineTo(z.fx-48,GROUND);ctx.lineTo(z.fx+48,GROUND);ctx.lineTo(z.fx+3,GROUND-60);ctx.fill();ctx.restore();}
  z.plats.forEach((p,i)=>{const ok=z.on&&(!z.turno||i===z.cual);
    if(ok){ctx.fillStyle='#120c18';ctx.fillRect(p.x-0.5,p.y-0.5,p.w0+1,5);ctx.fillStyle=av?'rgba(190,255,200,0.55)':'rgba(190,255,200,0.85)';ctx.fillRect(p.x,p.y,p.w0,4);
      ctx.fillStyle='rgba(255,255,255,0.6)';ctx.fillRect(p.x+1,p.y,p.w0-2,1);
      for(let k=0;k<3;k++){const yy=p.y+4+((T*0.3+k*9+i*5)%10);ctx.fillStyle=`rgba(190,255,200,${(0.5-(yy-p.y-4)/20).toFixed(2)})`;ctx.fillRect(p.x+4+k*((p.w0-8)/2),yy,1,1);}}
    else{ctx.fillStyle='rgba(190,255,200,0.18)';for(let x=p.x;x<p.x+p.w0;x+=4)ctx.fillRect(x,p.y+1,2,1);}});
}

// ================== M2 · corriente y marea en el camino de abajo (bajo el muelle) ==================
// En el tramo de agua de caminos-m2.js (L.caminos.bajos) el agua corre hacia un lado y cambia con la marea: te lleva
// hacia la entrada o hacia la salida, y también contra las minas. Solo empuja a quien NADA (no al muelle de arriba).
// La marea cambia cada ~7 s con aviso: las estelas del agua se frenan y titilan ~1 s antes. Lento a propósito (0,35):
// se puede nadar en contra. El VENTARRÓN de la misión no entra al agua: no la anula.
TR_MISION[1]=()=>{
  const b=L.caminos&&L.caminos.bajos&&L.caminos.bajos[0];if(!b)return[];
  return[{tipo:'corriente',x0:b.x0,x1:b.x1,y:b.piso,sup:b.sup,dir:1,v:0.35,empuje:0,velocidad:1,agarre:1,gravedad:1,
    cada:420,t:0,aviso:0,fase:0,upd:TR_updCorriente,dibujar:TR_dibCorriente}];};
function TR_updCorriente(z){
  z.t++;z.fase+=z.dir*z.v;const falta=z.cada-z.t;z.aviso=falta<=60?1:0;
  if(falta<=0){z.t=0;z.dir*=-1;if(TR_cercaDe(z))tone('sine',220,160,0.5,0.03);}
  const abajo=o=>typeof CA_abajo==='function'&&CA_abajo(o);
  for(const p of players)if(!p.dead&&!p.ride&&abajo(p)){p.x+=z.dir*z.v*(z.aviso?0.5:1);}
  for(const e of enemies)if(!e.gone&&!isBoss(e)&&abajo(e))e.x+=z.dir*z.v;
  for(const k of pickups)if(!k.gone&&k.y>GROUND+2&&k.x>z.x0&&k.x<z.x1)k.x+=z.dir*z.v*0.6;
}
// dibujo de respaldo: estelas claras en el agua que corren para donde va la marea
function TR_dibCorriente(z){
  const av=z.aviso&&(T>>3)%2,h=z.y-z.sup;
  for(let i=0;i<18;i++){const yy=z.sup+6+((i*29)%Math.max(8,h-10)),w=z.x1-z.x0,xx=z.x0+((i*67+z.fase*(1+(i%3)*0.4))%w+w)%w;
    ctx.fillStyle=av?'rgba(255,200,120,0.45)':'rgba(200,230,255,0.35)';ctx.fillRect(q(xx),q(yy),6,1);ctx.fillRect(q(xx+(z.dir>0?6:-1)),q(yy-1),1,1);}
}
// para el escenario (escenario-m9.js, luces()): ¿el farol de la calle en x está apagado por su zona de luz?
// devuelve true solo si x es el farol de una zona 'luz' que en este momento está apagada (o titilando apagada)
function TR_farolApagado(x){for(const z of TR.zonas)if(z.tipo==='luz'&&Math.abs(z.fx-x)<6)return!z.on||(z.aviso&&(T>>2)%2===1);return false;}
