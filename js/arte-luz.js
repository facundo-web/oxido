'use strict';
// Óxido · Luz sobre personajes (estilo "Hondo", notas/arte/guia.md §3) — va después de sprites.js, personajes.js,
// mundo.js y hud.js (y de escenario-base.js si está), antes de juego.js
// · LUZ_sprite(lienzo, luz): el mismo sprite con borde de luz de 1 px: CÁLIDO del lado de la luz principal de la misión
//   (mezcla 80 %; 90 % en las misiones claras) y FRÍO del otro (50 %; 40 % en la nave). Se calcula UNA vez por sprite,
//   cuadro y luz y se guarda (getImageData solo sobre el sprite chico, nunca sobre la pantalla). Los colores de los
//   jugadores (#ffe08a, #7ad8ff) no se pierden: ahí el borde baja a 40 %.
// · El borde se aplica solo, envolviendo drawRig (jugador, soldados, aliados y prisioneros que usan el esqueleto) y
//   el cuerpo de los vehículos (arte-vehiculos.js, AV_cuerpo).
// · LUZ_sombra(x, ySuelo, ancho, alto): sombra de contacto pixelada (3 filas: ancho−2, ancho+2, ancho−2) del color de
//   sombra de la misión al 60 %. Se achica con la altura y desaparece a 24 px. Va debajo de todo lo que toca el piso
//   (se dibuja después de las plataformas y antes de los personajes).
// · LUZ_halo(x, y, r, color, fuerza): anota un halo (como mucho 24 por cuadro) en coordenadas del dibujo actual. Se
//   dibujan juntos a resolución de pantalla, sumando luz, después del mundo y antes del HUD, con un halo pre-dibujado
//   por color (drawImage), no un degradé nuevo por halo.
// La luz de cada misión: ESC_luzPersonajes() de escenarios ({calida, lado, fria}) o, si no está, la tabla de la guía.
// Prefijo LUZ_.
const LUZ_TABLA={ // guía §4: luz cálida (lado) y luz fría (lado contrario, o abajo/arriba)
  dusk:{calida:'#ffc07a',lado:'izq',fria:'#b8ccff'},port:{calida:'#ffb050',lado:'der',fria:'#8aa0d0'},
  swamp:{calida:'#e0d070',lado:'izq',fria:'#8ab0a0'},desert:{calida:'#fff0c0',lado:'der',fria:'#ffb060',friaDe:'abajo',kc:0.9},
  noche:{calida:'#ffc080',lado:'der',fria:'#7080b0'},datos:{calida:'#ff5ad0',lado:'izq',fria:'#a890ff'},
  nave:{calida:'#ffa040',lado:'izq',fria:'#c0d8ff',kf:0.4},selva:{calida:'#e8f0a0',lado:'der',fria:'#a0c0c0',kc:0.9},
  embrujada:{calida:'#ffc070',lado:'izq',fria:'#c8c0ff'},templo:{calida:'#ff9a40',lado:'der',fria:'#fff0b0',friaDe:'arriba'}};
