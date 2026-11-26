'use strict';
// Óxido · Introducción jugable de la Misión 1 (pedido: notas/intro-m1.md)
// (Segundo programador. Va después de vehiculos.js y antes de juego.js; arte-intro.js de Arte (IN_ARTE) va antes.)
//
// El primer lugar de Zona Óxido enseña jugando, sin pantalla de instrucciones ni carteles fijos:
//   1 · MOVERSE Y SALTAR: una pila baja de neumáticos corta el paso; se aprende al cruzarla (no al tocar la tecla).
//   2 · DISPARAR: una caja trabada en el hueco de una pared de chatarra; al romperla a tiros se pasa.
//   3 · APUNTAR ARRIBA: un dron de práctica (sin armas) sostiene con un cable el portón; va y viene por arriba, así
//       que hay que apuntar arriba y disparar a la vez, moviéndose. Al caer, el portón se abre.
//   4 · GRANADA: una barricada en otro hueco: los tiros la sacuden y sacan chispas pero no la abren; la granada sí.
//       Si la granada se erra, vuelve al contador (vuela al HUD): nunca queda trabado.
//   5 · AVIÓN: detrás de una reja, cinco muñecos de lata blindados (las balas rebotan); el avión los tumba y la reja
//       se abre. Acá el avión es gratis y no gasta salud. Al empezar el combate, un aviso muestra el costo real
//       (la regla del juego: un avión gratis, o 1 ♥). Con CONTROLES SIMPLES no hay avión: esta parada se saltea.
//   6 · FIN DE LA ZONA SEGURA: un poste con lámpara se pone rojo con una sirena corta; un fundido corto y la misión
//       normal arranca (startLevel de siempre, con un solo gameStart) con el personaje entrando por la izquierda.
// Si alguien se traba (unos segundos en una parada sin lograrla), aparece UNA teclita al lado del objeto, con btn()
// (el botón del aparato que está usando: teclado, mando o pantalla). Nunca un párrafo.
// Sin riesgo y sin ventaja: no hay enemigos que peguen; munición, granadas, salud, puntos y bajas no cambian; nada se
// emite (emit queda en silencio: ni logros, ni récords, ni historial) y el tiempo jugado del historial vuelve a como
// estaba. Al terminar u omitir, la misión arranca igual que sin intro.
// Se puede omitir siempre: ENTER en el teclado, clic en el botón "OMITIR" de arriba, la fila de la pausa (Código) o el
// botón táctil (Publicación: window.OXIDO_INTRO). Vista u omitida queda marcada en 'oxido-intro' y no vuelve sola.
// "Practicar controles" (IN_practicar) la repite cuando se quiera y al final vuelve al título.
// Ganchos que necesita de Código: IN_arrancar(selLevel) en updSelect (hud.js), IN_practicar() en OPCIONES › CONTROLES
// y CÓMO JUGAR, IN_omitir() en la pausa mientras IN_activa(). Prefijo IN_.
const IN_KEY='oxido-intro';
const IN={activa:false,practica:false,t:0,paso:0,espera:0,fade:0,fadeIn:0,avisoAvion:0,hist0:null,snap:[],score0:0,kills0:0,o:null,quieto:0};
const IN_activa=()=>IN.activa;
const IN_vista=()=>!!store.get(IN_KEY);
// posiciones del tramo (x del mundo)
// (la reja y los blancos van pegados a la barricada: así se ven en pantalla apenas se abre, cuando se pide el avión)
const IN_X={ob:140,caja:270,porton:450,barr:590,reja:636,blancos:[660,682,704,726,748],senal:820,fin:880,fondo:950};

// ================== arrancar, omitir y terminar ==================
// lo llama hud.js al elegir personaje (en vez de startLevel). Devuelve true si arrancó la intro.
function IN_arrancar(lvl,op){
  op=op||{};
  if(lvl!==0||(!op.practica&&IN_vista()))return false;
  IN.practica=!!op.practica;IN.activa=true;IN.t=0;IN.paso=0;IN.espera=0;IN.fade=0;IN.fadeIn=0;IN.quieto=0;
  IN.hist0=typeof HIST!=='undefined'&&HIST&&HIST.totals?HIST.totals.secs:null;
  state='play';startLevel(0,false); // con emit en silencio: no cuenta como partida
  IN_armar();return true;
}
function IN_practicar(){IN_arrancar(0,{practica:true});}
// salir al menú en medio de la intro (lo llama terminarPartida de partida.js): se cierra sin darla por vista y el tiempo
// jugado del historial vuelve a como estaba
function IN_cancelar(){if(!IN.activa)return;IN.activa=false;IN.o=null;IN.practica=false;IN.fade=0;
  if(IN.hist0!=null&&typeof HIST!=='undefined'&&HIST&&HIST.totals){HIST.totals.secs=IN.hist0;if(typeof HIST_dirty!=='undefined')HIST_dirty=true;}}
