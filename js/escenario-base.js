'use strict';
// Óxido · Escenarios con profundidad: sistema de capas (del Ilustrador de escenarios)
// Va DESPUÉS de mundo.js y de todos los misionN.js / caminos-m2.js, y ANTES de clima.js y de juego.js.
// Prefijo ESC_. Cada misión se registra en su propio archivo (js/escenario-mN.js) con ESC_registrar(nivel, def).
//
// QUÉ HACE
//   · Capas de parallax (5 a 7): cielo, muy lejos, lejos, medio, cerca. Cada capa se dibuja UNA vez en un lienzo
//     fuera de pantalla (en unidades del juego × pix) y después solo se copia: por cuadro son unas pocas drawImage.
//   · Parallax horizontal (par) y vertical (parY): con zoom la cámara sube y baja; el cielo queda quieto y lo lejano
//     se mueve poco. Debajo de cada capa se rellena con su color de pie (nunca queda un hueco).
//   · Perspectiva atmosférica: cuanto más lejos (par chico), más se tiñe del color del aire (atm.col), con bruma extra
//     al pie de la capa. Se hornea en el lienzo: no cuesta nada por cuadro.
//   · Primer plano por delante del jugador (frente): piezas sueltas con par > 1 y poca opacidad. Si una pieza tapa a
//     un jugador o a un enemigo, se vuelve casi transparente (y vuelve despacio).
//   · Luces del escenario (farol, ventana, fuego, neón): brillo suave que suma luz. Las que están en el plano del
//     jugador también iluminan apenas a los personajes cercanos. Luces de fondo (por capa) solo brillan.
//   · Oscuridad opcional (noche): un velo con huecos donde hay luz, a media resolución y suavizado. Va DEBAJO de los
//     personajes (después de las coberturas); a los personajes les toca solo una fracción (oscPersonajes). Topes: 0,35 fondo, 0,15 personajes.
//   · Hora y clima: lee CLI.hora y CLI.clima (clima.js) y arma el ambiente con la tabla del escenario (ambientes).
//     clima.js también puede mandar el suyo con ESC_ambiente({...}). Cuando cambia, las capas se vuelven a hornear
//     de a dos por cuadro (no se traba).
//
// GANCHOS QUE USA (sin tocar archivos ajenos):
//   · Envuelve L.drawBG de cada misión registrada: si el escenario está activo, dibuja las capas; si no, el de antes
//     (queda en L.drawBG0). ?esc=0 en la dirección apaga todo el sistema (sirve para capturas de ANTES).
//   · Envuelve drawCover (oscuridad, antes de cajas y personajes) y drawForeground (primer plano y luces, antes de
//     granadas y balas: las balas nunca se tiñen ni se tapan).
//   · Después del cielo llama a ESC.trasCielo y a CLI_cielo() de clima.js (sol, luna, estrellas: detrás de todo).
//   · Después de la última capa lejana (par < 0,25, o la marcada con clima:true) llama a ESC.trasLejos y a
//     CLI_fondo() de clima.js (nubes, relámpagos, niebla), antes de las capas cercanas, el piso y los personajes.
//   · El TINTE de la hora y el clima lo hace el escenario, horneado por distancia: con ESC_activo(), CLI_fondo no tiñe.
//   · drawGround y drawForeground de clima.js siguen igual (este archivo no los reemplaza: envuelve drawCover y
//     drawForeground, y como carga antes que clima.js, la lluvia de clima.js queda encima del primer plano).
//
// PARA PRUEBAS: ?esc=0 (apagado) · ?esc=capas (nombres y bordes de cada capa) · ESC_ver('lejos',false) oculta una
// capa · ESC_medir() devuelve cuánto tarda (ms por cuadro) · ESC_ambiente({tinte:'#203060',tinteA:.4,oscuridad:.3}).
//
// UNA CAPA (def.capas[i]):
//   {id, cielo:true?, par, parY, ancho, y, alto, dibujar(g,ancho,alto,R,capa,amb), vivo(ctx,ox,oy,capa)?,
//    niebla?, nieblaPie?, pie:'#color'|'auto'?, alfa?, luces:[{x,y,r,col,fuerza,tipo}]?, segunAmb?, paso:'fino'|'pixel'}
//   · x e y de dibujar son locales a la capa (0…ancho, 0…alto). y es la altura del borde de arriba en el mundo.
//   · vivo dibuja lo que se mueve (trenes, humo): ox es el corrimiento sin envolver; usar ESC_cada(capa,ox,lx,m,fn).
//   · segunAmb: el dibujo cambia con la hora o el clima (amb.hora, amb.clima): se vuelve a dibujar al cambiar.
// EL ESCENARIO (def):
//   {pix:1, nat:'tarde', atm:{col,fuerza,pie}, capas:[...], frente:{par,parY,alfa,ancho,piezas:[{x,y,w,h,dibujar}]|fn(R)},
//    luces:[{x,y,r,col,fuerza,tipo}] | fn(nivel)->[...], ambientes:{base,dia,tarde,noche,amanecer,lluvia,...},
//    oscPersonajes:0.35, semilla}
//   · ambientes.X: {tinte,tinteA,modo} o {tintes:[[modo,col,a],...]}, nieblaMas, nieblaCol, oscuridad, oscCol, luces
const ESC={defs:new Map(),amb:null,ambKey:'',ext:null,on:true,debug:false,oculto:{},trasCielo:[],trasLejos:[],temp:[],
  ms:{fondo:0,mundo:0},cuenta:0,partida:0};
const ESC_OSC_MAX=0.35,ESC_OSC_PERS=0.15; // tope de oscuridad sobre el fondo y sobre los personajes (guía Hondo)
try{const u=new URLSearchParams(location.search).get('esc');if(u==='0')ESC.on=false;if(u==='capas')ESC.debug=true;}catch(e){}

// ---------- utilidades ----------
function ESC_lienzo(w,h){const c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w));c.height=Math.max(1,Math.ceil(h));return c;}
function ESC_rgb(col){
  if(col[0]==='#'){let h=col.slice(1);if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16);return[(n>>16)&255,(n>>8)&255,n&255];}
  const m=col.match(/\d+(\.\d+)?/g);return m?[+m[0],+m[1],+m[2]]:[128,128,128];
}
const ESC_rgba=(col,a)=>{const[r,g,b]=ESC_rgb(col);return`rgba(${r},${g},${b},${Math.max(0,Math.min(1,a)).toFixed(3)})`;};
// lee un píxel copiándolo a un lienzo de 1×1 aparte: si se lee del lienzo de la capa, el navegador lo pasa a la CPU
// y cada copia a la pantalla se vuelve lenta
let ESC_PX=null;
function ESC_pixel(src,x,y){try{if(!ESC_PX){ESC_PX=ESC_lienzo(1,1);ESC_PX.g=ESC_PX.getContext('2d',{willReadFrequently:true});}
  const g=ESC_PX.g;g.clearRect(0,0,1,1);g.drawImage(src,x,y,1,1,0,0,1,1);return g.getImageData(0,0,1,1).data;}catch(e){return[0,0,0,0];}}
