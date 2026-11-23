'use strict';
// Óxido · CAMINOS EN CAPAS (Óxido 2.0, C) y DE A DOS EN CAMINOS DISTINTOS (D). Prefijo CA_.
// ---------------------------------------------------------------------------------------------------------------
// Una misión con caminos tiene L.caminos (si no lo tiene, nada de este archivo cambia nada):
//   yMin, yMax     alto del mundo: la cámara sube hasta yMin (camino de ARRIBA) y baja hasta yMax (camino de ABAJO).
//                  El camino del MEDIO es el de siempre (piso en GROUND) y SIEMPRE se puede terminar.
//   bajos:[{x0,x1,piso,sup}]   tramos con agua debajo del piso del medio: el piso del medio es una tabla (CA_DECK de
//                  grueso) y abajo hay agua desde sup hasta el fondo (piso). Ahí se NADA.
//   huecos:[{x,w,ent}]   agujeros en la tabla del medio: por ahí se cae al agua y por ahí se sale saltando (ent:true
//                  es la entrada, con luz y cartel; los demás también sirven para salir).
//   altos:[{x0,x1,sube}] tramos del camino de ARRIBA (plataformas normales con y alto, marcadas ca:'grua'); sube es la x
//                  donde está la entrada (cartel con luz).
//   minas:[{x,y}], premios:[{x,y,kind}]   lo que hay abajo (y arriba).
// Reglas: los caminos se juntan antes de cada jefe (los tramos terminan antes de las arenas); arriba hay armas y
// munición, abajo vidas, corazones y un prisionero escondido; el trazado es fijo y lo que cambia por partida son los
// premios y algunos enemigos (variarPartida).
// Quién cae por un hueco: solo los jugadores a pie y los enemigos de a pie (que se pierden en el agua). Amigos, gato,
// premios, el Grillo y los vehículos pasan por arriba (los amigos y el gato lo saltan).
// Un enemigo no dispara si su blanco está en otra capa (lejos en vertical): nadie te tira desde fuera de tu vista.
//
// DE A DOS (D) — 23 nov, FOCO EN UN JUGADOR: sin pantalla partida. La cámara sigue al J1. Si el J2 se va por otro
// camino, arranca enseguida un conteo de 3 s (borde rojo y cartel); si no vuelve, pierde una vida y una BURBUJA lo trae
// junto al J1 (sin vidas: afuera). Mientras dura el conteo la cámara no lo deja atrás. (Lo de abajo, de la versión con
// pantalla partida, queda escrito pero CA_decidir ya no la prende.)
// DE A DOS (D), versión anterior:
//   · Si los dos no entran en la pantalla ni con el zoom abierto (uno arriba y otro abajo), la pantalla se PARTE en dos
//     franjas, una por jugador (la de arriba es la del que está más arriba). Comparten el avance (camX) y cada una tiene
//     su propia altura de cámara. CA_vistas() le dice a renderMain qué dibujar.
//   · Distancia máxima: el ancho de la pantalla. Partida la pantalla, la cámara no deja atrás a nadie: si el que va
//     adelante sigue y el de atrás no puede (pared del agua, por ejemplo), quedan los dos contra los bordes. Desde
//     CA_AVISO px de distancia se avisa (borde rojo en la franja del de atrás y cartel); en el límite arranca un conteo
//     de 3 s. Al terminar, el de atrás PIERDE UNA VIDA y una BURBUJA lo lleva flotando hasta el compañero; sin vidas,
//     queda afuera y sigue el otro (vuelve si aparece una vida, como siempre). Vale siempre que vayan por caminos
//     distintos, aunque la pantalla no esté partida (uno en el agua y el otro en el muelle entran juntos).
// Lo que usan otros archivos:
//   CA_on() · CA_yMin()/CA_yMax() (camara.js) · CA_land(o,prevBottom) (mundo.js land) · CA_nada(p)/CA_nadar(p,c,D)/
//   CA_paredes(p) (jugador.js) · CA_piso(x,y) (balas, granadas, partes, premios) · CA_vistas() (juego.js renderMain) ·
//   CA_partida (true con la pantalla partida) · CA_camLimite() (juego.js updCam).
const CA_DECK=7,CA_AVISO=40,CA_CONTEO=180;
const CA_on=()=>!!(L&&L.caminos);
const CA_yMin=()=>CA_on()?L.caminos.yMin:0;
const CA_yMax=()=>CA_on()?L.caminos.yMax:H;
let CA_partida=false,CA_vistaY=[0,0],CA_lim=null,CA_avisado=false,CA_dibujando=0;
function CA_bajo(x){if(!CA_on())return null;for(const b of L.caminos.bajos||[])if(x>=b.x0&&x<=b.x1)return b;return null;}
function CA_hueco(cx){if(!CA_on())return null;for(const h of L.caminos.huecos||[])if(cx>h.x+1&&cx<h.x+h.w-1)return h;return null;}
// ¿está abajo de la tabla del medio? (los pies más abajo que la tabla, dentro de un tramo con agua)
const CA_abajo=o=>!!(CA_bajo(o.x+(o.w||8)/2)&&o.y+(o.h||18)>GROUND+2);
// en qué camino anda: 'alto', 'medio' o 'bajo'
function CA_capa(p){const o=p.ride||p;if(CA_abajo(o))return'bajo';if(o.y+(o.h||18)<40)return'alto';return'medio';}
// piso para cosas sueltas (balas, granadas, premios, partes): el fondo del agua si están abajo o cayendo por un hueco
function CA_piso(x,y){if(!CA_on())return GROUND;const b=CA_bajo(x);if(b&&(y>GROUND+1||CA_hueco(x)))return b.piso;return GROUND;}