function IN_omitir(){if(!IN.activa)return;if(!IN.practica)store.set(IN_KEY,'omitida');IN_terminar(false);}
function IN_terminar(completa){
  IN.activa=false;IN.o=null;
  if(IN.hist0!=null&&typeof HIST!=='undefined'&&HIST&&HIST.totals){HIST.totals.secs=IN.hist0;if(typeof HIST_dirty!=='undefined')HIST_dirty=true;}
  if(IN.practica){IN.practica=false;state='title';T=0;try{stopMusic();}catch(e){}return;}
  if(completa)store.set(IN_KEY,'vista');
  startLevel(0,false); // la misión de siempre, como si no hubiera habido intro
  players.forEach((p,j)=>{p.x=camX-14-j*16;});
  // entra caminando por la izquierda (cumplida.js); en táctil camina hasta pasar la palanca (xLibre de camara.js)
  if(typeof MC_entra!=='undefined'){MC_entra=55;IN.entra=240;} // y sigue caminando hasta pasar la palanca (ON_STEP)
  IN.fadeIn=14;if(completa&&!(typeof simpleDe==='function'&&simpleDe(0)))IN.avisoAvion=1;
}
// mientras dura la intro no se emite nada (ni partida, ni bajas, ni logros, ni historial)
{const e0=emit;emit=function(t,d){if(IN.activa)return;return e0(t,d);};}

// ================== el lugar ==================
function IN_armar(){
  const B=LEVELS[0];
  L=Object.create(B);L.arenas=[];L.events=[];L.end=IN_X.fondo;L.crates=[];L.prisoners=[];L.mechs=[];L.turrets=[];L.vaults=[];
  L.decor=(B.decor||[]).filter(d=>d.x<IN_X.fondo+40&&!(d.x>IN_X.ob-30&&d.x<IN_X.fin+20&&d.tall));
  const ob={x:IN_X.ob,y:GROUND-14,w:22,h:14};
  L.platforms=[{x:ob.x,y:ob.y,w:ob.w,intro:1}];
  platforms=L.platforms;LEVEL_END=L.end;
  enemies=[];crates=[];prisoners=[];allies=[];mechs=[];pickups=[];spawnQ=[];levelEvents=[];evIdx=0;arenaIdx=0;lock=null;eproj=[];
  if(typeof gato!=='undefined')gato=null;if(typeof gatoJaula!=='undefined')gatoJaula=null;
  if(typeof AY_x0!=='undefined')AY_x0=-1e4;               // sin la flecha "AVANZÁ" de ayuda.js
  T=typeof AY_OBJ_T==='number'?AY_OBJ_T+2:200;           // sin el cartel de objetivo (sale al empezar el combate)
  banner=null;toasts.length=0;
  players.forEach((p,j)=>{p.x=(typeof xLibre==='function'?xLibre(40,1):40)-j*16;p.y=GROUND-18;p.inv=0;}); // en táctil, nunca debajo de la palanca (camara.js), como startLevel
  IN.snap=players.map(p=>({weapons:{...p.weapons},weapon:p.weapon,bombs:p.bombs,hp:p.hp,shield:p.shield}));
  IN.score0=score;IN.kills0=kills;IN.flares0=flares;
  const muro=x=>({x:x-2,w:18,yTop:-40});
  const simple=typeof simpleDe==='function'&&simpleDe(0);
  IN.o={
    ob,
    caja:{x:IN_X.caja,y:GROUND-20,w:18,h:20,hp:3,max:3,flash:0,rota:false,muro:muro(IN_X.caja)},
    porton:{x:IN_X.porton,y:-40,w:14,h:GROUND+40,abre:0},
    dron:null,
    barr:{x:IN_X.barr,y:GROUND-24,w:20,h:24,golpe:0,rota:false,muro:muro(IN_X.barr),tiros:0},
    reja:{x:IN_X.reja,y:-40,w:14,h:GROUND+40,abre:simple?1:0},
    blancos:simple?[]:IN_X.blancos.map(x=>({x,y:GROUND-20,w:10,h:20,caido:0,golpe:0})),
    senal:{x:IN_X.senal,y:GROUND-40,w:8,h:40,on:false},
    piezas:[]};
  // el dron de práctica: está en enemies (así le pegan las balas y el apuntado automático de CONTROLES SIMPLES lo ve),
  // pero no tiene armas ni da puntos (kill lo maneja intro.js)
  const d={type:'practica',inPractica:true,x:IN_X.porton-60,y:GROUND-94,w:14,h:10,hp:3,max:3,face:-1,flash:0,cd:1e9,score:0,
    vx:0.55,ph:0,upd:IN_updDron,draw:IN_dibDron};
  enemies.push(d);IN.o.dron=d;
}
// ¿hay algo que corte el paso en x? (devuelve la x del borde izquierdo)
function IN_tope(){
  const o=IN.o;if(!o)return 1e9;
  if(!o.caja.rota)return o.caja.x;
  if(o.porton.abre<0.6)return o.porton.x;
  if(!o.barr.rota)return o.barr.x;
  if(o.reja.abre<0.6)return o.reja.x;
  return 1e9;
}
function IN_pasoActual(){
  const o=IN.o,px=Math.max(...players.filter(p=>!p.dead).map(p=>p.x));
  if(px<o.ob.x+o.ob.w+2)return 1;
  if(!o.caja.rota)return 2;
  if(o.porton.abre<0.6)return 3;
  if(!o.barr.rota)return 4;
  if(o.reja.abre<0.6)return 5;
  return 6;
}

