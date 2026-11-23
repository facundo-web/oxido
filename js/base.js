'use strict';
// Óxido · Base: lienzo, utilidades, texto, efectos
// ================== base ==================
const W=320,H=180,GROUND=156;
// ganchos genéricos para archivos nuevos (p. ej. gatito.js): listas de funciones que llama juego.js
// ON_START(carry) al final de startLevel · ON_STEP() en cada cuadro · ON_DRAW() en el mundo · ON_HUD() al final del HUD
const ON_START=[],ON_STEP=[],ON_DRAW=[],ON_HUD=[];
// Eventos de juego (para historial, logros y puntaje): emit('kill',{...}); quien escucha hace ON_EVENT.push((tipo,datos)=>{...})
const ON_EVENT=[];
function emit(type,data){for(const f of ON_EVENT){try{f(type,data||{});}catch(e){console.error('evento '+type,e);}}}
const cv=document.getElementById('c');let ctx=cv.getContext('2d');const CTX0=ctx; // ctx apunta al lienzo chico mientras se dibuja el mundo (GN)
// GRILLA NÍTIDA (Hondo, paso C, notas/arte/fichas/codigo.md): el mundo se dibuja en un lienzo chico (1 px del arte = 1 px),
// se agranda sin suavizar a la escala entera más grande que entra y un último paso suave hasta la pantalla; la cámara se corre
// por la fracción de píxel. Halos y luces de escena van después, a resolución de pantalla (GN_luz, GN_aPantalla). ?nitida=0 lo apaga.
const GN={on:!/[?&]nitida=0\b/.test(location.search),suave:/[?&]nitida=suave\b/.test(location.search),luzChica:/[?&]gnluz=0\b/.test(location.search),sinSnap:/[?&]gnsnap=0\b/.test(location.search),tactil:/[?&]nitida=1\b/.test(location.search), /* diagnóstico: luces en el lienzo chico */c:document.createElement('canvas'),big:document.createElement('canvas'),mat:null,luces:[]};
GN.g=GN.c.getContext('2d');GN.bg=GN.big.getContext('2d');
// en el lienzo chico, los rectángulos caen en píxel entero (sin medias líneas: la guía de arte §8). Va en el prototipo
// para que lo usen también los que envuelven fillRect por un rato (arte-luz.js toma CanvasRenderingContext2D.prototype.fillRect).
// ?gnsnap=0 lo apaga (diagnóstico).
{const P2=CanvasRenderingContext2D.prototype,fr0=P2.fillRect,tr0=P2.translate;
  // barato (se llama miles de veces por cuadro): en el lienzo chico las traslaciones van a entero y los rectángulos se
  // redondean en sus coordenadas, sin preguntar la transformación (pedirla en cada fillRect costaba 2–3 ms en el celular)
  P2.translate=function(x,y){if(this===GN.g&&!GN.sinSnap)return tr0.call(this,Math.round(x),Math.round(y));return tr0.call(this,x,y);};
  P2.fillRect=function(x,y,w,h){
    if(this!==GN.g||GN.sinSnap)return fr0.call(this,x,y,w,h);
    let x0=Math.round(x),x1=Math.round(x+w),y0=Math.round(y),y1=Math.round(y+h);
    if(x1===x0){if(!w)return;x1=x0+(w>0?1:-1);}if(y1===y0){if(!h)return;y1=y0+(h>0?1:-1);} // lo que no era de 0 px queda de 1
    return fr0.call(this,x0,y0,x1-x0,y1-y0);};}