const ESC_prof=par=>Math.max(0,Math.min(1,1-(par||0))); // 1 = horizonte · 0 = plano del jugador
const ESC_reducido=()=>typeof MOV_reducido==='function'&&MOV_reducido();
// recorre las copias visibles de un punto local lx de una capa repetida (m: margen en unidades)
function ESC_cada(c,ox,lx,m,fn){const a=c.ancho;let x=((lx+ox)%a+a)%a;while(x-a>-m)x-=a;for(;x<VW+m;x+=a)fn(x);}

// ---------- registrar un escenario ----------
function ESC_registrar(cual,def){
  const lv=typeof cual==='number'?LEVELS[cual]:typeof cual==='string'?LEVELS.find(l=>l.theme===cual):cual;
  if(!lv){console.warn('escenario: no encuentro la misión',cual);return null;}
  const d=ESC_normalizar(def);d.lvl=lv;ESC.defs.set(lv,d);
  if(!lv.ESC_envuelto){
    const prev=lv.drawBG;lv.drawBG0=prev;lv.ESC_envuelto=true;
    lv.drawBG=function(){
      if(ESC_activo())return ESC_fondo();
      if(prev)return prev.apply(this,arguments);
      return lv.theme==='port'?drawBGPort():drawBGDusk();
    };
  }
  // piso y decorado de la capa de juego: usan los ganchos por misión que ya tiene mundo.js (L.drawGround, L.drawDecor).
  // Solo se instalan si el sistema está prendido (con ?esc=0 la misión queda exactamente como antes).
  if(ESC.on&&d.piso&&!lv.ESC_piso){const prev=lv.drawGround;lv.ESC_piso=true;lv.drawGround0=prev;
    lv.drawGround=function(){if(ESC_activo()){ESC_piso(d);return;}if(prev)return prev.apply(this,arguments);};}
  // plataformas, coberturas, frente de túneles y lo de abajo del muelle (caminos-m2.js): ganchos por misión (true = ya lo dibujó el escenario)
  for(const[clave,fn]of[['drawPlat','plat'],['drawCover','cobertura'],['drawTunnelFront','tunelFrente'],['drawBajo','bajo']])
    if(ESC.on&&d[fn]&&!lv['ESC_'+clave]){const prev=lv[clave];lv['ESC_'+clave]=true;
      lv[clave]=function(o){if(ESC_activo()){try{if(d[fn](o,d))return true;}catch(e){console.warn('escenario:',fn,e);}}return prev?prev.apply(this,arguments):false;};}
  if(ESC.on&&d.decor&&!lv.ESC_decor){const prev=lv.drawDecor;lv.ESC_decor=true;
    lv.drawDecor=function(o){if(ESC_activo()){try{if(d.decor(o,d))return true;}catch(e){console.warn('escenario: decor',e);}}return prev?prev.apply(this,arguments):false;};}
  return d;
}
function ESC_normalizar(def){
  const d={pix:def.pix||1,nat:def.nat||null,atm:Object.assign({col:'#808080',fuerza:0,pie:0},def.atm||{}),
    ambientes:def.ambientes||{},capas:[],frente:null,luces:def.luces||[],lucesNivel:null,lucesPartida:-1,
    oscPersonajes:def.oscPersonajes??0.35,semilla:def.semilla||1,paso:def.paso||'fino',
    luzPersonajes:def.luzPersonajes||null,sombra:def.sombra||'#05040c',piso:def.piso||null,decor:def.decor||null,
    plat:def.plat||null,cobertura:def.cobertura||null,tunelFrente:def.tunelFrente||null,caja:def.caja||null,bajo:def.bajo||null,
    extras:def.extras||null,halosAltos:def.halosAltos||null,extrasNivel:null,extrasPartida:-1,sprites:new Map()};
  (def.capas||[]).forEach((c,i)=>{
    const cielo=!!c.cielo,par=c.par??(cielo?0:0.5),y=c.y??0;
    d.capas.push({i,id:c.id||'capa'+i,cielo,par,parY:c.parY??par,ancho:c.ancho||W,y,alto:c.alto||Math.max(1,GROUND-y),
      dibujar:c.dibujar,vivo:c.vivo||null,niebla:c.niebla,nieblaPie:c.nieblaPie,pie:c.pie||null,alfa:c.alfa??1,
      luces:c.luces||null,lucesEncima:!!c.lucesEncima,segunAmb:!!c.segunAmb,protegida:c.protegida??(c.id==='bruma'),paso:c.paso||d.paso,base:null,fin:null,sucio:true,ambBase:''});
  });
  // última capa lejana: después de ella va el clima (nubes, niebla). Se marca con clima:true o es la última con par < 0,25
  d.ultLejos=d.capas.find((c,i)=>(def.capas[i]||{}).clima)||d.capas.filter(c=>c.par<0.25).pop()||d.capas[0]||null;
  if(def.frente){const f=def.frente;
    d.frente={par:f.par??1.3,parY:f.parY??1.1,alfa:f.alfa??0.45,ancho:f.ancho||1200,piezasDef:f.piezas||[],piezas:null,a:new Map(),
      bordes:f.bordes!==false,bordesAbajo:!!f.bordesAbajo,tapado:new Map(),vivo:f.vivo||null};}
  return d;
}
const ESC_def=()=>typeof L!=='undefined'&&L?ESC.defs.get(L):null;
function ESC_activo(){return ESC.on&&!!ESC_def();}
// para el ilustrador de personajes: de qué lado viene la luz cálida, la fría y el color de la sombra de contacto
// {calida:'#ffb46a', lado:-1 (izquierda) | 1 (derecha), fria:'#9ab4ff', sombra:'#05040c'} · null si el escenario está apagado
function ESC_luzPersonajes(){const d=ESC.on?ESC_def():null;if(!d||!d.luzPersonajes)return null;return Object.assign({sombra:d.sombra},d.luzPersonajes);}
function ESC_sombra(){const d=ESC.on?ESC_def():null;return d?d.sombra:null;} // color de la sombra de contacto de la misión
const ESC_altoContraste=()=>typeof ACC!=='undefined'&&!!ACC.contraste;
// MOVIMIENTO REDUCIDO: el parallax se mueve a la mitad (las capas se separan la mitad de lo normal)
const ESC_parFondo=p=>ESC_reducido()?p*0.5:p,ESC_parFrente=p=>ESC_reducido()?1+(p-1)*0.5:p;
// altura de la cámara "en reposo": el escenario se diseña para esa vista y el parallax vertical cuenta desde ahí
const ESC_reposo=()=>typeof camReposo==='function'&&typeof state!=='undefined'&&state==='play'?camReposo():0;

// ---------- ambiente (hora y clima) ----------
// Valores neutros de arranque: cada escenario los pisa con def.ambientes (el Director de arte decide los finales).
const ESC_AMB_HORA={
  amanecer:{tinte:'#ff9ab0',tinteA:0.14,modo:'overlay',luces:0.4},
  dia:{luces:0},
  tarde:{tinte:'#ffa060',tinteA:0.14,modo:'overlay',luces:0.6},
  noche:{tinte:'#2e3070',tinteA:0.55,modo:'multiply',nieblaCol:'#2a2c50',luces:1,oscuridad:0.3}};