// ================== cada cuadro ==================
ON_STEP.push(()=>{
  if(IN.fadeIn>0)IN.fadeIn--;
  // entrada después de la intro: en táctil sigue caminando hasta quedar a la derecha de la palanca (xLibre de camara.js)
  if(IN.entra>0){IN.entra--;const meta=typeof xLibre==='function'?xLibre(40):40;
    if(players.some(p=>!p.dead&&p.x-camX<meta)&&typeof MC_entra!=='undefined'&&MC_entra<3)MC_entra=3;
    if(!players.some(p=>!p.dead&&p.x-camX<meta))IN.entra=0;}
  if(IN.avisoAvion&&state==='play'&&!IN.activa&&!(typeof MC_activa==='function'&&MC_activa())){
    if(IN.avisoAvion++===40){const t=toast('AVIÓN','Gratis si tenés uno; si no, cuesta 1 ♥','#9ad0ff');t.ico='air';IN.avisoAvion=0;}}
  if(!IN.activa||state!=='play'||!IN.o)return;
  const o=IN.o;IN.t++;
  // sin gastar ni ganar nada (y sin daño)
  players.forEach((p,i)=>{const s=IN.snap[i];if(!s)return;
    for(const w in s.weapons)p.weapons[w]=s.weapons[w];if(!p.weapons[p.weapon]&&p.weapon!=='pistol')p.weapon=s.weapon;
    if(p.hp<s.hp)p.hp=s.hp;if(p.shield<s.shield)p.shield=s.shield;if(p.dead){p.dead=false;p.hp=s.hp;}});
  score=IN.score0;kills=IN.kills0;flares=Math.max(flares,1); // el avión de práctica es gratis
  // los muros, portones, la barricada y la reja cortan el paso; la pila de neumáticos solo de costado
  const tope=IN_tope();
  for(const p of players){if(p.dead)continue;
    if(p.x+8>tope){p.x=tope-8;if(p.vx>0)p.vx=0;}
    const b=o.ob;if(p.x+8>b.x&&p.x<b.x+b.w&&p.y+18>b.y+3){if(p.x+4<b.x+b.w/2)p.x=b.x-8;else p.x=b.x+b.w;p.vx=0;}}
  const paso=IN_pasoActual();
  if(paso!==IN.paso){IN.paso=paso;IN.espera=0;if(paso>1)IN_logro();}
  // trabado: tiempo cerca de la parada sin lograrla (lo que se intenta lo reinicia a medias)
  const p1=players.find(p=>!p.dead)||players[0];
  if(paso<6&&IN_cerca(paso,p1))IN.espera++;
  if(paso===1&&Math.abs(p1.vx||0)<0.1&&p1.x<70&&!IN_hayOtraCosa())IN.quieto++;else IN.quieto=0; // mientras lee un cartel no cuenta como trabado
  // balas contra la caja, la barricada, los blancos y los muros
  for(const b of pbul){if(b.gone)continue;
    const c=o.caja;
    if(!c.rota&&overlapPt(c,b.x,b.y,1.5)){b.gone=true;c.hp--;c.flash=4;spark(b.x,b.y,undefined,-Math.sign(b.vx)||1);SFX.hit();IN.espera=Math.min(IN.espera,120);
      if(c.hp<=0)IN_rompeCaja();continue;}
    if(!c.rota&&b.x>c.muro.x&&b.x<c.muro.x+c.muro.w&&b.y<c.y){b.gone=true;spark(b.x,b.y,'#9aa0a8');continue;}
    const r=o.barr;
    if(!r.rota&&(overlapPt(r,b.x,b.y,1.5)||(b.x>r.muro.x&&b.x<r.muro.x+r.muro.w&&b.y<r.y))){b.gone=true;
      if(b.y>=r.y){r.golpe=1;r.tiros++;spark(b.x,b.y,'#ffd25a',-Math.sign(b.vx)||1);if(T%3===0)tone('square',150,110,0.06,0.04);kick(0,0.3);}else spark(b.x,b.y,'#9aa0a8');continue;}
    if(o.reja.abre<0.6&&b.x>o.reja.x&&b.x<o.reja.x+o.reja.w&&b.y>0){/* la reja deja pasar las balas: se ve que rebotan en los blancos */}
    for(const t of o.blancos)if(t.caido<0.5&&overlapPt(t,b.x,b.y,1.5)){b.gone=true;t.golpe=1;spark(b.x,b.y,'#cfd6e0',-Math.sign(b.vx)||1);if(T%3===0)SFX.ping();break;}
  }
  if(!grens.some(g=>!g.gone&&!g.upd))IN_devolverGranada();
  // la granada que va hacia la barricada explota contra ella; las que pasan el muro de la caja, también
  for(const g of grens){if(g.gone||g.upd)continue;
    if(!o.barr.rota&&g.x>=o.barr.x-2&&g.x<o.barr.x+o.barr.w){g.x=o.barr.x-3;g.t=999;}
    else if(!o.caja.rota&&g.x>=o.caja.muro.x){g.x=o.caja.muro.x-3;g.t=999;}}
  // animaciones
  if(o.caja.flash>0)o.caja.flash--;if(o.barr.golpe>0)o.barr.golpe=Math.max(0,o.barr.golpe-0.08);
  for(const t of o.blancos){if(t.golpe>0)t.golpe=Math.max(0,t.golpe-0.1);if(t.caido>0&&t.caido<1)t.caido=Math.min(1,t.caido+0.06);}
  if(o.dron.gone&&o.porton.abre<1){if(o.porton.abre===0)IN_polvo(o.porton.x-4,GROUND-6,o.porton.w+8,4,8);o.porton.abre=Math.min(1,o.porton.abre+0.025);} // polvo al despegar del piso
  if(o.blancos.length&&o.blancos.every(t=>t.caido>=0.5)&&o.reja.abre<1){if(o.reja.abre===0)IN_suena('reja');o.reja.abre=Math.min(1,o.reja.abre+0.025);}
  for(const z of o.piezas){z.vy+=0.2;z.x+=z.vx;z.y+=z.vy;z.r+=z.vr;if(z.y>GROUND-2){z.y=GROUND-2;z.vy*=-0.3;z.vx*=0.6;z.vr*=0.5;}z.t++;}
  o.piezas=o.piezas.filter(z=>z.t<160);
  // fin de la zona segura
  const s=o.senal;
  if(!s.on&&p1.x+4>s.x-6){s.on=true;IN_suena('senal');}
  if(players.some(p=>!p.dead&&p.x>IN_X.fin)&&!IN.fade)IN.fade=1;
  if(IN.fade){IN.fade++;if(IN.fade>=14)IN_terminar(true);}
  // OMITIR con ENTER (no en los primeros cuadros: el ENTER de elegir personaje no la saltea)
  if(IN.t>30&&(pressed.start||(typeof pressed2!=='undefined'&&pressed2.start)))IN_omitir();
});
function IN_cerca(paso,p){const o=IN.o,x=p.x;
  return paso===1?x>o.ob.x-80:paso===2?x>o.caja.x-90:paso===3?x>o.porton.x-130:paso===4?x>o.barr.x-90:paso===5?x>o.reja.x-90:false;}