// ================== física: piso con huecos, fondo del agua y techo ==================
// mundo.js land() lo llama primero: devuelve true si ya resolvió (y deja onGround/plat listos)
function CA_land(o,prevBottom){
  if(!CA_on())return false;
  const cx=o.x+(o.w||8)/2,b=CA_bajo(cx);if(!b)return false;
  const pie=o.y+o.h;
  const cae=players.includes(o)||(enemies.includes(o)&&!isBoss(o)&&!o.air&&o.type!=='drone');
  // ya está abajo: el fondo del agua es el piso
  if(prevBottom>GROUND+2){
    if(pie>=b.piso){o.y=b.piso-o.h;o.vy=0;o.onGround=true;o.plat=null;return true;}
    o.onGround=false;o.plat=null;return true;}
  // cruza la tabla desde arriba: si hay hueco y es de los que caen, sigue de largo
  if(pie>=GROUND&&cae&&CA_hueco(cx)){o.onGround=false;o.plat=null;return true;}
  return false;
}
// paredes del agua: abajo no se sale del tramo; y el techo es la tabla (salvo debajo de un hueco)
function CA_paredes(p){
  if(!CA_on()||!CA_abajo(p))return;const b=CA_bajo(p.x+4);
  p.x=clamp(p.x,b.x0+1,b.x1-9);
  if(!CA_hueco(p.x+4)&&p.y<GROUND+CA_DECK+1){p.y=GROUND+CA_DECK+1;if(p.vy<0)p.vy=0;}
}
// nado: el centro del jugador está debajo de la superficie
function CA_nada(p){if(!CA_on())return false;const b=CA_bajo(p.x+4);return!!(b&&p.y+9>b.sup-1&&p.y+p.h>GROUND+2);}
function CA_nadar(p,c,D){
  const b=CA_bajo(p.x+4);p.airJ=0;p.vx*=0.72;
  if(!p.mojado){p.mojado=true;CA_chapuzon(p.x+4,b.sup,p.vy);p.vy*=0.25;}
  const hueco=CA_hueco(p.x+4),enSup=hueco&&p.y+9<=b.sup+3;
  if(tapped('jump')&&enSup){p.vy=-c.jump*1.02;p.onGround=false;SFX.jump();CA_chapuzon(p.x+4,b.sup,-1);} // salir por el hueco
  else if(held('jump'))p.vy=Math.max(p.vy-0.2,-1.6);
  else if(D)p.vy=Math.min(p.vy+0.16,1.5);
  else p.vy=p.vy>0.5?p.vy*0.92:Math.min(p.vy+0.04,0.5);   // se hunde despacito
  p.y+=p.vy;
  // flota en la superficie (debajo de un hueco) salvo que esté saliendo
  if(hueco&&p.y+9<b.sup&&p.vy>-2.4){p.y=b.sup-9;p.vy=Math.max(0,p.vy);}
  // burbujitas al nadar
  if(T%14===0)parts.push({k:'p',x:p.x+4+p.face*3,y:p.y+3,vx:rand(-0.1,0.1),vy:-0.5,g:-0.01,life:30,maxl:30,size:1,col:'#bfe4ff'});
}
function CA_chapuzon(x,y,vy){
  try{if(SFX.splash)SFX.splash();}catch(e){}
  for(let i=0;i<8;i++)parts.push({k:'p',x:x+rand(-5,5),y:y-1,vx:rand(-1,1),vy:rand(-2.4,-0.8),g:0.15,life:22,maxl:22,size:1,col:'#cfe2f6'});
  parts.push({k:'ring',x,y,r:2,max:9,life:12,maxl:12,col:'200,225,250'});
}
// fuera del agua otra vez: la próxima vez que entre, chapuzón
ON_STEP.push(()=>{if(!CA_on())return;for(const p of players){if(p.dead)continue;if(p.mojado&&!CA_nada(p))p.mojado=false;
  if(p.reaparece&&p.onGround)p.reaparece=0;}});