const ESC_AMB_CLIMA={
  nublado:{tinte:'#8a8e9a',tinteA:0.28,modo:'multiply',nieblaMas:0.06},
  lluvia:{tinte:'#6a7488',tinteA:0.22,modo:'multiply',nieblaMas:0.14,luces:0.8},
  tormenta:{tinte:'#4a5068',tinteA:0.46,modo:'multiply',nieblaMas:0.14,luces:1,oscuridad:0.15},
  niebla:{nieblaMas:0.35,nieblaCol:'#c8ccd6'},
  nieve:{tinte:'#8a96aa',tinteA:0.2,modo:'screen',nieblaMas:0.1},
  viento:{nieblaMas:0.04}};
function ESC_ambiente(obj){ESC.ext=obj||null;ESC.ambKey='';} // clima.js (u otro) manda su ambiente; null = volver al automático
function ESC_calcAmb(d){
  const hz=typeof CLI!=='undefined'&&CLI.hora||d.nat||'dia',cl=typeof CLI!=='undefined'&&CLI.clima||'despejado',A=d.ambientes;
  const partes=[];if(A.base)partes.push(A.base);
  if(A[hz])partes.push(A[hz]);else if(hz!==d.nat&&ESC_AMB_HORA[hz])partes.push(ESC_AMB_HORA[hz]);
  if(cl!=='despejado'){if(A[cl])partes.push(A[cl]);else if(ESC_AMB_CLIMA[cl])partes.push(ESC_AMB_CLIMA[cl]);}
  if(ESC.ext)partes.push(ESC.ext);
  const a={hora:hz,clima:cl,tintes:[],nieblaMas:0,nieblaCol:null,oscuridad:0,oscCol:'#0a0814',luces:1};
  for(const p of partes){
    if(p.reemplazar){a.tintes=[];a.nieblaMas=0;a.oscuridad=0;}
    if(p.tinte)a.tintes.push([p.modo||'multiply',p.tinte,p.tinteA??0.2]);
    if(p.tintes)a.tintes.push(...p.tintes);
    if(p.nieblaMas)a.nieblaMas+=p.nieblaMas;if(p.nieblaCol)a.nieblaCol=p.nieblaCol;
    if(p.oscuridad!==undefined)a.oscuridad=p.reemplazar?p.oscuridad:Math.max(a.oscuridad,p.oscuridad);
    if(p.oscCol)a.oscCol=p.oscCol;if(p.luces!==undefined)a.luces=p.luces;
  }
  if(ESC_altoContraste())a.nieblaMas+=0.3; // ALTO CONTRASTE: más niebla en lo lejano, el juego resalta
  a.oscuridad=Math.min(a.oscuridad,ESC_OSC_MAX);a.nieblaMas=Math.min(a.nieblaMas,0.7);
  return a;
}
function ESC_ambTick(d){
  if(ESC.amb&&ESC.ambKey&&(T%20))return;
  const a=ESC_calcAmb(d),k=JSON.stringify(a);
  if(k===ESC.ambKey&&ESC.amb)return;
  ESC.amb=a;ESC.ambKey=k;
  for(const c of d.capas)c.sucio=true;
  if(d.frente&&d.frente.piezas)for(const p of d.frente.piezas)p.sucio=true;
}

// ---------- horneado ----------
function ESC_hornearBase(d,c,a){
  const cv2=ESC_lienzo(c.ancho*d.pix,c.alto*d.pix),g=cv2.getContext('2d');g.scale(d.pix,d.pix);
  const R=mulberry32(d.semilla*97+c.i*13+1);
  try{c.dibujar&&c.dibujar(g,c.ancho,c.alto,R,c,a);}catch(e){console.warn('escenario: capa',c.id,e);}
  c.base=cv2;c.ambBase=c.segunAmb&&a?a.hora+'|'+a.clima:'';
}
// niebla + tinte encima del dibujo, sin tocar lo transparente
function ESC_hornearFin(d,c,a){
  if(!c.base||(c.segunAmb&&c.ambBase!==a.hora+'|'+a.clima))ESC_hornearBase(d,c,a);
  const b=c.base;let f=c.fin;
  if(!f||f.width!==b.width||f.height!==b.height){f=ESC_lienzo(b.width,b.height);c.fin=f;}
  const g=f.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.globalAlpha=1;
  g.clearRect(0,0,f.width,f.height);g.drawImage(b,0,0);
  const prof=c.cielo?0:ESC_prof(c.par);
  if(!c.cielo&&!c.sinNiebla&&!c.protegida){
    const col=a.nieblaCol||d.atm.col,n=Math.min(1,(c.niebla??d.atm.fuerza*prof)+a.nieblaMas*prof);
    g.globalCompositeOperation='source-atop';
    if(n>0.003){g.globalAlpha=n;g.fillStyle=col;g.fillRect(0,0,f.width,f.height);}
    const pie=(c.nieblaPie??d.atm.pie)*prof;
    if(pie>0.003){g.globalAlpha=1;const gr=g.createLinearGradient(0,f.height*0.45,0,f.height);
      gr.addColorStop(0,ESC_rgba(col,0));gr.addColorStop(1,ESC_rgba(col,pie));g.fillStyle=gr;g.fillRect(0,0,f.width,f.height);}
  }
  if(a.tintes.length&&!c.protegida){const k=c.cielo?1:0.45+0.55*prof;
    for(const[m,col,al]of a.tintes){g.globalCompositeOperation=m;g.globalAlpha=Math.min(1,al*k);g.fillStyle=col;g.fillRect(0,0,f.width,f.height);}
    g.globalCompositeOperation='destination-in';g.globalAlpha=1;g.drawImage(b,0,0);}
  g.globalCompositeOperation='source-over';g.globalAlpha=1;
  // colores de borde: el cielo se estira arriba y abajo; las capas con pie:'auto' rellenan abajo con su última fila
  if(c.cielo||c.pie==='auto'){const tp=ESC_pixel(f,f.width>>1,0),bt=ESC_pixel(f,f.width>>1,f.height-1);
    c.colTop=`rgb(${tp[0]},${tp[1]},${tp[2]})`;c.colBot=bt[3]>200?`rgb(${bt[0]},${bt[1]},${bt[2]})`:null;}
  c.sucio=false;
}
function ESC_piezas(d){
  const f=d.frente;if(!f||f.piezas)return;
  const R=mulberry32(d.semilla*131+7),lista=typeof f.piezasDef==='function'?f.piezasDef(R):f.piezasDef;
  f.piezas=lista.map((p,i)=>({i,x:p.x,y:p.y||0,w:p.w,h:p.h,abajo:!!p.abajo,arriba:!!p.arriba,dibujar:p.dibujar,par:1,cielo:false,sinNiebla:true,ancho:p.w,alto:p.h,
    base:null,fin:null,sucio:true,segunAmb:false,id:'frente'+i}));
}
// todo listo antes de jugar (se llama al empezar la misión: no hay tirones en el medio)
function ESC_preparar(d){
  if(!d)return;const a=ESC.amb&&ESC.ambKey?ESC.amb:ESC_calcAmb(d);ESC.amb=a;ESC.ambKey=JSON.stringify(a);
  for(const c of d.capas)if(c.sucio||!c.fin)ESC_hornearFin(d,c,a);
  ESC_piezas(d);if(d.frente)for(const p of d.frente.piezas)if(p.sucio||!p.fin)ESC_hornearPieza(d,p,a);
}
function ESC_hornearPieza(d,p,a){
  if(!p.base){const c=ESC_lienzo(p.w*d.pix,p.h*d.pix),g=c.getContext('2d');g.scale(d.pix,d.pix);
    try{p.dibujar&&p.dibujar(g,p.w,p.h,mulberry32(d.semilla*7+p.i*29+3));}catch(e){console.warn('escenario: frente',p.i,e);}p.base=c;}
  ESC_hornearFin(d,p,a);
}