// el dron de práctica: va y viene arriba del portón, con el cable colgando
function IN_updDron(d){
  d.ph++;if(d.flash>0)d.flash--;
  const a=IN_X.porton-95,b=IN_X.porton+30;d.x+=d.vx;if(d.x<a){d.x=a;d.vx=Math.abs(d.vx);}if(d.x>b){d.x=b;d.vx=-Math.abs(d.vx);}
  d.face=d.vx>0?1:-1;d.y=GROUND-94+Math.sin(d.ph/14)*3;
  d.cable={x:IN_X.porton+7,y:GROUND-7}; // la argolla abajo del portón (arte-intro.js de Arte lo dibuja)
}
// lo que muere en la práctica no cuenta: ni bajas, ni puntos, ni medallas
{const k0=kill;kill=function(e,...a){if(e&&e.inPractica){if(e.gone)return;e.gone=true;IN_caeDron(e);return;}return k0(e,...a);};}
// explosiones: la granada abre la barricada; las bombas del avión tumban los blancos; una granada errada vuelve
{const b0=blast;blast=function(x,y,r,d,bm){const n=b0(x,y,r,d,bm);
  if(IN.activa&&IN.o){const o=IN.o;
    if(killSrc==='grenade'){
      if(!o.barr.rota&&Math.abs(x-(o.barr.x+o.barr.w/2))<r+o.barr.w/2&&y>o.barr.y-r)IN_rompeBarr();
      }
    if(killSrc==='air')for(const t of o.blancos)if(t.caido===0&&Math.abs(x-(t.x+t.w/2))<r+4){t.caido=0.01;tone('square',300,120,0.1,0.04);
      for(let i=0;i<5;i++)o.piezas.push({x:t.x+5,y:t.y+6,vx:rand(-1.5,1.5),vy:rand(-3,-1),r:0,vr:rand(-0.3,0.3),t:0,col:i%2?'#9aa0a8':'#c8a050'});}}
  return n;};}
