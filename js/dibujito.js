'use strict';
// Óxido · Estilo "dibujito viejo": SIEMPRE activo (ya no hay opción; el viejo oxido-estilo se borra al cargar)
// El lenguaje general de los dibujitos de los años 30 pasado a Óxido, encima del pixel art de siempre. No copia ningún
// juego: ni personajes, ni tipografía, ni carteles, ni paleta. Todo es sutil: el juego se tiene que leer igual.
// · Película (DIB_pelicula, la llama renderMain entre el mundo y el HUD): grano que cambia cada 3 cuadros, viñeta,
//   parpadeo leve de brillo, alguna raya vertical y motas sueltas. El HUD queda limpio encima.
// · Tinta que tiembla (DIB_tinta / DIB_sinTinta, desde drawWorld): una sombra de tinta de ±1 px que cambia de lado
//   cada 5 cuadros detrás de jugadores, jefes y soldados (en táctil, solo jugadores y jefes).
// · Rebote: el jugador se estira al saltar y caer y se aplasta al aterrizar; los soldados se hamacan al caminar,
//   todos al mismo compás.
// · Cartel de jefe: cuando entra un jefe (chico o villano), su nombre en una chapa que cae rebotando.
// · Rendimiento: en celulares y tablets, o si el juego va lento (DIB_lento), el grano es más liviano y los soldados van sin tinta.
try{localStorage.removeItem('oxido-estilo');}catch(e){} // quien había guardado LIMPIO ve el dibujito igual
// celulares y tablets: grano más liviano y sin tinta en los soldados. Además, si el juego va lento (cuadros de más de
// 22 ms en promedio), lo mismo en cualquier aparato: el estilo no se apaga, se aliviana.
const DIB_TACTIL=navigator.maxTouchPoints>0;
let DIB_lento=false,DIB_tAnt=0,DIB_dtProm=16;
const DIB_LIVIANO_=()=>DIB_TACTIL||DIB_lento;
let DIB_f=0;
// ---------- película ----------
const DIB_GRANO=[11,23,37].map(seed=>{
  const c=document.createElement('canvas');c.width=W*2;c.height=Math.ceil(H*ZOOM_GRANDE)*2+4;
  const g=c.getContext('2d'),d=g.createImageData(c.width,c.height),r=mulberry32(seed);
  for(let i=0;i<d.data.length;i+=4){if(r()<0.55)continue;const cl=r()<0.5;d.data[i]=cl?255:24;d.data[i+1]=cl?244:16;d.data[i+2]=cl?220:10;d.data[i+3]=40+Math.floor(r()*120);}
  g.putImageData(d,0,0);return c;});
const DIB_VIN=(()=>{const c=document.createElement('canvas');c.width=128;c.height=96;const g=c.getContext('2d');
  const v=g.createRadialGradient(64,48,26,64,48,82);v.addColorStop(0,'rgba(10,8,14,0)');v.addColorStop(0.7,'rgba(10,8,14,0.10)');v.addColorStop(1,'rgba(10,8,14,0.35)'); // Hondo: muy suave, máx. 35 %, sin tinte sepia
  g.fillStyle=v;g.fillRect(0,0,128,96);return c;})();
