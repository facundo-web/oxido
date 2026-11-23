'use strict';
// Óxido · Hora y clima (va DESPUÉS de mundo.js, accesible.js y comic.js, antes de juego.js)
// El escenario cambia según la HORA del aparato y, si la persona quiere, el CLIMA REAL de donde está.
// HORA (reloj del aparato, sin permisos): AMANECER 5–8 · DÍA 8–17 · TARDE 17–20 · NOCHE 20–5.
//   · Un tinte sobre el FONDO (el cielo y las capas lejanas), relativo a la hora "natural" de cada lugar: la Zona Óxido
//     ya es una tarde, así que a la tarde queda como siempre; el Puerto ya es de noche, así que de día se aclara.
//   · Un tinte muy suave sobre el mundo (personajes incluidos) que no les cambia el contraste; las balas y el HUD se
//     dibujan después y no se tiñen.
//   · Sol o luna que cruzan el cielo según la hora (donde el lugar no trae los suyos), estrellas de noche, faroles
//     prendidos (decor 'lamp') de tarde y de noche, y sombras: largas a la mañana y a la tarde, cortas de día.
//   · M5 "Ciudad sin luna" y M9 "Ciudad embrujada" son siempre de noche (cambia solo el matiz). M6 datos y M7 nave son
//     interiores: la hora apenas se nota y no llueve adentro.
// CLIMA (OPCIONES → CLIMA: REAL / DEL DÍA / APAGADO, arranca en DEL DÍA; se guarda en 'oxido-clima'):
//   · DEL DÍA: uno por fecha, igual para todos, sin ubicación. APAGADO: siempre despejado.
//   · REAL: al elegirlo se explica en una línea y recién ahí se pide el permiso de ubicación. La ubicación se redondea
//     a 1 decimal (~10 km), se usa solo para UNA consulta a Open-Meteo (gratis, sin clave) al empezar la misión, y no
//     se guarda ni se manda a ningún otro lado. Una sola consulta por sesión; se guarda el CLIMA (no la ubicación) 3 horas
//     en el aparato. Con datos móviles, solo si CLIMA CON DATOS MÓVILES: SÍ. Sin permiso, internet o respuesta: el
//     guardado o el DEL DÍA, sin errores ni esperas.
//   · Climas: despejado, nublado, lluvia, tormenta, niebla, viento y nieve. Cada uno con su capa, detalles (charcos que
//     reflejan, gotas que salpican, hojas y polvo, nieve en el piso) y un sonido de fondo bajito. Relámpagos: como
//     mucho 3 destellos por segundo, y ninguno con MOVIMIENTO REDUCIDO. La niebla tapa el fondo lejano, nunca a los
//     enemigos ni las balas. Solo estético: no cambia la dificultad.
// Para pruebas: ?hora=noche&clima=lluvia en la dirección, o CLI_forzar('noche','lluvia') (null = volver a lo normal).
// Ganchos: después de cada fondo (L.drawBG, drawBGDusk, drawBGPort; con escenario nuevo, escenario-base.js llama a
// CLI_cielo y CLI_fondo entre sus capas y acá no se repite), drawGround (charcos, nieve y sombras) y
// drawForeground (tinte suave, partículas y relámpagos); usa ON_START y ON_DRAW. Prefijo CLI_.
const CLI_HORAS=['amanecer','dia','tarde','noche'];
const CLI_CLIMAS=['despejado','nublado','lluvia','tormenta','niebla','viento','nieve'];
const CLI={hora:'dia',clima:'despejado',fuente:'dia',fHora:null,fClima:null,real:null,sinPermiso:false,ult:-1,rayo:0,rayoT:[],rayoX:0};
try{const f=store.get('oxido-clima');if(f==='real'||f==='dia'||f==='apagado')CLI.fuente=f;}catch(e){}
try{const u=new URLSearchParams(location.search),h=u.get('hora'),c=u.get('clima');
  if(CLI_HORAS.includes(h))CLI.fHora=h;if(CLI_CLIMAS.includes(c))CLI.fClima=c;}catch(e){}
function CLI_forzar(h,c){CLI.fHora=CLI_HORAS.includes(h)?h:null;CLI.fClima=CLI_CLIMAS.includes(c)?c:null;CLI_actualizar();
  try{if(typeof ESC_ambiente==='function'&&typeof ESC!=='undefined')ESC_ambiente(ESC.ext);}catch(e){}} // el escenario se recalcula en el próximo cuadro
// ---------- hora ----------
function CLI_horaDe(d){const h=d.getHours();return h>=5&&h<8?'amanecer':h>=8&&h<17?'dia':h>=17&&h<20?'tarde':'noche';}
// avance del cielo de 0 a 1 (para el sol de 5 a 20 y la luna de 20 a 5)
function CLI_avance(){const d=new Date(),h=d.getHours()+d.getMinutes()/60;
  if(CLI.fHora)return{amanecer:0.12,dia:0.5,tarde:0.88,noche:0.5}[CLI.fHora];
  return h>=5&&h<20?(h-5)/15:((h+24-20)%24)/9;}