// la granada de práctica vuelve al contador cuando ya no queda ninguna en el aire (explotó, se fue de la pantalla, abrió
// la barricada o no): nada se gasta y nunca queda trabado sin granadas
function IN_devolverGranada(){
  let n=0;players.forEach((p,i)=>{const s=IN.snap[i];if(s&&p.bombs<s.bombs){const a=p.bombs;p.bombs=s.bombs;n++;if(typeof RC_sumaJug==='function')RC_sumaJug(p,'gr',a,true);}});
  if(n)tone('sine',700,1050,0.12,0.04);
}
// lo que se logra suena y salta un poquito (sin texto)
function IN_logro(){[660,990].forEach((f,i)=>later(i*80,()=>tone('square',f,f,0.07,0.035)));}
function IN_suena(q){
  if(q==='reja'){noise(0.25,0.1,700);tone('square',200,120,0.2,0.04);}
  if(q==='senal'){[0,180].forEach(dt=>later(dt,()=>{tone('square',880,880,0.12,0.04);later(90,()=>tone('square',660,660,0.12,0.04));}));}
}
// se rompe A LA VISTA (prueba con personas: la caja quedaba dibujada y parecía cerrada): tablas que saltan, polvo y el hueco libre
function IN_polvo(x,y,w,h,n,col){for(let i=0;i<n;i++)parts.push({k:'p',x:x+Math.random()*w,y:y+Math.random()*h,vx:rand(-0.7,0.7),vy:rand(-0.9,-0.1),g:-0.004,life:44,maxl:44,size:3,col:col||(i%2?'rgba(150,130,110,0.7)':'rgba(120,104,92,0.6)')});}
function IN_rompeCaja(){const c=IN.o.caja;c.rota=true;SFX.down();noise(0.2,0.25,900);kick(0,0.6);if(typeof COMIC!=='undefined')try{COMIC.efecto('crash',{x:c.x+c.w/2,y:c.y});}catch(e){}
  for(let i=0;i<14;i++)IN.o.piezas.push({x:c.x+3+Math.random()*(c.w-6),y:c.y+3+Math.random()*(c.h-6),vx:rand(0.4,2.6)*(i%3?1:-0.6),vy:rand(-3.4,-0.8),r:0,vr:rand(-0.4,0.4),t:0,w:i%3?3:6,col:i%3===0?'#b07a3a':i%2?'#9a6a3a':'#6e4824'});
  IN_polvo(c.x,c.y+4,c.w,c.h-4,10);}
function IN_caeDron(d){SFX.hit();tone('square',900,200,0.3,0.04);explodeFx(d.x+d.w/2,d.y+d.h/2,8);
  for(let i=0;i<6;i++)IN.o.piezas.push({x:d.x+7,y:d.y+5,vx:rand(-1.5,1.5),vy:rand(-2,0),r:0,vr:rand(-0.3,0.3),t:0,col:i%2?'#7d8794':'#d9a43a'});IN_suena('reja');}