// ---------- fondo (reemplaza a L.drawBG) ----------
function ESC_fondo(){
  const d=ESC_def();if(!d)return;
  const t0=performance.now();
  ESC_ambTick(d);
  let horneos=0;
  for(const c of d.capas)if(!c.fin){ESC_hornearFin(d,c,ESC.amb);}else if(c.sucio&&horneos<2){ESC_hornearFin(d,c,ESC.amb);horneos++;}
  const top=camY-2,bot=camY+VH+2,ancho=VW+2,a=ESC.amb;
  const diferidas=[]; // luces de capas que atraviesan la niebla de las capas de adelante (lucesEncima)
  ESC.oscFondo=false;
  for(const c of d.capas){
    if(ESC.oculto[c.id])continue;
    if(c.protegida&&!ESC.oscFondo&&a.oscuridad>0.01){ESC.oscFondo=true;
      try{const vis=ESC_enVista(ESC_lucesNivel(d).concat(ESC.temp),60);ESC_oscArmar(vis,a);ctx.save();ctx.translate(-camX,0);ESC_oscPintar(ESC_oscAlfas(d,a)[0]);ctx.restore();}catch(e){}}
    const ox=-camX*ESC_parFondo(c.par),rp=ESC_reposo();let oy=c.y+(camY-rp)*(1-ESC_parFondo(c.parY));
    let x0=((ox%c.ancho)+c.ancho)%c.ancho-c.ancho;
    if(c.paso==='pixel'){x0=Math.round(x0);oy=Math.round(oy);}else{x0=q(x0);oy=q(oy);}
    if(c.alfa<1)ctx.globalAlpha=c.alfa;
    if(c.cielo&&c.colTop&&oy>top){ctx.fillStyle=c.colTop;ctx.fillRect(-1,top,ancho,oy-top+0.5);}
    for(let x=x0;x<VW+1;x+=c.ancho)ctx.drawImage(c.fin,x,oy,c.ancho,c.alto);
    const pie=c.cielo||c.pie==='auto'?c.colBot:c.pie;
    if(pie&&oy+c.alto<bot){ctx.fillStyle=pie;ctx.fillRect(-1,oy+c.alto-0.5,ancho,bot-(oy+c.alto)+0.5);}
    ctx.globalAlpha=1;
    if(c.vivo)try{c.vivo(ctx,ox,oy,c,a);}catch(e){console.warn('escenario: vivo',c.id,e);c.vivo=null;}
    if(c.luces&&a.luces>0.01){if(c.lucesEncima)diferidas.push([c,ox,oy]);else ESC_lucesCapa(c,ox,oy,a.luces);}
    if(c.cielo){for(const f of ESC.trasCielo)try{f(d,c);}catch(e){}
      if(typeof CLI_cielo==='function')try{CLI_cielo();}catch(e){}} // clima.js: estrellas, sol o luna, detrás de los edificios
    // clima.js: nubes, relámpagos y niebla entre lo lejano y lo cercano (una sola vez, después de la última capa lejana)
    if(c===d.ultLejos){for(const f of ESC.trasLejos)try{f(d,c);}catch(e){}
      if(typeof CLI_fondo==='function')try{CLI_fondo();}catch(e){}}
    if(ESC.debug)ESC_debugCapa(c,x0,oy);
  }
  for(const[c,ox,oy]of diferidas)ESC_lucesCapa(c,ox,oy,a.luces);
  ESC.ms.fondo=ESC.ms.fondo*0.9+(performance.now()-t0)*0.1;
}
function ESC_debugCapa(c,x0,oy){
  ctx.save();ctx.strokeStyle='rgba(120,255,160,0.8)';ctx.lineWidth=0.5;ctx.strokeRect(Math.max(x0,0)+0.5,oy+0.5,Math.min(c.ancho,VW)-1,c.alto-1);
  ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(2,oy+1,40,6);ctx.fillStyle='#7dff9a';ctx.font='5px monospace';
  ctx.fillText(c.id+' '+c.par,3,oy+6);ctx.restore();
}

// ---------- luces ----------
const ESC_GLOW=new Map();
function ESC_glow(col){
  let s=ESC_GLOW.get(col);if(s)return s;
  const n=64,c=ESC_lienzo(n,n),g=c.getContext('2d'),gr=g.createRadialGradient(n/2,n/2,0,n/2,n/2,n/2);
  gr.addColorStop(0,ESC_rgba(col,1));gr.addColorStop(0.2,ESC_rgba(col,0.6));gr.addColorStop(0.55,ESC_rgba(col,0.18));gr.addColorStop(1,ESC_rgba(col,0));
  g.fillStyle=gr;g.fillRect(0,0,n,n);ESC_GLOW.set(col,c);return c;
}
// cuánto brilla cada tipo de luz ahora (con MOVIMIENTO REDUCIDO no titila nada)
function ESC_pulso(l,i){
  if(ESC_reducido())return 0.95;
  switch(l.tipo){
  case 'fuego':return 0.84+0.09*Math.sin(T/3.1+i*1.7)+0.07*Math.sin(T/1.7+i*3.3);
  case 'neon':return hash(((T>>2)+i*37)|0)<0.025?0.3:1;
  case 'ventana':return 1;
  default:return hash(((T>>3)+i*11)|0)<0.01?0.45:0.97+0.03*Math.sin(T/9+i);} // farol
}
function ESC_brillo(x,y,r,col,a){if(a<=0.004||r<=0)return;const f=()=>{ctx.globalAlpha=Math.min(1,a);ctx.drawImage(ESC_glow(col),x-r,y-r,r*2,r*2);};if(typeof GN_luz==='function')GN_luz(f);else f();} // a resolución de pantalla (grilla nítida, base.js)
function ESC_lucesCapa(c,ox,oy,k){
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.imageSmoothingEnabled=true;
  c.luces.forEach((l,i)=>{const p=ESC_pulso(l,i)*k*(l.fuerza??0.5);ESC_cada(c,ox,l.x,l.r||8,x=>ESC_brillo(x,oy+l.y,l.r||8,l.col||'#ffd890',p));});
  ctx.restore();
}
// luces del plano del jugador (coordenadas del mundo): las del escenario + las temporales (explosiones, fogonazos)
function ESC_lucesNivel(d){
  if(d.lucesPartida!==ESC.partida||!d.lucesNivel){
    let l=typeof d.luces==='function'?d.luces(d.lvl,d):d.luces;d.lucesNivel=(l||[]).slice().sort((a,b)=>a.x-b.x);d.lucesPartida=ESC.partida;}
  return d.lucesNivel;
}
function ESC_luzTemp(o){ESC.temp.push({x:o.x,y:o.y,r:o.r||30,col:o.col||'#ffb050',fuerza:o.fuerza??0.6,dur:o.dur||12,t:0,tipo:'temp'});}
ON_STEP.push(()=>{if(ESC.temp.length){for(const l of ESC.temp)l.t++;ESC.temp=ESC.temp.filter(l=>l.t<l.dur);}});
function ESC_enVista(lista,m){const x0=camX-m,x1=camX+VW+m,out=[];for(let i=0;i<lista.length;i++){const l=lista[i],r=l.r||30;if(l.x+r>=x0&&l.x-r<=x1)out.push([l,i]);}return out;}