// ================== enemigos, amigos y gato ==================
// los enemigos de a pie que caen al agua se pierden (con chapuzón); nadie dispara a otra capa
{const ue0=updEnemy;updEnemy=function(e){
  if(CA_on()&&!isBoss(e)){
    if(CA_abajo(e)&&!e.nada){const b=CA_bajo(e.x+e.w/2);CA_chapuzon(e.x+e.w/2,b.sup,1);e.gone=true;return;}
    if(!e.nada&&e.cd!==undefined&&Math.abs((e.y+e.h/2)-(P.y+9))>110&&e.cd<20)e.cd=20;}
  ue0(e);};}
// amigos y gato saltan los huecos (nunca bajan)
ON_STEP.push(()=>{
  if(!CA_on())return;
  const salta=o=>{if(!o||!o.onGround||o.y+(o.h||10)<GROUND-1)return;const cx=o.x+(o.w||8)/2,dir=Math.sign(o.vx||0)||1;
    for(const h of L.caminos.huecos||[])if(cx+dir*10>h.x-2&&cx+dir*10<h.x+h.w+2&&!(cx>h.x&&cx<h.x+h.w)){o.vy=-4.6;o.onGround=false;o.plat=null;return;}};
  for(const a of allies)salta(a);if(typeof gato!=='undefined'&&gato)salta(gato);
});

// ================== minas del agua ==================
// Esfera de chapa con pinchos atada al fondo con una cadena; sube y baja despacio. Un tiro la revienta; si la tocás,
// explota (1 golpe). Antes de explotar por contacto parpadea un instante.
function CA_mkMina(x,y){return{type:'ca_mina',nada:true,air:true,x:x-5,y:y-5,w:10,h:10,baseY:y-5,hp:1,score:100,flash:0,t:rand(0,99),cd:undefined,
  upd:CA_updMina,draw:CA_drawMina,onKill:CA_killMina};}
function CA_updMina(e){e.t++;e.y=e.baseY+Math.sin(e.t/40)*2.5;if(e.flash>0)e.flash--;
  for(const p of players)if(!p.dead&&!p.burbuja&&overlap(hurtbox(p),{x:e.x+1,y:e.y+1,w:8,h:8})){withP(p,()=>hurtPlayer(1));e.hp=0;kill(e);break;}}
function CA_killMina(e){explodeFx(e.x+5,e.y+5,12);for(let i=0;i<10;i++)parts.push({k:'p',x:e.x+5,y:e.y+5,vx:rand(-1,1),vy:rand(-1.4,-0.2),g:-0.02,life:30,maxl:30,size:1,col:'#bfe4ff'});}
function CA_drawMina(e){
  const b=CA_bajo(e.x+5),cx=e.x+5,cy=e.y+5,fl=e.flash>0;
  if(b){ctx.strokeStyle='rgba(60,70,80,0.8)';ctx.lineWidth=0.6;ctx.beginPath();for(let y=cy+5;y<b.piso;y+=3){ctx.moveTo(cx,y);ctx.lineTo(cx+(y%6?0.8:-0.8),y+2);}ctx.stroke();}
  ctx.fillStyle=fl?'#fff':'#4a525c';for(let i=0;i<8;i++){const a=i*Math.PI/4;ctx.fillRect(q(cx+Math.cos(a)*5.4-0.6),q(cy+Math.sin(a)*5.4-0.6),1.4,1.4);}
  ctx.fillStyle=fl?'#fff':'#3a4048';circle(cx,cy,4.4);ctx.fillStyle=fl?'#fff':'#5a636e';circle(cx-1,cy-1,2.4);
  ctx.fillStyle=(T>>4)%2?'#ff5a3c':'#7a2a1a';ctx.fillRect(q(cx-0.5),q(cy-0.5),1,1);
}
ENEMY_MAKERS.ca_mina=CA_mkMina;