// cómo es cada lugar: hora "natural" (la de su dibujo), si es interior y si es siempre de noche, y si trae sol o luna
const CLI_LUGAR={dusk:{nat:'tarde',astro:true},port:{nat:'noche',astro:true},swamp:{nat:'noche'},desert:{nat:'tarde',astro:true},
  noche:{nat:'noche',siempreNoche:true,sinLuna:true},datos:{nat:'noche',interior:true},nave:{nat:'noche',interior:true},
  selva:{nat:'dia'},embrujada:{nat:'noche',siempreNoche:true,astro:true},templo:{nat:'dia',interiorDesde:640}}; // M10: selva afuera; desde M10_GATE (x 640) es el templo, con techo: ahí no llueve
const CLI_lugar=()=>CLI_LUGAR[(typeof L!=='undefined'&&L&&L.theme)||'dusk']||CLI_LUGAR.dusk;
// ---------- clima del día (por fecha, sin ubicación) ----------
function CLI_delDia(){
  const d=new Date(),s=d.getFullYear()*372+d.getMonth()*31+d.getDate(),r=hash(s*7919)%1;
  const tabla=[['despejado',0.38],['nublado',0.22],['lluvia',0.15],['niebla',0.09],['viento',0.08],['tormenta',0.05],['nieve',0.03]];
  let a=0;for(const[c,p]of tabla){a+=p;if(r<a)return c;}return 'despejado';
}
// ---------- clima real (Open-Meteo, con la ubicación redondeada) ----------
// código WMO → clima de Óxido; con viento fuerte y sin lluvia, "viento"
function CLI_deWMO(code,viento){
  if(code>=95)return 'tormenta';if(code>=71&&code<=77||code===85||code===86)return 'nieve';
  if(code>=51&&code<=67||code>=80&&code<=82)return 'lluvia';if(code===45||code===48)return 'niebla';
  if(viento>=30)return 'viento';if(code>=2)return 'nublado';return 'despejado';
}
// Consumo de datos (pedido de Facu): como mucho UNA consulta por sesión, el resultado se guarda 3 horas, y con
// "CLIMA CON DATOS MÓVILES: NO" (de fábrica) solo se consulta si el navegador dice que la conexión NO es de celular y
// que no está ahorrando datos. Si no se puede saber (Safari de iPhone) o no hay conexión: el último clima guardado o,
// si no hay, el DEL DÍA, sin esperar ni mostrar errores. Sin permiso de ubicación: el DEL DÍA.
// Apps nativas: window.OXIDO_UBICACION() → Promise {lat, lon} (la usa si existe; si no, navigator.geolocation) y
// window.OXIDO_RED_CARA() → true/false (red "cara" o no; si existe y responde, manda sobre lo que diga el navegador).
const CLI_CACHE_MS=3*60*60*1000;
CLI.movil='no';try{if(store.get('oxido-clima-movil')==='si')CLI.movil='si';}catch(e){}
function CLI_guardado(){try{const c=JSON.parse(store.get('oxido-clima-cache')||'null');if(c&&CLI_CLIMAS.includes(c.c))return{c:c.c,fresco:Date.now()-c.t<CLI_CACHE_MS};}catch(e){}return null;}
const CLI_cache=()=>{const g=CLI_guardado();return g&&g.fresco?g.c:null;};
// ¿se puede gastar datos en esta conexión? true / false / null (no se sabe)
function CLI_redOk(){
  try{if(navigator.onLine===false)return false;}catch(e){}
  try{if(typeof window.OXIDO_RED_CARA==='function'){const r=window.OXIDO_RED_CARA();if(r===true)return CLI.movil==='si';if(r===false)return true;}}catch(e){}
  if(CLI.movil==='si')return true;
  const c=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
  if(c){if(c.saveData)return false;if(c.type==='cellular')return false;if(c.type&&c.type!=='unknown'&&c.type!=='none')return true;}
  // sin datos del navegador: una compu (sin pantalla táctil) no anda con datos de celular; un teléfono, no se sabe
  try{const tactil=matchMedia('(pointer: coarse)').matches||navigator.maxTouchPoints>0;if(!tactil)return true;}catch(e){}
  return null;
}
// la ubicación aproximada: la de la app nativa si está, si no la del navegador (sin alta precisión)
function CLI_ubicacion(){
  if(typeof window.OXIDO_UBICACION==='function'){try{return Promise.resolve(window.OXIDO_UBICACION()).then(u=>({lat:+u.lat,lon:+u.lon}));}catch(e){return Promise.reject(e);}}
  if(!navigator.geolocation)return Promise.reject(new Error('sin ubicación'));
  return new Promise((ok,mal)=>navigator.geolocation.getCurrentPosition(p=>ok({lat:p.coords.latitude,lon:p.coords.longitude}),mal,
    {enableHighAccuracy:false,maximumAge:CLI_CACHE_MS,timeout:8000}));
}
function CLI_pedirReal(conPermiso){
  if(CLI.fuente!=='real')return;
  const g=CLI_guardado();if(g){CLI.real=g.c;CLI_actualizar();if(g.fresco)return;} // el guardado sirve mientras tanto
  if(CLI.consultado||CLI.pidiendo)return;               // una sola consulta por sesión
  if(!conPermiso&&CLI_redOk()!==true)return;           // al empezar la misión: solo con una red que se pueda usar
  CLI.pidiendo=true;
  CLI_ubicacion().then(u=>{
    CLI.sinPermiso=false;
    if(CLI_redOk()!==true){CLI.pidiendo=false;return;} // el permiso se pide igual; la consulta, solo con red permitida
    CLI.consultado=true;
    const la=(Math.round(u.lat*10)/10).toFixed(1),lo=(Math.round(u.lon*10)/10).toFixed(1); // ~10 km: aproximada
    const ab=typeof AbortController==='function'?new AbortController():null;const corte=setTimeout(()=>{try{ab&&ab.abort();}catch(e){}},6000);
    return fetch('https://api.open-meteo.com/v1/forecast?latitude='+la+'&longitude='+lo+'&current=weather_code,wind_speed_10m',{signal:ab?ab.signal:undefined,cache:'no-store'})
      .then(r=>r.ok?r.json():null).then(j=>{const cu=j&&j.current;if(!cu)return;
        const c=CLI_deWMO(+cu.weather_code||0,+cu.wind_speed_10m||0);CLI.real=c;
        try{store.set('oxido-clima-cache',JSON.stringify({c,t:Date.now()}));}catch(e){} // solo el clima y la hora, nunca la ubicación
        CLI_actualizar();})
      .catch(()=>{}).finally(()=>clearTimeout(corte));
  }).catch(err=>{if(err&&err.code===1||err&&/permis|denied/i.test(String(err.message||err))){CLI.sinPermiso=true;CLI.real=null;CLI_actualizar();}}) // sin permiso: el DEL DÍA
    .finally(()=>{CLI.pidiendo=false;});
}
// ---------- la opción (OPCIONES) ----------
const CLI_valor=()=>({real:'REAL',dia:'DEL DÍA',apagado:'APAGADO'})[CLI.fuente];
const CLI_desc=()=>CLI.fuente==='real'?(CLI.sinPermiso?'Sin permiso de ubicación: se usa el clima del día':'Usa tu ubicación aproximada para saber si llueve donde estás')
  :CLI.fuente==='dia'?'Un clima distinto cada día, sin usar tu ubicación':'Siempre despejado';