// ---------- oscuridad con huecos de luz (debajo de los personajes) ----------
let ESC_OSC=null;
const ESC_OSC_RES=0.5; // media resolución: se suaviza al copiar
function ESC_oscArmar(vis,a){
  const e=ESC_OSC_RES,w=Math.ceil((VW+4)*e),h=Math.ceil((VH+4)*e);
  if(!ESC_OSC||ESC_OSC.width<w||ESC_OSC.height<h)ESC_OSC=ESC_lienzo(Math.ceil((W+4)*e),Math.ceil((H+4)*e));
  const g=ESC_OSC.getContext('2d'),x0=camX-2,y0=camY-2;
  g.globalCompositeOperation='source-over';g.globalAlpha=1;g.clearRect(0,0,ESC_OSC.width,ESC_OSC.height);
  g.fillStyle=a.oscCol;g.fillRect(0,0,w,h);
  g.globalCompositeOperation='destination-out';const blanco=ESC_glow('#ffffff');
  for(const[l,i]of vis){const r=(l.r||30)*1.5,p=Math.min(1,(l.fuerza??0.6)*1.4*(l.tipo==='temp'?1-l.t/l.dur:ESC_pulso(l,i)*a.luces));
    if(p<=0.01)continue;g.globalAlpha=p;g.drawImage(blanco,(l.x-r-x0)*e,(l.y-r-y0)*e,2*r*e,2*r*e);}
  g.globalCompositeOperation='source-over';g.globalAlpha=1;
  ESC.oscCam=[x0,y0,w,h];
}
function ESC_oscPintar(al){
  if(al<0.005||!ESC_OSC||!ESC.oscCam)return;const[x0,y0,w,h]=ESC.oscCam,e=ESC_OSC_RES;
  ctx.save();ctx.imageSmoothingEnabled=true;ctx.globalAlpha=Math.min(1,al);ctx.drawImage(ESC_OSC,0,0,w,h,x0,y0,w/e,h/e);ctx.restore();
}
// La oscuridad se pinta en dos veces con el mismo velo: una antes de los personajes (a1) y otra después (a2), así
// el escenario queda con la oscuridad entera y a los personajes les toca solo la fracción oscPersonajes.
function ESC_oscAlfas(d,a){return[a.oscuridad,0];} // la oscuridad va solo al fondo lejano (antes de la bruma) y al piso; nunca sobre los personajes
// ---------- personajes que entran al mundo del escenario ----------
function ESC_personajes(){
  const out=[];
  try{if(typeof players!=='undefined')for(const p of players)if(!p.dead){const o=p.ride||p;out.push([o.x,o.y,o.w||10,o.h||18]);}
    if(typeof enemies!=='undefined')for(const e of enemies)if(!e.gone&&e.x+e.w>camX-10&&e.x<camX+VW+10)out.push([e.x,e.y,e.w,e.h]);
    if(typeof allies!=='undefined')for(const e of allies)if(!e.dead&&!e.gone)out.push([e.x,e.y,e.w||10,e.h||18]);}catch(e){}
  return out;
}

// ---------- primer plano (por delante del jugador) ----------
function ESC_frente(d){
  const f=d.frente;if(!f||ESC.oculto.frente)return;
  ESC_piezas(d);
  let horneos=0;for(const p of f.piezas)if(!p.fin||p.sucio&&horneos<3){ESC_hornearPieza(d,p,ESC.amb);horneos++;}
  const par=ESC_parFrente(f.par),parY=ESC_parFrente(f.parY),rp=ESC_reposo();
  const dx=camX*(1-par),dy=(camY-rp)*(1-parY),gente=ESC_personajes(),cx=camX+VW/2,ac=ESC_altoContraste()?0.5:1;
  for(const p of f.piezas){
    const base=p.x+dx;let k=Math.ceil((camX-p.w-base)/f.ancho);
    for(let X=base+k*f.ancho;X<camX+VW;X+=f.ancho,k++){
      const Y=p.abajo?camY+VH-p.h+p.y:p.arriba?camY+p.y:p.y+dy,key=p.i*4096+(k&4095); // abajo / arriba: pegada al borde de la pantalla
      // solo en los bordes: lo que pasa por la franja de juego del centro (y 40–150) se desvanece
      let borde=1;if(f.bordes&&(p.arriba||Y<camY+150*VH/H||(p.abajo&&f.bordesAbajo))){ // bordesAbajo: lo de abajo también, solo en los costados // lo que sube más arriba de y 150 va solo en el 15 % de cada costado
        const dc=Math.abs(X+p.w/2-cx)-p.w/2;borde=Math.max(0,Math.min(1,(dc-VW*0.33)/(VW*0.03)));}
      if(borde<=0){f.a.delete(key);continue;}
      // si tapa a un personaje más de 1 s, baja a 40 %
      let tapa=false;for(const[gx,gy,gw,gh]of gente)if(gx+gw>X&&gx<X+p.w&&gy+gh>Y&&gy<Y+p.h){tapa=true;break;}
      const tt=tapa?(f.tapado.get(key)||0)+1:0;f.tapado.set(key,tt);
      const meta=(tt>60?0.4:1)*f.alfa,prev=f.a.has(key)?f.a.get(key):meta,al=prev+(meta-prev)*0.08;f.a.set(key,al);
      ctx.globalAlpha=al*borde*ac;ctx.drawImage(p.fin,q(X),q(Y),p.w,p.h);
      if(ESC.debug){ctx.globalAlpha=1;ctx.strokeStyle='rgba(255,140,90,0.8)';ctx.lineWidth=0.5;ctx.strokeRect(X,Y,p.w,p.h);}
    }
  }
  ctx.globalAlpha=1;
  if(f.vivo)try{f.vivo(ctx,d,par,ac);}catch(e){console.warn('escenario: frente vivo',e);f.vivo=null;}
  ctx.globalAlpha=1;
  if(f.a.size>400){f.a.clear();f.tapado.clear();}
}

// ---------- capa de luz del mundo: brillo en las fuentes y un toque sobre los personajes cercanos ----------
function ESC_lucesMundo(d,vis,a){
  if(!vis.length)return;
  const gente=ESC_personajes();
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.imageSmoothingEnabled=true;
  for(const[l,i]of vis){
    const temp=l.tipo==='temp',p=temp?(l.fuerza)*(1-l.t/l.dur):ESC_pulso(l,i)*a.luces*(l.fuerza??0.5);if(p<=0.01)continue;
    const r=l.r||30,col=l.col||'#ffd890';
    ESC_brillo(l.x,l.y,r,col,p*0.55);          // aire alrededor de la fuente
    ESC_brillo(l.x,l.y,r*0.25,col,p*0.9);       // núcleo
    if(l.suelo!==false&&!temp){const dy=GROUND-l.y;if(dy>0&&dy<r*1.6){ctx.globalAlpha=Math.min(1,p*0.35);
      ctx.drawImage(ESC_glow(col),l.x-r*0.9,GROUND-r*0.12,r*1.8,r*0.24);}} // charco de luz en el piso
    // personajes cerca: un poco de luz del color de la fuente
    for(const[gx,gy,gw,gh]of gente){const cx=gx+gw/2,cy=gy+gh/2,dd=Math.hypot(cx-l.x,cy-l.y);if(dd>=r)continue;
      const rr=Math.max(gw,gh)*0.9;ESC_brillo(cx-(cx-l.x)*0.15,cy-(cy-l.y)*0.15,rr,col,p*0.28*(1-dd/r));}
  }
  ctx.restore();
}