function IN_rompeBarr(){const r=IN.o.barr;r.rota=true;if(typeof COMIC!=='undefined')try{COMIC.efecto('crash',{x:r.x+r.w/2,y:r.y});}catch(e){}
  for(let i=0;i<14;i++)IN.o.piezas.push({x:r.x+3+Math.random()*(r.w-6),y:r.y+3+Math.random()*(r.h-6),vx:rand(-1.2,2.8),vy:rand(-3.5,-0.8),r:0,vr:rand(-0.4,0.4),t:0,w:i%3?3:6,col:i%3?'#5a3a22':'#9aa0a8'});
  IN_polvo(r.x,r.y+4,r.w,r.h-4,12);}

// ================== dibujo (de Arte si está IN_ARTE; si no, el de respaldo) ==================
const IN_art=n=>typeof IN_ARTE!=='undefined'&&IN_ARTE&&typeof IN_ARTE[n]==='function'?IN_ARTE[n]:null;
const IN_K='#120c18';
ON_DRAW.push(()=>{
  if(!IN.activa||!IN.o)return;const o=IN.o;
  const dib=(n,ob,f)=>{const a=IN_art(n);if(a)a(ob);else f(ob);};
  dib('obstaculo',o.ob,IN_dibOb);
  dib('caja',o.caja,IN_dibCaja);
  dib('porton',o.porton,IN_dibPorton);
  dib('barricada',o.barr,IN_dibBarr);
  dib('porton',o.reja,IN_dibPorton);
  for(const t of o.blancos)dib('blanco',t,IN_dibBlanco);
  dib('senal',o.senal,IN_dibSenal);
  // el cable del dron al portón
  const d=o.dron;if(d&&!d.gone&&!IN_art('dron')){ctx.strokeStyle='#2a2a30';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(d.x+d.w/2,d.y+d.h);ctx.quadraticCurveTo((d.x+o.porton.x)/2+6,d.y+30,o.porton.x+7,GROUND-70);ctx.stroke();}
  for(const z of o.piezas){const w=z.w||3;ctx.save();ctx.translate(z.x,z.y);ctx.rotate(z.r);ctx.fillStyle=IN_K;ctx.fillRect(-w/2-0.5,-1.5,w+1,3);ctx.fillStyle=z.col;ctx.fillRect(-w/2,-1,w,2);ctx.restore();}
});
function IN_dibOb(b){ // pila de neumáticos
  for(const[dx,dy]of[[0,7],[11,7],[5.5,0]]){const x=b.x+dx,y=b.y+dy;ctx.fillStyle=IN_K;ctx.fillRect(x-0.5,y-0.5,12,8);ctx.fillStyle='#2a2a30';ctx.fillRect(x,y,11,7);
    ctx.fillStyle='#4a4a54';ctx.fillRect(x,y,11,1.5);ctx.fillStyle='#16161a';ctx.fillRect(x+3.5,y+2.5,4,2);}
}
function IN_muro(m,hasta){ // pared de chapas de chatarra, desde arriba hasta el hueco
  const y0=m.yTop,h=hasta-y0;ctx.fillStyle=IN_K;ctx.fillRect(m.x-0.5,y0,m.w+1,h+0.5);
  for(let y=y0;y<hasta;y+=12){const k=((y/12)|0)%3;ctx.fillStyle=k===0?'#6a5040':k===1?'#5a6470':'#7a5a3a';ctx.fillRect(m.x,y,m.w,Math.min(11,hasta-y));
    ctx.fillStyle='rgba(255,255,255,0.18)';ctx.fillRect(m.x,y,m.w,1);ctx.fillStyle='#9aa0a8';ctx.fillRect(m.x+2,y+3,1,1);ctx.fillRect(m.x+m.w-3,y+3,1,1);}
  ctx.fillStyle='#3a2a20';ctx.fillRect(m.x-1,hasta-2,m.w+2,2);
}
function IN_dibCaja(c){
  IN_muro(c.muro,c.y);if(c.rota)return;
  const w=c.flash>0;ctx.fillStyle=IN_K;ctx.fillRect(c.x-0.5,c.y-0.5,c.w+1,c.h+1);ctx.fillStyle=w?'#fff':'#9a6a3a';ctx.fillRect(c.x,c.y,c.w,c.h);
  if(w)return;ctx.fillStyle='#6e4824';ctx.fillRect(c.x,c.y,c.w,1.5);ctx.fillRect(c.x,c.y+c.h-1.5,c.w,1.5);ctx.fillRect(c.x,c.y,1.5,c.h);ctx.fillRect(c.x+c.w-1.5,c.y,1.5,c.h);
  ctx.strokeStyle='#6e4824';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(c.x+1,c.y+1);ctx.lineTo(c.x+c.w-1,c.y+c.h-1);ctx.stroke();
  ctx.fillStyle=IN_K;if(c.hp<3)ctx.fillRect(c.x+4,c.y+5,2,3);if(c.hp<2){ctx.fillRect(c.x+12,c.y+12,3,2);ctx.fillRect(c.x+8,c.y+3,1,4);}
}
function IN_dibPorton(g){ // portón (o reja) alto que sube al abrirse
  const sube=g.abre*(GROUND-20),y0=g.y-sube,h=g.h;
  ctx.fillStyle=IN_K;ctx.fillRect(g.x-0.5,y0,g.w+1,h);
  for(let y=y0;y<y0+h;y+=6){ctx.fillStyle=((y-y0)/6|0)%2?'#4a4f5a':'#5c6270';ctx.fillRect(g.x,y,g.w,5);}
  ctx.fillStyle='#d9a43a';for(let y=y0+h-14;y<y0+h-4;y+=4)ctx.fillRect(g.x+2,y,g.w-4,1.5); // franja de peligro abajo
  ctx.fillStyle='#3a2a20';ctx.fillRect(g.x-3,GROUND-2,g.w+6,2);
}
function IN_dibBarr(r){
  IN_muro(r.muro,r.y);if(r.rota)return;
  const sx=r.golpe>0?((T>>1)%2?1:-1)*r.golpe:0,x=r.x+sx;
  ctx.fillStyle=IN_K;ctx.fillRect(x-0.5,r.y-0.5,r.w+1,r.h+1);
  for(let i=0;i<4;i++){ctx.fillStyle=i%2?'#5a3a22':'#6e4824';ctx.fillRect(x,r.y+i*6,r.w,5);}
  ctx.strokeStyle='#3a2414';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+1,r.y+2);ctx.lineTo(x+r.w-1,r.y+r.h-2);ctx.moveTo(x+r.w-1,r.y+2);ctx.lineTo(x+1,r.y+r.h-2);ctx.stroke();
  ctx.fillStyle='#9aa0a8';for(const[a,b]of[[2,2],[r.w-4,2],[2,r.h-4],[r.w-4,r.h-4]])ctx.fillRect(x+a,r.y+b,2,2);
}
function IN_dibBlanco(t){ // muñeco de lata en una estaca
  const ang=t.caido*1.4,sx=t.golpe>0?((T>>1)%2?0.6:-0.6):0;
  ctx.save();ctx.translate(t.x+t.w/2+sx,t.y+t.h);ctx.rotate(ang);
  ctx.fillStyle='#3a2a20';ctx.fillRect(-1,-8,2,8);
  ctx.fillStyle=IN_K;ctx.fillRect(-5.5,-20.5,11,13);ctx.fillStyle='#8a929e';ctx.fillRect(-5,-20,10,12);ctx.fillStyle='#b8c0ca';ctx.fillRect(-5,-20,10,2);
  ctx.fillStyle='#d93a2b';ctx.fillRect(-3,-16,6,6);ctx.fillStyle='#ffe8b0';ctx.fillRect(-1.5,-14.5,3,3);ctx.fillStyle='#d93a2b';ctx.fillRect(-0.5,-13.5,1,1);
  ctx.restore();
}
function IN_dibSenal(s){
  ctx.fillStyle=IN_K;ctx.fillRect(s.x+2.5,s.y+8,3,s.h-8);ctx.fillStyle='#5a5f6a';ctx.fillRect(s.x+3,s.y+8,2,s.h-8);
  ctx.fillStyle=IN_K;ctx.fillRect(s.x-0.5,s.y-0.5,s.w+1,10);ctx.fillStyle='#2a2a30';ctx.fillRect(s.x,s.y,s.w,9);
  const on=s.on,col=on?((T>>3)%2?'#ff3b30':'#a02a1a'):'#5ad07a';ctx.fillStyle=col;circle(s.x+4,s.y+4.5,2.6);
  if(on){ctx.fillStyle='rgba(255,59,48,0.25)';circle(s.x+4,s.y+4.5,6);}
}
function IN_dibDron(d){
  const a=IN_art('dron');if(a){a(d);return;}
  const w=d.flash>0,x=Math.round(d.x),y=Math.round(d.y);
  ctx.fillStyle=IN_K;ctx.fillRect(x-0.5,y+2.5,d.w+1,7);ctx.fillStyle=w?'#fff':'#c8a050';ctx.fillRect(x,y+3,d.w,6);ctx.fillStyle=w?'#fff':'#e8c070';ctx.fillRect(x,y+3,d.w,1.5);
  ctx.fillStyle='#9ad0ff';ctx.fillRect(x+(d.face>0?9:2),y+5,3,2);
  const r=(T>>1)%2?6:3;ctx.fillStyle='rgba(225,225,235,0.75)';ctx.fillRect(x+3-r/2,y,r,1);ctx.fillRect(x+11-r/2,y,r,1);
  ctx.fillStyle=IN_K;ctx.fillRect(x+3,y+1,1,2);ctx.fillRect(x+11,y+1,1,2);
}

