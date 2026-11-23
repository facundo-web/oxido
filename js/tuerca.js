'use strict';
// Óxido · TUERCA, el personaje nuevo (el boceto 1 de Arte, elegido por Facu: arte-personaje.js). Prefijo TU_.
// Se suma al final de CHARS (personajes.js) y se destraba con 6 ENGRANAJES DORADOS (arpon.js: ENG_total()).
// Hasta entonces su tarjeta se ve oscura, con candado y cuántos engranajes faltan, y no se puede empezar con él.
// Sus rasgos (lo que dice su tarjeta, "Atrae tuercas · granadas imán"):
//   · ATRAE TUERCAS: las chapitas de puntos van hacia él enseguida y desde más lejos, y los premios sueltos que tiene
//     cerca (a menos de TU_IMAN) se le acercan solos.
//   · GRANADAS IMÁN: sus granadas se tuercen un poco hacia el enemigo más cercano (hasta TU_GRAN de distancia).
const TU_IDX=CHARS.findIndex(c=>c.iman),TU_IMAN=60,TU_GRAN=70;
const TU_libre=()=>TU_IDX<0||(typeof ENG_total==='function'&&ENG_total()>=6);
const TU_bloqueado=i=>i===TU_IDX&&!TU_libre();
// ---------- rasgos ----------
ON_STEP.push(()=>{
  if(TU_IDX<0||state!=='play')return;
  for(const p of players){if(p.dead||p.ci!==TU_IDX)continue;const c=pCenter(p);
    for(const k of RC_chapas)if(k.fase===1&&Math.hypot(k.x-c.x,k.y-c.y)<110)k.fase=2;
    for(const k of pickups){if(k.gone)continue;const dx=c.x-(k.x+5),dy=c.y-(k.y+5),d=Math.hypot(dx,dy);
      if(d<TU_IMAN&&d>4){k.x+=dx/d*1.3;if(k.vy===0&&dy<-2)k.y+=Math.max(dy/d*1.3,-1.3);
        if(T%6===0)parts.push({k:'p',x:k.x+5,y:k.y+5,vx:dx/d*0.6,vy:dy/d*0.6,g:0,life:10,maxl:10,size:1,col:'#6ff0ff'});}}
    for(const g of grens){if(g.own!==p.slot||g.draw)continue;let best=null,bd=TU_GRAN;
      for(const e of enemies){if(!hittable(e))continue;const d=Math.hypot(e.x+e.w/2-g.x,e.y+e.h/2-g.y);if(d<bd){bd=d;best=e;}}
      if(best){g.vx+=clamp((best.x+best.w/2-g.x)*0.012,-0.14,0.14);if(T%4===0)parts.push({k:'p',x:g.x,y:g.y,vx:0,vy:0,g:0,life:8,maxl:8,size:1,col:'#6ff0ff'});}}}
});
// ---------- elección de personaje: candado hasta 6 engranajes ----------
let TU_no=0;
{const us0=updSelect;updSelect=function(){
  const quiere=selT>8&&(pressed.start||pressed.shoot||pressed.jump)&&selRow===0;
  if(quiere&&(TU_bloqueado(charIdx)||(p2Pad>=0&&TU_bloqueado(p2Ci)))){TU_no=24;SFX.hit();clearPressed();return;}
  // tampoco desde las otras filas: con TUERCA elegido y bloqueado no se empieza
  if(selT>8&&(pressed.start||pressed.shoot||pressed.jump)&&(TU_bloqueado(charIdx)||(p2Pad>=0&&TU_bloqueado(p2Ci)))){TU_no=24;selRow=0;SFX.hit();clearPressed();return;}
  us0();};}
// silueta oscura de TUERCA sin ctx.filter (Safari no lo aplica y lo mostraba a todo color): el sprite con negro al 85 %
// encima (source-atop) da lo mismo que brightness(0.15). Se arma una vez por sprite.
const TU_SIL=new WeakMap();
function TU_silueta(im){let c=TU_SIL.get(im);if(c)return c;c=document.createElement('canvas');c.width=im.width;c.height=im.height;
  const g=c.getContext('2d');g.drawImage(im,0,0);g.globalCompositeOperation='source-atop';g.fillStyle='rgba(0,0,0,0.85)';g.fillRect(0,0,c.width,c.height);
  TU_SIL.set(im,c);return c;}
{const ds0=drawSelect;drawSelect=function(){ds0();if(TU_libre()||TU_IDX<0||(typeof kb2Tarjeta!=='undefined'&&kb2Tarjeta>0))return; // no encima de la tarjeta de a 2 con un teclado (Pruebas, T4)
  const n=CHARS.length,{cw,gap,x0}=selGeo(n),x=x0+TU_IDX*(cw+gap),y=17,ch=96,sh=TU_no>0?((TU_no>>1)%2?2:-2):0;if(TU_no>0)TU_no--;
  ctx.fillStyle='#120c18';ctx.fillRect(x+1,y+1,cw-2,ch-2);
  {const im=TU_silueta(charSet(TU_IDX,0).idle[0]);ctx.globalAlpha=0.9;ctx.drawImage(im,q(x+cw/2-21),q(y+2+(18-im.height)*3),42,im.height*3);ctx.globalAlpha=1;} // silueta
  drawLock(x+cw/2-3+sh,y+30,TU_no>0?'#ff6b5b':'#8a7f92');
  txt('TUERCA',x+cw/2+sh,y+48,7,'#8a7f92','center');
  const f=6-(typeof ENG_total==='function'?ENG_total():0);
  wrapTxt('Se destraba con 6 engranajes dorados',4,cw-10).slice(0,2).forEach((l,j)=>txt(l,x+cw/2,y+60+j*6,4,'#c8b8a0','center',false));
  txt('te faltan '+f,x+cw/2,y+76,5,'#f3c94a','center',false);
  if(typeof AR_dibGear==='function')AR_dibGear(x+cw/2,y+88,3.4,T/60,'#f3c94a','#b8892a');};}