// ---------- piso y decorado propio (capa de juego) ----------
// def.piso(ctx, x0, x1, d): dibuja el piso de la misión en coordenadas del mundo, de x0 a x1 (lo visible).
// def.extras(nivel, d) → [{x, k}]: decoración propia del escenario (no es de L.decor; no choca con nada). Se dibuja con
// def.decor(o, d), después del piso y antes del decorado de la misión.
function ESC_extras(d){
  if(d.extrasPartida!==ESC.partida||!d.extrasNivel){d.extrasNivel=(d.extras?d.extras(d.lvl,d):[])||[];d.extrasPartida=ESC.partida;}
  return d.extrasNivel;
}
function ESC_piso(d){
  const x0=Math.floor(camX)-12,x1=Math.ceil(camX+VW)+12;
  try{d.piso(ctx,x0,x1,d);}catch(e){console.warn('escenario: piso',e);}
  ESC_halosAltos(d,x0,x1);
  if(d.decor)for(const o of ESC_extras(d))if(o.x>x0-60&&o.x<x1+10)try{d.decor(o,d);}catch(e){}
}
// halo detrás de las plataformas altas, de noche (regla de Arte: a la altura de las plataformas el fondo no baja de 0,12).
// Va en el piso, ANTES de plataformas y personajes: aclara solo el fondo que queda detrás de quien está arriba.
// def.halosAltos = {col, a, r} (a = intensidad de noche; de día baja a un tercio). Las plataformas con una luz propia lo justifican.
const ESC_HALO=new Map();
function ESC_haloSpr(col){ // óvalo de meseta ancha y borde muy suave: aclara sin dibujar un foco
  let s=ESC_HALO.get(col);if(s)return s;const n=64,c=ESC_lienzo(n,n),g=c.getContext('2d'),gr=g.createRadialGradient(n/2,n/2,0,n/2,n/2,n/2);
  gr.addColorStop(0,ESC_rgba(col,1));gr.addColorStop(0.4,ESC_rgba(col,0.92));gr.addColorStop(0.72,ESC_rgba(col,0.42));gr.addColorStop(1,ESC_rgba(col,0));
  g.fillStyle=gr;g.fillRect(0,0,n,n);ESC_HALO.set(col,c);return c;}
function ESC_halosAltos(d,x0,x1){
  const h=d.halosAltos;if(!h||typeof platforms==='undefined')return;const a=ESC.amb||{},k=(a.hora==='noche'?1:0.35)*(h.a??0.5);if(k<0.02)return;
  ctx.save();ctx.globalCompositeOperation='screen';ctx.imageSmoothingEnabled=true;
  const spr=ESC_haloSpr(h.col);
  for(const pl of platforms){if(pl.roof||pl.pyr||pl.ar||pl.salaAr||pl.y>=(h.yMax??112)||pl.y<20||pl.x>x1+60||pl.x+pl.w<x0-60)continue;
    // más fuerte cuanto más alta la plataforma (ahí el cielo de noche es más oscuro)
    const alt=Math.max(0,Math.min(1,(100-pl.y)/40)),kk=Math.min(1,h.plano?k*0.75:k*(0.55+0.45*alt)), /* plano: igual a toda altura (guía §9, sin bruma alta) */w=pl.w+(h.r??34)*2,hh=h.alto??60;
    ctx.globalAlpha=kk;ctx.drawImage(spr,pl.x+pl.w/2-w/2,pl.y-16-hh/2,w,hh);}
  ctx.restore();
}
// lienzo chico guardado (decorado, sombras, llamas): se dibuja una vez y después solo se copia
function ESC_sprite(d,key,w,h,fn){
  let c=d.sprites.get(key);if(c)return c;
  c=ESC_lienzo(w,h);const g=c.getContext('2d');g.imageSmoothingEnabled=false;try{fn(g,w,h);}catch(e){console.warn('escenario: sprite',key,e);}
  d.sprites.set(key,c);return c;
}
// ---------- ayudas de pixel art (para dibujar dentro de las capas: todo a píxel entero) ----------
const ESC_px={
  R(g,x,y,w,h,col){g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));},
  disc(g,cx,cy,r,col){g.fillStyle=col;cx=Math.round(cx);cy=Math.round(cy);for(let dy=-r;dy<=r;dy++){const w=Math.floor(Math.sqrt(r*r-dy*dy)+0.3);g.fillRect(cx-w,cy+dy,2*w+1,1);}},
  oval(g,cx,cy,rx,ry,col){g.fillStyle=col;cx=Math.round(cx);cy=Math.round(cy);for(let dy=-ry;dy<=ry;dy++){const w=Math.round(rx*Math.sqrt(Math.max(0,1-(dy*dy)/(ry*ry+0.01))));g.fillRect(cx-w,cy+dy,2*w+1,1);}},
  line(g,x0,y0,x1,y1,col,t=1){g.fillStyle=col;x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);
    const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;
    for(let n=0;n<4000;n++){g.fillRect(x0,y0,t,t);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx;}if(e2<=dx){e+=dx;y0+=sy;}}},
  // cielo en escalones de 'paso' px entre paradas [[y,'#col'],...]
  escalones(g,w,h,stops,paso=4){const ys=stops.map(s=>s[0]),cs=stops.map(s=>ESC_rgb(s[1]));
    for(let y=0;y<h;y+=paso){let i=0;while(i<ys.length-2&&y>=ys[i+1])i++;const t=Math.min(1,Math.max(0,(y-ys[i])/(ys[i+1]-ys[i]||1)));
      const c=cs[i].map((v,k)=>Math.round(v+(cs[i+1][k]-v)*t));g.fillStyle=`rgb(${c})`;g.fillRect(0,y,w,paso);}},
  // franja de niebla de abajo hacia arriba (a0 arriba, a1 abajo), fila por fila
  banda(g,w,y0,y1,col,a0,a1){for(let y=Math.round(y0);y<Math.round(y1);y++){const t=(y-y0)/Math.max(1,y1-y0);g.globalAlpha=Math.max(0,Math.min(1,a0+(a1-a0)*t));g.fillStyle=col;g.fillRect(0,y,w,1);}g.globalAlpha=1;},
  // cresta que se repite sin costura cada w px (frecuencias enteras)
  cresta(g,w,base,amp,seed,col,freq=1,fondo=999){g.fillStyle=col;const n=k=>Math.max(1,Math.round(w*0.021*freq*k/6.283)),T2=6.283/w;
    const f1=n(1),f2=n(2.7),f3=n(6.2),p1=seed*0.7,p2=seed*1.3,p3=seed*2.9;
    for(let x=0;x<w;x++){const h=Math.sin(x*T2*f1+p1)*0.5+Math.sin(x*T2*f2+p2)*0.3+Math.sin(x*T2*f3+p3)*0.12,t=Math.round(base-amp*(h+0.6));g.fillRect(x,t,1,fondo-t);}},
  // siluetas de edificios rotos; ventanas: probabilidad; devuelve las ventanas prendidas [[x,y],...]
  siluetas(g,w,R,base,hmin,hmax,col,win,winCol,paso=[14,30],fondo=60){const vent=[];let x=0;
    while(x<w){const bw=Math.round(paso[0]+R()*(paso[1]-paso[0])),h=Math.round(hmin+R()*(hmax-hmin)),top=base-h,roto=R()>0.4,a=R(),b=R();
      for(const dx of[0,-w]){const X=x+dx;if(X+bw<0||X>w)continue;g.fillStyle=col;g.fillRect(X,top,bw,base-top+fondo);
        if(roto){g.fillRect(X+Math.round(bw*0.3),top-3,Math.round(bw*0.25),3);g.fillRect(X+Math.round(bw*0.6),top-6,2,6);}}
      if(win)for(let wy=top+4;wy<base-6;wy+=5)for(let wx=x+3;wx<x+bw-3;wx+=4)if(R()<win){for(const dx of[0,-w]){g.fillStyle=winCol;g.fillRect(wx+dx,wy,1,2);}vent.push([wx%w,wy]);}
      x+=bw+Math.round(a*4);}
    return vent;},
  grua(g,x,base,h,col){const P=ESC_px,top=base-h;P.line(g,x,base,x,top,col);P.line(g,x+4,base,x+4,top,col);
    for(let y=base;y>top+4;y-=6){P.line(g,x,y,x+4,y-6,col);P.line(g,x,y-6,x+4,y-6,col);}
    P.R(g,x-34,top,56,2,col);P.line(g,x-34,top+2,x+2,top+2,col);for(let i=x-32;i<x;i+=6)P.line(g,i,top+2,i+3,top,col);
    P.R(g,x+12,top+2,8,5,col);P.line(g,x+2,top-8,x-30,top,col);P.line(g,x+2,top-8,x+18,top,col);P.R(g,x+1,top-9,3,9,col);
    P.line(g,x-22,top+2,x-22,top+22,col);P.R(g,x-24,top+22,5,3,col);},
  torre(g,x,base,h,col){const P=ESC_px,top=base-h;P.line(g,x-9,base,x-2,top,col);P.line(g,x+9,base,x+2,top,col);
    for(let y=base;y>top+6;y-=9){const k=(base-y)/h,w=9-7*k,k2=(base-y+9)/h,w2=9-7*k2;P.line(g,x-w,y,x+w2,y-9,col);P.line(g,x+w,y,x-w2,y-9,col);}
    P.R(g,x-12,top+8,25,1,col);P.R(g,x-9,top+16,19,1,col);P.R(g,x-2,top-4,5,4,col);
    g.fillStyle=col;for(const yy of[top+8,top+16])for(const xx of[x-12,x+12])g.fillRect(xx,yy+1,1,2);},
};
// bruma alta (regla de Arte): de noche, el fondo a la altura de las plataformas (y 50–110) no baja de 0,12. Capa muy tenue,
// protegida del tinte como la del pie, que sube suave desde y 50 y se funde con la del pie. De día casi no se nota.
// k (opcional): cuánto de la bruma va según el ambiente — número, {hora:k} o función(a)→k. Sin k: noche 1, el resto 0,45.
function ESC_brumaAlta(col,max,kAmb){max=max??0.22;return{id:'bruma alta',par:0.6,parY:1,ancho:W,y:50,alto:G0_ESC-50+2,pie:'auto',niebla:0,nieblaPie:0,protegida:true,segunAmb:true,
  dibujar(g,w,h,R,c,a){const k0=a&&a.hora==='noche'?1:0.45,k=typeof kAmb==='function'?kAmb(a||{}):typeof kAmb==='number'?kAmb:kAmb&&a&&kAmb[a.hora]!=null?kAmb[a.hora]:k0;for(let y=0;y<h;y++){const u=Math.min(1,y/30),sm=u*u*(3-2*u);g.globalAlpha=max*k*sm;g.fillStyle=col;g.fillRect(0,y,w,1);}g.globalAlpha=1;}};}