// para otros archivos (Publicación, pruebas): CLI_ponerFuente('real' | 'dia' | 'apagado')
function CLI_ponerFuente(f){if(!['real','dia','apagado'].includes(f))return;const ant=CLI.fuente;CLI.fuente=f;try{store.set('oxido-clima',f);}catch(e){}
  CLI.sinPermiso=false;if(f==='real'&&ant!=='real')setTimeout(()=>CLI_pedirReal(true),700);CLI_actualizar();}
// sub-opción (solo se muestra con REAL): CLIMA CON DATOS MÓVILES: NO / SÍ, de fábrica NO
const CLI_movilValor=()=>CLI.movil==='si'?'SÍ':'NO';
const CLI_movilDesc=()=>CLI.movil==='si'?'Consulta el clima aunque uses datos del celular':'Solo consulta el clima con wifi o cable';
function CLI_movilCiclar(){CLI.movil=CLI.movil==='si'?'no':'si';try{store.set('oxido-clima-movil',CLI.movil);}catch(e){}}
// crédito de los datos (licencia CC BY 4.0 de Open-Meteo): una línea chica en OPCIONES con REAL elegido
const CLI_credito=()=>CLI.fuente==='real'?'Datos del clima: Open-Meteo.com':'';
function CLI_ciclar(){
  CLI.fuente={dia:'real',real:'apagado',apagado:'dia'}[CLI.fuente];try{store.set('oxido-clima',CLI.fuente);}catch(e){}
  CLI.sinPermiso=false;
  // primero se lee la explicación (la descripción de la fila) y recién después se pide el permiso
  if(CLI.fuente==='real')setTimeout(()=>CLI_pedirReal(true),700);
  CLI_actualizar();
}
// ---------- lo que se ve ahora ----------
function CLI_actualizar(){
  const lu=CLI_lugar();
  CLI.horaReal=CLI.fHora||CLI_horaDe(new Date());
  CLI.hora=lu.siempreNoche?'noche':CLI.horaReal;
  let c=CLI.fClima||(CLI.fuente==='apagado'?'despejado':CLI.fuente==='real'&&CLI.real?CLI.real:CLI_delDia());
  if(lu.interior&&!CLI.fClima)c='despejado';
  CLI.clima=lu.interior?'despejado':c; // adentro no llueve (forzado o no)
}
ON_START.push(()=>{CLI_actualizar();if(CLI.fuente==='real')CLI_pedirReal(false);});
setInterval(()=>{try{CLI_actualizar();}catch(e){}},60*1000); // cambia de hora sin reiniciar
CLI_actualizar();
// ---------- tinte del fondo ----------
const CLI_NIVEL={noche:0,amanecer:1,tarde:1,dia:2};
function CLI_capa(modo,col,a,w,h){if(a<=0.003)return;ctx.save();ctx.globalCompositeOperation=modo;ctx.globalAlpha=Math.min(1,a);ctx.fillStyle=col;ctx.fillRect(-40,-400,w+80,h+800);ctx.restore();}
// una vez por vista y por cuadro: el escenario nuevo (escenario-base.js) llama a CLI_fondo desde adentro de sus capas y
// el gancho de abajo (después del fondo viejo) no lo repite; en pantalla partida, cada vista tiene su llamada
const CLI_llave=()=>{try{const m=ctx.getTransform();return Math.round(m.e)+'|'+Math.round(m.f);}catch(e){return '';}};
const CLI_reciente=(o)=>o&&o.k===CLI_llave()&&performance.now()-o.t<8;
const CLI_esc=()=>typeof ESC_activo==='function'&&ESC_activo();
function CLI_fondo(){
  CLI.fondoV={k:CLI_llave(),t:performance.now()};
  const lu=CLI_lugar(),hz=CLI.hora,W2=W,H2=typeof HC==='number'?HC:H,esc=CLI_esc();
  let k=lu.interior?0.25:1;
  if(esc){}                                             // escenario nuevo: el tinte de la hora va por capa (escenario-base.js)
  else if(lu.siempreNoche){ // siempre de noche: solo el matiz de la hora real
    const m={amanecer:['overlay','#c070c0',0.14],dia:['screen','#3a4a6a',0.16],tarde:['overlay','#ff9050',0.12],noche:null}[CLI.horaReal];
    if(m)CLI_capa(m[0],m[1],m[2],W2,H2);
  }else{
    const d=CLI_NIVEL[hz]-CLI_NIVEL[lu.nat];
    if(d>0)CLI_capa('screen',hz==='dia'?'#4a6a96':'#6a4a5a',0.3*d*k,W2,H2);
    if(d<0)CLI_capa('multiply',hz==='noche'?'#3a3c78':'#c88a6a',0.42*-d*k,W2,H2);
    const hue={amanecer:['overlay','#ff9ab0',0.18],tarde:['overlay','#ffa050',lu.nat==='tarde'?0:0.2],noche:['overlay','#3050a0',lu.nat==='noche'?0:0.15],
      dia:lu.nat==='dia'?null:['overlay','#5a9ae0',0.34]}[hz]; // de día, el cielo tira a celeste
    if(hue)CLI_capa(hue[0],hue[1],hue[2]*k,W2,H2);
  }
  if(lu.interior)return CLI_ventanas(lu);
  // si el sistema de capas del escenario ya llamó a CLI_cielo() en este cuadro (detrás de los edificios), no se repite
  if(!CLI_reciente(CLI.cieloV))CLI_cieloAstros();
  const c=CLI.clima,cubierto=c==='nublado'||c==='lluvia'||c==='tormenta'||c==='niebla'||c==='nieve';
  // capas del clima sobre el fondo
  if(c==='nublado'&&!esc)CLI_capa('multiply','#8a8e9a',0.32,W2,H2);
  if(c==='lluvia'&&!esc)CLI_capa('multiply','#6a7488',0.38,W2,H2);
  if(c==='tormenta'&&!esc)CLI_capa('multiply','#4a5068',0.52,W2,H2);
  if(c==='nieve'&&!esc)CLI_capa('screen','#8a96aa',0.22,W2,H2);
  // nubes y rayo: van con el cielo (CLI_cieloAstros), detrás de lo lejano cuando el escenario llama a CLI_cielo
  if(c==='niebla'){const nf=esc?0.5:1,g=ctx.createLinearGradient(0,20,0,H2); // con escenario nuevo, la mitad: el resto ya está horneado en las capas
    g.addColorStop(0,`rgba(205,210,220,${0.12*nf})`);g.addColorStop(0.55,`rgba(205,210,220,${0.5*nf})`);g.addColorStop(1,`rgba(205,210,220,${0.62*nf})`);
    ctx.fillStyle=g;ctx.fillRect(-40,-400,W2+80,H2+800);
    // jirones que se mueven despacio (óvalos suaves, no barras)
    ctx.fillStyle='rgba(225,228,235,0.12)';for(let i=0;i<5;i++){const x=((i*97-T*0.15-(typeof camX==='number'?camX:0)*0.05)%(W2+160)+W2+160)%(W2+160)-80;
      ctx.beginPath();ctx.ellipse(x,78+i*13,55,4+i%2*2,0,0,7);ctx.fill();}}
}
// CIELO (para el sistema de capas del escenario): estrellas, luna o sol. Va justo después del degradé del cielo y antes
// de los edificios, así quedan detrás. Si nadie lo llama, CLI_fondo los dibuja encima del fondo (como hasta ahora).
CLI.cieloV=null;
function CLI_cielo(){CLI.cieloV={k:CLI_llave(),t:performance.now()};try{if(!CLI_lugar().interior)CLI_cieloAstros();}catch(e){}}
function CLI_cieloAstros(){
  const lu=CLI_lugar(),hz=CLI.hora,c=CLI.clima,cubierto=c==='nublado'||c==='lluvia'||c==='tormenta'||c==='niebla'||c==='nieve';
  const esc=CLI_esc(); // con escenario nuevo, sol, luna y estrellas los pinta él en su capa de cielo
  if(hz==='noche'&&!cubierto&&!esc)CLI_estrellas();
  if(!lu.astro&&!cubierto&&!esc){const f=CLI_avance(),x=24+f*(W-48),y=44-Math.sin(f*Math.PI)*30;
    if(hz==='noche'){if(!lu.sinLuna)CLI_luna(x,y);}else CLI_sol(x,y,hz);}
  if(cubierto&&c!=='niebla')CLI_nubes(c==='tormenta'?'#2a2c3a':c==='lluvia'?'#4a4e5e':'#7a7e8c',c==='tormenta'?0.75:0.55);
  if(c==='tormenta')CLI_rayoCielo();
}
// interiores: la hora apenas se ve en una franja de "ventana" arriba (cielo de afuera)
function CLI_ventanas(lu){
  const col={amanecer:'rgba(255,170,190,0.10)',dia:'rgba(170,210,255,0.10)',tarde:'rgba(255,170,90,0.10)',noche:'rgba(80,100,200,0.08)'}[CLI.horaReal];
  ctx.fillStyle=col;ctx.fillRect(-20,-80,W+40,100);
}
function CLI_estrellas(){
  const cx=typeof camX==='number'?camX*0.02:0;ctx.save();ctx.globalCompositeOperation='lighter';
  for(let i=0;i<42;i++){const x=((hash(i*31)*W*1.2-cx)%W+W)%W,y=hash(i*17+5)*52,tw=0.35+0.35*Math.sin(T/(14+i%7)+i);
    ctx.fillStyle=`rgba(255,250,230,${tw.toFixed(2)})`;ctx.fillRect(Math.round(x),Math.round(y),i%9===0?2:1,i%9===0?2:1);}
  ctx.restore();
}
function CLI_luna(x,y){x=Math.round(x);y=Math.round(y);
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba(200,215,255,0.12)';ctx.beginPath();ctx.arc(x,y,11,0,7);ctx.fill();ctx.restore();
  ctx.fillStyle='#120c18';ctx.beginPath();ctx.arc(x,y,6.5,0,7);ctx.fill();ctx.fillStyle='#e8e6d8';ctx.beginPath();ctx.arc(x,y,5.5,0,7);ctx.fill();
  ctx.fillStyle='#c8c4b0';ctx.fillRect(x-2,y-1,2,2);ctx.fillRect(x+1,y+2,2,1);ctx.fillRect(x+2,y-3,1,1);}