// ¿se está dibujando en el lienzo chico?
const GN_chico=()=>GN.on&&ctx===GN.g;
// de lo que se está dibujando a la pantalla: la matriz completa (para halos y luces que se dibujan después)
function GN_aPantalla(m){return GN_chico()&&GN.mat?GN.mat.multiply(m||ctx.getTransform()):(m||ctx.getTransform());}
// una luz suave (degradé, halo) que tiene que verse a resolución de pantalla: en el lienzo chico se anota y se dibuja
// después de agrandar, con la misma posición; fuera de él, se dibuja ya
function GN_luz(fn){if(!GN_chico()||GN.luzChica){fn();return;}GN.luces.push([ctx.getTransform(),fn,ctx.globalCompositeOperation]);} // con el modo de mezcla del que llama ('lighter')
// imagen que cubre todo lo que se ve (cielos pintados a tamaño de pantalla): en el lienzo chico, a su tamaño
function GN_cubre(img){ctx.save();ctx.setTransform(1,0,0,1,0,0);if(GN_chico())ctx.drawImage(img,0,0,ctx.canvas.width,ctx.canvas.height);else ctx.drawImage(img,0,0);ctx.restore();}
let S=4,SQ=4; // SQ: escala para redondear a píxel (con zoom, S×ZOOM mientras se dibuja el mundo)
// HC: alto del lienzo en unidades del juego. Es H (16:9), salvo en pantallas más altas (Mac 16:10) con TAMAÑO GRANDE:
// ahí el lienzo llena el alto (altoMax en camara.js) y se ve un poco más del mundo, sin barras negras.
let HC=H;
function fit(){
  const hmax=typeof altoMax==='function'?altoMax():H,alto=innerHeight*W>innerWidth*H;
  const k=hmax>H&&alto?innerWidth/W:Math.min(innerWidth/W,innerHeight/H);
  const cw=Math.floor(W*k),ch=hmax>H&&alto?Math.min(Math.floor(innerHeight),Math.floor(hmax*k)):Math.floor(H*k);
  cv.style.width=cw+'px';cv.style.height=ch+'px';
  const dpr=Math.min(2,window.devicePixelRatio||1);
  cv.width=Math.round(cw*dpr);cv.height=Math.round(ch*dpr);S=cv.width/W;SQ=S;
  HC=ch>Math.floor(H*k)?ch*W/cw:H;
  if(typeof setZoom==='function'){setZoom(ZOOM);camY=clamp(camY,typeof camYMin==='function'?camYMin():0,typeof camYMax==='function'?camYMax():H-VH);}
}
// pinta todo el lienzo con el color actual, sin importar la escala (oscurecer en la pausa, destellos)
function cubrir(){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.fillRect(0,0,cv.width,cv.height);ctx.restore();}
addEventListener('resize',fit);fit();