const G0_ESC=GROUND;
// sombra de contacto pixelada (óvalo de 3 px de alto, ancho del cuerpo + 2), del color de sombra de la misión
function ESC_sombraContacto(d,cx,w,y,al){
  const ww=Math.max(2,Math.round(w+2)),c=ESC_sprite(d,'sombra'+ww,ww,3,(g)=>ESC_px.oval(g,ww/2-0.5,1,Math.floor(ww/2),1,d.sombra));
  ctx.globalAlpha=al??0.6;ctx.drawImage(c,Math.round(cx-ww/2),Math.round(y)-2);ctx.globalAlpha=1;
}

// ---------- ganchos ----------
// antes de cajas, enemigos y jugadores: la oscuridad cae sobre el escenario
if(typeof drawCover==='function'){const ESC_cob0=drawCover;drawCover=function(){const r=ESC_cob0.apply(this,arguments);
  try{if(ESC_activo()){const d=ESC_def();ESC_ambTick(d);const a=ESC.amb;
    if(a.oscuridad>0.01){
      if(ESC.oscFondo&&ESC.oscCam){ // el fondo ya se oscureció detrás de la bruma: acá solo el piso
        ctx.save();ctx.beginPath();ctx.rect(camX-4,GROUND,VW+8,VH+8);ctx.clip();ESC_oscPintar(ESC_oscAlfas(d,a)[0]);ctx.restore();}
      else{ESC.oscCam=null;const vis=ESC_enVista(ESC_lucesNivel(d).concat(ESC.temp),60);ESC_oscArmar(vis,a);ESC_oscPintar(ESC_oscAlfas(d,a)[0]);}}}}catch(e){console.warn('escenario: oscuridad',e);}
  return r;};}
// después de los jugadores y antes de granadas y balas: primer plano, un poco de oscuridad sobre los personajes y luces
if(typeof drawForeground==='function'){const ESC_frente0=drawForeground;drawForeground=function(){const r=ESC_frente0.apply(this,arguments);
  try{if(ESC_activo()){const t0=performance.now(),d=ESC_def(),a=ESC.amb||ESC_calcAmb(d),vis=ESC_enVista(ESC_lucesNivel(d).concat(ESC.temp),60);
    // (la oscuridad ya no se pinta sobre los personajes: aclaraba la regla 2 al revés, oscurecía también el fondo detrás de ellos)
    ESC_frente(d);
    if(a.luces>0.01||ESC.temp.length)ESC_lucesMundo(d,vis,a);
    ESC.ms.mundo=ESC.ms.mundo*0.9+(performance.now()-t0)*0.1;}}catch(e){console.warn('escenario: mundo',e);}
  return r;};}
// cajas (combate.js no tiene gancho por misión): el escenario puede dibujarlas con def.caja(c, d) → true
if(typeof drawCrate==='function'){const ESC_caja0=drawCrate;drawCrate=function(c){
  if(ESC_activo()){const d=ESC_def();if(d.caja)try{if(d.caja(c,d))return;}catch(e){console.warn('escenario: caja',e);}}
  return ESC_caja0.apply(this,arguments);};}