const LUZ_SOMBRA='#14080f';
const LUZ={on:true,halos:[],cache:new WeakMap()};
function LUZ_luz(){
  try{if(typeof ESC_luzPersonajes==='function'){const l=ESC_luzPersonajes();
    // escenarios da lado -1 (izquierda) / 1 (derecha); null = escenario apagado: entonces, la tabla de la guía
    if(l){const t=LUZ_TABLA[L.theme]||{},lado=l.lado===-1||l.lado==='izq'?'izq':l.lado===1||l.lado==='der'?'der':t.lado;
      return t.calida?{...l,...t,lado}:{...t,...l,lado};}}}catch(e){} // colores: los de la guía de Dirección de Arte; lado: el del escenario
  return (typeof L!=='undefined'&&L&&LUZ_TABLA[L.theme])||LUZ_TABLA.dusk;
}
const LUZ_hex=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16));
const LUZ_JUG=[[0xff,0xe0,0x8a],[0x7a,0xd8,0xff]];
// borde de luz por píxel (como rim() de pintar.js): píxel opaco con el vecino del lado de la luz transparente
// Las 3 reglas de legibilidad (guía §3): 1) contorno de tinta completo (se suma tinta donde un píxel claro toca el fondo:
// manos, armas, cascos) · 2) en lo que pisa, la luz va 1 px POR DENTRO del contorno (la tinta queda afuera) · 3) lo que
// vuela contra el cielo la lleva POR FUERA, sobre el contorno. Mezclas: cálido 93 % del lado de la luz, frío 80 % del
// otro lado y 85 % arriba. op: {fuera:true} (vuela) · {abiertoAbajo / abiertoArriba} (el torso y las piernas del
// esqueleto se dibujan por separado: la unión no lleva tinta ni luz).
const LUZ_TINTA=[23,20,31];
function LUZ_sprite(src,luz,op){
  if(!src||!luz||!src.width)return src;op=op||{};
  let m=LUZ.cache.get(src);if(!m){m=new Map();LUZ.cache.set(src,m);}
  const k=luz.calida+luz.lado+luz.fria+(luz.friaDe||'')+(luz.kc||'')+(luz.kf||'')+(op.fuera?'F':'')+(op.abiertoAbajo?'b':'')+(op.abiertoArriba?'a':'');
  let c=m.get(k);if(c)return c;
  const w=src.width,h=src.height;c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(src,0,0);
  if(!LUZ_procesar(g,w,h,luz,op))return src;
  m.set(k,c);return c;
}
// el núcleo: contorno completo + borde de luz, sobre el contexto de un lienzo chico (nunca la pantalla)
function LUZ_procesar(g,w,h,luz,op){
  op=op||{};
  try{
    const img=g.getImageData(0,0,w,h),d=img.data;
    // alfa con los bordes "abiertos" (la unión torso-piernas cuenta como opaca)
    const al=new Uint8ClampedArray(w*h);for(let i=0;i<al.length;i++)al[i]=d[i*4+3];
    const A=(x,y)=>{if(x<0||x>=w)return 0;if(y<0)return op.abiertoArriba?255:0;if(y>=h)return op.abiertoAbajo?255:0;return al[y*w+x];};
    // 1) contorno completo: todo píxel del personaje que toca el fondo lleva tinta afuera, claro u oscuro (el arma
    //    gris oscuro y las piernas también: gris oscuro contra bruma media no llegaba a 3:1). Solo se saltea si ese
    //    píxel ya es tinta (#17141f o #120c18), para no hacer el contorno doble.
    const yaTinta=i=>(Math.abs(d[i]-23)+Math.abs(d[i+1]-20)+Math.abs(d[i+2]-31)<14)||(Math.abs(d[i]-18)+Math.abs(d[i+1]-12)+Math.abs(d[i+2]-24)<14);const tinta=[]; // solo la tinta misma (#17141f, #120c18)
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(al[y*w+x]>=40)continue;
      for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=w||Y>=h||al[Y*w+X]<200)continue;if(!yaTinta((Y*w+X)*4)){tinta.push(y*w+x);break;}}}
    for(const q of tinta){const i=q*4;d[i]=LUZ_TINTA[0];d[i+1]=LUZ_TINTA[1];d[i+2]=LUZ_TINTA[2];d[i+3]=255;al[q]=255;}
    const src2=new Uint8ClampedArray(d); // colores ya con la tinta nueva
    const dxC=luz.lado==='izq'?-1:1,cal=LUZ_hex(luz.calida),fri=LUZ_hex(luz.fria),kc=luz.kc||0.93,kf=luz.kf||0.8,kt=luz.kf?Math.min(0.85,luz.kf+0.05):0.85;
    const fd=luz.friaDe==='abajo'?[0,1]:luz.friaDe==='arriba'?[0,-1]:[-dxC,0];
    const luces=[{dx:dxC,dy:0,c:cal,k:kc},{dx:fd[0],dy:fd[1],c:fri,k:kf}];if(!luz.friaDe)luces.push({dx:0,dy:-1,c:fri,k:kt}); // y frío arriba
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const q=y*w+x,i=q*4;if(al[q]<200)continue;
      const borde=A(x+1,y)<40||A(x-1,y)<40||A(x,y+1)<40||A(x,y-1)<40;
      for(const Lz of luces){
        const hit=op.fuera?A(x+Lz.dx,y+Lz.dy)<40:(!borde&&A(x+Lz.dx,y+Lz.dy)>=200&&A(x+2*Lz.dx,y+2*Lz.dy)<40);
        if(!hit)continue;let kk=Lz.k;
        for(const j of LUZ_JUG)if(Math.abs(src2[i]-j[0])+Math.abs(src2[i+1]-j[1])+Math.abs(src2[i+2]-j[2])<40){kk=Math.min(kk,0.4);break;} // los colores de los jugadores no se pierden
        d[i]=src2[i]*(1-kk)+Lz.c[0]*kk;d[i+1]=src2[i+1]*(1-kk)+Lz.c[1]*kk;d[i+2]=src2[i+2]*(1-kk)+Lz.c[2]*kk;break;}}
    g.putImageData(img,0,0);
  }catch(e){return false;}
  return true;
}
// el destello blanco del golpe (SPR.w) no lleva borde
const LUZ_sinBorde=set=>typeof SPR!=='undefined'&&set===SPR.w;
// set con borde: un objeto liviano que devuelve los cuadros con borde (drawRig lee set.lo[pierna][lado] y set.up[lado])
// Cada cuadro con borde se arma la primera vez que se lee, no los 56 del set juntos: eso era un tirón de 60–70 ms en el
// celular cada vez que entraba un personaje nuevo (el jugador al arrancar, cada tipo de soldado). Los que faltan se
// adelantan de a poco en cada paso (LUZ_PEND, como mucho ~1,5 ms por paso).
const LUZ_PEND=[];let LUZ_pendI=0;
function LUZ_par(v,luz,op){
  const a=[v[0],v[1]];
  for(let s=0;s<2;s++){const src=v[s];let c=null;const get=()=>c||(c=LUZ_sprite(src,luz,op));
    Object.defineProperty(a,s,{get,enumerable:true,configurable:true});LUZ_PEND.push(get);}
  return a;
}
ON_STEP.push(()=>{
  if(LUZ_pendI>=LUZ_PEND.length){if(LUZ_pendI){LUZ_PEND.length=0;LUZ_pendI=0;}return;}
  const t0=performance.now();while(LUZ_pendI<LUZ_PEND.length&&performance.now()-t0<1.5)LUZ_PEND[LUZ_pendI++]();
});
function LUZ_set(set,luz){
  const o={__luz:true},par=v=>Array.isArray(v)&&v.length===2&&v[0]&&v[0].getContext;
  for(const k in set){const v=set[k];
    if(k==='lo'){o.lo={};const ab={abiertoArriba:true};for(const q in v)o.lo[q]=par(v[q])?LUZ_par(v[q],luz,ab):v[q];}
    else{const ab=k==='up'?{abiertoAbajo:true}:null;o[k]=par(v)?LUZ_par(v,luz,ab):v;}}
  return o;
}
const LUZ_SETS=new WeakMap();
function LUZ_setCon(set){
  if(!set||set.__luz)return set;const luz=LUZ.on&&LUZ_luz();if(!luz||LUZ_sinBorde(set))return set;
  let m=LUZ_SETS.get(set);if(!m){m=new Map();LUZ_SETS.set(set,m);}
  const k=luz.calida+luz.lado+luz.fria;let s=m.get(k);if(!s){s=LUZ_set(set,luz);m.set(k,s);}return s;
}
// ---------- sombra de contacto ----------
// suelo debajo de (x, y): el piso o la plataforma más alta que quede debajo de los pies
function LUZ_suelo(x,y){let g=GROUND;if(typeof platforms!=='undefined')for(const p of platforms)if(x>=p.x&&x<=p.x+p.w&&p.y>=y-1&&p.y<g)g=p.y;return g;}
function LUZ_sombra(x,ySuelo,ancho,alto){
  const k=1-Math.max(0,alto)/24;if(k<=0)return;const w=Math.max(2,Math.round((ancho+2)*(0.5+0.5*k))),x0=Math.round(x-w/2),y0=Math.round(ySuelo)-1;
  ctx.save();ctx.globalAlpha=0.6*k;ctx.fillStyle=(typeof ESC_sombra==='function'&&ESC_sombra())||LUZ_SOMBRA;
  ctx.fillRect(x0+1,y0,w-2,1);ctx.fillRect(x0-1,y0+1,w+2,1);ctx.fillRect(x0+1,y0+2,w-2,1);ctx.restore();
}
function LUZ_sombras(){
  const un=(cx,pie,ancho)=>{const g=LUZ_suelo(cx,pie);LUZ_sombra(cx,g,ancho,g-pie);};
  try{
    if(typeof players!=='undefined')for(const p of players)if(!p.dead&&!p.ride)un(p.x+4,p.y+18,8);
    if(typeof enemies!=='undefined')for(const e of enemies){if(e.gone||e.type==='turret'||!onScreen(e,10))continue;un(e.x+e.w/2,e.y+e.h,Math.min(e.w,40));}
    if(typeof mechs!=='undefined')for(const m of mechs)if(!m.gone&&onScreen(m,10))un(m.x+m.w/2,m.y+m.h,m.w);
    if(typeof allies!=='undefined')for(const a of allies)if(!a.gone)un(a.x+4,a.y+18,8);
    if(typeof prisoners!=='undefined')for(const pr of prisoners)if(!pr.gone&&!pr.freed)un(pr.x+4,pr.y+18,8);
  }catch(e){}
}
// ---------- halos ----------
const LUZ_HALO=new Map();
function LUZ_haloImg(col){let c=LUZ_HALO.get(col);if(c)return c;c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),[r,gg,b]=LUZ_hex(col);
  const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,`rgba(${r},${gg},${b},1)`);gr.addColorStop(0.35,`rgba(${r},${gg},${b},0.45)`);gr.addColorStop(1,`rgba(${r},${gg},${b},0)`);
  g.fillStyle=gr;g.fillRect(0,0,64,64);LUZ_HALO.set(col,c);return c;}