function CLI_sol(x,y,hz){x=Math.round(x);y=Math.round(y);const col=hz==='dia'?'#fff2b0':'#ffb070';
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=hz==='dia'?'rgba(255,240,180,0.16)':'rgba(255,150,90,0.18)';ctx.beginPath();ctx.arc(x,y,13,0,7);ctx.fill();ctx.restore();
  ctx.fillStyle='#120c18';ctx.beginPath();ctx.arc(x,y,7,0,7);ctx.fill();ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,6,0,7);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.6)';ctx.fillRect(x-3,y-3,2,2);}
function CLI_nubes(col,a){
  const cx=typeof camX==='number'?camX*0.08:0,v=CLI.clima==='viento'?0.6:0.12;ctx.fillStyle=col;ctx.globalAlpha=a;
  for(let i=0;i<7;i++){const w=50+hash(i*13)*60,x=((hash(i*7)*(W+140)-cx-T*v)%(W+140)+W+140)%(W+140)-70,y=4+hash(i*3)*30;
    ctx.beginPath();ctx.ellipse(x,y+6,w/2,7,0,0,7);ctx.ellipse(x-w/4,y+3,w/4,6,0,0,7);ctx.ellipse(x+w/5,y+1,w/4,7,0,0,7);ctx.fill();}
  ctx.globalAlpha=1;
}
// ---------- relámpagos (tope: 3 destellos por segundo; ninguno con MOVIMIENTO REDUCIDO) ----------
const CLI_reducido=()=>typeof MOV_reducido==='function'&&MOV_reducido();
function CLI_rayoTick(){
  if(CLI.clima!=='tormenta'||typeof state==='undefined'||state!=='play'){CLI.rayo=Math.max(0,CLI.rayo-1);return;}
  if(CLI.rayo>0){CLI.rayo--;return;}
  if(Math.random()<1/240){ // un rayo cada ~4 s, a veces doble
    const ahora=performance.now();CLI.rayoT=CLI.rayoT.filter(t=>ahora-t<1000);
    if(CLI.rayoT.length<3){CLI.rayoT.push(ahora);CLI.rayo=10;CLI.rayoX=20+Math.random()*(W-40);
      later(300+Math.random()*900,()=>{try{noise(1.4,0.09,180);tone('sine',60,30,1.2,0.04);}catch(e){}});}} // trueno
}
ON_STEP.push(CLI_rayoTick);
function CLI_rayoCielo(){
  if(CLI.rayo<7||CLI_reducido())return;let x=CLI.rayoX,y=0;ctx.strokeStyle='rgba(235,240,255,0.9)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);
  for(let i=0;i<6;i++){x+=(hash(i*11+Math.floor(CLI.rayoX))-0.5)*12;y+=9;ctx.lineTo(x,y);}ctx.stroke();
}
// ---------- charcos, nieve en el piso y sombras (después del piso, antes de todo lo demás) ----------
function CLI_piso(){
  const c=CLI.clima,cx=typeof camX==='number'?camX:0,vw=typeof VW==='number'?VW:W,g=GROUND;
  if(c==='lluvia'||c==='tormenta'){ // charcos en píxeles: reflejan el cielo, llevan anillos de gotas y toman el color de las luces cercanas
    let luces=[];try{if(typeof ESC_lucesNivel==='function'&&typeof ESC_def==='function'&&CLI_esc())luces=ESC_lucesNivel(ESC_def())||[];}catch(e){}
    for(let i=Math.floor((cx-60)/70);i<=Math.floor((cx+vw+60)/70);i++){if(hash(i*29+3)<0.45)continue;
      const x=Math.round(i*70+hash(i*5)*40),w=14+Math.round(hash(i*7)*22),x0=x-(w>>1);
      ctx.fillStyle='rgba(20,22,34,0.6)';ctx.fillRect(x0+2,g,w-4,1);ctx.fillRect(x0,g+1,w,1);ctx.fillRect(x0+2,g+2,w-4,1);
      ctx.fillStyle='rgba(150,170,210,0.35)';ctx.fillRect(x0+3,g+1,Math.round(w/2),1);                 // reflejo del cielo
      // luz cercana del escenario (faroles, fuego): una franja de su color en el charco, más fuerte cuanto más cerca
      for(const l of luces){const r=l.r||40,dx=Math.abs(l.x-x);if(dx>r+w/2)continue;const a=Math.max(0,1-dx/(r+w/2))*(l.fuerza??1);if(a<0.05)continue;
        ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.min(0.8,0.7*a);ctx.fillStyle=l.col||'#ffb050';
        const lx=Math.max(x0+1,Math.min(x0+w-3,Math.round(l.x)-1));ctx.fillRect(lx,g,2,1);ctx.fillRect(lx-1,g+1,4,1);ctx.fillRect(lx,g+2,2,1);ctx.restore();}
      // anillo de una gota: dos puntos que se abren, en píxeles
      const f=((T+i*17)%40)/40,ax=x+Math.round((hash(i*9)-0.5)*w*0.5),ar=1+Math.round(f*5);
      ctx.fillStyle=`rgba(200,215,240,${(0.55*(1-f)).toFixed(2)})`;ctx.fillRect(ax-ar,g+1,1,1);ctx.fillRect(ax+ar,g+1,1,1);if(ar>2)ctx.fillRect(ax-1,g,2,1);}}
  if(c==='nieve'){ctx.fillStyle='rgba(240,244,250,0.85)';ctx.fillRect(Math.round(cx-10),g-1,vw+20,2);
    if(typeof platforms!=='undefined')for(const p of platforms)if(p.x<cx+vw&&p.x+p.w>cx&&p.y<g-2)ctx.fillRect(Math.round(p.x),Math.round(p.y)-1,Math.round(p.w),1.5);}
  CLI_sombras();
}
function CLI_sombras(){
  // sombra larga de la mañana y de la tarde, en una fila de píxeles corrida hacia el lado contrario al sol (la sombra de
  // contacto de abajo de los pies la pone arte-luz.js)
  const hz=CLI.hora,lu=CLI_lugar(),c=CLI.clima;
  if(lu.interior||hz==='noche'||hz==='dia'||c==='lluvia'||c==='tormenta'||c==='niebla')return;
  const dir=hz==='amanecer'?-1:1,largo=12,a=c==='nublado'?0.1:0.18;
  const sombra=(x,w,y)=>{if(Math.abs(y-GROUND)>3)return;ctx.fillStyle=`rgba(18,12,24,${a})`;const x0=Math.round(x+(dir>0?w/2:-w/2-largo));ctx.fillRect(x0,GROUND,largo,1);ctx.fillRect(x0+(dir>0?0:4),GROUND+1,largo-4,1);};
  try{if(typeof players!=='undefined')for(const p of players)if(!p.dead&&!p.ride)sombra(p.x+4,8,p.y+18);
    if(typeof enemies!=='undefined')for(const e of enemies)if(!e.gone&&e.w<=30&&e.onGround!==false)sombra(e.x+e.w/2,e.w,e.y+e.h);}catch(e){}
}
// faroles prendidos de tarde y de noche (o con tormenta)
ON_DRAW.push(()=>{
  const hz=CLI.hora;if(!(hz==='noche'||hz==='tarde'||CLI.clima==='tormenta')||CLI_lugar().interior||typeof L==='undefined'||!L.decor||CLI_esc())return; // con escenario nuevo, los ilumina él
  const cx=typeof camX==='number'?camX:0,vw=typeof VW==='number'?VW:W,k=hz==='tarde'?0.6:1;
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(const d of L.decor){if(d.type!=='lamp'&&d.k!=='lamp')continue;if(d.x<cx-40||d.x>cx+vw+40)continue;
    const x=d.x+7,y=GROUND-46,pal=0.9+0.1*Math.sin(T/9+d.x);
    ctx.fillStyle=`rgba(255,210,130,${(0.16*k*pal).toFixed(3)})`;ctx.beginPath();ctx.moveTo(x-2,y+1);ctx.lineTo(x-16,GROUND);ctx.lineTo(x+18,GROUND);ctx.lineTo(x+3,y+1);ctx.fill();
    ctx.fillStyle=`rgba(255,220,150,${(0.22*k).toFixed(3)})`;ctx.beginPath();ctx.arc(x,y+1,6,0,7);ctx.fill();
    ctx.fillStyle='#ffe8a0';ctx.fillRect(x-1,y+1,3,1);}
  ctx.restore();
});
// ---------- encima del mundo (antes de granadas, balas y HUD): tinte suave y partículas ----------
function CLI_frente(){
  const lu=CLI_lugar(),hz=CLI.hora,c=CLI.clima,cx=typeof camX==='number'?camX:0,vw=typeof VW==='number'?VW:W,vh=typeof HC==='number'?HC:H;
  // tinte muy suave sobre todo el mundo (los personajes siguen leyéndose igual)
  // con escenario Hondo activo no va: sus capas ya hornean el tinte de la hora por distancia y protegen la bruma
  // (este tinte iba encima de todo, personajes incluidos, y bajaba el fondo de 0,13 a 0,10–0,12 de noche)
  const t=CLI_esc()?null:{noche:['multiply','#5a64a8',lu.interior?0.05:0.14],tarde:['overlay','#ffa060',lu.nat==='tarde'?0:0.06],amanecer:['overlay','#ff9ab0',0.06],dia:null}[hz];
  if(t){ctx.save();ctx.globalCompositeOperation=t[0];ctx.globalAlpha=t[2];ctx.fillStyle=t[1];ctx.fillRect(cx-10,-400,vw+20,vh+800);ctx.restore();}
  if(lu.interior)return;
  const vx=c==='tormenta'?-2.4:c==='viento'?-3:-0.8;
  // una sola lluvia: si el juego ya dibujó la suya (drawRain: puerto de M2, M5), clima.js no suma otra. Adelante va solo
  // el 28 % de las gotas, rectas de 1 × 4; el resto y las salpicaduras van atrás de la capa de juego (CLI_lluviaAtras)
  const mundo=T-CLI.lluviaMundo<=2,llueve=c==='lluvia'||c==='tormenta';
  if(llueve&&!mundo)CLI_afuera(()=>CLI_gotas(c==='tormenta'?110:70,cx,vw,vh,vx,c==='tormenta'?'rgba(180,200,235,0.42)':'rgba(170,195,230,0.34)',-cx*0.15,6.8,{frente:true,recto:true}));
  if(c==='nieve'){ctx.fillStyle='rgba(245,248,255,0.85)';
    for(let i=0;i<60;i++){const x=cx+((i*61.3+Math.sin(T/30+i)*6-T*0.25)%(vw+20)+vw+20)%(vw+20)-10,y=((i*83.1+T*0.7)%(vh+10))-5;ctx.fillRect(Math.round(x),Math.round(y),i%4?1:2,i%4?1:2);}}
  if(c==='viento'){ // hojas y polvo que cruzan
    for(let i=0;i<16;i++){const x=cx+((i*79+T*(2.4+i%3)*-1)%(vw+30)+vw+30)%(vw+30)-15,y=40+((i*47)%110)+Math.sin(T/8+i)*4;
      ctx.fillStyle=i%3?'rgba(200,180,140,0.45)':'#a8743a';ctx.fillRect(Math.round(x),Math.round(y),i%3?3:2,1);}}
  // destello del relámpago: sin parpadeo y nunca con MOVIMIENTO REDUCIDO
  if(c==='tormenta'&&CLI.rayo>0&&!CLI_reducido()){ctx.fillStyle=`rgba(220,230,255,${(0.28*CLI.rayo/10).toFixed(3)})`;ctx.fillRect(cx-10,-400,vw+20,vh+800);}
}
// gotas en píxeles: trazos de 1 px de ancho y 4 de alto; con viento, el trazo se corre 1 px en escalón (sin líneas suavizadas)
CLI.lluviaMundo=-99;
function CLI_gotas(n,x0,w,h,vx,col,corre,vel,op){
  op=op||{};ctx.fillStyle=col;const p=op.recto?0:vx<-1.4?-1:vx>1.4?1:0;
  for(let i=0;i<n;i++){if(op.frente&&i%7>1)continue; // adelante va solo el 28 % (2 de cada 7)
    const x=Math.round(x0+((i*53.7+T*vx*1.2+corre)%(w+40)+w+40)%(w+40)-20),y=Math.round(((i*97.3+T*vel)%(h+20))-10);
    if(p){ctx.fillRect(x,y,1,2);ctx.fillRect(x+p,y+2,1,2);}else ctx.fillRect(x,y,1,4);}
}
// capa de atrás (guía: lluvia en 2 capas): densa y más clara, entre el fondo y la capa de juego, con las salpicaduras del
// piso. Así casi ninguna gota pasa pegada al contorno de los personajes (el borde no baja de 3:1). Va en el gancho del piso.
// lugar con una parte techada (interiorDesde: x del mundo): la lluvia se dibuja solo a la izquierda de ese x
function CLI_afuera(fn){const d=CLI_lugar().interiorDesde,cx=typeof camX==='number'?camX:0,vw=typeof VW==='number'?VW:W;
  if(d==null||cx+vw<=d){fn();return;}if(cx>=d)return;
  ctx.save();ctx.beginPath();ctx.rect(cx-40,-400,d-cx+40,1400);ctx.clip();try{fn();}finally{ctx.restore();}}