let DIB_raya=null,DIB_brillo=0;
function DIB_pelicula(){
  DIB_f++;
  const ahora=performance.now();if(DIB_tAnt&&state==='play'&&!(typeof COMIC_deADos==='function'&&COMIC_deADos())){ // "de a dos" (comic.js) dibuja uno de cada dos cuadros a propósito: no es lentitud
    const dt=ahora-DIB_tAnt; // un tirón suelto (cambio de pestaña, carga) no cuenta
    if(dt<60){DIB_dtProm+=(dt-DIB_dtProm)*0.02;if(DIB_dtProm>22)DIB_lento=true;else if(DIB_dtProm<18)DIB_lento=false;}}DIB_tAnt=ahora;
  const cw=cv.width,ch=cv.height,u=cw/W; // u = píxeles de pantalla por unidad del juego
  ctx.save();ctx.setTransform(1,0,0,1,0,0);
  // viñeta (suavizada: es un degradé chico estirado)
  ctx.imageSmoothingEnabled=true;ctx.drawImage(DIB_VIN,0,0,cw,ch);ctx.imageSmoothingEnabled=false;
  ctx.restore();return; // estilo Hondo (23 nov, Dirección de Arte): sin grano, parpadeo, rayas ni motas; queda solo la viñeta suave
  // grano: cambia cada 3 cuadros y se corre un poco, así no se ve como una textura quieta
  const red=typeof MOV_reducido==='function'&&MOV_reducido(); // movimiento reducido: el grano queda quieto (accesible.js)
  const gi=red?0:Math.floor(DIB_f/3),gr=DIB_GRANO[gi%3],ox=(gi*37)%7,oy=(gi*53)%5;
  ctx.globalAlpha=DIB_LIVIANO_()?0.07:0.11;ctx.drawImage(gr,ox,oy,gr.width-8,gr.height-6,0,0,cw,ch*(gr.height-6)/(HC*2));
  // parpadeo de brillo (muy leve)
  if(red){ctx.restore();return;} // ni parpadeo de brillo, ni rayas, ni motas
  if(DIB_f%2===0)DIB_brillo=Math.random();
  ctx.globalAlpha=1;ctx.fillStyle=DIB_brillo<0.5?`rgba(255,238,205,${0.025*DIB_brillo})`:`rgba(12,6,2,${0.035*(DIB_brillo-0.5)})`;ctx.fillRect(0,0,cw,ch);
  // raya vertical de vez en cuando
  if(!DIB_raya&&Math.random()<1/260)DIB_raya={x:Math.random()*W,t:8+Math.floor(Math.random()*14),a:0.10+Math.random()*0.1};
  if(DIB_raya){const r=DIB_raya;r.x+=Math.random()*0.8-0.4;ctx.fillStyle=`rgba(255,246,225,${r.a})`;ctx.fillRect(Math.round(r.x*u),0,Math.max(1,Math.round(u*0.4)),ch);if(--r.t<=0)DIB_raya=null;}
  // motas de polvo (uno o dos cuadros)
  if(Math.random()<0.18){ctx.fillStyle='rgba(18,10,6,0.45)';const n=1+Math.floor(Math.random()*2);
    for(let i=0;i<n;i++){const s=u*(0.5+Math.random()*0.8);ctx.fillRect(Math.random()*cw,Math.random()*ch,s,s);}}
  ctx.restore();
}
// ---------- tinta que tiembla ----------
const DIB_DIRS=[[1,0],[0,1],[-1,1],[1,1],[-1,0],[1,-1],[0,-1]];
function DIB_tinta(fuerte){
  return; // estilo Hondo: sin la tinta que tiembla (los bordes los da arte-luz.js)
  if(DIB_LIVIANO_()&&fuerte===0)return;
  const d=DIB_DIRS[Math.floor(T/5)%DIB_DIRS.length],k=Math.max(1,Math.round(SQ*(fuerte===2?0.5:0.35)));
  ctx.shadowColor='rgba(18,12,24,0.85)';ctx.shadowBlur=0;ctx.shadowOffsetX=d[0]*k;ctx.shadowOffsetY=d[1]*k;
}
function DIB_sinTinta(){ctx.shadowColor='rgba(0,0,0,0)';ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;}
// (23 nov: estirar y aplastar del jugador y vaivén de los soldados ahora van en cuadros: arte-fx.js FX_deformar y pieles.js;
// los envoltorios de acá ya no hacían nada y se sacaron)
// ---------- cartel de jefe ----------
let DIB_jefe=null,DIB_jefeRef=null;
const DIB_jefeVisible=b=>onScreen(b,-8)&&b.y+b.h>camY+20&&b.y<camY+VH;
ON_START.push(()=>{DIB_jefe=null;DIB_jefeRef=null;});
ON_STEP.push(()=>{
  // el cartel sale cuando el jefe ya se ve (no cuando aparece afuera de la pantalla); lo que había escrito espera
  if(bossRef&&bossRef!==DIB_jefeRef&&DIB_jefeVisible(bossRef)){DIB_jefeRef=bossRef;
    if(banner&&banner.s==='¡PELIGRO!')banner=null;else if(typeof MO_guardaVisible==='function')MO_guardaVisible();
    DIB_jefe={name:bossRef.name||bossName(),mini:!!bossRef.mini,guardian:bossRef.guardian||0,t:0};}
  if(!bossRef)DIB_jefeRef=null;
  if(DIB_jefe&&++DIB_jefe.t>170)DIB_jefe=null;
});
// rebote de caída (0→1, pasándose y volviendo)
function DIB_rebote(k){const n=7.5625,d=2.75;
  if(k<1/d)return n*k*k;if(k<2/d){k-=1.5/d;return n*k*k+0.75;}if(k<2.5/d){k-=2.25/d;return n*k*k+0.9375;}k-=2.625/d;return n*k*k+0.984375;}
// cartel simple (23 nov, sin cómic): entra con un desliz corto desde arriba y se va igual; con MOVIMIENTO REDUCIDO
// aparece y desaparece quieto. El juego no se frena. (La entrada moderna la diseña Dirección de Arte.)
ON_HUD.push(()=>{
  if(window.JEFE_ENTRADA_NUEVA)return; // la entrada nueva de jefe (arte-jefe.js) reemplaza a este cartel
  const j=DIB_jefe;if(!j||state!=='play'||(banner&&banner.t>0&&banner.prio>=4))return; // un aviso de ataque tiene prioridad
  const t=j.t,cx=W/2,y0=40,nm=j.name,w=Math.max(hudTW(nm,12)+34,110),h=30,red=typeof MOV_reducido==='function'&&MOV_reducido();
  const e=k=>1-(1-k)*(1-k),entra=t<12?e(t/12):1,sale=t>150?(t-150)/20:0;
  const y=red?y0:y0-14*(1-entra)-14*sale,a=red?(t<4?t/4:t>160?(170-t)/10:1):Math.min(entra,1-sale);
  if(a<=0)return;ctx.save();ctx.globalAlpha=a;
  const x=cx-w/2,col=j.guardian?'#ff8a5a':j.mini?'#f3c969':'#ff6b5b';
  ctx.fillStyle='rgba(18,12,24,0.9)';ctx.fillRect(x,y,w,h);ctx.fillStyle=col;ctx.fillRect(x,y,w,1.2);ctx.fillRect(x,y+h-1.2,w,1.2);
  txt(j.guardian?'GUARDIÁN DEL MUNDO '+j.guardian:j.mini?'¡CUIDADO!':'EL JEFE',cx,y+3.5,5,col,'center',false);
  txt(nm,cx,y+11,12,'#ffffff','center');
  ctx.restore();
});
