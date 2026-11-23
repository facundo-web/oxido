'use strict';
// Óxido · Cámara con zoom (TAMAÑO: GRANDE / NORMAL)
// El mundo se dibuja más grande y el HUD queda igual. Lo que se ve del mundo es VW × VH (en unidades del juego):
// camX es el borde izquierdo y camY el de arriba. Todo lo que pregunta "¿está en pantalla?" usa camX+VW.
// · Sigue al jugador también en vertical, con suavidad y un margen (plataformas altas, jetpack del Grillo).
// · Si hay voladores cerca, sube un poco para que los drones no aparezcan de golpe por arriba.
// · En las arenas de jefe (grande o chico) el zoom se abre hasta ver la arena entera, con una transición suave.
// · camY nunca sale de 0…H-VH: con zoom no se ve nada que antes no se viera.
const ZOOM_GRANDE=1.35;
let tamano=store.get('oxido-tamano')==='normal'?'normal':'grande';
let ZOOM=1,VW=W,VH=H,camY=0;
// VH nunca pasa de H: si el lienzo es más alto que el mundo con este zoom (arena de jefe en 16:10), quedan barras (camOY)
function setZoom(z){ZOOM=z;VW=W/z;VH=Math.min(H,HC/z);}
// en Mac 16:10 con GRANDE el lienzo llena el alto: hasta H×ZOOM_GRANDE (ahí se ve el mundo entero de alto).
// En pantallas táctiles no: los controles de tactil.js se acomodan a un juego de 16:9.
function altoMax(){return tamano==='grande'&&!(navigator.maxTouchPoints>0)?Math.floor(H*ZOOM_GRANDE):H;}
// si el mundo no llena el alto del lienzo (zoom abierto en una arena, o los menús), se centra con barras: este es el corrimiento
const camOY=()=>Math.max(0,(HC-H*ZOOM)/2);
const zoomBase=()=>tamano==='grande'?ZOOM_GRANDE:1;
// de coordenadas del mundo a coordenadas del HUD (para lo que vuela al marcador)
// del mundo al HUD. Con la grilla nítida entera (base.js, GN) el mundo va a N px de pantalla por unidad, no a S×ZOOM:
// HZ() es la escala que de verdad se ve (lo que se ubica sobre el mundo no se corre)
const HZ=()=>typeof GN!=='undefined'&&GN.zEf?GN.zEf:ZOOM;
const HX=x=>(x-camX)*HZ(),HY=y=>(y-camY)*HZ()+camOY();
// borde de arriba "en reposo": el piso queda abajo con un poquito de tierra; cada misión puede pedir ver más arriba (L.camTop)
// en una misión con caminos en capas (caminos.js) el mundo es más alto: de CA_yMin() a CA_yMax()
const camYMin=()=>typeof CA_yMin==='function'?CA_yMin():0,camYMax=()=>(typeof CA_yMax==='function'?CA_yMax():H)-VH;
function camReposo(){const r=GROUND+6-VH;return clamp(L&&L.camTop!==undefined?Math.min(r,L.camTop):r,0,H-VH);}
// lo más abajo que puede ir la cámara sin cortarle los pies a quien está en el piso
const camPisoMin=()=>clamp(GROUND+3-VH,0,H-VH);
function setTamano(t,inst){
  tamano=t==='normal'?'normal':'grande';store.set('oxido-tamano',tamano);fit();
  if(inst||state!=='play'){setZoom(state==='play'&&lock&&(lock.a.boss||lock.a.mini)?1:zoomBase());camY=state==='play'?camReposo():0;}
}
// la cámara se ajusta después de que se mueven los jugadores (la llama updCam en juego.js)
function camZoomStep(){
  // jugadores que cuentan para encuadrar en vertical: vivos y ya dentro del mundo
  // (el que revive cayendo desde arriba de todo aparece desde afuera, como siempre, y no arrastra la cámara)
  let top=1e9,bot=-1e9,n=0;
  for(const p of players)if(!p.dead&&!p.burbuja){const o=p.ride||p;if((o.y<-2&&!(typeof CA_on==='function'&&CA_on()))||p.reaparece)continue;n++;top=Math.min(top,o.y);bot=Math.max(bot,o.y+(o.h||18));}
  const arenaJefe=lock&&(lock.a.boss||lock.a.mini);
  let meta=arenaJefe?1:zoomBase();
  // de a 2, si uno está muy arriba (jetpack, plataforma alta) y el otro abajo, el zoom se abre lo justo para que entren los dos
  if(n>1)meta=Math.min(meta,Math.max(1,HC/(bot-top+34)));
  if(typeof CA_separados==='function'&&CA_separados())meta=1; // caminos distintos o pantalla partida: zoom abierto (caminos.js)
  // abrir es más rápido que cerrar: que nadie quede afuera mientras se abre
  if(Math.abs(meta-ZOOM)>0.002)setZoom(ZOOM+(meta-ZOOM)*(meta<ZOOM?0.1:0.06));else if(ZOOM!==meta)setZoom(meta);
  // de a 2, si ya no entran los dos (uno arriba de todo y otro en el piso), el zoom se abre de golpe: nadie queda cortado
  if(n>1&&bot-top+6>VH&&meta<ZOOM&&!(typeof CA_partida!=='undefined'&&CA_partida))setZoom(meta);
  // al acercar (salida de una arena) la cámara corre lo justo para que nadie quede afuera por la derecha
  if(!lock){let right=-1e9;for(const p of players)if(!p.dead){const o=p.ride||p;right=Math.max(right,o.x+(o.w||10));}
    if(right>-1e9){const need=Math.min(right+18-VW,LEVEL_END-VW,typeof CA_camLimite==='function'?CA_camLimite():1e9);if(need>camX)camX=need;}}
  // vertical: en reposo el piso queda abajo; si alguien sube, arriba queda al menos un 30 % de la vista libre
  let meta_y=camReposo();
  // voladores a la vista (en x): sube lo justo para verlos, sin cortar el piso
  let fly=1e9;for(const e of enemies)if(!e.gone&&(e.type==='drone'||e.air)&&e.x+e.w>camX-20&&e.x<camX+VW+20)fly=Math.min(fly,e.y);
  if(fly<1e9)meta_y=Math.min(meta_y,Math.max(camPisoMin(),fly-16));
  if(n){meta_y=Math.min(meta_y,top-VH*0.3);meta_y=Math.max(meta_y,bot-VH+4);}
  meta_y=clamp(meta_y,camYMin(),camYMax());
  camY+=(meta_y-camY)*(meta_y<camY?0.12:0.07);
  if(Math.abs(meta_y-camY)<0.05)camY=meta_y;
  // nunca se le cortan los pies ni la cabeza a nadie (si no entran los dos, mandan los pies: el zoom ya se está abriendo)
  if(n&&!(typeof CA_partida!=='undefined'&&CA_partida)){
    // con caminos en capas (foco en un jugador): si no entran los dos, manda el jugador 1 entero; el 2 tiene el conteo y la
    // burbuja (caminos.js). Antes mandaban los pies y al 1, arriba en la grúa, se le cortaba la cabeza (bot --2j, M2)
    let t=top,b=bot;const p1=players[0];
    if(n>1&&b-t+4>VH&&typeof CA_on==='function'&&CA_on()&&p1&&!p1.dead&&!p1.burbuja){const o=p1.ride||p1;t=o.y;b=o.y+(o.h||18);}
    camY=Math.min(camY,t-2);camY=Math.max(camY,b-VH+2);}
  camY=clamp(camY,camYMin(),camYMax());
}
// en táctil, que nadie aparezca debajo del dibujo de la palanca (OXIDO_TACTIL_LIBRE de publicar/web/tactil.js)
function xLibre(x,z){const lb=typeof onTouch==='function'&&onTouch()&&window.OXIDO_TACTIL_LIBRE;return lb?Math.max(x,(lb.x0+6)/(z||ZOOM)):x;}
// cada misión arranca con el zoom elegido, sin transición
ON_START.push(()=>{setZoom(zoomBase());camY=camReposo();});
fit(); // ya se sabe el tamaño elegido: el lienzo puede llenar el alto