function CLI_lluviaAtras(){
  if(CLI_lugar().interior)return;const c=CLI.clima,mundo=T-CLI.lluviaMundo<=2,llueve=c==='lluvia'||c==='tormenta';if(!mundo&&!llueve)return;
  const tor=c==='tormenta',cx=typeof camX==='number'?camX:0,vw=typeof VW==='number'?VW:W,vh=typeof HC==='number'?HC:H,vx=tor?-2.4:c==='viento'?-3:mundo?-1.6:-0.8;
  CLI_afuera(()=>{
  CLI_gotas(mundo?(tor?150:110):(tor?140:95),cx,vw,vh,vx,tor?'rgba(205,222,248,0.42)':'rgba(200,218,245,0.36)',-cx*0.2,6.6);
  ctx.fillStyle='rgba(200,215,240,0.55)'; // gotas que salpican en el piso
  for(let i=0;i<14;i++){const f=((T+i*11)%18)/18,x=Math.round(cx+hash(i*13+Math.floor((T+i*11)/18))*vw);if(f<0.5){ctx.fillRect(x-1-Math.round(f*2),GROUND-1-Math.round(f*3),1,1);ctx.fillRect(x+1+Math.round(f*2),GROUND-1-Math.round(f*3),1,1);}}
  });
}
// la lluvia de siempre del juego (mundo.js: puerto de M2 y M5), en píxeles, con el mismo recorte debajo del muelle;
// con 'tormenta' cae más densa y más torcida. El destello del relámpago del juego queda igual.
if(typeof drawRain==='function'){const CLI_rain0=drawRain;drawRain=function(){
  CLI.lluviaMundo=T;
  try{
    const bj=typeof CA_on==='function'&&CA_on()&&L.caminos?(L.caminos.bajos||[]).filter(b=>b.x1>camX&&b.x0<camX+VW):[];
    if(bj.length){ctx.save();ctx.beginPath();ctx.rect(-20,-400,W+40,H+800);for(const b of bj)ctx.rect(b.x0-camX,GROUND+2,b.x1-b.x0,400);ctx.clip('evenodd');}
    const tor=CLI.clima==='tormenta';
    CLI_gotas(tor?130:90,0,W,H,tor?-2.4:-1.6,tor?'rgba(180,205,240,0.42)':'rgba(170,200,235,0.34)',-camX*0.3,6.5,{frente:true,recto:true}); // adelante, solo el 28 %
    if(bj.length)ctx.restore();
    if(typeof lightning==='number'&&lightning>0){ctx.fillStyle=`rgba(210,225,255,${0.3*(typeof FL_k==='function'?FL_k():1)*lightning/12})`;ctx.fillRect(0,0,W,H);}
  }catch(e){return CLI_rain0.apply(this,arguments);}
};}
// ---------- sonido de fondo bajito (lluvia, tormenta, viento) ----------
const CLI_SON={src:null,filtro:null,gan:null,lfo:null,tipo:null};
function CLI_sonido(){
  if(typeof actx==='undefined'||!actx||!noiseBuf)return;
  const quiero=typeof state!=='undefined'&&state==='play'&&!muted&&!CLI_lugar().interior?({lluvia:'lluvia',tormenta:'lluvia',viento:'viento'})[CLI.clima]||null:null;
  const vol=quiero==='lluvia'?(CLI.clima==='tormenta'?0.05:0.032):quiero==='viento'?0.03:0;
  if(quiero&&CLI_SON.tipo!==quiero){
    try{if(CLI_SON.src)CLI_SON.src.stop();}catch(e){}
    const s=actx.createBufferSource();s.buffer=noiseBuf;s.loop=true;const f=actx.createBiquadFilter(),g=actx.createGain();
    if(quiero==='lluvia'){f.type='bandpass';f.frequency.value=2200;f.Q.value=0.6;}else{f.type='lowpass';f.frequency.value=420;}
    g.gain.value=0;s.connect(f).connect(g).connect(actx.destination);s.start();Object.assign(CLI_SON,{src:s,filtro:f,gan:g,tipo:quiero});}
  if(CLI_SON.gan){const t=actx.currentTime,v=quiero?vol*(quiero==='viento'?0.7+0.3*Math.sin(t*0.8):1):0;
    CLI_SON.gan.gain.setTargetAtTime(v,t,0.4);if(!quiero&&CLI_SON.tipo){const s=CLI_SON.src;CLI_SON.tipo=null;later(1500,()=>{try{if(!CLI_SON.tipo&&s)s.stop();}catch(e){}});}}
}
ON_STEP.push(()=>{if(T%15===0)CLI_sonido();});
// ---------- ganchos ----------
// el fondo: después de cada fondo (L.drawBG de cada misión, drawBGDusk y drawBGPort), una sola vez por vista; si la misión
// tiene escenario nuevo, escenario-base.js ya lo llamó entre sus capas y acá no se repite. COMIC_trama queda por las dudas.
const CLI_trasFondo=()=>{try{if(!CLI_reciente(CLI.fondoV))CLI_fondo();}catch(e){}};
// (si un fondo de misión llama adentro a drawBGDusk y después agrega cosas, el clima va al final, no en el medio)
CLI.enFondo=0;
const CLI_envolverFondo=f=>function(){CLI.enFondo++;let r;try{r=f.apply(this,arguments);}finally{CLI.enFondo--;}if(!CLI.enFondo)CLI_trasFondo();return r;};
if(typeof LEVELS!=='undefined')for(const lv of LEVELS)if(typeof lv.drawBG==='function'&&!lv.CLI_envuelto){lv.drawBG=CLI_envolverFondo(lv.drawBG);lv.CLI_envuelto=true;}
if(typeof drawBGDusk==='function')drawBGDusk=CLI_envolverFondo(drawBGDusk);
if(typeof drawBGPort==='function')drawBGPort=CLI_envolverFondo(drawBGPort);
if(typeof COMIC_trama==='function'){const CLI_trama0=COMIC_trama;COMIC_trama=function(){CLI_trasFondo();return CLI_trama0.apply(this,arguments);};}
if(typeof drawGround==='function'){const CLI_piso0=drawGround;drawGround=function(){const r=CLI_piso0.apply(this,arguments);try{CLI_piso();}catch(e){}try{CLI_lluviaAtras();}catch(e){}return r;};}
if(typeof drawForeground==='function'){const CLI_frente0=drawForeground;drawForeground=function(){const r=CLI_frente0.apply(this,arguments);try{CLI_frente();}catch(e){}return r;};}