function LUZ_halo(x,y,r,col,fuerza){
  if(LUZ.halos.length>=24)return;let m;try{m=typeof GN_aPantalla==='function'?GN_aPantalla():ctx.getTransform();}catch(e){return;} // grilla nítida: del lienzo chico a la pantalla (base.js)
  const tactil=typeof onTouch==='function'&&onTouch(),f=(fuerza??0.5)*(tactil?0.5:1); // en táctil, a la mitad (guía §9)
  LUZ.halos.push({x:m.a*x+m.c*y+m.e,y:m.b*x+m.d*y+m.f,r:r*Math.hypot(m.a,m.b),col,f,t:performance.now()});
}
function LUZ_halosDibujar(){
  if(!LUZ.halos.length)return;const ahora=performance.now();ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='lighter';
  for(const h of LUZ.halos){if(ahora-h.t>40)continue; // los que quedaron de un cuadro sin HUD (menús) no se dibujan
    ctx.globalAlpha=Math.min(1,h.f);ctx.drawImage(LUZ_haloImg(h.col),h.x-h.r,h.y-h.r,h.r*2,h.r*2);}
  ctx.restore();LUZ.halos.length=0;
}
// ---------- tinta para lo que se dibuja con rectángulos (armas, brazo y granada del granadero, chapa del escudo) ----------
// Dos pasadas: la 1.ª dibuja cada rectángulo agrandado 1 px en tinta (sin el sprite, sin caminos ni trazos), la 2.ª, lo
// normal. Los círculos (circle) pasan a discos de píxeles en las dos.
const LUZ_TINTA_CSS='#17141f';
function LUZ_discoPx(x,y,r){x=Math.round(x);y=Math.round(y);r=Math.max(0,Math.round(r));if(r<=1){ctx.fillRect(x-r,y-r,2*r+1,2*r+1);return;}
  for(let dy=-r;dy<=r;dy++){const w=Math.floor(Math.sqrt(r*r-dy*dy+r*0.6));ctx.fillRect(x-w,y+dy,2*w+1,1);}}