function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
const rand=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const hash=n=>{n=(n<<13)^n;return((n*(n*n*15731+789221)+1376312589)&0x7fffffff)/0x7fffffff;};
const q=v=>Math.round(v*SQ)/SQ;
const angDiff=(a,b)=>((a-b+Math.PI*3)%(Math.PI*2))-Math.PI;
function circle(x,y,r){ctx.beginPath();ctx.arc(x,y,Math.max(0,r),0,Math.PI*2);ctx.fill();}
function overlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
function overlapPt(e,x,y,r){return x+r>e.x&&x-r<e.x+e.w&&y+r>e.y&&y-r<e.y+e.h;}
// TEXTO GRANDE (accesible.js): txt() y txtW() agrandan el tamaño con TXT_ajuste; txtWRaw mide sin agrandar
const TXT_aj=s=>typeof TXT_ajuste==='function'?TXT_ajuste(s):s;
function txt(s,x,y,size,col,align='left',stroke=true){
  if(typeof HUD_pxModo!=='undefined'&&HUD_pxModo&&pxOk(s)){HUD_pxModo=false;try{HUD_pxTxt(s,x,y,col,align);}finally{HUD_pxModo=true;}return;} // panel de la CHATARRA en pixel (hud.js)
  size=TXT_aj(size);
  if(TXT_ICO.test(s)){txtSeg(s,x,y,size,col,align,stroke);return;}
  ctx.font=`bold ${size}px ui-monospace,Menlo,Consolas,monospace`;
  ctx.textAlign=align;ctx.textBaseline='top';
  if(stroke){ctx.lineJoin='round';ctx.lineWidth=Math.max(1.2,size/4.5);ctx.strokeStyle='#120c18';ctx.strokeText(s,x,y);}
  ctx.fillStyle=col;ctx.fillText(s,x,y);
}
// Símbolos de PlayStation (✕ ○ □ △): se dibujan como íconos, no con la fuente,
// así se ven igual de grandes y nítidos en Chrome, Safari y Windows. txtW() mide un texto con íconos.
const TXT_ICO=/[✕○□△]/,TXT_SPLIT=/([✕○□△])/;
// alto de las mayúsculas para un tamaño (centra el ícono con las letras)
function txtCap(size){const m=ctx.measureText('H');return{top:-m.actualBoundingBoxAscent,bot:m.actualBoundingBoxDescent};}
const txtIcoW=size=>size*0.86;
function txtW(s,size){return txtWRaw(s,TXT_aj(size));}
function txtWRaw(s,size){
  ctx.font=`bold ${size}px ui-monospace,Menlo,Consolas,monospace`;
  if(!TXT_ICO.test(s))return ctx.measureText(s).width;
  let w=0;for(const p of s.split(TXT_SPLIT))if(p)w+=TXT_ICO.test(p)?txtIcoW(size):ctx.measureText(p).width;return w;
}
function txtIco(ch,x,y,size,col,stroke){
  const c=txtCap(size),top=y+c.top,bot=y+c.bot,hh=bot-top,cy=(top+bot)/2,cx=x+txtIcoW(size)/2;
  const lw=Math.max(0.45,size*0.14),r=hh*0.5-lw*0.2;
  const path=()=>{ctx.beginPath();
    if(ch==='✕'){const d=r*0.9;ctx.moveTo(cx-d,cy-d);ctx.lineTo(cx+d,cy+d);ctx.moveTo(cx+d,cy-d);ctx.lineTo(cx-d,cy+d);}
    else if(ch==='○')ctx.arc(cx,cy,r*0.95,0,Math.PI*2);
    else if(ch==='□'){const d=r*0.85;ctx.rect(cx-d,cy-d,d*2,d*2);}
    else{const d=r*1.05;ctx.moveTo(cx,cy-d);ctx.lineTo(cx+d*1.1,cy+d*0.85);ctx.lineTo(cx-d*1.1,cy+d*0.85);ctx.closePath();}};
  ctx.lineCap='butt';ctx.lineJoin='miter';ctx.miterLimit=3;
  if(stroke){path();ctx.strokeStyle='#120c18';ctx.lineWidth=lw+Math.max(1.2,size/4.5);ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke();ctx.lineCap='butt';ctx.lineJoin='miter';}
  path();ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.stroke();
}
// texto con íconos: se dibuja por pedazos, de izquierda a derecha
function txtSeg(s,x,y,size,col,align,stroke){
  const w=txtWRaw(s,size);let cx=align==='center'?x-w/2:align==='right'?x-w:x;
  ctx.textAlign='left';ctx.textBaseline='top';
  for(const p of s.split(TXT_SPLIT)){if(!p)continue;
    if(TXT_ICO.test(p)){txtIco(p,cx,y,size,col,stroke);cx+=txtIcoW(size);continue;}
    ctx.font=`bold ${size}px ui-monospace,Menlo,Consolas,monospace`;
    if(stroke){ctx.lineJoin='round';ctx.lineWidth=Math.max(1.2,size/4.5);ctx.strokeStyle='#120c18';ctx.strokeText(p,cx,y);}
    ctx.fillStyle=col;ctx.fillText(p,cx,y);cx+=ctx.measureText(p).width;}
}
const store={get(k){try{return localStorage.getItem(k);}catch(e){return null;}},set(k,v){try{localStorage.setItem(k,v);}catch(e){}}};
const onScreen=(e,m)=>e.x+e.w>camX-m&&e.x<camX+VW+m;
function hurtbox(p=P){if(p.ride){const m=p.ride;return{x:m.x,y:m.y,w:m.w,h:m.h};}
  return p.crouch?{x:p.x,y:p.y+4,w:8,h:14}:{x:p.x,y:p.y,w:8,h:18};}
const hittable=e=>!e.gone&&(!isBoss(e)||e.state==='fight');
// ================== efectos ==================
// jugo: pausa de impacto (hitStop: juego.js no avanza step() mientras sea >0), empujón de cámara (kickX/kickY,
// se suma al temblor en render) y marcas de explosión en el suelo
let hitStop=0,stopT=-99,kickX=0,kickY=0;
const scorches=[];
function freeze(n){if(T-stopT<24||(typeof MOV_reducido==='function'&&MOV_reducido()))return; // movimiento reducido: sin cuadro congelado
  hitStop=Math.max(hitStop,n);stopT=T;}
function kick(dx,dy){kickX=clamp(kickX+dx,-3,3);kickY=clamp(kickY+dy,-3,3);}
// temblor según la distancia al jugador más cercano: fuerte al lado, suave lejos
function shakeAt(x,y,amt){
  let d=1e9;for(const p of players)if(!p.dead)d=Math.min(d,Math.hypot(p.x+4-x,p.y+9-y));
  if(d===1e9)d=Math.abs(x-(camX+VW/2));
  shake=Math.max(shake,amt*clamp(1.2-d/230,0.35,1));
}
ON_STEP.push(()=>{kickX*=0.55;kickY*=0.55;if(Math.abs(kickX)<0.15)kickX=0;if(Math.abs(kickY)<0.15)kickY=0;
  for(let i=scorches.length;i--;)if(--scorches[i].life<=0)scorches.splice(i,1);});