// ================== arranque de cada misión con caminos ==================
let CA_minas=[];
ON_START.push(()=>{
  CA_partida=false;CA_lim=null;CA_avisado=false;CA_minas=[];
  if(!CA_on())return;const C=L.caminos;
  CA_minas=(C.minas||[]).map(m=>({...m,ok:false}));
  for(const k of C.premios||[])pickups.push({kind:k.kind==='?'?pick(['S','H','F','R']):k.kind,x:k.x,y:k.y-10,w:10,h:10,vy:0,life:1e9,ca:true,piso:k.y});
  for(const c of C.cajas||[])crates.push({x:c.x,drop:c.drop==='?'?pick(['S','H','F','R','G']):c.drop,y:c.y-14,w:14,h:14,hp:3,flash:0});
  for(const p of players){p.burbuja=null;p.mojado=false;}
  CA_vistaY=[camY,camY];
});
// las minas aparecen cuando la cámara se acerca (no ocupan la lista de enemigos antes)
ON_STEP.push(()=>{if(!CA_on())return;for(const m of CA_minas)if(!m.ok&&m.x<camX+VW+80){m.ok=true;enemies.push(CA_mkMina(m.x,m.y));}});
// el prisionero escondido abajo nunca se suma como amigo (no sabría salir del agua): da su premio
{const vp0=variarPartida;variarPartida=function(){vp0();if(CA_on())for(const pr of prisoners)if(pr.y>GROUND)pr.kind='item';};}

// ================== reaparecer en otra capa ==================
// el que vuelve aparece cerca del compañero, en su capa (si el compañero nada, aparece nadando a su lado)
{const rp0=respawnPlayer;respawnPlayer=function(p){rp0(p);if(!CA_on())return;
  const o=players.find(q=>q!==P&&!q.dead);
  if(o&&CA_capa(o)!=='medio'){const ob=o.ride||o;P.x=clamp(ob.x+(o.face>0?-14:14),camX+4,camX+VW-14);P.y=ob.y-6;P.vy=0;}
  else P.reaparece=1;};}

// ================== DE A DOS: pantalla partida, distancia y burbuja ==================
// ¿hace falta partir? solo si los dos no entran ni con el zoom abierto del todo (con margen para no ir y venir)
function CA_decidir(){
  CA_partida=false;return; // sin pantalla partida (23 nov)
  const vivos=players.filter(p=>!p.dead&&!p.burbuja);
  if(!CA_on()||vivos.length<2||lock){CA_partida=false;return;}
  const ys=vivos.map(p=>{const o=p.ride||p;return[o.y,o.y+(o.h||18)];}),top=Math.min(ys[0][0],ys[1][0]),bot=Math.max(ys[0][1],ys[1][1]);
  const esp=bot-top+34;
  if(!CA_partida&&esp>HC*1.02){CA_partida=true;CA_vistaY=[camY,camY];setBanner('PANTALLA PARTIDA',50);}
  else if(CA_partida&&esp<HC*0.86)CA_partida=false;
}
// alto de cada franja (en unidades del mundo) y su cámara: cada una sigue a su jugador
function CA_vistasUpd(){
  if(!CA_partida)return;
  const vivos=players.filter(p=>!p.dead&&!p.burbuja).sort((a,b)=>(a.ride||a).y-(b.ride||b).y);
  const vh=HC/2/ZOOM;
  vivos.forEach((p,i)=>{const o=p.ride||p,meta=clamp(o.y+(o.h||18)/2-vh*0.55,CA_yMin(),CA_yMax()-vh);
    CA_vistaY[i]+=(meta-CA_vistaY[i])*0.15;if(Math.abs(meta-CA_vistaY[i])<0.05)CA_vistaY[i]=meta;
    CA_vistaY[i]=clamp(CA_vistaY[i],o.y-4-vh*0.25,o.y+(o.h||18)+4-vh*0.25);CA_vistaY[i]=clamp(CA_vistaY[i],CA_yMin(),CA_yMax()-vh);});
  CA_vistas.orden=vivos;
}
// para renderMain: [{camY,y0,h,p}] (y0 y h en unidades del lienzo, de 0 a HC) o null si no está partida
function CA_vistas(){if(!CA_partida||!CA_vistas.orden||CA_vistas.orden.length<2)return null;
  return[{camY:CA_vistaY[0],y0:0,h:HC/2,p:CA_vistas.orden[0]},{camY:CA_vistaY[1],y0:HC/2,h:HC/2,p:CA_vistas.orden[1]}];}