const LUZ_transl=fs=>typeof fs==='string'&&/rgba?\(/.test(fs)&&(()=>{const m=fs.match(/rgba?\(([^)]+)\)/);const v=m&&m[1].split(',');return v&&v.length===4&&parseFloat(v[3])<0.6;})();
function LUZ_conTinta(fn,self,args){
  const circ0=typeof circle==='function'?circle:null;
  const fr=CanvasRenderingContext2D.prototype.fillRect;
  try{ // 1.ª pasada: tinta
    ctx.fillRect=function(x,y,w,h){if(LUZ_transl(this.fillStyle))return;const fs=this.fillStyle;this.fillStyle=LUZ_TINTA_CSS;fr.call(this,x-1,y-1,w+2,h+2);this.fillStyle=fs;};
    ctx.drawImage=function(){};ctx.fill=function(){};ctx.stroke=function(){};
    if(circ0)circle=(x,y,r)=>{const fs=ctx.fillStyle;ctx.fillStyle=LUZ_TINTA_CSS;LUZ_discoPx(x,y,r+1);ctx.fillStyle=fs;};
    fn.apply(self,args);
  }catch(e){}finally{delete ctx.fillRect;delete ctx.drawImage;delete ctx.fill;delete ctx.stroke;}
  try{if(circ0)circle=(x,y,r)=>LUZ_discoPx(x,y,r);return fn.apply(self,args);}finally{if(circ0)circle=circ0;}
}
// ---------- drones y torretas: se dibujan con rectángulos; acá se pasan a sprite (capturado una vez por estado) ----------
// Se redirige el dibujo a un lienzo chico, se le pone contorno y borde de luz (por FUERA en los drones, que vuelan
// contra el cielo; por dentro en las torretas) y se guarda por estado (misión, lado, cuadro de hélice, destello…).
const LUZ_CAP=new Map();
function LUZ_capturar(clave,x0,y0,w,h,fn,op){
  let c=LUZ_CAP.get(clave);if(c)return c;
  const o=document.createElement('canvas');o.width=w;o.height=h;const g=o.getContext('2d',{willReadFrequently:true});g.imageSmoothingEnabled=false;g.setTransform(1,0,0,1,-x0,-y0);
  const sinc=()=>{g.fillStyle=ctx.fillStyle;g.strokeStyle=ctx.strokeStyle;g.globalAlpha=ctx.globalAlpha;g.lineWidth=ctx.lineWidth;g.lineCap=ctx.lineCap;};
  const metodos={fillRect:(...a)=>{sinc();g.fillRect(...a);},beginPath:()=>g.beginPath(),moveTo:(...a)=>g.moveTo(...a),lineTo:(...a)=>g.lineTo(...a),
    closePath:()=>g.closePath(),arc:(...a)=>g.arc(...a),ellipse:(...a)=>g.ellipse(...a),rect:(...a)=>g.rect(...a),fill:()=>{sinc();g.fill();},stroke:()=>{sinc();g.stroke();},
    drawImage:(...a)=>{sinc();g.drawImage(...a);},save:()=>g.save(),restore:()=>g.restore(),translate:(...a)=>g.translate(...a),scale:(...a)=>g.scale(...a),rotate:(...a)=>g.rotate(...a)};
  const circ0=typeof circle==='function'?circle:null;
  try{for(const k in metodos)ctx[k]=metodos[k];if(circ0)circle=(x,y,r)=>{sinc();const R=Math.max(0,Math.round(r));for(let dy=-R;dy<=R;dy++){const ww=Math.floor(Math.sqrt(R*R-dy*dy+R*0.6));g.fillRect(Math.round(x)-ww,Math.round(y)+dy,2*ww+1,1);}};
    fn();}catch(e){}finally{for(const k in metodos)delete ctx[k];if(circ0)circle=circ0;}
  // sin medios píxeles: alfa a todo o nada
  try{const d=g.getImageData(0,0,w,h);for(let i=3;i<d.data.length;i+=4)d.data[i]=d.data[i]>=110?255:0;g.putImageData(d,0,0);}catch(e){}
  const luz=LUZ.on&&LUZ_luz();c=luz?LUZ_sprite(o,luz,op):o;
  if(LUZ_CAP.size>400)LUZ_CAP.clear();LUZ_CAP.set(clave,c);return c;
}
// ---------- jefes: captura en vivo (se mueven todo el tiempo: no se guarda por cuadro) ----------
// Mismo procedimiento que los drones, pero sobre un lienzo que se reusa: dibujo → píxeles enteros → contorno y borde.
const LUZ_VIVO={};
function LUZ_vivo(id,x0,y0,w,h,fn,op){
  w=Math.max(1,Math.ceil(w));h=Math.max(1,Math.ceil(h));
  let o=LUZ_VIVO[id];if(!o||o.width<w||o.height<h){o=document.createElement('canvas');o.width=w;o.height=h;LUZ_VIVO[id]=o;}
  // se lee en cada cuadro: el lienzo va en la memoria, no en la placa de video (willReadFrequently)
  const g=o.getContext('2d',{willReadFrequently:true});g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,o.width,o.height);g.imageSmoothingEnabled=false;g.setTransform(1,0,0,1,-x0,-y0);
  const sinc=()=>{g.fillStyle=ctx.fillStyle;g.strokeStyle=ctx.strokeStyle;g.globalAlpha=ctx.globalAlpha;g.lineWidth=ctx.lineWidth;g.lineCap=ctx.lineCap;g.lineJoin=ctx.lineJoin;};
  const metodos={fillRect:(...a)=>{sinc();g.fillRect(...a);},strokeRect:(...a)=>{sinc();g.strokeRect(...a);},beginPath:()=>g.beginPath(),moveTo:(...a)=>g.moveTo(...a),lineTo:(...a)=>g.lineTo(...a),
    quadraticCurveTo:(...a)=>g.quadraticCurveTo(...a),bezierCurveTo:(...a)=>g.bezierCurveTo(...a),closePath:()=>g.closePath(),
    clip:(...a)=>g.clip(...a), // REY POLVO (M4) y LA PLACA (M6) se recortan al deshacerse: sin esto el recorte caía en el lienzo real y tapaba al resto del cuadro
arc:(...a)=>g.arc(...a),ellipse:(...a)=>g.ellipse(...a),rect:(...a)=>g.rect(...a),
    fill:()=>{sinc();g.fill();},stroke:()=>{sinc();g.stroke();},drawImage:(...a)=>{sinc();g.drawImage(...a);},save:()=>g.save(),restore:()=>g.restore(),
    translate:(...a)=>g.translate(...a),scale:(...a)=>g.scale(...a),rotate:(...a)=>g.rotate(...a)};
  const circ0=typeof circle==='function'?circle:null;
  try{for(const k in metodos)ctx[k]=metodos[k];if(circ0)circle=(x,y,r)=>{sinc();const R=Math.max(0,Math.round(r));for(let dy=-R;dy<=R;dy++){const ww=Math.floor(Math.sqrt(R*R-dy*dy+R*0.6));g.fillRect(Math.round(x)-ww,Math.round(y)+dy,2*ww+1,1);}};
    fn();}catch(e){}finally{for(const k in metodos)delete ctx[k];if(circ0)circle=circ0;}
  g.setTransform(1,0,0,1,0,0);
  // alfa: a todo o nada (por defecto); con op.umbral 'suave' quedan los transparentes de verdad (pantallas, haces de
  // luz, líneas de barrido), sin medios píxeles en los bordes
  op=op||{};
  try{const d=g.getImageData(0,0,w,h),D=d.data;if(op.umbral==='suave'){for(let i=3;i<D.length;i+=4)D[i]=D[i]>=200?255:D[i]<50?0:D[i];}else for(let i=3;i<D.length;i+=4)D[i]=D[i]>=110?255:0;g.putImageData(d,0,0);}catch(e){}
  const luz=!op.sinBorde&&LUZ.on&&LUZ_luz();if(luz)LUZ_procesar(g,w,h,luz,op);
  ctx.drawImage(o,0,0,w,h,x0,y0,w,h);
}
// ---------- ganchos ----------
// el jugador agachado no pasa por drawRig: charSet (personajes.js, lo usa playerSet) devuelve el set con borde
try{if(typeof charSet==='function'){const LUZ_cs0=charSet;charSet=function(){return LUZ_setCon(LUZ_cs0.apply(this,arguments));};}}catch(e){}
// vaivén de los soldados (pieles.js): el torso corrido 1 px deja abiertas las uniones (la cadera de atrás y la base del
// torso adelante, sin tinta). En esos cuadros se arman torso y piernas juntos en un lienzo, ya corridos, y la tinta y el
// borde de luz se calculan sobre ese cuadro entero. Se guarda por set, cuadro de piernas, lado, corrimiento y luz.
const LUZ_COMP=new WeakMap();
function LUZ_rigCompuesto(set,pose,f,x,y){
  const luz=LUZ.on&&LUZ_luz();if(!luz||!set||!set.lo||!set.up)return false;
  const lf=pose.lf??f,lo=set.lo[pose.leg]&&set.lo[pose.leg][lf],up=set.up[f];if(!lo||!up||!lo.getContext||!up.getContext)return false;
  const ux=Math.round(pose.ux||0),uy=Math.round(pose.uy||0),hop=Math.round(pose.hop||0),dy=set.dy||0,ly=18-(set.loH||6)+hop;
  let m=LUZ_COMP.get(set);if(!m){m=new Map();LUZ_COMP.set(set,m);}
  const k=pose.leg+'|'+lf+'|'+f+'|'+ux+'|'+uy+'|'+hop+'|'+luz.calida+luz.lado+luz.fria;let c=m.get(k);
  const x0=Math.min(0,ux)-1,y0=Math.min(ly,dy+uy)-1;
  if(!c){const w=Math.max(lo.width,up.width+Math.abs(ux))+2,h=Math.max(ly+lo.height,dy+uy+up.height)-y0+1;
    c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d',{willReadFrequently:true});
    g.drawImage(lo,-x0,ly-y0);g.drawImage(up,ux-x0,dy+uy-y0);
    LUZ_procesar(g,w,h,luz,{});if(m.size>200)m.clear();m.set(k,c);}
  ctx.drawImage(c,q(x+x0),q(y+y0));return true;
}
if(typeof drawRig==='function'){const LUZ_drawRig0=drawRig;drawRig=function(set,pose,f,x,y){
  if(pose&&pose.vaiven&&!set.__luz&&!LUZ_sinBorde(set)){try{if(LUZ_rigCompuesto(set,pose,f,x,y))return;}catch(e){}}
  return LUZ_drawRig0.call(this,LUZ_setCon(set),pose,f,x,y);};}