// al empezar cada misión: se hornea todo antes de jugar
ON_START.push(()=>{ESC.partida++;ESC.temp=[];ESC.ambKey='';try{if(ESC_activo())ESC_preparar(ESC_def());}catch(e){console.warn('escenario: preparar',e);}});
function ESC_ver(id,on){ESC.oculto[id]=!on;}
function ESC_medir(){return{fondo:+ESC.ms.fondo.toFixed(3),mundo:+ESC.ms.mundo.toFixed(3)};}

// ================== piezas Hondo compartidas ==================
// Óxido · Piezas Hondo que comparten todos los escenarios (del Ilustrador de escenarios). Prefijo ESC_H.
// · ESC_H.caja(c, d): caja de madera y COFRE BLINDADO (c.armored) en estilo Hondo, con tinta y sombra de contacto.
// · ESC_H.etiqueta(g, x, y): la etiqueta $ de EL TASADOR (cartón claro, hilo de 1 px, signo oscuro) dentro de un lienzo.
// · ESC_H.tasador(c2, x, y, col): silueta chica de EL TASADOR (saco largo con etiquetas) para el fondo.
// · ESC_H.chapa(d, texto, w): chapa pintada a mano con un cartel de la banda ("COMPRO ORO"), con su etiqueta $.
const ESC_H=(()=>{
const P=ESC_px,TINTA='#17141f';
const MAD={c:'#7a443c',hi:'#e8a060',dk:'#603c4a'};
const ACERO={c:'#4a5268',hi:'#7a8498',dk:'#2e3446',rem:'#9aa4b0',oro:'#c9a43a'};
// etiqueta $ (9 de alto): hilo de 1 px claro, cartón #e8d8b0 con borde de tinta y el $ de 3×5 con la barra que sobresale
function etiqueta(g,x,y){P.R(g,x+3,y,1,3,'#d8c8a0');P.R(g,x,y+3,7,11,TINTA);P.R(g,x+1,y+4,5,9,'#e8d8b0');
  for(const[a,b]of[[1,0],[0,1],[1,1],[2,1],[0,2],[0,3],[1,3],[2,3],[2,4],[0,5],[1,5],[2,5],[1,6]])P.R(g,x+2+a,y+5+b,1,1,TINTA);}
function caja(c,d){
  const x=Math.round(c.x),y=Math.round(c.y);
  if(c.armored)return cofre(c,d,x,y);
  if(c.y+14>=GROUND-1)ESC_sombraContacto(d,x+7,14,GROUND,0.6);
  if(c.flash>0){ctx.fillStyle=TINTA;ctx.fillRect(x-1,y-1,16,16);ctx.fillStyle='#fff';ctx.fillRect(x,y,14,14);return true;}
  ctx.drawImage(ESC_sprite(d,'H-caja',16,16,(g)=>{P.R(g,0,0,16,16,TINTA);P.R(g,1,1,14,14,MAD.c);P.R(g,1,1,14,1,MAD.hi);P.R(g,1,13,14,2,MAD.dk);
    P.line(g,2,2,13,13,MAD.dk);P.line(g,13,2,2,13,MAD.dk);P.R(g,1,1,1,14,MAD.dk);P.R(g,14,1,1,14,MAD.dk);}),x-1,y-1);
  return true;
}
// cofre blindado (16×16): chapa remachada con candado; se abolla a medida que le pegás; el aviso de siempre arriba
function cofre(c,d,x,y){
  if(c.y+16>=GROUND-1)ESC_sombraContacto(d,x+8,16,GROUND,0.6);
  if(c.flash>0){ctx.fillStyle=TINTA;ctx.fillRect(x-1,y-1,18,18);ctx.fillStyle='#fff';ctx.fillRect(x,y,16,16);return true;}
  ctx.drawImage(ESC_sprite(d,'H-cofre',18,18,(g)=>{const o=1;P.R(g,0,0,18,18,TINTA);P.R(g,o,o,16,16,ACERO.c);P.R(g,o,o,16,2,ACERO.hi);
    P.R(g,o,o+7,16,2,ACERO.dk);P.R(g,o,o+14,16,2,ACERO.dk);P.R(g,o+15,o,1,16,ACERO.dk);
    for(const[rx,ry]of[[1,3],[14,3],[1,11],[14,11]])P.R(g,o+rx,o+ry,1,1,ACERO.rem);
    P.R(g,o+5,o+4,6,7,TINTA);P.R(g,o+6,o+5,4,5,ACERO.oro);P.R(g,o+6,o+5,4,1,'#e8c870');P.R(g,o+7,o+7,2,2,TINTA);P.R(g,o+6,o+2,4,1,TINTA);P.R(g,o+6,o+3,1,2,TINTA);P.R(g,o+9,o+3,1,2,TINTA);}),x-1,y-1);
  const dmg=1-c.hp/c.max;ctx.fillStyle=TINTA;
  if(dmg>0.3)ctx.fillRect(x+3,y+3,1,3);if(dmg>0.55){ctx.fillRect(x+11,y+10,3,1);ctx.fillRect(x+12,y+9,1,1);}if(dmg>0.8){ctx.fillRect(x+4,y+11,1,3);ctx.fillRect(x+10,y+2,1,2);}
  if(typeof nearAny==='function'&&nearAny(x+8,120)&&c.hp===c.max&&(T>>4)%3&&typeof txt==='function')txt('¡DISPARALE!',x+8,y-8,4,'#ffe08a','center');
  return true;
}
// silueta de EL TASADOR: flaco, saco largo con etiquetas claras colgando, lupa de joyero (un punto claro)
function tasador(c2,x,y,col){
  x=Math.round(x);y=Math.round(y);c2.fillStyle=col||'#141224';
  c2.fillRect(x+1,y,3,3);c2.fillRect(x,y+3,5,8);c2.fillRect(x-1,y+6,1,5);c2.fillRect(x+5,y+6,1,5);c2.fillRect(x+1,y+11,1,3);c2.fillRect(x+3,y+11,1,3);
  c2.fillStyle='#e8d8b0';c2.fillRect(x,y+8,1,1);c2.fillRect(x+4,y+6,1,1);c2.fillRect(x+2,y+9,1,1);
  c2.fillStyle='#c8e0ff';c2.fillRect(x+3,y+1,1,1);
}
// chapa pintada a mano con un cartel de la banda (texto en letra pixel) y la etiqueta $; lienzo de w × 22 (va arriba de la cabeza)
function chapa(d,texto,w){
  return ESC_sprite(d,'H-chapa-'+texto+w,w,22,(g)=>{
    P.R(g,0,2,w,18,TINTA);P.R(g,1,3,w-2,16,'#5a4a50');for(let i=3;i<w-1;i+=4)P.R(g,i,4,1,14,'#4a3c44');P.R(g,1,3,w-2,1,'#7a6a70');
    for(let i=0;i<4;i++){const h=Math.floor((Math.sin(i*7.3+w)*0.5+0.5)*6);P.R(g,4+i*Math.floor((w-8)/4),12,2,h,'#6a3a30');} // óxido chorreado
    const t=typeof pfLienzo==='function'?pfLienzo(texto,'#e8e0c8'):null;if(t){g.globalAlpha=0.7;g.drawImage(t,4,6);g.globalAlpha=1;} // crema al 70 %: no compite con los personajes; la etiqueta va a la derecha
    etiqueta(g,w-9,0);
  });
}
return{caja,cofre,etiqueta,tasador,chapa,TINTA};
})();