// ================== HUD: omitir, la teclita cuando alguien se traba y los fundidos ==================
// rectángulo del botón OMITIR (para el táctil de Publicación: window.OXIDO_INTRO.rect())
function IN_rectOmitir(){const k=IN_teclaOmitir(),w=botonW('OMITIR',k,5);return{x:Math.round(W/2-w/2),y:20,w,h:TXT_aj(5)+5};}
function IN_txtOmitir(){return onTouch()?'OMITIR':onPad()?'OMITIR: PAUSA '+btn('opt'):'OMITIR: '+btn('start');}
const IN_teclaOmitir=()=>onTouch()?null:onPad()?btn('opt'):btn('start'); // la tecla va adentro del botón, en chico
ON_HUD.push(()=>{
  if(IN.fadeIn>0){ctx.fillStyle=`rgba(0,0,0,${(IN.fadeIn/14).toFixed(3)})`;cubrir();}
  if(!IN.activa||state!=='play'||!IN.o)return;
  // OMITIR, chico, arriba al centro (clic o toque)
  const r=IN_rectOmitir();botonUI(r.x,r.y,r.w,r.h,'OMITIR',IN_teclaOmitir(),{size:5,clic:IN_omitir,nombre:'omitir'}); // botón de verdad (prueba con personas)
  // la teclita del que se trabó: una sola, al lado del objeto
  const pista=IN_pista();
  if(pista){const k=Math.min(1,(IN.espera-IN_ESPERA)/20),bob=Math.round(Math.sin(T/8)*1.2);ctx.globalAlpha=k;
    let x=HX(pista.x),y=HY(pista.y)+bob;const ws=pista.k.map(s=>keycapW(s)),tw=ws.reduce((a,b)=>a+b,0)+(ws.length-1)*2;x-=tw/2;
    {const lb=typeof tactilLibre==='function'?tactilLibre():null;if(lb)x=clamp(x,lb.x0+4,lb.x1-4-tw);} // táctil: nunca debajo de la palanca ni del rombo (Publicación)
    for(let i=0;i<pista.k.length;i++){keycap(pista.k[i],x,y,'#ffe08a');x+=ws[i]+2;}ctx.globalAlpha=1;}
  if(IN.fade){ctx.fillStyle=`rgba(0,0,0,${(IN.fade/14).toFixed(3)})`;cubrir();}
});
const IN_ESPERA=240; // ~4 s trabado en una parada
const IN_hayOtraCosa=()=>typeof cartelOcupado==='function'&&cartelOcupado(); // con un cartel en pantalla la teclita espera (no compiten)
function IN_pista(){
  const o=IN.o,simple=typeof simpleDe==='function'&&simpleDe(0);
  if(IN.paso===1&&IN.quieto>IN_ESPERA)return{x:players[0].x+20,y:players[0].y-4,k:['→']}; // como las demás: ~4 s quieto, no antes
  if(IN.espera<IN_ESPERA||IN_hayOtraCosa())return null;
  switch(IN.paso){
  case 1:return{x:o.ob.x+o.ob.w/2,y:o.ob.y-12,k:[btn('jump',0)]};
  case 2:return{x:o.caja.x+o.caja.w/2,y:o.caja.y-12,k:[btn('shoot',0)]};
  case 3:{const d=o.dron;return{x:d.x+d.w/2,y:d.y+16,k:simple?[btn('shoot',0)]:[onTouch()?'↑':btn('up',0),btn('shoot',0)]};}
  case 4:return{x:o.barr.x+o.barr.w/2,y:o.barr.y-12,k:[btn('bomb',0)]};
  case 5:{const b=o.blancos[2]||o.blancos[0];return b?{x:b.x+5,y:b.y-14,k:[typeof airKey==='function'&&airKey()?airKey():btn('air',0)]}:null;} // teclado: la tecla 6; mando y pantalla: su botón
  }
  return null;
}
// para los controles táctiles (Publicación): saber si está la intro, omitirla y dónde está el botón
window.OXIDO_INTRO={activa:()=>IN.activa,omitir:()=>IN_omitir(),rect:()=>IN.activa&&!(typeof AP!=='undefined'&&AP.on)?IN_rectOmitir():null}; // durante la apertura no hay OMITIR