ON_DRAW.push(()=>{for(const s of scorches){if(s.x+s.w<camX||s.x-s.w>camX+VW)continue;const a=Math.min(1,s.life/80);
  ctx.fillStyle=`rgba(18,10,14,${0.5*a})`;ctx.fillRect(q(s.x-s.w/2),GROUND,Math.round(s.w),1);ctx.fillRect(q(s.x-s.w/3),GROUND+1,Math.round(s.w*2/3),1);
  if(s.life>s.max-50&&(T>>2)%2){ctx.fillStyle='#ff8a2a';ctx.fillRect(q(s.x-s.w/4),GROUND,1,1);ctx.fillRect(q(s.x+s.w/5),GROUND,1,1);}}});
ON_START.push(()=>{scorches.length=0;hitStop=0;stopT=-99;kickX=0;kickY=0;});
function explodeFx(x,y,r){
  (r>=24?SFX.bigboom:SFX.boom)();shakeAt(x,y,r/5);
  if(r>=26)freeze(r>=34?4:2);
  parts.push({k:'ring',x,y,r:2,max:r,life:14,maxl:14});
  for(let i=0;i<8+r/2.4;i++){const a=rand(0,6.28),s=rand(0.3,1)*r/10;parts.push({k:'fire',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-0.5,life:rand(14,28),maxl:28,size:rand(2,4+r/8)});}
  // humo que sube, se abre y se va apagando
  for(let i=0;i<4+r/5;i++)parts.push({k:'smoke',rise:1,x:x+rand(-r/3,r/3),y:y+rand(-r/3,r/4),vx:rand(-0.3,0.3),vy:rand(-0.5,-0.15),life:rand(36,64),maxl:64,size:rand(3,5.5)});
  // escombros que rebotan
  if(r>=10)for(let i=0;i<2+r/7;i++)parts.push({k:'p',x:x+rand(-2,2),y,vx:rand(-1.6,1.6)*r/14,vy:rand(-3.4,-1.4),g:0.17,life:rand(36,60),maxl:60,size:i%3?1:2,col:i%2?'#2a2a30':'#5a4a3c'});
  parts.push({k:'flash',x,y,life:3,maxl:2,size:Math.min(10,r*0.32)}); // destello blanco de 1–2 cuadros, encima del humo
  if(y>GROUND-26&&r>=10){if(scorches.length>=10)scorches.shift();scorches.push({x,w:r*0.9,life:300,max:300});}
}
function dust(x,y,n=4){for(let i=0;i<n;i++)parts.push({k:'smoke',col:'200,160,120',x:x+rand(-3,3),y:y-1,vx:rand(-0.5,0.5),vy:rand(-0.3,-0.05),life:rand(14,22),maxl:22,size:rand(1,2)});}
// chispas; con dir (signo de la bala) saltan hacia atrás, contra el disparo
function spark(x,y,col='#ffe9a0',dir){
  if(dir){parts.push({k:'p',x:x-0.5,y:y-0.5,vx:0,vy:0,g:0,life:2,maxl:2,size:2,col:'#fff'});
    for(let i=0;i<3;i++)parts.push({k:'p',x,y,vx:-dir*rand(0.5,2)+rand(-0.3,0.3),vy:rand(-1.6,0.4),g:0.12,life:rand(7,13),maxl:13,size:1,col});return;}
  for(let i=0;i<3;i++)parts.push({k:'p',x,y,vx:rand(-1.5,1.5),vy:rand(-1.5,0.5),g:0.1,life:rand(8,14),maxl:14,size:1,col});
}
// fl (opcional): {vx,vy,vr} para que el cuerpo salga despedido según el golpe (más lejos con explosión)
function corpse(set,x,y,face,fl){
  parts.push({k:'spr',img:set.jump[face>0?0:1],x:x-3,y,vx:fl?fl.vx:-face*1.2,vy:fl?fl.vy:-2.6,g:0.2,rot:0,vr:fl?fl.vr:-face*0.12,life:fl&&fl.vy<-3?70:55,maxl:55});
  for(let i=0;i<6;i++)parts.push({k:'p',x:x+4,y:y+8,vx:rand(-1.5,1.5)+(fl?fl.vx*0.4:0),vy:rand(-2.5,-0.5),g:0.15,life:rand(20,35),maxl:35,size:1.5,col:'#7a6a55'});
}
