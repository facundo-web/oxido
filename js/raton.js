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
cv.addEventListener('pointermove',e=>{
  if(e.pointerType!=='mouse')return;
  const z=RA_buscar(RA_pos(e));
  cv.style.cursor=z?'pointer':'';
  if(z&&z!==RA_sobre&&z.sobre){try{z.sobre();}catch(err){}}
  RA_sobre=z;
});
cv.addEventListener('pointerleave',()=>{cv.style.cursor='';RA_sobre=null;});
cv.addEventListener('pointerdown',e=>{
  if(e.pointerType!=='mouse'||e.button!==0)return;
  const z=RA_buscar(RA_pos(e));if(!z)return;
  e.preventDefault();audioInit();dev1=-1;devAny=-1;
  if(z.sobre){try{z.sobre();}catch(err){}}
  if(z.clic){try{z.clic();}catch(err){}}
});
// lo más común: "como apretar ENTER" y "como apretar volver"
const RA_enter=()=>{pressed.start=true;};
const RA_volver=()=>{pressed.back=true;};