// ¿van por caminos distintos? (uno arriba o abajo y el otro en otra capa)
function CA_separados(){const v=players.filter(p=>!p.dead&&!p.burbuja);return CA_on()&&v.length>1&&!lock&&(CA_partida||CA_capa(v[0])!==CA_capa(v[1]));}
// updCam: si van por caminos distintos la cámara no deja atrás a nadie (el que va adelante choca contra el borde derecho)
function CA_camLimite(){if(!CA_separados())return 1e9;let m=1e9;for(const p of players)if(!p.dead&&!p.burbuja){const o=p.ride||p;m=Math.min(m,o.x-4);}return m;}
// la regla de la distancia: aviso, conteo y burbuja
function CA_distancia(){
  if(!CA_separados()){CA_lim=null;return;}
  const vivos=players.filter(p=>!p.dead&&!p.burbuja);if(vivos.length<2){CA_lim=null;return;}
  // el que se fue es el J2 (la cámara sigue al J1); si el J1 no está, nadie
  const atras=players[1];if(!atras||atras.dead||atras.burbuja||players[0].dead){CA_lim=null;return;}
  if(!CA_lim||CA_lim.p!==atras){CA_lim={p:atras,t:0,conteo:true,c:CA_CONTEO};try{SFX.alarm();}catch(e){}}
  const Lc=CA_lim;Lc.t++;Lc.c--;if(Lc.c%60===0&&Lc.c>0)try{SFX.swap();}catch(e){}
  if(Lc.c<=0){CA_quedoAtras(atras);CA_lim=null;}
  return;
  const [a,b]=vivos,xa=(a.ride||a).x,xb=(b.ride||b).x,d=Math.abs(xa-xb),lim=VW-26;
  if(d<lim-CA_AVISO){CA_lim=null;return;}
  if(!CA_lim||CA_lim.p!==atras)CA_lim={p:atras,t:0,conteo:false};
  const L0=CA_lim;L0.t++;
  if(d>=lim-6){if(!L0.conteo){L0.conteo=true;L0.c=CA_CONTEO;try{SFX.alarm();}catch(e){}}
    L0.c--;if(L0.c%60===0&&L0.c>0)try{SFX.swap();}catch(e){}
    if(L0.c<=0){CA_quedoAtras(atras);CA_lim=null;}}
  else if(L0.conteo){L0.conteo=false;}
}
// el de atrás pierde una vida y una burbuja lo lleva hasta el compañero (sin vidas: afuera)
function CA_quedoAtras(p){
  const o=p.ride||p;
  if(p.ride&&typeof ejectMech==='function')try{withP(p,()=>ejectMech(p.ride));}catch(e){}
  for(let i=0;i<10;i++)parts.push({k:'p',x:p.x+4,y:p.y+9,vx:rand(-1,1),vy:rand(-1.6,-0.3),g:0.05,life:24,maxl:24,size:1,col:'#ff8a6a'});
  if(lives>0){lives--;p.burbuja={t:0,x0:p.x,y0:p.y};p.inv=Math.max(p.inv,200);p.vx=p.vy=0;p.mojado=false;
    setBanner('JUGADOR '+(p.slot+1)+': −1 VIDA · ¡LA BURBUJA TE LLEVA!',110);try{SFX.hurt();}catch(e){}}
  else{p.dead=true;p.deadT=0;p.out=true;setBanner('JUGADOR '+(p.slot+1)+': QUEDÓ ATRÁS · SIN VIDAS',110);try{SFX.hurt();}catch(e){}}
  CA_partida=false;
}
// la burbuja: sube un poco, cruza en curva hasta el compañero (el J1) y revienta al lado suyo
function CA_burbujaUpd(p){
  const B=p.burbuja,o=players.find(q=>q!==p&&!q.dead&&!q.burbuja);B.t++;
  if(!o){p.burbuja=null;return;}
  const ob=o.ride||o,tx=clamp(ob.x+(o.face>0?-14:14),camX+6,camX+VW-16),ty=ob.y-14,k=Math.min(1,B.t/110),e=k*k*(3-2*k);
  p.x=B.x0+(tx-B.x0)*e;p.y=B.y0+(ty-B.y0)*e-Math.sin(k*Math.PI)*40;p.face=tx>B.x0?1:-1;
  if(T%8===0)parts.push({k:'p',x:p.x+4+rand(-6,6),y:p.y+9+rand(-6,6),vx:0,vy:-0.3,g:-0.01,life:20,maxl:20,size:1,col:'#cfeaff'});
  if(k>=1){p.burbuja=null;p.vy=-1;p.onGround=false;p.plat=null;p.inv=Math.max(p.inv,90);
    parts.push({k:'ring',x:p.x+4,y:p.y+9,r:4,max:16,life:12,maxl:12,col:'200,235,255'});
    for(let i=0;i<8;i++)parts.push({k:'p',x:p.x+4,y:p.y+9,vx:rand(-1.4,1.4),vy:rand(-1.4,0.4),g:0.05,life:18,maxl:18,size:1,col:'#e8f6ff'});
    try{SFX.pick();}catch(e){}}
}
{const up0=updPlayer;updPlayer=function(){if(P&&P.burbuja&&!P.dead){CA_burbujaUpd(P);if(P.inv>0)P.inv--;return;}up0();};}
// (hurtPlayer: dentro de la burbuja no se recibe daño)
{const hp0=hurtPlayer;hurtPlayer=function(n){if(P&&P.burbuja)return;return hp0(n);};}
ON_STEP.push(()=>{CA_decidir();CA_vistasUpd();CA_distancia();});