// sombras: después de las plataformas (así quedan arriba de ellas) y antes de cajas y personajes
if(typeof drawPlatforms==='function'){const LUZ_plat0=drawPlatforms;drawPlatforms=function(){const r=LUZ_plat0.apply(this,arguments);if(LUZ.on)LUZ_sombras();return r;};}
// halos: después del mundo, antes del HUD (y en los menús, nada)
if(typeof drawHUD==='function'){const LUZ_hud0=drawHUD;drawHUD=function(){try{LUZ_halosDibujar();}catch(e){LUZ.halos.length=0;}return LUZ_hud0.apply(this,arguments);};}

// soldados: tinta alrededor del arma, el brazo, la granada y la chapa del escudo
if(typeof drawSoldier==='function'){const LUZ_ds0=drawSoldier;drawSoldier=function(e){if(!LUZ.on||e.flash)return LUZ_ds0.call(this,e);return LUZ_conTinta(LUZ_ds0,this,[e]);};}
/* robots de chatarra de M1 (guinos.js): su brazo cañón va con rectángulos, como el arma de los soldados */
if(typeof GU_drawEndo==='function'){const LUZ_endo0=GU_drawEndo;GU_drawEndo=function(e){if(!LUZ.on||e.flash)return LUZ_endo0.call(this,e);return LUZ_conTinta(LUZ_endo0,this,[e]);};}
// armas del jugador (se dibujan aparte del sprite, con rectángulos)
if(typeof drawGunShape==='function'){const LUZ_gun0=drawGunShape;drawGunShape=function(){if(!LUZ.on)return LUZ_gun0.apply(this,arguments);return LUZ_conTinta(LUZ_gun0,this,arguments);};}
// drones: sprite capturado con borde de luz por fuera (vuelan contra el cielo)
if(typeof drawDrone==='function'){const LUZ_dr0=drawDrone;drawDrone=function(e){
  if(!LUZ.on||e.wreck||!e||typeof e.x!=='number')return LUZ_dr0.call(this,e);
  const X=Math.round(e.x),Y=Math.round(e.y),near=typeof players!=='undefined'&&players.some(p=>Math.abs(p.x+4-(e.x+8))<20);
  if(typeof players!=='undefined'&&players.length&&typeof nearestPlayer==='function'){const px=nearestPlayer(e.x+8,e.y).x;e.face=px>e.x+8?1:-1;}
  const clave='dr|'+(typeof levelIdx==='number'?levelIdx:0)+'|'+(e.face||0)+'|'+((T>>1)%2)+'|'+((T>>3)%2)+'|'+((T>>2)%2)+'|'+(near?1:0)+'|'+(e.flash>0?1:0);
  const spr=LUZ_capturar(clave,X-8,Y-8,e.w+16,e.h+16,()=>LUZ_dr0.call(this,{...e,x:X,y:Y}),{fuera:true});
  ctx.drawImage(spr,X-8,Y-8);
};}
// torretas: sprite capturado (el caño en 16 ángulos), borde por dentro (están en el piso)
if(typeof drawTurret==='function'){const LUZ_tu0=drawTurret;drawTurret=function(e){
  if(!LUZ.on||!e||typeof e.x!=='number')return LUZ_tu0.call(this,e);
  const X=Math.round(e.x),Y=Math.round(e.y),pasos=16,ang=Math.round((e.ang||0)/(Math.PI*2)*pasos)/pasos*Math.PI*2;
  const clave='tu|'+(typeof levelIdx==='number'?levelIdx:0)+'|'+Math.round(ang*100)+'|'+(e.flash>0?1:0)+'|'+(e.burst>0&&(T>>1)%2?1:0);
  const spr=LUZ_capturar(clave,X-14,Y-14,e.w+28,e.h+22,()=>LUZ_tu0.call(this,{...e,x:X,y:Y,ang}));
  ctx.drawImage(spr,X-14,Y-14);
};}
