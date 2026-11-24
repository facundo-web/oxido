'use strict';
// Óxido · Menús con el mouse
// Cada menú, al dibujarse, anota sus partes clickeables con zona(x,y,w,h,{sobre,clic}) en las coordenadas en que dibuja
// (se tiene en cuenta el marco centrado de los menús). Con el mouse: pasar por encima resalta (sobre), y un clic elige
// igual que ENTER (clic). Cursor de mano sobre lo clickeable. Solo responde a un mouse (pointerType 'mouse'): los toques
// de la pantalla los maneja tactil.js, así no se duplican. Las zonas se borran al empezar cada cuadro (renderMain).
// Prefijo RA_.
let RA_zonas=[],RA_sobre=null;
function RA_reset(){RA_zonas=[];}
function zona(x,y,w,h,o){
  const m=ctx.getTransform(),u=m.a||S;          // escala actual (S en el HUD y los menús)
  RA_zonas.push({x:x+m.e/u,y:y+m.f/u,w,h,...o});
}
function RA_pos(e){const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*W,y:(e.clientY-r.top)/r.height*HC};}
function RA_buscar(p){for(let i=RA_zonas.length-1;i>=0;i--){const z=RA_zonas[i];if(p.x>=z.x&&p.x<=z.x+z.w&&p.y>=z.y&&p.y<=z.y+z.h)return z;}return null;}
// dónde está el mouse y si está apretado (para el estado de los botones: pasar por encima y apretar)
const RA_m={x:-99,y:-99,abajo:false};
cv.addEventListener('pointerup',()=>{RA_m.abajo=false;});addEventListener('pointerup',()=>{RA_m.abajo=false;});
cv.addEventListener('pointermove',e=>{
  if(e.pointerType!=='mouse')return;
  const pm=RA_pos(e);if(Math.abs(pm.x-RA_m.x)+Math.abs(pm.y-RA_m.y)>0.5)RA_m.mov=T;RA_m.x=pm.x;RA_m.y=pm.y; // mov: cuándo se movió el mouse (el II de pausa)
  const z=RA_buscar(pm);
  cv.style.cursor=z?'pointer':'';
  if(z&&z!==RA_sobre&&z.sobre){try{z.sobre();}catch(err){}}
  RA_sobre=z;
});
cv.addEventListener('pointerleave',()=>{cv.style.cursor='';RA_sobre=null;RA_m.x=RA_m.y=-99;RA_m.abajo=false;});
cv.addEventListener('pointerdown',e=>{
  if(e.pointerType!=='mouse'||e.button!==0)return;
  const pm=RA_pos(e);RA_m.x=pm.x;RA_m.y=pm.y;RA_m.abajo=true;
  // el clic se busca con un margen de 2 unidades (los bordes de un botón chico también cuentan) y responde al apretar,
  // nunca espera al segundo clic: ni el desbloqueo del sonido (audioInit) ni el foco se lo comen
  const z=RA_buscar(pm)||RA_buscarCerca(pm);if(!z)return;
  e.preventDefault();audioInit();dev1=-1;devAny=-1;
  if(z.sobre){try{z.sobre();}catch(err){}}
  if(z.clic){try{z.clic();}catch(err){}}
});
function RA_buscarCerca(p){const m=2;for(let i=RA_zonas.length-1;i>=0;i--){const z=RA_zonas[i];if(z.clic&&p.x>=z.x-m&&p.x<=z.x+z.w+m&&p.y>=z.y-m&&p.y<=z.y+z.h+m)return z;}return null;}
// ---------- botón inequívoco (prueba con personas: "no parece botón") ----------
// caja con borde y sombra, estado al pasar el mouse y al apretar, y la tecla en chico adentro, a la derecha.
// o: {on (elegido con teclado o joystick), clic, sobre, size (letra, 6 por defecto), col (color de acento)}
function RA_estado(x,y,w,h){const m=ctx.getTransform(),u=m.a||S,X=x+m.e/u,Y=y+m.f/u;
  const s=RA_m.x>=X&&RA_m.x<=X+w&&RA_m.y>=Y&&RA_m.y<=Y+h;return{sobre:s,apretado:s&&RA_m.abajo};}
function botonUI(x,y,w,h,s,tecla,o){
  o=o||{};const st=RA_estado(x,y,w,h),act=!!o.on||st.sobre,ap=st.apretado,dy=ap?1:0,ac=o.col||'#ffe08a',sz=o.size||6;
  ctx.fillStyle='#120c18';ctx.fillRect(x-1,y-1,w+2,h+2);
  ctx.fillStyle=ap?ac:act?'#3d2c45':'#211829';ctx.fillRect(x,y+dy,w,h-dy);
  ctx.fillStyle=act?ac:'#6e5e78';ctx.fillRect(x,y+dy,w,1);ctx.fillRect(x,y+h-1,w,1);ctx.fillRect(x,y+dy,1,h-dy);ctx.fillRect(x+w-1,y+dy,1,h-dy); // borde
  if(!ap){ctx.fillStyle='rgba(255,255,255,0.10)';ctx.fillRect(x+1,y+1,w-2,1);ctx.fillStyle='rgba(0,0,0,0.45)';ctx.fillRect(x+1,y+h-2,w-2,1);} // relieve: se ve apretable
  const col=ap?'#120c18':act?ac:'#f4eee0',kw=tecla?keycapW(tecla)+3:0,ts=TXT_aj(sz);
  const cx=txtW(s,sz)+2*kw+8<=w?x+w/2:x+(w-kw)/2; // centrado en el botón si entra (no se corre al aparecer la tecla)
  txt(s,cx,y+dy+(h-ts)/2,sz,col,'center',false);
  if(tecla)keycap(tecla,x+w-kw-1,y+dy+Math.round((h-7)/2),ac); // la tecla tiene su propio fondo oscuro: siempre en el color de acento
  zona(x,y,w,h,{sobre:o.sobre,clic:o.clic,nombre:o.nombre}); // nombre: para que las pruebas lo encuentren aunque cambie el dibujo ('jugar', 'omitir', 'reintentar')
  return{x,y,w,h};
}
// ancho que necesita un botón para su texto y su tecla
const botonW=(s,tecla,sz)=>Math.ceil(txtW(s,sz||6))+(tecla?keycapW(tecla)+3:0)+12;
// lo más común: "como apretar ENTER" y "como apretar volver"
const RA_enter=()=>{pressed.start=true;};
const RA_volver=()=>{pressed.back=true;};