// ================== dibujo ==================
// la burbuja alrededor del jugador, el borde rojo y el conteo en la franja del que quedó atrás
{const dt0=drawPlayerTag;drawPlayerTag=function(){dt0();const p=P;if(!p||!p.burbuja)return;
  const cx=p.x+4,cy=p.y+9,r=14+Math.sin(T/6)*0.8;
  ctx.fillStyle='rgba(170,220,255,0.18)';circle(cx,cy,r);ctx.strokeStyle='rgba(220,245,255,0.8)';ctx.lineWidth=0.8;ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.75)';ctx.beginPath();ctx.ellipse(cx-r*0.45,cy-r*0.5,3,1.6,-0.6,0,7);ctx.fill();};}
// encima del mundo de cada franja (lo llama renderMain después del mundo): aviso de distancia
function CA_dibujarFranja(v){
  const Lm=CA_lim;if(!Lm)return;if(!v)v={y0:0,h:HC,p:Lm.p};if(v.p!==Lm.p)return;
  const a=Lm.conteo?(0.55+0.35*((T>>3)%2)):0.35*Math.min(1,Lm.t/20);
  ctx.save();ctx.setTransform(S,0,0,S,0,0);
  ctx.strokeStyle=`rgba(255,60,40,${a})`;ctx.lineWidth=3;ctx.strokeRect(1.5,v.y0+1.5,W-3,v.h-3);
  const n=Lm.conteo?Math.max(1,Math.ceil(Lm.c/60)):0;
  pxTxt('JUGADOR 2: ¡VOLVÉ CON EL JUGADOR 1! '+n,W/2,v.y0+v.h-14,'#ffb0a0','center',typeof ACC!=='undefined'&&ACC.txt==='grande'?2:1);
  ctx.restore();
}
// línea entre las dos franjas
function CA_dibujarCorte(){ctx.save();ctx.setTransform(S,0,0,S,0,0);ctx.fillStyle='#0a0810';ctx.fillRect(0,HC/2-1,W,2);ctx.fillStyle='rgba(243,201,105,0.6)';ctx.fillRect(0,HC/2-0.25,W,0.5);ctx.restore();}
